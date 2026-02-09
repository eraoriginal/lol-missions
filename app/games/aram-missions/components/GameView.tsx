'use client';

import { useState, useEffect, useRef } from 'react';
import { OtherPlayersMissions } from './OtherPlayersMissions';
import { MissionChoiceOverlay } from './MissionChoiceOverlay';
import { EventOverlay } from './EventOverlay';
import { Timer } from '@/app/components/Timer';
import { LeaveRoomButton } from '@/app/components/LeaveRoomButton';
import { StopGameButton } from '@/app/components/StopGameButton';
import { GameEndScreen } from '@/app/components/GameEndScreen';
import type { RoomEvent } from '@/app/types/room';

interface Room {
    id: string;
    code: string;
    gameStartTime: string | null;
    gameStopped: boolean;
    midMissionDelay: number;
    lateMissionDelay: number;
    missionVisibility: 'all' | 'team' | 'hidden';
    missionChoiceCount?: number;
    maxEventsPerGame?: number;
    eventPausedAt?: string | null;
    totalPausedDuration?: number;
    roomEvents?: RoomEvent[];
    players: any[];
}

interface GameViewProps {
    room: Room;
    roomCode: string;
}

// Composant pour un événement actif avec countdown live
function ActiveEventCountdown({ event }: { event: RoomEvent }) {
    const [remaining, setRemaining] = useState(() => {
        if (event.appearedAt) {
            const elapsed = (Date.now() - new Date(event.appearedAt).getTime()) / 1000;
            return Math.max(0, Math.ceil(event.event.duration - elapsed));
        }
        return event.event.duration;
    });

    useEffect(() => {
        const interval = setInterval(() => {
            if (event.appearedAt) {
                const elapsed = (Date.now() - new Date(event.appearedAt).getTime()) / 1000;
                setRemaining(Math.max(0, Math.ceil(event.event.duration - elapsed)));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [event.appearedAt, event.event.duration]);

    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    const display = remaining >= 60
        ? `${minutes}:${String(seconds).padStart(2, '0')}`
        : `${remaining}s`;

    return (
        <span className="text-xs font-mono font-bold text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-500/40">
            ⏱ {display}
        </span>
    );
}

// Set global pour tracker les missions déjà annoncées (persiste entre les re-renders)
const announcedMissionsGlobal = new Set<string>();

// Composant MissionCard qui gère son propre TTS à l'affichage
function MissionCard({
    mission,
    type,
    gameStopped,
    enableTTS,
    missionVisibility,
    getDifficultyStyle
}: {
    mission: any;
    type: 'START' | 'MID' | 'LATE';
    gameStopped: boolean;
    enableTTS: boolean;
    missionVisibility: 'all' | 'team' | 'hidden';
    getDifficultyStyle: (d: string) => { bg: string; text: string; label: string };
}) {
    const hasAnnouncedRef = useRef(false);

    // Texte affiché (resolvedText si disponible, sinon texte original)
    const displayText = mission.resolvedText || mission.mission.text;

    // TTS déclenché au montage du composant (= quand la mission s'affiche)
    useEffect(() => {
        // Ne pas annoncer si TTS désactivé (mode choix), déjà fait, ou jeu arrêté
        if (!enableTTS) return;
        if (hasAnnouncedRef.current) return;
        if (gameStopped) return;
        if (!mission?.mission?.id || !mission?.mission?.text) return;

        const missionId = mission.mission.id;

        // Vérifier le Set global pour éviter les doublons (même entre composants)
        if (announcedMissionsGlobal.has(missionId)) return;

        // Marquer comme annoncé
        hasAnnouncedRef.current = true;
        announcedMissionsGlobal.add(missionId);

        // TTS - utilise le texte résolu si disponible
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const showAsSecret = mission.mission.isPrivate && missionVisibility !== 'hidden';
            const prefix = showAsSecret ? 'Mission secrète : ' : '';
            const textToSpeak = mission.resolvedText || mission.mission.text;
            const fullText = prefix + textToSpeak;

            console.log(`[MissionCard TTS] Annonce ${type}:`, fullText);

            // Petit délai pour s'assurer que le DOM est prêt
            setTimeout(() => {
                if (gameStopped) return;

                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(fullText);
                utterance.lang = 'fr-FR';
                utterance.rate = 1;
                utterance.volume = 0.9;

                const voices = window.speechSynthesis.getVoices();
                const frenchVoice = voices.find(v => v.lang.startsWith('fr'));
                if (frenchVoice) {
                    utterance.voice = frenchVoice;
                }

                window.speechSynthesis.speak(utterance);
            }, 100);
        }
    }, [mission, type, gameStopped, enableTTS, missionVisibility]);

    // En mode "hidden", pas de notion de mission secrète (personne d'autre ne voit les missions)
    const isPrivate = mission.mission.isPrivate && missionVisibility !== 'hidden';
    const difficulty = mission.mission.difficulty;

    // Styles selon le type
    const typeStyles = {
        START: {
            bg: isPrivate ? 'secret-mission-full' : 'bg-slate-800/60 border border-slate-400/30',
            label: 'Début',
            labelColor: isPrivate ? 'text-white' : 'text-slate-300',
            textColor: isPrivate ? 'text-white' : 'text-slate-200',
            icon: isPrivate ? '🔒' : '⚔️',
        },
        MID: {
            bg: isPrivate ? 'secret-mission-full' : 'bg-zinc-700/60 border border-zinc-400/30',
            label: 'MID',
            labelColor: isPrivate ? 'text-white' : 'text-zinc-300',
            textColor: isPrivate ? 'text-white' : 'text-zinc-200',
            icon: isPrivate ? '🔒' : '⚡',
        },
        LATE: {
            bg: isPrivate ? 'secret-mission-full' : 'bg-gray-600/60 border border-gray-400/30',
            label: 'Finale',
            labelColor: isPrivate ? 'text-white' : 'text-gray-300',
            textColor: isPrivate ? 'text-white' : 'text-gray-200',
            icon: isPrivate ? '🔒' : '🔥',
        },
    };

    const style = typeStyles[type];

    return (
        <div className={`flex items-start gap-3 p-4 rounded-lg ${style.bg}`}>
            <span className="text-2xl flex-shrink-0">{style.icon}</span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-sm font-semibold uppercase ${style.labelColor}`}>{style.label}</span>
                    {difficulty && (
                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${getDifficultyStyle(difficulty).bg} ${getDifficultyStyle(difficulty).text}`}>
                            {getDifficultyStyle(difficulty).label}
                        </span>
                    )}
                    {type !== 'START' && !isPrivate && (
                        <span className="text-sm px-2 py-0.5 bg-gray-500/30 text-gray-300 rounded animate-pulse">Nouveau</span>
                    )}
                </div>
                <p className={`leading-relaxed ${style.textColor}`}>{displayText}</p>
            </div>
        </div>
    );
}

