/**
 * Seed Beat Eikichi depuis IGDB.
 *
 * Pipeline complet :
 *   1. Auth Twitch OAuth2 (client_credentials) → access_token
 *   2. Fetch ~1500 jeux depuis IGDB (3 pages × 500), triés par popularité
 *      (total_rating_count desc), filtrés serveur-side : main games only,
 *      avec screenshots, sans GOTY/edition variantes
 *   3. Filtre regex client-side (sécurité) : ré-écarte les noms qui
 *      contiennent un mot d'édition que IGDB n'aurait pas chopé
 *   4. Garde les 500 premiers après filtre
 *   5. Fetch les screenshots de ces 500 jeux par batches de 500 IDs
 *   6. Pour chaque jeu, retient 3-4 screenshots aléatoires (warning si <3)
 *   7. Upsert idempotent en DB (VideoGame + ScreenshotImage)
 *
 * Lancement : npx tsx prisma/seeds/seed_beat_eikichi_igdb.ts
 *
 * Env requis :
 *   - IGDB_CLIENT_ID
 *   - IGDB_CLIENT_SECRET
 *   - DATABASE_URL
 *
 * Idempotence : on `upsert` par igdbId. Les screenshots sont supprimés et
 * recréés à chaque run pour le même jeu (sinon le filtre random produirait
 * des doublons sur des reruns).
 *
 * Rate limit : IGDB tolère 4 req/s. On sleep 300 ms entre chaque appel.
 */
import 'dotenv/config';
import { prisma } from '../../lib/prisma';

const TWITCH_TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const IGDB_GAMES_URL = 'https://api.igdb.com/v4/games';
const IGDB_SCREENSHOTS_URL = 'https://api.igdb.com/v4/screenshots';

const RATE_LIMIT_SLEEP_MS = 300;
const TARGET_GAME_COUNT = 500;
const PAGES = 3; // 3 × 500 = 1500 jeux fetchés avant filtre regex
const PAGE_SIZE = 500;

const EDITION_REGEX =
  /\b(GOTY|Game of the Year|Special Edition|Definitive Edition|Director'?s Cut|Anniversary Edition|Complete Edition|Ultimate Edition|Deluxe Edition|Enhanced Edition|Remastered|HD Collection|Trilogy|Collection|Bundle|Pack)\b/i;

interface IgdbGame {
  id: number;
  name: string;
  slug: string;
  total_rating_count: number;
  screenshots?: number[];
  cover?: { image_id: string };
  first_release_date?: number; // Unix timestamp en SECONDES
  genres?: Array<{ name: string }>;
}

interface IgdbScreenshot {
  id: number;
  image_id: string;
  game: number;
  width?: number;
  height?: number;
}

// ────────────────────────────────────────────────────────────────────────
// Logging
// ────────────────────────────────────────────────────────────────────────
const c = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
};
const log = (s: string) => console.log(s);

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// ────────────────────────────────────────────────────────────────────────
// Auth Twitch
// ────────────────────────────────────────────────────────────────────────

