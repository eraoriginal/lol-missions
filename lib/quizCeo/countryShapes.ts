/**
 * Helpers pour les questions « forme de pays » du Quiz CEO.
 *
 * Source unique de vérité : la liste `COUNTRIES` de Worldle (`lib/worldle/countries.ts`)
 * — id ISO 3166-1 alpha-2, nom français, aliases acceptés.
 *
 * Les SVG sont téléchargés une fois via `npm run download:country-shapes` et
 * stockés sous `public/country-shapes/<iso2>.svg`. Next.js les sert
 * directement avec un cache HTTP optimal.
 */

import { COUNTRIES, type WorldleCountry } from '../worldle/countries';

/** URL publique servie par Next.js depuis `public/country-shapes/`. */
export function getCountryShapePath(iso2: string): string {
  return `/country-shapes/${iso2.toLowerCase()}.svg`;
}

/** Aliases acceptés en fuzzy match — inclut le nom canonique pour la lisibilité. */
export function getCountryAliases(c: WorldleCountry): string[] {
  return Array.from(new Set([c.name, ...c.aliases].filter(Boolean)));
}

export { COUNTRIES };
