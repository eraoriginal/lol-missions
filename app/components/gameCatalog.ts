/**
 * Catalogue des mini-jeux affichés sur la homepage.
 *
 * Extrait dans un module « neutre » (pas `'use client'`) pour que le
 * Server Component `app/page.tsx` puisse importer le tableau sans que
 * Next.js le transforme en référence client.
 *
 * Deux familles distinctes :
 *   - `mode: 'multi'` → jeu multi-joueurs en room (flow classique CreateRoom).
 *   - `mode: 'solo'`  → jeu solo quotidien accessible via /play/[slug].
 */
import { AC, type AcGlyphKind } from './arcane';

export type GameMode = 'multi' | 'solo';

export interface GameOption {
  id: string;
  name: string;
  tag: string;
  description: string;
  icon: AcGlyphKind;
  color: string;
  available: boolean;
  mode: GameMode;
}

export const GAMES: GameOption[] = [
  // -------- Multi-joueurs (rooms) --------
  {
    id: 'aram-missions',
    name: 'ARAM MISSIONS',
    tag: 'LOL',
    description: 'Missions secrètes à accomplir pendant vos parties.',
    icon: 'ring',
    color: AC.violet,
    available: true,
    mode: 'multi',
  },
  {
    id: 'codename-ceo',
    name: 'CODENAME DU CEO',
    tag: 'WORDS',
    description: 'Jeu de mots en équipe. Inspiré de Codenames.',
    icon: 'puzzle',
    color: AC.hex,
    available: true,
    mode: 'multi',
  },
  {
    id: 'beat-eikichi',
    name: 'BEAT EIKICHI',
    tag: 'GUESS',
    description:
      "Devine le jeu vidéo à partir d'une image. 20 questions, 1 gagnant.",
    icon: 'image',
    color: AC.shimmer,
    available: true,
    mode: 'multi',
  },
  {
    id: 'quiz-ceo',
    name: 'LE QUIZ DU CEO',
    tag: 'QUIZ',
    description:
      "16 types de questions, le créateur valide. Le meilleur l'emporte.",
    icon: 'puzzle',
    color: AC.gold,
    available: true,
    mode: 'multi',
  },
  // -------- Solo (jeux quotidiens) --------
  {
    id: 'motus',
    name: 'MOTUS',
    tag: 'DAILY',
    description: 'Devine le mot du jour en 6 tentatives.',
    icon: 'puzzle',
    color: AC.chem,
    available: true,
    mode: 'solo',
  },
  {
    id: 'worldle',
    name: 'WORLDLE',
    tag: 'DAILY',
    description: 'Devine le pays à partir de sa forme, en 7 tentatives.',
    icon: 'ring',
    color: AC.hex,
    available: true,
    mode: 'solo',
  },
  {
    id: 'wikiera',
    name: 'WIKIERA',
    tag: 'DAILY',
    description: 'Un extrait de wiki, tu devines de quoi il parle.',
    icon: 'image',
    color: AC.violet,
    available: true,
    mode: 'solo',
  },
  {
    id: 'password',
    name: 'PASSWORD',
    tag: 'DAILY',
    description: "Crée un mot de passe qui respecte toutes les règles du jour.",
    icon: 'lightning',
    color: AC.gold,
    available: true,
    mode: 'solo',
  },
  {
    id: 'cemantix',
    name: 'CEMANTIX',
    tag: 'DAILY',
    description: 'Trouve le mot du jour par proximité sémantique.',
    icon: 'flame',
    color: AC.shimmer,
    available: true,
    mode: 'solo',
  },
];

export const MULTI_GAMES = GAMES.filter((g) => g.mode === 'multi');
export const SOLO_GAMES = GAMES.filter((g) => g.mode === 'solo');
