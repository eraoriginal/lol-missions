'use client';

import { useState } from 'react';

interface ClueInputProps {
  roomCode: string;
  playerToken: string;
  onClueGiven?: () => void;
}

export function ClueInput({ roomCode, playerToken, onClueGiven }: ClueInputProps) {
  const [clue, setClue] = useState('');
  const [number, setNumber] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clue.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/games/codename/${roomCode}/clue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerToken, clue: clue.trim(), number }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }

      setClue('');
      setNumber(1);
      if (onClueGiven) onClueGiven();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="poki-panel p-4">
      <h3 className="text-lg font-bold poki-title mb-3 text-center">
        🔮 Donnez un indice
      </h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex justify-center">
          <input
            type="text"
            value={clue}
            onChange={(e) => setClue(e.target.value)}
            placeholder="Votre indice..."
            className="poki-input w-1/2 px-4 py-2 text-center"
            maxLength={50}
            disabled={submitting}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setNumber(n)}
              disabled={submitting}
              className={`w-10 h-10 rounded-lg font-bold text-lg transition-all ${
                number === n
                  ? 'bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-lg shadow-pink-500/30'
                  : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/40 border border-purple-500/30'
              }`}
            >
              {n === 0 ? '∞' : n}
            </button>
          ))}
        </div>
        <button
          type="submit"
          disabled={submitting || !clue.trim()}
          className="w-full poki-btn-primary px-4 py-2 font-bold transition-all"
        >
          {submitting ? '⏳ Envoi...' : '📤 Envoyer l\'indice'}
        </button>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </form>
      <p className="text-xs text-purple-300/60 text-center mt-2">
        ∞ = illimité • L&apos;indice ne peut pas être un mot du plateau
      </p>
    </div>
  );
}
