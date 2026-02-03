/**
 * Filtre les missions secrètes des autres joueurs pendant la partie.
 *
 * Pendant la validation ou après la fin de partie, toutes les missions sont visibles.
 * Pendant la partie, le texte des missions secrètes des autres joueurs est masqué.
 *
 * @param room - La room à filtrer
 * @param currentPlayerToken - Le token du joueur actuel (null si inconnu)
 * @returns La room avec les missions filtrées
 */
export function filterPrivateMissions(room: any, currentPlayerToken: string | null): any {
    if (!room) return room;

    // Pendant la validation ou après la fin, on montre tout
    if (room.gameStopped || room.validationStatus !== 'not_started') {
        return room;
    }

    // Pendant la partie, on masque le texte des missions secrètes des autres joueurs
    const filteredPlayers = room.players.map((player: any) => {
        const isCurrentPlayer = currentPlayerToken && player.token === currentPlayerToken;

        const filteredMissions = player.missions?.map((pm: any) => {
            // Si c'est le joueur actuel, on montre tout
            if (isCurrentPlayer) {
                return pm;
            }

            // Si la mission n'est pas privée, on montre tout
            if (!pm.mission?.isPrivate) {
                return pm;
            }

            // Mission privée d'un autre joueur : on masque le texte
            return {
                ...pm,
                mission: {
                    ...pm.mission,
                    text: null, // Masquer le texte
                },
            };
        }) || [];

        return {
            ...player,
            missions: filteredMissions,
        };
    });

    return {
        ...room,
        players: filteredPlayers,
    };
}
