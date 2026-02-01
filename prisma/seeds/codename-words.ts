import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Default words (no category) - always included in word pool
const defaultWords = [
    "Avion", "Banque", "Plage", "Clé", "Verre", "Montagne", "Ombre", "Machine",
    "Feuille", "Canon", "Couronne", "Robot", "Tempête", "Pont", "Pomme", "Livre",
    "Étoile", "Train", "Or", "Prison", "Carte", "Souris", "Dragon", "Police",
    "Feu", "Glace", "Cercle", "Jardin", "Docteur", "Pirate", "Lune", "Bateau",
    "Masque", "Écran", "Château", "Vent", "Neige", "Tour", "Argent", "Serpent",
    "Soleil", "Forêt", "Mur", "Lunettes", "Bombe", "Reine", "Roi", "Soldat",
    "Pêche", "Fromage", "Table", "Chaîne", "Main", "Fantôme", "Savon", "Hôpital",
    "Désert", "Miroir", "Port", "Sabre", "Vague", "Café", "Éclair", "Tunnel",
    "Bougie", "Plume", "Géant", "Nain", "Rivière", "Clown", "Usine", "Satellite",
    "Horloge", "Cheval", "Nuage", "Parfum", "École", "Fil", "Caméra", "Monstre",
    "Épée", "Grotte", "Corde", "Trésor", "Brique", "Lumière", "Aigle", "Statue",
    "Marteau", "Serre", "Pyramide", "Balcon", "Température", "Coquillage", "Poison",
    "Sac", "Radar", "Climat", "Wagon", "Boussole", "Casque", "Crâne", "Piste",
    "Aéroport", "Costume", "Colonne", "Prairie", "Moteur", "Moustache", "Énergie",
    "Fumée", "Lanterne", "Pipeline", "Trappe", "Glacier", "Spirale", "Canard",
    "Barrière", "Bulle", "Cristal", "Tissu", "Fossile", "Cabane", "Graffiti",
    "Balance", "Sable", "Plomb", "Ancre", "Tambour", "Bureau", "Algorithme",
    "Puzzle", "Cage", "Corail", "Balle", "Circuit", "Flèche", "Igloo", "Falaise",
    "Colis", "Bouteille", "Vitrine", "Encre", "Tracteur", "Phare", "Éponge",
    "Labo", "Plateau", "Règle", "Labyrinthe", "Valise", "Projecteur", "Chiffre",
    "Roue", "Clavier", "Signal", "Forgeron", "Cactus", "Antenne", "Plaque",
    "Épingle", "Drapeau", "Bassin", "Rideau", "Squelette", "Glissière", "Voile",
    "Compas", "Éruption", "Coffre", "Camouflage", "Bison", "Molette", "Hologramme",
    "Cabine", "Harpon", "Trophée", "Silhouette", "Cartouche", "Sifflet", "Ruine",
    "Scanner", "Spirite", "Dalle", "Bunker", "Cascade", "Galaxie", "Micro",
    "Sabot", "Tente", "Câble", "Brouillard"
];

const pseudos = [
    { "mot": "Al4r1c", "categorie": "Pseudo" },
    { "mot": "Kiru4", "categorie": "Pseudo" },
    { "mot": "Eikichi", "categorie": "Pseudo" },
    { "mot": "Tlz1", "categorie": "Pseudo" },
    { "mot": "Le Mari de Poki", "categorie": "Pseudo" },
    { "mot": "Era", "categorie": "Pseudo" },
    { "mot": "Kirua Black", "categorie": "Pseudo" },
    { "mot": "Kirua White", "categorie": "Pseudo" },
    { "mot": "Seummy", "categorie": "Pseudo" },
    { "mot": "Aku le Chaman", "categorie": "Pseudo" },
    { "mot": "YouYou", "categorie": "Pseudo" },
    { "mot": "Satowned", "categorie": "Pseudo" },
    { "mot": "Rochel", "categorie": "Pseudo" },
    { "mot": "Khana", "categorie": "Pseudo" },
    { "mot": "King Casu", "categorie": "Pseudo" },
    { "mot": "Quantique", "categorie": "Pseudo" },
    { "mot": "Matthieu", "categorie": "Pseudo" },
    { "mot": "Mathieu", "categorie": "Pseudo" },
    { "mot": "Yann", "categorie": "Pseudo" },
    { "mot": "Thomas", "categorie": "Pseudo" },
    { "mot": "Jonathan", "categorie": "Pseudo" },
    { "mot": "Vincent", "categorie": "Pseudo" },
    { "mot": "Alenvert Aishtein", "categorie": "Pseudo" }
];

