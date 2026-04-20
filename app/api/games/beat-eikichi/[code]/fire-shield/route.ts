import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { SHIELD_WEAPON_ID } from '@/lib/beatEikichi/weapons';

const bodySchema = z.object({
  playerToken: z.string().min(1),
});

/**
 * POST /api/games/beat-eikichi/[code]/fire-shield
 *
 * Le joueur active son bouclier (disponible à tous, indépendamment de l'arme choisie)
 * pour la PROCHAINE question. Tout effet d'arme qui atterrit sur lui à cette question
 * sera annulé.
 *
 * Règles :
 *   - Phase doit être "playing"
 *   - Joueur a `shieldUsesLeft > 0`
 *   - Cible = toujours soi-même (pas de paramètre targetPlayerId)
 *
 * Effet : crée un BeatEikichiWeaponEvent (weaponId='shield', targetPlayerId=self,
 * questionIndex = currentIndex + 1), décrémente shieldUsesLeft, pushRoomUpdate.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerToken } = bodySchema.parse(body);

    const room = await prisma.room.findUnique({
      where: { code },
      include: {
        players: true,
        beatEikichiGame: { include: { playerStates: true } },
      },
    });
    if (!room || !room.beatEikichiGame) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }
    const game = room.beatEikichiGame;
    if (game.phase !== 'playing') {
      return Response.json(
        { error: 'Not in playing phase' },
        { status: 400 },
      );
    }

    const player = await prisma.player.findUnique({
      where: { token: playerToken },
    });
    if (!player || player.roomId !== room.id) {
      return Response.json({ error: 'Player not in room' }, { status: 403 });
    }

    const state = game.playerStates.find((s) => s.playerId === player.id);
    if (!state) {
      return Response.json({ error: 'Player state not found' }, { status: 404 });
    }
    if (state.shieldUsesLeft <= 0) {
      return Response.json(
        { error: 'No shield uses left for this game' },
        { status: 400 },
      );
    }

    await prisma.$transaction([
      prisma.beatEikichiWeaponEvent.create({
        data: {
          gameId: game.id,
          firedByPlayerId: player.id,
          targetPlayerId: player.id,
          weaponId: SHIELD_WEAPON_ID,
          questionIndex: game.currentIndex + 1,
        },
      }),
      prisma.beatEikichiPlayerState.update({
        where: { id: state.id },
        data: {
          shieldUsesLeft: { decrement: 1 },
        },
      }),
    ]);

    await pushRoomUpdate(code);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[BEAT-EIKICHI] fire-shield error:', error);
    return Response.json({ error: 'Failed to fire shield' }, { status: 500 });
  }
}
