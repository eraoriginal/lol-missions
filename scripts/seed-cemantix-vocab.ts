/* eslint-disable no-console */
/**
 * Parse le fichier d'embeddings téléchargé par `download-cemantix-model.ts`,
 * filtre les mots français propres, et insère les ~70k premiers en DB
 * (`CemantixWord`).
 *
 * **Formats supportés** (auto-détection par extension) :
 *
 *   .bin       → Word2Vec **binaire** (Fauconnier FrWac, etc.)
 *                Header ASCII : `<vocab_size> <dim>\n`
 *                Pour chaque mot :
 *                  - bytes UTF-8 jusqu'au prochain SPACE (0x20)
 *                  - dim × float32 little-endian (vecteur)
 *                  - newline optionnel
 *
 *   .vec.gz    → fastText texte gzippé.
 *   .vec       → fastText texte brut.
 *                Format texte ligne par ligne : `<word> <f1> <f2> ... <fdim>`
 *
 * Dans les deux cas les mots sont triés par fréquence décroissante (top
 * freq en premier), donc on peut s'arrêter après VOCAB_SIZE entrées
 * validées sans lire le fichier complet.
 *
 * **Filtre clean-FR** :
 *   - Strip accents NFD + lowercase
 *   - Que des lettres a-z (pas de chiffres, ponctuation, langues étrangères)
 *   - Longueur 3-20
 *   - Pas de doublons après normalisation
 *
 * **Variables d'env** :
 *   - `MODEL_FILE` : chemin du fichier (auto-détecté sinon)
 *   - `VOCAB_SIZE` : nombre de mots à insérer (défaut : 70000)
 *
 * Run :
 *   npx tsx scripts/seed-cemantix-vocab.ts
 *
 * Idempotent : truncate `CemantixWord` avant d'insérer.
 */
