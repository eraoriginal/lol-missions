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
                    // Ordre stable par date d'arrivée : évite que l'ordre change quand
                    // un Player est mis à jour (ex. changement d'arme lobby).
                    orderBy: { createdAt: 'asc' },
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
                beatEikichiGame: {
                    include: {
                        playerStates: true,
                        weaponEvents: {
                            orderBy: { firedAt: 'asc' },
                        },
                    },
                },
                quizCeoGame: {
                    include: {
                        playerStates: true,
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

        // Beat Eikichi : en phase "playing", masquer name/aliases des questions pour
        // éviter que les clients voient les réponses via devtools. Le serveur valide
        // les réponses internement. On expose name/aliases seulement en phase review
        // et leaderboard. Les indices (hintGenre/hintTerm/hintPlatforms) ne sont
        // révélés que si la room a `beatEikichiHintsEnabled` activé.
        const beGame = (filteredRoom as { beatEikichiGame?: {
            phase?: string;
            questions?: Array<{
                position: number;
                gameId: string;
                name?: string;
                aliases?: string[];
                imageUrl: string;
                hintGenre?: string | null;
                hintTerm?: string | null;
                hintPlatforms?: string | null;
            }>;
        } | null }).beatEikichiGame;
        const hintsEnabled = (filteredRoom as { beatEikichiHintsEnabled?: boolean }).beatEikichiHintsEnabled === true;
        if (beGame && beGame.phase === 'playing' && Array.isArray(beGame.questions)) {
            beGame.questions = beGame.questions.map((q) => ({
                position: q.position,
                gameId: q.gameId,
                imageUrl: q.imageUrl,
                // name et aliases masqués côté client tant que la partie n'est pas terminée
                hintGenre: hintsEnabled ? q.hintGenre ?? null : null,
                hintTerm: hintsEnabled ? q.hintTerm ?? null : null,
                hintPlatforms: hintsEnabled ? q.hintPlatforms ?? null : null,
            }));
        }

        // Quiz du CEO : en phase "playing" / "waiting_review" :
        //   - strip le champ `answer` des questions (anti-spoil devtools).
        //   - masque les réponses des autres joueurs (chaque joueur ne voit
        //     que ses propres `answers`).
        // En phase "review" / "leaderboard", la partie est terminée : on expose tout.
        const quizGame = (filteredRoom as { quizCeoGame?: {
            phase?: string;
            questions?: Array<Record<string, unknown>>;
            playerStates?: Array<{ playerId: string; answers: unknown; score: number; id: string; gameId: string }>;
        } | null }).quizCeoGame;
        if (quizGame) {
            const phase = quizGame.phase;
            if (phase === 'playing' || phase === 'waiting_review') {
                if (Array.isArray(quizGame.questions)) {
                    quizGame.questions = quizGame.questions.map((q, index) => {
                        const clone = { ...q };
                        delete clone.answer;
                        // Anti-spoil DevTools : pour les questions dont l'imageUrl
                        // pointe vers un asset local nommé d'après la réponse
                        // (ex. `/brand-logos/apple.svg`), on réécrit vers une
                        // URL proxy opaque qui ne révèle rien.
                        const payload = clone.payload as { imageUrl?: string } | undefined;
                        const url = payload?.imageUrl;
                        if (
                            typeof url === 'string' &&
                            (url.startsWith('/brand-logos/') ||
                                url.startsWith('/country-shapes/'))
                        ) {
                            clone.payload = {
                                ...payload,
                                imageUrl: `/api/games/quiz-ceo/${code}/asset/${index}`,
                            };
                        }
                        return clone;
                    });
                }
                if (Array.isArray(quizGame.playerStates) && currentPlayer) {
                    quizGame.playerStates = quizGame.playerStates.map((s) => ({
                        ...s,
                        answers: s.playerId === currentPlayer.id ? s.answers : [],
                    }));
                }
            }
        }

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