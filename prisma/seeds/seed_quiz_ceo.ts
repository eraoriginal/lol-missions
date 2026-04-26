/**
 * Seed du Quiz du CEO — une question par type (16 au total).
 *
 * Idempotent : supprime les questions existantes du type `quiz-ceo-seed-v1`
 * via le champ `type` + tag en identifier ? Non — Prisma n'a pas de tag,
 * on nettoie et on re-crée.
 *
 * À lancer : `npx tsx prisma/seeds/seed_quiz_ceo.ts`
 */

import { PrismaClient } from '@prisma/client';
import { DIFFICULTY_POINTS } from '../../lib/quizCeo/config';
import type { FullQuestion } from '../../lib/quizCeo/types';
import {
  EXPRESSIONS_EASY,
  EXPRESSIONS_MEDIUM,
  EXPRESSIONS_HARD,
} from '../../lib/quizCeo/expressions';
import {
  TRANSLATIONS,
  LANGUAGE_LABEL,
} from '../../lib/quizCeo/translations';
import {
  ABSURD_LAWS_EASY,
  ABSURD_LAWS_MEDIUM,
  ABSURD_LAWS_HARD,
} from '../../lib/quizCeo/absurdLaws';
import {
  COUNTRY_MOTTOS_EASY,
  COUNTRY_MOTTOS_MEDIUM,
  COUNTRY_MOTTOS_HARD,
} from '../../lib/quizCeo/countryMottos';
import { ALL_COUNTRIES } from '../../lib/quizCeo/allCountries';
import { WHO_SAID } from '../../lib/quizCeo/whoSaid';
import {
  TEXT_QUESTIONS_EASY,
  TEXT_QUESTIONS_MEDIUM,
  TEXT_QUESTIONS_HARD,
} from '../../lib/quizCeo/textQuestions';
import { LOL_PLAYER_MATCHES } from '../../lib/quizCeo/lolPlayerMatches';

const prisma = new PrismaClient();

// Helper : ajoute points automatiquement depuis difficulty.
type SeedInput = Omit<FullQuestion, 'id' | 'points'> & { points?: number };

