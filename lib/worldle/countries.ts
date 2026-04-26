/**
 * Catalogue de pays pour Worldle.
 *
 *   - `name`       : nom canonique en français (affiché en review, utilisé
 *                    pour la comparaison fuzzy).
 *   - `aliases`    : variantes acceptées (anglais, sans accents…).
 *   - `shapeFile`  : nom du fichier SVG sur Wikipedia. L'URL finale est
 *                    `Special:FilePath/<shapeFile>?width=400`.
 *   - `lat`, `lng` : centroïde approximatif (degrés décimaux) pour calcul
 *                    de distance Haversine + bearing.
 */

export interface WorldleCountry {
  id: string;
  name: string;
  aliases: string[];
  shapeFile: string;
  lat: number;
  lng: number;
}

export const COUNTRIES: WorldleCountry[] = [
  { id: 'fr', name: 'France', aliases: ['France'], shapeFile: 'France_(orthographic_projection).svg', lat: 46.6, lng: 2.2 },
  { id: 'it', name: 'Italie', aliases: ['Italy', 'Italia'], shapeFile: 'Italy_(orthographic_projection).svg', lat: 42.5, lng: 12.5 },
  { id: 'de', name: 'Allemagne', aliases: ['Germany', 'Deutschland'], shapeFile: 'Germany_(orthographic_projection).svg', lat: 51.0, lng: 10.0 },
  { id: 'es', name: 'Espagne', aliases: ['Spain', 'España'], shapeFile: 'Spain_(orthographic_projection).svg', lat: 40.0, lng: -4.0 },
  { id: 'gb', name: 'Royaume-Uni', aliases: ['United Kingdom', 'UK', 'Angleterre', 'England'], shapeFile: 'United_Kingdom_(orthographic_projection).svg', lat: 54.0, lng: -2.0 },
  { id: 'pt', name: 'Portugal', aliases: [], shapeFile: 'Portugal_(orthographic_projection).svg', lat: 39.5, lng: -8.0 },
  { id: 'nl', name: 'Pays-Bas', aliases: ['Netherlands', 'Holland'], shapeFile: 'Netherlands_(orthographic_projection).svg', lat: 52.1, lng: 5.3 },
  { id: 'be', name: 'Belgique', aliases: ['Belgium'], shapeFile: 'Belgium_(orthographic_projection).svg', lat: 50.5, lng: 4.5 },
  { id: 'ch', name: 'Suisse', aliases: ['Switzerland'], shapeFile: 'Switzerland_(orthographic_projection).svg', lat: 46.8, lng: 8.2 },
  { id: 'se', name: 'Suède', aliases: ['Sweden'], shapeFile: 'Sweden_(orthographic_projection).svg', lat: 62.0, lng: 15.0 },
  { id: 'no', name: 'Norvège', aliases: ['Norway'], shapeFile: 'Norway_(orthographic_projection).svg', lat: 62.0, lng: 10.0 },
  { id: 'fi', name: 'Finlande', aliases: ['Finland'], shapeFile: 'Finland_(orthographic_projection).svg', lat: 64.0, lng: 26.0 },
  { id: 'pl', name: 'Pologne', aliases: ['Poland'], shapeFile: 'Poland_(orthographic_projection).svg', lat: 52.0, lng: 19.0 },
  { id: 'gr', name: 'Grèce', aliases: ['Greece'], shapeFile: 'Greece_(orthographic_projection).svg', lat: 39.0, lng: 22.0 },
  { id: 'tr', name: 'Turquie', aliases: ['Turkey'], shapeFile: 'Turkey_(orthographic_projection).svg', lat: 39.0, lng: 35.0 },
  { id: 'ru', name: 'Russie', aliases: ['Russia'], shapeFile: 'Russia_(orthographic_projection).svg', lat: 60.0, lng: 100.0 },
  { id: 'us', name: 'États-Unis', aliases: ['United States', 'USA', 'US', 'Etats-Unis'], shapeFile: 'United_States_(orthographic_projection).svg', lat: 39.0, lng: -98.0 },
  { id: 'ca', name: 'Canada', aliases: [], shapeFile: 'Canada_(orthographic_projection).svg', lat: 56.0, lng: -106.0 },
  { id: 'mx', name: 'Mexique', aliases: ['Mexico'], shapeFile: 'Mexico_(orthographic_projection).svg', lat: 23.0, lng: -102.0 },
  { id: 'br', name: 'Brésil', aliases: ['Brazil'], shapeFile: 'Brazil_(orthographic_projection).svg', lat: -10.0, lng: -55.0 },
  { id: 'ar', name: 'Argentine', aliases: ['Argentina'], shapeFile: 'Argentina_(orthographic_projection).svg', lat: -38.0, lng: -63.0 },
  { id: 'cl', name: 'Chili', aliases: ['Chile'], shapeFile: 'Chile_(orthographic_projection).svg', lat: -36.0, lng: -72.0 },
  { id: 'pe', name: 'Pérou', aliases: ['Peru'], shapeFile: 'Peru_(orthographic_projection).svg', lat: -10.0, lng: -76.0 },
  { id: 'co', name: 'Colombie', aliases: ['Colombia'], shapeFile: 'Colombia_(orthographic_projection).svg', lat: 4.0, lng: -73.0 },
  { id: 'jp', name: 'Japon', aliases: ['Japan'], shapeFile: 'Japan_(orthographic_projection).svg', lat: 36.0, lng: 138.0 },
  { id: 'cn', name: 'Chine', aliases: ['China'], shapeFile: 'China_(orthographic_projection).svg', lat: 35.0, lng: 103.0 },
  { id: 'in', name: 'Inde', aliases: ['India'], shapeFile: 'India_(orthographic_projection).svg', lat: 21.0, lng: 78.0 },
  { id: 'kr', name: 'Corée du Sud', aliases: ['South Korea', 'Coree du Sud'], shapeFile: 'South_Korea_(orthographic_projection).svg', lat: 37.0, lng: 128.0 },
  { id: 'th', name: 'Thaïlande', aliases: ['Thailand', 'Thailande'], shapeFile: 'Thailand_(orthographic_projection).svg', lat: 15.0, lng: 100.0 },
  { id: 'vn', name: 'Vietnam', aliases: ['Viet Nam'], shapeFile: 'Vietnam_(orthographic_projection).svg', lat: 16.0, lng: 108.0 },
  { id: 'id', name: 'Indonésie', aliases: ['Indonesia', 'Indonesie'], shapeFile: 'Indonesia_(orthographic_projection).svg', lat: -2.0, lng: 118.0 },
  { id: 'ph', name: 'Philippines', aliases: [], shapeFile: 'Philippines_(orthographic_projection).svg', lat: 13.0, lng: 122.0 },
  { id: 'au', name: 'Australie', aliases: ['Australia'], shapeFile: 'Australia_(orthographic_projection).svg', lat: -25.0, lng: 135.0 },
  { id: 'nz', name: 'Nouvelle-Zélande', aliases: ['New Zealand', 'Nouvelle Zelande'], shapeFile: 'New_Zealand_(orthographic_projection).svg', lat: -41.0, lng: 174.0 },
  { id: 'eg', name: 'Égypte', aliases: ['Egypt', 'Egypte'], shapeFile: 'Egypt_(orthographic_projection).svg', lat: 26.0, lng: 30.0 },
  { id: 'ma', name: 'Maroc', aliases: ['Morocco'], shapeFile: 'Morocco_(orthographic_projection).svg', lat: 32.0, lng: -6.0 },
  { id: 'za', name: 'Afrique du Sud', aliases: ['South Africa', 'Afrique Sud'], shapeFile: 'South_Africa_(orthographic_projection).svg', lat: -30.0, lng: 25.0 },
  { id: 'ng', name: 'Nigéria', aliases: ['Nigeria'], shapeFile: 'Nigeria_(orthographic_projection).svg', lat: 10.0, lng: 8.0 },
  { id: 'ke', name: 'Kenya', aliases: [], shapeFile: 'Kenya_(orthographic_projection).svg', lat: 1.0, lng: 38.0 },
  { id: 'is', name: 'Islande', aliases: ['Iceland'], shapeFile: 'Iceland_(orthographic_projection).svg', lat: 65.0, lng: -18.0 },
  { id: 'ie', name: 'Irlande', aliases: ['Ireland'], shapeFile: 'Ireland_(orthographic_projection).svg', lat: 53.0, lng: -8.0 },
  { id: 'cu', name: 'Cuba', aliases: [], shapeFile: 'Cuba_(orthographic_projection).svg', lat: 22.0, lng: -80.0 },
  { id: 'dk', name: 'Danemark', aliases: ['Denmark'], shapeFile: 'Denmark_(orthographic_projection).svg', lat: 56.0, lng: 10.0 },
  { id: 'ua', name: 'Ukraine', aliases: [], shapeFile: 'Ukraine_(orthographic_projection).svg', lat: 49.0, lng: 32.0 },
];

