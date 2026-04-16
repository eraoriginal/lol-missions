import { prisma } from '@/lib/prisma';

/**
 * GET /api/games/beat-eikichi/[code]/catalog
 *
 * Retourne le catalogue des 500 jeux vidéo (nom + aliases) pour alimenter l'autocomplétion côté client.
 * Le catalogue est identique pour tous, indépendant de la room. La room est utilisée uniquement pour valider l'accès.
 */
export async function GET() {
  try {
    const games = await prisma.videoGame.findMany({
      select: { id: true, name: true, aliases: true },
      orderBy: { name: 'asc' },
    });

    return Response.json(
      { games },
      {
        // Cache côté client 1h — le catalogue bouge rarement.
        headers: {
          'Cache-Control': 'public, max-age=3600',
        },
      },
    );
  } catch (error) {
    console.error('[BEAT-EIKICHI] catalog error:', error);
    return Response.json({ error: 'Failed to load catalog' }, { status: 500 });
  }
}
