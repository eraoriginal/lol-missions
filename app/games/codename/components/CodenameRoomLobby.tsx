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
  AcDottedLabel,
  AcGlyph,
  AcGraffitiLayer,
  AcScreen,
  AcSectionNum,
  AcShim,
  AcSplat,
  AcStamp,
} from '@/app/components/arcane';
import { LeaveRoomButton } from '@/app/components/LeaveRoomButton';
import { RulesModal } from './RulesModal';

interface Player {
  id: string;
  name: string;
  avatar: string;
  team: string;
  role: string | null;
  token: string;
  missions: { mission: { id: string; text: string; type: string; category: string; difficulty: string; points: number; isPrivate: boolean }; type: string; validated: boolean; decided: boolean; pointsEarned: number; resolvedText?: string }[];
}

interface Room {
  id: string;
  code: string;
  players: Player[];
}

interface CodenameRoomLobbyProps {
  room: Room;
  roomCode: string;
}

function colorForPlayer(id: string): string {
  const palette = [AC.shimmer, AC.chem, AC.hex, AC.gold, AC.violet, AC.rust];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

export function CodenameRoomLobby({ room, roomCode }: CodenameRoomLobbyProps) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [joiningTeam, setJoiningTeam] = useState(false);
  const [randomizing, setRandomizing] = useState(false);

  const creatorToken =
    typeof window !== 'undefined' ? localStorage.getItem(`room_${roomCode}_creator`) : null;
  const isCreator = !!creatorToken;

  const playerToken =
    typeof window !== 'undefined' ? localStorage.getItem(`room_${roomCode}_player`) : null;

  const currentPlayer = room.players.find((p) => p.token === playerToken);
  const myTeam = currentPlayer?.team || '';
  const redTeam = room.players.filter((p) => p.team === 'red');
  const blueTeam = room.players.filter((p) => p.team === 'blue');
  const spectators = room.players.filter((p) => !p.team || p.team === '');

  const hasEnoughPlayers = redTeam.length >= 2 && blueTeam.length >= 2;

  const handleStart = async () => {
    if (!creatorToken) return;
    setStarting(true);
    setError(null);

    try {
      const response = await fetch(`/api/games/codename/${roomCode}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorToken }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start game');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
      setStarting(false);
    }
  };

  const selectTeam = async (team: string) => {
    if (!playerToken || team === myTeam) return;
    setJoiningTeam(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${roomCode}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerToken, team }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setJoiningTeam(false);
    }
  };

  const randomizeTeams = async () => {
    if (!creatorToken) return;
    setRandomizing(true);
    setError(null);
    try {
      const res = await fetch(`/api/rooms/${roomCode}/random-teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorToken }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Erreur');
      }
    } catch {
      setError('Erreur de connexion');
    } finally {
      setRandomizing(false);
    }
  };

  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/room/${roomCode}` : '';

  const handleCopy = async (text: string, setter: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <AcScreen>
      <div style={{ position: 'absolute', top: -40, right: -80, pointerEvents: 'none' }}>
        <AcSplat color={AC.rust} size={420} opacity={0.4} seed={1} />
      </div>
      <div style={{ position: 'absolute', bottom: 60, left: -60, pointerEvents: 'none' }}>
        <AcSplat color={AC.hex} size={340} opacity={0.35} seed={3} />
      </div>
      <AcGraffitiLayer />

      <div
        className="relative mx-auto px-4 sm:px-8 py-6 sm:py-9"
        style={{ maxWidth: 1200 }}
      >
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <LeaveRoomButton roomCode={roomCode} />
            <div className="hidden sm:block min-w-[220px]">
              <AcDottedLabel>{'// ROOM ACTIVE'}</AcDottedLabel>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <RulesModal />
            <span
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 11,
                color: AC.bone2,
                letterSpacing: '0.2em',
              }}
            >
              CODE:
            </span>
            <RoomCodeDisplay code={roomCode} />
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => handleCopy(roomCode, setCopiedCode)}
                style={{
                  background: copiedCode ? AC.chem : 'transparent',
                  border: `1.5px solid ${copiedCode ? AC.chem : AC.bone2}`,
                  color: copiedCode ? AC.ink : AC.bone2,
                  padding: 8,
                  cursor: 'pointer',
                }}
                title="Copier le code"
                aria-label="Copier le code"
              >
                <AcGlyph
                  kind={copiedCode ? 'check' : 'copy'}
                  color={copiedCode ? AC.ink : AC.bone2}
                  size={18}
                />
              </button>
              <button
                type="button"
                onClick={() => handleCopy(shareUrl, setCopiedLink)}
                style={{
                  background: copiedLink ? AC.chem : 'transparent',
                  border: `1.5px solid ${copiedLink ? AC.chem : AC.bone2}`,
                  color: copiedLink ? AC.ink : AC.bone2,
                  padding: 8,
                  cursor: 'pointer',
                }}
                title="Copier le lien"
                aria-label="Copier le lien"
              >
                <AcGlyph
                  kind={copiedLink ? 'check' : 'link'}
                  color={copiedLink ? AC.ink : AC.bone2}
                  size={18}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Hero title */}
        <div className="mb-7">
          <div
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              letterSpacing: '0.3em',
              color: AC.chem,
              marginBottom: 6,
            }}
          >
            {'// GAME: CODENAME DU CEO · LOBBY'}
          </div>
          <AcDisplay style={{ fontSize: 'clamp(40px, 6vw, 60px)' }}>
            CHOISIS <AcShim>TON CAMP</AcShim>
          </AcDisplay>
        </div>

        {/* Grid : équipes | actions */}
        <div className="grid gap-7 lg:grid-cols-[1.4fr_1fr]">
          {/* Colonne équipes */}
          <div className="flex flex-col gap-6">
            {/* Header row with counter + random */}
            <div>
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <AcSectionNum n={1} />
                  <h3
                    className="m-0"
                    style={{
                      fontFamily:
                        "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                      fontWeight: 800,
                      fontSize: 18,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    AGENTS · {room.players.length}/10
                  </h3>
                </div>
                <div className="flex gap-2">
                  {isCreator && room.players.length >= 2 && (
                    <AcButton
                      variant="ghost"
                      size="sm"
                      onClick={randomizeTeams}
                      disabled={randomizing}
                      icon={<AcGlyph kind="ring" color={AC.bone} size={12} />}
                    >
                      {randomizing ? 'MÉLANGE…' : 'ALÉATOIRE'}
                    </AcButton>
                  )}
                  {myTeam !== '' && (
                    <AcButton
                      variant="ghost"
                      size="sm"
                      onClick={() => selectTeam('')}
                      disabled={joiningTeam}
                      icon={<AcGlyph kind="zoom" color={AC.bone} size={12} />}
                    >
                      SPECTATEUR
                    </AcButton>
                  )}
                </div>
              </div>

              {/* Teams grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TeamColumn
                  team="red"
                  label="ROUGE"
                  color={AC.rust}
                  players={redTeam}
                  currentPlayerId={currentPlayer?.id}
                  onJoin={() => selectTeam('red')}
                  joining={joiningTeam}
                  myTeam={myTeam}
                  max={5}
                />
                <TeamColumn
                  team="blue"
                  label="BLEU"
                  color={AC.hex}
                  players={blueTeam}
                  currentPlayerId={currentPlayer?.id}
                  onJoin={() => selectTeam('blue')}
                  joining={joiningTeam}
                  myTeam={myTeam}
                  max={5}
                />
              </div>
            </div>

            {/* Spectators */}
            {spectators.length > 0 && (
              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <AcSectionNum n={2} />
                  <h3
                    className="m-0"
                    style={{
                      fontFamily:
                        "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                      fontWeight: 800,
                      fontSize: 18,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    SPECTATEURS · {spectators.length}
                  </h3>
                </div>
                <AcCard fold={false} dashed style={{ padding: 14 }}>
                  <div className="flex flex-wrap gap-2">
                    {spectators.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-2 px-3 py-1.5"
                        style={{
                          border: `1.5px dashed ${AC.bone2}`,
                          background: 'rgba(240,228,193,0.04)',
                        }}
                      >
                        <AcAvatar
                          name={p.name}
                          color={colorForPlayer(p.id)}
                          size={24}
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
                          }}
                        >
                          {p.name}
                          {p.token === playerToken && (
                            <span style={{ color: AC.bone2, fontSize: 10, marginLeft: 4 }}>
                              (TOI)
                            </span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </AcCard>
              </div>
            )}
          </div>

          {/* Colonne actions */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
              <AcSectionNum n={3} />
              <h3
                className="m-0"
                style={{
                  fontFamily:
                    "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                  fontWeight: 800,
                  fontSize: 18,
                  textTransform: 'uppercase',
                }}
              >
                OPÉRATION
              </h3>
            </div>

            <AcCard fold dashed style={{ padding: 20 }}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: 10,
                  letterSpacing: '0.25em',
                  color: AC.chem,
                  marginBottom: 10,
                  textTransform: 'uppercase',
                }}
              >
                {'> BRIEFING'}
              </div>
              <ol
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  color: AC.bone,
                  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                  fontSize: 13,
                  lineHeight: 1.55,
                }}
              >
                {[
                  'Rejoignez une équipe (min. 2 agents / équipe)',
                  'Le créateur lance la sélection des maîtres-espions',
                  'Un agent par équipe se désigne comme maître-espion',
                  'Le créateur génère le plateau',
                  'Le maître-espion donne un indice, les agents devinent',
                ].map((step, i) => (
                  <li
                    key={i}
                    style={{
                      display: 'flex',
                      gap: 10,
                      padding: '6px 0',
                      borderBottom:
                        i < 4 ? `1px dashed ${AC.bone2}` : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontFamily:
                          "'JetBrains Mono', 'Courier New', monospace",
                        fontSize: 11,
                        color: AC.shimmer,
                        flexShrink: 0,
                        minWidth: 22,
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </AcCard>

            {/* CTA de lancement */}
            <div>
              {isCreator ? (
                <AcButton
                  variant="primary"
                  size="lg"
                  drip
                  fullWidth
                  onClick={handleStart}
                  disabled={starting || !hasEnoughPlayers}
                  icon={<AcGlyph kind="play" color={AC.ink} size={16} />}
                >
                  {starting ? 'LANCEMENT…' : 'LANCER LA SÉLECTION'}
                </AcButton>
              ) : (
                <div className="text-center">
                  <AcStamp color={AC.bone2} rotate={-2} style={{ fontSize: 12, padding: '10px 14px' }}>
                    {'// EN ATTENTE DU CRÉATEUR...'}
                  </AcStamp>
                </div>
              )}
            </div>

            {!hasEnoughPlayers && (
              <AcAlert tone="warning" tape="// WARN">
                <span style={{ color: AC.bone }}>
                  {'// min. 2 agents par équipe — R:'}{redTeam.length}{' · B:'}{blueTeam.length}
                </span>
              </AcAlert>
            )}
            {error && (
              <AcAlert tone="danger" tape="// ERR">
                <span style={{ color: AC.bone }}>{'// '}{error}</span>
              </AcAlert>
            )}
          </div>
        </div>
      </div>
    </AcScreen>
  );
}

function TeamColumn({
  team,
  label,
  color,
  players,
  currentPlayerId,
  onJoin,
  joining,
  myTeam,
  max,
}: {
  team: string;
  label: string;
  color: string;
  players: Player[];
  currentPlayerId: string | undefined;
  onJoin: () => void;
  joining: boolean;
  myTeam: string;
  max: number;
}) {
  const isMyTeam = myTeam === team;
  const isFull = players.length >= max;
  const canJoin = !isMyTeam && !isFull && !joining;

  return (
    <div
      style={{
        position: 'relative',
        background: `linear-gradient(180deg, ${hexWithAlpha(color, 0.12)} 0%, rgba(13,11,8,0.55) 100%)`,
        border: `2px solid ${color}`,
        padding: 14,
      }}
    >
      {/* Tape label top */}
      <div className="flex items-center justify-between mb-3">
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
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 12,
            color: color,
            letterSpacing: '0.15em',
            fontWeight: 700,
          }}
        >
          {players.length}/{max}
        </span>
      </div>

      {/* Players */}
      <div className="flex flex-col gap-2">
        {players.map((p) => {
          const isMe = p.id === currentPlayerId;
          return (
            <div
              key={p.id}
              className="flex items-center gap-2.5 px-2.5 py-2"
              style={{
                background: 'rgba(13,11,8,0.55)',
                border: `1.5px solid ${hexWithAlpha(color, 0.4)}`,
                clipPath: AC_CLIP,
              }}
            >
              <AcAvatar
                name={p.name}
                color={color}
                size={28}
                halo={isMe ? color : undefined}
              />
              <span
                style={{
                  fontFamily:
                    "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  color: AC.bone,
                  flex: 1,
                }}
              >
                {p.name}
                {isMe && (
                  <span style={{ color: AC.bone2, fontSize: 10, marginLeft: 6 }}>(TOI)</span>
                )}
              </span>
            </div>
          );
        })}

        {/* Empty slots with a join CTA */}
        {Array.from({ length: max - players.length }).map((_, i) => (
          <button
            key={`empty-${i}`}
            type="button"
            onClick={canJoin ? onJoin : undefined}
            disabled={!canJoin}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '8px 10px',
              background: 'rgba(240,228,193,0.03)',
              border: `1.5px dashed ${hexWithAlpha(color, 0.5)}`,
              clipPath: AC_CLIP,
              cursor: canJoin ? 'pointer' : 'default',
              color: AC.bone2,
              textAlign: 'left',
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            <AcGlyph kind="plus" color={color} size={14} stroke={2.5} />
            {isMyTeam ? '// SLOT LIBRE' : isFull ? '// COMPLET' : '// REJOINDRE'}
          </button>
        ))}
      </div>
    </div>
  );
}

function RoomCodeDisplay({ code }: { code: string }) {
  return (
    <div className="flex items-center gap-1">
      {code.split('').map((c, i) => (
        <span
          key={i}
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 26,
            fontWeight: 700,
            color: AC.gold,
            letterSpacing: '0.05em',
            border: `2px dashed ${AC.bone2}`,
            padding: '2px 8px',
            background: 'rgba(245,185,18,0.05)',
            minWidth: 24,
            textAlign: 'center',
          }}
        >
          {c}
        </span>
      ))}
    </div>
  );
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
