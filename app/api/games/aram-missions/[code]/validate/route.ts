import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';

// POST — valide une ou plusieurs missions d'un joueur (envoyé à chaque click ✅/❌)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const { creatorToken, playerId, validations } = await request.json();

        if (!creatorToken || !playerId || !validations) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const room = await prisma.room.findUnique({ where: { code } });

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }
        if (room.creatorToken !== creatorToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        if (!room.gameStopped) {
            return NextResponse.json({ error: 'Game is not stopped' }, { status: 400 });
        }

        for (const [type, validated] of Object.entries(validations)) {
            const playerMission = await prisma.playerMission.findFirst({
                where: { playerId, type },
                include: { mission: true },
            });

            if (playerMission) {
                await prisma.playerMission.update({
                    where: { id: playerMission.id },
                    data: {
                        decided: true,
                        validated: validated as boolean,
                        pointsEarned: (validated as boolean) ? playerMission.mission.points : 0,
                    },
                });
            }
        }

        // Push : mission validée ou invalidée
        await pushRoomUpdate(code);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error validating missions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH — le créateur avance au joueur suivant
// Body: { creatorToken, currentPlayerIndex }
// Met à jour validationStatus en "in_progress:<index>"
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const { creatorToken, currentPlayerIndex } = await request.json();

        if (!creatorToken || currentPlayerIndex === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const room = await prisma.room.findUnique({ where: { code } });

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }
        if (room.creatorToken !== creatorToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await prisma.room.update({
            where: { code },
            data: { validationStatus: `in_progress:${currentPlayerIndex}` },
        });

        // Push : avancement vers le joueur suivant
        await pushRoomUpdate(code);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error advancing player:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT — termine la validation → récapitulatif affiché pour tout le monde
// Body: { creatorToken }
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const { creatorToken } = await request.json();

        if (!creatorToken) {
            return NextResponse.json({ error: 'Missing creatorToken' }, { status: 400 });
        }

        const room = await prisma.room.findUnique({ where: { code } });

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }
        if (room.creatorToken !== creatorToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await prisma.room.update({
            where: { code },
            data: { validationStatus: 'completed' },
        });

        // Push : validation terminée, récapitulatif affiché pour tous
        await pushRoomUpdate(code);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error completing validation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
