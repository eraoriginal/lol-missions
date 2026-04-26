/**
 * GET /api/games/quiz-ceo/[code]/asset/[index]
 *
 * Proxy opaque pour servir les SVG dont le nom de fichier révèle la réponse
 * (logos de marques sous `public/brand-logos/<slug>.svg`, silhouettes de pays
 * sous `public/country-shapes/<iso2>.svg`).
 *
 * Sans ce proxy, le client recevrait dans la payload de la question quelque
 * chose comme `/brand-logos/apple.svg` — un joueur ouvre les devtools et
 * voit la réponse. Avec ce proxy, l'URL devient `/asset/<index>` qui ne
 * contient aucun indice. Le serveur lit le vrai chemin depuis la DB
 * (`QuizCeoGame.questions[index].payload.imageUrl`) et stream le fichier.
 *
 * Sécurité :
 *   - Whitelist stricte de répertoires (`/brand-logos/`, `/country-shapes/`)
 *     pour éviter tout path traversal (`../etc/passwd`).
 *   - Le path normalisé doit rester sous `public/` après résolution.
 *   - Pas de cache HTTP : sinon un navigateur pourrait corréler URL → contenu
 *     entre parties (toutefois, la même partie peut cacher en mémoire).
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/lib/prisma';

const ALLOWED_PREFIXES = ['/brand-logos/', '/country-shapes/'];

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string; index: string }> },
) {
  try {
    const { code, index } = await params;
    const idx = Number.parseInt(index, 10);
    if (!Number.isFinite(idx) || idx < 0) {
      return new Response('Bad index', { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { code },
      include: { quizCeoGame: true },
    });
    if (!room || !room.quizCeoGame) {
      return new Response('Not found', { status: 404 });
    }

    const questions = room.quizCeoGame.questions as unknown as Array<{
      payload?: { imageUrl?: string };
    }>;
    const q = questions[idx];
    if (!q) {
      return new Response('Not found', { status: 404 });
    }
    const realPath = q.payload?.imageUrl;
    if (typeof realPath !== 'string') {
      return new Response('Not found', { status: 404 });
    }
    // Whitelist stricte de répertoires (anti-path-traversal).
    if (!ALLOWED_PREFIXES.some((p) => realPath.startsWith(p))) {
      return new Response('Forbidden', { status: 403 });
    }

    // Résout le path et vérifie qu'il reste bien sous `public/`.
    const publicDir = path.join(process.cwd(), 'public');
    const resolved = path.resolve(publicDir, '.' + realPath);
    if (!resolved.startsWith(publicDir + path.sep)) {
      return new Response('Forbidden', { status: 403 });
    }

    let content: Buffer;
    try {
      content = await readFile(resolved);
    } catch {
      return new Response('Not found', { status: 404 });
    }

    return new Response(new Uint8Array(content), {
      headers: {
        'Content-Type': 'image/svg+xml; charset=utf-8',
        // Cache court privé : 2 minutes suffisent à couvrir une question
        // (timer max ~30s) sans que le navigateur re-fetch à chaque render
        // React (le timer interne tickait toutes les 200ms et provoquait un
        // refetch infini avec no-store, ce qui faisait clignoter le DOM).
        // L'URL `/asset/<index>` est unique par (room, index) donc pas de
        // leak cross-partie : une nouvelle game crée une nouvelle room ou
        // un nouveau snapshot, jamais la même URL ne sert deux assets.
        'Cache-Control': 'private, max-age=120',
        // Anti-spoil supplémentaire : ne révèle pas le filename d'origine.
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[QUIZ-CEO asset proxy] error', err);
    return new Response('Server error', { status: 500 });
  }
}
