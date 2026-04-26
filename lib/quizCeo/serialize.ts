/**
 * Utilitaires pour exposer les questions aux clients sans spoiler la réponse.
 *
 * En phase "playing", on ne veut PAS que le champ `answer` transite via
 * l'API GET /rooms/[code] (un joueur malin verrait la solution dans ses
 * devtools). On le strip avant renvoi.
 *
 * En phase "review" / "leaderboard", la partie est terminée : on peut
 * envoyer la réponse.
 */

import type { FullQuestion, PublicQuestion } from './types';

export function stripAnswer(q: FullQuestion): PublicQuestion {
  const { answer: _answer, ...rest } = q;
  void _answer;
  return rest as PublicQuestion;
}

export function stripAnswers(questions: FullQuestion[]): PublicQuestion[] {
  return questions.map(stripAnswer);
}
