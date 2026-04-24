'use client';

import { useState } from 'react';
import {
  AC,
  AC_CLIP,
  AcAlert,
  AcAvatar,
  AcButton,
  AcCard,
  AcDisplay,
  AcGlyph,
  AcSectionNum,
  AcShim,
  AcStamp,
} from '@/app/components/arcane';
import { CategorySelector } from './CategorySelector';

interface Player {
  id: string;
  name: string;
  avatar: string;
  team: string;
  role: string | null;
  token: string;
}

interface RoleSelectionProps {
  roomCode: string;
  players: Player[];
  currentPlayerToken: string;
  isCreator: boolean;
  onGenerateBoard?: () => void;
  generating?: boolean;
  selectedCategories?: string[];
}

function colorForPlayer(id: string): string {
  const palette = [AC.shimmer, AC.chem, AC.hex, AC.gold, AC.violet, AC.rust];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

function hexWithAlpha(hex: string, alpha: number): string {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return hex;
  const bigint = parseInt(m[1], 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function RoleSelection({
  roomCode,
  players,
  currentPlayerToken,
  isCreator,
  onGenerateBoard,
  generating,
  selectedCategories = [],
}: RoleSelectionProps) {
  const [selecting, setSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPlayer = players.find((p) => p.token === currentPlayerToken);
  const redPlayers = players.filter((p) => p.team === 'red');
  const bluePlayers = players.filter((p) => p.team === 'blue');

  const redSpymaster = redPlayers.find((p) => p.role === 'spymaster');
  const blueSpymaster = bluePlayers.find((p) => p.role === 'spymaster');

  const bothSpymastersSelected = !!redSpymaster && !!blueSpymaster;

  const post = async (role: 'spymaster' | 'operative') => {
    if (!currentPlayerToken || !currentPlayer?.team) return;
    setSelecting(true);
    setError(null);
    try {
      const res = await fetch(`/api/games/codename/${roomCode}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerToken: currentPlayerToken, role }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSelecting(false);
    }
  };

  const handleBecomeSpymaster = () => post('spymaster');
  const handleBecomeOperative = () => post('operative');

  return (
    <div>
      {/* Hero */}
      <div className="mb-5">
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 10,
            letterSpacing: '0.3em',
            color: AC.chem,
            marginBottom: 6,
          }}
        >
          {'// GAME: CODENAME DU CEO · RECRUTEMENT'}
        </div>
        <AcDisplay style={{ fontSize: 'clamp(32px, 5vw, 44px)' }}>
          MAÎTRES <AcShim>-ESPIONS</AcShim>
        </AcDisplay>
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 12,
            color: AC.bone2,
            marginTop: 6,
          }}
        >
          {'// un agent par équipe doit se désigner comme maître-espion'}
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <AcAlert tone="danger" tape="// ERR">
            <span style={{ color: AC.bone }}>{'// '}{error}</span>
          </AcAlert>
        </div>
      )}

      {/* Team columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <TeamColumn
          team="red"
          label="ROUGE"
          color={AC.rust}
          teamPlayers={redPlayers}
          spymaster={redSpymaster}
          currentPlayer={currentPlayer}
          currentPlayerToken={currentPlayerToken}
          selecting={selecting}
          onBecomeSpymaster={handleBecomeSpymaster}
          onBecomeOperative={handleBecomeOperative}
        />
        <TeamColumn
          team="blue"
          label="BLEU"
          color={AC.hex}
          teamPlayers={bluePlayers}
          spymaster={blueSpymaster}
          currentPlayer={currentPlayer}
          currentPlayerToken={currentPlayerToken}
          selecting={selecting}
          onBecomeSpymaster={handleBecomeSpymaster}
          onBecomeOperative={handleBecomeOperative}
        />
      </div>

      {/* Categories */}
      <div className="mb-5">
        <CategorySelector
          roomCode={roomCode}
          isCreator={isCreator}
          selectedCategories={selectedCategories}
        />
      </div>

      {/* Status / generate */}
      <AcCard fold dashed style={{ padding: 20 }}>
        {bothSpymastersSelected ? (
          <div className="text-center">
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
              {'// STATUS: OK'}
            </div>
            <div
              style={{
                fontFamily:
                  "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                fontWeight: 800,
                fontSize: 22,
                textTransform: 'uppercase',
                color: AC.bone,
                marginBottom: 16,
              }}
            >
              Les deux maîtres-espions <AcShim>sont prêts</AcShim>
            </div>
            {isCreator ? (
              <AcButton
                variant="primary"
                size="lg"
                drip
                onClick={onGenerateBoard}
                disabled={generating}
                icon={<AcGlyph kind="puzzle" color={AC.ink} size={16} />}
              >
                {generating ? 'GÉNÉRATION…' : 'GÉNÉRER LE PLATEAU'}
              </AcButton>
            ) : (
              <AcStamp color={AC.bone2} rotate={-2}>
                {'// en attente du créateur...'}
              </AcStamp>
            )}
          </div>
        ) : (
          <div className="text-center">
            <div
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 10,
                letterSpacing: '0.25em',
                color: AC.gold,
                marginBottom: 10,
                textTransform: 'uppercase',
              }}
            >
              {'// STATUS: EN ATTENTE'}
            </div>
            <div className="flex justify-center gap-6 flex-wrap">
              <StatusPill label="ROUGE" color={AC.rust} filled={!!redSpymaster} />
              <StatusPill label="BLEU" color={AC.hex} filled={!!blueSpymaster} />
            </div>
          </div>
        )}
      </AcCard>
    </div>
  );
}

function StatusPill({
  label,
  color,
  filled,
}: {
  label: string;
  color: string;
  filled: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2"
      style={{
        border: `1.5px ${filled ? 'solid' : 'dashed'} ${filled ? color : AC.bone2}`,
        background: filled ? hexWithAlpha(color, 0.12) : 'rgba(240,228,193,0.03)',
      }}
    >
      <AcGlyph
        kind={filled ? 'check' : 'ring'}
        color={filled ? color : AC.bone2}
        size={14}
        stroke={2.5}
      />
      <span
        style={{
          fontFamily:
            "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
          fontWeight: 800,
          fontSize: 14,
          letterSpacing: '0.08em',
          color: filled ? color : AC.bone2,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function TeamColumn({
  team,
  label,
  color,
  teamPlayers,
  spymaster,
  currentPlayer,
  currentPlayerToken,
  selecting,
  onBecomeSpymaster,
  onBecomeOperative,
}: {
  team: string;
  label: string;
  color: string;
  teamPlayers: Player[];
  spymaster: Player | undefined;
  currentPlayer: Player | undefined;
  currentPlayerToken: string;
  selecting: boolean;
  onBecomeSpymaster: () => void;
  onBecomeOperative: () => void;
}) {
  const isPlayerOnTeam = currentPlayer?.team === team;
  const isPlayerSpymaster =
    currentPlayer?.role === 'spymaster' && currentPlayer?.team === team;
  const canBecomeSpymaster = isPlayerOnTeam && !isPlayerSpymaster;

  return (
    <div
      style={{
        position: 'relative',
        background: `linear-gradient(180deg, ${hexWithAlpha(color, 0.12)} 0%, rgba(13,11,8,0.55) 100%)`,
        border: `2px solid ${color}`,
        padding: 16,
      }}
    >
      {/* Team tape */}
      <div className="flex items-center justify-between mb-4">
        <span
          style={{
            background: color,
            color: team === 'red' ? AC.bone : AC.ink,
            fontFamily: "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: '0.12em',
            padding: '4px 10px',
          }}
        >
          ÉQUIPE {label}
        </span>
        <AcSectionNum n={team === 'red' ? 'R' : 'B'} />
      </div>

      {/* Spymaster block */}
      <div
        style={{
          background: 'rgba(13,11,8,0.5)',
          border: spymaster
            ? `2px solid ${color}`
            : `1.5px dashed ${hexWithAlpha(color, 0.5)}`,
          padding: 12,
          marginBottom: 14,
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <AcGlyph kind="zoom" color={color} size={16} stroke={2.5} />
          <span
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              letterSpacing: '0.25em',
              color: color,
              textTransform: 'uppercase',
            }}
          >
            {'// MAÎTRE-ESPION'}
          </span>
        </div>

        {spymaster ? (
          <div>
            <div
              className="flex items-center gap-2.5 p-2"
              style={{
                background: 'rgba(13,11,8,0.55)',
                border: `1.5px solid ${hexWithAlpha(color, 0.4)}`,
                clipPath: AC_CLIP,
              }}
            >
              <AcAvatar
                name={spymaster.name}
                color={color}
                size={32}
                halo={color}
              />
              <span
                style={{
                  fontFamily:
                    "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                  fontWeight: 800,
                  fontSize: 16,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  color: AC.bone,
                  flex: 1,
                }}
              >
                {spymaster.name}
                {spymaster.token === currentPlayerToken && (
                  <span style={{ color: AC.bone2, fontSize: 11, marginLeft: 6 }}>
                    (TOI)
                  </span>
                )}
              </span>
              <AcGlyph kind="check" color={AC.chem} size={18} stroke={3} />
            </div>
            {spymaster.token === currentPlayerToken && (
              <div className="mt-2">
                <AcButton
                  variant="ghost"
                  size="sm"
                  fullWidth
                  onClick={onBecomeOperative}
                  disabled={selecting}
                  icon={<AcGlyph kind="arrowLeft" color={AC.bone} size={12} />}
                >
                  {selecting ? 'PATIENTE…' : 'REDEVENIR AGENT'}
                </AcButton>
              </div>
            )}
          </div>
        ) : (
          <div
            className="py-4 text-center"
            style={{
              border: `1.5px dashed ${hexWithAlpha(color, 0.4)}`,
              background: 'rgba(240,228,193,0.03)',
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 11,
                color: AC.bone2,
                letterSpacing: '0.15em',
              }}
            >
              {'// en attente...'}
            </span>
          </div>
        )}

        {canBecomeSpymaster && (
          <div className="mt-3">
            <AcButton
              variant={team === 'red' ? 'danger' : 'hex'}
              size="sm"
              fullWidth
              onClick={onBecomeSpymaster}
              disabled={selecting}
              icon={<AcGlyph kind={spymaster ? 'arrowRight' : 'zoom'} color={team === 'red' ? AC.bone : AC.ink} size={12} />}
            >
              {selecting
                ? 'PATIENTE…'
                : spymaster
                  ? 'PRENDRE LA PLACE'
                  : 'DEVENIR MAÎTRE-ESPION'}
            </AcButton>
          </div>
        )}
      </div>

      {/* Agents */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <AcGlyph kind="target" color={AC.bone2} size={14} stroke={2.5} />
          <span
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              letterSpacing: '0.2em',
              color: AC.bone2,
              textTransform: 'uppercase',
            }}
          >
            {'// AGENTS · '}
            {teamPlayers.filter((p) => p.role !== 'spymaster').length}
          </span>
        </div>
        <div className="flex flex-col gap-1.5">
          {teamPlayers
            .filter((p) => p.role !== 'spymaster')
            .map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-2 px-2 py-1.5"
                style={{
                  background: 'rgba(13,11,8,0.45)',
                  border: `1.5px dashed ${hexWithAlpha(color, 0.3)}`,
                }}
              >
                <AcAvatar
                  name={player.name}
                  color={colorForPlayer(player.id)}
                  size={22}
                />
                <span
                  style={{
                    fontFamily:
                      "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    color: AC.bone,
                    flex: 1,
                  }}
                >
                  {player.name}
                  {player.token === currentPlayerToken && (
                    <span style={{ color: AC.bone2, fontSize: 10, marginLeft: 6 }}>
                      (TOI)
                    </span>
                  )}
                </span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
