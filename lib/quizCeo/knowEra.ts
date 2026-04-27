/**
 * Catalogue de la catégorie `know-era` du Quiz du CEO — questions sur la
 * personnalité, les goûts et les références du « CEO de la KAF ».
 *
 * Format QCM : énoncé fixe + 1 réponse correcte + 3 distractors. Si l'entrée
 * fournit moins de 3 distractors, le runtime de `start/route.ts` complète
 * depuis le pool global des autres réponses du catalogue (exclut la bonne
 * réponse et les distractors déjà présents) — pattern identique à
 * `slogan-pub` / `zodiac-mbti`.
 *
 * Source : réponses collectées via la page `/test/know-era` (formulaire
 * interactif). L'agent ne réécrit JAMAIS le contenu — c'est la voix du CEO,
 * pas la sienne.
 */

export interface KnowEraEntry {
  /** Identifiant stable (matche le slug du formulaire de collecte). */
  id: string;
  /** Énoncé affiché tel quel au joueur (déjà bien formé grammaticalement). */
  questionText: string;
  /** La bonne réponse — apparaîtra dans `payload.choices` à un index random. */
  answer: string;
  /**
   * 0 à 3 distractors curés. Si < 3, le runtime complète depuis le pool
   * global de toutes les autres réponses du catalogue.
   */
  distractors: string[];
}

