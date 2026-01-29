import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePlayerToken } from '@/lib/utils';
import { z } from 'zod';
import {broadcastToRoom} from "@/app/api/rooms/[code]/events/route";

const joinRoomSchema = z.object({
    playerName: z.string().min(1).max(50),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const body = await request.json();
        const { playerName } = joinRoomSchema.parse(body);

        // Vérifie que la room existe
        const room = await prisma.room.findUnique({
            where: { code },
            include: { players: true },
        });

        if (!room) {
            return Response.json(
                { error: 'Room not found' },
                { status: 404 }
            );
        }

        // Vérifie que la game n'a pas déjà commencé
        if (room.gameStarted) {
            return Response.json(
                { error: 'Game already started' },
                { status: 400 }
            );
        }

        // Vérifie le nombre maximum de joueurs (10)
        if (room.players.length >= 10) {
            return Response.json(
                { error: 'Room is full (max 10 players)' },
                { status: 400 }
            );
        }

        // Vérifie que le nom n'est pas déjà pris
        const existingPlayer = room.players.find(
            (p) => p.name.toLowerCase() === playerName.toLowerCase()
        );

        if (existingPlayer) {
            return Response.json(
                { error: 'Player name already taken' },
                { status: 400 }
            );
        }

        // Crée le joueur
        const player = await prisma.player.create({
            data: {
                name: playerName,
                token: generatePlayerToken(),
                roomId: room.id,
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

        // Broadcast l'event aux autres joueurs
        broadcastToRoom(code, {
            type: 'player-joined',
            data: {
                player: {
                    id: player.id,
                    name: player.name,
                },
            },
        });

        return Response.json({
            player,
            room: updatedRoom,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return Response.json(
                {  error: 'Invalid input', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Error joining room:', error);
        return Response.json(
            { error: 'Failed to join room' },
            { status: 500 }
        );
    }
}