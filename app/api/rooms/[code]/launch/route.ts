import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isCreator } from '@/lib/utils';
import { z } from 'zod';

const launchSchema = z.object({
    creatorToken: z.string(),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const body = await request.json();
        const { creatorToken } = launchSchema.parse(body);

        const room = await prisma.room.findUnique({ where: { code } });

        if (!room) {
            return Response.json({ error: 'Room not found' }, { status: 404 });
        }

        if (!isCreator(room, creatorToken)) {
            return Response.json(
                { error: 'Only the room creator can launch the countdown' },
                { status: 403 }
            );
        }

        if (!room.gameStarted) {
            return Response.json({ error: 'Game has not started yet' }, { status: 400 });
        }

        if (room.gameStartTime) {
            return Response.json({ error: 'Countdown already launched' }, { status: 400 });
        }

        await prisma.room.update({
            where: { id: room.id },
            data: { gameStartTime: new Date() },
        });

        console.log(`[LAUNCH] Countdown started in room ${code}`);
        return Response.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
        }
        console.error('Error launching countdown:', error);
        return Response.json({ error: 'Failed to launch countdown' }, { status: 500 });
    }
}