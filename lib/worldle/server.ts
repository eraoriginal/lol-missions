import 'server-only';

/**
 * Catalogue **server-only** des pays Worldle. `import 'server-only'`
 * empêche tout bundle client : la cible du jour reste secrète.
 *
 * Le client utilise `lib/worldle/publicNames.ts` (juste { id, name, aliases })
 * pour l'autocomplete. La résolution + le calcul distance/bearing se fait
 * dans `POST /api/solo/worldle/guess`.
 */

export interface WorldleCountry {
  id: string;
  name: string;
  aliases: string[];
  lat: number;
  lng: number;
}

export const COUNTRIES: WorldleCountry[] = [
  { id: 'fr', name: 'France', aliases: ['France'], lat: 46.6, lng: 2.2 },
  { id: 'it', name: 'Italie', aliases: ['Italy', 'Italia'], lat: 42.5, lng: 12.5 },
  { id: 'de', name: 'Allemagne', aliases: ['Germany', 'Deutschland'], lat: 51.0, lng: 10.0 },
  { id: 'es', name: 'Espagne', aliases: ['Spain', 'España'], lat: 40.0, lng: -4.0 },
  { id: 'gb', name: 'Royaume-Uni', aliases: ['United Kingdom', 'UK', 'Angleterre', 'England'], lat: 54.0, lng: -2.0 },
  { id: 'pt', name: 'Portugal', aliases: [], lat: 39.5, lng: -8.0 },
  { id: 'nl', name: 'Pays-Bas', aliases: ['Netherlands', 'Holland'], lat: 52.1, lng: 5.3 },
  { id: 'be', name: 'Belgique', aliases: ['Belgium'], lat: 50.5, lng: 4.5 },
  { id: 'ch', name: 'Suisse', aliases: ['Switzerland', 'Schweiz'], lat: 46.8, lng: 8.2 },
  { id: 'at', name: 'Autriche', aliases: ['Austria', 'Österreich'], lat: 47.5, lng: 14.5 },
  { id: 'pl', name: 'Pologne', aliases: ['Poland', 'Polska'], lat: 52.0, lng: 19.0 },
  { id: 'gr', name: 'Grèce', aliases: ['Greece', 'Grece'], lat: 39.0, lng: 22.0 },
  { id: 'tr', name: 'Turquie', aliases: ['Turkey', 'Türkiye'], lat: 39.0, lng: 35.0 },
  { id: 'ru', name: 'Russie', aliases: ['Russia'], lat: 60.0, lng: 100.0 },
  { id: 'cn', name: 'Chine', aliases: ['China'], lat: 35.0, lng: 105.0 },
  { id: 'jp', name: 'Japon', aliases: ['Japan'], lat: 36.0, lng: 138.0 },
  { id: 'kr', name: 'Corée du Sud', aliases: ['South Korea', 'Korea', 'Corée'], lat: 37.0, lng: 127.5 },
  { id: 'in', name: 'Inde', aliases: ['India'], lat: 22.0, lng: 79.0 },
  { id: 'th', name: 'Thaïlande', aliases: ['Thailand', 'Thailande'], lat: 15.0, lng: 100.0 },
  { id: 'vn', name: 'Vietnam', aliases: [], lat: 16.0, lng: 108.0 },
  { id: 'id', name: 'Indonésie', aliases: ['Indonesia'], lat: -5.0, lng: 120.0 },
  { id: 'au', name: 'Australie', aliases: ['Australia'], lat: -25.0, lng: 133.0 },
  { id: 'nz', name: 'Nouvelle-Zélande', aliases: ['New Zealand'], lat: -41.0, lng: 174.0 },
  { id: 'us', name: 'États-Unis', aliases: ['United States', 'USA', 'Etats-Unis', 'America'], lat: 38.0, lng: -97.0 },
  { id: 'ca', name: 'Canada', aliases: [], lat: 56.0, lng: -106.0 },
  { id: 'mx', name: 'Mexique', aliases: ['Mexico'], lat: 23.0, lng: -102.0 },
  { id: 'br', name: 'Brésil', aliases: ['Brazil', 'Bresil'], lat: -10.0, lng: -55.0 },
  { id: 'ar', name: 'Argentine', aliases: ['Argentina'], lat: -38.0, lng: -64.0 },
  { id: 'cl', name: 'Chili', aliases: ['Chile'], lat: -30.0, lng: -71.0 },
  { id: 'pe', name: 'Pérou', aliases: ['Peru'], lat: -10.0, lng: -76.0 },
  { id: 've', name: 'Venezuela', aliases: [], lat: 8.0, lng: -66.0 },
  { id: 'co', name: 'Colombie', aliases: ['Colombia'], lat: 4.0, lng: -74.0 },
  { id: 'eg', name: 'Égypte', aliases: ['Egypt', 'Egypte'], lat: 27.0, lng: 30.0 },
  { id: 'ma', name: 'Maroc', aliases: ['Morocco'], lat: 32.0, lng: -6.0 },
  { id: 'dz', name: 'Algérie', aliases: ['Algeria', 'Algerie'], lat: 28.0, lng: 3.0 },
  { id: 'tn', name: 'Tunisie', aliases: ['Tunisia'], lat: 34.0, lng: 9.0 },
  { id: 'sn', name: 'Sénégal', aliases: ['Senegal'], lat: 14.0, lng: -14.0 },
  { id: 'za', name: 'Afrique du Sud', aliases: ['South Africa'], lat: -29.0, lng: 24.0 },
  { id: 'ng', name: 'Nigéria', aliases: ['Nigeria'], lat: 10.0, lng: 8.0 },
  { id: 'ke', name: 'Kenya', aliases: [], lat: 1.0, lng: 38.0 },
  { id: 'is', name: 'Islande', aliases: ['Iceland'], lat: 65.0, lng: -18.0 },
  { id: 'ie', name: 'Irlande', aliases: ['Ireland'], lat: 53.0, lng: -8.0 },
  { id: 'cu', name: 'Cuba', aliases: [], lat: 22.0, lng: -80.0 },
  { id: 'dk', name: 'Danemark', aliases: ['Denmark'], lat: 56.0, lng: 10.0 },
  { id: 'ua', name: 'Ukraine', aliases: [], lat: 49.0, lng: 32.0 },
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
  const y = Math.sin(toRad(lng2 - lng1)) * Math.cos(toRad(lat2));
  const x =
    Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
    Math.sin(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.cos(toRad(lng2 - lng1));
  return (Math.atan2(y, x) * 180) / Math.PI;
}

/** Trouve le pays correspondant à un input utilisateur (ou null). */
export function findCountry(input: string): WorldleCountry | null {
  const norm = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z]/g, '');
  const target = norm(input);
  if (!target) return null;
  for (const c of COUNTRIES) {
    if (norm(c.name) === target) return c;
    if (c.aliases.some((a) => norm(a) === target)) return c;
  }
  return null;
}