const QUESTIONS: SeedInput[] = [
  // 1. Image personnalité — Emmanuel Macron
  {
    type: 'image-personality',
    difficulty: 'medium',
    prompt: 'Quelle est cette personnalité ?',
    payload: {
      imageUrl:
        'https://en.wikipedia.org/wiki/Special:FilePath/Emmanuel_Macron_(cropped).jpg?width=400',
    },
    answer: {
      text: 'Emmanuel Macron',
      aliases: ['Macron', 'Président Macron'],
    },
  },

  // 3. Question texte
  {
    type: 'text-question',
    difficulty: 'easy',
    prompt: 'Réponds à la question ci-dessous.',
    payload: {
      text: 'En quelle année a eu lieu la prise de la Bastille ?',
    },
    answer: {
      text: '1789',
    },
  },

  // Note : la catégorie "expression" est seedée séparément en bas du fichier
  // depuis `lib/quizCeo/expressions.ts` (278 entrées 99/93/86 par difficulté).
  // Les corrections ponctuelles se font directement en DB (UPDATE) sans
  // re-deploy ; les ajouts en masse passent par le code + re-seed.

  // 5. Musique — placeholder SoundHelix (à remplacer par un vrai extrait).
  {
    type: 'music',
    difficulty: 'hard',
    prompt: "Écoute et trouve l'artiste + le titre (ex: « Artiste - Titre »).",
    payload: {
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    },
    answer: {
      artist: 'SoundHelix',
      title: 'Song 1',
    },
  },

  // Note : la catégorie "translation" est seedée séparément en bas du fichier
  // depuis `lib/quizCeo/translations.ts` (360 entrées : 12 langues × 30
  // phrases, 10 par difficulté). Hotfix d'une traduction = UPDATE direct DB.

  // 8. Question à choix (4 options, 1 bonne)
  {
    type: 'multiple-choice',
    difficulty: 'easy',
    prompt: 'Choisis la bonne réponse.',
    payload: {
      text: "Quelle est la capitale de l'Australie ?",
      choices: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
    },
    answer: {
      correctIndex: 2,
    },
  },

  // 9. Question intrus (3 vraies, 1 fausse)
  {
    type: 'odd-one-out',
    difficulty: 'medium',
    prompt: 'Parmi ces affirmations, laquelle est FAUSSE ?',
    payload: {
      text: 'Un seul de ces énoncés est faux.',
      choices: [
        'La Terre tourne autour du Soleil',
        'Une année compte 365 jours environ',
        'La Lune est un satellite naturel',
        'Le Soleil tourne autour de la Terre',
      ],
    },
    answer: {
      oddIndex: 3,
    },
  },

  // 10. Catégorie `lol-player-match` — la catégorie est bulk-loadée plus bas
  // depuis `lib/quizCeo/lolPlayerMatches.ts` (~648 entrées générées par
  // `npx tsx scripts/download-lol-match-history.ts`). Pas de placeholder
  // ici : le bulk loader fournit déjà toutes les entrées avec leurs payloads
  // et answers. (Anciennement `media-image` qui a été remplacé.)

  // Note : la catégorie "country-motto" est seedée séparément en bas du
  // fichier depuis `lib/quizCeo/countryMottos.ts` (200 entrées : 75 EASY +
  // 75 MEDIUM + 50 HARD). Le pays est résolu via `lib/quizCeo/allCountries.ts`.

  // 12. Logo de marque — la marque est piochée au hasard parmi ~480 logos
  // simple-icons sous public/brand-logos/ par `start/route.ts`. Les valeurs
  // ci-dessous sont des placeholders, elles ne sont jamais affichées en prod.
  {
    type: 'brand-logo',
    difficulty: 'easy',
    prompt: 'Quelle est cette marque ?',
    payload: {
      imageUrl: '/brand-logos/apple.svg',
    },
    answer: {
      text: 'Apple',
      aliases: [],
    },
  },

  // Note : la catégorie "absurd-law" est seedée séparément en bas du fichier
  // depuis `lib/quizCeo/absurdLaws.ts` (300 entrées : 100 par difficulté,
  // mélange France pittoresque + lois étrangères vérifiées en 2026).

  // 14. Juste prix — placeholder (à remplacer par un vrai produit + sa photo)
  {
    type: 'price',
    difficulty: 'medium',
    prompt: "Devine le prix neuf de ce produit (en €).",
    payload: {
      imageUrl: 'https://picsum.photos/seed/quiz-ceo-price/600/400',
    },
    answer: {
      value: 500,
      tolerancePct: 10,
    },
  },

  // Note : la catégorie "who-said" est seedée séparément en bas du fichier
  // depuis `lib/quizCeo/whoSaid.ts` (~118 citations pop culture).
  // Toutes en difficulty `easy` mais surcôtées à 2 points (override).

  // 16. Ranking (7 pays à classer par population décroissante)
  {
    type: 'ranking',
    difficulty: 'hard',
    prompt: 'Classe ces pays du plus peuplé au moins peuplé.',
    payload: {
      items: [
        {
          id: 'india',
          label: 'Inde',
          url: 'https://flagcdn.com/w320/in.png',
        },
        {
          id: 'china',
          label: 'Chine',
          url: 'https://flagcdn.com/w320/cn.png',
        },
        {
          id: 'usa',
          label: 'États-Unis',
          url: 'https://flagcdn.com/w320/us.png',
        },
        {
          id: 'indonesia',
          label: 'Indonésie',
          url: 'https://flagcdn.com/w320/id.png',
        },
        {
          id: 'pakistan',
          label: 'Pakistan',
          url: 'https://flagcdn.com/w320/pk.png',
        },
        {
          id: 'brazil',
          label: 'Brésil',
          url: 'https://flagcdn.com/w320/br.png',
        },
        {
          id: 'nigeria',
          label: 'Nigéria',
          url: 'https://flagcdn.com/w320/ng.png',
        },
      ],
      shuffledOrder: [
        'brazil',
        'india',
        'nigeria',
        'china',
        'pakistan',
        'usa',
        'indonesia',
      ],
    },
    answer: {
      order: [
        'india',
        'china',
        'usa',
        'indonesia',
        'pakistan',
        'brazil',
        'nigeria',
      ],
    },
  },

  // 17. Worldle — silhouette de pays (pays choisi aléatoirement à chaque
  // partie via `start/route.ts` ; le seed garde des valeurs placeholder qui
  // sont écrasées). Une seule réponse, validation manuelle par le créateur.
  {
    type: 'worldle',
    difficulty: 'medium',
    prompt: 'Quel est ce pays ?',
    payload: {
      imageUrl: '/country-shapes/fr.svg',
    },
    answer: {
      countryId: 'fr',
      countryName: 'France',
      aliases: [],
    },
  },

  // 18. LoL — devine le champion League of Legends. Le tirage runtime dans
  // `start/route.ts` choisit aléatoirement (1) un champion parmi les 172 du
  // catalogue `LOL_CHAMPIONS` et (2) un mode parmi 2 :
  //   - `splash` : splash art 1280×720 + filtre CSS « Contours » (silhouette).
  //   - `spells` : 5 icônes Q/W/E/R/Passif en disposition « Passif central ».
  // Le payload ci-dessous est un placeholder écrasé à chaque partie.
  // Validation manuelle par le créateur (comme brand-logo / worldle).
  {
    type: 'lol-champion',
    difficulty: 'medium',
    prompt: 'Quel champion League of Legends ?',
    payload: {
      mode: 'splash',
      imageUrl: '/lol-champions/aatrox.jpg',
    },
    answer: {
      text: 'Aatrox',
      aliases: [],
    },
  },
];

