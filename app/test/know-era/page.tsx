'use client';

/**
 * /test/know-era — formulaire interactif pour collecter les réponses d'Era
 * pour la future catégorie `know-era` du Quiz du CEO.
 *
 * Workflow :
 *   1. Era ouvre la page, voit 100 prompts (sujets : musique, ciné, jeux,
 *      sport, food, voyages, perso…).
 *   2. Pour chaque prompt il tape :
 *      - sa réponse (la « bonne » réponse)
 *      - 0 à 3 distractors (mauvaises réponses plausibles).
 *      Si distractors vides, l'agent en proposera plus tard côté seed.
 *   3. Clic sur « Exporter JSON » → tout est sérialisé et copié dans le
 *      presse-papiers. Era le colle dans le chat → l'agent crée
 *      `lib/quizCeo/knowEra.ts` + ajoute le type + seed.
 *
 * Persistance : les saisies sont en localStorage (`know-era-draft-v1`) pour
 * ne pas perdre la progression à chaque refresh.
 */

import { useMemo, useState } from 'react';
import {
  AC,
  AC_FONT_DISPLAY_HEAVY,
  AC_FONT_MONO,
  AcCard,
  AcDisplay,
  AcSectionNum,
  AcScreen,
  AcButton,
  AcShim,
  AcStamp,
  AcPaintedBar,
} from '@/app/components/arcane';
import { usePersistedState } from '@/app/games/solo/usePersistedState';

interface Prompt {
  id: string;
  category: string;
  prompt: string;
  /** Question complète à afficher en jeu (auto-générée si vide). */
  questionText?: string;
  /** Réponse pré-remplie (déjà fournie par Era dans le chat). */
  presetAnswer?: string;
  /** Distractors pré-remplis. */
  presetDistractors?: string[];
}

const CEO = '« CEO de la KAF »';

