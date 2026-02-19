import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const { playerToken, betTypeId, targetPlayerId, points } = await request.json();

        if (!playerToken || !betTypeId || !targetPlayerId || !points) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (![100, 200, 300, 400, 500].includes(points)) {
            return Response.json({ error: 'Invalid points value' }, { status: 400 });
        }

        const room = await prisma.room.findUnique({
            where: { code },
            include: { players: true },
        });

        if (!room) {
            return Response.json({ error: 'Room not found' }, { status: 404 });
        }
        if (!room.betsEnabled) {
            return Response.json({ error: 'Bets are not enabled' }, { status: 400 });
        }
        if (!room.gameStarted) {
            return Response.json({ error: 'Game has not started' }, { status: 400 });
        }
        if (room.gameStartTime) {
            return Response.json({ error: 'Combat has already started' }, { status: 400 });
        }

        const player = room.players.find(p => p.token === playerToken);
        if (!player) {
            return Response.json({ error: 'Player not found' }, { status: 404 });
        }

        const targetPlayer = room.players.find(p => p.id === targetPlayerId);
        if (!targetPlayer) {
            return Response.json({ error: 'Target player not found' }, { status: 404 });
        }

        if (targetPlayer.id === player.id) {
            return Response.json({ error: 'Cannot bet on yourself' }, { status: 400 });
        }

        const betType = await prisma.betType.findUnique({ where: { id: betTypeId } });
        if (!betType) {
            return Response.json({ error: 'Bet type not found' }, { status: 404 });
        }

        // Upsert: 1 pari par joueur par room
        const bet = await prisma.playerBet.upsert({
            where: {
                playerId_roomId: {
                    playerId: player.id,
                    roomId: room.id,
                },
            },
            update: {
                betTypeId,
                targetPlayerId,
                points,
            },
            create: {
                playerId: player.id,
                roomId: room.id,
                betTypeId,
                targetPlayerId,
                points,
            },
        });

        await pushRoomUpdate(code);

        return Response.json({ success: true, bet });
    } catch (error) {
        console.error('Error placing bet:', error);
        return Response.json({ error: 'Failed to place bet' }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const { playerToken } = await request.json();

        if (!playerToken) {
            return Response.json({ error: 'Missing playerToken' }, { status: 400 });
        }

        const room = await prisma.room.findUnique({
            where: { code },
            include: { players: true },
        });

        if (!room) {
            return Response.json({ error: 'Room not found' }, { status: 404 });
        }

        const player = room.players.find(p => p.token === playerToken);
        if (!player) {
            return Response.json({ error: 'Player not found' }, { status: 404 });
        }

        await prisma.playerBet.deleteMany({
            where: {
                playerId: player.id,
                roomId: room.id,
            },
        });

        await pushRoomUpdate(code);

        return Response.json({ success: true });
    } catch (error) {
        console.error('Error deleting bet:', error);
        return Response.json({ error: 'Failed to delete bet' }, { status: 500 });
    }
}
