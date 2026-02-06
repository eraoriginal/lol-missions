'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import type { RoomEvent } from '@/app/types/room';

interface TimerProps {
    gameStartTime: string;
    roomCode: string;
    gameStopped?: boolean;
    midMissionDelay: number;
    lateMissionDelay: number;
    maxEventsPerGame?: number;
    roomEvents?: RoomEvent[];
}

export function Timer({ gameStartTime, roomCode, gameStopped = false, midMissionDelay, lateMissionDelay, maxEventsPerGame = 0, roomEvents }: TimerProps) {
    const [elapsed, setElapsed] = useState(0);

    // Utiliser des refs pour éviter les problèmes de closure dans l'interval
    const midMissionsCheckedRef = useRef(false);
    const lateMissionsCheckedRef = useRef(false);
    const midSoundPlayedRef = useRef(false);
    const lateSoundPlayedRef = useRef(false);
    const prevGameStartTimeRef = useRef<string | null>(null);
    const lastEventCheckRef = useRef(0);

    const playSound = useCallback((type: 'mid' | 'late') => {
        const audioFile = type === 'mid'
            ? '/sounds/allo.mp3'
            : '/sounds/allons_y.mp3';

        console.log('[Timer] Playing sound:', audioFile);

        const audio = new Audio(audioFile);
        audio.volume = 0.7;

        audio.play()
            .then(() => console.log('[Timer] Audio playing'))
            .catch(err => console.error('[Timer] Audio play failed:', err));
    }, []);

    const checkMidMissions = useCallback(async () => {
        console.log(`[Timer] MID reached — calling check-mid-missions`);
        try {
            const res = await fetch(`/api/games/aram-missions/${roomCode}/check-mid-missions`, { method: 'POST' });
            const data = await res.json();
            console.log('[Timer] check-mid-missions response:', data);
        } catch (err) {
            console.error('[Timer] check-mid-missions error:', err);
            midMissionsCheckedRef.current = false;
        }
    }, [roomCode]);

    const checkLateMissions = useCallback(async () => {
        console.log(`[Timer] LATE reached — calling check-late-missions`);
        try {
            const res = await fetch(`/api/games/aram-missions/${roomCode}/check-late-missions`, { method: 'POST' });
            const data = await res.json();
            console.log('[Timer] check-late-missions response:', data);
        } catch (err) {
            console.error('[Timer] check-late-missions error:', err);
            lateMissionsCheckedRef.current = false;
        }
    }, [roomCode]);

    const checkEvents = useCallback(async () => {
        console.log(`[Timer] Checking events`);
        try {
            const res = await fetch(`/api/games/aram-missions/${roomCode}/check-events`, { method: 'POST' });
            const data = await res.json();
            console.log('[Timer] check-events response:', data);
        } catch (err) {
            console.error('[Timer] check-events error:', err);
        }
    }, [roomCode]);

    // Réinitialiser les refs quand une nouvelle partie commence
    useEffect(() => {
        if (gameStartTime && gameStartTime !== prevGameStartTimeRef.current) {
            console.log('[Timer] Nouvelle partie détectée, réinitialisation des refs');
            prevGameStartTimeRef.current = gameStartTime;
            midMissionsCheckedRef.current = false;
            lateMissionsCheckedRef.current = false;
            midSoundPlayedRef.current = false;
            lateSoundPlayedRef.current = false;
            lastEventCheckRef.current = 0;
            setElapsed(0);
        }
    }, [gameStartTime]);

    useEffect(() => {
        if (gameStopped) {
            console.log('[Timer] Game stopped, not starting interval');
            return;
        }

        const startTime = new Date(gameStartTime).getTime();
        console.log('[Timer] Starting interval, startTime:', gameStartTime);

        const interval = setInterval(() => {
            const now = Date.now();
            const diff = now - startTime;
            const elapsedSeconds = Math.floor(diff / 1000);
            setElapsed(elapsedSeconds);

            // Check MID missions
            if (diff >= midMissionDelay * 1000) {
                if (!midSoundPlayedRef.current) {
                    console.log('[Timer] MID reached — playing sound');
                    playSound('mid');
                    midSoundPlayedRef.current = true;
                }
                if (!midMissionsCheckedRef.current) {
                    midMissionsCheckedRef.current = true;
                    checkMidMissions();
                }
            }

            // Check LATE missions
            if (diff >= lateMissionDelay * 1000) {
                if (!lateSoundPlayedRef.current) {
                    console.log('[Timer] LATE reached — playing sound');
                    playSound('late');
                    lateSoundPlayedRef.current = true;
                }
                if (!lateMissionsCheckedRef.current) {
                    lateMissionsCheckedRef.current = true;
                    checkLateMissions();
                }
            }

            // Check events
            if (maxEventsPerGame > 0 && elapsedSeconds >= 30) {
                const dueEvent = roomEvents?.find(re => re.scheduledAt <= elapsedSeconds && !re.appearedAt);
                if (dueEvent && lastEventCheckRef.current < elapsedSeconds) {
                    lastEventCheckRef.current = elapsedSeconds;
                    checkEvents();
                }
            }
        }, 1000);

        return () => {
            console.log('[Timer] Clearing interval');
            clearInterval(interval);
        };
    }, [gameStartTime, gameStopped, midMissionDelay, lateMissionDelay, maxEventsPerGame, roomEvents, playSound, checkMidMissions, checkLateMissions, checkEvents]);

    const midDelayPassed = elapsed >= midMissionDelay;
    const lateDelayPassed = elapsed >= lateMissionDelay;

    // Décompte vers la prochaine mission
    let countdown: number;
    let nextMissionLabel: string;
    let nextMissionEmoji: string;
    let countdownColor: string;

    if (!midDelayPassed) {
        countdown = Math.max(0, midMissionDelay - elapsed);
        nextMissionLabel = 'Mission MID';
        nextMissionEmoji = '⚡';
        countdownColor = '';
    } else if (!lateDelayPassed) {
        countdown = Math.max(0, lateMissionDelay - elapsed);
        nextMissionLabel = 'Mission Finale';
        nextMissionEmoji = '🔥';
        countdownColor = 'border-2 border-purple-500 shadow-lg shadow-purple-500/30';
    } else {
        countdown = 0;
        nextMissionLabel = '';
        nextMissionEmoji = '';
        countdownColor = 'border-2 border-red-500 shadow-lg shadow-red-500/30';
    }

    const countdownMinutes = Math.floor(countdown / 60);
    const countdownSeconds = countdown % 60;

    return (
        <div className={`lol-card rounded-lg p-6 text-center transition-all duration-300 ${countdownColor}`}>
            {lateDelayPassed ? (
                <>
                    <h3 className="text-lg font-semibold text-red-400 mb-2 uppercase tracking-wider">
                        🔥 Toutes les missions débloquées
                    </h3>
                    <div className="text-3xl font-bold text-red-400 font-mono">
                        00:00
                    </div>
                </>
            ) : (
                <>
                    <h3 className="text-lg font-semibold lol-text-gold mb-2 uppercase tracking-wider">
                        {nextMissionEmoji} {nextMissionLabel} dans
                    </h3>
                    <div className="text-5xl font-bold lol-title-gold mb-2 font-mono">
                        {String(countdownMinutes).padStart(2, '0')}:{String(countdownSeconds).padStart(2, '0')}
                    </div>
                </>
            )}

            <div className="space-y-2 mt-4">
                {midDelayPassed && (
                    <div className="p-2 bg-purple-900/50 border border-purple-500 text-purple-300 rounded-lg text-sm font-medium">
                        ⚡ Missions MID débloquées !
                    </div>
                )}
                {lateDelayPassed && (
                    <div className="p-2 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-sm font-medium">
                        🔥 Missions FINALE débloquées !
                    </div>
                )}
            </div>
        </div>
    );
}
