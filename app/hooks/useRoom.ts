'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSSE } from './useSSE';
import type { Room } from '@/app/types/room';

export function useRoom(roomCode: string | null) {
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'info' | 'warning' } | null>(null);
    const fetchingRef = useRef(false);

    // Charge la room
    const fetchRoom = useCallback(async () => {
        if (!roomCode || fetchingRef.current) return;

        try {
            fetchingRef.current = true;
            setLoading(true);
            const response = await fetch(`/api/rooms/${roomCode}`);

            if (!response.ok) {
                throw new Error('Room not found');
            }

            const data = await response.json();
            setRoom(data.room);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load room');
            setRoom(null);
        } finally {
            setLoading(false);
            fetchingRef.current = false;
        }
    }, [roomCode]);

    // Charge au montage UNE SEULE FOIS
    useEffect(() => {
        fetchRoom();
    }, [roomCode]); // NE MET PAS fetchRoom ici !

    // SSE pour les updates temps réel
    const handleSSEMessage = useCallback((event: any) => {
        console.log('[useRoom] SSE event received:', event);

        if (event.type === 'room-closed') {
            console.log('[useRoom] Room closed! Redirecting...');
            // Affiche une notification au lieu d'un alert
            setNotification({
                message: event.message || 'La room a été fermée par le créateur',
                type: 'warning',
            });

            // Redirige après 3 secondes
            setTimeout(() => {
                console.log('[useRoom] Redirecting to home...');
                window.location.href = '/';
            }, 3000);
            return;
        }

        if (event.type === 'player-left' && event.wasCreator) {
            console.log('[useRoom] Creator left');
            setNotification({
                message: `${event.playerName} (créateur) a quitté la partie`,
                type: 'info',
            });
        }

        if (
            event.type === 'player-joined' ||
            event.type === 'player-left' ||
            event.type === 'game-started' ||
            event.type === 'mid-missions-assigned' ||
            event.type === 'late-missions-assigned'
        ) {
            fetchRoom();
        }
    }, [fetchRoom]);

    useSSE(
        roomCode ? `/api/rooms/${roomCode}/events` : null,
        {
            onMessage: handleSSEMessage,
            enabled: !!roomCode,
        }
    );

    return {
        room,
        loading,
        error,
        notification,
        refetch: fetchRoom,
    };
}
