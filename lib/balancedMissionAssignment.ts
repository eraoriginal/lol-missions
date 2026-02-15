import { Mission, Player } from '@prisma/client';

type PlayerWithMissions = Player & {
    missions: { mission: Mission; type: string }[];
};

export interface DuelPair {
    missionId: string;
    player1Id: string;
    player2Id: string;
    player1ResolvedText: string;
    player2ResolvedText: string;
}

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
    _missionType: 'START' | 'MID' | 'LATE' = 'START' // eslint-disable-line @typescript-eslint/no-unused-vars
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

/**
 * Assigne N missions par joueur pour le mode choix.
 * Réutilise la logique d'équilibrage : détermine la difficulté cible pour chaque joueur,
 * puis tire N missions de cette difficulté.
 * Exclut les missions duel pour éviter la complexité de pairing.
 */
export function assignBalancedMissionChoices(
    players: Player[] | PlayerWithMissions[],
    missions: Mission[],
    choiceCount: number,
    _missionType: 'START' | 'MID' | 'LATE' = 'START' // eslint-disable-line @typescript-eslint/no-unused-vars
): Map<string, Mission[]> {
    const assignments = new Map<string, Mission[]>();
    const playersWithMissions = players as PlayerWithMissions[];

    // Filtre les missions duel
    const nonDuelMissions = missions.filter(m => m.playerPlaceholder !== 'duel');

    // Groupe les missions disponibles par difficulté
    const byDifficulty = new Map<string, Mission[]>();
    for (const mission of nonDuelMissions) {
        const diff = mission.difficulty;
        if (!diff) continue;
        const existing = byDifficulty.get(diff) || [];
        existing.push(mission);
        byDifficulty.set(diff, existing);
    }

    // Mélange chaque groupe
    for (const [diff, group] of byDifficulty) {
        byDifficulty.set(diff, shuffle(group));
    }

    const allDifficulties = ['easy', 'medium', 'hard'];

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

        // Choix aléatoire de la difficulté cible
        const shuffledAvailable = shuffle(availableDifficulties);
        const choices: Mission[] = [];

        // Essaie de tirer N missions de la difficulté cible
        for (const chosenDifficulty of shuffledAvailable) {
            const pool = byDifficulty.get(chosenDifficulty);
            if (!pool) continue;

            while (choices.length < choiceCount && pool.length > 0) {
                choices.push(pool.pop()!);
            }
            if (choices.length >= choiceCount) break;
        }

        // Fallback : complète avec d'autres difficultés si pas assez
        if (choices.length < choiceCount) {
            for (const diff of allDifficulties) {
                const pool = byDifficulty.get(diff);
                if (!pool) continue;
                while (choices.length < choiceCount && pool.length > 0) {
                    choices.push(pool.pop()!);
                }
                if (choices.length >= choiceCount) break;
            }
        }

        if (choices.length > 0) {
            assignments.set(player.id, choices);
        }
    }

    return assignments;
}

/**
 * Post-traite les assignations pour gérer les missions duel.
 * Si une mission duel a été tirée aléatoirement pour un joueur,
 * on trouve un adversaire et on lui assigne la même mission (avec texte inversé).
 *
 * @param assignments - Les assignations déjà faites par assignBalancedMissions
 * @param players - Tous les joueurs
 * @param allMissions - Toutes les missions disponibles (pour remplacer si pas d'adversaire)
 * @returns Les paires de duel créées (pour savoir qui doit avoir resolvedText modifié)
 */
export function processDuelMissions(
    assignments: Map<string, Mission>,
    players: Player[],
    allMissions: Mission[]
): DuelPair[] {
    const duelPairs: DuelPair[] = [];
    const usedMissionIds = new Set<string>();

    // Collecte les IDs des missions déjà utilisées
    for (const mission of assignments.values()) {
        usedMissionIds.add(mission.id);
    }

    // Collecte d'abord toutes les entrées avec mission duel (pour éviter de modifier pendant l'itération)
    const duelEntries: { playerId: string; mission: Mission }[] = [];
    for (const [playerId, mission] of assignments) {
        if (mission.playerPlaceholder === 'duel') {
            duelEntries.push({ playerId, mission });
        }
    }

    const processedPlayerIds = new Set<string>();

    for (const { playerId, mission } of duelEntries) {
        // Skip si ce joueur a déjà été traité (comme adversaire d'un autre duel)
        if (processedPlayerIds.has(playerId)) continue;

        const player = players.find(p => p.id === playerId);
        if (!player || (player.team !== 'red' && player.team !== 'blue')) continue;

        // Trouve un adversaire qui n'a pas déjà été assigné à un duel
        const opponentTeam = player.team === 'red' ? 'blue' : 'red';
        const availableOpponents = players.filter(p =>
            p.team === opponentTeam && !processedPlayerIds.has(p.id)
        );

        if (availableOpponents.length === 0) {
            // Pas d'adversaire disponible -> remplacer par une mission non-duel
            const replacement = allMissions.find(m =>
                m.playerPlaceholder !== 'duel' && !usedMissionIds.has(m.id)
            );
            if (replacement) {
                assignments.set(playerId, replacement);
                usedMissionIds.add(replacement.id);
            }
            continue;
        }

        // Prend un adversaire au hasard
        const opponent = availableOpponents[Math.floor(Math.random() * availableOpponents.length)];

        // Marque les deux joueurs comme traités
        processedPlayerIds.add(player.id);
        processedPlayerIds.add(opponent.id);

        // Remplace la mission de l'adversaire par la mission duel
        assignments.set(opponent.id, mission);

        // Crée la paire avec les textes résolus
        duelPairs.push({
            missionId: mission.id,
            player1Id: player.id,
            player2Id: opponent.id,
            player1ResolvedText: mission.text.replace('{player}', opponent.name),
            player2ResolvedText: mission.text.replace('{player}', player.name),
        });
    }

    return duelPairs;
}
