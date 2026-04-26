/**
 * Télécharge les assets LoL nécessaires pour rendre une carte de match
 * (catégorie `lol-player-match` du Quiz CEO) :
 *
 *   - Items (~250 icônes 64×64 PNG)        → public/lol-items/<id>.png
 *   - Summoner spells (~12 icônes)         → public/lol-summoner-spells/<id>.png
 *   - Perk styles (5 arbres de runes)      → public/lol-perk-styles/<id>.png
 *
 * Source : Data Dragon (Riot CDN public, pas de clé). Idempotent (`--force`
 * pour re-DL).
 *
 * Lancer : `npx tsx scripts/download-lol-match-assets.ts`
 *
 * Note : les icônes de champions sont déjà téléchargées par
 * `download-lol-champions.ts` (splash arts) — pour la MatchCard on a besoin
 * de l'icône carrée 120×120 que Data Dragon expose à
 * `cdn/<version>/img/champion/<Name>.png`. On les télécharge aussi ici car
 * `lol-champions/<id>.jpg` (splash) n'est pas adapté à un avatar carré
 * dans une carte de match.
 */

import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const FORCE = process.argv.includes('--force');
const PUBLIC_DIR = join(process.cwd(), 'public');

interface DDragonItem {
  name: string;
  // ... beaucoup d'autres champs ignorés
}
interface DDragonItemJson {
  data: Record<string, DDragonItem>;
}

interface DDragonSummonerSpell {
  id: string; // ex: "SummonerFlash"
  key: string; // ex: "4"
  name: string;
  image: { full: string };
}
interface DDragonSummonerJson {
  data: Record<string, DDragonSummonerSpell>;
}

interface DDragonChampion {
  id: string;
  name: string;
  image: { full: string };
}
interface DDragonChampionListJson {
  data: Record<string, DDragonChampion>;
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
  console.log('[lol-match-assets] fetching latest Data Dragon version...');
  const versions = await fetchJson<string[]>(
    'https://ddragon.leagueoflegends.com/api/versions.json',
  );
  const version = versions[0];
  console.log(`[lol-match-assets] version = ${version}`);

  // ============ Items ============
  const itemsDir = join(PUBLIC_DIR, 'lol-items');
  mkdirSync(itemsDir, { recursive: true });
  const itemJson = await fetchJson<DDragonItemJson>(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/item.json`,
  );
  const itemIds = Object.keys(itemJson.data);
  console.log(`[lol-match-assets] ${itemIds.length} items à DL`);
  let itemsDl = 0;
  let itemsSkipped = 0;
  let itemsFailed = 0;
  for (const id of itemIds) {
    const out = join(itemsDir, `${id}.png`);
    if (existsSync(out) && !FORCE) {
      itemsSkipped++;
      continue;
    }
    try {
      await downloadBinary(
        `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`,
        out,
      );
      itemsDl++;
      if (itemsDl % 50 === 0) console.log(`  items: ${itemsDl}/${itemIds.length}`);
    } catch (err) {
      itemsFailed++;
      console.warn(`  [FAIL] item ${id}: ${(err as Error).message}`);
    }
  }
  console.log(
    `[lol-match-assets] items: dl=${itemsDl} skipped=${itemsSkipped} failed=${itemsFailed}`,
  );

  // ============ Summoner spells ============
  const spellsDir = join(PUBLIC_DIR, 'lol-summoner-spells');
  mkdirSync(spellsDir, { recursive: true });
  const spellJson = await fetchJson<DDragonSummonerJson>(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/summoner.json`,
  );
  const spells = Object.values(spellJson.data);
  console.log(`[lol-match-assets] ${spells.length} summoner spells à DL`);
  let spellsDl = 0;
  for (const s of spells) {
    const out = join(spellsDir, `${s.key}.png`);
    if (existsSync(out) && !FORCE) continue;
    try {
      await downloadBinary(
        `https://ddragon.leagueoflegends.com/cdn/${version}/img/spell/${s.image.full}`,
        out,
      );
      spellsDl++;
    } catch (err) {
      console.warn(`  [FAIL] spell ${s.id}: ${(err as Error).message}`);
    }
  }
  console.log(`[lol-match-assets] summoner spells: dl=${spellsDl}`);

  // ============ Perk styles (arbres de runes) ============
  // Data Dragon expose les styles via /cdn/img/perk-images/Styles/<style>.png
  // mais le mieux est de passer par community-dragon qui a tout proprement.
  // On utilise la liste "perk-styles" hardcodée (5 arbres principaux).
  const perksDir = join(PUBLIC_DIR, 'lol-perk-styles');
  mkdirSync(perksDir, { recursive: true });
  const styles = [
    { id: 8000, slug: '7201_Precision' },
    { id: 8100, slug: '7200_Domination' },
    { id: 8200, slug: '7202_Sorcery' },
    { id: 8300, slug: '7203_Whimsy' }, // Inspiration
    { id: 8400, slug: '7204_Resolve' },
  ];
  let perksDl = 0;
  for (const s of styles) {
    const out = join(perksDir, `${s.id}.png`);
    if (existsSync(out) && !FORCE) continue;
    try {
      await downloadBinary(
        `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/perk-images/styles/${s.slug.toLowerCase()}.png`,
        out,
      );
      perksDl++;
    } catch (err) {
      console.warn(`  [FAIL] perk style ${s.id}: ${(err as Error).message}`);
    }
  }
  console.log(`[lol-match-assets] perk styles: dl=${perksDl}`);

  // ============ Icônes de champions (carrées 120x120) ============
  // /lol-champions/ contient déjà des splash arts JPEG 1280x720. Pour les
  // MatchCards on a besoin du portrait carré natif (avatar).
  const portraitsDir = join(PUBLIC_DIR, 'lol-champion-portraits');
  mkdirSync(portraitsDir, { recursive: true });
  const champJson = await fetchJson<DDragonChampionListJson>(
    `https://ddragon.leagueoflegends.com/cdn/${version}/data/fr_FR/champion.json`,
  );
  const champs = Object.values(champJson.data);
  console.log(`[lol-match-assets] ${champs.length} portraits champions à DL`);
  let portraitsDl = 0;
  for (const c of champs) {
    const out = join(portraitsDir, `${c.id.toLowerCase()}.png`);
    if (existsSync(out) && !FORCE) continue;
    try {
      await downloadBinary(
        `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${c.image.full}`,
        out,
      );
      portraitsDl++;
    } catch (err) {
      console.warn(`  [FAIL] portrait ${c.id}: ${(err as Error).message}`);
    }
  }
  console.log(`[lol-match-assets] portraits: dl=${portraitsDl}`);

  console.log(`\n[lol-match-assets] ✓ done. version=${version}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
