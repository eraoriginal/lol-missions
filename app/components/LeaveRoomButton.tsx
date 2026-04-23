'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmDialog } from './ConfirmDialog';
import { Toast } from './Toast';
import { AC, AcButton, AcGlyph } from './arcane';

interface LeaveRoomButtonProps {
    roomCode: string;
    /** Libellé affiché. Par défaut « QUITTER ». */
    label?: string;
}

/**
 * Bouton « Quitter la room ». Appelle POST /api/rooms/[code]/leave qui :
 *   - si l'appelant est le créateur → supprime la room + Pusher push
 *     → les autres clients détectent le 404 via `useRoom` et sont redirigés
 *   - sinon → supprime juste le joueur + Pusher push
 *
 * Skin Arcane.kit (utilisé sur tous les écrans redesignés).
 */
export function LeaveRoomButton({ roomCode, label = 'QUITTER' }: LeaveRoomButtonProps) {
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

                localStorage.removeItem(`room_${roomCode}_player`);
                localStorage.removeItem(`room_${roomCode}_creator`);

                if (data.reason === 'creator-left') {
                    setToast({ message: 'Room supprimée avec succès', type: 'success' });
                } else {
                    setToast({ message: 'Tu as quitté la room', type: 'success' });
                }

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
            <AcButton
                variant="danger"
                size="sm"
                onClick={() => setShowConfirm(true)}
                disabled={leaving}
                icon={<AcGlyph kind="arrowLeft" color={AC.bone} size={12} />}
            >
                {leaving ? 'DÉPART…' : label}
            </AcButton>

            {showConfirm && (
                <ConfirmDialog
                    title={isCreator ? 'Tu es le créateur' : 'Quitter la room'}
                    message={
                        isCreator
                            ? "Si tu quittes, la room sera supprimée et tous les joueurs seront déconnectés. Cette action est irréversible."
                            : "Es-tu sûr de vouloir quitter cette room ? Tu pourras la rejoindre plus tard avec le même code."
                    }
                    confirmText={isCreator ? 'Supprimer la room' : 'Quitter'}
                    cancelText="Rester"
                    confirmColor="red"
                    destructive={isCreator}
                    tapeLabel={isCreator ? '// CRÉATEUR' : '// CONFIRMATION'}
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
