import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const body = await request.json();
        const { creatorToken } = body;

        const room = await prisma.room.findUnique({
            where: { code },
            include: {
                players: {
                    include: { missions: true },
                },
            },
        });

        if (!room) {
            return Response.json({ error: 'Room not found' }, { status: 404 });
        }

        if (!isCreator(room, creatorToken)) {
            return Response.json(
                { error: 'Only the creator can reset to team selection' },
                { status: 403 }
            );
        }

        // Supprime toutes les missions existantes, choix pendants et événements
        const playerIds = room.players.map(p => p.id);
        await prisma.playerMission.deleteMany({
            where: { playerId: { in: playerIds } },
        });
        await prisma.pendingMissionChoice.deleteMany({
            where: { playerId: { in: playerIds } },
        });
        await prisma.roomEvent.deleteMany({
            where: { roomId: room.id },
        });
        await prisma.playerBet.deleteMany({
            where: { roomId: room.id },
        });

        // Reset la room à l'état de sélection des équipes
        await prisma.room.update({
            where: { id: room.id },
            data: {
                gameStarted: false,
                gameStartTime: null,
                gameStopped: false,
                validationStatus: 'not_started',
                eventPausedAt: null,
                totalPausedDuration: 0,
            },
        });

        console.log(`[RESET-TO-TEAMS] Room ${code} reset to team selection`);

        await pushRoomUpdate(code);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error resetting to teams:', error);
        return Response.json({ error: 'Failed to reset to team selection' }, { status: 500 });
    }
}
