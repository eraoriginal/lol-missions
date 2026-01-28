import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Échantillon de missions pour tester
const START_MISSIONS = [
    // Combat (5)
    { text: "Tu ne peux attaquer que depuis un buisson", type: 'START', category: 'combat', difficulty: 'hard' },
    { text: "Tu n'as pas le droit de prendre de kill (0 kill maximum)", type: 'START', category: 'combat', difficulty: 'hard' },
    { text: "Tu ne peux attaquer que les ennemis qui ont moins de 50% HP", type: 'START', category: 'combat', difficulty: 'medium' },
    { text: "Tu ne peux utiliser que tes sorts (pas d'auto-attaques)", type: 'START', category: 'combat', difficulty: 'medium' },
    { text: "Tu dois annoncer dans /all avant chaque kill que tu vas faire", type: 'START', category: 'combat', difficulty: 'easy' },

    // Items (5)
    { text: "Tu dois revendre ton 1er item acheté après l'avoir acheté", type: 'START', category: 'items', difficulty: 'easy' },
    { text: "Tu ne peux acheter que des items de support", type: 'START', category: 'items', difficulty: 'hard' },
    { text: "Tu ne peux pas acheter de bottes pendant toute la game", type: 'START', category: 'items', difficulty: 'medium' },
    { text: "Tous tes items doivent commencer par la même lettre", type: 'START', category: 'items', difficulty: 'medium' },
    { text: "Tu dois copier exactement le build d'un allié", type: 'START', category: 'items', difficulty: 'easy' },

    // Position (5)
    { text: "Tu dois toujours être le plus proche de l'ennemi dans ton équipe", type: 'START', category: 'position', difficulty: 'hard' },
    { text: "Tu dois toujours rester derrière tous tes alliés", type: 'START', category: 'position', difficulty: 'medium' },
    { text: "Tu ne peux pas traverser le milieu de la lane (reste sur un côté)", type: 'START', category: 'position', difficulty: 'easy' },
    { text: "Tu ne peux pas rester immobile plus de 2 secondes", type: 'START', category: 'position', difficulty: 'hard' },
    { text: "Tu dois rester dans la moitié de map de ton équipe", type: 'START', category: 'position', difficulty: 'easy' },

    // Sorts (3)
    { text: "Tu ne peux utiliser qu'un seul sort (Q, W, E ou R) au choix", type: 'START', category: 'sorts', difficulty: 'hard' },
    { text: "Tu dois utiliser ton ultime dès que c'est disponible", type: 'START', category: 'sorts', difficulty: 'medium' },
    { text: "Tu ne peux jamais utiliser ton ultime", type: 'START', category: 'sorts', difficulty: 'hard' },

    // Roleplay (2)
    { text: "Tu es un pacifiste : pas d'attaque tant que tu n'es pas attaqué", type: 'START', category: 'roleplay', difficulty: 'hard' },
    { text: "Tu es le bodyguard d'un allié choisi (reste collé à lui)", type: 'START', category: 'roleplay', difficulty: 'medium' },
];

const MID_MISSIONS = [
    // Build (5)
    { text: "Vends ton item le plus cher et achète 6 bottes", type: 'MID', category: 'build', difficulty: 'hard' },
    { text: "Vends tous tes items et reconstruis un build AP/AD (inverse)", type: 'MID', category: 'build', difficulty: 'hard' },
    { text: "Achète uniquement des items actifs à partir de maintenant", type: 'MID', category: 'build', difficulty: 'medium' },
    { text: "Vends tout et ne garde que des potions et wards", type: 'MID', category: 'build', difficulty: 'hard' },
    { text: "Double ton item le plus cher si possible (achète le même 2 fois)", type: 'MID', category: 'build', difficulty: 'easy' },

    // Combat (5)
    { text: "Tu ne peux plus toucher le champion que tu as tué le plus", type: 'MID', category: 'combat', difficulty: 'medium' },
    { text: "Tu dois focus uniquement le champion qui t'a tué le plus", type: 'MID', category: 'combat', difficulty: 'easy' },
    { text: "Change de target à chaque auto-attaque", type: 'MID', category: 'combat', difficulty: 'hard' },
    { text: "Laisse toujours le kill à un allié (stop à 5% HP ennemi)", type: 'MID', category: 'combat', difficulty: 'medium' },
    { text: "Tu dois protéger le joueur avec le plus de morts dans ton équipe", type: 'MID', category: 'combat', difficulty: 'easy' },

    // Score (4)
    { text: "Tu dois égaliser ton nombre de kills et deaths", type: 'MID', category: 'score', difficulty: 'hard' },
    { text: "Tu dois finir avec un KDA parfait (0 death)", type: 'MID', category: 'score', difficulty: 'hard' },
    { text: "Tu dois atteindre exactement 100 CS (pas plus, pas moins)", type: 'MID', category: 'score', difficulty: 'medium' },
    { text: "Dépense exactement tout ton or (0 gold en banque)", type: 'MID', category: 'score', difficulty: 'easy' },

    // Position (3)
    { text: "Tu ne peux plus entrer dans les buissons", type: 'MID', category: 'position', difficulty: 'easy' },
    { text: "Tu dois rester dans les buissons le plus possible", type: 'MID', category: 'position', difficulty: 'medium' },
    { text: "Reste toujours à max range de tes capacités", type: 'MID', category: 'position', difficulty: 'medium' },

    // Tactique (3)
    { text: "Pose 10 wards (achète des pinks)", type: 'MID', category: 'tactique', difficulty: 'easy' },
    { text: "Détruis 5 wards ennemies", type: 'MID', category: 'tactique', difficulty: 'medium' },
    { text: "Tu dois faire au moins 3 assists sur les 5 prochains kills", type: 'MID', category: 'tactique', difficulty: 'medium' },
];

async function main() {
    console.log('🌱 Seeding database...');

    // Nettoyer les anciennes données
    await prisma.playerMission.deleteMany();
    await prisma.player.deleteMany();
    await prisma.room.deleteMany();
    await prisma.mission.deleteMany();

    // Insérer les missions START
    for (const mission of START_MISSIONS) {
        await prisma.mission.create({
            data: mission,
        });
    }

    // Insérer les missions MID
    for (const mission of MID_MISSIONS) {
        await prisma.mission.create({
            data: mission,
        });
    }

    const startCount = await prisma.mission.count({ where: { type: 'START' } });
    const midCount = await prisma.mission.count({ where: { type: 'MID' } });

    console.log(`✅ ${startCount} missions START créées`);
    console.log(`✅ ${midCount} missions MID créées`);
    console.log('✨ Seeding terminé !');
}

main()
    .catch((e) => {
        console.error('❌ Erreur lors du seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });