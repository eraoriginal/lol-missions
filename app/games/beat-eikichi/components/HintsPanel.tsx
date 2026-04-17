'use client';

import { useEffect, useState } from 'react';

interface HintsPanelProps {
  questionStartedAt: string | null;
  timerSeconds: number;
  hintGenre: string | null;
  hintTerm: string | null;
  hintPlatforms: string | null;
}

/**
 * Affiche progressivement les 3 indices pendant la question :
 *   - Indice 1 (genre) dès l'affichage
 *   - Indice 2 (terme) à la moitié du timer
 *   - Indice 3 (plateformes) à -10 s de la fin
 */
export function HintsPanel({
  questionStartedAt,
  timerSeconds,
  hintGenre,
  hintTerm,
  hintPlatforms,
}: HintsPanelProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!questionStartedAt) return;
    const startMs = new Date(questionStartedAt).getTime();
    const tick = () => setElapsed((Date.now() - startMs) / 1000);
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [questionStartedAt]);

  const total = timerSeconds;
  const showGenre = elapsed >= 0 && !!hintGenre;
  const showTerm = elapsed >= total / 2 && !!hintTerm;
  const showPlatforms = elapsed >= total - 10 && !!hintPlatforms;

  if (!hintGenre && !hintTerm && !hintPlatforms) return null;

  return (
    <div className="arcane-card p-3 space-y-2">
      <div className="text-xs uppercase tracking-widest text-purple-400/70">
        Indices
      </div>
      <ul className="space-y-1.5">
        <HintRow
          label="Genre"
          value={hintGenre}
          revealed={showGenre}
        />
        <HintRow
          label="Terme"
          value={hintTerm}
          revealed={showTerm}
          hiddenHint={`Révélé à ${Math.ceil(total / 2)}s`}
        />
        <HintRow
          label="Plateformes"
          value={hintPlatforms}
          revealed={showPlatforms}
          hiddenHint="Révélé dans les 10 dernières secondes"
        />
      </ul>
    </div>
  );
}

function HintRow({
  label,
  value,
  revealed,
  hiddenHint,
}: {
  label: string;
  value: string | null;
  revealed: boolean;
  hiddenHint?: string;
}) {
  return (
    <li className="flex items-start gap-2 text-sm">
      <span className="text-purple-300/70 min-w-[86px]">{label} :</span>
      {revealed && value ? (
        <span className="text-amber-200 font-semibold">{value}</span>
      ) : (
        <span className="text-purple-400/40 italic">
          {hiddenHint ?? '—'}
        </span>
      )}
    </li>
  );
}
