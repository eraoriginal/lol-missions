import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Missions START (début de partie)
const startMissions = [
    { text: "Ne pas acheter de bottes pendant les 10 premières minutes", category: "items", difficulty: "medium" },
    { text: "Acheter uniquement des objets qui commencent par la lettre de ton champion", category: "items", difficulty: "hard" },
    { text: "Rester dans ta lane pendant les 5 premières minutes", category: "position", difficulty: "easy" },
    { text: "Ne pas utiliser ton ultime avant le level 8", category: "sorts", difficulty: "medium" },
    { text: "Faire un firstblood", category: "combat", difficulty: "medium" },
    { text: "Ne pas mourir avant 10 minutes", category: "combat", difficulty: "medium" },
    { text: "Farmer 50 CS en 7 minutes", category: "roleplay", difficulty: "hard" },
    { text: "Voler le premier drake", category: "combat", difficulty: "hard" },
    { text: "Acheter un objet support en premier", category: "items", difficulty: "easy" },
    { text: "Jouer sans trinket pendant 5 minutes", category: "roleplay", difficulty: "medium" },
    { text: "Commencer par des objets de soin uniquement", category: "items", difficulty: "medium" },
    { text: "Tuer 3 champions avant 15 minutes", category: "combat", difficulty: "hard" },
    { text: "Ne pas retourner à la base avant 8 minutes", category: "position", difficulty: "hard" },
    { text: "Avoir 100% de participation aux kills d'équipe pendant 10 min", category: "combat", difficulty: "hard" },
    { text: "Finir avec 0 mort en early game (avant 10min)", category: "combat", difficulty: "medium" },
    { text: "Acheter les mêmes items que ton adversaire direct", category: "items", difficulty: "medium" },
    { text: "Ne pas utiliser de potions pendant 10 minutes", category: "roleplay", difficulty: "hard" },
    { text: "Placer 10 wards dans les 8 premières minutes", category: "position", difficulty: "medium" },
    { text: "Ne pas farmer de mobs neutres avant 12 minutes", category: "position", difficulty: "easy" },
    { text: "Acheter Boots of Mobility en premier objet", category: "items", difficulty: "easy" },
];

// Missions MID (5 minutes de jeu)
const midMissions = [
    { text: "Vendre tous tes items et recommencer ton build", category: "build", difficulty: "hard" },
    { text: "Acheter uniquement des objets défensifs jusqu'à la fin", category: "build", difficulty: "medium" },
    { text: "Ne plus utiliser ton sort Q", category: "combat", difficulty: "hard" },
    { text: "Faire 5 kills dans les 5 prochaines minutes", category: "score", difficulty: "hard" },
    { text: "Ne plus mourir jusqu'à la fin de la partie", category: "combat", difficulty: "hard" },
    { text: "Rester uniquement dans la jungle adverse", category: "position", difficulty: "hard" },
    { text: "Suivre un allié partout où il va pendant 3 minutes", category: "tactique", difficulty: "medium" },
    { text: "Farmer 100 CS dans les 5 prochaines minutes", category: "score", difficulty: "medium" },
    { text: "Détruire 2 tours dans les 10 prochaines minutes", category: "score", difficulty: "medium" },
    { text: "Ne plus retourner à la fontaine jusqu'à la fin", category: "position", difficulty: "hard" },
    { text: "Acheter 6 Doran items", category: "build", difficulty: "easy" },
    { text: "Ne plus utiliser de wards", category: "tactique", difficulty: "medium" },
    { text: "Voler le prochain Baron ou Dragon", category: "combat", difficulty: "hard" },
    { text: "Faire un pentakill", category: "combat", difficulty: "hard" },
    { text: "Avoir plus de dégâts aux structures que tous tes alliés", category: "score", difficulty: "medium" },
    { text: "Tank le plus de dégâts de ton équipe", category: "tactique", difficulty: "medium" },
    { text: "Avoir 100% KP jusqu'à la fin", category: "score", difficulty: "hard" },
    { text: "Construire full objets critiques", category: "build", difficulty: "medium" },
    { text: "Ne plus farm de minions, uniquement des kills", category: "tactique", difficulty: "hard" },
    { text: "Acheter Trinity Force même si ça ne fit pas ton champion", category: "build", difficulty: "easy" },
];

// Missions LATE (10+ minutes de jeu)
const lateMissions = [
    { text: "Termine la partie avec au moins 10 kills", category: "score", difficulty: "hard" },
    { text: "Ne meurs pas une seule fois jusqu'à la fin", category: "survie", difficulty: "hard" },
    { text: "Fais un pentakill avant la fin", category: "combat", difficulty: "hard" },
    { text: "Détruis au moins 3 tours ennemies", category: "objectif", difficulty: "medium" },
    { text: "Finis avec 300+ CS", category: "farm", difficulty: "medium" },
    { text: "Vole le Baron Nashor", category: "objectif", difficulty: "hard" },
    { text: "Gagne avec moins de 50% HP sur le Nexus", category: "clutch", difficulty: "hard" },
    { text: "Finis avec 20+ assists", category: "support", difficulty: "medium" },
    { text: "Achète 6 objets légendaires complets", category: "build", difficulty: "medium" },
    { text: "Fais la plus grosse série de kills de la partie", category: "combat", difficulty: "hard" },
    { text: "Inflige plus de 50,000 dégâts aux champions", category: "dégâts", difficulty: "hard" },
    { text: "Tank plus de 30,000 dégâts", category: "tank", difficulty: "medium" },
    { text: "Place 50+ wards", category: "vision", difficulty: "easy" },
    { text: "Détruis 20+ wards ennemis", category: "vision", difficulty: "medium" },
    { text: "Gagne en dansant sur le Nexus ennemi", category: "bm", difficulty: "easy" },
    { text: "Finis 1v5 et gagne", category: "héroïque", difficulty: "hard" },
    { text: "Vole 3 objectifs majeurs (Dragon/Baron)", category: "objectif", difficulty: "hard" },
    { text: "Termine avec un KDA supérieur à 10", category: "score", difficulty: "hard" },
    { text: "Porte ton équipe avec le MVP", category: "carry", difficulty: "hard" },
    { text: "Gagne sans perdre une seule inhibiteur", category: "domination", difficulty: "medium" },
];

async function main() {
    console.log('🌱 Seeding database...');

    // Supprime toutes les données existantes
    await prisma.playerMission.deleteMany();
    await prisma.player.deleteMany();
    await prisma.room.deleteMany();
    await prisma.mission.deleteMany();

    // Ajoute les missions START
    console.log('📝 Adding START missions...');
    for (const mission of startMissions) {
        await prisma.mission.create({
            data: {
                text: mission.text,
                type: 'START',
                category: mission.category,
                difficulty: mission.difficulty,
            },
        });
    }

    // Ajoute les missions MID
    console.log('📝 Adding MID missions...');
    for (const mission of midMissions) {
        await prisma.mission.create({
            data: {
                text: mission.text,
                type: 'MID',
                category: mission.category,
                difficulty: mission.difficulty,
            },
        });
    }

    // Ajoute les missions LATE
    console.log('📝 Adding LATE missions...');
    for (const mission of lateMissions) {
        await prisma.mission.create({
            data: {
                text: mission.text,
                type: 'LATE',
                category: mission.category,
                difficulty: mission.difficulty,
            },
        });
    }

    const missionCount = await prisma.mission.count();
    console.log(`✅ Seeding complete! ${missionCount} missions created.`);
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });