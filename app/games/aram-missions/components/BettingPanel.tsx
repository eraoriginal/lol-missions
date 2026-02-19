'use client';

import { useState } from 'react';
import type { Player, PlayerBet, BetType } from '@/app/types/room';

interface BettingPanelProps {
    roomCode: string;
    players: Player[];
    currentPlayerToken: string | null;
    existingBet?: PlayerBet;
}

const pointOptions = [100, 200, 300, 400, 500];

export function BettingPanel({ roomCode, players, currentPlayerToken, existingBet }: BettingPanelProps) {
    const [active, setActive] = useState(false);
    const [betTypes, setBetTypes] = useState<BetType[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedBetType, setSelectedBetType] = useState<BetType | null>(null);
    const [selectedTarget, setSelectedTarget] = useState<Player | null>(null);
    const [selectedPoints, setSelectedPoints] = useState<number>(200);
    const [loading, setLoading] = useState(false);
    const [currentBet, setCurrentBet] = useState<PlayerBet | undefined>(existingBet);

    // Track previous existingBet id to detect changes without useEffect+setState
    const prevBetId = currentBet?.id;
    if (existingBet && existingBet.id !== prevBetId) {
        setCurrentBet(existingBet);
        setActive(false);
    }
    if (!existingBet && prevBetId && !active) {
        setCurrentBet(undefined);
    }

    const currentPlayer = players.find(p => p.token === currentPlayerToken);
    const teamPlayers = players.filter(p => (p.team === 'red' || p.team === 'blue') && p.id !== currentPlayer?.id);

    const fetchBetTypes = async () => {
        try {
            const res = await fetch(`/api/games/aram-missions/${roomCode}/bet-types`);
            if (res.ok) {
                const data = await res.json();
                setBetTypes(data.betTypes);
            }
        } catch (e) {
            console.error('Error fetching bet types:', e);
        }
    };

    const handleStartBet = async () => {
        await fetchBetTypes();
        setActive(true);
        setSelectedCategory(null);
        setSelectedBetType(null);
        setSelectedTarget(null);
        setSelectedPoints(200);
    };

    const handleConfirm = async () => {
        if (!selectedBetType || !selectedTarget) return;
        setLoading(true);

        try {
            const res = await fetch(`/api/games/aram-missions/${roomCode}/place-bet`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerToken: currentPlayerToken,
                    betTypeId: selectedBetType.id,
                    targetPlayerId: selectedTarget.id,
                    points: selectedPoints,
                }),
            });

            if (res.ok) {
                setCurrentBet({
                    id: '',
                    playerId: '',
                    playerName: '',
                    playerTeam: '',
                    betType: selectedBetType,
                    targetPlayerName: selectedTarget.name,
                    targetPlayerId: selectedTarget.id,
                    points: selectedPoints,
                    validated: false,
                    decided: false,
                });
                setActive(false);
            }
        } catch (e) {
            console.error('Error placing bet:', e);
        }
        setLoading(false);
    };

    const handleDeleteBet = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/games/aram-missions/${roomCode}/place-bet`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerToken: currentPlayerToken }),
            });
            if (res.ok) {
                setCurrentBet(undefined);
                setSelectedBetType(null);
                setSelectedTarget(null);
                setSelectedCategory(null);
                setSelectedPoints(200);
            }
        } catch (e) {
            console.error('Error deleting bet:', e);
        }
        setLoading(false);
    };

    const handleChangeBet = async () => {
        await fetchBetTypes();
        setActive(true);
        setSelectedCategory(null);
        setSelectedBetType(null);
        setSelectedTarget(null);
        setSelectedPoints(200);
    };

    // Group bet types by category
    const categories = Object.keys(
        betTypes.reduce<Record<string, boolean>>((acc, bt) => {
            acc[bt.category] = true;
            return acc;
        }, {})
    );
    const categoryBetTypes = selectedCategory
        ? betTypes.filter(bt => bt.category === selectedCategory)
        : [];

    const canConfirm = selectedBetType && selectedTarget;

    // Confirmed state
    if (!active && currentBet) {
        return (
            <div className="lol-card rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold lol-title-gold">🎰 Ton pari</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={handleChangeBet}
                            disabled={loading}
                            className="px-2 py-1 text-xs bg-[#1E2328] border border-[#C8AA6E]/30 text-[#C8AA6E] rounded font-medium hover:border-[#C8AA6E]/60 disabled:opacity-50"
                        >
                            Modifier
                        </button>
                        <button
                            onClick={handleDeleteBet}
                            disabled={loading}
                            className="px-2 py-1 text-xs bg-red-900/30 border border-red-500/30 text-red-400 rounded font-medium hover:bg-red-900/50 disabled:opacity-50"
                        >
                            {loading ? '...' : 'Supprimer'}
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-3 bg-[#010A13]/60 rounded px-3 py-2 border border-[#C8AA6E]/20">
                    <div className="flex-1 min-w-0 space-y-0.5">
                        <p className="text-xs font-semibold text-[#0AC8B9] truncate">{currentBet.betType.text}</p>
                        <p className="text-xs lol-text">sur <span className="lol-text-light font-medium">{currentBet.targetPlayerName}</span></p>
                    </div>
                    <span className="lol-text-gold font-bold text-sm shrink-0">{currentBet.points} pts</span>
                </div>
            </div>
        );
    }

    // Idle state
    if (!active) {
        return (
            <div className="lol-card rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-sm font-bold lol-title-gold">🎰 Paris</h3>
                        <p className="text-[10px] lol-text mt-0.5">Pariez sur un joueur — points gagnés ou perdus pour votre équipe</p>
                    </div>
                    <button
                        onClick={handleStartBet}
                        className="lol-button-hextech px-4 py-2 rounded-lg font-bold text-sm transition-all shrink-0 ml-3"
                    >
                        Parier
                    </button>
                </div>
            </div>
        );
    }

    // Active betting flow — all sections visible
    return (
        <div className="lol-card rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold lol-title-gold">🎰 Placer un pari</h3>
                <button
                    onClick={() => { setActive(false); setSelectedBetType(null); setSelectedTarget(null); setSelectedCategory(null); }}
                    className="text-xs lol-text hover:text-red-400 transition-colors"
                >
                    Annuler
                </button>
            </div>

            <div className="space-y-3">
                {/* Joueur cible — toujours visible */}
                <div>
                    <p className="text-xs font-semibold lol-text-light mb-1.5">Joueur cible</p>
                    <div className="flex flex-wrap gap-1.5">
                        {teamPlayers.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedTarget(prev => prev?.id === p.id ? null : p)}
                                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded border transition-all ${
                                    selectedTarget?.id === p.id
                                        ? 'border-[#0AC8B9] bg-[#0AC8B9]/20 text-[#0AC8B9]'
                                        : p.team === 'red'
                                            ? 'border-red-500/30 bg-red-900/20 hover:border-[#0AC8B9]/50'
                                            : 'border-blue-500/30 bg-blue-900/20 hover:border-[#0AC8B9]/50'
                                }`}
                            >
                                {p.avatar ? (
                                    <img src={p.avatar} alt={p.name} className="w-4 h-4 rounded-full" />
                                ) : (
                                    <div className="w-4 h-4 bg-gradient-to-br from-[#C8AA6E] to-[#785A28] rounded-full flex items-center justify-center text-[#010A13] font-bold text-[8px]">
                                        {p.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="font-medium">{p.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Mise — toujours visible, compact */}
                <div>
                    <p className="text-xs font-semibold lol-text-light mb-1.5">Mise</p>
                    <div className="inline-flex gap-1">
                        {pointOptions.map(pts => (
                            <button
                                key={pts}
                                onClick={() => setSelectedPoints(pts)}
                                className={`px-2 py-1 rounded text-[11px] font-bold transition-all border ${
                                    selectedPoints === pts
                                        ? 'border-[#0AC8B9] bg-[#0AC8B9]/20 text-[#0AC8B9]'
                                        : 'border-[#C8AA6E]/30 bg-[#1E2328] lol-text-gold hover:border-[#C8AA6E]/60'
                                }`}
                            >
                                {pts}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Type de pari : catégories → dropdown */}
                <div>
                    <p className="text-xs font-semibold lol-text-light mb-1.5">Type de pari</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => { setSelectedCategory(cat); setSelectedBetType(null); }}
                                className={`text-[11px] px-2.5 py-1 rounded border transition-all ${
                                    selectedCategory === cat
                                        ? 'border-[#0AC8B9] bg-[#0AC8B9]/20 text-[#0AC8B9] font-bold'
                                        : 'border-[#C8AA6E]/30 bg-[#010A13]/60 lol-text-light hover:border-[#0AC8B9]/50'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    {selectedCategory && (
                        <select
                            value={selectedBetType?.id || ''}
                            onChange={(e) => {
                                const bt = categoryBetTypes.find(b => b.id === e.target.value);
                                setSelectedBetType(bt || null);
                            }}
                            className="w-full text-xs bg-[#010A13] border border-[#C8AA6E]/30 rounded px-2.5 py-1.5 lol-text-light focus:border-[#0AC8B9] focus:outline-none"
                        >
                            <option value="">-- Choisir un pari --</option>
                            {categoryBetTypes.map(bt => (
                                <option key={bt.id} value={bt.id}>{bt.text}</option>
                            ))}
                        </select>
                    )}
                    {!selectedCategory && (
                        <p className="text-[10px] lol-text italic">Sélectionne une catégorie ci-dessus</p>
                    )}
                </div>

                {/* Confirmer */}
                <button
                    onClick={handleConfirm}
                    disabled={!canConfirm || loading}
                    className="w-1/2 mx-auto block lol-button-hextech px-4 py-2 rounded-lg font-bold text-sm transition-all disabled:opacity-40"
                >
                    {loading ? 'En cours...' : canConfirm ? `Confirmer (${selectedPoints} pts)` : 'Sélectionne un pari et un joueur'}
                </button>
            </div>
        </div>
    );
}
