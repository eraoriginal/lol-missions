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
                    gameType: selectedGame,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to create room');
            }

            const data = await response.json();

            localStorage.setItem(`room_${data.room.code}_creator`, data.creatorToken);
            localStorage.setItem(`room_${data.room.code}_player`, data.playerToken);

            router.push(`/room/${data.room.code}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="name" className="block text-xs font-semibold text-purple-300/70 uppercase tracking-wider mb-2">
                    Ton nom
                </label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={50}
                    className="arcane-input w-full px-4 py-3 text-sm"
                    placeholder="Entre ton pseudo"
                />
            </div>

            <GameSelector
                selectedGame={selectedGame}
                onSelectGame={setSelectedGame}
            />

            {error && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-400 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading || !name.trim()}
                className="arcane-btn w-full py-3.5 px-4"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Création...
                    </span>
                ) : (
                    'Créer une room'
                )}
            </button>
        </form>
    );
}
