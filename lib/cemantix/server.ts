import 'server-only';

/**
 * `La Cémantix d'Era` — backend server-only.
 *
 * Refonte 2026-04-30 : on est passé d'une liste hand-curated (~150 mots / 4
 * tiers) à un vrai système d'embeddings sémantiques pré-calculés.
 *
 * **Architecture** :
 *   - `CemantixWord` (DB) : ~70k mots français avec leurs embeddings 300d.
 *     Utilisé UNIQUEMENT par `scripts/build-cemantix-puzzles.ts`.
 *   - `CemantixDailyTarget` (DB) : la cible du jour (1 par puzzleDate UTC).
 *   - `CemantixDailyNeighbor` (DB) : top 1000 voisins pré-calculés par
 *     puzzle (rank + cosine similarity). Lookup O(1) par `(date, word)`.
 *
 * Au runtime, `scoreGuess` ne fait qu'un `findUnique` sur
 * `CemantixDailyNeighbor` — pas de chargement de modèle, pas de calcul
 * vectoriel côté Vercel.
 *
 * Pipeline de seed (à lancer une fois sur le PC du dev, puis nightly cron) :
 *   1. `npx tsx scripts/download-cemantix-model.ts`
 *   2. `npx tsx scripts/seed-cemantix-vocab.ts`
 *   3. `npx tsx scripts/build-cemantix-puzzles.ts --days 30`
 *
 * Cf. CLAUDE.md « La Cémantix d'Era » pour les détails.
 */

import { prisma } from '@/lib/prisma';
import { dailyDateKey } from '@/lib/solo/dailyIndex';
import type { CemantixTier } from './shared';

/**
 * Normalise un guess pour matcher les mots stockés en DB :
 *   - lowercase
 *   - strip accents (NFD + combining diacriticals)
 *   - trim + retire chars non-alphabétiques
 *
 * Identique au script `seed-cemantix-vocab.ts` : tout mot inséré en DB est
 * passé par le même pipeline.
 */
export function normalizeCemantix(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z]/g, '');
}

/** rank → tier mapping (intégré aux constantes Cemantix officielles). */
export function rankToTier(rank: number): CemantixTier {
  if (rank <= 0) return 1; // target trouvé
  if (rank <= 10) return 1; // brûlant (top 10)
  if (rank <= 50) return 2; // chaud (top 50)
  if (rank <= 200) return 3; // tiède (top 200)
  if (rank <= 1000) return 4; // froid (top 1000)
  return 5; // glacial (hors top 1000 ou inconnu)
}

/**
 * Convertit un rank dans le top 1000 en « température » (0..1) affichée
 * au joueur, dans l'esprit du vrai Cemantix.
 *
 * **Pourquoi rank-based plutôt que cosine-based** : les modèles Word2Vec
 * FR ont des distributions cosines très variables d'un mot à l'autre.
 * Pour certaines cibles (cheval), le top-1 est naturellement à 0.82 ;
 * pour d'autres (manteau, hibou), le top-1 plafonne à 0.5. Cette
 * variabilité crée des UX incohérentes — le joueur a l'impression que
 * « certains jours sont durs et d'autres faciles » alors que c'est juste
 * la statistique du modèle.
 *
 * En dérivant la température directement du rank, on garantit que le
 * top-1 affichera toujours ~0.99, le top-10 ~0.93, le top-100 ~0.85,
 * etc., **indépendamment de la cible**. Le rank reste la métrique
 * objective stockée en DB ; le cosine brut (`CemantixDailyNeighbor.similarity`)
 * est conservé en truth source mais n'est pas exposé au client.
 *
 * **Calibration anchor-based**, ajustée pour matcher les valeurs réelles
 * du Cemantix officiel (cf. exemple maquette `cemantix.jsx`) :
 *   rank 3   → 0.97   (incandescent rust)
 *   rank 7   → 0.95   (incandescent)
 *   rank 24  → 0.92   (brûlant gold)
 *   rank 89  → 0.86   (brûlant)
 *   rank 214 → 0.79   (chaud shimmer)
 *   rank 612 → 0.68   (tiède)
 *   rank 891 → 0.64   (tiède)
 *
 * → ça donne une vraie progression visuelle où le top-25 est rouge/orange,
 * le top-100 gold, le top-500 shimmer, et le top-1000 reste « tiède »
 * (bien plus généreux que ma 1re calibration linéaire qui mettait
 * tout le top-100 en jaune-orange seulement).
 *
 * Interpolation linéaire piecewise entre les anchor points.
 */
const RANK_ANCHORS: ReadonlyArray<readonly [number, number]> = [
  [0, 1.0],
  [1, 0.99],
  [3, 0.97],
  [10, 0.93],
  [25, 0.91],
  [100, 0.85],
  [250, 0.78],
  [500, 0.7],
  [1000, 0.62],
];

