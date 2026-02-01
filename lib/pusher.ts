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
        encrypted: true,
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