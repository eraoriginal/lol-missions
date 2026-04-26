import 'server-only';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { COUNTRIES } from '@/lib/worldle/server';
import { pickByDay } from '@/lib/solo/dailyIndex';

/**
 * GET /api/solo/worldle/silhouette
 *
 * Stream le SVG de la silhouette du pays du jour. URL opaque côté client
 * (pas d'iso2 visible dans le path), donc impossible de leak la cible
 * via DevTools Network.
 *
 * Lit `public/country-shapes/<iso2>.svg` après résolution server-side.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const target = pickByDay(COUNTRIES);
    const filePath = path.join(
      process.cwd(),
      'public',
      'country-shapes',
      `${target.id}.svg`,
    );
    const content = await readFile(filePath);
    return new Response(new Uint8Array(content), {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        // Court : on évite le re-fetch sur chaque hot-reload mais on couvre
        // le passage de minuit UTC (changement de cible).
        'Cache-Control': 'private, max-age=300',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    console.error('[worldle/silhouette] error', err);
    return new Response('Not found', { status: 404 });
  }
}
