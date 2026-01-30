'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Room } from '@/app/types/room';

interface Player {
    id: string;
    name: string;
    token?: string;
    avatar?: string;
    missions?: any[];
}

export function useRoom(roomCode: string | null) {
    const [room, setRoom] = useState<Room | null>(null);
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
                    // 🔥 Room supprimée - comportement différent selon créateur ou non
                    if (!isInitialLoad && room) {
                        console.log('[useRoom] Room deleted');

                        // Vérifie si c'est le créateur
                        const creatorToken = typeof window !== 'undefined'
                            ? localStorage.getItem(`room_${roomCode}_creator`)
                            : null;

                        if (creatorToken) {
                            // ✅ Créateur : redirection directe, pas de message
                            console.log('[useRoom] Creator - immediate redirect');
                            // Nettoie le localStorage
                            localStorage.removeItem(`room_${roomCode}_creator`);
                            localStorage.removeItem(`room_${roomCode}_player`);
                            window.location.href = '/';
                            return;
                        } else {
                            // ✅ Autre joueur : affiche notification puis redirige
                            console.log('[useRoom] Regular player - show notification');
                            setNotification({
                                message: 'La room a été fermée par le créateur',
                                type: 'warning',
                            });
                            // Nettoie le localStorage
                            localStorage.removeItem(`room_${roomCode}_player`);
                            setTimeout(() => {
                                window.location.href = '/';
                            }, 2000);
                        }
                    }
                    throw new Error('Room not found');
                }
                throw new Error('Failed to load room');
            }

            const data = await response.json();
            const newRoom = data.room;

            // Détecte si un joueur a quitté (seulement après le chargement initial)
            if (!isInitialLoad && room && newRoom.players.length < previousPlayerCountRef.current) {
                const previousPlayers = room.players.map((p: Player) => p.id);
                const currentPlayers = newRoom.players.map((p: Player) => p.id);
                const leftPlayerId = previousPlayers.find((id: string) => !currentPlayers.includes(id));

                if (leftPlayerId) {
                    const leftPlayer = room.players.find((p: any) => p.id === leftPlayerId);
                    const wasCreator = room.players[0]?.id === leftPlayerId;

                    if (wasCreator && leftPlayer) {
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
        }, 2000);

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