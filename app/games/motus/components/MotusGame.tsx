'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SoloScreen } from '@/app/games/solo/SoloScreen';
import { usePersistedState } from '@/app/games/solo/usePersistedState';
import {
  AC,
  AcAlert,
  AcCard,
  AcStamp,
} from '@/app/components/arcane';
import { normalizeMotus } from '@/lib/motus/normalize';
import { dailyDateKey } from '@/lib/solo/dailyIndex';

const MAX_ATTEMPTS = 6;

type Feedback = 'correct' | 'misplaced' | 'absent';

interface GuessRecord {
  guess: string;
  feedback: Feedback[];
}

interface SavedState {
  date: string;
  /** Historique des essais avec leur feedback (tout est public côté client) */
  records: GuessRecord[];
  /** Mot du jour révélé par le serveur quand won OU dernier essai. */
  target: string | null;
}

/** Scaffold = lettres déjà bien placées dans les essais précédents + 1re lettre. */
function computeScaffold(
  wordLength: number,
  firstLetter: string,
  records: GuessRecord[],
): (string | null)[] {
  const scaffold: (string | null)[] = Array(wordLength).fill(null);
  scaffold[0] = firstLetter;
  for (const r of records) {
    for (let i = 0; i < wordLength; i++) {
      if (r.feedback[i] === 'correct') scaffold[i] = r.guess[i];
    }
  }
  return scaffold;
}

function colorFor(f: Feedback | 'empty' | 'typing'): string {
  switch (f) {
    case 'correct':
      return AC.chem;
    case 'misplaced':
      return AC.gold;
    case 'absent':
      return AC.ink2;
    case 'typing':
      return 'rgba(240,228,193,0.08)';
    default:
      return 'transparent';
  }
}

const KEYBOARD_ROWS = [
  ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
  ['ENTER', 'W', 'X', 'C', 'V', 'B', 'N', 'BACK'],
];

interface TodayMeta {
  wordLength: number;
  firstLetter: string;
}

