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
  /** Mode de jeu — pilote l'agrégation "Le Camp" en all-vs-eikichi. */
  mode?: string;
  targetingMode?: boolean;
  selfPlayerId?: string | null;
  /** IDs des joueurs déjà ciblés par le tireur courant pour la question N+1
   * (mode all-vs-eikichi : 1 cible max par question pour le Eikichi). Utilisé
   * pour griser les avatars correspondants pendant le ciblage. */
  alreadyTargetedIds?: Set<string>;
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
  mode,
  targetingMode,
  selfPlayerId,
  alreadyTargetedIds,
  onTargetPlayer,
}: PlayerScoreListProps) {
  const stateByPlayer = new Map(playerStates.map((s) => [s.playerId, s]));
  const isAllVsEikichi = mode === 'all-vs-eikichi' && eikichiPlayerId != null;
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
        padding: 6,
        border: `1.5px dashed ${AC.bone2}`,
      }}
    >
      {/* Header label inline avec la summary en mode all-vs-eikichi pour
          gagner de la verticale (compact mode). En standard, juste le label. */}
      {isAllVsEikichi ? (
        <CampVsEikichiSummary
          players={players}
          playerStates={playerStates}
          eikichiPlayerId={eikichiPlayerId}
        />
      ) : (
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 9,
            letterSpacing: '0.2em',
            color: AC.chem,
            textTransform: 'uppercase',
          }}
        >
          {'// JOUEURS · '}
          {players.length}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5" style={{ marginTop: 6 }}>
        {players.map((p) => {
          const state = stateByPlayer.get(p.id);
          const found =
            state?.answers.some((a) => a.position === currentIndex && a.correct) ??
            false;
          const isPulsing = justFound.has(p.id);
          const isEikichi = p.id === eikichiPlayerId;
          const isSelf = p.id === selfPlayerId;
          const isCreator = p.id === creatorPlayerId;
          const isAlreadyTargeted = !!alreadyTargetedIds?.has(p.id);
          const isTargetable = !!targetingMode && !isSelf && !isAlreadyTargeted;
          const isFadedSelf = !!targetingMode && (isSelf || isAlreadyTargeted);
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
                alignItems: 'center',
                gap: 5,
                padding: '3px 6px',
                cursor: isTargetable ? 'crosshair' : 'default',
                border: isTargetable
                  ? `1.5px solid ${AC.rust}`
                  : `1px dashed ${AC.bone2}`,
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
                size={20}
                halo={isEikichi ? AC.shimmer : undefined}
              />
              <span
                style={{
                  fontFamily:
                    "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: '0.03em',
                  textTransform: 'uppercase',
                }}
              >
                {p.name}
                {isCreator && <span style={{ color: AC.gold, marginLeft: 2 }}>★</span>}
              </span>
              {found ? (
                <AcGlyph kind="check" color={AC.chem} size={12} stroke={2.5} />
              ) : (
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    fontSize: 9,
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
                    top: -6,
                    left: -3,
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    fontSize: 7,
                    color: AC.shimmer,
                    letterSpacing: '0.15em',
                    background: AC.ink,
                    padding: '1px 3px',
                  }}
                >
                  E
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Bannière d'agrégation compacte pour le mode "Tous contre Eikichi".
 * Affiche EIKICHI vs LE CAMP **sans le score** (le score est révélé au
 * leaderboard de fin de partie pour ne pas spoiler le suspense).
 */
function CampVsEikichiSummary({
  players,
  eikichiPlayerId,
}: {
  players: Player[];
  playerStates: BeatEikichiPlayerState[];
  eikichiPlayerId: string;
}) {
  const eikichi = players.find((p) => p.id === eikichiPlayerId);
  const campCount = players.filter((p) => p.id !== eikichiPlayerId).length;

  return (
    <div
      className="flex items-center gap-2"
      style={{ marginTop: 0 }}
    >
      <div
        className="flex-1 flex items-center gap-2"
        style={{
          padding: '4px 8px',
          border: `1.5px solid ${AC.shimmer}`,
          background: 'rgba(255,61,139,0.08)',
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 8,
            letterSpacing: '0.2em',
            color: AC.shimmer,
            textTransform: 'uppercase',
          }}
        >
          {'// EIKICHI'}
        </span>
        <strong
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 13,
            fontWeight: 800,
            color: AC.bone,
            textTransform: 'uppercase',
          }}
        >
          {eikichi?.name ?? '—'}
        </strong>
      </div>

      <span
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 14,
          fontWeight: 900,
          color: AC.gold,
          letterSpacing: '0.1em',
        }}
      >
        VS
      </span>

      <div
        className="flex-1 flex items-center gap-2"
        style={{
          padding: '4px 8px',
          border: `1.5px solid ${AC.chem}`,
          background: 'rgba(18,214,168,0.08)',
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 8,
            letterSpacing: '0.2em',
            color: AC.chem,
            textTransform: 'uppercase',
          }}
        >
          {'// LE CAMP'}
        </span>
        <strong
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 13,
            fontWeight: 800,
            color: AC.bone,
            textTransform: 'uppercase',
          }}
        >
          {campCount} JOUEUR{campCount > 1 ? 'S' : ''}
        </strong>
      </div>
    </div>
  );
}
