import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateRoomCode, generatePlayerToken } from '@/lib/utils';
import { z } from 'zod';

const createRoomSchema = z.object({
    creatorName: z.string().min(1).max(50),
    gameType: z.string().default('aram-missions'), // 🆕 Ajouté
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { creatorName, gameType } = createRoomSchema.parse(body);

        // Génère un code unique
        let code = generateRoomCode();
        let existingRoom = await prisma.room.findUnique({ where: { code } });

        while (existingRoom) {
            code = generateRoomCode();
            existingRoom = await prisma.room.findUnique({ where: { code } });
        }

        const creatorToken = generatePlayerToken();

        // Génère un avatar pour le créateur
        const avatarSeed = `${creatorName}-${Date.now()}`;
        const avatarStyle = 'big-smile';
        const avatarUrl = `https://api.dicebear.com/7.x/${avatarStyle}/svg?seed=${encodeURIComponent(avatarSeed)}`;

        // Crée la room avec le type de jeu
        const room = await prisma.room.create({
            data: {
                code,
                creatorToken,
                gameType, // 🆕 Ajouté
                players: {
                    create: {
                        name: creatorName,
                        token: generatePlayerToken(),
                        avatar: avatarUrl,
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