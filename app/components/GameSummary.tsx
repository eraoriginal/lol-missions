'use client';

interface PlayerMission {
    mission: {
        id: string;
        text: string;
        type: string;
        isPrivate: boolean;
        points: number;
        difficulty?: string;
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

    const playersWithScores = players.map(p => ({
        ...p,
        totalPoints: p.missions.reduce((sum, m) => sum + m.pointsEarned, 0),
    }));

    const redTeam = playersWithScores
        .filter(p => p.team === 'red')
        .sort((a, b) => b.totalPoints - a.totalPoints);

    const blueTeam = playersWithScores
        .filter(p => p.team === 'blue')
        .sort((a, b) => b.totalPoints - a.totalPoints);

    const redTotal = redTeam.reduce((sum, p) => sum + p.totalPoints, 0);
    const blueTotal = blueTeam.reduce((sum, p) => sum + p.totalPoints, 0);

    const noTeam = playersWithScores
        .filter(p => !p.team || p.team === '')
        .sort((a, b) => b.totalPoints - a.totalPoints);

    const winner = redTotal > blueTotal ? 'red' : blueTotal > redTotal ? 'blue' : 'draw';

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
            ? 'from-red-900/80 to-red-950'
            : 'from-blue-900/80 to-blue-950';
        const borderColor = isRed ? 'border-red-500/50' : 'border-blue-500/50';
        const winnerBorder = isWinner ? 'border-2 border-[#C8AA6E] shadow-lg shadow-[#C8AA6E]/30' : `border ${borderColor}`;
        const scoreText = isRed ? 'text-red-400' : 'text-blue-400';
        const label = isRed ? '🔴 Rouge' : '🔵 Bleue';

        return (
            <div className={`bg-gradient-to-br ${gradient} rounded-lg overflow-hidden ${winnerBorder}`}>
                <div className="p-5 pb-3">
                    <div className="flex items-center justify-between">
                        <h3 className="lol-text-light font-bold text-xl flex items-center gap-2 uppercase tracking-wide">
                            {label}
                            {isWinner && <span className="text-[#C8AA6E] text-lg">🏆</span>}
                        </h3>
                        <div className="text-right">
                            <div className="text-3xl font-bold lol-title-gold">{totalPoints}</div>
                            <div className={`text-xs ${scoreText} uppercase tracking-wide`}>points</div>
                        </div>
                    </div>
                </div>

                <div className="px-5 pb-5 space-y-2">
                    {teamPlayers.length === 0 ? (
                        <div className="lol-text italic text-sm text-center py-4">
                            Aucun invocateur dans cette équipe
                        </div>
                    ) : (
                        teamPlayers.map((player, i) => (
                            <div
                                key={player.id}
                                className={`rounded-lg p-3 ${
                                    i === 0 && teamPlayers.length > 1
                                        ? 'bg-[#C8AA6E]/20 border border-[#C8AA6E]/50'
                                        : 'bg-black/30 border border-white/10'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <span className="lol-text text-sm font-bold w-5 text-center">#{i + 1}</span>
                                        {player.avatar ? (
                                            <img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-full border border-[#C8AA6E]" />
                                        ) : (
                                            <div className="w-8 h-8 bg-gradient-to-br from-[#C8AA6E] to-[#785A28] rounded-full flex items-center justify-center text-[#010A13] font-bold text-sm">
                                                {player.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="lol-text-light font-semibold text-sm">{player.name}</span>
                                    </div>
                                    <span className="lol-text-gold font-bold text-sm">
                                        {player.totalPoints} pts
                                    </span>
                                </div>

                                <div className="space-y-1 pl-7">
                                    {player.missions.map((pm) => {
                                        const isPrivate = pm.mission.isPrivate;
                                        // Style de base selon validation
                                        let bgStyle = pm.validated
                                            ? 'bg-green-900/40 border border-green-500/30'
                                            : 'bg-red-900/40 border border-red-500/30 opacity-60';
                                        // Si mission secrète, override avec style doré
                                        if (isPrivate) {
                                            bgStyle = pm.validated
                                                ? 'bg-gradient-to-r from-[#C8AA6E]/30 to-green-900/40 border border-[#C8AA6E]/50'
                                                : 'bg-gradient-to-r from-[#C8AA6E]/20 to-red-900/30 border border-[#C8AA6E]/30 opacity-70';
                                        }

                                        return (
                                            <div
                                                key={pm.mission.id}
                                                className={`flex items-center justify-between text-xs rounded px-2 py-1 ${bgStyle}`}
                                            >
                                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                    <span>{pm.validated ? '✅' : '❌'}</span>
                                                    {isPrivate && <span className="text-[#C8AA6E]">🔒</span>}
                                                    <span className={`truncate ${isPrivate ? 'text-[#F0E6D2]' : 'lol-text-light'} ${!pm.validated ? 'line-through opacity-60' : ''}`}>
                                                        {pm.mission.text}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                                                        pm.type === 'START' ? 'bg-blue-800/60 text-blue-300' :
                                                            pm.type === 'MID'   ? 'bg-purple-800/60 text-purple-300' :
                                                                'bg-red-800/60 text-red-300'
                                                    }`}>
                                                        {pm.type}
                                                    </span>
                                                    {pm.mission.difficulty && (
                                                        <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${getDifficultyStyle(pm.mission.difficulty).bg} ${getDifficultyStyle(pm.mission.difficulty).text}`}>
                                                            {getDifficultyStyle(pm.mission.difficulty).label}
                                                        </span>
                                                    )}
                                                    <span className={`font-bold ${pm.validated ? 'lol-text-gold' : 'lol-text'}`}>
                                                        {pm.pointsEarned}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
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
            <div className={`lol-card rounded-lg p-6 text-center ${
                winner === 'red'
                    ? 'border-2 border-red-500 shadow-lg shadow-red-500/30'
                    : winner === 'blue'
                        ? 'border-2 border-blue-500 shadow-lg shadow-blue-500/30'
                        : 'border-2 border-[#C8AA6E]'
            }`}>
                <div className="text-5xl mb-2">
                    {winner === 'draw' ? '🤝' : '🏆'}
                </div>
                <h2 className="text-3xl font-bold lol-title-gold uppercase tracking-wide">
                    {winner === 'red' && "Victoire Rouge !"}
                    {winner === 'blue' && "Victoire Bleue !"}
                    {winner === 'draw' && 'Égalité !'}
                </h2>
                <div className="flex items-center justify-center gap-8 mt-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">{redTotal}</div>
                        <div className="text-red-300 text-sm uppercase">Rouge</div>
                    </div>
                    <div className="lol-text-gold text-2xl font-bold">VS</div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{blueTotal}</div>
                        <div className="text-blue-300 text-sm uppercase">Bleue</div>
                    </div>
                </div>
            </div>

            {/* Les deux équipes */}
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

            {/* Spectateurs */}
            {noTeam.length > 0 && noTeam.some(p => p.totalPoints > 0) && (
                <div className="lol-card rounded-lg p-6">
                    <h3 className="text-lg font-bold lol-title-gold mb-4">👁️ Spectateurs</h3>
                    <div className="space-y-2">
                        {noTeam.map((player) => (
                            <div key={player.id} className="flex items-center justify-between bg-[#010A13]/50 rounded-lg p-3 border border-[#C8AA6E]/20">
                                <div className="flex items-center gap-3">
                                    {player.avatar ? (
                                        <img src={player.avatar} alt={player.name} className="w-9 h-9 rounded-full border border-[#C8AA6E]" />
                                    ) : (
                                        <div className="w-9 h-9 bg-gradient-to-br from-[#C8AA6E] to-[#785A28] rounded-full flex items-center justify-center text-[#010A13] font-bold text-sm">
                                            {player.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="font-semibold lol-text-light">{player.name}</span>
                                </div>
                                <span className="font-bold lol-text-gold bg-[#C8AA6E]/20 px-3 py-1 rounded-full border border-[#C8AA6E]/50">
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
