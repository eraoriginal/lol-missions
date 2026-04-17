import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';

const bodySchema = z.object({
  creatorToken: z.string().min(1),
  enabled: z.boolean(),
});

/**
 * POST /api/games/beat-eikichi/[code]/set-hints-enabled
 *
 * Le créateur active/désactive les indices pour la room. Persisté sur la Room,
 * broadcast via Pusher pour que tous les joueurs voient le choix en temps réel.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { creatorToken, enabled } = bodySchema.parse(body);

    const room = await prisma.room.findUnique({ where: { code } });
    if (!room) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }
    if (!isCreator(room, creatorToken)) {
      return Response.json(
        { error: 'Only the creator can change hints' },
        { status: 403 },
      );
    }

    await prisma.room.update({
      where: { id: room.id },
      data: { beatEikichiHintsEnabled: enabled },
    });

    await pushRoomUpdate(code);
    return Response.json({ ok: true, enabled });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[BEAT-EIKICHI] set-hints-enabled error:', error);
    return Response.json({ error: 'Failed to set hints' }, { status: 500 });
  }
}
