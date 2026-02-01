import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { z } from 'zod';

const categorySchema = z.object({
  creatorToken: z.string(),
  categories: z.array(z.string()),
});

// GET - Get available categories and selected categories
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const room = await prisma.room.findUnique({
      where: { code },
      select: { selectedCategories: true },
    });

    if (!room) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    // Get all unique categories from the database
    const categories = await prisma.codenameWord.groupBy({
      by: ['category'],
      _count: { category: true },
      orderBy: { category: 'asc' },
    });

    // Count default words (category = null)
    const defaultWordCount = await prisma.codenameWord.count({
      where: { category: null },
    });

    const availableCategories = categories
      .filter(c => c.category !== null)
      .map(c => ({
        name: c.category!,
        count: c._count.category,
      }));

    return Response.json({
      availableCategories,
      selectedCategories: room.selectedCategories,
      defaultWordCount,
    });
  } catch (error) {
    console.error('Error getting categories:', error);
    return Response.json({ error: 'Failed to get categories' }, { status: 500 });
  }
}

// POST - Update selected categories
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { creatorToken, categories } = categorySchema.parse(body);

    const room = await prisma.room.findUnique({
      where: { code },
    });

    if (!room) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    if (room.creatorToken !== creatorToken) {
      return Response.json({ error: 'Only the creator can change categories' }, { status: 403 });
    }

    // Update selected categories
    await prisma.room.update({
      where: { code },
      data: { selectedCategories: categories },
    });

    console.log(`[CODENAME] Categories updated for room ${code}:`, categories);

    // Push update to all players
    await pushRoomUpdate(code);

    return Response.json({ success: true, selectedCategories: categories });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error updating categories:', error);
    return Response.json({ error: 'Failed to update categories' }, { status: 500 });
  }
}
