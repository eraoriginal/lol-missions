import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pushRoomUpdate } from '@/lib/pusher';
import { z } from 'zod';

const roleSchema = z.object({
  playerToken: z.string(),
  role: z.enum(['spymaster', 'operative']),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const { playerToken, role } = roleSchema.parse(body);

    const room = await prisma.room.findUnique({
      where: { code },
      include: {
        players: true,
        codenameGame: true,
      },
    });

    if (!room) {
      return Response.json({ error: 'Room not found' }, { status: 404 });
    }

    if (!room.codenameGame) {
      return Response.json({ error: 'Game not started yet' }, { status: 400 });
    }

    const player = room.players.find((p) => p.token === playerToken);

    if (!player) {
      return Response.json({ error: 'Player not found' }, { status: 404 });
    }

    if (!player.team || (player.team !== 'red' && player.team !== 'blue')) {
      return Response.json(
        { error: 'You must join a team (red or blue) before selecting a role' },
        { status: 400 }
      );
    }

    // If becoming spymaster and there's already one, replace them
    if (role === 'spymaster') {
      const existingSpymaster = room.players.find(
        (p) => p.team === player.team && p.role === 'spymaster' && p.id !== player.id
      );

      if (existingSpymaster) {
        // Remove spymaster role from previous player
        await prisma.player.update({
          where: { id: existingSpymaster.id },
          data: { role: null },
        });
        console.log(`[CODENAME] ${existingSpymaster.name} replaced as spymaster by ${player.name}`);
      }
    }

    // Update player role
    const updatedPlayer = await prisma.player.update({
      where: { id: player.id },
      data: { role },
    });

    console.log(`[CODENAME] Player ${player.name} set role to ${role} on team ${player.team}`);

    await pushRoomUpdate(code);

    return Response.json({ player: updatedPlayer });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid input', details: error.issues }, { status: 400 });
    }
    console.error('Error setting role:', error);
    return Response.json({ error: 'Failed to set role' }, { status: 500 });
  }
}
