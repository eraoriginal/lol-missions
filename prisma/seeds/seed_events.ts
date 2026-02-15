import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding events...');

    // Supprime les événements existants
    try {
        await prisma.event.deleteMany();
        console.log('✅ Existing events deleted');
    } catch {
        console.log('⚠️ No existing events to delete');
    }

    // ========================================
    // EVENTS START (début de partie)
    // ========================================
    const startEvents = [
        { text: "Chaque équipe désigne son champion pour un duel! Vous devez encourager comme jamais votre coéquipier", type: "START", category: "Combat", difficulty: "hard", points: 500, duration: 60 },
        { text: "1v1 : {red1} contre {blue1} !", type: "START", category: "Combat", difficulty: "medium", points: 200, duration: 60, music: "1V1" },
        { text: "2v2 : {red1} et {red2} contre {blue1} et {blue2} !", type: "START", category: "Combat", difficulty: "hard", points: 300, duration: 60, minPlayers: 4, music: "2V2" },
        { text: "3v3 : {red1}, {red2} et {red3} contre {blue1}, {blue2} et {blue3} !", type: "START", category: "Combat", difficulty: "hard", points: 500, duration: 60, minPlayers: 6, music: "3V3" },
        { text: "Si {player} meurt, l'équipe adverse remporte 500 points! {player} ne peut pas être derrière une tour alliée", type: "START", category: "Survie", difficulty: "hard", points: 500, duration: 60 },
    ];

    // ========================================
    // EVENTS MID (milieu de partie)
    // ========================================
    const midEvents = [
        { text: "Etre la première équipe à mourir dans la fontaine adverse. Interdiction d'infliger des dégats à l'équipe adverse. Si un joueur de ton équipe meurt avant d'atteindre la fontaine, c'est perdu", type: "MID", category: "Suicide", difficulty: "medium", points: 200, duration: 60 },
        { text: "Réaliser un ACE", type: "MID", category: "Combat", difficulty: "medium", points: 200, duration: 60 },
        { text: "Ton équipe entière doit mourir avant l'équipe adverse", type: "MID", category: "Build", difficulty: "medium", points: 200, duration: 60 },
        { text: "Chaque équipe désigne son champion pour un duel! Vous devez encourager comme jamais votre coéquipier", type: "MID", category: "Combat", difficulty: "hard", points: 500, duration: 60 },
        { text: "1v1 : {red1} contre {blue1} !", type: "MID", category: "Combat", difficulty: "medium", points: 200, duration: 60, music: "1V1" },
        { text: "2v2 : {red1} et {red2} contre {blue1} et {blue2} !", type: "MID", category: "Combat", difficulty: "hard", points: 300, duration: 90, minPlayers: 4, music: "2V2" },
        { text: "3v3 : {red1}, {red2} et {red3} contre {blue1}, {blue2} et {blue3} !", type: "MID", category: "Combat", difficulty: "hard", points: 500, duration: 120, minPlayers: 6, music: "3V3" },
        { text: "Si {player} meurt, l'équipe adverse remporte 500 points! {player} ne peut pas être derrière une tour alliée", type: "MID", category: "Survie", difficulty: "hard", points: 500, duration: 60 },
    ];

    // ========================================
    // EVENTS LATE (fin de partie)
    // ========================================
    const lateEvents = [
        { text: "Etre la première équipe à mourir dans la fontaine adverse. Interdiction d'infliger des dégats à l'équipe adverse. Si un joueur de ton équipe meurt avant d'atteindre la fontaine, c'est perdu", type: "LATE", category: "Suicide", difficulty: "medium", points: 200, duration: 60 },
        { text: "Etre la première équipe à réaliser un ACE", type: "LATE", category: "Combat", difficulty: "easy", points: 100, duration: 60 },
        { text: "Etre la première équipe à faire tomber la prochaine tour", type: "LATE", category: "Combat", difficulty: "medium", points: 200, duration: 60 },
        { text: "Chaque équipe désigne son champion pour un duel! Vous devez saucer comme jamais votre coéquipier", type: "LATE", category: "Combat", difficulty: "hard", points: 500, duration: 60 },
        { text: "1v1 : {red1} contre {blue1} !", type: "LATE", category: "Combat", difficulty: "medium", points: 200, duration: 60, music: "1V1" },
        { text: "2v2 : {red1} et {red2} contre {blue1} et {blue2} !", type: "LATE", category: "Combat", difficulty: "hard", points: 300, duration: 90, minPlayers: 4, music: "2V2" },
        { text: "3v3 : {red1}, {red2} et {red3} contre {blue1}, {blue2} et {blue3} !", type: "LATE", category: "Combat", difficulty: "hard", points: 500, duration: 120, minPlayers: 6, music: "3V3" },
        { text: "Si {player} meurt, l'équipe adverse remporte 500 points! {player} ne peut pas être derrière une tour alliée", type: "LATE", category: "Survie", difficulty: "hard", points: 500, duration: 60 },
    ];

    // ========================================
    // INSERTION EN BASE
    // ========================================
    console.log('📝 Creating START events...');
    for (const event of startEvents) {
        await prisma.event.create({ data: event });
    }
    console.log(`✅ ${startEvents.length} START events created`);

    console.log('📝 Creating MID events...');
    for (const event of midEvents) {
        await prisma.event.create({ data: event });
    }
    console.log(`✅ ${midEvents.length} MID events created`);

    console.log('📝 Creating LATE events...');
    for (const event of lateEvents) {
        await prisma.event.create({ data: event });
    }
    console.log(`✅ ${lateEvents.length} LATE events created`);

    const total = startEvents.length + midEvents.length + lateEvents.length;
    console.log(`\n🎉 Seeding completed!`);
    console.log(`📊 Total: ${total} events`);
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
