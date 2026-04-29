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

  // Aliases — IGNORÉS depuis la refonte fuzzyMatch (CLAUDE.md : « Seul le nom
  // canonique fait foi »). Ces cas vérifient explicitement qu'un alias seul
  // ne valide PAS la réponse — bug produit historique : un alias permissif
  // validait des réponses qui n'étaient pas le bon jeu.
  { label: 'alias seul rejeté (CoD MW)', input: 'CoD MW', name: 'Call of Duty: Modern Warfare', aliases: ['CoD MW', 'MW'], expected: false },
  { label: 'alias accentué rejeté (pokemon rouge)', input: 'pokemon rouge', name: 'Pokémon Red', aliases: ['Pokémon Rouge'], expected: false },

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

  // & ↔ and
  { label: '& ↔ and (input and, target &)', input: 'Mount and Blade', name: 'Mount & Blade', expected: true },
  { label: '& ↔ and (input &, target and)', input: 'Mount & Blade', name: 'Mount and Blade', expected: true },
  { label: 'Ratchet and Clank', input: 'Ratchet and Clank', name: 'Ratchet & Clank', expected: true },
  // Le sous-titre « Dog Days » fait partie du nom canonique → la version sans
  // sous-titre n'est PAS acceptée (les sous-titres ne sont strippés que pour
  // les suffixes d'édition reconnus, pas pour les vrais sous-titres).
  { label: 'Kane and Lynch 2 sans sous-titre rejeté', input: 'Kane and Lynch 2', name: 'Kane & Lynch 2: Dog Days', aliases: ['Kane & Lynch 2'], expected: false },
  { label: 'Kane and Lynch 2 Dog Days OK', input: 'Kane and Lynch 2 Dog Days', name: 'Kane & Lynch 2: Dog Days', expected: true },

  // Lookalikes cyrilliques (RAWG stocke "Observеr" avec е cyrillique U+0435)
  { label: 'Observer latin vs cyrillique е', input: 'Observer', name: 'Observ\u0435r', expected: true },

  // Suffixes d'édition : accepte la version sans suffixe
  { label: 'Crysis 2 vs "- Maximum Edition"', input: 'Crysis 2', name: 'Crysis 2 - Maximum Edition', expected: true },
  { label: 'Crysis 2 full title', input: 'Crysis 2 Maximum Edition', name: 'Crysis 2 - Maximum Edition', expected: true },
  { label: 'Grim Fandango vs Remastered', input: 'Grim Fandango', name: 'Grim Fandango Remastered', expected: true },
  { label: 'God of War III vs Remastered', input: 'God of War III', name: 'God of War III Remastered', expected: true },
  { label: 'God of War 3 (roman → arabe) vs Remastered', input: 'God of War 3', name: 'God of War III Remastered', expected: true },
  { label: 'DuckTales (colon Remastered)', input: 'DuckTales', name: 'DuckTales: Remastered', aliases: ['DuckTales', 'Remastered'], expected: true },
  { label: 'Mafia Definitive Edition → Mafia', input: 'Mafia', name: 'Mafia: Definitive Edition', aliases: ['Mafia Remake', 'Mafia', 'Definitive Edition'], expected: true },
  { label: 'Tomb Raider Definitive Edition → Tomb Raider', input: 'Tomb Raider', name: 'Tomb Raider: Definitive Edition', aliases: ['Tomb Raider', 'Definitive Edition'], expected: true },

  // NE PAS stripper : "Anniversary" seul est un vrai sous-titre (distinct de "Anniversary Edition")
  { label: 'TR: Anniversary kept', input: 'Tomb Raider Anniversary', name: 'Tomb Raider: Anniversary', aliases: ['Tomb Raider', 'Anniversary'], expected: true },

  // Suffixe d'édition ne doit PAS accepter une franchise distincte
  { label: 'Crysis ≠ Crysis 2 - Maximum Edition', input: 'Crysis', name: 'Crysis 2 - Maximum Edition', expected: false },

  // Tomb Raider 2 / II — vérifie que les 2 écritures matchent et que "Tomb Raider" seul est rejeté
  { label: 'Tomb Raider 2 ↔ II', input: 'Tomb Raider 2', name: 'Tomb Raider II', expected: true },
  { label: 'Tomb Raider II ↔ 2', input: 'Tomb Raider II', name: 'Tomb Raider II', expected: true },
  { label: 'Tomb Raider seul ≠ Tomb Raider II', input: 'Tomb Raider', name: 'Tomb Raider II', expected: false },
  { label: 'Tomb Raider II ≠ Tomb Raider', input: 'Tomb Raider II', name: 'Tomb Raider', expected: false },
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
