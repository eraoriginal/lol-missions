import 'server-only';

/**
 * Puzzles Cemantix (version simplifiée) — **server-only**.
 * `import 'server-only'` empêche tout bundle client : la cible + les tiers
 * restent secrets. Le client passe par `POST /api/solo/cemantix/guess`.
 *
 * Sans embeddings français embarqués (trop lourd) ni API externe, on se
 * contente d'une liste hand-curated de mots « voisins sémantiques » classés
 * par tier pour chaque mot-cible.
 *
 *   tier1 : ultra proches (rank 1..10)
 *   tier2 : fortement reliés (rank 11..50)
 *   tier3 : reliés par thème (rank 51..200)
 *   tier4 : vaguement reliés (rank 201..1000)
 *
 * Un mot inconnu de la table = rank 9999 (glacial). Seul le mot cible exact
 * fait gagner la partie. La comparaison normalise accents + casse.
 */

export interface CemantixPuzzle {
  target: string;
  tier1: string[];
  tier2: string[];
  tier3: string[];
  tier4: string[];
}

export const PUZZLES: CemantixPuzzle[] = [
  {
    target: 'océan',
    tier1: ['mer', 'vague', 'eau', 'maritime', 'océanique', 'marin', 'atlantique', 'pacifique', 'flot'],
    tier2: [
      'plage', 'sable', 'sel', 'salé', 'bateau', 'navire', 'pêche', 'poisson',
      'dauphin', 'requin', 'baleine', 'corail', 'île', 'rivage', 'côte',
      'large', 'profondeur', 'courant', 'marée', 'port', 'voilier',
    ],
    tier3: [
      'pirate', 'sous-marin', 'tempête', 'vent', 'horizon', 'mouette',
      'algue', 'récif', 'tropical', 'littoral', 'nageur', 'plongeur',
      'coquillage', 'homard', 'crabe', 'méduse', 'tortue', 'orque',
      'navigation', 'boussole', 'phare', 'capitaine', 'cargaison',
      'rame', 'voile', 'regate',
    ],
    tier4: [
      'eau douce', 'lac', 'rivière', 'fleuve', 'poissonnier', 'terrestre',
      'continent', 'côtier', 'nord', 'sud', 'vaste', 'bleu', 'vert',
      'soleil', 'chaleur', 'été', 'vacances', 'pétrole', 'exploration',
      'déchets', 'pollution', 'biodiversité', 'écosystème', 'scientifique',
    ],
  },
  {
    target: 'musique',
    tier1: ['son', 'mélodie', 'chanson', 'note', 'rythme', 'musical', 'musicien', 'harmonie'],
    tier2: [
      'piano', 'guitare', 'violon', 'batterie', 'concert', 'orchestre',
      'artiste', 'compositeur', 'chanteur', 'partition', 'instrument',
      'accord', 'écouter', 'danser', 'album', 'groupe', 'studio',
      'festival', 'radio', 'beat', 'cadence',
    ],
    tier3: [
      'jazz', 'rock', 'classique', 'pop', 'blues', 'opéra', 'symphonie',
      'solo', 'refrain', 'couplet', 'scène', 'tournée', 'public',
      'applaudir', 'microphone', 'enceinte', 'casque', 'vinyle', 'disque',
      'morceau', 'titre', 'hit', 'sample', 'mix', 'dj', 'rap', 'reggae',
    ],
    tier4: [
      'son aigu', 'grave', 'écouteur', 'bande son', 'théâtre', 'spectacle',
      'danse', 'ballet', 'cinéma', 'émotion', 'silence', 'bruit',
      'composition', 'écriture', 'artiste peintre', 'création',
      'culture', 'art', 'jeune', 'ado', 'plaisir', 'passion',
    ],
  },
  {
    target: 'montagne',
    tier1: ['sommet', 'altitude', 'mont', 'alpin', 'pic', 'massif'],
    tier2: [
      'neige', 'ski', 'alpiniste', 'escalade', 'rocher', 'sentier',
      'randonnée', 'vallée', 'glacier', 'chalet', 'sapin', 'aigle',
      'ours', 'chamois', 'marmotte', 'alpes', 'pyrénées', 'himalaya',
      'everest', 'refuge', 'ascension', 'corde',
    ],
    tier3: [
      'nature', 'forêt', 'roche', 'pierre', 'pente', 'descente',
      'montée', 'colline', 'plateau', 'vallon', 'gorge', 'crête',
      'falaise', 'précipice', 'avalanche', 'froid', 'hiver', 'gel',
      'bâton', 'crampon', 'piolet', 'bivouac', 'tente', 'camping',
      'guide', 'carte',
    ],
    tier4: [
      'mer', 'plaine', 'campagne', 'ville', 'route', 'voyage',
      'paysage', 'horizon', 'soleil couchant', 'randonneur', 'touriste',
      'panneau', 'téléphérique', 'station', 'chocolat chaud', 'fromage',
      'savoie', 'tyrol', 'géographie', 'géologie', 'séisme', 'volcan',
    ],
  },
  {
    target: 'livre',
    tier1: ['lecture', 'lire', 'ouvrage', 'bouquin', 'roman', 'recueil'],
    tier2: [
      'auteur', 'écrivain', 'éditeur', 'bibliothèque', 'page', 'chapitre',
      'titre', 'édition', 'librairie', 'papier', 'imprimer', 'relier',
      'histoire', 'poésie', 'prose', 'nouvelle', 'essai', 'conte',
      'fable', 'thèse', 'manuscrit',
    ],
    tier3: [
      'bibliophile', 'collection', 'saga', 'trilogie', 'tome', 'volume',
      'couverture', 'dos', 'reliure', 'signet', 'préface', 'épilogue',
      'dédicace', 'personnage', 'protagoniste', 'narrateur', 'intrigue',
      'suspense', 'mystère', 'polar', 'thriller', 'fantastique',
      'science-fiction', 'fantasy', 'jeunesse', 'albums',
    ],
    tier4: [
      'papier journal', 'journal', 'magazine', 'bd', 'manga', 'kindle',
      'liseuse', 'pdf', 'écran', 'digital', 'numérique', 'cinéma',
      'adaptation', 'scénario', 'film', 'série', 'musée', 'école',
      'cours', 'professeur', 'élève', 'savoir', 'culture', 'sagesse',
    ],
  },
  {
    target: 'voyage',
    tier1: ['voyager', 'déplacement', 'excursion', 'périple', 'expédition', 'odyssée'],
    tier2: [
      'vacances', 'tourisme', 'touriste', 'destination', 'pays', 'étranger',
      'avion', 'train', 'voiture', 'bateau', 'bus', 'métro',
      'billet', 'valise', 'sac à dos', 'passeport', 'visa', 'frontière',
      'hôtel', 'auberge', 'camping',
    ],
    tier3: [
      'aventure', 'découverte', 'explorer', 'sillonner', 'traverser',
      'partir', 'revenir', 'arriver', 'départ', 'arrivée', 'escale',
      'correspondance', 'aéroport', 'gare', 'port', 'terminal',
      'carte', 'guide', 'itinéraire', 'circuit', 'road trip',
      'sac de voyage', 'trousse',
    ],
    tier4: [
      'plage', 'montagne', 'ville', 'campagne', 'désert', 'jungle',
      'culture', 'langue', 'cuisine locale', 'souvenir', 'photo',
      'carte postale', 'tampon', 'monnaie', 'change', 'pourboire',
      'retard', 'annulation', 'bagage perdu', 'vaccin', 'assurance',
    ],
  },
];

