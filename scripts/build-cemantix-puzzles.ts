/* eslint-disable no-console */
/**
 * Construit la cible quotidienne de `La Cémantix d'Era` + pré-calcule le top
 * 1000 voisins sémantiques (cosine similarity).
 *
 * **Architecture** (cf. CLAUDE.md « La Cémantix d'Era ») :
 *   - Charge tout le vocabulaire (~70k mots) depuis `CemantixWord` en RAM.
 *   - Pour chaque date demandée :
 *     1. Pioche déterministiquement un mot dans `CEMANTIX_TARGETS` (lib).
 *     2. Vérifie qu'il est bien dans le vocab (sinon skip + warning).
 *     3. Calcule cosine similarity avec les 70k autres mots.
 *     4. Garde le top 1000.
 *     5. Insère `CemantixDailyTarget` + 1000 `CemantixDailyNeighbor`.
 *   - Skip si la date a déjà un target (idempotent).
 *
 * **Usage** :
 *   npx tsx scripts/build-cemantix-puzzles.ts          # aujourd'hui
 *   npx tsx scripts/build-cemantix-puzzles.ts --days 30 # 30 jours à venir
 *   npx tsx scripts/build-cemantix-puzzles.ts --date 2026-05-01
 *   npx tsx scripts/build-cemantix-puzzles.ts --rebuild # force re-calcul
 *
 * Coût : ~5-10s par puzzle (charge initiale + cosine sur 70k × 300d).
 */
import { PrismaClient } from '@prisma/client';
import {
  CEMANTIX_TARGETS,
  normalizeTarget,
  type CemantixTargetCandidate,
} from '../lib/cemantix/targets';
import { dailyDateKey, dailyIndex, seededShuffle } from '../lib/solo/dailyIndex';

const prisma = new PrismaClient();

// CLI args.
const argv = process.argv.slice(2);
const REBUILD = argv.includes('--rebuild');
const DAYS = (() => {
  const i = argv.indexOf('--days');
  if (i < 0) return 1;
  const n = Number.parseInt(argv[i + 1] ?? '1', 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
})();
const SINGLE_DATE = (() => {
  const i = argv.indexOf('--date');
  if (i < 0) return null;
  return argv[i + 1] ?? null;
})();

const TOP_NEIGHBORS = 1000;

interface VocabEntry {
  word: string;
  vec: Float32Array;
}

/** Charge tout le vocab en RAM. */
async function loadVocab(): Promise<{ entries: VocabEntry[]; byWord: Map<string, VocabEntry> }> {
  console.log('[cemantix-build] Chargement du vocab depuis la DB...');
  const start = Date.now();
  const rows = await prisma.cemantixWord.findMany({
    select: { word: true, embedding: true, dim: true },
    orderBy: { freqRank: 'asc' },
  });
  if (rows.length === 0) {
    throw new Error(
      'CemantixWord est vide. Lance d\'abord : npx tsx scripts/seed-cemantix-vocab.ts',
    );
  }
  const entries: VocabEntry[] = rows.map((r) => {
    const buf = r.embedding;
    // Reconstruit Float32Array depuis le Buffer.
    const vec = new Float32Array(
      buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength),
    );
    return { word: r.word, vec };
  });
  const byWord = new Map(entries.map((e) => [e.word, e]));
  const dur = ((Date.now() - start) / 1000).toFixed(1);
  console.log(
    `[cemantix-build] Vocab chargé : ${entries.length} mots × ${entries[0].vec.length}d (${dur}s)`,
  );
  return { entries, byWord };
}

