import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';
import { z } from 'zod';

const settingsSchema = z.object({
    creatorToken: z.string(),
    midMissionDelay: z.number().int().min(60).max(3600).optional(),
    lateMissionDelay: z.number().int().min(60).max(3600).optional(),
    missionVisibility: z.enum(['all', 'team', 'hidden']).optional(),
    gameMap: z.enum(['howling_abyss', 'summoners_rift']).optional(),
    victoryBonus: z.boolean().optional(),
});

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const body = await request.json();
        const { creatorToken, midMissionDelay, lateMissionDelay, missionVisibility, gameMap, victoryBonus } = settingsSchema.parse(body);

        // Au moins un paramètre doit être fourni
        if (midMissionDelay === undefined && lateMissionDelay === undefined && missionVisibility === undefined && gameMap === undefined && victoryBonus === undefined) {
            return Response.json(
                { error: 'At least one setting must be provided' },
                { status: 400 }
            );
        }

        const room = await prisma.room.findUnique({ where: { code } });

        if (!room) {
            return Response.json({ error: 'Room not found' }, { status: 404 });
        }

        if (!isCreator(room, creatorToken)) {
            return Response.json(
                { error: 'Only the room creator can change settings' },
                { status: 403 }
            );
        }

        // Modification interdite après le démarrage
        if (room.gameStarted) {
            return Response.json(
                { error: 'Cannot change settings after the game has started' },
                { status: 400 }
            );
        }

        // Calcule les valeurs effectives (nouvelle valeur ou celle existante)
        const newMid = midMissionDelay ?? room.midMissionDelay;
        const newLate = lateMissionDelay ?? room.lateMissionDelay;

        // La mission finale doit apparaître strictement après le MID
        if (newLate <= newMid) {
            return Response.json(
                { error: 'La mission finale doit apparaître après la mission MID' },
                { status: 400 }
            );
        }

        const updatedRoom = await prisma.room.update({
            where: { id: room.id },
            data: {
                ...(midMissionDelay !== undefined && { midMissionDelay }),
                ...(lateMissionDelay !== undefined && { lateMissionDelay }),
                ...(missionVisibility !== undefined && { missionVisibility }),
                ...(gameMap !== undefined && { gameMap }),
                ...(victoryBonus !== undefined && { victoryBonus }),
            },
        });

        // Push : paramètres modifiés
        await pushRoomUpdate(code);

        return Response.json({
            midMissionDelay: updatedRoom.midMissionDelay,
            lateMissionDelay: updatedRoom.lateMissionDelay,
            missionVisibility: updatedRoom.missionVisibility,
            gameMap: updatedRoom.gameMap,
            victoryBonus: updatedRoom.victoryBonus,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
        }
        console.error('Error updating settings:', error);
        return Response.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
