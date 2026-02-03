import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { filterPrivateMissions } from '@/lib/filterPrivateMissions';

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

        // Vérifie si des missions LATE ont déjà été assignées
        const hasLateMissions = room.players.some(player =>
            player.missions.some(m => m.type === 'LATE')
        );

        if (hasLateMissions) {
            return Response.json({
                message: 'LATE missions already assigned',
                shouldAssign: false,
            });
        }

        // Récupère toutes les missions LATE disponibles
        const lateMissions = await prisma.mission.findMany({
            where: { type: 'LATE' },
        });

        if (lateMissions.length < room.players.length) {
            return Response.json(
                { error: 'Not enough LATE missions available' },
                { status: 500 }
            );
        }

        // Mélange les missions (Fisher-Yates)
        const shuffledMissions = [...lateMissions];
        for (let i = shuffledMissions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledMissions[i], shuffledMissions[j]] = [shuffledMissions[j], shuffledMissions[i]];
        }

        // Assigne une mission LATE à chaque joueur (avec transaction pour atomicité)
        let createdByUs = false;
        try {
            await prisma.$transaction(async (tx) => {
                for (let i = 0; i < room.players.length; i++) {
                    await tx.playerMission.create({
                        data: {
                            playerId: room.players[i].id,
                            missionId: shuffledMissions[i].id,
                            type: 'LATE',
                        },
                    });
                }
            });
            createdByUs = true;
            console.log(`[check-late-missions] LATE missions assigned to room ${code}`);
        } catch (createError: any) {
            // Erreur de contrainte unique = les missions ont été créées par une autre requête
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
