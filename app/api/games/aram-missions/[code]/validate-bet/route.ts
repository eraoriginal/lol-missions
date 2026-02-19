import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const { creatorToken, playerBetId, validated } = await request.json();

        if (!creatorToken || !playerBetId || validated === undefined) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const room = await prisma.room.findUnique({ where: { code } });
        if (!room) {
            return Response.json({ error: 'Room not found' }, { status: 404 });
        }
        if (room.creatorToken !== creatorToken) {
            return Response.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await prisma.playerBet.update({
            where: { id: playerBetId },
            data: {
                decided: true,
                validated: validated as boolean,
            },
        });

        await pushRoomUpdate(code);

        return Response.json({ success: true });
    } catch (error) {
        console.error('Error validating bet:', error);
        return Response.json({ error: 'Failed to validate bet' }, { status: 500 });
    }
}
