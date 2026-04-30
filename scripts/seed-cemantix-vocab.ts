/* eslint-disable no-console */
/**
 * Parse le fichier d'embeddings téléchargé par `download-cemantix-model.ts`,
 * filtre les mots français propres, et insère les ~70k premiers en DB
 * (`CemantixWord`).
 *
 * **Format attendu** : fastText `.vec.gz` (texte gzippé).
 *   Ligne 1 : `<num_words> <dim>`
 *   Lignes suivantes : `<word> <float1> <float2> ... <floatN>`
 *   Les mots sont triés par fréquence décroissante (top freq en premier).
 *
 * **Filtre clean-FR** :
 *   - Strip accents NFD + lowercase
 *   - Que des lettres a-z (pas de chiffres, ponctuation, langues étrangères)
 *   - Longueur 3-20
 *   - Pas de doublons après normalisation
 *
 * **Variables d'env** :
 *   - `MODEL_FILE` : chemin du fichier (défaut : .cache/cemantix/cc.fr.300.vec.gz)
 *   - `VOCAB_SIZE` : nombre de mots à insérer (défaut : 70000)
 *
 * Run :
 *   npx tsx scripts/seed-cemantix-vocab.ts
 *
 * Idempotent : truncate `CemantixWord` avant d'insérer.
 */
import { createReadStream, existsSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { createGunzip } from 'node:zlib';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MODEL_FILE =
  process.env.MODEL_FILE ??
  path.join(process.cwd(), '.cache', 'cemantix', 'cc.fr.300.vec.gz');
const VOCAB_SIZE = Number.parseInt(process.env.VOCAB_SIZE ?? '70000', 10);

/** Strip accents + lowercase (équivalent server.ts mais dupliqué pour ce script). */
function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** Filtre clean-FR : que des lettres a-z, longueur 3-20. */
function isCleanFrenchWord(w: string): boolean {
  if (w.length < 3 || w.length > 20) return false;
  if (!/^[a-z]+$/.test(w)) return false;
  return true;
}

interface ParsedEntry {
  word: string;
  vec: Float32Array;
  freqRank: number;
}

/**
 * Stream-parse le fichier gzippé. Yield chaque entrée parsée au fur et à
 * mesure pour économiser la RAM (un .vec.gz décompressé fait ~7 GB).
 * S'arrête après VOCAB_SIZE entrées validées.
 */
async function* parseModelFile(filepath: string): AsyncGenerator<ParsedEntry> {
  const stream = createReadStream(filepath);
  const isGzip = filepath.endsWith('.gz');
  const decompressed = isGzip ? stream.pipe(createGunzip()) : stream;
  const rl = readline.createInterface({
    input: decompressed,
    crlfDelay: Infinity,
  });

  let lineNum = 0;
  let dim = 0;
  let kept = 0;
  const seen = new Set<string>();

  for await (const line of rl) {
    if (lineNum === 0) {
      // Header : "vocab_size dim"
      const parts = line.trim().split(/\s+/);
      dim = Number.parseInt(parts[1] ?? '300', 10);
      console.log(
        `[cemantix-vocab] header: vocab=${parts[0]}, dim=${dim} ; on garde top ${VOCAB_SIZE} après filtre.`,
      );
      lineNum++;
      continue;
    }

    // Format ligne : "word f1 f2 f3 ... fdim"
    const sep = line.indexOf(' ');
    if (sep < 0) {
      lineNum++;
      continue;
    }
    const rawWord = line.slice(0, sep);
    const norm = normalize(rawWord);
    lineNum++;

    if (!isCleanFrenchWord(norm)) continue;
    if (seen.has(norm)) continue;
    seen.add(norm);

    // Parse les floats. split + map plutôt que regex pour la perf.
    const floats = line.slice(sep + 1).split(' ');
    if (floats.length !== dim) {
      // Quelques lignes corrompues possibles, on skip.
      continue;
    }
    const vec = new Float32Array(dim);
    let valid = true;
    for (let i = 0; i < dim; i++) {
      const v = Number.parseFloat(floats[i]);
      if (!Number.isFinite(v)) {
        valid = false;
        break;
      }
      vec[i] = v;
    }
    if (!valid) continue;

    yield { word: norm, vec, freqRank: kept };
    kept++;
    if (kept >= VOCAB_SIZE) break;
  }
}

/**
 * Sérialise Float32Array en Uint8Array (little-endian, dim*4 bytes).
 * Prisma 6 type strict `Bytes` ↔ `Uint8Array<ArrayBuffer>`. On force le
 * paramètre générique en passant explicitement par un `new ArrayBuffer()`,
 * sinon TypeScript infère `ArrayBufferLike` (cf. évolution lib.dom 2024+).
 */
function vecToBuffer(vec: Float32Array): Uint8Array<ArrayBuffer> {
  const arr = new ArrayBuffer(vec.byteLength);
  const view = new DataView(arr);
  for (let i = 0; i < vec.length; i++) {
    view.setFloat32(i * 4, vec[i], true);
  }
  return new Uint8Array(arr);
}

async function main() {
  if (!existsSync(MODEL_FILE)) {
    console.error(
      `[cemantix-vocab] Fichier introuvable : ${MODEL_FILE}\n` +
        `Lance d'abord : npx tsx scripts/download-cemantix-model.ts`,
    );
    process.exit(1);
  }

  // Wipe la table avant d'insérer.
  console.log('[cemantix-vocab] truncate CemantixWord...');
  await prisma.$executeRaw`TRUNCATE TABLE "CemantixWord" CASCADE;`;

  const start = Date.now();
  const BATCH_SIZE = 1000;
  let batch: {
    word: string;
    embedding: Uint8Array<ArrayBuffer>;
    dim: number;
    freqRank: number;
  }[] = [];
  let totalInserted = 0;
  let lastLog = Date.now();

  for await (const entry of parseModelFile(MODEL_FILE)) {
    batch.push({
      word: entry.word,
      embedding: vecToBuffer(entry.vec),
      dim: entry.vec.length,
      freqRank: entry.freqRank,
    });

    if (batch.length >= BATCH_SIZE) {
      await prisma.cemantixWord.createMany({ data: batch, skipDuplicates: true });
      totalInserted += batch.length;
      batch = [];
      const now = Date.now();
      if (now - lastLog > 2000) {
        const pct = ((totalInserted / VOCAB_SIZE) * 100).toFixed(1);
        const rate = (totalInserted / ((now - start) / 1000)).toFixed(0);
        console.log(
          `[cemantix-vocab] ${totalInserted}/${VOCAB_SIZE} insérés (${pct}%, ${rate} mots/s)`,
        );
        lastLog = now;
      }
    }
  }

  // Flush du dernier batch.
  if (batch.length > 0) {
    await prisma.cemantixWord.createMany({ data: batch, skipDuplicates: true });
    totalInserted += batch.length;
  }

  const dur = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[cemantix-vocab] OK — ${totalInserted} mots insérés en ${dur}s.`);
  console.log(
    `[cemantix-vocab] Suivante étape : npx tsx scripts/build-cemantix-puzzles.ts`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('[cemantix-vocab] Fatal:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
