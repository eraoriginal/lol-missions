import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';
import type { FullQuestion } from '@/lib/quizCeo/types';

const bodySchema = z.object({
  creatorToken: z.string().min(1),
  // "next" (défaut) ou "prev" pour revenir en arrière en review.
  direction: z.enum(['next', 'prev']).default('next'),
  // Index courant côté UI au moment du clic. Si le serveur est déjà ailleurs
  // (push Pusher perdu, double-clic, retry après timeout) : no-op et push pour
  // forcer la resync. Évite de skip une question quand le client retente.
  fromIndex: z.number().int().nonnegative().optional(),
});

/**
 * POST /api/games/quiz-ceo/[code]/review-next
 *
 * Le créateur passe à la question de review suivante (ou précédente).
 * Si on dépasse la dernière question → passe en phase "leaderboard".
 *
 * **Idempotent via `fromIndex`** : si le client envoie son `fromIndex` actuel
 * et qu'il ne correspond plus à `game.currentIndex`, on no-op + push pour
 * forcer le client à se resync. Sans ça, deux clics rapprochés (push perdu,
 * retry après timeout fallback) peuvent skip une question.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { creatorToken, direction, fromIndex } = bodySchema.parse(body);

    const room = await prisma.room.findUnique({
      where: { code },
      include: { quizCeoGame: true },
    });
    if (!room || !room.quizCeoGame) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }
    if (!isCreator(room, creatorToken)) {
      return Response.json(
        { error: 'Only the creator can control review' },
        { status: 403 },
      );
    }
    const game = room.quizCeoGame;
    if (game.phase !== 'review') {
      return Response.json({ error: 'Not in review phase' }, { status: 400 });
    }

    // Garde idempotence : si le client est déjà désync (push perdu, retry),
    // on ne re-avance pas. On push juste pour forcer le refetch.
    if (typeof fromIndex === 'number' && game.currentIndex !== fromIndex) {
      await pushRoomUpdate(code);
      return Response.json({ ok: true, skipped: 'stale-index' });
    }

    const questions = game.questions as unknown as FullQuestion[];
    if (direction === 'prev') {
      const prevIndex = Math.max(0, game.currentIndex - 1);
      await prisma.quizCeoGame.update({
        where: { id: game.id },
        data: { currentIndex: prevIndex },
      });
    } else {
      const nextIndex = game.currentIndex + 1;
      if (nextIndex >= questions.length) {
        // Fin de la review → classement.
        await prisma.quizCeoGame.update({
          where: { id: game.id },
          data: { phase: 'leaderboard' },
        });
      } else {
        await prisma.quizCeoGame.update({
          where: { id: game.id },
          data: { currentIndex: nextIndex },
        });
      }
    }

    await pushRoomUpdate(code);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('[QUIZ-CEO] review-next error:', error);
    return Response.json({ error: 'Failed to advance review' }, { status: 500 });
  }
}
