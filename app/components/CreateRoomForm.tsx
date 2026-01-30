'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameSelector } from './GameSelector';

export function CreateRoomForm() {
    const [name, setName] = useState('');
    const [selectedGame, setSelectedGame] = useState('aram-missions');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/rooms/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creatorName: name,
                    gameType: selectedGame, // 🆕 Envoie le type de jeu
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create room');
            }

            const data = await response.json();

            // Stocke les tokens dans localStorage
            localStorage.setItem(`room_${data.room.code}_creator`, data.creatorToken);
            localStorage.setItem(`room_${data.room.code}_player`, data.playerToken);

            // Redirige vers la room
            router.push(`/room/${data.room.code}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nom du joueur */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Ton nom
                </label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={50}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                    placeholder="Entre ton pseudo"
                />
            </div>

            {/* 🆕 Sélection du jeu */}
            <GameSelector
                selectedGame={selectedGame}
                onSelectGame={setSelectedGame}
            />

            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {loading ? 'Création...' : 'Créer une room'}
            </button>
        </form>
    );
}