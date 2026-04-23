'use client';

import { useEffect, useState } from 'react';
import { AC } from '@/app/components/arcane';

interface BeatEikichiTimerProps {
  /** ISO datetime du début de la question courante. */
  questionStartedAt: string | null;
  /** Durée totale de la question en secondes (provient de game.timerSeconds). */
  timerSeconds: number;
  /** Appelé à chaque tick une fois le timer écoulé. Le caller doit dédupliquer. */
  onTimeout?: () => void;
  /** Affichage compact (mobile) ou normal (desktop). */
  compact?: boolean;
}

/**
 * Timer dérivé du `questionStartedAt` serveur — tick toutes les 200ms, appelle
 * `onTimeout` tant que le temps est écoulé (parent dédup). Skin Arcane.kit :
 * gros chiffres Barlow Condensed, bascule en rust + pulse sous 10s.
 */
export function BeatEikichiTimer({
  questionStartedAt,
  timerSeconds,
  onTimeout,
  compact = false,
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

  const urgent = remaining <= 10;

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={urgent ? 'ac-pulse' : undefined}
        style={{
          fontFamily:
            "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
          fontSize: compact ? 38 : 54,
          fontWeight: 900,
          color: urgent ? AC.rust : AC.bone,
          textShadow: urgent
            ? `2px 2px 0 ${AC.ink}, -1px 1px 0 ${AC.gold}`
            : `2px 2px 0 ${AC.ink}`,
          letterSpacing: '-0.02em',
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1,
        }}
      >
        {String(remaining).padStart(2, '0')}
        <span
          style={{
            fontSize: compact ? 18 : 28,
            color: AC.bone2,
          }}
        >
          s
        </span>
      </span>
    </div>
  );
}
