/**
 * Liste curée des joueurs LoL pour la catégorie Quiz CEO `lol-player-match`.
 *
 * Pour chaque joueur :
 *   - `riotId` : Riot ID complet (`Pseudo#Tag`) — saisi par l'utilisateur
 *   - `displayName` : nom canonique affiché en réponse (sans le tag)
 *   - `region` : routing macroregion pour Riot Match v5 API
 *
 * À étendre via le script `scripts/download-lol-match-history.ts` qui
 * résout chaque Riot ID en PUUID puis tire 50 matches récents par joueur.
 *
 * Ajouter un joueur : ajouter une entrée + relancer le script.
 */

export type RiotMacroRegion = 'europe' | 'americas' | 'asia' | 'sea';

export interface LolPlayerSeed {
  /** Riot ID complet (ex: "Faker#KR1"). */
  riotId: string;
  /** Nom canonique affiché en réponse (sans le tag). */
  displayName: string;
  /** Macroregion pour les endpoints Match v5 et Account v1. */
  region: RiotMacroRegion;
}

export const LOL_PLAYERS: readonly LolPlayerSeed[] = [
  { riotId: 'Poetic Lover#987', displayName: 'Poetic Lover', region: 'europe' },
  { riotId: 'KiRu4#31501', displayName: 'KiRu4', region: 'europe' },
  { riotId: 'Yunaae#EUW', displayName: 'Yunaae', region: 'europe' },
  { riotId: 'Tlz1#EUW', displayName: 'Tlz1', region: 'europe' },
  { riotId: 'Swag Bobby Joe#EUW', displayName: 'Swag Bobby Joe', region: 'europe' },
  { riotId: 'YouY0µ#EUW', displayName: 'YouY0µ', region: 'europe' },
  { riotId: 'Khaina#EUW', displayName: 'Khaina', region: 'europe' },
  { riotId: 'Rochel#9595', displayName: 'Rochel', region: 'europe' },
  { riotId: 'Al4r1c#EUW', displayName: 'Al4r1c', region: 'europe' },
  { riotId: 'Al4r0x#EUW', displayName: 'Al4r0x', region: 'europe' },
  { riotId: 'Eik1ch1#EUW', displayName: 'Eik1ch1', region: 'europe' },
  { riotId: 'Quantique#EUW', displayName: 'Quantique', region: 'europe' },
  { riotId: 'Slim Natsu#EUW', displayName: 'Slim Natsu', region: 'europe' },
];
