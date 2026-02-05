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
 * Calcule les points actuels de chaque équipe basé sur les missions déjà assignées
 */
function calculateTeamPoints(players: PlayerWithMissions[]): { red: number; blue: number } {
    let red = 0;
    let blue = 0;

    for (const player of players) {
        const playerPoints = player.missions.reduce((sum, pm) => sum + (pm.mission?.points || 0), 0);
        if (player.team === 'red') red += playerPoints;
        else if (player.team === 'blue') blue += playerPoints;
    }

    return { red, blue };
}

/**
 * Assigne des missions de façon aléatoire.
 * Pour START et MID : tirage 100% aléatoire
 * Pour LATE : distribution intelligente pour équilibrer le total final
 */
export function assignBalancedMissions(
    players: Player[] | PlayerWithMissions[],
    missions: Mission[],
    missionType: 'START' | 'MID' | 'LATE' = 'START'
): Map<string, Mission> {
    const assignments = new Map<string, Mission>();

    // Sépare les joueurs par équipe et mélange
    const redPlayers = shuffle(players.filter(p => p.team === 'red'));
    const bluePlayers = shuffle(players.filter(p => p.team === 'blue'));

    // Mélange les missions
    const shuffledMissions = shuffle([...missions]);

    // Pour START et MID : tirage purement aléatoire
    if (missionType === 'START' || missionType === 'MID') {
        const allPlayers = shuffle([...redPlayers, ...bluePlayers]);
        for (let i = 0; i < allPlayers.length && i < shuffledMissions.length; i++) {
            assignments.set(allPlayers[i].id, shuffledMissions[i]);
        }
        return assignments;
    }

    // Pour LATE : distribution intelligente pour équilibrer
    const playersWithMissions = players as PlayerWithMissions[];
    const currentPoints = calculateTeamPoints(playersWithMissions);

    // Points cibles : on veut que red + redLate = blue + blueLate
    // Donc redLate - blueLate = blue - red = -currentImbalance
    const currentImbalance = currentPoints.red - currentPoints.blue;

    // On doit distribuer N missions à red et M missions à blue
    const redCount = redPlayers.length;
    const blueCount = bluePlayers.length;
    const totalMissionsNeeded = redCount + blueCount;

    // Prend les missions nécessaires du pool mélangé
    const missionPool = shuffledMissions.slice(0, totalMissionsNeeded);

    // Trie les missions par points (pour pouvoir faire des choix intelligents)
    const sortedMissions = [...missionPool].sort((a, b) => b.points - a.points);

    // Algorithme glouton :
    // On assigne les missions une par une en choisissant à chaque fois
    // l'équipe qui a le plus besoin de points (ou qui en a le moins si on doit réduire)

    let redPoints = currentPoints.red;
    let bluePoints = currentPoints.blue;
    let redAssigned = 0;
    let blueAssigned = 0;

    const redMissions: Mission[] = [];
    const blueMissions: Mission[] = [];

    for (const mission of shuffle(sortedMissions)) {  // Re-mélange pour ne pas toujours donner les grosses missions en premier
        const redNeedsMore = redAssigned < redCount;
        const blueNeedsMore = blueAssigned < blueCount;

        if (!redNeedsMore && !blueNeedsMore) break;

        if (!redNeedsMore) {
            // Doit aller à blue
            blueMissions.push(mission);
            bluePoints += mission.points;
            blueAssigned++;
        } else if (!blueNeedsMore) {
            // Doit aller à red
            redMissions.push(mission);
            redPoints += mission.points;
            redAssigned++;
        } else {
            // Les deux équipes ont besoin de missions
            // On donne à l'équipe qui a le moins de points actuellement
            if (redPoints <= bluePoints) {
                redMissions.push(mission);
                redPoints += mission.points;
                redAssigned++;
            } else {
                blueMissions.push(mission);
                bluePoints += mission.points;
                blueAssigned++;
            }
        }
    }

    // Assigne les missions aux joueurs (mélangées)
    const shuffledRedMissions = shuffle(redMissions);
    const shuffledBlueMissions = shuffle(blueMissions);

    for (let i = 0; i < redPlayers.length && i < shuffledRedMissions.length; i++) {
        assignments.set(redPlayers[i].id, shuffledRedMissions[i]);
    }

    for (let i = 0; i < bluePlayers.length && i < shuffledBlueMissions.length; i++) {
        assignments.set(bluePlayers[i].id, shuffledBlueMissions[i]);
    }

    return assignments;
}
