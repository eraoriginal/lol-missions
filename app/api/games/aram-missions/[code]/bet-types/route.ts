import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        const room = await prisma.room.findUnique({ where: { code } });
        if (!room) {
            return Response.json({ error: 'Room not found' }, { status: 404 });
        }

        const betTypes = await prisma.betType.findMany({
            orderBy: { category: 'asc' },
        });

        return Response.json({ betTypes });
    } catch (error) {
        console.error('Error fetching bet types:', error);
        return Response.json({ error: 'Failed to fetch bet types' }, { status: 500 });
    }
}
