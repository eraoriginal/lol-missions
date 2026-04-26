import 'server-only';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { PUZZLES, scoreGuess } from '@/lib/cemantix/server';
import { pickByDay } from '@/lib/solo/dailyIndex';

const bodySchema = z.object({
  word: z.string().min(1).max(40),
});

/**
 * POST /api/solo/cemantix/guess
 *
 * Body : `{ word: string }`
 * Réponse :
 *   - `rank: number` — 0 si target, sinon 1..9999
 *   - `tier: 1..5` — 1 brûlant → 5 glacial
 *   - `won: boolean` — rank === 0
 *   - `target?: string` — révélé uniquement si `won` (Cemantix n'a pas
 *     de notion de « dernier essai » : illimité)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { word } = bodySchema.parse(body);

    const puzzle = pickByDay(PUZZLES);
    const score = scoreGuess(puzzle, word);
    const won = score.rank === 0;

    return Response.json({
      rank: score.rank,
      tier: score.tier,
      won,
      ...(won ? { target: puzzle.target } : {}),
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
