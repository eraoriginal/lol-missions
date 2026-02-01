import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';
import { z } from 'zod';

const restartSchema = z.object({
  creatorToken: z.string(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { creatorToken } = restartSchema.parse(body);

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
        { error: 'Only the room creator can restart the game' },
        { status: 403 }
      );
    }

    if (!room.codenameGame) {
      return Response.json({ error: 'No game to restart' }, { status: 400 });
    }

    // Delete old cards
    await prisma.codenameCard.deleteMany({
      where: { gameId: room.codenameGame.id },
    });

    // Reset player roles but keep teams
    await prisma.player.updateMany({
      where: { roomId: room.id },
      data: { role: null },
    });

    // Reset game state (without cards - go back to role selection phase)
    const updatedGame = await prisma.codenameGame.update({
      where: { id: room.codenameGame.id },
      data: {
        currentTeam: 'red',
        redRemaining: 9,
        blueRemaining: 8,
        gameOver: false,
        winner: null,
        currentClue: null,
        currentNumber: null,
        guessesLeft: 0,
        // No cards - will be created via generate-board after spymaster selection
      },
      include: {
        cards: {
          orderBy: { position: 'asc' },
        },
      },
    });

    // Reset game start time
    await prisma.room.update({
      where: { id: room.id },
      data: {
        gameStartTime: null,
      },
    });

    console.log(`[CODENAME] Game restarted in room ${code} - returning to role selection`);

    await pushRoomUpdate(code);

    return Response.json({ game: updatedGame });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error restarting game:', error);
    return Response.json({ error: 'Failed to restart game' }, { status: 500 });
  }
}
