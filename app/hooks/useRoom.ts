'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';
import type { Room } from '@/app/types/room';

interface Player {
    id: string;
    name: string;
    token?: string;
    avatar?: string;
    missions?: any[];
}

// Singleton Pusher client — une seule connexion pour toute la vie de l'onglet
let pusherInstance: Pusher | null = null;

function getPusherClient(): Pusher {
    if (!pusherInstance) {
        pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
            cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
            forceTLS: true,
        });
    }
    return pusherInstance;
}

export function useRoom(roomCode: string | null) {
    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'info' | 'warning' } | null>(null);

    const previousPlayerCountRef = useRef<number>(0);
    const roomRef = useRef<Room | null>(null);
    const loadingRef = useRef(true);
    const lastFetchTimeRef = useRef<number>(0);

    // Garde roomRef et loadingRef en sync pour les closures
    useEffect(() => {
        roomRef.current = room;
    }, [room]);
    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    const fetchRoom = useCallback(async (source: string = 'unknown') => {
        if (!roomCode) return;

        // Anti-spam: pas plus d'un fetch toutes les 500ms
        const now = Date.now();
        if (now - lastFetchTimeRef.current < 500) {
            console.log(`[useRoom] Fetch skipped (too soon), source: ${source}`);
            return;
        }
        lastFetchTimeRef.current = now;

        try {
            const isInitialLoad = loadingRef.current;
            console.log(`[useRoom] Fetching room: ${roomCode}, source: ${source}`);

            const response = await fetch(`/api/rooms/${roomCode}?t=${now}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    if (!isInitialLoad && roomRef.current) {
                        console.log('[useRoom] Room deleted');

                        const creatorToken = typeof window !== 'undefined'
                            ? localStorage.getItem(`room_${roomCode}_creator`)
                            : null;

                        if (creatorToken) {
                            localStorage.removeItem(`room_${roomCode}_creator`);
                            localStorage.removeItem(`room_${roomCode}_player`);
                            window.location.href = '/';
                            return;
                        } else {
                            setNotification({
                                message: 'La room a été fermée par le créateur',
                                type: 'warning',
                            });
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

            // Log détaillé des missions
            const missionCounts = newRoom.players.map((p: Player) => ({
                name: p.name,
                missions: p.missions?.map((m: any) => m.type) || []
            }));
            console.log(`[useRoom] Room fetched, missions:`, JSON.stringify(missionCounts));

            // Détecte si un joueur a quitté
            if (!isInitialLoad && roomRef.current && newRoom.players.length < previousPlayerCountRef.current) {
                const previousPlayers = roomRef.current.players.map((p: Player) => p.id);
                const currentPlayers = newRoom.players.map((p: Player) => p.id);
                const leftPlayerId = previousPlayers.find((id: string) => !currentPlayers.includes(id));

                if (leftPlayerId) {
                    const leftPlayer = roomRef.current.players.find((p: any) => p.id === leftPlayerId);
                    const wasCreator = roomRef.current.players[0]?.id === leftPlayerId;

                    if (wasCreator && leftPlayer) {
                        setNotification({
                            message: `${leftPlayer.name} (créateur) a quitté la partie`,
                            type: 'info',
                        });
                    }
                }
            }

            previousPlayerCountRef.current = newRoom.players.length;

            setRoom(newRoom);
            setError(null);
            setLoading(false);
        } catch (err) {
            console.error('[useRoom] Fetch error:', err);
            setError(err instanceof Error ? err.message : 'Failed to load room');
            setRoom(null);
            setLoading(false);
        }
    }, [roomCode]);

    // Chargement initial
    useEffect(() => {
        fetchRoom('initial');
    }, [roomCode]);

    // Subscription Pusher + polling fallback
    useEffect(() => {
        if (!roomCode || error) return;

        const pusher = getPusherClient();
        const channelName = `room-${roomCode}`;

        console.log(`[useRoom] Subscribing to Pusher channel: ${channelName}`);
        const channel = pusher.subscribe(channelName);

        channel.bind('room-updated', () => {
            console.log(`[useRoom] Pusher event received on ${channelName}`);
            fetchRoom('pusher');
        });

        // Polling fallback - only for ARAM during active game
        // Codename uses direct Pusher events for interest updates, no polling needed
        const pollingInterval = setInterval(() => {
            const currentRoom = roomRef.current;
            if (!currentRoom) return;

            // ARAM: polling during active game only
            const isActiveAramGame = currentRoom.gameType === 'aram-missions' &&
                                     currentRoom.gameStarted &&
                                     !currentRoom.gameStopped;

            if (isActiveAramGame) {
                console.log('[useRoom] Polling fallback (ARAM)');
                fetchRoom('polling');
            }
        }, 3000);

        return () => {
            console.log(`[useRoom] Unsubscribing from Pusher channel: ${channelName}`);
            pusher.unsubscribe(channelName);
            clearInterval(pollingInterval);
        };
    }, [roomCode, error, fetchRoom]);

    return {
        room,
        loading,
        error,
        notification,
        refetch: () => fetchRoom('manual'),
    };
}
