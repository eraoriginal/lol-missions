import 'server-only';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { WIKIERA_ENTRIES, matchesWikiera } from '@/lib/wikiera/server';
import { pickByDay } from '@/lib/solo/dailyIndex';

const bodySchema = z.object({
  guess: z.string().min(1).max(120),
  /**
   * Si true, le client renonce et demande la solution. Le serveur révèle
   * `target` sans valider de guess (utilisé par le bouton « Abandonner »).
   */
  giveUp: z.boolean().optional().default(false),
});

/**
 * POST /api/solo/wikiera/guess
 *
 * Body : `{ guess: string, giveUp?: boolean }`
 * Réponse :
 *   - `correct: boolean`
 *   - `target?: string` — révélé si `correct` OU `giveUp`
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guess, giveUp } = bodySchema.parse(body);

    const entry = pickByDay(WIKIERA_ENTRIES);

    if (giveUp) {
      return Response.json({ correct: false, target: entry.topic });
    }

    const correct = matchesWikiera(guess, entry);
    return Response.json({
      correct,
      ...(correct ? { target: entry.topic } : {}),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[wikiera/guess] error', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
