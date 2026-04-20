import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';
import { generateQuestionSet } from '@/lib/beatEikichi/dailyQuestions';

const bodySchema = z.object({
  creatorToken: z.string().min(1),
  eikichiPlayerId: z.string().nullable().optional(),
});

/**
 * POST /api/games/beat-eikichi/[code]/start
 *
 * Démarre (ou reset) la partie Beat Eikichi de la room.
 * - Réservé au créateur de la room.
 * - Tire 20 questions aléatoires fraîches depuis le catalogue (pour la rejouabilité).
 * - Crée un BeatEikichiGame + un BeatEikichiPlayerState par joueur présent.
 * - Pose gameStarted=true sur la room.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { creatorToken, eikichiPlayerId } = bodySchema.parse(body);

    const room = await prisma.room.findUnique({
      where: { code },
      include: { players: true, beatEikichiGame: true },
    });

    if (!room) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }
    if (!isCreator(room, creatorToken)) {
      return Response.json(
        { error: 'Only the room creator can start the game' },
        { status: 403 },
      );
    }
    if (room.players.length === 0) {
      return Response.json({ error: 'No players in room' }, { status: 400 });
    }

    // Détermine qui est Eikichi :
    // 1. Si fourni explicitement dans le body → celui-ci (même si null pour "Aucun").
    // 2. Sinon → ce qui a été choisi dans le lobby (room.beatEikichiEikichiId).
    const rawEikichiId =
      eikichiPlayerId === undefined ? room.beatEikichiEikichiId : eikichiPlayerId;
    const validatedEikichiId =
      rawEikichiId && room.players.some((p) => p.id === rawEikichiId)
        ? rawEikichiId
        : null;

    // Tirage des 20 questions pour CETTE partie (aléatoire frais).
    const questions = await generateQuestionSet();

    // Nettoyage éventuel d'une partie précédente pour cette room.
    if (room.beatEikichiGame) {
      await prisma.beatEikichiGame.delete({
        where: { roomId: room.id },
      });
    }

    // Création de la partie + un état par joueur.
    const now = new Date();
    await prisma.beatEikichiGame.create({
      data: {
        roomId: room.id,
        questions: questions as unknown as object,
        phase: 'playing',
        currentIndex: 0,
        questionStartedAt: now,
        eikichiPlayerId: validatedEikichiId,
        // Snapshot des réglages depuis la Room au moment du démarrage.
        timerSeconds: room.beatEikichiTimerSeconds,
        mode: room.beatEikichiMode,
        playerStates: {
          create: room.players.map((p) => ({
            playerId: p.id,
            // Snapshot de l'arme choisie dans le lobby.
            weaponId: p.beatEikichiWeaponId,
            weaponUsesLeft: p.beatEikichiWeaponId ? 3 : 0,
            lastUsedQuestionIndex: -1,
          })),
        },
      },
    });

    await prisma.room.update({
      where: { id: room.id },
      data: { gameStarted: true, gameStopped: false },
    });

    await pushRoomUpdate(code);

    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[BEAT-EIKICHI] start error:', error);
    return Response.json({ error: 'Failed to start game' }, { status: 500 });
  }
}
