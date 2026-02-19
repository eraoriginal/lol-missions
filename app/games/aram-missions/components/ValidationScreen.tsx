'use client';

import { useState, useEffect } from 'react';
import { LeaveRoomButton } from '@/app/components/LeaveRoomButton';

interface MissionDataV {
    id: string;
    text: string;
    type: string;
    category: string;
    difficulty: string;
    points: number;
    isPrivate: boolean;
}

interface PlayerMissionV {
    type: string;
    decided: boolean;
    validated: boolean;
    pointsEarned: number;
    resolvedText?: string;
    mission: MissionDataV;
}

interface PlayerV {
    id: string;
    name: string;
    avatar: string;
    team: string;
    token?: string;
    missions: PlayerMissionV[];
}

interface RoomEventV {
    id: string;
    appearedAt: string | null;
    resolvedText?: string | null;
    redDecided: boolean;
    redValidated: boolean;
    blueValidated: boolean;
    event: { text: string; points: number; duration: number };
}

interface ValidationScreenRoom {
    validationStatus?: string;
    winnerTeam?: string | null;
    victoryBonus?: boolean;
    players: PlayerV[];
    roomEvents?: RoomEventV[];
}

interface ValidationScreenProps {
    room: ValidationScreenRoom;
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

function getDifficultyStyle(difficulty: string) {
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
}

function MissionRow({ pm, type, decisions, onDecide }: {
    pm: PlayerMissionV;
    type: string;
    decisions: Record<string, boolean>;
    onDecide: (type: string, validated: boolean) => void;
}) {
    const color = getMissionColor(type);
    const validated = decisions[type] === true;
    const failed = decisions[type] === false;

    return (
        <div className={`flex items-start gap-4 p-4 rounded-lg border transition-all ${
            validated
                ? 'bg-green-900/30 border-green-500/50'
                : failed
                    ? 'bg-red-900/30 border-red-500/50'
                    : pm.mission.isPrivate
                        ? 'secret-mission-full'
                        : `bg-${color}-900/20 border-${color}-500/30`
        }`}>
            <span className="text-2xl flex-shrink-0 mt-0.5">{getMissionIcon(type)}</span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-sm font-semibold uppercase ${
                        pm.mission.isPrivate ? 'text-white' :
                        color === 'blue' ? 'text-blue-400' :
                        color === 'purple' ? 'text-purple-400' : 'text-red-400'
                    }`}>{getMissionLabel(type)}</span>
                    {pm.mission.isPrivate && <span className="text-white">🔒</span>}
                    {pm.mission.difficulty && (
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${getDifficultyStyle(pm.mission.difficulty).bg} ${getDifficultyStyle(pm.mission.difficulty).text}`}>
                            {getDifficultyStyle(pm.mission.difficulty).label}
                        </span>
                    )}
                    <span className={`text-sm ${pm.mission.isPrivate ? 'text-white' : 'lol-text-gold'}`}>+{pm.mission.points} pts</span>
                </div>
                <p className={`leading-relaxed ${pm.mission.isPrivate ? 'text-white' : 'lol-text-light'}`}>{pm.resolvedText || pm.mission.text}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
                <button
                    onClick={() => onDecide(type, true)}
                    className={`p-3 rounded-lg font-semibold transition-all border text-xl ${
                        validated
                            ? 'bg-green-600 border-green-400 text-white shadow-lg shadow-green-500/30'
                            : 'bg-[#1E2328] border-[#C8AA6E]/30 text-[#C89B3C] hover:bg-green-900/50 hover:border-green-500/50'
                    }`}
                    title="Validée"
                >
                    ✅
                </button>
                <button
                    onClick={() => onDecide(type, false)}
                    className={`p-3 rounded-lg font-semibold transition-all border text-xl ${
                        failed
                            ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-500/30'
                            : 'bg-[#1E2328] border-[#C8AA6E]/30 text-[#C89B3C] hover:bg-red-900/50 hover:border-red-500/50'
                    }`}
                    title="Échouée"
                >
                    ❌
                </button>
            </div>
        </div>
    );
}

