'use client';

import { useEffect, useState } from 'react';
import type { Room } from '@/app/types/room';
import { LeaveRoomButton } from '@/app/components/LeaveRoomButton';
import { BackToLobbyButton } from './BackToLobbyButton';
import {
  AC,
  AcAvatar,
  AcCard,
  AcDisplay,
  AcDottedLabel,
  AcDrip,
  AcEmote,
  AcGraffitiLayer,
  AcScreen,
  AcSectionNum,
  AcShim,
  AcSplat,
  AcStamp,
} from '@/app/components/arcane';

interface LeaderboardViewProps {
  room: Room;
  roomCode: string;
  isCreator: boolean;
}

interface LeaderboardRow {
  playerId: string;
  name: string;
  score: number;
  totalTimeMs: number;
  correct: number;
  wrong: number;
  avgCloseness: number; // 0..1 — plus haut = plus « chaud »
}

const REVEAL_DELAY_MS = 1200;

const AVATAR_PALETTE = [AC.shimmer, AC.chem, AC.hex, AC.gold, AC.violet, AC.rust];
function colorForPlayer(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
}

export function LeaderboardView({
  room,
  roomCode,
  isCreator,
}: LeaderboardViewProps) {
  const game = room.beatEikichiGame!;

  // Construction du classement : score DESC, puis temps cumulé ASC.
  const rows: LeaderboardRow[] = room.players
    .map((p) => {
      const state = game.playerStates.find((s) => s.playerId === p.id);
      const totalTimeMs =
        state?.answers.reduce(
          (sum, a) => sum + (a.correct && a.answeredAtMs ? a.answeredAtMs : 0),
          0,
        ) ?? 0;
      const correct =
        state?.answers.filter((a) => a.correct).length ?? 0;
      const wrong = (state?.answers.length ?? 0) - correct;
      return {
        playerId: p.id,
        name: p.name,
        score: state?.score ?? 0,
        totalTimeMs,
        correct,
        wrong,
        avgCloseness: 0,
      };
    })
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return a.totalTimeMs - b.totalTimeMs;
    });

  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    if (revealedCount >= rows.length) return;
    const t = setTimeout(() => {
      setRevealedCount((c) => c + 1);
    }, REVEAL_DELAY_MS);
    return () => clearTimeout(t);
  }, [revealedCount, rows.length]);

  const allRevealed = revealedCount >= rows.length;

  // Une fois tout révélé, on segmente entre podium et reste.
  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);

  // Stats globales
  const allAnswers = game.playerStates.flatMap((s) => s.answers);
  const totalAnswered = allAnswers.length;
  const correctRate =
    totalAnswered > 0
      ? Math.round(
          (allAnswers.filter((a) => a.correct).length / totalAnswered) * 100,
        )
      : 0;
  const correctAnswers = allAnswers.filter(
    (a) => a.correct && a.answeredAtMs != null,
  );
  const avgTimeMs =
    correctAnswers.length > 0
      ? correctAnswers.reduce((s, a) => s + (a.answeredAtMs as number), 0) /
        correctAnswers.length
      : null;
  // Joueur le plus rapide sur une réponse correcte (min answeredAtMs).
  let fastest: { name: string; ms: number } | null = null;
  for (const s of game.playerStates) {
    for (const a of s.answers) {
      if (a.correct && a.answeredAtMs != null) {
        const p = room.players.find((pl) => pl.id === s.playerId);
        if (!p) continue;
        if (!fastest || a.answeredAtMs < fastest.ms) {
          fastest = { name: p.name, ms: a.answeredAtMs };
        }
      }
    }
  }

  return (
    <AcScreen>
      <div style={{ position: 'absolute', top: -40, left: -40, pointerEvents: 'none' }}>
        <AcSplat color={AC.shimmer} size={440} opacity={0.5} seed={1} />
      </div>
      <div style={{ position: 'absolute', bottom: 40, right: -60, pointerEvents: 'none' }}>
        <AcSplat color={AC.violet} size={360} opacity={0.5} seed={3} />
      </div>
      <AcGraffitiLayer density="heavy" />

      <div
        className="relative mx-auto px-4 sm:px-8 py-6 sm:py-9"
        style={{ maxWidth: 1240 }}
      >
        {/* Hero */}
        <div className="text-center mb-8 relative">
          <div
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 11,
              letterSpacing: '0.3em',
              color: AC.chem,
              marginBottom: 10,
            }}
          >
            {'// PHASE 04 · FINAL'}
          </div>
          <div className="inline-block relative">
            <AcDisplay
              style={{
                fontSize: 'clamp(44px, 9vw, 96px)',
                textAlign: 'center',
              }}
            >
              FIN DE <AcShim>LA PARTIE</AcShim>
            </AcDisplay>
            <div
              style={{
                position: 'absolute',
                left: 40,
                right: 40,
                bottom: -26,
                height: 28,
              }}
            >
              <AcDrip color={AC.shimmer} seed={2} />
            </div>
          </div>
        </div>

        {!allRevealed && (
          <div className="text-center my-10">
            <AcStamp color={AC.bone2} rotate={-2} style={{ fontSize: 12, padding: '10px 14px' }}>
              {'// RÉVÉLATION EN COURS… '}
              {revealedCount}/{rows.length}
            </AcStamp>
          </div>
        )}

        {allRevealed && (
          <>
            {/* En mode all-vs-eikichi : duel agrégé Eikichi vs Le Camp.
                En mode standard : podium top 3 classique. */}
            <div className="grid gap-7 lg:grid-cols-[2fr_1fr] mb-10">
              {game.mode === 'all-vs-eikichi' && game.eikichiPlayerId ? (
                <CampVsEikichiPodium
                  rows={rows}
                  eikichiPlayerId={game.eikichiPlayerId}
                />
              ) : (
                <div className="flex items-end gap-3.5 justify-center py-5">
                  {top3[1] && (
                    <PodiumStep
                      place={2}
                      row={top3[1]}
                      h={180}
                      color={AC.bone2}
                      eikichiPlayerId={game.eikichiPlayerId}
                    />
                  )}
                  {top3[0] && (
                    <PodiumStep
                      place={1}
                      row={top3[0]}
                      h={240}
                      color={AC.gold}
                      eikichiPlayerId={game.eikichiPlayerId}
                    />
                  )}
                  {top3[2] && (
                    <PodiumStep
                      place={3}
                      row={top3[2]}
                      h={140}
                      color={AC.rust}
                      eikichiPlayerId={game.eikichiPlayerId}
                    />
                  )}
                </div>
              )}

              <div>
                <div className="flex items-center gap-2.5 mb-3">
                  <AcSectionNum n="s" />
                  <h3
                    className="m-0"
                    style={{
                      fontFamily:
                        "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                      fontWeight: 800,
                      fontSize: 16,
                      textTransform: 'uppercase',
                    }}
                  >
                    STATS GLOBALES
                  </h3>
                </div>
                <AcCard fold={false} dashed style={{ padding: 16 }}>
                  <StatRow
                    label="// TAUX BONNES RÉPONSES"
                    value={`${correctRate}%`}
                    color={AC.chem}
                  />
                  {avgTimeMs != null && (
                    <StatRow
                      label="// TEMPS MOYEN"
                      value={`${(avgTimeMs / 1000).toFixed(1)}s`}
                      color={AC.gold}
                    />
                  )}
                  {fastest && (
                    <StatRow
                      label="// LE PLUS RAPIDE"
                      stamp={
                        <AcStamp color={AC.chem} rotate={-4}>
                          {fastest.name.toUpperCase()} · {(fastest.ms / 1000).toFixed(1)}s
                        </AcStamp>
                      }
                    />
                  )}
                </AcCard>
              </div>
            </div>

            {/* Reste du classement */}
            {rest.length > 0 && (
              <div className="mb-8">
                <div className="mb-4">
                  <AcDottedLabel>{'// RESTE DU CLASSEMENT'}</AcDottedLabel>
                </div>
                <div>
                  {rest.map((row, i) => (
                    <div
                      key={row.playerId}
                      className="flex items-center gap-3.5 px-3.5 py-2.5"
                      style={{ borderBottom: `1.5px dashed ${AC.bone2}` }}
                    >
                      <span
                        style={{
                          fontFamily:
                            "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                          fontWeight: 800,
                          fontSize: 22,
                          color: AC.bone2,
                          minWidth: 46,
                        }}
                      >
                        #{i + 4}
                      </span>
                      <AcAvatar
                        name={row.name}
                        color={colorForPlayer(row.playerId)}
                        size={30}
                        halo={
                          row.playerId === game.eikichiPlayerId
                            ? AC.shimmer
                            : undefined
                        }
                      />
                      <span
                        className="flex-1"
                        style={{
                          fontFamily:
                            "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                          fontWeight: 700,
                          fontSize: 14,
                          letterSpacing: '0.02em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {row.name}
                      </span>
                      <span
                        style={{
                          fontFamily:
                            "'JetBrains Mono', 'Courier New', monospace",
                          fontSize: 11,
                          color: AC.bone2,
                        }}
                      >
                        {'// '}
                        {row.correct}/{row.correct + row.wrong}
                      </span>
                      <span
                        style={{
                          fontFamily:
                            "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                          fontWeight: 800,
                          fontSize: 18,
                          color: AC.gold,
                        }}
                      >
                        {row.score}
                        <span
                          style={{
                            fontSize: 10,
                            marginLeft: 4,
                            color: AC.bone2,
                          }}
                        >
                          pts
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-wrap gap-3.5 justify-center pt-4">
              <BackToLobbyButton roomCode={roomCode} confirm={false} />
              <LeaveRoomButton roomCode={roomCode} />
            </div>

            {!isCreator && (
              <div className="text-center mt-5">
                <AcStamp color={AC.bone2} rotate={-2}>
                  {'// en attente que le créateur relance une partie…'}
                </AcStamp>
              </div>
            )}
          </>
        )}
      </div>
    </AcScreen>
  );
}

// ---------- Sous-composants ------------------------------------------------

const PODIUM_CLIPS: Record<number, string> = {
  1: 'polygon(4% 8%, 50% 2%, 96% 6%, 98% 94%, 90% 100%, 10% 100%, 2% 96%)',
  2: 'polygon(6% 12%, 48% 4%, 94% 14%, 96% 92%, 88% 100%, 12% 100%, 4% 94%)',
  3: 'polygon(8% 16%, 50% 8%, 92% 20%, 94% 90%, 86% 100%, 14% 100%, 6% 92%)',
};

/**
 * Podium "Tous contre Eikichi" : duel visuel entre l'Eikichi et le camp
 * agrégé. Affiche les deux scores en gros + le détail des joueurs du camp
 * (chaque ligne montre nom + score individuel, avec total en bas).
 */
function CampVsEikichiPodium({
  rows,
  eikichiPlayerId,
}: {
  rows: LeaderboardRow[];
  eikichiPlayerId: string;
}) {
  const eikichi = rows.find((r) => r.playerId === eikichiPlayerId);
  const camp = rows.filter((r) => r.playerId !== eikichiPlayerId);
  const campScore = camp.reduce((sum, r) => sum + r.score, 0);
  const eikichiScore = eikichi?.score ?? 0;
  const eikichiWins = eikichiScore > campScore;
  const draw = eikichiScore === campScore;

  return (
    <div className="grid gap-4" style={{ gridTemplateColumns: '1fr auto 1fr' }}>
      {/* Eikichi */}
      <div
        style={{
          padding: 18,
          background: 'rgba(13,11,8,0.7)',
          boxShadow: `inset 0 0 0 2px ${eikichiWins ? AC.shimmer : AC.bone2}`,
          textAlign: 'center',
          opacity: !eikichiWins && !draw ? 0.7 : 1,
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 10,
            letterSpacing: '0.25em',
            color: AC.shimmer,
            marginBottom: 6,
          }}
        >
          {'// EIKICHI'}
        </div>
        <AcAvatar
          name={eikichi?.name ?? '—'}
          color={colorForPlayer(eikichiPlayerId)}
          size={64}
          halo={AC.shimmer}
        />
        <div
          style={{
            marginTop: 8,
            fontFamily: "'Barlow Condensed', 'Bebas Neue', sans-serif",
            fontWeight: 800,
            fontSize: 22,
            textTransform: 'uppercase',
            color: AC.bone,
          }}
        >
          {eikichi?.name ?? '—'}
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: "'Barlow Condensed', 'Bebas Neue', sans-serif",
            fontWeight: 900,
            fontSize: 64,
            color: eikichiWins ? AC.shimmer : AC.bone,
            lineHeight: 1,
          }}
        >
          {eikichiScore}
        </div>
        <div style={{ fontSize: 11, color: AC.bone2, marginTop: 2 }}>
          {eikichi?.correct ?? 0}/{(eikichi?.correct ?? 0) + (eikichi?.wrong ?? 0)} trouvé
        </div>
        {eikichiWins && (
          <div className="mt-3">
            <AcStamp color={AC.shimmer} rotate={-3}>
              VAINQUEUR
            </AcStamp>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center">
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: 36,
            color: AC.gold,
            letterSpacing: '0.15em',
          }}
        >
          VS
        </div>
        {draw && (
          <div
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 9,
              color: AC.gold,
              letterSpacing: '0.2em',
              marginTop: 4,
            }}
          >
            {'// ÉGALITÉ'}
          </div>
        )}
      </div>

      {/* Le Camp */}
      <div
        style={{
          padding: 18,
          background: 'rgba(13,11,8,0.7)',
          boxShadow: `inset 0 0 0 2px ${!eikichiWins && !draw ? AC.chem : AC.bone2}`,
          textAlign: 'center',
          opacity: eikichiWins ? 0.7 : 1,
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 10,
            letterSpacing: '0.25em',
            color: AC.chem,
            marginBottom: 6,
          }}
        >
          {'// LE CAMP'}
        </div>
        <div
          style={{
            fontFamily: "'Barlow Condensed', 'Bebas Neue', sans-serif",
            fontWeight: 800,
            fontSize: 22,
            textTransform: 'uppercase',
            color: AC.bone,
          }}
        >
          {camp.length} JOUEUR{camp.length > 1 ? 'S' : ''}
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: "'Barlow Condensed', sans-serif",
            fontWeight: 900,
            fontSize: 64,
            color: !eikichiWins && !draw ? AC.chem : AC.bone,
            lineHeight: 1,
          }}
        >
          {campScore}
        </div>
        <div
          style={{
            marginTop: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            textAlign: 'left',
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 10,
          }}
        >
          {camp
            .slice()
            .sort((a, b) => b.score - a.score)
            .map((r) => (
              <div
                key={r.playerId}
                className="flex justify-between"
                style={{ color: AC.bone2 }}
              >
                <span style={{ color: AC.bone }}>{r.name}</span>
                <span style={{ color: AC.bone2 }}>+{r.score}</span>
              </div>
            ))}
        </div>
        {!eikichiWins && !draw && (
          <div className="mt-3">
            <AcStamp color={AC.chem} rotate={-3}>
              VAINQUEURS
            </AcStamp>
          </div>
        )}
      </div>
    </div>
  );
}

