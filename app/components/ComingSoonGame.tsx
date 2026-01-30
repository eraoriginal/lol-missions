'use client';

import { LeaveRoomButton } from './LeaveRoomButton';

interface ComingSoonGameProps {
    roomCode: string;
    gameName: string;
}

export function ComingSoonGame({ roomCode, gameName }: ComingSoonGameProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4 flex items-center justify-center">
            <div className="max-w-2xl w-full">
                <div className="bg-white rounded-xl shadow-2xl p-12 text-center space-y-6">
                    {/* Icon */}
                    <div className="text-8xl animate-bounce">
                        🚧
                    </div>

                    {/* Titre */}
                    <h1 className="text-4xl font-bold text-gray-800">
                        En construction
                    </h1>

                    {/* Message */}
                    <div className="space-y-3">
                        <p className="text-xl text-gray-600">
                            Le jeu <span className="font-bold text-purple-600">{gameName}</span> arrive bientôt !
                        </p>
                        <p className="text-gray-500">
                            Notre équipe travaille dur pour te proposer une expérience géniale.
                        </p>
                    </div>

                    {/* Infos room */}
                    <div className="pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-500 mb-4">
                            Room : <span className="font-mono font-bold text-gray-700">{roomCode}</span>
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 justify-center pt-4">
                        <LeaveRoomButton roomCode={roomCode} />
                    </div>
                </div>
            </div>
        </div>
    );
}