import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import type {
  FullQuestion,
  PlayerAnswerEntry,
  SubmittedAnswer,
} from '@/lib/quizCeo/types';

// Schéma du payload d'envoi — polymorphe selon le type.
const submittedSchema = z.union([
  z.object({ kind: z.literal('text'), value: z.string().max(500) }),
  z.object({ kind: z.literal('choice'), index: z.number().int().min(0).max(3) }),
  z.object({ kind: z.literal('boolean'), value: z.boolean() }),
  z.object({
    kind: z.literal('ranking'),
    order: z.array(z.string()).min(1).max(50),
  }),
]);

const bodySchema = z.object({
  playerToken: z.string().min(1),
  submitted: submittedSchema,
});

/**
 * POST /api/games/quiz-ceo/[code]/submit
 *
 * Le joueur enregistre sa réponse pour la question courante (phase playing).
 *   - Ne fait AUCUNE validation de correction ici : c'est le créateur qui
 *     décide à la phase de review.
 *   - Peut être appelé plusieurs fois tant que la question est active :
 *     la dernière valeur écrase la précédente (auto-save côté client).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerToken, submitted } = bodySchema.parse(body);

    const room = await prisma.room.findUnique({
      where: { code },
      include: { quizCeoGame: { include: { playerStates: true } } },
    });
    if (!room || !room.quizCeoGame) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }
    const game = room.quizCeoGame;
    if (game.phase !== 'playing') {
      return Response.json({ error: 'Not in playing phase' }, { status: 400 });
    }

    const player = await prisma.player.findUnique({ where: { token: playerToken } });
    if (!player || player.roomId !== room.id) {
      return Response.json({ error: 'Player not in room' }, { status: 403 });
    }

    const state = game.playerStates.find((s) => s.playerId === player.id);
    if (!state) {
      return Response.json({ error: 'Player state not found' }, { status: 404 });
    }

    const questions = game.questions as unknown as FullQuestion[];
    const q = questions[game.currentIndex];
    if (!q) {
      return Response.json({ error: 'No current question' }, { status: 400 });
    }

    const answers = (state.answers as unknown as PlayerAnswerEntry[]) ?? [];
    const existingIdx = answers.findIndex((a) => a.position === game.currentIndex);
    const submittedAtMs = game.questionStartedAt
      ? Date.now() - new Date(game.questionStartedAt).getTime()
      : null;

    const entry: PlayerAnswerEntry = {
      position: game.currentIndex,
      type: q.type,
      submitted: submitted as SubmittedAnswer,
      submittedAtMs,
    };

    const newAnswers =
      existingIdx >= 0
        ? answers.map((a, i) => (i === existingIdx ? entry : a))
        : [...answers, entry];

    await prisma.quizCeoPlayerState.update({
      where: { id: state.id },
      data: { answers: newAnswers as unknown as object },
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
    console.error('[QUIZ-CEO] submit error:', error);
    return Response.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
