/**
 * GET /api/games/quiz-ceo/[code]/asset/[index]?slot=<q|w|e|r|p>
 *
 * Proxy opaque pour servir les assets dont le nom de fichier révèle la
 * réponse. Sans ce proxy, le client recevrait dans la payload de la
 * question quelque chose comme `/brand-logos/apple.svg` — un joueur ouvre
 * les devtools et voit la réponse. Avec ce proxy, l'URL devient
 * `/asset/<index>` qui ne contient aucun indice.
 *
 * Catégories couvertes :
 *   - `brand-logo`   → `/brand-logos/<slug>.svg`
 *   - `worldle`      → `/country-shapes/<iso2>.svg`
 *   - `lol-champion` mode splash → `/lol-champions/<id>.jpg` (`payload.imageUrl`)
 *   - `lol-champion` mode spells → `/lol-champion-spells/<id>/<slot>.png`
 *     (`payload.iconUrls[slot]`, requiert `?slot=q|w|e|r|p`)
 *
 * Sécurité :
 *   - Whitelist stricte de répertoires sources (anti-path-traversal).
 *   - Le path normalisé doit rester sous `public/` après résolution.
 *   - Pas de cache HTTP long : 2 minutes (couvre la durée d'une question
 *     sans déclencher de re-fetch infini sur les re-renders React).
 *   - Aucun header ne révèle le filename d'origine.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/lib/prisma';

const ALLOWED_PREFIXES = [
  '/brand-logos/',
  '/country-shapes/',
  '/lol-champions/',
  '/lol-champion-spells/',
];

const ALLOWED_SLOTS = new Set(['q', 'w', 'e', 'r', 'p']);

function contentTypeForPath(p: string): string {
  if (p.endsWith('.svg')) return 'image/svg+xml; charset=utf-8';
  if (p.endsWith('.png')) return 'image/png';
  if (p.endsWith('.jpg') || p.endsWith('.jpeg')) return 'image/jpeg';
  if (p.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string; index: string }> },
) {
  try {
    const { code, index } = await params;
    const idx = Number.parseInt(index, 10);
    if (!Number.isFinite(idx) || idx < 0) {
      return new Response('Bad index', { status: 400 });
    }

    const url = new URL(request.url);
    const slot = url.searchParams.get('slot');
    if (slot !== null && !ALLOWED_SLOTS.has(slot)) {
      return new Response('Bad slot', { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { code },
      include: { quizCeoGame: true },
    });
    if (!room || !room.quizCeoGame) {
      return new Response('Not found', { status: 404 });
    }

    const questions = room.quizCeoGame.questions as unknown as Array<{
      payload?: {
        imageUrl?: string;
        iconUrls?: Record<string, string>;
      };
    }>;
    const q = questions[idx];
    if (!q) {
      return new Response('Not found', { status: 404 });
    }

    // Résolution du chemin réel selon présence du slot :
    //   - avec slot → on lit `payload.iconUrls[slot]` (cas lol-champion spells)
    //   - sans slot → on lit `payload.imageUrl` (cas splash / brand / worldle)
    const realPath = slot
      ? q.payload?.iconUrls?.[slot]
      : q.payload?.imageUrl;
    if (typeof realPath !== 'string') {
      return new Response('Not found', { status: 404 });
    }

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
        'Content-Type': contentTypeForPath(realPath),
        'Cache-Control': 'private, max-age=120',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err) {
    console.error('[QUIZ-CEO asset proxy] error', err);
    return new Response('Server error', { status: 500 });
  }
}
