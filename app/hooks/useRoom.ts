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
    const fetchingRef = useRef(false);
    const previousPlayerCountRef = useRef<number>(0);
    const roomRef = useRef<Room | null>(null);
    const loadingRef = useRef(true);

    // Garde roomRef et loadingRef en sync pour les closures du callback Pusher
    useEffect(() => {
        roomRef.current = room;
    }, [room]);
    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    const fetchRoom = useCallback(async () => {
        if (!roomCode || fetchingRef.current) return;

        try {
            fetchingRef.current = true;
            const isInitialLoad = loadingRef.current;

            const response = await fetch(`/api/rooms/${roomCode}`, {
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                },
            });

            if (!response.ok) {
                if (response.status === 404) {
                    // Room supprimée
                    if (!isInitialLoad && roomRef.current) {
                        console.log('[useRoom] Room deleted');

                        const creatorToken = typeof window !== 'undefined'
                            ? localStorage.getItem(`room_${roomCode}_creator`)
                            : null;

                        if (creatorToken) {
                            console.log('[useRoom] Creator - immediate redirect');
                            localStorage.removeItem(`room_${roomCode}_creator`);
                            localStorage.removeItem(`room_${roomCode}_player`);
                            window.location.href = '/';
                            return;
                        } else {
                            console.log('[useRoom] Regular player - show notification');
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

            // Détecte si la partie vient de commencer
            if (!isInitialLoad && roomRef.current && !roomRef.current.gameStarted && newRoom.gameStarted) {
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
    }, [roomCode]);

    // Chargement initial
    useEffect(() => {
        fetchRoom();
    }, [roomCode]);

    // Subscription Pusher — remplace le polling
    useEffect(() => {
        if (!roomCode || error) return;

        const pusher = getPusherClient();
        const channelName = `room-${roomCode}`;

        console.log(`[useRoom] Subscribing to Pusher channel: ${channelName}`);
        const channel = pusher.subscribe(channelName);

        channel.bind('room-updated', () => {
            console.log(`[useRoom] Pusher event received on ${channelName} — fetching room`);
            fetchRoom();
        });

        return () => {
            console.log(`[useRoom] Unsubscribing from Pusher channel: ${channelName}`);
            pusher.unsubscribe(channelName);
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
