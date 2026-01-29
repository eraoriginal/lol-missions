import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateRoomCode, generatePlayerToken } from '@/lib/utils';
import { z } from 'zod';

const createRoomSchema = z.object({
    creatorName: z.string().min(1).max(50),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { creatorName } = createRoomSchema.parse(body);

        // Génère un code unique
        let code = generateRoomCode();
        let existingRoom = await prisma.room.findUnique({ where: { code } });

        // Regénère si le code existe déjà (très rare)
        while (existingRoom) {
            code = generateRoomCode();
            existingRoom = await prisma.room.findUnique({ where: { code } });
        }

        // Token du créateur
        const creatorToken = generatePlayerToken();

        // 🆕 Génère un avatar pour le créateur
        const avatarSeed = `${creatorName}-${Date.now()}`;
        const avatarStyle = 'big-smile';
        const avatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(avatarSeed)}`;

        // Crée la room et le joueur créateur avec avatar
        const room = await prisma.room.create({
            data: {
                code,
                creatorToken,
                players: {
                    create: {
                        name: creatorName,
                        token: generatePlayerToken(),
                        avatar: avatarUrl, // 🆕 Avatar du créateur
                    },
                },
            },
            include: {
                players: true,
            },
        });

        return NextResponse.json({
            room,
            creatorToken,
            playerToken: room.players[0].token,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return Response.json(
                { error: 'Invalid input' },
                { status: 400 }
            );
        }

        console.error('Error creating room:', error);
        return Response.json(
            { error: 'Failed to create room' },
            { status: 500 }
        );
    }
}