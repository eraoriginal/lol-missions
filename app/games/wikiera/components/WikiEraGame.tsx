'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SoloScreen } from '@/app/games/solo/SoloScreen';
import { usePersistedState } from '@/app/games/solo/usePersistedState';
import {
  AC,
  AcAlert,
  AcButton,
  AcCard,
  AcGlyph,
} from '@/app/components/arcane';
import { dailyDateKey } from '@/lib/solo/dailyIndex';

interface AttemptRecord {
  guess: string;
  correct: boolean;
}

interface SavedState {
  date: string;
  attempts: AttemptRecord[];
  /** Sujet révélé par le serveur quand correct OU abandon. */
  target: string | null;
  gaveUp: boolean;
}

export function WikiEraGame() {
  const today = dailyDateKey();
  const storageKey = `wikiera_${today}`;

  const [text, setText] = useState<string | null>(null);
  const [textError, setTextError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/solo/wikiera/today', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: { text: string }) => {
        if (!cancelled) setText(data.text);
      })
      .catch((err) => {
        if (!cancelled) setTextError((err as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const defaultState = useMemo<SavedState>(
    () => ({ date: today, attempts: [], target: null, gaveUp: false }),
    [today],
  );
  const [saved, setSaved] = usePersistedState<SavedState>(
    storageKey,
    defaultState,
  );
  const current = saved.date === today ? saved : defaultState;
  const { attempts, target, gaveUp } = current;

  const won = attempts.some((a) => a.correct);
  const finished = won || gaveUp;

  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = useCallback(async () => {
    if (finished || submitting || !input.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/solo/wikiera/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess: input.trim() }),
      });
      if (!res.ok) {
        setSubmitting(false);
        return;
      }
      const data = (await res.json()) as {
        correct: boolean;
        target?: string;
      };
      const newAttempt: AttemptRecord = {
        guess: input.trim(),
        correct: data.correct,
      };
      setSaved({
        date: today,
        attempts: [...attempts, newAttempt],
        target: data.target ?? saved.target,
        gaveUp: false,
      });
      setInput('');
    } finally {
      setSubmitting(false);
    }
  }, [attempts, finished, input, saved.target, setSaved, submitting, today]);

  const giveUp = useCallback(async () => {
    if (finished || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/solo/wikiera/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guess: '_giveup_', giveUp: true }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { target?: string };
      setSaved({
        date: today,
        attempts,
        target: data.target ?? null,
        gaveUp: true,
      });
    } finally {
      setSubmitting(false);
    }
  }, [attempts, finished, setSaved, submitting, today]);

  if (textError) {
    return (
      <SoloScreen title="WIKIERA" accent={AC.violet}>
        <AcAlert tone="danger" tape="// ERREUR">
          <span style={{ color: AC.bone }}>
            {`// impossible de charger le wiki du jour : ${textError}`}
          </span>
        </AcAlert>
      </SoloScreen>
    );
  }
  if (!text) {
    return (
      <SoloScreen title="WIKIERA" accent={AC.violet}>
        <AcCard fold={false} dashed style={{ padding: 24 }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 12,
              color: AC.bone2,
            }}
          >
            {'// chargement…'}
          </span>
        </AcCard>
      </SoloScreen>
    );
  }

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
          {text}
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
              disabled={submitting}
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
              disabled={!input.trim() || submitting}
              icon={<AcGlyph kind="arrowRight" color={AC.ink} size={12} />}
            >
              OK
            </AcButton>
          </div>
          {attempts.length >= 2 && (
            <div className="mt-3 text-right">
              <AcButton
                variant="ghost"
                size="sm"
                onClick={giveUp}
                disabled={submitting}
              >
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
            {attempts.map((a, i) => (
              <div
                key={i}
                className="flex items-center gap-2"
                style={{
                  padding: '6px 10px',
                  borderLeft: `3px solid ${a.correct ? AC.chem : AC.rust}`,
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
                <span className="flex-1">{a.guess}</span>
                <span style={{ color: a.correct ? AC.chem : AC.rust }}>
                  {a.correct ? '✓' : '✗'}
                </span>
              </div>
            ))}
          </div>
        </AcCard>
      )}

      {/* États finaux */}
      {won && target && (
        <AcAlert tone="info" tape="// BRAVO">
          <span style={{ color: AC.bone }}>
            {`// trouvé en ${attempts.length} essai${attempts.length > 1 ? 's' : ''} — c'était `}
            <strong style={{ color: AC.gold }}>{target}</strong>
          </span>
        </AcAlert>
      )}
      {gaveUp && target && (
        <AcAlert tone="danger" tape="// ABANDON">
          <span style={{ color: AC.bone }}>
            {"// la réponse était "}
            <strong style={{ color: AC.gold }}>{target}</strong>
            {" — à demain"}
          </span>
        </AcAlert>
      )}
    </SoloScreen>
  );
}
