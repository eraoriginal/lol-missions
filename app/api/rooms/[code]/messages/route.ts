import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pusherServer } from '@/lib/pusher';
import { z } from 'zod';

// GET - Récupère les messages d'une room
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        const room = await prisma.room.findUnique({
            where: { code },
        });

        if (!room) {
            return Response.json(
                { error: 'Room not found' },
                { status: 404 }
            );
        }

        const messages = await prisma.message.findMany({
            where: { roomId: room.id },
            orderBy: { createdAt: 'asc' },
            take: 100, // Limite à 100 derniers messages
        });

        return NextResponse.json({ messages });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return Response.json(
            { error: 'Failed to fetch messages' },
            { status: 500 }
        );
    }
}

const sendMessageSchema = z.object({
    content: z.string().min(1).max(500),
    playerToken: z.string(),
});

// POST - Envoie un message
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const body = await request.json();
        const { content, playerToken } = sendMessageSchema.parse(body);

        // Trouve le joueur
        const player = await prisma.player.findUnique({
            where: { token: playerToken },
            include: {
                room: true,
            },
        });

        if (!player || player.room.code !== code) {
            return Response.json(
                { error: 'Player not found in this room' },
                { status: 404 }
            );
        }

        // Crée le message
        const message = await prisma.message.create({
            data: {
                roomId: player.roomId,
                playerId: player.id,
                playerName: player.name,
                playerAvatar: player.avatar,
                content: content.trim(),
            },
        });

        // 🔥 Broadcast en temps réel via Pusher
        await pusherServer.trigger(`room-${code}`, 'new-message', {
            id: message.id,
            playerName: message.playerName,
            playerAvatar: message.playerAvatar,
            content: message.content,
            createdAt: message.createdAt.toISOString(),
        });

        console.log(`[CHAT] Message sent in room ${code} by ${player.name}`);

        return NextResponse.json({ message });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return Response.json(
                { error: 'Invalid input', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Error sending message:', error);
        return Response.json(
            { error: 'Failed to send message' },
            { status: 500 }
        );
    }
}