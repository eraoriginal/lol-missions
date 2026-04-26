/**
 * Télécharge l'historique de matches LoL pour la catégorie Quiz CEO
 * `lol-player-match`.
 *
 * Pour chaque joueur de `LOL_PLAYERS` :
 *   1. Riot ID → PUUID via Account v1
 *   2. PUUID → 50 derniers match IDs (filtre type=ranked) via Match v5
 *   3. Pour chaque match : full data → on extrait juste les infos pour la
 *      MatchCard (champion, KDA, items, spells, runes, CS, KP, durée, win)
 *
 * Output : `lib/quizCeo/lolPlayerMatches.ts` (généré, ne pas éditer).
 *
 * Rate limiting : Dev key Riot = 100 req / 2 min. On throttle à 1.4s/req
 * (~85 req/2min) pour rester safe. 12 joueurs × ~52 req = ~625 req →
 * ~15 min de DL.
 *
 * Lancer : `npx tsx scripts/download-lol-match-history.ts`
 *   - Lit `RIOT_API_KEY` depuis l'env (process.env) ou parse `.env`.
 *   - `--player Tlz1#EUW` : DL un seul joueur (utile pour tester).
 *   - `--limit 5` : DL N matches au lieu de 50 (test rapide).
 *   - `--force` : ignorer le cache, re-fetch tout.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import {
  LOL_PLAYERS,
  type LolPlayerSeed,
} from '../lib/quizCeo/lolPlayers';
import type { LolMatchCardData } from '../lib/quizCeo/lolMatchCard';

// ═══════════════════════════════════════════════════════════════════════════
//  Setup : .env, args
// ═══════════════════════════════════════════════════════════════════════════

function loadDotEnv() {
  if (process.env.RIOT_API_KEY) return;
  const envPath = join(process.cwd(), '.env');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf-8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = val;
  }
}
loadDotEnv();

const RIOT_API_KEY = process.env.RIOT_API_KEY;
if (!RIOT_API_KEY) {
  console.error('[lol-history] RIOT_API_KEY manquante (process.env ou .env).');
  process.exit(1);
}

const ARGS = process.argv.slice(2);
const argValue = (name: string): string | undefined => {
  const i = ARGS.indexOf(name);
  return i >= 0 ? ARGS[i + 1] : undefined;
};
const FORCE = ARGS.includes('--force');
const SOLO_PLAYER = argValue('--player'); // "Tlz1#EUW"
const PER_PLAYER_LIMIT = Math.max(1, parseInt(argValue('--limit') ?? '50', 10));

const CACHE_DIR = join(process.cwd(), '.cache', 'riot');
mkdirSync(CACHE_DIR, { recursive: true });
const OUT_LIB = join(process.cwd(), 'lib', 'quizCeo', 'lolPlayerMatches.ts');

// ═══════════════════════════════════════════════════════════════════════════
//  Throttled fetch (1.4 s/req → ~85 req/2min, sous la limite de 100/2min)
// ═══════════════════════════════════════════════════════════════════════════

const REQUEST_DELAY_MS = 1400;
let lastRequestAt = 0;

async function throttledFetch<T>(url: string, label: string): Promise<T> {
  const now = Date.now();
  const wait = Math.max(0, lastRequestAt + REQUEST_DELAY_MS - now);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAt = Date.now();

  const res = await fetch(url, {
    headers: { 'X-Riot-Token': RIOT_API_KEY as string },
  });
  if (res.status === 429) {
    const retryAfter = Number(res.headers.get('retry-after') ?? '10');
    console.warn(`  ⚠ rate limit, retry dans ${retryAfter}s (${label})`);
    await new Promise((r) => setTimeout(r, (retryAfter + 1) * 1000));
    return throttledFetch<T>(url, label);
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${label} → HTTP ${res.status} ${text}`);
  }
  return (await res.json()) as T;
}

function cachePath(key: string): string {
  // Sanitize les "/" et "?" pour avoir un nom de fichier valide.
  const safe = key.replace(/[^a-zA-Z0-9._-]/g, '_');
  return join(CACHE_DIR, `${safe}.json`);
}

async function cachedFetch<T>(cacheKey: string, url: string, label: string): Promise<T> {
  const path = cachePath(cacheKey);
  if (!FORCE && existsSync(path)) {
    return JSON.parse(readFileSync(path, 'utf-8')) as T;
  }
  const data = await throttledFetch<T>(url, label);
  writeFileSync(path, JSON.stringify(data));
  return data;
}

// ═══════════════════════════════════════════════════════════════════════════
//  Riot API types (sous-ensemble)
// ═══════════════════════════════════════════════════════════════════════════

interface AccountResponse {
  puuid: string;
  gameName: string;
  tagLine: string;
}

interface MatchParticipant {
  puuid: string;
  championName: string;
  championId: number;
  kills: number;
  deaths: number;
  assists: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  summoner1Id: number;
  summoner2Id: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  teamPosition: 'TOP' | 'JUNGLE' | 'MIDDLE' | 'BOTTOM' | 'UTILITY' | '';
  individualPosition: string;
  win: boolean;
  perks: {
    styles: Array<{
      description: 'primaryStyle' | 'subStyle';
      style: number;
      selections: Array<{ perk: number }>;
    }>;
  };
  challenges?: {
    killParticipation?: number;
  };
}

interface MatchResponse {
  metadata: {
    matchId: string;
  };
  info: {
    gameDuration: number;
    gameMode: string;
    gameType: string;
    queueId: number;
    participants: MatchParticipant[];
  };
}

/**
 * Queues acceptées pour le quiz « guess the player » :
 *   400 = Normal Draft 5v5
 *   420 = Ranked Solo/Duo
 *   430 = Normal Blind 5v5
 *   440 = Ranked Flex 5v5
 *   450 = ARAM
 *   490 = Quickplay
 * Excluses : URF, One For All, Tutorial, Customs.
 */