/** Normalise input pour comparaison : lowercase + strip accents + trim. */
export function normalizeCemantix(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '');
}

export interface ScoreResult {
  rank: number; // 0 = target, sinon 1..9999
  tier: 1 | 2 | 3 | 4 | 5; // 5 = inconnu (glacial)
}

/** Retourne le score pour un guess donné sur un puzzle. */
export function scoreGuess(puzzle: CemantixPuzzle, guess: string): ScoreResult {
  const g = normalizeCemantix(guess);
  if (!g) return { rank: 9999, tier: 5 };
  if (normalizeCemantix(puzzle.target) === g) return { rank: 0, tier: 1 };

  const inTier = (list: string[], base: number, slotWidth: number): ScoreResult | null => {
    for (let i = 0; i < list.length; i++) {
      if (normalizeCemantix(list[i]) === g) {
        const rank = base + Math.min(slotWidth - 1, i);
        const tier = base === 1 ? 1 : base === 11 ? 2 : base === 51 ? 3 : 4;
        return { rank, tier: tier as 1 | 2 | 3 | 4 };
      }
    }
    return null;
  };

  return (
    inTier(puzzle.tier1, 1, 10) ??
    inTier(puzzle.tier2, 11, 40) ??
    inTier(puzzle.tier3, 51, 150) ??
    inTier(puzzle.tier4, 201, 800) ?? { rank: 9999, tier: 5 }
  );
}

export function tierLabel(tier: 1 | 2 | 3 | 4 | 5): { label: string; color: string; emoji: string } {
  switch (tier) {
    case 1:
      return { label: 'brûlant', color: '#FF3D3D', emoji: '🔥' };
    case 2:
      return { label: 'chaud', color: '#F5B912', emoji: '🌶️' };
    case 3:
      return { label: 'tiède', color: '#FF3D8B', emoji: '☕' };
    case 4:
      return { label: 'froid', color: '#5EB8FF', emoji: '🧊' };
    case 5:
      return { label: 'glacial', color: '#8A3DD4', emoji: '❄️' };
  }
}
