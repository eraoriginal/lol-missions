import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';
import { TIMER_MAX, TIMER_MIN } from '@/lib/quizCeo/config';

const bodySchema = z.object({
  creatorToken: z.string().min(1),
  timerSeconds: z.number().int().min(TIMER_MIN).max(TIMER_MAX),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { creatorToken, timerSeconds } = bodySchema.parse(body);

    const room = await prisma.room.findUnique({ where: { code } });
    if (!room) return Response.json({ error: 'Room not found' }, { status: 404 });
    if (!isCreator(room, creatorToken)) {
      return Response.json({ error: 'Only the creator can change settings' }, { status: 403 });
    }

    await prisma.room.update({
      where: { id: room.id },
      data: { quizCeoTimerSeconds: timerSeconds },
    });
    await pushRoomUpdate(code);
    return Response.json({ ok: true, timerSeconds });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('[QUIZ-CEO] set-timer error:', error);
    return Response.json({ error: 'Failed to set timer' }, { status: 500 });
  }
}