export function ValidationScreen({ room, roomCode }: ValidationScreenProps) {
    const players = room.players.filter((p) => p.missions.length > 0);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [localDecisions, setLocalDecisions] = useState<Record<string, Record<string, boolean>>>({});
    const [finishing, setFinishing] = useState(false);
    const [resettingToTeams, setResettingToTeams] = useState(false);
    const [selectedWinnerTeam, setSelectedWinnerTeam] = useState<'red' | 'blue' | null>(
        room.winnerTeam === 'red' || room.winnerTeam === 'blue' ? room.winnerTeam : null
    );

    // L'étape bonus est pilotée par le serveur pour que tous les joueurs la voient
    const showBonusStep = room.validationStatus === 'bonus_selection';
    const showEventsStep = room.validationStatus === 'events_validation';

    // Réinitialiser finishing quand on change d'écran (via Pusher)
    useEffect(() => {
        setFinishing(false);
    }, [room.validationStatus]);

    // Événements apparus
    const appearedEvents = (room.roomEvents || []).filter((re) => re.appearedAt !== null);

    const creatorToken = typeof window !== 'undefined'
        ? localStorage.getItem(`room_${roomCode}_creator`)
        : null;
    const isCreator = !!creatorToken;

    const handleResetToTeams = async () => {
        if (!creatorToken) return;
        setResettingToTeams(true);

        try {
            const res = await fetch(`/api/games/aram-missions/${roomCode}/reset-to-teams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorToken }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur');
            }
        } catch (err) {
            console.error('Erreur reset to teams:', err);
        }
        setResettingToTeams(false);
    };

    const player = players[currentIndex];
    const playerDecisions = localDecisions[player?.id] || {};

    const startMission = player?.missions.find((m) => m.type === 'START');
    const midMission = player?.missions.find((m) => m.type === 'MID');
    const lateMission = player?.missions.find((m) => m.type === 'LATE');

    const allDecided = player?.missions.every((m) => playerDecisions[m.type] !== undefined);

    const validatedPlayers = players.slice(0, currentIndex).map((p) => {
        const totalPoints = localDecisions[p.id]
            ? p.missions.reduce((sum, m) => {
                return sum + (localDecisions[p.id][m.type] ? m.mission.points : 0);
            }, 0)
            : 0;
        return { ...p, totalPoints };
    });

    // Envoie une décision immédiatement sur le serveur
    const sendDecision = async (type: string, validated: boolean) => {
        setLocalDecisions(prev => ({
            ...prev,
            [player.id]: { ...prev[player.id], [type]: validated },
        }));

        const creatorToken = localStorage.getItem(`room_${roomCode}_creator`);
        try {
            await fetch(`/api/games/aram-missions/${roomCode}/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creatorToken,
                    playerId: player.id,
                    validations: { [type]: validated },
                }),
            });
        } catch (e) {
            console.error('Erreur envoi validation:', e);
        }
    };

    // Avance au suivant ou termine — envoie le PATCH d'abord pour que les spectateurs
    // se synchronisent sur le bon index
    const finishValidation = async (winnerTeam?: string) => {
        setFinishing(true);
        const creatorToken = localStorage.getItem(`room_${roomCode}_creator`);

        try {
            const res = await fetch(`/api/games/aram-missions/${roomCode}/validate`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    creatorToken,
                    winnerTeam: winnerTeam || null,
                }),
            });
            if (!res.ok) throw new Error('Finalisation échouée');
            // Succès : garder finishing=true, le Pusher update changera l'écran
        } catch (e) {
            console.error(e);
            alert('Erreur lors de la finalisation');
            setFinishing(false);
        }
    };

    const goNext = async () => {
        setFinishing(true);
        const creatorToken = localStorage.getItem(`room_${roomCode}_creator`);

        try {
            if (currentIndex >= players.length - 1) {
                // Dernier joueur — vérifier si on doit afficher l'étape événements
                if (appearedEvents.length > 0) {
                    const res = await fetch(`/api/games/aram-missions/${roomCode}/validate`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ creatorToken, eventsValidation: true }),
                    });
                    if (!res.ok) throw new Error('Passage aux événements échoué');
                    // Garder finishing=true, le Pusher update changera l'écran
                    return;
                }
                // Pas d'événements — vérifier si on doit afficher l'étape bonus
                if (room.victoryBonus) {
                    // PATCH pour passer en bonus_selection — tous les joueurs verront l'écran
                    const res = await fetch(`/api/games/aram-missions/${roomCode}/validate`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ creatorToken, bonusSelection: true }),
                    });
                    if (!res.ok) throw new Error('Passage au bonus échoué');
                    // Garder finishing=true, le Pusher update changera l'écran
                    return;
                }
                // Pas de bonus — termine directement
                await finishValidation();
                return;
            } else {
                // Pas dernier joueur — PATCH pour avancer l'index
                const nextIndex = currentIndex + 1;
                const res = await fetch(`/api/games/aram-missions/${roomCode}/validate`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ creatorToken, currentPlayerIndex: nextIndex }),
                });
                if (!res.ok) throw new Error('Avancement échoué');
                // Seulement après confirmation du serveur, on change l'index local
                setCurrentIndex(nextIndex);
                setFinishing(false);
            }
        } catch (e) {
            console.error(e);
            alert('Erreur lors du passage au joueur suivant');
            setFinishing(false);
        }
    };

    const selectWinnerTeam = async (team: 'red' | 'blue') => {
        setSelectedWinnerTeam(team);
        const creatorToken = localStorage.getItem(`room_${roomCode}_creator`);
        try {
            await fetch(`/api/games/aram-missions/${roomCode}/validate`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorToken, winnerTeam: team }),
            });
        } catch (e) {
            console.error('Erreur sync winnerTeam:', e);
        }
    };

    const finishWithBonus = async () => {
        await finishValidation(selectedWinnerTeam || undefined);
    };

    // State local optimiste pour les décisions d'événements
    // Clé: eventId, valeur: 'red' | 'blue' | 'none'
    const [localEventDecisions, setLocalEventDecisions] = useState<Record<string, string>>({});

    // Handler de validation d'un événement (optimiste)
    const sendEventDecision = async (roomEventId: string, winnerTeam: 'red' | 'blue' | 'none') => {
        setLocalEventDecisions(prev => ({ ...prev, [roomEventId]: winnerTeam }));

        const creatorToken = localStorage.getItem(`room_${roomCode}_creator`);
        try {
            await fetch(`/api/games/aram-missions/${roomCode}/validate-event`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorToken, roomEventId, winnerTeam }),
            });
        } catch (e) {
            console.error('Erreur validation événement:', e);
        }
    };

    // Helper : état effectif d'un événement (local optimiste > serveur)
    const getEventWinner = (re: RoomEventV): { decided: boolean; winner: 'red' | 'blue' | 'none' | null } => {
        if (re.id in localEventDecisions) {
            return { decided: true, winner: localEventDecisions[re.id] as 'red' | 'blue' | 'none' };
        }
        if (re.redDecided) {
            if (re.redValidated) return { decided: true, winner: 'red' };
            if (re.blueValidated) return { decided: true, winner: 'blue' };
            return { decided: true, winner: 'none' };
        }
        return { decided: false, winner: null };
    };

    // Passer des événements au bonus (ou finaliser)
    const goNextFromEvents = async () => {
        setFinishing(true);
        const creatorToken = localStorage.getItem(`room_${roomCode}_creator`);

        try {
            if (room.victoryBonus) {
                const res = await fetch(`/api/games/aram-missions/${roomCode}/validate`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ creatorToken, bonusSelection: true }),
                });
                if (!res.ok) throw new Error('Passage au bonus échoué');
            } else {
                await finishValidation();
                return;
            }
        } catch (e) {
            console.error(e);
            alert('Erreur');
            setFinishing(false);
        }
    };

    if (showEventsStep) {
        const allEventsDecided = appearedEvents.every((re) => getEventWinner(re).decided);

        return (
            <div className="space-y-6">
                <div className="lol-card rounded-lg p-6 text-center">
                    <div className="text-4xl mb-2">⚡</div>
                    <h1 className="text-3xl font-bold text-amber-400 mb-1 uppercase tracking-wide">Validation des événements</h1>
                    <p className="lol-text">Quelle équipe a réalisé l&apos;événement ?</p>
                </div>

                <div className="space-y-4">
                    {appearedEvents.map((re) => {
                        const { decided, winner } = getEventWinner(re);

                        return (
                        <div key={re.id} className="lol-card rounded-lg p-5 border border-amber-500/30">
                            <p className="text-amber-100 leading-relaxed mb-4 text-lg">{re.resolvedText || re.event.text}</p>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-sm font-bold text-amber-300">+{re.event.points} pts</span>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => sendEventDecision(re.id, 'blue')}
                                    className={`p-3 rounded-lg font-bold text-sm transition-all border-2 ${
                                        decided && winner === 'blue'
                                            ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30'
                                            : decided && winner !== 'blue'
                                                ? 'bg-blue-900/20 border-blue-500/20 text-blue-400/50'
                                                : 'bg-blue-900/30 border-blue-500/30 text-blue-400 hover:bg-blue-900/50 hover:border-blue-500/50'
                                    }`}
                                >
                                    🔵 Bleue
                                </button>
                                <button
                                    onClick={() => sendEventDecision(re.id, 'none')}
                                    className={`p-3 rounded-lg font-bold text-sm transition-all border-2 ${
                                        decided && winner === 'none'
                                            ? 'bg-gray-600 border-gray-400 text-white shadow-lg shadow-gray-500/30'
                                            : decided && winner !== 'none'
                                                ? 'bg-gray-900/20 border-gray-500/20 text-gray-400/50'
                                                : 'bg-gray-900/30 border-gray-500/30 text-gray-400 hover:bg-gray-900/50 hover:border-gray-500/50'
                                    }`}
                                >
                                    ❌ Aucune
                                </button>
                                <button
                                    onClick={() => sendEventDecision(re.id, 'red')}
                                    className={`p-3 rounded-lg font-bold text-sm transition-all border-2 ${
                                        decided && winner === 'red'
                                            ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-500/30'
                                            : decided && winner !== 'red'
                                                ? 'bg-red-900/20 border-red-500/20 text-red-400/50'
                                                : 'bg-red-900/30 border-red-500/30 text-red-400 hover:bg-red-900/50 hover:border-red-500/50'
                                    }`}
                                >
                                    🔴 Rouge
                                </button>
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

                <div className="flex justify-center">
                    <button
                        onClick={goNextFromEvents}
                        disabled={!allEventsDecided || finishing}
                        className="lol-button-hextech px-6 py-3 rounded-lg font-bold transition-all hextech-pulse disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {finishing ? 'En cours...' : 'Suivant'}
                    </button>
                </div>
            </div>
        );
    }

    if (showBonusStep) {
        return (
            <div className="space-y-6">
                <div className="lol-card rounded-lg p-6 text-center">
                    <div className="text-4xl mb-2">🏆</div>
                    <h1 className="text-3xl font-bold lol-title-gold mb-1 uppercase tracking-wide">Bonus de victoire</h1>
                    <p className="lol-text">Quelle équipe a remporté la partie ?</p>
                    <p className="lol-text text-sm mt-1 opacity-75">Un bonus mystère sera tiré au sort pour l&apos;équipe gagnante 🎲</p>
                </div>

                <div className="lol-card rounded-lg p-6">
                    <h3 className="text-lg font-bold lol-title-gold mb-4">Équipe gagnante</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => selectWinnerTeam('blue')}
                            className={`p-4 rounded-lg font-bold text-lg transition-all border-2 ${
                                selectedWinnerTeam === 'blue'
                                    ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30'
                                    : 'bg-blue-900/30 border-blue-500/30 text-blue-400 hover:bg-blue-900/50 hover:border-blue-500/50'
                            }`}
                        >
                            🔵 Bleue
                        </button>
                        <button
                            onClick={() => selectWinnerTeam('red')}
                            className={`p-4 rounded-lg font-bold text-lg transition-all border-2 ${
                                selectedWinnerTeam === 'red'
                                    ? 'bg-red-600 border-red-400 text-white shadow-lg shadow-red-500/30'
                                    : 'bg-red-900/30 border-red-500/30 text-red-400 hover:bg-red-900/50 hover:border-red-500/50'
                            }`}
                        >
                            🔴 Rouge
                        </button>
                    </div>
                </div>

                <div className="flex justify-center">
                    <button
                        onClick={finishWithBonus}
                        disabled={selectedWinnerTeam === null || finishing}
                        className="lol-button-hextech px-6 py-3 rounded-lg font-bold transition-all hextech-pulse disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {finishing ? 'En cours...' : 'Valider et tirer le bonus'}
                    </button>
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
                        <div className="text-4xl mb-2">⚖️</div>
                        <h1 className="text-3xl font-bold lol-title-gold mb-1 uppercase tracking-wide">Validation des missions</h1>
                        <p className="lol-text">
                            Invocateur <span className="font-bold lol-text-gold">{currentIndex + 1}</span> / {players.length}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {isCreator && (
                            <button
                                onClick={handleResetToTeams}
                                disabled={resettingToTeams}
                                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50"
                                title="Retourner à la sélection des équipes"
                            >
                                {resettingToTeams ? '⏳' : '👥'} Équipes
                            </button>
                        )}
                        <LeaveRoomButton roomCode={roomCode} />
                    </div>
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

            {/* Current player validation */}
            <div className="lol-card rounded-lg p-5 border-2 border-[#0AC8B9]/50 shadow-lg shadow-[#0AC8B9]/20">
                <div className="flex items-center gap-3 mb-4">
                    {player?.avatar ? (

                        <img
                            src={player.avatar}
                            alt={player.name}
                            className="w-12 h-12 rounded-full border-2 border-[#C8AA6E]"
                        />
                    ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-[#C8AA6E] to-[#785A28] rounded-full flex items-center justify-center text-[#010A13] font-bold text-xl">
                            {player?.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h2 className="text-xl font-bold lol-text-light">{player?.name}</h2>
                        <p className="text-xs lol-text">{player?.missions.length} mission{player?.missions.length > 1 ? 's' : ''} à valider</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {startMission && <MissionRow pm={startMission} type="START" decisions={playerDecisions} onDecide={sendDecision} />}
                    {midMission && <MissionRow pm={midMission} type="MID" decisions={playerDecisions} onDecide={sendDecision} />}
                    {lateMission && <MissionRow pm={lateMission} type="LATE" decisions={playerDecisions} onDecide={sendDecision} />}
                </div>

                <div className="mt-5 flex justify-center">
                    <button
                        onClick={goNext}
                        disabled={!allDecided || finishing}
                        className="lol-button-hextech px-6 py-3 rounded-lg font-bold transition-all hextech-pulse disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {finishing
                            ? 'En cours...'
                            : currentIndex < players.length - 1
                                ? 'Invocateur suivant'
                                : 'Terminer la validation'
                        }
                    </button>
                </div>
            </div>

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
                                        {p.missions.filter((m) => localDecisions[p.id]?.[m.type]).length}/{p.missions.length} ✓
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
