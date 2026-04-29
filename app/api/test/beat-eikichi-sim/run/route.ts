import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateRoomCode, generatePlayerToken } from '@/lib/utils';
import { isAcceptedAnswer } from '@/lib/beatEikichi/fuzzyMatch';

/**
 * POST /api/test/beat-eikichi-sim/run
 *
 * Harnais de simulation Beat Eikichi : crée une room jetable avec 7 joueurs
 * (1 Eikichi + 6 réguliers), force des conditions de course extrêmes, et
 * vérifie qu'aucune question n'est sautée et qu'aucun état n'est corrompu.
 *
 * Chaque scénario crée sa propre room pour isolation totale (pas de cleanup
 * mid-test). Les rooms sont supprimées en `finally`. Les codes commencent
 * par "TBES" (Test Beat Eikichi Sim) pour faciliter le repérage en DB si
 * un cleanup foire.
 *
 * Format réponse :
 * { scenarios: Array<{ id, label, ok, details, error? }> }
 */

const bodySchema = z.object({
  scenario: z.string().optional(), // Si fourni, ne lance que ce scénario.
});

interface ScenarioResult {
  id: string;
  label: string;
  ok: boolean;
  details: string[];
  error?: string;
}

// ─────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────

interface SimRoom {
  roomId: string;
  code: string;
  gameId: string;
  creatorToken: string;
  players: Array<{ id: string; token: string; name: string }>;
  eikichiPlayerId: string;
}

/**
 * Crée une room avec 7 joueurs (P0-Eikichi + P1..P6) et démarre une partie
 * Beat Eikichi avec des questions factices. Tous les players ont une arme
 * (pour pouvoir tester les tirs).
 */
async function setupRoom(
  label: string,
  options: { mode?: 'standard' | 'all-vs-eikichi' } = {},
): Promise<SimRoom> {
  const mode = options.mode ?? 'standard';
  const code = `T${generateRoomCode().slice(1)}`; // 1er char "T" pour repérer
  const creatorToken = generatePlayerToken();

  const room = await prisma.room.create({
    data: {
      code,
      creatorToken,
      gameType: 'beat-eikichi',
      gameStarted: true,
      // En mode all-vs-eikichi : pas d'arme au lobby (les non-Eikichi n'en ont
      // pas, le Eikichi reçoit ses 12 stacks au /start). En standard : c4 partout.
      players: {
        create: Array.from({ length: 7 }, (_, i) => ({
          name: i === 0 ? `Eikichi-${label}` : `P${i}-${label}`,
          token: generatePlayerToken(),
          avatar: `https://api.dicebear.com/7.x/big-smile/svg?seed=${label}-${i}`,
          beatEikichiWeaponId: mode === 'standard' ? 'c4' : null,
        })),
      },
    },
    include: { players: true },
  });

  // Eikichi = premier joueur créé.
  const eikichiPlayer = room.players[0];

  // Catalogue factice de 5 questions distinctes.
  const fakeQuestions = Array.from({ length: 5 }, (_, i) => ({
    position: i,
    gameId: `fakegame-${i}`,
    name: `RealAnswer${i}`,
    aliases: [],
    imageUrl: `https://example.com/q${i}.png`,
  }));

  // playerStates : standard = tous armés c4 + 3 boucliers ; all-vs-eikichi =
  // Eikichi avec stacks 12×3 + 0 bouclier ; non-Eikichi avec 0 arme + 3 bouclier.
  const eikichiStacks: Record<string, number> = {
    smoke: 3, c4: 3, blade: 3, freeze: 3, zoomghost: 3, tornado: 3,
    puzzle: 3, speed: 3, tag: 3, glitch: 3, acid: 3, strobe: 3,
  };
  const playerStateData = room.players.map((p) => {
    const isEikichi = p.id === eikichiPlayer.id;
    if (mode === 'all-vs-eikichi') {
      return isEikichi
        ? {
            playerId: p.id,
            weaponId: null,
            weaponUsesLeft: 0,
            shieldUsesLeft: 0,
            lastUsedQuestionIndex: -1,
            weaponStacks: eikichiStacks as unknown as object,
          }
        : {
            playerId: p.id,
            weaponId: null,
            weaponUsesLeft: 0,
            shieldUsesLeft: 3,
            lastUsedQuestionIndex: -1,
          };
    }
    return {
      playerId: p.id,
      weaponId: 'c4',
      weaponUsesLeft: 3,
      shieldUsesLeft: 3,
      lastUsedQuestionIndex: -1,
    };
  });

  const game = await prisma.beatEikichiGame.create({
    data: {
      roomId: room.id,
      questions: fakeQuestions as unknown as object,
      phase: 'playing',
      currentIndex: 0,
      // Démarré il y a 60 s pour que le timer soit considéré expiré.
      questionStartedAt: new Date(Date.now() - 60_000),
      timerSeconds: 30,
      mode,
      eikichiPlayerId: eikichiPlayer.id,
      playerStates: { create: playerStateData },
    },
  });

  return {
    roomId: room.id,
    code,
    gameId: game.id,
    creatorToken,
    players: room.players.map((p) => ({ id: p.id, token: p.token, name: p.name })),
    eikichiPlayerId: eikichiPlayer.id,
  };
}

async function teardown(roomId: string): Promise<void> {
  await prisma.room.delete({ where: { id: roomId } }).catch(() => {});
}

/** Helper : assert + log dans les details. */
function check(details: string[], cond: boolean, msg: string): boolean {
  details.push(`${cond ? '✓' : '✗'} ${msg}`);
  return cond;
}

/**
 * Appelle directement la route /next via fetch absolu vers l'origine.
 * Plus réaliste que d'appeler `advanceQuestionIfMatches` direct car ça
 * exerce TOUTE la chaîne (auth, parsing, idempotence, push).
 */
async function callNext(
  origin: string,
  code: string,
  playerToken: string,
  expectedIndex: number,
): Promise<{ ok: boolean; skipped?: string; status: number }> {
  const res = await fetch(`${origin}/api/games/beat-eikichi/${code}/next`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerToken, expectedIndex }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, skipped: data.skipped, status: res.status };
}

async function callSubmit(
  origin: string,
  code: string,
  playerToken: string,
  text: string,
  expectedIndex?: number,
): Promise<{ ok: boolean; correct?: boolean; advanced?: boolean; late?: boolean; error?: string; status: number }> {
  const res = await fetch(`${origin}/api/games/beat-eikichi/${code}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerToken, text, ...(expectedIndex !== undefined ? { expectedIndex } : {}) }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, ...data, status: res.status };
}

async function callFireWeapon(
  origin: string,
  code: string,
  playerToken: string,
  targetPlayerId: string,
  weaponId?: string,
): Promise<{ ok: boolean; error?: string; status: number }> {
  const res = await fetch(`${origin}/api/games/beat-eikichi/${code}/fire-weapon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerToken, targetPlayerId, ...(weaponId ? { weaponId } : {}) }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, ...data, status: res.status };
}

