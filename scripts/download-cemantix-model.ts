/* eslint-disable no-console */
/**
 * Télécharge un modèle d'embeddings français pré-entraîné pour
 * `La Cémantix d'Era`.
 *
 * **Par défaut** : Word2Vec **FrWac** de Fauconnier — modèle utilisé
 * historiquement par le « vrai » Cemantix. Cosines plus serrés (top-1
 * généralement 0.85-0.95 vs ~0.7 pour fastText cc.fr.300). ~1.5 GB binaire.
 *
 * **Alternative — fastText cc.fr.300** : passer
 *   MODEL_URL=https://dl.fbaipublicfiles.com/fasttext/vectors-crawl/cc.fr.300.vec.gz
 * Format texte gzippé, plus moderne mais cosines plus diffus (subword n-grams).
 *
 * Run :
 *   npx tsx scripts/download-cemantix-model.ts
 *
 * Le fichier est mis en cache sous `.cache/cemantix/<filename>` (gitignored).
 * Re-DL forcé via `--force`.
 *
 * Le format est auto-détecté par extension côté `seed-cemantix-vocab.ts` :
 *   .bin    → Word2Vec binaire (header ASCII + vecteurs float32 LE)
 *   .vec.gz → fastText texte gzippé
 *   .vec    → fastText texte brut
 */
import { createWriteStream, existsSync, statSync, mkdirSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';

const DEFAULT_MODEL_URL =
  process.env.MODEL_URL ??
  'https://embeddings.net/embeddings/frWac_no_postag_no_phrase_500_skip_cut100.bin';

const FORCE = process.argv.includes('--force');

async function main() {
  const url = DEFAULT_MODEL_URL;
  const filename = path.basename(new URL(url).pathname);
  const cacheDir = path.join(process.cwd(), '.cache', 'cemantix');
  const dest = path.join(cacheDir, filename);

  if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });

  // Reprise / cache existant.
  let resumeFrom = 0;
  if (existsSync(dest)) {
    if (FORCE) {
      console.log(`[cemantix-dl] --force : suppression de ${dest}`);
    } else {
      const s = statSync(dest);
      resumeFrom = s.size;
      console.log(
        `[cemantix-dl] cache existant (${(resumeFrom / 1e6).toFixed(1)} MB) → on continue.`,
      );
    }
  }

  console.log(`[cemantix-dl] GET ${url}`);
  const headers: Record<string, string> = {
    'User-Agent': 'lol-missions-cemantix/1.0',
  };
  if (resumeFrom > 0) headers['Range'] = `bytes=${resumeFrom}-`;

  const res = await fetch(url, { headers });
  if (!res.ok && res.status !== 206) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  if (!res.body) throw new Error('No response body');

  // Taille totale (info uniquement, certains CDN ne renvoient pas Content-Length).
  const totalLen = Number(res.headers.get('content-length') ?? 0);
  const expectedTotal = resumeFrom + totalLen;
  console.log(
    `[cemantix-dl] taille à télécharger : ${(totalLen / 1e6).toFixed(1)} MB ` +
      `(total : ${(expectedTotal / 1e6).toFixed(1)} MB)`,
  );

  const writeStream = createWriteStream(dest, {
    flags: resumeFrom > 0 ? 'a' : 'w',
  });

  let downloaded = 0;
  let lastLog = Date.now();
  // Wrapper pour afficher la progression.
  const reader = res.body.getReader();
  const progressStream = new ReadableStream({
    async pull(controller) {
      const { value, done } = await reader.read();
      if (done) {
        controller.close();
        return;
      }
      downloaded += value.byteLength;
      const now = Date.now();
      if (now - lastLog > 1500) {
        const pct = totalLen ? ((downloaded / totalLen) * 100).toFixed(1) : '?';
        console.log(
          `[cemantix-dl] ${(downloaded / 1e6).toFixed(1)} MB téléchargés (${pct}%)`,
        );
        lastLog = now;
      }
      controller.enqueue(value);
    },
  });

  await pipeline(
    Readable.fromWeb(progressStream as unknown as Parameters<typeof Readable.fromWeb>[0]),
    writeStream,
  );

  const finalSize = (await stat(dest)).size;
  console.log(
    `[cemantix-dl] OK — fichier final : ${dest} (${(finalSize / 1e6).toFixed(1)} MB)`,
  );
  console.log(
    `[cemantix-dl] Suivante étape : npx tsx scripts/seed-cemantix-vocab.ts`,
  );
}

main().catch((e) => {
  console.error('[cemantix-dl] Fatal:', e);
  process.exit(1);
});
