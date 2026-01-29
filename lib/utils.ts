import { customAlphabet } from 'nanoid';

// Génère un code room de 6 caractères (lettres majuscules + chiffres)
const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);

export function generateRoomCode(): string {
    return nanoid();
}

// Génère un token unique pour un joueur
export function generatePlayerToken(): string {
    return customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 32)();
}

// Vérifie si un token est valide (créateur de room)
export function isCreator(room: { creatorToken: string }, token: string): boolean {
    return room.creatorToken === token;
}

// Calcule le temps écoulé depuis le début de la game (en ms)
export function getGameElapsedTime(gameStartTime: Date | null): number {
    if (!gameStartTime) return 0;
    return Date.now() - gameStartTime.getTime();
}

// Vérifie si il est temps d'assigner les missions MID (après 5 minutes)
export function shouldAssignMidMissions(gameStartTime: Date | null): boolean {
    const elapsed = getGameElapsedTime(gameStartTime);
    const fiveMinutes = 5 * 60 * 1000;
    return elapsed >= fiveMinutes;
}