/** Cosine similarity entre 2 Float32Array de même taille. */
function cosine(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

/** Format date pour clé puzzle (YYYY-MM-DD UTC). */
function dateKey(date: Date): string {
  return dailyDateKey(date);
}

/** Pick la cible du jour : seededShuffle(CEMANTIX_TARGETS, dayIdx)[0]. */
function pickTargetForDay(day: number): CemantixTargetCandidate {
  const shuffled = seededShuffle(CEMANTIX_TARGETS, day);
  return shuffled[0];
}

/** Compute top N neighbors for a target word. */
function computeNeighbors(
  target: VocabEntry,
  vocab: VocabEntry[],
  topN: number,
): { word: string; rank: number; similarity: number }[] {
  // On calcule la similarity avec tous les autres mots et on garde les topN
  // plus proches via un simple tri.
  const sims: { word: string; sim: number }[] = [];
  for (const e of vocab) {
    if (e.word === target.word) continue;
    sims.push({ word: e.word, sim: cosine(target.vec, e.vec) });
  }
  sims.sort((a, b) => b.sim - a.sim);
  const top = sims.slice(0, topN);

  return [
    { word: target.word, rank: 0, similarity: 1 }, // la cible elle-même
    ...top.map((t, i) => ({ word: t.word, rank: i + 1, similarity: t.sim })),
  ];
}

/** Build le puzzle pour une date donnée. */
async function buildPuzzle(
  date: Date,
  vocab: VocabEntry[],
  byWord: Map<string, VocabEntry>,
): Promise<void> {
  const puzzleDate = dateKey(date);
  const dayIdx = dailyIndex(date);

  // Skip si déjà construit ?
  const existing = await prisma.cemantixDailyTarget.findUnique({
    where: { puzzleDate },
  });
  if (existing && !REBUILD) {
    console.log(`[cemantix-build] ${puzzleDate} : déjà construit (target="${existing.word}"), skip.`);
    return;
  }
  if (existing && REBUILD) {
    console.log(`[cemantix-build] ${puzzleDate} : --rebuild, suppression de l'existant.`);
    await prisma.cemantixDailyTarget.delete({ where: { puzzleDate } });
  }

  // Pick une cible avec retry si non-trouvée dans le vocab.
  let candidate: CemantixTargetCandidate | null = null;
  let candidateNorm = '';
  for (let attempt = 0; attempt < CEMANTIX_TARGETS.length; attempt++) {
    const c = pickTargetForDay(dayIdx + attempt);
    const norm = normalizeTarget(c.word);
    if (byWord.has(norm)) {
      candidate = c;
      candidateNorm = norm;
      break;
    }
    console.log(
      `[cemantix-build] ${puzzleDate} : "${c.word}" absent du vocab, retry...`,
    );
  }
  if (!candidate) {
    console.error(
      `[cemantix-build] ${puzzleDate} : aucune cible candidate trouvée dans le vocab !`,
    );
    return;
  }

  const targetEntry = byWord.get(candidateNorm)!;
  console.log(
    `[cemantix-build] ${puzzleDate} : cible = "${candidateNorm}"${candidate.sense ? ` (sense: ${candidate.sense})` : ''} ; calcul des ${TOP_NEIGHBORS} voisins...`,
  );
  const start = Date.now();
  const neighbors = computeNeighbors(targetEntry, vocab, TOP_NEIGHBORS);
  const dur = ((Date.now() - start) / 1000).toFixed(1);
  console.log(
    `[cemantix-build] ${puzzleDate} : ${neighbors.length - 1} voisins calculés en ${dur}s ; ` +
      `top 5 : ${neighbors.slice(1, 6).map((n) => `${n.word}(${n.similarity.toFixed(3)})`).join(', ')}`,
  );

  // Insert target + neighbors en transaction.
  await prisma.$transaction(async (tx) => {
    await tx.cemantixDailyTarget.create({
      data: {
        puzzleDate,
        word: candidateNorm,
        sense: candidate.sense ?? null,
      },
    });
    // Insertion en chunks pour éviter une query trop grosse.
    const CHUNK = 500;
    for (let i = 0; i < neighbors.length; i += CHUNK) {
      const slice = neighbors.slice(i, i + CHUNK);
      await tx.cemantixDailyNeighbor.createMany({
        data: slice.map((n) => ({
          puzzleDate,
          word: n.word,
          rank: n.rank,
          similarity: n.similarity,
        })),
      });
    }
  });
  console.log(`[cemantix-build] ${puzzleDate} : OK.`);
}

async function main() {
  const { entries, byWord } = await loadVocab();

  const dates: Date[] = [];
  if (SINGLE_DATE) {
    const d = new Date(`${SINGLE_DATE}T00:00:00Z`);
    if (Number.isNaN(d.getTime())) {
      console.error(`[cemantix-build] Date invalide : ${SINGLE_DATE}`);
      process.exit(1);
    }
    dates.push(d);
  } else {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    for (let i = 0; i < DAYS; i++) {
      const d = new Date(today);
      d.setUTCDate(today.getUTCDate() + i);
      dates.push(d);
    }
  }

  for (const date of dates) {
    await buildPuzzle(date, entries, byWord);
  }

  console.log(`[cemantix-build] Tous les puzzles construits (${dates.length}).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('[cemantix-build] Fatal:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
