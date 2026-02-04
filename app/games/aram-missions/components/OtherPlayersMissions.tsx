'use client';

interface Mission {
    id: string;
    text: string;
    type: string;
    isPrivate: boolean;
    difficulty?: string;
}

interface PlayerMission {
    mission: Mission;
    type: string;
}

interface Player {
    id: string;
    name: string;
    avatar: string;
    team?: string;
    missions: PlayerMission[];
}

type MissionVisibility = 'all' | 'team' | 'hidden';

interface OtherPlayersMissionsProps {
    players: Player[];
    currentPlayerToken: string | null;
    missionVisibility: MissionVisibility;
    currentPlayerTeam?: string;
}

export function OtherPlayersMissions({
    players,
    currentPlayerToken,
    missionVisibility,
    currentPlayerTeam
}: OtherPlayersMissionsProps) {
    // Si visibilité "hidden", ne rien afficher
    if (missionVisibility === 'hidden') {
        return null;
    }

    const otherPlayers = players.filter((p: any) => p.token !== currentPlayerToken);

    if (otherPlayers.length === 0) {
        return null;
    }

    // Filtrer selon la visibilité
    let visiblePlayers = otherPlayers;
    if (missionVisibility === 'team' && currentPlayerTeam) {
        visiblePlayers = otherPlayers.filter((p: any) => p.team === currentPlayerTeam);
    }

    const playersWithMissions = visiblePlayers.filter((p: any) => p.missions.length > 0);

    if (playersWithMissions.length === 0) {
        return null;
    }

    const getTeamStyle = (team?: string) => {
        switch (team) {
            case 'red':
                return {
                    border: 'border-l-4 border-l-red-500',
                    bg: 'bg-red-900/20',
                    text: 'text-red-400',
                    icon: '🔴'
                };
            case 'blue':
                return {
                    border: 'border-l-4 border-l-blue-500',
                    bg: 'bg-blue-900/20',
                    text: 'text-blue-400',
                    icon: '🔵'
                };
            default:
                return {
                    border: '',
                    bg: 'bg-[#010A13]/40',
                    text: 'lol-text-light',
                    icon: ''
                };
        }
    };

    const getDifficultyStyle = (difficulty: string) => {
        switch (difficulty) {
            case 'easy':
                return { bg: 'bg-green-600/80', text: 'text-green-100', label: 'Facile' };
            case 'medium':
                return { bg: 'bg-yellow-600/80', text: 'text-yellow-100', label: 'Moyen' };
            case 'hard':
                return { bg: 'bg-red-600/80', text: 'text-red-100', label: 'Difficile' };
            default:
                return { bg: 'bg-gray-600/80', text: 'text-gray-100', label: difficulty };
        }
    };

    const getMissionIcon = (pm: PlayerMission) => {
        if (pm.mission.isPrivate) return '🔒';
        if (pm.type === 'START') return '⚔️';
        if (pm.type === 'MID') return '⚡';
        return '🔥';
    };

    const title = missionVisibility === 'team' ? 'Missions de ton équipe' : 'Missions des autres joueurs';

    return (
        <div className="lol-card rounded-lg p-4">
            <h3 className="text-lg font-bold lol-title-gold mb-3 flex items-center gap-2">
                👥 {title}
            </h3>

            <div className="space-y-2">
                {playersWithMissions.map((player: any) => {
                    const teamStyle = getTeamStyle(player.team);
                    return (
                        <div
                            key={player.id}
                            className={`grid grid-cols-[120px_1fr] gap-3 items-start rounded-lg p-2 border border-[#C8AA6E]/10 ${teamStyle.bg} ${teamStyle.border}`}
                        >
                            {/* Colonne 1: Pseudo */}
                            <div className="flex items-center gap-2 min-w-0">
                                {player.avatar ? (
                                    <img
                                        src={player.avatar}
                                        alt={player.name}
                                        className={`w-8 h-8 rounded-full flex-shrink-0 ${
                                            player.team === 'red' ? 'border-2 border-red-500' :
                                            player.team === 'blue' ? 'border-2 border-blue-500' :
                                            'border border-[#C8AA6E]'
                                        }`}
                                    />
                                ) : (
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                                        player.team === 'red' ? 'bg-gradient-to-br from-red-500 to-red-700 text-white border-2 border-red-400' :
                                        player.team === 'blue' ? 'bg-gradient-to-br from-blue-500 to-blue-700 text-white border-2 border-blue-400' :
                                        'bg-gradient-to-br from-[#0AC8B9] to-[#0397AB] text-[#010A13] border border-[#C8AA6E]'
                                    }`}>
                                        {player.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className={`font-medium truncate ${teamStyle.text}`}>{player.name}</span>
                            </div>

                        {/* Colonne 2: Missions empilées */}
                        <div className="flex flex-col items-start gap-1.5">
                            {player.missions.map((pm: PlayerMission) => (
                                <div
                                    key={pm.mission.id}
                                    className={`inline-flex items-start gap-2 text-sm px-2.5 py-1.5 rounded ${
                                        pm.mission.isPrivate
                                            ? 'secret-mission-full'
                                            : 'bg-[#1E2328] border border-[#C8AA6E]/20 lol-text-light'
                                    }`}
                                >
                                    <span className="flex-shrink-0">{getMissionIcon(pm)}</span>
                                    <span className="leading-relaxed">
                                        {pm.mission.isPrivate
                                            ? <span className="italic text-white">Mission secrète</span>
                                            : pm.mission.text
                                        }
                                    </span>
                                    {!pm.mission.isPrivate && pm.mission.difficulty && (
                                        <span className={`text-xs px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${getDifficultyStyle(pm.mission.difficulty).bg} ${getDifficultyStyle(pm.mission.difficulty).text}`}>
                                            {getDifficultyStyle(pm.mission.difficulty).label}
                                        </span>
                                    )}
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
