/**
 * Télécharge les SVG « contour de pays » depuis la CDN teuteuf (Worldle)
 * vers `public/country-shapes/<iso2>.svg`.
 *
 *   Source : https://cdn-assets.teuteuf.fr/data/common/country-shapes/<iso2>.svg
 *   Cible  : public/country-shapes/<iso2>.svg  (servi par Next.js sur /country-shapes/<iso2>.svg)
 *
 * Format : SVG inline, **uniquement le contour du pays**, pas de globe ni
 * de continent — exactement ce qu'on veut pour le type de question
 * `country-shape` du Quiz CEO et pour Worldle.
 *
 * Idempotent : skip les fichiers déjà téléchargés. Force le re-download avec
 * la variable d'env `FORCE=1`.
 *
 * Lancer : `npx tsx scripts/download-country-shapes.ts`
 *          ou `npm run download:country-shapes`
 */

import { mkdir, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
// Le script tourne côté Node — il peut importer le module server.
// Worldle = 44 pays (server-only), ALL_COUNTRIES = ~190 pays (Quiz CEO).
import { COUNTRIES } from '../lib/worldle/server';
import { ALL_COUNTRIES } from '../lib/quizCeo/allCountries';

const CDN_BASE = 'https://cdn-assets.teuteuf.fr/data/common/country-shapes';
const OUT_DIR = join(process.cwd(), 'public', 'country-shapes');
const CONCURRENCY = 8;
const FORCE = process.env.FORCE === '1';
// `ALL=1 npm run download:country-shapes` télécharge les ~190 pays de
// `lib/quizCeo/allCountries.ts`. Sans ALL, on se limite aux 44 pays Worldle.
const ALL = process.env.ALL === '1';
const SOURCE = ALL ? ALL_COUNTRIES : COUNTRIES;

interface Result {
  id: string;
  status: 'downloaded' | 'skipped' | 'failed';
  error?: string;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function downloadOne(id: string): Promise<Result> {
  const dest = join(OUT_DIR, `${id}.svg`);
  if (!FORCE && (await fileExists(dest))) {
    return { id, status: 'skipped' };
  }
  const url = `${CDN_BASE}/${id}.svg`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      return { id, status: 'failed', error: `HTTP ${res.status}` };
    }
    const text = await res.text();
    // Sanity check : un SVG fait au minimum quelques centaines d'octets et
    // contient `<svg`. Si on reçoit autre chose (404 page HTML, redirect, etc.)
    // on refuse plutôt que d'écrire un fichier corrompu.
    if (text.length < 80 || !text.includes('<svg')) {
      return { id, status: 'failed', error: 'invalid SVG payload' };
    }
    await writeFile(dest, text, 'utf8');
    return { id, status: 'downloaded' };
  } catch (e) {
    return {
      id,
      status: 'failed',
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

async function runWithConcurrency<T>(
  items: T[],
  worker: (item: T) => Promise<Result>,
  concurrency: number,
): Promise<Result[]> {
  const results: Result[] = [];
  let cursor = 0;
  const runners = Array.from({ length: concurrency }, async () => {
    while (cursor < items.length) {
      const idx = cursor++;
      const item = items[idx];
      const r = await worker(item);
      results.push(r);
      const tag =
        r.status === 'downloaded' ? '✓' : r.status === 'skipped' ? '·' : '✗';
      // eslint-disable-next-line no-console
      console.log(
        `${tag} ${r.id.padEnd(3)} ${r.status}${r.error ? ` (${r.error})` : ''}`,
      );
    }
  });
  await Promise.all(runners);
  return results;
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  // eslint-disable-next-line no-console
  console.log(
    `→ ${SOURCE.length} pays à traiter (${ALL ? 'ALL_COUNTRIES' : 'Worldle'}) — sortie : ${OUT_DIR}${FORCE ? ' (FORCE)' : ''}`,
  );
  const ids = SOURCE.map((c) => c.id);
  const results = await runWithConcurrency(
    ids,
    (id) => downloadOne(id),
    CONCURRENCY,
  );
  const dl = results.filter((r) => r.status === 'downloaded').length;
  const sk = results.filter((r) => r.status === 'skipped').length;
  const fa = results.filter((r) => r.status === 'failed');
  // eslint-disable-next-line no-console
  console.log(
    `\nTerminé : ${dl} téléchargés · ${sk} déjà présents · ${fa.length} échoués`,
  );
  if (fa.length > 0) {
    // eslint-disable-next-line no-console
    console.log('\nÉchecs :');
    fa.forEach((r) => {
      // eslint-disable-next-line no-console
      console.log(`  - ${r.id} : ${r.error}`);
    });
    process.exit(1);
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
