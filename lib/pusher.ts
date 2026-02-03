import Pusher from 'pusher';

const globalForPusher = globalThis as unknown as {
    pusher: Pusher | undefined;
};

export const pusher: Pusher =
    globalForPusher.pusher ??
    new Pusher({
        appId: process.env.PUSHER_APP_ID!,
        key: process.env.PUSHER_APP_KEY!,
        secret: process.env.PUSHER_APP_SECRET!,
        cluster: process.env.PUSHER_APP_CLUSTER!,
        useTLS: true,
    });

if (process.env.NODE_ENV !== 'production') globalForPusher.pusher = pusher;

/**
 * Pushes a "room-updated" event to all clients connected to the room's channel.
 * The client then does a single fetch to get the latest room state.
 */
export async function pushRoomUpdate(roomCode: string): Promise<void> {
    try {
        await pusher.trigger(`room-${roomCode}`, 'room-updated', {
            timestamp: Date.now(),
        });
    } catch (error) {
        // On ne bloque pas la requête si le push échoue
        console.error(`[Pusher] Failed to push room-updated for room ${roomCode}:`, error);
    }
}

/**
 * Pushes an "interest-updated" event with the interest data directly.
 * This avoids the need for a full room refetch for interest changes.
 */
export async function pushInterestUpdate(
    roomCode: string,
    cardId: string,
    playerName: string,
    added: boolean
): Promise<void> {
    try {
        await pusher.trigger(`room-${roomCode}`, 'interest-updated', {
            cardId,
            playerName,
            added,
            timestamp: Date.now(),
        });
    } catch (error) {
        console.error(`[Pusher] Failed to push interest-updated for room ${roomCode}:`, error);
    }
}

/**
 * Pushes a "sound-event" to all clients so everyone hears the game sounds.
 */
export async function pushSoundEvent(
    roomCode: string,
    soundType: 'correct' | 'wrong_team' | 'neutral' | 'assassin' | 'victory' | 'turn_change'
): Promise<void> {
    try {
        await pusher.trigger(`room-${roomCode}`, 'sound-event', {
            soundType,
            timestamp: Date.now(),
        });
    } catch (error) {
        console.error(`[Pusher] Failed to push sound-event for room ${roomCode}:`, error);
    }
}