function rankToDisplaySim(rank: number): number {
  if (rank <= 0) return 1.0;
  if (rank > 1000) return 0;
  for (let i = 0; i < RANK_ANCHORS.length - 1; i++) {
    const [r1, s1] = RANK_ANCHORS[i];
    const [r2, s2] = RANK_ANCHORS[i + 1];
    if (rank >= r1 && rank <= r2) {
      const t = (rank - r1) / (r2 - r1);
      return s1 + t * (s2 - s1);
    }
  }
  return 0;
}

export interface ScoreResult {
  /** 0 = target trouvée, 1..1000 = rank dans le top voisins, 9999 = inconnu. */
  rank: number;
  /** 1 brûlant → 5 glacial. */
  tier: CemantixTier;
  /** Cosine similarity dans [-1, 1] (utile pour l'UX). */
  similarity: number | null;
}

/** Get the daily target for a given date (defaults to today UTC). */
export async function getDailyTarget(puzzleDate: string = dailyDateKey()): Promise<{
  puzzleDate: string;
  word: string;
  sense: string | null;
} | null> {
  const t = await prisma.cemantixDailyTarget.findUnique({
    where: { puzzleDate },
  });
  return t ? { puzzleDate: t.puzzleDate, word: t.word, sense: t.sense } : null;
}

/**
 * Convertit un buffer Bytes (Uint8Array) en Float32Array pour calcul cosine.
 * Les embeddings sont stockés en little-endian, dim*4 bytes.
 */
function bufferToFloat32(buf: Buffer | Uint8Array): Float32Array {
  // Copie pour garantir l'alignement 4-byte (les Buffers Node peuvent
  // pointer vers des offsets non-alignés dans un pool partagé).
  const u8 = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  const aligned = new Uint8Array(u8.byteLength);
  aligned.set(u8);
  return new Float32Array(aligned.buffer);
}

/** Cosine similarity entre 2 vecteurs (peut être négative). */
function cosineSim(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) return 0;
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

/**
 * Score un guess contre la cible du jour.
 *
 * **Hot path** (mot dans le top 1000 voisins) : lookup O(1) sur
 * `CemantixDailyNeighbor`, similarity dérivée du rank via `rankToDisplaySim`
 * (consistant entre puzzles, feeling Cemantix).
 *
 * **Cold path** (mot hors top 1000) : on calcule la similarity à la volée
 * via embeddings → cosine. Permet d'afficher des températures **négatives**
 * pour les mots sémantiquement opposés (comme dans le vrai Cemantix), au
 * lieu d'un binaire « top-1000 vs glacial inconnu ». Coût : 2 lookups en
 * parallèle (target + guess) + ~0.5 ms de calcul vectoriel sur 500d.
 */
export async function scoreGuess(
  guess: string,
  puzzleDate: string = dailyDateKey(),
): Promise<ScoreResult> {
  const norm = normalizeCemantix(guess);
  if (!norm) return { rank: 9999, tier: 5, similarity: null };

  // Hot path : top 1000 pré-calculé
  const neighbor = await prisma.cemantixDailyNeighbor.findUnique({
    where: { puzzleDate_word: { puzzleDate, word: norm } },
    select: { rank: true },
  });

  if (neighbor) {
    return {
      rank: neighbor.rank,
      tier: rankToTier(neighbor.rank),
      similarity: rankToDisplaySim(neighbor.rank),
    };
  }

  // Cold path : on calcule la cosine à la volée, peut être négatif.
  const target = await prisma.cemantixDailyTarget.findUnique({
    where: { puzzleDate },
    select: { word: true },
  });
  if (!target) return { rank: 9999, tier: 5, similarity: null };

  const [targetWord, guessWord] = await Promise.all([
    prisma.cemantixWord.findUnique({
      where: { word: target.word },
      select: { embedding: true },
    }),
    prisma.cemantixWord.findUnique({
      where: { word: norm },
      select: { embedding: true },
    }),
  ]);

  if (!targetWord || !guessWord) {
    // Mot vraiment inconnu (pas dans le vocab 70k).
    return { rank: 9999, tier: 5, similarity: null };
  }

  const targetVec = bufferToFloat32(targetWord.embedding);
  const guessVec = bufferToFloat32(guessWord.embedding);
  const rawSim = cosineSim(targetVec, guessVec);
  // Clamp à [-1, 1] (par sûreté numérique).
  const sim = Math.max(-1, Math.min(1, rawSim));

  return {
    rank: 9999,
    tier: 5,
    similarity: sim,
  };
}
