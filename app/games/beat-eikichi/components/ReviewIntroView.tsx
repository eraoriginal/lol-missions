'use client';

import { useState } from 'react';

interface ReviewIntroViewProps {
  roomCode: string;
  isCreator: boolean;
  creatorToken: string | null;
}

export function ReviewIntroView({
  roomCode,
  isCreator,
  creatorToken,
}: ReviewIntroViewProps) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    if (!creatorToken) return;
    setStarting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/games/beat-eikichi/${roomCode}/review-start`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creatorToken }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Erreur');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="min-h-screen arcane-bg flex items-center justify-center p-8">
      <div className="arcane-card p-10 max-w-lg w-full text-center space-y-6">
        {isCreator ? (
          <>
            <h1 className="text-3xl md:text-4xl font-light text-purple-100 tracking-wide">
              Voir les réponses
            </h1>
            <p className="text-purple-300/70">
              Les 20 questions sont terminées. Tu peux lancer le récapitulatif
              quand tout le monde est prêt.
            </p>
            <button
              onClick={handleStart}
              disabled={starting}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold transition disabled:opacity-50"
            >
              {starting ? 'Démarrage…' : '▶ Commencer'}
            </button>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-light text-purple-100 tracking-wide">
              En attente des réponses
            </h1>
            <p className="text-purple-300/70">
              Le maître de la room va bientôt lancer le récapitulatif…
            </p>
            <div className="flex justify-center">
              <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