const PROMPTS: Prompt[] = [
  // ───── MUSIQUE ─────
  { id: 'boys-band', category: 'Musique', prompt: 'Boys band préféré', questionText: `Quel est le boys band préféré du ${CEO} ?`, presetAnswer: 'Backstreet Boys', presetDistractors: ['Poetic Lover', 'Take That', 'NSYNC'] },
  { id: 'groupe-kpop', category: 'Musique', prompt: 'Groupe K-pop préféré', questionText: `Quel est le groupe K-pop préféré du ${CEO} ?`, presetAnswer: "Girls' Generation", presetDistractors: ['aespa', 'BabyMonster', 'Blackpink'] },
  { id: 'chanson-coeur', category: 'Musique', prompt: 'Chanson qui te fait pleurer', questionText: `Quelle chanson fait pleurer le ${CEO} ?` },
  { id: 'chanson-soiree', category: 'Musique', prompt: 'Chanson qui te fait danser en soirée', questionText: `Quelle chanson fait danser le ${CEO} en soirée ?` },
  { id: 'rappeur-fr', category: 'Musique', prompt: 'Rappeur français préféré', questionText: `Qui est le rappeur français préféré du ${CEO} ?` },
  { id: 'rappeur-us', category: 'Musique', prompt: 'Rappeur US préféré', questionText: `Qui est le rappeur US préféré du ${CEO} ?` },
  { id: 'artiste-pop', category: 'Musique', prompt: 'Artiste pop / variété préféré', questionText: `Qui est l'artiste pop / variété préféré du ${CEO} ?` },
  { id: 'dj-prefere', category: 'Musique', prompt: 'DJ ou producteur électro préféré', questionText: `Qui est le DJ ou producteur électro préféré du ${CEO} ?` },
  { id: 'concert-meilleur', category: 'Musique', prompt: 'Meilleur concert auquel tu as assisté', questionText: `Quel est le meilleur concert auquel a assisté le ${CEO} ?` },
  { id: 'instrument', category: 'Musique', prompt: 'Instrument que tu joues (ou rêves de jouer)', questionText: `Quel instrument joue (ou rêve de jouer) le ${CEO} ?` },
  { id: 'album-iconique', category: 'Musique', prompt: 'Album culte qui a marqué ta vie', questionText: `Quel album culte a marqué la vie du ${CEO} ?` },

  // ───── CINÉ / SÉRIES ─────
  { id: 'film', category: 'Ciné/Séries', prompt: 'Film préféré', questionText: `Quel est le film préféré du ${CEO} ?`, presetAnswer: 'Gladiator', presetDistractors: ['Interstellar', 'Transformers', 'The Dark Knight'] },
  { id: 'serie-fav', category: 'Ciné/Séries', prompt: 'Série préférée', questionText: `Quelle est la série préférée du ${CEO} ?` },
  { id: 'acteur', category: 'Ciné/Séries', prompt: 'Acteur préféré', questionText: `Qui est l'acteur préféré du ${CEO} ?` },
  { id: 'actrice', category: 'Ciné/Séries', prompt: 'Actrice préférée', questionText: `Qui est l'actrice préférée du ${CEO} ?` },
  { id: 'realisateur', category: 'Ciné/Séries', prompt: 'Réalisateur préféré', questionText: `Qui est le réalisateur préféré du ${CEO} ?` },
  { id: 'dessin-anime', category: 'Ciné/Séries', prompt: "Dessin animé d'enfance favori", questionText: `Quel est le dessin animé d'enfance favori du ${CEO} ?` },
  { id: 'super-heros', category: 'Ciné/Séries', prompt: 'Super-héros préféré', questionText: `Quel est le super-héros préféré du ${CEO} ?` },
  { id: 'mechant-cine', category: 'Ciné/Séries', prompt: 'Méchant de film préféré', questionText: `Quel est le méchant de film préféré du ${CEO} ?` },
  { id: 'film-dora', category: 'Ciné/Séries', prompt: 'Film que tu peux regarder en boucle', questionText: `Quel film le ${CEO} peut-il regarder en boucle ?` },
  { id: 'serie-binge', category: 'Ciné/Séries', prompt: 'Série que tu as binge-watchée', questionText: `Quelle série le ${CEO} a-t-il binge-watchée ?` },
  { id: 'film-deteste', category: 'Ciné/Séries', prompt: 'Film populaire que tu détestes', questionText: `Quel film populaire le ${CEO} déteste-t-il ?` },

  // ───── MANGA / LIVRES / BD ─────
  { id: 'manga', category: 'Manga/Livres', prompt: 'Manga préféré', questionText: `Quel est le manga préféré du ${CEO} ?`, presetAnswer: 'Haikyū!!', presetDistractors: ['Naruto', 'Captain Tsubasa', 'Bleach'] },
  { id: 'manga-2', category: 'Manga/Livres', prompt: 'Deuxième manga favori', questionText: `Quel est le deuxième manga favori du ${CEO} ?` },
  { id: 'perso-manga', category: 'Manga/Livres', prompt: 'Personnage de manga préféré', questionText: `Qui est le personnage de manga préféré du ${CEO} ?` },
  { id: 'bd-fr', category: 'Manga/Livres', prompt: 'BD franco-belge préférée', questionText: `Quelle est la BD franco-belge préférée du ${CEO} ?` },
  { id: 'livre-fav', category: 'Manga/Livres', prompt: 'Livre marquant', questionText: `Quel livre a marqué le ${CEO} ?` },
  { id: 'auteur-fav', category: 'Manga/Livres', prompt: 'Auteur préféré', questionText: `Qui est l'auteur préféré du ${CEO} ?` },

  // ───── JEUX VIDÉO ─────
  { id: 'jeu-video', category: 'Jeux Vidéo', prompt: 'Jeu vidéo préféré', questionText: `Quel est le jeu vidéo préféré du ${CEO} ?`, presetAnswer: 'Clair Obscur: Expedition 33', presetDistractors: ['League of Legends', 'Cities: Skylines', 'Counter-Strike'] },
  { id: 'console-fav', category: 'Jeux Vidéo', prompt: 'Console préférée', questionText: `Quelle est la console préférée du ${CEO} ?` },
  { id: 'jeu-enfance', category: 'Jeux Vidéo', prompt: 'Jeu vidéo d\'enfance', questionText: `Quel est le jeu vidéo d'enfance du ${CEO} ?` },
  { id: 'champion-lol', category: 'Jeux Vidéo', prompt: 'Champion LoL préféré', questionText: `Quel est le champion LoL préféré du ${CEO} ?` },
  { id: 'role-lol', category: 'Jeux Vidéo', prompt: 'Rôle LoL préféré (top/jungle/mid/adc/support)', questionText: `Quel rôle LoL préfère le ${CEO} (top, jungle, mid, adc, support) ?` },
  { id: 'mmo', category: 'Jeux Vidéo', prompt: 'MMO préféré', questionText: `Quel est le MMO préféré du ${CEO} ?` },
  { id: 'fps', category: 'Jeux Vidéo', prompt: 'FPS préféré', questionText: `Quel est le FPS préféré du ${CEO} ?` },
  { id: 'rpg', category: 'Jeux Vidéo', prompt: 'RPG préféré', questionText: `Quel est le RPG préféré du ${CEO} ?` },
  { id: 'jeu-coop', category: 'Jeux Vidéo', prompt: 'Meilleur jeu coop entre potes', questionText: `Quel est le meilleur jeu coop entre potes selon le ${CEO} ?` },
  { id: 'studio-jv', category: 'Jeux Vidéo', prompt: 'Studio de jeux vidéo préféré', questionText: `Quel est le studio de jeux vidéo préféré du ${CEO} ?` },
  { id: 'perso-jv', category: 'Jeux Vidéo', prompt: 'Personnage de jeu vidéo iconique', questionText: `Quel personnage de jeu vidéo iconique préfère le ${CEO} ?` },

  // ───── SPORT ─────
  { id: 'joueur-foot', category: 'Sport', prompt: 'Joueur de foot préféré', questionText: `Qui est le joueur de foot préféré du ${CEO} ?`, presetAnswer: 'Pastore', presetDistractors: ['Zidane', 'Nakata', 'Zaïre-Emery'] },
  { id: 'club-foot', category: 'Sport', prompt: 'Club de foot préféré', questionText: `Quel est le club de foot préféré du ${CEO} ?` },
  { id: 'equipe-nationale', category: 'Sport', prompt: "Équipe nationale supportée hors France", questionText: `Quelle équipe nationale (hors France) supporte le ${CEO} ?` },
  { id: 'sport-pratique', category: 'Sport', prompt: 'Sport que tu pratiques', questionText: `Quel sport pratique le ${CEO} ?` },
  { id: 'tennis', category: 'Sport', prompt: 'Joueur de tennis préféré', questionText: `Qui est le joueur de tennis préféré du ${CEO} ?` },
  { id: 'basket', category: 'Sport', prompt: 'Joueur NBA préféré', questionText: `Qui est le joueur NBA préféré du ${CEO} ?` },
  { id: 'f1', category: 'Sport', prompt: 'Pilote F1 préféré', questionText: `Qui est le pilote F1 préféré du ${CEO} ?` },
  { id: 'sport-tv', category: 'Sport', prompt: 'Sport que tu regardes le plus à la télé', questionText: `Quel sport regarde le plus à la télé le ${CEO} ?` },
  { id: 'sportif-tous-temps', category: 'Sport', prompt: 'Sportif GOAT (tous sports confondus)', questionText: `Qui est le sportif GOAT (tous sports confondus) selon le ${CEO} ?` },

  // ───── FOOD / BOISSON ─────
  { id: 'plat-prefere', category: 'Food', prompt: 'Plat préféré', questionText: `Quel est le plat préféré du ${CEO} ?` },
  { id: 'plat-fr', category: 'Food', prompt: 'Plat français préféré', questionText: `Quel est le plat français préféré du ${CEO} ?` },
  { id: 'plat-asie', category: 'Food', prompt: 'Plat asiatique préféré', questionText: `Quel est le plat asiatique préféré du ${CEO} ?` },
  { id: 'dessert', category: 'Food', prompt: 'Dessert préféré', questionText: `Quel est le dessert préféré du ${CEO} ?` },
  { id: 'fast-food', category: 'Food', prompt: 'Fast-food préféré', questionText: `Quel est le fast-food préféré du ${CEO} ?` },
  { id: 'fruit', category: 'Food', prompt: 'Fruit préféré', questionText: `Quel est le fruit préféré du ${CEO} ?` },
  { id: 'fromage', category: 'Food', prompt: 'Fromage préféré', questionText: `Quel est le fromage préféré du ${CEO} ?` },
  { id: 'boisson-soft', category: 'Food', prompt: 'Boisson soft préférée', questionText: `Quelle est la boisson soft préférée du ${CEO} ?` },
  { id: 'cocktail', category: 'Food', prompt: 'Cocktail / boisson alcoolisée préférée', questionText: `Quel est le cocktail (ou la boisson alcoolisée) préféré du ${CEO} ?` },
  { id: 'cafe-the', category: 'Food', prompt: 'Café ou thé ?', questionText: `Café ou thé pour le ${CEO} ?` },
  { id: 'restaurant-paris', category: 'Food', prompt: 'Resto culte (Paris ou ailleurs)', questionText: `Quel est le resto culte du ${CEO} ?` },

  // ───── VOYAGES ─────
  { id: 'pays-visite', category: 'Voyages', prompt: 'Plus beau pays visité', questionText: `Quel est le plus beau pays visité par le ${CEO} ?` },
  { id: 'ville-reve', category: 'Voyages', prompt: 'Ville où tu rêves de vivre', questionText: `Dans quelle ville le ${CEO} rêve-t-il de vivre ?` },
  { id: 'destination-vacances', category: 'Voyages', prompt: 'Destination de vacances idéale', questionText: `Quelle est la destination de vacances idéale du ${CEO} ?` },
  { id: 'pays-jamais', category: 'Voyages', prompt: 'Pays que tu ne visiterais jamais', questionText: `Quel pays le ${CEO} ne visiterait jamais ?` },
  { id: 'mer-montagne', category: 'Voyages', prompt: 'Mer ou montagne ?', questionText: `Mer ou montagne pour le ${CEO} ?` },
  { id: 'ville-natale', category: 'Voyages', prompt: 'Ville natale', questionText: `Quelle est la ville natale du ${CEO} ?` },

  // ───── PERSONNEL ─────
  { id: 'signe-astro', category: 'Personnel', prompt: 'Signe astrologique', questionText: `Quel est le signe astrologique du ${CEO} ?`, presetAnswer: 'Verseau', presetDistractors: ['Bélier', 'Lion', 'Scorpion'] },
  { id: 'mois-naissance', category: 'Personnel', prompt: 'Mois de naissance', questionText: `Quel est le mois de naissance du ${CEO} ?` },
  { id: 'metier-reve', category: 'Personnel', prompt: 'Métier de rêve enfant', questionText: `Quel était le métier de rêve enfant du ${CEO} ?` },
  { id: 'talent-cache', category: 'Personnel', prompt: 'Talent caché', questionText: `Quel est le talent caché du ${CEO} ?` },
  { id: 'phobie', category: 'Personnel', prompt: 'Phobie', questionText: `Quelle est la phobie du ${CEO} ?` },
  { id: 'animal-totem', category: 'Personnel', prompt: 'Animal qui te ressemble', questionText: `Quel animal ressemble le plus au ${CEO} ?` },
  { id: 'collection', category: 'Personnel', prompt: "Truc que tu collectionnes (ou collectionnais)", questionText: `Que collectionne (ou collectionnait) le ${CEO} ?` },
  { id: 'manie', category: 'Personnel', prompt: 'Tic ou manie', questionText: `Quel est le tic ou la manie du ${CEO} ?` },
  { id: 'mantra', category: 'Personnel', prompt: 'Devise ou phrase fétiche', questionText: `Quelle est la devise (ou phrase fétiche) du ${CEO} ?` },

  // ───── PRÉFÉRENCES ─────
  { id: 'couleur', category: 'Préférences', prompt: 'Couleur préférée', questionText: `Quelle est la couleur préférée du ${CEO} ?` },
  { id: 'chiffre', category: 'Préférences', prompt: 'Chiffre fétiche', questionText: `Quel est le chiffre fétiche du ${CEO} ?` },
  { id: 'jour-semaine', category: 'Préférences', prompt: 'Jour de la semaine préféré', questionText: `Quel est le jour de la semaine préféré du ${CEO} ?` },
  { id: 'saison', category: 'Préférences', prompt: 'Saison préférée', questionText: `Quelle est la saison préférée du ${CEO} ?` },
  { id: 'odeur', category: 'Préférences', prompt: 'Odeur préférée', questionText: `Quelle est l'odeur préférée du ${CEO} ?` },
  { id: 'pierre-precieuse', category: 'Préférences', prompt: 'Pierre précieuse préférée', questionText: `Quelle est la pierre précieuse préférée du ${CEO} ?` },

  // ───── TECH / WORK ─────
  { id: 'tel', category: 'Tech', prompt: 'Marque de téléphone (iOS / Android)', questionText: `Quelle marque de téléphone utilise le ${CEO} ?` },
  { id: 'os-pc', category: 'Tech', prompt: 'OS PC préféré (Windows/macOS/Linux)', questionText: `Quel OS PC utilise le ${CEO} ?` },
  { id: 'navigateur', category: 'Tech', prompt: 'Navigateur web préféré', questionText: `Quel est le navigateur web préféré du ${CEO} ?` },
  { id: 'lang-prog', category: 'Tech', prompt: 'Langage de programmation préféré', questionText: `Quel est le langage de programmation préféré du ${CEO} ?` },
  { id: 'framework', category: 'Tech', prompt: 'Framework / techno favorite', questionText: `Quel framework (ou techno) préfère le ${CEO} ?` },
  { id: 'reseau-social', category: 'Tech', prompt: 'Réseau social où tu passes le plus de temps', questionText: `Sur quel réseau social passe le plus de temps le ${CEO} ?` },

  // ───── POP CULTURE ─────
  { id: 'meme', category: 'Pop culture', prompt: 'Meme préféré', questionText: `Quel est le meme préféré du ${CEO} ?` },
  { id: 'youtuber', category: 'Pop culture', prompt: 'Youtubeur / streamer préféré', questionText: `Qui est le youtubeur (ou streamer) préféré du ${CEO} ?` },
  { id: 'emission-tv', category: 'Pop culture', prompt: 'Émission TV culte', questionText: `Quelle émission TV est culte pour le ${CEO} ?` },
  { id: 'humoriste', category: 'Pop culture', prompt: 'Humoriste préféré', questionText: `Qui est l'humoriste préféré du ${CEO} ?` },
  { id: 'replique', category: 'Pop culture', prompt: 'Réplique culte que tu cites tout le temps', questionText: `Quelle réplique culte le ${CEO} cite-t-il tout le temps ?` },

  // ───── MODE / STYLE ─────
  { id: 'marque-vetements', category: 'Mode', prompt: 'Marque de vêtements préférée', questionText: `Quelle est la marque de vêtements préférée du ${CEO} ?` },
  { id: 'sneakers', category: 'Mode', prompt: 'Sneakers favorites', questionText: `Quelles sont les sneakers favorites du ${CEO} ?` },
  { id: 'parfum', category: 'Mode', prompt: 'Parfum signature', questionText: `Quel est le parfum signature du ${CEO} ?` },

  // ───── ENFANCE / NOSTALGIE ─────
  { id: 'jouet-enfance', category: 'Enfance', prompt: "Jouet d'enfance préféré", questionText: `Quel était le jouet d'enfance préféré du ${CEO} ?` },
  { id: 'bonbon', category: 'Enfance', prompt: 'Bonbon préféré', questionText: `Quel est le bonbon préféré du ${CEO} ?` },
  { id: 'cereales', category: 'Enfance', prompt: 'Céréales du petit-déj', questionText: `Quelles céréales mange le ${CEO} au petit-déj ?` },

  // ───── DIVERS / OPINIONS ─────
  { id: 'animal-favori', category: 'Animaux', prompt: 'Animal préféré', questionText: `Quel est l'animal préféré du ${CEO} ?` },
  { id: 'race-chien', category: 'Animaux', prompt: 'Race de chien préférée', questionText: `Quelle est la race de chien préférée du ${CEO} ?` },
  { id: 'race-chat', category: 'Animaux', prompt: 'Race de chat préférée', questionText: `Quelle est la race de chat préférée du ${CEO} ?` },
];

