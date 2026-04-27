/**
 * Le Quiz du CEO — configuration + référentiel des 16 types de questions.
 *
 * Chaque type décrit :
 *   - id          : identifiant stable utilisé en DB et dans les payloads
 *   - label       : nom court affiché dans le lobby / les réglages
 *   - description : explication courte pour le créateur
 *
 * Les questions stockées en DB peuvent avoir n'importe quelle `difficulty`
 * (indépendamment du type), et le champ `points` suit la règle
 * 1 (easy) / 2 (medium) / 3 (hard) — voir DIFFICULTY_POINTS ci-dessous.
 */

export const QUESTION_TYPES = [
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
    id: 'translation',
    label: 'Traduction',
    description: 'Une phrase en langue étrangère à traduire.',
  },
  {
    id: 'zodiac-mbti',
    label: 'Zodiaque & MBTI',
    description:
      "Une description de personnalité s'affiche, deviner à quel signe astrologique ou type MBTI elle correspond (QCM 4 choix).",
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
    id: 'who-said',
    label: 'Qui a dit',
    description: 'Une phrase citée, deviner qui a dit ça.',
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
  {
    id: 'acronyme-sigle',
    label: 'Acronymes & sigles',
    description: 'Un sigle ou acronyme à développer (réponse libre).',
  },
  {
    id: 'bouffe-internationale',
    label: 'Cuisine du monde',
    description: "Une photo d'un plat à reconnaître — devine le pays d'origine (QCM 4 choix).",
  },
  {
    id: 'panneau-signalisation',
    label: 'Panneaux de signalisation',
    description: 'Un panneau routier français — devine sa signification (QCM 4 choix).',
  },
  {
    id: 'slogan-pub',
    label: 'Slogans de pub',
    description: 'Un slogan publicitaire français — devine la marque (QCM 4 choix).',
  },
  {
    id: 'know-era',
    label: 'Connais-tu le CEO',
    description:
      "Une question sur les goûts / la personne du CEO de la KAF — devine la bonne réponse (QCM 4 choix).",
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
 * Nombre de questions par partie — fixé à 20 et **non modifiable depuis le
 * lobby** (l'UI a été retirée). Le tirage côté serveur (`start/route.ts`)
 * garantit 1 question par type activé puis remplit le reste avec
 * `text-question` (catégorie de fallback de loin la plus fournie : 1500
 * entrées). Conséquence : avec les 16 types tous activés on a 16 uniques +
 * 4 text-question fillers = 20.
 */
export const QUESTION_COUNT_DEFAULT = 20;
