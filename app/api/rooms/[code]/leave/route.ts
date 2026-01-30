import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const body = await request.json();
        const { playerToken, creatorToken } = body;

        console.log('[leave] Received body:', body);

        if (!playerToken) {
            return Response.json(
                { error: 'Player token required' },
                { status: 400 }
            );
        }

        // Trouve le joueur
        const player = await prisma.player.findUnique({
            where: { token: playerToken },
            include: {
                room: {
                    include: {
                        players: true,
                    },
                },
            },
        });

        if (!player || player.room.code !== code) {
            return Response.json(
                { error: 'Player not found in this room' },
                { status: 404 }
            );
        }

        const room = player.room;

        // Le créateur est celui qui a le creatorToken ET qui correspond au creatorToken de la room
        const isCreator = creatorToken && room.creatorToken === creatorToken;

        console.log(`[leave] Player ${player.name} (creator: ${isCreator}) leaving room ${code}`);

        // 🔥 Le créateur quitte = SUPPRESSION DE LA ROOM (avant ou après le start)
        if (isCreator) {
            console.log(`[leave] Creator leaving, deleting room ${code}...`);

            // Supprime toute la room (cascade supprime les joueurs et missions)
            await prisma.room.delete({
                where: { id: room.id },
            });

            console.log(`[leave] Room ${code} deleted`);

            return Response.json({
                message: 'Creator left, room deleted',
                roomDeleted: true,
                reason: 'creator-left',
            });
        }

        // CAS 2 : Un joueur normal quitte
        console.log(`[leave] Regular player ${player.name} leaving room ${code}`);

        // Supprime le joueur
        await prisma.player.delete({
            where: { id: player.id },
        });

        // Vérifie s'il reste des joueurs
        const remainingPlayers = await prisma.player.count({
            where: { roomId: room.id },
        });

        console.log(`[leave] Remaining players in room ${code}: ${remainingPlayers}`);

        // Si plus personne, supprime la room
        if (remainingPlayers === 0) {
            console.log(`[leave] Room ${code} is empty, deleting...`);
            await prisma.room.delete({
                where: { id: room.id },
            });

            return Response.json({
                message: 'Player left and room deleted (empty)',
                roomDeleted: true,
            });
        }

        console.log(`[leave] Player left room ${code}`);

        return Response.json({
            message: 'Player left',
            roomDeleted: false,
        });
    } catch (error) {
        console.error('Error leaving room:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}