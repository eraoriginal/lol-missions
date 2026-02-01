'use client';

import { useState } from 'react';

interface Player {
    id: string;
    name: string;
    avatar: string;
    team: string;
    token: string;
}

interface TeamSelectorProps {
    players: Player[];
    roomCode: string;
    currentPlayerToken: string | null;
}

export function TeamSelector({ players, roomCode, currentPlayerToken }: TeamSelectorProps) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const redTeam = players.filter(p => p.team === 'red');
    const blueTeam = players.filter(p => p.team === 'blue');
    const spectators = players.filter(p => p.team === '');

    const currentPlayer = players.find(p => p.token === currentPlayerToken);
    const myTeam = currentPlayer?.team || '';

    const selectTeam = async (team: string) => {
        if (!currentPlayerToken || team === myTeam) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/rooms/${roomCode}/team`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerToken: currentPlayerToken, team }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Erreur');
                return;
            }
        } catch (e) {
            setError('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    const PlayerSlot = ({ player }: { player: Player }) => (
        <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2 border border-white/10">
            {player.avatar ? (
                <img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-full border border-[#C8AA6E]" />
            ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-[#C8AA6E] to-[#785A28] rounded-full flex items-center justify-center text-[#010A13] font-bold text-sm">
                    {player.name.charAt(0).toUpperCase()}
                </div>
            )}
            <span className="lol-text-light text-sm font-medium truncate">{player.name}</span>
        </div>
    );

    const EmptySlot = () => (
        <div className="flex items-center gap-2 bg-black/20 border border-dashed border-white/20 rounded-lg p-2">
            <div className="w-8 h-8 rounded-full border border-dashed border-white/30 flex items-center justify-center">
                <span className="text-white/20 text-lg">+</span>
            </div>
            <span className="text-white/20 text-sm italic">Libre</span>
        </div>
    );

    return (
        <div className="space-y-4">
            {/* Boutons de sélection d'équipe */}
            <div className="lol-card rounded-lg p-6">
                <h3 className="text-xl font-bold lol-title-gold mb-4 text-center">Choisis ton camp</h3>
                <div className="flex gap-3 justify-center flex-wrap">
                    <button
                        onClick={() => selectTeam('red')}
                        disabled={loading || myTeam === 'red'}
                        className={`px-6 py-3 rounded-lg font-bold text-lg transition-all uppercase tracking-wide ${
                            myTeam === 'red'
                                ? 'bg-gradient-to-b from-red-500 to-red-700 text-white shadow-lg shadow-red-500/50 scale-105 border-2 border-red-400'
                                : 'bg-[#1E2328] text-red-400 hover:bg-red-900/50 border-2 border-red-500/50 hover:border-red-500'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                        🔴 Rouge ({redTeam.length}/5)
                    </button>

                    <button
                        onClick={() => selectTeam('blue')}
                        disabled={loading || myTeam === 'blue'}
                        className={`px-6 py-3 rounded-lg font-bold text-lg transition-all uppercase tracking-wide ${
                            myTeam === 'blue'
                                ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-500/50 scale-105 border-2 border-blue-400'
                                : 'bg-[#1E2328] text-blue-400 hover:bg-blue-900/50 border-2 border-blue-500/50 hover:border-blue-500'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                        🔵 Bleue ({blueTeam.length}/5)
                    </button>

                    <button
                        onClick={() => selectTeam('')}
                        disabled={loading || myTeam === ''}
                        className={`px-6 py-3 rounded-lg font-bold text-lg transition-all uppercase tracking-wide ${
                            myTeam === ''
                                ? 'bg-gradient-to-b from-gray-500 to-gray-700 text-white shadow-lg shadow-gray-500/50 scale-105 border-2 border-gray-400'
                                : 'bg-[#1E2328] text-gray-400 hover:bg-gray-800/50 border-2 border-gray-500/50 hover:border-gray-500'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                        👁️ Spectateur
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-center">
                        <p className="text-red-300 text-sm font-medium">{error}</p>
                    </div>
                )}
            </div>

            {/* Composition des équipes */}
            <div className="grid grid-cols-2 gap-4">
                {/* Équipe Rouge */}
                <div className="bg-gradient-to-br from-red-900/80 to-red-950 rounded-lg p-5 border border-red-500/30">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-red-300 font-bold text-lg flex items-center gap-2 uppercase tracking-wide">
                            🔴 Rouge
                        </h4>
                        <span className="text-red-400 text-sm font-semibold bg-red-950 px-2 py-0.5 rounded-full border border-red-500/30">
                            {redTeam.length}/5
                        </span>
                    </div>
                    <div className="space-y-2">
                        {redTeam.map(p => <PlayerSlot key={p.id} player={p} />)}
                        {Array.from({ length: 5 - redTeam.length }).map((_, i) => (
                            <EmptySlot key={`red-empty-${i}`} />
                        ))}
                    </div>
                </div>

                {/* Équipe Bleue */}
                <div className="bg-gradient-to-br from-blue-900/80 to-blue-950 rounded-lg p-5 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-blue-300 font-bold text-lg flex items-center gap-2 uppercase tracking-wide">
                            🔵 Bleue
                        </h4>
                        <span className="text-blue-400 text-sm font-semibold bg-blue-950 px-2 py-0.5 rounded-full border border-blue-500/30">
                            {blueTeam.length}/5
                        </span>
                    </div>
                    <div className="space-y-2">
                        {blueTeam.map(p => <PlayerSlot key={p.id} player={p} />)}
                        {Array.from({ length: 5 - blueTeam.length }).map((_, i) => (
                            <EmptySlot key={`blue-empty-${i}`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Spectateurs */}
            {spectators.length > 0 && (
                <div className="lol-card rounded-lg p-5">
                    <h4 className="lol-text font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                        👁️ Spectateurs ({spectators.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {spectators.map(p => (
                            <div key={p.id} className="flex items-center gap-2 bg-[#010A13] rounded-lg px-3 py-1.5 border border-[#C8AA6E]/20">
                                {p.avatar ? (
                                    <img src={p.avatar} alt={p.name} className="w-6 h-6 rounded-full" />
                                ) : (
                                    <div className="w-6 h-6 bg-gradient-to-br from-[#C8AA6E] to-[#785A28] rounded-full flex items-center justify-center text-[#010A13] font-bold text-xs">
                                        {p.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="lol-text text-sm">{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
