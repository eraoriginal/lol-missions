import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering - pas de cache
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

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

        // Headers pour éviter le cache sur Vercel
        return NextResponse.json({ room }, {
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