'use client';

import { useState } from 'react';
import { PlayerList } from './PlayerList';
import { LeaveRoomButton } from './LeaveRoomButton';

interface Room {
    id: string;
    code: string;
    players: any[];
}

interface RoomLobbyProps {
    room: Room;
    roomCode: string;
}

export function RoomLobby({ room, roomCode }: RoomLobbyProps) {
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Vérifie si l'utilisateur est le créateur
    const creatorToken = typeof window !== 'undefined'
        ? localStorage.getItem(`room_${roomCode}_creator`)
        : null;
    const isCreator = !!creatorToken;

    const handleStart = async () => {
        if (!creatorToken) return;

        setStarting(true);
        setError(null);

        try {
            const response = await fetch(`/api/rooms/${roomCode}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorToken }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to start game');
            }

            // La room se mettra à jour via SSE
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start game');
            setStarting(false);
        }
    };

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/room/${roomCode}`
        : '';

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);

            // Réinitialise après 3 secondes
            setTimeout(() => {
                setCopied(false);
            }, 3000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                {/* Bouton quitter en haut à droite */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Room: {roomCode}
                        </h1>
                        <p className="text-gray-600">
                            En attente que le créateur lance la partie...
                        </p>
                    </div>
                    <LeaveRoomButton roomCode={roomCode} />
                </div>

                {/* Share link */}
                <div className="max-w-2xl mx-auto">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 text-gray-700"
                        />
                        <button
                            onClick={copyToClipboard}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                copied
                                    ? 'bg-green-600 text-white'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {copied ? '✓ Copié !' : '📋 Copier'}
                        </button>
                    </div>

                    {/* Message de succès */}
                    {copied && (
                        <div className="mt-3 p-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium animate-fade-in">
                            ✓ Lien copié dans le presse-papier !
                        </div>
                    )}
                </div>
            </div>

            {/* Players */}
            <PlayerList players={room.players} />

            {/* Start button (creator only) */}
            {isCreator && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleStart}
                        disabled={starting || room.players.length < 2}
                        className="w-full py-4 bg-green-600 text-white rounded-lg font-bold text-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {starting ? '🚀 Démarrage...' : '🎮 LANCER LA PARTIE'}
                    </button>

                    {room.players.length < 2 && (
                        <p className="mt-3 text-center text-sm text-gray-500">
                            Il faut au moins 2 joueurs pour commencer
                        </p>
                    )}
                </div>
            )}

            {!isCreator && (
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                    <p className="text-blue-800">
                        ⏳ Attente du créateur pour lancer la partie...
                    </p>
                </div>
            )}
        </div>
    );
}