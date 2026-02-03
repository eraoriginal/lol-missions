import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate, pushSoundEvent } from '@/lib/pusher';
import { z } from 'zod';

const guessSchema = z.object({
  playerToken: z.string(),
  cardId: z.string(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerToken, cardId } = guessSchema.parse(body);

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
      return Response.json({ error: 'Only operatives can guess cards' }, { status: 403 });
    }

    if (player.team !== game.currentTeam) {
      return Response.json({ error: "It's not your team's turn" }, { status: 400 });
    }

    if (!game.currentClue) {
      return Response.json({ error: 'Wait for your spymaster to give a clue' }, { status: 400 });
    }

    if (game.guessesLeft <= 0) {
      return Response.json({ error: 'No guesses remaining' }, { status: 400 });
    }

    const card = game.cards.find((c) => c.id === cardId);

    if (!card) {
      return Response.json({ error: 'Card not found' }, { status: 404 });
    }

    if (card.revealed) {
      return Response.json({ error: 'Card already revealed' }, { status: 400 });
    }

    // Reveal the card and clear its interests
    await prisma.codenameCard.update({
      where: { id: card.id },
      data: { revealed: true },
    });

    // Clear all interests on the revealed card
    await prisma.cardInterest.deleteMany({
      where: { cardId: card.id },
    });

    // Add to history
    await prisma.codenameHistory.create({
      data: {
        gameId: game.id,
        team: game.currentTeam,
        type: 'guess',
        cardWord: card.word,
        cardColor: card.color,
      },
    });

    let newRedRemaining = game.redRemaining;
    let newBlueRemaining = game.blueRemaining;
    let newGuessesLeft = game.guessesLeft - 1;
    let newCurrentTeam = game.currentTeam;
    let gameOver = false;
    let winner: string | null = null;
    let clearClue = false;
    let resultType: 'correct' | 'wrong_team' | 'neutral' | 'assassin';

    if (card.color === 'assassin') {
      // Game over - the other team wins
      gameOver = true;
      winner = game.currentTeam === 'red' ? 'blue' : 'red';
      resultType = 'assassin';
      console.log(`[CODENAME] ASSASSIN! Team ${game.currentTeam} hit the assassin. ${winner} wins!`);
    } else if (card.color === game.currentTeam) {
      // Correct guess
      if (game.currentTeam === 'red') {
        newRedRemaining--;
      } else {
        newBlueRemaining--;
      }
      resultType = 'correct';

      // Check for win
      if (newRedRemaining === 0) {
        gameOver = true;
        winner = 'red';
        console.log(`[CODENAME] Red team wins! All red cards found.`);
      } else if (newBlueRemaining === 0) {
        gameOver = true;
        winner = 'blue';
        console.log(`[CODENAME] Blue team wins! All blue cards found.`);
      } else if (newGuessesLeft <= 0) {
        // No more guesses, switch turn
        newCurrentTeam = game.currentTeam === 'red' ? 'blue' : 'red';
        clearClue = true;
        console.log(`[CODENAME] No guesses left, switching to team ${newCurrentTeam}`);
      }
    } else if (card.color === 'neutral') {
      // Neutral card - turn ends
      newCurrentTeam = game.currentTeam === 'red' ? 'blue' : 'red';
      clearClue = true;
      resultType = 'neutral';
      console.log(`[CODENAME] Neutral card! Turn ends, switching to team ${newCurrentTeam}`);
    } else {
      // Wrong team's card - helps opponent and ends turn
      if (card.color === 'red') {
        newRedRemaining--;
      } else {
        newBlueRemaining--;
      }
      resultType = 'wrong_team';

      // Check if this gives opponent the win
      if (newRedRemaining === 0) {
        gameOver = true;
        winner = 'red';
        console.log(`[CODENAME] Red team wins! (opponent revealed their last card)`);
      } else if (newBlueRemaining === 0) {
        gameOver = true;
        winner = 'blue';
        console.log(`[CODENAME] Blue team wins! (opponent revealed their last card)`);
      } else {
        newCurrentTeam = game.currentTeam === 'red' ? 'blue' : 'red';
        clearClue = true;
        console.log(`[CODENAME] Wrong team card! Turn ends, switching to team ${newCurrentTeam}`);
      }
    }

    // Clear ALL interests when turn ends or game over
    if (clearClue || gameOver) {
      const cardIds = game.cards.map(c => c.id);
      await prisma.cardInterest.deleteMany({
        where: { cardId: { in: cardIds } },
      });
    }

    // Update game state
    const updatedGame = await prisma.codenameGame.update({
      where: { id: game.id },
      data: {
        redRemaining: newRedRemaining,
        blueRemaining: newBlueRemaining,
        guessesLeft: clearClue ? 0 : newGuessesLeft,
        currentTeam: newCurrentTeam,
        currentClue: clearClue || gameOver ? null : game.currentClue,
        currentNumber: clearClue || gameOver ? null : game.currentNumber,
        gameOver,
        winner,
      },
      include: {
        cards: {
          orderBy: { position: 'asc' },
        },
      },
    });

    console.log(
      `[CODENAME] ${player.name} guessed "${card.word}" (${card.color}) - ${resultType}`
    );

    // Push sound event to all players
    const isVictory = gameOver && winner;
    if (isVictory && resultType === 'correct') {
      // Only play victory sound when winning by finding all cards
      await pushSoundEvent(code, 'victory');
    } else if (isVictory) {
      // Other game over scenarios (assassin, opponent helped us win)
      await pushSoundEvent(code, resultType);
      // Victory sound will be played after a delay on client side
      setTimeout(() => pushSoundEvent(code, 'victory'), 500);
    } else {
      // Normal guess, no victory
      await pushSoundEvent(code, resultType);
    }

    await pushRoomUpdate(code);

    return Response.json({
      game: updatedGame,
      result: {
        type: resultType,
        cardColor: card.color,
        cardWord: card.word,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error guessing card:', error);
    return Response.json({ error: 'Failed to process guess' }, { status: 500 });
  }
}
