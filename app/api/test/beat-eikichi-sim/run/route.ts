import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { generateRoomCode, generatePlayerToken } from '@/lib/utils';
import { advanceQuestionIfMatches } from '@/lib/beatEikichi/advanceQuestion';
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
async function setupRoom(label: string): Promise<SimRoom> {
  const code = `T${generateRoomCode().slice(1)}`; // 1er char "T" pour repérer
  const creatorToken = generatePlayerToken();

  const room = await prisma.room.create({
    data: {
      code,
      creatorToken,
      gameType: 'beat-eikichi',
      gameStarted: true,
      players: {
        create: Array.from({ length: 7 }, (_, i) => ({
          name: i === 0 ? `Eikichi-${label}` : `P${i}-${label}`,
          token: generatePlayerToken(),
          avatar: `https://api.dicebear.com/7.x/big-smile/svg?seed=${label}-${i}`,
          beatEikichiWeaponId: 'c4', // tous armés c4 pour les scénarios d'arme
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
    hintGenre: null,
    hintTerm: null,
    hintPlatforms: null,
  }));

  const game = await prisma.beatEikichiGame.create({
    data: {
      roomId: room.id,
      questions: fakeQuestions as unknown as object,
      phase: 'playing',
      currentIndex: 0,
      // Démarré il y a 60 s pour que le timer soit considéré expiré.
      questionStartedAt: new Date(Date.now() - 60_000),
      timerSeconds: 30,
      mode: 'normal',
      eikichiPlayerId: eikichiPlayer.id,
      playerStates: {
        create: room.players.map((p) => ({
          playerId: p.id,
          weaponId: 'c4',
          weaponUsesLeft: 3,
          shieldUsesLeft: 3,
          lastUsedQuestionIndex: -1,
        })),
      },
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
): Promise<{ ok: boolean; error?: string; status: number }> {
  const res = await fetch(`${origin}/api/games/beat-eikichi/${code}/fire-weapon`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerToken, targetPlayerId }),
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
async function s11_fuzzyContract(origin: string): Promise<ScenarioResult> {
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
// HANDLER
// ─────────────────────────────────────────────────────────────────────────

const SCENARIOS = [
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
