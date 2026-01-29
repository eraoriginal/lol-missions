'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
    gameStartTime: string;
    roomCode: string;
}

// Récupère les délais depuis les variables d'environnement
const MID_MISSION_DELAY = parseInt(process.env.NEXT_PUBLIC_MID_MISSION_DELAY || '300');
const LATE_MISSION_DELAY = parseInt(process.env.NEXT_PUBLIC_LATE_MISSION_DELAY || '600');

// Délai avant l'arrivée de la mission pour jouer le son (5 secondes avant)
const WARNING_DELAY = 5;

export function Timer({ gameStartTime, roomCode }: TimerProps) {
    const [elapsed, setElapsed] = useState(0);
    const [midMissionsChecked, setMidMissionsChecked] = useState(false);
    const [lateMissionsChecked, setLateMissionsChecked] = useState(false);
    const [midWarningPlayed, setMidWarningPlayed] = useState(false);
    const [lateWarningPlayed, setLateWarningPlayed] = useState(false);

    // Fonction pour jouer un son de notification
    const playWarningSound = (type: 'mid' | 'late') => {
        console.log('[Timer] playWarningSound called, type:', type);

        // Choisis le bon fichier audio
        const audioFile = type === 'mid'
            ? '/sounds/allo.mp3'
            : '/sounds/allons_y.mp3';

        console.log('[Timer] Playing audio file:', audioFile);

        // Crée et joue l'audio
        const audio = new Audio(audioFile);
        audio.volume = 0.7; // Volume à 70%

        audio.play()
            .then(() => {
                console.log('[Timer] ✅ Audio playing');
            })
            .catch(err => {
                console.error('[Timer] ❌ Audio play failed:', err);
            });
    };

    useEffect(() => {
        const startTime = new Date(gameStartTime).getTime();

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = now - startTime;
            const elapsedSeconds = Math.floor(diff / 1000);
            setElapsed(elapsedSeconds);

            // 🔊 Son d'avertissement MID (5 secondes avant)
            const timeUntilMid = MID_MISSION_DELAY - elapsedSeconds;
            if (timeUntilMid === WARNING_DELAY && !midWarningPlayed) {
                console.log('[Timer] Playing MID warning sound...');
                playWarningSound('mid');
                setMidWarningPlayed(true);
            }

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

            // 🔊 Son d'avertissement LATE (5 secondes avant)
            const timeUntilLate = LATE_MISSION_DELAY - elapsedSeconds;
            if (timeUntilLate === WARNING_DELAY && !lateWarningPlayed) {
                console.log('[Timer] Playing LATE warning sound...');
                playWarningSound('late');
                setLateWarningPlayed(true);
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
    }, [gameStartTime, roomCode, midMissionsChecked, lateMissionsChecked, midWarningPlayed, lateWarningPlayed]);

    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const midDelayPassed = elapsed >= MID_MISSION_DELAY;
    const lateDelayPassed = elapsed >= LATE_MISSION_DELAY;

    // Calcule le temps restant avant la prochaine mission
    const timeUntilMid = Math.max(0, MID_MISSION_DELAY - elapsed);
    const timeUntilLate = Math.max(0, LATE_MISSION_DELAY - elapsed);
    const showMidWarning = timeUntilMid > 0 && timeUntilMid <= WARNING_DELAY;
    const showLateWarning = midDelayPassed && timeUntilLate > 0 && timeUntilLate <= WARNING_DELAY;

    return (
        <div className={`bg-white rounded-xl shadow-lg p-6 text-center transition-all duration-300 ${
            lateDelayPassed
                ? 'border-4 border-red-500'
                : midDelayPassed
                    ? 'border-4 border-purple-500'
                    : showMidWarning || showLateWarning
                        ? 'border-4 border-yellow-400 animate-pulse'
                        : ''
        }`}>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                ⏱️ Temps écoulé
            </h3>
            <div className="text-5xl font-bold text-gray-900 mb-2">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            <div className="space-y-2 mt-4">
                {/* Avertissement MID */}
                {showMidWarning && (
                    <div className="p-3 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-bold animate-pulse border-2 border-yellow-400">
                        ⚠️ Nouvelle mission dans {timeUntilMid}s !
                    </div>
                )}

                {/* MID missions */}
                {midDelayPassed ? (
                    <div className="p-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium">
                        ⚡ Missions MID assignées !
                    </div>
                ) : !showMidWarning ? (
                    <div className="text-sm text-gray-500">
                        Missions MID dans {timeUntilMid}s
                    </div>
                ) : null}

                {/* Avertissement LATE */}
                {showLateWarning && (
                    <div className="p-3 bg-orange-100 text-orange-800 rounded-lg text-sm font-bold animate-pulse border-2 border-orange-400">
                        🔥 Mission FINALE dans {timeUntilLate}s !
                    </div>
                )}

                {/* LATE missions */}
                {lateDelayPassed ? (
                    <div className="p-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                        🔥 Missions FINALE assignées !
                    </div>
                ) : midDelayPassed && !showLateWarning ? (
                    <div className="text-sm text-gray-500">
                        Missions FINALE dans {timeUntilLate}s
                    </div>
                ) : null}
            </div>
        </div>
    );
}