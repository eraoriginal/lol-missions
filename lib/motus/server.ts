import 'server-only';

/**
 * Banque de mots Motus — **server-only**. `import 'server-only'` au top
 * empêche tout bundle de ce module côté client (Webpack / Turbopack
 * lèvent une erreur si un Client Component l'importe).
 *
 * Conséquence : la solution du jour ne peut être lue depuis les DevTools.
 * Le client passe par `POST /api/solo/motus/guess` qui valide chaque essai.
 *
 * L'ordre définit le calendrier : `pickByDay(MOTUS_CLEAN_WORDS)` =
 * `MOTUS_CLEAN_WORDS[dailyIndex() % N]`. Ajouter des mots en fin de liste
 * ne casse pas les anciennes entrées.
 *
 * Accents strippés : café → CAFE, éléphant → ELEPHANT, etc. L'input
 * utilisateur subit la même normalisation via `normalizeMotus` (cf.
 * `lib/motus/normalize.ts` qui est partagé client/serveur).
 */
export const MOTUS_WORDS: string[] = [
  // 5 lettres
  'CHIEN', 'TABLE', 'PORTE', 'POMME', 'ROUGE', 'PLUIE', 'LIVRE', 'SUCRE',
  'VILLE', 'FORET', 'ROUTE', 'PIANO', 'VAGUE', 'NUAGE', 'CARTE', 'MATIN',
  'PLAGE', 'GLACE', 'PLUME', 'FLEUR', 'ARBRE', 'FERME', 'TIGRE', 'ROBOT',
  'NEIGE', 'JAUNE', 'VOILE', 'MONDE', 'MUSEE', 'ETOILE',
  // 6 lettres
  'BATEAU', 'FLEUVE', 'JARDIN', 'MAISON', 'ORANGE', 'PRISON', 'RAISON',
  'CHEVAL', 'ENFANT', 'DANGER', 'CHAISE', 'VOYAGE', 'SALADE', 'BANANE',
  'FROMAG', 'PIGEON', 'OISEAU', 'COUTEA', 'LECTUR', 'AVOCAT', 'CANARD',
  'FORETS', 'LIVRES', 'VOITUR', 'NATURE',
  // 7 lettres
  'CHATEAU', 'CHAPEAU', 'LUMIERE', 'PAYSAGE', 'QUITTER', 'SILENCE',
  'TEMPETE', 'FENETRE', 'RAVIOLI', 'MELODIE', 'TRESORS', 'CHANTER',
  'DANSEUR', 'CUISINE', 'DOCTEUR', 'ROMANCE', 'ROMARIN', 'TRUFFES',
  // 8 lettres
  'MONTAGNE', 'AVENTURE', 'DIMANCHE', 'ELEGANCE', 'HISTOIRE', 'LOINTAIN',
  'GEOMETRI', 'FRANCAIS', 'CHAMBRES', 'LUMIERES', 'ORCHESTR', 'CULTURES',
  'SYMPHONI', 'ELEPHANT', 'PALMIERS',
];

/**
 * Ne retient que les mots correctement formés (A-Z strict, 5..8 lettres).
 * Tout mot qui ne respecte pas le format est filtré silencieusement.
 */
export const MOTUS_CLEAN_WORDS = MOTUS_WORDS.filter((w) =>
  /^[A-Z]{5,8}$/.test(w),
);
