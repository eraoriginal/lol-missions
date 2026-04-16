'use client';

import { useEffect, useState } from 'react';
import type { Room } from '@/app/types/room';
import { PlayingView } from './PlayingView';
import { ReviewIntroView } from './ReviewIntroView';
import { ReviewView } from './ReviewView';
import { LeaderboardView } from './LeaderboardView';
import type { CatalogEntry } from './AutocompleteInput';

interface GameViewProps {
  room: Room;
  roomCode: string;
}

export function GameView({ room, roomCode }: GameViewProps) {
  const [catalog, setCatalog] = useState<CatalogEntry[] | null>(null);

  const creatorToken =
    typeof window !== 'undefined'
      ? localStorage.getItem(`room_${roomCode}_creator`)
      : null;
  const playerToken =
    typeof window !== 'undefined'
      ? localStorage.getItem(`room_${roomCode}_player`)
      : null;
  const isCreator = !!creatorToken;

  // Charger le catalogue une seule fois au montage.
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/games/beat-eikichi/${roomCode}/catalog`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setCatalog(data.games ?? []);
        }
      })
      .catch(() => {
        if (!cancelled) setCatalog([]);
      });
    return () => {
      cancelled = true;
    };
  }, [roomCode]);

  const game = room.beatEikichiGame;
  if (!game) {
    return (
      <div className="min-h-screen arcane-bg flex items-center justify-center text-purple-100">
        Initialisation de la partie…
      </div>
    );
  }
  if (!playerToken) {
    return (
      <div className="min-h-screen arcane-bg flex items-center justify-center text-purple-100">
        Token joueur manquant. Reviens depuis l&apos;accueil.
      </div>
    );
  }

  if (game.phase === 'review_intro') {
    return (
      <ReviewIntroView
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
      />
    );
  }
  if (game.phase === 'leaderboard') {
    return (
      <LeaderboardView
        room={room}
        roomCode={roomCode}
        isCreator={isCreator}
      />
    );
  }

  // phase === 'playing'
  if (!catalog) {
    return (
      <div className="min-h-screen arcane-bg flex items-center justify-center text-purple-100">
        Chargement du catalogue…
      </div>
    );
  }

  return (
    <PlayingView
      room={room}
      roomCode={roomCode}
      playerToken={playerToken}
      catalog={catalog}
    />
  );
}
