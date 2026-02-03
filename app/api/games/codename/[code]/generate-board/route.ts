import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';
import { z } from 'zod';

const generateBoardSchema = z.object({
  creatorToken: z.string(),
});

// Fisher-Yates shuffle
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { creatorToken } = generateBoardSchema.parse(body);

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
        { error: 'Only the room creator can generate the board' },
        { status: 403 }
      );
    }

    if (!room.codenameGame) {
      return Response.json({ error: 'Game not started yet' }, { status: 400 });
    }

    // Check if board already has cards
    if (room.codenameGame.cards.length > 0) {
      return Response.json({ error: 'Board already generated' }, { status: 400 });
    }

    // Check both teams have a spymaster
    const redPlayers = room.players.filter((p) => p.team === 'red');
    const bluePlayers = room.players.filter((p) => p.team === 'blue');
    const redSpymaster = redPlayers.find((p) => p.role === 'spymaster');
    const blueSpymaster = bluePlayers.find((p) => p.role === 'spymaster');

    if (!redSpymaster) {
      return Response.json(
        { error: "L'équipe Rouge n'a pas de Maître-Espion" },
        { status: 400 }
      );
    }

    if (!blueSpymaster) {
      return Response.json(
        { error: "L'équipe Bleue n'a pas de Maître-Espion" },
        { status: 400 }
      );
    }

    // Set all non-spymaster players as operatives
    await prisma.player.updateMany({
      where: {
        roomId: room.id,
        team: { in: ['red', 'blue'] },
        role: null,
      },
      data: { role: 'operative' },
    });

    // Get selected categories
    const selectedCategories = room.selectedCategories || [];

    // Each category gets 1-3 random cards, the rest comes from default category
    let wordsToUse: { word: string; category: string | null }[] = [];

    // Always get default words (no category)
    const defaultWords = await prisma.codenameWord.findMany({
      where: { category: null },
    });
    const shuffledDefaultWords = shuffle(defaultWords.map(w => ({ word: w.word, category: w.category })));

    if (selectedCategories.length > 0) {
      // Pick 1-3 random cards from each selected category
      for (const category of selectedCategories) {
        const categoryWords = await prisma.codenameWord.findMany({
          where: { category },
        });

        if (categoryWords.length === 0) {
          console.log(`[CODENAME] Category "${category}" has no words, skipping`);
          continue;
        }

        // Random number between 1 and 3 (but not more than available words)
        const maxCards = Math.min(3, categoryWords.length);
        const wordsForThisCategory = Math.floor(Math.random() * maxCards) + 1;

        const shuffledCategoryWords = shuffle(categoryWords);
        const selectedCategoryWords = shuffledCategoryWords
          .slice(0, wordsForThisCategory)
          .map(w => ({ word: w.word, category: w.category }));

        wordsToUse.push(...selectedCategoryWords);
      }

      // Fill the rest with default words (25 total)
      const remainingCount = 25 - wordsToUse.length;

      if (shuffledDefaultWords.length < remainingCount) {
        return Response.json(
          { error: `Pas assez de mots par défaut. Il en faut au moins ${remainingCount}.` },
          { status: 400 }
        );
      }

      wordsToUse.push(...shuffledDefaultWords.slice(0, remainingCount));
    } else {
      // No categories selected - use only default words
      if (shuffledDefaultWords.length < 25) {
        return Response.json(
          { error: 'Pas assez de mots par défaut. Il faut au moins 25 mots.' },
          { status: 500 }
        );
      }

      wordsToUse = shuffledDefaultWords.slice(0, 25);
    }

    // Shuffle the final words
    const shuffledWords = shuffle(wordsToUse);

    // Assign colors: 9 red, 8 blue, 7 neutral, 1 assassin
    // Red team starts (has 9 cards)
    const colors: string[] = [
      ...Array(9).fill('red'),
      ...Array(8).fill('blue'),
      ...Array(7).fill('neutral'),
      'assassin',
    ];
    const shuffledColors = shuffle(colors);

    // Create cards for the game
    await prisma.codenameCard.createMany({
      data: shuffledWords.map((wordData, index) => ({
        gameId: room.codenameGame!.id,
        word: wordData.word,
        category: wordData.category,
        color: shuffledColors[index],
        revealed: false,
        position: index,
      })),
    });

    // Update game start time
    await prisma.room.update({
      where: { id: room.id },
      data: {
        gameStartTime: new Date(),
      },
    });

    const updatedGame = await prisma.codenameGame.findUnique({
      where: { id: room.codenameGame.id },
      include: {
        cards: {
          orderBy: { position: 'asc' },
        },
      },
    });

    console.log(`[CODENAME] Board generated in room ${code}`);

    await pushRoomUpdate(code);

    return Response.json({ game: updatedGame });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error generating board:', error);
    return Response.json({ error: 'Failed to generate board' }, { status: 500 });
  }
}
