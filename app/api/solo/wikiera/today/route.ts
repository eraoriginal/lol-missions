import 'server-only';
import { WIKIERA_ENTRIES } from '@/lib/wikiera/server';
import { pickByDay } from '@/lib/solo/dailyIndex';

/**
 * GET /api/solo/wikiera/today
 *
 * Renvoie le `text` du wiki du jour. Le `topic` et les `aliases` (= la
 * solution) restent server-only et ne sont jamais exposés ici.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  const entry = pickByDay(WIKIERA_ENTRIES);
  return Response.json(
    { text: entry.text },
    {
      headers: {
        'Cache-Control': 'private, max-age=60',
      },
    },
  );
}
