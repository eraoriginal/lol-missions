'use client';

import { useState, useRef } from 'react';

type MissionVisibility = 'all' | 'team' | 'hidden';
type GameMap = 'howling_abyss' | 'summoners_rift';

interface MissionDelayPickerProps {
    midMissionDelay: number;
    lateMissionDelay: number;
    missionVisibility: MissionVisibility;
    gameMap: string;
    victoryBonus: boolean;
    isCreator: boolean;
    roomCode: string;
    creatorToken: string | null;
}

interface DelayInputProps {
    label: string;
    emoji: string;
    color: string;
    value: string;
    saved: number;
    isCreator: boolean;
    error?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onValidate: () => void;
}

function DelayInput({
    label,
    emoji,
    color,
    value,
    saved,
    isCreator,
    error,
    onChange,
    onBlur,
    onKeyDown,
    onValidate,
}: DelayInputProps) {
    const isDirty = value !== String(saved);

    return (
        <div className="flex flex-col">
            <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full ${color} flex items-center justify-center text-xs flex-shrink-0`}>
                    {emoji}
                </span>
                <span className="text-xs font-medium lol-text whitespace-nowrap">{label}</span>
                {isCreator ? (
                    <>
                        <div className="flex items-center">
                            <input
                                type="text"
                                inputMode="numeric"
                                value={value}
                                onChange={onChange}
                                onBlur={onBlur}
                                onKeyDown={onKeyDown}
                                maxLength={2}
                                className={`w-10 text-center text-sm font-bold rounded-l-md border-2 py-0.5 outline-none transition-colors bg-[#010A13]
                                    ${error
                                    ? 'border-red-500 text-red-400'
                                    : isDirty
                                        ? 'border-[#0AC8B9] text-[#0AC8B9]'
                                        : 'border-[#C8AA6E]/30 text-[#C8AA6E] focus:border-[#0AC8B9]'
                                }
                                `}
                            />
                            <span className={`text-xs font-medium rounded-r-md border-2 border-l-0 py-0.5 px-1.5
                                ${error
                                ? 'border-red-500 bg-red-900/30 text-red-400'
                                : isDirty
                                    ? 'border-[#0AC8B9] bg-[#0AC8B9]/20 text-[#0AC8B9]'
                                    : 'border-[#C8AA6E]/30 bg-[#1E2328] text-[#A09B8C]'
                            }
                            `}>
                                min
                            </span>
                        </div>
                        <button
                            onClick={onValidate}
                            disabled={!isDirty}
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0
                                ${isDirty
                                ? 'bg-[#0AC8B9] text-[#010A13] hover:bg-[#0AC8B9]/80 active:scale-90 shadow-sm shadow-[#0AC8B9]/30'
                                : 'bg-[#1E2328] text-[#5B5A56] cursor-not-allowed'
                            }
                            `}
                        >
                            ↵
                        </button>
                    </>
                ) : (
                    <span className="text-sm font-bold lol-text-gold tabular-nums">
                        {value}<span className="text-xs font-normal lol-text ml-0.5">min</span>
                    </span>
                )}
            </div>
            {error && (
                <p className="text-xs text-red-400 ml-7">{error}</p>
            )}
        </div>
    );
}

const visibilityOptions: { value: MissionVisibility; label: string; description: string }[] = [
    { value: 'team', label: 'Équipe seulement', description: 'Visibles par ton équipe' },
    { value: 'all', label: 'Tout le monde', description: 'Visibles par tous les joueurs' },
    { value: 'hidden', label: 'Masquées', description: 'Personne ne voit les missions' },
];

const mapOptions: { value: GameMap; label: string }[] = [
    { value: 'howling_abyss', label: 'Abîme hurlant' },
    { value: 'summoners_rift', label: 'Faille de l\'invocateur' },
];

