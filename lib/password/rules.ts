/**
 * Catalogue de règles pour le jeu Password.
 *
 * Chaque jour, 20 règles sont tirées au hasard (seededShuffle) depuis ce pool
 * et présentées au joueur dans cet ordre. Toutes les règles sont évaluées
 * client-side à partir du mot de passe + d'un contexte journalier.
 *
 * Pour que le jeu reste jouable, on s'assure :
 *   - qu'il existe une solution simultanée (règles non-contradictoires entre elles).
 *   - qu'aucune règle ne dépende d'un service externe.
 */

export interface DailyContext {
  dayOfMonth: number;   // 1..31
  monthIndex: number;   // 0..11
  weekdayFr: string;    // "lundi", "mardi"…
  dateKey: string;      // "YYYY-MM-DD"
}

export interface PasswordRule {
  id: string;
  text: string; // affiché au joueur
  check: (pwd: string, ctx: DailyContext) => boolean;
}

const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
];
const WEEKDAYS_FR = [
  'dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi',
];

const COUNTRIES = [
  'france', 'italie', 'espagne', 'allemagne', 'japon', 'brésil', 'bresil',
  'canada', 'mexique', 'russie', 'chine', 'inde', 'maroc', 'portugal',
  'belgique', 'suisse', 'grèce', 'grece', 'cuba',
];
const COLORS = [
  'rouge', 'bleu', 'vert', 'jaune', 'violet', 'orange', 'noir', 'blanc',
  'rose', 'gris', 'marron', 'doré', 'dore',
];
const ANIMALS = [
  'chien', 'chat', 'lion', 'tigre', 'loup', 'ours', 'renard', 'cheval',
  'poisson', 'pigeon', 'aigle', 'souris', 'lapin', 'cerf', 'rat', 'oie',
];
const CHEM_ELEMENTS = [
  'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
  'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca',
  'Fe', 'Cu', 'Zn', 'Ag', 'Au', 'Hg', 'Pb', 'U',
];

function hasAny(pwd: string, list: string[], caseSensitive = false): boolean {
  const hay = caseSensitive ? pwd : pwd.toLowerCase();
  return list.some((w) => hay.includes(caseSensitive ? w : w.toLowerCase()));
}

function digitsOf(pwd: string): number[] {
  return (pwd.match(/\d/g) ?? []).map((d) => parseInt(d, 10));
}

function isPrime(n: number): boolean {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i * i <= n; i += 2) if (n % i === 0) return false;
  return true;
}

