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
    select: { id: true, name: true, aliases: true, images: true, gifs: true },
  });

  if (allGames.length < BEAT_EIKICHI_CONFIG.QUESTIONS_PER_GAME) {
    throw new Error(
      `Pas assez de jeux dans le catalogue (${allGames.length}). Exécute le seed : npm run seed:beat-eikichi`,
    );
  }

  const picked = sample(allGames, BEAT_EIKICHI_CONFIG.QUESTIONS_PER_GAME);

  return picked.map((game, index) => {
    // Priorité aux GIFs ; fallback sur les images si le jeu n'a pas de GIFs.
    const pool = game.gifs.length > 0 ? game.gifs : game.images;
    const candidates = pool.length > 0 ? pool : [''];
    const imageUrl = candidates[Math.floor(Math.random() * candidates.length)] ?? '';
    return {
      position: index,
      gameId: game.id,
      name: game.name,
      aliases: game.aliases,
      imageUrl,
    };
  });
}
