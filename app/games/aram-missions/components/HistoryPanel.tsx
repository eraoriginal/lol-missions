'use client';

import { useState } from 'react';

interface PlayerSnapshot {
    name: string;
    team: 'red' | 'blue';
    avatar: string;
    missions: {
        text: string;
        type: string;
        validated: boolean;
        points: number;
        isPrivate?: boolean;
    }[];
}

interface EventSnapshot {
    text: string;
    type: string;
    difficulty: string;
    points: number;
    pointsEarnedRed: number;
    pointsEarnedBlue: number;
    redValidated: boolean;
    blueValidated: boolean;
}

interface GameHistoryItem {
    id: string;
    gameNumber: number;
    redScore: number;
    blueScore: number;
    winnerTeam: string | null;
    victoryBonusPoints: number;
    bonusTeam: string | null;
    playersSnapshot: string;
    eventsSnapshot?: string | null;
    playedAt: string;
}

interface HistoryPanelProps {
    gameHistories: GameHistoryItem[];
}

export function HistoryPanel({ gameHistories }: HistoryPanelProps) {
    const [expandedGame, setExpandedGame] = useState<number | null>(null);

    if (gameHistories.length === 0) return null;

    const toggleGame = (gameNumber: number) => {
        setExpandedGame(expandedGame === gameNumber ? null : gameNumber);
    };

    const getMissionIcon = (type: string) => {
        if (type === 'START') return '⚔️';
        if (type === 'MID') return '⚡';
        return '🔥';
    };

    return (
        <div className="lol-card rounded-lg p-4">
            {/* Titre */}
            <div className="text-center mb-4">
                <h2 className="text-lg font-bold lol-title-gold uppercase tracking-wide">
                    Historique des batailles
                </h2>
                <p className="text-sm lol-text mt-1">
                    {gameHistories.length} partie{gameHistories.length > 1 ? 's' : ''} jouée{gameHistories.length > 1 ? 's' : ''}
                </p>
            </div>

            {/* Liste des parties */}
            <div className="space-y-2">
                {gameHistories.map((game) => {
                    const players: PlayerSnapshot[] = JSON.parse(game.playersSnapshot);
                    const redPlayers = players.filter(p => p.team === 'red');
                    const bluePlayers = players.filter(p => p.team === 'blue');
                    const isExpanded = expandedGame === game.gameNumber;

                    return (
                        <div
                            key={game.id}
                            className="border border-[#C8AA6E]/30 rounded-lg overflow-hidden"
                        >
                            {/* Header cliquable */}
                            <button
                                onClick={() => toggleGame(game.gameNumber)}
                                className="w-full p-3 flex items-center justify-between bg-[#010A13]/50 hover:bg-[#010A13]/70 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-semibold lol-text-gold">
                                        Partie {game.gameNumber}
                                    </span>
                                    {game.winnerTeam && (
                                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                                            game.winnerTeam === 'red'
                                                ? 'bg-red-600/50 text-red-200'
                                                : 'bg-blue-600/50 text-blue-200'
                                        }`}>
                                            {game.winnerTeam === 'red' ? '🔴 Victoire Rouge' : '🔵 Victoire Bleue'}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold">
                                        <span className="text-blue-400">{game.blueScore}</span>
                                        <span className="lol-text mx-1">-</span>
                                        <span className="text-red-400">{game.redScore}</span>
                                    </span>
                                    <span className="lol-text">{isExpanded ? '▲' : '▼'}</span>
                                </div>
                            </button>

                            {/* Détails de la partie */}
                            {isExpanded && (() => {
                                const events: EventSnapshot[] = game.eventsSnapshot ? JSON.parse(game.eventsSnapshot) : [];
                                return (
                                <div className="p-4 border-t border-[#C8AA6E]/20 bg-[#010A13]/30">
                                    {/* Bonus de victoire */}
                                    {game.bonusTeam && game.victoryBonusPoints > 0 && (
                                        <div className="mb-4 text-center">
                                            <span className="text-sm lol-text">
                                                Bonus de victoire: <span className="lol-text-gold font-bold">+{game.victoryBonusPoints} pts</span>
                                                {' '}pour l&apos;équipe {game.bonusTeam === 'red' ? '🔴 rouge' : '🔵 bleue'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Événements */}
                                    {events.length > 0 && (
                                        <div className="mb-4">
                                            <h4 className="font-bold text-amber-400 text-sm uppercase border-b border-amber-500/30 pb-1 mb-2">
                                                ⚡ Événements
                                            </h4>
                                            <div className="space-y-1">
                                                {events.map((ev, idx) => (
                                                    <div key={idx} className="flex items-center justify-between text-xs bg-amber-900/20 border border-amber-500/20 rounded px-2 py-1">
                                                        <span className="text-amber-100 truncate flex-1">{ev.text}</span>
                                                        <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                                            <span className={`${ev.redValidated ? 'text-green-300' : 'text-red-300'}`}>
                                                                🔴 {ev.redValidated ? `+${ev.pointsEarnedRed}` : '0'}
                                                            </span>
                                                            <span className={`${ev.blueValidated ? 'text-green-300' : 'text-red-300'}`}>
                                                                🔵 {ev.blueValidated ? `+${ev.pointsEarnedBlue}` : '0'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Équipe Bleue */}
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-blue-400 text-sm uppercase border-b border-blue-500/30 pb-1">
                                                🔵 Équipe Bleue
                                            </h4>
                                            {bluePlayers.map((player, idx) => (
                                                <PlayerCard key={idx} player={player} getMissionIcon={getMissionIcon} />
                                            ))}
                                        </div>

                                        {/* Équipe Rouge */}
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-red-400 text-sm uppercase border-b border-red-500/30 pb-1">
                                                🔴 Équipe Rouge
                                            </h4>
                                            {redPlayers.map((player, idx) => (
                                                <PlayerCard key={idx} player={player} getMissionIcon={getMissionIcon} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                );
                            })()}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function PlayerCard({ player, getMissionIcon }: { player: PlayerSnapshot; getMissionIcon: (type: string) => string }) {
    const totalPoints = player.missions.reduce((sum, m) => sum + (m.validated ? m.points : 0), 0);
    const validatedCount = player.missions.filter(m => m.validated).length;

    return (
        <div className="bg-[#1E2328]/50 rounded-lg p-2 border border-[#C8AA6E]/10">
            <div className="flex items-center gap-2 mb-1">
                {player.avatar ? (

                    <img
                        src={player.avatar}
                        alt={player.name}
                        className="w-6 h-6 rounded-full border border-[#C8AA6E]/50"
                    />
                ) : (
                    <div className="w-6 h-6 bg-gradient-to-br from-[#C8AA6E] to-[#785A28] rounded-full flex items-center justify-center text-[#010A13] font-bold text-xs">
                        {player.name.charAt(0).toUpperCase()}
                    </div>
                )}
                <span className="font-semibold text-sm lol-text-light flex-1">{player.name}</span>
                <span className="text-xs lol-text">{validatedCount}/{player.missions.length} ✓</span>
                <span className="text-xs font-bold lol-text-gold">{totalPoints} pts</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
                {player.missions.map((mission, idx) => (
                    <div
                        key={idx}
                        className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${
                            mission.validated
                                ? 'bg-green-900/50 text-green-300 border border-green-500/30'
                                : 'bg-red-900/50 text-red-300 border border-red-500/30'
                        }`}
                        title={mission.text}
                    >
                        <span>{getMissionIcon(mission.type)}</span>
                        <span>{mission.validated ? '✓' : '✗'}</span>
                        {mission.isPrivate && <span>🔒</span>}
                    </div>
                ))}
            </div>
        </div>
    );
}
