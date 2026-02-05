import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';
import { assignBalancedMissions } from '@/lib/balancedMissionAssignment';

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
                { error: 'Only the creator can restart the game' },
                { status: 403 }
            );
        }

        // Supprime toutes les missions existantes
        await prisma.playerMission.deleteMany({
            where: {
                playerId: { in: room.players.map(p => p.id) },
            },
        });

        // Récupère et mélange les missions START
        const startMissions = await prisma.mission.findMany({ where: { type: 'START', OR: [{ maps: room.gameMap }, { maps: 'all' }] } });

        if (startMissions.length < room.players.length) {
            return Response.json({ error: 'Not enough missions available' }, { status: 500 });
        }

        // Assigne les missions START de façon aléatoire
        const assignments = assignBalancedMissions(room.players, startMissions, 'START');

        await Promise.all(
            room.players.map((player) => {
                const mission = assignments.get(player.id);
                if (!mission) return Promise.resolve();
                return prisma.playerMission.create({
                    data: {
                        playerId: player.id,
                        missionId: mission.id,
                        type: 'START',
                    },
                });
            })
        );

        // Reset le timer mais garde gameStarted = true
        await prisma.room.update({
            where: { id: room.id },
            data: {
                gameStartTime: null,
                gameStopped: false,
                validationStatus: 'not_started',
            },
        });

        console.log(`[RESTART-GAME] Game restarted in room ${code}, teams preserved, new START missions assigned`);

        await pushRoomUpdate(code);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error restarting game:', error);
        return Response.json({ error: 'Failed to restart game' }, { status: 500 });
    }
}
