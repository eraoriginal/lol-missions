'use client';

import { MissionCard } from './MissionCard';

interface ValidationSpectatorProps {
    room: any;
}

export function ValidationSpectator({ room }: ValidationSpectatorProps) {
    const players = room.players.filter((p: any) => p.missions.length > 0);

    // L'index du joueur courant vient directement du serveur via validationStatus
    // Format: "in_progress:0", "in_progress:1", etc.
    // Le spectateur ne décide jamais — il suit exactement ce que le créateur a confirmé
    let currentIndex = 0;
    if (room.validationStatus?.startsWith('in_progress:')) {
        currentIndex = parseInt(room.validationStatus.split(':')[1], 10);
    }
    // Clamp pour être safe
    if (currentIndex >= players.length) currentIndex = players.length - 1;

    const currentPlayer = players[currentIndex];

    // Joueurs avant le courant = déjà finalisés par le créateur
    const validatedPlayers = players.slice(0, currentIndex).map((p: any) => ({
        ...p,
        totalPoints: p.missions.reduce((sum: number, m: any) => sum + (m.pointsEarned || 0), 0),
    }));

    const startMission = currentPlayer?.missions.find((m: any) => m.type === 'START');
    const midMission = currentPlayer?.missions.find((m: any) => m.type === 'MID');
    const lateMission = currentPlayer?.missions.find((m: any) => m.type === 'LATE');

    const MissionRow = ({ pm, type }: { pm: any; type: string }) => (
        <div className="space-y-3">
            <MissionCard mission={pm.mission} type={type as any} showPoints={true} />
            <div className="flex gap-3 justify-center h-12 items-center">
                {pm.decided ? (
                    pm.validated ? (
                        <span className="px-6 py-3 rounded-lg font-semibold bg-green-600 border-2 border-green-400 text-white shadow-lg shadow-green-500/30">
                            ✅ Validée ({pm.mission.points} pts)
                        </span>
                    ) : (
                        <span className="px-6 py-3 rounded-lg font-semibold bg-red-600 border-2 border-red-400 text-white shadow-lg shadow-red-500/30">
                            ❌ Échouée
                        </span>
                    )
                ) : (
                    <span className="lol-text italic text-sm">En attente de décision...</span>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="lol-card rounded-lg p-6 text-center">
                <div className="text-4xl mb-2 animate-bounce">⏳</div>
                <h1 className="text-3xl font-bold lol-title-gold mb-1 uppercase tracking-wide">Validation en cours...</h1>
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

            {/* Current player */}
            {currentPlayer && (
                <div className="lol-card rounded-lg p-8 border-2 border-[#0AC8B9]/50 shadow-lg shadow-[#0AC8B9]/20">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        {currentPlayer.avatar ? (
                            <img
                                src={currentPlayer.avatar}
                                alt={currentPlayer.name}
                                className="w-16 h-16 rounded-full border-4 border-[#C8AA6E]"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-[#C8AA6E] to-[#785A28] rounded-full flex items-center justify-center text-[#010A13] font-bold text-2xl">
                                {currentPlayer.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <h2 className="text-3xl font-bold lol-text-light">{currentPlayer.name}</h2>
                    </div>

                    <div className="space-y-8">
                        {lateMission && <MissionRow pm={lateMission} type="LATE" />}
                        {midMission && <MissionRow pm={midMission} type="MID" />}
                        {startMission && <MissionRow pm={startMission} type="START" />}
                    </div>
                </div>
            )}

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
                                        {p.missions.filter((m: any) => m.validated).length}/{p.missions.length} ✓
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
