'use client';

interface Player {
    id: string;
    name: string;
    avatar?: string;
    team?: string;
    missions: { id: string }[];
}

interface PlayerListProps {
    players: Player[];
}

export function PlayerList({ players }: PlayerListProps) {
    return (
        <div className="lol-card rounded-lg p-6">
            <h3 className="text-xl font-bold lol-title-gold mb-4">
                Invocateurs ({players.length}/10)
            </h3>
            <div className="space-y-2">
                {players.map((player, index) => (
                    <div
                        key={player.id}
                        className="flex items-center justify-between p-3 bg-[#010A13]/50 rounded-lg border border-[#C8AA6E]/20 hover:border-[#C8AA6E]/50 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            {player.avatar ? (
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#C8AA6E] flex-shrink-0">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={player.avatar}
                                        alt={player.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-[#0AC8B9] to-[#0397AB] rounded-full flex items-center justify-center text-[#010A13] font-bold text-lg flex-shrink-0 border-2 border-[#C8AA6E]">
                                    {player.name.charAt(0).toUpperCase()}
                                </div>
                            )}

                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium lol-text-light">{player.name}</span>
                                    {index === 0 && (
                                        <span className="lol-badge px-2 py-0.5 rounded text-xs">
                                            👑 Créateur
                                        </span>
                                    )}
                                    {/* Badge équipe */}
                                    {player.team === 'red' && (
                                        <span className="lol-badge-red px-2 py-0.5 rounded text-xs">
                                            🔴 Rouge
                                        </span>
                                    )}
                                    {player.team === 'blue' && (
                                        <span className="lol-badge-hextech px-2 py-0.5 rounded text-xs">
                                            🔵 Bleue
                                        </span>
                                    )}
                                    {(!player.team || player.team === '') && (
                                        <span className="px-2 py-0.5 rounded text-xs bg-[#1E2328] border border-[#3C3C41] text-[#A09B8C]">
                                            👁️ Spectateur
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {player.missions.length > 0 && (
                            <span className="text-sm text-[#0AC8B9] font-medium">
                                ✓ {player.missions.length} mission{player.missions.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