export function GameView({ room, roomCode }: GameViewProps) {
    const [launching, setLaunching] = useState(false);
    const [launchError, setLaunchError] = useState<string | null>(null);
    const [restarting, setRestarting] = useState(false);
    const [resettingToTeams, setResettingToTeams] = useState(false);
    const dismissedEventsRef = useRef(new Set<string>());
    const [, forceUpdate] = useState(0);

    const playerToken = typeof window !== 'undefined'
        ? localStorage.getItem(`room_${roomCode}_player`)
        : null;

    const creatorToken = typeof window !== 'undefined'
        ? localStorage.getItem(`room_${roomCode}_creator`)
        : null;

    const isCreator = !!creatorToken;

    // Cherche le joueur par playerToken
    const currentPlayer = room.players.find((p: any) => p.token === playerToken);

    // Missions du joueur actuel
    const startMission = currentPlayer?.missions.find((m: any) => m.type === 'START');
    const midMission = currentPlayer?.missions.find((m: any) => m.type === 'MID');
    const lateMission = currentPlayer?.missions.find((m: any) => m.type === 'LATE');

    // Pending choices du joueur actuel
    const pendingChoices = currentPlayer?.pendingChoices || [];
    const startPending = pendingChoices.filter((c: any) => c.type === 'START');
    const midPending = pendingChoices.filter((c: any) => c.type === 'MID');
    const latePending = pendingChoices.filter((c: any) => c.type === 'LATE');

    // Détermine le type actif (priorité START > MID > LATE)
    const activePendingType = startPending.length > 0 ? 'START'
        : midPending.length > 0 ? 'MID'
        : latePending.length > 0 ? 'LATE'
        : null;
    const activePendingChoices = activePendingType === 'START' ? startPending
        : activePendingType === 'MID' ? midPending
        : activePendingType === 'LATE' ? latePending
        : [];

    // Reset le Set global quand la mission START change (nouvelles missions après restart)
    const prevStartMissionIdRef = useRef<string | null>(null);
    useEffect(() => {
        const currentStartId = startMission?.mission?.id || null;
        if (currentStartId && prevStartMissionIdRef.current && currentStartId !== prevStartMissionIdRef.current) {
            console.log('[GameView] Nouvelles missions détectées, reset du Set global');
            announcedMissionsGlobal.clear();
        }
        prevStartMissionIdRef.current = currentStartId;
    }, [startMission]);

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

    // Reset launching state when gameStartTime is reset (after restart)
    useEffect(() => {
        if (!room.gameStartTime) {
            setLaunching(false);
            setLaunchError(null);
        }
    }, [room.gameStartTime]);

    // Événements apparus (pour la liste)
    const appearedEvents = (room.roomEvents || []).filter(re => re.appearedAt !== null);
    // Événement actif en cours (apparu mais pas terminé)
    const activeRoomEvent = appearedEvents.find(re => !re.endedAt);
    // Overlay: événement actif non dismissé
    const activeEvent = activeRoomEvent && !dismissedEventsRef.current.has(activeRoomEvent.id) ? activeRoomEvent : null;

    const handleDismissEvent = (eventId: string) => {
        dismissedEventsRef.current.add(eventId);
        forceUpdate(n => n + 1);
    };

    // Si le jeu est arrêté, afficher l'écran de fin
    if (room.gameStopped) {
        return <GameEndScreen room={room} roomCode={roomCode} isCreator={isCreator} />;
    }

    const handleLaunch = async () => {
        if (!creatorToken) return;
        setLaunching(true);
        setLaunchError(null);

        try {
            const res = await fetch(`/api/games/aram-missions/${roomCode}/launch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorToken }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur');
            }
        } catch (err) {
            setLaunchError(err instanceof Error ? err.message : 'Erreur');
            setLaunching(false);
        }
    };

    const handleRestartGame = async () => {
        if (!creatorToken) return;
        setRestarting(true);

        try {
            const res = await fetch(`/api/games/aram-missions/${roomCode}/restart-game`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorToken }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Erreur');
            }
        } catch (err) {
            console.error('Erreur restart:', err);
        }
        setRestarting(false);
    };

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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="lol-card rounded-lg p-6">
                <div className="flex justify-between items-center">
                    <div className="flex-1 text-center">
                        <h1 className="text-3xl font-bold lol-title mb-2">
                            <span className="lol-title-gold">⚔️ Combat</span> en cours
                        </h1>
                        <p className="lol-text">
                            Room : <span className="font-mono font-bold lol-text-gold">{roomCode}</span>
                        </p>
                    </div>
                    <div className="flex gap-2 flex-wrap justify-end">
                        {isCreator && (
                            <>
                                <button
                                    onClick={handleRestartGame}
                                    disabled={restarting}
                                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50"
                                    title="Recommencer avec de nouvelles missions"
                                >
                                    {restarting ? '⏳' : '🔄'} Recommencer
                                </button>
                                <button
                                    onClick={handleResetToTeams}
                                    disabled={resettingToTeams}
                                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50"
                                    title="Retourner à la sélection des équipes"
                                >
                                    {resettingToTeams ? '⏳' : '👥'} Équipes
                                </button>
                                {room.gameStartTime && <StopGameButton roomCode={roomCode} />}
                            </>
                        )}
                        <LeaveRoomButton roomCode={roomCode} />
                    </div>
                </div>
            </div>

            {/* Timer ou écran d'attente */}
            {room.gameStartTime ? (
                <Timer
                    gameStartTime={room.gameStartTime}
                    roomCode={roomCode}
                    gameStopped={room.gameStopped}
                    midMissionDelay={room.midMissionDelay}
                    lateMissionDelay={room.lateMissionDelay}
                    maxEventsPerGame={room.maxEventsPerGame}
                    roomEvents={room.roomEvents}
                    eventPausedAt={room.eventPausedAt}
                    totalPausedDuration={room.totalPausedDuration}
                />
            ) : (
                <div className="lol-card rounded-lg p-8 text-center">
                    <h2 className="text-2xl font-bold lol-title-gold mb-2">
                        Préparez-vous, invocateurs !
                    </h2>
                    <p className="lol-text mb-6">
                        Vos missions apparaîtront quand le combat sera lancé.
                    </p>

                    {isCreator ? (
                        <div className="space-y-3">
                            <button
                                onClick={handleLaunch}
                                disabled={launching}
                                className="lol-button-hextech px-10 py-4 rounded-lg font-bold text-xl transition-all hextech-pulse"
                            >
                                {launching ? '⏳ Préparation...' : 'LANCER LE COMBAT'}
                            </button>
                            {launchError && (
                                <p className="text-red-400 text-sm">{launchError}</p>
                            )}
                        </div>
                    ) : (
                        <p className="lol-text italic">
                            En attente que le créateur lance le combat...
                        </p>
                    )}
                </div>
            )}

            {/* Missions unifiées — visibles uniquement après le lancement du compteur */}
            {room.gameStartTime && (
                <div className="lol-card rounded-lg p-5">
                    <h2 className="text-xl font-bold lol-title-gold mb-4 flex items-center gap-2">
                        📜 Tes missions
                    </h2>

                    <div className="space-y-3">
                        {startMission && (
                            <MissionCard
                                key={startMission.mission.id}
                                mission={startMission}
                                type="START"
                                gameStopped={room.gameStopped}
                                enableTTS={(room.missionChoiceCount ?? 1) === 1}
                                missionVisibility={room.missionVisibility}
                                getDifficultyStyle={getDifficultyStyle}
                            />
                        )}

                        {midMission && (
                            <MissionCard
                                key={midMission.mission.id}
                                mission={midMission}
                                type="MID"
                                gameStopped={room.gameStopped}
                                enableTTS={(room.missionChoiceCount ?? 1) === 1}
                                missionVisibility={room.missionVisibility}
                                getDifficultyStyle={getDifficultyStyle}
                            />
                        )}

                        {lateMission && (
                            <MissionCard
                                key={lateMission.mission.id}
                                mission={lateMission}
                                type="LATE"
                                gameStopped={room.gameStopped}
                                enableTTS={(room.missionChoiceCount ?? 1) === 1}
                                missionVisibility={room.missionVisibility}
                                getDifficultyStyle={getDifficultyStyle}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Missions des autres joueurs — visibles uniquement après le lancement */}
            {room.gameStartTime && (
                <OtherPlayersMissions
                    players={room.players}
                    currentPlayerToken={playerToken}
                    missionVisibility={room.missionVisibility}
                    currentPlayerTeam={currentPlayer?.team}
                />
            )}

            {/* Événements */}
            {room.gameStartTime && appearedEvents.length > 0 && (
                <div className="lol-card rounded-lg p-5">
                    <h2 className="text-xl font-bold text-amber-400 mb-4 flex items-center gap-2">
                        ⚡ Événements
                    </h2>
                    <div className="space-y-3">
                        {appearedEvents.map(re => {
                            const isActive = !re.endedAt;
                            return (
                                <div key={re.id} className={`flex items-start gap-3 p-3 rounded-lg ${isActive ? 'bg-amber-900/40 border-2 border-amber-500 animate-pulse' : 'bg-amber-900/20 border border-amber-500/30 opacity-60'}`}>
                                    <span className="text-xl flex-shrink-0">{isActive ? '⚡' : '✅'}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className={`leading-relaxed ${isActive ? 'text-amber-100' : 'text-amber-200/60'}`}>{re.event.text}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-amber-300 font-bold">+{re.event.points} pts</span>
                                            {isActive && <ActiveEventCountdown event={re} />}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Overlay de choix de mission */}
            {room.gameStartTime && activePendingType && activePendingChoices.length > 0 && (
                <MissionChoiceOverlay
                    key={activePendingType}
                    choices={activePendingChoices}
                    type={activePendingType as 'START' | 'MID' | 'LATE'}
                    roomCode={roomCode}
                    missionVisibility={room.missionVisibility}
                    onChosen={() => {}}
                />
            )}

            {/* Overlay d'événement (seulement pour événements actifs non terminés) */}
            {room.gameStartTime && activeEvent && !room.gameStopped && (
                <EventOverlay
                    event={activeEvent}
                    onDismiss={handleDismissEvent}
                />
            )}
        </div>
    );
}
