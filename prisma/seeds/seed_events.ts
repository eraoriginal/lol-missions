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
        { text: "[START] Événement placeholder 1", type: "START", category: "Combat", difficulty: "easy", points: 100 },
        { text: "[START] Événement placeholder 2", type: "START", category: "Combat", difficulty: "medium", points: 200 },
        { text: "[START] Événement placeholder 3", type: "START", category: "Survie", difficulty: "easy", points: 100 },
        { text: "[START] Événement placeholder 4", type: "START", category: "Troll", difficulty: "hard", points: 500 },
        { text: "[START] Événement placeholder 5", type: "START", category: "Build", difficulty: "medium", points: 200 },
    ];

    // ========================================
    // EVENTS MID (milieu de partie)
    // ========================================
    const midEvents = [
        { text: "[MID] Événement placeholder 1", type: "MID", category: "Combat", difficulty: "easy", points: 100 },
        { text: "[MID] Événement placeholder 2", type: "MID", category: "Build", difficulty: "medium", points: 200 },
        { text: "[MID] Événement placeholder 3", type: "MID", category: "Survie", difficulty: "hard", points: 500 },
        { text: "[MID] Événement placeholder 4", type: "MID", category: "Troll", difficulty: "easy", points: 100 },
        { text: "[MID] Événement placeholder 5", type: "MID", category: "Communication", difficulty: "medium", points: 200 },
    ];

    // ========================================
    // EVENTS LATE (fin de partie)
    // ========================================
    const lateEvents = [
        { text: "[LATE] Événement placeholder 1", type: "LATE", category: "Combat", difficulty: "easy", points: 100 },
        { text: "[LATE] Événement placeholder 2", type: "LATE", category: "Build", difficulty: "medium", points: 200 },
        { text: "[LATE] Événement placeholder 3", type: "LATE", category: "Survie", difficulty: "hard", points: 500 },
        { text: "[LATE] Événement placeholder 4", type: "LATE", category: "Toxic", difficulty: "easy", points: 100 },
        { text: "[LATE] Événement placeholder 5", type: "LATE", category: "Communication", difficulty: "medium", points: 200 },
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
