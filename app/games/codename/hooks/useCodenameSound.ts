'use client';

import { useCallback, useRef, useState, useEffect } from 'react';

type SoundType = 'correct' | 'wrong_team' | 'neutral' | 'assassin' | 'victory' | 'turn_change';

// Global array to track all playing audio instances
const activeSounds: HTMLAudioElement[] = [];

const MUTE_STORAGE_KEY = 'codename_sound_muted';

export function useCodenameSound() {
  const assassinPlayingRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);

  // Load mute preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(MUTE_STORAGE_KEY);
      setIsMuted(stored === 'true');
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newValue = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem(MUTE_STORAGE_KEY, String(newValue));
      }
      // Stop all sounds when muting
      if (newValue) {
        while (activeSounds.length > 0) {
          const audio = activeSounds.pop();
          if (audio) {
            audio.pause();
            audio.currentTime = 0;
          }
        }
      }
      return newValue;
    });
  }, []);

  const stopAll = useCallback(() => {
    // Stop and remove all active sounds
    while (activeSounds.length > 0) {
      const audio = activeSounds.pop();
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    }
  }, []);

  const play = useCallback((type: SoundType) => {
    if (typeof window === 'undefined') return;

    // Check if muted
    const muted = localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
    if (muted) {
      return;
    }

    // If assassin is playing, ignore all other sounds
    if (assassinPlayingRef.current && type !== 'assassin') {
      console.log(`[Sound] Blocked ${type} - assassin is playing`);
      return;
    }

    try {
      // If this is the assassin sound, stop all other sounds first
      if (type === 'assassin') {
        stopAll();
        assassinPlayingRef.current = true;
      }

      const audio = new Audio(`/sounds/codename/${type}.mp3`);
      audio.volume = 0.6;

      // Track this sound
      activeSounds.push(audio);

      // Remove from tracking when finished
      audio.addEventListener('ended', () => {
        const index = activeSounds.indexOf(audio);
        if (index > -1) {
          activeSounds.splice(index, 1);
        }
        if (type === 'assassin') {
          assassinPlayingRef.current = false;
        }
      });

      audio.play().catch((err) => {
        // Ignore autoplay errors (user hasn't interacted yet)
        console.log(`[Sound] Could not play ${type}:`, err.message);
        if (type === 'assassin') {
          assassinPlayingRef.current = false;
        }
      });
    } catch (err) {
      console.error(`[Sound] Error creating audio for ${type}:`, err);
      if (type === 'assassin') {
        assassinPlayingRef.current = false;
      }
    }
  }, [stopAll]);

  return { play, stopAll, isMuted, toggleMute };
}
