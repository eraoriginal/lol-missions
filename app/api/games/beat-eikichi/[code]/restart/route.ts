import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';
import { generateQuestionSet } from '@/lib/beatEikichi/dailyQuestions';

const bodySchema = z.object({
  creatorToken: z.string().min(1),
  eikichiPlayerId: z.string().nullable().optional(),
});

/**
 * POST /api/games/beat-eikichi/[code]/restart
 *
 * Le maître relance une partie. Un nouveau tirage aléatoire de 20 questions est fait
 * (ce qui garantit la rejouabilité — les parties successives ne se ressemblent pas).
 * Reset complet des playerStates (scores, answers, typing).
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
      include: { players: true, beatEikichiGame: true },
    });

    if (!room || !room.beatEikichiGame) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }
    if (!isCreator(room, creatorToken)) {
      return Response.json({ error: 'Only the creator can restart' }, { status: 403 });
    }

    // Si le caller fournit un eikichiPlayerId, on le valide ; sinon on conserve l'ancien.
    const previousEikichi = room.beatEikichiGame.eikichiPlayerId;
    const requestedEikichi =
      eikichiPlayerId === undefined ? previousEikichi : eikichiPlayerId;
    const validatedEikichiId =
      requestedEikichi && room.players.some((p) => p.id === requestedEikichi)
        ? requestedEikichi
        : null;

    // Nouveau tirage de 20 questions pour cette nouvelle partie.
    const questions = await generateQuestionSet();

    // Suppression et recréation propre (la cascade supprime les playerStates).
    await prisma.beatEikichiGame.delete({ where: { roomId: room.id } });

    await prisma.beatEikichiGame.create({
      data: {
        roomId: room.id,
        questions: questions as unknown as object,
        phase: 'playing',
        currentIndex: 0,
        questionStartedAt: new Date(),
        eikichiPlayerId: validatedEikichiId,
        playerStates: {
          create: room.players.map((p) => ({ playerId: p.id })),
        },
      },
    });

    await pushRoomUpdate(code);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[BEAT-EIKICHI] restart error:', error);
    return Response.json({ error: 'Failed to restart' }, { status: 500 });
  }
}