async function main() {
  // Nettoyage : supprime toutes les QuizCeoQuestion existantes (seed idempotent).
  const deleted = await prisma.quizCeoQuestion.deleteMany({});
  console.log(`[quiz-ceo seed] supprimé ${deleted.count} question(s) existante(s).`);

  let created = 0;
  for (const q of QUESTIONS) {
    const points = q.points ?? DIFFICULTY_POINTS[q.difficulty];
    await prisma.quizCeoQuestion.create({
      data: {
        type: q.type,
        difficulty: q.difficulty,
        points,
        prompt: q.prompt,
        payload: q.payload as unknown as object,
        answer: q.answer as unknown as object,
      },
    });
    created++;
  }

  // Insertion en masse des expressions depuis `lib/quizCeo/expressions.ts`.
  // 99 EASY + 93 MEDIUM + 86 HARD = 278 entrées (doublons risqués retirés).
  // Source de vérité runtime = la DB ; ce fichier sert au seed initial et
  // aux ajouts en masse. Pour corriger une expression existante en prod :
  // UPDATE direct en DB plutôt que re-seed (qui wipe tout).
  const expressionGroups = [
    { difficulty: 'easy' as const, list: EXPRESSIONS_EASY },
    { difficulty: 'medium' as const, list: EXPRESSIONS_MEDIUM },
    { difficulty: 'hard' as const, list: EXPRESSIONS_HARD },
  ];
  for (const { difficulty, list } of expressionGroups) {
    for (const e of list) {
      await prisma.quizCeoQuestion.create({
        data: {
          type: 'expression',
          difficulty,
          points: DIFFICULTY_POINTS[difficulty],
          prompt: 'Complète l\'expression : quel mot manque ?',
          payload: { text: e.text } as unknown as object,
          answer: { text: e.answer } as unknown as object,
        },
      });
      created++;
    }
  }

  // Insertion en masse des citations "Qui a dit" depuis `lib/quizCeo/whoSaid.ts`.
  // Toutes en difficulty `easy` mais surcôtées à 2 points (citations pop culture
  // faciles, mais qui valent un peu plus que la difficulty easy standard).
  for (const w of WHO_SAID) {
    await prisma.quizCeoQuestion.create({
      data: {
        type: 'who-said',
        difficulty: 'easy',
        points: 2, // override : easy standard = 1 pt, ici 2 pts.
        prompt: 'Qui a dit cette phrase célèbre ?',
        payload: { text: w.quote } as unknown as object,
        answer: { text: w.author } as unknown as object,
      },
    });
    created++;
  }

  // Insertion en masse des devises de pays depuis `lib/quizCeo/countryMottos.ts`.
  // 75 EASY + 75 MEDIUM + 50 HARD = 200 entrées. Le pays est résolu via
  // ALL_COUNTRIES (nom canonique + aliases pour la validation manuelle).
  const countryById = new Map(ALL_COUNTRIES.map((c) => [c.id, c]));
  const mottoGroups = [
    { difficulty: 'easy' as const, list: COUNTRY_MOTTOS_EASY },
    { difficulty: 'medium' as const, list: COUNTRY_MOTTOS_MEDIUM },
    { difficulty: 'hard' as const, list: COUNTRY_MOTTOS_HARD },
  ];
  for (const { difficulty, list } of mottoGroups) {
    for (const m of list) {
      const country = countryById.get(m.countryId);
      if (!country) {
        console.warn(`[quiz-ceo seed] motto "${m.motto}" : pays "${m.countryId}" introuvable, ignoré.`);
        continue;
      }
      await prisma.quizCeoQuestion.create({
        data: {
          type: 'country-motto',
          difficulty,
          points: DIFFICULTY_POINTS[difficulty],
          prompt: 'À quel pays appartient cette devise ?',
          payload: { text: m.motto } as unknown as object,
          answer: { text: country.name } as unknown as object,
        },
      });
      created++;
    }
  }

  // Insertion en masse des lois absurdes depuis `lib/quizCeo/absurdLaws.ts`.
  // 100 EASY + 100 MEDIUM + 100 HARD = 300 entrées (mix France + monde).
  const absurdLawGroups = [
    { difficulty: 'easy' as const, list: ABSURD_LAWS_EASY },
    { difficulty: 'medium' as const, list: ABSURD_LAWS_MEDIUM },
    { difficulty: 'hard' as const, list: ABSURD_LAWS_HARD },
  ];
  for (const { difficulty, list } of absurdLawGroups) {
    for (const law of list) {
      await prisma.quizCeoQuestion.create({
        data: {
          type: 'absurd-law',
          difficulty,
          points: DIFFICULTY_POINTS[difficulty],
          prompt: 'Vrai ou faux : cette loi existe-t-elle vraiment en 2026 ?',
          payload: { text: law.text } as unknown as object,
          answer: { value: law.value } as unknown as object,
        },
      });
      created++;
    }
  }

  // Insertion en masse des traductions depuis `lib/quizCeo/translations.ts`.
  // 12 langues × 3 difficultés × 10 phrases = 360 entrées.
  // Le `prompt` indique la langue source ; le `payload` ajoute aussi le
  // champ `language` pour faciliter un éventuel filtre/affichage UI.
  for (const [language, levels] of Object.entries(TRANSLATIONS)) {
    const adjective = LANGUAGE_LABEL[language] ?? language;
    const difficulties: Array<'easy' | 'medium' | 'hard'> = [
      'easy',
      'medium',
      'hard',
    ];
    for (const difficulty of difficulties) {
      for (const e of levels[difficulty]) {
        await prisma.quizCeoQuestion.create({
          data: {
            type: 'translation',
            difficulty,
            points: DIFFICULTY_POINTS[difficulty],
            prompt: `Traduis cette phrase ${adjective} en français.`,
            payload: {
              text: e.text,
              language,
            } as unknown as object,
            answer: { text: e.answer } as unknown as object,
          },
        });
        created++;
      }
    }
  }

  // Insertion en masse des questions ouvertes depuis `lib/quizCeo/textQuestions.ts`.
  // 500 EASY + 500 MEDIUM + 500 HARD = 1500 entrées (de loin la plus grosse
  // catégorie). Sujets variés : géo, histoire, sciences, ciné, musique, sport,
  // jeux vidéo, littérature, politique, TV, cuisine, mythologie, animaux, tech,
  // culture pop. Insertion via createMany (batch ~500/coup) pour ~3× plus rapide
  // que des create() un par un.
  const textGroups = [
    { difficulty: 'easy' as const, list: TEXT_QUESTIONS_EASY },
    { difficulty: 'medium' as const, list: TEXT_QUESTIONS_MEDIUM },
    { difficulty: 'hard' as const, list: TEXT_QUESTIONS_HARD },
  ];
  for (const { difficulty, list } of textGroups) {
    const data = list.map((entry) => ({
      type: 'text-question',
      difficulty,
      points: DIFFICULTY_POINTS[difficulty],
      prompt: 'Réponds à la question ci-dessous.',
      payload: { text: entry.text } as unknown as object,
      answer: {
        text: entry.answer,
        ...(entry.aliases ? { aliases: entry.aliases } : {}),
      } as unknown as object,
    }));
    const result = await prisma.quizCeoQuestion.createMany({ data });
    created += result.count;
  }

  // Insertion en masse des matches LoL depuis `lib/quizCeo/lolPlayerMatches.ts`
  // (catégorie `lol-player-match`). ~648 entrées générées par
  // `download-lol-match-history.ts` (12 amis + Slim Natsu × ~50 matches).
  // Tous en difficulty `medium` (2 pts). Validation manuelle par le créateur
  // en review (le pseudo des amis n'est pas dans un fuzzy match auto).
  const matchData = LOL_PLAYER_MATCHES.map((entry) => ({
    type: 'lol-player-match',
    difficulty: 'medium' as const,
    points: DIFFICULTY_POINTS.medium,
    prompt: 'Quel joueur est derrière cette partie ?',
    payload: entry.data as unknown as object,
    answer: { text: entry.playerName } as unknown as object,
  }));
  const matchResult = await prisma.quizCeoQuestion.createMany({
    data: matchData,
  });
  created += matchResult.count;

  console.log(`[quiz-ceo seed] ${created} question(s) insérée(s).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
