'use client';

interface Mission {
    id: string;
    text: string;
    type: string;
    isPrivate: boolean;
}

interface PlayerMission {
    mission: Mission;
    type: string;
}

interface Player {
    id: string;
    name: string;
    avatar: string;
    missions: PlayerMission[];
}

interface GameSummaryProps {
    players: Player[];
}

export function GameSummary({ players }: GameSummaryProps) {
    return (
        <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                📊 Récapitulatif des missions
            </h2>

            <div className="space-y-6">
                {players.map((player) => (
                    <div key={player.id} className="border-b border-gray-200 last:border-0 pb-6 last:pb-0">
                        {/* Header joueur */}
                        <div className="flex items-center gap-3 mb-4">
                            {player.avatar ? (
                                <img
                                    src={player.avatar}
                                    alt={player.name}
                                    className="w-12 h-12 rounded-full border-2 border-purple-500"
                                />
                            ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {player.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">{player.name}</h3>
                                <p className="text-sm text-gray-500">
                                    {player.missions.length} mission(s)
                                </p>
                            </div>
                        </div>

                        {/* Missions */}
                        <div className="space-y-2 pl-15">
                            {player.missions.length === 0 ? (
                                <p className="text-gray-400 italic">Aucune mission assignée</p>
                            ) : (
                                player.missions.map((pm) => (
                                    <div
                                        key={pm.mission.id}
                                        className={`rounded-lg p-3 ${
                                            pm.mission.isPrivate
                                                ? 'bg-purple-50 border-2 border-purple-200'
                                                : 'bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl flex-shrink-0">
                                                {pm.type === 'START' ? '🎯' : pm.type === 'MID' ? '⚡' : '🔥'}
                                            </span>
                                            <div className="flex-1">
                                                <p className="text-gray-800 font-medium">
                                                    {pm.mission.text}
                                                </p>
                                                <div className="flex gap-2 mt-2">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        pm.type === 'START'
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : pm.type === 'MID'
                                                                ? 'bg-purple-100 text-purple-700'
                                                                : 'bg-red-100 text-red-700'
                                                    }`}>
                                                        {pm.type}
                                                    </span>
                                                    {pm.mission.isPrivate && (
                                                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
                                                            🔒 Secrète
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}