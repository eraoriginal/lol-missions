import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import type { FullQuestion } from '@/lib/quizCeo/types';

const bodySchema = z.object({
  // Pas de creatorToken : chaque client peut appeler /next à l'expiration
  // de son timer local (idempotent côté serveur via questionStartedAt).
  expectedIndex: z.number().int().min(0).optional(),
});

/**
 * POST /api/games/quiz-ceo/[code]/next
 *
 * Avance la question courante (playing) d'un cran.
 *   - Idempotent : si questionStartedAt n'est pas expiré, no-op.
 *   - Si on était sur la dernière question → passe en phase "waiting_review".
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json().catch(() => ({}));
    const { expectedIndex } = bodySchema.parse(body);

    const room = await prisma.room.findUnique({
      where: { code },
      include: { quizCeoGame: true },
    });
    if (!room || !room.quizCeoGame) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }
    const game = room.quizCeoGame;
    if (game.phase !== 'playing') {
      return Response.json({ ok: true, skipped: 'not-playing' });
    }
    if (expectedIndex !== undefined && expectedIndex !== game.currentIndex) {
      return Response.json({ ok: true, skipped: 'index-mismatch' });
    }

    // Safeguard temps : ne doit être appelé qu'à l'expiration du timer.
    const questions = game.questions as unknown as FullQuestion[];
    const now = Date.now();
    const started = game.questionStartedAt?.getTime() ?? 0;
    const elapsedMs = now - started;
    // Tolérance : 1.5s pour accepter les petits décalages réseau.
    if (started && elapsedMs < game.timerSeconds * 1000 - 1500) {
      return Response.json({ ok: true, skipped: 'too-early' });
    }

    const nextIndex = game.currentIndex + 1;
    if (nextIndex >= questions.length) {
      // Plus de questions → phase d'attente de correction.
      await prisma.quizCeoGame.update({
        where: { id: game.id },
        data: { phase: 'waiting_review', questionStartedAt: null },
      });
    } else {
      await prisma.quizCeoGame.update({
        where: { id: game.id },
        data: { currentIndex: nextIndex, questionStartedAt: new Date() },
      });
    }

    await pushRoomUpdate(code);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[QUIZ-CEO] next error:', error);
    return Response.json({ error: 'Failed to advance' }, { status: 500 });
  }
}
