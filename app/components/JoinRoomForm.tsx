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

            localStorage.setItem(`room_${roomCode}_player`, data.player.token);

            router.push(`/room/${roomCode}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="code" className="block text-xs font-semibold text-purple-300/70 uppercase tracking-wider mb-2">
                    Code de la room
                </label>
                <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                    maxLength={6}
                    className="arcane-input w-full px-4 py-3 text-sm uppercase tracking-widest font-mono text-center"
                    placeholder="ABC123"
                />
            </div>

            <div>
                <label htmlFor="join-name" className="block text-xs font-semibold text-purple-300/70 uppercase tracking-wider mb-2">
                    Ton nom
                </label>
                <input
                    id="join-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={50}
                    className="arcane-input w-full px-4 py-3 text-sm"
                    placeholder="Entre ton pseudo"
                />
            </div>

            {error && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-400 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading || !name.trim() || !code.trim()}
                className="arcane-btn-cyan w-full py-3.5 px-4"
            >
                {loading ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Connexion...
                    </span>
                ) : (
                    'Rejoindre la room'
                )}
            </button>
        </form>
    );
}
