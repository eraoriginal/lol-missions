'use client';

import { useEffect, useRef, useState } from 'react';
import type { Player, BeatEikichiPlayerState } from '@/app/types/room';

interface PlayerScoreListProps {
  players: Player[];
  playerStates: BeatEikichiPlayerState[];
  /** Index de la question courante — pour savoir qui a trouvé cette question. */
  currentIndex: number;
  creatorPlayerId: string | null;
  eikichiPlayerId: string | null;
  /** Mode ciblage actif : joueur courant vise une cible pour son arme. */
  targetingMode?: boolean;
  /** ID du joueur courant (ne peut pas se cibler soi-même). */
  selfPlayerId?: string | null;
  /** Callback appelé quand un joueur est cliqué en mode ciblage. */
  onTargetPlayer?: (playerId: string) => void;
}

/**
 * Liste des joueurs avec leur score et un indicateur "a trouvé cette question".
 * Déclenche une animation "pulse + checkmark" quand un joueur passe de `!found` → `found`.
 */
export function PlayerScoreList({
  players,
  playerStates,
  currentIndex,
  creatorPlayerId,
  eikichiPlayerId,
  targetingMode,
  selfPlayerId,
  onTargetPlayer,
}: PlayerScoreListProps) {
  const stateByPlayer = new Map(playerStates.map((s) => [s.playerId, s]));
  const prevFoundRef = useRef<Set<string>>(new Set());
  const [justFound, setJustFound] = useState<Set<string>>(new Set());

  useEffect(() => {
    const currentFound = new Set<string>();
    for (const s of playerStates) {
      if (s.answers.some((a) => a.position === currentIndex && a.correct)) {
        currentFound.add(s.playerId);
      }
    }
    const newlyFound = new Set<string>();
    for (const id of currentFound) {
      if (!prevFoundRef.current.has(id)) newlyFound.add(id);
    }
    prevFoundRef.current = currentFound;
    if (newlyFound.size > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- triggering pulse animation on detected state transition
      setJustFound(newlyFound);
      const t = setTimeout(() => setJustFound(new Set()), 1200);
      return () => clearTimeout(t);
    }
  }, [playerStates, currentIndex]);

  // Reset la réf quand la question change.
  useEffect(() => {
    prevFoundRef.current = new Set();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state on prop change is intentional
    setJustFound(new Set());
  }, [currentIndex]);

  return (
    <div className="arcane-card p-4 space-y-2">
      <h3 className="text-xs uppercase tracking-widest text-purple-400/70 mb-2">
        Joueurs
      </h3>
      <ul className="space-y-2">
        {players.map((p) => {
          const state = stateByPlayer.get(p.id);
          const found =
            state?.answers.some(
              (a) => a.position === currentIndex && a.correct,
            ) ?? false;
          const isPulsing = justFound.has(p.id);
          const isEikichi = p.id === eikichiPlayerId;
          const isSelf = p.id === selfPlayerId;
          const isTargetable = !!targetingMode && !isSelf;
          return (
            <li
              key={p.id}
              onClick={() => {
                if (isTargetable && onTargetPlayer) onTargetPlayer(p.id);
              }}
              className={`flex items-center gap-3 p-2 rounded-lg border transition ${
                isTargetable
                  ? 'border-rose-500/80 bg-rose-900/30 cursor-pointer hover:bg-rose-800/50 hover:border-rose-400 beat-eikichi-target-pulse'
                  : isEikichi
                    ? 'beat-eikichi-highlight'
                    : found
                      ? 'border-emerald-500/50 bg-emerald-900/20'
                      : 'border-purple-500/20 bg-purple-900/20'
              } ${targetingMode && isSelf ? 'opacity-40' : ''}`}
            >
              <div className={isPulsing ? 'beat-eikichi-pulse' : ''}>
                {p.avatar ? (
                  <img
                    src={p.avatar}
                    alt=""
                    className={`w-10 h-10 rounded-full object-cover ${
                      isEikichi ? 'beat-eikichi-avatar' : ''
                    }`}
                  />
                ) : (
                  <div
                    className={`w-10 h-10 rounded-full bg-purple-800/50 flex items-center justify-center text-purple-200 font-bold ${
                      isEikichi ? 'beat-eikichi-avatar' : ''
                    }`}
                  >
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-purple-100 truncate flex items-center gap-1">
                  {p.name}
                  {p.id === creatorPlayerId && (
                    <span className="text-amber-400" title="Maître">
                      ★
                    </span>
                  )}
                </div>
                {isEikichi && (
                  <span className="beat-eikichi-badge mt-1">EIKICHI</span>
                )}
              </div>
              {found && (
                <span
                  className={`text-emerald-400 text-xl ${
                    isPulsing ? 'beat-eikichi-checkmark' : ''
                  }`}
                  aria-label="A trouvé"
                >
                  ✓
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
