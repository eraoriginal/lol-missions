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
                        <span className="px-6 py-3 rounded-lg font-semibold bg-green-600 text-white shadow-lg">
                            ✅ Validée ({pm.mission.points} pts)
                        </span>
                    ) : (
                        <span className="px-6 py-3 rounded-lg font-semibold bg-red-600 text-white shadow-lg">
                            ❌ Échouée
                        </span>
                    )
                ) : (
                    <span className="text-white/40 italic text-sm">En attente de décision...</span>
                )}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <div className="text-4xl mb-2 animate-bounce">⏳</div>
                <h1 className="text-3xl font-bold text-gray-800 mb-1">Validation en cours...</h1>
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

            {currentPlayer && (
                <div className="bg-gradient-to-br from-blue-900/80 to-purple-900/80 backdrop-blur-lg rounded-xl shadow-lg p-8 border border-white/20">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        {currentPlayer.avatar ? (
                            <img
                                src={currentPlayer.avatar}
                                alt={currentPlayer.name}
                                className="w-16 h-16 rounded-full border-4 border-white/30"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                                {currentPlayer.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <h2 className="text-3xl font-bold text-white">{currentPlayer.name}</h2>
                    </div>

                    <div className="space-y-8">
                        {lateMission && <MissionRow pm={lateMission} type="LATE" />}
                        {midMission && <MissionRow pm={midMission} type="MID" />}
                        {startMission && <MissionRow pm={startMission} type="START" />}
                    </div>
                </div>
            )}

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
                                        {p.missions.filter((m: any) => m.validated).length}/{p.missions.length} ✓
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