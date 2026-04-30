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
 * Boost UX du cosine brut.
 *
 * fastText `cc.fr.300` (notre modèle par défaut) retourne des cosines plus
 * serrés que le Cemantix officiel : pour un même target, le top-1 plafonne
 * souvent à 0.7-0.78 alors que dans le vrai Cemantix on attend 0.85-0.95.
 * C'est une propriété du training avec subword n-grams (FastText) vs
 * Word2Vec pur (FrWac) — pas un bug.
 *
 * Pour un feeling plus « Cemantix-style », on applique une power curve
 * `x^0.7` qui boost les valeurs hautes plus que les basses, **sans changer
 * l'ordre des rangs** (transformation monotone). Exemples :
 *   0.78 → 0.84  | 0.66 → 0.75  | 0.55 → 0.66  | 0.40 → 0.52  | 0.20 → 0.32
 *
 * Le rank stocké en DB ne bouge pas — seule la valeur affichée au joueur
 * change. Si tu veux la valeur brute, lis `CemantixDailyNeighbor.similarity`
 * directement.
 */
function boostSimilarity(raw: number): number {
  if (raw <= 0) return 0;
  if (raw >= 1) return 1;
  return Math.pow(raw, 0.7);
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
 * Score un guess contre la cible du jour (lookup O(1) en DB).
 *
 * Si le mot n'est pas dans le top 1000 voisins du puzzle, on retourne rank
 * 9999 / tier 5 (glacial). C'est la même UX qu'un mot vraiment inconnu.
 */
export async function scoreGuess(
  guess: string,
  puzzleDate: string = dailyDateKey(),
): Promise<ScoreResult> {
  const norm = normalizeCemantix(guess);
  if (!norm) return { rank: 9999, tier: 5, similarity: null };

  const neighbor = await prisma.cemantixDailyNeighbor.findUnique({
    where: { puzzleDate_word: { puzzleDate, word: norm } },
    select: { rank: true, similarity: true },
  });

  if (!neighbor) {
    return { rank: 9999, tier: 5, similarity: null };
  }

  return {
    rank: neighbor.rank,
    tier: rankToTier(neighbor.rank),
    // On retourne la similarity boostée pour un feeling plus Cemantix-style
    // (top-1 ~0.85-0.92 au lieu de ~0.7). La valeur brute reste en DB.
    similarity: boostSimilarity(neighbor.similarity),
  };
}
