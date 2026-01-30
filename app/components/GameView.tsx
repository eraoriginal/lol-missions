'use client';

import { MissionCard } from './MissionCard';
import { Timer } from './Timer';
import { LeaveRoomButton } from './LeaveRoomButton';
import {StopGameButton} from "@/app/components/StopGameButton";
import {GameEndScreen} from "@/app/components/GameEndScreen";
import {OtherPlayersMissions} from "@/app/components/OtherPlayersMissions";

interface Room {
    id: string;
    code: string;
    gameStartTime: string | null;
    gameStopped: boolean;
    players: any[];
}

interface GameViewProps {
    room: Room;
    roomCode: string;
}

export function GameView({ room, roomCode }: GameViewProps) {
    const playerToken = typeof window !== 'undefined'
        ? localStorage.getItem(`room_${roomCode}_player`)
        : null;

    const creatorToken = typeof window !== 'undefined'
        ? localStorage.getItem(`room_${roomCode}_creator`)
        : null;

    const isCreator = !!creatorToken;

    const currentPlayer = room.players.find((p) => p.token === playerToken);

    // 🆕 Si la partie est stoppée, affiche l'écran de fin
    if (room.gameStopped) {
        return <GameEndScreen room={room} roomCode={roomCode} isCreator={isCreator} />;
    }

    const startMission = currentPlayer?.missions.find((m: any) => m.type === 'START');
    const midMission = currentPlayer?.missions.find((m: any) => m.type === 'MID');
    const lateMission = currentPlayer?.missions.find((m: any) => m.type === 'LATE');

    // Garde pour vérifier que gameStartTime existe
    if (!room.gameStartTime) {
        return (
            <div className="text-center text-white text-2xl">
                Erreur : La partie n'a pas de temps de démarrage
            </div>
        );
    }

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
                        {isCreator && <StopGameButton roomCode={roomCode} />}
                        <LeaveRoomButton roomCode={roomCode} />
                    </div>
                </div>
            </div>

            {/* Timer */}
            <Timer
                gameStartTime={room.gameStartTime}
                roomCode={roomCode}
                gameStopped={room.gameStopped}
            />

            {/* Missions - ORDRE INVERSÉ : LATE → MID → START */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white text-center mb-6">
                    Tes missions
                </h2>

                {/* 🔥 Mission LATE en premier (si elle existe) */}
                {lateMission ? (
                    <div className="relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
              <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                🔥 MISSION FINALE
              </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400 via-orange-400 to-red-400 rounded-xl opacity-20 blur-xl animate-pulse"></div>
                        <div className="relative transform hover:scale-105 transition-transform">
                            <MissionCard mission={lateMission.mission} type="LATE" />
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

                {/* ⚡ Mission MID en deuxième (si elle existe) */}
                {midMission ? (
                    <div className="relative">
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
              <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
                ⚡ NOUVELLE MISSION
              </span>
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 rounded-xl opacity-20 blur-xl animate-pulse"></div>
                        <div className="relative transform hover:scale-105 transition-transform">
                            <MissionCard mission={midMission.mission} type="MID" />
                        </div>
                    </div>
                ) : (
                    <div className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-lg rounded-xl p-6 text-center text-white border-2 border-purple-500/30">
                        <div className="text-4xl mb-3">⏳</div>
                        <p className="text-lg font-semibold">
                            Ta mission MID apparaîtra dans...
                        </p>
                        <p className="text-3xl font-bold mt-2 text-purple-300">
                            {process.env.NEXT_PUBLIC_MID_MISSION_DELAY || '300'} secondes
                        </p>
                    </div>
                )}

                {/* 🎯 Mission START en dernier (toujours en bas) */}
                {startMission && (
                    <div className="opacity-90">
                        <MissionCard mission={startMission.mission} type="START" />
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