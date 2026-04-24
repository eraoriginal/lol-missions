'use client';

import {
  AC,
  AC_CLIP,
  AcCard,
  AcDisplay,
  AcGlyph,
  AcShim,
  AcSplat,
  AcStamp,
} from '@/app/components/arcane';

interface GameStatusProps {
  currentTeam: string;
  redRemaining: number;
  blueRemaining: number;
  currentClue: string | null;
  currentNumber: number | null;
  guessesLeft: number;
  gameOver: boolean;
  winner: string | null;
}

function hexWithAlpha(hex: string, alpha: number): string {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return hex;
  const bigint = parseInt(m[1], 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function GameStatus({
  currentTeam,
  redRemaining,
  blueRemaining,
  currentClue,
  currentNumber,
  guessesLeft,
  gameOver,
  winner,
}: GameStatusProps) {
  const turnColor = currentTeam === 'red' ? AC.rust : AC.hex;

  if (gameOver) {
    const winColor = winner === 'red' ? AC.rust : AC.hex;
    const winName = winner === 'red' ? 'ROUGE' : 'BLEU';
    return (
      <div className="relative">
        <div style={{ position: 'absolute', top: -30, right: -30, pointerEvents: 'none' }}>
          <AcSplat color={winColor} size={280} opacity={0.35} seed={2} />
        </div>
        <AcCard fold drip dripColor={winColor} style={{ padding: 28, textAlign: 'center' }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              letterSpacing: '0.3em',
              color: AC.chem,
              marginBottom: 10,
            }}
          >
            {'// GAME OVER · VICTORY'}
          </div>
          <AcDisplay style={{ fontSize: 'clamp(30px, 5vw, 46px)' }}>
            ÉQUIPE <AcShim color={winColor}>{winName}</AcShim> GAGNE
          </AcDisplay>
          <div className="mt-5 flex justify-center">
            <AcStamp color={winColor} rotate={-3} style={{ fontSize: 11, padding: '8px 14px' }}>
              {'// MISSION RÉUSSIE'}
            </AcStamp>
          </div>
        </AcCard>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Score bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-4"
        style={{
          padding: '14px 18px',
          border: `2px solid ${turnColor}`,
          background: `linear-gradient(180deg, ${hexWithAlpha(turnColor, 0.1)} 0%, rgba(13,11,8,0.55) 100%)`,
        }}
      >
        {/* Score */}
        <div className="flex items-center gap-3">
          <ScoreBlock color={AC.rust} count={redRemaining} label="ROUGE" />
          <span
            style={{
              fontFamily: "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
              fontWeight: 800,
              fontSize: 20,
              color: AC.bone2,
              letterSpacing: '0.1em',
            }}
          >
            VS
          </span>
          <ScoreBlock color={AC.hex} count={blueRemaining} label="BLEU" />
        </div>

        {/* Turn */}
        <div className="flex items-center gap-3">
          <div
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              letterSpacing: '0.25em',
              color: AC.bone2,
              textTransform: 'uppercase',
            }}
          >
            {'// TOUR EN COURS'}
          </div>
          <span
            style={{
              background: turnColor,
              color: currentTeam === 'red' ? AC.bone : AC.ink,
              fontFamily: "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: '0.12em',
              padding: '5px 12px',
            }}
          >
            ÉQUIPE {currentTeam === 'red' ? 'ROUGE' : 'BLEU'}
          </span>
        </div>
      </div>

      {/* Clue display */}
      {currentClue ? (
        <div
          style={{
            position: 'relative',
            padding: '18px 22px',
            border: `2px solid ${turnColor}`,
            background: `linear-gradient(180deg, ${hexWithAlpha(turnColor, 0.15)} 0%, rgba(13,11,8,0.6) 100%)`,
          }}
        >
          <div
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              letterSpacing: '0.3em',
              color: turnColor,
              marginBottom: 8,
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            {'// INDICE ACTUEL'}
          </div>
          <div className="flex items-center justify-center gap-5 flex-wrap">
            <AcDisplay style={{ fontSize: 'clamp(28px, 5vw, 48px)' }}>
              <AcShim color={turnColor}>&quot;{currentClue}&quot;</AcShim>
            </AcDisplay>
            <div
              style={{
                background: turnColor,
                color: currentTeam === 'red' ? AC.bone : AC.ink,
                fontFamily:
                  "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(28px, 5vw, 42px)',
                letterSpacing: '0.04em',
                padding: '6px 18px',
                clipPath: AC_CLIP,
                minWidth: 64,
                textAlign: 'center',
              }}
            >
              {currentNumber === 0 ? '∞' : currentNumber}
            </div>
          </div>
          <div
            className="mt-3 flex items-center justify-center gap-2"
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 12,
              letterSpacing: '0.15em',
              color: AC.bone,
              textTransform: 'uppercase',
            }}
          >
            <AcGlyph kind="target" color={AC.shimmer} size={14} stroke={2.5} />
            <span>
              <span style={{ color: AC.shimmer, fontWeight: 700 }}>
                {guessesLeft === 999 ? '∞' : guessesLeft}
              </span>{' '}
              ESSAI{guessesLeft !== 1 ? 'S' : ''} RESTANT{guessesLeft !== 1 ? 'S' : ''}
            </span>
          </div>
        </div>
      ) : (
        <div
          className="py-4 text-center"
          style={{
            border: `1.5px dashed ${turnColor}`,
            background: 'rgba(240,228,193,0.03)',
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 12,
              letterSpacing: '0.15em',
              color: AC.bone2,
              textTransform: 'uppercase',
            }}
          >
            {'// en attente de l\'indice du maître-espion '}
            <span style={{ color: turnColor, fontWeight: 700 }}>
              {currentTeam === 'red' ? 'ROUGE' : 'BLEU'}
            </span>
            {'...'}
          </span>
        </div>
      )}
    </div>
  );
}

function ScoreBlock({ color, count, label }: { color: string; count: number; label: string }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5"
      style={{
        background: hexWithAlpha(color, 0.2),
        border: `1.5px solid ${color}`,
      }}
    >
      <span
        style={{
          fontFamily: "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
          fontWeight: 800,
          fontSize: 26,
          color,
          lineHeight: 1,
        }}
      >
        {count}
      </span>
      <span
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 9,
          letterSpacing: '0.25em',
          color,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  );
}
