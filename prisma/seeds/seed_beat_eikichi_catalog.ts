/**
 * Seeder du catalogue Beat Eikichi (500 jeux vidéo populaires depuis l'API RAWG).
 *
 * Pré-requis : variable d'environnement RAWG_API_KEY
 *   Obtenir une clé gratuite sur https://rawg.io/apidocs
 *
 * Usage :
 *   npm run seed:beat-eikichi
 *
 * Le script est idempotent : on peut le relancer pour rafraîchir le catalogue.
 * Temps d'exécution : ~2-3 minutes (~1000 requêtes + délai 100ms entre chaque).
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TARGET_GAMES = 1000;
const PAGE_SIZE = 40;
const IMAGES_PER_GAME = 5;
const REQUEST_DELAY_MS = 100;

interface RawgGameListItem {
  id: number;
  name: string;
  slug: string;
  background_image: string | null;
  added: number;
}

interface RawgScreenshot {
  id: number;
  image: string;
}

interface RawgGameDetails {
  id: number;
  name: string;
  alternative_names?: string[];
  background_image?: string | null;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function rawgFetch<T>(url: string, apiKey: string): Promise<T> {
  const sep = url.includes('?') ? '&' : '?';
  const fullUrl = `${url}${sep}key=${apiKey}`;
  const res = await fetch(fullUrl);
  if (!res.ok) {
    throw new Error(`RAWG ${res.status} ${res.statusText} sur ${url}`);
  }
  return (await res.json()) as T;
}

/**
 * Génère des variantes d'alias courants (sans "the", sans ":", sans sous-titre).
 */
function deriveAliasVariants(name: string): string[] {
  const variants = new Set<string>();

  // Version sans "the" initial
  const withoutThe = name.replace(/^the\s+/i, '').trim();
  if (withoutThe !== name) variants.add(withoutThe);

  // Version avant le ":" (jeu principal sans sous-titre)
  const colonIndex = name.indexOf(':');
  if (colonIndex > 0) {
    variants.add(name.slice(0, colonIndex).trim());
  }

  // Version après le ":" (sous-titre seul parfois connu)
  if (colonIndex > 0 && colonIndex < name.length - 1) {
    variants.add(name.slice(colonIndex + 1).trim());
  }

  return Array.from(variants).filter(Boolean);
}

async function main() {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    console.error(
      '❌ RAWG_API_KEY manquant. Obtiens une clé gratuite sur https://rawg.io/apidocs et ajoute-la dans .env',
    );
    process.exit(1);
  }

  console.log('🎮 Seed Beat Eikichi : récupération des jeux RAWG...');

  const gamesList: RawgGameListItem[] = [];
  const totalPages = Math.ceil(TARGET_GAMES / PAGE_SIZE);

  for (let page = 1; page <= totalPages; page++) {
    console.log(`  📄 Page ${page}/${totalPages}...`);
    const data = await rawgFetch<{ results: RawgGameListItem[] }>(
      `https://api.rawg.io/api/games?ordering=-added&page_size=${PAGE_SIZE}&page=${page}`,
      apiKey,
    );
    gamesList.push(...data.results);
    await sleep(REQUEST_DELAY_MS);
  }

  const games = gamesList.slice(0, TARGET_GAMES);
  console.log(`✅ ${games.length} jeux récupérés, récupération des images et alias...`);

  // On skip les jeux déjà en DB avec au moins une image pour éviter les appels RAWG redondants.
  const existing = await prisma.videoGame.findMany({
    where: { rawgId: { in: games.map((g) => g.id) } },
    select: { rawgId: true, images: true },
  });
  const existingSet = new Set(
    existing.filter((g) => g.images.length > 0).map((g) => g.rawgId),
  );
  if (existingSet.size > 0) {
    console.log(`  ⏭️  ${existingSet.size} jeux déjà en DB, skip.`);
  }

  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;

  for (const game of games) {
    processed++;
    if (existingSet.has(game.id)) {
      skipped++;
      continue;
    }
    try {
      // Screenshots
      const shots = await rawgFetch<{ results: RawgScreenshot[] }>(
        `https://api.rawg.io/api/games/${game.id}/screenshots`,
        apiKey,
      );
      await sleep(REQUEST_DELAY_MS);

      let images = shots.results.map((s) => s.image).slice(0, IMAGES_PER_GAME);

      // Fallback sur background_image si moins d'images que souhaité
      if (images.length < IMAGES_PER_GAME && game.background_image) {
        images = [
          ...images,
          ...Array(IMAGES_PER_GAME - images.length).fill(game.background_image),
        ];
      }

      if (images.length === 0) {
        console.warn(`  ⚠️  Aucune image pour ${game.name}, skip.`);
        failed++;
        continue;
      }

      // Détails (alternative_names)
      const details = await rawgFetch<RawgGameDetails>(
        `https://api.rawg.io/api/games/${game.id}`,
        apiKey,
      );
      await sleep(REQUEST_DELAY_MS);

      const aliases = new Set<string>();
      (details.alternative_names ?? []).forEach((a) => aliases.add(a));
      deriveAliasVariants(game.name).forEach((a) => aliases.add(a));

      await prisma.videoGame.upsert({
        where: { rawgId: game.id },
        create: {
          rawgId: game.id,
          name: game.name,
          aliases: Array.from(aliases),
          images,
        },
        update: {
          name: game.name,
          aliases: Array.from(aliases),
          images,
        },
      });

      succeeded++;
      if (processed % 20 === 0) {
        console.log(`  🎯 ${processed}/${games.length} (${succeeded} ok, ${failed} échecs, ${skipped} skip)`);
      }
    } catch (err) {
      failed++;
      console.error(`  ❌ Échec pour ${game.name}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log(`\n🏁 Terminé : ${succeeded} nouveaux jeux enregistrés, ${skipped} skip (déjà en DB), ${failed} échecs.`);
}

main()
  .catch((err) => {
    console.error('Erreur fatale :', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