function PodiumStep({
  place,
  row,
  h,
  color,
  eikichiPlayerId,
}: {
  place: 1 | 2 | 3;
  row: LeaderboardRow;
  h: number;
  color: string;
  eikichiPlayerId: string | null;
}) {
  const emote = place === 1 ? ':-D' : place === 2 ? ':-)' : ':-|';
  return (
    <div className="flex flex-col items-center gap-2.5 flex-1">
      <AcEmote face={emote} color={color} size={48} />
      <div
        className="relative w-full"
        style={{
          padding: 14,
          background: 'rgba(13,11,8,0.7)',
          boxShadow: `inset 0 0 0 2px ${color}`,
        }}
      >
        <AcAvatar
          name={row.name}
          color={colorForPlayer(row.playerId)}
          size={54}
          halo={row.playerId === eikichiPlayerId ? AC.shimmer : undefined}
        />
        <div
          className="mt-2"
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 18,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            color: AC.bone,
          }}
        >
          {row.name}
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 11,
            color: AC.bone2,
          }}
        >
          {'// '}
          {row.correct}/{row.correct + row.wrong} trouvé
        </div>
      </div>
      <div
        className="w-full relative flex flex-col items-center justify-center"
        style={{
          height: h,
          background: color,
          clipPath: PODIUM_CLIPS[place],
          color: AC.ink,
        }}
      >
        <div
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 900,
            fontSize: 64,
            lineHeight: 1,
          }}
        >
          #{place}
        </div>
        <div
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 26,
            marginTop: 4,
          }}
        >
          {row.score}
          <span style={{ fontSize: 14, marginLeft: 4 }}>pts</span>
        </div>
      </div>
    </div>
  );
}

function StatRow({
  label,
  value,
  color,
  stamp,
}: {
  label: string;
  value?: string;
  color?: string;
  stamp?: React.ReactNode;
}) {
  return (
    <div
      className="flex justify-between items-center py-2"
      style={{ borderBottom: `1.5px dashed ${AC.bone2}` }}
    >
      <span
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 11,
          color: AC.bone2,
        }}
      >
        {label}
      </span>
      {stamp ??
        (value && (
          <span
            style={{
              fontFamily:
                "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
              fontWeight: 800,
              fontSize: 16,
              color: color ?? AC.bone,
            }}
          >
            {value}
          </span>
        ))}
    </div>
  );
}
