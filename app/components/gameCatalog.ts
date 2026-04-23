/**
 * Catalogue des mini-jeux affichés sur la homepage + dans le sélecteur.
 *
 * Extrait dans un module « neutre » (pas `'use client'`) pour que le
 * Server Component `app/page.tsx` puisse importer le tableau sans que
 * Next.js le transforme en référence client.
 */
import { AC, type AcGlyphKind } from './arcane';

export interface GameOption {
  id: string;
  name: string;
  tag: string;
  description: string;
  icon: AcGlyphKind;
  color: string;
  available: boolean;
}

export const GAMES: GameOption[] = [
  {
    id: 'aram-missions',
    name: 'ARAM MISSIONS',
    tag: 'LOL',
    description: 'Missions secrètes à accomplir pendant vos parties.',
    icon: 'ring',
    color: AC.violet,
    available: true,
  },
  {
    id: 'codename-ceo',
    name: 'CODENAME DU CEO',
    tag: 'WORDS',
    description: 'Jeu de mots en équipe. Inspiré de Codenames.',
    icon: 'puzzle',
    color: AC.hex,
    available: true,
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
  },
  {
    id: 'coming-game',
    name: '?????',
    tag: 'SOON',
    description: 'Un nouveau mini-jeu arrive bientôt.',
    icon: 'dot',
    color: AC.bone2,
    available: false,
  },
];
