import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate, pushBeatEikichiSound } from '@/lib/pusher';
import { isAcceptedAnswer, computeCloseness } from '@/lib/beatEikichi/fuzzyMatch';
import type { BeatEikichiQuestion } from '@/lib/beatEikichi/dailyQuestions';
import {
  advanceQuestion,
  allPlayersHaveFoundAnswer,
} from '@/lib/beatEikichi/advanceQuestion';

const bodySchema = z.object({
  playerToken: z.string().min(1),
  text: z.string().min(1).max(200),
});

interface PlayerAnswer {
  position: number;
  submittedText: string;
  correct: boolean;
  answeredAtMs: number | null;
}

/**
 * POST /api/games/beat-eikichi/[code]/submit
 *
 * Le joueur soumet une réponse pour la question courante.
 *
 * Règles d'avancement :
 *   - Si le joueur est "Eikichi" et trouve la bonne réponse → question avance pour tous.
 *   - Si tous les joueurs ont trouvé (après cette réponse) → question avance pour tous.
 *   - Sinon, le timer continue (current behavior).
 *
 * Réponses :
 *   - incorrect : 200 { correct: false } (pas de mutation)
 *   - correct   : 200 { correct: true, advanced: boolean }
 *   - déjà répondu : 400
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
    const game = room.beatEikichiGame;

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

    const questions = game.questions as unknown as BeatEikichiQuestion[];
    const currentQuestion = questions[game.currentIndex];
    if (!currentQuestion) {
      return Response.json({ error: 'No current question' }, { status: 400 });
    }

    const answers = (state.answers as unknown as PlayerAnswer[]) ?? [];
    const already = answers.find((a) => a.position === game.currentIndex);
    if (already) {
      return Response.json(
        { error: 'Already answered this question', correct: already.correct },
        { status: 400 },
      );
    }

    const correct = isAcceptedAnswer(text, currentQuestion.name, currentQuestion.aliases);

    if (!correct) {
      // Feedback de proximité informatif — ne change PAS la validation (stricte),
      // mais guide le joueur (chaud / tiède / froid).
      const closeness = computeCloseness(
        text,
        currentQuestion.name,
        currentQuestion.aliases,
      );
      return Response.json({ correct: false, closeness });
    }

    // Bonne réponse : enregistre l'answer + incrémente le score.
    const answeredAtMs = game.questionStartedAt
      ? Date.now() - new Date(game.questionStartedAt).getTime()
      : null;

    const newAnswer: PlayerAnswer = {
      position: game.currentIndex,
      submittedText: text,
      correct: true,
      answeredAtMs,
    };

    await prisma.beatEikichiPlayerState.update({
      where: { id: state.id },
      data: {
        answers: [...answers, newAnswer] as unknown as object,
        score: { increment: 1 },
        currentTyping: text,
      },
    });

    // Règles d'avancement automatique :
    // 1. Si le joueur est Eikichi → avance immédiatement pour tous.
    // 2. Sinon, si tous les joueurs ont maintenant trouvé → avance aussi.
    let advanced = false;
    const isEikichi = game.eikichiPlayerId === player.id;

    if (isEikichi) {
      // L'Eikichi a trouvé → son spécifique joué pour tous les joueurs.
      await pushBeatEikichiSound(code, 'eikichi-found');
      await advanceQuestion(game.id);
      advanced = true;
    } else {
      // Simule l'état post-insertion pour la vérification "tous trouvé".
      const updatedStates = game.playerStates.map((s) =>
        s.id === state.id
          ? { ...s, answers: [...answers, newAnswer] }
          : s,
      );
      if (allPlayersHaveFoundAnswer(updatedStates, game.currentIndex)) {
        await advanceQuestion(game.id);
        advanced = true;
      }
    }

    await pushRoomUpdate(code);

    return Response.json({ correct: true, advanced });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[BEAT-EIKICHI] submit error:', error);
    return Response.json({ error: 'Failed to submit answer' }, { status: 500 });
  }
}
