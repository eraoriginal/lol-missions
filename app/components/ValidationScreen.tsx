'use client';

import { useState } from 'react';
import { MissionCard } from './MissionCard';

interface ValidationScreenProps {
    room: any;
    roomCode: string;
}

export function ValidationScreen({ room, roomCode }: ValidationScreenProps) {
    const players = room.players.filter((p: any) => p.missions.length > 0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [localDecisions, setLocalDecisions] = useState<Record<string, Record<string, boolean>>>({});
    const [finishing, setFinishing] = useState(false);

    const player = players[currentIndex];
    const playerDecisions = localDecisions[player?.id] || {};

    const startMission = player?.missions.find((m: any) => m.type === 'START');
    const midMission = player?.missions.find((m: any) => m.type === 'MID');
    const lateMission = player?.missions.find((m: any) => m.type === 'LATE');

    const allDecided = player?.missions.every((m: any) => playerDecisions[m.type] !== undefined);

    const validatedPlayers = players.slice(0, currentIndex).map((p: any) => {
        const totalPoints = localDecisions[p.id]
            ? p.missions.reduce((sum: number, m: any) => {
                return sum + (localDecisions[p.id][m.type] ? m.mission.points : 0);
            }, 0)
            : 0;
        return { ...p, totalPoints };
    });

    // Envoie une décision immédiatement sur le serveur
    const sendDecision = async (type: string, validated: boolean) => {
        setLocalDecisions(prev => ({
            ...prev,
            [player.id]: { ...prev[player.id], [type]: validated },
        }));

        const creatorToken = localStorage.getItem(`room_${roomCode}_creator`);
        try {
            await fetch(`/api/rooms/${roomCode}/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creatorToken,
                    playerId: player.id,
                    validations: { [type]: validated },
                }),
            });
        } catch (e) {
            console.error('Erreur envoi validation:', e);
        }
    };

    // Avance au suivant ou termine — envoie le PATCH d'abord pour que les spectateurs
    // se synchronisent sur le bon index
    const goNext = async () => {
        setFinishing(true);
        const creatorToken = localStorage.getItem(`room_${roomCode}_creator`);

        try {
            if (currentIndex >= players.length - 1) {
                // Dernier joueur — termine la validation
                const res = await fetch(`/api/rooms/${roomCode}/validate`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ creatorToken }),
                });
                if (!res.ok) throw new Error('Finalisation échouée');
            } else {
                // Pas dernier joueur — PATCH pour avancer l'index
                const nextIndex = currentIndex + 1;
                const res = await fetch(`/api/rooms/${roomCode}/validate`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ creatorToken, currentPlayerIndex: nextIndex }),
                });
                if (!res.ok) throw new Error('Avancement échoué');
                // Seulement après confirmation du serveur, on change l'index local
                setCurrentIndex(nextIndex);
            }
        } catch (e) {
            console.error(e);
            alert('Erreur lors du passage au joueur suivant');
        }

        setFinishing(false);
    };

    const MissionRow = ({ pm, type }: { pm: any; type: string }) => (
        <div className="space-y-3">
            <MissionCard mission={pm.mission} type={type as any} showPoints={true} />
            <div className="flex gap-3 justify-center">
                <button
                    onClick={() => sendDecision(type, true)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        playerDecisions[type] === true
                            ? 'bg-green-600 text-white scale-105 shadow-lg'
                            : 'bg-white/20 text-white hover:bg-green-600/50'
                    }`}
                >
                    ✅ Validée ({pm.mission.points} pts)
                </button>
                <button
                    onClick={() => sendDecision(type, false)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        playerDecisions[type] === false
                            ? 'bg-red-600 text-white scale-105 shadow-lg'
                            : 'bg-white/20 text-white hover:bg-red-600/50'
                    }`}
                >
                    ❌ Échouée
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-4xl mb-2">✅</div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">Validation des missions</h1>
                <p className="text-gray-500">
                    Joueur <span className="font-bold text-gray-800">{currentIndex + 1}</span> / {players.length}
                </p>
                <div className="flex gap-2 justify-center mt-4">
                    {players.map((_: any, i: number) => (
                        <div
                            key={i}
                            className={`h-2 flex-1 rounded-full transition-all ${
                                i < currentIndex ? 'bg-green-500' :
                                    i === currentIndex ? 'bg-blue-500' :
                                        'bg-gray-200'
                            }`}
                        />
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/80 to-purple-900/80 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-white/20">
                <div className="flex items-center justify-center gap-4 mb-8">
                    {player?.avatar ? (
                        <img
                            src={player.avatar}
                            alt={player.name}
                            className="w-16 h-16 rounded-full border-4 border-white/30"
                        />
                    ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                            {player?.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <h2 className="text-3xl font-bold text-white">{player?.name}</h2>
                </div>

                <div className="space-y-8">
                    {lateMission && <MissionRow pm={lateMission} type="LATE" />}
                    {midMission && <MissionRow pm={midMission} type="MID" />}
                    {startMission && <MissionRow pm={startMission} type="START" />}
                </div>

                <div className="mt-10 flex justify-center">
                    <button
                        onClick={goNext}
                        disabled={!allDecided || finishing}
                        className="px-8 py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-bold text-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                    >
                        {finishing
                            ? '⏳ En cours...'
                            : currentIndex < players.length - 1
                                ? '➡️ Joueur suivant'
                                : '🏁 Terminer la validation'
                        }
                    </button>
                </div>
            </div>

            {validatedPlayers.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Joueurs validés</h3>
                    <div className="space-y-3">
                        {validatedPlayers.map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                    {p.avatar ? (
                                        <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full" />
                                    ) : (
                                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {p.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="font-semibold text-gray-800">{p.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-500">
                                        {p.missions.filter((m: any) => localDecisions[p.id]?.[m.type]).length}/{p.missions.length} ✓
                                    </span>
                                    <span className="font-bold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                                        {p.totalPoints} pts
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}