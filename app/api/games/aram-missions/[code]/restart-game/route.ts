import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';
import { assignBalancedMissions, assignBalancedMissionChoices, processDuelMissions } from '@/lib/balancedMissionAssignment';
import { resolvePlayerPlaceholder } from '@/lib/resolvePlayerPlaceholder';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const body = await request.json();
        const { creatorToken } = body;

        const room = await prisma.room.findUnique({
            where: { code },
            include: {
                players: {
                    include: { missions: true },
                },
            },
        });

        if (!room) {
            return Response.json({ error: 'Room not found' }, { status: 404 });
        }

        if (!isCreator(room, creatorToken)) {
            return Response.json(
                { error: 'Only the creator can restart the game' },
                { status: 403 }
            );
        }

        // Supprime toutes les missions existantes, les choix pendants et les événements
        const playerIds = room.players.map(p => p.id);
        await prisma.playerMission.deleteMany({
            where: { playerId: { in: playerIds } },
        });
        await prisma.pendingMissionChoice.deleteMany({
            where: { playerId: { in: playerIds } },
        });
        await prisma.roomEvent.deleteMany({
            where: { roomId: room.id },
        });

        // Récupère et mélange les missions START
        const startMissions = await prisma.mission.findMany({ where: { type: 'START', OR: [{ maps: room.gameMap }, { maps: 'all' }] } });

        const missionChoiceCount = room.missionChoiceCount ?? 1;

        if (missionChoiceCount > 1) {
            // Mode choix
            const nonDuelMissions = startMissions.filter(m => m.playerPlaceholder !== 'duel');
            const teamPlayers = room.players.filter(p => p.team === 'red' || p.team === 'blue');
            if (nonDuelMissions.length < teamPlayers.length * missionChoiceCount) {
                return Response.json({ error: 'Not enough missions available for choice mode' }, { status: 500 });
            }

            const choiceAssignments = assignBalancedMissionChoices(room.players, startMissions, missionChoiceCount, 'START');

            await Promise.all(
                room.players.map((player) => {
                    const choices = choiceAssignments.get(player.id);
                    if (!choices) return Promise.resolve();

                    return Promise.all(choices.map((mission) => {
                        const resolvedText = resolvePlayerPlaceholder(mission, player, room.players);
                        return prisma.pendingMissionChoice.create({
                            data: {
                                playerId: player.id,
                                missionId: mission.id,
                                type: 'START',
                                resolvedText,
                            },
                        });
                    }));
                })
            );
        } else {
            // Mode classique
            if (startMissions.length < room.players.length) {
                return Response.json({ error: 'Not enough missions available' }, { status: 500 });
            }

            const assignments = assignBalancedMissions(room.players, startMissions, 'START');

            const duelPairs = processDuelMissions(assignments, room.players, startMissions);
            const duelResolvedTexts = new Map<string, string>();
            for (const pair of duelPairs) {
                duelResolvedTexts.set(pair.player1Id, pair.player1ResolvedText);
                duelResolvedTexts.set(pair.player2Id, pair.player2ResolvedText);
            }

            await Promise.all(
                room.players.map((player) => {
                    const mission = assignments.get(player.id);
                    if (!mission) return Promise.resolve();

                    const resolvedText = duelResolvedTexts.get(player.id)
                        ?? resolvePlayerPlaceholder(mission, player, room.players);

                    return prisma.playerMission.create({
                        data: {
                            playerId: player.id,
                            missionId: mission.id,
                            type: 'START',
                            resolvedText,
                        },
                    });
                })
            );
        }

        // Reset le timer mais garde gameStarted = true
        await prisma.room.update({
            where: { id: room.id },
            data: {
                gameStartTime: null,
                gameStopped: false,
                validationStatus: 'not_started',
                eventPausedAt: null,
                totalPausedDuration: 0,
            },
        });

        console.log(`[RESTART-GAME] Game restarted in room ${code}, teams preserved, new START missions assigned, choiceCount=${missionChoiceCount}`);

        await pushRoomUpdate(code);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error restarting game:', error);
        return Response.json({ error: 'Failed to restart game' }, { status: 500 });
    }
}
