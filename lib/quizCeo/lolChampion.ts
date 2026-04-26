/**
 * Helper runtime pour la question Quiz CEO `lol-champion`.
 *
 * À chaque tirage, on pioche un champion au hasard parmi les 172 du catalogue
 * `LOL_CHAMPIONS`, puis on choisit aléatoirement entre 2 modes :
 *
 *   - `splash`  → splash art 1280×720 JPEG avec filtre CSS « Contours »
 *                 (invert + grayscale + contrast) appliqué côté client.
 *                 Asset : `public/lol-champions/<id>.jpg` (téléchargé via
 *                 `npx tsx scripts/download-lol-champions.ts`).
 *
 *   - `spells`  → ligne de 5 icônes Q · W · E · R · Passif (PNG 64×64
 *                 transparent). Asset : `public/lol-champion-spells/<id>/<slot>.png`
 *                 (téléchargé via `npx tsx scripts/download-lol-champion-spells.ts`).
 *
 * Côté UI : `QuestionPlayer.tsx` narrow `payload.mode` pour rendre le bon
 * affichage. La validation est manuelle par le créateur en review (comme
 * `brand-logo` et `worldle`) — l'answer expose juste `text: champion.name`.
 */

import { LOL_CHAMPIONS, type LolChampion } from './lolChampions';

export type LolChampionMode = 'splash' | 'spells';

export interface LolSplashPayload {
  mode: 'splash';
  imageUrl: string;
}

export interface LolSpellsPayload {
  mode: 'spells';
  iconUrls: { q: string; w: string; e: string; r: string; p: string };
}

export type LolChampionPayload = LolSplashPayload | LolSpellsPayload;

/** Filtre CSS « Contours » appliqué au splash en mode silhouette. */
export const LOL_CONTOURS_FILTER =
  'invert(1) grayscale(1) contrast(2.2) brightness(1.1)';

export function pickRandomChampion(): LolChampion {
  return LOL_CHAMPIONS[Math.floor(Math.random() * LOL_CHAMPIONS.length)];
}

export function pickRandomMode(): LolChampionMode {
  return Math.random() < 0.5 ? 'splash' : 'spells';
}

export function buildLolPayload(
  champion: LolChampion,
  mode: LolChampionMode,
): LolChampionPayload {
  if (mode === 'splash') {
    return {
      mode: 'splash',
      imageUrl: `/lol-champions/${champion.id}.jpg`,
    };
  }
  const base = `/lol-champion-spells/${champion.id}`;
  return {
    mode: 'spells',
    iconUrls: {
      q: `${base}/q.png`,
      w: `${base}/w.png`,
      e: `${base}/e.png`,
      r: `${base}/r.png`,
      p: `${base}/p.png`,
    },
  };
}
