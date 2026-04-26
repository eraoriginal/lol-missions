// Table de conversion chiffres romains <-> arabes (jusqu'à 20, suffisant pour les titres de jeux).
const ROMAN_TO_ARABIC: Record<string, string> = {
  i: '1',
  ii: '2',
  iii: '3',
  iv: '4',
  v: '5',
  vi: '6',
  vii: '7',
  viii: '8',
  ix: '9',
  x: '10',
  xi: '11',
  xii: '12',
  xiii: '13',
  xiv: '14',
  xv: '15',
  xvi: '16',
  xvii: '17',
  xviii: '18',
  xix: '19',
  xx: '20',
};

/**
 * Lookalikes Cyrillique → Latin. Certains noms issus de RAWG contiennent des
 * caractères cyrilliques visuellement IDENTIQUES à des lettres latines (ex.
 * "Observеr" où le « е » est U+0435 et non U+0065). Sans substitution, le
 * tokenizer les traite comme des séparateurs et l'utilisateur qui tape le
 * nom en latin ne peut jamais valider.
 */
const CYRILLIC_LOOKALIKE_TO_LATIN: Record<string, string> = {
  '\u0430': 'a', // а
  '\u0435': 'e', // е
  '\u043E': 'o', // о
  '\u0440': 'p', // р
  '\u0441': 'c', // с
  '\u0445': 'x', // х
  '\u0443': 'y', // у
  '\u0456': 'i', // і
  '\u0458': 'j', // ј
  '\u0455': 's', // ѕ
  '\u0410': 'a', // А
  '\u0412': 'b', // В
  '\u0415': 'e', // Е
  '\u041A': 'k', // К
  '\u041C': 'm', // М
  '\u041D': 'h', // Н
  '\u041E': 'o', // О
  '\u0420': 'p', // Р
  '\u0421': 'c', // С
  '\u0422': 't', // Т
  '\u0423': 'y', // У
  '\u0425': 'x', // Х
};

/**
 * Applique les substitutions pré-normalisation :
 *   - « & » → « and » (« Mount & Blade » et « Mount and Blade » doivent matcher)
 *   - lookalikes cyrilliques → latins (cf. CYRILLIC_LOOKALIKE_TO_LATIN)
 */
function preNormalize(input: string): string {
  const s = input.replace(/&/g, ' and ');
  // Substitution caractère par caractère : pas de regex (pour performance et
  // lisibilité). Le mapping ne couvre que les lookalikes — les autres caractères
  // non-ASCII sont laissés au tokenizer qui les traite comme séparateurs.
  let out = '';
  for (const ch of s) {
    out += CYRILLIC_LOOKALIKE_TO_LATIN[ch] ?? ch;
  }
  return out;
}

/**
 * Tokenise une chaîne en mots normalisés :
 * - lowercase
 * - suppression des diacritiques
 * - suppression du « the » en préfixe
 * - split sur tout ce qui n'est pas alphanumérique
 * - chiffres romains convertis en arabes
 *
 * Le catalogue est volontairement filtré aux entrées en alphabet latin : les
 * aliases japonais/chinois/etc. sont supprimés (voir `scripts/cleanupNonLatinAliases.ts`
 * et le seed `seed-beat-eikichi.ts`) pour que tokenize n'ait rien à produire
 * sur ces chaînes.
 */
export function tokenize(input: string): string[] {
  if (!input) return [];
  let s = preNormalize(input).toLowerCase().trim();
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  s = s.replace(/^the\s+/, '');
  const tokens = s.split(/[^a-z0-9]+/).filter(Boolean);
  return tokens.map((t) => ROMAN_TO_ARABIC[t] ?? t);
}

/**
 * Normalise une chaîne pour le matching fuzzy :
 * - lowercase
 * - suppression des diacritiques (accents)
 * - suppression du « the » en préfixe
 * - remplacement des chiffres romains isolés par leur équivalent arabe
 * - suppression de toute ponctuation / espace
 */
export function normalize(input: string): string {
  return tokenize(input).join('');
}

/**
 * Stop-words ignorés dans les comparaisons par token — trop communs pour signifier
 * une vraie proximité.
 */
export const STOP_WORDS = new Set([
  'a', 'an', 'the', 'of', 'and', 'or', 'to', 'in', 'on', 'at', 'for',
  'de', 'la', 'le', 'les', 'du', 'des', 'et', 'un', 'une',
]);

/**
 * Tokens "signifiants" : tokens de longueur ≥ 3, hors stop-words.
 */
export function meaningfulTokens(input: string): string[] {
  return tokenize(input).filter((t) => t.length >= 3 && !STOP_WORDS.has(t));
}

/**
 * Distance de Levenshtein (implémentation compacte, complexité O(n*m)).
 */
export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const m = a.length;
  const n = b.length;
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);

  for (let j = 0; j <= n; j++) prev[j] = j;

  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1] + 1, // insertion
        prev[j] + 1, // suppression
        prev[j - 1] + cost, // substitution
      );
    }
    [prev, curr] = [curr, prev];
  }

  return prev[n];
}

/**
 * Retire les suffixes d'édition/remaster des titres (ex. « Crysis 2 - Maximum
 * Edition » → « Crysis 2 »). Appliqué en plus du nom canonique pour accepter
 * la forme « sans édition » comme alias implicite : une édition remasterisée
 * ou definitive EST le même jeu, l'utilisateur ne devrait pas avoir à taper le
 * suffixe. On ne touche PAS aux sous-titres de vrais sequels (« Tomb Raider:
 * Anniversary » reste intact car « Anniversary » seul n'est pas un mot-clé
 * d'édition).
 */
