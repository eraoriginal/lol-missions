'use client';

interface Mission {
    id: string;
    text: string;
    type: string;
    category: string;
    difficulty: string;
    isPrivate?: boolean; // 🆕 Ajouté
}

interface MissionCardProps {
    mission: Mission;
    type: 'START' | 'MID' | 'LATE';
}

const difficultyColors = {
    easy: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    hard: 'bg-red-100 text-red-800 border-red-300',
};

const typeColors = {
    START: 'bg-blue-500',
    MID: 'bg-purple-500',
    LATE: 'bg-red-500',
};

const typeLabels = {
    START: '🎯 Mission Début',
    MID: '⚡ Mission 5min',
    LATE: '🔥 Mission Finale',
};

export function MissionCard({ mission, type }: MissionCardProps) {
    return (
        <div className={`bg-white rounded-xl shadow-lg p-6 border-2 ${
            mission.isPrivate
                ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-pink-50'
                : 'border-gray-200'
        }`}>
            <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
                <div className="flex gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-white text-sm font-medium ${typeColors[type]}`}>
                        {typeLabels[type]}
                    </span>
                    {/* 🆕 Badge "Secrète" */}
                    {mission.isPrivate && (
                        <span className="px-3 py-1 rounded-full text-white text-sm font-medium bg-purple-600 flex items-center gap-1 animate-pulse">
                            🔒 Secrète
                        </span>
                    )}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${difficultyColors[mission.difficulty as keyof typeof difficultyColors]}`}>
                    {mission.difficulty === 'easy' && '😊 Facile'}
                    {mission.difficulty === 'medium' && '😐 Moyen'}
                    {mission.difficulty === 'hard' && '😰 Difficile'}
                </span>
            </div>

            <p className="text-lg text-gray-800 leading-relaxed">
                {mission.text}
            </p>

            {/* 🆕 Avertissement mission secrète */}
            {mission.isPrivate && (
                <div className="mt-4 p-3 bg-purple-100 border border-purple-300 rounded-lg">
                    <p className="text-sm text-purple-800 flex items-center gap-2">
                        <span className="text-lg">🤫</span>
                        <span className="font-medium">
                            Les autres joueurs ne voient pas cette mission !
                        </span>
                    </p>
                </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500 capitalize">
                    📂 {mission.category}
                </span>
            </div>
        </div>
    );
}