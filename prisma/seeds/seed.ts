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
        { text: "Finir la partie avec plus de 10 kills",                                          type: "START", category: "Combat",      difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec plus de 20 kills",                                          type: "START", category: "Combat",      difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Ne pas mourir avant 5 minutes de jeu",                                           type: "START", category: "Survie",      difficulty: "easy",   points: 100, isPrivate: false, maps: "all" },
        { text: "Faire un pentakill",                                                             type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all" },
        { text: "Faire un quadrakill",                                                            type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all" },
        { text: "Finir avec le plus de dégâts de ton équipe",                                     type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all" },
        { text: "Finir avec le moins de dégâts de ton équipe",                                    type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all" },
        { text: "Tank plus de 30 000 dégâts",                                                     type: "START", category: "Tank",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "N'achète aucun item au début de la partie",                                      type: "START", category: "items",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Ne pas acheter de bottes pendant les 10 premières minutes",                      type: "START", category: "items",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Faire un firstblood",                                                          type: "START", category: "Combat",        difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Acheter un objet support en premier",                                      type: "START", category: "items",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec aucun sbire tué",                                      type: "START", category: "Handicap",        difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Au début de la partie, faire un speech de motivation envers ton équipe",    type: "START", category: "Troll",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Prendre le sort d'invocateur Soin",                                                          type: "START", category: "Sort",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Prendre le sort d'invocateur Clarté",                                                          type: "START", category: "Sort",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Prendre les sorts d'invocateur Soin et Clarté",                                                          type: "START", category: "Sort",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Ne joue ni avec Flash ni avec Fantôme",                                                          type: "START", category: "Sort",        difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Achète seulement des chapeaux en début de partie",                                                          type: "START", category: "items",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Augmente en priorité le sort A",                                                          type: "START", category: "Handicap",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Augmente en priorité le sort Z",                                                          type: "START", category: "Handicap",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Augmente en priorité le sort E",                                                          type: "START", category: "Handicap",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Mourir exactement 7 fois, ni plus ni moins",                                     type: "START", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: false, maps: "all"  },
        { text: "Mourir exactement 8 fois, ni plus ni moins",                                     type: "START", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: false, maps: "all"  },
        { text: "Mourir exactement 9 fois, ni plus ni moins",                                     type: "START", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: false, maps: "all"  },
        { text: "Acheter seulement des anneaux de Doran en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter seulement des lames de Doran en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter seulement des dagues en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter seulement des poussières luisantes en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter seulement des armures d'étoffe en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter seulement des épées longues en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter seulement des capes de néant en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter seulement des cristal de rubis en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter seulement des larmes de la déesse en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter seulement des cristal de saphir en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter seulement des charmes féérique en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter seulement des collier rafraîchissants en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter seulement des tomes d'amplification en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter seulement des potions en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter seulement des bottes en début de partie",                       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },

        // 🔒 Missions secrètes
        { text: "Acheter uniquement des objets qui commencent par la lettre de ton champion (hors bottes)",     type: "START", category: "items",        difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Acheter les mêmes items qu'un adversaire unique pendant toute la partie",                                      type: "START", category: "items",        difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Ne pas faire plus de 7 kills",                                     type: "START", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: true, maps: "all"  },
        { text: "Encenser le mode ARAM toutes en finissant par \"N'est ce pas Thomas?\". Le faire 3 fois. Si tu es Thomas, demande pardon à tout le monde.",                                     type: "START", category: "Vocal",   difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Avoir le plus de morts de la partie. Tu ne dois pas être à égalité avec un autre joueur",                                     type: "START", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: true, maps: "all"  },
        { text: "Avoir le moins de morts de la partie. Tu ne dois pas être à égalité avec un autre joueur",                                     type: "START", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: true, maps: "all"  },
        { text: "Faire danser tout le monde en début de partie",                                     type: "START", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: true, maps: "all"  },
        { text: "Au début de la partie, insulter l'équipe adverse",    type: "START", category: "Troll",        difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Dicter les builds de tes coéquipiers comme Al4r1c. Si tu es Al4r1c, achète 2 sceptres de Rylai", type: "START", category: "Vocal", difficulty: "medium", points: 200, isPrivate: true, maps: "all" },
        { text: "Écrire '???' dans le chat après chaque mort ennemie", type: "START", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" }

    ];

    // ========================================
    // MISSIONS MID (milieu de partie - 15s)
    // ========================================
    const midMissions = [
        // Missions publiques
        { text: "Acheter une Rédemption",                            type: "MID", category: "Build",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un médaillon de Solari",                            type: "MID", category: "Build",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Protobelt",                            type: "MID", category: "Build",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter uniquement des objets défensifs jusqu'à la fin",                            type: "MID", category: "Build",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Construire full objets critiques jusqu'à la fin",                            type: "MID", category: "Build",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter uniquement des objets AP jusqu'à la fin",                        type: "MID", category: "Build",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter uniquement des objets AD jusqu'à la fin",                        type: "MID", category: "Build",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter uniquement des objets de vitesse d'attaque",                    type: "MID", category: "Build",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter un élixir et ne jamais l'utiliser",                       type: "MID", category: "Survie",       difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Faire l'éloge de l'équipe adverse dans le chat avec un minimum de 7 phrases",                       type: "MID", category: "Communication",       difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un objet complètement inutile pour ton champion",               type: "MID", category: "Troll",        difficulty: "easy",   points: 100, isPrivate: false, maps: "all" },
        { text: "Change ton build et imite celui d'un coéquipier jusqu'à la fin",                            type: "MID", category: "Build",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter 5 chapeaux",                                                  type: "MID", category: "items",      difficulty: "easy",   points: 100, isPrivate: false, maps: "all" },
        { text: "Vendre ses bottes et ne pas utiliser la fonction Annuler",                                                  type: "MID", category: "items",      difficulty: "easy",   points: 100, isPrivate: false, maps: "all" },
        { text: "Retourne à la fontaine à pied, puis retourne auprès de tes coéquipiers sans utiliser de téléportation",                                  type: "MID", category: "Troll",       difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Ne pas mourir pendant 5 minutes, tu dois annoncer la mission en vocal",        type: "MID", category: "Survie",        difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Se faire exécuter d'ici la fin de la partie, tu dois annoncer la mission en vocal",        type: "MID", category: "Suicide",        difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Vendre un objet complet (hors bottes) et ne pas utiliser la fonction Annuler",                 type: "MID", category: "Troll",         difficulty: "medium", points: 200, isPrivate: false, maps: "all"  },
        { text: "Flash dans un mur, si pas de flash alors utilise tes 2 sorts d'invocateur immédiatement",                                  type: "MID", category: "Troll",         difficulty: "easy",   points: 100, isPrivate: false, maps: "all"  },


        // 🔒 Missions secrètes
        { text: "Insulter et provoquer l'équipe adverse en vocal",                       type: "MID", category: "Toxic",       difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Annoncer un fake plan et le répéter avec insistance", type: "MID", category: "Communication", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Utiliser ton ultime dès qu'il est disponible (+ ou - 5 secondes) jusqu'à la fin de la partie",                       type: "MID", category: "Handicap",    difficulty: "hard", points: 300, isPrivate: true, maps: "all"  },
        { text: "Utiliser ton ultime complètement dans le vide 3 fois de suite",                          type: "MID", category: "Troll",        difficulty: "easy",   points: 100, isPrivate: true, maps: "all" },
        { text: "Mourir sous la tour ennemie volontairement",                             type: "MID", category: "Suicide",      difficulty: "easy",   points: 100, isPrivate: true, maps: "all" },
        { text: "Mourir intentionnellement dans les 30 prochaines secondes",                     type: "MID", category: "Suicide",       difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Mourir intentionnellement 3 fois dès que tu spawn",                     type: "MID", category: "Suicide",       difficulty: "medium",   points: 200, isPrivate: true, maps: "all"  },
        { text: "Suivre un coéquipier partout pendant 3 minutes (jamais à plus de 500 unités)",  type: "MID", category: "Troll",         difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Imiter le rire de Eikichi 3 fois de suite",  type: "MID", category: "Troll",         difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Gémir de plaisir et faire en sorte que ce soit mémorable",  type: "MID", category: "Troll",         difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Lancer tout les sons de la soundboard Discord 3 fois durant la partie",  type: "MID", category: "Troll",         difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Communiquer uniquement en ping pendant 5 minutes",                             type: "MID", category: "Communication", difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Commente toutes tes actions pendant 1 minute (sorts, déplacements, achat, absolument tout)",                             type: "MID", category: "Communication", difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Se plaindre d'un coéquipier avec véhémence pendant 1 minute",                             type: "MID", category: "Toxic", difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Regarder ses coéquipiers mourir et taunt avec au moins 80% de barre de vie",                             type: "MID", category: "Combat", difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Alft F4 en plein teamfight",                             type: "MID", category: "Combat", difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Remercier Era pour ce jeu incroyable", type: "MID", category: "Vocal", difficulty: "medium", points: 200, isPrivate: true, maps: "all" }

    ];

    // ========================================
    // MISSIONS LATE (fin de partie - 30s)
    // ========================================
    const lateMissions = [
        // Missions publiques
        { text: "Crier 'WORTH' après chaque mort", type: "LATE", category: "Communication", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Prendre le TP adverse",                                                 type: "LATE", category: "Combat",      difficulty: "medium",   points: 200, isPrivate: false, maps: "all" },
        { text: "Faire un discours dramatique avant un teamfight", type: "LATE", category: "Communication", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Tu ne peux pas avoir plus de 5 items",                        type: "LATE", category: "Build",        difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Crier 'PAS GRAVE' après chaque mort alliée", type: "LATE", category: "Mental", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Faire un discours de coach sportif après chaque défaite de fight", type: "LATE", category: "Communication", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Coiffe de Rabadon", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Sablier de Zhonya", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Bâton du vide", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Fléau de Liche", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Dent de Nashor", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },

        { text: "Acheter une Soif-de-sang", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Lame du roi déchu", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Lame d'infini", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Canon ultrarapide", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Danse fantôme", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },

        { text: "Acheter une Égide solaire", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Armure de Warmog", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Cotte épineuse", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Plaque du mort", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Visage spirituel", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },

        { text: "Acheter une Force de la nature", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Gage de Sterak", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Cleaver noire", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Masque abyssal", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },

        // 🔒 Missions secrètes
        { text: "Quitter le fight en annonçant 'j'ai plus de mana' alors que c'est faux", type: "LATE", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Blâmer un coéquipier aléatoire à l'écran de fin", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Écrire 'E Z à chaque kill", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Acheter un objet totalement inutile et l'annoncer comme OP auprès d'Al4r1c. Le débat doit durer 1 minute. Si tu es Al4r1c, achète un sceptre de Rylai", type: "LATE", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Annoncer un repli collectif et engager seul. Une réaction d'incompréhension de tes coéquipiers doit être audible", type: "LATE", category: "Combat", difficulty: "medium", points: 200, isPrivate: true, maps: "all" },
        { text: "Te plaindre du manque de dégâts du joueur le plus fort de ton équipe", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Finir la partie avec exactement 69 de farm",                                     type: "LATE", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: true, maps: "all"  },
        { text: "Finir la partie avec exactement 21 kills",                                     type: "LATE", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: true, maps: "all"  },
        { text: "Durant la prochaine minute, danse sur le cadavre de chaque ennemi tué et chante Billie Jean",                                     type: "LATE", category: "Toxic",          difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Annoncer un plan génial et faire strictement l'inverse", type: "LATE", category: "Communication", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Annoncer un plan catastrophique et l'exécuter. Ton équipe doit se faire ACE", type: "LATE", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Spam ping '?' sur le joueur avec le plus de kills pendant 2 minutes", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Spam ping '?' sur tes alliés pendant 2 minutes",                                  type: "LATE", category: "Toxic",       difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Accuser le lag et ta freebox après chaque mort", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Après chaque kill de ta part, crier le nom de ta ville bien fort",                                  type: "LATE", category: "Toxic",       difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  }
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