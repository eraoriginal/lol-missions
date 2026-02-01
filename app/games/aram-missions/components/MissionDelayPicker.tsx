'use client';

import { useState, useRef } from 'react';

interface MissionDelayPickerProps {
    midMissionDelay: number;
    lateMissionDelay: number;
    isCreator: boolean;
    roomCode: string;
    creatorToken: string | null;
}

interface DelayRowProps {
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

function DelayRow({
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
                  }: DelayRowProps) {
    const isDirty = value !== String(saved);

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <span className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-sm`}>
                        {emoji}
                    </span>
                    <div>
                        <p className="text-sm font-semibold lol-text-light">{label}</p>
                        <p className="text-xs lol-text">Apparaît après</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
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
                                    className={`w-14 text-center text-lg font-bold rounded-l-lg border-2 py-1.5 outline-none transition-colors bg-[#010A13]
                                        ${error
                                        ? 'border-red-500 text-red-400'
                                        : isDirty
                                            ? 'border-[#0AC8B9] text-[#0AC8B9]'
                                            : 'border-[#C8AA6E]/30 text-[#C8AA6E] focus:border-[#0AC8B9]'
                                    }
                                    `}
                                />
                                <span className={`text-sm font-medium rounded-r-lg border-2 border-l-0 py-1.5 px-2
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
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-base font-bold transition-all
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
                        <span className="text-lg font-bold lol-text-gold tabular-nums">
                            {value}<span className="text-xs font-normal lol-text ml-1">min</span>
                        </span>
                    )}
                </div>
            </div>

            {error && (
                <p className="text-xs text-red-400 text-right">{error}</p>
            )}
        </div>
    );
}

export function MissionDelayPicker({
                                       midMissionDelay,
                                       lateMissionDelay,
                                       isCreator,
                                       roomCode,
                                   }: MissionDelayPickerProps) {
    const savedMidMin = Math.round(midMissionDelay / 60);
    const savedLateMin = Math.round(lateMissionDelay / 60);

    const [midInput, setMidInput] = useState(String(savedMidMin));
    const [lateInput, setLateInput] = useState(String(savedLateMin));
    const [errors, setErrors] = useState<{ mid?: string; late?: string }>({});

    // Sync depuis le polling quand la room change
    const prevMid = useRef(midMissionDelay);
    const prevLate = useRef(lateMissionDelay);
    if (midMissionDelay !== prevMid.current) {
        prevMid.current = midMissionDelay;
        setMidInput(String(Math.round(midMissionDelay / 60)));
    }
    if (lateMissionDelay !== prevLate.current) {
        prevLate.current = lateMissionDelay;
        setLateInput(String(Math.round(lateMissionDelay / 60)));
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
    const submit = async (field: 'mid' | 'late', currentValue: string) => {
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
            setErrors(prev => ({ ...prev, mid: `Doit être < ${savedLateMin} min (Finale)` }));
            setMidInput(String(savedMidMin));
            return;
        }
        if (field === 'late' && parsed <= savedMidMin) {
            setErrors(prev => ({ ...prev, late: `Doit être > ${savedMidMin} min (MID)` }));
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
            // Sinon le polling met à jour dans 2s
        } catch {
            setErrors(prev => ({ ...prev, [field]: 'Erreur réseau' }));
            if (field === 'mid') setMidInput(String(savedMidMin));
            else setLateInput(String(savedLateMin));
        }
    };

    return (
        <div className="lol-card rounded-lg p-6">
            <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold lol-title-gold">⏱️ Délais des missions</h3>
                {!isCreator && (
                    <span className="text-xs bg-[#1E2328] lol-text px-2.5 py-1 rounded-full border border-[#C8AA6E]/20">
                        Défini par le créateur
                    </span>
                )}
            </div>

            <div className="space-y-4">
                <DelayRow
                    label="Mission MID"
                    emoji="⚡"
                    color="bg-purple-900/50 text-purple-400 border border-purple-500/30"
                    value={midInput}
                    saved={savedMidMin}
                    isCreator={isCreator}
                    error={errors.mid}
                    onChange={(e) => handleChange(e, setMidInput, 'mid')}
                    onBlur={() => submit('mid', midInput)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            submit('mid', midInput);
                        }
                    }}
                    onValidate={() => submit('mid', midInput)}
                />

                <div className="flex items-center justify-center">
                    <div className="flex-1 h-px bg-[#C8AA6E]/20"></div>
                    <span className="px-3 lol-text text-sm">↓</span>
                    <div className="flex-1 h-px bg-[#C8AA6E]/20"></div>
                </div>

                <DelayRow
                    label="Mission Finale"
                    emoji="🔥"
                    color="bg-red-900/50 text-red-400 border border-red-500/30"
                    value={lateInput}
                    saved={savedLateMin}
                    isCreator={isCreator}
                    error={errors.late}
                    onChange={(e) => handleChange(e, setLateInput, 'late')}
                    onBlur={() => submit('late', lateInput)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            submit('late', lateInput);
                        }
                    }}
                    onValidate={() => submit('late', lateInput)}
                />
            </div>

            {isCreator && (
                <p className="text-xs lol-text mt-5 text-center">
                    Les changements sont visibles en temps réel pour tous les invocateurs
                </p>
            )}
        </div>
    );
}
