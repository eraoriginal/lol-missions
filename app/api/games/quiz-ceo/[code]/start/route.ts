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
  RankingPayload,
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
 *   - Tire 25 questions (QUESTION_COUNT_DEFAULT) avec la règle :
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
 * Le nombre de questions est figé à 25 — la modification depuis le lobby
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
      // Pour le ranking, on re-mélange l'ordre d'affichage à chaque partie.
      if (q.type === 'ranking') {
        const payload = q.payload as unknown as RankingPayload;
        const shuffledOrder = shuffle(payload.items.map((it) => it.id));
        return {
          ...base,
          type: 'ranking',
          payload: { ...payload, shuffledOrder },
          answer: q.answer as unknown as { order: string[] },
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
