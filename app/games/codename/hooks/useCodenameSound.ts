'use client';

import { useCallback } from 'react';

type SoundType = 'correct' | 'wrong_team' | 'neutral' | 'assassin' | 'victory' | 'turn_change';

export function useCodenameSound() {
  const play = useCallback((type: SoundType) => {
    if (typeof window === 'undefined') return;

    try {
      const audio = new Audio(`/sounds/codename/${type}.mp3`);
      audio.volume = 0.8;
      audio.play().catch((err) => {
        // Ignore autoplay errors (user hasn't interacted yet)
        console.log(`[Sound] Could not play ${type}:`, err.message);
      });
    } catch (err) {
      console.error(`[Sound] Error creating audio for ${type}:`, err);
    }
  }, []);

  return { play };
}
