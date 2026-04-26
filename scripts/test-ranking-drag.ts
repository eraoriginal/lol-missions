/**
 * Tests unitaires des helpers `lib/quizCeo/rankingDrag.ts` (logique drag &
 * drop des questions ranking du Quiz CEO).
 *
 * Lancer : `npx tsx scripts/test-ranking-drag.ts`
 *
 * Couvre :
 *   - computeRankingOffset : décalages translateY pendant le drag
 *   - computeRankingHoverIndex : détection cursor Y → index logique (test
 *     spécifique du fix anti-tremblement : le résultat NE DÉPEND PAS des
 *     translateY appliqués aux rows, donc pas de feedback loop)
 *   - applyRankingDrop : commit du nouvel ordre
 */

import {
  applyRankingDrop,
  computeRankingHoverIndex,
  computeRankingOffset,
} from '../lib/quizCeo/rankingDrag';

interface TestCase {
  label: string;
  actual: unknown;
  expected: unknown;
}

const ROW = 60;
const cases: TestCase[] = [];
const t = (label: string, actual: unknown, expected: unknown): void => {
  cases.push({ label, actual, expected });
};

// ═══════════════════════════════════════════════════════════════════════════
// computeRankingOffset
// ═══════════════════════════════════════════════════════════════════════════

// Pas de drag actif → tous les items à 0
t('no drag → 0', computeRankingOffset(0, -1, -1, ROW, false), 0);
t('no drag, item 3 → 0', computeRankingOffset(3, -1, -1, ROW, false), 0);

// Item draggé lui-même → 0 (le ghost suit la souris)
t('dragged item → 0', computeRankingOffset(2, 2, 5, ROW, true), 0);
t('dragged item upward → 0', computeRankingOffset(4, 4, 1, ROW, true), 0);

// ----- Drag vers le bas (from < over) → items dans (from, over] remontent -----
// Exemple : drag B (idx=1) sur D (idx=3) dans [A,B,C,D,E]
t('drag down: A (idx 0) → 0', computeRankingOffset(0, 1, 3, ROW, false), 0);
t('drag down: C (idx 2) remonte', computeRankingOffset(2, 1, 3, ROW, false), -ROW);
t('drag down: D (idx 3) remonte', computeRankingOffset(3, 1, 3, ROW, false), -ROW);
t('drag down: E (idx 4) → 0', computeRankingOffset(4, 1, 3, ROW, false), 0);

// Cas extrême : drag du 1er au dernier
t('drag down full: idx 0 itself', computeRankingOffset(0, 0, 4, ROW, true), 0);
t('drag down full: idx 1', computeRankingOffset(1, 0, 4, ROW, false), -ROW);
t('drag down full: idx 4', computeRankingOffset(4, 0, 4, ROW, false), -ROW);

// ----- Drag vers le haut (from > over) → items dans [over, from) descendent -----
// Exemple : drag E (idx=4) sur B (idx=1) dans [A,B,C,D,E]
t('drag up: A (idx 0) → 0', computeRankingOffset(0, 4, 1, ROW, false), 0);
t('drag up: B (idx 1) descend', computeRankingOffset(1, 4, 1, ROW, false), ROW);
t('drag up: C (idx 2) descend', computeRankingOffset(2, 4, 1, ROW, false), ROW);
t('drag up: D (idx 3) descend', computeRankingOffset(3, 4, 1, ROW, false), ROW);

// Drag sur soi-même (from == over) → tous à 0
t('hover on self: idx 0', computeRankingOffset(0, 2, 2, ROW, false), 0);
t('hover on self: idx 3', computeRankingOffset(3, 2, 2, ROW, false), 0);
t('hover on self: dragged', computeRankingOffset(2, 2, 2, ROW, true), 0);

// ═══════════════════════════════════════════════════════════════════════════
// computeRankingHoverIndex
// ═══════════════════════════════════════════════════════════════════════════

// Container top à 100, rows de 60px, 5 items donc Y ∈ [100, 400[
t('cursor au top exact', computeRankingHoverIndex(100, 100, ROW, 5), 0);
t('cursor mid row 0', computeRankingHoverIndex(130, 100, ROW, 5), 0);
t('cursor mid row 1', computeRankingHoverIndex(190, 100, ROW, 5), 1);
t('cursor mid row 2', computeRankingHoverIndex(250, 100, ROW, 5), 2);
t('cursor mid row 3', computeRankingHoverIndex(310, 100, ROW, 5), 3);
t('cursor mid row 4', computeRankingHoverIndex(370, 100, ROW, 5), 4);