export const RULES: PasswordRule[] = [
  {
    id: 'min-5',
    text: 'Ton mot de passe doit contenir au moins 5 caractères.',
    check: (p) => p.length >= 5,
  },
  {
    id: 'has-digit',
    text: 'Ton mot de passe doit contenir au moins un chiffre.',
    check: (p) => /\d/.test(p),
  },
  {
    id: 'has-upper',
    text: 'Ton mot de passe doit contenir au moins une majuscule.',
    check: (p) => /[A-Z]/.test(p),
  },
  {
    id: 'has-lower',
    text: 'Ton mot de passe doit contenir au moins une minuscule.',
    check: (p) => /[a-z]/.test(p),
  },
  {
    id: 'has-special',
    text: 'Ton mot de passe doit contenir un caractère spécial parmi ! @ # $ % ^ & * .',
    check: (p) => /[!@#$%^&*]/.test(p),
  },
  {
    id: 'sum-digits-25',
    text: 'Les chiffres de ton mot de passe doivent totaliser exactement 25.',
    check: (p) => digitsOf(p).reduce((a, b) => a + b, 0) === 25,
  },
  {
    id: 'has-month',
    text: 'Ton mot de passe doit contenir le nom d\'un mois en français (janvier, février…).',
    check: (p) => hasAny(p, MONTHS_FR),
  },
  {
    id: 'has-country',
    text: 'Ton mot de passe doit contenir le nom d\'un pays.',
    check: (p) => hasAny(p, COUNTRIES),
  },
  {
    id: 'has-day-of-month',
    text: 'Ton mot de passe doit contenir le jour du mois en chiffres (aujourd\'hui).',
    check: (p, ctx) => p.includes(String(ctx.dayOfMonth)),
  },
  {
    id: 'has-roman',
    text: 'Ton mot de passe doit contenir un chiffre romain (I, V, X, L, C, D ou M).',
    check: (p) => /[IVXLCDM]/.test(p),
  },
  {
    id: 'has-color',
    text: 'Ton mot de passe doit contenir le nom d\'une couleur.',
    check: (p) => hasAny(p, COLORS),
  },
  {
    id: 'has-animal',
    text: 'Ton mot de passe doit contenir le nom d\'un animal.',
    check: (p) => hasAny(p, ANIMALS),
  },
  {
    id: 'has-chem',
    text: 'Ton mot de passe doit contenir le symbole d\'un élément chimique (H, Fe, Au, Ag…).',
    check: (p) => hasAny(p, CHEM_ELEMENTS, true),
  },
  {
    id: 'has-ceo',
    text: 'Ton mot de passe doit contenir le mot "ceo".',
    check: (p) => /ceo/i.test(p),
  },
  {
    id: 'len-multiple-3',
    text: 'La longueur de ton mot de passe doit être un multiple de 3.',
    check: (p) => p.length > 0 && p.length % 3 === 0,
  },
  {
    id: 'starts-letter',
    text: 'Ton mot de passe doit commencer par une lettre.',
    check: (p) => /^[A-Za-zÀ-ÿ]/.test(p),
  },
  {
    id: 'has-42',
    text: 'Ton mot de passe doit contenir le nombre 42.',
    check: (p) => p.includes('42'),
  },
  {
    id: 'no-double-letters',
    text: 'Ton mot de passe ne doit pas contenir deux lettres identiques collées (ex : "oo").',
    check: (p) => !/([A-Za-zÀ-ÿ])\1/.test(p),
  },
  {
    id: 'three-vowels',
    text: 'Ton mot de passe doit contenir au moins 3 voyelles (a, e, i, o, u, y).',
    check: (p) => (p.match(/[aeiouyAEIOUY]/g) ?? []).length >= 3,
  },
  {
    id: 'len-prime',
    text: 'La longueur de ton mot de passe doit être un nombre premier.',
    check: (p) => isPrime(p.length),
  },
  {
    id: 'has-weekday',
    text: 'Ton mot de passe doit contenir le jour de la semaine d\'aujourd\'hui.',
    check: (p, ctx) => p.toLowerCase().includes(ctx.weekdayFr),
  },
  {
    id: 'max-24',
    text: 'Ton mot de passe ne doit pas dépasser 24 caractères.',
    check: (p) => p.length <= 24,
  },
  {
    id: 'sum-digits-even',
    text: 'La somme des chiffres de ton mot de passe doit être paire.',
    check: (p) => {
      const ds = digitsOf(p);
      if (ds.length === 0) return false;
      return ds.reduce((a, b) => a + b, 0) % 2 === 0;
    },
  },
  {
    id: 'has-prime-digit',
    text: 'Ton mot de passe doit contenir un chiffre premier (2, 3, 5 ou 7).',
    check: (p) => /[2357]/.test(p),
  },
  {
    id: 'min-letters-5',
    text: 'Ton mot de passe doit contenir au moins 5 lettres.',
    check: (p) => (p.match(/[A-Za-zÀ-ÿ]/g) ?? []).length >= 5,
  },
];

export function buildDailyContext(date: Date = new Date()): DailyContext {
  const dayOfMonth = date.getUTCDate();
  const monthIndex = date.getUTCMonth();
  const weekdayFr = WEEKDAYS_FR[date.getUTCDay()];
  const y = date.getUTCFullYear();
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(dayOfMonth).padStart(2, '0');
  return { dayOfMonth, monthIndex, weekdayFr, dateKey: `${y}-${m}-${d}` };
}
