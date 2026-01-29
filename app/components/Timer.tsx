'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
    gameStartTime: string;
    roomCode: string;
}

export function Timer({ gameStartTime, roomCode }: TimerProps) {
    const [elapsed, setElapsed] = useState(0);
    const [midMissionsChecked, setMidMissionsChecked] = useState(false);

    useEffect(() => {
        const startTime = new Date(gameStartTime).getTime();

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = now - startTime;
            setElapsed(Math.floor(diff / 1000)); // en secondes

            // Vérifie les missions MID après 5 minutes
            if (diff >= 5 * 60 * 1000 && !midMissionsChecked) {
                setMidMissionsChecked(true);

                // Appelle l'API pour vérifier/assigner les missions MID
                fetch(`/api/rooms/${roomCode}/check-mid-missions`, {
                    method: 'POST',
                }).catch(console.error);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [gameStartTime, roomCode, midMissionsChecked]);

    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const fiveMinutesPassed = elapsed >= 300;

    return (
        <div className={`bg-white rounded-xl shadow-lg p-6 text-center ${fiveMinutesPassed ? 'border-4 border-purple-500' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                ⏱️ Temps écoulé
            </h3>
            <div className="text-5xl font-bold text-gray-900 mb-2">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            {fiveMinutesPassed ? (
                <div className="mt-4 p-3 bg-purple-100 text-purple-800 rounded-lg font-medium">
                    ⚡ Missions MID assignées !
                </div>
            ) : (
                <div className="mt-4 text-sm text-gray-500">
                    Missions MID dans {Math.max(0, 300 - elapsed)}s
                </div>
            )}
        </div>
    );
}