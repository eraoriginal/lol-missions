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
    isCreator?: boolean;
}

export function TeamSelector({ players, roomCode, currentPlayerToken, isCreator = false }: TeamSelectorProps) {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [randomizing, setRandomizing] = useState(false);

    const redTeam = players.filter(p => p.team === 'red');
    const blueTeam = players.filter(p => p.team === 'blue');
    const spectators = players.filter(p => p.team === '');

    const currentPlayer = players.find(p => p.token === currentPlayerToken);
    const myTeam = currentPlayer?.team || '';

    // Le créateur est toujours le premier joueur de la liste
    const creatorId = players[0]?.id;

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

    const randomizeTeams = async () => {
        const token = typeof window !== 'undefined'
            ? localStorage.getItem(`room_${roomCode}_creator`)
            : null;
        if (!token) return;

        setRandomizing(true);
        setError(null);

        try {
            const res = await fetch(`/api/rooms/${roomCode}/random-teams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorToken: token }),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Erreur');
            }
        } catch {
            setError('Erreur de connexion');
        } finally {
            setRandomizing(false);
        }
    };

    const PlayerSlot = ({ player, showCrown = false }: { player: Player; showCrown?: boolean }) => (
        <div className="flex items-center gap-2 bg-black/30 rounded-lg p-2 border border-white/10">
            {player.avatar ? (
                <img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-full border border-[#C8AA6E]" />
            ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-[#C8AA6E] to-[#785A28] rounded-full flex items-center justify-center text-[#010A13] font-bold text-sm">
                    {player.name.charAt(0).toUpperCase()}
                </div>
            )}
            <span className="lol-text-light text-sm font-medium truncate flex-1">{player.name}</span>
            {showCrown && (
                <span className="lol-badge px-1.5 py-0.5 rounded text-xs">👑</span>
            )}
        </div>
    );

    const EmptySlot = ({ team, disabled }: { team: string; disabled?: boolean }) => (
        <button
            onClick={() => !disabled && selectTeam(team)}
            disabled={disabled || loading}
            className={`flex items-center gap-2 w-full rounded-lg p-2 border border-dashed transition-all text-left ${
                disabled
                    ? 'bg-black/10 border-white/10 cursor-not-allowed opacity-50'
                    : team === 'red'
                        ? 'bg-black/20 border-red-500/30 hover:border-red-500/60 hover:bg-red-900/30 cursor-pointer'
                        : 'bg-black/20 border-blue-500/30 hover:border-blue-500/60 hover:bg-blue-900/30 cursor-pointer'
            }`}
        >
            <div className={`w-8 h-8 rounded-full border border-dashed flex items-center justify-center ${
                team === 'red' ? 'border-red-500/40' : 'border-blue-500/40'
            }`}>
                <span className={`text-lg ${team === 'red' ? 'text-red-500/40' : 'text-blue-500/40'}`}>+</span>
            </div>
            <span className={`text-sm italic ${team === 'red' ? 'text-red-400/50' : 'text-blue-400/50'}`}>
                {disabled ? 'Complet' : 'Rejoindre'}
            </span>
        </button>
    );

    return (
        <div className="space-y-4">
            {/* Erreur */}
            {error && (
                <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-center">
                    <p className="text-red-300 text-sm font-medium">{error}</p>
                </div>
            )}

            {/* Bloc fusionné : Invocateurs & Spectateurs */}
            <div className="lol-card rounded-lg p-5">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold lol-title-gold flex items-center gap-2">
                        👥 Invocateurs ({players.length}/10)
                    </h4>
                    <div className="flex items-center gap-2">
                        {isCreator && players.length >= 2 && (
                            <button
                                onClick={randomizeTeams}
                                disabled={randomizing || loading}
                                className="lol-button px-4 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 disabled:opacity-50"
                            >
                                {randomizing ? '⏳' : '🎲'} Aléatoire
                            </button>
                        )}
                        {myTeam !== '' && (
                            <button
                                onClick={() => selectTeam('')}
                                disabled={loading}
                                className="lol-button px-4 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 disabled:opacity-50"
                            >
                                👁️ Devenir spectateur
                            </button>
                        )}
                    </div>
                </div>

                {/* Liste des spectateurs */}
                {spectators.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {spectators.map((p) => (
                            <div key={p.id} className="flex items-center gap-2 bg-[#010A13] rounded-lg px-3 py-2 border border-[#C8AA6E]/20">
                                {p.avatar ? (
                                    <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full border border-[#C8AA6E]" />
                                ) : (
                                    <div className="w-8 h-8 bg-gradient-to-br from-[#0AC8B9] to-[#0397AB] rounded-full flex items-center justify-center text-[#010A13] font-bold text-sm border border-[#C8AA6E]">
                                        {p.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <div className="flex flex-col">
                                    <span className="lol-text-light text-sm font-medium">{p.name}</span>
                                    <span className="text-xs lol-text">👁️ Spectateur</span>
                                </div>
                                {p.id === creatorId && (
                                    <span className="lol-badge px-2 py-0.5 rounded text-xs ml-1">👑</span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm lol-text italic">Tous les joueurs sont dans une équipe</p>
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
                        {redTeam.map((p) => (
                            <PlayerSlot key={p.id} player={p} showCrown={p.id === creatorId} />
                        ))}
                        {Array.from({ length: 5 - redTeam.length }).map((_, i) => (
                            <EmptySlot key={`red-empty-${i}`} team="red" disabled={myTeam === 'red'} />
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
                        {blueTeam.map((p) => (
                            <PlayerSlot key={p.id} player={p} showCrown={p.id === creatorId} />
                        ))}
                        {Array.from({ length: 5 - blueTeam.length }).map((_, i) => (
                            <EmptySlot key={`blue-empty-${i}`} team="blue" disabled={myTeam === 'blue'} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
