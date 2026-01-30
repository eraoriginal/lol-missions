'use client';

interface Mission {
    id: string;
    text: string;
    type: string;
    isPrivate: boolean;
}

interface PlayerMission {
    mission: Mission;
    type: string;
}

interface Player {
    id: string;
    name: string;
    avatar: string;
    missions: PlayerMission[];
}

interface OtherPlayersMissionsProps {
    players: Player[];
    currentPlayerToken: string | null;
}

export function OtherPlayersMissions({ players, currentPlayerToken }: OtherPlayersMissionsProps) {
    // Filtre pour exclure le joueur actuel
    const otherPlayers = players.filter((p: any) => p.token !== currentPlayerToken);

    if (otherPlayers.length === 0) {
        return null;
    }

    return (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                👥 Missions des autres joueurs
            </h3>

            <div className="space-y-4">
                {otherPlayers.map((player: any) => {
                    if (player.missions.length === 0) {
                        return null;
                    }

                    return (
                        <div key={player.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                            {/* Header joueur */}
                            <div className="flex items-center gap-3 mb-3">
                                {player.avatar ? (
                                    <img
                                        src={player.avatar}
                                        alt={player.name}
                                        className="w-10 h-10 rounded-full border-2 border-white/30"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                        {player.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="font-semibold text-white">{player.name}</span>
                            </div>

                            {/* Missions */}
                            <div className="space-y-2">
                                {player.missions.map((pm: PlayerMission) => (
                                    <div
                                        key={pm.mission.id}
                                        className={`rounded-lg p-3 text-sm ${
                                            pm.mission.isPrivate
                                                ? 'bg-purple-900/30 border-2 border-purple-400/50'
                                                : 'bg-white/10'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className="text-lg flex-shrink-0">
                                                {pm.mission.isPrivate ? '🔒' : (
                                                    pm.type === 'START' ? '🎯' :
                                                        pm.type === 'MID' ? '⚡' : '🔥'
                                                )}
                                            </span>
                                            <p className="text-white/90 flex-1">
                                                {pm.mission.isPrivate ? (
                                                    <span className="italic">
                                                        ⚠️ <strong>Attention !</strong> Ce joueur a reçu une mission secrète !
                                                    </span>
                                                ) : (
                                                    pm.mission.text
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}