'use client';

import { useState } from 'react';
import type { Room } from '@/app/types/room';
import { BEAT_EIKICHI_CONFIG } from '@/lib/beatEikichi/config';
import { LeaveRoomButton } from '@/app/components/LeaveRoomButton';
import { BackToLobbyButton } from './BackToLobbyButton';
import { ZoomPanImage } from './ZoomPanImage';
import {
  AC,
  AC_CLIP,
  AC_IMAGE_FRAME_CLIP,
  AcAvatar,
  AcButton,
  AcDashed,
  AcDisplay,
  AcDrip,
  AcEmote,
  AcGlyph,
  AcSectionNum,
  AcScreen,
  AcShim,
  AcStamp,
} from '@/app/components/arcane';

interface ReviewViewProps {
  room: Room;
  roomCode: string;
  isCreator: boolean;
  creatorToken: string | null;
}

const AVATAR_PALETTE = [AC.shimmer, AC.chem, AC.hex, AC.gold, AC.violet, AC.rust];
function colorForPlayer(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

export function ReviewView({
  room,
  roomCode,
  isCreator,
  creatorToken,
}: ReviewViewProps) {
  const game = room.beatEikichiGame!;
  const total = BEAT_EIKICHI_CONFIG.QUESTIONS_PER_GAME;
  const question = game.questions[game.currentIndex];
  const [advancing, setAdvancing] = useState(false);

  const handleNext = async () => {
    if (!creatorToken) return;
    setAdvancing(true);
    try {
      await fetch(`/api/games/beat-eikichi/${roomCode}/review-next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorToken }),
      });
    } finally {
      setAdvancing(false);
    }
  };

  if (!question) return null;

  // Stats question courante (trouvé / raté / temps moyen)
  const questionAnswers = game.playerStates
    .map((s) => s.answers.find((a) => a.position === game.currentIndex))
    .filter((a) => a != null);
  const foundCount = questionAnswers.filter((a) => a?.correct).length;
  const missedCount = questionAnswers.length - foundCount;
  const avgTimeMs = (() => {
    const times = questionAnswers
      .filter((a) => a?.correct && a.answeredAtMs != null)
      .map((a) => a!.answeredAtMs as number);
    if (times.length === 0) return null;
    return times.reduce((a, b) => a + b, 0) / times.length;
  })();

  const isLast = game.currentIndex + 1 >= total;

  return (
    <AcScreen>
      <div
        className="relative mx-auto px-4 sm:px-8 py-5 sm:py-8"
        style={{ maxWidth: 1240 }}
      >
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 10,
                letterSpacing: '0.3em',
                color: AC.chem,
              }}
            >
              {'// PHASE · REVIEW'}
            </div>
            <div className="flex items-baseline gap-3.5 mt-1.5">
              <AcSectionNum n={game.currentIndex + 1} />
              <AcDisplay style={{ fontSize: 'clamp(28px, 4vw, 44px)' }}>
                QUESTION {String(game.currentIndex + 1).padStart(2, '0')} /{' '}
                {String(total).padStart(2, '0')}
              </AcDisplay>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {avgTimeMs != null && (
              <AcStamp color={AC.gold} rotate={-3}>
                {'// TEMPS MOYEN '}
                {(avgTimeMs / 1000).toFixed(1)}s
              </AcStamp>
            )}
            <AcStamp color={AC.chem} rotate={2}>
              {'// '}
              {foundCount} TROUVÉ · {missedCount} RATÉ
            </AcStamp>
            <div className="flex gap-2">
              <BackToLobbyButton roomCode={roomCode} />
              <LeaveRoomButton roomCode={roomCode} />
            </div>
          </div>
        </div>

        <AcDashed style={{ marginBottom: 18 }} />

        {/* Image + reveal banner */}
        <div className="relative mb-8">
          <div
            className="relative overflow-hidden"
            style={{
              aspectRatio: '16 / 10',
              background: 'rgba(0,0,0,0.55)',
              clipPath: AC_IMAGE_FRAME_CLIP,
              boxShadow: `inset 0 0 0 2px ${AC.bone}`,
            }}
          >
            {question.imageUrl ? (
              <ZoomPanImage
                src={question.imageUrl}
                alt={question.name ?? ''}
                className="object-contain"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                style={{
                  color: AC.bone2,
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                }}
              >
                {'// image indisponible'}
              </div>
            )}
          </div>
          {/* Bandeau révélation du nom canonique */}
          <div
            className="absolute"
            style={{
              left: '50%',
              bottom: -24,
              transform: 'translateX(-50%)',
              padding: '16px 28px',
              background: AC.ink,
              boxShadow: `inset 0 0 0 2px ${AC.shimmer}`,
              clipPath: AC_CLIP,
              minWidth: 'min(640px, 90%)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 10,
                letterSpacing: '0.3em',
                color: AC.chem,
                marginBottom: 4,
              }}
            >
              {'// NOM CANONIQUE'}
            </div>
            <AcDisplay style={{ fontSize: 'clamp(24px, 4vw, 44px)' }}>
              <AcShim>{question.name ?? '—'}</AcShim>
            </AcDisplay>
            <div
              style={{
                position: 'absolute',
                left: 20,
                right: 20,
                bottom: -22,
                height: 26,
              }}
            >
              <AcDrip color={AC.shimmer} seed={2} />
            </div>
          </div>
        </div>

        <div style={{ height: 32 }} />

        {/* Réponses joueurs */}
        <div className="flex items-center gap-2.5 mb-4">
          <AcSectionNum n={1} />
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
            RÉPONSES DES JOUEURS
          </h3>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {room.players.map((p) => {
            const state = game.playerStates.find((s) => s.playerId === p.id);
            const answer = state?.answers.find(
              (a) => a.position === game.currentIndex,
            );
            const correct = answer?.correct ?? false;
            const text = answer?.submittedText?.trim();
            const timeS = answer?.answeredAtMs
              ? answer.answeredAtMs / 1000
              : null;
            const slow = timeS != null && timeS > 20;
            const emote = correct
              ? timeS != null && timeS < 5
                ? ':-D'
                : ':-)'
              : slow
                ? '>:('
                : ':-(';
            const emoteColor = correct ? AC.chem : slow ? AC.gold : AC.rust;
            return (
              <div
                key={p.id}
                className="relative"
                style={{
                  padding: 14,
                  background:
                    'linear-gradient(135deg, rgba(26,22,15,0.9), rgba(13,11,8,0.9))',
                  boxShadow: `inset 0 0 0 1.5px ${correct ? AC.chem : AC.rust}`,
                  color: AC.bone,
                }}
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <AcAvatar
                    name={p.name}
                    color={colorForPlayer(p.id)}
                    size={34}
                    halo={p.id === game.eikichiPlayerId ? AC.shimmer : undefined}
                  />
                  <div className="flex-1 min-w-0">
                    <div
                      style={{
                        fontFamily:
                          "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                        fontWeight: 700,
                        fontSize: 14,
                        textTransform: 'uppercase',
                      }}
                    >
                      {p.name}
                    </div>
                    {p.id === game.eikichiPlayerId && (
                      <span
                        style={{
                          fontFamily:
                            "'JetBrains Mono', 'Courier New', monospace",
                          fontSize: 9,
                          color: AC.shimmer,
                          letterSpacing: '0.2em',
                        }}
                      >
                        {'// EIKICHI'}
                      </span>
                    )}
                  </div>
                  <AcEmote face={emote} color={emoteColor} size={26} />
                </div>
                {/* Bulle réponse */}
                <div
                  style={{
                    padding: '10px 12px',
                    background: 'rgba(240,228,193,0.04)',
                    border: `1.5px dashed ${AC.bone2}`,
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    fontSize: 13,
                    marginBottom: 10,
                  }}
                >
                  {text && text.length > 0 ? (
                    <>
                      <span style={{ color: AC.bone2 }}>«</span> {text}{' '}
                      <span style={{ color: AC.bone2 }}>»</span>
                    </>
                  ) : (
                    <span style={{ color: AC.bone2, fontStyle: 'italic' }}>
                      (pas de réponse)
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {correct ? (
                    <>
                      <span
                        style={{
                          background: AC.chem,
                          color: AC.ink,
                          fontFamily:
                            "'JetBrains Mono', 'Courier New', monospace",
                          fontSize: 10,
                          letterSpacing: '0.2em',
                          padding: '3px 8px',
                        }}
                      >
                        ✓ TROUVÉ
                      </span>
                      {timeS != null && (
                        <span
                          style={{
                            fontFamily:
                              "'JetBrains Mono', 'Courier New', monospace",
                            fontSize: 11,
                            color: AC.chem,
                          }}
                        >
                          en {timeS.toFixed(1)}s
                        </span>
                      )}
                      {slow && (
                        <AcStamp color={AC.gold} rotate={-4}>
                          {'// lent'}
                        </AcStamp>
                      )}
                    </>
                  ) : (
                    <>
                      <span
                        style={{
                          background: AC.rust,
                          color: AC.bone,
                          fontFamily:
                            "'JetBrains Mono', 'Courier New', monospace",
                          fontSize: 10,
                          letterSpacing: '0.2em',
                          padding: '3px 8px',
                        }}
                      >
                        ✗ RATÉ
                      </span>
                      <span
                        style={{
                          fontFamily:
                            "'JetBrains Mono', 'Courier New', monospace",
                          fontSize: 11,
                          color: AC.rust,
                        }}
                      >
                        {text ? '// mauvais' : '// timeout'}
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 11,
              letterSpacing: '0.2em',
              color: AC.bone2,
            }}
          >
            {'// navigation manuelle · créateur uniquement'}
          </div>
          {isCreator ? (
            <AcButton
              variant="primary"
              size="lg"
              drip
              onClick={handleNext}
              disabled={advancing}
              icon={<AcGlyph kind="arrowRight" color={AC.ink} size={14} />}
            >
              {isLast ? 'VOIR LE CLASSEMENT' : 'QUESTION SUIVANTE'}
            </AcButton>
          ) : (
            <AcStamp color={AC.bone2} rotate={-2} style={{ fontSize: 12, padding: '10px 14px' }}>
              {'// EN ATTENTE DU CRÉATEUR…'}
            </AcStamp>
          )}
        </div>
      </div>
    </AcScreen>
  );
}
