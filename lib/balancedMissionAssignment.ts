import { Mission, Player } from '@prisma/client';

type PlayerWithMissions = Player & {
    missions: { mission: Mission; type: string }[];
};

/**
 * Mélange un tableau avec Fisher-Yates
 */
function shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Assigne des missions avec un système d'équilibre parfait :
 * - Chaque joueur reçoit exactement 1 EASY, 1 MEDIUM et 1 HARD au total
 * - L'ordre des difficultés est aléatoire entre les phases START/MID/LATE
 * - Chaque joueur a donc exactement 600 pts potentiels (100 + 200 + 300)
 *
 * Algorithme :
 * - Pour START : tire une difficulté aléatoire parmi [easy, medium, hard]
 * - Pour MID : tire une difficulté parmi les 2 restantes
 * - Pour LATE : assigne la difficulté manquante
 */
export function assignBalancedMissions(
    players: Player[] | PlayerWithMissions[],
    missions: Mission[],
    missionType: 'START' | 'MID' | 'LATE' = 'START'
): Map<string, Mission> {
    const assignments = new Map<string, Mission>();
    const playersWithMissions = players as PlayerWithMissions[];

    // Groupe les missions disponibles par difficulté
    const byDifficulty = new Map<string, Mission[]>();
    for (const mission of missions) {
        const diff = mission.difficulty;
        if (!diff) continue;
        const existing = byDifficulty.get(diff) || [];
        existing.push(mission);
        byDifficulty.set(diff, existing);
    }

    // Mélange chaque groupe pour le tirage aléatoire
    for (const [diff, group] of byDifficulty) {
        byDifficulty.set(diff, shuffle(group));
    }

    const allDifficulties = ['easy', 'medium', 'hard'];

    // Pour chaque joueur dans une équipe
    for (const player of playersWithMissions) {
        if (player.team !== 'red' && player.team !== 'blue') continue;

        // Trouve les difficultés déjà assignées à ce joueur
        const existingDifficulties = new Set<string>();
        if (player.missions) {
            for (const pm of player.missions) {
                if (pm.mission?.difficulty) {
                    existingDifficulties.add(pm.mission.difficulty);
                }
            }
        }

        // Difficultés pas encore assignées
        const availableDifficulties = allDifficulties.filter(d => !existingDifficulties.has(d));

        if (availableDifficulties.length === 0) continue;

        // Choix aléatoire parmi les difficultés disponibles
        const shuffledAvailable = shuffle(availableDifficulties);
        let assigned = false;

        // Essaie d'assigner une mission de la difficulté choisie
        for (const chosenDifficulty of shuffledAvailable) {
            const pool = byDifficulty.get(chosenDifficulty);
            if (pool && pool.length > 0) {
                assignments.set(player.id, pool.pop()!);
                assigned = true;
                break;
            }
        }

        // Fallback : si aucune mission disponible dans les difficultés restantes,
        // prend n'importe quelle mission disponible
        if (!assigned) {
            for (const diff of allDifficulties) {
                const pool = byDifficulty.get(diff);
                if (pool && pool.length > 0) {
                    assignments.set(player.id, pool.pop()!);
                    break;
                }
            }
        }
    }

    return assignments;
}
