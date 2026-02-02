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

    const playersWithMissions = otherPlayers.filter((p: any) => p.missions.length > 0);

    if (playersWithMissions.length === 0) {
        return null;
    }

    const getMissionIcon = (pm: PlayerMission) => {
        if (pm.mission.isPrivate) return '🔒';
        if (pm.type === 'START') return '⚔️';
        if (pm.type === 'MID') return '⚡';
        return '🔥';
    };

    const getMissionText = (pm: PlayerMission) => {
        if (pm.mission.isPrivate) {
            return <span className="italic text-purple-300">Mission secrète</span>;
        }
        return pm.mission.text;
    };

    return (
        <div className="lol-card rounded-lg p-4">
            <h3 className="text-lg font-bold lol-title-gold mb-3 flex items-center gap-2">
                👥 Missions des alliés
            </h3>

            <div className="space-y-2">
                {playersWithMissions.map((player: any) => (
                    <div
                        key={player.id}
                        className="grid grid-cols-[120px_1fr] gap-3 items-start bg-[#010A13]/40 rounded-lg p-2 border border-[#C8AA6E]/10"
                    >
                        {/* Colonne 1: Pseudo */}
                        <div className="flex items-center gap-2 min-w-0">
                            {player.avatar ? (
                                <img
                                    src={player.avatar}
                                    alt={player.name}
                                    className="w-8 h-8 rounded-full border border-[#C8AA6E] flex-shrink-0"
                                />
                            ) : (
                                <div className="w-8 h-8 bg-gradient-to-br from-[#0AC8B9] to-[#0397AB] rounded-full flex items-center justify-center text-[#010A13] font-bold text-sm border border-[#C8AA6E] flex-shrink-0">
                                    {player.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="font-medium lol-text-light truncate">{player.name}</span>
                        </div>

                        {/* Colonne 2: Missions empilées */}
                        <div className="flex flex-col items-start gap-1.5">
                            {player.missions.map((pm: PlayerMission) => (
                                <div
                                    key={pm.mission.id}
                                    className={`inline-flex items-start gap-2 text-sm px-2.5 py-1.5 rounded ${
                                        pm.mission.isPrivate
                                            ? 'bg-purple-900/40 border border-purple-500/30 text-purple-200'
                                            : 'bg-[#1E2328] border border-[#C8AA6E]/20 lol-text-light'
                                    }`}
                                >
                                    <span className="flex-shrink-0">{getMissionIcon(pm)}</span>
                                    <span className="leading-relaxed">{getMissionText(pm)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
