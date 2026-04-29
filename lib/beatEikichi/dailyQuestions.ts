import { prisma } from '@/lib/prisma';
import { BEAT_EIKICHI_CONFIG } from './config';

/**
 * Une question d'une partie Beat Eikichi.
 */
export interface BeatEikichiQuestion {
  position: number; // 0..19
  gameId: string;
  name: string;
  aliases: string[];
  imageUrl: string;
  /** Indices optionnels (du catalogue VideoGame). */
  hintGenre: string | null;
  hintTerm: string | null;
  hintPlatforms: string | null;
}

/**
 * Tirage Fisher-Yates : retourne `count` éléments aléatoires distincts depuis `arr`.
 */
function sample<T>(arr: T[], count: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

/**
 * Tire 20 questions aléatoires depuis le catalogue VideoGame.
 * Pour chaque jeu sélectionné, on pick une image aléatoire parmi les 5 disponibles.
 *
 * Appelé à chaque /start et /restart — chaque partie a donc son propre set de questions,
 * ce qui garantit la rejouabilité.
 */
export async function generateQuestionSet(): Promise<BeatEikichiQuestion[]> {
  const allGames = await prisma.videoGame.findMany({
    select: {
      id: true,
      name: true,
      aliases: true,
      images: true,
      gifs: true,
      hintGenre: true,
      hintTerm: true,
      hintPlatforms: true,
    },
  });

  // Filtre amont : un jeu doit avoir AU MOINS une source d'image utilisable
  // selon la config (GIFs ou images). Sans ce filtre, le tirage pouvait
  // produire des questions avec `imageUrl=''` → image impossible à charger,
  // l'utilisateur restait bloqué sur un placeholder.
  const eligibleGames = allGames.filter((g) => {
    if (BEAT_EIKICHI_CONFIG.USE_GIFS && g.gifs.length > 0) return true;
    return g.images.length > 0;
  });

  if (eligibleGames.length < BEAT_EIKICHI_CONFIG.QUESTIONS_PER_GAME) {
    throw new Error(
      `Pas assez de jeux exploitables (${eligibleGames.length}/${allGames.length} ont des images). Relance le seed : npm run seed:beat-eikichi`,
    );
  }

  const picked = sample(eligibleGames, BEAT_EIKICHI_CONFIG.QUESTIONS_PER_GAME);

  return picked.map((game, index) => {
    // Si USE_GIFS est off, on ignore les GIFs et on pioche dans les images.
    // Sinon, on prend un GIF si dispo, sinon on retombe sur les images.
    const preferGifs = BEAT_EIKICHI_CONFIG.USE_GIFS && game.gifs.length > 0;
    const pool = preferGifs ? game.gifs : game.images;
    // Invariant garanti par le filtre `eligibleGames` : pool.length > 0.
    const imageUrl = pool[Math.floor(Math.random() * pool.length)];
    return {
      position: index,
      gameId: game.id,
      name: game.name,
      aliases: game.aliases,
      imageUrl,
      hintGenre: game.hintGenre,
      hintTerm: game.hintTerm,
      hintPlatforms: game.hintPlatforms,
    };
  });
}
