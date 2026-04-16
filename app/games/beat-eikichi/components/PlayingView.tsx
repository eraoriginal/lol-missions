'use client';

import { useEffect, useRef, useState } from 'react';
import type { Room } from '@/app/types/room';
import { BeatEikichiTimer } from './BeatEikichiTimer';
import { PlayerAnswerInput } from './PlayerAnswerInput';
import { PlayerScoreList } from './PlayerScoreList';
import type { CatalogEntry } from './AutocompleteInput';
import { BEAT_EIKICHI_CONFIG } from '@/lib/beatEikichi/config';

interface PlayingViewProps {
  room: Room;
  roomCode: string;
  playerToken: string;
  catalog: CatalogEntry[];
}

export function PlayingView({
  room,
  roomCode,
  playerToken,
  catalog,
}: PlayingViewProps) {
  const game = room.beatEikichiGame!;
  const currentIndex = game.currentIndex;
  const total = BEAT_EIKICHI_CONFIG.QUESTIONS_PER_GAME;
  const question = game.questions[currentIndex];

  const player = room.players.find((p) => p.token === playerToken);
  const state = player
    ? game.playerStates.find((s) => s.playerId === player.id)
    : null;
  const alreadyFound =
    state?.answers.some((a) => a.position === currentIndex && a.correct) ??
    false;

  const creatorPlayerId =
    room.players.find((p) => p.token === room.creatorToken)?.id ?? null;

  // Anti-double-trigger côté client pour /next.
  const nextTriggeredRef = useRef<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state on prop change is intentional
    setImageLoaded(false);
    nextTriggeredRef.current = null;
  }, [currentIndex]);

  const handleTimeout = async () => {
    if (nextTriggeredRef.current === currentIndex) return;
    nextTriggeredRef.current = currentIndex;
    try {
      await fetch(`/api/games/beat-eikichi/${roomCode}/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerToken,
          expectedIndex: currentIndex,
        }),
      });
    } catch {
      // réessaiera au prochain tick
      nextTriggeredRef.current = null;
    }
  };

  if (!question) {
    return (
      <div className="min-h-screen arcane-bg p-8 text-purple-100">
        Chargement de la question…
      </div>
    );
  }

  return (
    <div className="min-h-screen arcane-bg p-4 md:p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 md:gap-6">
        {/* Colonne centrale : image + timer + input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-purple-300/70">
              Question{' '}
              <span className="text-purple-100 font-semibold">
                {currentIndex + 1}
              </span>
              {' / '}
              {total}
            </div>
            <BeatEikichiTimer
              questionStartedAt={game.questionStartedAt}
              onTimeout={handleTimeout}
            />
          </div>

          <div className="arcane-card p-4 flex items-center justify-center aspect-video overflow-hidden bg-black/40">
            {question.imageUrl ? (
              <img
                src={question.imageUrl}
                alt="Devine le jeu"
                onLoad={() => setImageLoaded(true)}
                className={`max-h-full max-w-full object-contain transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ) : (
              <div className="text-purple-300/50">Image indisponible</div>
            )}
          </div>

          <div>
            <PlayerAnswerInput
              roomCode={roomCode}
              playerToken={playerToken}
              catalog={catalog}
              alreadyFound={alreadyFound}
              questionKey={currentIndex}
            />
          </div>
        </div>

        {/* Colonne droite : liste des joueurs */}
        <div className="lg:sticky lg:top-6 self-start">
          <PlayerScoreList
            players={room.players}
            playerStates={game.playerStates}
            currentIndex={currentIndex}
            creatorPlayerId={creatorPlayerId}
            eikichiPlayerId={game.eikichiPlayerId}
          />
        </div>
      </div>
    </div>
  );
}
