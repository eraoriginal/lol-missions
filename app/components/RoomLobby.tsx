'use client';

import { useState } from 'react';
import { PlayerList } from './PlayerList';
import { TeamSelector } from './TeamSelector';
import { MissionDelayPicker } from './MissionDelayPicker';
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
        icon: '🔴🔵',
        title: 'Équipes',
        content: (
            <p className="text-gray-600 text-sm leading-relaxed">
                Choisissez l'équipe Rouge ou Bleue avant le démarrage. Chaque équipe peut avoir au plus 5 joueurs.
                Vous pouvez changer d'équipe ou retour en spectateur à tout moment avant que le créateur ne lance la partie.
            </p>
        ),
    },
    {
        id: 'missions',
        icon: '📋',
        title: 'Missions',
        content: (
            <div className="space-y-3">
                <p className="text-gray-600 text-sm leading-relaxed">
                    Chaque joueur reçoit 3 missions au fil de la partie :
                </p>
                <div className="space-y-2">
                    {[
                        { color: 'bg-blue-500', label: 'Mission Début', desc: 'Disponible dès que le créateur lance la partie. Vous pouvez la voir avant même que le compteur ne tourne.' },
                        { color: 'bg-purple-500', label: 'Mission MID', desc: 'Apparaît après le délai configuré par le créateur une fois le compteur lancé.' },
                        { color: 'bg-red-500', label: 'Mission Finale', desc: 'Apparaît en fin de partie. Accomplissez-la avant que le créateur ne stop le compteur !' },
                    ].map(m => (
                        <div key={m.label} className="flex items-start gap-2.5">
                            <span className={`inline-block mt-1.5 w-2.5 h-2.5 rounded-full ${m.color} flex-shrink-0`}></span>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                <span className="font-semibold text-gray-700">{m.label}</span> — {m.desc}
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
            <p className="text-gray-600 text-sm leading-relaxed">
                Certaines missions sont secrètes : seul le joueur concerné voit le texte et la difficulté pendant la partie.
                Les autres joueurs ne voient qu'un bloc flou avec le badge 🔒. Tout est révélé à tous lors de la validation à la fin.
            </p>
        ),
    },
    {
        id: 'points',
        icon: '💰',
        title: 'Points',
        content: (
            <div className="space-y-3">
                <p className="text-gray-600 text-sm leading-relaxed">
                    Chaque mission validée rapporte des points selon sa difficulté :
                </p>
                <div className="flex gap-2 flex-wrap">
                    {[
                        { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', dot: 'bg-green-400', label: 'Facile — 100 pts' },
                        { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', dot: 'bg-yellow-400', label: 'Moyen — 200 pts' },
                        { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', dot: 'bg-red-400', label: 'Difficile — 500 pts' },
                    ].map(p => (
                        <span key={p.label} className={`inline-flex items-center gap-1.5 ${p.bg} border ${p.border} ${p.text} text-sm font-semibold px-3 py-1 rounded-full`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${p.dot}`}></span>
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
            <p className="text-gray-600 text-sm leading-relaxed">
                Quand le créateur arrête le compteur, la phase de validation commence.
                Il vérifie chaque mission joueur par joueur, devant tout le monde en temps réel.
                Chaque mission est soit validée ✅ (vous gagnez les points), soit échouée ❌ (0 point).
            </p>
        ),
    },
    {
        id: 'victory',
        icon: '🏆',
        title: 'Victoire',
        content: (
            <p className="text-gray-600 text-sm leading-relaxed">
                À la fin, les points de chaque joueur sont additionnés par équipe.
                Les joueurs sont classés par ordre décroissant de points au sein de leur équipe.
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
            const response = await fetch(`/api/rooms/${roomCode}/start`, {
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
            <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Room: {roomCode}
                        </h1>
                        <p className="text-gray-600">
                            En attente que le créateur lance la partie...
                        </p>
                    </div>
                    <LeaveRoomButton roomCode={roomCode} />
                </div>

                <div className="max-w-2xl mx-auto">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            className="flex-1 px-4 py-2 border rounded-lg bg-gray-50 text-gray-700"
                        />
                        <button
                            onClick={copyToClipboard}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                copied
                                    ? 'bg-green-600 text-white'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {copied ? '✓ Copié !' : '📋 Copier'}
                        </button>
                    </div>
                    {copied && (
                        <div className="mt-3 p-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
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

            {/* Délais des missions — editable créateur, lecture seule autres */}
            <MissionDelayPicker
                midMissionDelay={room.midMissionDelay}
                lateMissionDelay={room.lateMissionDelay}
                isCreator={isCreator}
                roomCode={roomCode}
                creatorToken={creatorToken}
            />

            {/* Start button (creator only) */}
            {isCreator && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleStart}
                        disabled={starting || room.players.length < 2}
                        className="w-full py-4 bg-green-600 text-white rounded-lg font-bold text-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {starting ? '🚀 Démarrage...' : '🎮 LANCER LA PARTIE'}
                    </button>

                    {room.players.length < 2 && (
                        <p className="mt-3 text-center text-sm text-gray-500">
                            Il faut au moins 2 joueurs pour commencer
                        </p>
                    )}
                </div>
            )}

            {!isCreator && (
                <div className="bg-blue-50 rounded-xl p-6 text-center">
                    <p className="text-blue-800">
                        ⏳ Attente du créateur pour lancer la partie...
                    </p>
                </div>
            )}

            {/* ========== ACCORDÉON RÈGLES — EN BAS ========== */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <span>📜</span> Règles du jeu
                    </h3>
                </div>

                <div className="divide-y divide-gray-100">
                    {RULES.map((rule) => {
                        const isOpen = openRule === rule.id;
                        return (
                            <div key={rule.id}>
                                {/* Ligne cliquable */}
                                <button
                                    onClick={() => setOpenRule(isOpen ? null : rule.id)}
                                    className="w-full flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">{rule.icon}</span>
                                        <span className={`font-semibold ${isOpen ? 'text-blue-700' : 'text-gray-700'}`}>
                                            {rule.title}
                                        </span>
                                    </div>
                                    <span className={`text-gray-400 text-xs transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </button>

                                {/* Contenu dépliable */}
                                {isOpen && (
                                    <div className="px-6 pb-4 pt-1">
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