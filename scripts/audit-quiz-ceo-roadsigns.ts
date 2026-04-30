/* eslint-disable no-console */
/**
 * Audit + auto-fix des URLs d'images des panneaux de signalisation
 * (`panneau-signalisation`) du Quiz CEO.
 *
 * Même problème que `bouffe-internationale` (cf. audit-quiz-ceo-food-images.ts) :
 *   - URLs `Special:FilePath` rate-limitées (HTTP 429 sous charge)
 *   - Certains fichiers ont peut-être disparu (mauvais nom, suppression Wikimedia)
 *
 * Stratégie :
 *   1. Pour chaque entrée, résout l'URL actuelle en `upload.wikimedia.org`
 *      direct (CDN, pas de rate-limit) via Commons `imageinfo` API.
 *   2. Si le fichier n'existe plus, log + propose une recherche manuelle
 *      via Commons search (namespace=File, srsearch=`France_road_sign_<code>`).
 *
 * Lancement :
 *   npx tsx scripts/audit-quiz-ceo-roadsigns.ts            # dry-run
 *   npx tsx scripts/audit-quiz-ceo-roadsigns.ts --write    # patche le fichier
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ROAD_SIGNS } from '../lib/quizCeo/roadSigns';

const UA = 'lol-missions-quiz/1.0 (contact@lol-missions.local)';
const WRITE = process.argv.includes('--write');

interface CommonsSearchHit {
  title: string;
}
interface ImageInfo {
  thumburl?: string;
  url?: string;
}

function extractFilename(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.pathname.startsWith('/wiki/Special:FilePath/')) {
      const fn = u.pathname.replace('/wiki/Special:FilePath/', '');
      return decodeURIComponent(fn);
    }
    const m = u.pathname.match(/\/commons(?:\/thumb)?\/[a-f0-9]\/[a-f0-9]{2}\/([^/]+)/);
    if (m) return decodeURIComponent(m[1]);
    return null;
  } catch {
    return null;
  }
}

async function resolveDirect(filename: string, width = 300): Promise<string | null> {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent('File:' + filename)}&prop=imageinfo&iiprop=url&iiurlwidth=${width}&origin=*`;
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      query?: { pages?: Record<string, { imageinfo?: ImageInfo[]; missing?: '' }> };
    };
    const pages = data.query?.pages ?? {};
    const page = Object.values(pages)[0];
    if (!page || page.missing !== undefined) return null;
    return page.imageinfo?.[0]?.thumburl ?? page.imageinfo?.[0]?.url ?? null;
  } catch {
    return null;
  }
}

async function findReplacement(query: string): Promise<string | null> {
  const search = await fetch(
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srsearch=${encodeURIComponent(query)}&srlimit=5&origin=*`,
    { headers: { 'User-Agent': UA } },
  );
  if (!search.ok) return null;
  const data = (await search.json()) as { query?: { search?: CommonsSearchHit[] } };
  const hits = data.query?.search ?? [];
  for (const h of hits) {
    const filename = h.title.replace(/^File:/, '');
    if (!/\.(svg|jpe?g|png|webp)$/i.test(filename)) continue;
    const direct = await resolveDirect(filename);
    if (direct) return direct;
    await new Promise((r) => setTimeout(r, 200));
  }
  return null;
}

async function main() {
  console.log(`Audit de ${ROAD_SIGNS.length} panneaux...\n`);

  const replacements = new Map<string, string>();
  const notFound: string[] = [];

  for (let i = 0; i < ROAD_SIGNS.length; i++) {
    const s = ROAD_SIGNS[i];
    process.stdout.write(`[${i}] ${s.code}... `);

    let direct: string | null = null;
    const filename = extractFilename(s.imageUrl);
    if (filename) {
      direct = await resolveDirect(filename);
    }
    if (!direct) {
      // Tente search par code (ex. "France_road_sign_A2a").
      direct = await findReplacement(`France_road_sign_${s.code}`);
    }

    if (direct) {
      replacements.set(s.code, direct);
      console.log('✓');
    } else {
      notFound.push(s.code);
      console.log('AUCUN');
    }
    await new Promise((r) => setTimeout(r, 150));
  }

  console.log(`\nRésumé : ${replacements.size} résolus, ${notFound.length} sans solution.\n`);

  if (!WRITE) {
    console.log('--- Patches (lance avec --write pour appliquer) ---\n');
    for (const [code, url] of replacements) {
      console.log(`${code}\n  → ${url}\n`);
    }
    if (notFound.length > 0) {
      console.log('À corriger MANUELLEMENT :');
      for (const c of notFound) console.log(`  - ${c}`);
    }
    return;
  }

  // Mode --write : patch le fichier roadSigns.ts.
  const filePath = path.join(process.cwd(), 'lib', 'quizCeo', 'roadSigns.ts');
  let content = await readFile(filePath, 'utf-8');
  let patched = 0;
  for (const [code, url] of replacements) {
    // Cherche `code: 'X'` puis remplace l'imageUrl qui suit.
    const re = new RegExp(
      `(code:\\s*['"]${code.replace(/[.*+?^${}()|[\\\]]/g, '\\$&')}['"]\\s*,\\s*imageUrl:\\s*['"])([^'"]+)(['"])`,
      'g',
    );
    const before = content;
    content = content.replace(re, `$1${url}$3`);
    if (content !== before) patched++;
  }
  await writeFile(filePath, content, 'utf-8');
  console.log(`Patché : ${patched} entrées dans ${filePath}`);
  if (notFound.length > 0) {
    console.log('À corriger MANUELLEMENT (laissé inchangé) :');
    for (const c of notFound) console.log(`  - ${c}`);
  }
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
