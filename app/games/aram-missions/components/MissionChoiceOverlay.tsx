'use client';

import { useState } from 'react';

interface PendingChoice {
    id: string;
    mission: {
        id: string;
        text: string;
        difficulty: string;
        category: string;
        isPrivate: boolean;
    };
    type: string;
    resolvedText?: string | null;
}

interface MissionChoiceOverlayProps {
    choices: PendingChoice[];
    type: 'START' | 'MID' | 'LATE';
    roomCode: string;
    missionVisibility: 'all' | 'team' | 'hidden';
    onChosen: () => void;
}

const typeLabels: Record<string, string> = {
    START: 'de début',
    MID: 'MID',
    LATE: 'finale',
};

const typeIcons: Record<string, string> = {
    START: '⚔️',
    MID: '⚡',
    LATE: '🔥',
};

function getDifficultyStyle(difficulty: string) {
    switch (difficulty) {
        case 'easy':
            return { bg: 'bg-green-600/80', text: 'text-green-100', label: 'Facile', points: '100' };
        case 'medium':
            return { bg: 'bg-yellow-600/80', text: 'text-yellow-100', label: 'Moyen', points: '200' };
        case 'hard':
            return { bg: 'bg-red-600/80', text: 'text-red-100', label: 'Difficile', points: '300' };
        default:
            return { bg: 'bg-gray-600/80', text: 'text-gray-100', label: difficulty, points: '?' };
    }
}

export function MissionChoiceOverlay({ choices, type, roomCode, missionVisibility, onChosen }: MissionChoiceOverlayProps) {
    const [choosingId, setChoosingId] = useState<string | null>(null);

    const handleChoose = async (choice: PendingChoice) => {
        if (choosingId) return;
        setChoosingId(choice.id);

        const playerToken = typeof window !== 'undefined'
            ? localStorage.getItem(`room_${roomCode}_player`)
            : null;

        if (!playerToken) return;

        try {
            const res = await fetch(`/api/games/aram-missions/${roomCode}/choose-mission`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerToken, pendingChoiceId: choice.id }),
            });

            if (res.ok) {
                onChosen();
            } else {
                setChoosingId(null);
            }
        } catch {
            setChoosingId(null);
        }
    };

    const gridCols = choices.length === 2 ? 'grid-cols-2' : 'grid-cols-3';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-3xl px-4">
                <h2 className="text-2xl font-bold text-center mb-6 lol-title-gold">
                    {typeIcons[type]} Choisis ta mission {typeLabels[type]}
                </h2>

                <div className={`grid ${gridCols} gap-4`}>
                    {choices.map((choice) => {
                        const diff = getDifficultyStyle(choice.mission.difficulty);
                        const displayText = choice.resolvedText || choice.mission.text;
                        const isChosen = choosingId === choice.id;
                        const isOther = choosingId !== null && !isChosen;

                        return (
                            <button
                                key={choice.id}
                                onClick={() => handleChoose(choice)}
                                disabled={choosingId !== null}
                                className={`
                                    relative flex flex-col p-5 rounded-xl border-2 text-left transition-all duration-200
                                    ${isChosen
                                        ? 'border-[#C8AA6E] bg-[#C8AA6E]/20 scale-105'
                                        : isOther
                                            ? 'border-[#C8AA6E]/10 bg-[#1E2328]/50 opacity-40 scale-95'
                                            : 'border-[#C8AA6E]/30 bg-[#1E2328] hover:border-[#C8AA6E] hover:scale-105 hover:bg-[#C8AA6E]/10 cursor-pointer'
                                    }
                                `}
                            >
                                {isChosen && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40">
                                        <div className="w-8 h-8 border-2 border-[#C8AA6E] border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2 mb-3">
                                    <span className={`text-xs px-2 py-0.5 rounded font-bold ${diff.bg} ${diff.text}`}>
                                        {diff.label}
                                    </span>
                                    <span className="text-xs lol-text-gold font-bold">
                                        {diff.points} pts
                                    </span>
                                    {choice.mission.isPrivate && missionVisibility !== 'hidden' && (
                                        <span className="text-xs px-1.5 py-0.5 rounded bg-purple-900/50 text-purple-300 border border-purple-500/30">
                                            Secrète
                                        </span>
                                    )}
                                </div>

                                <p className="text-sm text-white/90 leading-relaxed flex-1">
                                    {displayText}
                                </p>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
