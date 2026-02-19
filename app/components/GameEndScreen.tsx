'use client';

import { useState } from 'react';
import { GameSummary } from './GameSummary';
import { LeaveRoomButton } from './LeaveRoomButton';
import { ValidationScreen } from '@/app/games/aram-missions/components/ValidationScreen';
import { ValidationSpectator } from '@/app/games/aram-missions/components/ValidationSpectator';

interface RoomEventData {
    id: string;
    appearedAt: string | null;
    resolvedText?: string | null;
    redDecided: boolean;
    redValidated: boolean;
    blueValidated: boolean;
    pointsEarnedRed: number;
    pointsEarnedBlue: number;
    event: { text: string; points: number; difficulty: string; duration: number };
}

interface PlayerBetData {
    id: string;
    playerId: string;
    playerName: string;
    playerTeam: string;
    betType: { id: string; text: string; category: string };
    targetPlayerName: string;
    targetPlayerId: string;
    points: number;
    validated: boolean;
    decided: boolean;
}

interface GameEndRoom {
    validationStatus?: string;
    players: {
        id: string;
        name: string;
        avatar: string;
        team: string;
        missions: {
            mission: { id: string; text: string; type: string; category: string; isPrivate: boolean; points: number; difficulty: string };
            type: string;
            decided: boolean;
            validated: boolean;
            pointsEarned: number;
            resolvedText?: string;
        }[];
    }[];
    victoryBonus?: boolean;
    betsEnabled?: boolean;
    winnerTeam?: string | null;
    victoryBonusPoints?: number;
    roomEvents?: RoomEventData[];
    playerBets?: PlayerBetData[];
}

interface GameEndScreenProps {
    room: GameEndRoom;
    roomCode: string;
    isCreator: boolean;
}

export function GameEndScreen({ room, roomCode, isCreator }: GameEndScreenProps) {
    const [restarting, setRestarting] = useState(false);

    if (room.validationStatus?.startsWith('in_progress') || room.validationStatus === 'events_validation' || room.validationStatus === 'bonus_selection' || room.validationStatus === 'bets_validation') {
        if (isCreator) {
            return <ValidationScreen room={room} roomCode={roomCode} />;
        }
        return <ValidationSpectator room={room} roomCode={roomCode} />;
    }

    const handleRestart = async () => {
        setRestarting(true);
        const creatorToken = localStorage.getItem(`room_${roomCode}_creator`);

        try {
            const response = await fetch(`/api/games/aram-missions/${roomCode}/restart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorToken }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.error || 'Erreur lors du redémarrage');
                setRestarting(false);
            }
        } catch (error) {
            console.error('Error restarting game:', error);
            alert('Erreur de connexion');
            setRestarting(false);
        }
    };

    return (
        <div className="space-y-6">
            <GameSummary
                players={room.players}
                victoryBonus={room.victoryBonus}
                betsEnabled={room.betsEnabled}
                winnerTeam={room.winnerTeam}
                victoryBonusPoints={room.victoryBonusPoints}
                roomEvents={(room.roomEvents || []).filter((re) => re.appearedAt !== null)}
                playerBets={room.playerBets}
            />

            <div className="lol-card rounded-lg p-6">
                {isCreator ? (
                    <div className="space-y-4">
                        <p className="lol-text text-center">
                            Tu peux relancer une nouvelle bataille avec les mêmes invocateurs
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            <button
                                onClick={handleRestart}
                                disabled={restarting}
                                className="lol-button-hextech px-8 py-4 rounded-lg font-bold text-lg transition-all hextech-pulse"
                            >
                                {restarting ? 'Préparation...' : 'Nouvelle bataille'}
                            </button>
                            <LeaveRoomButton roomCode={roomCode} />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-center lol-text">
                            En attente que le créateur relance une bataille...
                        </p>
                        <div className="flex justify-center">
                            <LeaveRoomButton roomCode={roomCode} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
