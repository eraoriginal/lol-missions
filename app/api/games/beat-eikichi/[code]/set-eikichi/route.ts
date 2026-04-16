import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';

const bodySchema = z.object({
  creatorToken: z.string().min(1),
  eikichiPlayerId: z.string().nullable(),
});

/**
 * POST /api/games/beat-eikichi/[code]/set-eikichi
 *
 * Permet au créateur de désigner (ou dé-désigner) un joueur "Je suis Eikichi"
 * depuis le lobby. Le choix est persisté sur la Room (visible par tous) et broadcasté
 * via Pusher pour que chaque joueur voie la sélection en temps réel.
 *
 * `eikichiPlayerId: null` → retire l'Eikichi (aucun désigné).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { creatorToken, eikichiPlayerId } = bodySchema.parse(body);

    const room = await prisma.room.findUnique({
      where: { code },
      include: { players: true },
    });
    if (!room) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }
    if (!isCreator(room, creatorToken)) {
      return Response.json(
        { error: 'Only the creator can set the Eikichi' },
        { status: 403 },
      );
    }

    // Valide que l'eikichiPlayerId correspond à un joueur de la room (ou est null).
    const validated =
      eikichiPlayerId && room.players.some((p) => p.id === eikichiPlayerId)
        ? eikichiPlayerId
        : null;

    await prisma.room.update({
      where: { id: room.id },
      data: { beatEikichiEikichiId: validated },
    });

    await pushRoomUpdate(code);

    return Response.json({ ok: true, eikichiPlayerId: validated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[BEAT-EIKICHI] set-eikichi error:', error);
    return Response.json({ error: 'Failed to set Eikichi' }, { status: 500 });
  }
}
