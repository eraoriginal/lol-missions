import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { filterPrivateMissions } from '@/lib/filterPrivateMissions';
import { assignBalancedMissions, assignBalancedMissionChoices, processDuelMissions } from '@/lib/balancedMissionAssignment';
import { resolvePlayerPlaceholder } from '@/lib/resolvePlayerPlaceholder';
import { computeEffectiveElapsed } from '@/lib/gameTime';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        // Récupère la room
        const room = await prisma.room.findUnique({
            where: { code },
            include: {
                players: {
                    include: {
                        missions: {
                            include: {
                                mission: true,
                            },
                        },
                    },
                },
            },
        });

        if (!room) {
            return Response.json(
                { error: 'Room not found' },
                { status: 404 }
            );
        }

        if (!room.gameStarted || !room.gameStartTime) {
            return Response.json(
                { error: 'Game not started' },
                { status: 400 }
            );
        }

        const effectiveElapsed = computeEffectiveElapsed(
            room.gameStartTime,
            room.totalPausedDuration,
            room.eventPausedAt,
        );
        const shouldAssign = effectiveElapsed >= room.midMissionDelay;

        console.log(`[check-mid-missions] Room ${code}: effectiveElapsed=${Math.floor(effectiveElapsed)}s, shouldAssign=${shouldAssign}, delay=${room.midMissionDelay}s`);

        // Si pas encore le moment
        if (!shouldAssign) {
            return Response.json({
                message: 'Not time yet',
                shouldAssign: false,
                elapsed: Math.floor(effectiveElapsed),
                required: room.midMissionDelay,
            });
        }

        // Vérifie si des missions MID ont déjà été assignées ou des choix pendants existent
        const hasMidMissions = room.players.some(player =>
            player.missions.some(m => m.type === 'MID')
        );

        const hasMidPendingChoices = await prisma.pendingMissionChoice.findFirst({
            where: {
                playerId: { in: room.players.map(p => p.id) },
                type: 'MID',
            },
        });

        if (hasMidMissions || hasMidPendingChoices) {
            return Response.json({
                message: 'MID missions already assigned',
                shouldAssign: false,
            });
        }

        // Récupère toutes les missions MID disponibles (y compris duel)
        const midMissions = await prisma.mission.findMany({
            where: { type: 'MID', OR: [{ maps: room.gameMap }, { maps: 'all' }] },
        });

        const missionChoiceCount = room.missionChoiceCount ?? 1;

        if (missionChoiceCount > 1) {
            // Mode choix
            const nonDuelMissions = midMissions.filter(m => m.playerPlaceholder !== 'duel');
            const teamPlayers = room.players.filter(p => p.team === 'red' || p.team === 'blue');
            if (nonDuelMissions.length < teamPlayers.length * missionChoiceCount) {
                return Response.json({ error: 'Not enough MID missions available for choice mode' }, { status: 500 });
            }

            const choiceAssignments = assignBalancedMissionChoices(room.players, midMissions, missionChoiceCount, 'MID');

            let createdByUs = false;
            try {
                const wasCreated = await prisma.$transaction(async (tx) => {
                    // Recheck inside transaction to prevent race conditions
                    const existingCount = await tx.pendingMissionChoice.count({
                        where: {
                            playerId: { in: room.players.map(p => p.id) },
                            type: 'MID',
                        },
                    });
                    if (existingCount > 0) return false;

                    for (const player of room.players) {
                        const choices = choiceAssignments.get(player.id);
                        if (!choices) continue;

                        for (const mission of choices) {
                            const resolvedText = resolvePlayerPlaceholder(mission, player, room.players);
                            await tx.pendingMissionChoice.create({
                                data: {
                                    playerId: player.id,
                                    missionId: mission.id,
                                    type: 'MID',
                                    resolvedText,
                                },
                            });
                        }
                    }
                    return true;
                }, { isolationLevel: 'Serializable' });
                createdByUs = wasCreated;
                if (createdByUs) console.log(`[check-mid-missions] MID pending choices assigned to room ${code}`);
            } catch (createError: any) {
                console.log(`[check-mid-missions] MID pending choices already created for room ${code}`);
            }

            if (createdByUs) {
                console.log(`[MID] Mid choices ready in room ${code}, pushing update`);
                await pushRoomUpdate(code);
            }

            return Response.json({
                message: 'MID mission choices assigned',
                shouldAssign: true,
            });
        }

        if (midMissions.length < room.players.length) {
            return Response.json(
                { error: 'Not enough MID missions available' },
                { status: 500 }
            );
        }

        // Tirage aléatoire équilibré
        const assignments = assignBalancedMissions(room.players, midMissions, 'MID');

        // Post-traite les missions duel
        const duelPairs = processDuelMissions(assignments, room.players, midMissions);
        const duelResolvedTexts = new Map<string, string>();
        for (const pair of duelPairs) {
            duelResolvedTexts.set(pair.player1Id, pair.player1ResolvedText);
            duelResolvedTexts.set(pair.player2Id, pair.player2ResolvedText);
        }

        // Assigne une mission MID à chaque joueur (avec transaction pour atomicité)
        let createdByUs = false;
        try {
            await prisma.$transaction(async (tx) => {
                for (const player of room.players) {
                    const mission = assignments.get(player.id);
                    if (!mission) continue;

                    const resolvedText = duelResolvedTexts.get(player.id)
                        ?? resolvePlayerPlaceholder(mission, player, room.players);

                    await tx.playerMission.create({
                        data: {
                            playerId: player.id,
                            missionId: mission.id,
                            type: 'MID',
                            resolvedText,
                        },
                    });
                }
            });
            createdByUs = true;
            console.log(`[check-mid-missions] MID missions assigned to room ${code}`);
        } catch (createError: any) {
            const isUniqueConstraint = createError?.code === 'P2002' ||
                (createError?.message && createError.message.includes('Unique constraint'));

            if (isUniqueConstraint) {
                console.log(`[check-mid-missions] MID missions already created by another request for room ${code}`);
            } else {
                console.error('[check-mid-missions] Unexpected error:', createError);
                throw createError;
            }
        }

        // Vérifie que les missions existent bien (créées par nous ou autre requête)
        // Avec retry car une autre transaction peut être en cours
        let roomAfterCreate = null;
        let allPlayersHaveMidMission = false;

        for (let attempt = 0; attempt < 3; attempt++) {
            roomAfterCreate = await prisma.room.findUnique({
                where: { code },
                include: {
                    players: {
                        include: {
                            missions: {
                                include: {
                                    mission: true,
                                },
                            },
                        },
                    },
                },
            });

            allPlayersHaveMidMission = roomAfterCreate?.players.every(p =>
                p.missions.some((m: any) => m.type === 'MID')
            ) ?? false;

            if (allPlayersHaveMidMission) break;

            // Attendre un peu avant de réessayer (autre transaction peut-être en cours)
            if (attempt < 2) {
                console.log(`[check-mid-missions] Not all players have MID missions yet, retry ${attempt + 1}/3`);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        if (!allPlayersHaveMidMission) {
            console.error(`[check-mid-missions] Not all players have MID missions for room ${code} after retries`);
            return Response.json(
                { error: 'Failed to create MID missions for all players' },
                { status: 500 }
            );
        }

        // Toujours pusher si les missions existent (le premier push gagne, les autres sont ignorés par les clients)
        console.log(`[MID] Mid missions ready in room ${code}, pushing update (createdByUs=${createdByUs})`);
        await pushRoomUpdate(code);

        return Response.json({
            message: 'MID missions assigned',
            shouldAssign: true,
            room: filterPrivateMissions(roomAfterCreate, null), // Filtre toutes les missions secrètes
        });
    } catch (error) {
        console.error('Error checking mid missions:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
