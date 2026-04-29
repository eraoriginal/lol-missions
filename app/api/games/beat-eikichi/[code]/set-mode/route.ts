import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';

const bodySchema = z.object({
  creatorToken: z.string().min(1),
  mode: z.enum(['standard', 'all-vs-eikichi']),
});

/**
 * POST /api/games/beat-eikichi/[code]/set-mode
 *
 * Le créateur choisit le mode de jeu :
 *   - "standard" : chaque joueur a 1 arme + 3 boucliers, score individuel.
 *   - "all-vs-eikichi" : le Eikichi joue seul contre tous les autres joueurs
 *     dont les scores se cumulent. Eikichi a accès aux 12 armes (3 stacks
 *     chacune) mais pas de bouclier ; les autres ne peuvent QUE se défendre.
 *
 * Persisté sur la Room, broadcast Pusher.
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