const EDITION_WORDS =
  'maximum|definitive|complete|enhanced|collector\'?s?|goty|game of the year|anniversary|deluxe|gold|hd|legendary|ultimate|special|standard';
const EDITION_SUFFIX_PATTERNS = [
  // " - Maximum Edition", ": Definitive Edition", " (GOTY Edition)" et tout ce qui suit
  new RegExp(`\\s*[-:–—(,]\\s*(?:${EDITION_WORDS})\\s+edition\\b.*$`, 'i'),
  // " Maximum Edition" sans séparateur (ex. "Gothic II: Gold Edition" → après le :)
  new RegExp(`\\s+(?:${EDITION_WORDS})\\s+edition\\b.*$`, 'i'),
  // " Remastered", ": Remastered", " - Remastered", "HD Remaster"
  /\s*[-:–—(,]?\s*(?:hd\s+)?remaster(?:ed)?\b.*$/i,
];

function stripEditionSuffix(name: string): string {
  for (const re of EDITION_SUFFIX_PATTERNS) {
    const replaced = name.replace(re, '').trim();
    if (replaced && replaced !== name) return replaced;
  }
  return name;
}

/**
 * Vérifie si `input` est une réponse acceptable pour `name`.
 *
 * **Seul le nom canonique est source de vérité.** Les aliases ne sont plus
 * pris en compte (décision produit suite à des faux positifs : un alias trop
 * permissif validait des réponses qui n'étaient pas le bon jeu).
 *
 * Match STRICT après normalisation (casse, accents, ponctuation, « the » initial,
 * chiffres romains ↔ arabes, « & » ↔ « and », lookalikes cyrilliques → latin,
 * et suffixes d'édition optionnels). Pas de tolérance aux fautes de frappe pour
 * éviter les faux positifs entre des jeux similaires (ex. "Halo 2" vs "Halo 3",
 * distance Levenshtein = 1).
 *
 * Le 3e paramètre `_aliases` est conservé pour rétrocompatibilité de la
 * signature avec les tests / appelants existants, mais il est **ignoré**.
 */
export function isAcceptedAnswer(
  input: string,
  name: string,
  _aliases: string[] = [],
): boolean {
  void _aliases;
  const normalizedInput = normalize(input);
  if (!normalizedInput) return false;

  const normalizedTarget = normalize(name);
  if (!normalizedTarget) return false;

  if (normalizedInput === normalizedTarget) {
    return true;
  }

  // Fallback : accepte aussi la version sans suffixe d'édition.
  // Ex. « Crysis 2 » accepté quand le nom canonique est « Crysis 2 - Maximum Edition ».
  const stripped = stripEditionSuffix(name);
  if (stripped !== name) {
    const normalizedStripped = normalize(stripped);
    if (normalizedStripped && normalizedInput === normalizedStripped) {
      return true;
    }
  }

  return false;
}

/**
 * Calcule un niveau de proximité "close / medium / far" entre une réponse donnée
 * et le nom canonique. Utilisé uniquement pour le feedback visuel après une
 * mauvaise réponse — n'impacte pas la validation.
 *
 * Le 3e paramètre `_aliases` est conservé pour rétrocompatibilité mais
 * **ignoré** (depuis que la validation ne se base plus que sur `name`).
 *
 * Critères :
 *   - close  : Levenshtein ratio ≤ 0.25, OU franchise partagée (premier token
 *              signifiant identique + les deux titres ont plusieurs tokens),
 *              OU l'un est préfixe de l'autre (longueur ≥ 4)
 *   - medium : Levenshtein ratio ≤ 0.55, OU au moins un token signifiant commun
 *   - far    : sinon
 */
export function computeCloseness(
  input: string,
  name: string,
  _aliases: string[] = [],
): 'close' | 'medium' | 'far' {
  void _aliases;
  const normalizedInput = normalize(input);
  const inputTokens = meaningfulTokens(input);
  if (!normalizedInput) return 'far';

  const targets = [name].filter(Boolean);

  let bestLevRatio = 1;
  let franchiseMatch = false;
  let prefixMatch = false;
  let sharedToken = false;

  for (const target of targets) {
    const normalizedTarget = normalize(target);
    if (!normalizedTarget) continue;

    // Levenshtein relative
    const maxLen = Math.max(normalizedInput.length, normalizedTarget.length);
    if (maxLen > 0) {
      const ratio = levenshtein(normalizedInput, normalizedTarget) / maxLen;
      if (ratio < bestLevRatio) bestLevRatio = ratio;
    }

    // Franchise : même premier token signifiant + au moins un autre token de chaque
    // côté (ex: "Styx: A" vs "Styx: B" = franchise commune).
    const targetTokens = meaningfulTokens(target);
    if (
      inputTokens.length >= 2 &&
      targetTokens.length >= 2 &&
      inputTokens[0] === targetTokens[0]
    ) {
      franchiseMatch = true;
    }

    // Préfixe (l'un contient le début de l'autre), plus court ≥ 4 chars
    // Couvre "Halo" vs "Halo 3", "BioShock" vs "BioShock Infinite".
    if (
      normalizedInput.length >= 4 &&
      normalizedTarget.startsWith(normalizedInput)
    ) {
      prefixMatch = true;
    } else if (
      normalizedTarget.length >= 4 &&
      normalizedInput.startsWith(normalizedTarget)
    ) {
      prefixMatch = true;
    }

    // Token signifiant commun (≥ 3 chars, non stop-word)
    if (inputTokens.some((t) => targetTokens.includes(t))) {
      sharedToken = true;
    }
  }

  if (bestLevRatio < 0.25) return 'close';
  if (franchiseMatch) return 'close';
  if (prefixMatch) return 'close';
  if (bestLevRatio < 0.55) return 'medium';
  if (sharedToken) return 'medium';
  return 'far';
}