const streamers = [
    { "mot": "Squeezie", "categorie": "Streamer" },
    { "mot": "Gotaga", "categorie": "Streamer" },
    { "mot": "Kamet0", "categorie": "Streamer" },
    { "mot": "JLTomy", "categorie": "Streamer" },
    { "mot": "AmineMaTue", "categorie": "Streamer" },
    { "mot": "ZeratoR", "categorie": "Streamer" },
    { "mot": "LeBouseuh", "categorie": "Streamer" },
    { "mot": "Domingo", "categorie": "Streamer" },
    { "mot": "Doigby", "categorie": "Streamer" },
    { "mot": "WankilStudio", "categorie": "Streamer" },
    { "mot": "Mickalow", "categorie": "Streamer" },
    { "mot": "Sardoche", "categorie": "Streamer" },
    { "mot": "Laink", "categorie": "Streamer" },
    { "mot": "Etoiles", "categorie": "Streamer" },
    { "mot": "Trayton", "categorie": "Streamer" },
    { "mot": "Anyme", "categorie": "Streamer" },
    { "mot": "Antoine Daniel", "categorie": "Streamer" },
    { "mot": "Baghera Jones", "categorie": "Streamer" },
    { "mot": "Michou", "categorie": "Streamer" },
    { "mot": "Inoxtag", "categorie": "Streamer" },
    { "mot": "Mastu", "categorie": "Streamer" },
    { "mot": "Byilhann", "categorie": "Streamer" },
    { "mot": "Jiraya", "categorie": "Streamer" },
    { "mot": "Horty underscore", "categorie": "Streamer" },
    { "mot": "Angle Droit", "categorie": "Streamer" },
    { "mot": "Mynthos", "categorie": "Streamer" },
    { "mot": "Bob Lennon", "categorie": "Streamer" },
    { "mot": "Ultia", "categorie": "Streamer" },
    { "mot": "Ponce", "categorie": "Streamer" },
    { "mot": "Joueur du Grenier", "categorie": "Streamer" },
    { "mot": "Samueletienne", "categorie": "Streamer" },
    { "mot": "M4F Gaming", "categorie": "Streamer" },
    { "mot": "Ultia Moman", "categorie": "Streamer" },
    { "mot": "DamDam", "categorie": "Streamer" },
    { "mot": "Gomart", "categorie": "Streamer" },
    { "mot": "Emiru", "categorie": "Streamer" },
    { "mot": "Amouranth", "categorie": "Streamer" },
    { "mot": "Pokimane", "categorie": "Streamer" },
    { "mot": "OTP LoL", "categorie": "Streamer" },
    { "mot": "CroissantStrike", "categorie": "Streamer" },
    { "mot": "TheGreatReview", "categorie": "Streamer" },
    { "mot": "Ego", "categorie": "Streamer" },
    { "mot": "DrFeelGood", "categorie": "Streamer" },
    { "mot": "LittleBigWhale", "categorie": "Streamer" },
    { "mot": "Lutti", "categorie": "Streamer" },
    { "mot": "Jean Massiet", "categorie": "Streamer" },
    { "mot": "Chips & Noi", "categorie": "Streamer" },
    { "mot": "Mister MV", "categorie": "Streamer" },
    { "mot": "Caedrel", "categorie": "Streamer" },
    { "mot": "Helydia", "categorie": "Streamer" },
    { "mot": "Rivenzi", "categorie": "Streamer" },
    { "mot": "Alphacast", "categorie": "Streamer" },
    { "mot": "Valkyrae", "categorie": "Streamer" },
    { "mot": "Gom4rt", "categorie": "Streamer" },
    { "mot": "Solary", "categorie": "Streamer" },
    { "mot": "Shaunz", "categorie": "Streamer" },
    { "mot": "Ogaming", "categorie": "Streamer" },
    { "mot": "Zevent", "categorie": "Streamer" },
    { "mot": "GP Explorer", "categorie": "Streamer" },
    { "mot": "Lestream", "categorie": "Streamer" }
];