interface DraftEntry {
  answer: string;
  distractors: string[]; // toujours longueur 3, peut contenir des chaînes vides
  questionText: string;
  skipped: boolean;
}

const STORAGE_KEY = 'know-era-draft-v3';

function makeDefaultDraft(): Record<string, DraftEntry> {
  const out: Record<string, DraftEntry> = {};
  for (const p of PROMPTS) {
    out[p.id] = {
      answer: p.presetAnswer ?? '',
      distractors: [
        p.presetDistractors?.[0] ?? '',
        p.presetDistractors?.[1] ?? '',
        p.presetDistractors?.[2] ?? '',
      ],
      questionText: p.questionText ?? defaultQuestionText(p.prompt),
      skipped: false,
    };
  }
  return out;
}

function defaultQuestionText(prompt: string): string {
  const lower = prompt.toLowerCase();
  // Pour les prompts en « X ou Y » on ne préfixe rien, juste la question.
  if (lower.startsWith('mer ou')) return `${prompt} ?`;
  if (lower.startsWith('café ou')) return `${prompt} ?`;
  // Format par défaut : référence au « CEO de la KAF » (le quizzé).
  // Editable par row si la grammaire ne convient pas (ex. féminin / pluriel).
  return `Quel est le ${lower} du « CEO de la KAF » ?`;
}

