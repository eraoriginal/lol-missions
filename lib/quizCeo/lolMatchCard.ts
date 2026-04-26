/**
 * Types et helpers pour la catégorie Quiz CEO `lol-player-match`.
 *
 * Cette catégorie présente une carte de match LoL (champion, KDA, items,
 * stats…) et le joueur doit deviner qui a joué cette partie. Cible :
 * pros / streamers reconnaissables à leur signature de jeu.
 *
 * Source des données : Riot Match v5 API (clé Dev gratuite). Le pipeline de
 * DL est dans `scripts/download-lol-match-history.ts` (à venir).
 *
 * Source des assets : Data Dragon (CDN public sans clé) — déjà téléchargés
 * via `scripts/download-lol-match-assets.ts` :
 *   - `public/lol-items/<id>.png`
 *   - `public/lol-summoner-spells/<id>.png` (id = numérique, ex 4 = Flash)
 *   - `public/lol-perk-styles/<id>.png` (id = 8000, 8100, etc.)
 *   - `public/lol-champion-portraits/<champId-lower>.png`
 */

/** Données minimales pour rendre une MatchCard. */
export interface LolMatchCardData {
  /** Slug du champion (lowercase, ex: "ahri", "leesin"). */
  championId: string;
  /** Nom officiel FR (ex: "Ahri"). */
  championName: string;
  /** Position jouée. Optionnel. */
  position?: 'TOP' | 'JUNGLE' | 'MIDDLE' | 'BOTTOM' | 'UTILITY' | 'NONE';
  /** Kills / Deaths / Assists. */
  kills: number;
  deaths: number;
  assists: number;
  /** 7 items (0-6). 0 si vide. item6 = trinket. */
  items: [number, number, number, number, number, number, number];
  /** IDs des 2 summoner spells (ex: 4=Flash, 14=Ignite). */
  summonerSpells: [number, number];
  /** ID du keystone (perk principal, ex: 8005, 8230…). 0 si inconnu. */
  keystone: number;
  /** ID du style secondaire (perk style, ex: 8000, 8100…). 0 si inconnu. */
  secondaryStyle: number;
  /** Total minions killed (CS). */
  cs: number;
  /** Kill participation (0 à 1). */
  killParticipation: number;
  /** Durée du match en secondes. */
  durationSec: number;
  /** Victoire ou défaite. */
  win: boolean;
}

/** Path vers un PNG d'icône d'item depuis le slug numérique Riot. */
export function getItemIconPath(itemId: number): string {
  if (itemId <= 0) return '';
  return `/lol-items/${itemId}.png`;
}

/** Path vers un PNG d'icône de summoner spell depuis sa clé numérique. */
export function getSummonerSpellPath(spellKey: number): string {
  if (spellKey <= 0) return '';
  return `/lol-summoner-spells/${spellKey}.png`;
}

/** Path vers un PNG de portrait champion (carré, depuis Data Dragon). */
export function getChampionPortraitPath(championId: string): string {
  return `/lol-champion-portraits/${championId.toLowerCase()}.png`;
}

/** Path vers un PNG d'arbre de perk style. */
export function getPerkStylePath(styleId: number): string {
  if (styleId <= 0) return '';
  return `/lol-perk-styles/${styleId}.png`;
}

/** Format KDA ratio (1 décimale, ou "Perfect" si deaths = 0). */
export function formatKDA(
  kills: number,
  deaths: number,
  assists: number,
): string {
  if (deaths === 0) return 'Perfect';
  return ((kills + assists) / deaths).toFixed(1);
}

/** Format CS/min depuis CS total + durée. */
export function formatCsPerMin(cs: number, durationSec: number): string {
  if (durationSec <= 0) return '0';
  const mins = durationSec / 60;
  return (cs / mins).toFixed(1);
}

/** Format durée mm:ss. */
export function formatDuration(durationSec: number): string {
  const m = Math.floor(durationSec / 60);
  const s = Math.floor(durationSec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Format kill participation en pourcentage entier. */
export function formatKp(kp: number): string {
  return `${Math.round(kp * 100)}%`;
}
