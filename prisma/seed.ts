import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Supprime les missions existantes
    try {
        // await prisma.playerMission.deleteMany();
        await prisma.player.deleteMany();
        await prisma.room.deleteMany();
        await prisma.mission.deleteMany();
        console.log('✅ Existing missions deleted');
    } catch (e) {
        console.log('⚠️ No existing missions to delete');
    }

    // ========================================
    // MISSIONS START (début de partie)
    // ========================================
    const startMissions = [
        // Missions publiques
        {
            text: "Finir la partie avec plus de 10 kills",
            type: "START",
            category: "Combat",
            difficulty: "medium",
            points: 200,
            isPrivate: false,
        },
        {
            text: "Ne pas mourir avant 10 minutes",
            type: "START",
            category: "Survie",
            difficulty: "easy",
            points: 100,
            isPrivate: false,
        },
        {
            text: "Faire un pentakill",
            type: "START",
            category: "Combat",
            difficulty: "hard",
            points: 500,
            isPrivate: false,
        },
        {
            text: "Finir avec le plus de dégâts de ton équipe",
            type: "START",
            category: "Combat",
            difficulty: "hard",
            points: 500,
            isPrivate: false,
        },
        {
            text: "Protéger un allié et l'empêcher de mourir 3 fois",
            type: "START",
            category: "Support",
            difficulty: "medium",
            points: 200,
            isPrivate: false,
        },
        {
            text: "Voler 3 kills à tes coéquipiers",
            type: "START",
            category: "Troll",
            difficulty: "easy",
            points: 100,
            isPrivate: false,
        },
        {
            text: "Tank plus de 50 000 dégâts",
            type: "START",
            category: "Tank",
            difficulty: "medium",
            points: 200,
            isPrivate: false,
        },
        {
            text: "Ne jamais acheter de ward",
            type: "START",
            category: "Troll",
            difficulty: "easy",
            points: 100,
            isPrivate: false,
        },

        // 🔒 Missions secrètes (privées)
        {
            text: "Ne jamais acheter de bottes pendant toute la partie",
            type: "START",
            category: "Handicap",
            difficulty: "medium",
            points: 200,
            isPrivate: true, // 🔒 SECRÈTE
        },
        {
            text: "Dire 'gg ez' dans le chat toutes les 2 minutes",
            type: "START",
            category: "Troll",
            difficulty: "easy",
            points: 100,
            isPrivate: true, // 🔒 SECRÈTE
        },
        {
            text: "Utiliser uniquement des sorts en cliquant (pas de raccourcis clavier)",
            type: "START",
            category: "Handicap",
            difficulty: "hard",
            points: 500,
            isPrivate: true, // 🔒 SECRÈTE
        },
        {
            text: "Acheter uniquement des objets qui commencent par la lettre B",
            type: "START",
            category: "Troll",
            difficulty: "medium",
            points: 200,
            isPrivate: true, // 🔒 SECRÈTE
        },
        {
            text: "Mourir exactement 7 fois, ni plus ni moins",
            type: "START",
            category: "Précision",
            difficulty: "hard",
            points: 500,
            isPrivate: true, // 🔒 SECRÈTE
        },
        {
            text: "Ne jamais attaquer le même ennemi que tes alliés",
            type: "START",
            category: "Handicap",
            difficulty: "hard",
            points: 500,
            isPrivate: true, // 🔒 SECRÈTE
        },
    ];

    // ========================================
    // MISSIONS MID (milieu de partie - 15s)
    // ========================================
    const midMissions = [
        // Missions publiques
        {
            text: "Faire un double kill dans les 2 prochaines minutes",
            type: "MID",
            category: "Combat",
            difficulty: "medium",
            points: 200,
            isPrivate: false,
        },
        {
            text: "Détruire une tourelle adverse",
            type: "MID",
            category: "Objectif",
            difficulty: "easy",
            points: 100,
            isPrivate: false,
        },
        {
            text: "Voler le Baron Nashor ou l'Ancien Dragon",
            type: "MID",
            category: "Objectif",
            difficulty: "hard",
            points: 500,
            isPrivate: false,
        },
        {
            text: "Faire 5 assists dans les 3 prochaines minutes",
            type: "MID",
            category: "Support",
            difficulty: "medium",
            points: 200,
            isPrivate: false,
        },
        {
            text: "Acheter un objet légendaire complet",
            type: "MID",
            category: "Farm",
            difficulty: "easy",
            points: 100,
            isPrivate: false,
        },
        {
            text: "Ne pas mourir pendant 5 minutes",
            type: "MID",
            category: "Survie",
            difficulty: "medium",
            points: 200,
            isPrivate: false,
        },
        {
            text: "Faire plus de 15 000 dégâts aux champions dans les 5 prochaines minutes",
            type: "MID",
            category: "Combat",
            difficulty: "hard",
            points: 500,
            isPrivate: false,
        },

        // 🔒 Missions secrètes (privées)
        {
            text: "Mourir intentionnellement dans les 30 prochaines secondes",
            type: "MID",
            category: "Suicide",
            difficulty: "easy",
            points: 100,
            isPrivate: true, // 🔒 SECRÈTE
        },
        {
            text: "Vendre tous tes objets et racheter des consommables uniquement",
            type: "MID",
            category: "Troll",
            difficulty: "medium",
            points: 200,
            isPrivate: true, // 🔒 SECRÈTE
        },
        {
            text: "Flash dans un mur et rester bloqué 5 secondes",
            type: "MID",
            category: "Troll",
            difficulty: "easy",
            points: 100,
            isPrivate: true, // 🔒 SECRÈTE
        },
        {
            text: "Suivre un coéquipier partout pendant 2 minutes (jamais à plus de 500 unités)",
            type: "MID",
            category: "Troll",
            difficulty: "easy",
            points: 100,
            isPrivate: true, // 🔒 SECRÈTE
        },
        {
            text: "Communiquer uniquement en emotes pendant 3 minutes",
            type: "MID",
            category: "Communication",
            difficulty: "easy",
            points: 100,
            isPrivate: true, // 🔒 SECRÈTE
        },
    ];

    // ========================================
    // MISSIONS LATE (fin de partie - 30s)
    // ========================================
    const lateMissions = [
        // Missions publiques
        {
            text: "Détruire le Nexus ennemi",
            type: "LATE",
            category: "Victoire",
            difficulty: "hard",
            points: 500,
            isPrivate: false,
        },
        {
            text: "Remporter le dernier teamfight",
            type: "LATE",
            category: "Combat",
            difficulty: "hard",
            points: 500,
            isPrivate: false,
        },
        {
            text: "Finir la partie sans mourir",
            type: "LATE",
            category: "Survie",
            difficulty: "hard",
            points: 500,
            isPrivate: false,
        },
        {
            text: "Avoir le meilleur KDA de la partie",
            type: "LATE",
            category: "Performance",
            difficulty: "hard",
            points: 500,
            isPrivate: false,
        },
        {
            text: "Faire un quadra ou pentakill avant la fin",
            type: "LATE",
            category: "Combat",
            difficulty: "hard",
            points: 500,
            isPrivate: false,
        },
        {
            text: "Sauver un allié d'une mort certaine",
            type: "LATE",
            category: "Support",
            difficulty: "medium",
            points: 200,
            isPrivate: false,
        },
        {
            text: "Détruire les 3 inhibiteurs ennemis",
            type: "LATE",
            category: "Objectif",
            difficulty: "hard",
            points: 500,
            isPrivate: false,
        },

        // 🔒 Missions secrètes (privées)
        {
            text: "Perdre la partie volontairement en initiant un mauvais fight",
            type: "LATE",
            category: "Sabotage",
            difficulty: "hard",
            points: 500,
            isPrivate: true, // 🔒 SECRÈTE
        },
        {
            text: "Acheter 6 bottes différentes avant la fin",
            type: "LATE",
            category: "Troll",
            difficulty: "medium",
            points: 200,
            isPrivate: true, // 🔒 SECRÈTE
        },
        {
            text: "Voler le Baron à ton équipe avec Smite",
            type: "LATE",
            category: "Troll",
            difficulty: "hard",
            points: 500,
            isPrivate: true, // 🔒 SECRÈTE
        },
        {
            text: "Finir la partie avec exactement 69 de farm",
            type: "LATE",
            category: "Précision",
            difficulty: "hard",
            points: 500,
            isPrivate: true, // 🔒 SECRÈTE
        },
        {
            text: "Danser sur le cadavre de chaque ennemi tué",
            type: "LATE",
            category: "BM",
            difficulty: "easy",
            points: 100,
            isPrivate: true, // 🔒 SECRÈTE
        },
        {
            text: "Spam ping '?' sur tes alliés pendant 1 minute",
            type: "LATE",
            category: "Toxic",
            difficulty: "easy",
            points: 100,
            isPrivate: true, // 🔒 SECRÈTE
        },
    ];

    // ========================================
    // INSERTION EN BASE
    // ========================================
    console.log('📝 Creating START missions...');
    for (const mission of startMissions) {
        await prisma.mission.create({ data: mission });
    }
    console.log(`✅ ${startMissions.length} START missions created (${startMissions.filter(m => m.isPrivate).length} secrètes)`);

    console.log('📝 Creating MID missions...');
    for (const mission of midMissions) {
        await prisma.mission.create({ data: mission });
    }
    console.log(`✅ ${midMissions.length} MID missions created (${midMissions.filter(m => m.isPrivate).length} secrètes)`);

    console.log('📝 Creating LATE missions...');
    for (const mission of lateMissions) {
        await prisma.mission.create({ data: mission });
    }
    console.log(`✅ ${lateMissions.length} LATE missions created (${lateMissions.filter(m => m.isPrivate).length} secrètes)`);

    const totalPublic = [...startMissions, ...midMissions, ...lateMissions].filter(m => !m.isPrivate).length;
    const totalPrivate = [...startMissions, ...midMissions, ...lateMissions].filter(m => m.isPrivate).length;

    console.log(`\n🎉 Seeding completed!`);
    console.log(`📊 Total: ${totalPublic + totalPrivate} missions`);
    console.log(`   - 👁️  ${totalPublic} missions publiques`);
    console.log(`   - 🔒 ${totalPrivate} missions secrètes`);
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });