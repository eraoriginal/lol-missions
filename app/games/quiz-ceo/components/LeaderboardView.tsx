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
  AcGraffitiLayer,
  AcScreen,
  AcShim,
  AcSplat,
  AcStamp,
} from '@/app/components/arcane';

interface Props {
  room: Room;
  roomCode: string;
  isCreator: boolean;
}

interface Row {
  playerId: string;
  name: string;
  score: number;
}

// Cadence de révélation : un peu plus lente entre chaque rang lambda,
// avec un suspense beaucoup plus long avant le top 2.
const REVEAL_DELAY_MS = 1700;
const TOP2_DELAY_MS = 3000;

function colorForPlayer(id: string): string {
  const palette = [AC.shimmer, AC.chem, AC.hex, AC.gold, AC.violet, AC.rust];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

export function LeaderboardView({ room, roomCode, isCreator }: Props) {
  const game = room.quizCeoGame!;

  // Score DESC, puis nom ASC (tri stable).
  const rows: Row[] = room.players
    .map((p) => {
      const s = game.playerStates.find((ps) => ps.playerId === p.id);
      return {
        playerId: p.id,
        name: p.name,
        score: s?.score ?? 0,
      };
    })
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return a.name.localeCompare(b.name);
    });

  // Ordre de révélation : du dernier → premier, mais les DEUX premiers sont
  // révélés en même temps à la fin.
  // Ex : [#1, #2, #3, #4] → révèle d'abord #4, puis #3, puis {#1 + #2} ensemble.
  const n = rows.length;
  const revealSteps: number[][] = [];
  if (n >= 1) {
    // Les rangs à révéler, du dernier vers l'avant-dernier inclus.
    for (let i = n - 1; i >= 2; i--) {
      revealSteps.push([i]);
    }
    // Top 2 (ou le seul joueur).
    if (n >= 2) {
      revealSteps.push([1, 0]);
    } else {
      revealSteps.push([0]);
    }
  }

  const [revealedStep, setRevealedStep] = useState(0);
  const totalSteps = revealSteps.length;

  useEffect(() => {
    if (revealedStep >= totalSteps) return;
    // Si la PROCHAINE étape révèle le top 2 (rangs 0 + 1 ensemble), suspense plus long.
    const nextStep = revealSteps[revealedStep];
    const nextIsTop2 = nextStep && nextStep.includes(0);
    const delay = nextIsTop2 ? TOP2_DELAY_MS : REVEAL_DELAY_MS;
    const t = setTimeout(() => setRevealedStep((s) => s + 1), delay);
    return () => clearTimeout(t);
    // revealSteps recalculé à chaque render mais structurellement stable tant que
    // les rows ne changent pas — on ne le met pas dans les deps pour éviter le
    // reset du timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedStep, totalSteps]);

  const revealedSet = new Set<number>();
  for (let i = 0; i < revealedStep; i++) {
    revealSteps[i]?.forEach((idx) => revealedSet.add(idx));
  }

  const allRevealed = revealedStep >= totalSteps;

  return (
    <AcScreen>
      <div style={{ position: 'absolute', top: -40, left: -40, pointerEvents: 'none' }}>
        <AcSplat color={AC.gold} size={440} opacity={0.5} seed={1} />
      </div>
      <div style={{ position: 'absolute', bottom: 40, right: -60, pointerEvents: 'none' }}>
        <AcSplat color={AC.shimmer} size={360} opacity={0.5} seed={3} />
      </div>
      <AcGraffitiLayer density="heavy" />

      <div
        className="relative mx-auto px-4 sm:px-8 py-6 sm:py-9"
        style={{ maxWidth: 980 }}
      >
        {/* Hero */}
        <div className="text-center mb-8 relative">
          <div
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 11,
              letterSpacing: '0.3em',
              color: AC.gold,
              marginBottom: 10,
            }}
          >
            {'// PHASE 03 · CLASSEMENT'}
          </div>
          <div className="inline-block relative">
            <AcDisplay
              style={{ fontSize: 'clamp(40px, 8vw, 76px)', textAlign: 'center' }}
            >
              CLASSEMENT <AcShim color={AC.gold}>FINAL</AcShim>
            </AcDisplay>
            <div
              style={{
                position: 'absolute',
                left: 40,
                right: 40,
                bottom: -20,
                height: 22,
              }}
            >
              <AcDrip color={AC.gold} seed={2} />
            </div>
          </div>
        </div>

        {/* Classement */}
        <div className="flex flex-col gap-2.5 mt-10">
          {rows.map((row, rank) => {
            const revealed = revealedSet.has(rank);
            const isTop1 = rank === 0;
            const isTop2 = rank === 1;
            return (
              <div
                key={row.playerId}
                style={{
                  transform: revealed
                    ? 'translateX(0)'
                    : 'translateX(20px)',
                  opacity: revealed ? 1 : 0,
                  transition: 'all 0.45s ease-out',
                }}
              >
                {revealed && (
                  <LeaderboardRow row={row} rank={rank} isTop1={isTop1} isTop2={isTop2} />
                )}
                {!revealed && (
                  <div
                    style={{
                      height: 56,
                      border: `1.5px dashed ${AC.bone2}`,
                      background: 'rgba(13,11,8,0.3)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {!allRevealed && (
          <div className="text-center mt-8">
            <AcStamp color={AC.bone2} rotate={-2} style={{ fontSize: 12, padding: '10px 14px' }}>
              {'// RÉVÉLATION EN COURS… '}
              {revealedStep}/{totalSteps}
            </AcStamp>
          </div>
        )}

        {allRevealed && (
          <>
            <div className="flex flex-wrap gap-3.5 justify-center pt-8">
              <BackToLobbyButton roomCode={roomCode} confirm={false} />
              <LeaveRoomButton roomCode={roomCode} />
            </div>
            {!isCreator && (
              <div className="text-center mt-5">
                <AcDottedLabel>{'// en attente que le créateur relance…'}</AcDottedLabel>
              </div>
            )}
          </>
        )}
      </div>
    </AcScreen>
  );
}

function LeaderboardRow({
  row,
  rank,
  isTop1,
  isTop2,
}: {
  row: Row;
  rank: number;
  isTop1: boolean;
  isTop2: boolean;
}) {
  const color = isTop1 ? AC.gold : isTop2 ? AC.shimmer : AC.bone2;
  return (
    <AcCard
      fold={false}
      style={{
        padding: 14,
        borderColor: color,
        background: isTop1
          ? 'rgba(245,185,18,0.14)'
          : isTop2
            ? 'rgba(255,61,139,0.10)'
            : undefined,
      }}
    >
      <div className="flex items-center gap-4">
        <span
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 900,
            fontSize: isTop1 ? 46 : 30,
            color,
            minWidth: 60,
            lineHeight: 1,
          }}
        >
          #{rank + 1}
        </span>
        <AcAvatar
          name={row.name}
          color={colorForPlayer(row.playerId)}
          size={isTop1 ? 54 : 40}
          halo={isTop1 ? AC.gold : isTop2 ? AC.shimmer : undefined}
        />
        <span
          className="flex-1"
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: isTop1 ? 22 : 16,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            color: AC.bone,
          }}
        >
          {row.name}
          {isTop1 && (
            <span
              style={{
                background: AC.gold,
                color: AC.ink,
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 9,
                letterSpacing: '0.22em',
                padding: '2px 7px',
                marginLeft: 10,
                fontWeight: 700,
                verticalAlign: 'middle',
              }}
            >
              CEO
            </span>
          )}
        </span>
        <span
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 900,
            fontSize: isTop1 ? 36 : 24,
            color,
          }}
        >
          {row.score}
          <span
            style={{
              fontSize: 11,
              marginLeft: 4,
              color: AC.bone2,
              fontWeight: 700,
            }}
          >
            pts
          </span>
        </span>
      </div>
    </AcCard>
  );
}
