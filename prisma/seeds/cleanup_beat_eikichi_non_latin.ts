/**
 * Cleanup du catalogue Beat Eikichi : supprime les entrées non-latines.
 *
 * Règles :
 *   - Un **jeu** dont le `name` n'est pas en alphabet latin → supprimé (cascade).
 *   - Pour les jeux conservés, chaque **alias** non-latin est retiré du tableau
 *     (japonais, chinois, cyrillique, arabe, etc.). Le jeu reste matchable via
 *     son nom canonique + ses alias latins.
 *
 * Idempotent : on peut le relancer, il ne retouche rien de propre.
 *
 * Usage :
 *   npx tsx prisma/seeds/cleanup_beat_eikichi_non_latin.ts
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { isLatinOnly } from '../../lib/beatEikichi/isLatinOnly';

const prisma = new PrismaClient();

async function main() {
  const games = await prisma.videoGame.findMany({
    select: { id: true, name: true, aliases: true },
  });

  console.log(`📋 ${games.length} jeux à inspecter…\n`);

  let gamesDeleted = 0;
  let aliasesRemoved = 0;
  let gamesTouched = 0;

  for (const game of games) {
    if (!isLatinOnly(game.name)) {
      await prisma.videoGame.delete({ where: { id: game.id } });
      gamesDeleted++;
      console.log(`  🗑️  Jeu supprimé (nom non-latin) : « ${game.name} »`);
      continue;
    }

    const filteredAliases = game.aliases.filter((a) => isLatinOnly(a));
    const removedCount = game.aliases.length - filteredAliases.length;
    if (removedCount > 0) {
      await prisma.videoGame.update({
        where: { id: game.id },
        data: { aliases: filteredAliases },
      });
      aliasesRemoved += removedCount;
      gamesTouched++;
      console.log(
        `  ✂️  ${game.name} : ${removedCount} alias non-latin(s) retiré(s)`,
      );
    }
  }

  console.log(`\n🏁 Terminé.`);
  console.log(`   • ${gamesDeleted} jeu(x) supprimé(s)`);
  console.log(`   • ${aliasesRemoved} alias retiré(s) sur ${gamesTouched} jeu(x)`);
}

main()
  .catch((err) => {
    console.error('Erreur fatale :', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
