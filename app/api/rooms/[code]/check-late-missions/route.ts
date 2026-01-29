import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { broadcastToRoom } from '../events/route';

// Récupère le délai depuis la variable d'environnement
const LATE_MISSION_DELAY = parseInt(process.env.NEXT_PUBLIC_LATE_MISSION_DELAY || '600') * 1000;

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        // Récupère la room
        const room = await prisma.room.findUnique({
            where: { code },
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

        if (!room) {
            return Response.json(
                { error: 'Room not found' },
                { status: 404 }
            );
        }

        if (!room.gameStarted || !room.gameStartTime) {
            return Response.json(
                { error: 'Game not started' },
                { status: 400 }
            );
        }

        const elapsed = Date.now() - new Date(room.gameStartTime).getTime();
        const shouldAssign = elapsed >= LATE_MISSION_DELAY;

        console.log(`[check-late-missions] Room ${code}: elapsed=${Math.floor(elapsed/1000)}s, shouldAssign=${shouldAssign}, delay=${LATE_MISSION_DELAY/1000}s`);

        // Si pas encore le moment
        if (!shouldAssign) {
            return Response.json({
                message: 'Not time yet',
                shouldAssign: false,
                elapsed: Math.floor(elapsed / 1000),
                required: Math.floor(LATE_MISSION_DELAY / 1000),
            });
        }

        // Vérifie si des missions LATE ont déjà été assignées
        const hasLateMissions = room.players.some(player =>
            player.missions.some(m => m.type === 'LATE')
        );

        if (hasLateMissions) {
            return Response.json({
                message: 'LATE missions already assigned',
                shouldAssign: false,
            });
        }

        // Récupère toutes les missions LATE disponibles
        const lateMissions = await prisma.mission.findMany({
            where: { type: 'LATE' },
        });

        if (lateMissions.length < room.players.length) {
            return Response.json(
                { error: 'Not enough LATE missions available' },
                { status: 500 }
            );
        }

        // Mélange les missions (Fisher-Yates)
        const shuffledMissions = [...lateMissions];
        for (let i = shuffledMissions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledMissions[i], shuffledMissions[j]] = [shuffledMissions[j], shuffledMissions[i]];
        }

        // Assigne une mission LATE à chaque joueur
        await Promise.all(
            room.players.map((player, index) =>
                prisma.playerMission.create({
                    data: {
                        playerId: player.id,
                        missionId: shuffledMissions[index].id,
                        type: 'LATE',
                    },
                })
            )
        );

        console.log(`[check-late-missions] LATE missions assigned to room ${code}`);

        // Récupère la room mise à jour
        const updatedRoom = await prisma.room.findUnique({
            where: { code },
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

        // Broadcast aux clients
        broadcastToRoom(code, {
            type: 'late-missions-assigned',
            room: updatedRoom,
        });

        return Response.json({
            message: 'LATE missions assigned',
            shouldAssign: true,
            room: updatedRoom,
        });
    } catch (error) {
        console.error('Error checking late missions:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}