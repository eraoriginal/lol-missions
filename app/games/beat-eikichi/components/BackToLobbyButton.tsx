'use client';

import { useState } from 'react';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';

interface BackToLobbyButtonProps {
  roomCode: string;
  /** Si true, ouvre une confirmation avant d'agir (recommandé en cours de partie). */
  confirm?: boolean;
  /** Texte du bouton (par défaut « ↻ Retour au lobby »). */
  label?: string;
}

/**
 * Bouton "Retour au lobby" réservé au créateur de la room.
 * Appelle POST /api/games/beat-eikichi/[code]/back-to-lobby qui :
 *  - supprime la BeatEikichiGame courante
 *  - remet Room.gameStarted = false
 *  - pushRoomUpdate → tous les clients retournent au lobby
 *
 * Ne s'affiche que si l'utilisateur a le creator token en localStorage.
 */
export function BackToLobbyButton({
  roomCode,
  confirm = true,
  label = '↻ Retour au lobby',
}: BackToLobbyButtonProps) {
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
      await fetch(`/api/games/beat-eikichi/${roomCode}/back-to-lobby`, {
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
      <button
        onClick={() => (confirm ? setShowConfirm(true) : doBackToLobby())}
        disabled={busy}
        className="px-4 py-2 rounded-lg bg-purple-900/40 border border-purple-500/40 text-purple-100 hover:bg-purple-900/60 transition text-sm font-medium disabled:opacity-50"
      >
        {busy ? 'Retour…' : label}
      </button>

      {showConfirm && (
        <ConfirmDialog
          title="Retour au lobby ?"
          message="La partie en cours sera annulée. Les scores et réponses seront perdus. Tu pourras relancer une nouvelle partie ensuite."
          confirmText="Revenir au lobby"
          cancelText="Continuer la partie"
          confirmColor="orange"
          onConfirm={doBackToLobby}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
}
