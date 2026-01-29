import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

const connections = new Map<string, Set<ReadableStreamDefaultController>>();

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ code: string }> }
) {
    const { code } = await params;

    console.log(`[SSE] New connection attempt for room ${code}`);

    const room = await prisma.room.findUnique({
        where: { code },
    });

    if (!room) {
        console.log(`[SSE] Room ${code} not found`);
        return Response.json(
            { error: 'Room not found' },
            { status: 404 }
        );
    }

    console.log(`[SSE] Room ${code} found, creating stream`);

    let intervalId: NodeJS.Timeout | undefined;
    let currentController: ReadableStreamDefaultController | undefined;
    let connectionClosed = false;

    const stream = new ReadableStream({
        start(controller) {
            console.log(`[SSE] Stream started for room ${code}`);
            currentController = controller;

            if (!connections.has(code)) {
                connections.set(code, new Set());
            }
            connections.get(code)!.add(controller);
            console.log(`[SSE] Active connections for room ${code}: ${connections.get(code)!.size}`);

            try {
                const data = `data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`;
                controller.enqueue(new TextEncoder().encode(data));
                console.log(`[SSE] Initial message sent for room ${code}`);
            } catch (e) {
                console.error(`[SSE] Error sending initial message for room ${code}:`, e);
            }

            intervalId = setInterval(() => {
                if (connectionClosed) {
                    console.log(`[SSE] Connection already closed for room ${code}, clearing interval`);
                    if (intervalId) clearInterval(intervalId);
                    return;
                }

                try {
                    const heartbeat = `: heartbeat ${Date.now()}\n\n`;
                    controller.enqueue(new TextEncoder().encode(heartbeat));
                    console.log(`[SSE] Heartbeat sent for room ${code}`);
                } catch (error) {
                    console.error(`[SSE] Heartbeat error for room ${code}:`, error);
                    connectionClosed = true;
                    if (intervalId) clearInterval(intervalId);
                }
            }, 15000);

            console.log(`[SSE] Heartbeat interval set for room ${code}`);
        },

        cancel() {
            console.log(`[SSE] Stream cancelled for room ${code}`);
            connectionClosed = true;

            if (intervalId) {
                clearInterval(intervalId);
                console.log(`[SSE] Interval cleared for room ${code}`);
            }

            if (currentController) {
                connections.get(code)?.delete(currentController);
                const remaining = connections.get(code)?.size || 0;
                console.log(`[SSE] Controller removed. Remaining connections for room ${code}: ${remaining}`);

                if (remaining === 0) {
                    connections.delete(code);
                    console.log(`[SSE] No more connections, map entry deleted for room ${code}`);
                }
            }
        }
    });

    console.log(`[SSE] Returning stream response for room ${code}`);

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}

export function broadcastToRoom(roomCode: string, event: any) {
    const roomConnections = connections.get(roomCode);

    console.log(`[Broadcast] Room ${roomCode}: ${roomConnections?.size || 0} connection(s)`);

    if (!roomConnections || roomConnections.size === 0) {
        console.log(`[Broadcast] No connections for room ${roomCode}`);
        return;
    }

    console.log(`[Broadcast] Broadcasting to ${roomConnections.size} connection(s) in room ${roomCode}:`, event.type);

    const data = `data: ${JSON.stringify(event)}\n\n`;
    const encoded = new TextEncoder().encode(data);

    const deadConnections: ReadableStreamDefaultController[] = [];

    roomConnections.forEach((controller, index) => {
        try {
            controller.enqueue(encoded);
            // @ts-ignore
            console.log(`[Broadcast] Message sent to connection #${index + 1}`);
        } catch (error) {
            // @ts-ignore
            console.error(`[Broadcast] Error sending to connection #${index + 1}:`, error);
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