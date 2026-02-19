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


    // ████████████████████████████████████████████████████████████████████████
    // ██  DÉBUT DE PARTIE
    // ████████████████████████████████████████████████████████████████████████
    const startMissions = [
        // ── PUBLIQUES ────────────────────────────────────────

        // Analyste
        { text: "Proposer un plan de draft théorique contre l'équipe adverse et l'argumenter", type: "START", category: "Analyste", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },

        // Build
        { text: "Acheter 3 objets que tu n'as jamais achetés de ta vie", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter des items de couleur bleue", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter des items de couleur jaune", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter des items de couleur rouge", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter des items de couleur verte", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter des items de couleur violette", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Morellonomicon en premier objet complet", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Pourfendeur de kraken en premier objet complet", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Tourment de Liandry en premier objet complet", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Ceinture-fusée hextech en premier objet complet", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Soif-de-sang en premier objet complet", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Éclipse en premier objet complet", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Avoir que des objets ayant une caractéristique vitesse de déplacement", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Avoir seulement des objets vol de vie ou omnivampirisme (hors bottes)", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Avoir uniquement des objets avec le mot 'de' dans le nom français", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Avoir uniquement des objets qui donnent des PV (hors bottes)", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Construire uniquement des items qui ont une composante active (hors bottes)", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "N'achète aucun item au début de la partie", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Ne pas acheter de bottes pendant les 10 premières minutes", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Tu ne peux acheter que des objets complets", type: "START", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un objet de support en deuxième item complet", type: "START", category: "Build", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter un objet support en premier", type: "START", category: "Build", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Achète un maximum l'objet chapeaux en début de partie", type: "START", category: "Build", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Avoir 85% d'accélération de compétences", type: "START", category: "Build", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Avoir uniquement des objets qui donnent de l'armure", type: "START", category: "Build", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Avoir uniquement des objets qui donnent de la résistance magique", type: "START", category: "Build", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Avoir uniquement des objets qui donnent du mana (hors bottes)", type: "START", category: "Build", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },

        // Combat
        { text: "Avoir un kill participation supérieur à 70%", type: "START", category: "Combat", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec plus de 10 kills", type: "START", category: "Combat", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Obtenir le premier sang", type: "START", category: "Combat", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Avoir le meilleur KDA de ton équipe", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Avoir un kill participation supérieur à 80%", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Faire un minimum de 30 assistances", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Faire un pentakill", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all", minPlayers: 10 },
        { text: "Faire un quadrakill", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all", minPlayers: 8 },
        { text: "Finir avec le moins de dégâts de ton équipe", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir avec plus de kills que d'assistances", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir cinquième aux dégâts de la partie", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir dernier aux dégâts de la partie", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir deuxième aux dégâts de la partie", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir huitième aux dégâts de la partie", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir neuvième aux dégâts de la partie", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir premier aux dégâts de la partie", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir premier aux dégâts de ton équipe", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir quatrième aux dégâts de la partie", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir quatrième aux dégâts de ton équipe", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir second aux dégâts de ton équipe", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir septième aux dégâts de la partie", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir sixième aux dégâts de la partie", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir troisième aux dégâts de ton équipe", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir troisème aux dégats de la partie", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Être impliqué dans chaque kill de ton équipe d'ici la fin (kill ou assist)", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Être le joueur avec le plus d'assistances de la partie", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },

        // Communication
        { text: "Au début de la partie, faire un speech de motivation envers ton équipe", type: "START", category: "Communication", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },

        // Handicap
        { text: "Acheter tes bottes en dernier item", type: "START", category: "Handicap", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter tes bottes en premier item complet et les garder toute la partie", type: "START", category: "Handicap", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Armure d'étoffe en début de partie. Vente autorisée après la seconde mort", type: "START", category: "Handicap", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Cape de néant en début de partie. Vente autorisée après la seconde mort", type: "START", category: "Handicap", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Charme féérique en début de partie. Vente autorisée après la seconde mort", type: "START", category: "Handicap", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Collier rafraîchissant en début de partie. Vente autorisée après la seconde mort", type: "START", category: "Handicap", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Cristal de rubis en début de partie. Vente autorisée après la seconde mort", type: "START", category: "Handicap", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Cristal de saphir en début de partie. Vente autorisée après la seconde mort", type: "START", category: "Handicap", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Dague en début de partie. Vente autorisée après la seconde mort", type: "START", category: "Handicap", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Epée longue en début de partie. Vente autorisée après la seconde mort", type: "START", category: "Handicap", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Lames de Doran en début de partie. Vente autorisée après la seconde mort", type: "START", category: "Handicap", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Potion en début de partie. Vente autorisée après la seconde mort", type: "START", category: "Handicap", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Poussières luisante en début de partie. Vente autorisée après la seconde mort", type: "START", category: "Handicap", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Tome d'amplification en début de partie. Vente autorisée après la seconde mort", type: "START", category: "Handicap", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Augmente en priorité le sort A", type: "START", category: "Handicap", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Augmente en priorité le sort E", type: "START", category: "Handicap", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Augmente en priorité le sort Z", type: "START", category: "Handicap", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Armure d'étoffe en début de partie. Vente autorisée après avoir pris un kill", type: "START", category: "Handicap", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Cape de néant en début de partie. Vente autorisée après avoir pris un kill", type: "START", category: "Handicap", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Charme féérique en début de partie. Vente autorisée après avoir pris un kill", type: "START", category: "Handicap", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Collier rafraîchissant en début de partie. Vente autorisée après avoir pris un kill", type: "START", category: "Handicap", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Cristal de rubis en début de partie. Vente autorisée après avoir pris un kill", type: "START", category: "Handicap", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Cristal de saphir en début de partie. Vente autorisée après avoir pris un kill", type: "START", category: "Handicap", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Dague en début de partie. Vente autorisée après avoir pris un kill", type: "START", category: "Handicap", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Epée longue en début de partie. Vente autorisée après avoir pris un kill", type: "START", category: "Handicap", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Lames de Doran en début de partie. Vente autorisée après avoir pris un kill", type: "START", category: "Handicap", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Potion en début de partie. Vente autorisée après avoir pris un kill", type: "START", category: "Handicap", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Poussières luisante en début de partie. Vente autorisée après avoir pris un kill", type: "START", category: "Handicap", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Acheter un maximum l'objet Tome d'amplification en début de partie. Vente autorisée après avoir pris un kill", type: "START", category: "Handicap", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Faire tout les items possibles avec l'objet Larme de la déesse", type: "START", category: "Handicap", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec aucun sbire tué", type: "START", category: "Handicap", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },

        // Portugais
        { text: "Détruire 3 tourelles (last hit)", type: "START", category: "Portugais", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Faire un total de 0 dégats sur les tourelles", type: "START", category: "Portugais", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Être le joueur de ton équipe qui inflige le plus de dégâts aux tourelles", type: "START", category: "Portugais", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },

        // Précision
        { text: "Finir la partie avec un score de dégâts totaux aux champions supérieur à 15 212", type: "START", category: "Précision", difficulty: "medium", points: 200, isPrivate: false, maps: "all", minPlayers: 8 },
        { text: "Détruire 2 inhibiteurs", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Faire un coup critique supérieur à 1000 de dégâts", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir avec autant de kills que de morts", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir avec exactement 10 kills", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir avec exactement 15 kills", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec plus de 20 kills", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un nombre d'assistances supérieur à tes kills + morts", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un score de contrôle de foule supérieur à 55", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un score de contrôle de foule supérieur à 66", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un score de contrôle de foule supérieur à 77", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un score de contrôle de foule supérieur à 99", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all", minPlayers: 8 },
        { text: "Finir la partie avec un score de dégâts totaux aux champions supérieur à 25 437", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all", minPlayers: 8 },
        { text: "Finir la partie avec un score de dégâts totaux aux champions supérieur à 35 924", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all", minPlayers: 8 },
        { text: "Finir la partie avec un score de soins supérieur à 10 000", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Mourir exactement 13 fois, ni plus ni moins", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Mourir exactement 14 fois, ni plus ni moins", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Mourir exactement 15 fois, ni plus ni moins", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Réduire au moins 20 000 de dégâts", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Réduire au moins 30 000 de dégâts (mitigation)", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },

        // Runes
        { text: "Choisir la rune Abattage (arbre Précision)", type: "START", category: "Runes", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Baroud d'honneur (arbre Précision)", type: "START", category: "Runes", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Brûlure (arbre Sorcellerie)", type: "START", category: "Runes", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Chasseur acharné (arbre Domination)", type: "START", category: "Runes", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Chasseur de trésors (arbre Domination)", type: "START", category: "Runes", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Chasseur ultime (arbre Domination)", type: "START", category: "Runes", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Coup de grâce (arbre Précision)", type: "START", category: "Runes", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Inébranlable (arbre Volonté)", type: "START", category: "Runes", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Marche sur l'eau (arbre Sorcellerie)", type: "START", category: "Runes", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Polyvalence (arbre Inspiration)", type: "START", category: "Runes", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Revitalisation (arbre Volonté)", type: "START", category: "Runes", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Savoir cosmique (arbre Inspiration)", type: "START", category: "Runes", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Surcroissance (arbre Volonté)", type: "START", category: "Runes", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Tempête menaçante (arbre Sorcellerie)", type: "START", category: "Runes", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Choisir la rune Vitesse d'approche (arbre Inspiration)", type: "START", category: "Runes", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },

        // Sort
        { text: "Prendre le sort d'invocateur Clarté", type: "START", category: "Sort", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Prendre le sort d'invocateur Fatigue", type: "START", category: "Sort", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Prendre le sort d'invocateur Purge", type: "START", category: "Sort", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Prendre le sort d'invocateur Soin", type: "START", category: "Sort", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Prendre les sorts d'invocateur Soin et Clarté", type: "START", category: "Sort", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Ne joue ni avec Flash ni avec Fantôme", type: "START", category: "Sort", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },

        // Survie
        { text: "Ne pas mourir avant 5 minutes de jeu", type: "START", category: "Survie", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Finir avec moins de 10 morts", type: "START", category: "Survie", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Finir avec moins de 7 morts", type: "START", category: "Survie", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },

        // Tank
        { text: "Tank plus de 30 000 dégâts", type: "START", category: "Tank", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Tank plus de 50 000 dégâts", type: "START", category: "Tank", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },

        // Vocal
        { text: "Donner un surnom culinaire à chaque joueur de la partie et ne les appeler que comme ça", type: "START", category: "Vocal", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },

        // ── SECRÈTES ────────────────────────────────────────

        // Bruitage
        { text: "Dire 'et BIM' à chaque auto-attaque qui touche pendant 2 minutes", type: "START", category: "Bruitage", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Faire un bruit de moteur de F1 à chaque fois que tu utilises un dash ou un mouvement rapide pendant 5 minutes", type: "START", category: "Bruitage", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },

        // Build
        { text: "Acheter les mêmes items que {player} pendant toute la partie.", type: "START", category: "Build", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },

        // Handicap
        { text: "Acheter en premier un objet qui coûte plus de 3000 or (sans composants avant)", type: "START", category: "Handicap", difficulty: "medium", points: 200, isPrivate: true, maps: "all" },
        { text: "Construire ton build dans l'ordre alphabétique des noms d'items (hors bottes et consommables)", type: "START", category: "Handicap", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },

        // Inside Joke
        { text: "Convaincre Thomas qu'on s'amuse bien en ARAM. Le faire 3 fois. Si tu es Thomas, demande pardon à tout le monde.", type: "START", category: "Inside Joke", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Jouer comme Tlz1 (mode carry, confiance absolue) pendant 4 minutes. Si tu es Tlz1, joue de manière humble et discret", type: "START", category: "Inside Joke", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Parler comme Quantique pendant toute la partie (phrases incomplètes, changement de sujet constant). Si tu es Quantique, parle comme Tlz1", type: "START", category: "Inside Joke", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Dicter les builds de tes coéquipiers comme Al4r1c. Si tu es Al4r1c, achète 1 sceptre de Rylai ", type: "START", category: "Inside Joke", difficulty: "medium", points: 200, isPrivate: true, maps: "all" },

        // Précision
        { text: "Avoir le plus de morts de la partie. Tu ne dois pas être à égalité avec un autre joueur", type: "START", category: "Précision", difficulty: "medium", points: 200, isPrivate: true, maps: "all" },
        { text: "Ne pas faire plus de 11 kills", type: "START", category: "Précision", difficulty: "medium", points: 200, isPrivate: true, maps: "all" },
        { text: "Ne pas faire plus de 9 kills", type: "START", category: "Précision", difficulty: "medium", points: 200, isPrivate: true, maps: "all" },
        { text: "Avoir le moins de morts de la partie. Tu ne dois pas être à égalité avec un autre joueur", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Faire danser toute ton équipe en début de partie sans révéler ta mission", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Faire un check avec toute ton équipe au spawn sans révéler ta mission", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Ne pas faire plus de 7 kills", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },

        // Roleplay
        { text: "Jouer toute la partie en faisant un accent du sud", type: "START", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Parler au ralenti pendant 2 minutes", type: "START", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Parler comme un noble du 18ème siècle pendant 3 minutes ('Messire', 'Point du tout', 'Quelle infamie')", type: "START", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },

        // Survie
        { text: "Finir la partie vivant (ne pas être mort quand le Nexus tombe", type: "START", category: "Survie", difficulty: "medium", points: 200, isPrivate: true, maps: "all" },

        // Toxic
        { text: "Au début de la partie, provoquer l'équipe adverse", type: "START", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Écrire '???' dans le chat après chaque mort ennemie", type: "START", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Écrire 'bientôt mon powerspike' dans le chat all toutes les 3 minutes pendant toute la partie", type: "START", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },

        // Vocal
        { text: "Commencer chaque phrase par 'En tant que joueur professionnel...' pendant 5 minutes", type: "START", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Dire 'PREMIER SANG' en 3 langues différentes au premier kill de la partie", type: "START", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Dire 'merci Era' de manière sarcastique à chaque mauvaise mission qui tombe", type: "START", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Faire un podcast en vocal pendant 1 minutes sur un sujet random (top 5 des pizzas, meilleur film...)", type: "START", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Se plaindre du champion que tu as eu pendant toute la partie, même si tu le joues très bien", type: "START", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },

        // ── MISSIONS AVEC PLACEHOLDER JOUEUR ────────────────────────────────────────

        // Analyste
        { text: "Faire un bilan de chaque teamfight en comparant ta performance à celle de {player}", type: "START", category: "Analyste", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },

        // Build
        { text: "Suivre le même build que {player} avec un item de retard toute la partie", type: "START", category: "Build", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },

        // Combat
        { text: "Avoir moins d'assistances que {player}. Pas d'égalité", type: "START", category: "Combat", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir moins de sbires tués que {player}. Pas d'égalité", type: "START", category: "Combat", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir moins de kill que {player}. Pas d'égalité", type: "START", category: "Combat", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir moins de morts que {player}. Pas d'égalité", type: "START", category: "Combat", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir plus de morts que {player}. Pas d'égalité", type: "START", category: "Combat", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Déclarer {player} capitaine de l'équipe et exécuter ses ordres à la lettre toute la partie", type: "START", category: "Combat", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },
        { text: "Avoir le même nombre d'assistances que {player}", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir le même nombre de kill que {player}", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir le même nombre de morts que {player}", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir le même nombre de sbires tués que {player}", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir plus d'assistances que {player}. Pas d'égalité", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir plus de kill que {player}. Pas d'égalité", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Avoir plus de sbires tués que {player}. Pas d'égalité", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "any" },

        // Notation
        { text: "Commenter la performance de {player} comme un prof qui corrige une copie ('hmm, 12/20, peut mieux faire')", type: "START", category: "Notation", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },

        // Précision
        { text: "Avoir le même nombre de kills que {player} à la fin de la partie", type: "START", category: "Précision", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "any" },

        // Toxic
        { text: "Blâmer {player} pour chaque mort de ton équipe (même si ce n'est pas sa faute)", type: "START", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },
        { text: "Critiquer chaque décision de {player} pendant 3 minutes avec des arguments de mauvaise foi absurde", type: "START", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },

        // Vocal
        { text: "Chaque fois que {player} meurt, tu dois demander un moment de silence en vocal (5 secondes), jusqu'à la prochaine mission", type: "START", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Comparer {player} à un joueur pro à chaque action qu'il fait ('c'est du Faker ça', 'on dirait Caps là')", type: "START", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Complimenter {player} après chacune de ses actions pendant 2 minutes", type: "START", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },
        { text: "Raconter une fausse anecdote sur {player} à chaque mort ('tu sais une fois {player} il a...')", type: "START", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Répéter le dernier mot de chaque phrase de {player} pendant 2 minutes", type: "START", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Te déclarer fan number 1 de {player} et le supporter comme un ultra pendant toute la partie", type: "START", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },

        // ── ⚔MISSIONS DUEL ────────────────────────────────────────

        // Build
        { text: "Atteindre 300 stack de Cœuracier avant {player}.", type: "START", category: "Build", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },

        // Combat
        { text: "Avoir moins d'assitances que {player}", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Avoir moins de kills que {player}", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Avoir plus d'assitances que {player}", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Avoir plus de kills que {player}. Le perdant doit admettre qu'il est le meilleur joueur de la soirée", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Faire moins de dégâts que {player}", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Faire plus de dégâts que {player}", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Se faire tuer par {player} dès que tu spawn. Si tu y arrives, dit \"Merci pour les 300 points!\"", type: "START", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },

        // Survie
        { text: "Avoir moins de morts que {player}. Le perdant doit admettre qu'il est le pire joueur de la soirée", type: "START", category: "Survie", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Avoir plus de morts que {player}", type: "START", category: "Survie", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
    ];


    // ████████████████████████████████████████████████████████████████████████
    // ██  🟡 MILIEU DE PARTIE
    // ████████████████████████████████████████████████████████████████████████
    const midMissions = [
        // ── PUBLIQUES ────────────────────────────────────────

        // Analyste
        { text: "Faire un résumé des 3 prochains teamfights.", type: "MID", category: "Analyste", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Faire un résumé des forces et faiblesses de chaque joueur de ton équipe en vocal", type: "MID", category: "Analyste", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },

        // Build
        { text: "Acheter 5 chapeaux", type: "MID", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un médaillon de Solari", type: "MID", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Protobelt", type: "MID", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Rédemption", type: "MID", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Vendre ses bottes et ne pas utiliser la fonction Annuler", type: "MID", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter uniquement des composants (pas d'objets complets) jusqu'à la prochaine mission", type: "MID", category: "Build", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Change ton build et imite celui d'un coéquipier jusqu'à la fin", type: "MID", category: "Build", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Revends tes items et achète uniquement des objets AD jusqu'à la fin (hors bottes)", type: "MID", category: "Build", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Revends tes items et achète uniquement des objets AP jusqu'à la fin (hors bottes)", type: "MID", category: "Build", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Revends tes items et achète uniquement des objets critiques jusqu'à la fin (hors bottes)", type: "MID", category: "Build", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Revends tes items et achète uniquement des objets de vitesse d'attaque (hors bottes)", type: "MID", category: "Build", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Revends tes items et achète uniquement des objets défensifs jusqu'à la fin (hors bottes)", type: "MID", category: "Build", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Ton prochain achat doit être l'objet le plus cher disponible dans ta boutique", type: "MID", category: "Build", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Tu dois finir la partie en ayant acheté un objet que personne d'autre n'a dans la partie (hors bottes)", type: "MID", category: "Build", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },

        // Combat
        { text: "Infliger plus de dégâts magiques que de dégâts physiques (vérifié en fin de partie)", type: "MID", category: "Combat", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Infliger plus de dégâts physiques que de dégâts magiques (vérifié en fin de partie)", type: "MID", category: "Combat", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Ne pas faire de kill d'ici la prochaine mission. Annonce-le en vocal", type: "MID", category: "Combat", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },

        // Communication
        { text: "Appeler les champions adverses par des noms de personnages de film pendant 5 minutes", type: "MID", category: "Communication", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Dire 'tout va selon mon plan' après chaque événement, bon ou mauvais, pendant 3 minutes", type: "MID", category: "Communication", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Encourager chaque coéquipier individuellement après chaque teamfight pendant 3 minutes", type: "MID", category: "Communication", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Faire l'éloge de l'équipe adverse dans le chat avec un minimum de 7 phrases", type: "MID", category: "Communication", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },

        // Handicap
        { text: "Jouer uniquement à la souris (pas de clavier) pendant 2 minutes", type: "MID", category: "Handicap", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Ne plus utiliser ton clavier pendant 2 minutes (souris uniquement)", type: "MID", category: "Handicap", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Ne pas auto-attaquer pendant 1 minute (sorts uniquement)", type: "MID", category: "Handicap", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },

        // Roleplay
        { text: "Faire un résumé de la partie comme si c'était un journal télévisé de 20h", type: "MID", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },

        // Suicide
        { text: "Se faire exécuter d'ici la fin de la partie, tu dois annoncer la mission en vocal", type: "MID", category: "Suicide", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },

        // Survie
        { text: "Acheter un élixir et ne jamais l'utiliser", type: "MID", category: "Survie", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Ne pas mourir les 4 prochaines minutes. Annonce-le en vocal", type: "MID", category: "Survie", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Ne pas mourir pendant 5 minutes, tu dois annoncer la mission en vocal", type: "MID", category: "Survie", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },

        // Troll
        { text: "Acheter un objet complètement inutile pour ton champion", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Danser dans le bush le plus proche pendant 15 secondes. Tu ne dois pas bouger quoi qu'il arrive", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Flash dans un mur, si pas de flash alors utilise tes 2 sorts d'invocateur immédiatement", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Flash sur un ennemi full vie et taunt devant lui", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Retourne à la fontaine à pieds, puis retourne auprès de tes coéquipiers, à pieds aussi bien sûr", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Retourner à la fontaine à pieds, demander pourquoi tu ne peux pas acheter un élixir, faire l'idiot, et revenir", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Utiliser tes sorts d'invocateur dans les 10 prochaines secondes, quoi qu'il arrive", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Vendre un objet complet (hors bottes) et ne pas utiliser la fonction Annuler", type: "MID", category: "Troll", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },

        // Vocal
        { text: "Donner un surnom à chaque coéquipier et ne les appeler que par ce surnom en vocal", type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Donner un surnom à chaque ennemi et ne les appeler que par ce surnom en vocal", type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },

        // ── SECRÈTES ────────────────────────────────────────

        // Bruitage
        { text: "Faire un bruitage de sabre laser à chaque auto-attaque pendant 1 minute", type: "MID", category: "Bruitage", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },

        // Handicap
        { text: "Communiquer uniquement en TTS pendant 3 minutes", type: "MID", category: "Handicap", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Communiquer uniquement en ping pendant 5 minutes", type: "MID", category: "Handicap", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Inverser tes touches A et E jusqu'à la prochaine mission", type: "MID", category: "Handicap", difficulty: "medium", points: 200, isPrivate: true, maps: "all" },
        { text: "Jouer sans items pendant 2 minutes (revends tout, rachète après)", type: "MID", category: "Handicap", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Utiliser ton ultime dès qu'il est disponible (+ ou - 5 secondes) jusqu'à la fin de la partie", type: "MID", category: "Handicap", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },

        // Inside Joke
        { text: "Comme Quantique, prononcer des phrases incompréhensibles pendant 2 minutes", type: "MID", category: "Inside Joke", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Copier le playstyle de Chapo pendant 2 minutes (jouer safe, ne rien comprendre aux calls). Si tu es Chapo, joue hyper agressif et explique tout clairement", type: "MID", category: "Inside Joke", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Demande à Kirua où est Camille au moins 7 fois. Si tu es Kirua, à chaque mort d'un joueur, le comparer à Camille", type: "MID", category: "Inside Joke", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Dire 'Eikichi aurait fait mieux' après chaque action ratée d'un coéquipier. Si tu es Eikichi, dis 'Moi j'aurais réussi' à chaque move raté d'un coéquipier", type: "MID", category: "Inside Joke", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Déco reco de Discord 5 fois de suite. A chaque fois que tu reviens tu dois te présenter comme un employé Carglass avec des prénoms différents.", type: "MID", category: "Inside Joke", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Imiter le rire de Eikichi 3 fois de suite. Si tu es Eikichi, chante une chanson de New Jeans en entier", type: "MID", category: "Inside Joke", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Se comporter comme Chapo pendant 2 minutes (hein, quoi, j'ai pas compris). Si tu es Chapo, plains toi que tes coéquipiers ne comprennent jamais rien", type: "MID", category: "Inside Joke", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Se comporter comme Kirua et demander où est Aaron toutes les 30 secondes. Si tu es Kirua, parle nous d'Aaron pendant 3 minutes", type: "MID", category: "Inside Joke", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Remercier Era pour ce jeu incroyable", type: "MID", category: "Inside Joke", difficulty: "medium", points: 200, isPrivate: true, maps: "all" },

        // Précision
        { text: "La somme de tes kills + morts doit être égal à 27 exactement", type: "MID", category: "Précision", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },

        // Roleplay
        { text: "Faire un JT Sportif de la game en cours (score, faits marquants, interviews fictives)", type: "MID", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Faire un bilan mi-temps en vocal comme un commentateur de foot (stats, classement, pronostic)", type: "MID", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Parler comme un pirate pendant 3 minutes ('Moussaillon', 'par la barbe de Gangplank'...)", type: "MID", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },

        // Suicide
        { text: "Mourir intentionnellement dans les 30 prochaines secondes", type: "MID", category: "Suicide", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Mourir intentionnellement 3 fois dès que tu spawn", type: "MID", category: "Suicide", difficulty: "medium", points: 200, isPrivate: true, maps: "all" },
        { text: "Se faire exécuter par une tour ennemie", type: "MID", category: "Suicide", difficulty: "medium", points: 200, isPrivate: true, maps: "all" },
        { text: "Flash sous la tourelle ennemie et tenter de survivre. Si tu meurs, crie 'CALCULATED'", type: "MID", category: "Suicide", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Te faire exécuter par les sbires. Annonce 'les sbires sont trop forts ce patch'", type: "MID", category: "Suicide", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },

        // Toxic
        { text: "Accuser un coéquipier aléatoire de troll à chaque mort de ton équipe pendant 3 minutes", type: "MID", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Dire 'pas mal, mais j'ai vu mieux' après chaque kill ennemi", type: "MID", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Féliciter l'ennemi qui te tue dans le chat all à chaque mort pendant 3 minutes", type: "MID", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Insulter et provoquer l'équipe adverse en vocal", type: "MID", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Se plaindre d'un coéquipier avec véhémence pendant 1 minute", type: "MID", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Soupirer très fort à chaque action de tes alliés comme si tu étais déçu pendant 2 minutes", type: "MID", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },

        // Troll
        { text: "Alft F4 en plein teamfight", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Annoncer que tu vas AFK faire un café, rester muet 2 minutes, puis revenir comme si de rien n'était", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Annoncer un fake plan et le répéter avec insistance", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Demander 'c'est quoi le build ?' toutes les 30 secondes comme un débutant. Ignorer toutes les réponses", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Faire comme si tu jouais un autre champion et nommer tes sorts avec les mauvais noms", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Faire semblant d'être AFK pendant 2 minutes puis revenir comme si de rien n'était. Si on t'appelle, réponds \"Oui Oui\"", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Faire un tutoriel en vocal de ton champion comme si tes coéquipiers étaient des débutants", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Gémir de plaisir et faire en sorte que ce soit mémorable", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Inventer un lore romantique entre ton champion et un champion ennemi et le narrer pendant 1 minute", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Lancer tout les sons de la soundboard Discord 3 fois durant la partie", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Prétendre que tu as découvert un bug broken et expliquer une combo totalement inventée", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Prétendre être le coach de l'équipe et donner des instructions tactiques absurdes pendant 2 minutes", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Raconter l'histoire de ta journée en détail pendant un teamfight", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Raconter ta recette de cuisine préférée pendant un teamfight", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Regarder ses coéquipiers mourir et taunt avec au moins 80% de barre de vie", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Utiliser ton ultime complètement dans le vide 3 fois de suite", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Éternuer (faux) très fort à chaque fois qu'un ennemi utilise son ultime pendant 5 minutes", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },

        // Vocal
        { text: "Commente toutes tes actions pendant 1 minute (sorts, déplacements, achat, absolument tout)", type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Compter à voix haute tes CS pendant 2 minutes ('47, 48, 49...')", type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Crier 'PENTAKILL' à chaque kill pendant 4 minutes", type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Crier TRÈS fort à chaque kill que tu fais pendant 2 minutes", type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Dire 'hmm intéressant' après chaque mort (alliée ou ennemie) pendant 3 minutes", type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Dire 'pas de panique' à chaque début de teamfight pendant 5 minutes, même quand c'est la panique", type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Dire 'selon mon analyse...' avant chaque prise de décision en vocal", type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Parler uniquement en anglais pendant 3 minutes", type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Prétendre que ton micro bug et répéter chaque phrase 2 fois pendant 2 minutes", type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Remplacer le nom de chaque sort par un nom de plat culinaire pendant 3 minutes ('j'envoie le gratin !')", type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Répondre 'c'est noté' à absolument tout ce que disent tes coéquipiers pendant 3 minutes", type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },

        // ── MISSIONS AVEC PLACEHOLDER JOUEUR ────────────────────────────────────────

        // Analyste
        { text: "Analyser le build de {player} à voix haute et proposer des améliorations absurdes", type: "MID", category: "Analyste", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Commenter le positioning de {player} comme un coach pendant 3 minutes ('non non non, recule, RECULE !')", type: "MID", category: "Analyste", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },

        // Bruitage
        { text: "Chaque fois que {player} utilise son ultime, pousser un 'WOOOOOW' exagéré même si c'était nul. A faire 5 fois", type: "MID", category: "Bruitage", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },

        // Combat
        { text: "Proposer un 1v1 à {player} au milieu de la lane. Danser devant lui pour le provoquer", type: "MID", category: "Combat", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "opponent" },

        // Notation
        { text: "Donner une note Michelin à chaque play de {player} (étoiles, ambiance, présentation)", type: "MID", category: "Notation", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Rédiger un bulletin scolaire de {player} en vocal, avec appréciation du prof", type: "MID", category: "Notation", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },

        // Roleplay
        { text: "Commenter le jeu de {player} comme un documentaire sur les animaux ('et ici on observe le prédateur en action...')", type: "MID", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Faire un horoscope personnalisé de {player} basé sur sa performance en jeu", type: "MID", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Faire une lettre d'amour à {player} en vocal, minimum 30 secondes", type: "MID", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Rédiger une lettre de motivation pour recruter {player} dans ton équipe", type: "MID", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },

        // Toxic
        { text: "Blâmer {player} pour chaque mort pendant 3 minutes avec des arguments de plus en plus tirés par les cheveux", type: "MID", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },
        { text: "Répéter le dernier mot de chaque phrase de {player}", type: "MID", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },

        // Troll
        { text: "Suivre {player} partout pendant 2 minutes (jamais à plus de 500 unités)", type: "MID", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },
        { text: "Demander à {player} de t'apprendre le Q-click jusqu'à ce qu'il accepte", type: "MID", category: "Troll", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },

        // Vocal
        { text: "Applaudir vocalement chaque action de {player} pendant 2 minutes, même les pires", type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },
        { text: "Chaque fois que {player} meurt, tu dois écrire une phrase poétique dans le chat", type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Dédier chacun de tes kills à {player} en criant son prénom", type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Défendre {player} à chaque fois qu'il se fait attaquer verbalement", type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },
        { text: "Poser des questions existentielles à {player} en plein teamfight ('mais toi, t'es heureux dans la vie ?')", type: "MID", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Annoncer chaque action de {player} comme un commentateur sportif", type: "MID", category: "Vocal", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "CONVAINCRE {player} de duoQ jusqu'à la prochaine missions. Il doit accepter", type: "MID", category: "Vocal", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "SUPPLIER {player} de duoQ jusqu'à la prochaine missions. Il doit refuser ", type: "MID", category: "Vocal", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "any" },

        // ── MISSIONS DUEL ────────────────────────────────────────

        // Build
        { text: "Compléter l'Approche de l'Hiver avant {player}. Une fois complétée, le premier qui chante \"I'm blue Da ba dee da ba di Da ba dee da ba di\" gagne ", type: "MID", category: "Build", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Compléter la Muramana avant {player}. Une fois complétée, le premier qui chante \"I'm blue Da ba dee da ba di Da ba dee da ba di\" gagne ", type: "MID", category: "Build", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Compléter le Bâton de l'Archange avant {player}. Une fois complétée, le premier qui chante \"I'm blue Da ba dee da ba di Da ba dee da ba di\" gagne ", type: "MID", category: "Build", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Compléter le Diadème Murmurant avant {player}. Une fois complétée, le premier qui chante \"I'm blue Da ba dee da ba di Da ba dee da ba di\" gagne ", type: "MID", category: "Build", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },

        // Combat
        { text: "Fais un double kill avant {player}. Le perdant doit pousser un cri de défaite théâtral", type: "MID", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Tu dois avoir plus de CS que {player} au moment de la prochaine mission gagne. Le perdant doit vendre un item complet.", type: "MID", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Tu dois être le prochain joueur à tuer {player}", type: "MID", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },

        // Suicide
        { text: "Danser côte à côte avec {player} sans bouger. Le 1er à mourir a perdu", type: "MID", category: "Suicide", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
        { text: "Tu as jusqu'à la prochaine mission pour te faire exécuter avant {player}", type: "MID", category: "Suicide", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },

        // Survie
        { text: "Si tu meurs avant {player} tu dois avouer un secret embarrassant", type: "MID", category: "Survie", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
    ];


    // ████████████████████████████████████████████████████████████████████████
    // ██  🔴 FIN DE PARTIE
    // ████████████████████████████████████████████████████████████████████████
    const lateMissions = [
        // ── PUBLIQUES ────────────────────────────────────────

        // Build
        { text: "Acheter un Bâton du vide", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Canon ultrarapide", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Coiffe de Rabadon", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Fléau de Liche", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Gage de Sterak", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Masque abyssal", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Sablier de Zhonya", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter un Visage spirituel", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Armure de Warmog", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Cleaver noire", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Cotte épineuse", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Danse fantôme", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Dent de Nashor", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Force de la nature", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Lame d'infini", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Lame du roi déchu", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Plaque du mort", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Soif-de-sang", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Acheter une Égide solaire", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Achète 5 potions de soin d'un coup", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Revendre ton item le plus cher", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Revends 2 items complets", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Revends tes bottes", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Tu dois acheter un item conseillé par un adversaire", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Tu dois finir la partie sans bottes", type: "LATE", category: "Build", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Remplacer tous tes objets par des items qui contiennent le mot 'sang' ou 'mort' dans leur nom", type: "LATE", category: "Build", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Tu ne peux plus faire d'items complets", type: "LATE", category: "Build", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Tu ne peux pas avoir plus de 5 items", type: "LATE", category: "Build", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },

        // Combat
        { text: "Participer à un ACE. Tu dois en sortir vivant", type: "LATE", category: "Combat", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Participer à un ACE. Tu ne dois pas en sortir vivant", type: "LATE", category: "Combat", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Prendre le TP adverse", type: "LATE", category: "Combat", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },

        // Communication
        { text: "Chaque fois que tu meurs, tu dois dire un fait historique de la salle de pause", type: "LATE", category: "Communication", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Crier 'WORTH' après chaque mort", type: "LATE", category: "Communication", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Faire un discours d'adieu comme si c'était ta dernière game de LoL", type: "LATE", category: "Communication", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Faire un discours de coach sportif après chaque défaite de fight pendant 3 minutes", type: "LATE", category: "Communication", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Faire un discours dramatique avant un teamfight", type: "LATE", category: "Communication", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },
        { text: "Ne parler qu'en questions pendant 4 minutes", type: "LATE", category: "Communication", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },

        // Mental
        { text: "Crier 'PAS GRAVE' après chaque mort alliée", type: "LATE", category: "Mental", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },

        // Précision
        { text: "Finir la partie avec un nombre d'assistances divisible par 3", type: "LATE", category: "Précision", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un nombre d'assistances divisible par 5", type: "LATE", category: "Précision", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un nombre d'assistances impair", type: "LATE", category: "Précision", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un nombre d'assistances pair", type: "LATE", category: "Précision", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un nombre de kills divisible par 3", type: "LATE", category: "Précision", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un nombre de kills divisible par 5", type: "LATE", category: "Précision", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un nombre de kills impair", type: "LATE", category: "Précision", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un nombre de kills pair", type: "LATE", category: "Précision", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un nombre de morts divisible par 3", type: "LATE", category: "Précision", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un nombre de morts divisible par 5", type: "LATE", category: "Précision", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un nombre de morts impair", type: "LATE", category: "Précision", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec un nombre de morts pair", type: "LATE", category: "Précision", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },
        { text: "Finir avec exactement le double de kills par rapport à tes morts", type: "LATE", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir avec un nombre de kills qui est un nombre premier (2, 3, 5, 7, 11, 13, 17, 19, 23)", type: "LATE", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec exactement 11 morts", type: "LATE", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec exactement 7 morts", type: "LATE", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec exactement 9 morts", type: "LATE", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Finir la partie avec plus de kill que toute la team adverse", type: "LATE", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "La différence entre tes kills et tes morts doit être exactement de 5", type: "LATE", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "La somme de tes kills + morts + assists doit être un multiple de 10", type: "LATE", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "La somme de tes kills + morts doit être égale à 33 exactement", type: "LATE", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },
        { text: "Ton nombre d'assistances doit être égale à 33 exactement", type: "LATE", category: "Précision", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },

        // Roleplay
        { text: "Narrer chaque mort alliée comme un documentaire animalier pendant 2 minutes", type: "LATE", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },

        // Survie
        { text: "Mourir 0 fois d'ici la fin de la partie", type: "LATE", category: "Survie", difficulty: "hard", points: 300, isPrivate: false, maps: "all" },

        // Troll
        { text: "Proposer un vote démocratique pour chaque décision de l'équipe pendant 2 minutes", type: "LATE", category: "Troll", difficulty: "easy", points: 100, isPrivate: false, maps: "all" },

        // Vocal
        { text: "Parler uniquement en rimes pendant 2 minutes", type: "LATE", category: "Vocal", difficulty: "medium", points: 200, isPrivate: false, maps: "all" },

        // ── SECRÈTES ────────────────────────────────────────

        // Bruitage
        { text: "Après chaque mort, pousser un long soupir théâtral pendant 5 secondes", type: "LATE", category: "Bruitage", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Crier 'KOBE BRYANT !' à chaque skillshot touché pendant 3 minutes", type: "LATE", category: "Bruitage", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Faire des bruitages avec ta bouche pour chaque sort que tu lances pendant 1 minute", type: "LATE", category: "Bruitage", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },

        // Combat
        { text: "Annoncer un repli collectif et engager seul. Une réaction d'incompréhension de tes coéquipiers doit être audible", type: "LATE", category: "Combat", difficulty: "medium", points: 200, isPrivate: true, maps: "all" },
        { text: "Annoncer un plan catastrophique et l'exécuter. Ton équipe doit se faire ACE", type: "LATE", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Faire le dernier kill de la partie", type: "LATE", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },

        // Inside Joke
        { text: "Acheter un objet totalement inutile et l'annoncer comme OP auprès d'Al4r1c. Le débat doit durer 1 minute. Si tu es Al4r1c, achète un sceptre de Rylai", type: "LATE", category: "Inside Joke", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Imiter Quantique et commencer chaque phrase par un mot aléatoire qui n'a rien à voir. Si tu es Quantique, parle normalement pendant 2 minutes", type: "LATE", category: "Inside Joke", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },

        // Notation
        { text: "Donner une note sur 10 à chaque action de tes coéquipiers pendant 2 minutes", type: "LATE", category: "Notation", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },

        // Précision
        { text: "Finir la partie avec exactement 19 kills", type: "LATE", category: "Précision", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Finir la partie avec exactement 20 kills", type: "LATE", category: "Précision", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Finir la partie avec exactement 21 kills", type: "LATE", category: "Précision", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Finir la partie avec exactement 22 kills", type: "LATE", category: "Précision", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Finir la partie avec exactement 47 de farm", type: "LATE", category: "Précision", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Finir la partie avec exactement 69 de farm", type: "LATE", category: "Précision", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Finir la partie avec exactement 72 de farm", type: "LATE", category: "Précision", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },
        { text: "Finir la partie avec exactement 87 de farm", type: "LATE", category: "Précision", difficulty: "hard", points: 300, isPrivate: true, maps: "all" },

        // Roleplay
        { text: "Annoncer ta retraite de LoL en plein teamfight avec un discours émouvant", type: "LATE", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Faire la météo de la Faille pendant 1 minute (prévisions de ganks, température des lanes...)", type: "LATE", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Parler de toi à la 3ème personne pendant 3 minutes", type: "LATE", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Rédiger un CV pour ton champion en vocal", type: "LATE", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },

        // Suicide
        { text: "Hurler 'POUR LES ASIATIQUES!!!' en fonçant dans l'équipe adverse. Tu dois mourir et tuer au moins un joueur", type: "LATE", category: "Suicide", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },

        // Toxic
        { text: "Accuser le lag et ta freebox après chaque mort pendant 3 minutes", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Après chaque kill de ta part, crier le nom de ta ville bien fort pendant 5 minutes", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Blâmer un coéquipier aléatoire à l'écran de fin", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Durant la prochaine minute, danse sur le cadavre de chaque ennemi tué et chante Billie Jean", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Faire un compliment sincère suivi d'une critique cinglante à chaque coéquipier", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Spam ping '?' sur le joueur avec le plus de kills pendant 2 minutes", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Spam ping '?' sur tes alliés pendant 2 minutes", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Te plaindre du manque de dégâts du joueur le plus fort de ton équipe", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Écrire 'E Z' à chaque kill", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Écrire 'ty' dans le chat all à chaque fois qu'un ennemi meurt", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },

        // Troll
        { text: "Annoncer un plan génial et faire strictement l'inverse", type: "LATE", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Chanter le générique de Pokémon pendant le prochain teamfight", type: "LATE", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Faire semblant de répondre au téléphone en plein teamfight", type: "LATE", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Fais comme si tu faisais caca et que tu poussais fort : 30 secondes de poussage", type: "LATE", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Lancer des FF jusqu'à la fin de la partie", type: "LATE", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Quitter le fight en annonçant 'j'ai plus de mana' alors que c'est faux", type: "LATE", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Raconter ta commande Uber Eats idéale en plein teamfight", type: "LATE", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },
        { text: "Raconter ton rêve de la nuit dernière pendant un teamfight", type: "LATE", category: "Troll", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },

        // Vocal
        { text: "Chuchoter pendant 3 minutes, quoi qu'il arrive", type: "LATE", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all" },

        // ── MISSIONS AVEC PLACEHOLDER JOUEUR ────────────────────────────────────────

        // Analyste
        { text: "Faire un récap de la performance de {player} comme si tu étais son coach d'après-match", type: "LATE", category: "Analyste", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },

        // Roleplay
        { text: "Commenter les mouvements de {player} comme un GPS ('dans 200 unités, tournez à droite...')", type: "LATE", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Déclarer que {player} est en réalité un smurf de Faker et argumenter sérieusement", type: "LATE", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Faire un hommage funèbre à {player} après sa prochaine mort. Minimum 20 secondes d'émotion", type: "LATE", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Interviewer {player} en plein teamfight ('alors {player}, comment tu te sens là tout de suite ?')", type: "LATE", category: "Roleplay", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },

        // Toxic
        { text: "Accuser {player} d'utiliser un script à chaque bon play qu'il fait", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Clasher {player} sur son champion et expliquer pourquoi le tien est 10x mieux", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Critiquer le build de {player} pendant 1 minute", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "opponent" },
        { text: "Tenir un décompte en vocal de chaque mort de {player} ('ça fait 7, je dis ça je dis rien')", type: "LATE", category: "Toxic", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },

        // Troll
        { text: "Interpeler {player} mais ne jamais lui répondre. La mission est validée à la 1ère insulte et tu dois lui crier AHAHAH PETIT BOUFFON", type: "LATE", category: "Troll", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "any" },

        // Vocal
        { text: "Attribuer tous tes kills à {player} en vocal ('c'est grâce à toi frère')", type: "LATE", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },
        { text: "Déclarer que {player} est le MVP de la partie et argumenter pendant 30 secondes", type: "LATE", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "any" },
        { text: "Protéger {player} de toute critique. Monter au créneau dès que quelqu'un le blâme", type: "LATE", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },
        { text: "Venger 3 morts de {player} en te ruant tête baissée dans l'équipe adverse en criant \"POUR FRODON\"", type: "LATE", category: "Vocal", difficulty: "easy", points: 100, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },
        { text: "Demander à {player} des conseils stratégiques avant chaque fight pendant 3 minutes. Tu dois suivre ses conseils", type: "LATE", category: "Vocal", difficulty: "medium", points: 200, isPrivate: true, maps: "all", playerPlaceholder: "teammate" },

        // ── MISSIONS DUEL ────────────────────────────────────────

        // Combat
        { text: "Acheter un Creuset de Mikael avant {player}. Une fois l'objet dans ton inventaire, tu dois narguer ton adversaire en lui proposant de l'argent", type: "LATE", category: "Combat", difficulty: "hard", points: 300, isPrivate: true, maps: "all", playerPlaceholder: "duel" },
    ];


    // ════════════════════════════════════════════════════════════════
    // INSERTION EN BASE
    // ════════════════════════════════════════════════════════════════
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
