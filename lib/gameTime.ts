/**
 * Calcule le temps de jeu effectif en tenant compte des pauses d'événements.
 *
 * @param gameStartTime - Timestamp de début de partie
 * @param totalPausedDuration - Durée totale déjà cumulée en pause (secondes)
 * @param eventPausedAt - Timestamp du début de la pause en cours (null si pas en pause)
 * @param now - Timestamp actuel (Date.now())
 * @returns Temps de jeu effectif en secondes
 */
export function computeEffectiveElapsed(
    gameStartTime: Date | string,
    totalPausedDuration: number,
    eventPausedAt: Date | string | null,
    now: number = Date.now()
): number {
    const startMs = new Date(gameStartTime).getTime();
    const wallElapsed = (now - startMs) / 1000;

    // Durée de la pause en cours (si applicable)
    let currentPauseDuration = 0;
    if (eventPausedAt) {
        currentPauseDuration = (now - new Date(eventPausedAt).getTime()) / 1000;
    }

    return Math.max(0, wallElapsed - totalPausedDuration - currentPauseDuration);
}
