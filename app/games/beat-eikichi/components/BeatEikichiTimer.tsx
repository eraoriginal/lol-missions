'use client';

import { useEffect, useState } from 'react';
import { BEAT_EIKICHI_CONFIG } from '@/lib/beatEikichi/config';

interface BeatEikichiTimerProps {
  /** ISO datetime du début de la question courante. */
  questionStartedAt: string | null;
  /** Appelé une seule fois quand le timer atteint 0 (côté client). */
  onTimeout?: () => void;
}

/**
 * Timer côté client dérivé du `questionStartedAt` serveur.
 * Déclenche `onTimeout` une seule fois au passage à 0.
 */
export function BeatEikichiTimer({
  questionStartedAt,
  onTimeout,
}: BeatEikichiTimerProps) {
  const [remaining, setRemaining] = useState<number>(
    BEAT_EIKICHI_CONFIG.QUESTION_TIMER_SECONDS,
  );

  useEffect(() => {
    if (!questionStartedAt) return;

    let fired = false;
    const startMs = new Date(questionStartedAt).getTime();
    const total = BEAT_EIKICHI_CONFIG.QUESTION_TIMER_SECONDS;

    const tick = () => {
      const elapsed = (Date.now() - startMs) / 1000;
      const left = Math.max(0, total - elapsed);
      setRemaining(Math.ceil(left));
      if (left <= 0 && !fired) {
        fired = true;
        onTimeout?.();
      }
    };
    tick();
    const id = setInterval(tick, 200);
    return () => clearInterval(id);
  }, [questionStartedAt, onTimeout]);

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
