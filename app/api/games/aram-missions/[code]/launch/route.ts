import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';
import { computeEventSchedule } from '@/lib/eventScheduling';
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

        const room = await prisma.room.findUnique({
            where: { code },
            include: { players: true },
        });

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

        // Planifier les événements aléatoires si activé
        if (room.maxEventsPerGame > 0) {
            const schedule = computeEventSchedule({
                maxEvents: room.maxEventsPerGame,
                midMissionDelay: room.midMissionDelay,
                lateMissionDelay: room.lateMissionDelay,
            });

            if (schedule.length > 0) {
                // Récupérer les événements disponibles par type, filtrés par minPlayers
                const playerCount = room.players.filter(p => p.team === 'red' || p.team === 'blue').length;
                const usedEventIds: string[] = [];

                for (const slot of schedule) {
                    const events = await prisma.event.findMany({
                        where: {
                            type: slot.type,
                            id: { notIn: usedEventIds },
                            OR: [{ minPlayers: null }, { minPlayers: { lte: playerCount } }],
                        },
                    });

                    if (events.length === 0) {
                        console.warn(`[LAUNCH] No events available for type ${slot.type}`);
                        continue;
                    }

                    const picked = events[Math.floor(Math.random() * events.length)];
                    usedEventIds.push(picked.id);

                    await prisma.roomEvent.create({
                        data: {
                            roomId: room.id,
                            eventId: picked.id,
                            scheduledAt: slot.scheduledAt,
                        },
                    });
                }

                console.log(`[LAUNCH] ${usedEventIds.length} events scheduled in room ${code}`);
            }
        }

        console.log(`[LAUNCH] Countdown started in room ${code}`);

        // Push : compteur lancé
        await pushRoomUpdate(code);

        return Response.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
        }
        console.error('Error launching countdown:', error);
        return Response.json({ error: 'Failed to launch countdown' }, { status: 500 });
    }
}
