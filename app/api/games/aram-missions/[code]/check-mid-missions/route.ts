import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { filterPrivateMissions } from '@/lib/filterPrivateMissions';
import { assignBalancedMissions } from '@/lib/balancedMissionAssignment';

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
        const midDelayMs = room.midMissionDelay * 1000;
        const shouldAssign = elapsed >= midDelayMs;

        console.log(`[check-mid-missions] Room ${code}: elapsed=${Math.floor(elapsed/1000)}s, shouldAssign=${shouldAssign}, delay=${room.midMissionDelay}s`);

        // Si pas encore le moment
        if (!shouldAssign) {
            return Response.json({
                message: 'Not time yet',
                shouldAssign: false,
                elapsed: Math.floor(elapsed / 1000),
                required: room.midMissionDelay,
            });
        }

        // Vérifie si des missions MID ont déjà été assignées
        const hasMidMissions = room.players.some(player =>
            player.missions.some(m => m.type === 'MID')
        );

        if (hasMidMissions) {
            return Response.json({
                message: 'MID missions already assigned',
                shouldAssign: false,
            });
        }

        // Récupère toutes les missions MID disponibles
        const midMissions = await prisma.mission.findMany({
            where: { type: 'MID', OR: [{ maps: room.gameMap }, { maps: 'all' }] },
        });

        if (midMissions.length < room.players.length) {
            return Response.json(
                { error: 'Not enough MID missions available' },
                { status: 500 }
            );
        }

        // Assigne les missions MID de façon aléatoire
        const assignments = assignBalancedMissions(room.players, midMissions, 'MID');

        // Assigne une mission MID à chaque joueur (avec transaction pour atomicité)
        let createdByUs = false;
        try {
            await prisma.$transaction(async (tx) => {
                for (const player of room.players) {
                    const mission = assignments.get(player.id);
                    if (!mission) continue;
                    await tx.playerMission.create({
                        data: {
                            playerId: player.id,
                            missionId: mission.id,
                            type: 'MID',
                        },
                    });
                }
            });
            createdByUs = true;
            console.log(`[check-mid-missions] MID missions assigned to room ${code}`);
        } catch (createError: any) {
            // Erreur de contrainte unique = les missions ont été créées par une autre requête
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