export const KNOW_ERA_QUESTIONS: KnowEraEntry[] = [
  // ───── MUSIQUE ─────
  {
    id: 'boys-band',
    questionText: 'Quel est le boys band préféré du « CEO de la KAF » ?',
    answer: 'Backstreet Boys',
    distractors: ['Poetic Lover', 'Take That', 'NSYNC'],
  },
  {
    id: 'groupe-kpop',
    questionText: 'Quel est le groupe K-pop préféré du « CEO de la KAF » ?',
    answer: "Girls' Generation",
    distractors: ['aespa', 'BabyMonster', 'Blackpink'],
  },
  {
    id: 'chanson-coeur',
    questionText: 'Quelle chanson fait pleurer le « CEO de la KAF » ?',
    answer: 'Gladiator - Now we are free',
    distractors: [
      'Ed Sheeran - I see fire',
      'Poetic Lover - Prenons notre temps',
      'Alicia Keys - Fallin',
    ],
  },
  {
    id: 'chanson-soiree',
    questionText: 'Quelle chanson fait danser le « CEO de la KAF » en soirée ?',
    answer: 'BIG BANG - Fantastic Baby',
    distractors: [
      "Blackpink - 마지막처럼",
      'Jungeli - Petit génie',
      'Willy Denzey - Le mur du son',
    ],
  },
  {
    id: 'rappeur-fr',
    questionText: 'Qui est le rappeur français préféré du « CEO de la KAF » ?',
    answer: "J'aime pas le rap",
    distractors: ['Booba', 'Oxmo Puccino', 'Kery James'],
  },
  {
    id: 'rappeur-us',
    questionText: 'Qui est le rappeur US préféré du « CEO de la KAF » ?',
    answer: 'Puff Diddy',
    distractors: ['P Diddy', 'Diddy', 'Epstein'],
  },
  {
    id: 'artiste-pop',
    questionText: "Qui est l'artiste pop / variété préféré du « CEO de la KAF » ?",
    answer: 'Justin Bieber',
    distractors: ['Justin Timberlake', 'Ed Sheeran', 'M Pokora'],
  },
  {
    id: 'dj-prefere',
    questionText: 'Qui est le DJ ou producteur électro préféré du « CEO de la KAF » ?',
    answer: 'Kygo',
    distractors: ['Avicii', 'David Guetta', 'DJ Snake'],
  },
  {
    id: 'concert-meilleur',
    questionText: "Quel est le meilleur concert auquel a assisté le « CEO de la KAF » ?",
    answer: 'Hans Zimmer',
    distractors: [],
  },
  {
    id: 'instrument',
    questionText: 'Quel instrument joue (ou rêve de jouer) le « CEO de la KAF » ?',
    answer: 'Violon',
    distractors: [],
  },
  {
    id: 'album-iconique',
    questionText: 'Quel album culte a marqué la vie du « CEO de la KAF » ?',
    answer: 'Poetic Lover - Amants poétiques',
    distractors: [
      'Justin Bieber - Purpose',
      'The Diary of Alicia Keys',
      'Jean-Jacques Goldman - En passant',
    ],
  },

  // ───── CINÉ / SÉRIES ─────
  {
    id: 'film',
    questionText: 'Quel est le film préféré du « CEO de la KAF » ?',
    answer: 'Gladiator',
    distractors: ['Interstellar', 'Transformers', 'The Dark Knight'],
  },
  {
    id: 'serie-fav',
    questionText: 'Quelle est la série préférée du « CEO de la KAF » ?',
    answer: 'One Tree Hill (Les Frères Scott)',
    distractors: ['Friends', 'Band of Brothers', 'Stargate SG-1'],
  },
  {
    id: 'acteur',
    questionText: "Qui est l'acteur préféré du « CEO de la KAF » ?",
    answer: 'Russell Crowe',
    distractors: ['Robert De Niro', 'Al Pacino', 'Song Kang-ho'],
  },
  {
    id: 'actrice',
    questionText: "Qui est l'actrice préférée du « CEO de la KAF » ?",
    answer: 'Natalie Portman',
    distractors: [],
  },
  {
    id: 'realisateur',
    questionText: 'Qui est le réalisateur préféré du « CEO de la KAF » ?',
    answer: 'Christopher Nolan',
    distractors: ['Martin Scorsese', 'Denis Villeneuve', 'Antoine Fuqua'],
  },
  {
    id: 'dessin-anime',
    questionText: "Quel est le dessin animé d'enfance favori du « CEO de la KAF » ?",
    answer: 'Théo et la batte de la victoire',
    distractors: ['Dragon Ball', 'Olive et Tom', "Cat's Eye"],
  },
  {
    id: 'super-heros',
    questionText: 'Quel est le super-héros préféré du « CEO de la KAF » ?',
    answer: 'Batman',
    distractors: [],
  },
  {
    id: 'mechant-cine',
    questionText: 'Quel est le méchant de film préféré du « CEO de la KAF » ?',
    answer: 'Commode',
    distractors: ['Joker', 'Thanos', 'John Doe'],
  },
  {
    id: 'film-dora',
    questionText: 'Quel film le « CEO de la KAF » peut-il regarder en boucle ?',
    answer: "L'Homme au masque de fer",
    distractors: ['Man on Fire', 'Seven', 'Avengers: Endgame'],
  },
  {
    id: 'serie-binge',
    questionText: 'Quelle série le « CEO de la KAF » a-t-il binge-watchée ?',
    answer: 'Héros fragile',
    distractors: [],
  },
  {
    id: 'film-deteste',
    questionText: 'Quel film populaire le « CEO de la KAF » déteste-t-il ?',
    answer: 'Matrix',
    distractors: [],
  },

  // ───── MANGA / LIVRES ─────
  {
    id: 'manga',
    questionText: 'Quel est le manga préféré du « CEO de la KAF » ?',
    answer: 'Haikyū!!',
    distractors: ['Naruto', 'Captain Tsubasa', 'Bleach'],
  },
  {
    id: 'manga-2',
    questionText: 'Quel est le deuxième manga favori du « CEO de la KAF » ?',
    answer: 'Naruto',
    distractors: [],
  },
  {
    id: 'perso-manga',
    questionText: 'Qui est le personnage de manga préféré du « CEO de la KAF » ?',
    answer: 'Sangohan',
    distractors: ['Shōyō Hinata', 'Eijun Sawamura', 'Light Yagami'],
  },
  {
    id: 'livre-fav',
    questionText: 'Quel livre a marqué le « CEO de la KAF » ?',
    answer: 'Arsène Lupin, gentleman cambrioleur',
    distractors: [],
  },
  {
    id: 'auteur-fav',
    questionText: "Qui est l'auteur préféré du « CEO de la KAF » ?",
    answer: 'Maurice Leblanc',
    distractors: [],
  },

  // ───── JEUX VIDÉO ─────
  {
    id: 'jeu-video',
    questionText: 'Quel est le jeu vidéo préféré du « CEO de la KAF » ?',
    answer: 'Clair Obscur: Expedition 33',
    distractors: ['League of Legends', 'Cities: Skylines', 'Counter-Strike'],
  },
  {
    id: 'console-fav',
    questionText: 'Quelle est la console préférée du « CEO de la KAF » ?',
    answer: 'Nintendo 64',
    distractors: ['PlayStation', 'Game Boy', 'Switch'],
  },
  {
    id: 'jeu-enfance',
    questionText: "Quel est le jeu vidéo d'enfance du « CEO de la KAF » ?",
    answer: 'GoldenEye 007',
    distractors: ['Perfect Dark', 'Pokémon', 'Metal Gear Solid'],
  },
  {
    id: 'champion-lol',
    questionText: 'Quel est le champion LoL préféré du « CEO de la KAF » ?',
    answer: 'Sivir',
    distractors: ['Irelia', 'Corki', 'Lee Sin'],
  },
  {
    id: 'role-lol',
    questionText: 'Quel rôle LoL préfère le « CEO de la KAF » (top, jungle, mid, adc, support) ?',
    answer: 'ADC',
    distractors: ['Top', 'Jungle', 'Support'],
  },
  {
    id: 'mmo',
    questionText: 'Quel est le MMO préféré du « CEO de la KAF » ?',
    answer: 'Lost Ark',
    distractors: [],
  },
  {
    id: 'fps',
    questionText: 'Quel est le FPS préféré du « CEO de la KAF » ?',
    answer: 'GoldenEye 007',
    distractors: [],
  },
  {
    id: 'jeu-coop',
    questionText: 'Quel est le meilleur jeu coop entre potes selon le « CEO de la KAF » ?',
    answer: 'Kebab Simulator',
    distractors: [],
  },
  {
    id: 'perso-jv',
    questionText: 'Quel personnage de jeu vidéo iconique préfère le « CEO de la KAF » ?',
    answer: 'Solid Snake',
    distractors: ['Mario', 'Lara Croft', 'Link'],
  },

  // ───── SPORT ─────
  {
    id: 'joueur-foot',
    questionText: 'Qui est le joueur de foot préféré du « CEO de la KAF » ?',
    answer: 'Pastore',
    distractors: ['Zidane', 'Nakata', 'Zaïre-Emery'],
  },
  {
    id: 'club-foot',
    questionText: 'Quel est le club de foot préféré du « CEO de la KAF » ?',
    answer: 'PSG',
    distractors: ['Ajax Amsterdam', 'EA Guingamp', 'Les consanguins marseillais'],
  },
  {
    id: 'equipe-nationale',
    questionText: 'Quelle équipe nationale (hors France) supporte le « CEO de la KAF » ?',
    answer: 'Pays-Bas',
    distractors: ['Espagne', 'Corée du Sud', 'Japon'],
  },
  {
    id: 'sport-pratique',
    questionText: 'Quel sport pratique le « CEO de la KAF » ?',
    answer: 'La branlette',
    distractors: ['Sport de chambre', 'E-sport', 'Volley-ball'],
  },
  {
    id: 'tennis',
    questionText: 'Qui est le joueur de tennis préféré du « CEO de la KAF » ?',
    answer: 'Ievgueni Kafelnikov',
    distractors: ['Yannick Noah', 'Gustavo Kuerten', 'Michael Chang'],
  },

  // ───── PERSONNEL ─────
  {
    id: 'signe-astro',
    questionText: 'Quel est le signe astrologique du « CEO de la KAF » ?',
    answer: 'Verseau',
    distractors: ['Bélier', 'Lion', 'Scorpion'],
  },
];

/**
 * Pool global de toutes les réponses uniques du catalogue. Utilisé par le
 * runtime de `start/route.ts` pour compléter les distractors quand une
 * entrée en a moins de 3.
 */
export const KNOW_ERA_ANSWER_POOL: string[] = Array.from(
  new Set([
    ...KNOW_ERA_QUESTIONS.map((q) => q.answer),
    ...KNOW_ERA_QUESTIONS.flatMap((q) => q.distractors),
  ]),
);
