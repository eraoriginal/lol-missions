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
import {
  MOTUS_CLEAN_WORDS,
  normalizeMotus,
} from '@/lib/motus/words';
import { dailyDateKey, pickByDay } from '@/lib/solo/dailyIndex';

const MAX_ATTEMPTS = 6;

type Feedback = 'correct' | 'misplaced' | 'absent';

function computeFeedback(guess: string, target: string): Feedback[] {
  const n = target.length;
  const result: Feedback[] = Array(n).fill('absent');
  const chars = target.split('');
  for (let i = 0; i < n; i++) {
    if (guess[i] === target[i]) {
      result[i] = 'correct';
      chars[i] = '';
    }
  }
  for (let i = 0; i < n; i++) {
    if (result[i] === 'correct') continue;
    const idx = chars.indexOf(guess[i]);
    if (idx >= 0) {
      result[i] = 'misplaced';
      chars[idx] = '';
    }
  }
  return result;
}

/** Scaffold = lettres déjà bien placées dans les essais précédents + 1re lettre. */
function computeScaffold(word: string, guesses: string[]): (string | null)[] {
  const scaffold: (string | null)[] = Array(word.length).fill(null);
  scaffold[0] = word[0];
  for (const g of guesses) {
    for (let i = 0; i < word.length; i++) {
      if (g[i] === word[i]) scaffold[i] = word[i];
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

interface SavedState {
  date: string;
  guesses: string[];
  won: boolean;
}

export function MotusGame() {
  const word = useMemo(() => pickByDay(MOTUS_CLEAN_WORDS), []);
  const n = word.length;
  const today = dailyDateKey();
  const storageKey = `motus_${today}`;

  // Persistance via useSyncExternalStore (pattern lint-strict).
  const defaultState = useMemo<SavedState>(
    () => ({ date: today, guesses: [], won: false }),
    [today],
  );
  const [saved, setSaved] = usePersistedState<SavedState>(storageKey, defaultState);
  const guesses = useMemo(
    () => (saved.date === today ? saved.guesses : []),
    [saved, today],
  );
  const [toast, setToast] = useState<string | null>(null);

  // Initialise le brouillon courant avec le scaffold.
  const scaffold = useMemo(
    () => computeScaffold(word, guesses),
    [word, guesses],
  );

  // Calcule la valeur initiale de `current` comme le préfixe scaffold contigu
  // (toutes les lettres verrouillées au début). Ex : si scaffold = [R, null, ...],
  // current démarre à "R".
  const scaffoldPrefix = useMemo(() => {
    let s = '';
    for (const c of scaffold) {
      if (c === null) break;
      s += c;
    }
    return s;
  }, [scaffold]);

  const [current, setCurrent] = useState<string>(scaffoldPrefix);

  // Resync current quand le nb de guesses change (pattern "derived state").
  const [lastGuessCount, setLastGuessCount] = useState(0);
  if (lastGuessCount !== guesses.length) {
    setLastGuessCount(guesses.length);
    setCurrent(scaffoldPrefix);
  }

  const won = guesses.some((g) => g === word);
  const lost = !won && guesses.length >= MAX_ATTEMPTS;
  const finished = won || lost;

  const onLetter = useCallback(
    (letter: string) => {
      if (finished) return;
      setCurrent((prev) => {
        // Ne dépasse pas la longueur.
        if (prev.length >= n) return prev;
        let next = prev + letter;
        // Saute automatiquement les positions déjà verrouillées par le scaffold.
        while (next.length < n && scaffold[next.length] !== null) {
          next += scaffold[next.length] as string;
        }
        return next;
      });
    },
    [finished, n, scaffold],
  );

  const onBack = useCallback(() => {
    if (finished) return;
    setCurrent((prev) => {
      if (prev.length <= 1) return prev; // garder au moins la 1re lettre
      let next = prev.slice(0, -1);
      // Ne pas descendre sous une position scaffold : recule encore.
      while (next.length > 0 && scaffold[next.length - 1] !== null) {
        next = next.slice(0, -1);
      }
      // Mais ré-injecte le scaffold de gauche à droite pour garder la cohérence.
      let rebuilt = '';
      for (let i = 0; i < next.length; i++) {
        rebuilt += scaffold[i] ?? next[i];
      }
      return rebuilt;
    });
  }, [finished, scaffold]);

  const onSubmit = useCallback(() => {
    if (finished) return;
    if (current.length !== n) {
      setToast('Complète le mot avant de valider');
      setTimeout(() => setToast(null), 1500);
      return;
    }
    const next = [...guesses, current];
    setSaved({ date: today, guesses: next, won: current === word });
  }, [current, finished, guesses, n, setSaved, today, word]);

  // Gestion clavier physique
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (finished) return;
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
  }, [onLetter, onBack, onSubmit, finished]);

  // Calcule l'état de chaque touche du clavier (le meilleur signal vu jusqu'ici).
  const keyFeedback = useMemo(() => {
    const m = new Map<string, Feedback>();
    for (const g of guesses) {
      const fb = computeFeedback(g, word);
      for (let i = 0; i < g.length; i++) {
        const prev = m.get(g[i]);
        const next = fb[i];
        // Promotion : correct > misplaced > absent
        if (
          prev === undefined ||
          (prev === 'absent' && next !== 'absent') ||
          (prev === 'misplaced' && next === 'correct')
        ) {
          m.set(g[i], next);
        }
      }
    }
    return m;
  }, [guesses, word]);

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
          {'// essai ' + Math.min(guesses.length + (finished ? 0 : 1), MAX_ATTEMPTS) +
            '/' + MAX_ATTEMPTS}
        </span>
      </div>

      {/* Grille */}
      <AcCard fold={false} style={{ padding: 16, marginBottom: 18 }}>
        <div className="flex flex-col gap-1.5 items-center">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIdx) => {
            const isPast = rowIdx < guesses.length;
            const isCurrent = rowIdx === guesses.length && !finished;
            const rowWord = isPast
              ? guesses[rowIdx]
              : isCurrent
                ? current.padEnd(n, ' ')
                : scaffold.map((c) => c ?? ' ').join('');
            const fb = isPast ? computeFeedback(guesses[rowIdx], word) : null;
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
                        boxShadow: isCursor ? `inset 0 -3px 0 ${AC.chem}` : undefined,
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
              {`// trouvé en ${guesses.length} essai${guesses.length > 1 ? 's' : ''} — reviens demain`}
            </span>
          </AcAlert>
        </div>
      )}
      {lost && (
        <div className="mb-4">
          <AcAlert tone="danger" tape="// PERDU">
            <span style={{ color: AC.bone }}>
              {"// le mot était "}
              <strong style={{ color: AC.gold }}>{word}</strong>
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
                    disabled={finished}
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
                    disabled={finished}
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
                  disabled={finished}
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
