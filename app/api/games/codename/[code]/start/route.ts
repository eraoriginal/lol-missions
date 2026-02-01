import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';
import { z } from 'zod';

const startGameSchema = z.object({
  creatorToken: z.string(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { creatorToken } = startGameSchema.parse(body);

    const room = await prisma.room.findUnique({
      where: { code },
      include: {
        players: true,
        codenameGame: true,
      },
    });

    if (!room) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    if (!isCreator(room, creatorToken)) {
      return Response.json(
        { error: 'Only the room creator can start the game' },
        { status: 403 }
      );
    }

    if (room.codenameGame) {
      return Response.json({ error: 'Game already in progress' }, { status: 400 });
    }

    // Check we have at least 2 players per team
    const redTeam = room.players.filter((p) => p.team === 'red');
    const blueTeam = room.players.filter((p) => p.team === 'blue');

    if (redTeam.length < 2 || blueTeam.length < 2) {
      return Response.json(
        { error: 'Need at least 2 players per team' },
        { status: 400 }
      );
    }

    // Reset all player roles
    await prisma.player.updateMany({
      where: { roomId: room.id },
      data: { role: null },
    });

    // Create new game WITHOUT cards (cards will be generated after spymaster selection)
    const game = await prisma.codenameGame.create({
      data: {
        roomId: room.id,
        currentTeam: 'red',
        redRemaining: 9,
        blueRemaining: 8,
        gameOver: false,
        winner: null,
        currentClue: null,
        currentNumber: null,
        guessesLeft: 0,
        // No cards yet - will be created via generate-board endpoint
      },
    });

    // Update room to mark game as started (entering role selection phase)
    await prisma.room.update({
      where: { id: room.id },
      data: {
        gameStarted: true,
      },
    });

    console.log(`[CODENAME] Role selection phase started in room ${code}`);

    await pushRoomUpdate(code);

    return Response.json({ game });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error starting codename game:', error);
    return Response.json({ error: 'Failed to start game' }, { status: 500 });
  }
}
