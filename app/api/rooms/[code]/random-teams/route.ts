import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const { creatorToken } = await request.json();

        if (!creatorToken) {
            return NextResponse.json({ error: 'Missing creator token' }, { status: 400 });
        }

        const room = await prisma.room.findUnique({
            where: { code },
            include: { players: true },
        });

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        if (!isCreator(room, creatorToken)) {
            return NextResponse.json({ error: 'Only the creator can randomize teams' }, { status: 403 });
        }

        if (room.gameStarted) {
            return NextResponse.json({ error: 'Cannot change teams after game started' }, { status: 400 });
        }

        // Shuffle players (Fisher-Yates)
        const players = [...room.players];
        for (let i = players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [players[i], players[j]] = [players[j], players[i]];
        }

        // Assign: first half to red, second half to blue
        const half = Math.ceil(players.length / 2);
        const updates = players.map((player, index) =>
            prisma.player.update({
                where: { id: player.id },
                data: { team: index < half ? 'red' : 'blue' },
            })
        );

        await prisma.$transaction(updates);
        await pushRoomUpdate(code);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error randomizing teams:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
