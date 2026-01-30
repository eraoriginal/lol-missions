'use client';

interface Game {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    available: boolean;
}

interface GameSelectorProps {
    selectedGame: string;
    onSelectGame: (gameId: string) => void;
}

const games: Game[] = [
    {
        id: 'aram-missions',
        name: 'ARAM Missions',
        description: 'Missions secrètes pendant vos parties ARAM',
        icon: '🎯',
        color: 'from-blue-500 to-purple-600',
        available: true,
    },
    {
        id: 'codename-ceo',
        name: 'Codename du CEO',
        description: 'Devinez qui est le CEO parmi vous',
        icon: '👔',
        color: 'from-green-500 to-teal-600',
        available: false,
    },
    {
        id: 'break-room-quiz',
        name: 'Quiz de la salle de pause',
        description: 'Questions amusantes entre collègues',
        icon: '☕',
        color: 'from-orange-500 to-red-600',
        available: false,
    },
    {
        id: 'coming-soon',
        name: 'À venir',
        description: 'Un nouveau jeu bientôt disponible...',
        icon: '🎮',
        color: 'from-gray-400 to-gray-600',
        available: false,
    },
];

export function GameSelector({ selectedGame, onSelectGame }: GameSelectorProps) {
    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
                Choisis ton jeu
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {games.map((game) => (
                    <button
                        key={game.id}
                        type="button"
                        onClick={() => game.available && onSelectGame(game.id)}
                        disabled={!game.available}
                        className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                            selectedGame === game.id
                                ? 'border-blue-600 shadow-lg scale-105'
                                : game.available
                                    ? 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                    : 'border-gray-100 opacity-60 cursor-not-allowed'
                        }`}
                    >
                        {/* Badge "Sélectionné" */}
                        {selectedGame === game.id && (
                            <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                                ✓ Sélectionné
                            </div>
                        )}

                        {/* Badge "Bientôt" */}
                        {!game.available && (
                            <div className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                🔒 Bientôt
                            </div>
                        )}

                        {/* Icon avec gradient */}
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br ${game.color} text-4xl mb-4`}>
                            {game.icon}
                        </div>

                        {/* Titre */}
                        <h3 className={`text-lg font-bold mb-2 ${
                            game.available ? 'text-gray-800' : 'text-gray-400'
                        }`}>
                            {game.name}
                        </h3>

                        {/* Description */}
                        <p className={`text-sm ${
                            game.available ? 'text-gray-600' : 'text-gray-400'
                        }`}>
                            {game.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}