import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';

const bodySchema = z.object({
  creatorToken: z.string().min(1),
  mode: z.enum(['standard', 'blur']),
});

/**
 * POST /api/games/beat-eikichi/[code]/set-mode
 *
 * Le créateur choisit le mode de jeu : "standard" ou "blur" (image floutée qui se
 * révèle progressivement pendant le timer). Persisté sur la Room, broadcast.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { creatorToken, mode } = bodySchema.parse(body);

    const room = await prisma.room.findUnique({ where: { code } });
    if (!room) return Response.json({ error: 'Room not found' }, { status: 404 });
    if (!isCreator(room, creatorToken)) {
      return Response.json(
        { error: 'Only the creator can change the mode' },
        { status: 403 },
      );
    }

    await prisma.room.update({
      where: { id: room.id },
      data: { beatEikichiMode: mode },
    });
    await pushRoomUpdate(code);

    return Response.json({ ok: true, mode });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[BEAT-EIKICHI] set-mode error:', error);
    return Response.json({ error: 'Failed to set mode' }, { status: 500 });
  }
}