const esport = [
    { "mot": "Vitality", "categorie": "Esport" },
    { "mot": "Karmine Corp", "categorie": "Esport" },
    { "mot": "Fnatic", "categorie": "Esport" },
    { "mot": "T1", "categorie": "Esport" },
    { "mot": "GenG", "categorie": "Esport" },
    { "mot": "KT Rolster", "categorie": "Esport" },
    { "mot": "Los Ratones", "categorie": "Esport" },
    { "mot": "G2", "categorie": "Esport" }
];

const jeux = [
    { "mot": "Super Mario Bros", "categorie": "Jeu" },
    { "mot": "Ocarina of Time", "categorie": "Jeu" },
    { "mot": "Breath of the Wild", "categorie": "Jeu" },
    { "mot": "Minecraft", "categorie": "Jeu" },
    { "mot": "GTA", "categorie": "Jeu" },
    { "mot": "Red Dead Redemption", "categorie": "Jeu" },
    { "mot": "The Witcher", "categorie": "Jeu" },
    { "mot": "Skyrim", "categorie": "Jeu" },
    { "mot": "Dark Souls", "categorie": "Jeu" },
    { "mot": "Elden Ring", "categorie": "Jeu" },
    { "mot": "Bloodborne", "categorie": "Jeu" },
    { "mot": "God of War", "categorie": "Jeu" },
    { "mot": "The Last of Us", "categorie": "Jeu" },
    { "mot": "Halo", "categorie": "Jeu" },
    { "mot": "Call of Duty", "categorie": "Jeu" },
    { "mot": "World of Warcraft", "categorie": "Jeu" },
    { "mot": "League of Legends", "categorie": "Jeu" },
    { "mot": "Counter-Strike", "categorie": "Jeu" },
    { "mot": "Clair Obscur: Expedition 33", "categorie": "Jeu" },
    { "mot": "Valorant", "categorie": "Jeu" },
    { "mot": "Fortnite", "categorie": "Jeu" },
    { "mot": "Apex Legends", "categorie": "Jeu" },
    { "mot": "PUBG", "categorie": "Jeu" },
    { "mot": "Doom", "categorie": "Jeu" },
    { "mot": "Half-Life", "categorie": "Jeu" },
    { "mot": "H1Z1", "categorie": "Jeu" },
    { "mot": "Portal", "categorie": "Jeu" },
    { "mot": "BioShock", "categorie": "Jeu" },
    { "mot": "Resident Evil", "categorie": "Jeu" },
    { "mot": "Silent Hill", "categorie": "Jeu" },
    { "mot": "Metal Gear Solid", "categorie": "Jeu" },
    { "mot": "Final Fantasy", "categorie": "Jeu" },
    { "mot": "Pokémon", "categorie": "Jeu" },
    { "mot": "Mario Kart", "categorie": "Jeu" },
    { "mot": "Animal Crossing", "categorie": "Jeu" },
    { "mot": "Mass Effect", "categorie": "Jeu" },
    { "mot": "Dragon Age", "categorie": "Jeu" },
    { "mot": "Cyberpunk 2077", "categorie": "Jeu" },
    { "mot": "Street Fighter II", "categorie": "Jeu" },
    { "mot": "Tekken", "categorie": "Jeu" },
    { "mot": "Mortal Kombat", "categorie": "Jeu" },
    { "mot": "Diablo", "categorie": "Jeu" },
    { "mot": "Hades", "categorie": "Jeu" },
    { "mot": "Hollow Knight", "categorie": "Jeu" },
    { "mot": "Celeste", "categorie": "Jeu" },
    { "mot": "Undertale", "categorie": "Jeu" },
    { "mot": "Among Us", "categorie": "Jeu" },
    { "mot": "Terraria", "categorie": "Jeu" },
    { "mot": "Stardew Valley", "categorie": "Jeu" },
    { "mot": "Sea of Thieves", "categorie": "Jeu" },
    { "mot": "Overwatch", "categorie": "Jeu" },
    { "mot": "Left 4 Dead", "categorie": "Jeu" },
    { "mot": "Dead Cells", "categorie": "Jeu" },
    { "mot": "Cuphead", "categorie": "Jeu" },
    { "mot": "Rayman Legends", "categorie": "Jeu" },
    { "mot": "Crash Bandicoot", "categorie": "Jeu" },
    { "mot": "Spyro the Dragon", "categorie": "Jeu" },
    { "mot": "Sonic the Hedgehog", "categorie": "Jeu" },
    { "mot": "Tomb Raider", "categorie": "Jeu" },
    { "mot": "Prince of Persia", "categorie": "Jeu" },
    { "mot": "Far Cry", "categorie": "Jeu" },
    { "mot": "Battlefield", "categorie": "Jeu" },
    { "mot": "FIFA", "categorie": "Jeu" },
    { "mot": "Pro Evolution Soccer", "categorie": "Jeu" },
    { "mot": "Age of Empires", "categorie": "Jeu" },
    { "mot": "StarCraft", "categorie": "Jeu" },
    { "mot": "Civilization", "categorie": "Jeu" },
    { "mot": "SimCity", "categorie": "Jeu" },
    { "mot": "The Sims", "categorie": "Jeu" },
    { "mot": "Roblox", "categorie": "Jeu" },
    { "mot": "Tetris", "categorie": "Jeu" }
];

