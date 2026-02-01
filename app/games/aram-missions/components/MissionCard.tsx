'use client';

interface Mission {
    id: string;
    text: string;
    type: string;
    category: string;
    difficulty: string;
    points?: number;
    isPrivate?: boolean;
}

interface MissionCardProps {
    mission: Mission;
    type: 'START' | 'MID' | 'LATE';
    showPoints?: boolean;
}

const difficultyConfig = {
    easy: {
        gradient: 'from-green-600 to-green-800',
        border: 'border-green-500',
        text: 'text-green-400',
        label: 'Facile',
    },
    medium: {
        gradient: 'from-yellow-600 to-yellow-800',
        border: 'border-yellow-500',
        text: 'text-yellow-400',
        label: 'Moyen',
    },
    hard: {
        gradient: 'from-red-600 to-red-800',
        border: 'border-red-500',
        text: 'text-red-400',
        label: 'Difficile',
    },
};

const typeConfig = {
    START: {
        gradient: 'from-blue-500 to-blue-700',
        border: 'border-blue-400',
        label: 'DÉBUT',
        icon: '⚔️',
    },
    MID: {
        gradient: 'from-purple-500 to-purple-700',
        border: 'border-purple-400',
        label: 'MID',
        icon: '⚡',
    },
    LATE: {
        gradient: 'from-red-500 to-red-700',
        border: 'border-red-400',
        label: 'FINALE',
        icon: '🔥',
    },
};

export function MissionCard({ mission, type, showPoints = false }: MissionCardProps) {
    const typeStyle = typeConfig[type];
    const diffStyle = difficultyConfig[mission.difficulty as keyof typeof difficultyConfig];

    return (
        <div className={`relative rounded-lg overflow-hidden ${
            mission.isPrivate
                ? 'bg-gradient-to-br from-purple-900/80 to-[#0A1428] border-2 border-purple-500'
                : 'lol-card'
        }`}>
            {/* Barre supérieure avec type de mission */}
            <div className={`bg-gradient-to-r ${typeStyle.gradient} px-4 py-2 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                    <span className="text-xl">{typeStyle.icon}</span>
                    <span className="text-white font-bold uppercase tracking-wider text-sm">
                        Mission {typeStyle.label}
                    </span>
                    {mission.isPrivate && (
                        <span className="bg-purple-600 text-white px-2 py-0.5 rounded text-xs font-bold animate-pulse">
                            🔒 SECRÈTE
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {showPoints && mission.points !== undefined && (
                        <span className="bg-[#C8AA6E] text-[#010A13] px-3 py-0.5 rounded font-bold text-sm">
                            {mission.points} PTS
                        </span>
                    )}
                    <span className={`bg-gradient-to-b ${diffStyle.gradient} border ${diffStyle.border} px-3 py-0.5 rounded text-xs font-bold text-white uppercase`}>
                        {diffStyle.label}
                    </span>
                </div>
            </div>

            {/* Corps de la mission */}
            <div className="p-5">
                <p className="text-lg lol-text-light leading-relaxed">
                    {mission.text}
                </p>

                {mission.isPrivate && (
                    <div className="mt-4 p-3 bg-purple-900/50 border border-purple-500/50 rounded-lg">
                        <p className="text-sm text-purple-300 flex items-center gap-2">
                            <span className="text-lg">🤫</span>
                            <span className="font-medium">
                                Les autres invocateurs ne voient pas cette mission !
                            </span>
                        </p>
                    </div>
                )}

                <div className="mt-4 pt-3 border-t border-[#C8AA6E]/20">
                    <span className="text-sm lol-text capitalize flex items-center gap-2">
                        <span className="text-[#C8AA6E]">📂</span> {mission.category}
                    </span>
                </div>
            </div>
        </div>
    );
}
