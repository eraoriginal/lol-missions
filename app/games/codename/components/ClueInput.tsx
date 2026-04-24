'use client';

import { useState } from 'react';
import {
  AC,
  AC_CLIP,
  AcAlert,
  AcButton,
  AcCard,
  AcGlyph,
  AcSectionNum,
} from '@/app/components/arcane';

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
    <AcCard fold dashed style={{ padding: 18 }}>
      <div className="flex items-center gap-2.5 mb-3">
        <AcSectionNum n={'TX'} />
        <h3
          className="m-0"
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          TRANSMISSION D&apos;INDICE
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {/* Clue input */}
        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              letterSpacing: '0.25em',
              color: AC.chem,
              marginBottom: 6,
              textTransform: 'uppercase',
            }}
          >
            {'> MOT-CODE'}
          </div>
          <input
            type="text"
            value={clue}
            onChange={(e) => setClue(e.target.value)}
            placeholder="Un seul mot..."
            className="ac-input"
            maxLength={50}
            disabled={submitting}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'rgba(240,228,193,0.04)',
              border: `1.5px solid ${AC.bone2}`,
              color: AC.bone,
              fontFamily:
                "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              outline: 'none',
            }}
          />
        </div>

        {/* Number picker */}
        <div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              letterSpacing: '0.25em',
              color: AC.chem,
              marginBottom: 6,
              textTransform: 'uppercase',
            }}
          >
            {'> NOMBRE DE CARTES'}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
              const active = n === number;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setNumber(n)}
                  disabled={submitting}
                  style={{
                    width: 40,
                    height: 40,
                    background: active ? AC.shimmer : 'rgba(240,228,193,0.03)',
                    color: active ? AC.ink : AC.bone,
                    border: active ? `2px solid ${AC.shimmer}` : `1.5px dashed ${AC.bone2}`,
                    clipPath: AC_CLIP,
                    fontFamily:
                      "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                    fontWeight: 800,
                    fontSize: 18,
                    cursor: 'pointer',
                  }}
                >
                  {n === 0 ? '∞' : n}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <AcButton
          variant="primary"
          size="md"
          drip
          fullWidth
          type="submit"
          disabled={submitting || !clue.trim()}
          icon={<AcGlyph kind="arrowRight" color={AC.ink} size={14} />}
        >
          {submitting ? 'TRANSMISSION…' : 'ENVOYER L\'INDICE'}
        </AcButton>

        {error && (
          <AcAlert tone="danger" tape="// ERR">
            <span style={{ color: AC.bone }}>{'// '}{error}</span>
          </AcAlert>
        )}

        <div
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 10,
            color: AC.bone2,
            lineHeight: 1.55,
            letterSpacing: '0.1em',
          }}
        >
          {'// ∞ = essais illimités · l\'indice ne peut pas être un mot du plateau'}
        </div>
      </form>
    </AcCard>
  );
}
