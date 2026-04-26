/**
 * Supprime les SVG `public/brand-logos/*.svg` qui sont **dans le
 * `WORDMARK_BLOCKLIST`** (logos = juste le nom de la marque écrit).
 *
 * Ces logos sont déjà filtrés au runtime par `getAvailableBrands()`, mais
 * laisser les fichiers physiques sur Vercel est du poids mort. Cette
 * commande nettoie le dossier pour ne garder que les logos réellement
 * utilisables.
 *
 * Mode `--dry` (ou `DRY=1`) : liste ce qui serait supprimé, sans toucher.
 *
 * Lancer : `npm run prune:brand-logos` (ou `DRY=1` pour aperçu).
 */

import { readdir, unlink, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { WORDMARK_BLOCKLIST } from '../lib/quizCeo/brandLogos';
import { BRANDS } from '../lib/quizCeo/brands';

const DIR = join(process.cwd(), 'public', 'brand-logos');
const DRY = process.env.DRY === '1' || process.argv.includes('--dry');

async function main() {
  const knownSlugs = new Set(BRANDS.map((b) => b.slug));
  const files = (await readdir(DIR)).filter((f) => f.endsWith('.svg'));

  const removedWordmark: string[] = [];
  const removedOrphan: string[] = [];
  const kept: string[] = [];

  for (const f of files) {
    const slug = f.replace(/\.svg$/, '');
    const isWordmark = WORDMARK_BLOCKLIST.has(slug);
    const isOrphan = !knownSlugs.has(slug);

    if (isWordmark || isOrphan) {
      const path = join(DIR, f);
      if (isWordmark) removedWordmark.push(f);
      else removedOrphan.push(f);
      if (!DRY) {
        try {
          await stat(path);
          await unlink(path);
        } catch {
          /* déjà supprimé */
        }
      }
    } else {
      kept.push(f);
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    `Gardés                            : ${kept.length}\n` +
      `Wordmarks (${DRY ? 'à supprimer' : 'supprimés'})        : ${removedWordmark.length}\n` +
      `Orphelins (${DRY ? 'à supprimer' : 'supprimés'}, pas dans BRANDS) : ${removedOrphan.length}\n`,
  );
  if (removedWordmark.length > 0) {
    // eslint-disable-next-line no-console
    console.log('--- Wordmarks ---');
    // eslint-disable-next-line no-console
    console.log(removedWordmark.map((f) => `  - ${f}`).join('\n'));
  }
  if (removedOrphan.length > 0) {
    // eslint-disable-next-line no-console
    console.log('\n--- Orphelins ---');
    // eslint-disable-next-line no-console
    console.log(removedOrphan.map((f) => `  - ${f}`).join('\n'));
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
