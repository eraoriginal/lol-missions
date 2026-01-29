'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CreateRoomForm() {
    const [name, setName] = useState('');
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
                body: JSON.stringify({ creatorName: name }),
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Ton nom
                </label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={50}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Entre ton pseudo"
                />
            </div>

            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Création...' : 'Créer une room'}
            </button>
        </form>
    );
}