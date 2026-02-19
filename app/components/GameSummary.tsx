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
    resolvedText?: string;
}

interface Player {
    id: string;
    name: string;
    avatar: string;
    team: string;
    missions: PlayerMission[];
}

interface PlayerWithScore extends Player {
    totalPoints: number;
}

interface RoomEventSummary {
    id: string;
    resolvedText?: string | null;
    event: {
        text: string;
        points: number;
        difficulty: string;
    };
    redValidated: boolean;
    blueValidated: boolean;
    pointsEarnedRed: number;
    pointsEarnedBlue: number;
}

interface PlayerBetSummary {
    id: string;
    playerId: string;
    playerName: string;
    playerTeam: string;
    betType: { text: string };
    targetPlayerName: string;
    points: number;
    validated: boolean;
    decided: boolean;
}

interface GameSummaryProps {
    players: Player[];
    victoryBonus?: boolean;
    betsEnabled?: boolean;
    winnerTeam?: string | null;
    victoryBonusPoints?: number;
    roomEvents?: RoomEventSummary[];
    playerBets?: PlayerBetSummary[];
}

const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
        case 'easy':
            return { bg: 'bg-green-600/80', text: 'text-green-100', label: 'Facile' };
        case 'medium':
            return { bg: 'bg-blue-600/80', text: 'text-blue-100', label: 'Moyen' };
        case 'hard':
            return { bg: 'bg-red-600/80', text: 'text-red-100', label: 'Difficile' };
        default:
            return { bg: 'bg-gray-600/80', text: 'text-gray-100', label: difficulty };
    }
};

function ScoreRow({ label, blueValue, redValue, highlight }: {
    label: string;
    blueValue: number;
    redValue: number;
    highlight?: boolean;
}) {
    const format = (v: number) => {
        if (v === 0) return '0';
        return v > 0 ? `+${v}` : `${v}`;
    };

    return (
        <div className={`grid grid-cols-[1fr_60px_60px] items-center py-1.5 ${
            highlight ? 'border-t border-[#C8AA6E]/40 pt-2 mt-1' : ''
        }`}>
            <span className={`text-sm ${highlight ? 'font-bold lol-text-light' : 'lol-text'}`}>{label}</span>
            <span className={`text-sm text-center font-bold tabular-nums ${
                highlight ? 'text-blue-300 text-base' : 'lol-text-light'
            }`}>{format(blueValue)}</span>
            <span className={`text-sm text-center font-bold tabular-nums ${
                highlight ? 'text-red-300 text-base' : 'lol-text-light'
            }`}>{format(redValue)}</span>
        </div>
    );
}

