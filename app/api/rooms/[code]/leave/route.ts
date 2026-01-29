import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { broadcastToRoom } from '../events/route';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const body = await request.json();
        const { playerToken, creatorToken } = body; // ← Ajoute creatorToken ici

        console.log('[leave] Received body:', body); // ← Debug : voir ce qui est reçu

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

        console.log(`[leave] Checking creator status:`);
        console.log(`[leave] - room.creatorToken: ${room.creatorToken}`);
        console.log(`[leave] - sent creatorToken: ${creatorToken || 'NOT SENT'}`); // ← Affiche si absent
        console.log(`[leave] - playerToken (sent): ${playerToken}`);
        console.log(`[leave] - player.token (db): ${player.token}`);
        console.log(`[leave] - isCreator: ${isCreator}`);
        console.log(`[leave] Player ${player.name} (creator: ${isCreator}) leaving room ${code}`);

        // CAS 1 : Le créateur quitte AVANT le start de la partie
        if (isCreator && !room.gameStarted) {
            console.log(`[leave] Creator leaving before game start, deleting room ${code}...`);

            // Broadcast aux autres joueurs AVANT de supprimer
            broadcastToRoom(code, {
                type: 'room-closed',
                message: 'Le créateur a quitté la room. La room est fermée.',
            });

            // Attend 500ms pour que les clients reçoivent l'event
            await new Promise(resolve => setTimeout(resolve, 500));

            // Supprime toute la room (cascade supprime les joueurs et missions)
            await prisma.room.delete({
                where: { id: room.id },
            });

            return Response.json({
                message: 'Creator left, room deleted',
                roomDeleted: true,
                reason: 'creator-left-before-start',
            });
        }

        // CAS 2 : Le créateur quitte APRÈS le start de la partie
        if (isCreator && room.gameStarted) {
            console.log(`[leave] Creator leaving after game start, game continues without them`);

            // Supprime juste le joueur, la partie continue
            await prisma.player.delete({
                where: { id: player.id },
            });

            // Broadcast que le créateur est parti
            broadcastToRoom(code, {
                type: 'player-left',
                playerName: player.name,
                wasCreator: true,
                message: `${player.name} (créateur) a quitté la partie`,
            });

            // Vérifie s'il reste des joueurs
            const remainingPlayers = await prisma.player.count({
                where: { roomId: room.id },
            });

            // Si plus personne, supprime la room
            if (remainingPlayers === 0) {
                console.log(`[leave] Room ${code} is empty, deleting...`);
                await prisma.room.delete({
                    where: { id: room.id },
                });

                return Response.json({
                    message: 'Last player left, room deleted',
                    roomDeleted: true,
                });
            }

            return Response.json({
                message: 'Creator left after game start, game continues',
                roomDeleted: false,
            });
        }

        // CAS 3 : Un joueur normal quitte
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

        // Broadcast que le joueur est parti
        broadcastToRoom(code, {
            type: 'player-left',
            playerName: player.name,
            wasCreator: false,
        });

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