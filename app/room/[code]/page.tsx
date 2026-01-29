'use client';

import { use } from 'react';
import { useRoom } from '@/app/hooks/useRoom';
import { RoomLobby } from '@/app/components/RoomLobby';
import { GameView } from '@/app/components/GameView';

export default function RoomPage({
                                     params
                                 }: {
    params: Promise<{ code: string }>
}) {
    const { code } = use(params);
    const { room, loading, error } = useRoom(code);

    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="text-white text-2xl">Chargement...</div>
            </main>
        );
    }

    if (error || !room) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center">
                <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Erreur</h1>
                    <p className="text-gray-700 mb-6">{error || 'Room not found'}</p>
                    <a
                        href="/"
                        className="block text-center py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                    >
                        Retour à l'accueil
                    </a>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
            <div className="max-w-6xl mx-auto py-8">
                {room.gameStarted ? (
                    <GameView room={room} roomCode={code} />
                ) : (
                    <RoomLobby room={room} roomCode={code} />
                )}
            </div>
        </main>
    );
}