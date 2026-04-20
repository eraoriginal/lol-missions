import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { WEAPON_IDS } from '@/lib/beatEikichi/weapons';

const bodySchema = z.object({
  playerToken: z.string().min(1),
  weaponId: z.string().nullable(),
});

/**
 * POST /api/games/beat-eikichi/[code]/set-weapon
 *
 * Le joueur (n'importe lequel) choisit/change son arme dans le lobby.
 * Persisté sur Player.beatEikichiWeaponId, broadcast via Pusher.
 * Ignoré si la partie est en cours (gameStarted=true).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerToken, weaponId } = bodySchema.parse(body);

    const room = await prisma.room.findUnique({ where: { code } });
    if (!room) return Response.json({ error: 'Room not found' }, { status: 404 });
    if (room.gameStarted) {
      return Response.json(
        { error: 'Cannot change weapon after game started' },
        { status: 400 },
      );
    }

    const player = await prisma.player.findUnique({
      where: { token: playerToken },
    });
    if (!player || player.roomId !== room.id) {
      return Response.json({ error: 'Player not in room' }, { status: 403 });
    }

    // Valide que l'arme existe dans le catalogue (ou null pour retirer).
    const validated =
      weaponId && WEAPON_IDS.includes(weaponId) ? weaponId : null;

    await prisma.player.update({
      where: { id: player.id },
      data: { beatEikichiWeaponId: validated },
    });

    await pushRoomUpdate(code);
    return Response.json({ ok: true, weaponId: validated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[BEAT-EIKICHI] set-weapon error:', error);
    return Response.json({ error: 'Failed to set weapon' }, { status: 500 });
  }
}
