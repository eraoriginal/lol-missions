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

        // Headers pour éviter le cache sur Vercel
        return NextResponse.json({ room: filteredRoom }, {
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