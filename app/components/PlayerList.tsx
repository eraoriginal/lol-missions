'use client';

interface Player {
    id: string;
    name: string;
    missions: any[];
}

interface PlayerListProps {
    players: Player[];
    currentPlayerToken?: string | null;
}

export function PlayerList({ players, currentPlayerToken }: PlayerListProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
                Joueurs ({players.length}/10)
            </h3>
            <div className="space-y-2">
                {players.map((player) => (
                    <div
                        key={player.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                {player.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-800">{player.name}</span>
                        </div>
                        {player.missions.length > 0 && (
                            <span className="text-sm text-green-600 font-medium">
                ✓ Mission assignée
              </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}