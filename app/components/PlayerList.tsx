'use client';

interface Player {
    id: string;
    name: string;
    avatar?: string;
    missions: any[];
}

interface PlayerListProps {
    players: Player[];
    currentPlayerToken?: string | null;
}

export function PlayerList({ players }: PlayerListProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
                Joueurs ({players.length}/10)
            </h3>
            <div className="space-y-2">
                {players.map((player, index) => (
                    <div
                        key={player.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            {/* Avatar */}
                            {player.avatar ? (
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-white border-2 border-purple-500 flex-shrink-0">
                                    <img
                                        src={player.avatar}
                                        alt={player.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                    {player.name.charAt(0).toUpperCase()}
                                </div>
                            )}

                            {/* Nom et badge créateur */}
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-800">{player.name}</span>
                                    {index === 0 && (
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-semibold">
                                            👑 Créateur
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Statut mission */}
                        {player.missions.length > 0 && (
                            <span className="text-sm text-green-600 font-medium">
                                ✓ {player.missions.length} mission{player.missions.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}