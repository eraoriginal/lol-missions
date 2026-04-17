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
 * Tokenise une chaîne en mots normalisés :
 * - lowercase
 * - suppression des diacritiques
 * - suppression du « the » en préfixe
 * - split sur tout ce qui n'est pas alphanumérique
 * - chiffres romains convertis en arabes
 */
export function tokenize(input: string): string[] {
  if (!input) return [];
  let s = input.toLowerCase().trim();
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
 * Vérifie si `input` est une réponse acceptable pour `name` ou une de ses `aliases`.
 * Match STRICT après normalisation (casse, accents, ponctuation, « the » initial,
 * chiffres romains ↔ arabes). Pas de tolérance aux fautes de frappe pour éviter
 * les faux positifs entre des jeux similaires (ex. "Halo 2" vs "Halo 3",
 * distance Levenshtein = 1).
 */
export function isAcceptedAnswer(
  input: string,
  name: string,
  aliases: string[] = [],
): boolean {
  const normalizedInput = normalize(input);
  if (!normalizedInput) return false;

  const targets = [name, ...aliases].filter(Boolean);

  for (const target of targets) {
    const normalizedTarget = normalize(target);
    if (!normalizedTarget) continue;

    if (normalizedInput === normalizedTarget) {
      return true;
    }
  }

  return false;
}

/**
 * Calcule un niveau de proximité "close / medium / far" entre une réponse donnée
 * et la liste des cibles (name + aliases). Utilisé uniquement pour le feedback
 * visuel après une mauvaise réponse — n'impacte pas la validation.
 *
 * Critères (meilleur des cibles testées) :
 *   - close  : Levenshtein ratio ≤ 0.25, OU franchise partagée (premier token
 *              signifiant identique + les deux titres ont plusieurs tokens),
 *              OU l'un est préfixe de l'autre (longueur ≥ 4)
 *   - medium : Levenshtein ratio ≤ 0.55, OU au moins un token signifiant commun
 *   - far    : sinon
 */
export function computeCloseness(
  input: string,
  name: string,
  aliases: string[] = [],
): 'close' | 'medium' | 'far' {
  const normalizedInput = normalize(input);
  const inputTokens = meaningfulTokens(input);
  if (!normalizedInput) return 'far';

  const targets = [name, ...aliases].filter(Boolean);

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
