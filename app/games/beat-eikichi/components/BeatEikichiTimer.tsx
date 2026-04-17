'use client';

import { useEffect, useState } from 'react';

interface BeatEikichiTimerProps {
  /** ISO datetime du début de la question courante. */
  questionStartedAt: string | null;
  /** Durée totale de la question en secondes (provient de game.timerSeconds). */
  timerSeconds: number;
  /** Appelé à chaque tick une fois le timer écoulé. Le caller doit dédupliquer. */
  onTimeout?: () => void;
}

/**
 * Timer côté client dérivé du `questionStartedAt` serveur.
 * Appelle `onTimeout` à chaque tick (≈200ms) tant que le timer est dépassé —
 * le parent (via un ref) dédup le premier appel ; il pourra relâcher le verrou
 * si le serveur rejette (décalage d'horloge) pour déclencher une retry automatique.
 */
export function BeatEikichiTimer({
  questionStartedAt,
  timerSeconds,
  onTimeout,
}: BeatEikichiTimerProps) {
  const [remaining, setRemaining] = useState<number>(timerSeconds);

  useEffect(() => {
    if (!questionStartedAt) return;

    const startMs = new Date(questionStartedAt).getTime();
    const total = timerSeconds;

    const tick = () => {
      const elapsed = (Date.now() - startMs) / 1000;
      const left = Math.max(0, total - elapsed);
      setRemaining(Math.ceil(left));
      if (left <= 0) {
        onTimeout?.();
      }
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [questionStartedAt, timerSeconds, onTimeout]);

  const danger = remaining <= 10;

  return (
    <div
      className={`text-5xl md:text-6xl font-bold font-mono tabular-nums text-center transition-colors ${
        danger ? 'text-red-400' : 'text-purple-100'
      }`}
    >
      {String(remaining).padStart(2, '0')}s
    </div>
  );
}