function TeamPlayersBlock({ teamPlayers }: { teamPlayers: PlayerWithScore[] }) {
    return (
        <div className="space-y-2">
            {teamPlayers.length === 0 ? (
                <div className="lol-text italic text-sm text-center py-2">
                    Aucun invocateur
                </div>
            ) : (
                teamPlayers.map((player, i) => (
                    <div
                        key={player.id}
                        className={`rounded-lg p-3 ${
                            i === 0 && teamPlayers.length > 1
                                ? 'bg-[#C8AA6E]/10 border border-[#C8AA6E]/30'
                                : 'bg-black/20 border border-white/5'
                        }`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <span className="lol-text text-xs font-bold w-4 text-center">#{i + 1}</span>
                                {player.avatar ? (
                                    <img src={player.avatar} alt={player.name} className="w-10 h-10 rounded-full border border-[#C8AA6E]/50" />
                                ) : (
                                    <div className="w-10 h-10 bg-gradient-to-br from-[#C8AA6E] to-[#785A28] rounded-full flex items-center justify-center text-[#010A13] font-bold text-sm">
                                        {player.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="lol-text-light font-semibold text-sm">{player.name}</span>
                            </div>
                            <span className="lol-text-gold font-bold text-sm">{player.totalPoints} pts</span>
                        </div>

                        <div className="space-y-1 pl-6">
                            {player.missions.map((pm) => {
                                const isPrivate = pm.mission.isPrivate;

                                return (
                                    <div
                                        key={pm.mission.id}
                                        className={`flex items-center justify-between text-xs rounded px-2 py-1 ${
                                            pm.validated
                                                ? 'bg-white/5 border border-white/10'
                                                : 'bg-white/[0.02] border border-white/5 opacity-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                            <span className="shrink-0">{pm.validated ? '✅' : '❌'}</span>
                                            {isPrivate && <span className="text-[#C8AA6E] shrink-0">🔒</span>}
                                            <span className={`truncate lol-text-light ${!pm.validated ? 'line-through opacity-60' : ''}`}>
                                                {pm.resolvedText || pm.mission.text}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
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
    );
}

export function GameSummary({ players, victoryBonus, betsEnabled, winnerTeam: bonusWinnerTeam, victoryBonusPoints = 0, roomEvents, playerBets }: GameSummaryProps) {
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

    const redMissionTotal = redTeam.reduce((sum, p) => sum + p.totalPoints, 0);
    const blueMissionTotal = blueTeam.reduce((sum, p) => sum + p.totalPoints, 0);

    const redEventTotal = (roomEvents || []).reduce((sum, re) => sum + re.pointsEarnedRed, 0);
    const blueEventTotal = (roomEvents || []).reduce((sum, re) => sum + re.pointsEarnedBlue, 0);
    const hasEvents = roomEvents && roomEvents.length > 0;

    const hasBonus = victoryBonus && bonusWinnerTeam;
    const redBonus = hasBonus && bonusWinnerTeam === 'red' ? victoryBonusPoints : 0;
    const blueBonus = hasBonus && bonusWinnerTeam === 'blue' ? victoryBonusPoints : 0;

    const hasBets = betsEnabled && playerBets && playerBets.length > 0;
    let redBetTotal = 0;
    let blueBetTotal = 0;
    let redMultiplier = 1;
    let blueMultiplier = 1;

    if (hasBets) {
        const redBets = playerBets.filter(b => b.playerTeam === 'red');
        const blueBets = playerBets.filter(b => b.playerTeam === 'blue');

        const redWon = redBets.filter(b => b.decided && b.validated);
        const redLost = redBets.filter(b => b.decided && !b.validated);
        const blueWon = blueBets.filter(b => b.decided && b.validated);
        const blueLost = blueBets.filter(b => b.decided && !b.validated);

        redMultiplier = redWon.length >= 2 ? redWon.length : 1;
        blueMultiplier = blueWon.length >= 2 ? blueWon.length : 1;

        const redWonTotal = redWon.reduce((s, b) => s + b.points, 0);
        const redLostTotal = redLost.reduce((s, b) => s + b.points, 0);
        const blueWonTotal = blueWon.reduce((s, b) => s + b.points, 0);
        const blueLostTotal = blueLost.reduce((s, b) => s + b.points, 0);

        redBetTotal = (redWonTotal * redMultiplier) - redLostTotal;
        blueBetTotal = (blueWonTotal * blueMultiplier) - blueLostTotal;
    }

    const redTotal = redMissionTotal + redEventTotal + redBonus + redBetTotal;
    const blueTotal = blueMissionTotal + blueEventTotal + blueBonus + blueBetTotal;

    const noTeam = playersWithScores
        .filter(p => !p.team || p.team === '')
        .sort((a, b) => b.totalPoints - a.totalPoints);

    const winner = redTotal > blueTotal ? 'red' : blueTotal > redTotal ? 'blue' : 'draw';

    return (
        <div className="space-y-4">
            {/* Banner du vainqueur */}
            <div className="lol-card rounded-lg p-6 text-center border border-[#C8AA6E]/30">
                <div className="text-4xl mb-2">
                    {winner === 'draw' ? '🤝' : '🏆'}
                </div>
                <h2 className="text-2xl font-bold lol-title-gold uppercase tracking-wide">
                    {winner === 'red' && <>Victoire <span className="text-red-400" style={{ backgroundImage: 'none', WebkitTextFillColor: 'unset' }}>Rouge</span> !</>}
                    {winner === 'blue' && <>Victoire <span className="text-blue-400" style={{ backgroundImage: 'none', WebkitTextFillColor: 'unset' }}>Bleue</span> !</>}
                    {winner === 'draw' && 'Égalité !'}
                </h2>
            </div>

            {/* Tableau de décomposition des scores */}
            <div className="lol-card rounded-lg p-5 border border-[#C8AA6E]/20">
                {/* Header colonnes */}
                <div className="grid grid-cols-[1fr_60px_60px] items-center mb-2 pb-2 border-b border-[#C8AA6E]/20">
                    <span className="text-xs font-bold uppercase tracking-wider lol-text">Catégorie</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400 text-center">Bleue</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-red-400 text-center">Rouge</span>
                </div>

                <ScoreRow label="Missions" blueValue={blueMissionTotal} redValue={redMissionTotal} />
                {hasEvents && (
                    <ScoreRow label="Événements" blueValue={blueEventTotal} redValue={redEventTotal} />
                )}
                {hasBets && (
                    <ScoreRow
                        label={`Paris${redMultiplier >= 2 || blueMultiplier >= 2 ? ` (x${blueMultiplier}/x${redMultiplier})` : ''}`}
                        blueValue={blueBetTotal}
                        redValue={redBetTotal}
                    />
                )}
                {hasBonus && (
                    <ScoreRow
                        label={`Bonus victoire${victoryBonusPoints === 0 ? ' 😂' : ''}`}
                        blueValue={blueBonus}
                        redValue={redBonus}
                    />
                )}
                <ScoreRow label="Total" blueValue={blueTotal} redValue={redTotal} highlight />
            </div>

            {/* Détail des événements */}
            {hasEvents && (
                <div className="lol-card rounded-lg p-5 border border-[#C8AA6E]/20">
                    <h3 className="text-sm font-bold lol-title-gold uppercase tracking-wide mb-3">Événements</h3>
                    <div className="space-y-2">
                        {roomEvents.map((re) => {
                            const eventWinner = re.redValidated ? 'red' : re.blueValidated ? 'blue' : 'none';

                            return (
                                <div key={re.id} className="flex items-center justify-between bg-[#010A13]/40 rounded px-3 py-2 border border-white/5">
                                    <p className="lol-text-light text-xs leading-relaxed flex-1 min-w-0 mr-3">{re.resolvedText || re.event.text}</p>
                                    <span className={`text-xs font-bold shrink-0 ${
                                        eventWinner === 'red' ? 'text-red-400' :
                                        eventWinner === 'blue' ? 'text-blue-400' : 'lol-text'
                                    }`}>
                                        {eventWinner === 'red' && `Rouge +${re.pointsEarnedRed}`}
                                        {eventWinner === 'blue' && `Bleue +${re.pointsEarnedBlue}`}
                                        {eventWinner === 'none' && '—'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Détail des paris */}
            {hasBets && (
                <div className="lol-card rounded-lg p-5 border border-[#C8AA6E]/20">
                    <h3 className="text-sm font-bold lol-title-gold uppercase tracking-wide mb-3">Paris</h3>
                    <div className="space-y-2">
                        {playerBets.map((bet) => (
                            <div key={bet.id} className={`flex items-center justify-between bg-[#010A13]/40 rounded px-3 py-2 border border-white/5 ${
                                bet.decided && !bet.validated ? 'opacity-50' : ''
                            }`}>
                                <div className="flex-1 min-w-0 mr-3">
                                    <span className="text-xs lol-text-light">
                                        <span className={`font-bold ${bet.playerTeam === 'red' ? 'text-red-400' : 'text-blue-400'}`}>{bet.playerName}</span>
                                        {' '}<span className="lol-text">parie que</span>{' '}
                                        <span className="lol-text-light">{bet.targetPlayerName}</span>{' '}
                                        <span className="lol-text">{bet.betType.text.toLowerCase()}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <span className="text-xs">{bet.decided ? (bet.validated ? '✅' : '❌') : '⏳'}</span>
                                    <span className={`text-xs font-bold ${
                                        bet.decided && bet.validated ? 'lol-text-gold' :
                                        bet.decided && !bet.validated ? 'lol-text' : 'lol-text'
                                    }`}>
                                        {bet.decided ? (bet.validated ? `+${bet.points}` : `-${bet.points}`) : `${bet.points}`}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Détail des équipes */}
            <div className="grid grid-cols-2 gap-3">
                <div className="lol-card rounded-lg p-4 border border-blue-500/20">
                    <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wide mb-3">Équipe Bleue</h3>
                    <TeamPlayersBlock teamPlayers={blueTeam} />
                </div>
                <div className="lol-card rounded-lg p-4 border border-red-500/20">
                    <h3 className="text-sm font-bold text-red-400 uppercase tracking-wide mb-3">Équipe Rouge</h3>
                    <TeamPlayersBlock teamPlayers={redTeam} />
                </div>
            </div>

            {/* Spectateurs */}
            {noTeam.length > 0 && noTeam.some(p => p.totalPoints > 0) && (
                <div className="lol-card rounded-lg p-5 border border-[#C8AA6E]/20">
                    <h3 className="text-sm font-bold lol-title-gold uppercase tracking-wide mb-3">Spectateurs</h3>
                    <div className="space-y-2">
                        {noTeam.map((player) => (
                            <div key={player.id} className="flex items-center justify-between bg-[#010A13]/40 rounded-lg p-3 border border-white/5">
                                <div className="flex items-center gap-3">
                                    {player.avatar ? (
                                        <img src={player.avatar} alt={player.name} className="w-8 h-8 rounded-full border border-[#C8AA6E]/50" />
                                    ) : (
                                        <div className="w-8 h-8 bg-gradient-to-br from-[#C8AA6E] to-[#785A28] rounded-full flex items-center justify-center text-[#010A13] font-bold text-sm">
                                            {player.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="font-semibold lol-text-light text-sm">{player.name}</span>
                                </div>
                                <span className="font-bold lol-text-gold text-sm">{player.totalPoints} pts</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
