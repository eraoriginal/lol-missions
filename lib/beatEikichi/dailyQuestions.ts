import { prisma } from '@/lib/prisma';
import { BEAT_EIKICHI_CONFIG } from './config';
import { igdbImageUrl } from './igdbImage';

/**
 * Une question d'une partie Beat Eikichi.
 *
 * `aliases` est conservé pour compat des snapshots persistés en DB (parties
 * en cours avant la migration). Côté nouveau pipeline IGDB on insère toujours
 * un tableau vide — la validation `isAcceptedAnswer` ne lit jamais les
 * aliases (CLAUDE.md). Les anciens champs `hint*` ont été supprimés en
 * 2026-04 avec le mode "blur".
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
  // Pipeline IGDB : screenshots = relation 1-N (table ScreenshotImage).
  // On ne charge que les jeux qui ont AU MOINS un screenshot — ceux sans
  // image ne peuvent pas être joués, les exclure ici évite tout fallback
  // vers une URL vide côté client.
  const allGames = await prisma.videoGame.findMany({
    where: { screenshots: { some: {} } },
    select: {
      id: true,
      name: true,
      screenshots: { select: { imageId: true } },
    },
  });

  if (allGames.length < BEAT_EIKICHI_CONFIG.QUESTIONS_PER_GAME) {
    throw new Error(
      `Pas assez de jeux exploitables (${allGames.length} avec screenshots). Lance le seed : npx tsx prisma/seeds/seed_beat_eikichi_igdb.ts`,
    );
  }

  const picked = sample(allGames, BEAT_EIKICHI_CONFIG.QUESTIONS_PER_GAME);

  return picked.map((game, index) => {
    // pick aléatoire d'un screenshot (la relation garantit length >= 1).
    const shot = game.screenshots[Math.floor(Math.random() * game.screenshots.length)];
    const imageUrl = igdbImageUrl(shot.imageId);
    return {
      position: index,
      gameId: game.id,
      name: game.name,
      // Aliases inutilisés côté validation (cf. CLAUDE.md) — on snapshot
      // un tableau vide pour rester compat avec le type de question.
      aliases: [],
      imageUrl,
    };
  });
}
