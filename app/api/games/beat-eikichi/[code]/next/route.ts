import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { advanceQuestionIfMatches } from '@/lib/beatEikichi/advanceQuestion';

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

    // Pré-check soft : retourne tôt si l'état lu est manifestement avancé.
    // Le gate ATOMIQUE est dans `advanceQuestionIfMatches` — c'est lui qui
    // garantit qu'aucune question ne saute en cas de race. Ce pré-check sert
    // juste à économiser une requête DB dans les cas faciles (push perdu,
    // F5, etc.).
    if (game.phase !== 'playing' || game.currentIndex !== expectedIndex) {
      return Response.json({ ok: true, skipped: 'already advanced' });
    }

    // Anti-triche : le timer doit être raisonnablement écoulé.
    // Tolérance large (5 s) pour absorber décalage d'horloge client/serveur.
    const TIMER_TOLERANCE_MS = 5000;
    const timerMs = game.timerSeconds * 1000;
    if (game.questionStartedAt) {
      const elapsed = Date.now() - new Date(game.questionStartedAt).getTime();
      if (elapsed < timerMs - TIMER_TOLERANCE_MS) {
        return Response.json({ ok: true, skipped: 'timer not elapsed' });
      }
    }

    // Gate atomique : si une autre requête (Eikichi qui trouve, autre client
    // /next, all-found) a avancé pendant qu'on était en train de checker,
    // `advanced` sera `false` et on ne pousse PAS de double-update. C'est le
    // fix racine du bug "passé de la question 8 à 10 sans voir la 9".
    const advanced = await advanceQuestionIfMatches(game.id, expectedIndex);
    if (!advanced) {
      return Response.json({ ok: true, skipped: 'already advanced' });
    }
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
