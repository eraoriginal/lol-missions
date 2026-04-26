import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';
import { QUESTION_TYPE_IDS } from '@/lib/quizCeo/config';

const bodySchema = z.object({
  creatorToken: z.string().min(1),
  typeId: z.string().min(1),
  enabled: z.boolean(),
});

/**
 * POST /api/games/quiz-ceo/[code]/toggle-type
 *
 * Le créateur (dé)sélectionne un type de question.
 * Le tableau Room.quizCeoDisabledTypes stocke les types DÉSACTIVÉS.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { creatorToken, typeId, enabled } = bodySchema.parse(body);

    if (!(QUESTION_TYPE_IDS as readonly string[]).includes(typeId)) {
      return Response.json({ error: 'Unknown type' }, { status: 400 });
    }

    const room = await prisma.room.findUnique({ where: { code } });
    if (!room) return Response.json({ error: 'Room not found' }, { status: 404 });
    if (!isCreator(room, creatorToken)) {
      return Response.json({ error: 'Only the creator can change settings' }, { status: 403 });
    }

    const current: string[] = room.quizCeoDisabledTypes ?? [];
    const next = enabled
      ? current.filter((t) => t !== typeId) // on active → on retire de la liste des désactivés
      : Array.from(new Set([...current, typeId])); // on désactive → on ajoute

    await prisma.room.update({
      where: { id: room.id },
      data: { quizCeoDisabledTypes: next },
    });
    await pushRoomUpdate(code);
    return Response.json({ ok: true, disabledTypes: next });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input' }, { status: 400 });
    }
    console.error('[QUIZ-CEO] toggle-type error:', error);
    return Response.json({ error: 'Failed to toggle type' }, { status: 500 });
  }
}
