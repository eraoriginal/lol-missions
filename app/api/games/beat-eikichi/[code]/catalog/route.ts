import { prisma } from '@/lib/prisma';

/**
 * GET /api/games/beat-eikichi/[code]/catalog
 *
 * Retourne le catalogue des jeux vidéo (id + nom canonique uniquement) pour
 * alimenter l'autocomplétion côté client. Plus d'aliases : la validation
 * `isAcceptedAnswer` ne lit que le nom canonique (cf. CLAUDE.md), donc
 * exposer un champ aliases serait trompeur.
 *
 * Le catalogue est identique pour tous, indépendant de la room. Le `code`
 * en path n'est utilisé que pour la cohérence d'URL.
 */
export async function GET() {
  try {
    const games = await prisma.videoGame.findMany({
      select: { id: true, name: true },
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