export function MotusGame() {
  const today = dailyDateKey();
  const storageKey = `motus_${today}`;

  // Métadonnées du puzzle (longueur + 1re lettre) — fetched depuis le serveur
  // au mount. Tant que c'est null, on rend un loader.
  const [meta, setMeta] = useState<TodayMeta | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/solo/motus/today', { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: TodayMeta) => {
        if (!cancelled) setMeta(data);
      })
      .catch((err) => {
        if (!cancelled) setMetaError((err as Error).message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const defaultState = useMemo<SavedState>(
    () => ({ date: today, records: [], target: null }),
    [today],
  );
  const [saved, setSaved] = usePersistedState<SavedState>(
    storageKey,
    defaultState,
  );
  const records = useMemo(
    () => (saved.date === today ? saved.records : []),
    [saved, today],
  );
  const targetRevealed = saved.date === today ? saved.target : null;

  const [toast, setToast] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // État de fin dérivé : on a gagné si un record matche `target` (révélé),
  // sinon on a perdu si on a épuisé les essais avec le mot révélé qui est
  // forcément le dernier guess incorrect.
  const won =
    targetRevealed !== null &&
    records.some((r) => r.guess === targetRevealed);
  const lost =
    !won && targetRevealed !== null && records.length >= MAX_ATTEMPTS;
  const finished = won || lost;

  if (metaError) {
    return (
      <SoloScreen title="MOTUS" accent={AC.chem}>
        <AcAlert tone="danger" tape="// ERREUR">
          <span style={{ color: AC.bone }}>
            {`// impossible de charger le puzzle du jour : ${metaError}`}
          </span>
        </AcAlert>
      </SoloScreen>
    );
  }
  if (!meta) {
    return (
      <SoloScreen title="MOTUS" accent={AC.chem}>
        <AcCard fold={false} dashed style={{ padding: 24 }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 12,
              color: AC.bone2,
            }}
          >
            {'// chargement du puzzle…'}
          </span>
        </AcCard>
      </SoloScreen>
    );
  }

  return (
    <MotusBoard
      meta={meta}
      today={today}
      records={records}
      targetRevealed={targetRevealed}
      saved={saved}
      setSaved={setSaved}
      toast={toast}
      setToast={setToast}
      submitting={submitting}
      setSubmitting={setSubmitting}
      won={won}
      lost={lost}
      finished={finished}
    />
  );
}

interface MotusBoardProps {
  meta: TodayMeta;
  today: string;
  records: GuessRecord[];
  targetRevealed: string | null;
  saved: SavedState;
  setSaved: (s: SavedState) => void;
  toast: string | null;
  setToast: (s: string | null) => void;
  submitting: boolean;
  setSubmitting: (b: boolean) => void;
  won: boolean;
  lost: boolean;
  finished: boolean;
}

function MotusBoard({
  meta,
  today,
  records,
  targetRevealed,
  saved,
  setSaved,
  toast,
  setToast,
  submitting,
  setSubmitting,
  won,
  lost,
  finished,
}: MotusBoardProps) {
  const n = meta.wordLength;
  const firstLetter = meta.firstLetter;

  const scaffold = useMemo(
    () => computeScaffold(n, firstLetter, records),
    [n, firstLetter, records],
  );

  // Préfixe scaffold contigu (toutes les lettres verrouillées au début).
  const scaffoldPrefix = useMemo(() => {
    let s = '';
    for (const c of scaffold) {
      if (c === null) break;
      s += c;
    }
    return s;
  }, [scaffold]);

  const [current, setCurrent] = useState<string>(scaffoldPrefix);

  // Resync current quand le nb de records change (pattern "derived state").
  const [lastRecordCount, setLastRecordCount] = useState(0);
  if (lastRecordCount !== records.length) {
    setLastRecordCount(records.length);
    setCurrent(scaffoldPrefix);
  }

  const onLetter = useCallback(
    (letter: string) => {
      if (finished || submitting) return;
      setCurrent((prev) => {
        if (prev.length >= n) return prev;
        let next = prev + letter;
        while (next.length < n && scaffold[next.length] !== null) {
          next += scaffold[next.length] as string;
        }
        return next;
      });
    },
    [finished, n, scaffold, submitting],
  );

  const onBack = useCallback(() => {
    if (finished || submitting) return;
    setCurrent((prev) => {
      if (prev.length <= 1) return prev;
      let next = prev.slice(0, -1);
      while (next.length > 0 && scaffold[next.length - 1] !== null) {
        next = next.slice(0, -1);
      }
      let rebuilt = '';
      for (let i = 0; i < next.length; i++) {
        rebuilt += scaffold[i] ?? next[i];
      }
      return rebuilt;
    });
  }, [finished, scaffold, submitting]);

  const onSubmit = useCallback(async () => {
    if (finished || submitting) return;
    if (current.length !== n) {
      setToast('Complète le mot avant de valider');
      setTimeout(() => setToast(null), 1500);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/solo/motus/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guess: current,
          attemptIndex: records.length,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setToast(data.error ?? 'Erreur serveur');
        setTimeout(() => setToast(null), 2000);
        return;
      }
      const data = (await res.json()) as {
        feedback: Feedback[];
        won: boolean;
        target?: string;
      };
      const newRecord: GuessRecord = {
        guess: current,
        feedback: data.feedback,
      };
      setSaved({
        date: today,
        records: [...records, newRecord],
        target: data.target ?? saved.target,
      });
    } catch (err) {
      setToast(`Erreur réseau : ${(err as Error).message}`);
      setTimeout(() => setToast(null), 2000);
    } finally {
      setSubmitting(false);
    }
  }, [
    current,
    finished,
    n,
    records,
    saved.target,
    setSaved,
    setSubmitting,
    setToast,
    submitting,
    today,
  ]);

  // Gestion clavier physique
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished || submitting) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        onSubmit();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        onBack();
      } else if (/^[a-zA-ZàâäéèêëîïôöùûüÿçÀÂÄÉÈÊËÎÏÔÖÙÛÜŸÇ]$/.test(e.key)) {
        const letter = normalizeMotus(e.key);
        if (letter) onLetter(letter);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onLetter, onBack, onSubmit, finished, submitting]);

  // Calcule l'état de chaque touche du clavier (le meilleur signal vu jusqu'ici).
  const keyFeedback = useMemo(() => {
    const m = new Map<string, Feedback>();
    for (const r of records) {
      for (let i = 0; i < r.guess.length; i++) {
        const prev = m.get(r.guess[i]);
        const next = r.feedback[i];
        if (
          prev === undefined ||
          (prev === 'absent' && next !== 'absent') ||
          (prev === 'misplaced' && next === 'correct')
        ) {
          m.set(r.guess[i], next);
        }
      }
    }
    return m;
  }, [records]);

  return (
    <SoloScreen title="MOTUS" accent={AC.chem}>
      {/* Rappels */}
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
          {`// ${n} LETTRES · ${MAX_ATTEMPTS} ESSAIS`}
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 11,
            letterSpacing: '0.22em',
            color: AC.chem,
          }}
        >
          {'// essai ' +
            Math.min(records.length + (finished ? 0 : 1), MAX_ATTEMPTS) +
            '/' +
            MAX_ATTEMPTS}
        </span>
      </div>

      {/* Grille */}
      <AcCard fold={false} style={{ padding: 16, marginBottom: 18 }}>
        <div className="flex flex-col gap-1.5 items-center">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIdx) => {
            const isPast = rowIdx < records.length;
            const isCurrent = rowIdx === records.length && !finished;
            const past = isPast ? records[rowIdx] : null;
            const rowWord = past
              ? past.guess
              : isCurrent
                ? current.padEnd(n, ' ')
                : scaffold.map((c) => c ?? ' ').join('');
            const fb = past ? past.feedback : null;
            return (
              <div key={rowIdx} className="flex gap-1">
                {Array.from({ length: n }).map((__, i) => {
                  const letter = rowWord[i] ?? ' ';
                  const isLocked =
                    !isPast && scaffold[i] !== null && letter === scaffold[i];
                  const state: Feedback | 'empty' | 'typing' = fb
                    ? fb[i]
                    : isLocked
                      ? 'correct'
                      : letter !== ' '
                        ? 'typing'
                        : 'empty';
                  const isCursor =
                    isCurrent && i === current.length && !scaffold[i];
                  return (
                    <div
                      key={i}
                      style={{
                        width: 42,
                        height: 42,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: colorFor(state),
                        border:
                          state === 'empty'
                            ? `1.5px dashed ${AC.bone2}`
                            : `2px solid ${
                                state === 'correct'
                                  ? AC.chem
                                  : state === 'misplaced'
                                    ? AC.gold
                                    : state === 'absent'
                                      ? AC.bone2
                                      : AC.bone
                              }`,
                        fontFamily:
                          "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                        fontWeight: 900,
                        fontSize: 26,
                        color:
                          state === 'correct' || state === 'misplaced'
                            ? AC.ink
                            : AC.bone,
                        textTransform: 'uppercase',
                        boxShadow: isCursor
                          ? `inset 0 -3px 0 ${AC.chem}`
                          : undefined,
                      }}
                    >
                      {letter !== ' ' ? letter : ''}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </AcCard>

      {/* État final */}
      {won && (
        <div className="mb-4">
          <AcAlert tone="info" tape="// BRAVO">
            <span style={{ color: AC.bone }}>
              {`// trouvé en ${records.length} essai${records.length > 1 ? 's' : ''} — reviens demain`}
            </span>
          </AcAlert>
        </div>
      )}
      {lost && targetRevealed && (
        <div className="mb-4">
          <AcAlert tone="danger" tape="// PERDU">
            <span style={{ color: AC.bone }}>
              {"// le mot était "}
              <strong style={{ color: AC.gold }}>{targetRevealed}</strong>
              {" — reviens demain"}
            </span>
          </AcAlert>
        </div>
      )}
      {toast && (
        <div className="mb-3">
          <AcStamp color={AC.rust} rotate={-2}>
            {'// ' + toast}
          </AcStamp>
        </div>
      )}

      {/* Clavier AZERTY */}
      <div className="flex flex-col gap-1.5 items-center">
        {KEYBOARD_ROWS.map((row, r) => (
          <div key={r} className="flex gap-1">
            {row.map((k) => {
              if (k === 'ENTER') {
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={onSubmit}
                    disabled={finished || submitting}
                    style={keyStyle('special')}
                  >
                    ENTRÉE
                  </button>
                );
              }
              if (k === 'BACK') {
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={onBack}
                    disabled={finished || submitting}
                    style={keyStyle('special')}
                  >
                    ⌫
                  </button>
                );
              }
              const fb = keyFeedback.get(k);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => onLetter(k)}
                  disabled={finished || submitting}
                  style={keyStyle(fb)}
                >
                  {k}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </SoloScreen>
  );
}

function keyStyle(state: Feedback | 'special' | undefined): React.CSSProperties {
  const bg =
    state === 'correct'
      ? AC.chem
      : state === 'misplaced'
        ? AC.gold
        : state === 'absent'
          ? 'rgba(13,11,8,0.6)'
          : 'rgba(240,228,193,0.08)';
  const fg =
    state === 'correct' || state === 'misplaced'
      ? AC.ink
      : state === 'absent'
        ? AC.bone2
        : AC.bone;
  return {
    minWidth: state === 'special' ? 64 : 34,
    height: 44,
    padding: '0 10px',
    background: bg,
    border: `1.5px solid ${state === 'correct' || state === 'misplaced' ? 'transparent' : AC.bone2}`,
    color: fg,
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.05em',
    cursor: 'pointer',
  };
}
