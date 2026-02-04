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
        const { creatorToken, currentPlayerIndex, bonusSelection, winnerTeam } = await request.json();

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
        const { creatorToken, winnerTeam } = await request.json();

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

        // Tirage aléatoire pondéré du bonus de victoire
        // 0: 15%, 100: 20%, 200: 20%, 300: 20%, 400: 15%, 500: 10%
        const weightedBonus = [
            { points: 0,   weight: 15 },
            { points: 100, weight: 20 },
            { points: 200, weight: 20 },
            { points: 300, weight: 20 },
            { points: 400, weight: 15 },
            { points: 500, weight: 10 },
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
