'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
    gameStartTime: string;
    roomCode: string;
}

// Récupère les délais depuis les variables d'environnement
const MID_MISSION_DELAY = parseInt(process.env.NEXT_PUBLIC_MID_MISSION_DELAY || '300');
const LATE_MISSION_DELAY = parseInt(process.env.NEXT_PUBLIC_LATE_MISSION_DELAY || '600');

export function Timer({ gameStartTime, roomCode }: TimerProps) {
    const [elapsed, setElapsed] = useState(0);
    const [midMissionsChecked, setMidMissionsChecked] = useState(false);
    const [lateMissionsChecked, setLateMissionsChecked] = useState(false);

    useEffect(() => {
        const startTime = new Date(gameStartTime).getTime();

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = now - startTime;
            setElapsed(Math.floor(diff / 1000)); // en secondes

            // Vérifie les missions MID
            if (diff >= MID_MISSION_DELAY * 1000 && !midMissionsChecked) {
                console.log(`[Timer] ${MID_MISSION_DELAY} seconds reached! Calling check-mid-missions...`);
                setMidMissionsChecked(true);

                fetch(`/api/rooms/${roomCode}/check-mid-missions`, {
                    method: 'POST',
                })
                    .then(res => res.json())
                    .then(data => {
                        console.log('[Timer] check-mid-missions response:', data);
                    })
                    .catch(err => {
                        console.error('[Timer] check-mid-missions error:', err);
                    });
            }

            // Vérifie les missions LATE
            if (diff >= LATE_MISSION_DELAY * 1000 && !lateMissionsChecked) {
                console.log(`[Timer] ${LATE_MISSION_DELAY} seconds reached! Calling check-late-missions...`);
                setLateMissionsChecked(true);

                fetch(`/api/rooms/${roomCode}/check-late-missions`, {
                    method: 'POST',
                })
                    .then(res => res.json())
                    .then(data => {
                        console.log('[Timer] check-late-missions response:', data);
                    })
                    .catch(err => {
                        console.error('[Timer] check-late-missions error:', err);
                    });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [gameStartTime, roomCode, midMissionsChecked, lateMissionsChecked]);

    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const midDelayPassed = elapsed >= MID_MISSION_DELAY;
    const lateDelayPassed = elapsed >= LATE_MISSION_DELAY;

    return (
        <div className={`bg-white rounded-xl shadow-lg p-6 text-center ${lateDelayPassed ? 'border-4 border-red-500' : midDelayPassed ? 'border-4 border-purple-500' : ''}`}>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                ⏱️ Temps écoulé
            </h3>
            <div className="text-5xl font-bold text-gray-900 mb-2">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            <div className="space-y-2 mt-4">
                {/* MID missions */}
                {midDelayPassed ? (
                    <div className="p-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium">
                        ⚡ Missions MID assignées !
                    </div>
                ) : (
                    <div className="text-sm text-gray-500">
                        Missions MID dans {Math.max(0, MID_MISSION_DELAY - elapsed)}s
                    </div>
                )}

                {/* LATE missions */}
                {lateDelayPassed ? (
                    <div className="p-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                        🔥 Missions FINALE assignées !
                    </div>
                ) : midDelayPassed ? (
                    <div className="text-sm text-gray-500">
                        Missions FINALE dans {Math.max(0, LATE_MISSION_DELAY - elapsed)}s
                    </div>
                ) : null}
            </div>
        </div>
    );
}