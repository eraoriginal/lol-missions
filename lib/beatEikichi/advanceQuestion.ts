import { prisma } from '@/lib/prisma';
import { BEAT_EIKICHI_CONFIG } from './config';

interface PlayerAnswer {
  position: number;
  submittedText: string;
  correct: boolean;
  answeredAtMs: number | null;
}

/**
 * Fait avancer la question courante pour une partie Beat Eikichi.
 *
 * - Pour chaque joueur qui n'a pas encore répondu à la question courante,
 *   crée une entrée answer incorrecte avec leur `currentTyping` (ou vide).
 * - Reset le `currentTyping` de tous.
 * - Incrémente `currentIndex`. Si on atteint la fin, passe en phase `review_intro`.
 *
 * Appelé depuis :
 *   - POST /next (timeout du timer)
 *   - POST /submit (si Eikichi trouve, ou si tous les joueurs ont trouvé)
 *
 * Le caller DOIT avoir vérifié la phase "playing" avant d'appeler cette fonction.
 */
export async function advanceQuestion(gameId: string): Promise<void> {
  const game = await prisma.beatEikichiGame.findUnique({
    where: { id: gameId },
    include: { playerStates: true },
  });

  if (!game || game.phase !== 'playing') return;

  // Ajoute une entrée incorrecte pour chaque joueur sans réponse sur la question courante.
  for (const state of game.playerStates) {
    const answers = (state.answers as unknown as PlayerAnswer[]) ?? [];
    const already = answers.find((a) => a.position === game.currentIndex);
    if (!already) {
      const missed: PlayerAnswer = {
        position: game.currentIndex,
        submittedText: state.currentTyping ?? '',
        correct: false,
        answeredAtMs: null,
      };
      await prisma.beatEikichiPlayerState.update({
        where: { id: state.id },
        data: { answers: [...answers, missed] as unknown as object },
      });
    }
  }

  // Reset currentTyping pour tous (nouvelle question).
  await prisma.beatEikichiPlayerState.updateMany({
    where: { gameId: game.id },
    data: { currentTyping: '' },
  });

  const nextIndex = game.currentIndex + 1;
  const totalQuestions = BEAT_EIKICHI_CONFIG.QUESTIONS_PER_GAME;

  if (nextIndex >= totalQuestions) {
    await prisma.beatEikichiGame.update({
      where: { id: game.id },
      data: {
        phase: 'review_intro',
        currentIndex: 0,
        questionStartedAt: null,
      },
    });
  } else {
    await prisma.beatEikichiGame.update({
      where: { id: game.id },
      data: {
        currentIndex: nextIndex,
        questionStartedAt: new Date(),
      },
    });
  }
}

/**
 * Vérifie si tous les joueurs ont une réponse correcte à la question courante.
 */
export function allPlayersHaveFoundAnswer(
  playerStates: Array<{ answers: unknown }>,
  currentIndex: number,
): boolean {
  return playerStates.every((state) => {
    const answers = (state.answers as PlayerAnswer[]) ?? [];
    return answers.some((a) => a.position === currentIndex && a.correct);
  });
}
