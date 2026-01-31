'use client';

import { useState } from 'react';
import { MissionCard } from './MissionCard';
import { Timer } from './Timer';
import { LeaveRoomButton } from './LeaveRoomButton';
import { StopGameButton } from '@/app/components/StopGameButton';
import { GameEndScreen } from '@/app/components/GameEndScreen';
import { OtherPlayersMissions } from '@/app/components/OtherPlayersMissions';

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

    const playerToken = typeof window !== 'undefined'
        ? localStorage.getItem(`room_${roomCode}_player`)
        : null;

    const creatorToken = typeof window !== 'undefined'
        ? localStorage.getItem(`room_${roomCode}_creator`)
        : null;

    const isCreator = !!creatorToken;
    const currentPlayer = room.players.find((p: any) => p.token === playerToken);

    if (room.gameStopped) {
        return <GameEndScreen room={room} roomCode={roomCode} isCreator={isCreator} />;
    }

    const startMission = currentPlayer?.missions.find((m: any) => m.type === 'START');
    const midMission = currentPlayer?.missions.find((m: any) => m.type === 'MID');
    const lateMission = currentPlayer?.missions.find((m: any) => m.type === 'LATE');

    const handleLaunch = async () => {
        if (!creatorToken) return;
        setLaunching(true);
        setLaunchError(null);

        try {
            const res = await fetch(`/api/rooms/${roomCode}/launch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorToken }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur');
            }
            // Le polling détectera gameStartTime != null
        } catch (err) {
            setLaunchError(err instanceof Error ? err.message : 'Erreur');
            setLaunching(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-center">
                    <div className="flex-1 text-center">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            🎮 Partie en cours
                        </h1>
                        <p className="text-gray-600">
                            Room: <span className="font-mono font-bold">{roomCode}</span>
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {isCreator && room.gameStartTime && <StopGameButton roomCode={roomCode} />}
                        <LeaveRoomButton roomCode={roomCode} />
                    </div>
                </div>
            </div>

            {/* Timer ou écran d'attente selon gameStartTime */}
            {room.gameStartTime ? (
                <Timer
                    gameStartTime={room.gameStartTime}
                    roomCode={roomCode}
                    gameStopped={room.gameStopped}
                    midMissionDelay={room.midMissionDelay}
                    lateMissionDelay={room.lateMissionDelay}
                />
            ) : (
                <div className="bg-gradient-to-br from-blue-900/80 to-purple-900/80 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-white/20 text-center">
                    <div className="text-5xl mb-4">⏳</div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Préparez-vous !
                    </h2>
                    <p className="text-white/60 mb-6">
                        Regardez vos missions ci-dessous. Le compteur démarrera quand le créateur sera prêt.
                    </p>

                    {isCreator ? (
                        <div className="space-y-3">
                            <button
                                onClick={handleLaunch}
                                disabled={launching}
                                className="px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 shadow-lg"
                            >
                                {launching ? '⏳ Démarrage...' : '▶️ Lancer le compteur'}
                            </button>
                            {launchError && (
                                <p className="text-red-300 text-sm">{launchError}</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-white/40 italic">
                            En attente que le créateur lance le compteur...
                        </p>
                    )}
                </div>
            )}

            {/* Missions — ordre inversé : LATE → MID → START */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white text-center mb-6">
                    Tes missions
                </h2>

                {lateMission ? (
                    <div className="relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                            <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                🔥 MISSION FINALE
                            </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-orange-400 to-red-400 rounded-xl opacity-20 blur-xl animate-pulse"></div>
                        <div className="relative transform hover:scale-105 transition-transform">
                            <MissionCard mission={lateMission.mission} type="LATE" showPoints={true} />
                        </div>
                    </div>
                ) : midMission ? (
                    <div className="bg-gradient-to-br from-red-900/50 to-orange-900/50 backdrop-blur-lg rounded-xl p-6 text-center text-white border-2 border-red-500/30">
                        <div className="text-4xl mb-3">🔥</div>
                        <p className="text-lg font-semibold">
                            Ta mission FINALE apparaîtra bientôt...
                        </p>
                    </div>
                ) : null}

                {midMission ? (
                    <div className="relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                            <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                ⚡ NOUVELLE MISSION
                            </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 rounded-xl opacity-20 blur-xl animate-pulse"></div>
                        <div className="relative transform hover:scale-105 transition-transform">
                            <MissionCard mission={midMission.mission} type="MID" showPoints={true} />
                        </div>
                    </div>
                ) : (
                    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg rounded-xl p-6 text-center text-white border-2 border-purple-500/30">
                        <div className="text-4xl mb-3">⏳</div>
                        <p className="text-lg font-semibold">
                            Ta mission MID apparaîtra dans...
                        </p>
                        <p className="text-3xl font-bold mt-2 text-purple-300">
                            {Math.round(room.midMissionDelay / 60)}min
                        </p>
                    </div>
                )}

                {startMission && (
                    <div className="opacity-90">
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