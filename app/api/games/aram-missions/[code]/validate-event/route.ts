import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const { creatorToken, roomEventId, winnerTeam } = await request.json();

        if (!creatorToken || !roomEventId || winnerTeam === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (winnerTeam !== 'red' && winnerTeam !== 'blue' && winnerTeam !== 'none') {
            return NextResponse.json({ error: 'Invalid winnerTeam' }, { status: 400 });
        }

        const room = await prisma.room.findUnique({ where: { code } });

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }
        if (room.creatorToken !== creatorToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const roomEvent = await prisma.roomEvent.findUnique({
            where: { id: roomEventId },
            include: { event: true },
        });

        if (!roomEvent || roomEvent.roomId !== room.id) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        const points = roomEvent.event.points;

        await prisma.roomEvent.update({
            where: { id: roomEventId },
            data: {
                redDecided: true,
                blueDecided: true,
                redValidated: winnerTeam === 'red',
                blueValidated: winnerTeam === 'blue',
                pointsEarnedRed: winnerTeam === 'red' ? points : 0,
                pointsEarnedBlue: winnerTeam === 'blue' ? points : 0,
            },
        });

        await pushRoomUpdate(code);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error validating event:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
