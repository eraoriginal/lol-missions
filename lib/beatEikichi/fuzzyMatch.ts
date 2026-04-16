import { BEAT_EIKICHI_CONFIG } from './config';

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
 * Normalise une chaîne pour le matching fuzzy :
 * - lowercase
 * - suppression des diacritiques (accents)
 * - suppression du « the » en préfixe
 * - remplacement des chiffres romains isolés par leur équivalent arabe
 * - suppression de toute ponctuation / espace
 */
export function normalize(input: string): string {
  if (!input) return '';
  let s = input.toLowerCase().trim();

  // Suppression des diacritiques
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Retire « the » en préfixe (avec espace)
  s = s.replace(/^the\s+/, '');

  // Sépare en tokens alphanumériques pour détecter les chiffres romains isolés
  const tokens = s.split(/[^a-z0-9]+/).filter(Boolean);
  const converted = tokens.map((t) => ROMAN_TO_ARABIC[t] ?? t);
  return converted.join('');
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
 * Matche exactement ou avec une distance de Levenshtein tolérée, proportionnelle à la longueur.
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

    if (normalizedInput === normalizedTarget) return true;

    // Tolérance proportionnelle à la longueur de la cible, min 1.
    const maxDistance = Math.max(
      1,
      Math.floor(normalizedTarget.length * BEAT_EIKICHI_CONFIG.FUZZY_DISTANCE_RATIO),
    );

    if (levenshtein(normalizedInput, normalizedTarget) <= maxDistance) {
      return true;
    }
  }

  return false;
}
