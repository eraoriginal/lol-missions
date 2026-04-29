/**
 * Test de concurrence pour `advanceQuestionIfMatches`.
 *
 * Lancement : npx tsx scripts/test-advance-question.ts
 *
 * Reproduit le bug racine du skip de question : avant le fix atomique, si
 * deux requêtes (ex. /submit de l'Eikichi + /next d'un autre client au
 * timeout) appelaient `advanceQuestion` en parallèle, chacune lisait
 * `currentIndex=N` puis incrémentait → la 2e voyait `N+1` et écrivait `N+2`,
 * sautant la question `N+1`.
 *
 * Ce test :
 *   1. Crée une room + game Beat Eikichi de test (préfixe "TEST_BEAT_RACE_")
 *   2. Lance K appels parallèles à `advanceQuestionIfMatches(gameId, 0)`
 *   3. Vérifie que :
 *      - currentIndex final = 1 (pas 2, pas K+1)
 *      - exactement 1 appel a retourné `true` (le gagnant)
 *      - K-1 appels ont retourné `false` (les perdants)
 *   4. Cleanup : delete la room.
 *
 * Idempotent : tu peux le rejouer, il nettoie le préfixe en début et en fin.
 */
import { prisma } from '../lib/prisma';
import { advanceQuestionIfMatches } from '../lib/beatEikichi/advanceQuestion';

const ROOM_PREFIX = 'TESTBR'; // Beat Race
const PARALLEL_CALLS = 8;

function color(s: string, code: number): string {
  return `\x1b[${code}m${s}\x1b[0m`;
}
const green = (s: string) => color(s, 32);
const red = (s: string) => color(s, 31);
const dim = (s: string) => color(s, 2);

async function cleanup(): Promise<void> {
  const rooms = await prisma.room.findMany({
    where: { code: { startsWith: ROOM_PREFIX } },
    select: { id: true, code: true },
  });
  for (const r of rooms) {
    await prisma.room.delete({ where: { id: r.id } });
    console.log(dim(`  cleanup: deleted room ${r.code}`));
  }
}

async function setupGame(): Promise<{ gameId: string; roomId: string; code: string }> {
  // Code unique : 6 chars total dont 6-char prefix puis suffix random.
  // Schéma exige 6 chars exactement (cf. createRoom). On utilise notre prefix
  // 6-char et c'est suffisant pour le test (la cleanup match sur startsWith).
  const code = ROOM_PREFIX;
  const room = await prisma.room.create({
    data: {
      code,
      creatorToken: `creator-${Date.now()}`,
      gameType: 'beat-eikichi',
      players: {
        create: [
          { name: 'P1', token: `p1-${Date.now()}`, avatar: '🐱' },
          { name: 'P2', token: `p2-${Date.now()}`, avatar: '🐶' },
        ],
      },
    },
    include: { players: true },
  });

  // Questions factices : 5 entrées suffisent pour tester l'avancement.
  const fakeQuestions = Array.from({ length: 5 }, (_, i) => ({
    position: i,
    gameId: `fake-${i}`,
    name: `FakeGame${i}`,
    aliases: [],
    imageUrl: 'https://example.com/x.png',
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
      questionStartedAt: new Date(Date.now() - 60_000),
      timerSeconds: 30,
      mode: 'normal',
      playerStates: {
        create: room.players.map((p) => ({
          playerId: p.id,
          weaponId: null,
          weaponUsesLeft: 0,
          lastUsedQuestionIndex: -1,
        })),
      },
    },
  });

  return { gameId: game.id, roomId: room.id, code };
}

async function runScenario(
  label: string,
  expectedFinalIndex: number,
  parallelExpected: number,
): Promise<boolean> {
  console.log(`\n${dim('▸')} ${label}`);
  await cleanup();
  const { gameId, roomId } = await setupGame();

  // Lance K appels en parallèle. Tous attendent expectedIndex=0.
  // L'atomicité du gate doit garantir qu'UN SEUL gagne.
  const results = await Promise.all(
    Array.from({ length: parallelExpected }, () =>
      advanceQuestionIfMatches(gameId, 0),
    ),
  );

  const wonCount = results.filter((r) => r === true).length;
  const lostCount = results.filter((r) => r === false).length;

  const game = await prisma.beatEikichiGame.findUnique({
    where: { id: gameId },
    select: { currentIndex: true },
  });
  const finalIndex = game?.currentIndex ?? -1;

  console.log(
    `  ${parallelExpected} appels parallèles → ${green(`${wonCount} OK`)} / ${dim(`${lostCount} skipped`)}`,
  );
  console.log(
    `  currentIndex final = ${finalIndex} ${dim(`(attendu: ${expectedFinalIndex})`)}`,
  );

  // Cleanup la room créée pour ce scénario.
  await prisma.room.delete({ where: { id: roomId } });

  const ok = wonCount === 1 && lostCount === parallelExpected - 1 && finalIndex === expectedFinalIndex;
  console.log(`  ${ok ? green('✓ PASS') : red('✗ FAIL')}`);
  return ok;
}

