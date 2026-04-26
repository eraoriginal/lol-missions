'use client';

import { useEffect, useState } from 'react';
import type { Room } from '@/app/types/room';
import { LeaveRoomButton } from '@/app/components/LeaveRoomButton';
import {
  AC,
  AcAlert,
  AcAvatar,
  AcButton,
  AcCard,
  AcDashed,
  AcDisplay,
  AcDottedLabel,
  AcGlyph,
  AcGraffitiLayer,
  AcPaintedBar,
  AcScreen,
  AcSectionNum,
  AcShim,
  AcSplat,
  AcStamp,
} from '@/app/components/arcane';
import {
  QUESTION_COUNT_DEFAULT,
  TIMER_MAX,
  TIMER_MIN,
} from '@/lib/quizCeo/config';

interface Props {
  room: Room;
  roomCode: string;
}

function colorForPlayer(id: string): string {
  const palette = [AC.shimmer, AC.chem, AC.hex, AC.gold, AC.violet, AC.rust];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

export function QuizCeoLobby({ room, roomCode }: Props) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const creatorToken =
    typeof window !== 'undefined'
      ? localStorage.getItem(`room_${roomCode}_creator`)
      : null;
  const isCreator = !!creatorToken;

  const timerSeconds = room.quizCeoTimerSeconds ?? 30;
  // Nombre de questions figé à 25 (cf. lib/quizCeo/config.ts) — le créateur
  // ne peut plus le modifier depuis le lobby. La valeur sert uniquement à
  // l'affichage informatif.
  const questionCount = QUESTION_COUNT_DEFAULT;

  const [timerInput, setTimerInput] = useState(String(timerSeconds));
  useEffect(() => setTimerInput(String(timerSeconds)), [timerSeconds]);

  const post = async (path: string, body: object) => {
    try {
      await fetch(`/api/games/quiz-ceo/${roomCode}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      /* ignore */
    }
  };

  const handleSetTimer = (value: number) => {
    const clamped = Math.max(TIMER_MIN, Math.min(TIMER_MAX, Math.round(value)));
    post('set-timer', { creatorToken, timerSeconds: clamped });
  };
  const handleStart = async () => {
    if (!creatorToken) return;
    setStarting(true);
    setError(null);
    try {
      const res = await fetch(`/api/games/quiz-ceo/${roomCode}/start`, {
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

  const enoughPlayers = room.players.length >= 1;

  return (
    <AcScreen>
      <div style={{ position: 'absolute', top: -40, right: -80, pointerEvents: 'none' }}>
        <AcSplat color={AC.gold} size={420} opacity={0.4} seed={2} />
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

        {/* Hero */}
        <div className="mb-7">
          <div
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              letterSpacing: '0.3em',
              color: AC.gold,
              marginBottom: 6,
            }}
          >
            {'// GAME: LE QUIZ DU CEO · LOBBY'}
          </div>
          <AcDisplay style={{ fontSize: 'clamp(40px, 6vw, 60px)' }}>
            LE QUIZ <AcShim color={AC.gold}>DU CEO</AcShim>
          </AcDisplay>
        </div>

        <div className="grid gap-7 lg:grid-cols-[1.1fr_1fr]">
          {/* Colonne gauche : joueurs */}
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
                  JOUEURS · {room.players.length}
                </h3>
              </div>
              <AcCard fold={false} style={{ padding: 0 }}>
                {room.players.map((p) => {
                  const isThisCreator = p.token === room.creatorToken;
                  return (
                    <div
                      key={p.id}
                      className="relative flex items-center gap-3.5 px-3 py-2.5"
                      style={{ borderBottom: `1.5px dashed ${AC.bone2}` }}
                    >
                      <AcAvatar
                        name={p.name}
                        color={colorForPlayer(p.id)}
                        size={40}
                      />
                      <div className="flex-1 min-w-0">
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
                        </span>
                        {isThisCreator && (
                          <span
                            style={{
                              marginLeft: 8,
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
                      </div>
                    </div>
                  );
                })}
              </AcCard>
            </div>

            <AcAlert tone="info" tape="// INFO">
              <span style={{ color: AC.bone }}>
                {'// '}
                Pendant la partie, chaque joueur écrit sa réponse sans savoir si elle est correcte.
                À la fin, le créateur valide les réponses une à une.
              </span>
            </AcAlert>
          </div>

          {/* Colonne droite : réglages */}
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-2.5">
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
                      color: AC.gold,
                      textTransform: 'uppercase',
                    }}
                  >
                    {'> DURÉE / QUESTION'}
                  </span>
                  {isCreator ? (
                    <div className="flex items-baseline gap-1">
                      <input
                        type="number"
                        min={TIMER_MIN}
                        max={TIMER_MAX}
                        step={5}
                        value={timerInput}
                        onChange={(e) => setTimerInput(e.target.value)}
                        onBlur={() => {
                          const n = parseInt(timerInput, 10);
                          if (!Number.isFinite(n)) {
                            setTimerInput(String(timerSeconds));
                            return;
                          }
                          const clamped = Math.max(TIMER_MIN, Math.min(TIMER_MAX, n));
                          setTimerInput(String(clamped));
                          if (clamped !== timerSeconds) handleSetTimer(clamped);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
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
                      <span style={{ fontSize: 12, color: AC.bone2, marginLeft: 4 }}>
                        sec
                      </span>
                    </span>
                  )}
                </div>
                <AcPaintedBar
                  value={(timerSeconds - TIMER_MIN) / (TIMER_MAX - TIMER_MIN)}
                  color={AC.gold}
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
                  <span>{TIMER_MIN}s</span>
                  <span>{TIMER_MAX}s</span>
                </div>
              </div>

              <AcDashed style={{ margin: '0 0 20px' }} />

              {/* Nombre de questions — figé à QUESTION_COUNT_DEFAULT, non
                  modifiable. 1 question par type activé + le reste rempli
                  avec des `text-question` (cf. start/route.ts). */}
              <div className="mb-5">
                <div className="flex justify-between items-baseline mb-2">
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                      fontSize: 10,
                      letterSpacing: '0.25em',
                      color: AC.gold,
                      textTransform: 'uppercase',
                    }}
                  >
                    {'> NB. DE QUESTIONS'}
                  </span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                      fontSize: 22,
                      color: AC.shimmer,
                      fontWeight: 700,
                    }}
                  >
                    {questionCount}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    fontSize: 10,
                    color: AC.bone2,
                  }}
                >
                  {'// 1 question par catégorie + remplissage text-question'}
                </div>
              </div>

            </AcCard>

            {/* CTA */}
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
                    : `LANCER · ${questionCount} QUESTIONS`}
                </AcButton>
              ) : (
                <div className="text-center">
                  <AcStamp
                    color={AC.bone2}
                    rotate={-2}
                    style={{ fontSize: 12, padding: '10px 14px' }}
                  >
                    {'// EN ATTENTE DU CRÉATEUR…'}
                  </AcStamp>
                </div>
              )}
            </div>

            {error && (
              <AcAlert tone="danger" tape="// ERR">
                <span style={{ color: AC.bone }}>
                  {'// '}
                  {error}
                </span>
              </AcAlert>
            )}
          </div>
        </div>
      </div>
    </AcScreen>
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
