'use client';

import { useState } from 'react';
import { PlayerList } from './PlayerList';
import { TeamSelector } from './TeamSelector';
import { MissionDelayPicker } from '@/app/games/aram-missions/components/MissionDelayPicker';
import { LeaveRoomButton } from './LeaveRoomButton';

interface Room {
    id: string;
    code: string;
    players: any[];
    midMissionDelay: number;
    lateMissionDelay: number;
}

interface RoomLobbyProps {
    room: Room;
    roomCode: string;
}

const RULES = [
    {
        id: 'teams',
        icon: '⚔️',
        title: 'Équipes',
        content: (
            <p className="lol-text text-sm leading-relaxed">
                Choisissez l'équipe Rouge ou Bleue avant le démarrage. Chaque équipe peut avoir au plus 5 joueurs.
                Vous pouvez changer d'équipe ou retour en spectateur à tout moment avant que le créateur ne lance la partie.
            </p>
        ),
    },
    {
        id: 'missions',
        icon: '📜',
        title: 'Missions',
        content: (
            <div className="space-y-3">
                <p className="lol-text text-sm leading-relaxed">
                    Chaque invocateur reçoit 3 missions au fil de la partie :
                </p>
                <div className="space-y-2">
                    {[
                        { color: 'bg-blue-500', label: 'Mission Début', desc: 'Disponible dès que le créateur lance la partie.' },
                        { color: 'bg-purple-500', label: 'Mission MID', desc: 'Apparaît après le délai configuré.' },
                        { color: 'bg-red-500', label: 'Mission Finale', desc: 'Apparaît en fin de partie.' },
                    ].map(m => (
                        <div key={m.label} className="flex items-start gap-2.5">
                            <span className={`inline-block mt-1.5 w-2.5 h-2.5 rounded-full ${m.color} flex-shrink-0`}></span>
                            <p className="lol-text text-sm leading-relaxed">
                                <span className="font-semibold lol-text-gold">{m.label}</span> — {m.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: 'secret',
        icon: '🔒',
        title: 'Missions secrètes',
        content: (
            <p className="lol-text text-sm leading-relaxed">
                Certaines missions sont secrètes : seul l'invocateur concerné voit le texte pendant la partie.
                Les autres ne voient qu'un bloc flou avec le badge 🔒. Tout est révélé lors de la validation.
            </p>
        ),
    },
    {
        id: 'points',
        icon: '💰',
        title: 'Points',
        content: (
            <div className="space-y-3">
                <p className="lol-text text-sm leading-relaxed">
                    Chaque mission validée rapporte des points selon sa difficulté :
                </p>
                <div className="flex gap-2 flex-wrap">
                    {[
                        { bg: 'from-green-600 to-green-800', label: 'Facile — 100 pts' },
                        { bg: 'from-yellow-600 to-yellow-800', label: 'Moyen — 200 pts' },
                        { bg: 'from-red-600 to-red-800', label: 'Difficile — 500 pts' },
                    ].map(p => (
                        <span key={p.label} className={`inline-flex items-center gap-1.5 bg-gradient-to-b ${p.bg} border border-[#C8AA6E]/50 text-[#F0E6D2] text-sm font-semibold px-3 py-1 rounded`}>
                            {p.label}
                        </span>
                    ))}
                </div>
            </div>
        ),
    },
    {
        id: 'validation',
        icon: '✅',
        title: 'Validation',
        content: (
            <p className="lol-text text-sm leading-relaxed">
                Quand le créateur arrête le compteur, la phase de validation commence.
                Il vérifie chaque mission invocateur par invocateur, devant tout le monde.
            </p>
        ),
    },
    {
        id: 'victory',
        icon: '🏆',
        title: 'Victoire',
        content: (
            <p className="lol-text text-sm leading-relaxed">
                À la fin, les points sont additionnés par équipe.
                L'équipe avec le plus grand total remporte la partie !
            </p>
        ),
    },
];

export function RoomLobby({ room, roomCode }: RoomLobbyProps) {
    const [starting, setStarting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [openRule, setOpenRule] = useState<string | null>(null);

    const creatorToken = typeof window !== 'undefined'
        ? localStorage.getItem(`room_${roomCode}_creator`)
        : null;
    const isCreator = !!creatorToken;

    const playerToken = typeof window !== 'undefined'
        ? localStorage.getItem(`room_${roomCode}_player`)
        : null;

    const handleStart = async () => {
        if (!creatorToken) return;
        setStarting(true);
        setError(null);

        try {
            const response = await fetch(`/api/games/aram-missions/${roomCode}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorToken }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to start game');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to start game');
            setStarting(false);
        }
    };

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/room/${roomCode}`
        : '';

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 3000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="lol-card rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold lol-title mb-2">
                            <span className="lol-title-gold">ARAM</span> Missions
                        </h1>
                        <p className="lol-text">
                            Room : <span className="font-mono font-bold lol-text-gold">{roomCode}</span>
                        </p>
                    </div>
                    <LeaveRoomButton roomCode={roomCode} />
                </div>

                <div className="lol-divider my-4"></div>

                <div className="max-w-2xl mx-auto">
                    <p className="text-sm lol-text mb-2">Partage ce lien avec tes alliés :</p>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            className="lol-input flex-1 px-4 py-2 rounded-lg text-sm"
                        />
                        <button
                            onClick={copyToClipboard}
                            className={`lol-button px-6 py-2 rounded-lg transition-all ${
                                copied ? 'border-[#0AC8B9] text-[#0AC8B9]' : ''
                            }`}
                        >
                            {copied ? '✓ Copié !' : '📋 Copier'}
                        </button>
                    </div>
                    {copied && (
                        <div className="mt-3 p-2 bg-[#0AC8B9]/20 border border-[#0AC8B9] text-[#0AC8B9] rounded-lg text-sm font-medium text-center">
                            ✓ Lien copié dans le presse-papier !
                        </div>
                    )}
                </div>
            </div>

            {/* Liste des joueurs */}
            <PlayerList players={room.players} />

            {/* Sélection des équipes */}
            <TeamSelector
                players={room.players}
                roomCode={roomCode}
                currentPlayerToken={playerToken}
            />

            {/* Délais des missions */}
            <MissionDelayPicker
                midMissionDelay={room.midMissionDelay}
                lateMissionDelay={room.lateMissionDelay}
                isCreator={isCreator}
                roomCode={roomCode}
                creatorToken={creatorToken}
            />

            {/* Start button (creator only) */}
            {isCreator && (
                <div className="lol-card rounded-lg p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-900/50 border border-red-500 text-red-300 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleStart}
                        disabled={starting || room.players.length < 2}
                        className="lol-button-hextech w-full py-4 rounded-lg font-bold text-xl transition-all hextech-pulse"
                    >
                        {starting ? '⚔️ Préparation...' : '⚔️ LANCER LA BATAILLE'}
                    </button>

                    {room.players.length < 2 && (
                        <p className="mt-3 text-center text-sm lol-text">
                            Il faut au moins 2 invocateurs pour commencer
                        </p>
                    )}
                </div>
            )}

            {!isCreator && (
                <div className="lol-card rounded-lg p-6 text-center">
                    <div className="text-4xl mb-2">⏳</div>
                    <p className="lol-text-gold">
                        En attente que le créateur lance la bataille...
                    </p>
                </div>
            )}

            {/* Règles du jeu */}
            <div className="lol-card rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-[#C8AA6E]/30">
                    <h3 className="text-lg font-bold lol-title-gold flex items-center gap-2">
                        <span>📜</span> Règles du combat
                    </h3>
                </div>

                <div className="divide-y divide-[#C8AA6E]/20">
                    {RULES.map((rule) => {
                        const isOpen = openRule === rule.id;
                        return (
                            <div key={rule.id}>
                                <button
                                    onClick={() => setOpenRule(isOpen ? null : rule.id)}
                                    className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-[#C8AA6E]/10 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{rule.icon}</span>
                                        <span className={`font-semibold ${isOpen ? 'lol-text-gold' : 'lol-text-light'}`}>
                                            {rule.title}
                                        </span>
                                    </div>
                                    <span className={`lol-text text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </button>

                                {isOpen && (
                                    <div className="px-6 pb-4 pt-1 bg-[#010A13]/50">
                                        {rule.content}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
