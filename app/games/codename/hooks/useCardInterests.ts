'use client';

import { useEffect, useCallback, useRef } from 'react';
import Pusher from 'pusher-js';

interface InterestUpdate {
  cardId: string;
  playerName: string;
  added: boolean;
  timestamp: number;
}

interface CardInterest {
  id: string;
  cardId: string;
  playerName: string;
}

interface Card {
  id: string;
  word: string;
  color: string;
  category?: string | null;
  revealed: boolean;
  position: number;
  interests?: CardInterest[];
}

// Singleton Pusher client
let pusherInstance: Pusher | null = null;

function getPusherClient(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
      forceTLS: true,
    });
  }
  return pusherInstance;
}

/**
 * Hook to listen for real-time interest updates via Pusher
 * and apply them to the cards without a full room refetch.
 */
export function useCardInterests(
  roomCode: string | null,
  cards: Card[],
  onCardsUpdate: (updatedCards: Card[]) => void
) {
  const cardsRef = useRef(cards);
  cardsRef.current = cards;

  const handleInterestUpdate = useCallback((data: InterestUpdate) => {
    const { cardId, playerName, added } = data;

    const updatedCards = cardsRef.current.map(card => {
      if (card.id !== cardId) return card;

      const currentInterests = card.interests || [];

      if (added) {
        // Check if already exists
        if (currentInterests.some(i => i.playerName === playerName)) {
          return card;
        }
        return {
          ...card,
          interests: [...currentInterests, { id: `pusher-${Date.now()}`, cardId, playerName }]
        };
      } else {
        return {
          ...card,
          interests: currentInterests.filter(i => i.playerName !== playerName)
        };
      }
    });

    onCardsUpdate(updatedCards);
  }, [onCardsUpdate]);

  useEffect(() => {
    if (!roomCode) return;

    const pusher = getPusherClient();
    const channelName = `room-${roomCode}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('interest-updated', handleInterestUpdate);

    return () => {
      channel.unbind('interest-updated', handleInterestUpdate);
    };
  }, [roomCode, handleInterestUpdate]);
}
