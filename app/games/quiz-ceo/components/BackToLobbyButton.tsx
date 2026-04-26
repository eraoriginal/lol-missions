'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';
import { AC, AcButton, AcGlyph } from '@/app/components/arcane';

interface Props {
  roomCode: string;
  confirm?: boolean;
  label?: string;
}

/**
 * Bouton « Retour au lobby » réservé au créateur du Quiz du CEO.
 * Supprime le QuizCeoGame, remet Room.gameStarted=false, pushRoomUpdate.
 */
export function BackToLobbyButton({
  roomCode,
  confirm = true,
  label = 'RETOUR AU LOBBY',
}: Props) {
  const [busy, setBusy] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const creatorToken =
    typeof window !== 'undefined'
      ? localStorage.getItem(`room_${roomCode}_creator`)
      : null;
  if (!creatorToken) return null;

  const doBackToLobby = async () => {
    setShowConfirm(false);
    setBusy(true);
    try {
      await fetch(`/api/games/quiz-ceo/${roomCode}/back-to-lobby`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorToken }),
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <AcButton
        variant="ghost"
        size="sm"
        onClick={() => (confirm ? setShowConfirm(true) : doBackToLobby())}
        disabled={busy}
        icon={<AcGlyph kind="arrowLeft" color={AC.bone} size={12} />}
      >
        {busy ? 'RETOUR…' : label}
      </AcButton>

      {showConfirm && (
        <ConfirmDialog
          title="Retour au lobby"
          message="La partie en cours sera annulée. Les scores et réponses seront perdus."
          confirmText="Revenir au lobby"
          cancelText="Continuer"
          confirmColor="orange"
          tapeLabel="// EN PLEINE PARTIE"
          onConfirm={doBackToLobby}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
