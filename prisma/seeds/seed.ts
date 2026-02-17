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
    } catch {
        console.log('⚠️ No existing missions to delete');
    }

    // ========================================
    // MISSIONS START (début de partie)
    // ========================================
    const startMissions = [
        // Missions publiques
        { text: "Tu ne peux acheter que des objets complets",                                                                   type: "START", category: "Build",      difficulty: "easy",   points: 100, isPrivate: false, maps: "all" },
        { text: "Obtenir le premier sang",                                                                                      type: "START", category: "Combat",      difficulty: "medium",   points: 200, isPrivate: false, maps: "all" },
        { text: "Ne pas mourir avant 5 minutes de jeu",                                                                         type: "START", category: "Survie",      difficulty: "easy",   points: 100, isPrivate: false, maps: "all" },
        { text: "N'achète aucun item au début de la partie",                                                                    type: "START", category: "Build",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Ne pas acheter de bottes pendant les 10 premières minutes",                                                    type: "START", category: "Build",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Au début de la partie, faire un speech de motivation envers ton équipe",                                       type: "START", category: "Troll",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Prendre le sort d'invocateur Soin",                                                                            type: "START", category: "Sort",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Prendre le sort d'invocateur Clarté",                                                                          type: "START", category: "Sort",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Lames de Doran en début de partie. Vente autorisée après la seconde mort",          type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Dague en début de partie. Vente autorisée après la seconde mort",                   type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Poussières luisante en début de partie. Vente autorisée après la seconde mort",     type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Armure d'étoffe en début de partie. Vente autorisée après la seconde mort",         type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Epée longue en début de partie. Vente autorisée après la seconde mort",             type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Cape de néant en début de partie. Vente autorisée après la seconde mort",           type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Cristal de rubis en début de partie. Vente autorisée après la seconde mort",        type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Cristal de saphir en début de partie. Vente autorisée après la seconde mort",       type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Charme féérique en début de partie. Vente autorisée après la seconde mort",         type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Collier rafraîchissant en début de partie. Vente autorisée après la seconde mort",  type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Tome d'amplification en début de partie. Vente autorisée après la seconde mort",    type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Potion en début de partie. Vente autorisée après la seconde mort",                  type: "START", category: "Handicap",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Augmente en priorité le sort A",                                                                               type: "START", category: "Handicap",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Augmente en priorité le sort Z",                                                                               type: "START", category: "Handicap",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Augmente en priorité le sort E",                                                                               type: "START", category: "Handicap",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter des items de couleur verte",                                                                           type: "START", category: "Build",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter des items de couleur violette",                                                                        type: "START", category: "Build",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter des items de couleur bleue",                                                                           type: "START", category: "Build",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter des items de couleur jaune",                                                                           type: "START", category: "Build",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Acheter des items de couleur rouge",                                                                           type: "START", category: "Build",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Avoir que des objets ayant une caractéristique vitesse de déplacement",                                        type: "START", category: "Build",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Avoir seulement des objets vol de vie ou omnivampirisme (hors bottes)",                                        type: "START", category: "Build",    difficulty: "easy", points: 100, isPrivate: false, maps: "all"  },
        { text: "Être le joueur de ton équipe qui inflige le plus de dégâts aux tourelles",                                     type: "START", category: "Portugais",    difficulty: "hard", points: 300, isPrivate: false, maps: "all"  },
        { text: "Faire un total de 0 dégats sur les tourelles",                                                                 type: "START", category: "Portugais",    difficulty: "hard", points: 300, isPrivate: false, maps: "all"  },
        { text: "Détruire 3 tourelles (last hit)",                                                                              type: "START", category: "Portugais",    difficulty: "hard", points: 300, isPrivate: false, maps: "all"  },
        { text: "Choisir la rune Coup de grâce (arbre Précision)",                                                              type: "START", category: "Runes",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Abattage (arbre Précision)",                                                                   type: "START", category: "Runes",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Baroud d'honneur (arbre Précision)",                                                           type: "START", category: "Runes",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Chasseur de trésors (arbre Domination)",                                                       type: "START", category: "Runes",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Chasseur ultime (arbre Domination)",                                                           type: "START", category: "Runes",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Chasseur acharné (arbre Domination)",                                                          type: "START", category: "Runes",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Brûlure (arbre Sorcellerie)",                                                                  type: "START", category: "Runes",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Marche sur l'eau (arbre Sorcellerie)",                                                         type: "START", category: "Runes",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Tempête menaçante (arbre Sorcellerie)",                                                        type: "START", category: "Runes",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Surcroissance (arbre Volonté)",                                                                type: "START", category: "Runes",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Revitalisation (arbre Volonté)",                                                               type: "START", category: "Runes",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Inébranlable (arbre Volonté)",                                                                 type: "START", category: "Runes",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Savoir cosmique (arbre Inspiration)",                                                          type: "START", category: "Runes",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Vitesse d'approche (arbre Inspiration)",                                                       type: "START", category: "Runes",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Polyvalence (arbre Inspiration)",                                                              type: "START", category: "Runes",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },

        { text: "Avoir 85% d'accélération de compétences",                                                                      type: "START", category: "Build",    difficulty: "medium", points: 200, isPrivate: false, maps: "all"  },
        { text: "Faire tout les items possibles avec l'objet Larme de la déesse",                                               type: "START", category: "Handicap",    difficulty: "medium", points: 200, isPrivate: false, maps: "all"  },
        { text: "Finir la partie avec plus de 10 kills",                                                                        type: "START", category: "Combat",      difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Tank plus de 30 000 dégâts",                                                                                   type: "START", category: "Tank",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter un objet support en premier",                                                                          type: "START", category: "items",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Prendre les sorts d'invocateur Soin et Clarté",                                                                type: "START", category: "Sort",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Achète un maximum l'objet chapeaux en début de partie",                                                        type: "START", category: "items",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Lames de Doran en début de partie. Vente autorisée après avoir pris un kill",       type: "START", category: "Handicap",    difficulty: "medium", points: 200, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Dague en début de partie. Vente autorisée après avoir pris un kill",                type: "START", category: "Handicap",    difficulty: "medium", points: 200, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Poussières luisante en début de partie. Vente autorisée après avoir pris un kill",  type: "START", category: "Handicap",    difficulty: "medium", points: 200, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Armure d'étoffe en début de partie. Vente autorisée après avoir pris un kill",      type: "START", category: "Handicap",    difficulty: "medium", points: 200, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Epée longue en début de partie. Vente autorisée après avoir pris un kill",          type: "START", category: "Handicap",    difficulty: "medium", points: 200, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Cape de néant en début de partie. Vente autorisée après avoir pris un kill",        type: "START", category: "Handicap",    difficulty: "medium", points: 200, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Cristal de rubis en début de partie. Vente autorisée après avoir pris un kill",     type: "START", category: "Handicap",    difficulty: "medium", points: 200, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Cristal de saphir en début de partie. Vente autorisée après avoir pris un kill",    type: "START", category: "Handicap",    difficulty: "medium", points: 200, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Charme féérique en début de partie. Vente autorisée après avoir pris un kill",      type: "START", category: "Handicap",    difficulty: "medium", points: 200, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Collier rafraîchissant en début de partie. Vente autorisée après avoir pris un kill",  type: "START", category: "Handicap",    difficulty: "medium", points: 200, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Tome d'amplification en début de partie. Vente autorisée après avoir pris un kill", type: "START", category: "Handicap",    difficulty: "medium", points: 200, isPrivate: false, maps: "all"  },
        { text: "Acheter un maximum l'objet Potion en début de partie. Vente autorisée après avoir pris un kill",               type: "START", category: "Handicap",    difficulty: "medium", points: 200, isPrivate: false, maps: "all"  },

        { text: "Détruire 2 inhibiteurs",                                                                                       type: "START", category: "Précision",      difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec plus de 20 kills",                                                                        type: "START", category: "Précision",      difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec plus de 21 kills",                                                                        type: "START", category: "Précision",      difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec plus de 22 kills",                                                                        type: "START", category: "Précision",      difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec plus de 23 kills",                                                                        type: "START", category: "Précision",      difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec plus de 24 kills",                                                                        type: "START", category: "Précision",      difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un score de contrôle de foule supérieur à 55",                                            type: "START", category: "Précision",      difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un score de contrôle de foule supérieur à 66",                                            type: "START", category: "Précision",      difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un score de contrôle de foule supérieur à 77",                                            type: "START", category: "Précision",      difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un score de contrôle de foule supérieur à 99",                                            type: "START", category: "Précision",      difficulty: "hard", points: 300, isPrivate: false, maps: "all", minPlayers: 8 },
        { text: "Finir la partie avec un score de dégâts totaux aux champions supérieur à 15 212",                              type: "START", category: "Précision",      difficulty: "medium", points: 200, isPrivate: false, maps: "all", minPlayers: 8 },
        { text: "Finir la partie avec un score de dégâts totaux aux champions supérieur à 25 437",                              type: "START", category: "Précision",      difficulty: "hard", points: 300, isPrivate: false, maps: "all", minPlayers: 8 },
        { text: "Finir la partie avec un score de dégâts totaux aux champions supérieur à 35 924",                              type: "START", category: "Précision",      difficulty: "hard", points: 300, isPrivate: false, maps: "all", minPlayers: 8 },
        { text: "Faire un pentakill",                                                                                           type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all", minPlayers: 10 },
        { text: "Faire un quadrakill",                                                                                          type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all", minPlayers: 8 },
        { text: "Finir premier aux dégâts de ton équipe",                                                                       type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all" },
        { text: "Finir second aux dégâts de ton équipe",                                                                        type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all" },
        { text: "Finir troisième aux dégâts de ton équipe",                                                                     type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all" },
        { text: "Finir quatrième aux dégâts de ton équipe",                                                                     type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all" },
        { text: "Finir avec le moins de dégâts de ton équipe",                                                                  type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all" },
        { text: "Finir premier aux dégâts de la partie",                                                                        type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all" },
        { text: "Finir deuxième aux dégâts de la partie",                                                                       type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all" },
        { text: "Finir troisème aux dégats de la partie",                                                                       type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all" },
        { text: "Finir quatrième aux dégâts de la partie",                                                                      type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all" },
        { text: "Finir cinquième aux dégâts de la partie",                                                                      type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all" },
        { text: "Finir sixième aux dégâts de la partie",                                                                        type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all" },
        { text: "Finir septième aux dégâts de la partie",                                                                       type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all" },
        { text: "Finir huitième aux dégâts de la partie",                                                                       type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all" },
        { text: "Finir neuvième aux dégâts de la partie",                                                                       type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all" },
        { text: "Finir dernier aux dégâts de la partie",                                                                        type: "START", category: "Combat",      difficulty: "hard",   points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec aucun sbire tué",                                                                         type: "START", category: "Handicap",        difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Ne joue ni avec Flash ni avec Fantôme",                                                                        type: "START", category: "Sort",        difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Mourir exactement 13 fois, ni plus ni moins",                                                                  type: "START", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: false, maps: "all"  },
        { text: "Mourir exactement 14 fois, ni plus ni moins",                                                                  type: "START", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: false, maps: "all"  },
        { text: "Mourir exactement 15 fois, ni plus ni moins",                                                                  type: "START", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: false, maps: "all"  },
        { text: "Faire un coup critique supérieur à 1000 de dégâts",                                                            type: "START", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: false, maps: "all"  },
        { text: "Réduire au moins 20 000 de dégâts",                                                                            type: "START", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: false, maps: "all"  },

        // 🔒 Missions secrètes
        // { text: "Acheter uniquement des objets qui commencent par la lettre de ton champion (hors bottes)",     type: "START", category: "items",        difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Ne pas faire plus de 7 kills",                                                                                 type: "START", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: true, maps: "all"  },
        { text: "Ne pas faire plus de 9 kills",                                                                                 type: "START", category: "Précision",   difficulty: "medium",   points: 200, isPrivate: true, maps: "all"  },
        { text: "Ne pas faire plus de 11 kills",                                                                                type: "START", category: "Précision",   difficulty: "medium",   points: 200, isPrivate: true, maps: "all"  },
        { text: "Convaincre Thomas qu'on s'amuse bien en ARAM. Le faire 3 fois. Si tu es Thomas, demande pardon à tout le monde.",  type: "START", category: "Vocal",   difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Avoir le plus de morts de la partie. Tu ne dois pas être à égalité avec un autre joueur",                      type: "START", category: "Précision",   difficulty: "medium",   points: 200, isPrivate: true, maps: "all"  },
        { text: "Avoir le moins de morts de la partie. Tu ne dois pas être à égalité avec un autre joueur",                     type: "START", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: true, maps: "all"  },
        { text: "Faire danser toute ton équipe en début de partie sans révéler ta mission",                                     type: "START", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: true, maps: "all"  },
        { text: "Faire un check avec toute ton équipe au spawn sans révéler ta mission",                                        type: "START", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: true, maps: "all"  },
        { text: "Au début de la partie, provoquer l'équipe adverse",                                                            type: "START", category: "Troll",        difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Dicter les builds de tes coéquipiers comme Al4r1c. Si tu es Al4r1c, achète 1 sceptre de Rylai ",               type: "START", category: "Vocal", difficulty: "medium", points: 200, isPrivate: true, maps: "all" },
        { text: "Écrire '???' dans le chat après chaque mort ennemie",                                                          type: "START", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },

        // 🎭 Missions avec placeholder joueur
        { text: "Acheter les mêmes items que {player} pendant toute la partie.",                                                type: "START", category: "items",        difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Répéter le dernier mot de chaque phrase de {player} pendant 2 minutes",                                        type: "START", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Complimenter {player} après chacune de ses actions pendant 2 minutes",                                         type: "START", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },
        { text: "Blâmer {player} pour chaque mort de ton équipe (même si ce n'est pas sa faute)",                               type: "START", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },
        { text: "Avoir plus de sbires tués que {player}. Pas d'égalité",                                                        type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir moins de sbires tués que {player}. Pas d'égalité",                                                       type: "START", category: "Combat", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir le même nombre de sbires tués que {player}",                                                             type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir plus de kill que {player}. Pas d'égalité",                                                               type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir moins de kill que {player}. Pas d'égalité",                                                              type: "START", category: "Combat", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir le même nombre de kill que {player}",                                                                    type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir plus d'assistances que {player}. Pas d'égalité",                                                         type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir moins d'assistances que {player}. Pas d'égalité",                                                        type: "START", category: "Combat", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir le même nombre d'assistances que {player}",                                                              type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir plus de morts que {player}. Pas d'égalité",                                                              type: "START", category: "Combat", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir moins de morts que {player}. Pas d'égalité",                                                             type: "START", category: "Combat", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir le même nombre de morts que {player}",                                                                   type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "any" },

        // ⚔️ Missions duel (même mission pour 2 joueurs adverses)
        { text: "Avoir plus d'assitances que {player}",                                                                         type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Avoir moins d'assitances que {player}",                                                                        type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Avoir plus de kills que {player}",                                                                             type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Avoir moins de kills que {player}",                                                                            type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Avoir moins de morts que {player}",                                                                            type: "START", category: "Survie", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Avoir plus de morts que {player}",                                                                             type: "START", category: "Survie", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Faire plus de dégâts que {player}",                                                                            type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Faire moins de dégâts que {player}",                                                                           type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Se faire tuer par {player} dès que tu spawn. Si tu y arrives, dit \"Merci pour les 300 points!\"",             type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Atteindre 300 stack de Cœuracier avant {player}.",                                                             type: "START", category: "Build", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
    ];

    // ========================================
    // MISSIONS MID (milieu de partie - 15s)
    // ========================================
    const midMissions = [
        // Missions publiques
        { text: "Acheter une Rédemption",                                                                                       type: "MID", category: "Build",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un médaillon de Solari",                                                                               type: "MID", category: "Build",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Protobelt",                                                                                        type: "MID", category: "Build",        difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Revends tes items et achète uniquement des objets défensifs jusqu'à la fin (hors bottes)",                     type: "MID", category: "Build",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Revends tes items et achète uniquement des objets critiques jusqu'à la fin (hors bottes)",                     type: "MID", category: "Build",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Revends tes items et achète uniquement des objets AP jusqu'à la fin (hors bottes)",                            type: "MID", category: "Build",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Revends tes items et achète uniquement des objets AD jusqu'à la fin (hors bottes)",                            type: "MID", category: "Build",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Revends tes items et achète uniquement des objets de vitesse d'attaque (hors bottes)",                         type: "MID", category: "Build",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter un élixir et ne jamais l'utiliser",                                                                    type: "MID", category: "Survie",       difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Faire l'éloge de l'équipe adverse dans le chat avec un minimum de 7 phrases",                                  type: "MID", category: "Communication",       difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un objet complètement inutile pour ton champion",                                                      type: "MID", category: "Troll",        difficulty: "easy",   points: 100, isPrivate: false, maps: "all" },
        { text: "Change ton build et imite celui d'un coéquipier jusqu'à la fin",                                               type: "MID", category: "Build",        difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter 5 chapeaux",                                                                                           type: "MID", category: "items",      difficulty: "easy",   points: 100, isPrivate: false, maps: "all" },
        { text: "Vendre ses bottes et ne pas utiliser la fonction Annuler",                                                     type: "MID", category: "items",      difficulty: "easy",   points: 100, isPrivate: false, maps: "all" },
        { text: "Retourne à la fontaine à pieds, puis retourne auprès de tes coéquipiers, à pieds aussi bien sûr",              type: "MID", category: "Troll",       difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Ne pas mourir pendant 5 minutes, tu dois annoncer la mission en vocal",                                        type: "MID", category: "Survie",        difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Se faire exécuter d'ici la fin de la partie, tu dois annoncer la mission en vocal",                            type: "MID", category: "Suicide",        difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Vendre un objet complet (hors bottes) et ne pas utiliser la fonction Annuler",                                 type: "MID", category: "Troll",         difficulty: "medium", points: 200, isPrivate: false, maps: "all"  },
        { text: "Flash dans un mur, si pas de flash alors utilise tes 2 sorts d'invocateur immédiatement",                      type: "MID", category: "Troll",         difficulty: "easy",   points: 100, isPrivate: false, maps: "all"  },
        { text: "Donner un surnom à chaque ennemi et ne les appeler que par ce surnom en vocal",                                type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Donner un surnom à chaque coéquipier et ne les appeler que par ce surnom en vocal",                            type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Ne plus utiliser ton clavier pendant 2 minutes (souris uniquement)",                                           type: "MID", category: "Combat",         difficulty: "easy",   points: 100, isPrivate: false, maps: "all"  },
        { text: "Faire un résumé des 3 prochains teamfights.",                                                                  type: "MID", category: "Analyste",         difficulty: "easy",   points: 100, isPrivate: false, maps: "all"  },

        // 🔒 Missions secrètes
        { text: "Insulter et provoquer l'équipe adverse en vocal",                                                              type: "MID", category: "Toxic",       difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Annoncer un fake plan et le répéter avec insistance",                                                          type: "MID", category: "Communication", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Utiliser ton ultime dès qu'il est disponible (+ ou - 5 secondes) jusqu'à la fin de la partie",                 type: "MID", category: "Handicap",    difficulty: "hard", points: 300, isPrivate: true, maps: "all"  },
        { text: "Utiliser ton ultime complètement dans le vide 3 fois de suite",                                                type: "MID", category: "Troll",        difficulty: "easy",   points: 100, isPrivate: true, maps: "all" },
        { text: "Se faire exécuter par une tour ennemie",                                                                       type: "MID", category: "Suicide",      difficulty: "medium",   points: 200, isPrivate: true, maps: "all" },
        { text: "Mourir intentionnellement dans les 30 prochaines secondes",                                                    type: "MID", category: "Suicide",       difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Mourir intentionnellement 3 fois dès que tu spawn",                                                            type: "MID", category: "Suicide",       difficulty: "medium",   points: 200, isPrivate: true, maps: "all"  },
        { text: "Imiter le rire de Eikichi 3 fois de suite. Si tu es Eikichi, chante une chanson de New Jeans en entier",       type: "MID", category: "Troll",         difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Gémir de plaisir et faire en sorte que ce soit mémorable",                                                     type: "MID", category: "Troll",         difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Lancer tout les sons de la soundboard Discord 3 fois durant la partie",                                        type: "MID", category: "Troll",         difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Se comporter comme Chapo pendant 2 minutes (hein, quoi, j'ai pas compris). Si tu es Chapo, plains toi que tes coéquipiers ne comprennent jamais rien", type: "MID", category: "Communication", difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Demande à Kirua où est Camille au moins 7 fois. Si tu es Kirua, à chaque mort d'un joueur, le comparer à Camille",                             type: "MID", category: "Communication", difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Comme Quantique, prononcer des phrases incompréhensibles pendant 2 minutes",                                   type: "MID", category: "Communication", difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Communiquer uniquement en ping pendant 5 minutes",                                                             type: "MID", category: "Communication", difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Communiquer uniquement en TTS pendant 3 minutes",                                                              type: "MID", category: "Communication", difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Commente toutes tes actions pendant 1 minute (sorts, déplacements, achat, absolument tout)",                   type: "MID", category: "Communication", difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Se plaindre d'un coéquipier avec véhémence pendant 1 minute",                                                  type: "MID", category: "Toxic", difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Regarder ses coéquipiers mourir et taunt avec au moins 80% de barre de vie",                                   type: "MID", category: "Combat", difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Alft F4 en plein teamfight",                                                                                   type: "MID", category: "Combat", difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Remercier Era pour ce jeu incroyable",                                                                         type: "MID", category: "Vocal", difficulty: "medium", points: 200, isPrivate: true, maps: "all" },
        { text: "La somme de tes kills + morts doit être égal à 27 exactement",                                                 type: "MID", category: "Précision", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Raconter l'histoire de ta journée en détail pendant un teamfight",                                             type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Dire 'selon mon analyse...' avant chaque prise de décision en vocal",                                          type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Faire un bilan mi-temps en vocal comme un commentateur de foot (stats, classement, pronostic)",                type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Crier 'PENTAKILL' à chaque kill pendant 4 minutes",                                                            type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },

        // 🎭 Missions avec placeholder joueur
        { text: "Demander à {player} de t'apprendre le Q-click jusqu'à ce qu'il accepte",                                       type: "MID", category: "Troll", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },
        { text: "Suivre {player} partout pendant 2 minutes (jamais à plus de 500 unités)",                                      type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },
        { text: "Défendre {player} à chaque fois qu'il se fait attaquer verbalement",                                           type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },
        { text: "Annoncer chaque action de {player} comme un commentateur sportif",                                             type: "MID", category: "Vocal", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "CONVAINCRE {player} de duoQ jusqu'à la prochaine missions. Il doit accepter",                                  type: "MID", category: "Vocal", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "SUPPLIER {player} de duoQ jusqu'à la prochaine missions. Il doit refuser ",                                    type: "MID", category: "Vocal", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Chaque fois que {player} meurt, tu dois écrire une phrase poétique dans le chat",                              type: "MID", category: "Poésie", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Rédiger un bulletin scolaire de {player} en vocal, avec appréciation du prof",                                 type: "MID", category: "Notation", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Répéter le dernier mot de chaque phrase de {player}",                                                          type: "MID", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },

        // ⚔️ Missions duel (même mission pour 2 joueurs adverses)
        { text: "Tu dois être le prochain joueur à tuer {player}",                                                              type: "MID", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Tu as jusqu'à la prochaine mission pour te faire exécuter avant {player}",                                     type: "MID", category: "Suicide", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Danser côte à côte avec {player} sans bouger. Le 1er à mourir a perdu",                                        type: "MID", category: "Suicide", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Compléter la Muramana avant {player}. Une fois completée, le premier qui chante \"I'm blue Da ba dee da ba di Da ba dee da ba di\" gagne ", type: "MID", category: "Build", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Compléter le Bâton de l'Archange avant {player}. Une fois completée, le premier qui chante \"I'm blue Da ba dee da ba di Da ba dee da ba di\" gagne ", type: "MID", category: "Build", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Compléter l'Approche de l'Hiver avant {player}. Une fois completée, le premier qui chante \"I'm blue Da ba dee da ba di Da ba dee da ba di\" gagne ", type: "MID", category: "Build", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Compléter le Diadème Murmurant avant {player}. Une fois completée, le premier qui chante \"I'm blue Da ba dee da ba di Da ba dee da ba di\" gagne ", type: "MID", category: "Build", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },

    ];

    // ========================================
    // MISSIONS LATE (fin de partie - 30s)
    // ========================================
    const lateMissions = [
        // Missions publiques
        { text: "Crier 'WORTH' après chaque mort",                                                                              type: "LATE", category: "Communication", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Ne parler qu'en questions pendant 4 minutes",                                                                  type: "LATE", category: "Communication", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Prendre le TP adverse",                                                                                        type: "LATE", category: "Combat",      difficulty: "medium",   points: 200, isPrivate: false, maps: "all" },
        { text: "Faire un discours dramatique avant un teamfight",                                                              type: "LATE", category: "Communication", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Tu ne peux pas avoir plus de 5 items",                                                                         type: "LATE", category: "Build",        difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Crier 'PAS GRAVE' après chaque mort alliée",                                                                   type: "LATE", category: "Mental", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Faire un discours de coach sportif après chaque défaite de fight pendant 3 minutes",                           type: "LATE", category: "Communication", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Coiffe de Rabadon",                                                                                 type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Sablier de Zhonya",                                                                                 type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Bâton du vide",                                                                                     type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Fléau de Liche",                                                                                    type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Dent de Nashor",                                                                                   type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Soif-de-sang",                                                                                     type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Lame du roi déchu",                                                                                type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Lame d'infini",                                                                                    type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Canon ultrarapide",                                                                                 type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Danse fantôme",                                                                                    type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Égide solaire",                                                                                    type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Armure de Warmog",                                                                                 type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Cotte épineuse",                                                                                   type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Plaque du mort",                                                                                   type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Visage spirituel",                                                                                  type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Force de la nature",                                                                               type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Gage de Sterak",                                                                                    type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Cleaver noire",                                                                                    type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Masque abyssal",                                                                                    type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },

        { text: "Revends tes bottes",                                                                                           type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Revends 2 items complets",                                                                                     type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Tu ne peux plus faire d'items complets",                                                                       type: "LATE", category: "Build", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Tu dois acheter un item conseillé par un adversaire",                                                          type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Achète 5 potions de soin d'un coup",                                                                           type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },

        // 🔒 Missions secrètes
        { text: "Lancer des FF jusqu'à la fin de la partie",                                                                    type: "LATE", category: "Mental", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Quitter le fight en annonçant 'j'ai plus de mana' alors que c'est faux",                                       type: "LATE", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Blâmer un coéquipier aléatoire à l'écran de fin",                                                              type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Écrire 'E Z' à chaque kill",                                                                                   type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Acheter un objet totalement inutile et l'annoncer comme OP auprès d'Al4r1c. Le débat doit durer 1 minute. Si tu es Al4r1c, achète un sceptre de Rylai", type: "LATE", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Annoncer un repli collectif et engager seul. Une réaction d'incompréhension de tes coéquipiers doit être audible", type: "LATE", category: "Combat", difficulty: "medium", points: 200, isPrivate: true, maps: "all" },
        { text: "Te plaindre du manque de dégâts du joueur le plus fort de ton équipe",                                         type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Finir la partie avec exactement 47 de farm",                                                                   type: "LATE", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: true, maps: "all"  },
        { text: "Finir la partie avec exactement 69 de farm",                                                                   type: "LATE", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: true, maps: "all"  },
        { text: "Finir la partie avec exactement 72 de farm",                                                                   type: "LATE", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: true, maps: "all"  },
        { text: "Finir la partie avec exactement 87 de farm",                                                                   type: "LATE", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: true, maps: "all"  },
        { text: "Finir la partie avec exactement 19 kills",                                                                     type: "LATE", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: true, maps: "all"  },
        { text: "Finir la partie avec exactement 20 kills",                                                                     type: "LATE", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: true, maps: "all"  },
        { text: "Finir la partie avec exactement 21 kills",                                                                     type: "LATE", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: true, maps: "all"  },
        { text: "Finir la partie avec exactement 22 kills",                                                                     type: "LATE", category: "Précision",   difficulty: "hard",   points: 300, isPrivate: true, maps: "all"  },
        { text: "Durant la prochaine minute, danse sur le cadavre de chaque ennemi tué et chante Billie Jean",                  type: "LATE", category: "Toxic",          difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Annoncer un plan génial et faire strictement l'inverse",                                                       type: "LATE", category: "Communication", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Annoncer un plan catastrophique et l'exécuter. Ton équipe doit se faire ACE",                                  type: "LATE", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Spam ping '?' sur le joueur avec le plus de kills pendant 2 minutes",                                          type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Spam ping '?' sur tes alliés pendant 2 minutes",                                                               type: "LATE", category: "Toxic",       difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Accuser le lag et ta freebox après chaque mort pendant 3 minutes",                                             type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Après chaque kill de ta part, crier le nom de ta ville bien fort pendant 5 minutes",                           type: "LATE", category: "Toxic",       difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Fais comme si tu faisais caca et que tu poussais fort : 30 secondes de poussage",                              type: "LATE", category: "Maladie", difficulty: "easy",   points: 100, isPrivate: true, maps: "all"  },
        { text: "Faire le dernier kill de la partie",                                                                           type: "LATE", category: "Honneur", difficulty: "hard",   points: 300, isPrivate: true, maps: "all"  },

        // 🎭 Missions avec placeholder joueur
        { text: "Interpeler {player} mais ne jamais lui répondre. La mission est validée à la 1ère insulte et tu dois lui crier AHAHAH PETIT BOUFFON", type: "LATE", category: "Troll", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Critiquer le build de {player} pendant 1 minute",                                                              type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "opponent" },
        { text: "Déclarer que {player} est le MVP de la partie et argumenter pendant 30 secondes",                              type: "LATE", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Venger 3 morts de {player} en te ruant tête baissée dans l'équipe adverse en criant \"POUR FRODON\"",          type: "LATE", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },

        // ⚔️ Missions duel (même mission pour 2 joueurs adverses)
        { text: "Acheter un Creuset de Mikael avant {player}. Une fois l'objet dans ton inventaire, tu dois narguer ton adversaire en lui proposant de l'argent", type: "LATE", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },

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
