'use client';

import { useState } from 'react';
import { GameSummary } from './GameSummary';
import { LeaveRoomButton } from './LeaveRoomButton';
import { ValidationScreen } from '@/app/games/aram-missions/components/ValidationScreen';
import { ValidationSpectator } from '@/app/games/aram-missions/components/ValidationSpectator';

interface GameEndScreenProps {
    room: any;
    roomCode: string;
    isCreator: boolean;
}

export function GameEndScreen({ room, roomCode, isCreator }: GameEndScreenProps) {
    const [restarting, setRestarting] = useState(false);

    if (room.validationStatus?.startsWith('in_progress') || room.validationStatus === 'bonus_selection') {
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
                winnerTeam={room.winnerTeam}
                victoryBonusPoints={room.victoryBonusPoints}
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