const LoL = [
    {"mot":"Lame d'infini","categorie":"LoL"},
    {"mot":"Coiffe de Rabadon","categorie":"LoL"},
    {"mot":"Trinité","categorie":"LoL"},
    {"mot":"Ange gardien","categorie":"LoL"},
    {"mot":"Soif-de-sang","categorie":"LoL"},
    {"mot":"Gage de Sterak","categorie":"LoL"},
    {"mot":"Épée vespérale de Draktharr","categorie":"LoL"},
    {"mot":"Étreinte démoniaque","categorie":"LoL"},
    {"mot":"Bâton du vide","categorie":"LoL"},
    {"mot":"Fléau de liche","categorie":"LoL"},
    {"mot":"Danseur fantôme","categorie":"LoL"},
    {"mot":"Force de la trinité","categorie":"LoL"},
    {"mot":"Cotte épineuse","categorie":"LoL"},
    {"mot":"Cœur gelé","categorie":"LoL"},
    {"mot":"Visage spirituel","categorie":"LoL"},
    {"mot":"Hydre vorace","categorie":"LoL"},
    {"mot":"Lame du roi déchu","categorie":"LoL"},
    {"mot":"Plaque du mort","categorie":"LoL"},
    {"mot":"Morellonomicon","categorie":"LoL"},
    {"mot":"ARAM","categorie":"LoL"},
    {"mot":"Zhonya","categorie":"LoL"},
    {"mot":"Faker","categorie":"LoL"},
    {"mot":"Uzi","categorie":"LoL"},
    {"mot":"Caps","categorie":"LoL"},
    {"mot":"Rekkles","categorie":"LoL"},
    {"mot":"Perkz","categorie":"LoL"},
    {"mot":"Doublelift","categorie":"LoL"},
    {"mot":"TheShy","categorie":"LoL"},
    {"mot":"Deft","categorie":"LoL"},
    {"mot":"Bjergsen","categorie":"LoL"},
    {"mot":"Chovy","categorie":"LoL"},
    {"mot":"ShowMaker","categorie":"LoL"},
    {"mot":"Keria","categorie":"LoL"},
    {"mot":"Impact","categorie":"LoL"},
    {"mot":"Bang","categorie":"LoL"},
    {"mot":"Wolf","categorie":"LoL"},
    {"mot":"Mata","categorie":"LoL"},
    {"mot":"Ruler","categorie":"LoL"},
    {"mot":"Canyon","categorie":"LoL"},
    {"mot":"Nuguri","categorie":"LoL"},
    {"mot":"Score","categorie":"LoL"}
];

