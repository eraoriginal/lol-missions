import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';
import { filterPrivateMissions } from '@/lib/filterPrivateMissions';
import { assignBalancedMissions } from '@/lib/balancedMissionAssignment';
import { z } from 'zod';

const startGameSchema = z.object({
    creatorToken: z.string(),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const body = await request.json();
        const { creatorToken } = startGameSchema.parse(body);

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
                { error: 'Only the room creator can start the game' },
                { status: 403 }
            );
        }

        if (room.gameStarted) {
            return Response.json({ error: 'Game already started' }, { status: 400 });
        }

        if (room.players.length < 2) {
            return Response.json({ error: 'Need at least 2 players to start' }, { status: 400 });
        }

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

        // gameStarted = true, mais gameStartTime reste null
        // Le compteur ne démarre que quand le créateur clique "Lancer le compteur"
        const updatedRoom = await prisma.room.update({
            where: { id: room.id },
            data: {
                gameStarted: true,
                gameStartTime: null,
            },
            include: {
                players: {
                    include: { missions: { include: { mission: true } } },
                },
            },
        });

        console.log(`[START] Game started in room ${code} — waiting for countdown launch`);

        // Push : partie démarrée + missions START assignées
        await pushRoomUpdate(code);

        return Response.json({ room: filterPrivateMissions(updatedRoom, null) });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
        }
        console.error('Error starting game:', error);
        return Response.json({ error: 'Failed to start game' }, { status: 500 });
    }
}
