'use client';

import { useState } from 'react';
import type { Room } from '@/app/types/room';
import { BEAT_EIKICHI_CONFIG } from '@/lib/beatEikichi/config';
import { LeaveRoomButton } from '@/app/components/LeaveRoomButton';
import { BackToLobbyButton } from './BackToLobbyButton';

interface ReviewViewProps {
  room: Room;
  roomCode: string;
  isCreator: boolean;
  creatorToken: string | null;
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

  return (
    <div className="min-h-screen arcane-bg p-4 md:p-6">
      <div className="max-w-5xl mx-auto flex justify-end items-center gap-2 mb-3">
        <BackToLobbyButton roomCode={roomCode} />
        <LeaveRoomButton roomCode={roomCode} />
      </div>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-purple-300/70">
            Révision{' '}
            <span className="text-purple-100 font-semibold">
              {game.currentIndex + 1}
            </span>
            {' / '}
            {total}
          </div>
          {isCreator && (
            <button
              onClick={handleNext}
              disabled={advancing}
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold transition disabled:opacity-50"
            >
              {game.currentIndex + 1 >= total ? 'Voir le classement' : 'Suivant →'}
            </button>
          )}
        </div>

        <div className="arcane-card p-4 flex items-center justify-center aspect-video overflow-hidden bg-black/40">
          {question.imageUrl ? (
            <img
              src={question.imageUrl}
              alt={question.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="text-purple-300/50">Image indisponible</div>
          )}
        </div>

        <div className="text-center">
          <div className="text-xs uppercase tracking-widest text-purple-400/70 mb-1">
            La bonne réponse était
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-amber-300">
            {question.name}
          </h2>
        </div>

        <div className="arcane-card p-4">
          <h3 className="text-sm font-semibold text-purple-100 mb-3">
            Réponses des joueurs
          </h3>
          <ul className="grid sm:grid-cols-2 gap-2">
            {room.players.map((p) => {
              const state = game.playerStates.find((s) => s.playerId === p.id);
              const answer = state?.answers.find(
                (a) => a.position === game.currentIndex,
              );
              const correct = answer?.correct ?? false;
              const text = answer?.submittedText?.trim();
              return (
                <li
                  key={p.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    correct
                      ? 'border-emerald-500/50 bg-emerald-900/20'
                      : 'border-red-500/40 bg-red-900/10'
                  }`}
                >
                  <span
                    className={`text-lg ${
                      correct ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {correct ? '✓' : '✗'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-purple-100 truncate flex items-center gap-2">
                      <span>{p.name}</span>
                      {p.id === game.eikichiPlayerId && (
                        <span className="beat-eikichi-badge">EIKICHI</span>
                      )}
                    </div>
                    <div className="text-xs text-purple-300/70 truncate">
                      {text && text.length > 0 ? `« ${text} »` : 'Pas de réponse'}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {!isCreator && (
          <div className="text-center text-purple-300/70 text-sm">
            En attente du maître pour passer à la question suivante…
          </div>
        )}
      </div>
    </div>
  );
}
