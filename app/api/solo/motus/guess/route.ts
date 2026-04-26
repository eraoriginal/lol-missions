import 'server-only';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { MOTUS_CLEAN_WORDS } from '@/lib/motus/server';
import { normalizeMotus } from '@/lib/motus/normalize';
import { pickByDay } from '@/lib/solo/dailyIndex';

const MAX_ATTEMPTS = 6;

type Feedback = 'correct' | 'misplaced' | 'absent';

/**
 * Wordle-style feedback : pass 1 marque les correct + consume,
 * pass 2 marque les misplaced sur les caractères restants.
 */
function computeFeedback(guess: string, target: string): Feedback[] {
  const n = target.length;
  const result: Feedback[] = Array(n).fill('absent');
  const chars = target.split('');
  for (let i = 0; i < n; i++) {
    if (guess[i] === target[i]) {
      result[i] = 'correct';
      chars[i] = '';
    }
  }
  for (let i = 0; i < n; i++) {
    if (result[i] === 'correct') continue;
    const idx = chars.indexOf(guess[i]);
    if (idx >= 0) {
      result[i] = 'misplaced';
      chars[idx] = '';
    }
  }
  return result;
}

const bodySchema = z.object({
  guess: z.string().min(1).max(20),
  /**
   * Compteur d'essais déjà effectués (côté client). Permet de :
   *   - refuser si le client envoie un guess alors qu'il a déjà épuisé
   *     ses tentatives (`>= MAX_ATTEMPTS`)
   *   - révéler le mot si c'est le dernier essai et qu'il est faux
   * NB : aucune persistance serveur — on fait confiance au client pour
   * ce compteur. Trade-off documenté : un cheater peut envoyer
   * `attemptIndex: 5` directement pour faire révéler le mot, mais c'est
   * équivalent à brute-forcer 6 guesses via l'API. Le but du serveur est
   * de protéger contre la lecture du **catalogue** (vrai cheat passif),
   * pas contre les requêtes craftées (cheat actif assumé).
   */
  attemptIndex: z.number().int().min(0).max(MAX_ATTEMPTS - 1),
});

/**
 * POST /api/solo/motus/guess
 *
 * Body : `{ guess: string, attemptIndex: 0..5 }`
 * Réponse :
 *   - `feedback: ('correct'|'misplaced'|'absent')[]` — par lettre
 *   - `won: boolean` — guess === target
 *   - `target?: string` — révélé uniquement si `won` OU dernier essai (5)
 *   - `error?: string` — pour les cas invalides (mauvaise longueur, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { guess: rawGuess, attemptIndex } = bodySchema.parse(body);

    const target = pickByDay(MOTUS_CLEAN_WORDS);
    const guess = normalizeMotus(rawGuess);

    if (guess.length !== target.length) {
      return Response.json(
        { error: `mauvaise longueur (attendu ${target.length})` },
        { status: 400 },
      );
    }

    const feedback = computeFeedback(guess, target);
    const won = guess === target;
    const isLastAttempt = attemptIndex === MAX_ATTEMPTS - 1;
    const reveal = won || isLastAttempt;

    return Response.json({
      feedback,
      won,
      ...(reveal ? { target } : {}),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[motus/guess] error', error);
    return Response.json({ error: 'Server error' }, { status: 500 });
  }
}
