/**
 * Nettoie les SVG de marques téléchargés depuis simple-icons :
 *
 *   - **Supprime la balise `<title>NomDeLaMarque</title>`** — c'est un spoiler
 *     visible directement dans les devtools (Inspector) ! Sans ça, n'importe
 *     quel joueur peut révéler la réponse en 2 clics.
 *   - **Ajoute `fill="white"`** sur la balise `<svg>` racine pour que le logo
 *     soit visible sur le fond sombre du Quiz CEO (simple-icons fournit les
 *     paths sans fill, donc ils héritent du noir par défaut).
 *
 * Idempotent : skip les fichiers déjà nettoyés.
 *
 * Lancer : `npm run cleanup:brand-logos` (ou `FORCE=1` pour re-traiter).
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const DIR = join(process.cwd(), 'public', 'brand-logos');
const FORCE = process.env.FORCE === '1';

interface Result {
  file: string;
  status: 'cleaned' | 'skipped' | 'failed';
  error?: string;
}

async function cleanOne(file: string): Promise<Result> {
  const path = join(DIR, file);
  try {
    const original = await readFile(path, 'utf8');
    const hasTitle = /<title\b[^>]*>[^<]*<\/title>/i.test(original);
    const hasWhiteFill = /<svg\b[^>]*fill\s*=\s*"white"/i.test(original);
    if (!FORCE && !hasTitle && hasWhiteFill) {
      return { file, status: 'skipped' };
    }

    let svg = original;
    // 1. Strip `<title>...</title>` — anti-spoiler.
    svg = svg.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '');
    // 2. Inject `fill="white"` sur le `<svg>` root (idempotent : ne pas dupliquer).
    if (!/<svg\b[^>]*\bfill\s*=/i.test(svg)) {
      svg = svg.replace(/<svg\b/i, '<svg fill="white"');
    } else {
      // Cas rare : un `fill` existe déjà — on le force à white.
      svg = svg.replace(
        /(<svg\b[^>]*?)\bfill\s*=\s*"[^"]*"/i,
        '$1fill="white"',
      );
    }

    if (svg === original) {
      return { file, status: 'skipped' };
    }
    await writeFile(path, svg, 'utf8');
    return { file, status: 'cleaned' };
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
  console.log(
    `→ ${files.length} SVG à traiter dans ${DIR}${FORCE ? ' (FORCE)' : ''}`,
  );

  const results: Result[] = [];
  for (const f of files) {
    const r = await cleanOne(f);
    results.push(r);
    const tag =
      r.status === 'cleaned' ? '✓' : r.status === 'skipped' ? '·' : '✗';
    if (r.status !== 'skipped') {
      // eslint-disable-next-line no-console
      console.log(
        `${tag} ${f.padEnd(28)} ${r.status}${r.error ? ` (${r.error})` : ''}`,
      );
    }
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
