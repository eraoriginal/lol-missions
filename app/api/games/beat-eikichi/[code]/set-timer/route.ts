import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';

const bodySchema = z.object({
  creatorToken: z.string().min(1),
  timerSeconds: z.number().int().min(10).max(300),
});

/**
 * POST /api/games/beat-eikichi/[code]/set-timer
 *
 * Le créateur règle la durée (en secondes) d'une question. Doit rester entre 10 et 300.
 * Persisté sur la Room et broadcasté. Ne s'applique qu'aux parties futures — la partie
 * en cours conserve le timer snapshoté à son démarrage.
 */
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
      return Response.json(
        { error: 'Only the creator can change the timer' },
        { status: 403 },
      );
    }

    await prisma.room.update({
      where: { id: room.id },
      data: { beatEikichiTimerSeconds: timerSeconds },
    });
    await pushRoomUpdate(code);

    return Response.json({ ok: true, timerSeconds });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[BEAT-EIKICHI] set-timer error:', error);
    return Response.json({ error: 'Failed to set timer' }, { status: 500 });
  }
}
