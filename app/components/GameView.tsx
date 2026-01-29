'use client';

import { PlayerList } from './PlayerList';
import { MissionCard } from './MissionCard';
import { Timer } from './Timer';
import type { Room } from '@/app/types/room';

interface GameViewProps {
    room: Room;
    roomCode: string;
}

export function GameView({ room, roomCode }: GameViewProps) {
    // Récupère le token du joueur actuel
    const playerToken = typeof window !== 'undefined'
        ? localStorage.getItem(`room_${roomCode}_player`)
        : null;

    // Trouve le joueur actuel
    const currentPlayer = room.players.find((p) => p.token === playerToken);

    // Missions du joueur actuel
    const startMission = currentPlayer?.missions.find((m: any) => m.type === 'START');
    const midMission = currentPlayer?.missions.find((m: any) => m.type === 'MID');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    🎮 Partie en cours
                </h1>
                <p className="text-gray-600">
                    Room: <span className="font-mono font-bold">{roomCode}</span>
                </p>
            </div>

            {/* Timer */}
            <Timer gameStartTime={room.gameStartTime} roomCode={roomCode} />

            {/* Missions */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white text-center">
                    Tes missions
                </h2>

                {startMission && (
                    <MissionCard mission={startMission.mission} type="START" />
                )}

                {midMission ? (
                    <MissionCard mission={midMission.mission} type="MID" />
                ) : (
                    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center text-white">
                        <p className="text-lg">
                            ⏳ Ta mission MID apparaîtra après 5 minutes de jeu
                        </p>
                    </div>
                )}
            </div>

            {/* Players */}
            <PlayerList players={room.players} currentPlayerToken={playerToken} />
        </div>
    );
}