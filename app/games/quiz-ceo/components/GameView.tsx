'use client';

import type { Room } from '@/app/types/room';
import { PlayingView } from './PlayingView';
import { WaitingReviewView } from './WaitingReviewView';
import { ReviewView } from './ReviewView';
import { LeaderboardView } from './LeaderboardView';
import { AC, AcScreen } from '@/app/components/arcane';

interface Props {
  room: Room;
  roomCode: string;
  refetch?: () => void;
}

/**
 * Routeur de phase du Quiz du CEO. Fait correspondre chaque phase du
 * QuizCeoGame à une view dédiée :
 *   playing        → PlayingView (timer + question + réponse)
 *   waiting_review → WaitingReviewView (attente que le créateur lance la correction)
 *   review         → ReviewView (le créateur valide les réponses)
 *   leaderboard    → LeaderboardView (classement final avec reveal)
 */
export function GameView({ room, roomCode, refetch }: Props) {
  const game = room.quizCeoGame;
  const creatorToken =
    typeof window !== 'undefined'
      ? localStorage.getItem(`room_${roomCode}_creator`)
      : null;
  const playerToken =
    typeof window !== 'undefined'
      ? localStorage.getItem(`room_${roomCode}_player`)
      : null;
  const isCreator = !!creatorToken;

  if (!game) {
    return (
      <AcScreen>
        <div
          className="min-h-screen flex items-center justify-center"
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 14,
            color: AC.bone2,
          }}
        >
          {'// initialisation de la partie…'}
        </div>
      </AcScreen>
    );
  }

  if (!playerToken) {
    return (
      <AcScreen>
        <div
          className="min-h-screen flex items-center justify-center"
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 14,
            color: AC.bone2,
          }}
        >
          {'// token joueur manquant — reviens depuis l\'accueil.'}
        </div>
      </AcScreen>
    );
  }

  if (game.phase === 'waiting_review') {
    return (
      <WaitingReviewView
        room={room}
        roomCode={roomCode}
        isCreator={isCreator}
        creatorToken={creatorToken}
      />
    );
  }
  if (game.phase === 'review') {
    return (
      <ReviewView
        room={room}
        roomCode={roomCode}
        isCreator={isCreator}
        creatorToken={creatorToken}
        refetch={refetch}
      />
    );
  }
  if (game.phase === 'leaderboard') {
    return (
      <LeaderboardView room={room} roomCode={roomCode} isCreator={isCreator} />
    );
  }

  // phase === 'playing'
  return (
    <PlayingView
      room={room}
      roomCode={roomCode}
      playerToken={playerToken}
      refetch={refetch}
    />
  );
}
