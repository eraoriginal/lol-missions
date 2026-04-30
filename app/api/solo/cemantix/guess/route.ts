import 'server-only';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getDailyTarget, scoreGuess } from '@/lib/cemantix/server';
import { dailyDateKey } from '@/lib/solo/dailyIndex';

const bodySchema = z.object({
  word: z.string().min(1).max(40),
});

/**
 * POST /api/solo/cemantix/guess
 *
 * Body : `{ word: string }`
 * Réponse :
 *   - `rank: number` — 0 si target, 1..1000 si voisin, 9999 si glacial
 *   - `tier: 1..5` — 1 brûlant → 5 glacial (cf. `rankToTier`)
 *   - `similarity: number | null` — cosine [-1, 1], null si glacial
 *   - `won: boolean` — rank === 0
 *   - `target?: string` — révélé uniquement si `won`
 *   - `sense?: string` — désambiguïsation, révélée uniquement si `won`
 *
 * Lookup O(1) en DB sur `CemantixDailyNeighbor` (rank + similarity
 * pré-calculés par `scripts/build-cemantix-puzzles.ts`). Pas de modèle
 * d'embeddings chargé en RAM Vercel.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word } = bodySchema.parse(body);

    const puzzleDate = dailyDateKey();
    const target = await getDailyTarget(puzzleDate);
    if (!target) {
      // Pas de puzzle pour aujourd'hui : le cron build-cemantix-puzzles a
      // peut-être pas tourné. On renvoie 503 plutôt que 404 pour signaler
      // au client que ce n'est pas un problème de mot.
      return Response.json(
        { error: 'No puzzle for today — admin must run build-cemantix-puzzles' },
        { status: 503 },
      );
    }

    const score = await scoreGuess(word, puzzleDate);
    const won = score.rank === 0;

    return Response.json({
      rank: score.rank,
      tier: score.tier,
      similarity: score.similarity,
      won,
      ...(won ? { target: target.word, sense: target.sense } : {}),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[cemantix/guess] error', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
