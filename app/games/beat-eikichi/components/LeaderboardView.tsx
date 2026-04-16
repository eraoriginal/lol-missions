'use client';

import { useEffect, useState } from 'react';
import type { Room } from '@/app/types/room';

interface LeaderboardViewProps {
  room: Room;
  roomCode: string;
  isCreator: boolean;
  creatorToken: string | null;
}

interface LeaderboardRow {
  playerId: string;
  name: string;
  avatar: string;
  score: number;
  totalTimeMs: number;
}

const REVEAL_DELAY_MS = 1200;

export function LeaderboardView({
  room,
  roomCode,
  isCreator,
  creatorToken,
}: LeaderboardViewProps) {
  const game = room.beatEikichiGame!;

  // Construction du classement : score DESC, puis temps cumulé ASC (plus rapide = mieux).
  const rows: LeaderboardRow[] = room.players
    .map((p) => {
      const state = game.playerStates.find((s) => s.playerId === p.id);
      const totalTimeMs =
        state?.answers.reduce(
          (sum, a) => sum + (a.correct && a.answeredAtMs ? a.answeredAtMs : 0),
          0,
        ) ?? 0;
      return {
        playerId: p.id,
        name: p.name,
        avatar: p.avatar,
        score: state?.score ?? 0,
        totalTimeMs,
      };
    })
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score; // score DESC
      return a.totalTimeMs - b.totalTimeMs; // temps ASC
    });

  // Révélation du dernier vers le premier.
  const [revealedCount, setRevealedCount] = useState(0);
  const [restarting, setRestarting] = useState(false);

  useEffect(() => {
    if (revealedCount >= rows.length) return;
    const t = setTimeout(() => {
      setRevealedCount((c) => c + 1);
    }, REVEAL_DELAY_MS);
    return () => clearTimeout(t);
  }, [revealedCount, rows.length]);

  // Les joueurs révélés sont les derniers du classement (plus petit score révélé d'abord).
  const revealedRows = rows.slice(rows.length - revealedCount);

  const handleRestart = async () => {
    if (!creatorToken) return;
    setRestarting(true);
    try {
      await fetch(`/api/games/beat-eikichi/${roomCode}/restart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorToken }),
      });
    } finally {
      setRestarting(false);
    }
  };

  const podiumClass = (rank: number) => {
    if (rank === 0)
      return 'border-amber-400/70 bg-gradient-to-r from-amber-900/30 to-amber-950/30';
    if (rank === 1)
      return 'border-slate-300/40 bg-gradient-to-r from-slate-700/20 to-slate-900/20';
    if (rank === 2)
      return 'border-orange-500/40 bg-gradient-to-r from-orange-900/20 to-orange-950/20';
    return 'border-purple-500/20 bg-purple-900/20';
  };

  return (
    <div className="min-h-screen arcane-bg p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-3xl md:text-4xl font-light text-purple-100 tracking-wide text-center">
          Classement final
        </h1>

        <ul className="space-y-3">
          {revealedRows.map((row) => {
            const actualRank = rows.indexOf(row);
            return (
              <li
                key={row.playerId}
                className={`flex items-center gap-4 p-4 rounded-xl border ${podiumClass(
                  actualRank,
                )} beat-eikichi-reveal`}
              >
                <div className="text-2xl font-bold text-purple-100 w-8 text-center">
                  {actualRank + 1}
                </div>
                {row.avatar ? (
                  <img
                    src={row.avatar}
                    alt=""
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-800/50 flex items-center justify-center text-purple-200 font-bold">
                    {row.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-lg font-semibold text-purple-100 truncate flex items-center gap-2 flex-wrap">
                    <span>{row.name}</span>
                    {row.playerId === game.eikichiPlayerId && (
                      <span className="beat-eikichi-badge">EIKICHI</span>
                    )}
                  </div>
                  {row.totalTimeMs > 0 && (
                    <div className="text-xs text-purple-300/60">
                      Temps cumulé : {(row.totalTimeMs / 1000).toFixed(1)} s
                    </div>
                  )}
                </div>
                <div className="text-2xl font-bold lol-text-gold">
                  {row.score}
                </div>
              </li>
            );
          })}
        </ul>

        {revealedCount >= rows.length && isCreator && (
          <div className="arcane-card p-4 text-center">
            <button
              onClick={handleRestart}
              disabled={restarting}
              className="px-6 py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold transition disabled:opacity-50"
            >
              {restarting ? 'Redémarrage…' : '↻ Rejouer'}
            </button>
          </div>
        )}

        {revealedCount >= rows.length && !isCreator && (
          <div className="text-center text-sm text-purple-300/70">
            En attente que le maître relance une partie…
          </div>
        )}
      </div>
    </div>
  );
}
