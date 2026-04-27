import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';
import {
  QUESTION_COUNT_DEFAULT,
  QUESTION_TYPE_IDS,
  type QuestionTypeId,
} from '@/lib/quizCeo/config';
import type {
  FullQuestion,
  WorldleAnswer,
  WorldlePayload,
} from '@/lib/quizCeo/types';
import { ALL_COUNTRIES } from '@/lib/quizCeo/allCountries';
import { getCountryShapePath } from '@/lib/quizCeo/countryShapes';
import {
  getAvailableBrands,
  getBrandLogoPath,
} from '@/lib/quizCeo/brandLogos';
import {
  buildLolPayload,
  pickRandomChampion,
  pickRandomMode,
} from '@/lib/quizCeo/lolChampion';
import { LOL_PLAYERS } from '@/lib/quizCeo/lolPlayers';
import {
  ZODIAC_LABEL,
  ZODIAC_LABELS_LIST,
  MBTI_LABELS_LIST,
  type ZodiacSign,
} from '@/lib/quizCeo/zodiacMbti';
import { FRENCH_AD_BRANDS_POOL } from '@/lib/quizCeo/frenchAds';
import { KNOW_ERA_ANSWER_POOL } from '@/lib/quizCeo/knowEra';

const bodySchema = z.object({
  creatorToken: z.string().min(1),
});

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * POST /api/games/quiz-ceo/[code]/start
 *
 * Le créateur lance la partie :
 *   - Tire 20 questions (QUESTION_COUNT_DEFAULT) avec la règle :
 *       1. Une question (random) de chaque type activé (max 16 types).
 *       2. Le reste est rempli avec des `text-question` random.
 *       3. Si `text-question` est désactivé ET qu'il manque des slots,
 *          fallback : on ajoute des questions random parmi les types
 *          activés (rotation équilibrée, sans répéter une même question).
 *       4. Shuffle final pour que les fillers `text-question` soient
 *          intercalés et pas tous concentrés à la fin de la partie.
 *   - Pour chaque question de type "ranking", regénère un shuffledOrder frais.
 *   - Crée QuizCeoGame + un QuizCeoPlayerState par joueur.
 *   - Pose Room.gameStarted = true.
 *
 * Le nombre de questions est figé à 20 — la modification depuis le lobby
 * a été retirée (cf. CLAUDE.md). `room.quizCeoQuestionCount` n'est plus lu.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { creatorToken } = bodySchema.parse(body);

    const room = await prisma.room.findUnique({
      where: { code },
      include: { players: true, quizCeoGame: true },
    });
    if (!room) return Response.json({ error: 'Room not found' }, { status: 404 });
    if (!isCreator(room, creatorToken)) {
      return Response.json(
        { error: 'Only the room creator can start the game' },
        { status: 403 },
      );
    }
    if (room.players.length === 0) {
      return Response.json({ error: 'No players in room' }, { status: 400 });
    }

    const disabled: string[] = room.quizCeoDisabledTypes ?? [];
    const enabledTypes: QuestionTypeId[] = QUESTION_TYPE_IDS.filter(
      (t) => !disabled.includes(t),
    );
    if (enabledTypes.length === 0) {
      return Response.json(
        { error: 'Au moins un type de question doit être activé' },
        { status: 400 },
      );
    }

    // On tire les questions parmi les types activés.
    const pool = await prisma.quizCeoQuestion.findMany({
      where: { type: { in: enabledTypes } },
    });
    if (pool.length === 0) {
      return Response.json(
        { error: 'Aucune question disponible pour les types sélectionnés' },
        { status: 400 },
      );
    }

    // Nombre de questions figé (cf. JSDoc du handler).
    const desiredCount = QUESTION_COUNT_DEFAULT;

    // Index par type pour piocher rapidement.
    const byType = new Map<string, typeof pool>();
    for (const q of pool) {
      const t = q.type;
      const list = byType.get(t);
      if (list) list.push(q);
      else byType.set(t, [q]);
    }
    const typesWithQuestions = enabledTypes.filter(
      (t) => (byType.get(t) ?? []).length > 0,
    );

    // Étape 1 — une question random par type activé (ordre aléatoire).
    const picks: typeof pool = [];
    const usedIds = new Set<string>();
    for (const t of shuffle(typesWithQuestions)) {
      const candidates = byType.get(t) ?? [];
      if (candidates.length === 0) continue;
      const pick = candidates[Math.floor(Math.random() * candidates.length)];
      picks.push(pick);
      usedIds.add(pick.id);
    }

    // Étape 2 — fill avec text-question (catégorie de fallback).
    if (picks.length < desiredCount) {
      const textPool = (byType.get('text-question') ?? []).filter(
        (q) => !usedIds.has(q.id),
      );
      const textShuffled = shuffle(textPool);
      const slotsToFill = Math.min(
        desiredCount - picks.length,
        textShuffled.length,
      );
      for (let i = 0; i < slotsToFill; i++) {
        picks.push(textShuffled[i]);
        usedIds.add(textShuffled[i].id);
      }
    }

    // Étape 3 — fallback rotation équilibrée si on n'a toujours pas le compte
    // (cas où text-question est désactivé OU pool text-question vide).
    while (picks.length < desiredCount && typesWithQuestions.length > 0) {
      const order = shuffle(typesWithQuestions);
      let progressedThisRound = false;
      for (const t of order) {
        if (picks.length >= desiredCount) break;
        const candidates = byType.get(t) ?? [];
        const remaining = candidates.filter((c) => !usedIds.has(c.id));
        if (remaining.length === 0) continue;
        const pick = remaining[Math.floor(Math.random() * remaining.length)];
        picks.push(pick);
        usedIds.add(pick.id);
        progressedThisRound = true;
      }
      if (!progressedThisRound) break;
    }

    // Étape 4 — shuffle final pour intercaler les fillers `text-question`
    // au lieu de les bloquer en queue de partie.
    const orderedPicks = shuffle(picks);
    picks.length = 0;
    picks.push(...orderedPicks);

    const snapshot: FullQuestion[] = picks.map((q) => {
      const base = {
        id: q.id,
        type: q.type as QuestionTypeId,
        difficulty: q.difficulty as 'easy' | 'medium' | 'hard',
        points: q.points,
        prompt: q.prompt,
      };
      // Pour slogan-pub : QCM 4 choix avec distractors random tirés du pool
      // de marques FRENCH_AD_BRANDS_POOL. Le DB stocke `payload = { text }`
      // (le slogan) et `answer = { text: brand }`. Au runtime, on tire 3
      // distractors random parmi le pool (sauf la bonne marque) et on shuffle.
      if (q.type === 'slogan-pub') {
        const correctBrand = (q.answer as { text?: string } | null)?.text;
        if (correctBrand) {
          const payload = q.payload as { text?: string };
          const distractorPool = FRENCH_AD_BRANDS_POOL.filter(
            (b) => b !== correctBrand,
          );
          const distractors = shuffle(distractorPool).slice(0, 3);
          const choices = shuffle([correctBrand, ...distractors]) as [
            string,
            string,
            string,
            string,
          ];
          const correctIndex = choices.indexOf(correctBrand);
          return {
            ...base,
            type: 'slogan-pub',
            payload: { text: payload.text ?? '', choices },
            answer: { correctIndex },
          } as FullQuestion;
        }
        return {
          ...base,
          payload: q.payload as unknown as object,
          answer: q.answer as unknown as object,
        } as FullQuestion;
      }
      // Pour Worldle : pays choisi aléatoirement à chaque partie parmi les
      // ~190 pays du monde (≠ jeu solo qui se limite à 44 pays). Le payload
      // reçoit l'URL de la silhouette et l'answer reçoit l'identité pour la
      // validation manuelle par le créateur.
      if (q.type === 'worldle') {
        const country =
          ALL_COUNTRIES[Math.floor(Math.random() * ALL_COUNTRIES.length)];
        const payload: WorldlePayload = {
          imageUrl: getCountryShapePath(country.id),
        };
        const answer: WorldleAnswer = {
          countryId: country.id,
          countryName: country.name,
        };
        return { ...base, type: 'worldle', payload, answer } as FullQuestion;
      }
      // Pour lol-player-match : la DB stocke `payload = LolMatchCardData` et
      // `answer = { text: playerName }`. On transforme en QCM 4 choix à chaque
      // partie : 1 bon + 3 distractors random pris parmi les autres joueurs
      // de `LOL_PLAYERS` (que les `displayName`, jamais les tags `#XXX`).
      if (q.type === 'lol-player-match') {
        const correctName = (q.answer as { text?: string } | null)?.text;
        if (correctName) {
          const distractorPool = LOL_PLAYERS.map((p) => p.displayName).filter(
            (n) => n !== correctName,
          );
          const distractors = shuffle(distractorPool).slice(0, 3);
          const choices = shuffle([correctName, ...distractors]) as [
            string,
            string,
            string,
            string,
          ];
          const correctIndex = choices.indexOf(correctName);
          return {
            ...base,
            type: 'lol-player-match',
            payload: {
              ...(q.payload as object),
              choices,
            } as unknown as object,
            answer: { correctIndex },
          } as FullQuestion;
        }
        // Garde-fou : si l'answer ne contient pas `text`, on retombe sur la
        // shape DB de base (le strip de `answer` empêche tout leak côté client).
        return {
          ...base,
          payload: q.payload as unknown as object,
          answer: q.answer as unknown as object,
        } as FullQuestion;
      }
      // Pour lol-champion : on tire un champion + un mode (splash art filtré
      // « Contours » OU 5 icônes de sorts en disposition « Passif central »)
      // à chaque question. Validation manuelle par le créateur en review.
      if (q.type === 'lol-champion') {
        const champ = pickRandomChampion();
        const mode = pickRandomMode();
        const payload = buildLolPayload(champ, mode);
        return {
          ...base,
          type: 'lol-champion',
          payload,
          answer: { text: champ.name },
        } as FullQuestion;
      }
      // Pour zodiac-mbti : QCM 4 choix où l'énoncé est une description et la
      // réponse est un signe du zodiaque (12 signes) ou un type MBTI (16
      // types). Le `subject` stocké dans le payload détermine le pool de
      // distractors. La DB stocke `payload = { subject, text }` et
      // `answer = { text: <id> }` (ZodiacSign ou MbtiType). On transforme
      // au runtime en QCM 4 choix : 1 bon label + 3 distractors random pris
      // dans le pool correspondant. Les choix changent à chaque partie.
      if (q.type === 'zodiac-mbti') {
        const payload = q.payload as unknown as {
          subject: 'zodiac' | 'mbti';
          text: string;
        };
        const rawAnswer = (q.answer as { text?: string } | null)?.text ?? '';
        const isZodiac = payload.subject === 'zodiac';
        const correctLabel = isZodiac
          ? ZODIAC_LABEL[rawAnswer as ZodiacSign] ?? rawAnswer
          : rawAnswer;
        const pool = isZodiac ? ZODIAC_LABELS_LIST : MBTI_LABELS_LIST;
        const distractorPool = pool.filter((l) => l !== correctLabel);
        const distractors = shuffle(distractorPool).slice(0, 3);
        const choices = shuffle([correctLabel, ...distractors]) as [
          string,
          string,
          string,
          string,
        ];
        const correctIndex = choices.indexOf(correctLabel);
        return {
          ...base,
          type: 'zodiac-mbti',
          payload: {
            subject: payload.subject,
            text: payload.text,
            choices,
          },
          answer: { correctIndex },
        } as FullQuestion;
      }
      // Pour know-era : QCM 4 choix avec distractors curés (jusqu'à 3) +
      // complétion runtime depuis le pool global des autres réponses du
      // catalogue si l'entrée en a moins de 3. La DB stocke
      // `payload = { text, distractors }` et `answer = { text }`.
      if (q.type === 'know-era') {
        const correct = (q.answer as { text?: string } | null)?.text;
        const payload = q.payload as { text?: string; distractors?: string[] };
        if (correct) {
          const provided = (payload.distractors ?? []).filter(
            (d) => typeof d === 'string' && d.length > 0 && d !== correct,
          );
          let chosen = provided.slice();
          if (chosen.length < 3) {
            const pool = KNOW_ERA_ANSWER_POOL.filter(
              (a) => a !== correct && !chosen.includes(a),
            );
            const need = 3 - chosen.length;
            chosen = [...chosen, ...shuffle(pool).slice(0, need)];
          } else if (chosen.length > 3) {
            chosen = shuffle(chosen).slice(0, 3);
          }
          const choices = shuffle([correct, ...chosen]) as [
            string,
            string,
            string,
            string,
          ];
          const correctIndex = choices.indexOf(correct);
          return {
            ...base,
            type: 'know-era',
            payload: { text: payload.text ?? '', choices },
            answer: { correctIndex },
          } as FullQuestion;
        }
        return {
          ...base,
          payload: q.payload as unknown as object,
          answer: q.answer as unknown as object,
        } as FullQuestion;
      }
      // Pour brand-logo : marque choisie aléatoirement à chaque partie parmi
      // celles dont le SVG existe réellement sous `public/brand-logos/`.
      if (q.type === 'brand-logo') {
        const brands = getAvailableBrands();
        if (brands.length === 0) {
          // Pas de logo dispo : on garde le payload du seed (placeholder).
          return {
            ...base,
            payload: q.payload as unknown as object,
            answer: q.answer as unknown as object,
          } as FullQuestion;
        }
        const brand = brands[Math.floor(Math.random() * brands.length)];
        return {
          ...base,
          type: 'brand-logo',
          payload: { imageUrl: getBrandLogoPath(brand.slug) },
          answer: { text: brand.name },
        } as FullQuestion;
      }
      return {
        ...base,
        payload: q.payload as unknown as object,
        answer: q.answer as unknown as object,
      } as FullQuestion;
    });

    // Nettoyage d'une partie précédente pour cette room (cascade sur states).
    if (room.quizCeoGame) {
      await prisma.quizCeoGame.delete({ where: { roomId: room.id } });
    }

    const now = new Date();
    await prisma.quizCeoGame.create({
      data: {
        roomId: room.id,
        questions: snapshot as unknown as object,
        phase: 'playing',
        currentIndex: 0,
        questionStartedAt: now,
        timerSeconds: room.quizCeoTimerSeconds ?? 30,
        playerStates: {
          create: room.players.map((p) => ({ playerId: p.id })),
        },
      },
    });

    await prisma.room.update({
      where: { id: room.id },
      data: { gameStarted: true, gameStopped: false },
    });

    await pushRoomUpdate(code);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[QUIZ-CEO] start error:', error);
    return Response.json({ error: 'Failed to start game' }, { status: 500 });
  }
}
