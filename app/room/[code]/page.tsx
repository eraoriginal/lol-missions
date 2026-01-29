'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRoom } from '@/app/hooks/useRoom';
import { RoomLobby } from '@/app/components/RoomLobby';
import { GameView } from '@/app/components/GameView';
import { Toast } from '@/app/components/Toast';

export default function RoomPage({
                                     params
                                 }: {
    params: Promise<{ code: string }>
}) {
    const { code } = use(params);
    const router = useRouter();
    const { room, loading, error, notification } = useRoom(code);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [playerName, setPlayerName] = useState('');
    const [joining, setJoining] = useState(false);
    const [joinError, setJoinError] = useState<string | null>(null);
    const [roomDeletedToast, setRoomDeletedToast] = useState(false);

    // Vérifie si l'utilisateur a déjà un token pour cette room
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const playerToken = localStorage.getItem(`room_${code}_player`);

        // Si pas de token, affiche la modal de join
        if (!playerToken) {
            setShowJoinModal(true);
        }
    }, [code]);

    // Si la room est supprimée, affiche un toast et redirige
    useEffect(() => {
        if (error && error.includes('not found')) {
            setRoomDeletedToast(true);

            // Redirige après 3 secondes
            setTimeout(() => {
                router.push('/');
            }, 3000);
        }
    }, [error, router]);

    const handleJoinRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        setJoining(true);
        setJoinError(null);

        try {
            const response = await fetch(`/api/rooms/${code}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to join room');
            }

            const data = await response.json();

            // Stocke le token du joueur
            localStorage.setItem(`room_${code}_player`, data.player.token);

            // Ferme la modal
            setShowJoinModal(false);
        } catch (err) {
            setJoinError(err instanceof Error ? err.message : 'An error occurred');
            setJoining(false);
        }
    };

    // Modal de join
    if (showJoinModal) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Rejoindre la room
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Code de la room : <span className="font-mono font-bold">{code}</span>
                    </p>

                    <form onSubmit={handleJoinRoom} className="space-y-4">
                        <div>
                            <label htmlFor="player-name" className="block text-sm font-medium text-gray-700 mb-2">
                                Ton pseudo
                            </label>
                            <input
                                id="player-name"
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                required
                                maxLength={50}
                                autoFocus
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 bg-white"
                                placeholder="Entre ton pseudo"
                            />
                        </div>

                        {joinError && (
                            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                                {joinError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={joining || !playerName.trim()}
                            className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {joining ? 'Connexion...' : 'Rejoindre la partie'}
                        </button>
                    </form>

                    <a href="/" className="block text-center mt-4 text-sm text-gray-500 hover:text-gray-700">
                        ← Retour à l'accueil
                    </a>
                </div>
            </main>
        );
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-white text-2xl">Chargement...</div>
            </main>
        );
    }

    if (error || !room) {
        return (
            <>
                {roomDeletedToast && (
                    <Toast
                        message="Cette room n'existe plus ou a été supprimée"
                        type="error"
                        onClose={() => setRoomDeletedToast(false)}
                        duration={3000}
                    />
                )}
                <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
                        <p className="text-gray-700 mb-6">{error || 'Room not found'}</p>

                        <a href="/" className="block text-center py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                            Retour à l'accueil
                        </a>
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            {notification && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => {}}
                    duration={3000}
                />
            )}

            <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
                <div className="max-w-6xl mx-auto py-8">
                    {room.gameStarted ? (
                        <GameView room={room} roomCode={code} />
                    ) : (
                        <RoomLobby room={room} roomCode={code} />
                    )}
                </div>
            </main>
        </>
    );
}