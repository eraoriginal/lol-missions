/**
 * Script de test ad-hoc pour isAcceptedAnswer (validation stricte) et computeCloseness.
 * Lancement : npx tsx scripts/test-fuzzyMatch.ts
 */
import {
  isAcceptedAnswer,
  computeCloseness,
  normalize,
  tokenize,
} from '../lib/beatEikichi/fuzzyMatch';

interface AcceptCase {
  input: string;
  name: string;
  aliases?: string[];
  expected: boolean;
  label: string;
}

interface ClosenessCase {
  input: string;
  name: string;
  aliases?: string[];
  expected: 'close' | 'medium' | 'far';
  label: string;
}

const acceptCases: AcceptCase[] = [
  // Exact / case-insensitive
  { label: 'exact match', input: 'Halo', name: 'Halo', expected: true },
  { label: 'case diff', input: 'HALO', name: 'halo', expected: true },
  { label: 'lowercase vs titlecase', input: 'zelda', name: 'Zelda', expected: true },

  // Accents
  { label: 'accent é vs e', input: 'Pokemon', name: 'Pokémon', expected: true },
  { label: 'accent é vs e reverse', input: 'Pokémon', name: 'Pokemon', expected: true },

  // "The" en préfixe
  { label: 'with vs without "The"', input: 'Witcher 3', name: 'The Witcher 3', expected: true },
  { label: 'both have "The"', input: 'The Witcher 3', name: 'The Witcher 3', expected: true },
  // "the" est retiré seulement en préfixe, pas au milieu → "Legend of the Zelda" est une
  // faute de saisie qui doit légitimement être rejetée.
  { label: '"The" mal placé (milieu) rejeté', input: 'Legend of the Zelda', name: 'The Legend of Zelda', expected: false },

  // Chiffres romains
  { label: 'roman VII vs 7', input: 'Final Fantasy VII', name: 'Final Fantasy 7', expected: true },
  { label: '7 vs roman VII', input: 'Final Fantasy 7', name: 'Final Fantasy VII', expected: true },
  { label: 'GTA V vs GTA 5', input: 'GTA V', name: 'GTA 5', expected: true },
  { label: 'roman XIII', input: 'Final Fantasy XIII', name: 'Final Fantasy 13', expected: true },

  // Ponctuation / séparateurs
  { label: 'half-life vs half life', input: 'Half-Life 2', name: 'Half Life 2', expected: true },
  { label: 'half-life vs halflife', input: 'Half-Life 2', name: 'Halflife 2', expected: true },
  { label: 'apostrophe', input: "Assassin's Creed", name: 'Assassins Creed', expected: true },
  { label: 'colon', input: 'Metal Gear Solid: V', name: 'Metal Gear Solid 5', expected: true },

  // Aliases
  { label: 'matches alias', input: 'CoD MW', name: 'Call of Duty: Modern Warfare', aliases: ['CoD MW', 'MW'], expected: true },
  { label: 'matches alias with accents', input: 'pokemon rouge', name: 'Pokémon Red', aliases: ['Pokémon Rouge'], expected: true },

  // MISMATCHES ATTENDUS
  { label: 'Halo 2 != Halo 3', input: 'Halo 2', name: 'Halo 3', expected: false },
  { label: 'Halo != Halo 3', input: 'Halo', name: 'Halo 3', expected: false },
  { label: 'typo rejected (strict)', input: 'Haloo', name: 'Halo', expected: false },
  { label: 'empty input', input: '', name: 'Halo', expected: false },
  { label: 'whitespace only', input: '   ', name: 'Halo', expected: false },
  { label: 'completely different game', input: 'Tetris', name: 'Halo', expected: false },

  // Cas réels GIPHY-ish
  { label: 'minecraft exact', input: 'minecraft', name: 'Minecraft', expected: true },
  { label: 'mario kart with accent', input: 'Mario Kart 8 Deluxe', name: 'Mario Kart 8 Deluxe', expected: true },

  // Edge cases
  { label: 'input avec trailing space', input: 'Halo ', name: 'Halo', expected: true },
  { label: 'input avec leading space', input: ' Halo', name: 'Halo', expected: true },
  { label: 'name avec trailing space', input: 'Halo', name: 'Halo ', expected: true },
];

const closenessCases: ClosenessCase[] = [
  // Close
  { label: 'Halo 2 vs Halo 3 (lev 1 sur 5 ≈ 0.2, franchise)', input: 'Halo 2', name: 'Halo 3', expected: 'close' },
  { label: 'Halo prefix de Halo 3', input: 'Halo', name: 'Halo 3', expected: 'close' },
  { label: 'BioShock prefix', input: 'BioShock', name: 'BioShock Infinite', expected: 'close' },
  { label: 'typo léger', input: 'Witcher 3', name: 'The Witcher 3', expected: 'close' },

  // Medium
  { label: 'token commun (Zelda)', input: 'Zelda Wind Waker', name: 'The Legend of Zelda: Breath of the Wild', expected: 'medium' },

  // Far
  { label: 'complètement différent', input: 'Tetris', name: 'Halo 3', expected: 'far' },
];

function color(s: string, code: number): string {
  return `\x1b[${code}m${s}\x1b[0m`;
}
const green = (s: string) => color(s, 32);
const red = (s: string) => color(s, 31);
const yellow = (s: string) => color(s, 33);
const dim = (s: string) => color(s, 2);

let pass = 0;
let fail = 0;
const failures: string[] = [];

console.log('\n=== isAcceptedAnswer (validation stricte) ===\n');
for (const c of acceptCases) {
  const got = isAcceptedAnswer(c.input, c.name, c.aliases);
  if (got === c.expected) {
    console.log(`${green('✓')} ${c.label}  ${dim(`"${c.input}" vs "${c.name}" → ${got}`)}`);
    pass++;
  } else {
    console.log(
      `${red('✗')} ${c.label}  ${dim(`"${c.input}" vs "${c.name}"`)} — attendu ${yellow(String(c.expected))}, obtenu ${red(String(got))}`,
    );
    console.log(`     normalize(input)="${normalize(c.input)}" / normalize(name)="${normalize(c.name)}" / tokens=${JSON.stringify(tokenize(c.input))}`);
    failures.push(`isAcceptedAnswer ${c.label}`);
    fail++;
  }
}

console.log('\n=== computeCloseness (feedback proximité) ===\n');
for (const c of closenessCases) {
  const got = computeCloseness(c.input, c.name, c.aliases);
  if (got === c.expected) {
    console.log(`${green('✓')} ${c.label}  ${dim(`"${c.input}" vs "${c.name}" → ${got}`)}`);
    pass++;
  } else {
    console.log(
      `${red('✗')} ${c.label}  ${dim(`"${c.input}" vs "${c.name}"`)} — attendu ${yellow(c.expected)}, obtenu ${red(got)}`,
    );
    failures.push(`computeCloseness ${c.label}`);
    fail++;
  }
}

console.log(`\n=== Résumé ===`);
console.log(`${green(`${pass} OK`)}, ${fail > 0 ? red(`${fail} KO`) : green('0 KO')}`);
if (failures.length > 0) {
  console.log('\nKO :');
  failures.forEach((f) => console.log(`  - ${f}`));
  process.exit(1);
}
