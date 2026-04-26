/**
 * Télécharge les icônes de sorts (Q/W/E/R) + passif de chaque champion LoL
 * depuis Data Dragon. PNG 64×64 alpha, ~3-5 KB chacun.
 *
 * Sortie : `public/lol-champion-spells/<champion-slug>/{q,w,e,r,p}.png`
 *          `lib/quizCeo/lolChampionSpells.ts` (catalogue typé généré)
 *
 * Lancer : `npx tsx scripts/download-lol-champion-spells.ts`
 *
 * Idempotent : skip les fichiers déjà présents (--force pour re-DL).
 */

import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const FORCE = process.argv.includes('--force');
const OUT_DIR = join(process.cwd(), 'public', 'lol-champion-spells');
const LIB_OUT = join(process.cwd(), 'lib', 'quizCeo', 'lolChampionSpells.ts');

interface ChampionListEntry {
  id: string;
  key: string;
  name: string;
  title: string;
}

interface ChampionListJson {
  data: Record<string, ChampionListEntry>;
}

interface SpellEntry {
  id: string;
  name: string;
  description: string;
  image: { full: string };
}

interface ChampionDetailJson {
  data: Record<
    string,
    {
      id: string;
      name: string;
      title: string;
      passive: { name: string; description: string; image: { full: string } };
      spells: SpellEntry[];
    }
  >;
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

interface ChampionSpellsMeta {
  championId: string;
  championName: string;
  championTitle: string;
  passiveName: string;
  spellNames: { q: string; w: string; e: string; r: string };
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  console.log('[lol-spells] fetching latest version...');
  const versions = await fetchJson<string[]>(
    'https://ddragon.leagueoflegends.com/api/versions.json',
  );
  const version = versions[0];
  console.log(`[lol-spells] latest = ${version}`);

  console.log('[lol-spells] fetching champion list (fr_FR)...');
  const champListJson = await fetchJson<ChampionListJson>(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion.json`,
  );
  const champions = Object.values(champListJson.data).sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  console.log(`[lol-spells] ${champions.length} champions`);

  const meta: ChampionSpellsMeta[] = [];
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const c of champions) {
    const slug = c.id.toLowerCase();
    const champDir = join(OUT_DIR, slug);
    mkdirSync(champDir, { recursive: true });

    try {
      const detail = await fetchJson<ChampionDetailJson>(
        `https://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion/${c.id}.json`,
      );
      const champData = detail.data[c.id];
      if (!champData) {
        console.warn(`  [SKIP] ${c.id} : pas de data`);
        failed++;
        continue;
      }

      const slots: Array<['q' | 'w' | 'e' | 'r' | 'p', string, string]> = [
        ['q', champData.spells[0].image.full, 'spell'],
        ['w', champData.spells[1].image.full, 'spell'],
        ['e', champData.spells[2].image.full, 'spell'],
        ['r', champData.spells[3].image.full, 'spell'],
        ['p', champData.passive.image.full, 'passive'],
      ];

      for (const [slot, filename, kind] of slots) {
        const out = join(champDir, `${slot}.png`);
        if (existsSync(out) && !FORCE) {
          skipped++;
          continue;
        }
        const url =
          kind === 'spell'
            ? `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${filename}`
            : `https://ddragon.leagueoflegends.com/cdn/${version}/img/passive/${filename}`;
        await downloadBinary(url, out);
        downloaded++;
      }

      meta.push({
        championId: slug,
        championName: champData.name,
        championTitle: champData.title,
        passiveName: champData.passive.name,
        spellNames: {
          q: champData.spells[0].name,
          w: champData.spells[1].name,
          e: champData.spells[2].name,
          r: champData.spells[3].name,
        },
      });

      if (meta.length % 10 === 0) {
        console.log(`  [${meta.length}] ${c.id}`);
      }
    } catch (err) {
      failed++;
      console.warn(`  [FAIL] ${c.id} → ${(err as Error).message}`);
    }
  }

  console.log(
    `[lol-spells] downloaded=${downloaded} skipped=${skipped} failed=${failed} catalog=${meta.length}`,
  );

  // Génère le module `lib/quizCeo/lolChampionSpells.ts`.
  const entries = meta
    .map(
      (m) =>
        `  {
    championId: ${JSON.stringify(m.championId)},
    championName: ${JSON.stringify(m.championName)},
    championTitle: ${JSON.stringify(m.championTitle)},
    passiveName: ${JSON.stringify(m.passiveName)},
    spellNames: {
      q: ${JSON.stringify(m.spellNames.q)},
      w: ${JSON.stringify(m.spellNames.w)},
      e: ${JSON.stringify(m.spellNames.e)},
      r: ${JSON.stringify(m.spellNames.r)},
    },
  },`,
    )
    .join('\n');

  const libContent = `/**
 * Catalogue des icônes de sorts (Q/W/E/R + passif) des champions LoL pour
 * le Quiz du CEO — catégorie « devine le champion à partir de ses sorts ».
 * Généré par \`scripts/download-lol-champion-spells.ts\` — ne pas éditer.
 *
 * Source : Riot Data Dragon (champion/<Id>.json fr_FR + img/spell + img/passive).
 * Les icônes sont sous \`public/lol-champion-spells/<championId>/{q,w,e,r,p}.png\`
 * (PNG 64×64 transparent, ~3-5 KB chacune).
 */

export interface LolChampionSpells {
  /** Slug minuscule = nom de dossier. ex: "aatrox" */
  championId: string;
  /** Nom officiel FR. ex: "Aatrox" */
  championName: string;
  /** Titre du champion. ex: "Épée des Darkin" */
  championTitle: string;
  /** Nom du passif. */
  passiveName: string;
  /** Noms des 4 sorts dans l'ordre Q/W/E/R. */
  spellNames: { q: string; w: string; e: string; r: string };
}

export const LOL_CHAMPION_SPELLS: readonly LolChampionSpells[] = [
${entries}
];

export const LOL_CHAMPION_SPELLS_BY_ID: Readonly<
  Record<string, LolChampionSpells>
> = Object.fromEntries(LOL_CHAMPION_SPELLS.map((c) => [c.championId, c]));
`;

  writeFileSync(LIB_OUT, libContent, 'utf8');
  console.log(`[lol-spells] wrote ${LIB_OUT} (${meta.length} entries)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
