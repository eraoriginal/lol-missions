import { Player, Mission } from '@prisma/client';

/**
 * Résout le placeholder {player} dans le texte d'une mission
 * en fonction du type de playerPlaceholder défini.
 *
 * @param mission - La mission avec potentiellement un playerPlaceholder
 * @param currentPlayer - Le joueur qui reçoit la mission
 * @param allPlayers - Tous les joueurs de la room
 * @returns Le texte résolu avec le nom du joueur, ou null si pas de placeholder
 */
export function resolvePlayerPlaceholder(
    mission: Mission,
    currentPlayer: Player,
    allPlayers: Player[]
): string | null {
    if (!mission.playerPlaceholder || !mission.text.includes('{player}')) {
        return null;
    }

    console.log(`[resolvePlayerPlaceholder] Resolving placeholder=${mission.playerPlaceholder} for ${currentPlayer.name}`);

    const teammates = allPlayers.filter(
        p => p.team === currentPlayer.team && p.id !== currentPlayer.id
    );
    const opponents = allPlayers.filter(
        p => p.team !== currentPlayer.team && p.team !== '' && p.team !== 'spectator'
    );
    const allOthers = allPlayers.filter(
        p => p.id !== currentPlayer.id && p.team !== '' && p.team !== 'spectator'
    );

    let targetPlayer: Player | null = null;

    switch (mission.playerPlaceholder) {
        case 'teammate':
            if (teammates.length > 0) {
                targetPlayer = teammates[Math.floor(Math.random() * teammates.length)];
            }
            break;

        case 'opponent':
            if (opponents.length > 0) {
                targetPlayer = opponents[Math.floor(Math.random() * opponents.length)];
            }
            break;

        case 'any':
            if (allOthers.length > 0) {
                targetPlayer = allOthers[Math.floor(Math.random() * allOthers.length)];
            }
            break;

        case 'duel':
            // Les missions duel sont normalement traitées par processDuelMissions
            // Ce fallback gère les cas edge où le duel n'a pas pu être créé
            if (opponents.length > 0) {
                targetPlayer = opponents[Math.floor(Math.random() * opponents.length)];
            }
            break;
    }

    if (!targetPlayer) {
        // Si aucun joueur valide trouvé, retourner le texte avec fallback
        console.log(`[resolvePlayerPlaceholder] No target found for ${currentPlayer.name}, using fallback`);
        return mission.text.replace('{player}', 'un joueur');
    }

    console.log(`[resolvePlayerPlaceholder] ${currentPlayer.name} -> resolved to ${targetPlayer.name}`);
    return mission.text.replace('{player}', targetPlayer.name);
}
