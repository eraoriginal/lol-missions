/**
 * Configuration centrale du jeu Beat Eikichi.
 * Les valeurs ici sont faciles à modifier (puis redéploiement).
 */
export const BEAT_EIKICHI_CONFIG = {
  /** Durée d'une question en secondes. Modifier ici si trop court / trop long. */
  QUESTION_TIMER_SECONDS: 60,

  /** Nombre de questions par partie. Chaque partie a son propre tirage aléatoire. */
  QUESTIONS_PER_GAME: 20,

  /** Taille cible du catalogue de jeux vidéo. */
  CATALOG_SIZE: 1000,

  /** Nombre d'images stockées par jeu (une est tirée aléatoirement par question). */
  IMAGES_PER_GAME: 5,

  /** Throttle côté client pour persister la saisie du joueur (fallback pour la review). */
  TYPING_PERSIST_THROTTLE_MS: 1000,

  /** Tolérance Levenshtein relative à la longueur de la cible (min 1). */
  FUZZY_DISTANCE_RATIO: 0.15,
} as const;

/** Durée du timer en millisecondes (dérivée). */
export const QUESTION_TIMER_MS =
  BEAT_EIKICHI_CONFIG.QUESTION_TIMER_SECONDS * 1000;
