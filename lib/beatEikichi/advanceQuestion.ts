import { prisma } from '@/lib/prisma';
import { BEAT_EIKICHI_CONFIG } from './config';

interface PlayerAnswer {
  position: number;
  submittedText: string;
  correct: boolean;
  answeredAtMs: number | null;
}

/**
 * Avance ATOMIQUEMENT la question courante d'une partie Beat Eikichi,
 * mais UNIQUEMENT si `currentIndex === expectedIndex` au moment de l'écriture.
 *
 * Pourquoi atomique : deux requêtes concurrentes (ex. /next d'un client A et
 * /submit d'Eikichi B) peuvent toutes les deux lire `currentIndex=8`, passer
 * leur check d'idempotence, puis appeler advanceQuestion en parallèle.
 * Avec l'ancienne version (findUnique + write), si A commit avant que B re-lise
 * (race TOC/TOU), B lisait `currentIndex=9` et écrivait 10 → **la question 9
 * était sautée**. C'était le vrai bug "passé de 8 à 10 sans voir l'image 9".
 *
 * La protection : on tente un `updateMany` conditionné sur
 * `{ currentIndex: expectedIndex, phase: 'playing' }`. PostgreSQL garantit
 * l'atomicité du WHERE+UPDATE. Si une autre requête a déjà avancé (count=0),
 * on retourne false et le caller traite ça comme "skipped: already advanced".
 *
 * Appelée par :
 *   - POST /next (timeout du timer, n'importe quel client)
 *   - POST /submit (Eikichi qui trouve la bonne réponse)
 *   - POST /submit (tous les joueurs ont trouvé)
 *
 * @returns true si l'avancement a eu lieu, false si un autre processus avait
 *   déjà avancé (no-op idempotent).
 */
export async function advanceQuestionIfMatches(
  gameId: string,
  expectedIndex: number,
): Promise<boolean> {
  const totalQuestions = BEAT_EIKICHI_CONFIG.QUESTIONS_PER_GAME;
  const isLastQuestion = expectedIndex + 1 >= totalQuestions;

  // Étape 1 : tentative atomique d'avancement. SEUL le processus dont
  // `expectedIndex` correspond à l'état actuel passe ; les autres reçoivent
  // count=0 et abandonnent sans rien casser.
  const result = isLastQuestion
    ? await prisma.beatEikichiGame.updateMany({
        where: {
          id: gameId,
          phase: 'playing',
          currentIndex: expectedIndex,
        },
        data: {
          phase: 'review_intro',
          currentIndex: 0,
          questionStartedAt: null,
        },
      })
    : await prisma.beatEikichiGame.updateMany({
        where: {
          id: gameId,
          phase: 'playing',
          currentIndex: expectedIndex,
        },
        data: {
          currentIndex: expectedIndex + 1,
          questionStartedAt: new Date(),
        },
      });

  if (result.count === 0) {
    // Quelqu'un d'autre a déjà avancé (ou la phase n'est plus playing).
    // Pas de side effect : on n'insère pas de "missed answer" pour l'index
    // expectedIndex car ce travail a déjà été fait par le processus gagnant.
    return false;
  }

  // Étape 2 : insertions de side-effects (missed answers + reset currentTyping).
  // À ce stade, le processus appelant a "gagné" l'avancement et est seul à
  // exécuter ces opérations pour la transition de l'index `expectedIndex`.
  // Les playerStates lus ici peuvent contenir une réponse pour expectedIndex
  // (ex. Eikichi qui a soumis avant l'advance), c'est le cas normal — le
  // filtre `if (!already)` skip ces joueurs.
  const playerStates = await prisma.beatEikichiPlayerState.findMany({
    where: { gameId },
  });

  for (const state of playerStates) {
    const answers = (state.answers as unknown as PlayerAnswer[]) ?? [];
    const already = answers.find((a) => a.position === expectedIndex);
    if (!already) {
      const missed: PlayerAnswer = {
        position: expectedIndex,
        submittedText: state.currentTyping ?? '',
        correct: false,
        answeredAtMs: null,
      };
      // Pas de risque de double-insert : un seul processus arrive ici par
      // valeur d'expectedIndex grâce au gate atomique de l'étape 1.
      await prisma.beatEikichiPlayerState.update({
        where: { id: state.id },
        data: { answers: [...answers, missed] as unknown as object },
      });
    }
  }

  // Reset currentTyping pour tous (nouvelle question).
  await prisma.beatEikichiPlayerState.updateMany({
    where: { gameId },
    data: { currentTyping: '' },
  });

  return true;
}

/**
 * @deprecated Utiliser `advanceQuestionIfMatches` qui est atomique sur le
 * `currentIndex` attendu. Cette version legacy est sujette à des races TOC/TOU
 * et peut sauter une question quand deux requêtes concurrentes appellent en
 * parallèle.
 *
 * Conservée comme wrapper pour les tests et appelants historiques : elle lit
 * le currentIndex courant et délègue à la version atomique.
 */
export async function advanceQuestion(gameId: string): Promise<void> {
  const game = await prisma.beatEikichiGame.findUnique({
    where: { id: gameId },
    select: { currentIndex: true, phase: true },
  });
  if (!game || game.phase !== 'playing') return;
  await advanceQuestionIfMatches(gameId, game.currentIndex);
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
