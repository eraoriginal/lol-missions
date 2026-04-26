import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';

const bodySchema = z.object({ creatorToken: z.string().min(1) });

/**
 * POST /api/games/quiz-ceo/[code]/back-to-lobby
 *
 * Le créateur ramène la room au lobby. Supprime la QuizCeoGame (cascade sur
 * playerStates). Utilisable à tout moment de la partie, y compris leaderboard.
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
    if (!room) return Response.json({ error: 'Room not found' }, { status: 404 });
    if (!isCreator(room, creatorToken)) {
      return Response.json(
        { error: 'Only the creator can return to lobby' },
        { status: 403 },
      );
    }

    if (room.quizCeoGame) {
      await prisma.quizCeoGame.delete({ where: { roomId: room.id } });
    }
    await prisma.room.update({
      where: { id: room.id },
      data: { gameStarted: false, gameStopped: false },
    });

    await pushRoomUpdate(code);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('[QUIZ-CEO] back-to-lobby error:', error);
    return Response.json({ error: 'Failed to return to lobby' }, { status: 500 });
  }
}
