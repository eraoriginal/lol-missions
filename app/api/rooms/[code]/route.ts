import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { filterPrivateMissions } from '@/lib/filterPrivateMissions';

// Force dynamic rendering - pas de cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        // Récupère le token du joueur depuis les query params
        const { searchParams } = new URL(request.url);
        const playerToken = searchParams.get('playerToken');

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
                        pendingChoices: {
                            include: {
                                mission: true,
                            },
                        },
                    },
                },
                codenameGame: {
                    include: {
                        cards: {
                            orderBy: { position: 'asc' },
                            include: {
                                interests: true,
                            },
                        },
                        history: {
                            orderBy: { createdAt: 'asc' },
                        },
                    },
                },
                gameHistories: {
                    orderBy: { gameNumber: 'asc' },
                },
                roomEvents: {
                    include: { event: true },
                    orderBy: { scheduledAt: 'asc' },
                },
                playerBets: {
                    include: {
                        betType: true,
                        player: true,
                        targetPlayer: true,
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

        // Filtre les missions secrètes pendant la partie
        const filteredRoom = filterPrivateMissions(room, playerToken);

        // Transforme les playerBets pour le frontend
        const currentPlayer = room.players.find(p => p.token === playerToken);
        const isGameActive = room.gameStarted && !room.gameStopped && room.validationStatus === 'not_started';

        const mappedBets = (room.playerBets || []).map((bet: { id: string; playerId: string; points: number; validated: boolean; decided: boolean; player: { name: string; team: string }; betType: { id: string; text: string; category: string }; targetPlayer: { id: string; name: string } }) => ({
            id: bet.id,
            playerId: bet.playerId,
            playerName: bet.player.name,
            playerTeam: bet.player.team,
            betType: {
                id: bet.betType.id,
                text: bet.betType.text,
                category: bet.betType.category,
            },
            targetPlayerName: bet.targetPlayer.name,
            targetPlayerId: bet.targetPlayer.id,
            points: bet.points,
            validated: bet.validated,
            decided: bet.decided,
        }));

        // Pendant le jeu actif, chaque joueur ne voit que son propre pari
        const filteredBets = isGameActive && currentPlayer
            ? mappedBets.filter((b: { playerId: string }) => b.playerId === currentPlayer.id)
            : mappedBets;

        const responseRoom = {
            ...filteredRoom,
            playerBets: filteredBets,
        };

        // Headers pour éviter le cache sur Vercel
        return NextResponse.json({ room: responseRoom }, {
            headers: {
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
            }
        });
    } catch (error) {
        console.error('Error fetching room:', error);
        return Response.json(
            { error: 'Failed to fetch room' },
            { status: 500 }
        );
    }
}