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
            // Le polling met à jour automatiquement
        } catch (e) {
            setError('Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    // Composant réutilisé pour afficher une case joueur dans une équipe
    const PlayerSlot = ({ player }: { player: Player }) => (
        <div className="flex items-center gap-2 bg-white/20 rounded-lg p-2">
            {player.avatar ? (
                <img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-full" />
            ) : (
                <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {player.name.charAt(0).toUpperCase()}
                </div>
            )}
            <span className="text-white text-sm font-medium truncate">{player.name}</span>
        </div>
    );

    // Cases vides pour montrer les slots disponibles
    const EmptySlot = () => (
        <div className="flex items-center gap-2 bg-white/10 border border-dashed border-white/30 rounded-lg p-2">
            <div className="w-8 h-8 rounded-full border border-dashed border-white/40 flex items-center justify-center">
                <span className="text-white/30 text-lg">+</span>
            </div>
            <span className="text-white/30 text-sm italic">Libre</span>
        </div>
    );

    return (
        <div className="space-y-4">
            {/* Boutons de sélection d'équipe pour le joueur courant */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">Choisis ton équipe</h3>
                <div className="flex gap-3 justify-center flex-wrap">
                    <button
                        onClick={() => selectTeam('red')}
                        disabled={loading || myTeam === 'red'}
                        className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${
                            myTeam === 'red'
                                ? 'bg-red-600 text-white shadow-lg scale-105 ring-4 ring-red-300'
                                : 'bg-red-100 text-red-700 hover:bg-red-200 border-2 border-red-300'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                        🔴 Équipe Rouge ({redTeam.length}/5)
                    </button>

                    <button
                        onClick={() => selectTeam('blue')}
                        disabled={loading || myTeam === 'blue'}
                        className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${
                            myTeam === 'blue'
                                ? 'bg-blue-600 text-white shadow-lg scale-105 ring-4 ring-blue-300'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-2 border-blue-300'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                        🔵 Équipe Bleue ({blueTeam.length}/5)
                    </button>

                    <button
                        onClick={() => selectTeam('')}
                        disabled={loading || myTeam === ''}
                        className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${
                            myTeam === ''
                                ? 'bg-gray-600 text-white shadow-lg scale-105 ring-4 ring-gray-300'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-gray-300'
                        } disabled:opacity-60 disabled:cursor-not-allowed`}
                    >
                        👁️ Spectateur
                    </button>
                </div>

                {error && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-center">
                        <p className="text-red-700 text-sm font-medium">{error}</p>
                    </div>
                )}
            </div>

            {/* Composition des équipes */}
            <div className="grid grid-cols-2 gap-4">
                {/* Équipe Rouge */}
                <div className="bg-gradient-to-br from-red-700 to-red-900 rounded-xl shadow-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-bold text-lg flex items-center gap-2">
                            🔴 Équipe Rouge
                        </h4>
                        <span className="text-red-200 text-sm font-semibold bg-red-800/50 px-2 py-0.5 rounded-full">
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
                <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-xl shadow-lg p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-white font-bold text-lg flex items-center gap-2">
                            🔵 Équipe Bleue
                        </h4>
                        <span className="text-blue-200 text-sm font-semibold bg-blue-800/50 px-2 py-0.5 rounded-full">
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
                <div className="bg-white rounded-xl shadow-lg p-5">
                    <h4 className="text-gray-700 font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                        👁️ Spectateurs ({spectators.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {spectators.map(p => (
                            <div key={p.id} className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
                                {p.avatar ? (
                                    <img src={p.avatar} alt={p.name} className="w-6 h-6 rounded-full" />
                                ) : (
                                    <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs">
                                        {p.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="text-gray-600 text-sm">{p.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}