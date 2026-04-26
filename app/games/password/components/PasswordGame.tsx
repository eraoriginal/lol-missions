'use client';

import { useMemo } from 'react';
import { SoloScreen } from '@/app/games/solo/SoloScreen';
import { usePersistedState } from '@/app/games/solo/usePersistedState';
import {
  AC,
  AcAlert,
  AcCard,
  AcGlyph,
} from '@/app/components/arcane';
import {
  RULES,
  buildDailyContext,
  type PasswordRule,
} from '@/lib/password/rules';
import {
  dailyDateKey,
  dailyIndex,
  seededShuffle,
} from '@/lib/solo/dailyIndex';

const DAILY_COUNT = 20;

interface SavedState {
  date: string;
  password: string;
  revealed: number;
  won: boolean;
}

export function PasswordGame() {
  const today = dailyDateKey();
  const storageKey = `password_${today}`;

  // Sélection déterministe de 20 règles pour aujourd'hui.
  const dailyRules = useMemo<PasswordRule[]>(() => {
    const day = dailyIndex();
    const shuffled = seededShuffle(RULES, day);
    return shuffled.slice(0, Math.min(DAILY_COUNT, RULES.length));
  }, []);
  const ctx = useMemo(() => buildDailyContext(), []);

  const defaultState = useMemo<SavedState>(
    () => ({ date: today, password: '', revealed: 1, won: false }),
    [today],
  );
  const [saved, setSaved] = usePersistedState<SavedState>(storageKey, defaultState);
  const current = saved.date === today ? saved : defaultState;
  const password = current.password;
  const revealed = current.revealed;

  // Évalue quelles règles parmi les révélées passent.
  const checks = dailyRules.slice(0, revealed).map((r) => r.check(password, ctx));
  const allGreen = checks.every(Boolean) && checks.length > 0;
  const won = revealed >= dailyRules.length && allGreen;

  const setPassword = (v: string) => {
    setSaved({ ...current, password: v });
  };

  // Auto-reveal : si toutes les règles révélées passent, on révèle la suivante.
  // Pattern "setState during render" recommandé par React.
  if (allGreen && revealed < dailyRules.length) {
    setSaved({ ...current, revealed: revealed + 1 });
  }

  return (
    <SoloScreen title="PASSWORD" accent={AC.gold}>
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
          {`// ${revealed} / ${dailyRules.length} RÈGLES ACTIVES`}
        </span>
      </div>

      {/* Input */}
      <AcCard fold style={{ padding: 18, marginBottom: 14 }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 10,
            letterSpacing: '0.25em',
            color: AC.gold,
            marginBottom: 8,
            textTransform: 'uppercase',
          }}
        >
          {'> TON MOT DE PASSE'}
        </div>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Commence à taper…"
          className="ac-input"
          style={{
            width: '100%',
            padding: '14px 16px',
            background: 'rgba(240,228,193,0.04)',
            border: `2px solid ${allGreen ? AC.chem : AC.bone}`,
            color: AC.gold,
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 18,
            letterSpacing: '0.06em',
            outline: 'none',
          }}
          autoFocus
        />
        <div
          className="mt-2 flex justify-between"
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 10,
            color: AC.bone2,
            letterSpacing: '0.18em',
          }}
        >
          <span>{'// longueur: ' + password.length}</span>
          <span>{'// règles OK: ' + checks.filter(Boolean).length + '/' + revealed}</span>
        </div>
      </AcCard>

      {/* Règles */}
      <div className="flex flex-col gap-2">
        {dailyRules.slice(0, revealed).map((rule, idx) => {
          const ok = checks[idx];
          return (
            <AcCard
              key={rule.id}
              fold={false}
              style={{
                padding: 12,
                borderColor: ok ? AC.chem : AC.rust,
                background: ok
                  ? 'rgba(18,214,168,0.08)'
                  : 'rgba(200,68,30,0.08)',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  style={{
                    width: 28,
                    height: 28,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: ok ? AC.chem : AC.rust,
                    color: AC.ink,
                    fontFamily:
                      "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                    fontWeight: 900,
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </div>
                <div
                  className="flex-1"
                  style={{
                    fontFamily:
                      "'Inter', 'Helvetica Neue', Arial, sans-serif",
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: AC.bone,
                  }}
                >
                  {rule.text}
                </div>
                <AcGlyph
                  kind={ok ? 'check' : 'x'}
                  color={ok ? AC.chem : AC.rust}
                  size={20}
                  stroke={3}
                />
              </div>
            </AcCard>
          );
        })}
      </div>

      {/* Victoire */}
      {won && (
        <div className="mt-5">
          <AcAlert tone="info" tape="// CODE ACCEPTÉ">
            <span style={{ color: AC.bone }}>
              {`// ${dailyRules.length} règles satisfaites — reviens demain pour un nouveau pool`}
            </span>
          </AcAlert>
        </div>
      )}
    </SoloScreen>
  );
}
