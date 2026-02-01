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
    const otherPlayers = players.filter((p: any) => p.token !== currentPlayerToken);

    if (otherPlayers.length === 0) {
        return null;
    }

    return (
        <div className="lol-card rounded-lg p-6">
            <h3 className="text-xl font-bold lol-title-gold mb-4 flex items-center gap-2">
                👥 Missions des alliés
            </h3>

            <div className="space-y-4">
                {otherPlayers.map((player: any) => {
                    if (player.missions.length === 0) {
                        return null;
                    }

                    return (
                        <div key={player.id} className="bg-[#010A13]/50 rounded-lg p-4 border border-[#C8AA6E]/20">
                            {/* Header joueur */}
                            <div className="flex items-center gap-3 mb-3">
                                {player.avatar ? (
                                    <img
                                        src={player.avatar}
                                        alt={player.name}
                                        className="w-10 h-10 rounded-full border-2 border-[#C8AA6E]"
                                    />
                                ) : (
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#0AC8B9] to-[#0397AB] rounded-full flex items-center justify-center text-[#010A13] font-bold border-2 border-[#C8AA6E]">
                                        {player.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="font-semibold lol-text-light">{player.name}</span>
                            </div>

                            {/* Missions */}
                            <div className="space-y-2">
                                {player.missions.map((pm: PlayerMission) => (
                                    <div
                                        key={pm.mission.id}
                                        className={`rounded-lg p-3 text-sm ${
                                            pm.mission.isPrivate
                                                ? 'bg-purple-900/30 border-2 border-purple-500/50'
                                                : 'bg-[#1E2328] border border-[#C8AA6E]/20'
                                        }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            <span className="text-lg flex-shrink-0">
                                                {pm.mission.isPrivate ? '🔒' : (
                                                    pm.type === 'START' ? '⚔️' :
                                                        pm.type === 'MID' ? '⚡' : '🔥'
                                                )}
                                            </span>
                                            <p className="lol-text-light flex-1">
                                                {pm.mission.isPrivate ? (
                                                    <span className="italic text-purple-300">
                                                        ⚠️ <strong>Attention !</strong> Cet invocateur a reçu une mission secrète !
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
