'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from './ConfirmDialog';
import { Toast } from './Toast';

interface LeaveRoomButtonProps {
    roomCode: string;
}

export function LeaveRoomButton({ roomCode }: LeaveRoomButtonProps) {
    const [leaving, setLeaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const router = useRouter();

    const isCreator = typeof window !== 'undefined'
        ? !!localStorage.getItem(`room_${roomCode}_creator`)
        : false;

    const handleLeave = async () => {
        setShowConfirm(false);
        setLeaving(true);

        const playerToken = localStorage.getItem(`room_${roomCode}_player`);
        const creatorToken = localStorage.getItem(`room_${roomCode}_creator`);

        if (!playerToken) {
            router.push('/');
            return;
        }

        try {
            const response = await fetch(`/api/rooms/${roomCode}/leave`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    playerToken,
                    creatorToken: creatorToken || undefined,
                }),
            });

            if (response.ok) {
                const data = await response.json();

                // Nettoie le localStorage
                localStorage.removeItem(`room_${roomCode}_player`);
                localStorage.removeItem(`room_${roomCode}_creator`);

                // Affiche un message selon le cas
                if (data.reason === 'creator-left') {
                    setToast({ message: 'Room supprimée avec succès', type: 'success' });
                } else {
                    setToast({ message: 'Tu as quitté la room', type: 'success' });
                }

                // Redirige après 1 seconde
                setTimeout(() => {
                    router.push('/');
                }, 1000);
            } else {
                const errorData = await response.json();
                setToast({ message: errorData.error || 'Erreur lors de la sortie', type: 'error' });
                setLeaving(false);
            }
        } catch (error) {
            console.error('Error leaving room:', error);
            setToast({ message: 'Erreur de connexion', type: 'error' });
            setLeaving(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                disabled={leaving}
                className="lol-button-danger px-4 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {leaving ? 'Départ...' : '🚪 Quitter'}
            </button>

            {showConfirm && (
                <ConfirmDialog
                    title={isCreator ? "⚠️ Tu es le créateur !" : "Quitter la room ?"}
                    message={
                        isCreator
                            ? "Si tu quittes, la room sera supprimée et tous les invocateurs seront déconnectés. Es-tu sûr ?"
                            : "Es-tu sûr de vouloir quitter cette room ?"
                    }
                    confirmText="Quitter"
                    cancelText="Rester"
                    confirmColor="red"
                    onConfirm={handleLeave}
                    onCancel={() => setShowConfirm(false)}
                />
            )}

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </>
    );
}
