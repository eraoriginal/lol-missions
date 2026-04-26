/**
 * Nettoie les SVG `public/country-shapes/*.svg` téléchargés depuis la CDN
 * teuteuf, pour ne garder que **le contour du pays** :
 *
 *   - Supprime les `<circle>` / `<polygon>` / `<path>` colorés (`#5CE50D`
 *     vert = marqueur du pays cible côté teuteuf, `#E52A0D` rouge =
 *     marqueurs d'autres pays). Ces formes sont des aides au jeu Worldle
 *     teuteuf, pas des éléments de silhouette — et leur position est un
 *     spoiler !
 *   - Bascule `fill="black"` → `fill="white"` sur les paths restants pour
 *     que le contour soit lisible sur le fond sombre Worldle / Quiz CEO.
 *
 * Idempotent : skip les fichiers déjà nettoyés (aucun fill colorée + déjà
 * en blanc). `FORCE=1` pour re-traiter quand même.
 *
 * Lancer : `npx tsx scripts/cleanup-country-shapes.ts`
 *          ou `npm run cleanup:country-shapes`
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'public', 'country-shapes');
const COLORED_FILLS = ['#5CE50D', '#E52A0D'];
const FORCE = process.env.FORCE === '1';

interface Result {
  file: string;
  status: 'cleaned' | 'skipped' | 'failed';
  removed?: number;
  error?: string;
}

/**
 * Supprime les balises auto-fermantes (et leurs versions ouvertes/fermées)
 * dont l'attribut `fill` correspond à une des couleurs spécifiées.
 */
function stripColoredElements(
  svg: string,
  colors: string[],
): { svg: string; removed: number } {
  let removed = 0;
  let result = svg;
  for (const color of colors) {
    // Auto-fermantes : <element ... fill="#xxx" ... />
    const selfClosing = new RegExp(
      `<(?:circle|polygon|path|rect|ellipse|g)\\b[^>]*fill="${color}"[^>]*\\/>\\s*`,
      'gi',
    );
    result = result.replace(selfClosing, () => {
      removed++;
      return '';
    });
    // Paires ouverte/fermée : <element ... fill="#xxx" ...>...</element>
    const paired = new RegExp(
      `<(circle|polygon|path|rect|ellipse|g)\\b[^>]*fill="${color}"[^>]*>[\\s\\S]*?<\\/\\1>\\s*`,
      'gi',
    );
    result = result.replace(paired, () => {
      removed++;
      return '';
    });
  }
  return { svg: result, removed };
}

async function cleanOne(file: string): Promise<Result> {
  const path = join(DIR, file);
  try {
    const original = await readFile(path, 'utf8');
    const hasColored = COLORED_FILLS.some((c) => original.includes(`fill="${c}"`));
    const hasBlack = original.includes('fill="black"');
    if (!FORCE && !hasColored && !hasBlack) {
      return { file, status: 'skipped' };
    }
    let { svg, removed } = stripColoredElements(original, COLORED_FILLS);
    // Bascule black → white pour visibilité sur fond sombre.
    svg = svg.replace(/fill="black"/g, 'fill="white"');
    if (svg === original) {
      return { file, status: 'skipped' };
    }
    await writeFile(path, svg, 'utf8');
    return { file, status: 'cleaned', removed };
  } catch (e) {
    return {
      file,
      status: 'failed',
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

async function main() {
  const files = (await readdir(DIR))
    .filter((f) => f.endsWith('.svg'))
    .sort();
  // eslint-disable-next-line no-console
  console.log(`→ ${files.length} SVG à traiter dans ${DIR}${FORCE ? ' (FORCE)' : ''}`);

  const results: Result[] = [];
  for (const f of files) {
    const r = await cleanOne(f);
    results.push(r);
    const tag =
      r.status === 'cleaned' ? '✓' : r.status === 'skipped' ? '·' : '✗';
    // eslint-disable-next-line no-console
    console.log(
      `${tag} ${f.padEnd(8)} ${r.status}${r.removed ? ` (-${r.removed} markers)` : ''}${r.error ? ` (${r.error})` : ''}`,
    );
  }
  const cl = results.filter((r) => r.status === 'cleaned').length;
  const sk = results.filter((r) => r.status === 'skipped').length;
  const fa = results.filter((r) => r.status === 'failed');
  // eslint-disable-next-line no-console
  console.log(
    `\nTerminé : ${cl} nettoyés · ${sk} déjà propres · ${fa.length} échoués`,
  );
  if (fa.length > 0) process.exit(1);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
