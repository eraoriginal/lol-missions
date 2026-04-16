import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { QUESTION_TIMER_MS } from '@/lib/beatEikichi/config';
import { advanceQuestion } from '@/lib/beatEikichi/advanceQuestion';

const bodySchema = z.object({
  playerToken: z.string().min(1),
  expectedIndex: z.number().int().min(0),
});

/**
 * POST /api/games/beat-eikichi/[code]/next
 *
 * Idempotent : n'importe quel joueur peut l'appeler au timeout local.
 * Effets uniquement si :
 *   - la phase est "playing"
 *   - currentIndex === expectedIndex
 *   - le timer est bien écoulé (anti-triche / anti-race)
 *
 * Délègue l'avancement au helper partagé `advanceQuestion()`.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerToken, expectedIndex } = bodySchema.parse(body);

    const room = await prisma.room.findUnique({
      where: { code },
      include: { beatEikichiGame: true },
    });

    if (!room || !room.beatEikichiGame) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    const player = await prisma.player.findUnique({ where: { token: playerToken } });
    if (!player || player.roomId !== room.id) {
      return Response.json({ error: 'Player not in room' }, { status: 403 });
    }

    const game = room.beatEikichiGame;

    // No-op idempotent : si on n'est pas en playing, ou si la question a déjà avancé.
    if (game.phase !== 'playing' || game.currentIndex !== expectedIndex) {
      return Response.json({ ok: true, skipped: 'already advanced' });
    }

    // Anti-race : le timer doit être raisonnablement écoulé.
    // On applique une tolérance large (5s) pour absorber :
    //   - le décalage d'horloge client/serveur (peut atteindre plusieurs secondes)
    //   - un éventuel désalignement entre bundle client caché et config serveur
    // Un avancement ~5s trop tôt est un dommage mineur comparé à un jeu bloqué.
    const TIMER_TOLERANCE_MS = 5000;
    if (game.questionStartedAt) {
      const elapsed = Date.now() - new Date(game.questionStartedAt).getTime();
      if (elapsed < QUESTION_TIMER_MS - TIMER_TOLERANCE_MS) {
        return Response.json({ ok: true, skipped: 'timer not elapsed' });
      }
    }

    await advanceQuestion(game.id);
    await pushRoomUpdate(code);

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[BEAT-EIKICHI] next error:', error);
    return Response.json({ error: 'Failed to advance' }, { status: 500 });
  }
}
