/**
 * Audit + auto-fix des URLs d'images de la catégorie `bouffe-internationale`
 * du Quiz CEO.
 *
 * 2 problèmes résolus en une passe :
 *   1. URL cassée (article Wikipedia supprimé / fichier renommé) →
 *      recherche un remplaçant via Commons search (namespace=File).
 *   2. Rate-limit `Special:FilePath` (HTTP 429 quand on tape Wikipedia
 *      via leur redirect MediaWiki — c'est ce qui cassait 70% des plats
 *      en jeu réel) → on résout chaque URL en URL `upload.wikimedia.org`
 *      directe (CDN, pas rate-limité) via l'API `imageinfo`.
 *
 * Pour chaque entrée, on tente d'abord la résolution `imageinfo` sur
 * l'URL actuelle ; si l'image n'existe plus, on tombe sur Commons search.
 *
 * Lancement :
 *   npx tsx scripts/audit-quiz-ceo-food-images.ts            # dry-run
 *   npx tsx scripts/audit-quiz-ceo-food-images.ts --write    # patche le fichier
 */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { INTERNATIONAL_FOODS } from '../lib/quizCeo/internationalFood';

const UA = 'lol-missions-quiz/1.0 (contact@lol-missions.local)';
const WRITE = process.argv.includes('--write');

interface CommonsSearchHit {
  title: string; // ex: "File:Tuna_nigiri_zushi.jpg"
}

interface ImageInfo {
  thumburl?: string;
  url?: string;
}

/**
 * Extrait le filename d'une URL Special:FilePath ou upload.wikimedia.org.
 * Returns null si l'URL n'est pas reconnue.
 */
function extractFilename(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.pathname.startsWith('/wiki/Special:FilePath/')) {
      const fn = u.pathname.replace('/wiki/Special:FilePath/', '');
      return decodeURIComponent(fn);
    }
    // upload.wikimedia.org/wikipedia/commons/<h1>/<h1h2>/<filename> ou
    // upload.wikimedia.org/wikipedia/commons/thumb/<h1>/<h1h2>/<filename>/<width>px-<filename>
    const m = u.pathname.match(/\/commons(?:\/thumb)?\/[a-f0-9]\/[a-f0-9]{2}\/([^/]+)/);
    if (m) return decodeURIComponent(m[1]);
    return null;
  } catch {
    return null;
  }
}

/**
 * Résout une URL Wikipedia/Commons en URL directe `upload.wikimedia.org`
 * via l'API `imageinfo` de Commons. Retourne `null` si le fichier
 * n'existe pas. C'est CRUCIAL : Special:FilePath redirect via MediaWiki
 * est rate-limité (HTTP 429 sous charge), alors que upload.wikimedia.org
 * est un CDN statique sans rate-limit.
 */
async function resolveDirect(filename: string, width = 500): Promise<string | null> {
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

/**
 * Cherche sur Commons (namespace File = 6) des images dont le titre matche
 * le nom du plat. Retourne la 1re URL `upload.wikimedia.org` directe
 * résolue par imageinfo.
 */
async function findReplacement(query: string): Promise<string | null> {
  const search = await fetch(
    `https://commons.wikimedia.org/w/api.php?action=query&format=json&list=search&srnamespace=6&srsearch=${encodeURIComponent(query)}&srlimit=10&origin=*`,
    { headers: { 'User-Agent': UA } },
  );
  if (!search.ok) return null;
  const data = (await search.json()) as { query?: { search?: CommonsSearchHit[] } };
  const hits = data.query?.search ?? [];
  for (const h of hits) {
    const filename = h.title.replace(/^File:/, '');
    if (!/\.(jpe?g|png|webp)$/i.test(filename)) continue;
    const direct = await resolveDirect(filename);
    if (direct) return direct;
    await new Promise((r) => setTimeout(r, 200));
  }
  return null;
}

async function main() {
  console.log(`Audit de ${INTERNATIONAL_FOODS.length} plats...\n`);

  // Pour chaque plat : résout en `upload.wikimedia.org` direct, soit depuis
  // l'URL existante (si toujours valide), soit via Commons search.
  const replacements = new Map<string, string>();
  const notFound: string[] = [];

  for (let i = 0; i < INTERNATIONAL_FOODS.length; i++) {
    const f = INTERNATIONAL_FOODS[i];
    process.stdout.write(`[${i}] ${f.name}... `);

    // 1. Tente de résoudre l'URL actuelle directement (extrait le filename
    //    et appelle imageinfo).
    let direct: string | null = null;
    const filename = extractFilename(f.imageUrl);
    if (filename) {
      direct = await resolveDirect(filename);
    }
    // 2. Sinon, search par nom du plat.
    if (!direct) {
      direct = await findReplacement(f.name);
    }

    if (direct) {
      replacements.set(f.name, direct);
      console.log('✓');
    } else {
      notFound.push(f.name);
      console.log('AUCUN');
    }
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\nRésumé : ${replacements.size} résolus, ${notFound.length} sans solution.\n`);

  if (!WRITE) {
    console.log('--- Patches (lance avec --write pour appliquer) ---\n');
    for (const [name, url] of replacements) {
      console.log(`${name}\n  → ${url}\n`);
    }
    if (notFound.length > 0) {
      console.log('À corriger MANUELLEMENT :');
      for (const n of notFound) console.log(`  - ${n}`);
    }
    return;
  }

  // Mode --write : patch le fichier internationalFood.ts.
  const filePath = path.join(process.cwd(), 'lib', 'quizCeo', 'internationalFood.ts');
  let content = await readFile(filePath, 'utf-8');
  let patched = 0;
  for (const [name, url] of replacements) {
    // Cherche la ligne contenant le name + remplace l'imageUrl.
    // Format : { name: 'X', imageUrl: 'OLD', ... }
    // Regex tolérante aux quotes simples / doubles dans le name.
    const re = new RegExp(
      `(name:\\s*['"]${name.replace(/[.*+?^${}()|[\\\]]/g, '\\$&')}['"]\\s*,\\s*imageUrl:\\s*['"])([^'"]+)(['"])`,
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
    for (const n of notFound) console.log(`  - ${n}`);
  }
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
