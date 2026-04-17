/**
 * Seeder des indices Beat Eikichi (genre / plateforme / terme distinctif).
 *
 * Pour chaque VideoGame, récupère depuis RAWG :
 *   - genres → hintGenre (ex: "FPS", "RPG")
 *   - parent_platforms → hintPlatforms (ex: "PC, PlayStation, Xbox")
 *   - tags → hintTerm (terme distinctif en filtrant les tags génériques)
 *
 * Usage :
 *   npm run seed:beat-eikichi-hints
 *
 * Idempotent : ne refetch que les jeux qui n'ont pas encore leurs 3 hints.
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const REQUEST_DELAY_MS = 120;

// Tags RAWG trop génériques/plateforme — à ne pas utiliser comme "terme distinctif".
const BORING_TAGS = new Set(
  [
    'singleplayer',
    'multiplayer',
    'steam achievements',
    'steam cloud',
    'steam trading cards',
    'steam workshop',
    'steam leaderboards',
    'full controller support',
    'partial controller support',
    'controller support',
    'controller',
    'atmospheric',
    'great soundtrack',
    'masterpiece',
    'classic',
    'online co-op',
    'local co-op',
    'co-op',
    'pvp',
    'pve',
    'online multi-player',
    'local multiplayer',
    'cross-platform multiplayer',
    'captions available',
    'commentary available',
    'stats',
    'includes level editor',
    'downloadable content',
    'dlc',
    'steam',
    'steam trading card',
    'vr',
    'walking simulator',
    'exploration',
    'open world',
    'story rich',
    'indie',
    'action',
    'adventure',
    'casual',
    'rpg',
    'strategy',
    'simulation',
    'arcade',
    'shooter',
    'fighting',
    'sports',
    'platformer',
    '3d',
    '2d',
    'pixel graphics',
    'retro',
    'dark',
    'violent',
    'gore',
    'nudity',
    'sexual content',
    'mature',
    'male protagonist',
    'female protagonist',
    'first-person',
    'third person',
    'third-person',
    'first person',
    'difficult',
    'fast-paced',
    'replay value',
    'short',
    'long',
    'beautiful',
    'stylized',
    'realistic',
    'cinematic',
    'funny',
    'comedy',
    'family friendly',
    'kickstarter',
    'early access',
    'crowdfunded',
    'anime',
    'memes',
    'cute',
    'relaxing',
    'tactical',
    'strategic',
    'arena shooter',
    'bullet hell',
    'rogue-like',
    'rogue-lite',
    'roguelike',
    'soundtrack',
    'voice acting',
    'physics',
    'score attack',
    'achievements',
    '2.5d',
    'remake',
    'remaster',
  ].map((s) => s.toLowerCase()),
);

// Mapping des genres RAWG vers des sigles courts plus lisibles.
const GENRE_MAP: Record<string, string> = {
  action: 'Action',
  adventure: 'Adventure',
  'role-playing-games-rpg': 'RPG',
  rpg: 'RPG',
  strategy: 'Stratégie',
  shooter: 'FPS',
  puzzle: 'Puzzle',
  racing: 'Course',
  sports: 'Sport',
  simulation: 'Simulation',
  arcade: 'Arcade',
  platformer: 'Plateforme',
  fighting: 'Combat',
  indie: 'Indé',
  casual: 'Casual',
  family: 'Famille',
  massively_multiplayer: 'MMO',
  educational: 'Éducatif',
  card: 'Cartes',
  board_games: 'Plateau',
};

// Mapping des plateformes RAWG (parent_platforms) vers noms lisibles.
const PLATFORM_MAP: Record<string, string> = {
  pc: 'PC',
  playstation: 'PlayStation',
  xbox: 'Xbox',
  nintendo: 'Nintendo',
  mac: 'Mac',
  linux: 'Linux',
  ios: 'iOS',
  android: 'Android',
  web: 'Web',
};

interface RawgGameDetails {
  id: number;
  name: string;
  genres?: Array<{ name: string; slug: string }>;
  parent_platforms?: Array<{ platform: { name: string; slug: string } }>;
  tags?: Array<{ name: string; slug: string; language?: string }>;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function pickGenre(details: RawgGameDetails): string | null {
  const genres = details.genres ?? [];
  if (genres.length === 0) return null;
  // Préfère les slugs mappés ; sinon le nom RAWG tel quel.
  for (const g of genres) {
    const mapped = GENRE_MAP[g.slug];
    if (mapped) return mapped;
  }
  return genres[0].name;
}

function pickPlatforms(details: RawgGameDetails): string | null {
  const parents = details.parent_platforms ?? [];
  if (parents.length === 0) return null;
  const names = parents
    .map((p) => PLATFORM_MAP[p.platform.slug] ?? p.platform.name)
    .slice(0, 4);
  return names.length > 0 ? names.join(', ') : null;
}

function pickTerm(details: RawgGameDetails): string | null {
  const tags = details.tags ?? [];
  // Prendre les tags anglais uniquement, filtrer les génériques.
  const candidates = tags
    .filter((t) => !t.language || t.language === 'eng')
    .filter((t) => {
      const n = t.name.toLowerCase();
      return !BORING_TAGS.has(n) && !BORING_TAGS.has(t.slug);
    })
    .map((t) => t.name);

  if (candidates.length === 0) return null;
  // Le premier candidat restant, raccourci à 40 chars max.
  const pick = candidates[0];
  return pick.length > 40 ? pick.slice(0, 40).trim() : pick;
}

async function main() {
  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    console.error(
      '❌ RAWG_API_KEY manquant dans .env (https://rawg.io/apidocs).',
    );
    process.exit(1);
  }

  const games = await prisma.videoGame.findMany({
    select: {
      id: true,
      rawgId: true,
      name: true,
      hintGenre: true,
      hintTerm: true,
      hintPlatforms: true,
    },
  });

  console.log(`💡 ${games.length} jeux dans le catalogue.`);

  let processed = 0;
  let succeeded = 0;
  let skipped = 0;
  let failed = 0;

  for (const game of games) {
    processed++;
    if (game.hintGenre && game.hintTerm && game.hintPlatforms) {
      skipped++;
      continue;
    }
    try {
      const res = await fetch(
        `https://api.rawg.io/api/games/${game.rawgId}?key=${apiKey}`,
      );
      if (!res.ok) throw new Error(`RAWG ${res.status}`);
      const details = (await res.json()) as RawgGameDetails;

      const hintGenre = pickGenre(details);
      const hintPlatforms = pickPlatforms(details);
      const hintTerm = pickTerm(details);

      await prisma.videoGame.update({
        where: { id: game.id },
        data: {
          hintGenre: hintGenre ?? null,
          hintPlatforms: hintPlatforms ?? null,
          hintTerm: hintTerm ?? null,
        },
      });
      succeeded++;

      await sleep(REQUEST_DELAY_MS);
      if (processed % 25 === 0) {
        console.log(
          `  🎯 ${processed}/${games.length} (${succeeded} ok, ${skipped} skip, ${failed} échecs)`,
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
    `\n🏁 Terminé : ${succeeded} jeux avec indices, ${skipped} déjà OK, ${failed} échecs.`,
  );
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
