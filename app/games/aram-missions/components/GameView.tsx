'use client';

import { useState, useEffect, useRef } from 'react';
import { MissionCard } from './MissionCard';
import { OtherPlayersMissions } from './OtherPlayersMissions';
import { Timer } from '@/app/components/Timer';
import { LeaveRoomButton } from '@/app/components/LeaveRoomButton';
import { StopGameButton } from '@/app/components/StopGameButton';
import { GameEndScreen } from '@/app/components/GameEndScreen';

interface Room {
    id: string;
    code: string;
    gameStartTime: string | null;
    gameStopped: boolean;
    midMissionDelay: number;
    lateMissionDelay: number;
    players: any[];
}

interface GameViewProps {
    room: Room;
    roomCode: string;
}

export function GameView({ room, roomCode }: GameViewProps) {
    const [launching, setLaunching] = useState(false);
    const [launchError, setLaunchError] = useState<string | null>(null);
    const [voicesReady, setVoicesReady] = useState(false);

    const midAnnoncedRef = useRef(false);
    const lateAnnoncedRef = useRef(false);
    const prevGameStartTimeRef = useRef<string | null>(null);
    const gameStoppedRef = useRef(false);

    const playerToken = typeof window !== 'undefined'
        ? localStorage.getItem(`room_${roomCode}_player`)
        : null;

    const creatorToken = typeof window !== 'undefined'
        ? localStorage.getItem(`room_${roomCode}_creator`)
        : null;

    const isCreator = !!creatorToken;
    const currentPlayer = room.players.find((p: any) => p.token === playerToken);

    const startMission = currentPlayer?.missions.find((m: any) => m.type === 'START');
    const midMission = currentPlayer?.missions.find((m: any) => m.type === 'MID');
    const lateMission = currentPlayer?.missions.find((m: any) => m.type === 'LATE');

    // Track gameStopped state
    useEffect(() => {
        gameStoppedRef.current = room.gameStopped;
    }, [room.gameStopped]);

    // Initialiser les voix du speechSynthesis
    useEffect(() => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        const checkVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                setVoicesReady(true);
                console.log('[GameView] Voix chargées:', voices.length);
            }
        };

        // Vérifier immédiatement
        checkVoices();

        // Écouter l'événement voiceschanged (nécessaire sur certains navigateurs)
        window.speechSynthesis.addEventListener('voiceschanged', checkVoices);

        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', checkVoices);
        };
    }, []);

    // Réinitialiser les refs TTS quand une nouvelle partie commence
    useEffect(() => {
        if (room.gameStartTime && room.gameStartTime !== prevGameStartTimeRef.current) {
            console.log('[GameView] Nouvelle partie détectée, réinitialisation TTS');
            prevGameStartTimeRef.current = room.gameStartTime;
            midAnnoncedRef.current = false;
            lateAnnoncedRef.current = false;
        }
    }, [room.gameStartTime]);

    // Annoncer les missions via TTS - SEULEMENT si le jeu n'est pas arrêté
    useEffect(() => {
        // Ne pas déclencher le TTS si le jeu est arrêté
        if (room.gameStopped) {
            console.log('[GameView] Jeu arrêté, TTS désactivé');
            return;
        }

        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
        if (!voicesReady) {
            console.log('[GameView] Voix pas encore prêtes, TTS reporté');
            return;
        }

        const announce = (text: string) => {
            // Double vérification que le jeu n'est pas arrêté
            if (gameStoppedRef.current) {
                console.log('[GameView] TTS annulé - jeu arrêté');
                return;
            }

            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'fr-FR';
            utterance.rate = 1;
            utterance.volume = 0.9;

            // Trouver une voix française si disponible
            const voices = window.speechSynthesis.getVoices();
            const frenchVoice = voices.find(v => v.lang.startsWith('fr'));
            if (frenchVoice) {
                utterance.voice = frenchVoice;
            }

            window.speechSynthesis.speak(utterance);
            console.log('[GameView] Annonce vocale :', text);
        };

        if (midMission && !midAnnoncedRef.current) {
            midAnnoncedRef.current = true;
            const prefix = midMission.mission.isPrivate ? 'Mission secrète : ' : '';
            console.log('[GameView] Déclenchement TTS MID');
            announce(prefix + midMission.mission.text);
        }

        if (lateMission && !lateAnnoncedRef.current) {
            lateAnnoncedRef.current = true;
            const prefix = lateMission.mission.isPrivate ? 'Mission secrète : ' : '';
            console.log('[GameView] Déclenchement TTS LATE');
            announce(prefix + lateMission.mission.text);
        }
    }, [midMission, lateMission, voicesReady, room.gameStopped]);

    // Si le jeu est arrêté, afficher l'écran de fin
    if (room.gameStopped) {
        return <GameEndScreen room={room} roomCode={roomCode} isCreator={isCreator} />;
    }

    const handleLaunch = async () => {
        if (!creatorToken) return;
        setLaunching(true);
        setLaunchError(null);

        try {
            const res = await fetch(`/api/games/aram-missions/${roomCode}/launch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorToken }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur');
            }
        } catch (err) {
            setLaunchError(err instanceof Error ? err.message : 'Erreur');
            setLaunching(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="lol-card rounded-lg p-6">
                <div className="flex justify-between items-center">
                    <div className="flex-1 text-center">
                        <h1 className="text-3xl font-bold lol-title mb-2">
                            <span className="lol-title-gold">⚔️ Combat</span> en cours
                        </h1>
                        <p className="lol-text">
                            Room : <span className="font-mono font-bold lol-text-gold">{roomCode}</span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {isCreator && room.gameStartTime && <StopGameButton roomCode={roomCode} />}
                        <LeaveRoomButton roomCode={roomCode} />
                    </div>
                </div>
            </div>

            {/* Timer ou écran d'attente */}
            {room.gameStartTime ? (
                <Timer
                    gameStartTime={room.gameStartTime}
                    roomCode={roomCode}
                    gameStopped={room.gameStopped}
                    midMissionDelay={room.midMissionDelay}
                    lateMissionDelay={room.lateMissionDelay}
                />
            ) : (
                <div className="lol-card rounded-lg p-8 text-center">
                    <div className="text-5xl mb-4">⏳</div>
                    <h2 className="text-2xl font-bold lol-title-gold mb-2">
                        Préparez-vous, invocateurs !
                    </h2>
                    <p className="lol-text mb-6">
                        Consultez vos missions ci-dessous. Le combat démarrera quand le créateur sera prêt.
                    </p>

                    {isCreator ? (
                        <div className="space-y-3">
                            <button
                                onClick={handleLaunch}
                                disabled={launching}
                                className="lol-button-hextech px-10 py-4 rounded-lg font-bold text-xl transition-all hextech-pulse"
                            >
                                {launching ? '⏳ Préparation...' : '▶️ LANCER LE COMBAT'}
                            </button>
                            {launchError && (
                                <p className="text-red-400 text-sm">{launchError}</p>
                            )}
                        </div>
                    ) : (
                        <p className="lol-text italic">
                            En attente que le créateur lance le combat...
                        </p>
                    )}
                </div>
            )}

            {/* Missions */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold lol-title-gold text-center mb-6">
                    📜 Tes missions
                </h2>

                {lateMission ? (
                    <div className="relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                            <span className="bg-gradient-to-r from-red-600 to-red-800 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg shadow-red-500/50 animate-pulse uppercase tracking-wide">
                                🔥 Mission Finale
                            </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-lg opacity-20 blur-xl animate-pulse"></div>
                        <div className="relative transform hover:scale-[1.02] transition-transform">
                            <MissionCard mission={lateMission.mission} type="LATE" showPoints={true} />
                        </div>
                    </div>
                ) : midMission ? (
                    <div className="lol-card rounded-lg p-6 text-center border-2 border-red-500/30">
                        <div className="text-4xl mb-3">🔥</div>
                        <p className="text-lg font-semibold text-red-400">
                            Ta mission FINALE apparaîtra bientôt...
                        </p>
                    </div>
                ) : null}

                {midMission ? (
                    <div className="relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                            <span className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg shadow-purple-500/50 animate-pulse uppercase tracking-wide">
                                ⚡ Nouvelle Mission
                            </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-lg opacity-20 blur-xl animate-pulse"></div>
                        <div className="relative transform hover:scale-[1.02] transition-transform">
                            <MissionCard mission={midMission.mission} type="MID" showPoints={true} />
                        </div>
                    </div>
                ) : (
                    <div className="lol-card rounded-lg p-6 text-center border-2 border-purple-500/30">
                        <div className="text-4xl mb-3">⏳</div>
                        <p className="text-lg font-semibold text-purple-400">
                            Ta mission MID apparaîtra dans...
                        </p>
                        <p className="text-3xl font-bold mt-2 lol-title-gold">
                            {Math.round(room.midMissionDelay / 60)}min
                        </p>
                    </div>
                )}

                {startMission && (
                    <div className="opacity-90 transform hover:scale-[1.02] transition-transform">
                        <MissionCard mission={startMission.mission} type="START" showPoints={true} />
                    </div>
                )}
            </div>

            {/* Missions des autres joueurs */}
            <OtherPlayersMissions
                players={room.players}
                currentPlayerToken={playerToken}
            />
        </div>
    );
}
