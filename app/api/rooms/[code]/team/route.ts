import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST — un joueur choisit une équipe
// Body: { playerToken, team } où team est "red", "blue", ou "" (spectateur)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const { playerToken, team } = await request.json();

        if (!playerToken || team === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Valide que team est une valeur autorisée
        if (!['red', 'blue', ''].includes(team)) {
            return NextResponse.json({ error: 'Invalid team value' }, { status: 400 });
        }

        const room = await prisma.room.findUnique({
            where: { code },
            include: { players: true },
        });

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 });
        }

        // Trouve le joueur par token
        const player = room.players.find(p => p.token === playerToken);
        if (!player) {
            return NextResponse.json({ error: 'Player not found' }, { status: 404 });
        }

        // Si le joueur essaie d'aller dans une équipe, vérifie le cap de 5
        if (team === 'red' || team === 'blue') {
            const teamCount = room.players.filter(p => p.team === team && p.id !== player.id).length;
            if (teamCount >= 5) {
                return NextResponse.json(
                    { error: `L'équipe ${team === 'red' ? 'rouge' : 'bleue'} est déjà pleine (5 joueurs max)` },
                    { status: 400 }
                );
            }
        }

        // Met à jour
        await prisma.player.update({
            where: { id: player.id },
            data: { team },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating team:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}