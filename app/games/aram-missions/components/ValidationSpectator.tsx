'use client';

import { LeaveRoomButton } from '@/app/components/LeaveRoomButton';

interface MissionData {
    id: string;
    text: string;
    type: string;
    category: string;
    difficulty: string;
    points: number;
    isPrivate: boolean;
}

interface PlayerMissionData {
    type: string;
    decided: boolean;
    validated: boolean;
    pointsEarned: number;
    resolvedText?: string;
    mission: MissionData;
}

interface PlayerData {
    id: string;
    name: string;
    avatar: string;
    team: string;
    token?: string;
    missions: PlayerMissionData[];
}

interface RoomEventData {
    id: string;
    appearedAt: string | null;
    resolvedText?: string | null;
    redDecided: boolean;
    redValidated: boolean;
    blueValidated: boolean;
    event: { text: string; points: number; duration: number };
}

interface ValidationSpectatorRoom {
    validationStatus?: string;
    winnerTeam?: string | null;
    players: PlayerData[];
    roomEvents?: RoomEventData[];
}

interface ValidationSpectatorProps {
    room: ValidationSpectatorRoom;
    roomCode: string;
}

function getMissionIcon(type: string) {
    if (type === 'START') return '⚔️';
    if (type === 'MID') return '⚡';
    return '🔥';
}

function getMissionLabel(type: string) {
    if (type === 'START') return 'Début';
    if (type === 'MID') return 'MID';
    return 'Finale';
}

function getMissionColor(type: string) {
    if (type === 'START') return 'blue';
    if (type === 'MID') return 'purple';
    return 'red';
}

function MissionRow({ pm, type }: { pm: PlayerMissionData; type: string }) {
    const color = getMissionColor(type);
    const validated = pm.decided && pm.validated;
    const failed = pm.decided && !pm.validated;
    const isPrivate = pm.mission.isPrivate;

    return (
        <div className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
            validated
                ? 'bg-green-900/30 border-green-500/50'
                : failed
                    ? 'bg-red-900/30 border-red-500/50'
                    : isPrivate
                        ? 'secret-mission-full'
                        : `bg-${color}-900/20 border-${color}-500/30`
        }`}>
            <span className="text-2xl flex-shrink-0 mt-0.5">{getMissionIcon(type)}</span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-semibold uppercase ${
                        isPrivate ? 'text-white' :
                        color === 'blue' ? 'text-blue-400' :
                        color === 'purple' ? 'text-purple-400' : 'text-red-400'
                    }`}>{getMissionLabel(type)}</span>
                    {isPrivate && <span className="text-white">🔒</span>}
                    <span className={`text-sm ${isPrivate ? 'text-white' : 'lol-text-gold'}`}>+{pm.mission.points} pts</span>
                </div>
                <p className={`leading-relaxed ${isPrivate ? 'text-white' : 'lol-text-light'}`}>{pm.resolvedText || pm.mission.text}</p>
            </div>
            <div className="flex-shrink-0">
                {pm.decided ? (
                    validated ? (
                        <span className="px-4 py-2 rounded-lg font-semibold bg-green-600 border border-green-400 text-white">
                            +{pm.mission.points}
                        </span>
                    ) : (
                        <span className="px-4 py-2 rounded-lg font-semibold bg-red-600 border border-red-400 text-white">
                            0
                        </span>
                    )
                ) : (
                    <span className="px-4 py-2 rounded-lg text-sm lol-text italic bg-[#1E2328] border border-[#C8AA6E]/20">
                        En attente...
                    </span>
                )}
            </div>
        </div>
    );
}

