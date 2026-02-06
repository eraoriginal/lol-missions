import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';
import { filterPrivateMissions } from '@/lib/filterPrivateMissions';
import { assignBalancedMissions, processDuelMissions } from '@/lib/balancedMissionAssignment';
import { resolvePlayerPlaceholder } from '@/lib/resolvePlayerPlaceholder';
import { z } from 'zod';

const startGameSchema = z.object({
    creatorToken: z.string(),
});

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    try {
        const { code } = await params;
        const body = await request.json();
        const { creatorToken } = startGameSchema.parse(body);

        const room = await prisma.room.findUnique({
            where: { code },
            include: {
                players: {
                    include: { missions: true },
                },
            },
        });

        if (!room) {
            return Response.json({ error: 'Room not found' }, { status: 404 });
        }

        if (!isCreator(room, creatorToken)) {
            return Response.json(
                { error: 'Only the room creator can start the game' },
                { status: 403 }
            );
        }

        if (room.gameStarted) {
            return Response.json({ error: 'Game already started' }, { status: 400 });
        }

        if (room.players.length < 2) {
            return Response.json({ error: 'Need at least 2 players to start' }, { status: 400 });
        }

        // Debug: affiche les joueurs avec leurs équipes
        console.log('[START] room.players:', room.players.map(p => ({ id: p.id, name: p.name, team: p.team })));

        // Récupère les missions START (y compris les missions duel)
        const startMissions = await prisma.mission.findMany({
            where: { type: 'START', OR: [{ maps: room.gameMap }, { maps: 'all' }] }
        });

        if (startMissions.length < room.players.length) {
            return Response.json({ error: 'Not enough missions available' }, { status: 500 });
        }

        // Tirage aléatoire équilibré (inclut potentiellement des missions duel)
        const assignments = assignBalancedMissions(room.players, startMissions, 'START');

        // Debug: log des missions avec placeholder
        const missionsWithPlaceholder = Array.from(assignments.entries())
            .filter(([_, m]) => m.playerPlaceholder)
            .map(([playerId, m]) => ({
                playerId,
                playerName: room.players.find(p => p.id === playerId)?.name,
                playerTeam: room.players.find(p => p.id === playerId)?.team,
                missionText: m.text,
                placeholder: m.playerPlaceholder,
            }));
        console.log('[START] Missions avec placeholder:', JSON.stringify(missionsWithPlaceholder, null, 2));

        // Debug: log des joueurs
        console.log('[START] Joueurs:', room.players.map(p => ({ id: p.id, name: p.name, team: p.team })));

        // Post-traite les missions duel : si une mission duel est tirée,
        // l'adversaire reçoit aussi cette mission
        const duelPairs = processDuelMissions(assignments, room.players, startMissions);
        console.log('[START] Duel pairs créées:', JSON.stringify(duelPairs, null, 2));

        // Crée un map pour accéder rapidement aux textes résolus des duels
        const duelResolvedTexts = new Map<string, string>();
        for (const pair of duelPairs) {
            duelResolvedTexts.set(pair.player1Id, pair.player1ResolvedText);
            duelResolvedTexts.set(pair.player2Id, pair.player2ResolvedText);
        }

        await Promise.all(
            room.players.map((player) => {
                const mission = assignments.get(player.id);
                if (!mission) return Promise.resolve();

                // Si c'est une mission duel, utiliser le texte pré-résolu
                // Sinon, résoudre les autres placeholders normalement
                const duelText = duelResolvedTexts.get(player.id);
                const placeholderText = resolvePlayerPlaceholder(mission, player, room.players);
                const resolvedText = duelText ?? placeholderText;

                // Debug log
                if (mission.playerPlaceholder) {
                    console.log(`[START] Player ${player.name}: placeholder=${mission.playerPlaceholder}, duelText=${duelText}, placeholderText=${placeholderText}, final=${resolvedText}`);
                }

                return prisma.playerMission.create({
                    data: {
                        playerId: player.id,
                        missionId: mission.id,
                        type: 'START',
                        resolvedText,
                    },
                });
            })
        );

        // gameStarted = true, mais gameStartTime reste null
        // Le compteur ne démarre que quand le créateur clique "Lancer le compteur"
        const updatedRoom = await prisma.room.update({
            where: { id: room.id },
            data: {
                gameStarted: true,
                gameStartTime: null,
            },
            include: {
                players: {
                    include: { missions: { include: { mission: true } } },
                },
            },
        });

        console.log(`[START] Game started in room ${code} — waiting for countdown launch`);

        // Push : partie démarrée + missions START assignées
        await pushRoomUpdate(code);

        return Response.json({ room: filterPrivateMissions(updatedRoom, null) });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
        }
        console.error('Error starting game:', error);
        return Response.json({ error: 'Failed to start game' }, { status: 500 });
    }
}
