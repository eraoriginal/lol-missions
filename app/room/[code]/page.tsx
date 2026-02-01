'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRoom } from '@/app/hooks/useRoom';
import { RoomLobby } from '@/app/components/RoomLobby';
import { GameView as AramMissionsGameView } from '@/app/games/aram-missions/components/GameView';
import { GameView as CodenameGameView } from '@/app/games/codename/components/GameView';
import { Toast } from '@/app/components/Toast';
import { ComingSoonGame } from "@/app/components/ComingSoonGame";

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

    // Modal de join - Style LoL
    if (showJoinModal) {
        return (
            <main className="lol-bg flex items-center justify-center p-4">
                <div className="lol-card rounded-lg p-8 max-w-md w-full">
                    <h1 className="text-2xl font-bold lol-title-gold mb-2 text-center">
                        Rejoindre la room
                    </h1>
                    <p className="lol-text text-center mb-6">
                        Code : <span className="font-mono font-bold lol-text-gold">{code}</span>
                    </p>

                    <form onSubmit={handleJoinRoom} className="space-y-4">
                        <div>
                            <label htmlFor="player-name" className="block text-sm font-medium lol-text-gold mb-2">
                                Ton pseudo d'invocateur
                            </label>
                            <input
                                id="player-name"
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                required
                                maxLength={50}
                                autoFocus
                                className="lol-input w-full px-4 py-3 rounded-lg"
                                placeholder="Entre ton pseudo"
                            />
                        </div>

                        {joinError && (
                            <div className="p-3 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-sm">
                                {joinError}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={joining || !playerName.trim()}
                            className="lol-button-hextech w-full py-3 rounded-lg transition-all"
                        >
                            {joining ? 'Connexion...' : 'Rejoindre la partie'}
                        </button>
                    </form>

                    <a href="/" className="block text-center mt-4 text-sm lol-text hover:text-[#C8AA6E] transition-colors">
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
                <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
                    <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-10 max-w-md w-full border border-white/20">
                        {/* Icône d'erreur animée */}
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                {/* Cercle animé autour */}
                                <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping opacity-20"></div>
                            </div>
                        </div>

                        {/* Titre */}
                        <h1 className="text-3xl font-bold text-gray-800 mb-3 text-center">
                            Room introuvable
                        </h1>

                        {/* Message d'erreur */}
                        <p className="text-gray-600 text-center mb-8 leading-relaxed">
                            {error === 'Room not found'
                                ? "Cette room n'existe pas ou a été supprimée par le créateur."
                                : error
                            }
                        </p>

                        {/* Bouton retour amélioré */}
                        <a
                            href="/"
                            className="group relative block text-center py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105"
                        >
                            {/* Effet de brillance au survol */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

                            {/* Texte du bouton */}
                            <span className="relative flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à l'accueil
            </span>
                        </a>

                        {/* Message d'aide */}
                        <p className="text-gray-400 text-sm text-center mt-6">
                            💡 Crée une nouvelle room ou rejoins-en une existante
                        </p>
                    </div>
                </main>
            </>
        );
    }

    // Determine background class based on game type
    const bgClass = room.gameType === 'codename-ceo' ? 'poki-bg' : 'lol-bg';

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

            <main className={`${bgClass} p-4`}>
                <div className="max-w-6xl mx-auto py-8">
                    {/* Route to the correct game based on gameType */}
                    {room.gameType === 'aram-missions' ? (
                        room.gameStarted ? (
                            <AramMissionsGameView room={room} roomCode={code} />
                        ) : (
                            <RoomLobby room={room} roomCode={code} />
                        )
                    ) : room.gameType === 'codename-ceo' ? (
                        <CodenameGameView room={room} roomCode={code} />
                    ) : (
                        <ComingSoonGame
                            roomCode={code}
                            gameName={
                                room.gameType === 'break-room-quiz' ? 'Quiz de la salle de pause' :
                                room.gameType === 'coming-game' ? 'Coming Game' :
                                'À venir'
                            }
                        />
                    )}
                </div>
            </main>
        </>
    );
}