import { createReadStream, existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { createGunzip } from 'node:zlib';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Trouve automatiquement le modèle DL'd dans `.cache/cemantix/`. */
function autodetectModelFile(): string {
  const cacheDir = path.join(process.cwd(), '.cache', 'cemantix');
  if (!existsSync(cacheDir)) return '';
  const files = readdirSync(cacheDir).filter(
    (f) => f.endsWith('.bin') || f.endsWith('.vec') || f.endsWith('.vec.gz'),
  );
  // Préfère .bin (Word2Vec) sur .vec.gz (fastText).
  files.sort((a, b) => {
    const score = (f: string) =>
      f.endsWith('.bin') ? 0 : f.endsWith('.vec.gz') ? 1 : 2;
    return score(a) - score(b);
  });
  return files[0] ? path.join(cacheDir, files[0]) : '';
}

const MODEL_FILE = process.env.MODEL_FILE ?? autodetectModelFile();
const VOCAB_SIZE = Number.parseInt(process.env.VOCAB_SIZE ?? '70000', 10);

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

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
 * Stream-parse un fichier fastText `.vec[.gz]` (texte).
 * Yield chaque entrée parsée puis s'arrête après VOCAB_SIZE entrées valides.
 */
async function* parseTextModel(filepath: string): AsyncGenerator<ParsedEntry> {
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
      const parts = line.trim().split(/\s+/);
      dim = Number.parseInt(parts[1] ?? '300', 10);
      console.log(
        `[cemantix-vocab] (text) header: vocab=${parts[0]}, dim=${dim} ; on garde top ${VOCAB_SIZE} après filtre.`,
      );
      lineNum++;
      continue;
    }
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

    const floats = line.slice(sep + 1).split(' ');
    if (floats.length !== dim) continue;
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
 * Stream-parse un fichier Word2Vec binaire (format Fauconnier FrWac).
 *
 * Spec :
 *   Header ASCII : `<vocab_size> <dim>\n`
 *   Pour chaque mot :
 *     - bytes UTF-8 jusqu'au SPACE (0x20)
 *     - vector_size * 4 bytes (float32 little-endian)
 *     - newline (0x0A) optionnel — varie selon l'outil de génération
 *
 * Note : le SPACE (0x20) est sûr comme délimiteur car les bytes de
 * continuation UTF-8 sont toujours `10xxxxxx` (ne contiennent jamais 0x20).
 */
async function* parseBinaryModel(filepath: string): AsyncGenerator<ParsedEntry> {
  const stream = createReadStream(filepath);
  let buffer: Buffer = Buffer.alloc(0);
  let headerRead = false;
  let dim = 0;
  let vocabSize = 0;
  let kept = 0;
  const seen = new Set<string>();

  for await (const chunk of stream) {
    buffer = Buffer.concat([buffer, chunk as Buffer]);

    // Header line ASCII jusqu'au '\n'
    if (!headerRead) {
      const newlineIdx = buffer.indexOf(0x0a);
      if (newlineIdx < 0) continue;
      const header = buffer.slice(0, newlineIdx).toString('utf-8');
      const parts = header.trim().split(/\s+/);
      vocabSize = Number.parseInt(parts[0] ?? '0', 10);
      dim = Number.parseInt(parts[1] ?? '0', 10);
      console.log(
        `[cemantix-vocab] (binary) header: vocab=${vocabSize}, dim=${dim} ; on garde top ${VOCAB_SIZE} après filtre.`,
      );
      buffer = buffer.slice(newlineIdx + 1);
      headerRead = true;
    }

    const vecBytes = dim * 4;

    // Boucle : extrait autant de mots que possible avec les bytes dispos.
    while (true) {
      const spaceIdx = buffer.indexOf(0x20);
      if (spaceIdx < 0) break; // pas encore le space
      // Total nécessaire : word + SPACE + vecteur (+ optional newline)
      const need = spaceIdx + 1 + vecBytes;
      if (buffer.length < need) break;

      const rawWord = buffer.slice(0, spaceIdx).toString('utf-8');
      const vecStart = spaceIdx + 1;
      // Parse vecteur via DataView pour LE explicit + force ArrayBuffer pur.
      const vec = new Float32Array(dim);
      for (let i = 0; i < dim; i++) {
        vec[i] = buffer.readFloatLE(vecStart + i * 4);
      }

      let consumed = vecStart + vecBytes;
      // Skip optional trailing newline.
      if (consumed < buffer.length && buffer[consumed] === 0x0a) consumed++;
      buffer = buffer.slice(consumed);

      const norm = normalize(rawWord);
      if (isCleanFrenchWord(norm) && !seen.has(norm)) {
        seen.add(norm);
        yield { word: norm, vec, freqRank: kept };
        kept++;
        if (kept >= VOCAB_SIZE) return;
      }
    }
  }
}

/** Dispatch sur le bon parser selon l'extension. */
function parseModelFile(filepath: string): AsyncGenerator<ParsedEntry> {
  if (filepath.endsWith('.bin')) return parseBinaryModel(filepath);
  return parseTextModel(filepath);
}

/**
 * Sérialise Float32Array en Uint8Array (little-endian, dim*4 bytes).
 * Prisma 6 type strict `Bytes` ↔ `Uint8Array<ArrayBuffer>`.
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
  if (!MODEL_FILE || !existsSync(MODEL_FILE)) {
    console.error(
      `[cemantix-vocab] Fichier introuvable : ${MODEL_FILE || '(aucun)'}.\n` +
        `Lance d'abord : npx tsx scripts/download-cemantix-model.ts`,
    );
    process.exit(1);
  }

  console.log(`[cemantix-vocab] modèle : ${MODEL_FILE}`);

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

  if (batch.length > 0) {
    await prisma.cemantixWord.createMany({ data: batch, skipDuplicates: true });
    totalInserted += batch.length;
  }

  const dur = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[cemantix-vocab] OK — ${totalInserted} mots insérés en ${dur}s.`);
  console.log(
    `[cemantix-vocab] Suivante étape : npx tsx scripts/build-cemantix-puzzles.ts --rebuild --days 30`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('[cemantix-vocab] Fatal:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
