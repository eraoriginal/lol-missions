'use client';

interface PlayerMission {
    mission: {
        id: string;
        text: string;
        type: string;
        isPrivate: boolean;
        points: number;
    };
    type: string;
    validated: boolean;
    pointsEarned: number;
}

interface Player {
    id: string;
    name: string;
    avatar: string;
    team: string;
    missions: PlayerMission[];
}

interface GameSummaryProps {
    players: Player[];
}

export function GameSummary({ players }: GameSummaryProps) {
    // Calcule les scores par joueur
    const playersWithScores = players.map(p => ({
        ...p,
        totalPoints: p.missions.reduce((sum, m) => sum + m.pointsEarned, 0),
    }));

    // Séparation par équipe, triées par points décroissants
    const redTeam = playersWithScores
        .filter(p => p.team === 'red')
        .sort((a, b) => b.totalPoints - a.totalPoints);

    const blueTeam = playersWithScores
        .filter(p => p.team === 'blue')
        .sort((a, b) => b.totalPoints - a.totalPoints);

    const redTotal = redTeam.reduce((sum, p) => sum + p.totalPoints, 0);
    const blueTotal = blueTeam.reduce((sum, p) => sum + p.totalPoints, 0);

    // Joueurs sans équipe (spectateurs qui avaient quand même des missions, edge case)
    const noTeam = playersWithScores
        .filter(p => !p.team || p.team === '')
        .sort((a, b) => b.totalPoints - a.totalPoints);

    const winner = redTotal > blueTotal ? 'red' : blueTotal > redTotal ? 'blue' : 'draw';

    // Composant : carte d'une équipe avec ses joueurs
    const TeamBlock = ({
                           team,
                           players: teamPlayers,
                           totalPoints,
                           isWinner,
                       }: {
        team: 'red' | 'blue';
        players: typeof redTeam;
        totalPoints: number;
        isWinner: boolean;
    }) => {
        const isRed = team === 'red';
        const gradient = isRed
            ? 'from-red-700 to-red-900'
            : 'from-blue-700 to-blue-900';
        const borderWin = isRed ? 'ring-4 ring-yellow-400' : 'ring-4 ring-yellow-400';
        const scoreText = isRed ? 'text-red-200' : 'text-blue-200';
        const label = isRed ? '🔴 Équipe Rouge' : '🔵 Équipe Bleue';

        return (
            <div className={`bg-gradient-to-br ${gradient} rounded-xl shadow-lg overflow-hidden ${isWinner ? borderWin : ''}`}>
                {/* Header équipe */}
                <div className="p-5 pb-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-white font-bold text-xl flex items-center gap-2">
                            {label}
                            {isWinner && <span className="text-yellow-400 text-lg">🏆</span>}
                        </h3>
                        <div className="text-right">
                            <div className={`text-3xl font-bold text-white`}>{totalPoints}</div>
                            <div className={`text-xs ${scoreText} uppercase tracking-wide`}>points</div>
                        </div>
                    </div>
                </div>

                {/* Liste des joueurs de cette équipe */}
                <div className="px-5 pb-5 space-y-2">
                    {teamPlayers.length === 0 ? (
                        <div className="text-white/40 italic text-sm text-center py-4">
                            Aucun joueur dans cette équipe
                        </div>
                    ) : (
                        teamPlayers.map((player, i) => (
                            <div
                                key={player.id}
                                className={`rounded-lg p-3 ${
                                    i === 0 && teamPlayers.length > 1
                                        ? 'bg-white/25 border border-yellow-400/50'  // 1er de l'équipe
                                        : 'bg-white/15'
                                }`}
                            >
                                {/* Header joueur */}
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-white/60 text-sm font-bold w-5 text-center">#{i + 1}</span>
                                        {player.avatar ? (
                                            <img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-full" />
                                        ) : (
                                            <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {player.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-white font-semibold text-sm">{player.name}</span>
                                    </div>
                                    <span className="text-yellow-300 font-bold text-sm">
                                        {player.totalPoints} pts
                                    </span>
                                </div>

                                {/* Missions détail */}
                                <div className="space-y-1 pl-7">
                                    {player.missions.map((pm) => (
                                        <div
                                            key={pm.mission.id}
                                            className={`flex items-center justify-between text-xs rounded px-2 py-1 ${
                                                pm.validated ? 'bg-green-900/40' : 'bg-red-900/40 opacity-60'
                                            }`}
                                        >
                                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                <span>{pm.validated ? '✅' : '❌'}</span>
                                                <span className={`text-white/80 truncate ${!pm.validated ? 'line-through' : ''}`}>
                                                    {pm.mission.text}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                                    pm.type === 'START' ? 'bg-blue-800/60 text-blue-200' :
                                                        pm.type === 'MID'   ? 'bg-purple-800/60 text-purple-200' :
                                                            'bg-red-800/60 text-red-200'
                                                }`}>
                                                    {pm.type}
                                                </span>
                                                {pm.mission.isPrivate && (
                                                    <span className="text-xs text-purple-300">🔒</span>
                                                )}
                                                <span className={`font-bold ${pm.validated ? 'text-yellow-300' : 'text-white/30'}`}>
                                                    {pm.pointsEarned}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Banner du vainqueur */}
            <div className={`rounded-xl shadow-lg p-6 text-center ${
                winner === 'red'
                    ? 'bg-gradient-to-r from-red-600 to-red-800'
                    : winner === 'blue'
                        ? 'bg-gradient-to-r from-blue-600 to-blue-800'
                        : 'bg-gradient-to-r from-gray-600 to-gray-800'
            }`}>
                <div className="text-5xl mb-2">
                    {winner === 'draw' ? '🤝' : '🏆'}
                </div>
                <h2 className="text-3xl font-bold text-white">
                    {winner === 'red' && "L'équipe Rouge victoire !"}
                    {winner === 'blue' && "L'équipe Bleue victoire !"}
                    {winner === 'draw' && 'Égalité !'}
                </h2>
                <div className="flex items-center justify-center gap-8 mt-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-200">{redTotal}</div>
                        <div className="text-red-300 text-sm">Rouge</div>
                    </div>
                    <div className="text-white text-2xl font-bold">VS</div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-200">{blueTotal}</div>
                        <div className="text-blue-300 text-sm">Bleue</div>
                    </div>
                </div>
            </div>

            {/* Les deux équipes côte à côte */}
            <div className="grid grid-cols-2 gap-4">
                <TeamBlock
                    team="red"
                    players={redTeam}
                    totalPoints={redTotal}
                    isWinner={winner === 'red'}
                />
                <TeamBlock
                    team="blue"
                    players={blueTeam}
                    totalPoints={blueTotal}
                    isWinner={winner === 'blue'}
                />
            </div>

            {/* Spectateurs / joueurs sans équipe — affiché seulement s'ils ont des points */}
            {noTeam.length > 0 && noTeam.some(p => p.totalPoints > 0) && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">👁️ Spectateurs</h3>
                    <div className="space-y-2">
                        {noTeam.map((player) => (
                            <div key={player.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                    {player.avatar ? (
                                        <img src={player.avatar} alt={player.name} className="w-9 h-9 rounded-full" />
                                    ) : (
                                        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                            {player.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="font-semibold text-gray-800">{player.name}</span>
                                </div>
                                <span className="font-bold text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                                    {player.totalPoints} pts
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}