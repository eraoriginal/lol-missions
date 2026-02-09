import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { computeEffectiveElapsed } from '@/lib/gameTime';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;

        const room = await prisma.room.findUnique({
            where: { code },
            include: {
                players: true,
                roomEvents: {
                    include: { event: true },
                    orderBy: { scheduledAt: 'asc' },
                },
            },
        });

        if (!room) {
            return Response.json({ error: 'Room not found' }, { status: 404 });
        }

        if (!room.gameStartTime) {
            return Response.json({ newEvents: [], expiredEvents: [] });
        }

        const now = Date.now();
        let changed = false;

        // ── Phase 1 : Expiration des événements actifs ──
        const activeEvent = room.roomEvents.find(
            re => re.appearedAt !== null && re.endedAt === null
        );

        if (activeEvent) {
            const appearedAtMs = new Date(activeEvent.appearedAt!).getTime();
            const activeDuration = (now - appearedAtMs) / 1000;

            if (activeDuration >= activeEvent.event.duration) {
                // L'événement a expiré → le terminer et reprendre le timer
                await prisma.$transaction([
                    prisma.roomEvent.update({
                        where: { id: activeEvent.id },
                        data: { endedAt: new Date(now) },
                    }),
                    prisma.room.update({
                        where: { id: room.id },
                        data: {
                            eventPausedAt: null,
                            totalPausedDuration: room.totalPausedDuration + activeEvent.event.duration,
                        },
                    }),
                ]);

                console.log(`[CHECK-EVENTS] Event expired in room ${code}, duration=${activeEvent.event.duration}s, totalPaused=${room.totalPausedDuration + activeEvent.event.duration}s`);
                changed = true;
            }
        }

        // ── Phase 2 : Apparition d'un nouvel événement ──
        // Seulement si pas en pause (pas d'événement actif non terminé)
        // Recharger la room si on a fait un changement pour avoir l'état à jour
        const currentRoom = changed
            ? await prisma.room.findUnique({ where: { code } })
            : room;

        if (currentRoom && !currentRoom.eventPausedAt) {
            const effectiveElapsed = computeEffectiveElapsed(
                currentRoom.gameStartTime!,
                currentRoom.totalPausedDuration,
                null, // pas en pause puisqu'on vient de vérifier
                now
            );

            // Trouver les événements dus mais pas encore apparus
            const dueEvents = room.roomEvents.filter(
                re => re.scheduledAt <= effectiveElapsed && re.appearedAt === null
            );

            if (dueEvents.length > 0) {
                // On ne fait apparaître qu'un seul événement à la fois
                const nextEvent = dueEvents[0];

                // Résoudre les placeholders si présents
                let resolvedText: string | null = null;
                const eventText = nextEvent.event.text;
                if (eventText.includes('{player1}') || eventText.includes('{player2}')) {
                    // {player1} = joueur rouge au hasard, {player2} = joueur bleu au hasard
                    const redPlayers = room.players.filter(p => p.team === 'red');
                    const bluePlayers = room.players.filter(p => p.team === 'blue');
                    const player1 = redPlayers.length > 0
                        ? redPlayers[Math.floor(Math.random() * redPlayers.length)]
                        : null;
                    const player2 = bluePlayers.length > 0
                        ? bluePlayers[Math.floor(Math.random() * bluePlayers.length)]
                        : null;
                    resolvedText = eventText
                        .replace(/\{player1\}/g, player1?.name ?? 'Joueur rouge')
                        .replace(/\{player2\}/g, player2?.name ?? 'Joueur bleu');
                } else if (eventText.includes('{player}')) {
                    // {player} = un joueur au hasard parmi toutes les équipes
                    const allPlayers = room.players.filter(p => p.team === 'red' || p.team === 'blue');
                    const player = allPlayers.length > 0
                        ? allPlayers[Math.floor(Math.random() * allPlayers.length)]
                        : null;
                    resolvedText = eventText
                        .replace(/\{player\}/g, player?.name ?? 'Un joueur');
                }

                await prisma.$transaction([
                    prisma.roomEvent.update({
                        where: { id: nextEvent.id },
                        data: { appearedAt: new Date(now), resolvedText },
                    }),
                    prisma.room.update({
                        where: { id: room.id },
                        data: { eventPausedAt: new Date(now) },
                    }),
                ]);

                console.log(`[CHECK-EVENTS] Event appeared in room ${code}, scheduledAt=${nextEvent.scheduledAt}s, effectiveElapsed=${Math.floor(effectiveElapsed)}s`);
                changed = true;
            }
        }

        if (changed) {
            await pushRoomUpdate(code);
        }

        return Response.json({ changed });
    } catch (error) {
        console.error('Error checking events:', error);
        return Response.json({ error: 'Internal server error' }, { status: 500 });
    }
}