// Cursor au-dessus du container → idx 0 (clamp)
t('cursor above container', computeRankingHoverIndex(50, 100, ROW, 5), 0);
t('cursor far above', computeRankingHoverIndex(-200, 100, ROW, 5), 0);

// Cursor sous le dernier row → idx (length - 1) (clamp)
t('cursor below last row', computeRankingHoverIndex(500, 100, ROW, 5), 4);
t('cursor far below', computeRankingHoverIndex(9999, 100, ROW, 5), 4);

// Edge cases : params invalides
t('rowHeight = 0 → null', computeRankingHoverIndex(100, 0, 0, 5), null);
t('orderLength = 0 → null', computeRankingHoverIndex(100, 0, ROW, 0), null);

// ----- Test spécifique anti-tremblement -----
// Le calcul dépend UNIQUEMENT de containerTop et rowHeight (constants pendant
// le drag). Si les rows enfants ont des translateY appliqués (qui modifient
// LEUR rect.top mais PAS celui du container), l'index reste stable pour un
// même cursor Y. C'est ce qui élimine le feedback loop.
const containerTopStable = 100;
const cursorY = 250; // milieu du row 2
const idx1 = computeRankingHoverIndex(cursorY, containerTopStable, ROW, 5);
// Maintenant simulons : les enfants ont shifté (translateY appliqué) mais le
// container est inchangé. On rappelle avec exactement les mêmes paramètres.
const idx2 = computeRankingHoverIndex(cursorY, containerTopStable, ROW, 5);
t('anti-tremble: stable index after rows shift', idx1, idx2);
t('anti-tremble: idx = 2', idx1, 2);

// ═══════════════════════════════════════════════════════════════════════════
// applyRankingDrop
// ═══════════════════════════════════════════════════════════════════════════

// Drag vers le bas
t(
  'drop down: B sur D dans [A,B,C,D,E]',
  applyRankingDrop(['A', 'B', 'C', 'D', 'E'], 'B', 'D'),
  ['A', 'C', 'D', 'B', 'E'],
);

// Drag vers le haut
t(
  'drop up: E sur B dans [A,B,C,D,E]',
  applyRankingDrop(['A', 'B', 'C', 'D', 'E'], 'E', 'B'),
  ['A', 'E', 'B', 'C', 'D'],
);

// Drop sur soi-même → ordre inchangé (mais nouvelle copie de tableau)
t(
  'drop on self: ordre inchangé',
  applyRankingDrop(['A', 'B', 'C'], 'B', 'B'),
  ['A', 'B', 'C'],
);

// IDs invalides → ordre inchangé
t(
  'unknown draggingId',
  applyRankingDrop(['A', 'B', 'C'], 'X', 'B'),
  ['A', 'B', 'C'],
);
t(
  'unknown targetId',
  applyRankingDrop(['A', 'B', 'C'], 'A', 'X'),
  ['A', 'B', 'C'],
);

// 1er → dernier
t(
  'drop A sur C dans [A,B,C]',
  applyRankingDrop(['A', 'B', 'C'], 'A', 'C'),
  ['B', 'C', 'A'],
);

// dernier → 1er
t(
  'drop C sur A dans [A,B,C]',
  applyRankingDrop(['A', 'B', 'C'], 'C', 'A'),
  ['C', 'A', 'B'],
);

// ═══════════════════════════════════════════════════════════════════════════
// Reporting
// ═══════════════════════════════════════════════════════════════════════════

let pass = 0;
let fail = 0;
for (const c of cases) {
  const ok = JSON.stringify(c.actual) === JSON.stringify(c.expected);
  if (ok) {
    pass++;
  } else {
    fail++;
    console.error(
      `✗ ${c.label}\n    expected: ${JSON.stringify(c.expected)}\n    actual:   ${JSON.stringify(c.actual)}`,
    );
  }
}

console.log(`\n${pass} passed · ${fail} failed · ${cases.length} total`);
process.exit(fail > 0 ? 1 : 0);
