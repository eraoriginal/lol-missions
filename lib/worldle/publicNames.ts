/**
 * Liste publique des pays Worldle pour l'autocomplete client. Aucun secret :
 * juste { id, name, aliases }. Les coordonnées (lat/lng) restent server-only
 * (cf. `lib/worldle/server.ts`) pour empêcher le client de calculer
 * `pickByDay(COUNTRIES)` et révéler la cible du jour.
 *
 * Doit rester en sync avec `COUNTRIES` côté serveur (mêmes ids, mêmes noms).
 * Si on ajoute un pays, le mettre dans les 2 fichiers.
 */

export interface WorldlePublicCountry {
  id: string;
  name: string;
  aliases: string[];
}

export const WORLDLE_PUBLIC_COUNTRIES: WorldlePublicCountry[] = [
  { id: 'fr', name: 'France', aliases: ['France'] },
  { id: 'it', name: 'Italie', aliases: ['Italy', 'Italia'] },
  { id: 'de', name: 'Allemagne', aliases: ['Germany', 'Deutschland'] },
  { id: 'es', name: 'Espagne', aliases: ['Spain', 'España'] },
  { id: 'gb', name: 'Royaume-Uni', aliases: ['United Kingdom', 'UK', 'Angleterre', 'England'] },
  { id: 'pt', name: 'Portugal', aliases: [] },
  { id: 'nl', name: 'Pays-Bas', aliases: ['Netherlands', 'Holland'] },
  { id: 'be', name: 'Belgique', aliases: ['Belgium'] },
  { id: 'ch', name: 'Suisse', aliases: ['Switzerland', 'Schweiz'] },
  { id: 'at', name: 'Autriche', aliases: ['Austria', 'Österreich'] },
  { id: 'pl', name: 'Pologne', aliases: ['Poland', 'Polska'] },
  { id: 'gr', name: 'Grèce', aliases: ['Greece', 'Grece'] },
  { id: 'tr', name: 'Turquie', aliases: ['Turkey', 'Türkiye'] },
  { id: 'ru', name: 'Russie', aliases: ['Russia'] },
  { id: 'cn', name: 'Chine', aliases: ['China'] },
  { id: 'jp', name: 'Japon', aliases: ['Japan'] },
  { id: 'kr', name: 'Corée du Sud', aliases: ['South Korea', 'Korea', 'Corée'] },
  { id: 'in', name: 'Inde', aliases: ['India'] },
  { id: 'th', name: 'Thaïlande', aliases: ['Thailand', 'Thailande'] },
  { id: 'vn', name: 'Vietnam', aliases: [] },
  { id: 'id', name: 'Indonésie', aliases: ['Indonesia'] },
  { id: 'au', name: 'Australie', aliases: ['Australia'] },
  { id: 'nz', name: 'Nouvelle-Zélande', aliases: ['New Zealand'] },
  { id: 'us', name: 'États-Unis', aliases: ['United States', 'USA', 'Etats-Unis', 'America'] },
  { id: 'ca', name: 'Canada', aliases: [] },
  { id: 'mx', name: 'Mexique', aliases: ['Mexico'] },
  { id: 'br', name: 'Brésil', aliases: ['Brazil', 'Bresil'] },
  { id: 'ar', name: 'Argentine', aliases: ['Argentina'] },
  { id: 'cl', name: 'Chili', aliases: ['Chile'] },
  { id: 'pe', name: 'Pérou', aliases: ['Peru'] },
  { id: 've', name: 'Venezuela', aliases: [] },
  { id: 'co', name: 'Colombie', aliases: ['Colombia'] },
  { id: 'eg', name: 'Égypte', aliases: ['Egypt', 'Egypte'] },
  { id: 'ma', name: 'Maroc', aliases: ['Morocco'] },
  { id: 'dz', name: 'Algérie', aliases: ['Algeria', 'Algerie'] },
  { id: 'tn', name: 'Tunisie', aliases: ['Tunisia'] },
  { id: 'sn', name: 'Sénégal', aliases: ['Senegal'] },
  { id: 'za', name: 'Afrique du Sud', aliases: ['South Africa'] },
  { id: 'ng', name: 'Nigéria', aliases: ['Nigeria'] },
  { id: 'ke', name: 'Kenya', aliases: [] },
  { id: 'is', name: 'Islande', aliases: ['Iceland'] },
  { id: 'ie', name: 'Irlande', aliases: ['Ireland'] },
  { id: 'cu', name: 'Cuba', aliases: [] },
  { id: 'dk', name: 'Danemark', aliases: ['Denmark'] },
  { id: 'ua', name: 'Ukraine', aliases: [] },
];

/** Flèche unicode correspondant à un bearing. 8 points cardinaux. */
export function arrowForBearing(deg: number): string {
  const normalized = ((deg % 360) + 360) % 360;
  const idx = Math.round(normalized / 45) % 8;
  return ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'][idx];
}
