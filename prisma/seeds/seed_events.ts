import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding events...');

    // Supprime les événements existants
    try {
        await prisma.event.deleteMany();
        console.log('✅ Existing events deleted');
    } catch (e) {
        console.log('⚠️ No existing events to delete');
    }

    // ========================================
    // EVENTS START (début de partie)
    // ========================================
    const startEvents = [
        { text: "Etre la première équipe à mourir dans la fontaine adverse", type: "START", category: "Survie", difficulty: "easy", points: 100, duration: 60 },
        { text: "Etre la première équipe à calculer : 10 + 19 - 56 + 47 - 13 -77 - 56 + 231 - 411 + 378 - 3", type: "START", category: "Combat", difficulty: "medium", points: 200, duration: 60 },
        { text: "Etre la première équipe à calculer : 120 − 75 − 64 + 98 + 33 − 142 + 67 − 19", type: "START", category: "Combat", difficulty: "medium", points: 200, duration: 60 },
        { text: "Etre la première équipe à calculer : 24 + 19 - 56 + 77 - 13 -77 - 12 + 231 - 257 + 378 - 3", type: "START", category: "Combat", difficulty: "medium", points: 200, duration: 60 },
        { text: "Chaque équipe désigne son champion pour un duel! Vous devez encourager comme jamais votre coéquipier", type: "START", category: "Combat", difficulty: "hard", points: 500, duration: 60 },
    ];

    // ========================================
    // EVENTS MID (milieu de partie)
    // ========================================
    const midEvents = [
        { text: "Réaliser un ACE", type: "MID", category: "Combat", difficulty: "medium", points: 200, duration: 60 },
        { text: "Ton équipe entière doit mourir avant l'équipe adverse", type: "MID", category: "Build", difficulty: "medium", points: 200, duration: 60 },
        { text: "Chaque équipe désigne son champion pour un duel! Vous devez encourager comme jamais votre coéquipier", type: "MID", category: "Combat", difficulty: "hard", points: 500, duration: 60 },

    ];

    // ========================================
    // EVENTS LATE (fin de partie)
    // ========================================
    const lateEvents = [
        { text: "Etre la première équipe à réaliser un ACE", type: "LATE", category: "Combat", difficulty: "easy", points: 100, duration: 60 },
        { text: "Etre la première équipe à faire tomber la prochaine tour", type: "LATE", category: "Combat", difficulty: "medium", points: 200, duration: 60 },
        { text: "Chaque équipe désigne son champion pour un duel! Vous devez saucer comme jamais votre coéquipier", type: "LATE", category: "Combat", difficulty: "hard", points: 500, duration: 60 },

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