/** Distance (km) grand-cercle via formule Haversine. */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Bearing (degrés, 0 = Nord, sens horaire) de (lat1,lng1) vers (lat2,lng2). */
export function bearingDeg(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const y =
    Math.sin(toRad(lng2 - lng1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.cos(toRad(lng2 - lng1));
  return (Math.atan2(y, x) * 180) / Math.PI;
}

/** Flèche unicode correspondant à un bearing. 8 points cardinaux. */
export function arrowForBearing(deg: number): string {
  const normalized = ((deg % 360) + 360) % 360;
  const idx = Math.round(normalized / 45) % 8;
  // N, NE, E, SE, S, SW, W, NW
  return ['⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️'][idx];
}

/** Match fuzzy : normalise et compare au nom + aliases. */
export function matchCountry(
  input: string,
  country: WorldleCountry,
): boolean {
  const norm = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z]/g, '');
  const target = norm(input);
  if (!target) return false;
  if (norm(country.name) === target) return true;
  return country.aliases.some((a) => norm(a) === target);
}

/** Trouve le pays correspondant à un input utilisateur (ou null). */
export function findCountry(input: string): WorldleCountry | null {
  for (const c of COUNTRIES) {
    if (matchCountry(input, c)) return c;
  }
  return null;
}

/**
 * URL de la silhouette du pays. On utilise les SVG **locaux** sous
 * `public/country-shapes/<iso2>.svg` (téléchargés une fois via
 * `npm run download:country-shapes`) — uniquement le contour, pas de globe
 * ni de continent autour. Le champ `shapeFile` (Wikipedia orthographic
 * projection) reste sur le type pour archive mais n'est plus utilisé.
 */
export function shapeUrl(c: WorldleCountry): string {
  return `/country-shapes/${c.id}.svg`;
}
