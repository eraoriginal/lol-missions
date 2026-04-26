/**
 * Helper de normalisation pour Motus — utilisé côté client (input clavier)
 * ET côté serveur (validation guess). Pas de secret, peut être bundlé.
 *
 * Ce module est volontairement séparé de `server.ts` (qui contient le
 * catalogue de mots) pour pouvoir être importé client-side sans tirer
 * `MOTUS_CLEAN_WORDS` dans le bundle.
 */

/** Normalise un input joueur pour la comparaison : upper + strip accents. */
export function normalizeMotus(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/[^A-Z]/g, '');
}
