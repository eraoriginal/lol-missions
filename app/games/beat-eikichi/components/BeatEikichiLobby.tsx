'use client';

import { useEffect, useState } from 'react';
import type { Room } from '@/app/types/room';
import { WeaponPickerModal } from './WeaponPickerModal';
import { getWeapon } from '@/lib/beatEikichi/weapons';
import { LeaveRoomButton } from '@/app/components/LeaveRoomButton';
import {
  AC,
  AC_CLIP,
  AcAlert,
  AcAvatar,
  AcButton,
  AcCard,
  AcDashed,
  AcDisplay,
  AcDottedLabel,
  AcEmote,
  AcGlyph,
  AcGraffitiLayer,
  AcPaintedBar,
  AcScreen,
  AcSectionNum,
  AcShim,
  AcSplat,
  AcStamp,
} from '@/app/components/arcane';
import { getWeaponVisual } from '../weaponVisuals';

interface BeatEikichiLobbyProps {
  room: Room;
  roomCode: string;
}

// Couleurs d'avatar déterministes à partir d'un hash de l'id du joueur
// (idempotent entre renders, utile quand on n'a pas encore d'avatar custom).
function colorForPlayer(id: string): string {
  const palette = [AC.shimmer, AC.chem, AC.hex, AC.gold, AC.violet, AC.rust];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

export function BeatEikichiLobby({ room, roomCode }: BeatEikichiLobbyProps) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [weaponModalOpen, setWeaponModalOpen] = useState(false);

  const creatorToken =
    typeof window !== 'undefined'
      ? localStorage.getItem(`room_${roomCode}_creator`)
      : null;
  const isCreator = !!creatorToken;

  const playerToken =
    typeof window !== 'undefined'
      ? localStorage.getItem(`room_${roomCode}_player`)
      : null;
  const myPlayer = room.players.find((p) => p.token === playerToken);
  const myWeaponId = myPlayer?.beatEikichiWeaponId ?? null;
  const myWeapon = myWeaponId ? getWeapon(myWeaponId) : null;

  const eikichiPlayerId = room.beatEikichiEikichiId ?? null;
  const eikichiPlayer = room.players.find((p) => p.id === eikichiPlayerId);
  const timerSeconds = room.beatEikichiTimerSeconds ?? 30;
  const mode: 'standard' | 'all-vs-eikichi' = room.beatEikichiMode ?? 'standard';
  const isAllVsEikichi = mode === 'all-vs-eikichi';
  // En mode all-vs-eikichi : Eikichi a accès à toutes les armes (initialisé au
  // /start), les autres n'en ont aucune. Donc on cache totalement le
  // WeaponPicker dans ce mode pour tout le monde.
  const showWeaponPicker = !isAllVsEikichi;

  const [timerInput, setTimerInput] = useState(String(timerSeconds));
  useEffect(() => {
    setTimerInput(String(timerSeconds));
  }, [timerSeconds]);

  const post = async (path: string, body: object) => {
    try {
      await fetch(`/api/games/beat-eikichi/${roomCode}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      /* ignore */
    }
  };

  const handleSetTimer = (value: number) => {
    const clamped = Math.max(10, Math.min(300, Math.round(value)));
    post('set-timer', { creatorToken, timerSeconds: clamped });
  };
  const handleSetMode = (newMode: 'standard' | 'all-vs-eikichi') =>
    post('set-mode', { creatorToken, mode: newMode });
  const handleSetEikichi = (newId: string | null) =>
    post('set-eikichi', { creatorToken, eikichiPlayerId: newId });
  const handleSetWeapon = (weaponId: string | null) => {
    post('set-weapon', { playerToken, weaponId });
    setWeaponModalOpen(false);
  };

  const handleStart = async () => {
    if (!creatorToken) return;
    setStarting(true);
    setError(null);
    try {
      const res = await fetch(`/api/games/beat-eikichi/${roomCode}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorToken }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Échec du démarrage');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setStarting(false);
    }
  };

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/room/${roomCode}`
      : '';

  const handleCopy = async (text: string, setter: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const enoughPlayers = room.players.length >= 2;
  const myWeaponVisual = myWeaponId ? getWeaponVisual(myWeaponId) : null;

  return (
    <AcScreen>
      <div style={{ position: 'absolute', top: -40, right: -80, pointerEvents: 'none' }}>
        <AcSplat color={AC.shimmer} size={420} opacity={0.45} seed={2} />
      </div>
      <div style={{ position: 'absolute', bottom: 60, left: -60, pointerEvents: 'none' }}>
        <AcSplat color={AC.violet} size={340} opacity={0.4} seed={4} />
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
            {'// GAME: BEAT EIKICHI · LOBBY'}
          </div>
          <AcDisplay style={{ fontSize: 'clamp(40px, 6vw, 60px)' }}>
            SALLE <AcShim>D&apos;ATTENTE</AcShim>
          </AcDisplay>
        </div>

        {/* Grid : joueurs + mon arme | réglages */}
        <div className="grid gap-7 lg:grid-cols-[1.15fr_1fr]">
          {/* Colonne joueurs */}
          <div className="flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
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
                  JOUEURS · {room.players.length}/12
                </h3>
              </div>
              <AcCard fold={false} style={{ padding: 0 }}>
                {room.players.map((p) => {
                  const isMe = p.id === myPlayer?.id;
                  const isThisCreator = p.token === room.creatorToken;
                  const isThisEikichi = p.id === eikichiPlayerId;
                  const weapon = p.beatEikichiWeaponId
                    ? getWeapon(p.beatEikichiWeaponId)
                    : null;
                  const weaponVisual = p.beatEikichiWeaponId
                    ? getWeaponVisual(p.beatEikichiWeaponId)
                    : null;
                  return (
                    <div
                      key={p.id}
                      className="relative flex items-center gap-3.5 px-3 py-2.5"
                      style={{
                        borderBottom: `1.5px dashed ${AC.bone2}`,
                      }}
                    >
                      <AcAvatar
                        name={p.name}
                        color={colorForPlayer(p.id)}
                        size={40}
                        halo={isThisEikichi ? AC.shimmer : undefined}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            style={{
                              fontFamily:
                                "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                              fontWeight: 700,
                              fontSize: 15,
                              letterSpacing: '0.02em',
                              textTransform: 'uppercase',
                              color: AC.bone,
                            }}
                          >
                            {p.name}
                            {isMe && (
                              <span
                                style={{
                                  color: AC.bone2,
                                  fontSize: 11,
                                  marginLeft: 6,
                                }}
                              >
                                (TOI)
                              </span>
                            )}
                          </span>
                          {isThisCreator && (
                            <span
                              style={{
                                background: AC.gold,
                                color: AC.ink,
                                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                                fontSize: 9,
                                letterSpacing: '0.2em',
                                padding: '2px 6px',
                              }}
                            >
                              CRÉATEUR
                            </span>
                          )}
                          {isThisEikichi && (
                            <span
                              className="relative inline-block"
                              style={{ paddingBottom: 4 }}
                            >
                              <span
                                style={{
                                  background: AC.shimmer,
                                  color: AC.ink,
                                  fontFamily:
                                    "'JetBrains Mono', 'Courier New', monospace",
                                  fontSize: 9,
                                  letterSpacing: '0.2em',
                                  padding: '2px 6px',
                                }}
                              >
                                EIKICHI
                              </span>
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {weapon && weaponVisual ? (
                            <>
                              <AcGlyph
                                kind={weaponVisual.glyph}
                                color={weaponVisual.color}
                                size={14}
                                stroke={2}
                              />
                              <span
                                style={{
                                  fontFamily:
                                    "'JetBrains Mono', 'Courier New', monospace",
                                  fontSize: 10,
                                  letterSpacing: '0.15em',
                                  color: AC.bone2,
                                  textTransform: 'uppercase',
                                }}
                              >
                                {'// '}
                                {weapon.name}
                              </span>
                            </>
                          ) : (
                            <AcStamp color={AC.rust} rotate={-4}>
                              {'// AUCUNE ARME'}
                            </AcStamp>
                          )}
                        </div>
                      </div>
                      {isThisEikichi && (
                        <div className="absolute" style={{ top: -10, right: 18 }}>
                          <AcEmote face=">:(" color={AC.shimmer} size={28} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </AcCard>
            </div>

            {/* Mon arme — bloc dédié. Caché en mode all-vs-eikichi (les armes
                sont distribuées au /start : 12 pour le Eikichi, 0 pour les
                autres). */}
            {showWeaponPicker && (
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
                    textTransform: 'uppercase',
                  }}
                >
                  MON ARME
                </h3>
              </div>
              <AcCard fold drip={!!myWeapon} dripColor={AC.shimmer} style={{ padding: 18 }}>
                <div className="flex items-center gap-4">
                  <div
                    style={{
                      width: 72,
                      height: 72,
                      background: myWeapon
                        ? 'rgba(255,61,139,0.15)'
                        : 'rgba(240,228,193,0.03)',
                      border: myWeapon
                        ? `2px solid ${AC.shimmer}`
                        : `1.5px dashed ${AC.bone2}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      clipPath: AC_CLIP,
                    }}
                  >
                    <AcGlyph
                      kind={myWeaponVisual?.glyph ?? 'ring'}
                      color={myWeapon ? AC.shimmer : AC.bone2}
                      size={36}
                      stroke={3}
                    />
                  </div>
                  <div className="flex-1">
                    <div
                      style={{
                        fontFamily:
                          "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                        fontWeight: 800,
                        fontSize: 22,
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                        color: AC.bone,
                      }}
                    >
                      {myWeapon?.name ?? 'AUCUNE ARME CHOISIE'}
                    </div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                        fontSize: 11,
                        color: AC.bone2,
                        marginTop: 4,
                        lineHeight: 1.5,
                      }}
                    >
                      {myWeapon?.description ??
                        "Choisis une arme pour saboter tes adversaires pendant la partie."}
                    </div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                        fontSize: 10,
                        letterSpacing: '0.2em',
                        color: AC.chem,
                        marginTop: 8,
                        textTransform: 'uppercase',
                      }}
                    >
                      {'// 3 UTILISATIONS · 1 BOUCLIER'}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2.5">
                  <AcButton
                    variant={myWeapon ? 'ghost' : 'primary'}
                    size="sm"
                    onClick={() => setWeaponModalOpen(true)}
                    icon={
                      <AcGlyph
                        kind="ring"
                        color={myWeapon ? AC.bone : AC.ink}
                        size={12}
                      />
                    }
                  >
                    {myWeapon ? "CHANGER D'ARME" : 'CHOISIR MON ARME'}
                  </AcButton>
                </div>
              </AcCard>
            </div>
            )}
          </div>

          {/* Colonne réglages */}
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
                RÉGLAGES
                {!isCreator && (
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                      fontSize: 10,
                      color: AC.bone2,
                      marginLeft: 8,
                      textTransform: 'none',
                      letterSpacing: '0.15em',
                    }}
                  >
                    {'// lecture seule'}
                  </span>
                )}
              </h3>
            </div>
            <AcCard fold={false} dashed style={{ padding: 20 }}>
              {/* Timer */}
              <div className="mb-5">
                <div className="flex justify-between items-baseline mb-2">
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                      fontSize: 10,
                      letterSpacing: '0.25em',
                      color: AC.chem,
                      textTransform: 'uppercase',
                    }}
                  >
                    {'> DURÉE / QUESTION'}
                  </span>
                  {isCreator ? (
                    <div className="flex items-baseline gap-1">
                      <input
                        type="number"
                        min={10}
                        max={300}
                        step={5}
                        value={timerInput}
                        onChange={(e) => setTimerInput(e.target.value)}
                        onBlur={() => {
                          const n = parseInt(timerInput, 10);
                          if (!Number.isFinite(n)) {
                            setTimerInput(String(timerSeconds));
                            return;
                          }
                          const clamped = Math.max(10, Math.min(300, n));
                          setTimerInput(String(clamped));
                          if (clamped !== timerSeconds) handleSetTimer(clamped);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter')
                            (e.target as HTMLInputElement).blur();
                        }}
                        style={{
                          width: 60,
                          background: 'transparent',
                          border: 'none',
                          borderBottom: `2px solid ${AC.gold}`,
                          color: AC.gold,
                          fontFamily:
                            "'JetBrains Mono', 'Courier New', monospace",
                          fontWeight: 700,
                          fontSize: 22,
                          textAlign: 'right',
                          outline: 'none',
                        }}
                      />
                      <span
                        style={{
                          fontSize: 12,
                          color: AC.bone2,
                          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                        }}
                      >
                        sec
                      </span>
                    </div>
                  ) : (
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                        fontSize: 22,
                        color: AC.gold,
                        fontWeight: 700,
                      }}
                    >
                      {timerSeconds}
                      <span
                        style={{ fontSize: 12, color: AC.bone2, marginLeft: 4 }}
                      >
                        sec
                      </span>
                    </span>
                  )}
                </div>
                <AcPaintedBar
                  value={(timerSeconds - 10) / 290}
                  color={AC.chem}
                />
                <div
                  className="flex justify-between mt-1.5"
                  style={{
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    fontSize: 9,
                    letterSpacing: '0.2em',
                    color: AC.bone2,
                  }}
                >
                  <span>10s</span>
                  <span>300s</span>
                </div>
              </div>

              <AcDashed style={{ margin: '0 0 20px' }} />

              {/* Mode de jeu */}
              <div className="mb-5">
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
                  {'> MODE DE JEU'}
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {(
                    [
                      {
                        key: 'standard' as const,
                        label: 'STANDARD',
                        desc: 'chacun pour soi',
                        icon: 'flame' as const,
                      },
                      {
                        key: 'all-vs-eikichi' as const,
                        label: 'TOUS VS EIKICHI',
                        desc: 'le camp s\'unit',
                        icon: 'target' as const,
                      },
                    ]
                  ).map((m) => {
                    const active = mode === m.key;
                    return (
                      <button
                        key={m.key}
                        type="button"
                        onClick={() => isCreator && handleSetMode(m.key)}
                        disabled={!isCreator}
                        className="text-center"
                        style={{
                          padding: 12,
                          background: active
                            ? 'rgba(255,61,139,0.15)'
                            : 'rgba(240,228,193,0.03)',
                          border: active
                            ? `2px solid ${AC.shimmer}`
                            : `1.5px dashed ${AC.bone2}`,
                          clipPath: AC_CLIP,
                          cursor: isCreator ? 'pointer' : 'default',
                          color: AC.bone,
                        }}
                      >
                        <div className="flex justify-center mb-1.5">
                          <AcGlyph
                            kind={m.icon}
                            color={active ? AC.shimmer : AC.bone2}
                            size={24}
                          />
                        </div>
                        <div
                          style={{
                            fontFamily:
                              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                            fontWeight: 700,
                            fontSize: 13,
                            textTransform: 'uppercase',
                          }}
                        >
                          {m.label}
                        </div>
                        <div
                          style={{
                            fontFamily:
                              "'JetBrains Mono', 'Courier New', monospace",
                            fontSize: 9,
                            color: AC.bone2,
                            marginTop: 4,
                          }}
                        >
                          {'// '}
                          {m.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {isAllVsEikichi && (
                  <div
                    style={{
                      marginTop: 10,
                      padding: '8px 10px',
                      border: `1.5px dashed ${AC.shimmer}`,
                      background: 'rgba(255,61,139,0.06)',
                      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                      fontSize: 10,
                      lineHeight: 1.55,
                      color: AC.bone2,
                    }}
                  >
                    {'// l\'Eikichi reçoit les 12 armes (×3) — pas de bouclier'}
                    <br />
                    {'// les autres joueurs : seulement boucliers, scores cumulés'}
                  </div>
                )}
              </div>

              <AcDashed style={{ margin: '0 0 20px' }} />

              {/* Eikichi */}
              <div>
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
                  {'> EIKICHI (rôle spécial)'}
                </div>
                {isCreator ? (
                  <select
                    value={eikichiPlayerId ?? ''}
                    onChange={(e) =>
                      handleSetEikichi(e.target.value || null)
                    }
                    style={{
                      width: '100%',
                      padding: '10px 36px 10px 12px',
                      background: eikichiPlayerId
                        ? 'rgba(255,61,139,0.08)'
                        : 'rgba(240,228,193,0.03)',
                      border: eikichiPlayerId
                        ? `1.5px solid ${AC.shimmer}`
                        : `1.5px dashed ${AC.bone2}`,
                      color: AC.bone,
                      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                      fontSize: 14,
                      outline: 'none',
                      // Retire le chevron système pour dessiner le nôtre via SVG.
                      appearance: 'none',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      cursor: 'pointer',
                      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'><path d='M1 1l5 5 5-5' stroke='${encodeURIComponent(
                        eikichiPlayerId ? AC.shimmer : AC.bone2,
                      )}' stroke-width='2' fill='none' stroke-linecap='round'/></svg>")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '12px 8px',
                      // Fond des options : important pour que la liste
                      // déroulante ouverte par le navigateur respecte le
                      // thème sombre (Chrome/Firefox le respectent, Safari
                      // partiellement).
                      colorScheme: 'dark',
                    }}
                  >
                    <option
                      value=""
                      style={{ background: AC.ink2, color: AC.bone2 }}
                    >
                      — Aucun désigné —
                    </option>
                    {room.players.map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                        style={{ background: AC.ink2, color: AC.bone }}
                      >
                        {p.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div
                    className="flex items-center gap-3"
                    style={{
                      padding: '10px 12px',
                      border: `1.5px solid ${AC.shimmer}`,
                      background: 'rgba(255,61,139,0.08)',
                    }}
                  >
                    {eikichiPlayer ? (
                      <>
                        <AcAvatar
                          name={eikichiPlayer.name}
                          color={colorForPlayer(eikichiPlayer.id)}
                          size={34}
                          halo={AC.shimmer}
                        />
                        <div className="flex-1">
                          <div
                            style={{
                              fontFamily:
                                "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                              fontWeight: 700,
                              fontSize: 14,
                              textTransform: 'uppercase',
                            }}
                          >
                            {eikichiPlayer.name}
                          </div>
                          <div
                            style={{
                              fontFamily:
                                "'JetBrains Mono', 'Courier New', monospace",
                              fontSize: 10,
                              color: AC.bone2,
                            }}
                          >
                            {"// coupe la question s'il trouve avant les autres"}
                          </div>
                        </div>
                      </>
                    ) : (
                      <span
                        style={{
                          fontFamily:
                            "'JetBrains Mono', 'Courier New', monospace",
                          fontSize: 12,
                          color: AC.bone2,
                        }}
                      >
                        {'// aucun Eikichi désigné'}
                      </span>
                    )}
                  </div>
                )}
                <div
                  style={{
                    marginTop: 8,
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    fontSize: 10,
                    color: AC.bone2,
                  }}
                >
                  {'// si l\'Eikichi trouve, la question avance pour tous'}
                </div>
              </div>
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
                  disabled={starting || !enoughPlayers}
                  icon={<AcGlyph kind="play" color={AC.ink} size={16} />}
                >
                  {starting
                    ? 'DÉMARRAGE…'
                    : `LANCER LA PARTIE · 20 QUESTIONS`}
                </AcButton>
              ) : (
                <div className="text-center">
                  <AcStamp color={AC.bone2} rotate={-2} style={{ fontSize: 12, padding: '10px 14px' }}>
                    {'// EN ATTENTE DU CRÉATEUR...'}
                  </AcStamp>
                </div>
              )}
            </div>

            {!enoughPlayers && (
              <AcAlert tone="warning" tape="// WARN">
                <span style={{ color: AC.bone }}>
                  {'// il faut au moins 2 joueurs pour lancer'}
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

      {showWeaponPicker && (
        <WeaponPickerModal
          open={weaponModalOpen}
          onClose={() => setWeaponModalOpen(false)}
          onPick={handleSetWeapon}
          currentWeaponId={myWeaponId}
        />
      )}
    </AcScreen>
  );
}

/** Code room 6 caractères en gros bloc mono avec cases dashed (comme la maquette). */
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
