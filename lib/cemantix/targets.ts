/**
 * Liste curée de mots cibles candidats pour `La Cémantix d'Era`.
 *
 * **Pas de `import 'server-only'`** : ce fichier est aussi importé par les
 * scripts de seed (`scripts/build-cemantix-puzzles.ts`), qui tournent dans
 * Node (pas Next.js). La liste est néanmoins informative seulement — la cible
 * effective d'un jour donné n'est connue qu'après build, en DB
 * (`CemantixDailyTarget`).
 *
 * Critères de sélection :
 *   - **Concrets** (objets, lieux, animaux, métiers, sentiments) — plus
 *     facile à deviner par tâtonnement sémantique que des mots abstraits.
 *   - **Bien connectés** dans l'espace sémantique français (proche de
 *     beaucoup d'autres mots → progression possible).
 *   - **Sans ambiguïté majeure** par défaut. Si le mot a plusieurs sens
 *     forts (avocat = juriste/fruit), un libellé `sense` est fourni pour
 *     orienter le joueur.
 *
 * Le script `build-cemantix-puzzles.ts` pioche dans cette liste pour le
 * puzzle quotidien, en évitant les mots déjà utilisés récemment.
 *
 * Format : `{ word, sense? }`. Le mot doit exister dans la table
 * `CemantixWord` (sinon le script log un warning et skip).
 */
export interface CemantixTargetCandidate {
  word: string;
  /** Optionnel : libellé désambiguïsant montré au joueur. */
  sense?: string;
}

