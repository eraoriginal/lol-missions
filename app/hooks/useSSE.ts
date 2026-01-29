'use client';

import { useEffect, useState, useRef } from 'react';

interface SSEOptions {
    onMessage?: (event: any) => void;
    onError?: (error: Event) => void;
    enabled?: boolean;
}

// Map globale pour éviter les connexions multiples
const activeConnections = new Map<string, EventSource>();

export function useSSE(url: string | null, options: SSEOptions = {}) {
    const { onMessage, enabled = true } = options;
    const [isConnected, setIsConnected] = useState(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        if (!url || !enabled) {
            return;
        }

        // Si une connexion existe déjà pour cette URL, ne crée pas de doublon
        if (activeConnections.has(url)) {
            console.log('SSE: Connection already exists for', url);
            setIsConnected(true);
            return;
        }

        mountedRef.current = true;
        console.log('SSE: Connecting to', url);

        const eventSource = new EventSource(url);
        activeConnections.set(url, eventSource);

        const handleOpen = () => {
            if (!mountedRef.current) return;
            console.log('SSE: Connected');
            setIsConnected(true);
        };

        const handleMessage = (event: Event) => {
            if (!mountedRef.current) return;

            const messageEvent = event as MessageEvent;
            try {
                const data = JSON.parse(messageEvent.data);
                if (onMessage) {
                    onMessage(data);
                }
            } catch (error) {
                // Ignore heartbeat messages (not JSON)
                if (!messageEvent.data.startsWith(':')) {
                    console.error('SSE: Error parsing message:', error);
                }
            }
        };

        const handleError = () => {
            console.error('SSE: Connection error');
            setIsConnected(false);

            // Ferme et nettoie
            eventSource.close();
            activeConnections.delete(url);

            // Reconnecte après 5 secondes si toujours monté
            if (mountedRef.current) {
                setTimeout(() => {
                    if (mountedRef.current && !activeConnections.has(url)) {
                        console.log('SSE: Reconnecting...');
                        // Force un re-render pour relancer le useEffect
                        setIsConnected(false);
                    }
                }, 5000);
            }
        };

        eventSource.addEventListener('open', handleOpen);
        eventSource.addEventListener('message', handleMessage);
        eventSource.addEventListener('error', handleError);

        eventSource.addEventListener('message', (event: MessageEvent) => {
            console.log('[useSSE] Raw message received:', event.data);

            try {
                const data = JSON.parse(event.data);
                console.log('[useSSE] Parsed data:', data);

                if (onMessage) {
                    onMessage(data);
                }
            } catch (error) {
                // Ignore heartbeats (not JSON)
                if (!event.data.startsWith(':')) {
                    console.error('[useSSE] Error parsing message:', error);
                }
            }
        });

        return () => {
            console.log('SSE: Cleanup for', url);
            mountedRef.current = false;

            eventSource.removeEventListener('open', handleOpen);
            eventSource.removeEventListener('message', handleMessage);
            eventSource.removeEventListener('error', handleError);

            eventSource.close();
            activeConnections.delete(url);
            setIsConnected(false);
        };
    }, [url, enabled, onMessage]);

    return { isConnected };
}