const discord = [
    {"mot":"Palala","categorie":"Discord"},
    {"mot":"J'ai bait","categorie":"Discord"},
    {"mot":"Dictateur","categorie":"Discord"},
    {"mot":"Kardashian","categorie":"Discord"},
    {"mot":"Carglass","categorie":"Discord"},
    {"mot":"Rasengan","categorie":"Discord"},
    {"mot":"Shudaderu","categorie":"Discord"},
    {"mot":"Toulouuuuse","categorie":"Discord"},
    {"mot":"Jennie","categorie":"Discord"},
    {"mot":"Espagnolette","categorie":"Discord"},
    {"mot":"Tête de noisette","categorie":"Discord"},
    {"mot":"Tarot africain","categorie":"Discord"},
    {"mot":"Ta gueule","categorie":"Discord"},
    {"mot":"C'est rigolo","categorie":"Discord"},
    {"mot":"Wejdene","categorie":"Discord"},
    {"mot":"Papa japonais","categorie":"Discord"},
    {"mot":"Orange","categorie":"Discord"},
    {"mot":"CEO","categorie":"Discord"},
    {"mot":"Salle de pause","categorie":"Discord"},
    {"mot":"1v5","categorie":"Discord"},
    {"mot":"Les gars, le mieux est l'ennemi du bien","categorie":"Discord"}
];

// Merge all categorized words
const categorizedWords = [
    ...pseudos,
    ...streamers,
    ...esport,
    ...jeux,
    ...LoL,
    ...discord
];

async function main() {
    console.log('Deleting all existing words...');
    await prisma.codenameWord.deleteMany({});

    // Insert default words (no category)
    console.log(`Inserting ${defaultWords.length} default words (no category)...`);
    const batchSize = 100;

    for (let i = 0; i < defaultWords.length; i += batchSize) {
        const batch = defaultWords.slice(i, i + batchSize);
        await prisma.codenameWord.createMany({
            data: batch.map(word => ({
                word,
                category: null,
            })),
            skipDuplicates: true,
        });
    }

    // Insert categorized words
    console.log(`Inserting ${categorizedWords.length} categorized words...`);
    for (let i = 0; i < categorizedWords.length; i += batchSize) {
        const batch = categorizedWords.slice(i, i + batchSize);
        await prisma.codenameWord.createMany({
            data: batch.map(w => ({
                word: w.mot,
                category: w.categorie,
            })),
            skipDuplicates: true,
        });
        console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(categorizedWords.length / batchSize)}`);
    }

    // Get category stats
    const categories = await prisma.codenameWord.groupBy({
        by: ['category'],
        _count: { category: true },
    });

    console.log('\nCategories:');
    categories.forEach(c => {
        console.log(`  ${c.category}: ${c._count.category} words`);
    });

    const total = await prisma.codenameWord.count();
    console.log(`\nTotal: ${total} words inserted`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
