import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { isCreator } from '@/lib/utils';
import { generateQuestionSet } from '@/lib/beatEikichi/dailyQuestions';
import { WEAPON_IDS } from '@/lib/beatEikichi/weapons';

/**
 * Construit le `weaponStacks` initial du Eikichi en mode "all-vs-eikichi".
 * 12 armes × 3 utilisations chacune. Stocké comme map { id: usesLeft } pour
 * permettre des décréments atomiques type `weaponStacks.smoke -= 1` simulés
 * en JSON côté serveur.
 */
function initialWeaponStacks(): Record<string, number> {
  const stacks: Record<string, number> = {};
  for (const id of WEAPON_IDS) stacks[id] = 3;
  return stacks;
}

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
    // Mode "all-vs-eikichi" : Eikichi a 12 armes × 3 stacks (`weaponStacks`),
    // PAS de bouclier (shieldUsesLeft=0). Les autres joueurs n'ont AUCUNE
    // arme (weaponId=null, weaponUsesLeft=0) mais conservent 3 boucliers.
    // Mode "standard" : comportement historique (1 arme choisie au lobby +
    // 3 boucliers pour tous).
    const now = new Date();
    const isAllVsEikichi = room.beatEikichiMode === 'all-vs-eikichi';
    const eikichiStacks = initialWeaponStacks();

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
          create: room.players.map((p) => {
            const isEikichi = validatedEikichiId === p.id;
            if (isAllVsEikichi) {
              if (isEikichi) {
                return {
                  playerId: p.id,
                  weaponId: null,
                  weaponUsesLeft: 0,
                  lastUsedQuestionIndex: -1,
                  shieldUsesLeft: 0, // pas de bouclier pour l'attaquant
                  weaponStacks: eikichiStacks as unknown as object,
                };
              }
              // Non-Eikichi en all-vs-eikichi : que des boucliers.
              return {
                playerId: p.id,
                weaponId: null,
                weaponUsesLeft: 0,
                lastUsedQuestionIndex: -1,
                shieldUsesLeft: 3,
              };
            }
            // Mode standard.
            return {
              playerId: p.id,
              weaponId: p.beatEikichiWeaponId,
              weaponUsesLeft: p.beatEikichiWeaponId ? 3 : 0,
              lastUsedQuestionIndex: -1,
            };
          }),
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
