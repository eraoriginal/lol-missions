'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
    gameStartTime: string;
    roomCode: string;
    gameStopped?: boolean;
    midMissionDelay: number;
    lateMissionDelay: number;
}

export function Timer({ gameStartTime, roomCode, gameStopped = false, midMissionDelay, lateMissionDelay }: TimerProps) {
    const [elapsed, setElapsed] = useState(0);
    const [midMissionsChecked, setMidMissionsChecked] = useState(false);
    const [lateMissionsChecked, setLateMissionsChecked] = useState(false);
    const [midSoundPlayed, setMidSoundPlayed] = useState(false);
    const [lateSoundPlayed, setLateSoundPlayed] = useState(false);

    const playSound = (type: 'mid' | 'late') => {
        const audioFile = type === 'mid'
            ? '/sounds/allo.mp3'
            : '/sounds/allons_y.mp3';

        console.log('[Timer] Playing sound:', audioFile);

        const audio = new Audio(audioFile);
        audio.volume = 0.7;

        audio.play()
            .then(() => console.log('[Timer] ✅ Audio playing'))
            .catch(err => console.error('[Timer] ❌ Audio play failed:', err));
    };

    useEffect(() => {
        if (gameStopped) {
            console.log('[Timer] Game stopped, not starting interval');
            return;
        }

        const startTime = new Date(gameStartTime).getTime();

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = now - startTime;
            const elapsedSeconds = Math.floor(diff / 1000);
            setElapsed(elapsedSeconds);

            // --- MID : son + assignation en même temps ---
            if (diff >= midMissionDelay * 1000) {
                if (!midSoundPlayed) {
                    console.log('[Timer] MID reached — playing sound');
                    playSound('mid');
                    setMidSoundPlayed(true);
                }
                if (!midMissionsChecked) {
                    console.log(`[Timer] MID reached — calling check-mid-missions`);
                    setMidMissionsChecked(true);

                    fetch(`/api/rooms/${roomCode}/check-mid-missions`, { method: 'POST' })
                        .then(res => res.json())
                        .then(data => console.log('[Timer] check-mid-missions response:', data))
                        .catch(err => console.error('[Timer] check-mid-missions error:', err));
                }
            }

            // --- LATE : son + assignation en même temps ---
            if (diff >= lateMissionDelay * 1000) {
                if (!lateSoundPlayed) {
                    console.log('[Timer] LATE reached — playing sound');
                    playSound('late');
                    setLateSoundPlayed(true);
                }
                if (!lateMissionsChecked) {
                    console.log(`[Timer] LATE reached — calling check-late-missions`);
                    setLateMissionsChecked(true);

                    fetch(`/api/rooms/${roomCode}/check-late-missions`, { method: 'POST' })
                        .then(res => res.json())
                        .then(data => console.log('[Timer] check-late-missions response:', data))
                        .catch(err => console.error('[Timer] check-late-missions error:', err));
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [gameStartTime, roomCode, midMissionsChecked, lateMissionsChecked, midSoundPlayed, lateSoundPlayed, midMissionDelay, lateMissionDelay]);

    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const midDelayPassed = elapsed >= midMissionDelay;
    const lateDelayPassed = elapsed >= lateMissionDelay;

    const timeUntilMid = Math.max(0, midMissionDelay - elapsed);
    const timeUntilLate = Math.max(0, lateMissionDelay - elapsed);

    const formatRemaining = (s: number) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return sec === 0 ? `${m}min` : `${m}min ${sec}s`;
    };

    return (
        <div className={`bg-white rounded-xl shadow-lg p-6 text-center transition-all duration-300 ${
            lateDelayPassed
                ? 'border-4 border-red-500'
                : midDelayPassed
                    ? 'border-4 border-purple-500'
                    : ''
        }`}>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                ⏱️ Temps écoulé
            </h3>
            <div className="text-5xl font-bold text-gray-900 mb-2">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>

            <div className="space-y-2 mt-4">
                {/* MID */}
                {midDelayPassed ? (
                    <div className="p-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium">
                        ⚡ Missions MID assignées !
                    </div>
                ) : (
                    <div className="text-sm text-gray-500">
                        Missions MID dans {formatRemaining(timeUntilMid)}
                    </div>
                )}

                {/* LATE */}
                {lateDelayPassed ? (
                    <div className="p-2 bg-red-100 text-red-800 rounded-lg text-sm font-medium">
                        🔥 Missions FINALE assignées !
                    </div>
                ) : midDelayPassed ? (
                    <div className="text-sm text-gray-500">
                        Missions FINALE dans {formatRemaining(timeUntilLate)}
                    </div>
                ) : null}
            </div>
        </div>
    );
}