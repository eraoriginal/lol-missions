import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate, pushStopSounds } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';
import { z } from 'zod';

const resetSchema = z.object({
  creatorToken: z.string(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { creatorToken } = resetSchema.parse(body);

    const room = await prisma.room.findUnique({
      where: { code },
      include: {
        players: true,
        codenameGame: {
          include: { cards: true },
        },
      },
    });

    if (!room) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    if (!isCreator(room, creatorToken)) {
      return Response.json(
        { error: 'Only the room creator can reset the game' },
        { status: 403 }
      );
    }

    // Stop all sounds on all clients
    await pushStopSounds(code);

    if (room.codenameGame) {
      // Delete old cards
      await prisma.codenameCard.deleteMany({
        where: { gameId: room.codenameGame.id },
      });

      // Delete game history
      await prisma.codenameHistory.deleteMany({
        where: { gameId: room.codenameGame.id },
      });

      // Delete the game entirely so a new one can be created
      await prisma.codenameGame.delete({
        where: { id: room.codenameGame.id },
      });
    }

    // Reset player roles but keep teams
    await prisma.player.updateMany({
      where: { roomId: room.id },
      data: { role: null },
    });

    // Set gameStarted to false to return to lobby (team selection)
    await prisma.room.update({
      where: { id: room.id },
      data: {
        gameStarted: false,
        gameStartTime: null,
      },
    });

    console.log(`[CODENAME] Game reset to lobby in room ${code}`);

    await pushRoomUpdate(code);

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error resetting game to lobby:', error);
    return Response.json({ error: 'Failed to reset game' }, { status: 500 });
  }
}