async function runWrongIndexScenario(): Promise<boolean> {
  // Vérifie qu'un appel avec un mauvais expectedIndex est REJETÉ atomiquement.
  console.log(`\n${dim('▸')} Mauvais expectedIndex rejeté`);
  await cleanup();
  const { gameId, roomId } = await setupGame();

  // Avance d'abord à 1.
  const r1 = await advanceQuestionIfMatches(gameId, 0);
  // Puis tente à nouveau avec expectedIndex=0 (stale).
  const r2 = await advanceQuestionIfMatches(gameId, 0);

  const game = await prisma.beatEikichiGame.findUnique({
    where: { id: gameId },
    select: { currentIndex: true },
  });
  const ok = r1 === true && r2 === false && game?.currentIndex === 1;

  console.log(`  premier appel (expected=0): ${r1 ? green('OK') : red('FAIL')}`);
  console.log(`  appel stale (expected=0):    ${r2 === false ? green('rejeté') : red('PASSÉ — bug')}`);
  console.log(`  currentIndex final = ${game?.currentIndex} ${dim('(attendu: 1)')}`);

  await prisma.room.delete({ where: { id: roomId } });
  console.log(`  ${ok ? green('✓ PASS') : red('✗ FAIL')}`);
  return ok;
}

async function runEndOfGameScenario(): Promise<boolean> {
  // Vérifie qu'à la dernière question, on bascule en review_intro
  // atomiquement et qu'un 2e appel concurrent ne re-bascule pas.
  console.log(`\n${dim('▸')} Fin de partie atomique (transition review_intro)`);
  await cleanup();
  const { gameId, roomId } = await setupGame();

  // Forcer currentIndex à QUESTIONS_PER_GAME - 1 = 19 (mais on a snapshot à 5
  // questions factices, donc on triche en mettant à 19 directement).
  await prisma.beatEikichiGame.update({
    where: { id: gameId },
    data: { currentIndex: 19 },
  });

  const results = await Promise.all([
    advanceQuestionIfMatches(gameId, 19),
    advanceQuestionIfMatches(gameId, 19),
    advanceQuestionIfMatches(gameId, 19),
  ]);
  const wonCount = results.filter(Boolean).length;

  const game = await prisma.beatEikichiGame.findUnique({
    where: { id: gameId },
    select: { phase: true, currentIndex: true },
  });

  const ok = wonCount === 1 && game?.phase === 'review_intro' && game?.currentIndex === 0;
  console.log(`  appels parallèles à expected=19 → ${wonCount} won, ${results.length - wonCount} skipped`);
  console.log(`  phase finale = ${game?.phase} ${dim('(attendu: review_intro)')}`);
  console.log(`  currentIndex = ${game?.currentIndex} ${dim('(attendu: 0)')}`);

  await prisma.room.delete({ where: { id: roomId } });
  console.log(`  ${ok ? green('✓ PASS') : red('✗ FAIL')}`);
  return ok;
}

async function main() {
  console.log('=== Test de concurrence advanceQuestionIfMatches ===');

  let allPass = true;

  // Scénario 1 : 2 appels parallèles, doit avancer d'EXACTEMENT 1.
  allPass = (await runScenario('2 appels parallèles', 1, 2)) && allPass;

  // Scénario 2 : 8 appels parallèles, idem.
  allPass = (await runScenario('8 appels parallèles', 1, 8)) && allPass;

  // Scénario 3 : appel avec expectedIndex stale doit être rejeté.
  allPass = (await runWrongIndexScenario()) && allPass;

  // Scénario 4 : transition fin de partie atomique.
  allPass = (await runEndOfGameScenario()) && allPass;

  await cleanup();

  console.log(`\n=== Résumé ===`);
  if (allPass) {
    console.log(green('Tous les scénarios PASSENT — pas de race possible.'));
    process.exit(0);
  } else {
    console.log(red('Au moins un scénario a ÉCHOUÉ — race condition encore présente.'));
    process.exit(1);
  }
}

main()
  .catch(async (e) => {
    console.error(red('Erreur :'), e);
    await cleanup().catch(() => {});
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
