import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate, pushBeatEikichiSound } from '@/lib/pusher';
import { isAcceptedAnswer, computeCloseness } from '@/lib/beatEikichi/fuzzyMatch';
import type { BeatEikichiQuestion } from '@/lib/beatEikichi/dailyQuestions';
import {
  advanceQuestionIfMatches,
  allPlayersHaveFoundAnswer,
} from '@/lib/beatEikichi/advanceQuestion';

const bodySchema = z.object({
  playerToken: z.string().min(1),
  text: z.string().min(1).max(200),
  // Index de la question vue par le client au moment où il a soumis. Permet
  // de détecter qu'une race a fait avancer la question entre l'envoi et le
  // traitement (ex. /next d'un autre client a gagné juste avant). Sans ce
  // garde-fou, le serveur évaluerait la réponse contre la question SUIVANTE
  // → faux negatif où une bonne réponse est marquée incorrecte.
  expectedIndex: z.number().int().min(0).optional(),
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
    const { playerToken, text, expectedIndex } = bodySchema.parse(body);

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

    // Anti-race : si le client soumet pour la question N mais que le serveur
    // est déjà passé à N+1 (ex. /next d'un autre client a gagné le gate
    // pendant que le submit voyageait), on retourne `late: true` SANS évaluer
    // contre la mauvaise question. Le client peut afficher un message neutre
    // (« la question a déjà avancé ») au lieu d'un « mauvaise réponse » faux.
    if (
      expectedIndex !== undefined &&
      expectedIndex !== game.currentIndex
    ) {
      return Response.json({
        correct: false,
        late: true,
        actualIndex: game.currentIndex,
      });
    }

    const answers = (state.answers as unknown as PlayerAnswer[]) ?? [];
    const already = answers.find((a) => a.position === game.currentIndex);
    if (already) {
      return Response.json(
        { error: 'Already answered this question', correct: already.correct },
        { status: 400 },
      );
    }

    // Validation : seul le nom canonique fait foi (pas les aliases).
    const correct = isAcceptedAnswer(text, currentQuestion.name);

    if (!correct) {
      // Feedback de proximité informatif — ne change PAS la validation (stricte),
      // mais guide le joueur (chaud / tiède / froid).
      const closeness = computeCloseness(text, currentQuestion.name);
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
    //
    // L'avancement passe par `advanceQuestionIfMatches` qui est ATOMIQUE sur
    // currentIndex. Si une autre requête concurrente avait déjà avancé pendant
    // que ce handler tournait (ex. /next d'un autre client au timeout), le
    // gate retourne `false` et on n'avance pas une 2e fois → pas de skip de
    // question (bug racine du "passé de 8 à 10").
    let advanced = false;
    const isEikichi = game.eikichiPlayerId === player.id;
    const indexAtSubmit = game.currentIndex;

    if (isEikichi) {
      // L'Eikichi a trouvé → on tente d'avancer atomiquement.
      // Le son ne se joue QUE si on a réussi à gagner le gate (sinon on
      // notifie inutilement les autres clients sur une question déjà passée).
      advanced = await advanceQuestionIfMatches(game.id, indexAtSubmit);
      if (advanced) {
        await pushBeatEikichiSound(code, 'eikichi-found');
      }
    } else {
      // Simule l'état post-insertion pour la vérification "tous trouvé".
      const updatedStates = game.playerStates.map((s) =>
        s.id === state.id
          ? { ...s, answers: [...answers, newAnswer] }
          : s,
      );
      if (allPlayersHaveFoundAnswer(updatedStates, indexAtSubmit)) {
        advanced = await advanceQuestionIfMatches(game.id, indexAtSubmit);
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