async function callFireShield(
  origin: string,
  code: string,
  playerToken: string,
): Promise<{ ok: boolean; error?: string; status: number }> {
  const res = await fetch(`${origin}/api/games/beat-eikichi/${code}/fire-shield`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerToken }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, ...data, status: res.status };
}

async function readGameState(gameId: string) {
  return prisma.beatEikichiGame.findUnique({
    where: { id: gameId },
    include: { playerStates: true, weaponEvents: true },
  });
}

// ─────────────────────────────────────────────────────────────────────────
// SCÉNARIOS
// ─────────────────────────────────────────────────────────────────────────

/**
 * Helper générique : 7 /next concurrents au timeout. Le mode passé en
 * paramètre exerce les mêmes invariants en standard ET en all-vs-eikichi
 * (l'avancement de question doit être atomique peu importe le mode).
 */
async function _concurrentNextScenario(
  origin: string,
  id: string,
  label: string,
  mode: 'standard' | 'all-vs-eikichi',
): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom(id, { mode });
  try {
    const calls = await Promise.all(
      sim.players.map((p) => callNext(origin, sim.code, p.token, 0)),
    );
    const okCount = calls.filter((c) => c.ok && !c.skipped).length;
    const skippedCount = calls.filter((c) => c.skipped === 'already advanced').length;
    const game = await readGameState(sim.gameId);

    let ok = check(details, game?.currentIndex === 1, `currentIndex = ${game?.currentIndex} (attendu: 1)`);
    ok = check(details, okCount === 1, `1 seul appel ok (obtenu: ${okCount})`) && ok;
    ok = check(details, skippedCount === 6, `6 appels skipped (obtenu: ${skippedCount})`) && ok;
    return { id, label, ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S1 — 7 joueurs appellent /next en parallèle au timeout.
 * Attendu : currentIndex avance d'EXACTEMENT 1 (pas 2, pas 7), 1 seul "ok",
 * 6 retournent skipped='already advanced'.
 */
async function s1_concurrentNext(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s1');
  try {
    const calls = await Promise.all(
      sim.players.map((p) => callNext(origin, sim.code, p.token, 0)),
    );
    const okCount = calls.filter((c) => c.ok && !c.skipped).length;
    const skippedCount = calls.filter((c) => c.skipped === 'already advanced').length;
    const game = await readGameState(sim.gameId);

    let ok = check(details, game?.currentIndex === 1, `currentIndex final = ${game?.currentIndex} (attendu: 1)`);
    ok = check(details, okCount === 1, `1 seul appel "ok" (obtenu: ${okCount})`) && ok;
    ok = check(details, skippedCount === 6, `6 appels "already advanced" (obtenu: ${skippedCount})`) && ok;
    return { id: 's1', label: '7 joueurs /next en parallèle', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S2 — Eikichi /submit (bonne réponse, expectedIndex=0) + 6 autres /next
 * en parallèle.
 *
 * Contrat strict (avec le fix `late: true` côté /submit) : Eikichi ne peut
 * JAMAIS être marqué correct=false dans cette race, car son submit était
 * bel et bien une bonne réponse pour la question 0.
 *   - SOIT Eikichi gagne le gate atomique → correct=true, advanced=true
 *   - SOIT /next gagne le gate → /submit voit que game.currentIndex !=
 *     expectedIndex et retourne `late: true` (ni correct, ni faux negatif)
 * Et bien sûr : currentIndex=1, exactement 1 advance, pas de skip.
 */
async function s2_eikichiVsNext(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s2');
  try {
    const eikichi = sim.players[0];
    const others = sim.players.slice(1);

    const [submitRes, ...nextRes] = await Promise.all([
      callSubmit(origin, sim.code, eikichi.token, 'RealAnswer0', 0),
      ...others.map((p) => callNext(origin, sim.code, p.token, 0)),
    ]);

    const game = await readGameState(sim.gameId);
    const eikichiAdvanced = submitRes.advanced === true;
    const eikichiCorrect = submitRes.correct === true;
    const eikichiLate = submitRes.late === true;
    const someNextAdvanced = nextRes.some((r) => r.ok && !r.skipped);
    const skippedNexts = nextRes.filter((r) => r.skipped === 'already advanced').length;

    let ok = check(details, game?.currentIndex === 1, `currentIndex = ${game?.currentIndex} (attendu: 1, surtout pas 2+)`);
    ok = check(details, eikichiAdvanced || someNextAdvanced, 'Exactement un caller a fait avancer la question') && ok;
    ok = check(details, !(eikichiAdvanced && someNextAdvanced), "Pas de double-advance (exclusion mutuelle)") && ok;
    // L'invariant clé du fix : Eikichi est SOIT correct, SOIT late, jamais incorrectement marqué faux.
    ok = check(details, eikichiCorrect || eikichiLate, "Eikichi est correct OU late (jamais faux negatif)") && ok;
    ok = check(details, !(eikichiCorrect && eikichiLate), "Eikichi n'est pas à la fois correct et late") && ok;
    details.push(`  · eikichi.correct=${eikichiCorrect} eikichi.late=${eikichiLate} eikichi.advanced=${eikichiAdvanced} /next skipped=${skippedNexts}/6`);
    return { id: 's2', label: 'Eikichi /submit + 6 /next concurrents', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S3 — 7 joueurs /submit la MÊME bonne réponse en parallèle.
 * Attendu : tous voient `correct: true`, mais une seule "answer" par joueur,
 * et currentIndex ne saute pas (avance de 1 max).
 */
async function s3_allCorrectConcurrent(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s3');
  try {
    const calls = await Promise.all(
      sim.players.map((p) => callSubmit(origin, sim.code, p.token, 'RealAnswer0')),
    );
    const correctCount = calls.filter((c) => c.correct === true).length;

    const game = await readGameState(sim.gameId);
    let ok = check(details, game?.currentIndex === 1, `currentIndex = ${game?.currentIndex} (attendu: 1)`);
    ok = check(details, correctCount === 7, `7 joueurs marqués correct (obtenu: ${correctCount})`) && ok;
    // Vérifie qu'aucun joueur n'a 2 entrées answers pour la position 0.
    const duplicates = (game?.playerStates ?? []).filter((s) => {
      type A = { position: number };
      const arr = (s.answers as unknown as A[]) ?? [];
      return arr.filter((a) => a.position === 0).length > 1;
    });
    ok = check(details, duplicates.length === 0, `Aucun joueur avec 2 réponses pour Q0 (obtenu: ${duplicates.length})`) && ok;
    return { id: 's3', label: '7 /submit corrects en parallèle (all-found)', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S4 — Eikichi /submit avec MAUVAISE réponse.
 * Attendu : `correct: false`, currentIndex INCHANGÉ.
 */
async function s4_eikichiWrongAnswer(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s4');
  try {
    const eikichi = sim.players[0];
    const res = await callSubmit(origin, sim.code, eikichi.token, 'WrongGameTitle');

    const game = await readGameState(sim.gameId);
    let ok = check(details, res.correct === false, `Eikichi marqué incorrect (obtenu: correct=${res.correct})`);
    ok = check(details, game?.currentIndex === 0, `currentIndex toujours 0 (obtenu: ${game?.currentIndex})`) && ok;
    return { id: 's4', label: "Eikichi avec mauvaise réponse n'avance pas", ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S5 — Stale expectedIndex : 1 client envoie /next avec expectedIndex=0
 * alors que la partie est déjà à index=2.
 * Attendu : skipped='already advanced', currentIndex INCHANGÉ.
 */
async function s5_staleNext(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s5');
  try {
    // Force la partie à index 2.
    await prisma.beatEikichiGame.update({
      where: { id: sim.gameId },
      data: { currentIndex: 2, questionStartedAt: new Date(Date.now() - 60_000) },
    });

    const res = await callNext(origin, sim.code, sim.players[1].token, 0);
    const game = await readGameState(sim.gameId);

    let ok = check(details, res.skipped === 'already advanced', `skipped = ${res.skipped} (attendu: already advanced)`);
    ok = check(details, game?.currentIndex === 2, `currentIndex toujours 2 (obtenu: ${game?.currentIndex})`) && ok;
    return { id: 's5', label: 'Stale expectedIndex rejeté', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S6 — Spam /next (50× le même client).
 * Attendu : 1 seul "ok", 49 "already advanced", currentIndex avance de 1.
 */
async function s6_spamNext(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s6');
  try {
    const calls = await Promise.all(
      Array.from({ length: 50 }, () => callNext(origin, sim.code, sim.players[1].token, 0)),
    );
    const okCount = calls.filter((c) => c.ok && !c.skipped).length;

    const game = await readGameState(sim.gameId);
    let ok = check(details, game?.currentIndex === 1, `currentIndex = ${game?.currentIndex} (attendu: 1)`);
    ok = check(details, okCount === 1, `1 seul "ok" sur 50 spam (obtenu: ${okCount})`) && ok;
    return { id: 's6', label: 'Spam 50× /next du même client', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S7 — Joueur soumet 2 fois la même bonne réponse.
 * Attendu : 1ère = correct, 2e = 400 "Already answered".
 */
async function s7_doubleSubmit(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s7');
  try {
    const p = sim.players[1];
    const r1 = await callSubmit(origin, sim.code, p.token, 'RealAnswer0');
    const r2 = await callSubmit(origin, sim.code, p.token, 'RealAnswer0');

    let ok = check(details, r1.correct === true, '1er submit accepté');
    ok = check(details, r2.status === 400, `2e submit rejeté (status ${r2.status}, attendu 400)`) && ok;
    return { id: 's7', label: 'Double-submit rejeté', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S8 — Tirs d'arme concurrents pendant un advance.
 * 6 joueurs tirent leurs armes (currentIndex+1 = 1) PENDANT qu'Eikichi
 * soumet. Attendu : tous les weaponEvents sont insérés avec questionIndex
 * cohérent (soit 1 soit 2 selon timing), pas de crash.
 */
async function s8_weaponDuringAdvance(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s8');
  try {
    const eikichi = sim.players[0];
    const others = sim.players.slice(1);
    const target = sim.players[2];

    await Promise.all([
      callSubmit(origin, sim.code, eikichi.token, 'RealAnswer0'),
      ...others
        .filter((p) => p.id !== target.id)
        .map((p) => callFireWeapon(origin, sim.code, p.token, target.id)),
    ]);

    const game = await readGameState(sim.gameId);
    const events = game?.weaponEvents ?? [];

    let ok = check(details, game?.currentIndex === 1, `currentIndex = ${game?.currentIndex} (attendu: 1)`);
    ok = check(details, events.length >= 1, `Au moins 1 weaponEvent inséré (obtenu: ${events.length})`) && ok;
    // questionIndex doit être 1 ou 2 (=currentIndex au moment du tir + 1)
    const validIndex = events.every((e) => e.questionIndex === 1 || e.questionIndex === 2);
    ok = check(details, validIndex, "Tous les weaponEvents ont un questionIndex cohérent (1 ou 2)") && ok;
    return { id: 's8', label: 'Tirs armes concurrents pendant avance', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S9 — Eikichi /submit + advanceFromTimeout en mode "vraie race" :
 * 100 itérations en parallèle pour saturer le pool de connexions Prisma.
 * Attendu : aucune itération ne fait sauter une question.
 *
 * On prépare 5 advances séquentielles (questions 0→5), chacune sous race.
 */
async function s9_seriesOfAdvances(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s9');
  try {
    for (let q = 0; q < 4; q++) {
      // Reset questionStartedAt pour autoriser /next (timer écoulé).
      await prisma.beatEikichiGame.update({
        where: { id: sim.gameId },
        data: { questionStartedAt: new Date(Date.now() - 60_000) },
      });
      // 7 /next concurrents pour passer à q+1.
      await Promise.all(
        sim.players.map((p) => callNext(origin, sim.code, p.token, q)),
      );
      const game = await readGameState(sim.gameId);
      const ok = game?.currentIndex === q + 1;
      details.push(`${ok ? '✓' : '✗'} Q${q}→Q${q + 1}: currentIndex=${game?.currentIndex}`);
      if (!ok) {
        return {
          id: 's9',
          label: '4 transitions consécutives sans skip',
          ok: false,
          details,
        };
      }
    }
    return { id: 's9', label: '4 transitions consécutives sans skip', ok: true, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S10 — F5 simulé : un joueur "recharge" en re-fetchant l'état pendant que
 * les autres font un advance. Attendu : le joueur récupère l'état à jour,
 * pas un état stale qui causerait un /next sur un mauvais expectedIndex.
 */
async function s10_f5Simulation(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s10');
  try {
    const p = sim.players[1];
    // Le joueur "rechargeant" lit l'état initial.
    const initialFetch = await fetch(`${origin}/api/rooms/${sim.code}?playerToken=${p.token}`).then((r) => r.json());
    const initialIndex = initialFetch?.room?.beatEikichiGame?.currentIndex;
    details.push(`Initial fetch: currentIndex=${initialIndex}`);

    // Autres joueurs font un /next (avance de 0 à 1).
    await Promise.all(
      sim.players.filter((x) => x.id !== p.id).map((x) => callNext(origin, sim.code, x.token, 0)),
    );

    // Le joueur recharge sa page (= refetch).
    const refetched = await fetch(`${origin}/api/rooms/${sim.code}?playerToken=${p.token}`).then((r) => r.json());
    const newIndex = refetched?.room?.beatEikichiGame?.currentIndex;
    details.push(`Post-advance fetch: currentIndex=${newIndex}`);

    // Le joueur rechargeant fait /next avec expectedIndex=newIndex (frais).
    // Reset questionStartedAt pour autoriser le call.
    await prisma.beatEikichiGame.update({
      where: { id: sim.gameId },
      data: { questionStartedAt: new Date(Date.now() - 60_000) },
    });
    const nextRes = await callNext(origin, sim.code, p.token, newIndex);

    const game = await readGameState(sim.gameId);
    let ok = check(details, initialIndex === 0, `initialIndex=0 (obtenu: ${initialIndex})`);
    ok = check(details, newIndex === 1, `Après advance, refetch voit currentIndex=1 (obtenu: ${newIndex})`) && ok;
    ok = check(details, nextRes.ok && !nextRes.skipped, "Joueur rechargé peut /next avec son expectedIndex frais") && ok;
    ok = check(details, game?.currentIndex === 2, `currentIndex final = 2 (obtenu: ${game?.currentIndex})`) && ok;
    return { id: 's10', label: 'F5 — joueur récupère état frais après avance', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S11 — Vérifie le contrat fuzzyMatch côté serveur sur les variantes
 * "halo", "Halo", "halo!" face à `name="RealAnswer0"`. Toutes doivent être
 * rejetées (mauvaise réponse), et "RealAnswer0" / "realanswer0" / "Real
 * Answer 0" / " RealAnswer0 " doivent être acceptées.
 */
async function s11_fuzzyContract(_origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s11');
  try {
    // Ce scénario ne touche pas à l'API : on teste juste la fonction pure
    // pour s'assurer qu'aucun changement récent ne casse le contrat.
    const accepted = ['RealAnswer0', 'realanswer0', 'Real Answer 0', '  RealAnswer0  '];
    const rejected = ['halo', 'WrongGame', 'RealAnswer1', '', '   '];

    let ok = true;
    for (const a of accepted) {
      const r = isAcceptedAnswer(a, 'RealAnswer0');
      ok = check(details, r === true, `accepte ${JSON.stringify(a)}`) && ok;
    }
    for (const r of rejected) {
      const got = isAcceptedAnswer(r, 'RealAnswer0');
      ok = check(details, got === false, `rejette ${JSON.stringify(r)}`) && ok;
    }
    return { id: 's11', label: 'Contrat isAcceptedAnswer (variants)', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S12 — Tous les 7 joueurs /submit avec une mauvaise réponse en parallèle
 * (incluant Eikichi). Attendu : aucun avance, currentIndex inchangé, tous
 * marqués `correct: false`.
 */
async function s12_allWrongAnswers(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s12');
  try {
    const calls = await Promise.all(
      sim.players.map((p) => callSubmit(origin, sim.code, p.token, 'NopeNopeNope')),
    );
    const correctCount = calls.filter((c) => c.correct === true).length;

    const game = await readGameState(sim.gameId);
    let ok = check(details, game?.currentIndex === 0, `currentIndex inchangé = 0 (obtenu: ${game?.currentIndex})`);
    ok = check(details, correctCount === 0, `0 réponse correcte (obtenu: ${correctCount})`) && ok;
    return { id: 's12', label: 'Tous mauvaises réponses → pas d\'avance', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S13 — Submit "late" : forcer la situation où le serveur a déjà avancé à
 * Q1 quand le submit pour Q0 arrive. Vérifie que :
 *   - le serveur retourne `late: true`
 *   - PAS de `correct: true` (la réponse n'est pas validée pour la mauvaise question)
 *   - PAS de feedback "closeness" trompeur
 *   - le state du joueur n'a aucune answer ajoutée
 */
async function s13_lateSubmit(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s13');
  try {
    const p = sim.players[1];
    // Avance le serveur à Q1 (sans toucher au state du joueur).
    await prisma.beatEikichiGame.update({
      where: { id: sim.gameId },
      data: { currentIndex: 1, questionStartedAt: new Date() },
    });

    // Le joueur soumet pour Q0 (état stale côté client).
    const res = await callSubmit(origin, sim.code, p.token, 'RealAnswer0', 0);

    const game = await readGameState(sim.gameId);
    const playerState = game?.playerStates.find((s) => s.playerId === p.id);
    type A = { position: number };
    const answers = (playerState?.answers as unknown as A[]) ?? [];

    let ok = check(details, res.late === true, `late = ${res.late} (attendu: true)`);
    ok = check(details, res.correct !== true, `correct ≠ true (obtenu: ${res.correct})`) && ok;
    ok = check(details, game?.currentIndex === 1, `currentIndex toujours 1 (obtenu: ${game?.currentIndex})`) && ok;
    ok = check(details, answers.length === 0, `aucune answer enregistrée pour le joueur (obtenu: ${answers.length})`) && ok;
    return { id: 's13', label: 'Submit late : pas de faux negatif', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

// ─────────────────────────────────────────────────────────────────────────
// MODE "ALL-VS-EIKICHI"
// ─────────────────────────────────────────────────────────────────────────

/**
 * S14 — Mode all-vs-eikichi : Eikichi tire 3 armes différentes vers 3 cibles
 * différentes pour la même question, en parallèle. Attendu : les 3 réussissent
 * (armes différentes, cibles différentes), 3 weaponEvents insérés, stacks à
 * 2 chacun.
 */
async function s14_eikichiMultiFire(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s14', { mode: 'all-vs-eikichi' });
  try {
    const eikichi = sim.players[0];
    const t1 = sim.players[1];
    const t2 = sim.players[2];
    const t3 = sim.players[3];
    const calls = await Promise.all([
      callFireWeapon(origin, sim.code, eikichi.token, t1.id, 'smoke'),
      callFireWeapon(origin, sim.code, eikichi.token, t2.id, 'blade'),
      callFireWeapon(origin, sim.code, eikichi.token, t3.id, 'glitch'),
    ]);
    const allOk = calls.every((c) => c.ok);

    const game = await readGameState(sim.gameId);
    const events = game?.weaponEvents ?? [];
    const eikichiState = game?.playerStates.find((s) => s.playerId === eikichi.id);
    const stacks = (eikichiState?.weaponStacks as Record<string, number> | null) ?? {};

    let ok = check(details, allOk, '3 tirs réussis');
    ok = check(details, events.length === 3, `3 weaponEvents (obtenu: ${events.length})`) && ok;
    ok = check(details, stacks.smoke === 2, `smoke=2 (obtenu: ${stacks.smoke})`) && ok;
    ok = check(details, stacks.blade === 2, `blade=2 (obtenu: ${stacks.blade})`) && ok;
    ok = check(details, stacks.glitch === 2, `glitch=2 (obtenu: ${stacks.glitch})`) && ok;
    ok = check(details, stacks.c4 === 3, `c4 inchangé=3 (obtenu: ${stacks.c4})`) && ok;
    return { id: 's14', label: 'Eikichi tire 3 armes parallèles vers 3 cibles', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S15 — Mode all-vs-eikichi : Eikichi essaie de tirer 2 armes vers la MÊME
 * cible pour la même question. Attendu : la 1re passe, la 2e est rejetée
 * "Target already hit this question".
 */
async function s15_eikichiSameTargetTwice(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s15', { mode: 'all-vs-eikichi' });
  try {
    const eikichi = sim.players[0];
    const target = sim.players[1];
    const r1 = await callFireWeapon(origin, sim.code, eikichi.token, target.id, 'smoke');
    const r2 = await callFireWeapon(origin, sim.code, eikichi.token, target.id, 'blade');

    const game = await readGameState(sim.gameId);
    const events = game?.weaponEvents ?? [];
    let ok = check(details, r1.ok, '1er tir (smoke) accepté');
    ok = check(details, !r2.ok && r2.status === 400, `2e tir (blade même cible) rejeté 400 (obtenu: status=${r2.status} ok=${r2.ok})`) && ok;
    ok = check(details, events.length === 1, `1 seul weaponEvent (obtenu: ${events.length})`) && ok;
    return { id: 's15', label: '1 cible max par question pour le Eikichi', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S16 — Mode all-vs-eikichi : un non-Eikichi essaie de tirer une arme.
 * Attendu : 403 Forbidden.
 */
async function s16_nonEikichiCannotFire(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s16', { mode: 'all-vs-eikichi' });
  try {
    const attacker = sim.players[1]; // non-Eikichi
    const target = sim.players[2];
    const r = await callFireWeapon(origin, sim.code, attacker.token, target.id, 'smoke');

    const game = await readGameState(sim.gameId);
    const events = game?.weaponEvents ?? [];
    let ok = check(details, !r.ok && r.status === 403, `Tir rejeté 403 (obtenu: status=${r.status})`);
    ok = check(details, events.length === 0, `0 weaponEvent (obtenu: ${events.length})`) && ok;
    return { id: 's16', label: 'Non-Eikichi ne peut pas tirer', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S17 — Mode all-vs-eikichi : le Eikichi essaie d'utiliser un bouclier.
 * Attendu : 403 Forbidden.
 */
async function s17_eikichiCannotShield(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s17', { mode: 'all-vs-eikichi' });
  try {
    const eikichi = sim.players[0];
    const r = await callFireShield(origin, sim.code, eikichi.token);

    const game = await readGameState(sim.gameId);
    const shieldEvents = (game?.weaponEvents ?? []).filter((e) => e.weaponId === 'shield');
    let ok = check(details, !r.ok && r.status === 403, `Bouclier rejeté 403 (obtenu: status=${r.status})`);
    ok = check(details, shieldEvents.length === 0, `0 shield event (obtenu: ${shieldEvents.length})`) && ok;
    return { id: 's17', label: 'Eikichi ne peut pas utiliser de bouclier', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * Variante mode all-vs-eikichi des scénarios race-sensibles : on rejoue les
 * mêmes invariants pour vérifier que le mode ne casse aucun gate atomique.
 * Bug racine craint : le check `expectedIndex` peut diverger si la logique
 * d'avance change selon le mode → on garde la couverture symétrique.
 */
async function s_avs_concurrentNext(origin: string): Promise<ScenarioResult> {
  return _concurrentNextScenario(origin, 's-avs-next', '[AvE] 7 /next parallèles', 'all-vs-eikichi');
}

async function s_avs_eikichiVsNext(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s-avs-evn', { mode: 'all-vs-eikichi' });
  try {
    const eikichi = sim.players[0];
    const others = sim.players.slice(1);
    const [submitRes, ...nextRes] = await Promise.all([
      callSubmit(origin, sim.code, eikichi.token, 'RealAnswer0', 0),
      ...others.map((p) => callNext(origin, sim.code, p.token, 0)),
    ]);
    const game = await readGameState(sim.gameId);
    const eikichiAdvanced = submitRes.advanced === true;
    const someNextAdvanced = nextRes.some((r) => r.ok && !r.skipped);
    const eikichiCorrect = submitRes.correct === true;
    const eikichiLate = submitRes.late === true;

    let ok = check(details, game?.currentIndex === 1, `currentIndex = ${game?.currentIndex} (attendu: 1)`);
    ok = check(details, eikichiAdvanced || someNextAdvanced, 'Un caller a avancé') && ok;
    ok = check(details, !(eikichiAdvanced && someNextAdvanced), 'Pas de double-advance') && ok;
    ok = check(details, eikichiCorrect || eikichiLate, 'Eikichi correct OU late (jamais faux negatif)') && ok;
    return { id: 's-avs-evn', label: '[AvE] Eikichi /submit + 6 /next', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

async function s_avs_allCorrect(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s-avs-all', { mode: 'all-vs-eikichi' });
  try {
    const calls = await Promise.all(
      sim.players.map((p) => callSubmit(origin, sim.code, p.token, 'RealAnswer0', 0)),
    );
    const correctCount = calls.filter((c) => c.correct === true).length;
    const game = await readGameState(sim.gameId);

    let ok = check(details, game?.currentIndex === 1, `currentIndex = ${game?.currentIndex} (attendu: 1)`);
    ok = check(details, correctCount === 7, `7 corrects (obtenu: ${correctCount})`) && ok;
    return { id: 's-avs-all', label: '[AvE] 7 /submit corrects (all-found)', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

async function s_avs_seriesAdvances(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s-avs-seq', { mode: 'all-vs-eikichi' });
  try {
    for (let q = 0; q < 4; q++) {
      await prisma.beatEikichiGame.update({
        where: { id: sim.gameId },
        data: { questionStartedAt: new Date(Date.now() - 60_000) },
      });
      await Promise.all(sim.players.map((p) => callNext(origin, sim.code, p.token, q)));
      const game = await readGameState(sim.gameId);
      const ok = game?.currentIndex === q + 1;
      details.push(`${ok ? '✓' : '✗'} Q${q}→Q${q + 1}: currentIndex=${game?.currentIndex}`);
      if (!ok) {
        return { id: 's-avs-seq', label: '[AvE] 4 transitions consécutives', ok: false, details };
      }
    }
    return { id: 's-avs-seq', label: '[AvE] 4 transitions consécutives', ok: true, details };
  } finally {
    await teardown(sim.roomId);
  }
}

async function s_avs_lateSubmit(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s-avs-late', { mode: 'all-vs-eikichi' });
  try {
    const eikichi = sim.players[0];
    await prisma.beatEikichiGame.update({
      where: { id: sim.gameId },
      data: { currentIndex: 1, questionStartedAt: new Date() },
    });
    const res = await callSubmit(origin, sim.code, eikichi.token, 'RealAnswer0', 0);
    const game = await readGameState(sim.gameId);
    let ok = check(details, res.late === true, `late = ${res.late}`);
    ok = check(details, res.correct !== true, `correct ≠ true (obtenu: ${res.correct})`) && ok;
    ok = check(details, game?.currentIndex === 1, `currentIndex = 1`) && ok;
    return { id: 's-avs-late', label: '[AvE] Submit late : pas de faux negatif', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S-RACE-SHIELD — race condition spécifique au bouclier : le même joueur
 * envoie 4 fire-shield en parallèle. Attendu : 1 seul réussit (event créé +
 * compteur décrémenté), les 3 autres reçoivent `alreadyArmed: true` (idempotent).
 */
async function s_raceShield(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s-shld');
  try {
    const p = sim.players[1];
    const calls = await Promise.all([
      callFireShield(origin, sim.code, p.token),
      callFireShield(origin, sim.code, p.token),
      callFireShield(origin, sim.code, p.token),
      callFireShield(origin, sim.code, p.token),
    ]);
    const okCount = calls.filter((c) => c.ok).length;

    const game = await readGameState(sim.gameId);
    const shieldEvents = (game?.weaponEvents ?? []).filter(
      (e) => e.weaponId === 'shield' && e.targetPlayerId === p.id,
    );
    const state = game?.playerStates.find((s) => s.playerId === p.id);

    let ok = check(details, okCount === 4, `4 réponses ok (idempotent + 1 vrai succès) (obtenu: ${okCount})`);
    ok = check(details, shieldEvents.length === 1, `1 seul shield event (obtenu: ${shieldEvents.length})`) && ok;
    ok = check(details, state?.shieldUsesLeft === 2, `shieldUsesLeft = 2 (obtenu: ${state?.shieldUsesLeft})`) && ok;
    return { id: 's-shld', label: 'Race 4× /fire-shield → 1 event, 1 décrément', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S-RACE-12-WEAPONS — Eikichi tire ses 12 armes en parallèle vers 12 cibles
 * différentes (donc 7 cibles uniques + cibles répétées sont évitées).
 * Attendu : nombre de tirs réussis = nombre de cibles distinctes (max 6,
 * puisque l'Eikichi est exclu de ses propres cibles dans une room de 7).
 */
async function s_race12Weapons(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s-12w', { mode: 'all-vs-eikichi' });
  try {
    const eikichi = sim.players[0];
    const targets = sim.players.slice(1, 7); // 6 cibles
    const weapons = ['smoke', 'c4', 'blade', 'freeze', 'zoomghost', 'tornado'];
    // 6 tirs simultanés vers 6 cibles différentes, armes différentes.
    const calls = await Promise.all(
      targets.map((t, i) => callFireWeapon(origin, sim.code, eikichi.token, t.id, weapons[i])),
    );
    const okCount = calls.filter((c) => c.ok).length;

    const game = await readGameState(sim.gameId);
    const events = game?.weaponEvents ?? [];
    const eikState = game?.playerStates.find((s) => s.playerId === eikichi.id);
    const stacks = (eikState?.weaponStacks as Record<string, number> | null) ?? {};

    let ok = check(details, okCount === 6, `6 tirs réussis (obtenu: ${okCount})`);
    ok = check(details, events.length === 6, `6 weaponEvents (obtenu: ${events.length})`) && ok;
    // Chaque arme tirée 1× → stack à 2.
    for (const w of weapons) {
      ok = check(details, stacks[w] === 2, `${w} stack=2 (obtenu: ${stacks[w]})`) && ok;
    }
    // Armes non tirées intactes.
    ok = check(details, stacks.glitch === 3 && stacks.acid === 3 && stacks.strobe === 3, 'Armes non tirées intactes') && ok;
    return { id: 's-12w', label: '[AvE] 6 armes parallèles vers 6 cibles', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S-RACE-SAME-WEAPON-3-TARGETS — Eikichi tire 3× la même arme en parallèle
 * vers 3 cibles différentes. Le décrément JSON doit être atomique : 3 tirs
 * concurrents, stack passe de 3 à 0.
 */
async function s_raceSameWeapon3Targets(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s-sw3', { mode: 'all-vs-eikichi' });
  try {
    const eikichi = sim.players[0];
    const t1 = sim.players[1];
    const t2 = sim.players[2];
    const t3 = sim.players[3];
    const calls = await Promise.all([
      callFireWeapon(origin, sim.code, eikichi.token, t1.id, 'smoke'),
      callFireWeapon(origin, sim.code, eikichi.token, t2.id, 'smoke'),
      callFireWeapon(origin, sim.code, eikichi.token, t3.id, 'smoke'),
    ]);
    const okCount = calls.filter((c) => c.ok).length;

    const game = await readGameState(sim.gameId);
    const events = (game?.weaponEvents ?? []).filter((e) => e.weaponId === 'smoke');
    const eikState = game?.playerStates.find((s) => s.playerId === eikichi.id);
    const stacks = (eikState?.weaponStacks as Record<string, number> | null) ?? {};

    let ok = check(details, okCount === 3, `3 tirs réussis (obtenu: ${okCount})`);
    ok = check(details, events.length === 3, `3 smoke events (obtenu: ${events.length})`) && ok;
    ok = check(details, stacks.smoke === 0, `smoke stack atomique = 0 (obtenu: ${stacks.smoke})`) && ok;
    return { id: 's-sw3', label: '[AvE] 3 tirs même arme parallèles → stack atomique', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S-RACE-SAME-TARGET-DIFF-WEAPONS — Eikichi tente de tirer 5 armes
 * différentes vers la MÊME cible en parallèle. Attendu : 1 seul réussit
 * (la contrainte unique gagne au niveau DB), 4 sont rejetés avec restitution
 * du stock de l'arme correspondante.
 */
async function s_raceSameTargetDiffWeapons(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s-stdw', { mode: 'all-vs-eikichi' });
  try {
    const eikichi = sim.players[0];
    const t = sim.players[1];
    const weapons = ['smoke', 'c4', 'blade', 'freeze', 'zoomghost'];
    const calls = await Promise.all(
      weapons.map((w) => callFireWeapon(origin, sim.code, eikichi.token, t.id, w)),
    );
    const okCount = calls.filter((c) => c.ok).length;
    const rejected = calls.filter((c) => !c.ok && c.status === 400);

    const game = await readGameState(sim.gameId);
    const events = (game?.weaponEvents ?? []).filter((e) => e.targetPlayerId === t.id);
    const eikState = game?.playerStates.find((s) => s.playerId === eikichi.id);
    const stacks = (eikState?.weaponStacks as Record<string, number> | null) ?? {};

    let ok = check(details, okCount === 1, `1 seul tir réussi (obtenu: ${okCount})`);
    ok = check(details, rejected.length === 4, `4 rejetés 400 (obtenu: ${rejected.length})`) && ok;
    ok = check(details, events.length === 1, `1 weaponEvent vers la cible (obtenu: ${events.length})`) && ok;
    // Total des stacks : 12 armes × 3 - 1 = 35.
    const total = Object.values(stacks).reduce((s, n) => s + n, 0);
    ok = check(details, total === 35, `Total stacks = 35 (1 décrément net) (obtenu: ${total})`) && ok;
    return { id: 's-stdw', label: '[AvE] 5 armes parallèles même cible → 1 ok, 4 restitués', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S-STD-NO-WEAPON-STACKS — Mode standard : un PlayerState ne doit JAMAIS avoir
 * de `weaponStacks` peuplé. Vérifie que tous les états créés au /start en
 * mode standard ont weaponStacks=null.
 */
async function s_stdNoStacks(origin: string): Promise<ScenarioResult> {
  void origin;
  const details: string[] = [];
  const sim = await setupRoom('s-std-stk');
  try {
    const game = await readGameState(sim.gameId);
    const allNull = (game?.playerStates ?? []).every(
      (s) => s.weaponStacks === null || s.weaponStacks === undefined,
    );
    const ok = check(
      details,
      allNull,
      `Tous les PlayerStates ont weaponStacks=null en mode standard`,
    );
    // Vérifier en plus que les armes sont snapshotées sur chaque player.
    const allHaveWeapon = (game?.playerStates ?? []).every((s) => s.weaponId === 'c4');
    const ok2 = check(details, allHaveWeapon, `Tous les PlayerStates ont weaponId='c4'`);
    return { id: 's-std-stk', label: '[STD] weaponStacks=null + weaponId snapshoté', ok: ok && ok2, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S-AVE-INIT — Mode all-vs-eikichi : vérifier l'init du PlayerState au /start.
 *  - Eikichi : weaponStacks 12×3, weaponId=null, shieldUsesLeft=0
 *  - Non-Eikichi : weaponStacks=null, weaponId=null, shieldUsesLeft=3
 */
async function s_aveInit(origin: string): Promise<ScenarioResult> {
  void origin;
  const details: string[] = [];
  const sim = await setupRoom('s-ave-init', { mode: 'all-vs-eikichi' });
  try {
    const game = await readGameState(sim.gameId);
    const eik = game?.playerStates.find((s) => s.playerId === sim.eikichiPlayerId);
    const others = (game?.playerStates ?? []).filter((s) => s.playerId !== sim.eikichiPlayerId);

    const eikStacks = (eik?.weaponStacks as Record<string, number> | null) ?? {};
    const stacksOk =
      Object.keys(eikStacks).length === 12 &&
      Object.values(eikStacks).every((n) => n === 3);

    let ok = check(details, eik?.weaponId === null, `Eikichi.weaponId = null (obtenu: ${eik?.weaponId})`);
    ok = check(details, stacksOk, `Eikichi.weaponStacks = 12×3 (obtenu: ${JSON.stringify(eikStacks).slice(0, 80)})`) && ok;
    ok = check(details, eik?.shieldUsesLeft === 0, `Eikichi.shieldUsesLeft = 0 (obtenu: ${eik?.shieldUsesLeft})`) && ok;

    const allOthersNoStacks = others.every((s) => s.weaponStacks === null);
    const allOthersNoWeapon = others.every((s) => s.weaponId === null);
    const allOthersHaveShield = others.every((s) => s.shieldUsesLeft === 3);
    ok = check(details, allOthersNoStacks, `Non-Eikichi.weaponStacks = null`) && ok;
    ok = check(details, allOthersNoWeapon, `Non-Eikichi.weaponId = null`) && ok;
    ok = check(details, allOthersHaveShield, `Non-Eikichi.shieldUsesLeft = 3`) && ok;

    return { id: 's-ave-init', label: '[AvE] Init PlayerStates au /start', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S-AVE-MISSED-WEAPON — Mode all-vs-eikichi : un joueur tire SANS preciser
 * `weaponId` (oubli côté client). Attendu : 400.
 */
async function s_aveMissedWeapon(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s-ave-mw', { mode: 'all-vs-eikichi' });
  try {
    const eikichi = sim.players[0];
    const target = sim.players[1];
    // Pas de weaponId passé → côté serveur weaponIdToFire vaut state.weaponId
    // (=null pour Eikichi en all-vs-eikichi) → 400.
    const r = await callFireWeapon(origin, sim.code, eikichi.token, target.id);
    let ok = check(details, !r.ok && r.status === 400, `Tir sans weaponId rejeté 400 (obtenu: status=${r.status})`);
    return { id: 's-ave-mw', label: '[AvE] Tir sans weaponId rejeté', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S-STD-FIRE-WEAPON — Mode standard : un joueur peut tirer son arme normalement.
 * Vérifie que la migration n'a pas cassé le mode standard.
 */
async function s_stdFireWeapon(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s-std-fw');
  try {
    const attacker = sim.players[1];
    const target = sim.players[2];
    const r = await callFireWeapon(origin, sim.code, attacker.token, target.id);

    const game = await readGameState(sim.gameId);
    const events = game?.weaponEvents ?? [];
    const state = game?.playerStates.find((s) => s.playerId === attacker.id);

    let ok = check(details, r.ok, `Tir réussi (obtenu: status=${r.status})`);
    ok = check(details, events.length === 1, `1 weaponEvent (obtenu: ${events.length})`) && ok;
    ok = check(details, state?.weaponUsesLeft === 2, `weaponUsesLeft = 2 (obtenu: ${state?.weaponUsesLeft})`) && ok;
    return { id: 's-std-fw', label: '[STD] Tir d\'arme classique fonctionne', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S-STD-SHIELD-AGAINST-WEAPON — Mode standard : un attaquant tire smoke vers
 * une cible à Q0, la cible pose un bouclier (qui s'applique à Q1). Quand on
 * arrive à Q1, l'effet doit être annulé (isShielded=true côté lecture).
 */
async function s_stdShieldVsWeapon(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s-std-sh');
  try {
    const attacker = sim.players[1];
    const target = sim.players[2];
    // Tir + bouclier en parallèle (course typique fin de question).
    const [fireRes, shieldRes] = await Promise.all([
      callFireWeapon(origin, sim.code, attacker.token, target.id),
      callFireShield(origin, sim.code, target.token),
    ]);

    const game = await readGameState(sim.gameId);
    const events = game?.weaponEvents ?? [];
    const fireEvent = events.find((e) => e.firedByPlayerId === attacker.id);
    const shieldEvent = events.find((e) => e.weaponId === 'shield' && e.targetPlayerId === target.id);

    let ok = check(details, fireRes.ok && shieldRes.ok, '2 events créés en parallèle');
    ok = check(details, !!fireEvent && fireEvent.questionIndex === 1, 'fire event avec questionIndex=1') && ok;
    ok = check(details, !!shieldEvent && shieldEvent.questionIndex === 1, 'shield event avec questionIndex=1') && ok;
    // Les deux events coexistent ; isShielded() côté client prendra ça en compte.
    return { id: 's-std-sh', label: '[STD] Tir + bouclier coexistent pour la même Q', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * S18 — Mode all-vs-eikichi : Eikichi épuise une arme (3 tirs), le 4e échoue.
 * On utilise 3 cibles différentes pour ne pas hit la limite "1 cible/question".
 */
async function s18_eikichiStackExhausted(origin: string): Promise<ScenarioResult> {
  const details: string[] = [];
  const sim = await setupRoom('s18', { mode: 'all-vs-eikichi' });
  try {
    const eikichi = sim.players[0];
    // 3 questions consécutives, 3 cibles différentes, 1 smoke à chaque.
    // Q0 → fire smoke vers P1 (target Q1), advance vers Q1, fire smoke vers P2 (target Q2), etc.
    const fire1 = await callFireWeapon(origin, sim.code, eikichi.token, sim.players[1].id, 'smoke');
    await advanceQuestionAndReset(sim);
    const fire2 = await callFireWeapon(origin, sim.code, eikichi.token, sim.players[2].id, 'smoke');
    await advanceQuestionAndReset(sim);
    const fire3 = await callFireWeapon(origin, sim.code, eikichi.token, sim.players[3].id, 'smoke');
    await advanceQuestionAndReset(sim);
    const fire4 = await callFireWeapon(origin, sim.code, eikichi.token, sim.players[4].id, 'smoke');

    const game = await readGameState(sim.gameId);
    const eikichiState = game?.playerStates.find((s) => s.playerId === eikichi.id);
    const stacks = (eikichiState?.weaponStacks as Record<string, number> | null) ?? {};

    let ok = check(details, fire1.ok && fire2.ok && fire3.ok, '3 premiers tirs OK');
    ok = check(details, !fire4.ok, '4e tir rejeté') && ok;
    ok = check(details, stacks.smoke === 0, `smoke épuisé (obtenu: ${stacks.smoke})`) && ok;
    ok = check(details, stacks.blade === 3, `blade intact (obtenu: ${stacks.blade})`) && ok;
    return { id: 's18', label: 'Stack épuisé après 3 tirs même arme', ok, details };
  } finally {
    await teardown(sim.roomId);
  }
}

/**
 * Helper : avance d'une question et reset `questionStartedAt` à -60s pour
 * pouvoir tirer à nouveau. Utilisé dans S18 pour enchaîner 4 tirs sur 4
 * questions différentes.
 */
async function advanceQuestionAndReset(sim: SimRoom): Promise<void> {
  const game = await prisma.beatEikichiGame.findUnique({
    where: { id: sim.gameId },
    select: { currentIndex: true },
  });
  if (!game) return;
  await prisma.beatEikichiGame.update({
    where: { id: sim.gameId },
    data: {
      currentIndex: game.currentIndex + 1,
      questionStartedAt: new Date(Date.now() - 60_000),
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────
// HANDLER
// ─────────────────────────────────────────────────────────────────────────

const SCENARIOS = [
  // Race + concurrence (mode standard)
  { id: 's1', fn: s1_concurrentNext },
  { id: 's2', fn: s2_eikichiVsNext },
  { id: 's3', fn: s3_allCorrectConcurrent },
  { id: 's4', fn: s4_eikichiWrongAnswer },
  { id: 's5', fn: s5_staleNext },
  { id: 's6', fn: s6_spamNext },
  { id: 's7', fn: s7_doubleSubmit },
  { id: 's8', fn: s8_weaponDuringAdvance },
  { id: 's9', fn: s9_seriesOfAdvances },
  { id: 's10', fn: s10_f5Simulation },
  { id: 's11', fn: s11_fuzzyContract },
  { id: 's12', fn: s12_allWrongAnswers },
  { id: 's13', fn: s13_lateSubmit },
  // Mode all-vs-eikichi : armes
  { id: 's14', fn: s14_eikichiMultiFire },
  { id: 's15', fn: s15_eikichiSameTargetTwice },
  { id: 's16', fn: s16_nonEikichiCannotFire },
  { id: 's17', fn: s17_eikichiCannotShield },
  { id: 's18', fn: s18_eikichiStackExhausted },
  // Race-symétriques en mode all-vs-eikichi (les mêmes invariants doivent tenir)
  { id: 's-avs-next', fn: s_avs_concurrentNext },
  { id: 's-avs-evn', fn: s_avs_eikichiVsNext },
  { id: 's-avs-all', fn: s_avs_allCorrect },
  { id: 's-avs-seq', fn: s_avs_seriesAdvances },
  { id: 's-avs-late', fn: s_avs_lateSubmit },
  // Atomicité armes/boucliers (vérifie les fixes JSON + contrainte unique)
  { id: 's-shld', fn: s_raceShield },
  { id: 's-12w', fn: s_race12Weapons },
  { id: 's-sw3', fn: s_raceSameWeapon3Targets },
  { id: 's-stdw', fn: s_raceSameTargetDiffWeapons },
  // Init / shape côté DB
  { id: 's-std-stk', fn: s_stdNoStacks },
  { id: 's-ave-init', fn: s_aveInit },
  { id: 's-ave-mw', fn: s_aveMissedWeapon },
  { id: 's-std-fw', fn: s_stdFireWeapon },
  { id: 's-std-sh', fn: s_stdShieldVsWeapon },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { scenario } = bodySchema.parse(body);
    const origin = new URL(request.url).origin;

    const toRun = scenario
      ? SCENARIOS.filter((s) => s.id === scenario)
      : SCENARIOS;

    if (toRun.length === 0) {
      return Response.json({ error: 'Unknown scenario' }, { status: 400 });
    }

    // Cleanup proactif : supprime les rooms test orphelines (préfixe "T").
    // On ne touche que celles qui n'ont pas de gameStarted=false ET dont les
    // joueurs ont un nom qui finit par -s1, -s2... pour éviter de toucher de
    // vraies rooms. Plus prudent : on ne fait pas de cleanup automatique
    // inter-runs ici, chaque scénario gère son propre teardown.

    const results: ScenarioResult[] = [];
    for (const s of toRun) {
      try {
        const res = await s.fn(origin);
        results.push(res);
      } catch (e) {
        results.push({
          id: s.id,
          label: `[crash] ${s.id}`,
          ok: false,
          details: [],
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }

    const okCount = results.filter((r) => r.ok).length;
    return Response.json({
      summary: { total: results.length, passed: okCount, failed: results.length - okCount },
      scenarios: results,
    });
  } catch (error) {
    console.error('[BEAT-EIKICHI-SIM] error:', error);
    return Response.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
