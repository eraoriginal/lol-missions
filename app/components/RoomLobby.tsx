'use client';

import { useState } from 'react';
import { TeamSelector } from './TeamSelector';
import { MissionDelayPicker } from '@/app/games/aram-missions/components/MissionDelayPicker';
import { LeaveRoomButton } from './LeaveRoomButton';
import { AramRulesModal } from '@/app/games/aram-missions/components/AramRulesModal';
import { HistoryPanel } from '@/app/games/aram-missions/components/HistoryPanel';

interface GameHistoryItem {
    id: string;
    gameNumber: number;
    redScore: number;
    blueScore: number;
    winnerTeam: string | null;
    victoryBonusPoints: number;
    bonusTeam: string | null;
    playersSnapshot: string;
    playedAt: string;
}

interface Room {
    id: string;
    code: string;
    creatorToken?: string;
    players: { id: string; name: string; avatar: string; team: string; token: string }[];
    midMissionDelay: number;
    lateMissionDelay: number;
    missionVisibility: 'all' | 'team' | 'hidden';
    gameMap: string;
    victoryBonus: boolean;
    missionChoiceCount: number;
    maxEventsPerGame: number;
    gameHistories?: GameHistoryItem[];
}

interface RoomLobbyProps {
    room: Room;
    roomCode: string;
}

export function RoomLobby({ room, roomCode }: RoomLobbyProps) {
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const creatorToken = typeof window !== 'undefined'
        ? localStorage.getItem(`room_${roomCode}_creator`)
        : null;
    const isCreator = !!creatorToken;

    const playerToken = typeof window !== 'undefined'
        ? localStorage.getItem(`room_${roomCode}_player`)
        : null;

    const creatorPlayerId = room.players.find(p => p.token === room.creatorToken)?.id || null;

    const handleStart = async () => {
        if (!creatorToken) return;
        setStarting(true);
        setError(null);

        try {
            const response = await fetch(`/api/games/aram-missions/${roomCode}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorToken }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to start game');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start game');
            setStarting(false);
        }
    };

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/room/${roomCode}`
        : '';

    const copyCode = async () => {
        try {
            await navigator.clipboard.writeText(roomCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    // Calcul du score cumulé (match nul = +1 pour les deux)
    const cumulativeScore = (room.gameHistories || []).reduce(
        (acc, game) => {
            if (game.winnerTeam === 'red') acc.red++;
            else if (game.winnerTeam === 'blue') acc.blue++;
            else if (game.redScore === game.blueScore && game.redScore > 0) {
                acc.red++;
                acc.blue++;
            }
            return acc;
        },
        { red: 0, blue: 0 }
    );
    const hasHistory = room.gameHistories && room.gameHistories.length > 0;

    return (
        <div className="space-y-6">
            {/* Header compact */}
            <div className="lol-card rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold lol-title">
                            <span className="lol-title-gold">ARAM</span> Missions
                        </h1>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={copyCode}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-lg font-bold transition-all ${
                                    copied
                                        ? 'bg-[#0AC8B9]/20 border border-[#0AC8B9] text-[#0AC8B9]'
                                        : 'bg-[#010A13] border border-[#C8AA6E]/50 text-[#C8AA6E] hover:border-[#C8AA6E] hover:bg-[#C8AA6E]/10'
                                }`}
                                title="Copier le code"
                            >
                                {roomCode}
                                <span className="text-sm">{copied ? '✓' : '📋'}</span>
                            </button>
                            <button
                                onClick={copyLink}
                                className="lol-button px-3 py-1.5 rounded-lg text-sm"
                                title="Copier le lien"
                            >
                                🔗 Lien
                            </button>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <AramRulesModal />
                        <LeaveRoomButton roomCode={roomCode} />
                    </div>
                </div>
            </div>

            {/* Score cumulé (affiché au-dessus des équipes) */}
            {hasHistory && (
                <div className="flex items-center justify-center gap-6 py-2">
                    <div className="flex items-center gap-4 text-3xl font-bold">
                        <span className="text-blue-500">🔵 {cumulativeScore.blue}</span>
                        <span className="lol-text-gold">-</span>
                        <span className="text-red-500">{cumulativeScore.red} 🔴</span>
                    </div>
                </div>
            )}

            {/* Sélection des équipes */}
            <TeamSelector
                players={room.players}
                roomCode={roomCode}
                currentPlayerToken={playerToken}
                isCreator={isCreator}
                creatorPlayerId={creatorPlayerId}
            />

            {/* Start button (creator only) */}
            {isCreator && (
                <div className="flex flex-col items-center">
                    {error && (
                        <div className="mb-3 p-2 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleStart}
                        disabled={starting || room.players.filter(p => p.team === 'red' || p.team === 'blue').length < 2}
                        className="lol-button-hextech px-10 py-2.5 rounded-lg font-bold text-base transition-all hextech-pulse"
                    >
                        {starting ? 'Préparation...' : 'LANCER LA BATAILLE'}
                    </button>

                    {room.players.filter(p => p.team === 'red' || p.team === 'blue').length < 2 && (
                        <p className="mt-2 text-center text-sm lol-text">
                            Il faut au moins 2 invocateurs dans une équipe pour commencer
                        </p>
                    )}
                </div>
            )}

            {!isCreator && (
                <div className="lol-card rounded-lg p-6 text-center">
                    <p className="lol-text-gold">
                        En attente que le créateur lance la bataille...
                    </p>
                </div>
            )}

            {/* Paramétrage de la partie */}
            <MissionDelayPicker
                midMissionDelay={room.midMissionDelay}
                lateMissionDelay={room.lateMissionDelay}
                missionVisibility={room.missionVisibility}
                gameMap={room.gameMap}
                victoryBonus={room.victoryBonus}
                missionChoiceCount={room.missionChoiceCount}
                maxEventsPerGame={room.maxEventsPerGame}
                isCreator={isCreator}
                roomCode={roomCode}
                creatorToken={creatorToken}
            />

            {/* Historique des parties (en bas de page) */}
            {hasHistory && (
                <HistoryPanel gameHistories={room.gameHistories!} />
            )}
        </div>
    );
}
