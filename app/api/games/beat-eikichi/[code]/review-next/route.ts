import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';
import { BEAT_EIKICHI_CONFIG } from '@/lib/beatEikichi/config';

const bodySchema = z.object({
  creatorToken: z.string().min(1),
});

/**
 * POST /api/games/beat-eikichi/[code]/review-next
 *
 * Le maître passe à la review suivante. Après la dernière (20ᵉ), passe en phase "leaderboard".
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
      return Response.json({ error: 'Only the creator can advance review' }, { status: 403 });
    }
    if (room.beatEikichiGame.phase !== 'review') {
      return Response.json({ ok: true, skipped: 'not in review' });
    }

    const total = BEAT_EIKICHI_CONFIG.QUESTIONS_PER_GAME;
    const nextIndex = room.beatEikichiGame.currentIndex + 1;

    if (nextIndex >= total) {
      await prisma.beatEikichiGame.update({
        where: { id: room.beatEikichiGame.id },
        data: { phase: 'leaderboard' },
      });
    } else {
      await prisma.beatEikichiGame.update({
        where: { id: room.beatEikichiGame.id },
        data: { currentIndex: nextIndex },
      });
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
    console.error('[BEAT-EIKICHI] review-next error:', error);
    return Response.json({ error: 'Failed to advance review' }, { status: 500 });
  }
}
