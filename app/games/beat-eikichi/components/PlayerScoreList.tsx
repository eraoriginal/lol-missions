'use client';

import { useEffect, useRef, useState } from 'react';
import type { Player, BeatEikichiPlayerState } from '@/app/types/room';
import { AC, AcAvatar, AcGlyph } from '@/app/components/arcane';

interface PlayerScoreListProps {
  players: Player[];
  playerStates: BeatEikichiPlayerState[];
  currentIndex: number;
  creatorPlayerId: string | null;
  eikichiPlayerId: string | null;
  targetingMode?: boolean;
  selfPlayerId?: string | null;
  onTargetPlayer?: (playerId: string) => void;
}

const AVATAR_PALETTE = [AC.shimmer, AC.chem, AC.hex, AC.gold, AC.violet, AC.rust];
function colorForPlayer(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

/**
 * Liste horizontale (desktop) / wrap (mobile) des autres joueurs pendant la partie.
 * Affiche avatar + score + statut (« ✓ trouvé » / « ... en train d'écrire »).
 * En mode ciblage, les avatars deviennent cliquables (curseur crosshair, bordure
 * rust pulse) pour choisir la cible de l'arme.
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- pulse animation on transition
      setJustFound(newlyFound);
      const t = setTimeout(() => setJustFound(new Set()), 1200);
      return () => clearTimeout(t);
    }
  }, [playerStates, currentIndex]);

  useEffect(() => {
    prevFoundRef.current = new Set();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on question change
    setJustFound(new Set());
  }, [currentIndex]);

  return (
    <div
      style={{
        padding: 10,
        border: `1.5px dashed ${AC.bone2}`,
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 10,
          letterSpacing: '0.25em',
          color: AC.chem,
          marginBottom: 8,
          textTransform: 'uppercase',
        }}
      >
        {'// JOUEURS · '}
        {players.length}
      </div>
      <div className="flex flex-wrap gap-2.5">
        {players.map((p) => {
          const state = stateByPlayer.get(p.id);
          const found =
            state?.answers.some((a) => a.position === currentIndex && a.correct) ??
            false;
          const isPulsing = justFound.has(p.id);
          const isEikichi = p.id === eikichiPlayerId;
          const isSelf = p.id === selfPlayerId;
          const isCreator = p.id === creatorPlayerId;
          const isTargetable = !!targetingMode && !isSelf;
          const isFadedSelf = !!targetingMode && isSelf;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                if (isTargetable && onTargetPlayer) onTargetPlayer(p.id);
              }}
              disabled={!isTargetable}
              className={isPulsing ? 'ac-pulse' : undefined}
              style={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: 8,
                minWidth: 70,
                cursor: isTargetable ? 'crosshair' : 'default',
                border: isTargetable
                  ? `2px solid ${AC.rust}`
                  : `1.5px dashed ${AC.bone2}`,
                background: isTargetable
                  ? 'rgba(200,68,30,0.10)'
                  : 'transparent',
                color: AC.bone,
                opacity: isFadedSelf ? 0.4 : 1,
              }}
              aria-label={isTargetable ? `Cibler ${p.name}` : p.name}
            >
              <AcAvatar
                name={p.name}
                color={colorForPlayer(p.id)}
                size={34}
                halo={isEikichi ? AC.shimmer : undefined}
              />
              <div
                className="flex items-center gap-1"
                style={{
                  fontFamily:
                    "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {p.name}
                {isCreator && <span style={{ color: AC.gold }}>★</span>}
              </div>
              {found ? (
                <AcGlyph kind="check" color={AC.chem} size={14} stroke={2.5} />
              ) : (
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    fontSize: 10,
                    color: AC.bone2,
                  }}
                >
                  …
                </span>
              )}
              {isEikichi && (
                <span
                  style={{
                    position: 'absolute',
                    top: -8,
                    left: -4,
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    fontSize: 8,
                    color: AC.shimmer,
                    letterSpacing: '0.2em',
                    background: AC.ink,
                    padding: '1px 4px',
                  }}
                >
                  {'// E'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
