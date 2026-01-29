'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function JoinRoomForm() {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const roomCode = code.toUpperCase().trim();

            const response = await fetch(`/api/rooms/${roomCode}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName: name }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to join room');
            }

            const data = await response.json();

            // Stocke le token du joueur
            localStorage.setItem(`room_${roomCode}_player`, data.player.token);

            // Redirige vers la room
            router.push(`/room/${roomCode}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="code" className="block text-sm font-medium mb-2">
                    Code de la room
                </label>
                <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                    maxLength={6}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 uppercase"
                    placeholder="Ex: ABC123"
                />
            </div>

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
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500"
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
                disabled={loading || !name.trim() || !code.trim()}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Connexion...' : 'Rejoindre la room'}
            </button>
        </form>
    );
}