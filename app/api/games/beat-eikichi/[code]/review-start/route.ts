import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';

const bodySchema = z.object({
  creatorToken: z.string().min(1),
});

/**
 * POST /api/games/beat-eikichi/[code]/review-start
 *
 * Le maître démarre la phase de review : passe de "review_intro" à "review", currentIndex=0.
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
      include: { beatEikichiGame: true },
    });

    if (!room || !room.beatEikichiGame) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }
    if (!isCreator(room, creatorToken)) {
      return Response.json({ error: 'Only the creator can start review' }, { status: 403 });
    }
    if (room.beatEikichiGame.phase !== 'review_intro') {
      return Response.json({ ok: true, skipped: 'not in review_intro' });
    }

    // Gate atomique sur la phase pour idempotence si le créateur double-clique.
    // updateMany WHERE phase='review_intro' garantit qu'une seule transition
    // commit, les autres reçoivent count=0.
    const result = await prisma.beatEikichiGame.updateMany({
      where: { id: room.beatEikichiGame.id, phase: 'review_intro' },
      data: { phase: 'review', currentIndex: 0 },
    });
    if (result.count === 0) {
      return Response.json({ ok: true, skipped: 'already started' });
    }

    await pushRoomUpdate(code);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[BEAT-EIKICHI] review-start error:', error);
    return Response.json({ error: 'Failed to start review' }, { status: 500 });
  }
}
