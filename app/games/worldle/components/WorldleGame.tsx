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
  COUNTRIES,
  arrowForBearing,
  bearingDeg,
  findCountry,
  haversineKm,
  shapeUrl,
  type WorldleCountry,
} from '@/lib/worldle/countries';
import { dailyDateKey, pickByDay } from '@/lib/solo/dailyIndex';

const MAX_ATTEMPTS = 7;

interface Attempt {
  countryId: string;
  countryName: string;
  distanceKm: number;
  bearing: number;
  proximityPct: number; // 0..100, 100 = exact
  correct: boolean;
}

interface SavedState {
  date: string;
  attempts: Attempt[];
  won: boolean;
}

/** Convertit distance en % de proximité. 0 km = 100 %, 20 000 km = 0 %. */
function proximityPct(km: number): number {
  const max = 20000; // ~demi-circonférence terre
  return Math.max(0, Math.min(100, (1 - km / max) * 100));
}

function colorForPct(pct: number): string {
  if (pct >= 100) return AC.chem;
  if (pct >= 90) return AC.gold;
  if (pct >= 65) return AC.shimmer;
  if (pct >= 40) return AC.hex;
  return AC.rust;
}

export function WorldleGame() {
  const target = useMemo<WorldleCountry>(() => pickByDay(COUNTRIES), []);
  const today = dailyDateKey();
  const storageKey = `worldle_${today}`;

  const defaultState = useMemo<SavedState>(
    () => ({ date: today, attempts: [], won: false }),
    [today],
  );
  const [saved, setSaved] = usePersistedState<SavedState>(storageKey, defaultState);
  const attempts = useMemo(
    () => (saved.date === today ? saved.attempts : []),
    [saved, today],
  );
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [suggest, setSuggest] = useState<WorldleCountry[]>([]);

  const won = attempts.some((a) => a.correct);
  const lost = !won && attempts.length >= MAX_ATTEMPTS;
  const finished = won || lost;

  const submit = useCallback(() => {
    if (finished) return;
    const country = findCountry(input.trim());
    if (!country) {
      setError('Pays inconnu. Exemples : France, Japon, Brésil…');
      return;
    }
    if (attempts.some((a) => a.countryId === country.id)) {
      setError('Tu as déjà essayé ce pays.');
      return;
    }
    const d = haversineKm(country.lat, country.lng, target.lat, target.lng);
    const b = bearingDeg(country.lat, country.lng, target.lat, target.lng);
    const correct = country.id === target.id;
    const entry: Attempt = {
      countryId: country.id,
      countryName: country.name,
      distanceKm: Math.round(d),
      bearing: b,
      proximityPct: proximityPct(d),
      correct,
    };
    const next = [...attempts, entry];
    setSaved({ date: today, attempts: next, won: correct });
    setInput('');
    setSuggest([]);
    setError(null);
  }, [attempts, finished, input, setSaved, target, today]);

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
      .replace(/[\u0300-\u036f]/g, '');
    const hits = COUNTRIES.filter((c) => {
      const name = c.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return name.startsWith(norm) || name.includes(norm);
    }).slice(0, 6);
    setSuggest(hits);
  };

  const pickSuggest = (c: WorldleCountry) => {
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
              src={shapeUrl(target)}
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
            {finished
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
                  disabled={!input.trim()}
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
        {won && (
          <AcAlert tone="info" tape="// BRAVO">
            <span style={{ color: AC.bone }}>
              {`// ${target.name} en ${attempts.length} essai${attempts.length > 1 ? 's' : ''} — à demain`}
            </span>
          </AcAlert>
        )}
        {lost && (
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
