import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { z } from 'zod';

const chooseSchema = z.object({
    playerToken: z.string(),
    pendingChoiceId: z.string(),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const body = await request.json();
        const { playerToken, pendingChoiceId } = chooseSchema.parse(body);

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

        const pendingChoice = await prisma.pendingMissionChoice.findUnique({
            where: { id: pendingChoiceId },
            include: { mission: true },
        });

        if (!pendingChoice || pendingChoice.playerId !== player.id) {
            return Response.json({ error: 'Invalid pending choice' }, { status: 400 });
        }

        // Transaction : créer la PlayerMission + supprimer tous les pending du même type
        await prisma.$transaction([
            prisma.playerMission.create({
                data: {
                    playerId: player.id,
                    missionId: pendingChoice.missionId,
                    type: pendingChoice.type,
                    resolvedText: pendingChoice.resolvedText,
                },
            }),
            prisma.pendingMissionChoice.deleteMany({
                where: {
                    playerId: player.id,
                    type: pendingChoice.type,
                },
            }),
        ]);

        console.log(`[CHOOSE-MISSION] Player ${player.name} chose mission ${pendingChoice.missionId} for type ${pendingChoice.type} in room ${code}`);

        await pushRoomUpdate(code);

        return Response.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
        }
        console.error('Error choosing mission:', error);
        return Response.json({ error: 'Failed to choose mission' }, { status: 500 });
    }
}
