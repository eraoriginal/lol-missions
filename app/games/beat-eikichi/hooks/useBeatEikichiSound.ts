'use client';

import { useEffect, useRef } from 'react';
import Pusher from 'pusher-js';

const SOUND_URLS: Record<string, string> = {
  'eikichi-found': '/sounds/beat-eikichi/blah.mp3',
};

// Singleton Pusher (partagé avec useRoom), une seule connexion par onglet.
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
 * S'abonne à l'event Pusher `beat-eikichi-sound` sur la room et joue le son
 * correspondant sur tous les clients connectés.
 *
 * Les sons sont servis depuis `/public/sounds/beat-eikichi/`.
 */
export function useBeatEikichiSound(roomCode: string | null) {
  const audioCacheRef = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    if (!roomCode) return;
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`room-${roomCode}`);

    const handler = (data: { soundType?: string }) => {
      const type = data?.soundType;
      if (!type) return;
      const url = SOUND_URLS[type];
      if (!url) return;

      // Réutilise (ou crée) un élément Audio par type pour éviter le délai de chargement.
      let audio = audioCacheRef.current.get(type);
      if (!audio) {
        audio = new Audio(url);
        audio.preload = 'auto';
        audioCacheRef.current.set(type, audio);
      }
      audio.currentTime = 0;
      audio.play().catch((err) => {
        // L'auto-play peut être bloqué tant que l'utilisateur n'a pas interagi avec la page.
        console.warn('[beat-eikichi sound] play blocked:', err);
      });
    };

    channel.bind('beat-eikichi-sound', handler);
    return () => {
      channel.unbind('beat-eikichi-sound', handler);
    };
  }, [roomCode]);
}
