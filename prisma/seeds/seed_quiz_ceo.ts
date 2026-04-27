/**
 * Seed du Quiz du CEO — placeholders pour les types runtime-driven +
 * insertion en masse depuis les catalogues `lib/quizCeo/*.ts`.
 *
 * Idempotent : on supprime toutes les QuizCeoQuestion puis on re-crée tout.
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
import {
  ZODIAC_QUESTIONS,
  MBTI_QUESTIONS,
  ZODIAC_PROMPT,
  MBTI_PROMPT,
} from '../../lib/quizCeo/zodiacMbti';
import {
  ACRONYMS_EASY,
  ACRONYMS_MEDIUM,
  ACRONYMS_HARD,
} from '../../lib/quizCeo/acronyms';
import { INTERNATIONAL_FOODS } from '../../lib/quizCeo/internationalFood';
import { ROAD_SIGNS } from '../../lib/quizCeo/roadSigns';
import { FRENCH_ADS } from '../../lib/quizCeo/frenchAds';
import { KNOW_ERA_QUESTIONS } from '../../lib/quizCeo/knowEra';

const prisma = new PrismaClient();

// Helper : ajoute points automatiquement depuis difficulty.
type SeedInput = Omit<FullQuestion, 'id' | 'points'> & { points?: number };

const QUESTIONS: SeedInput[] = [
  // Logo de marque — la marque est piochée au hasard parmi ~480 logos
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

  // Worldle — silhouette de pays (pays choisi aléatoirement à chaque
  // partie via `start/route.ts` ; le seed garde un placeholder écrasé).
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
    },
  },

  // LoL — devine le champion. Tirage runtime (champion + mode splash/spells).
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
  // 99 EASY + 93 MEDIUM + 86 HARD = 278 entrées.
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
  for (const w of WHO_SAID) {
    await prisma.quizCeoQuestion.create({
      data: {
        type: 'who-said',
        difficulty: 'easy',
        points: 2,
        prompt: 'Qui a dit cette phrase célèbre ?',
        payload: { text: w.quote } as unknown as object,
        answer: { text: w.author } as unknown as object,
      },
    });
    created++;
  }

  // Insertion en masse des devises de pays depuis `lib/quizCeo/countryMottos.ts`.
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

  // Insertion en masse des lois absurdes.
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

  // Insertion en masse des traductions.
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

  // Insertion en masse des questions ouvertes (text-question).
  // 500 EASY + 500 MEDIUM + 500 HARD = 1500 entrées.
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

  // Insertion en masse des questions Zodiaque & MBTI (252 entrées).
  // Choices reconstruits au runtime dans `start/route.ts`.
  const zodiacData = ZODIAC_QUESTIONS.map((entry) => ({
    type: 'zodiac-mbti',
    difficulty: entry.difficulty,
    points: DIFFICULTY_POINTS[entry.difficulty],
    prompt: ZODIAC_PROMPT,
    payload: { subject: 'zodiac', text: entry.text } as unknown as object,
    answer: { text: entry.answer } as unknown as object,
  }));
  const mbtiData = MBTI_QUESTIONS.map((entry) => ({
    type: 'zodiac-mbti',
    difficulty: entry.difficulty,
    points: DIFFICULTY_POINTS[entry.difficulty],
    prompt: MBTI_PROMPT,
    payload: { subject: 'mbti', text: entry.text } as unknown as object,
    answer: { text: entry.answer } as unknown as object,
  }));
  const zodiacMbtiResult = await prisma.quizCeoQuestion.createMany({
    data: [...zodiacData, ...mbtiData],
  });
  created += zodiacMbtiResult.count;

  // Insertion en masse des matches LoL (lol-player-match).
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

  // Insertion en masse des acronymes & sigles depuis `lib/quizCeo/acronyms.ts`.
  // 50 EASY + 50 MEDIUM + 50 HARD = 150 entrées (StringAnswer, validation
  // manuelle par le créateur en review).
  const acronymGroups = [
    { difficulty: 'easy' as const, list: ACRONYMS_EASY },
    { difficulty: 'medium' as const, list: ACRONYMS_MEDIUM },
    { difficulty: 'hard' as const, list: ACRONYMS_HARD },
  ];
  for (const { difficulty, list } of acronymGroups) {
    const data = list.map((entry) => ({
      type: 'acronyme-sigle',
      difficulty,
      points: DIFFICULTY_POINTS[difficulty],
      prompt: 'Que signifie ce sigle ou acronyme ?',
      payload: { text: entry.text } as unknown as object,
      answer: {
        text: entry.answer,
        ...(entry.aliases ? { aliases: entry.aliases } : {}),
      } as unknown as object,
    }));
    const result = await prisma.quizCeoQuestion.createMany({ data });
    created += result.count;
  }

  // Insertion en masse des plats internationaux (`bouffe-internationale`).
  // 100 entrées : photo Wikipedia + 4 choix de pays curés (1 correct + 3
  // distractors plausibles). Pas de transformation runtime — les choices
  // sont déjà dans le payload.
  const foodData = INTERNATIONAL_FOODS.map((entry) => {
    const correctIndex = entry.choices.indexOf(entry.country);
    return {
      type: 'bouffe-internationale',
      difficulty: 'medium' as const,
      points: DIFFICULTY_POINTS.medium,
      prompt: "De quel pays vient ce plat ?",
      payload: {
        imageUrl: entry.imageUrl,
        choices: entry.choices,
      } as unknown as object,
      answer: { correctIndex } as unknown as object,
    };
  });
  const foodResult = await prisma.quizCeoQuestion.createMany({ data: foodData });
  created += foodResult.count;

  // Insertion en masse des panneaux de signalisation (`panneau-signalisation`).
  // ~80 entrées : SVG Wikimedia + 4 choix de signification curés.
  const signsData = ROAD_SIGNS.map((entry) => {
    const correctIndex = entry.choices.indexOf(entry.meaning);
    return {
      type: 'panneau-signalisation',
      difficulty: 'medium' as const,
      points: DIFFICULTY_POINTS.medium,
      prompt: 'Que signifie ce panneau de signalisation ?',
      payload: {
        imageUrl: entry.imageUrl,
        choices: entry.choices,
      } as unknown as object,
      answer: { correctIndex } as unknown as object,
    };
  });
  const signsResult = await prisma.quizCeoQuestion.createMany({ data: signsData });
  created += signsResult.count;

  // Insertion en masse des slogans publicitaires français (`slogan-pub`).
  // ~100 entrées text-only — les distractors (3 mauvaises marques) sont tirés
  // au runtime depuis `FRENCH_AD_BRANDS_POOL` à `start/route.ts`. La DB ne
  // stocke que `payload = { text: slogan }` et `answer = { text: brand }`.
  const adsData = FRENCH_ADS.map((entry) => ({
    type: 'slogan-pub',
    difficulty: entry.difficulty,
    points: DIFFICULTY_POINTS[entry.difficulty],
    prompt: 'À quelle marque appartient ce slogan ?',
    payload: { text: entry.slogan } as unknown as object,
    answer: { text: entry.brand } as unknown as object,
  }));
  const adsResult = await prisma.quizCeoQuestion.createMany({ data: adsData });
  created += adsResult.count;

  // Insertion en masse de la catégorie `know-era` (questions sur le CEO de
  // la KAF). Stocke `payload = { text, distractors }` + `answer = { text }` ;
  // le runtime de `start/route.ts` reconstruit `payload.choices` (4 choix
  // mélangés à chaque partie, distractors complétés au besoin).
  const knowEraData = KNOW_ERA_QUESTIONS.map((entry) => ({
    type: 'know-era',
    difficulty: 'medium' as const,
    points: DIFFICULTY_POINTS.medium,
    prompt: entry.questionText,
    payload: {
      text: entry.questionText,
      distractors: entry.distractors,
    } as unknown as object,
    answer: { text: entry.answer } as unknown as object,
  }));
  const knowEraResult = await prisma.quizCeoQuestion.createMany({
    data: knowEraData,
  });
  created += knowEraResult.count;

  console.log(`[quiz-ceo seed] ${created} question(s) insérée(s).`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
