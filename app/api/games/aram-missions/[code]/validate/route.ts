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

// PATCH — le créateur avance au joueur suivant, passe en sélection bonus, ou met à jour l'équipe gagnante
// Body: { creatorToken, currentPlayerIndex?, bonusSelection?, winnerTeam? }
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const { creatorToken, currentPlayerIndex, bonusSelection, eventsValidation, winnerTeam } = await request.json();

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

        const data: { validationStatus?: string; winnerTeam?: string } = {};

        if (currentPlayerIndex !== undefined) {
            data.validationStatus = `in_progress:${currentPlayerIndex}`;
        }
        if (eventsValidation) {
            data.validationStatus = 'events_validation';
        }
        if (bonusSelection) {
            data.validationStatus = 'bonus_selection';
        }
        if (winnerTeam !== undefined) {
            data.winnerTeam = winnerTeam;
        }

        await prisma.room.update({ where: { code }, data });

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
        const body = await request.json();
        const creatorToken = body.creatorToken as string | undefined;
        const winnerTeam = body.winnerTeam as 'red' | 'blue' | null | undefined;

        if (!creatorToken) {
            return NextResponse.json({ error: 'Missing creatorToken' }, { status: 400 });
        }

        const room = await prisma.room.findUnique({
            where: { code },
            include: {
                players: {
                    include: {
                        missions: {
                            include: { mission: true },
                        },
                    },
                },
                gameHistories: true,
            },
        });

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }
        if (room.creatorToken !== creatorToken) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Garde d'idempotence : si déjà finalisé, ne pas recréer d'historique
        if (room.validationStatus === 'completed') {
            return NextResponse.json({ success: true });
        }

        // Tirage aléatoire pondéré du bonus de victoire
        // 0: 23%, 100: 24%, 200: 23%, 300: 15%, 400: 10%, 500: 5%
        const weightedBonus = [
            { points: 0,   weight: 23 },
            { points: 100, weight: 24 },
            { points: 200, weight: 23 },
            { points: 300, weight: 15 },
            { points: 400, weight: 10 },
            { points: 500, weight: 5 },
        ];
        let randomBonus = 0;
        if (winnerTeam) {
            const roll = Math.random() * 100;
            let cumulative = 0;
            for (const entry of weightedBonus) {
                cumulative += entry.weight;
                if (roll < cumulative) {
                    randomBonus = entry.points;
                    break;
                }
            }
        }

        // Calculer les scores finaux par équipe
        const teamScores: { red: number; blue: number } = { red: 0, blue: 0 };
        for (const player of room.players) {
            if (player.team === 'red' || player.team === 'blue') {
                for (const pm of player.missions) {
                    if (pm.validated) {
                        teamScores[player.team as 'red' | 'blue'] += pm.pointsEarned;
                    }
                }
            }
        }

        // Ajouter les points des événements
        const roomEvents = await prisma.roomEvent.findMany({
            where: { roomId: room.id, appearedAt: { not: null } },
            include: { event: true },
        });
        for (const re of roomEvents) {
            teamScores.red += re.pointsEarnedRed;
            teamScores.blue += re.pointsEarnedBlue;
        }

        // Ajouter le bonus de victoire au score de l'équipe gagnante
        if (winnerTeam === 'red' || winnerTeam === 'blue') {
            teamScores[winnerTeam] += randomBonus;
        }

        // Le vainqueur est l'équipe avec le plus de points (bonus inclus)
        const actualWinner = teamScores.blue > teamScores.red ? 'blue'
            : teamScores.red > teamScores.blue ? 'red'
            : null;

        // Créer le snapshot des joueurs avec leurs missions
        const playersSnapshot = room.players
            .filter(p => p.team === 'red' || p.team === 'blue')
            .map(player => ({
                name: player.name,
                team: player.team,
                avatar: player.avatar,
                missions: player.missions.map(pm => ({
                    text: pm.resolvedText || pm.mission.text,
                    type: pm.type,
                    validated: pm.validated,
                    points: pm.pointsEarned,
                    isPrivate: pm.mission.isPrivate,
                })),
            }));

        // Créer le snapshot des événements
        const eventsSnapshot = roomEvents.length > 0
            ? JSON.stringify(roomEvents.map(re => ({
                text: re.resolvedText || re.event.text,
                type: re.event.type,
                difficulty: re.event.difficulty,
                points: re.event.points,
                pointsEarnedRed: re.pointsEarnedRed,
                pointsEarnedBlue: re.pointsEarnedBlue,
                redValidated: re.redValidated,
                blueValidated: re.blueValidated,
            })))
            : null;

        // Créer l'historique de la partie
        const gameNumber = room.gameHistories.length + 1;
        await prisma.gameHistory.create({
            data: {
                roomId: room.id,
                gameNumber,
                redScore: teamScores.red,
                blueScore: teamScores.blue,
                winnerTeam: actualWinner,
                victoryBonusPoints: randomBonus,
                bonusTeam: winnerTeam || null,
                playersSnapshot: JSON.stringify(playersSnapshot),
                eventsSnapshot,
            },
        });

        await prisma.room.update({
            where: { code },
            data: {
                validationStatus: 'completed',
                winnerTeam: winnerTeam || null,
                victoryBonusPoints: randomBonus,
            },
        });

        // Push : validation terminée, récapitulatif affiché pour tous
        await pushRoomUpdate(code);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error completing validation:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
