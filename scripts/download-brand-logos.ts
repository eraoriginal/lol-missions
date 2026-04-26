/**
 * Télécharge les SVG de marques depuis simple-icons (CC0) vers
 * `public/brand-logos/<slug>.svg`.
 *
 *   Source : https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/<slug>.svg
 *   Cible  : public/brand-logos/<slug>.svg (servi par Next.js)
 *
 * Idempotent : skip les fichiers déjà téléchargés. `FORCE=1` pour forcer.
 *
 * **Robust aux 404** : simple-icons ne contient pas tous les slugs (clubs
 * sportifs, médias FR moins connus). Les marques absentes sont signalées
 * dans la sortie mais ne font pas planter le script. Elles seront simplement
 * absentes du catalogue runtime — le `start/route.ts` les filtre via
 * l'existence du SVG ou via la liste finale.
 *
 * Lancer : `npm run download:brand-logos`
 */

import { mkdir, writeFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { BRANDS } from '../lib/quizCeo/brands';

const CDN_BASE = 'https://cdn.jsdelivr.net/npm/simple-icons@latest/icons';
const OUT_DIR = join(process.cwd(), 'public', 'brand-logos');
const CONCURRENCY = 12;
const FORCE = process.env.FORCE === '1';

interface Result {
  slug: string;
  status: 'downloaded' | 'skipped' | 'missing' | 'failed';
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

async function downloadOne(slug: string): Promise<Result> {
  const dest = join(OUT_DIR, `${slug}.svg`);
  if (!FORCE && (await fileExists(dest))) {
    return { slug, status: 'skipped' };
  }
  const url = `${CDN_BASE}/${slug}.svg`;
  try {
    const res = await fetch(url);
    if (res.status === 404) {
      return { slug, status: 'missing', error: '404 (slug introuvable sur simple-icons)' };
    }
    if (!res.ok) {
      return { slug, status: 'failed', error: `HTTP ${res.status}` };
    }
    const text = await res.text();
    if (text.length < 80 || !text.includes('<svg')) {
      return { slug, status: 'failed', error: 'invalid SVG payload' };
    }
    await writeFile(dest, text, 'utf8');
    return { slug, status: 'downloaded' };
  } catch (e) {
    return {
      slug,
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
        r.status === 'downloaded'
          ? '✓'
          : r.status === 'skipped'
          ? '·'
          : r.status === 'missing'
          ? '⊘'
          : '✗';
      // eslint-disable-next-line no-console
      console.log(
        `${tag} ${r.slug.padEnd(22)} ${r.status}${r.error ? ` (${r.error})` : ''}`,
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
    `→ ${BRANDS.length} marques à traiter — sortie : ${OUT_DIR}${FORCE ? ' (FORCE)' : ''}`,
  );
  const slugs = BRANDS.map((b) => b.slug);
  const results = await runWithConcurrency(slugs, downloadOne, CONCURRENCY);

  const dl = results.filter((r) => r.status === 'downloaded').length;
  const sk = results.filter((r) => r.status === 'skipped').length;
  const mi = results.filter((r) => r.status === 'missing');
  const fa = results.filter((r) => r.status === 'failed');

  // eslint-disable-next-line no-console
  console.log(
    `\nTerminé : ${dl} téléchargés · ${sk} déjà présents · ${mi.length} introuvables · ${fa.length} échoués`,
  );
  if (mi.length > 0) {
    // eslint-disable-next-line no-console
    console.log(
      `\n⊘ Slugs introuvables sur simple-icons (à retirer de brands.ts ou trouver le bon slug) :`,
    );
    mi.forEach((r) => {
      // eslint-disable-next-line no-console
      console.log(`  - ${r.slug}`);
    });
  }
  if (fa.length > 0) {
    // eslint-disable-next-line no-console
    console.log(`\n✗ Échecs réseau :`);
    fa.forEach((r) => {
      // eslint-disable-next-line no-console
      console.log(`  - ${r.slug} : ${r.error}`);
    });
    process.exit(1);
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
