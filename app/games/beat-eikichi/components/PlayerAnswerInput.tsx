'use client';

import { useEffect, useRef, useState } from 'react';
import { AutocompleteInput, type CatalogEntry } from './AutocompleteInput';
import { BEAT_EIKICHI_CONFIG } from '@/lib/beatEikichi/config';

interface PlayerAnswerInputProps {
  roomCode: string;
  playerToken: string;
  catalog: CatalogEntry[];
  /** Si true, le joueur a déjà trouvé : on verrouille. */
  alreadyFound: boolean;
  /** Reset le champ quand la question change (nouvelle `questionKey`). */
  questionKey: string | number;
}

export function PlayerAnswerInput({
  roomCode,
  playerToken,
  catalog,
  alreadyFound,
  questionKey,
}: PlayerAnswerInputProps) {
  const [value, setValue] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const lastTypingSentRef = useRef<{ text: string; at: number }>({
    text: '',
    at: 0,
  });

  // Reset à chaque nouvelle question.
  useEffect(() => {
    setValue('');
    setShakeKey(0);
    lastTypingSentRef.current = { text: '', at: 0 };
  }, [questionKey]);

  // Throttle persistance de la saisie côté serveur.
  useEffect(() => {
    if (alreadyFound) return;
    const delay = BEAT_EIKICHI_CONFIG.TYPING_PERSIST_THROTTLE_MS;
    const timeSinceLast = Date.now() - lastTypingSentRef.current.at;
    if (value === lastTypingSentRef.current.text) return;

    const t = setTimeout(
      () => {
        fetch(`/api/games/beat-eikichi/${roomCode}/typing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerToken, text: value }),
        }).catch(() => {
          /* on ignore, ce n'est qu'un fallback */
        });
        lastTypingSentRef.current = { text: value, at: Date.now() };
      },
      Math.max(0, delay - timeSinceLast),
    );

    return () => clearTimeout(t);
  }, [value, roomCode, playerToken, alreadyFound]);

  const handleSubmit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || submitting || alreadyFound) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/games/beat-eikichi/${roomCode}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerToken, text: trimmed }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.correct) {
        // succès : on laisse le serveur pousser la mise à jour ;
        // le parent verra `alreadyFound=true` et verrouillera.
        setValue(trimmed);
      } else {
        // mauvaise réponse : shake + reset du champ
        setShakeKey((k) => k + 1);
        setValue('');
      }
    } catch {
      setShakeKey((k) => k + 1);
    } finally {
      setSubmitting(false);
    }
  };

  if (alreadyFound) {
    return (
      <div className="w-full p-4 rounded-lg bg-emerald-900/30 border border-emerald-500/50 text-center text-emerald-200 font-semibold">
        ✓ Tu as trouvé ! En attente des autres joueurs…
      </div>
    );
  }

  return (
    <AutocompleteInput
      catalog={catalog}
      value={value}
      onChange={setValue}
      onSubmit={handleSubmit}
      disabled={submitting}
      shakeKey={shakeKey}
      placeholder="Tape le nom du jeu puis Entrée…"
    />
  );
}
