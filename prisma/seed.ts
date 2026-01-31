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
        { text: "Finir la partie avec plus de 10 kills",                                          type: "START", category: "Combat",      difficulty: "medium", points: 200, isPrivate: false },
        { text: "Finir la partie avec plus de 20 kills",                                          type: "START", category: "Combat",      difficulty: "hard", points: 500, isPrivate: false },
        { text: "Ne pas mourir avant 5 minutes de jeu",                                           type: "START", category: "Survie",      difficulty: "easy",   points: 100, isPrivate: false },
        { text: "Faire un pentakill",                                                             type: "START", category: "Combat",      difficulty: "hard",   points: 500, isPrivate: false },
        { text: "Faire un quadrakill",                                                            type: "START", category: "Combat",      difficulty: "hard",   points: 500, isPrivate: false },
        { text: "Finir avec le plus de dégâts de ton équipe",                                     type: "START", category: "Combat",      difficulty: "hard",   points: 500, isPrivate: false },
        { text: "Finir avec le moins de dégâts de ton équipe",                                    type: "START", category: "Combat",      difficulty: "hard",   points: 500, isPrivate: false },
        { text: "Tank plus de 30 000 dégâts",                                                     type: "START", category: "Tank",        difficulty: "medium", points: 200, isPrivate: false },
        { text: "N'achète aucun item au début de la partie",                                      type: "START", category: "items",        difficulty: "easy", points: 100, isPrivate: false },
        { text: "Ne pas acheter de bottes pendant les 10 premières minutes",                      type: "START", category: "items",        difficulty: "easy", points: 100, isPrivate: false },
        { text: "Faire un firstblood",                                                          type: "START", category: "Combat",        difficulty: "hard", points: 500, isPrivate: false },
        { text: "Acheter un objet support en premier",                                      type: "START", category: "items",        difficulty: "medium", points: 200, isPrivate: false },
        { text: "Finir la partie avec aucun sbire tué",                                      type: "START", category: "Handicap",        difficulty: "hard", points: 500, isPrivate: false },
        { text: "Au début de la partie, faire un speech de motivation envers ton équipe",    type: "START", category: "Troll",        difficulty: "easy", points: 100, isPrivate: false },
        { text: "Au début de la partie, insulter l'équipe adverse",    type: "START", category: "Troll",        difficulty: "easy", points: 100, isPrivate: false },
        { text: "Prendre le sort d'invocateur Soins",                                                          type: "START", category: "Sort",        difficulty: "easy", points: 100, isPrivate: false },
        { text: "Prendre le sort d'invocateur Clarté",                                                          type: "START", category: "Sort",        difficulty: "medium", points: 200, isPrivate: false },
        { text: "Ne pas jouer avec ni Flash ni Fantôme",                                                          type: "START", category: "Sort",        difficulty: "hard", points: 500, isPrivate: false },
        { text: "Achète seulement des chapeaux en début de partie",                                                          type: "START", category: "items",        difficulty: "medium", points: 200, isPrivate: false },
        { text: "Met 3 points dans le A en début de partie",                                                          type: "START", category: "Handicap",        difficulty: "easy", points: 100, isPrivate: false },
        { text: "Met 3 points dans le Z en début de partie",                                                          type: "START", category: "Handicap",        difficulty: "easy", points: 100, isPrivate: false },
        { text: "Met 3 points dans le E en début de partie",                                                          type: "START", category: "Handicap",        difficulty: "easy", points: 100, isPrivate: false },
        { text: "Mourir exactement 7 fois, ni plus ni moins",                                     type: "START", category: "Précision",   difficulty: "hard",   points: 500, isPrivate: false  },
        { text: "Mourir exactement 8 fois, ni plus ni moins",                                     type: "START", category: "Précision",   difficulty: "hard",   points: 500, isPrivate: false  },
        { text: "Mourir exactement 9 fois, ni plus ni moins",                                     type: "START", category: "Précision",   difficulty: "hard",   points: 500, isPrivate: false  },

        // 🔒 Missions secrètes
        { text: "Acheter uniquement des objets qui commencent par la lettre de ton champion",     type: "START", category: "items",        difficulty: "hard", points: 500, isPrivate: true },
        { text: "Acheter les mêmes items qu'un adversaire unique pendant toute la partie",                                      type: "START", category: "items",        difficulty: "hard", points: 500, isPrivate: true },
        { text: "Acheter seulement des anneaux de Doran en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: true  },
        { text: "Acheter seulement des lames de Doran en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: true  },
        { text: "Acheter seulement des dagues en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: true  },
        { text: "Acheter seulement des poussières luisantes en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: true  },
        { text: "Acheter seulement des armures d'étoffe en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: true  },
        { text: "Acheter seulement des épées longues en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: true  },
        { text: "Acheter seulement des capes de néant en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: true  },
        { text: "Acheter seulement des cristal de rubis en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: true  },
        { text: "Acheter seulement des larmes de la déesse en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: true  },
        { text: "Acheter seulement des cristal de saphir en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: true  },
        { text: "Acheter seulement des charmes féérique en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: true  },
        { text: "Acheter seulement des collier rafraîchissants en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: true  },
        { text: "Acheter seulement des tomes d'amplification en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: true  },
        { text: "Acheter seulement des potions en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: true  },
        { text: "Acheter seulement des bottes en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: true  },
        { text: "Ne pas faire plus de 4 kills",                                     type: "START", category: "Précision",   difficulty: "hard",   points: 500, isPrivate: true  },
        { text: "Être le joueur avec le plus de morts de la partie",                                     type: "START", category: "Précision",   difficulty: "hard",   points: 500, isPrivate: true  },
        { text: "Être le joueur avec le moins de morts de la partie",                                     type: "START", category: "Précision",   difficulty: "hard",   points: 500, isPrivate: true  },


        { text: "Dire 'gg ez' dans le chat toutes les 2 minutes",                                 type: "START", category: "Troll",       difficulty: "easy",   points: 100, isPrivate: true  },
        { text: "Utiliser uniquement des sorts en cliquant (pas de raccourcis clavier)",          type: "START", category: "Handicap",    difficulty: "hard",   points: 500, isPrivate: true  },
        { text: "Acheter uniquement des objets qui commencent par la lettre B",                   type: "START", category: "Troll",       difficulty: "medium", points: 200, isPrivate: true  },
        { text: "Ne jamais attaquer le même ennemi que tes alliés",                               type: "START", category: "Handicap",    difficulty: "hard",   points: 500, isPrivate: true  },
    ];

    // ========================================
    // MISSIONS MID (milieu de partie - 15s)
    // ========================================
    const midMissions = [
        // Missions publiques
        { text: "Acheter uniquement des objets défensifs jusqu'à la fin",                            type: "MID", category: "Build",        difficulty: "medium", points: 200, isPrivate: false },
        { text: "Construire full objets critiques jusqu'à la fin",                            type: "MID", category: "Build",        difficulty: "medium", points: 200, isPrivate: false },
        { text: "Acheter uniquement des objets AP jusqu'à la fin",                        type: "MID", category: "Build",        difficulty: "medium", points: 200, isPrivate: false },
        { text: "Acheter uniquement des objets AD jusqu'à la fin",                        type: "MID", category: "Build",        difficulty: "medium", points: 200, isPrivate: false },
        { text: "Acheter uniquement des objets de vitesse d'attaque",                    type: "MID", category: "Build",        difficulty: "medium", points: 200, isPrivate: false },
        { text: "Acheter un élixir et ne jamais l'utiliser",                       type: "MID", category: "Survie",       difficulty: "hard", points: 500, isPrivate: false },
        { text: "Faire l'éloge de l'équipe adverse dans le chat",                       type: "MID", category: "Communication",       difficulty: "easy", points: 100, isPrivate: false },
        { text: "Insulter et provoquer l'équipe adverse en vocal",                       type: "MID", category: "Toxic",       difficulty: "easy", points: 100, isPrivate: false },
        { text: "Acheter un objet complètement inutile pour ton champion",               type: "MID", category: "Troll",        difficulty: "easy",   points: 100, isPrivate: false },
        { text: "Change ton build et imite celui d'un coéquipier jusqu'à la fin",                            type: "MID", category: "Build",        difficulty: "medium", points: 200, isPrivate: false },
        { text: "Acheter 5 chapeaux",                                                  type: "MID", category: "items",      difficulty: "easy",   points: 100, isPrivate: false },
        { text: "Vendre ses bottes et ne pas utiliser la fonction Annuler",                                                  type: "MID", category: "items",      difficulty: "easy",   points: 100, isPrivate: false },
        { text: "Retourne à la fontaine à pied, puis retourne auprès de tes coéquipiers sans utiliser de téléportation",                                  type: "MID", category: "Troll",       difficulty: "easy", points: 100, isPrivate: false },
        { text: "Ne pas mourir pendant 5 minutes, tu dois annoncer la mission en vocal",        type: "MID", category: "Survie",        difficulty: "hard", points: 500, isPrivate: false },
        { text: "Se faire exécuter d'ici la fin de la partie, tu dois annoncer la mission en vocal",        type: "MID", category: "Suicide",        difficulty: "hard", points: 500, isPrivate: false },


        // 🔒 Missions secrètes
        { text: "Annoncer un fake plan et le répéter pendant 2 minutes", type: "MID", category: "Communication", difficulty: "easy", points: 100, isPrivate: true },
        { text: "Utiliser ton ultime dès qu'il est disponible (+ ou - 5 secondes) jusqu'à la fin de la partie",                       type: "MID", category: "Handicap",    difficulty: "hard", points: 500, isPrivate: true  },
        { text: "Utiliser ton ultime complètement dans le vide 3 fois de suite",                          type: "MID", category: "Troll",        difficulty: "easy",   points: 100, isPrivate: true },
        { text: "Mourir sous la tour ennemie volontairement",                             type: "MID", category: "Suicide",      difficulty: "easy",   points: 100, isPrivate: true },
        { text: "Mourir intentionnellement dans les 30 prochaines secondes",                     type: "MID", category: "Suicide",       difficulty: "easy",   points: 100, isPrivate: true  },
        { text: "Mourir intentionnellement 3 fois dès que tu spawn",                     type: "MID", category: "Suicide",       difficulty: "medium",   points: 200, isPrivate: true  },
        { text: "Vendre un objet complet (hors bottes) et ne pas utiliser la fonction Annuler",                 type: "MID", category: "Troll",         difficulty: "medium", points: 200, isPrivate: true  },
        { text: "Flash dans un mur, si pas de flash alors utilise tes 2 sorts d'invocateur immédiatement",                                  type: "MID", category: "Troll",         difficulty: "easy",   points: 100, isPrivate: true  },
        { text: "Suivre un coéquipier partout pendant 3 minutes (jamais à plus de 500 unités)",  type: "MID", category: "Troll",         difficulty: "easy",   points: 100, isPrivate: true  },
        { text: "Imiter le rire de Eikichi 3 fois de suite",  type: "MID", category: "Troll",         difficulty: "easy",   points: 100, isPrivate: true  },
        { text: "Gémir de plaisir et faire en sorte que ce soit mémorable",  type: "MID", category: "Troll",         difficulty: "easy",   points: 100, isPrivate: true  },
        { text: "Lancer tout les sons de la soundboard Discord toutes les 3 minutes jusqu'à la fin de la partie",  type: "MID", category: "Troll",         difficulty: "easy",   points: 100, isPrivate: true  },
        { text: "Communiquer uniquement en ping pendant 3 minutes",                             type: "MID", category: "Communication", difficulty: "easy",   points: 100, isPrivate: true  },
        { text: "Commente toutes tes actions pendant 3 minutes (sorts, déplacements, achat, absolument tout)",                             type: "MID", category: "Communication", difficulty: "easy",   points: 100, isPrivate: true  },
        { text: "Se plaindre d'un coéquipier avec véhémence pendant 1 minute",                             type: "MID", category: "Toxic", difficulty: "easy",   points: 100, isPrivate: true  },
        { text: "Regarder ses coéquipiers mourir et taunt avec au moins 80% de barre de vie",                             type: "MID", category: "Combat", difficulty: "easy",   points: 100, isPrivate: true  },
    ];

    // ========================================
    // MISSIONS LATE (fin de partie - 30s)
    // ========================================
    const lateMissions = [
        // Missions publiques
        { text: "Crier 'WORTH' après chaque mort", type: "LATE", category: "Communication", difficulty: "easy", points: 100, isPrivate: false },
        { text: "Prendre le TP adverse",                                                 type: "LATE", category: "Combat",      difficulty: "medium",   points: 200, isPrivate: false },
        { text: "Faire un discours dramatique avant un teamfight", type: "LATE", category: "Communication", difficulty: "easy", points: 100, isPrivate: false },
        { text: "Tu ne peux pas avoir plus de 4 items",                        type: "LATE", category: "Build",        difficulty: "hard", points: 500, isPrivate: false },
        { text: "Crier 'PAS GRAVE' après chaque mort alliée", type: "LATE", category: "Mental", difficulty: "easy", points: 100, isPrivate: false },
        { text: "Faire un discours de coach sportif après chaque défaite de fight", type: "LATE", category: "Communication", difficulty: "easy", points: 100, isPrivate: false },
        { text: "Acheter un Coiffe de Rabadon", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false },
        { text: "Acheter un Sablier de Zhonya", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false },
        { text: "Acheter un Bâton du vide", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false },
        { text: "Acheter un Fléau de Liche", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false },
        { text: "Acheter une Dent de Nashor", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false },

        { text: "Acheter une Soif-de-sang", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false },
        { text: "Acheter une Lame du roi déchu", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false },
        { text: "Acheter une Lame d'infini", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false },
        { text: "Acheter un Canon ultrarapide", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false },
        { text: "Acheter une Danse fantôme", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false },

        { text: "Acheter une Égide solaire", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false },
        { text: "Acheter une Armure de Warmog", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false },
        { text: "Acheter une Cotte épineuse", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false },
        { text: "Acheter une Plaque du mort", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false },
        { text: "Acheter un Visage spirituel", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false },

        { text: "Acheter une Force de la nature", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false },
        { text: "Acheter un Gage de Sterak", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false },
        { text: "Acheter une Cleaver noire", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false },
        { text: "Acheter un Masque abyssal", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false },

        // 🔒 Missions secrètes
        { text: "Quitter le fight en annonçant 'j'ai plus de mana' alors que c'est faux", type: "LATE", category: "Troll", difficulty: "easy", points: 100, isPrivate: true },
        { text: "Blâmer un coéquipier aléatoire à l'écran de fin", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true },
        { text: "Écrire 'ez' à chaque kill", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true },
        { text: "Acheter un objet totalement inutile et l'annoncer comme OP auprès d'Al4r1c. Le débat doit durer    1 minute", type: "LATE", category: "Troll", difficulty: "easy", points: 100, isPrivate: true },
        { text: "Annoncer un repli collectif et engager seul. Une réaction d'incompréhension de tes coéquipiers doit être audible", type: "LATE", category: "Combat", difficulty: "medium", points: 200, isPrivate: true },
        { text: "Écrire '???' dans le chat après chaque mort ennemie", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true },
        { text: "Te plaindre du manque de dégâts du joueur le plus fort de ton équipe", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true },
        { text: "Finir la partie avec exactement 69 de farm",                                     type: "LATE", category: "Précision",   difficulty: "hard",   points: 500, isPrivate: true  },
        { text: "Finir la partie avec exactement 21 kills",                                     type: "LATE", category: "Précision",   difficulty: "hard",   points: 500, isPrivate: true  },
        { text: "Danser sur le cadavre de chaque ennemi tué",                                     type: "LATE", category: "Toxic",          difficulty: "easy",   points: 100, isPrivate: true  },
        { text: "Annoncer un plan génial et faire strictement l'inverse", type: "LATE", category: "Communication", difficulty: "easy", points: 100, isPrivate: true },
        { text: "Annoncer un plan catastrophique et l'exécuter. Ton équipe doit se faire ACE", type: "LATE", category: "Combat", difficulty: "hard", points: 500, isPrivate: true },
        { text: "Spam ping '?' sur le joueur avec le plus de kills pendant 3 minutes", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true },
        { text: "Spam ping '?' sur tes alliés pendant 4 minutes",                                  type: "LATE", category: "Toxic",       difficulty: "easy",   points: 100, isPrivate: true  },
        { text: "Accuser le lag après chaque mort", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true },
        { text: "Après chaque kill de ta part, crier le nom de ta ville bien fort",                                  type: "LATE", category: "Toxic",       difficulty: "easy",   points: 100, isPrivate: true  },
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