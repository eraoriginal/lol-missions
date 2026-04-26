/**
 * Supprime les SVG `public/country-shapes/*.svg` qui ne sont **pas référencés
 * par `lib/worldle/countries.ts`** (la seule liste utilisée au runtime —
 * Worldle solo + question Quiz CEO worldle).
 *
 * Pourquoi : `download-country-shapes.ts ALL=1` télécharge ~190 pays depuis
 * la CDN teuteuf, mais seulement 44 sont réellement piochés au runtime.
 * Les 150+ autres sont du poids mort dans le bundle Vercel et ralentissent
 * les déploiements.
 *
 * Mode `--dry` (ou `DRY=1`) : liste ce qui serait supprimé, sans toucher.
 *
 * Lancer : `npm run prune:country-shapes` (ou avec `DRY=1` pour aperçu).
 */

import { readdir, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { COUNTRIES } from '../lib/worldle/countries';

const DIR = join(process.cwd(), 'public', 'country-shapes');
const DRY = process.env.DRY === '1' || process.argv.includes('--dry');

async function main() {
  const usedIds = new Set(COUNTRIES.map((c) => c.id));
  const files = (await readdir(DIR)).filter((f) => f.endsWith('.svg'));

  const kept: string[] = [];
  const removed: string[] = [];

  for (const f of files) {
    const id = f.replace(/\.svg$/, '');
    if (usedIds.has(id)) {
      kept.push(f);
    } else {
      removed.push(f);
      if (!DRY) {
        await unlink(join(DIR, f));
      }
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    `Référencés (gardés)    : ${kept.length}\n` +
      `Non-référencés (${DRY ? 'à supprimer' : 'supprimés'}) : ${removed.length}\n`,
  );
  if (removed.length > 0) {
    // eslint-disable-next-line no-console
    console.log(removed.map((f) => `  - ${f}`).join('\n'));
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
