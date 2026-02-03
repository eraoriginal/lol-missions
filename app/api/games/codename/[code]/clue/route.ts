import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { z } from 'zod';

const clueSchema = z.object({
  playerToken: z.string(),
  clue: z.string().min(1).max(50),
  number: z.number().min(0).max(9),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerToken, clue, number } = clueSchema.parse(body);

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

    if (player.role !== 'spymaster') {
      return Response.json({ error: 'Only spymasters can give clues' }, { status: 403 });
    }

    if (player.team !== game.currentTeam) {
      return Response.json({ error: "It's not your team's turn" }, { status: 400 });
    }

    if (game.currentClue) {
      return Response.json({ error: 'A clue has already been given this turn' }, { status: 400 });
    }

    // Validate clue is not a word on the board
    const boardWords = game.cards.map((c) => c.word.toLowerCase());
    if (boardWords.includes(clue.toLowerCase())) {
      return Response.json({ error: 'Clue cannot be a word on the board' }, { status: 400 });
    }

    // Update game with clue
    // guessesLeft = number + 1 (extra guess allowed)
    // If unlimited (0), limit to team's remaining words
    const teamRemaining = game.currentTeam === 'red' ? game.redRemaining : game.blueRemaining;
    const updatedGame = await prisma.codenameGame.update({
      where: { id: game.id },
      data: {
        currentClue: clue,
        currentNumber: number,
        guessesLeft: number === 0 ? teamRemaining : number + 1,
      },
      include: {
        cards: {
          orderBy: { position: 'asc' },
        },
      },
    });

    // Add to history
    await prisma.codenameHistory.create({
      data: {
        gameId: game.id,
        team: game.currentTeam,
        type: 'clue',
        clue,
        number,
      },
    });

    console.log(
      `[CODENAME] Spymaster ${player.name} gave clue: "${clue}" for ${number} in room ${code}`
    );

    await pushRoomUpdate(code);

    return Response.json({ game: updatedGame });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error giving clue:', error);
    return Response.json({ error: 'Failed to give clue' }, { status: 500 });
  }
}
