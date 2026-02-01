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
            await fetch(`/api/games/aram-missions/${roomCode}/validate`, {
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
                const res = await fetch(`/api/games/aram-missions/${roomCode}/validate`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ creatorToken }),
                });
                if (!res.ok) throw new Error('Finalisation échouée');
            } else {
                // Pas dernier joueur — PATCH pour avancer l'index
                const nextIndex = currentIndex + 1;
                const res = await fetch(`/api/games/aram-missions/${roomCode}/validate`, {
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
                    className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 ${
                        playerDecisions[type] === true
                            ? 'bg-green-600 border-green-400 text-white scale-105 shadow-lg shadow-green-500/30'
                            : 'bg-[#1E2328] border-[#C8AA6E]/30 text-[#C89B3C] hover:bg-green-900/50 hover:border-green-500/50'
                    }`}
                >
                    ✅ Validée ({pm.mission.points} pts)
                </button>
                <button
                    onClick={() => sendDecision(type, false)}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all border-2 ${
                        playerDecisions[type] === false
                            ? 'bg-red-600 border-red-400 text-white scale-105 shadow-lg shadow-red-500/30'
                            : 'bg-[#1E2328] border-[#C8AA6E]/30 text-[#C89B3C] hover:bg-red-900/50 hover:border-red-500/50'
                    }`}
                >
                    ❌ Échouée
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="lol-card rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">⚖️</div>
                <h1 className="text-3xl font-bold lol-title-gold mb-1 uppercase tracking-wide">Validation des missions</h1>
                <p className="lol-text">
                    Invocateur <span className="font-bold lol-text-gold">{currentIndex + 1}</span> / {players.length}
                </p>
                <div className="flex gap-2 justify-center mt-4">
                    {players.map((_: any, i: number) => (
                        <div
                            key={i}
                            className={`h-2 flex-1 rounded-full transition-all ${
                                i < currentIndex ? 'bg-[#C8AA6E]' :
                                    i === currentIndex ? 'bg-[#0AC8B9]' :
                                        'bg-[#1E2328]'
                            }`}
                        />
                    ))}
                </div>
            </div>

            {/* Current player validation */}
            <div className="lol-card rounded-lg p-8 border-2 border-[#0AC8B9]/50 shadow-lg shadow-[#0AC8B9]/20">
                <div className="flex items-center justify-center gap-4 mb-8">
                    {player?.avatar ? (
                        <img
                            src={player.avatar}
                            alt={player.name}
                            className="w-16 h-16 rounded-full border-4 border-[#C8AA6E]"
                        />
                    ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-[#C8AA6E] to-[#785A28] rounded-full flex items-center justify-center text-[#010A13] font-bold text-2xl">
                            {player?.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <h2 className="text-3xl font-bold lol-text-light">{player?.name}</h2>
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
                        className="lol-button-hextech px-8 py-4 rounded-lg font-bold text-lg transition-all hextech-pulse disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {finishing
                            ? '⏳ En cours...'
                            : currentIndex < players.length - 1
                                ? '➡️ Invocateur suivant'
                                : '🏁 Terminer la validation'
                        }
                    </button>
                </div>
            </div>

            {/* Validated players list */}
            {validatedPlayers.length > 0 && (
                <div className="lol-card rounded-lg p-6">
                    <h3 className="text-lg font-bold lol-title-gold mb-4">📊 Invocateurs validés</h3>
                    <div className="space-y-3">
                        {validatedPlayers.map((p: any) => (
                            <div key={p.id} className="flex items-center justify-between bg-[#010A13]/50 rounded-lg p-3 border border-[#C8AA6E]/20">
                                <div className="flex items-center gap-3">
                                    {p.avatar ? (
                                        <img src={p.avatar} alt={p.name} className="w-9 h-9 rounded-full border border-[#C8AA6E]" />
                                    ) : (
                                        <div className="w-9 h-9 bg-gradient-to-br from-[#C8AA6E] to-[#785A28] rounded-full flex items-center justify-center text-[#010A13] font-bold text-sm">
                                            {p.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="font-semibold lol-text-light">{p.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm lol-text">
                                        {p.missions.filter((m: any) => localDecisions[p.id]?.[m.type]).length}/{p.missions.length} ✓
                                    </span>
                                    <span className="font-bold lol-text-gold bg-[#C8AA6E]/20 px-3 py-1 rounded-full border border-[#C8AA6E]/50">
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
