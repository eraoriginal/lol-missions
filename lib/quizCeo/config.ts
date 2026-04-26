/**
 * Le Quiz du CEO — configuration + référentiel des 16 types de questions.
 *
 * Chaque type décrit :
 *   - id          : identifiant stable utilisé en DB et dans les payloads
 *   - label       : nom court affiché dans le lobby / les réglages
 *   - description : explication courte pour le créateur
 *   - defaultDifficulty : difficulté par défaut si on devait en créer une nouvelle
 *
 * Les questions stockées en DB peuvent avoir n'importe quelle `difficulty`
 * (indépendamment du type), et le champ `points` suit la règle
 * 1 (easy) / 2 (medium) / 3 (hard) — voir DIFFICULTY_POINTS ci-dessous.
 */

export const QUESTION_TYPES = [
  {
    id: 'image-personality',
    label: 'Image personnalité',
    description: "Une image d'une personnalité s'affiche, à deviner.",
  },
  {
    id: 'text-question',
    label: 'Question texte',
    description: 'Une question écrite, réponse libre.',
  },
  {
    id: 'expression',
    label: 'Expression',
    description: "Une expression avec un mot manquant, à compléter.",
  },
  {
    id: 'music',
    label: 'Musique',
    description: 'Une musique se déclenche, trouver artiste et titre.',
  },
  {
    id: 'translation',
    label: 'Traduction',
    description: 'Une phrase en langue étrangère à traduire.',
  },
  {
    id: 'multiple-choice',
    label: 'Question à choix',
    description: '4 propositions, 1 bonne réponse.',
  },
  {
    id: 'odd-one-out',
    label: 'Question intrus',
    description: '4 propositions, 3 vraies, trouver la fausse.',
  },
  {
    id: 'lol-player-match',
    label: 'Devine le joueur',
    description:
      "Une carte de match LoL (champion, KDA, items, runes…) tirée de l'historique d'un joueur connu — devine qui a joué cette partie.",
  },
  {
    id: 'country-motto',
    label: 'Devise pays',
    description: "Une devise de pays s'affiche, deviner le pays.",
  },
  {
    id: 'brand-logo',
    label: 'Logo de marque',
    description: "Un logo s'affiche, deviner la marque.",
  },
  {
    id: 'absurd-law',
    label: 'Loi absurde',
    description: "Une loi française difficile à croire : vrai ou faux ?",
  },
  {
    id: 'price',
    label: 'Juste prix',
    description: "Une image s'affiche, deviner le prix.",
  },
  {
    id: 'who-said',
    label: 'Qui a dit',
    description: 'Une phrase citée, deviner qui a dit ça.',
  },
  {
    id: 'ranking',
    label: 'Classement',
    description: '7 images à classer (drag & drop).',
  },
  {
    id: 'worldle',
    label: 'Worldle',
    description:
      "Une silhouette de pays s'affiche — choisis le pays dans la liste. Un pays différent à chaque partie.",
  },
  {
    id: 'lol-champion',
    label: 'LoL',
    description:
      "Devine le champion League of Legends à partir de son splash art (filtre Contours) ou de ses 5 icônes de sorts (Q W E R + Passif). Mode aléatoire à chaque question.",
  },
] as const;

export type QuestionTypeId = (typeof QUESTION_TYPES)[number]['id'];

export const QUESTION_TYPE_IDS: QuestionTypeId[] = QUESTION_TYPES.map(
  (t) => t.id,
);

export const QUESTION_TYPE_MAP: Record<
  QuestionTypeId,
  { label: string; description: string }
> = Object.fromEntries(
  QUESTION_TYPES.map((t) => [t.id, { label: t.label, description: t.description }]),
) as Record<QuestionTypeId, { label: string; description: string }>;

export type Difficulty = 'easy' | 'medium' | 'hard';

export const DIFFICULTY_POINTS: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

export const TIMER_MIN = 10;
export const TIMER_MAX = 300;
export const TIMER_DEFAULT = 30;

export const QUESTION_COUNT_MIN = 4;
export const QUESTION_COUNT_MAX = 40;
/**
 * Nombre de questions par partie — fixé à 25 et **non modifiable depuis le
 * lobby** (l'UI a été retirée). Le tirage côté serveur (`start/route.ts`)
 * garantit 1 question par type activé puis remplit le reste avec
 * `text-question` (catégorie de fallback de loin la plus fournie : 1500
 * entrées). Conséquence : avec les 16 types tous activés on a 16 uniques +
 * 9 text-question fillers = 25.
 */
export const QUESTION_COUNT_DEFAULT = 25;

/**
 * Pour le type "music", la ventilation des points entre artiste / titre si
 * la question vaut 3 pts est : artiste = 1, titre = 2. Chaque case cochée par
 * le créateur pendant la review ajoute la portion correspondante au score.
 * Les deux cochées = 3 (total). Aucune cochée = 0. Plus général (toute
 * difficulté) : le titre vaut 2/3 des points, l'artiste 1/3 (arrondi entier).
 */
export function splitMusicPoints(totalPoints: number): {
  artist: number;
  title: number;
} {
  if (totalPoints <= 1) {
    return { artist: 0, title: totalPoints };
  }
  if (totalPoints === 2) {
    return { artist: 1, title: 1 };
  }
  // 3 (hard) → artist=1, title=2
  const artist = Math.floor(totalPoints / 3);
  const title = totalPoints - artist;
  return { artist, title };
}
