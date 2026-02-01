import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { z } from 'zod';

const passSchema = z.object({
  playerToken: z.string(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerToken } = passSchema.parse(body);

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

    const game = room.codenameGame;

    if (!game) {
      return Response.json({ error: 'Game not started yet' }, { status: 400 });
    }

    if (game.gameOver) {
      return Response.json({ error: 'Game is already over' }, { status: 400 });
    }

    const player = room.players.find((p) => p.token === playerToken);

    if (!player) {
      return Response.json({ error: 'Player not found' }, { status: 404 });
    }

    if (player.role !== 'operative') {
      return Response.json({ error: 'Only operatives can pass' }, { status: 403 });
    }

    if (player.team !== game.currentTeam) {
      return Response.json({ error: "It's not your team's turn" }, { status: 400 });
    }

    if (!game.currentClue) {
      return Response.json({ error: 'Cannot pass before a clue is given' }, { status: 400 });
    }

    // Switch to the other team
    const newCurrentTeam = game.currentTeam === 'red' ? 'blue' : 'red';

    // Clear all card interests when turn ends
    const cardIds = game.cards.map(c => c.id);
    await prisma.cardInterest.deleteMany({
      where: { cardId: { in: cardIds } },
    });

    const updatedGame = await prisma.codenameGame.update({
      where: { id: game.id },
      data: {
        currentTeam: newCurrentTeam,
        currentClue: null,
        currentNumber: null,
        guessesLeft: 0,
      },
      include: {
        cards: {
          orderBy: { position: 'asc' },
        },
      },
    });

    console.log(`[CODENAME] Team ${game.currentTeam} passed. Now team ${newCurrentTeam}'s turn.`);

    await pushRoomUpdate(code);

    return Response.json({ game: updatedGame });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error passing turn:', error);
    return Response.json({ error: 'Failed to pass turn' }, { status: 500 });
  }
}
