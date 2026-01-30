'use client';

import { useState } from 'react';
import { GameSummary } from './GameSummary';
import { LeaveRoomButton } from './LeaveRoomButton'; // 🆕 Import ajouté

interface GameEndScreenProps {
    room: any;
    roomCode: string;
    isCreator: boolean;
}

export function GameEndScreen({ room, roomCode, isCreator }: GameEndScreenProps) {
    const [restarting, setRestarting] = useState(false);

    const handleRestart = async () => {
        setRestarting(true);

        const creatorToken = localStorage.getItem(`room_${roomCode}_creator`);

        try {
            const response = await fetch(`/api/rooms/${roomCode}/restart`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorToken }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.error || 'Erreur lors du redémarrage');
                setRestarting(false);
            }
            // Le polling détectera automatiquement que gameStarted = false
        } catch (error) {
            console.error('Error restarting game:', error);
            alert('Erreur de connexion');
            setRestarting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">🏁</div>
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    Partie terminée !
                </h1>
                <p className="text-gray-600">
                    Room: <span className="font-mono font-bold">{roomCode}</span>
                </p>
            </div>

            {/* Récapitulatif des missions */}
            <GameSummary players={room.players} />

            {/* Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                {isCreator ? (
                    <div className="space-y-4">
                        <p className="text-gray-600 text-center">
                            Tu peux relancer une nouvelle partie avec les mêmes joueurs
                        </p>
                        <div className="flex gap-4 justify-center flex-wrap">
                            {/* Bouton Recommencer */}
                            <button
                                onClick={handleRestart}
                                disabled={restarting}
                                className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                            >
                                {restarting ? '🔄 Redémarrage...' : '🎮 Recommencer une partie'}
                            </button>
                            {/* 🆕 Bouton Quitter */}
                            <LeaveRoomButton roomCode={roomCode} />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-center text-gray-600">
                            ⏳ En attente que le créateur relance une partie...
                        </p>
                        <div className="flex justify-center">
                            {/* 🆕 Bouton Quitter pour les autres joueurs */}
                            <LeaveRoomButton roomCode={roomCode} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
