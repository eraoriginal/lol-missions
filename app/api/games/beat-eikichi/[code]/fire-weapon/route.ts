import { NextRequest } from 'next/server';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { getWeapon } from '@/lib/beatEikichi/weapons';

const bodySchema = z.object({
  playerToken: z.string().min(1),
  targetPlayerId: z.string().min(1),
  // En mode "all-vs-eikichi", le Eikichi a 12 armes — il doit donc préciser
  // laquelle il tire. En mode standard, ce champ est ignoré (l'arme est
  // celle snapshotée au démarrage sur PlayerState.weaponId).
  weaponId: z.string().min(1).optional(),
});

/**
 * POST /api/games/beat-eikichi/[code]/fire-weapon
 *
 * Le joueur tire son arme (snapshotée sur PlayerState.weaponId) sur un autre joueur ;
 * l'effet s'applique à la PROCHAINE question (pour permettre au bouclier de réagir).
 *
 * Règles :
 *   - Phase doit être "playing"
 *   - Tireur a une arme assignée
 *   - Tireur a weaponUsesLeft > 0
 *   - Cible ≠ self (sauf pour l'arme "shield" qui cible toujours self)
 *   - Cible est dans la room
 *   - Plus de cooldown "1 tir par question" : l'effet est différé, on peut enchaîner
 *     plusieurs tirs dans la même question (limité seulement par weaponUsesLeft).
 *
 * Effet : crée un BeatEikichiWeaponEvent avec questionIndex = currentIndex + 1,
 * décrémente usesLeft, pushRoomUpdate.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerToken, targetPlayerId, weaponId: requestedWeaponId } = bodySchema.parse(body);

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

    const player = await prisma.player.findUnique({ where: { token: playerToken } });
    if (!player || player.roomId !== room.id) {
      return Response.json({ error: 'Player not in room' }, { status: 403 });
    }

    const state = game.playerStates.find((s) => s.playerId === player.id);
    if (!state) {
      return Response.json({ error: 'Player state not found' }, { status: 404 });
    }

    if (player.id === targetPlayerId) {
      return Response.json(
        { error: 'Cannot target yourself' },
        { status: 400 },
      );
    }
    if (!room.players.find((p) => p.id === targetPlayerId)) {
      return Response.json({ error: 'Target not in room' }, { status: 400 });
    }

    const isAllVsEikichi = game.mode === 'all-vs-eikichi';
    const isEikichi = game.eikichiPlayerId === player.id;

    // En mode "all-vs-eikichi", SEUL le Eikichi peut tirer une arme.
    if (isAllVsEikichi && !isEikichi) {
      return Response.json(
        { error: 'Only Eikichi can fire weapons in all-vs-eikichi mode' },
        { status: 403 },
      );
    }

    // L'effet s'applique à la PROCHAINE question.
    const targetQuestionIndex = game.currentIndex + 1;

    // Détermine quelle arme on tire :
    //  - mode standard : `state.weaponId` (snapshoté au lobby)
    //  - all-vs-eikichi : `requestedWeaponId` (envoyé dans le body)
    const weaponIdToFire = isAllVsEikichi ? requestedWeaponId : state.weaponId;
    if (!weaponIdToFire) {
      return Response.json(
        { error: isAllVsEikichi ? 'weaponId required in all-vs-eikichi mode' : 'No weapon assigned' },
        { status: 400 },
      );
    }
    const weapon = getWeapon(weaponIdToFire);
    if (!weapon) {
      return Response.json({ error: 'Invalid weapon' }, { status: 400 });
    }

    // Pré-check soft du stock (early-out commun, économise un INSERT raté).
    if (isAllVsEikichi) {
      const stacks = (state.weaponStacks as Record<string, number> | null) ?? {};
      if ((stacks[weaponIdToFire] ?? 0) <= 0) {
        return Response.json(
          { error: `No stack left for weapon ${weaponIdToFire}` },
          { status: 400 },
        );
      }
    } else if (state.weaponUsesLeft <= 0) {
      return Response.json(
        { error: 'No uses left for this game' },
        { status: 400 },
      );
    }

    // ORDRE CRITIQUE : INSERT D'ABORD, décrément ENSUITE.
    // La contrainte unique (gameId, firedByPlayerId, targetPlayerId,
    // questionIndex) garantit qu'UN SEUL fire-weapon concurrent réussit
    // pour cette cible+question. Les autres reçoivent P2002 → 400 sans
    // toucher au stock (pas de décrément, pas de restitution).
    //
    // Si l'INSERT réussit, on décrémente le stock atomiquement.
    // Si le stock était déjà à 0 entretemps (race), l'updateMany matchera
    // count=0 et on rollback l'INSERT (delete) pour rester cohérent.
    try {
      await prisma.beatEikichiWeaponEvent.create({
        data: {
          gameId: game.id,
          firedByPlayerId: player.id,
          targetPlayerId,
          weaponId: weapon.id,
          questionIndex: targetQuestionIndex,
        },
      });
    } catch (e) {
      const isUnique =
        e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';
      if (isUnique) {
        return Response.json(
          { error: 'Target already hit this question' },
          { status: 400 },
        );
      }
      throw e;
    }

    // Décrément atomique post-INSERT. Si le stock est à 0 entre temps (race
    // extrêmement rare où l'INSERT a réussi mais un autre thread a aussi
    // décrémenté à 0), on supprime l'event qu'on vient de créer pour rester
    // cohérent.
    let decrementedOk = false;
    if (isAllVsEikichi) {
      const updateResult = await prisma.$executeRaw(
        Prisma.sql`
          UPDATE "BeatEikichiPlayerState"
          SET "weaponStacks" = jsonb_set(
            "weaponStacks",
            ARRAY[${weaponIdToFire}]::text[],
            to_jsonb(COALESCE(("weaponStacks"->>${weaponIdToFire})::int, 0) - 1)
          )
          WHERE id = ${state.id}
            AND COALESCE(("weaponStacks"->>${weaponIdToFire})::int, 0) > 0
        `,
      );
      decrementedOk = updateResult > 0;
    } else {
      const stdUpdate = await prisma.beatEikichiPlayerState.updateMany({
        where: { id: state.id, weaponUsesLeft: { gt: 0 } },
        data: { weaponUsesLeft: { decrement: 1 } },
      });
      decrementedOk = stdUpdate.count > 0;
    }

    if (!decrementedOk) {
      // Rollback de l'INSERT : stock épuisé entre l'INSERT et le décrément.
      await prisma.beatEikichiWeaponEvent.deleteMany({
        where: {
          gameId: game.id,
          firedByPlayerId: player.id,
          targetPlayerId,
          questionIndex: targetQuestionIndex,
          weaponId: weapon.id,
        },
      });
      return Response.json(
        {
          error: isAllVsEikichi
            ? `No stack left for weapon ${weaponIdToFire}`
            : 'No uses left for this game',
        },
        { status: 400 },
      );
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
    console.error('[BEAT-EIKICHI] fire-weapon error:', error);
    return Response.json({ error: 'Failed to fire weapon' }, { status: 500 });
  }
}
