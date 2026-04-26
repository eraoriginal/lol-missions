/**
 * Télécharge les splash arts centrés des champions LoL depuis Community Dragon
 * (proxy public Riot, sans clé). 1 fichier JPG par champion sous
 * `public/lol-champions/<id>.jpg` (~80-150 KB chacun, ~170 champions).
 *
 * Génère aussi `lib/quizCeo/lolChampions.ts` avec la liste { id, name } pour
 * pouvoir être consommée par le seed et le runtime du Quiz du CEO.
 *
 * Lancer : `npx tsx scripts/download-lol-champions.ts`
 *
 * Idempotent : skip les fichiers déjà présents (--force pour re-DL).
 */

import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const FORCE = process.argv.includes('--force');
const OUT_DIR = join(process.cwd(), 'public', 'lol-champions');
const LIB_OUT = join(process.cwd(), 'lib', 'quizCeo', 'lolChampions.ts');

interface ChampionEntry {
  id: string; // ex: "Aatrox" (PascalCase ddragon id)
  key: string; // ex: "266" (numeric)
  name: string; // ex: "Aatrox" (FR)
  title: string;
}

interface ChampionJson {
  data: Record<string, ChampionEntry>;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return (await res.json()) as T;
}

async function downloadBinary(url: string, out: string): Promise<number> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(out, buf);
  return buf.length;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  console.log('[lol-champions] fetching latest version...');
  const versions = await fetchJson<string[]>(
    'https://ddragon.leagueoflegends.com/api/versions.json',
  );
  const version = versions[0];
  console.log(`[lol-champions] latest = ${version}`);

  console.log('[lol-champions] fetching champion list (fr_FR)...');
  const champJson = await fetchJson<ChampionJson>(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion.json`,
  );
  const champions = Object.values(champJson.data).sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  console.log(`[lol-champions] ${champions.length} champions`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  const ok: ChampionEntry[] = [];

  for (const c of champions) {
    const slug = c.id.toLowerCase();
    const out = join(OUT_DIR, `${slug}.jpg`);
    if (existsSync(out) && !FORCE) {
      skipped++;
      ok.push(c);
      continue;
    }
    const url = `https://cdn.communitydragon.org/latest/champion/${slug}/splash-art/centered`;
    try {
      const size = await downloadBinary(url, out);
      downloaded++;
      ok.push(c);
      if (downloaded % 10 === 0) {
        console.log(`  [${downloaded}] ${c.id} (${(size / 1024).toFixed(1)} KB)`);
      }
    } catch (err) {
      failed++;
      console.warn(`  [FAIL] ${c.id} → ${(err as Error).message}`);
    }
  }

  console.log(
    `[lol-champions] downloaded=${downloaded} skipped=${skipped} failed=${failed}`,
  );

  // Génère le module `lib/quizCeo/lolChampions.ts`.
  const entries = ok
    .map(
      (c) =>
        `  { id: ${JSON.stringify(c.id.toLowerCase())}, name: ${JSON.stringify(c.name)}, title: ${JSON.stringify(c.title)} },`,
    )
    .join('\n');

  const libContent = `/**
 * Catalogue des champions LoL pour le Quiz du CEO.
 * Généré par \`scripts/download-lol-champions.ts\` — ne pas éditer à la main.
 *
 * Source : Riot Data Dragon (champion.json fr_FR) + Community Dragon (splash arts).
 * Les images sont sous \`public/lol-champions/<id>.jpg\` (1280x720 JPEG).
 */

export interface LolChampion {
  /** Slug minuscule = nom de fichier sans extension. ex: "aatrox" */
  id: string;
  /** Nom officiel FR. ex: "Aatrox" */
  name: string;
  /** Titre du champion. ex: "Épée des Darkin" */
  title: string;
}

export const LOL_CHAMPIONS: readonly LolChampion[] = [
${entries}
];

export const LOL_CHAMPION_BY_ID: Readonly<Record<string, LolChampion>> =
  Object.fromEntries(LOL_CHAMPIONS.map((c) => [c.id, c]));
`;

  writeFileSync(LIB_OUT, libContent, 'utf8');
  console.log(`[lol-champions] wrote ${LIB_OUT} (${ok.length} entries)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
