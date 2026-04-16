import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const bodySchema = z.object({
  playerToken: z.string().min(1),
  text: z.string().max(200),
});

/**
 * POST /api/games/beat-eikichi/[code]/typing
 *
 * Update silencieux du currentTyping du joueur.
 * Appelé en throttle ~1s côté client. Sert de fallback pour afficher la dernière saisie en review
 * quand un joueur n'a pas trouvé la réponse avant le timeout.
 *
 * Pas de Pusher : chaque joueur ne voit que sa propre saisie.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerToken, text } = bodySchema.parse(body);

    const room = await prisma.room.findUnique({
      where: { code },
      include: {
        beatEikichiGame: { include: { playerStates: true } },
      },
    });

    if (!room || !room.beatEikichiGame) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    const player = await prisma.player.findUnique({ where: { token: playerToken } });
    if (!player || player.roomId !== room.id) {
      return Response.json({ error: 'Player not in room' }, { status: 403 });
    }

    const state = room.beatEikichiGame.playerStates.find((s) => s.playerId === player.id);
    if (!state) {
      return Response.json({ error: 'Player state not found' }, { status: 404 });
    }

    await prisma.beatEikichiPlayerState.update({
      where: { id: state.id },
      data: { currentTyping: text },
    });

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[BEAT-EIKICHI] typing error:', error);
    return Response.json({ error: 'Failed to save typing' }, { status: 500 });
  }
}