export default function KnowEraTestPage() {
  // Persistance via usePersistedState (conforme lint strict, pas de setState
  // dans un useEffect — cf. CLAUDE.md « Patterns React »).
  const [storedDraft, setStoredDraft] = usePersistedState<Record<string, Partial<DraftEntry>> | null>(
    STORAGE_KEY,
    null,
  );

  // On dérive le draft « complet » (avec valeurs par défaut + presets pour les
  // nouveaux prompts ajoutés depuis la dernière session) à chaque render.
  const draft: Record<string, DraftEntry> = useMemo(() => {
    const base = makeDefaultDraft();
    if (storedDraft) {
      for (const id of Object.keys(storedDraft)) {
        if (base[id]) base[id] = { ...base[id], ...storedDraft[id] };
      }
    }
    return base;
  }, [storedDraft]);

  const setDraft = (
    updater: (prev: Record<string, DraftEntry>) => Record<string, DraftEntry>,
  ) => {
    setStoredDraft(updater(draft));
  };

  const [filter, setFilter] = useState<string>('Tous');
  const [exportToast, setExportToast] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>(PROMPTS.map((p) => p.category));
    return ['Tous', ...Array.from(set)];
  }, []);

  const filteredPrompts = useMemo(() => {
    if (filter === 'Tous') return PROMPTS;
    return PROMPTS.filter((p) => p.category === filter);
  }, [filter]);

  const stats = useMemo(() => {
    let answered = 0;
    let withAllDistractors = 0;
    let skipped = 0;
    for (const p of PROMPTS) {
      const e = draft[p.id];
      if (!e) continue;
      if (e.skipped) {
        skipped++;
        continue;
      }
      if (e.answer.trim().length > 0) answered++;
      if (
        e.answer.trim().length > 0 &&
        e.distractors.every((d) => d.trim().length > 0)
      ) {
        withAllDistractors++;
      }
    }
    return { answered, withAllDistractors, skipped, total: PROMPTS.length };
  }, [draft]);

  const updateAnswer = (id: string, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [id]: { ...prev[id], answer: value, skipped: false },
    }));
  };

  const updateDistractor = (id: string, idx: 0 | 1 | 2, value: string) => {
    setDraft((prev) => {
      const next = { ...prev[id] };
      next.distractors = next.distractors.slice() as string[];
      next.distractors[idx] = value;
      return { ...prev, [id]: next };
    });
  };

  const updateQuestionText = (id: string, value: string) => {
    setDraft((prev) => ({
      ...prev,
      [id]: { ...prev[id], questionText: value },
    }));
  };

  const toggleSkip = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      [id]: { ...prev[id], skipped: !prev[id].skipped },
    }));
  };

  const handleExport = async () => {
    const exportData = PROMPTS.map((p) => {
      const e = draft[p.id];
      return {
        id: p.id,
        category: p.category,
        prompt: p.prompt,
        questionText: e.questionText,
        answer: e.answer.trim(),
        distractors: e.distractors.map((d) => d.trim()).filter((d) => d.length > 0),
        skipped: e.skipped,
      };
    }).filter((e) => !e.skipped && e.answer.length > 0);

    const json = JSON.stringify(exportData, null, 2);
    try {
      await navigator.clipboard.writeText(json);
      setExportToast(
        `${exportData.length} entrées copiées dans le presse-papiers — colle-les dans le chat.`,
      );
    } catch {
      setExportToast('Copie automatique impossible — lit le textarea ci-dessous.');
    }
    setTimeout(() => setExportToast(null), 5000);
  };

  const handleReset = () => {
    if (
      typeof window !== 'undefined' &&
      window.confirm('Réinitialiser toutes les saisies ? Cette action ne peut pas être annulée.')
    ) {
      setStoredDraft(null);
    }
  };

  const exportPreview = useMemo(() => {
    const exportData = PROMPTS.map((p) => {
      const e = draft[p.id];
      return {
        id: p.id,
        category: p.category,
        prompt: p.prompt,
        questionText: e.questionText,
        answer: e.answer.trim(),
        distractors: e.distractors.map((d) => d.trim()).filter((d) => d.length > 0),
        skipped: e.skipped,
      };
    }).filter((e) => !e.skipped && e.answer.length > 0);
    return JSON.stringify(exportData, null, 2);
  }, [draft]);

  return (
    <AcScreen>
      <div className="relative mx-auto px-4 sm:px-8 py-6 sm:py-9" style={{ maxWidth: 1100 }}>
        <div className="mb-6">
          <AcSectionNum n={99} />
          <AcDisplay style={{ fontSize: 36, marginTop: 8 }}>
            CONNAIS-TU <AcShim color={AC.shimmer}>ERA</AcShim>
          </AcDisplay>
          <p
            style={{
              fontFamily: AC_FONT_MONO,
              fontSize: 12,
              letterSpacing: '0.18em',
              color: AC.bone2,
              marginTop: 6,
              textTransform: 'uppercase',
            }}
          >
            {'// '}formulaire de collecte pour le seeding de la catégorie know-era
          </p>
        </div>

        {/* Stats + actions */}
        <AcCard fold={false} style={{ padding: 18, marginBottom: 18 }}>
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div>
              <div
                style={{
                  fontFamily: AC_FONT_DISPLAY_HEAVY,
                  fontSize: 28,
                  color: AC.gold,
                }}
              >
                {stats.answered} / {stats.total}
              </div>
              <div
                style={{
                  fontFamily: AC_FONT_MONO,
                  fontSize: 11,
                  letterSpacing: '0.2em',
                  color: AC.bone2,
                  textTransform: 'uppercase',
                  marginTop: 4,
                }}
              >
                {'// '}réponses remplies · {stats.withAllDistractors} avec tous les distractors · {stats.skipped} ignorées
              </div>
              <div style={{ marginTop: 10 }}>
                <AcPaintedBar value={stats.answered / stats.total} color={AC.chem} />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <AcButton variant="primary" onClick={handleExport} drip>
                EXPORTER JSON
              </AcButton>
              <AcButton variant="ghost" onClick={handleReset}>
                RÉINITIALISER
              </AcButton>
            </div>
          </div>
          {exportToast && (
            <div
              className="mt-3 p-2"
              style={{
                fontFamily: AC_FONT_MONO,
                fontSize: 12,
                letterSpacing: '0.16em',
                color: AC.chem,
                border: `1.5px dashed ${AC.chem}`,
                background: 'rgba(18,214,168,0.08)',
              }}
            >
              {'// '}{exportToast}
            </div>
          )}
        </AcCard>

        {/* Filtres par catégorie */}
        <div className="flex flex-wrap gap-2 mb-5">
          {categories.map((c) => {
            const active = filter === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                style={{
                  padding: '6px 12px',
                  background: active ? AC.gold : 'transparent',
                  border: `1.5px solid ${AC.gold}`,
                  color: active ? AC.ink : AC.gold,
                  fontFamily: AC_FONT_MONO,
                  fontSize: 11,
                  letterSpacing: '0.16em',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                }}
              >
                {c}
              </button>
            );
          })}
        </div>

        {/* Liste des prompts */}
        <div className="flex flex-col gap-4">
          {filteredPrompts.map((p) => {
            const e = draft[p.id];
            if (!e) return null;
            const filled = !e.skipped && e.answer.trim().length > 0;
            return (
              <AcCard
                key={p.id}
                fold={false}
                dashed
                style={{
                  padding: 16,
                  borderColor: e.skipped
                    ? AC.bone2
                    : filled
                    ? AC.chem
                    : undefined,
                  opacity: e.skipped ? 0.45 : 1,
                }}
              >
                {/* Header : numéro + catégorie + skip */}
                <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-3">
                    <span
                      style={{
                        fontFamily: AC_FONT_MONO,
                        fontSize: 11,
                        color: AC.bone2,
                        letterSpacing: '0.18em',
                      }}
                    >
                      {'#' + String(PROMPTS.findIndex((x) => x.id === p.id) + 1).padStart(3, '0')}
                    </span>
                    <span
                      style={{
                        fontFamily: AC_FONT_MONO,
                        fontSize: 10,
                        color: AC.gold,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        padding: '2px 8px',
                        border: `1px solid ${AC.gold}`,
                      }}
                    >
                      {p.category}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSkip(p.id)}
                    style={{
                      padding: '3px 9px',
                      background: e.skipped ? AC.rust : 'transparent',
                      border: `1.5px solid ${AC.rust}`,
                      color: e.skipped ? AC.bone : AC.rust,
                      fontFamily: AC_FONT_MONO,
                      fontSize: 10,
                      letterSpacing: '0.16em',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textTransform: 'uppercase',
                    }}
                  >
                    {e.skipped ? '↺ Réactiver' : '✗ Ignorer'}
                  </button>
                </div>

                {/* Sujet */}
                <div
                  style={{
                    fontFamily: AC_FONT_DISPLAY_HEAVY,
                    fontSize: 22,
                    color: AC.bone,
                    textTransform: 'uppercase',
                    letterSpacing: '0.02em',
                    marginBottom: 12,
                  }}
                >
                  {p.prompt}
                </div>

                {/* Question text affichée en jeu (éditable) */}
                <label className="block mb-3">
                  <span
                    style={{
                      fontFamily: AC_FONT_MONO,
                      fontSize: 10,
                      letterSpacing: '0.22em',
                      color: AC.bone2,
                      textTransform: 'uppercase',
                    }}
                  >
                    {'// '}énoncé affiché en jeu
                  </span>
                  <input
                    type="text"
                    value={e.questionText}
                    onChange={(ev) => updateQuestionText(p.id, ev.target.value)}
                    disabled={e.skipped}
                    className="ac-input"
                    style={inputStyle}
                  />
                </label>

                {/* Réponse + distractors */}
                <div className="grid gap-2 mb-2" style={{ gridTemplateColumns: '1fr' }}>
                  <label>
                    <span
                      style={{
                        fontFamily: AC_FONT_MONO,
                        fontSize: 10,
                        letterSpacing: '0.22em',
                        color: AC.chem,
                        textTransform: 'uppercase',
                      }}
                    >
                      {'// '}ta réponse (la bonne)
                    </span>
                    <input
                      type="text"
                      value={e.answer}
                      onChange={(ev) => updateAnswer(p.id, ev.target.value)}
                      disabled={e.skipped}
                      className="ac-input"
                      style={{
                        ...inputStyle,
                        borderColor: AC.chem,
                        color: AC.chem,
                      }}
                    />
                  </label>
                </div>

                <div className="grid gap-2 sm:grid-cols-3">
                  {[0, 1, 2].map((idx) => (
                    <label key={idx}>
                      <span
                        style={{
                          fontFamily: AC_FONT_MONO,
                          fontSize: 10,
                          letterSpacing: '0.22em',
                          color: AC.bone2,
                          textTransform: 'uppercase',
                        }}
                      >
                        {'// '}distractor {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={e.distractors[idx]}
                        onChange={(ev) =>
                          updateDistractor(p.id, idx as 0 | 1 | 2, ev.target.value)
                        }
                        disabled={e.skipped}
                        className="ac-input"
                        style={inputStyle}
                        placeholder="(facultatif)"
                      />
                    </label>
                  ))}
                </div>
              </AcCard>
            );
          })}
        </div>

        {/* JSON preview à la fin */}
        <AcCard fold={false} style={{ padding: 16, marginTop: 24 }}>
          <div
            style={{
              fontFamily: AC_FONT_MONO,
              fontSize: 11,
              letterSpacing: '0.22em',
              color: AC.bone2,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            {'// '}aperçu du JSON exporté ({stats.answered} entrées)
          </div>
          <textarea
            readOnly
            value={exportPreview}
            style={{
              width: '100%',
              minHeight: 200,
              maxHeight: 400,
              fontFamily: AC_FONT_MONO,
              fontSize: 11,
              padding: 12,
              background: 'rgba(13,11,8,0.6)',
              border: `1.5px dashed ${AC.bone2}`,
              color: AC.bone,
              resize: 'vertical',
            }}
          />
          <div className="mt-3">
            <AcStamp color={AC.gold} rotate={-1}>
              {'// '}colle ce JSON dans le chat pour que je seed la catégorie
            </AcStamp>
          </div>
        </AcCard>

        <div style={{ height: 80 }} />
      </div>
    </AcScreen>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  background: 'rgba(240,228,193,0.04)',
  border: `1.5px solid ${AC.bone}`,
  outline: 'none',
  color: AC.bone,
  fontFamily: AC_FONT_MONO,
  fontSize: 14,
  marginTop: 4,
};
