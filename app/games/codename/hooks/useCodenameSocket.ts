'use client';

import { useEffect, useCallback } from 'react';
import Pusher from 'pusher-js';
import { useCodenameSound } from './useCodenameSound';

type SoundType = 'correct' | 'wrong_team' | 'neutral' | 'assassin' | 'victory' | 'turn_change';

interface SoundEvent {
  soundType: SoundType;
  timestamp: number;
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
 * Hook to listen for real-time sound events via Pusher
 * so all players hear sounds when any card is revealed.
 */
export function useCodenameSocket(roomCode: string | null) {
  const { play } = useCodenameSound();

  const handleSoundEvent = useCallback((data: SoundEvent) => {
    play(data.soundType);
  }, [play]);

  useEffect(() => {
    if (!roomCode) return;

    const pusher = getPusherClient();
    const channelName = `room-${roomCode}`;
    const channel = pusher.subscribe(channelName);

    channel.bind('sound-event', handleSoundEvent);

    return () => {
      channel.unbind('sound-event', handleSoundEvent);
    };
  }, [roomCode, handleSoundEvent]);
}