export const CEMANTIX_TARGETS: CemantixTargetCandidate[] = [
  // ───── ANIMAUX ─────
  { word: 'chien' }, { word: 'chat' }, { word: 'cheval' }, { word: 'lion' },
  { word: 'tigre' }, { word: 'elephant' }, { word: 'loup' }, { word: 'renard' },
  { word: 'ours' }, { word: 'serpent' }, { word: 'aigle' }, { word: 'hibou' },
  { word: 'dauphin' }, { word: 'baleine' }, { word: 'requin' }, { word: 'tortue' },
  { word: 'lapin' }, { word: 'souris' }, { word: 'singe' }, { word: 'panda' },
  { word: 'kangourou' }, { word: 'girafe' }, { word: 'crocodile' }, { word: 'pingouin' },

  // ───── NATURE / ENV ─────
  { word: 'ocean' }, { word: 'mer' }, { word: 'lac' }, { word: 'riviere' },
  { word: 'fleuve' }, { word: 'foret' }, { word: 'montagne' }, { word: 'desert' },
  { word: 'plage' }, { word: 'colline' }, { word: 'vallee' }, { word: 'volcan' },
  { word: 'arbre' }, { word: 'fleur' }, { word: 'rose' }, { word: 'feuille' },
  { word: 'herbe' }, { word: 'champ' }, { word: 'jardin' }, { word: 'parc' },
  { word: 'soleil' }, { word: 'lune' }, { word: 'etoile' }, { word: 'nuage' },
  { word: 'pluie' }, { word: 'neige' }, { word: 'tempete' }, { word: 'orage' },
  { word: 'vent' }, { word: 'brouillard' }, { word: 'arcenciel' },

  // ───── MAISON / OBJETS ─────
  { word: 'maison' }, { word: 'porte' }, { word: 'fenetre' }, { word: 'toit' },
  { word: 'mur' }, { word: 'cuisine' }, { word: 'salon' }, { word: 'chambre' },
  { word: 'lit' }, { word: 'chaise' }, { word: 'table' }, { word: 'canape' },
  { word: 'lampe' }, { word: 'miroir' }, { word: 'armoire' }, { word: 'tapis' },
  { word: 'horloge' }, { word: 'cle' }, { word: 'clef' }, { word: 'serrure' },
  { word: 'livre' }, { word: 'cahier' }, { word: 'crayon' }, { word: 'stylo' },
  { word: 'papier' }, { word: 'tableau' }, { word: 'pinceau' }, { word: 'palette' },

  // ───── NOURRITURE ─────
  { word: 'pain' }, { word: 'fromage' }, { word: 'vin' }, { word: 'biere' },
  { word: 'cafe' }, { word: 'the' }, { word: 'lait' }, { word: 'eau' },
  { word: 'pomme' }, { word: 'poire' }, { word: 'banane' }, { word: 'orange' },
  { word: 'fraise' }, { word: 'cerise' }, { word: 'raisin' }, { word: 'citron' },
  { word: 'tomate' }, { word: 'carotte' }, { word: 'salade' }, { word: 'oignon' },
  { word: 'pomme de terre' }, { word: 'riz' }, { word: 'pates' },
  { word: 'pizza' }, { word: 'gateau' }, { word: 'chocolat' }, { word: 'glace', sense: 'dessert glacé' },
  { word: 'soupe' }, { word: 'salade' }, { word: 'sandwich' }, { word: 'crepe' },
  { word: 'oeuf' }, { word: 'poulet' }, { word: 'poisson' }, { word: 'viande' },

  // ───── CORPS / SENTIMENTS ─────
  { word: 'tete' }, { word: 'main' }, { word: 'pied' }, { word: 'oeil' },
  { word: 'oreille' }, { word: 'bouche' }, { word: 'nez' }, { word: 'cheveu' },
  { word: 'coeur' }, { word: 'cerveau' }, { word: 'sang' }, { word: 'os' },
  { word: 'amour' }, { word: 'haine' }, { word: 'peur' }, { word: 'joie' },
  { word: 'tristesse' }, { word: 'colere' }, { word: 'surprise' }, { word: 'honte' },
  { word: 'fierte' }, { word: 'jalousie' }, { word: 'espoir' }, { word: 'reve' },
  { word: 'cauchemar' }, { word: 'memoire' }, { word: 'pensee' }, { word: 'idee' },

  // ───── TRANSPORT ─────
  { word: 'voiture' }, { word: 'camion' }, { word: 'bus' }, { word: 'metro' },
  { word: 'train' }, { word: 'avion' }, { word: 'bateau' }, { word: 'velo' },
  { word: 'moto' }, { word: 'scooter' }, { word: 'taxi' }, { word: 'helicoptere' },
  { word: 'fusee' }, { word: 'sousmarin' }, { word: 'tramway' },
  { word: 'route' }, { word: 'autoroute' }, { word: 'rue' }, { word: 'pont' },
  { word: 'tunnel' }, { word: 'gare' }, { word: 'aeroport' }, { word: 'port' },

  // ───── VILLE / SOCIETE ─────
  { word: 'ville' }, { word: 'village' }, { word: 'pays' }, { word: 'capitale' },
  { word: 'quartier' }, { word: 'banlieue' }, { word: 'campagne' },
  { word: 'ecole' }, { word: 'universite' }, { word: 'hopital' }, { word: 'eglise' },
  { word: 'musee' }, { word: 'theatre' }, { word: 'cinema' }, { word: 'bibliotheque' },
  { word: 'supermarche' }, { word: 'magasin' }, { word: 'marche' }, { word: 'cafe', sense: 'établissement' },
  { word: 'restaurant' }, { word: 'hotel' }, { word: 'banque' }, { word: 'mairie' },

  // ───── METIERS ─────
  { word: 'medecin' }, { word: 'infirmier' }, { word: 'professeur' }, { word: 'avocat', sense: 'métier' },
  { word: 'juge' }, { word: 'policier' }, { word: 'pompier' }, { word: 'soldat' },
  { word: 'chef' }, { word: 'boulanger' }, { word: 'cuisinier' }, { word: 'serveur' },
  { word: 'artiste' }, { word: 'musicien' }, { word: 'chanteur' }, { word: 'acteur' },
  { word: 'ecrivain' }, { word: 'journaliste' }, { word: 'photographe' }, { word: 'peintre' },
  { word: 'architecte' }, { word: 'ingenieur' }, { word: 'scientifique' }, { word: 'astronaute' },
  { word: 'agriculteur' }, { word: 'jardinier' }, { word: 'pecheur' }, { word: 'chasseur' },

  // ───── SPORT / LOISIRS ─────
  { word: 'football' }, { word: 'tennis' }, { word: 'basket' }, { word: 'rugby' },
  { word: 'natation' }, { word: 'course' }, { word: 'velo', sense: 'sport' }, { word: 'ski' },
  { word: 'surf' }, { word: 'voile' }, { word: 'judo' }, { word: 'karate' },
  { word: 'danse' }, { word: 'musique' }, { word: 'cinema', sense: 'art' }, { word: 'photo' },
  { word: 'jeu' }, { word: 'jouet' }, { word: 'puzzle' },

  // ───── INSTRUMENTS / MUSIQUE ─────
  { word: 'piano' }, { word: 'guitare' }, { word: 'violon' }, { word: 'flute' },
  { word: 'tambour' }, { word: 'trompette' }, { word: 'saxophone' }, { word: 'accordeon' },
  { word: 'harpe' }, { word: 'cymbale' }, { word: 'orchestre' }, { word: 'concert' },

  // ───── CONCEPTS / TEMPS ─────
  { word: 'temps' }, { word: 'jour' }, { word: 'nuit' }, { word: 'matin' },
  { word: 'soir' }, { word: 'semaine' }, { word: 'mois' }, { word: 'annee' },
  { word: 'heure' }, { word: 'minute' }, { word: 'seconde' }, { word: 'siecle' },
  { word: 'guerre' }, { word: 'paix' }, { word: 'liberte' }, { word: 'justice' },
  { word: 'verite' }, { word: 'mensonge' }, { word: 'silence' }, { word: 'bruit' },
  { word: 'lumiere' }, { word: 'ombre' }, { word: 'feu' }, { word: 'glace', sense: 'eau gelée' },

  // ───── COULEURS / FORMES ─────
  { word: 'rouge' }, { word: 'bleu' }, { word: 'vert' }, { word: 'jaune' },
  { word: 'noir' }, { word: 'blanc' }, { word: 'rose' }, { word: 'violet' },
  { word: 'orange', sense: 'couleur' }, { word: 'gris' }, { word: 'marron' },
  { word: 'cercle' }, { word: 'carre' }, { word: 'triangle' }, { word: 'rectangle' },

  // ───── VETEMENTS ─────
  { word: 'pantalon' }, { word: 'chemise' }, { word: 'veste' }, { word: 'manteau' },
  { word: 'robe' }, { word: 'jupe' }, { word: 'chaussure' }, { word: 'chapeau' },
  { word: 'gant' }, { word: 'echarpe' }, { word: 'cravate' }, { word: 'ceinture' },
];

/**
 * Normalise un mot pour matcher le format DB (`CemantixWord.word` —
 * lowercase + strip accents). DOIT être identique à `normalizeCemantix` côté
 * serveur (cf. `lib/cemantix/server.ts`).
 */
export function normalizeTarget(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
