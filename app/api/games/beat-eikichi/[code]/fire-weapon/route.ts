import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { getWeapon } from '@/lib/beatEikichi/weapons';

const bodySchema = z.object({
  playerToken: z.string().min(1),
  targetPlayerId: z.string().min(1),
});

/**
 * POST /api/games/beat-eikichi/[code]/fire-weapon
 *
 * Le joueur tire son arme (snapshotée sur PlayerState.weaponId) sur un autre joueur ;
 * l'effet s'applique à la PROCHAINE question (pour permettre au bouclier de réagir).
 *
 * Règles :
 *   - Phase doit être "playing"
 *   - Tireur a une arme assignée
 *   - Tireur a weaponUsesLeft > 0
 *   - Cible ≠ self (sauf pour l'arme "shield" qui cible toujours self)
 *   - Cible est dans la room
 *   - Plus de cooldown "1 tir par question" : l'effet est différé, on peut enchaîner
 *     plusieurs tirs dans la même question (limité seulement par weaponUsesLeft).
 *
 * Effet : crée un BeatEikichiWeaponEvent avec questionIndex = currentIndex + 1,
 * décrémente usesLeft, pushRoomUpdate.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerToken, targetPlayerId } = bodySchema.parse(body);

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

    const player = await prisma.player.findUnique({ where: { token: playerToken } });
    if (!player || player.roomId !== room.id) {
      return Response.json({ error: 'Player not in room' }, { status: 403 });
    }

    const state = game.playerStates.find((s) => s.playerId === player.id);
    if (!state) {
      return Response.json({ error: 'Player state not found' }, { status: 404 });
    }
    if (!state.weaponId) {
      return Response.json({ error: 'No weapon assigned' }, { status: 400 });
    }
    const weapon = getWeapon(state.weaponId);
    if (!weapon) {
      return Response.json({ error: 'Invalid weapon' }, { status: 400 });
    }
    if (state.weaponUsesLeft <= 0) {
      return Response.json(
        { error: 'No uses left for this game' },
        { status: 400 },
      );
    }

    // Le bouclier passe désormais par la route /fire-shield dédiée.
    if (player.id === targetPlayerId) {
      return Response.json(
        { error: 'Cannot target yourself' },
        { status: 400 },
      );
    }
    if (!room.players.find((p) => p.id === targetPlayerId)) {
      return Response.json({ error: 'Target not in room' }, { status: 400 });
    }

    // L'effet s'applique à la PROCHAINE question, ce qui laisse le temps à la cible
    // d'activer son bouclier. Aucune arme actuelle ne requiert de données spécifiques.
    await prisma.$transaction([
      prisma.beatEikichiWeaponEvent.create({
        data: {
          gameId: game.id,
          firedByPlayerId: player.id,
          targetPlayerId,
          weaponId: weapon.id,
          questionIndex: game.currentIndex + 1,
        },
      }),
      prisma.beatEikichiPlayerState.update({
        where: { id: state.id },
        data: {
          weaponUsesLeft: { decrement: 1 },
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
    console.error('[BEAT-EIKICHI] fire-weapon error:', error);
    return Response.json({ error: 'Failed to fire weapon' }, { status: 500 });
  }
}
