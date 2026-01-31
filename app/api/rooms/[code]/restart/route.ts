import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const body = await request.json();
        const { creatorToken } = body;

        // Trouve la room
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
        if (room.creatorToken !== creatorToken) {
            return Response.json(
                { error: 'Only the creator can restart the game' },
                { status: 403 }
            );
        }

        // Vérifie que la partie est stoppée
        if (!room.gameStopped) {
            return Response.json(
                { error: 'Game is not stopped' },
                { status: 400 }
            );
        }

        // 🔥 Supprime toutes les missions des joueurs
        await prisma.playerMission.deleteMany({
            where: {
                playerId: {
                    in: room.players.map(p => p.id),
                },
            },
        });

        // 🔥 Réinitialise la room
        const updatedRoom = await prisma.room.update({
            where: { id: room.id },
            data: {
                gameStarted: false,
                gameStartTime: null,
                gameStopped: false,
                validationStatus: 'not_started',
            },
        });

        console.log(`[RESTART] Game restarted in room ${code}`);

        return NextResponse.json({
            success: true,
            room: updatedRoom,
        });
    } catch (error) {
        console.error('Error restarting game:', error);
        return Response.json(
            { error: 'Failed to restart game' },
            { status: 500 }
        );
    }
}