'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSSE } from './useSSE';
import type { Room } from '@/app/types/room';

interface Player {
    id: string;
    name: string;
    token: string;
    missions: {
        mission: {
            id: string;
            text: string;
            type: string;
            category: string;
            difficulty: string;
        };
        type: string;
    }[];
}

export function useRoom(roomCode: string | null) {
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Charge la room
    const fetchRoom = useCallback(async () => {
        if (!roomCode) return;

        try {
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
        }
    }, [roomCode]);

    // Charge au montage
    useEffect(() => {
        fetchRoom();
    }, [fetchRoom]);

    // SSE pour les updates temps réel
    useSSE(
        roomCode ? `/api/rooms/${roomCode}/events` : null,
        {
            onMessage: (event) => {
                console.log('SSE event:', event);

                if (event.type === 'player-joined' || event.type === 'game-started' || event.type === 'mid-missions-assigned') {
                    // Recharge la room
                    fetchRoom();
                }
            },
            enabled: !!roomCode,
        }
    );

    return {
        room,
        loading,
        error,
        refetch: fetchRoom,
    };
}