/**
 * GET /api/games/quiz-ceo/[code]/asset/[index]?slot=<q|w|e|r|p>
 *
 * Proxy opaque pour servir les assets dont le nom de fichier révèle la
 * réponse. Sans ce proxy, le client recevrait dans la payload de la
 * question quelque chose comme `/brand-logos/apple.svg` — un joueur ouvre
 * les devtools et voit la réponse. Avec ce proxy, l'URL devient
 * `/asset/<index>` qui ne contient aucun indice.
 *
 * Catégories couvertes (assets locaux sous `public/`) :
 *   - `brand-logo`   → `/brand-logos/<slug>.svg`
 *   - `worldle`      → `/country-shapes/<iso2>.svg`
 *   - `lol-champion` mode splash → `/lol-champions/<id>.jpg`
 *   - `lol-champion` mode spells → `/lol-champion-spells/<id>/<slot>.png`
 *
 * Catégories couvertes (URLs externes Wikimedia/Wikipedia) :
 *   - `bouffe-internationale`     → photo du plat (commons.wikimedia.org)
 *   - `panneau-signalisation`     → SVG du panneau (commons.wikimedia.org)
 *   - `affiche-films-sans-titre`  → poster du film (en.wikipedia.org)
 *
 * Sécurité :
 *   - Whitelist stricte de répertoires sources locaux (anti-path-traversal).
 *   - Whitelist stricte de hosts pour les URLs externes.
 *   - Pour le local : le path normalisé doit rester sous `public/`.
 *   - Pas de cache HTTP long : 2 minutes (couvre la durée d'une question
 *     sans déclencher de re-fetch infini sur les re-renders React).
 *   - Aucun header ne révèle le filename / l'URL d'origine.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/lib/prisma';

const ALLOWED_LOCAL_PREFIXES = [
  '/brand-logos/',
  '/country-shapes/',
  '/lol-champions/',
  '/lol-champion-spells/',
];

const ALLOWED_EXTERNAL_HOSTS = new Set([
  'commons.wikimedia.org',
  'upload.wikimedia.org',
  'en.wikipedia.org',
  'fr.wikipedia.org',
]);

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
    //   - sans slot → on lit `payload.imageUrl` (cas splash / brand / worldle / food / signs / movies)
    const realPath = slot
      ? q.payload?.iconUrls?.[slot]
      : q.payload?.imageUrl;
    if (typeof realPath !== 'string') {
      return new Response('Not found', { status: 404 });
    }

    // Cas externes (Wikimedia/Wikipedia) — on fetch l'upstream et on
    // re-stream sans laisser le client voir l'URL d'origine.
    if (/^https?:\/\//i.test(realPath)) {
      let upstream: URL;
      try {
        upstream = new URL(realPath);
      } catch {
        return new Response('Bad URL', { status: 400 });
      }
      if (!ALLOWED_EXTERNAL_HOSTS.has(upstream.host)) {
        return new Response('Forbidden', { status: 403 });
      }
      try {
        const res = await fetch(realPath, {
          // Wikipedia/Wikimedia veut un User-Agent identifiable.
          headers: { 'User-Agent': 'lol-missions-quiz/1.0 (contact@lol-missions.local)' },
          // Suit les redirects (Special:FilePath redirect vers upload.wikimedia.org).
          redirect: 'follow',
        });
        if (!res.ok) {
          return new Response('Upstream error', { status: 502 });
        }
        const ct =
          res.headers.get('content-type') ?? contentTypeForPath(upstream.pathname);
        const buf = await res.arrayBuffer();
        return new Response(buf, {
          headers: {
            'Content-Type': ct,
            'Cache-Control': 'private, max-age=600',
            'X-Content-Type-Options': 'nosniff',
          },
        });
      } catch {
        return new Response('Upstream fetch failed', { status: 502 });
      }
    }

    // Cas locaux sous `public/` — whitelist de préfixes anti-path-traversal.
    if (!ALLOWED_LOCAL_PREFIXES.some((p) => realPath.startsWith(p))) {
      return new Response('Forbidden', { status: 403 });
    }

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
