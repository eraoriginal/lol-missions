import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushInterestUpdate } from '@/lib/pusher';
import { z } from 'zod';

const interestSchema = z.object({
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
    const { playerToken, cardId } = interestSchema.parse(body);

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
      return Response.json({ error: 'Only operatives can mark interest' }, { status: 403 });
    }

    const card = game.cards.find((c) => c.id === cardId);

    if (!card) {
      return Response.json({ error: 'Card not found' }, { status: 404 });
    }

    if (card.revealed) {
      return Response.json({ error: 'Card already revealed' }, { status: 400 });
    }

    // Check if interest already exists
    const existingInterest = await prisma.cardInterest.findUnique({
      where: {
        cardId_playerName: {
          cardId,
          playerName: player.name,
        },
      },
    });

    if (existingInterest) {
      // Remove interest
      await prisma.cardInterest.delete({
        where: { id: existingInterest.id },
      });
    } else {
      // Check max 4 interests per card
      const interestCount = await prisma.cardInterest.count({
        where: { cardId },
      });

      if (interestCount >= 4) {
        return Response.json({ error: 'Maximum 4 players can be interested in a card' }, { status: 400 });
      }

      // Add interest
      await prisma.cardInterest.create({
        data: {
          cardId,
          playerName: player.name,
        },
      });
    }

    const added = !existingInterest;
    await pushInterestUpdate(code, cardId, player.name, added);

    return Response.json({ success: true, added });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error toggling card interest:', error);
    return Response.json({ error: 'Failed to toggle interest' }, { status: 500 });
  }
}
