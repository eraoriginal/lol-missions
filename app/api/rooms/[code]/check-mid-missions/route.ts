import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { shouldAssignMidMissions } from '@/lib/utils';
import { broadcastToRoom } from '../events/route';

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
                            where: { type: 'MID' },
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

        // Vérifie que la game a commencé
        if (!room.gameStarted || !room.gameStartTime) {
            return Response.json(
                { error: 'Game not started' },
                { status: 400 }
            );
        }

        // Vérifie si les missions MID ont déjà été assignées
        const hasMidMissions = room.players.some(
            (player) => player.missions.length > 0
        );

        if (hasMidMissions) {
            return Response.json({
                message: 'Mid missions already assigned',
                shouldAssign: false
            });
        }

        // Vérifie si 5 minutes se sont écoulées
        if (!shouldAssignMidMissions(room.gameStartTime)) {
            return Response.json({
                message: 'Not time yet',
                shouldAssign: false
            });
        }

        // Récupère toutes les missions MID disponibles
        const midMissions = await prisma.mission.findMany({
            where: { type: 'MID' },
        });

        if (midMissions.length < room.players.length) {
            return Response.json(
                { error: 'Not enough MID missions available' },
                { status: 500 }
            );
        }

        // Mélange les missions
        const shuffledMissions = [...midMissions];
        for (let i = shuffledMissions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledMissions[i], shuffledMissions[j]] = [shuffledMissions[j], shuffledMissions[i]];
        }

        // Assigne une mission MID unique à chaque joueur
        const playerMissionPromises = room.players.map((player, index) => {
            return prisma.playerMission.create({
                data: {
                    playerId: player.id,
                    missionId: shuffledMissions[index].id,
                    type: 'MID',
                },
                include: {
                    mission: true,
                },
            });
        });

        const newMissions = await Promise.all(playerMissionPromises);

        // Broadcast l'event à tous les clients
        broadcastToRoom(code, {
            type: 'mid-missions-assigned',
            data: {
                missions: newMissions,
            },
        });

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

        return Response.json({
            room: updatedRoom,
            shouldAssign: true
        });
    } catch (error) {
        console.error('Error checking mid missions:', error);
        return Response.json(
            { error: 'Failed to check mid missions' },
            { status: 500 }
        );
    }
}