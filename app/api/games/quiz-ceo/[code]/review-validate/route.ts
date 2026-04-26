import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';
import { splitMusicPoints } from '@/lib/quizCeo/config';
import type { FullQuestion, PlayerAnswerEntry } from '@/lib/quizCeo/types';

const bodySchema = z.object({
  creatorToken: z.string().min(1),
  playerId: z.string().min(1),
  position: z.number().int().min(0),
  // Pour le type "music" : validation granulaire.
  validated: z.boolean().optional(),
  validatedArtist: z.boolean().optional(),
  validatedTitle: z.boolean().optional(),
});

/**
 * POST /api/games/quiz-ceo/[code]/review-validate
 *
 * Le créateur valide ou invalide la réponse d'un joueur pour la question
 * de position `position` pendant la phase review.
 *
 * Le score du joueur est recalculé à partir de toutes ses réponses validées.
 * Idempotent : on peut bascule `validated` true/false autant de fois qu'on veut.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const parsed = bodySchema.parse(body);

    const room = await prisma.room.findUnique({
      where: { code },
      include: {
        quizCeoGame: { include: { playerStates: true } },
      },
    });
    if (!room || !room.quizCeoGame) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }
    if (!isCreator(room, parsed.creatorToken)) {
      return Response.json(
        { error: 'Only the creator can validate answers' },
        { status: 403 },
      );
    }
    const game = room.quizCeoGame;
    if (game.phase !== 'review') {
      return Response.json({ error: 'Not in review phase' }, { status: 400 });
    }

    const questions = game.questions as unknown as FullQuestion[];
    const q = questions[parsed.position];
    if (!q) {
      return Response.json({ error: 'Question not found' }, { status: 400 });
    }

    const state = game.playerStates.find((s) => s.playerId === parsed.playerId);
    if (!state) {
      return Response.json({ error: 'Player state not found' }, { status: 404 });
    }

    const answers = (state.answers as unknown as PlayerAnswerEntry[]) ?? [];
    let existing = answers.find((a) => a.position === parsed.position);
    if (!existing) {
      // Le joueur n'a rien soumis : on crée une entry vide validable à 0 pt.
      existing = {
        position: parsed.position,
        type: q.type,
        submitted: null,
      };
      answers.push(existing);
    }

    // Calcul des points selon le type.
    let pointsAwarded = 0;
    let updatedEntry: PlayerAnswerEntry;
    if (q.type === 'music') {
      const split = splitMusicPoints(q.points);
      const newArtist =
        parsed.validatedArtist ?? existing.validatedArtist ?? false;
      const newTitle =
        parsed.validatedTitle ?? existing.validatedTitle ?? false;
      pointsAwarded =
        (newArtist ? split.artist : 0) + (newTitle ? split.title : 0);
      updatedEntry = {
        ...existing,
        validatedArtist: newArtist,
        validatedTitle: newTitle,
        validated: newArtist && newTitle,
        pointsAwarded,
      };
    } else {
      const newValidated = parsed.validated ?? false;
      pointsAwarded = newValidated ? q.points : 0;
      updatedEntry = {
        ...existing,
        validated: newValidated,
        pointsAwarded,
      };
    }

    const newAnswers = answers.map((a) =>
      a.position === parsed.position ? updatedEntry : a,
    );

    // Recalcul du score total du joueur à partir de toutes les réponses validées.
    const newScore = newAnswers.reduce(
      (sum, a) => sum + (a.pointsAwarded ?? 0),
      0,
    );

    await prisma.quizCeoPlayerState.update({
      where: { id: state.id },
      data: {
        answers: newAnswers as unknown as object,
        score: newScore,
      },
    });

    await pushRoomUpdate(code);
    return Response.json({ ok: true, pointsAwarded, score: newScore });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[QUIZ-CEO] review-validate error:', error);
    return Response.json({ error: 'Failed to validate' }, { status: 500 });
  }
}

