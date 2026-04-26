import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';

const bodySchema = z.object({
  creatorToken: z.string().min(1),
});

/**
 * POST /api/games/quiz-ceo/[code]/review-start
 *
 * Le créateur lance la correction depuis la phase "waiting_review".
 * Passe en phase "review" et remet currentIndex à 0.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { creatorToken } = bodySchema.parse(body);

    const room = await prisma.room.findUnique({
      where: { code },
      include: { quizCeoGame: true },
    });
    if (!room || !room.quizCeoGame) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }
    if (!isCreator(room, creatorToken)) {
      return Response.json(
        { error: 'Only the creator can start the review' },
        { status: 403 },
      );
    }

    await prisma.quizCeoGame.update({
      where: { id: room.quizCeoGame.id },
      data: { phase: 'review', currentIndex: 0, questionStartedAt: null },
    });

    await pushRoomUpdate(code);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('[QUIZ-CEO] review-start error:', error);
    return Response.json({ error: 'Failed to start review' }, { status: 500 });
  }
}
