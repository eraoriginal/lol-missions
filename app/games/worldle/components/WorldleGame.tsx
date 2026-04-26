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
  WORLDLE_PUBLIC_COUNTRIES,
  arrowForBearing,
  type WorldlePublicCountry,
} from '@/lib/worldle/publicNames';
import { dailyDateKey } from '@/lib/solo/dailyIndex';

const MAX_ATTEMPTS = 7;

interface Attempt {
  countryId: string;
  countryName: string;
  distanceKm: number;
  bearing: number;
  proximityPct: number;
  correct: boolean;
}

interface SavedState {
  date: string;
  attempts: Attempt[];
  /** Pays cible révélé par le serveur quand correct OU épuisé. */
  target: { id: string; name: string } | null;
}

function colorForPct(pct: number): string {
  if (pct >= 100) return AC.chem;
  if (pct >= 90) return AC.gold;
  if (pct >= 65) return AC.shimmer;
  if (pct >= 40) return AC.hex;
  return AC.rust;
}

export function WorldleGame() {
  const today = dailyDateKey();
  const storageKey = `worldle_${today}`;

  const defaultState = useMemo<SavedState>(
    () => ({ date: today, attempts: [], target: null }),
    [today],
  );
  const [saved, setSaved] = usePersistedState<SavedState>(
    storageKey,
    defaultState,
  );
  const attempts = useMemo(
    () => (saved.date === today ? saved.attempts : []),
    [saved, today],
  );
  const target = saved.date === today ? saved.target : null;

  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [suggest, setSuggest] = useState<WorldlePublicCountry[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const won = attempts.some((a) => a.correct);
  const lost = !won && attempts.length >= MAX_ATTEMPTS;
  const finished = won || lost;

  const submit = useCallback(async () => {
    if (finished || submitting) return;
    if (!input.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/solo/worldle/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: input.trim(),
          attemptIndex: attempts.length,
        }),
      });
      const data = (await res.json()) as
        | {
            countryId: string;
            countryName: string;
            distanceKm: number;
            bearing: number;
            proximityPct: number;
            correct: boolean;
            target?: { id: string; name: string };
          }
        | { error: string };
      if (!res.ok || 'error' in data) {
        setError(
          'error' in data
            ? data.error
            : 'Erreur serveur',
        );
        return;
      }
      if (attempts.some((a) => a.countryId === data.countryId)) {
        setError('Tu as déjà essayé ce pays.');
        return;
      }
      const entry: Attempt = {
        countryId: data.countryId,
        countryName: data.countryName,
        distanceKm: data.distanceKm,
        bearing: data.bearing,
        proximityPct: data.proximityPct,
        correct: data.correct,
      };
      setSaved({
        date: today,
        attempts: [...attempts, entry],
        target: data.target ?? saved.target,
      });
      setInput('');
      setSuggest([]);
    } catch (err) {
      setError(`Erreur réseau : ${(err as Error).message}`);
    } finally {
      setSubmitting(false);
    }
  }, [attempts, finished, input, saved.target, setSaved, submitting, today]);

  const updateInput = (v: string) => {
    setInput(v);
    setError(null);
    if (!v.trim()) {
      setSuggest([]);
      return;
    }
    const norm = v
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '');
    const hits = WORLDLE_PUBLIC_COUNTRIES.filter((c) => {
      const name = c.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '');
      return name.startsWith(norm) || name.includes(norm);
    }).slice(0, 6);
    setSuggest(hits);
  };

  const pickSuggest = (c: WorldlePublicCountry) => {
    setInput(c.name);
    setSuggest([]);
  };

  return (
    <SoloScreen title="WORLDLE" accent={AC.hex}>
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
          {`// ${MAX_ATTEMPTS} ESSAIS · 1 PAYS PAR JOUR`}
        </span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        {/* Forme du pays */}
        <AcCard fold={false} style={{ padding: 16 }}>
          <div
            style={{
              width: '100%',
              minHeight: 320,
              background: 'rgba(13,11,8,0.45)',
              border: `2px solid ${AC.bone2}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <img
              src="/api/solo/worldle/silhouette"
              alt=""
              style={{
                maxWidth: '100%',
                maxHeight: 400,
                objectFit: 'contain',
              }}
            />
          </div>
          <div
            style={{
              marginTop: 10,
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 11,
              letterSpacing: '0.2em',
              color: AC.bone2,
            }}
          >
            {finished && target
              ? `// ${target.name}`
              : '// silhouette du jour — trouve le pays'}
          </div>
        </AcCard>

        {/* Tentatives + input */}
        <div>
          <AcCard fold={false} dashed style={{ padding: 16, marginBottom: 14 }}>
            <div className="flex flex-col gap-2">
              {Array.from({ length: MAX_ATTEMPTS }).map((_, i) => {
                const a = attempts[i];
                if (!a) {
                  return (
                    <div
                      key={i}
                      style={{
                        height: 44,
                        border: `1.5px dashed ${AC.bone2}`,
                        background: 'rgba(13,11,8,0.25)',
                      }}
                    />
                  );
                }
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2"
                    style={{
                      padding: '8px 10px',
                      background: a.correct
                        ? 'rgba(18,214,168,0.12)'
                        : 'rgba(240,228,193,0.04)',
                      border: `2px solid ${
                        a.correct ? AC.chem : colorForPct(a.proximityPct)
                      }`,
                    }}
                  >
                    <span
                      className="flex-1"
                      style={{
                        fontFamily:
                          "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                        fontWeight: 800,
                        fontSize: 16,
                        textTransform: 'uppercase',
                        letterSpacing: '0.02em',
                        color: AC.bone,
                      }}
                    >
                      {a.countryName}
                    </span>
                    <span
                      style={{
                        fontFamily:
                          "'JetBrains Mono', 'Courier New', monospace",
                        fontSize: 12,
                        color: AC.bone2,
                      }}
                    >
                      {a.correct ? '— trouvé !' : `${a.distanceKm} km`}
                    </span>
                    <span style={{ fontSize: 18 }}>
                      {a.correct ? '🎯' : arrowForBearing(a.bearing)}
                    </span>
                    <span
                      style={{
                        fontFamily:
                          "'JetBrains Mono', 'Courier New', monospace",
                        fontSize: 12,
                        color: colorForPct(a.proximityPct),
                        minWidth: 42,
                        textAlign: 'right',
                      }}
                    >
                      {Math.round(a.proximityPct)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </AcCard>

          {!finished && (
            <div className="relative">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => updateInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') submit();
                  }}
                  disabled={submitting}
                  placeholder="Tape un pays…"
                  className="ac-input"
                  style={{
                    flex: 1,
                    padding: '12px 14px',
                    background: 'rgba(240,228,193,0.04)',
                    border: `1.5px solid ${AC.bone}`,
                    color: AC.bone,
                    fontFamily:
                      "'JetBrains Mono', 'Courier New', monospace",
                    fontSize: 15,
                    outline: 'none',
                  }}
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
              {suggest.length > 0 && (
                <div
                  className="absolute z-10 w-full mt-1"
                  style={{
                    background: AC.ink,
                    border: `1.5px solid ${AC.bone2}`,
                    maxHeight: 200,
                    overflowY: 'auto',
                  }}
                >
                  {suggest.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pickSuggest(c);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px 12px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: `1px dashed ${AC.bone2}`,
                        color: AC.bone,
                        fontFamily:
                          "'JetBrains Mono', 'Courier New', monospace",
                        fontSize: 13,
                        textAlign: 'left',
                        cursor: 'pointer',
                      }}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
              {error && (
                <div className="mt-2">
                  <AcAlert tone="danger" tape="// ERR">
                    <span style={{ color: AC.bone }}>
                      {'// '}
                      {error}
                    </span>
                  </AcAlert>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* État final */}
      <div className="mt-5">
        {won && target && (
          <AcAlert tone="info" tape="// BRAVO">
            <span style={{ color: AC.bone }}>
              {`// ${target.name} en ${attempts.length} essai${attempts.length > 1 ? 's' : ''} — à demain`}
            </span>
          </AcAlert>
        )}
        {lost && target && (
          <AcAlert tone="danger" tape="// PERDU">
            <span style={{ color: AC.bone }}>
              {"// c'était "}
              <strong style={{ color: AC.gold }}>{target.name}</strong>
              {" — à demain"}
            </span>
          </AcAlert>
        )}
      </div>
    </SoloScreen>
  );
}
