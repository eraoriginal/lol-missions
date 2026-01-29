'use client';

import { useEffect, useState } from 'react';

interface SSEOptions {
    onMessage?: (event: any) => void;
    onError?: (error: Event) => void;
    enabled?: boolean;
}

export function useSSE(url: string | null, options: SSEOptions = {}) {
    const { onMessage, enabled = true } = options;
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!url || !enabled) {
            return;
        }

        console.log('SSE: Connecting to', url);
        const eventSource = new EventSource(url);

        const handleOpen = () => {
            console.log('SSE: Connected');
            setIsConnected(true);
        };

        const handleMessage = (event: Event) => {
            const messageEvent = event as MessageEvent;
            try {
                const data = JSON.parse(messageEvent.data);
                if (onMessage) {
                    onMessage(data);
                }
            } catch (error) {
                console.error('SSE: Error parsing message:', error);
            }
        };

        const handleError = () => {
            console.error('SSE: Connection error');
            setIsConnected(false);
            eventSource.close();
        };

        eventSource.addEventListener('open', handleOpen);
        eventSource.addEventListener('message', handleMessage);
        eventSource.addEventListener('error', handleError);

        return () => {
            eventSource.removeEventListener('open', handleOpen);
            eventSource.removeEventListener('message', handleMessage);
            eventSource.removeEventListener('error', handleError);
            eventSource.close();
            setIsConnected(false);
        };
    }, [url, enabled, onMessage]);

    return { isConnected };
}