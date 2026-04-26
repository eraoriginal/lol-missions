import 'server-only';
import { MOTUS_CLEAN_WORDS } from '@/lib/motus/server';
import { pickByDay } from '@/lib/solo/dailyIndex';

/**
 * GET /api/solo/motus/today
 *
 * Renvoie les métadonnées du puzzle du jour (pas de spoiler) :
 *   - `wordLength` : longueur du mot (5..8) — nécessaire pour rendre
 *     la grille vide.
 *   - `firstLetter` : 1re lettre — fait partie du gameplay (scaffold
 *     Motus). Pas considéré comme un spoiler.
 *
 * Ne renvoie PAS le mot complet. La validation des essais se fait via
 * `POST /api/solo/motus/guess`.
 *
 * Cache : `Cache-Control: private, max-age=60` — court car le mot change à
 * minuit UTC, mais on évite de re-fetch à chaque hot-reload.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const word = pickByDay(MOTUS_CLEAN_WORDS);
  return Response.json(
    {
      wordLength: word.length,
      firstLetter: word[0],
    },
    {
      headers: {
        'Cache-Control': 'private, max-age=60',
      },
    },
  );
}
