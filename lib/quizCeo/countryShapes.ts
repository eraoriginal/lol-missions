/**
 * Helper pour les questions « forme de pays » du Quiz CEO.
 *
 * Les SVG sont téléchargés une fois via `npm run download:country-shapes` et
 * stockés sous `public/country-shapes/<iso2>.svg`. Next.js les sert
 * directement (ou via le proxy opaque `asset/[index]` quand on doit cacher
 * l'iso2 du nom de fichier).
 *
 * La liste des pays disponibles vit dans `lib/quizCeo/allCountries.ts`
 * pour le Quiz CEO (~190 pays) et `lib/worldle/server.ts` pour Worldle
 * solo (44 pays). Ce module ne contient plus que le helper de path.
 */

/** URL publique servie par Next.js depuis `public/country-shapes/`. */
export function getCountryShapePath(iso2: string): string {
  return `/country-shapes/${iso2.toLowerCase()}.svg`;
}
