'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SoloScreen } from '@/app/games/solo/SoloScreen';
import { usePersistedState } from '@/app/games/solo/usePersistedState';
import {
  AC,
  AcAlert,
  AcButton,
  AcCard,
  AcGlyph,
} from '@/app/components/arcane';
import { tierLabel, type CemantixTier } from '@/lib/cemantix/shared';
import { dailyDateKey } from '@/lib/solo/dailyIndex';

interface Attempt {
  word: string;
  rank: number;
  tier: CemantixTier;
  order: number; // ordre chronologique
}

interface SavedState {
  date: string;
  attempts: Attempt[];
  /** Mot du jour révélé par le serveur quand won. */
  target: string | null;
}

function normalizeForDedup(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '');
}

export function CemantixGame() {
  const today = dailyDateKey();
  const storageKey = `cemantix_${today}`;

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
  const [lastAttempt, setLastAttempt] = useState<Attempt | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Ref vers l'input pour ré-injecter le focus après chaque tentative.
  // Sans ça, le bouton OK volait le focus au clic et le `disabled=true`
  // pendant le submit faisait blur l'input → l'utilisateur devait re-cliquer
  // pour retaper. On force le focus après chaque submit (succès ou doublon).
  const inputRef = useRef<HTMLInputElement | null>(null);

  const won = target !== null && attempts.some((a) => a.rank === 0);

  const submit = useCallback(async () => {
    if (won || submitting) return;
    const norm = normalizeForDedup(input);
    if (!norm) return;
    if (attempts.some((a) => normalizeForDedup(a.word) === norm)) {
      setInput('');
      // Doublon : on garde le focus pour relancer immédiatement.
      inputRef.current?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/solo/cemantix/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: input.trim() }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        rank: number;
        tier: CemantixTier;
        won: boolean;
        target?: string;
      };
      const entry: Attempt = {
        word: norm,
        rank: data.rank,
        tier: data.tier,
        order: attempts.length + 1,
      };
      setSaved({
        date: today,
        attempts: [...attempts, entry],
        target: data.target ?? saved.target,
      });
      setLastAttempt(entry);
      setInput('');
    } finally {
      setSubmitting(false);
      // Le re-focus est fait dans un useEffect[submitting] (cf. plus bas) :
      // on attend que React commit le ré-enabled du <input> avant de tenter
      // .focus(), sinon le browser gobe le focus dans un blur de bouton OK.
    }
  }, [attempts, input, saved.target, setSaved, submitting, today, won]);

  // Re-focus automatique : dès que `submitting` retombe à false (succès,
  // doublon ou erreur), on rend la main au champ. Évite que l'utilisateur
  // doive cliquer dans l'input à chaque tentative quand il valide via le
  // bouton OK ou qu'un blur intervient pendant le `disabled=true`.
  useEffect(() => {
    if (submitting) return;
    if (won) return;
    // 0ms suffit : le useEffect tourne après le commit React qui ré-enable
    // l'input, donc .focus() prend effet immédiatement.
    const t = setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
    return () => clearTimeout(t);
  }, [submitting, won, attempts.length]);

  // Historique trié par proximité (rank croissant).
  const sorted = [...attempts].sort((a, b) => a.rank - b.rank);

  return (
    <SoloScreen title="CEMANTIX" accent={AC.shimmer}>
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
          {`// ${attempts.length} essai${attempts.length > 1 ? 's' : ''} · proximité sémantique`}
        </span>
      </div>

      {!won && (
        <AcCard fold={false} dashed style={{ padding: 16, marginBottom: 14 }}>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') submit();
              }}
              disabled={submitting}
              placeholder="Tape un mot et devine le mot du jour…"
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
          <div
            className="mt-2"
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              color: AC.bone2,
              letterSpacing: '0.18em',
            }}
          >
            {'// plus tu es proche sémantiquement, plus c\'est chaud 🔥'}
          </div>
        </AcCard>
      )}

      {/* Dernier essai mis en avant */}
      {lastAttempt && (
        <div className="mb-3">
          <AttemptRow attempt={lastAttempt} highlight />
        </div>
      )}

      {/* Historique trié par proximité */}
      {sorted.length > 0 && (
        <AcCard fold={false} style={{ padding: 14 }}>
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
            {'// DU PLUS CHAUD AU PLUS FROID'}
          </div>
          <div className="flex flex-col gap-1">
            {sorted.map((a) => (
              <AttemptRow key={a.order} attempt={a} />
            ))}
          </div>
        </AcCard>
      )}

      {won && target && (
        <div className="mt-5">
          <AcAlert tone="info" tape="// BRAVO">
            <span style={{ color: AC.bone }}>
              {`// trouvé en ${attempts.length} essais — le mot était `}
              <strong style={{ color: AC.gold }}>{target}</strong>
            </span>
          </AcAlert>
        </div>
      )}
    </SoloScreen>
  );
}

function AttemptRow({
  attempt,
  highlight = false,
}: {
  attempt: Attempt;
  highlight?: boolean;
}) {
  const t = tierLabel(attempt.tier);
  const isTarget = attempt.rank === 0;
  const pct = isTarget
    ? 100
    : Math.max(
        2,
        Math.min(
          99,
          100 - Math.log10(Math.max(1, attempt.rank + 1)) * 20,
        ),
      );
  return (
    <div
      className="flex items-center gap-3"
      style={{
        padding: '8px 10px',
        background: highlight
          ? 'rgba(255,61,139,0.08)'
          : 'rgba(240,228,193,0.03)',
        border: highlight
          ? `2px solid ${AC.shimmer}`
          : `1.5px dashed ${AC.bone2}`,
      }}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 11,
          color: AC.bone2,
          minWidth: 28,
        }}
      >
        #{attempt.order}
      </span>
      <span
        className="flex-1"
        style={{
          fontFamily:
            "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: '0.02em',
          color: AC.bone,
          textTransform: 'uppercase',
        }}
      >
        {attempt.word}
      </span>
      <div
        style={{
          width: 120,
          height: 8,
          background: 'rgba(13,11,8,0.6)',
          border: `1px solid ${AC.bone2}`,
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${pct}%`,
            background: t.color,
          }}
        />
      </div>
      <span style={{ fontSize: 16, minWidth: 20, textAlign: 'center' }}>
        {t.emoji}
      </span>
      <span
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 11,
          color: t.color,
          minWidth: 64,
          textAlign: 'right',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {isTarget ? 'TROUVÉ' : `#${attempt.rank}`}
      </span>
    </div>
  );
}
