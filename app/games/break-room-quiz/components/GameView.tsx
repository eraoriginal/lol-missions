'use client';

interface GameViewProps {
    roomCode: string;
}

export function GameView({ roomCode }: GameViewProps) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="text-6xl mb-4">❓</div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Quiz de la salle de pause
                </h1>
                <p className="text-gray-600 mb-6">
                    Room: <span className="font-mono font-bold">{roomCode}</span>
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">
                        🚧 Ce jeu est en cours de développement
                    </p>
                </div>
            </div>
        </div>
    );
}
