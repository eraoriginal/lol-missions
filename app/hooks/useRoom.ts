'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Room } from '@/app/types/room';

interface Player {
    id: string;
    name: string;
    token: string;
    isCreator: boolean;
    missions: any[];
}

interface RoomWithPlayers extends Room {
    players: Player[];
}

export function useRoom(roomCode: string | null) {
    const [room, setRoom] = useState<RoomWithPlayers | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'info' | 'warning' } | null>(null);
    const fetchingRef = useRef(false);
    const previousPlayerCountRef = useRef<number>(0);

    // Charge la room
    const fetchRoom = useCallback(async () => {
        if (!roomCode || fetchingRef.current) return;

        try {
            fetchingRef.current = true;
            const isInitialLoad = loading;

            const response = await fetch(`/api/rooms/${roomCode}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // Room supprimée = redirection immédiate
                    if (!isInitialLoad && room) {
                        console.log('[useRoom] Room deleted, redirecting...');
                        setNotification({
                            message: 'La room a été fermée',
                            type: 'warning',
                        });
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 2000);
                    }
                    throw new Error('Room not found');
                }
                throw new Error('Failed to load room');
            }

            const data = await response.json();
            const newRoom = data.room;

            // Détecte si un joueur a quitté (seulement après le chargement initial)
            if (!isInitialLoad && room && newRoom.players.length < previousPlayerCountRef.current) {
                const previousPlayers = room.players.map(p => p.id);
                const currentPlayers = newRoom.players.map(p => p.id);
                const leftPlayerId = previousPlayers.find(id => !currentPlayers.includes(id));

                if (leftPlayerId) {
                    const leftPlayer = room.players.find(p => p.id === leftPlayerId);
                    if (leftPlayer?.isCreator) {
                        setNotification({
                            message: `${leftPlayer.name} (créateur) a quitté la partie`,
                            type: 'info',
                        });
                    }
                }
            }

            // Détecte si la partie vient de commencer
            if (!isInitialLoad && room && !room.gameStarted && newRoom.gameStarted) {
                console.log('[useRoom] Game started!');
            }

            previousPlayerCountRef.current = newRoom.players.length;

            setRoom(newRoom);
            setError(null);
            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load room');
            setRoom(null);
            setLoading(false);
        } finally {
            fetchingRef.current = false;
        }
    }, [roomCode, loading, room]);

    // Charge au montage
    useEffect(() => {
        fetchRoom();
    }, [roomCode]);

    // 🔥 POLLING : Rafraîchit toutes les 2 secondes
    useEffect(() => {
        if (!roomCode || error) return;

        console.log('[useRoom] Starting polling every 2 seconds...');

        const interval = setInterval(() => {
            fetchRoom();
        }, 2000); // Polling toutes les 2 secondes

        return () => {
            console.log('[useRoom] Stopping polling');
            clearInterval(interval);
        };
    }, [roomCode, error, fetchRoom]);

    return {
        room,
        loading,
        error,
        notification,
        refetch: fetchRoom,
    };
}