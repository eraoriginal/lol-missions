/**
 * Seeder des GIFs pour Beat Eikichi (5 GIFs depuis GIPHY par jeu).
 *
 * Pré-requis :
 *   GIPHY_API_KEY — https://developers.giphy.com (Create App, clé instantanée)
 *
 * Usage :
 *   npm run seed:beat-eikichi-gifs
 *
 * Idempotent : les jeux qui ont déjà 5 GIFs sont skip.
 * Temps d'exécution : ~10 min pour 1000 jeux (1 appel API par jeu + delay 150ms).
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const GIFS_PER_GAME = 5;
const REQUEST_DELAY_MS = 150;

interface GiphyGif {
  images: {
    downsized_medium?: { url: string };
    original?: { url: string };
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchGiphy(query: string, key: string): Promise<string[]> {
  const url = `https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(
    query + ' game',
  )}&limit=${GIFS_PER_GAME}&rating=pg-13&api_key=${key}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`GIPHY ${res.status} pour "${query}"`);
  }
  const data = (await res.json()) as { data: GiphyGif[] };
  return data.data
    .map((g) => g.images.downsized_medium?.url ?? g.images.original?.url)
    .filter((u): u is string => Boolean(u))
    .slice(0, GIFS_PER_GAME);
}

async function main() {
  const giphyKey = process.env.GIPHY_API_KEY;
  if (!giphyKey) {
    console.error(
      '❌ GIPHY_API_KEY manquant. Obtiens une clé gratuite sur https://developers.giphy.com et ajoute-la dans .env',
    );
    process.exit(1);
  }

  const games = await prisma.videoGame.findMany({
    select: { id: true, name: true, gifs: true },
  });
  console.log(`🎬 ${games.length} jeux dans le catalogue.`);

  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  for (const game of games) {
    processed++;
    if (game.gifs.length >= GIFS_PER_GAME) {
      skipped++;
      continue;
    }

    try {
      const gifs = await fetchGiphy(game.name, giphyKey);

      if (gifs.length === 0) {
        console.warn(`  🚫 Aucun GIF trouvé pour ${game.name}`);
        failed++;
      } else {
        await prisma.videoGame.update({
          where: { id: game.id },
          data: { gifs },
        });
        succeeded++;
      }

      await sleep(REQUEST_DELAY_MS);

      if (processed % 25 === 0) {
        console.log(
          `  🎯 ${processed}/${games.length} (${succeeded} ok, ${failed} vides, ${skipped} skip)`,
        );
      }
    } catch (err) {
      failed++;
      console.error(
        `  ❌ ${game.name}:`,
        err instanceof Error ? err.message : err,
      );
      await sleep(REQUEST_DELAY_MS);
    }
  }

  console.log(
    `\n🏁 Terminé : ${succeeded} jeux avec GIFs, ${failed} sans résultat, ${skipped} déjà OK.`,
  );
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
