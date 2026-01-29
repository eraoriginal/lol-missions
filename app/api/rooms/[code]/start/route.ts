import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isCreator } from '@/lib/utils';
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

        // Récupère la room
        const room = await prisma.room.findUnique({
            where: { code },
            include: {
                players: {
                    include: {
                        missions: true,
                    },
                },
            },
        });

        if (!room) {
            return Response.json(
                { error: 'Room not found' },
                { status: 404 }
            );
        }

        // Vérifie que c'est le créateur
        if (!isCreator(room, creatorToken)) {
            return Response.json(
                { error: 'Only the room creator can start the game' },
                { status: 403 }
            );
        }

        // Vérifie que la game n'a pas déjà commencé
        if (room.gameStarted) {
            return Response.json(
                { error: 'Game already started' },
                { status: 400 }
            );
        }

        // Vérifie qu'il y a au moins 2 joueurs
        if (room.players.length < 2) {
            return Response.json(
                { error: 'Need at least 2 players to start' },
                { status: 400 }
            );
        }

        // Récupère toutes les missions START disponibles
        const startMissions = await prisma.mission.findMany({
            where: { type: 'START' },
        });

        if (startMissions.length < room.players.length) {
            return Response.json(
                { error: 'Not enough missions available' },
                { status: 500 }
            );
        }

        // Mélange les missions (Fisher-Yates shuffle)
        const shuffledMissions = [...startMissions];
        for (let i = shuffledMissions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledMissions[i], shuffledMissions[j]] = [shuffledMissions[j], shuffledMissions[i]];
        }

        // Assigne une mission unique à chaque joueur
        const playerMissionPromises = room.players.map((player, index) => {
            return prisma.playerMission.create({
                data: {
                    playerId: player.id,
                    missionId: shuffledMissions[index].id,
                    type: 'START',
                },
            });
        });

        await Promise.all(playerMissionPromises);

        // Démarre la game
        const updatedRoom = await prisma.room.update({
            where: { id: room.id },
            data: {
                gameStarted: true,
                gameStartTime: new Date(),
            },
            include: {
                players: {
                    include: {
                        missions: {
                            include: {
                                mission: true,
                            },
                        },
                    },
                },
            },
        });

        console.log(`[START] Game started in room ${code}`);

        return Response.json({ room: updatedRoom });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return Response.json(
                { error: 'Invalid input', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Error starting game:', error);
        return Response.json(
            { error: 'Failed to start game' },
            { status: 500 }
        );
    }
}