export function ValidationSpectator({ room, roomCode }: ValidationSpectatorProps) {
    const players = room.players.filter((p) => p.missions.length > 0);

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
    const validatedPlayers = players.slice(0, currentIndex).map((p) => ({
        ...p,
        totalPoints: p.missions.reduce((sum, m) => sum + (m.pointsEarned || 0), 0),
    }));

    const startMission = currentPlayer?.missions.find((m) => m.type === 'START');
    const midMission = currentPlayer?.missions.find((m) => m.type === 'MID');
    const lateMission = currentPlayer?.missions.find((m) => m.type === 'LATE');

    // Écran événements visible par les spectateurs
    if (room.validationStatus === 'events_validation') {
        const appearedEvents = (room.roomEvents || []).filter((re) => re.appearedAt !== null);

        return (
            <div className="space-y-6">
                <div className="lol-card rounded-lg p-6 text-center">
                    <div className="text-4xl mb-2 animate-bounce">⚡</div>
                    <h1 className="text-3xl font-bold text-amber-400 mb-1 uppercase tracking-wide">Validation des événements</h1>
                    <p className="lol-text">Le créateur valide les événements pour chaque équipe...</p>
                </div>

                <div className="space-y-4">
                    {appearedEvents.map((re) => {
                        const decided = re.redDecided;
                        const winner = decided ? (re.redValidated ? 'red' : re.blueValidated ? 'blue' : 'none') : null;

                        return (
                        <div key={re.id} className="lol-card rounded-lg p-5 border border-amber-500/30">
                            <p className="text-amber-100 leading-relaxed mb-4 text-lg">{re.resolvedText || re.event.text}</p>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm font-bold text-amber-300">+{re.event.points} pts</span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div className={`p-3 rounded-lg font-bold text-sm text-center border-2 ${
                                    decided && winner === 'blue'
                                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30'
                                        : decided && winner !== 'blue'
                                            ? 'bg-blue-900/20 border-blue-500/20 text-blue-400/50'
                                            : 'bg-blue-900/30 border-blue-500/30 text-blue-400'
                                }`}>
                                    🔵 Bleue
                                </div>
                                <div className={`p-3 rounded-lg font-bold text-sm text-center border-2 ${
                                    decided && winner === 'none'
                                        ? 'bg-gray-600 border-gray-400 text-white shadow-lg shadow-gray-500/30'
                                        : decided && winner !== 'none'
                                            ? 'bg-gray-900/20 border-gray-500/20 text-gray-400/50'
                                            : 'bg-gray-900/30 border-gray-500/30 text-gray-400'
                                }`}>
                                    ❌ Aucune
                                </div>
                                <div className={`p-3 rounded-lg font-bold text-sm text-center border-2 ${
                                    decided && winner === 'red'
                                        ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-500/30'
                                        : decided && winner !== 'red'
                                            ? 'bg-red-900/20 border-red-500/20 text-red-400/50'
                                            : 'bg-red-900/30 border-red-500/30 text-red-400'
                                }`}>
                                    🔴 Rouge
                                </div>
                            </div>

                            {decided && winner !== 'none' && winner && (
                                <div className={`mt-3 text-center text-sm font-bold ${
                                    winner === 'red' ? 'text-red-400' : 'text-blue-400'
                                }`}>
                                    +{re.event.points} pts pour l&apos;équipe {winner === 'red' ? 'Rouge' : 'Bleue'}
                                </div>
                            )}
                        </div>
                        );
                    })}
                </div>
            </div>
        );
    }

    // Écran bonus visible par les spectateurs
    if (room.validationStatus === 'bonus_selection') {
        const selectedTeam = room.winnerTeam;
        return (
            <div className="space-y-6">
                <div className="lol-card rounded-lg p-6 text-center">
                    <div className="text-4xl mb-2 animate-bounce">🏆</div>
                    <h1 className="text-3xl font-bold lol-title-gold mb-1 uppercase tracking-wide">Bonus de victoire</h1>
                    <p className="lol-text">Le créateur sélectionne l&apos;équipe gagnante...</p>
                    <p className="lol-text text-sm mt-1 opacity-75">Un bonus mystère sera tiré au sort 🎲</p>
                </div>

                <div className="lol-card rounded-lg p-6">
                    <h3 className="text-lg font-bold lol-title-gold mb-4 text-center">Équipe gagnante</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className={`p-4 rounded-lg font-bold text-lg text-center transition-all border-2 ${
                            selectedTeam === 'blue'
                                ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-blue-900/20 border-blue-500/20 text-blue-400/50'
                        }`}>
                            🔵 Bleue
                        </div>
                        <div className={`p-4 rounded-lg font-bold text-lg text-center transition-all border-2 ${
                            selectedTeam === 'red'
                                ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-500/30'
                                : 'bg-red-900/20 border-red-500/20 text-red-400/50'
                        }`}>
                            🔴 Rouge
                        </div>
                    </div>
                    {!selectedTeam && (
                        <p className="text-center lol-text text-sm mt-4 animate-pulse">En attente du choix...</p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="lol-card rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 text-center">
                        <div className="text-4xl mb-2 animate-bounce">⏳</div>
                        <h1 className="text-3xl font-bold lol-title-gold mb-1 uppercase tracking-wide">Validation en cours...</h1>
                        <p className="lol-text">
                            Invocateur <span className="font-bold lol-text-gold">{currentIndex + 1}</span> / {players.length}
                        </p>
                    </div>
                    <LeaveRoomButton roomCode={roomCode} />
                </div>
                <div className="flex gap-2 justify-center">
                    {players.map((_, i) => (
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
                <div className="lol-card rounded-lg p-5 border-2 border-[#0AC8B9]/50 shadow-lg shadow-[#0AC8B9]/20">
                    <div className="flex items-center gap-3 mb-4">
                        {currentPlayer.avatar ? (

                            <img
                                src={currentPlayer.avatar}
                                alt={currentPlayer.name}
                                className="w-12 h-12 rounded-full border-2 border-[#C8AA6E]"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-[#C8AA6E] to-[#785A28] rounded-full flex items-center justify-center text-[#010A13] font-bold text-xl">
                                {currentPlayer.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-bold lol-text-light">{currentPlayer.name}</h2>
                            <p className="text-xs lol-text">{currentPlayer.missions.length} mission{currentPlayer.missions.length > 1 ? 's' : ''}</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {startMission && <MissionRow pm={startMission} type="START" />}
                        {midMission && <MissionRow pm={midMission} type="MID" />}
                        {lateMission && <MissionRow pm={lateMission} type="LATE" />}
                    </div>
                </div>
            )}

            {/* Validated players list */}
            {validatedPlayers.length > 0 && (
                <div className="lol-card rounded-lg p-6">
                    <h3 className="text-lg font-bold lol-title-gold mb-4">📊 Invocateurs validés</h3>
                    <div className="space-y-3">
                        {validatedPlayers.map((p) => (
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
                                        {p.missions.filter((m) => m.validated).length}/{p.missions.length} ✓
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
