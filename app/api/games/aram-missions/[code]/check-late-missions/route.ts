import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { filterPrivateMissions } from '@/lib/filterPrivateMissions';
import { assignBalancedMissions, assignBalancedMissionChoices, processDuelMissions } from '@/lib/balancedMissionAssignment';
import { resolvePlayerPlaceholder } from '@/lib/resolvePlayerPlaceholder';

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

        const elapsed = Date.now() - new Date(room.gameStartTime).getTime();
        const lateDelayMs = room.lateMissionDelay * 1000;
        const shouldAssign = elapsed >= lateDelayMs;

        console.log(`[check-late-missions] Room ${code}: elapsed=${Math.floor(elapsed/1000)}s, shouldAssign=${shouldAssign}, delay=${room.lateMissionDelay}s`);

        // Si pas encore le moment
        if (!shouldAssign) {
            return Response.json({
                message: 'Not time yet',
                shouldAssign: false,
                elapsed: Math.floor(elapsed / 1000),
                required: room.lateMissionDelay,
            });
        }

        // Vérifie si des missions LATE ont déjà été assignées ou des choix pendants existent
        const hasLateMissions = room.players.some(player =>
            player.missions.some(m => m.type === 'LATE')
        );

        const hasLatePendingChoices = await prisma.pendingMissionChoice.findFirst({
            where: {
                playerId: { in: room.players.map(p => p.id) },
                type: 'LATE',
            },
        });

        if (hasLateMissions || hasLatePendingChoices) {
            return Response.json({
                message: 'LATE missions already assigned',
                shouldAssign: false,
            });
        }

        // Récupère toutes les missions LATE disponibles (y compris duel)
        const lateMissions = await prisma.mission.findMany({
            where: { type: 'LATE', OR: [{ maps: room.gameMap }, { maps: 'all' }] },
        });

        const missionChoiceCount = room.missionChoiceCount ?? 1;

        if (missionChoiceCount > 1) {
            // Mode choix
            const nonDuelMissions = lateMissions.filter(m => m.playerPlaceholder !== 'duel');
            const teamPlayers = room.players.filter(p => p.team === 'red' || p.team === 'blue');
            if (nonDuelMissions.length < teamPlayers.length * missionChoiceCount) {
                return Response.json({ error: 'Not enough LATE missions available for choice mode' }, { status: 500 });
            }

            const choiceAssignments = assignBalancedMissionChoices(room.players, lateMissions, missionChoiceCount, 'LATE');

            let createdByUs = false;
            try {
                const wasCreated = await prisma.$transaction(async (tx) => {
                    // Recheck inside transaction to prevent race conditions
                    const existingCount = await tx.pendingMissionChoice.count({
                        where: {
                            playerId: { in: room.players.map(p => p.id) },
                            type: 'LATE',
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
                                    type: 'LATE',
                                    resolvedText,
                                },
                            });
                        }
                    }
                    return true;
                }, { isolationLevel: 'Serializable' });
                createdByUs = wasCreated;
                if (createdByUs) console.log(`[check-late-missions] LATE pending choices assigned to room ${code}`);
            } catch (createError: any) {
                console.log(`[check-late-missions] LATE pending choices already created for room ${code}`);
            }

            if (createdByUs) {
                console.log(`[LATE] Late choices ready in room ${code}, pushing update`);
                await pushRoomUpdate(code);
            }

            return Response.json({
                message: 'LATE mission choices assigned',
                shouldAssign: true,
            });
        }

        if (lateMissions.length < room.players.length) {
            return Response.json(
                { error: 'Not enough LATE missions available' },
                { status: 500 }
            );
        }

        // Tirage aléatoire équilibré
        const assignments = assignBalancedMissions(room.players, lateMissions, 'LATE');

        // Post-traite les missions duel
        const duelPairs = processDuelMissions(assignments, room.players, lateMissions);
        const duelResolvedTexts = new Map<string, string>();
        for (const pair of duelPairs) {
            duelResolvedTexts.set(pair.player1Id, pair.player1ResolvedText);
            duelResolvedTexts.set(pair.player2Id, pair.player2ResolvedText);
        }

        // Assigne une mission LATE à chaque joueur (avec transaction pour atomicité)
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
                            type: 'LATE',
                            resolvedText,
                        },
                    });
                }
            });
            createdByUs = true;
            console.log(`[check-late-missions] LATE missions assigned to room ${code}`);
        } catch (createError: any) {
            const isUniqueConstraint = createError?.code === 'P2002' ||
                (createError?.message && createError.message.includes('Unique constraint'));

            if (isUniqueConstraint) {
                console.log(`[check-late-missions] LATE missions already created by another request for room ${code}`);
            } else {
                console.error('[check-late-missions] Unexpected error:', createError);
                throw createError;
            }
        }

        // Vérifie que les missions existent bien (créées par nous ou autre requête)
        // Avec retry car une autre transaction peut être en cours
        let roomAfterCreate = null;
        let allPlayersHaveLateMission = false;

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

            allPlayersHaveLateMission = roomAfterCreate?.players.every(p =>
                p.missions.some((m: any) => m.type === 'LATE')
            ) ?? false;

            if (allPlayersHaveLateMission) break;

            // Attendre un peu avant de réessayer (autre transaction peut-être en cours)
            if (attempt < 2) {
                console.log(`[check-late-missions] Not all players have LATE missions yet, retry ${attempt + 1}/3`);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }

        if (!allPlayersHaveLateMission) {
            console.error(`[check-late-missions] Not all players have LATE missions for room ${code} after retries`);
            return Response.json(
                { error: 'Failed to create LATE missions for all players' },
                { status: 500 }
            );
        }

        // Toujours pusher si les missions existent (le premier push gagne, les autres sont ignorés par les clients)
        console.log(`[LATE] Late missions ready in room ${code}, pushing update (createdByUs=${createdByUs})`);
        await pushRoomUpdate(code);

        return Response.json({
            message: 'LATE missions assigned',
            shouldAssign: true,
            room: filterPrivateMissions(roomAfterCreate, null), // Filtre toutes les missions secrètes
        });
    } catch (error) {
        console.error('Error checking late missions:', error);
        return Response.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
