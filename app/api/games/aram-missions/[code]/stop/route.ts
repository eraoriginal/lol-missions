import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';

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
                { error: 'Only the creator can stop the game' },
                { status: 403 }
            );
        }

        // Vérifie que la partie est en cours
        if (!room.gameStarted || room.gameStopped) {
            return Response.json(
                { error: 'Game is not running' },
                { status: 400 }
            );
        }

        // Stoppe la partie et démarre la phase de validation
        const updatedRoom = await prisma.room.update({
            where: { id: room.id },
            data: {
                gameStopped: true,
                validationStatus: 'in_progress',
                eventPausedAt: null,
                totalPausedDuration: 0,
            },
        });

        console.log(`[STOP] Game stopped in room ${code} by creator`);

        // Push : jeu arrêté, phase de validation commence
        await pushRoomUpdate(code);

        return NextResponse.json({
            success: true,
            room: updatedRoom,
        });
    } catch (error) {
        console.error('Error stopping game:', error);
        return Response.json(
            { error: 'Failed to stop game' },
            { status: 500 }
        );
    }
}