const ACCEPTED_QUEUE_IDS = new Set([400, 420, 430, 440, 450, 490]);
/** Combien d'IDs demander pour avoir ~50 matches utilisables après filtre. */
const FETCH_OVERSAMPLING = 1.4;

// ═══════════════════════════════════════════════════════════════════════════
//  Main
// ═══════════════════════════════════════════════════════════════════════════

interface PlayerMatchEntry {
  matchId: string;
  playerName: string;
  data: LolMatchCardData;
}

function extractCardData(participant: MatchParticipant, info: MatchResponse['info']): LolMatchCardData {
  const primary = participant.perks.styles.find((s) => s.description === 'primaryStyle');
  const sub = participant.perks.styles.find((s) => s.description === 'subStyle');
  const keystone = primary?.selections[0]?.perk ?? 0;
  const secondaryStyle = sub?.style ?? 0;
  const cs = participant.totalMinionsKilled + (participant.neutralMinionsKilled ?? 0);
  const championIdSlug = participant.championName.toLowerCase();
  // Mapping spécial pour les noms à apostrophe / espaces (Kai'Sa, Cho'Gath…) :
  // Data Dragon utilise des slugs sans ces caractères. Les portraits sont
  // sous championName tel quel (sans apostrophe), donc on strip.
  const cleanedSlug = championIdSlug.replace(/['\s_-]/g, '');
  return {
    championId: cleanedSlug,
    championName: participant.championName,
    position: (participant.teamPosition || 'NONE') as LolMatchCardData['position'],
    kills: participant.kills,
    deaths: participant.deaths,
    assists: participant.assists,
    items: [
      participant.item0,
      participant.item1,
      participant.item2,
      participant.item3,
      participant.item4,
      participant.item5,
      participant.item6,
    ],
    summonerSpells: [participant.summoner1Id, participant.summoner2Id],
    keystone,
    secondaryStyle,
    cs,
    killParticipation: participant.challenges?.killParticipation ?? 0,
    durationSec: info.gameDuration,
    win: participant.win,
  };
}

async function processPlayer(player: LolPlayerSeed): Promise<PlayerMatchEntry[]> {
  const [name, tag] = player.riotId.split('#');
  if (!name || !tag) {
    console.warn(`  ⚠ Riot ID invalide : ${player.riotId}`);
    return [];
  }
  const apiBase = `https://${player.region}.api.riotgames.com`;

  console.log(`\n[${player.displayName}] résolution PUUID…`);
  const account = await cachedFetch<AccountResponse>(
    `account_${name}_${tag}`,
    `${apiBase}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`,
    `account ${player.riotId}`,
  );
  console.log(`  puuid: ${account.puuid.slice(0, 16)}…`);

  // On oversample (×1.4) car on filtre les ARAM / customs côté client.
  const requestedCount = Math.min(100, Math.ceil(PER_PLAYER_LIMIT * FETCH_OVERSAMPLING));
  console.log(`  → liste des ${requestedCount} dernières parties (toutes queues)…`);
  const matchIds = await cachedFetch<string[]>(
    `matchids_${account.puuid}_${requestedCount}`,
    `${apiBase}/lol/match/v5/matches/by-puuid/${account.puuid}/ids?count=${requestedCount}`,
    `match ids ${player.displayName}`,
  );
  console.log(`  ${matchIds.length} match IDs reçus.`);

  const entries: PlayerMatchEntry[] = [];
  let processed = 0;
  let skippedQueue = 0;
  for (const matchId of matchIds) {
    if (entries.length >= PER_PLAYER_LIMIT) break;
    try {
      const match = await cachedFetch<MatchResponse>(
        `match_${matchId}`,
        `${apiBase}/lol/match/v5/matches/${matchId}`,
        `match ${matchId}`,
      );
      processed++;
      if (!ACCEPTED_QUEUE_IDS.has(match.info.queueId)) {
        skippedQueue++;
        continue;
      }
      const me = match.info.participants.find((p) => p.puuid === account.puuid);
      if (!me) {
        console.warn(`    ⚠ ${matchId}: participant PUUID introuvable, skip.`);
        continue;
      }
      const card = extractCardData(me, match.info);
      entries.push({
        matchId: match.metadata.matchId,
        playerName: player.displayName,
        data: card,
      });
      if (entries.length % 10 === 0) {
        console.log(`  ${entries.length}/${PER_PLAYER_LIMIT} matches utiles…`);
      }
    } catch (err) {
      console.warn(`    ⚠ ${matchId}: ${(err as Error).message}`);
    }
  }
  console.log(
    `  ✓ ${entries.length} matches utiles pour ${player.displayName} (${processed} fetchés, ${skippedQueue} ARAM/custom écartés).`,
  );
  return entries;
}

function generateLibFile(entries: PlayerMatchEntry[]): string {
  const formatted = entries
    .map((e) => `  ${JSON.stringify(e)},`)
    .join('\n');
  return `/**
 * Catalogue des matches LoL pour la catégorie Quiz CEO \`lol-player-match\`.
 * Généré par \`scripts/download-lol-match-history.ts\` — ne pas éditer.
 *
 * Source : Riot Match v5 API (clé Dev). Cache : .cache/riot/.
 * À ré-générer périodiquement pour rafraîchir l'historique des joueurs.
 */

import type { LolMatchCardData } from './lolMatchCard';

export interface LolPlayerMatchEntry {
  /** Match ID Riot (ex: "EUW1_1234567890"). */
  matchId: string;
  /** Nom canonique du joueur — réponse attendue. */
  playerName: string;
  /** Données pour rendre la MatchCard. */
  data: LolMatchCardData;
}

export const LOL_PLAYER_MATCHES: readonly LolPlayerMatchEntry[] = [
${formatted}
];
`;
}

async function main() {
  const targets = SOLO_PLAYER
    ? LOL_PLAYERS.filter((p) => p.riotId === SOLO_PLAYER)
    : LOL_PLAYERS;

  if (targets.length === 0) {
    console.error(`Aucun joueur ne correspond à --player ${SOLO_PLAYER}`);
    process.exit(1);
  }

  console.log(
    `[lol-history] cible : ${targets.length} joueur(s) × ${PER_PLAYER_LIMIT} matches max.`,
  );
  console.log('[lol-history] throttle : 1.4s/req (sécurité dev key 100req/2min)');

  const allEntries: PlayerMatchEntry[] = [];
  for (const player of targets) {
    try {
      const entries = await processPlayer(player);
      allEntries.push(...entries);
    } catch (err) {
      console.error(`[${player.displayName}] FAIL global : ${(err as Error).message}`);
    }
  }

  console.log(`\n[lol-history] total : ${allEntries.length} matches.`);

  // Si on a tiré un sous-ensemble (--player), on merge avec l'existant pour
  // ne pas perdre les autres joueurs déjà téléchargés.
  let finalEntries = allEntries;
  if (SOLO_PLAYER && existsSync(OUT_LIB)) {
    try {
      const existing = readFileSync(OUT_LIB, 'utf-8');
      const arrMatch = existing.match(/LOL_PLAYER_MATCHES[^=]*=\s*\[([\s\S]*?)\];/);
      if (arrMatch) {
        // Re-parse depuis les lignes : chaque entry est un objet JSON sur une ligne
        const lines = arrMatch[1]
          .split('\n')
          .map((l) => l.trim())
          .filter((l) => l.startsWith('{') && l.endsWith(','))
          .map((l) => JSON.parse(l.slice(0, -1)));
        // Dedup uniquement sur (matchId, playerName) : si Slim Natsu et
        // Tlz1 ont joué dans le MÊME match, on garde les 2 entries (chaque
        // joueur a son propre champion / KDA / items dans cette même partie).
        const newKeys = new Set(
          allEntries.map((e) => `${e.matchId}__${e.playerName}`),
        );
        const kept = (lines as PlayerMatchEntry[]).filter(
          (e) => !newKeys.has(`${e.matchId}__${e.playerName}`),
        );
        finalEntries = [...kept, ...allEntries];
        console.log(
          `[lol-history] merge : kept ${kept.length} entries existantes + ${allEntries.length} nouvelles.`,
        );
      }
    } catch (err) {
      console.warn(`[lol-history] merge skipped : ${(err as Error).message}`);
    }
  }

  writeFileSync(OUT_LIB, generateLibFile(finalEntries), 'utf-8');
  console.log(`[lol-history] ✓ wrote ${OUT_LIB} (${finalEntries.length} entries).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
