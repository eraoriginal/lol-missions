import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { SHIELD_WEAPON_ID } from '@/lib/beatEikichi/weapons';

const bodySchema = z.object({
  playerToken: z.string().min(1),
});

/**
 * POST /api/games/beat-eikichi/[code]/fire-shield
 *
 * Le joueur active son bouclier (disponible à tous, indépendamment de l'arme choisie)
 * pour la PROCHAINE question. Tout effet d'arme qui atterrit sur lui à cette question
 * sera annulé.
 *
 * Règles :
 *   - Phase doit être "playing"
 *   - Joueur a `shieldUsesLeft > 0`
 *   - Cible = toujours soi-même (pas de paramètre targetPlayerId)
 *
 * Effet : crée un BeatEikichiWeaponEvent (weaponId='shield', targetPlayerId=self,
 * questionIndex = currentIndex + 1), décrémente shieldUsesLeft, pushRoomUpdate.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerToken } = bodySchema.parse(body);

    const room = await prisma.room.findUnique({
      where: { code },
      include: {
        players: true,
        beatEikichiGame: { include: { playerStates: true } },
      },
    });
    if (!room || !room.beatEikichiGame) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }
    const game = room.beatEikichiGame;
    if (game.phase !== 'playing') {
      return Response.json(
        { error: 'Not in playing phase' },
        { status: 400 },
      );
    }

    const player = await prisma.player.findUnique({
      where: { token: playerToken },
    });
    if (!player || player.roomId !== room.id) {
      return Response.json({ error: 'Player not in room' }, { status: 403 });
    }

    const state = game.playerStates.find((s) => s.playerId === player.id);
    if (!state) {
      return Response.json({ error: 'Player state not found' }, { status: 404 });
    }

    // En mode "all-vs-eikichi", le Eikichi est l'attaquant exclusif et N'A PAS
    // de bouclier (shieldUsesLeft=0 au /start). Ce check est défensif : si un
    // état corrompu lui en attribuait, on bloque quand même côté route.
    const isEikichi = game.eikichiPlayerId === player.id;
    if (game.mode === 'all-vs-eikichi' && isEikichi) {
      return Response.json(
        { error: 'Eikichi cannot use a shield in all-vs-eikichi mode' },
        { status: 403 },
      );
    }

    // Pré-check soft (early-out commun) : si le compteur est déjà à 0 dans
    // l'état lu, on rejette tôt sans toucher la DB. Le vrai gate atomique
    // est l'updateMany ci-dessous.
    if (state.shieldUsesLeft <= 0) {
      return Response.json(
        { error: 'No shield uses left for this game' },
        { status: 400 },
      );
    }

    // ORDRE CRITIQUE : INSERT d'abord, décrément ensuite.
    //   - INSERT : la contrainte unique (gameId, firedByPlayerId,
    //     targetPlayerId, questionIndex) garantit qu'UN SEUL fire-shield
    //     concurrent réussit pour cette question. Les autres reçoivent
    //     P2002 → idempotent (le bouclier est déjà armé, pas de décrément).
    //   - Décrément SEULEMENT si l'INSERT a gagné. Évite le bug où N
    //     décrément pré-INSERT consommaient artificiellement les charges
    //     de tous les concurrents.
    try {
      await prisma.beatEikichiWeaponEvent.create({
        data: {
          gameId: game.id,
          firedByPlayerId: player.id,
          targetPlayerId: player.id,
          weaponId: SHIELD_WEAPON_ID,
          questionIndex: game.currentIndex + 1,
        },
      });
    } catch (e) {
      const isUnique =
        e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';
      if (isUnique) {
        await pushRoomUpdate(code);
        return Response.json({ ok: true, alreadyArmed: true });
      }
      throw e;
    }

    // Décrément atomique post-INSERT (le 1er insert gagnant doit consommer
    // 1 charge, et lui seul). updateMany conditionnel : si l'état lu
    // antérieurement avait shieldUsesLeft=0, l'update ne matchera pas.
    const updated = await prisma.beatEikichiPlayerState.updateMany({
      where: { id: state.id, shieldUsesLeft: { gt: 0 } },
      data: { shieldUsesLeft: { decrement: 1 } },
    });
    if (updated.count === 0) {
      // Cas pathologique : l'INSERT a réussi mais le compteur est déjà à 0.
      // Très peu probable (seuls 3 boucliers possibles par partie + contrainte
      // unique sur la question courante limite à 1/question), mais on log au
      // cas où.
      console.warn(`[fire-shield] insert OK mais shieldUsesLeft=0 pour state ${state.id}`);
    }

    await pushRoomUpdate(code);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 },
      );
    }
    console.error('[BEAT-EIKICHI] fire-shield error:', error);
    return Response.json({ error: 'Failed to fire shield' }, { status: 500 });
  }
}
