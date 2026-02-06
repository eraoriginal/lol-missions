import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        const room = await prisma.room.findUnique({
            where: { code },
            include: {
                roomEvents: {
                    include: { event: true },
                    orderBy: { scheduledAt: 'asc' },
                },
            },
        });

        if (!room) {
            return Response.json({ error: 'Room not found' }, { status: 404 });
        }

        if (!room.gameStartTime) {
            return Response.json({ newEvents: [] });
        }

        const elapsed = (Date.now() - new Date(room.gameStartTime).getTime()) / 1000;

        // Trouver les événements dus mais pas encore apparus
        const dueEvents = room.roomEvents.filter(
            re => re.scheduledAt <= elapsed && re.appearedAt === null
        );

        if (dueEvents.length === 0) {
            return Response.json({ newEvents: [] });
        }

        // Marquer comme apparus (idempotent grâce au filtre appearedAt === null)
        const updatedEvents = [];
        for (const re of dueEvents) {
            const updated = await prisma.roomEvent.update({
                where: { id: re.id },
                data: { appearedAt: new Date() },
                include: { event: true },
            });
            updatedEvents.push(updated);
        }

        console.log(`[CHECK-EVENTS] ${updatedEvents.length} events appeared in room ${code}`);

        await pushRoomUpdate(code);

        return Response.json({
            newEvents: updatedEvents.map(re => ({
                id: re.id,
                scheduledAt: re.scheduledAt,
                event: re.event,
            })),
        });
    } catch (error) {
        console.error('Error checking events:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
