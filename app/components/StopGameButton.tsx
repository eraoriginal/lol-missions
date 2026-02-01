'use client';

import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';
import { Toast } from './Toast';

interface StopGameButtonProps {
    roomCode: string;
}

export function StopGameButton({ roomCode }: StopGameButtonProps) {
    const [stopping, setStopping] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleStop = async () => {
        setShowConfirm(false);
        setStopping(true);

        const creatorToken = localStorage.getItem(`room_${roomCode}_creator`);

        if (!creatorToken) {
            setToast({ message: 'Seul le créateur peut arrêter la partie', type: 'error' });
            setStopping(false);
            return;
        }

        try {
            const response = await fetch(`/api/rooms/${roomCode}/stop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ creatorToken }),
            });

            if (response.ok) {
                setToast({ message: 'Partie arrêtée avec succès', type: 'success' });
            } else {
                const errorData = await response.json();
                setToast({ message: errorData.error || 'Erreur', type: 'error' });
                setStopping(false);
            }
        } catch (error) {
            console.error('Error stopping game:', error);
            setToast({ message: 'Erreur de connexion', type: 'error' });
            setStopping(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                disabled={stopping}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
                {stopping ? 'Arrêt...' : '⏸️ Mettre fin à la partie'}
            </button>

            {showConfirm && (
                <ConfirmDialog
                    title="⏸️ Arrêter la partie ?"
                    message="La partie sera mise en pause et le compteur s'arrêtera. Tu pourras ensuite recommencer une nouvelle partie."
                    confirmText="Arrêter"
                    cancelText="Continuer"
                    confirmColor="orange"
                    onConfirm={handleStop}
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