async function authenticate(): Promise<{ token: string; clientId: string }> {
  const clientId = process.env.IGDB_CLIENT_ID;
  const clientSecret = process.env.IGDB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error(
      'IGDB_CLIENT_ID et IGDB_CLIENT_SECRET requis dans .env (cf. https://dev.twitch.tv/console/apps)',
    );
  }

  const url = new URL(TWITCH_TOKEN_URL);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('client_secret', clientSecret);
  url.searchParams.set('grant_type', 'client_credentials');

  const res = await fetch(url.toString(), { method: 'POST' });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Twitch auth ${res.status}: ${body}`);
  }
  const data = (await res.json()) as { access_token: string; expires_in: number };
  log(`${c.green('✓')} Authentification Twitch... OK ${c.dim(`(token expire dans ${Math.round(data.expires_in / 3600)}h)`)}`);
  return { token: data.access_token, clientId };
}

// ────────────────────────────────────────────────────────────────────────
// Fetch IGDB
// ────────────────────────────────────────────────────────────────────────

async function igdbPost<T>(
  url: string,
  query: string,
  auth: { token: string; clientId: string },
): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Client-ID': auth.clientId,
      Authorization: `Bearer ${auth.token}`,
      Accept: 'application/json',
      // Pas de Content-Type : IGDB attend du text/plain (apicalypse).
    },
    body: query,
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`IGDB ${url} → ${res.status}: ${body}`);
  }
  return (await res.json()) as T;
}

async function fetchGamesPage(
  offset: number,
  auth: { token: string; clientId: string },
): Promise<IgdbGame[]> {
  // Apicalypse query — fields séparés par virgules, where avec & comme AND.
  //
  // NOTE: IGDB a renommé `category` → `game_type` (2024). Les jeux principaux
  // ont `game_type = 0`. `version_parent` et `parent_game` ne sont pas
  // peuplés sur les main games (champs nullables non-renvoyés par défaut),
  // donc `!= null` les EXCLURAIT à tort — on les retire et on s'appuie sur
  // `game_type = 0` qui filtre déjà les DLC/expansions/remasters/bundles.
  const query = `
    fields name, slug, total_rating_count, screenshots, cover.image_id, first_release_date, genres.name;
    where total_rating_count >= 20
          & screenshots != null
          & game_type = 0;
    sort total_rating_count desc;
    limit ${PAGE_SIZE};
    offset ${offset};
  `.trim();

  const games = await igdbPost<IgdbGame[]>(IGDB_GAMES_URL, query, auth);
  return games;
}

/**
 * Fetch tous les screenshots pour un set de game IDs. IGDB limite chaque
 * requête à 500 screenshots **au total** (pas par jeu), donc pour récupérer
 * tous les screenshots de 500 jeux on doit paginer avec `offset`.
 */
async function fetchScreenshots(
  gameIds: number[],
  auth: { token: string; clientId: string },
): Promise<IgdbScreenshot[]> {
  if (gameIds.length === 0) return [];
  const idsList = gameIds.join(',');
  const PAGE = 500;
  const all: IgdbScreenshot[] = [];
  let offset = 0;
  // Boucle jusqu'à ce qu'IGDB renvoie une page non-pleine (= dernière page).
  while (true) {
    const query = `
      fields image_id, game, width, height;
      where game = (${idsList});
      limit ${PAGE};
      offset ${offset};
    `.trim();
    const page = await igdbPost<IgdbScreenshot[]>(IGDB_SCREENSHOTS_URL, query, auth);
    all.push(...page);
    if (page.length < PAGE) break; // dernière page
    offset += PAGE;
    await sleep(RATE_LIMIT_SLEEP_MS);
  }
  return all;
}

// ────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────

/** Fisher-Yates shuffle, retourne `count` éléments. */
function sample<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

// ────────────────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const auth = await authenticate();
  await sleep(RATE_LIMIT_SLEEP_MS);

  // ── ÉTAPE 1 : fetch games (3 pages × 500) ────────────────────────
  const allGames: IgdbGame[] = [];
  for (let page = 0; page < PAGES; page++) {
    const offset = page * PAGE_SIZE;
    const games = await fetchGamesPage(offset, auth);
    log(
      `${c.green('✓')} Récupération page ${page + 1}/${PAGES} (offset ${offset})... ${c.cyan(`${games.length} jeux`)}`,
    );
    allGames.push(...games);
    if (games.length < PAGE_SIZE) {
      log(c.dim(`  └─ moins de ${PAGE_SIZE} résultats : on arrête la pagination`));
      break;
    }
    await sleep(RATE_LIMIT_SLEEP_MS);
  }

  // Dédup au cas où IGDB renvoie le même jeu sur 2 pages (peut arriver si
  // total_rating_count change entre 2 requêtes).
  const dedupMap = new Map<number, IgdbGame>();
  for (const g of allGames) {
    if (!dedupMap.has(g.id)) dedupMap.set(g.id, g);
  }
  const dedupGames = [...dedupMap.values()];
  if (dedupGames.length < allGames.length) {
    log(
      c.dim(
        `  └─ dédup : ${allGames.length} → ${dedupGames.length} (suppression des doublons inter-pages)`,
      ),
    );
  }

  // ── ÉTAPE 2 : filtre regex (sécurité) ────────────────────────────
  const before = dedupGames.length;
  const filtered = dedupGames.filter((g) => !EDITION_REGEX.test(g.name));
  log(
    `${c.green('✓')} Filtrage regex : ${c.cyan(`${before} → ${filtered.length} jeux`)} ${c.dim(`(${before - filtered.length} retirés pour mots d'édition)`)}`,
  );

  // Trim aux 500 premiers (déjà triés par popularité IGDB).
  const finalists = filtered.slice(0, TARGET_GAME_COUNT);
  log(
    `${c.green('✓')} Sélection finale : ${c.cyan(`${finalists.length} jeux`)} ${c.dim('(top par popularité)')}`,
  );

  // ── ÉTAPE 3 : fetch screenshots par batches de 50 IDs ────────────
  // Batch size = 50 : avec ~5-10 screenshots/jeu en moyenne, on tient dans
  // la limite IGDB de 500 screenshots/requête (et la pagination interne de
  // `fetchScreenshots` couvre les overflow). Évite aussi un body trop long.
  const screenshotsByGame = new Map<number, IgdbScreenshot[]>();
  const BATCH_SIZE = 50;
  const finalistIds = finalists.map((g) => g.id);
  const batchCount = Math.ceil(finalistIds.length / BATCH_SIZE);

  for (let i = 0; i < batchCount; i++) {
    const batchIds = finalistIds.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
    const screenshots = await fetchScreenshots(batchIds, auth);
    log(
      `${c.green('✓')} Récupération screenshots batch ${i + 1}/${batchCount}... ${c.cyan(`${screenshots.length} screenshots`)}`,
    );
    for (const s of screenshots) {
      const list = screenshotsByGame.get(s.game) ?? [];
      list.push(s);
      screenshotsByGame.set(s.game, list);
    }
    await sleep(RATE_LIMIT_SLEEP_MS);
  }

  // ── ÉTAPE 4 : retain 3-4 screenshots aléatoires par jeu ──────────
  const games2screenshots = new Map<number, IgdbScreenshot[]>();
  let warningCount = 0;
  for (const game of finalists) {
    const all = screenshotsByGame.get(game.id) ?? [];
    if (all.length === 0) {
      log(c.yellow(`  ⚠ ${game.name}: 0 screenshot — jeu skip`));
      continue;
    }
    if (all.length < 3) {
      warningCount++;
      log(c.yellow(`  ⚠ ${game.name}: seulement ${all.length} screenshot(s) (<3)`));
    }
    // Random 3 ou 4 (4 si on a au moins 4 dispo)
    const desiredCount = all.length >= 4 ? (Math.random() < 0.5 ? 3 : 4) : Math.min(3, all.length);
    const picked = sample(all, desiredCount);
    games2screenshots.set(game.id, picked);
  }

  // ── ÉTAPE 5 : insert DB ──────────────────────────────────────────
  let gameInsertedCount = 0;
  let screenshotInsertedCount = 0;
  for (const game of finalists) {
    const screenshots = games2screenshots.get(game.id);
    if (!screenshots) continue; // jeu sans screenshots : skip

    const releaseDate = game.first_release_date
      ? new Date(game.first_release_date * 1000)
      : null;
    const coverImageId = game.cover?.image_id ?? null;

    // Upsert game (idempotent par igdbId).
    const created = await prisma.videoGame.upsert({
      where: { igdbId: game.id },
      update: {
        name: game.name,
        slug: game.slug,
        releaseDate,
        coverImageId,
      },
      create: {
        igdbId: game.id,
        name: game.name,
        slug: game.slug,
        releaseDate,
        coverImageId,
      },
    });
    gameInsertedCount++;

    // Reset les screenshots existants (sinon le random produit des doublons
    // entre runs successifs) puis insère le nouveau lot.
    await prisma.screenshotImage.deleteMany({ where: { videoGameId: created.id } });
    if (screenshots.length > 0) {
      const insertResult = await prisma.screenshotImage.createMany({
        data: screenshots.map((s) => ({
          videoGameId: created.id,
          imageId: s.image_id,
          width: s.width ?? null,
          height: s.height ?? null,
        })),
        skipDuplicates: true,
      });
      screenshotInsertedCount += insertResult.count;
    }
  }

  log('');
  log(c.green('═══════════════════════════════════════════════════════════'));
  log(c.green(`✓ Insertion DB : ${gameInsertedCount} jeux, ${screenshotInsertedCount} screenshots`));
  log(c.green('═══════════════════════════════════════════════════════════'));
  if (warningCount > 0) {
    log(c.yellow(`⚠ ${warningCount} jeu(x) avec moins de 3 screenshots`));
  }

  // Stats finales : combien sont prêts à être tirés (≥1 screenshot) ?
  const readyCount = await prisma.videoGame.count({
    where: { screenshots: { some: {} } },
  });
  log(c.cyan(`Jeux exploitables (≥1 screenshot): ${readyCount} / ${gameInsertedCount}`));
}

main()
  .catch((e) => {
    console.error(c.red('Erreur seed IGDB:'), e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
