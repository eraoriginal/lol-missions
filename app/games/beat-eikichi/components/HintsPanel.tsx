'use client';

import { useEffect, useState } from 'react';
import { AC, AcGlyph, AcSectionNum } from '@/app/components/arcane';

interface HintsPanelProps {
  questionStartedAt: string | null;
  timerSeconds: number;
  hintGenre: string | null;
  hintTerm: string | null;
  hintPlatforms: string | null;
}

/**
 * Panneau d'indices — 3 slots révélés progressivement pendant la question :
 *   - genre : dès 0s
 *   - terme : à mi-timer
 *   - plateformes : à -10s
 * Skin Arcane.kit : slots en bordure dashed qui deviennent chem quand révélé.
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

  if (!hintGenre && !hintTerm && !hintPlatforms) return null;

  const total = timerSeconds;
  const showGenre = elapsed >= 0 && !!hintGenre;
  const showTerm = elapsed >= total / 2 && !!hintTerm;
  const showPlatforms = elapsed >= total - 10 && !!hintPlatforms;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <AcSectionNum n="i" />
        <span
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: AC.bone,
          }}
        >
          INDICES
        </span>
      </div>
      <div className="flex flex-col gap-2.5">
        <HintSlot
          n={1}
          label="GENRE"
          value={hintGenre}
          revealed={showGenre}
          hiddenHint="// révélé au début"
        />
        <HintSlot
          n={2}
          label="TERME"
          value={hintTerm}
          revealed={showTerm}
          hiddenHint={`// révélé à ${Math.ceil(total / 2)}s`}
        />
        <HintSlot
          n={3}
          label="PLATEFORMES"
          value={hintPlatforms}
          revealed={showPlatforms}
          hiddenHint="// révélé aux -10s"
        />
      </div>
      <div
        style={{
          marginTop: 14,
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 10,
          color: AC.bone2,
          lineHeight: 1.5,
        }}
      >
        {'// 1 indice au début'}
        <br />
        {'// 1 à mi-timer'}
        <br />
        {'// 1 aux -10s'}
      </div>
    </div>
  );
}

function HintSlot({
  n,
  label,
  value,
  revealed,
  hiddenHint,
}: {
  n: number;
  label: string;
  value: string | null;
  revealed: boolean;
  hiddenHint: string;
}) {
  const color = revealed ? AC.chem : AC.bone2;
  return (
    <div
      style={{
        padding: '10px 12px',
        border: `1.5px dashed ${color}`,
        background: revealed ? 'rgba(18,214,168,0.08)' : 'rgba(240,228,193,0.02)',
        minHeight: 52,
      }}
    >
      <div className="flex justify-between items-baseline mb-1">
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 9,
            letterSpacing: '0.25em',
            color,
            textTransform: 'uppercase',
          }}
        >
          {'// INDICE '}
          {n}
          {'/3 · '}
          {label}
        </span>
        {revealed && <AcGlyph kind="check" color={AC.chem} size={12} stroke={2.5} />}
      </div>
      {revealed && value ? (
        <div
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 700,
            fontSize: 15,
            color: AC.bone,
            textTransform: 'uppercase',
          }}
        >
          {value}
        </div>
      ) : (
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 10,
            color: AC.bone2,
            fontStyle: 'italic',
          }}
        >
          {hiddenHint}
        </div>
      )}
    </div>
  );
}
