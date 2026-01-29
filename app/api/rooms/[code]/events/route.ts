import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

// Garde les connexions SSE actives
const connections = new Map<string, Set<ReadableStreamDefaultController>>();

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params;

    // Vérifie que la room existe
    const room = await prisma.room.findUnique({
        where: { code },
    });

    if (!room) {
        return Response.json(
            { error: 'Room not found' },
            { status: 404 }
        );
    }

    // Crée un stream SSE qui reste ouvert
    const stream = new ReadableStream({
        start(controller) {
            // Ajoute cette connexion à la liste
            if (!connections.has(code)) {
                connections.set(code, new Set());
            }
            connections.get(code)!.add(controller);

            // Envoie un message de connexion initial
            const data = `data: ${JSON.stringify({ type: 'connected' })}\n\n`;
            controller.enqueue(new TextEncoder().encode(data));

            // Envoie un heartbeat toutes les 30 secondes pour garder la connexion vivante
            const heartbeatInterval = setInterval(() => {
                try {
                    const heartbeat = `: heartbeat\n\n`;
                    controller.enqueue(new TextEncoder().encode(heartbeat));
                } catch (error) {
                    clearInterval(heartbeatInterval);
                }
            }, 30000);

            // Nettoie quand la connexion se ferme
            const cleanup = () => {
                clearInterval(heartbeatInterval);
                connections.get(code)?.delete(controller);
                if (connections.get(code)?.size === 0) {
                    connections.delete(code);
                }
                try {
                    controller.close();
                } catch (e) {
                    // Already closed
                }
            };

            request.signal.addEventListener('abort', cleanup);

            // Nettoie aussi en cas d'erreur
            controller.error = () => {
                cleanup();
            };
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no', // Pour Nginx
        },
    });
}

// Fonction utilitaire pour broadcaster un event à tous les clients d'une room
export function broadcastToRoom(roomCode: string, event: any) {
    const roomConnections = connections.get(roomCode);
    if (!roomConnections) return;

    const data = `data: ${JSON.stringify(event)}\n\n`;
    const encoded = new TextEncoder().encode(data);

    const deadConnections: ReadableStreamDefaultController[] = [];

    roomConnections.forEach((controller) => {
        try {
            controller.enqueue(encoded);
        } catch (error) {
            // Connexion fermée, on la marque pour suppression
            deadConnections.push(controller);
        }
    });

    // Nettoie les connexions mortes
    deadConnections.forEach((controller) => {
        roomConnections.delete(controller);
    });

    if (roomConnections.size === 0) {
        connections.delete(roomCode);
    }
}