export function MissionDelayPicker({
    midMissionDelay,
    lateMissionDelay,
    missionVisibility,
    gameMap,
    victoryBonus,
    isCreator,
    roomCode,
}: MissionDelayPickerProps) {
    const savedMidMin = Math.round(midMissionDelay / 60);
    const savedLateMin = Math.round(lateMissionDelay / 60);

    const [midInput, setMidInput] = useState(String(savedMidMin));
    const [lateInput, setLateInput] = useState(String(savedLateMin));
    const [errors, setErrors] = useState<{ mid?: string; late?: string }>({});
    const [selectedVisibility, setSelectedVisibility] = useState<MissionVisibility>(missionVisibility);
    const [selectedMap, setSelectedMap] = useState<GameMap>(gameMap as GameMap);
    const [selectedVictoryBonus, setSelectedVictoryBonus] = useState(victoryBonus);

    // Sync depuis le polling quand la room change
    const prevMid = useRef(midMissionDelay);
    const prevLate = useRef(lateMissionDelay);
    const prevVisibility = useRef(missionVisibility);
    const prevMap = useRef(gameMap);
    const prevVictoryBonus = useRef(victoryBonus);

    if (midMissionDelay !== prevMid.current) {
        prevMid.current = midMissionDelay;
        setMidInput(String(Math.round(midMissionDelay / 60)));
    }
    if (lateMissionDelay !== prevLate.current) {
        prevLate.current = lateMissionDelay;
        setLateInput(String(Math.round(lateMissionDelay / 60)));
    }
    if (missionVisibility !== prevVisibility.current) {
        prevVisibility.current = missionVisibility;
        setSelectedVisibility(missionVisibility);
    }
    if (gameMap !== prevMap.current) {
        prevMap.current = gameMap;
        setSelectedMap(gameMap as GameMap);
    }
    if (victoryBonus !== prevVictoryBonus.current) {
        prevVictoryBonus.current = victoryBonus;
        setSelectedVictoryBonus(victoryBonus);
    }

    // Filtre la saisie : chiffres uniquement, pas de zéro en début
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: (v: string) => void,
        field: 'mid' | 'late'
    ) => {
        let val = e.target.value.replace(/[^0-9]/g, '');
        if (val.length > 1) {
            val = val.replace(/^0+/, '');
        }
        setter(val);
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }));
        }
    };

    // Valide et envoie le PATCH — appelé par onBlur, onKeyDown(Enter) et le bouton ↵
    const submitDelay = async (field: 'mid' | 'late', currentValue: string) => {
        const token = localStorage.getItem(`room_${roomCode}_creator`);
        if (!token) return;

        const raw = currentValue.trim();
        const parsed = parseInt(raw, 10);

        // Validation
        if (isNaN(parsed) || parsed < 1) {
            setErrors(prev => ({ ...prev, [field]: 'Entier entre 1 et 60' }));
            if (field === 'mid') setMidInput(String(savedMidMin));
            else setLateInput(String(savedLateMin));
            return;
        }
        if (parsed > 60) {
            setErrors(prev => ({ ...prev, [field]: 'Max 60 min' }));
            if (field === 'mid') setMidInput(String(savedMidMin));
            else setLateInput(String(savedLateMin));
            return;
        }
        if (field === 'mid' && parsed >= savedLateMin) {
            setErrors(prev => ({ ...prev, mid: `Doit être < ${savedLateMin} min` }));
            setMidInput(String(savedMidMin));
            return;
        }
        if (field === 'late' && parsed <= savedMidMin) {
            setErrors(prev => ({ ...prev, late: `Doit être > ${savedMidMin} min` }));
            setLateInput(String(savedLateMin));
            return;
        }

        // Pas de changement, rien à envoyer
        const saved = field === 'mid' ? savedMidMin : savedLateMin;
        if (parsed === saved) return;

        // Tout bon — envoie le PATCH
        setErrors(prev => ({ ...prev, [field]: undefined }));

        try {
            const key = field === 'mid' ? 'midMissionDelay' : 'lateMissionDelay';
            const res = await fetch(`/api/games/aram-missions/${roomCode}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorToken: token, [key]: parsed * 60 }),
            });

            if (!res.ok) {
                const data = await res.json();
                setErrors(prev => ({ ...prev, [field]: data.error || 'Erreur' }));
                if (field === 'mid') setMidInput(String(savedMidMin));
                else setLateInput(String(savedLateMin));
            }
        } catch {
            setErrors(prev => ({ ...prev, [field]: 'Erreur réseau' }));
            if (field === 'mid') setMidInput(String(savedMidMin));
            else setLateInput(String(savedLateMin));
        }
    };

    // Gère le changement de visibilité
    const handleVisibilityChange = async (visibility: MissionVisibility) => {
        const token = localStorage.getItem(`room_${roomCode}_creator`);
        if (!token) return;

        setSelectedVisibility(visibility);

        try {
            const res = await fetch(`/api/games/aram-missions/${roomCode}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorToken: token, missionVisibility: visibility }),
            });

            if (!res.ok) {
                setSelectedVisibility(missionVisibility);
            }
        } catch {
            setSelectedVisibility(missionVisibility);
        }
    };

    // Gère le changement de map
    const handleMapChange = async (map: GameMap) => {
        const token = localStorage.getItem(`room_${roomCode}_creator`);
        if (!token) return;

        setSelectedMap(map);

        try {
            const res = await fetch(`/api/games/aram-missions/${roomCode}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorToken: token, gameMap: map }),
            });

            if (!res.ok) {
                setSelectedMap(gameMap as GameMap);
            }
        } catch {
            setSelectedMap(gameMap as GameMap);
        }
    };

    // Gère le changement du bonus de victoire
    const handleVictoryBonusChange = async (value: boolean) => {
        const token = localStorage.getItem(`room_${roomCode}_creator`);
        if (!token) return;

        setSelectedVictoryBonus(value);

        try {
            const res = await fetch(`/api/games/aram-missions/${roomCode}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorToken: token, victoryBonus: value }),
            });

            if (!res.ok) {
                setSelectedVictoryBonus(victoryBonus);
            }
        } catch {
            setSelectedVictoryBonus(victoryBonus);
        }
    };

    return (
        <div className="lol-card rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold lol-title-gold">⚙️ Paramétrage de la partie</h3>
                {!isCreator && (
                    <span className="text-xs bg-[#1E2328] lol-text px-2 py-1 rounded-full border border-[#C8AA6E]/20">
                        Défini par le créateur
                    </span>
                )}
            </div>

            {/* Délais sur une seule ligne */}
            <div className="mb-5">
                <p className="text-sm lol-text mb-3">Délais des missions</p>
                <div className="flex items-center gap-3 flex-wrap">
                    <DelayInput
                        label="Mission MID"
                        emoji="⚡"
                        color="bg-purple-900/50 text-purple-400 border border-purple-500/30"
                        value={midInput}
                        saved={savedMidMin}
                        isCreator={isCreator}
                        error={errors.mid}
                        onChange={(e) => handleChange(e, setMidInput, 'mid')}
                        onBlur={() => submitDelay('mid', midInput)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                submitDelay('mid', midInput);
                            }
                        }}
                        onValidate={() => submitDelay('mid', midInput)}
                    />

                    <span className="lol-text text-sm">→</span>

                    <DelayInput
                        label="Mission Finale"
                        emoji="🔥"
                        color="bg-red-900/50 text-red-400 border border-red-500/30"
                        value={lateInput}
                        saved={savedLateMin}
                        isCreator={isCreator}
                        error={errors.late}
                        onChange={(e) => handleChange(e, setLateInput, 'late')}
                        onBlur={() => submitDelay('late', lateInput)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                submitDelay('late', lateInput);
                            }
                        }}
                        onValidate={() => submitDelay('late', lateInput)}
                    />
                </div>
            </div>

            {/* Séparateur */}
            <div className="h-px bg-[#C8AA6E]/20 mb-5"></div>

            {/* Visibilité des missions */}
            <div className="mb-5">
                <p className="text-sm lol-text mb-3">Visibilité des missions (hors missions secrètes)</p>
                <div className="flex flex-wrap gap-2">
                    {visibilityOptions.map((option) => {
                        const isSelected = selectedVisibility === option.value;
                        return isCreator ? (
                            <button
                                key={option.value}
                                onClick={() => handleVisibilityChange(option.value)}
                                className={`
                                    flex flex-col items-start px-3 py-2 rounded-lg border-2 transition-all text-left cursor-pointer
                                    ${isSelected
                                        ? 'border-[#0AC8B9] bg-[#0AC8B9]/10'
                                        : 'border-[#C8AA6E]/30 bg-[#1E2328] hover:border-[#C8AA6E]/50'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`
                                        w-4 h-4 rounded-full border-2 flex items-center justify-center
                                        ${isSelected
                                            ? 'border-[#0AC8B9] bg-[#0AC8B9]'
                                            : 'border-[#C8AA6E]/50 bg-transparent'
                                        }
                                    `}>
                                        {isSelected && (
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#010A13]"></div>
                                        )}
                                    </div>
                                    <span className={`text-sm font-semibold ${isSelected ? 'text-[#0AC8B9]' : 'lol-text-light'}`}>
                                        {option.label}
                                    </span>
                                </div>
                                <p className={`text-xs mt-1 ml-6 ${isSelected ? 'text-[#0AC8B9]/70' : 'lol-text'}`}>
                                    {option.description}
                                </p>
                            </button>
                        ) : (
                            <div
                                key={option.value}
                                className={`
                                    flex flex-col items-start px-3 py-2 rounded-lg border-2 text-left
                                    ${isSelected
                                        ? 'border-[#0AC8B9] bg-[#0AC8B9]/10'
                                        : 'border-[#C8AA6E]/20 bg-[#1E2328]/50 opacity-40'
                                    }
                                `}
                            >
                                <span className={`text-sm font-semibold ${isSelected ? 'text-[#0AC8B9]' : 'lol-text-light'}`}>
                                    {option.label}
                                </span>
                                <p className={`text-xs mt-1 ${isSelected ? 'text-[#0AC8B9]/70' : 'lol-text'}`}>
                                    {option.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Séparateur */}
            <div className="h-px bg-[#C8AA6E]/20 mb-5"></div>

            {/* Sélection de la map */}
            <div className="mb-5">
                <p className="text-sm lol-text mb-3">Map</p>
                <div className="flex gap-2">
                    {mapOptions.map((option) => {
                        const isSelected = selectedMap === option.value;
                        return isCreator ? (
                            <button
                                key={option.value}
                                onClick={() => handleMapChange(option.value)}
                                className={`
                                    flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all cursor-pointer
                                    ${isSelected
                                        ? 'border-[#0AC8B9] bg-[#0AC8B9]/10'
                                        : 'border-[#C8AA6E]/30 bg-[#1E2328] hover:border-[#C8AA6E]/50'
                                    }
                                `}
                            >
                                <div className={`
                                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                                    ${isSelected
                                        ? 'border-[#0AC8B9] bg-[#0AC8B9]'
                                        : 'border-[#C8AA6E]/50 bg-transparent'
                                    }
                                `}>
                                    {isSelected && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#010A13]"></div>
                                    )}
                                </div>
                                <span className={`text-sm font-semibold ${isSelected ? 'text-[#0AC8B9]' : 'lol-text-light'}`}>
                                    {option.label}
                                </span>
                            </button>
                        ) : (
                            <div
                                key={option.value}
                                className={`
                                    flex items-center px-3 py-2 rounded-lg border-2
                                    ${isSelected
                                        ? 'border-[#0AC8B9] bg-[#0AC8B9]/10'
                                        : 'border-[#C8AA6E]/20 bg-[#1E2328]/50 opacity-40'
                                    }
                                `}
                            >
                                <span className={`text-sm font-semibold ${isSelected ? 'text-[#0AC8B9]' : 'lol-text-light'}`}>
                                    {option.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Séparateur */}
            <div className="h-px bg-[#C8AA6E]/20 mb-5"></div>

            {/* Bonus de victoire */}
            <div>
                <p className="text-sm lol-text mb-3">Bonus de victoire (rapporte entre 0 et 500 points)</p>
                <div className="flex gap-2">
                    {[true, false].map((value) => {
                        const isSelected = selectedVictoryBonus === value;
                        return isCreator ? (
                            <button
                                key={String(value)}
                                onClick={() => handleVictoryBonusChange(value)}
                                className={`
                                    flex items-center gap-2 px-3 py-2 rounded-lg border-2 transition-all cursor-pointer
                                    ${isSelected
                                        ? 'border-[#0AC8B9] bg-[#0AC8B9]/10'
                                        : 'border-[#C8AA6E]/30 bg-[#1E2328] hover:border-[#C8AA6E]/50'
                                    }
                                `}
                            >
                                <div className={`
                                    w-4 h-4 rounded-full border-2 flex items-center justify-center
                                    ${isSelected
                                        ? 'border-[#0AC8B9] bg-[#0AC8B9]'
                                        : 'border-[#C8AA6E]/50 bg-transparent'
                                    }
                                `}>
                                    {isSelected && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#010A13]"></div>
                                    )}
                                </div>
                                <span className={`text-sm font-semibold ${isSelected ? 'text-[#0AC8B9]' : 'lol-text-light'}`}>
                                    {value ? 'Oui' : 'Non'}
                                </span>
                            </button>
                        ) : (
                            <div
                                key={String(value)}
                                className={`
                                    flex items-center px-3 py-2 rounded-lg border-2
                                    ${isSelected
                                        ? 'border-[#0AC8B9] bg-[#0AC8B9]/10'
                                        : 'border-[#C8AA6E]/20 bg-[#1E2328]/50 opacity-40'
                                    }
                                `}
                            >
                                <span className={`text-sm font-semibold ${isSelected ? 'text-[#0AC8B9]' : 'lol-text-light'}`}>
                                    {value ? 'Oui' : 'Non'}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {isCreator && (
                <p className="text-xs lol-text mt-4 text-center">
                    Les changements sont visibles en temps réel pour tous les invocateurs
                </p>
            )}
        </div>
    );
}
