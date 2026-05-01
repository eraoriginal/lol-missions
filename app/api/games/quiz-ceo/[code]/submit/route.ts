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
  // Index de la question vue par le client au moment de l'envoi. Permet de
  // rejeter le submit si /next a avancé la question entre l'envoi et le
  // traitement (sinon la réponse "Paris" pour la Q3 « capitale de la France »
  // serait enregistrée à position=4 — la nouvelle question — créant des
  // bonnes réponses attribuées à la mauvaise question en review).
  expectedIndex: z.number().int().min(0).optional(),
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
    const { playerToken, submitted, expectedIndex } = bodySchema.parse(body);

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
    // Anti-race : si la question a avancé entre l'envoi du submit et son
    // traitement (typiquement /next du timer), on n'enregistre PAS la réponse
    // à la nouvelle position, ce qui attribuerait la réponse à la mauvaise
    // question.
    if (expectedIndex !== undefined && expectedIndex !== game.currentIndex) {
      return Response.json({ ok: true, skipped: 'late', actualIndex: game.currentIndex });
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

    // Insertion atomique gardée par game.currentIndex pour fermer la fenêtre
    // entre la lecture du game et l'écriture de la réponse : sans ce gate,
    // /next pouvait avancer la question entre les deux et l'écriture serait
    // enregistrée pour position = currentIndex initial alors que la question
    // a déjà changé.
    const writeResult = await prisma.quizCeoPlayerState.updateMany({
      where: {
        id: state.id,
        game: { currentIndex: game.currentIndex, phase: 'playing' },
      },
      data: { answers: newAnswers as unknown as object },
    });
    if (writeResult.count === 0) {
      return Response.json({
        ok: true,
        skipped: 'late-on-write',
        actualIndex: -1,
      });
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
    console.error('[QUIZ-CEO] submit error:', error);
    return Response.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
