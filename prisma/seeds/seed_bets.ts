import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding bet types...');

    // Supprime les types de paris existants
    try {
        await prisma.betType.deleteMany();
        console.log('✅ Existing bet types deleted');
    } catch {
        console.log('⚠️ No existing bet types to delete');
    }

    // ════════════════════════════════════════════════════════════════
    // 📊 RÉCAPITULATIF : 100 paris
    // ════════════════════════════════════════════════════════════════
    // Combat (15) | Performance (15) | Survie (10) | Build (10)
    // Précision (15) | Fun (15) | Toxic (10) | Pari fou (10)
    // ════════════════════════════════════════════════════════════════

    const betTypes = [

        // ── 🗡️ COMBAT (15) ──────────────────────────────────────────
        { text: "Fera le plus de kills de son équipe", category: "Combat" },
        { text: "Fera le plus de morts de son équipe", category: "Combat" },
        { text: "Fera le plus de dégâts de son équipe", category: "Combat" },
        { text: "Fera le premier kill de la partie", category: "Combat" },
        { text: "Mourra en premier dans la partie", category: "Combat" },
        { text: "Fera un pentakill", category: "Combat" },
        { text: "Fera le dernier kill de la partie", category: "Combat" },
        { text: "Aura plus de kills que tout le reste de son équipe combiné", category: "Combat" },

        // ── 📈 PERFORMANCE (15) ─────────────────────────────────────
        { text: "Sera MVP de la partie (meilleur KDA)", category: "Performance" },
        { text: "Aura le plus de CS de son équipe", category: "Performance" },
        { text: "Fera le plus de soins de son équipe", category: "Performance" },
        { text: "Aura le plus d'assists de son équipe", category: "Performance" },
        { text: "Aura un kill participation supérieur à 70%", category: "Performance" },
        { text: "Finira premier aux dégâts de la partie entière (les 2 équipes)", category: "Performance" },
        { text: "Fera plus de dégâts aux tourelles que quiconque dans son équipe", category: "Performance" },
        { text: "Tankera le plus de dégâts de son équipe", category: "Performance" },
        { text: "Infligera plus de dégâts magiques que physiques", category: "Performance" },
        { text: "Aura le meilleur score de contrôle de foule de son équipe", category: "Performance" },
        { text: "Réduira (mitigation) plus de 20 000 dégâts", category: "Performance" },

        // ── 🛡️ SURVIE (10) ──────────────────────────────────────────
        { text: "Mourra moins de 5 fois", category: "Survie" },
        { text: "Mourra moins de 8 fois", category: "Survie" },
        { text: "Sera le joueur avec le moins de morts de son équipe", category: "Survie" },
        { text: "Ne mourra pas pendant les 5 premières minutes", category: "Survie" },
        { text: "Finira la partie vivant (pas mort quand le Nexus tombe)", category: "Survie" },
        { text: "Se fera exécuter au moins une fois", category: "Survie" },

        // ── 🔨 BUILD (10) ───────────────────────────────────────────
        { text: "Achètera ses bottes en dernier", category: "Build" },
        { text: "Finira la partie avec 6 objets complets", category: "Build" },
        { text: "Achètera un objet totalement inutile pour son champion", category: "Build" },
        { text: "Achètera un objet que personne d'autre n'a dans la partie", category: "Build" },
        { text: "Construira un Warmog", category: "Build" },
        { text: "Construira un Sablier de Zhonya", category: "Build" },
        { text: "Finira la partie sans bottes", category: "Build" },
        { text: "Achètera un objet support alors qu'il n'est pas support", category: "Build" },
        { text: "Sera le premier joueur à compléter un item complet", category: "Build" },
        { text: "Aura le build le plus cher de son équipe en fin de partie", category: "Build" },

        // ── 🎯 PRÉCISION (15) ───────────────────────────────────────
        { text: "Finira avec exactement 10 kills", category: "Précision" },
        { text: "Finira avec autant de kills que de morts", category: "Précision" },
        { text: "Finira avec exactement le double de kills par rapport à ses morts", category: "Précision" },
        { text: "Aura un nombre d'assists divisible par 5", category: "Précision" },
        { text: "Finira avec plus de 30 assists", category: "Précision" },
        { text: "Finira avec plus de 20 kills", category: "Précision" },
        { text: "Son nombre de kills sera supérieur à son nombre d'assists", category: "Précision" },
        { text: "Fera un coup critique supérieur à 1000 dégâts", category: "Précision" },

        // ── 🎪 FUN (15) ─────────────────────────────────────────────
        { text: "Se plaindra de son champion en vocal", category: "Fun" },
        { text: "Dira 'GG' ou 'FF' avant la fin de la partie", category: "Fun" },
        { text: "Se fera tuer en fountain dive", category: "Fun" },
        { text: "Fera danser son champion au moins une fois", category: "Fun" },
        { text: "Sera AFK pendant plus de 30 secondes (volontaire ou non)", category: "Fun" },
        { text: "Prendra le TP adverse au moins une fois", category: "Fun" },
        { text: "Sera tué par les sbires", category: "Fun" },
        { text: "Se fera voler un kill et râlera", category: "Fun" },
        { text: "Fera un play que tout le monde applaudira", category: "Fun" },

        // ── 🧂 TOXIC (10) ───────────────────────────────────────────
        { text: "Écrira '?' dans le chat après un kill", category: "Toxic" },
        { text: "Blâmera un coéquipier pour une de ses morts", category: "Toxic" },
        { text: "Accusera le lag pour justifier un fail", category: "Toxic" },
        { text: "Écrira 'EZ' dans le chat à un moment", category: "Toxic" },
        { text: "Demandera un FF", category: "Toxic" },
        { text: "Critiquera le build d'un coéquipier", category: "Toxic" },
        { text: "Insultera affectueusement un coéquipier", category: "Toxic" },

        // ── 🔮 PARI FOU (10) ────────────────────────────────────────
        { text: "Fera plus de kills que les 4 autres joueurs de son équipe réunis", category: "Pari fou" },
        { text: "Fera 2 pentakills dans la même partie", category: "Pari fou" },
        { text: "Fera plus de 50 000 dégâts dans la partie", category: "Pari fou" },
        { text: "Finira avec un KDA supérieur à 10", category: "Pari fou" },
        { text: "Sera impliqué dans 100% des kills de son équipe", category: "Pari fou" },
        { text: "Mourra plus de 20 fois", category: "Pari fou" },
        { text: "Terminera avec 0 kills et plus de 30 assists", category: "Pari fou" },
        { text: "Fera un 1v3 ou plus et survivra", category: "Pari fou" },
        { text: "Fera plus de soins que de dégâts infligés", category: "Pari fou" },
    ];

    // ════════════════════════════════════════════════════════════════
    // 🚀 INSERTION EN BASE
    // ════════════════════════════════════════════════════════════════
    console.log('📝 Creating bet types...');
    for (const betType of betTypes) {
        await prisma.betType.create({ data: betType });
    }
    console.log(`✅ ${betTypes.length} bet types created`);

    // Stats par catégorie
    const categories = [...new Set(betTypes.map(b => b.category))];
    for (const cat of categories) {
        const count = betTypes.filter(b => b.category === cat).length;
        console.log(`   📂 ${cat}: ${count}`);
    }

    console.log(`\n🎉 Seeding completed!`);
    console.log(`📊 Total: ${betTypes.length} bet types`);
}

main()
    .catch((e) => {
        console.error('❌ Error during seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });