'use client';

import { useCallback, useMemo, useState } from 'react';
import { SoloScreen } from '@/app/games/solo/SoloScreen';
import { usePersistedState } from '@/app/games/solo/usePersistedState';
import {
  AC,
  AcAlert,
  AcButton,
  AcCard,
  AcGlyph,
} from '@/app/components/arcane';
import {
  WIKIERA_ENTRIES,
  matchesWikiera,
  type WikiEraEntry,
} from '@/lib/wikiera/entries';
import { dailyDateKey, pickByDay } from '@/lib/solo/dailyIndex';

interface SavedState {
  date: string;
  attempts: string[];
  won: boolean;
  gaveUp: boolean;
}

export function WikiEraGame() {
  const entry = useMemo<WikiEraEntry>(() => pickByDay(WIKIERA_ENTRIES), []);
  const today = dailyDateKey();
  const storageKey = `wikiera_${today}`;

  const defaultState = useMemo<SavedState>(
    () => ({ date: today, attempts: [], won: false, gaveUp: false }),
    [today],
  );
  const [saved, setSaved] = usePersistedState<SavedState>(storageKey, defaultState);
  const current = saved.date === today ? saved : defaultState;
  const { attempts, won, gaveUp } = current;
  const [input, setInput] = useState('');

  const finished = won || gaveUp;

  const submit = useCallback(() => {
    if (finished || !input.trim()) return;
    const nextAttempts = [...attempts, input.trim()];
    const matched = matchesWikiera(input, entry);
    setSaved({
      date: today,
      attempts: nextAttempts,
      won: matched,
      gaveUp: false,
    });
    setInput('');
  }, [attempts, entry, finished, input, setSaved, today]);

  const giveUp = () => {
    setSaved({ date: today, attempts, won: false, gaveUp: true });
  };

  return (
    <SoloScreen title="WIKIERA" accent={AC.violet}>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 11,
            letterSpacing: '0.22em',
            color: AC.bone2,
            textTransform: 'uppercase',
          }}
        >
          {`// UN WIKI PAR JOUR · ${attempts.length} essai${attempts.length > 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Article */}
      <AcCard fold style={{ padding: 24, marginBottom: 18 }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 10,
            letterSpacing: '0.25em',
            color: AC.violet,
            marginBottom: 10,
            textTransform: 'uppercase',
          }}
        >
          {'// EXTRAIT'}
        </div>
        <div
          style={{
            fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
            fontSize: 16,
            lineHeight: 1.6,
            color: AC.bone,
          }}
        >
          {/* Le nom du sujet est masqué : on remplace toute occurrence par "[???]". */}
          {entry.text}
        </div>
      </AcCard>

      {/* Input */}
      {!finished && (
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
              placeholder="Tape ta réponse…"
              className="ac-input"
              style={{
                flex: 1,
                padding: '12px 14px',
                background: 'rgba(240,228,193,0.04)',
                border: `1.5px solid ${AC.bone}`,
                color: AC.bone,
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 15,
                outline: 'none',
              }}
              autoFocus
            />
            <AcButton
              variant="primary"
              size="md"
              onClick={submit}
              disabled={!input.trim()}
              icon={<AcGlyph kind="arrowRight" color={AC.ink} size={12} />}
            >
              OK
            </AcButton>
          </div>
          {attempts.length >= 2 && (
            <div className="mt-3 text-right">
              <AcButton variant="ghost" size="sm" onClick={giveUp}>
                ABANDONNER
              </AcButton>
            </div>
          )}
        </div>
      )}

      {/* Historique des essais */}
      {attempts.length > 0 && (
        <AcCard fold={false} dashed style={{ padding: 14, marginBottom: 16 }}>
          <div
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              letterSpacing: '0.22em',
              color: AC.bone2,
              marginBottom: 8,
              textTransform: 'uppercase',
            }}
          >
            {'// TES ESSAIS'}
          </div>
          <div className="flex flex-col gap-1">
            {attempts.map((a, i) => {
              const matched = matchesWikiera(a, entry);
              return (
                <div
                  key={i}
                  className="flex items-center gap-2"
                  style={{
                    padding: '6px 10px',
                    borderLeft: `3px solid ${matched ? AC.chem : AC.rust}`,
                    background: 'rgba(240,228,193,0.03)',
                    fontFamily:
                      "'JetBrains Mono', 'Courier New', monospace",
                    fontSize: 13,
                    color: AC.bone,
                  }}
                >
                  <span style={{ color: AC.bone2, minWidth: 24 }}>
                    #{i + 1}
                  </span>
                  <span className="flex-1">{a}</span>
                  <span style={{ color: matched ? AC.chem : AC.rust }}>
                    {matched ? '✓' : '✗'}
                  </span>
                </div>
              );
            })}
          </div>
        </AcCard>
      )}

      {/* États finaux */}
      {won && (
        <AcAlert tone="info" tape="// BRAVO">
          <span style={{ color: AC.bone }}>
            {`// trouvé en ${attempts.length} essai${attempts.length > 1 ? 's' : ''} — c'était `}
            <strong style={{ color: AC.gold }}>{entry.topic}</strong>
          </span>
        </AcAlert>
      )}
      {gaveUp && (
        <AcAlert tone="danger" tape="// ABANDON">
          <span style={{ color: AC.bone }}>
            {"// la réponse était "}
            <strong style={{ color: AC.gold }}>{entry.topic}</strong>
            {" — à demain"}
          </span>
        </AcAlert>
      )}
    </SoloScreen>
  );
}
