'use client';

interface Game {
    id: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    color: 'pink' | 'cyan' | 'gold' | 'green';
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
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        color: 'pink',
        available: true,
    },
    {
        id: 'codename-ceo',
        name: 'Codename du CEO',
        description: 'Jeu de mots en équipe inspiré de Codenames',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
        ),
        color: 'cyan',
        available: true,
    },
    {
        id: 'break-room-quiz',
        name: 'Quiz de la salle de pause',
        description: 'Questions amusantes entre collègues',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        color: 'gold',
        available: false,
    },
    {
        id: 'coming-game',
        name: 'À venir',
        description: 'Un nouveau jeu bientôt disponible...',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
        ),
        color: 'green',
        available: false,
    },
];

const colorClasses = {
    pink: {
        icon: 'bg-pink-500/15 border-pink-500/30 text-pink-400',
        iconSelected: 'bg-pink-500/25 border-pink-500/50 text-pink-300',
        hover: 'hover:border-pink-500/40',
    },
    cyan: {
        icon: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
        iconSelected: 'bg-cyan-500/25 border-cyan-500/50 text-cyan-300',
        hover: 'hover:border-cyan-500/40',
    },
    gold: {
        icon: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
        iconSelected: 'bg-amber-500/25 border-amber-500/50 text-amber-300',
        hover: 'hover:border-amber-500/40',
    },
    green: {
        icon: 'bg-green-500/15 border-green-500/30 text-green-400',
        iconSelected: 'bg-green-500/25 border-green-500/50 text-green-300',
        hover: 'hover:border-green-500/40',
    },
};

export function GameSelector({ selectedGame, onSelectGame }: GameSelectorProps) {
    return (
        <div className="space-y-4">
            <label className="block text-xs font-semibold text-purple-300/70 uppercase tracking-wider mb-3">
                Choisis ton jeu
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {games.map((game) => {
                    const isSelected = selectedGame === game.id;
                    const isDisabled = !game.available;
                    const colors = colorClasses[game.color];

                    return (
                        <button
                            key={game.id}
                            type="button"
                            onClick={() => game.available && onSelectGame(game.id)}
                            disabled={isDisabled}
                            className={`
                                relative p-5 rounded-xl text-left transition-all duration-300
                                ${isSelected
                                    ? 'arcane-game-card selected'
                                    : isDisabled
                                        ? 'bg-purple-900/10 border border-purple-500/10 opacity-40 cursor-not-allowed'
                                        : `arcane-game-card cursor-pointer ${colors.hover}`
                                }
                            `}
                        >
                            {/* Badge "Sélectionné" */}
                            {isSelected && (
                                <div className="absolute -top-2 -right-2 arcane-badge-cyan px-2.5 py-1 rounded-md flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Sélectionné</span>
                                </div>
                            )}

                            {/* Badge "Bientôt" */}
                            {isDisabled && (
                                <div className="absolute -top-2 -right-2 arcane-badge-dim px-2.5 py-1 rounded-md flex items-center gap-1">
                                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                    <span>Bientôt</span>
                                </div>
                            )}

                            {/* Icon */}
                            <div className={`
                                inline-flex items-center justify-center w-12 h-12 rounded-lg border mb-4 transition-all
                                ${isSelected
                                    ? colors.iconSelected
                                    : isDisabled
                                        ? 'bg-purple-500/5 border-purple-500/10 text-purple-400/30'
                                        : colors.icon
                                }
                            `}>
                                {game.icon}
                            </div>

                            {/* Titre */}
                            <h3 className={`text-sm font-semibold mb-1.5 ${
                                isSelected
                                    ? 'text-cyan-100'
                                    : isDisabled
                                        ? 'text-purple-300/40'
                                        : 'text-purple-100'
                            }`}>
                                {game.name}
                            </h3>

                            {/* Description */}
                            <p className={`text-xs leading-relaxed ${
                                isSelected
                                    ? 'text-cyan-200/60'
                                    : isDisabled
                                        ? 'text-purple-400/30'
                                        : 'text-purple-300/50'
                            }`}>
                                {game.description}
                            </p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
