'use client';

import { useEffect, useRef, useState } from 'react';
import type { RoomEvent } from '@/app/types/room';

const EVENT_MUSIC_MAP: Record<string, string> = {
    '1V1': '/sounds/aram-missions/1v1_music.mp3',
    '2V2': '/sounds/aram-missions/2v2_music.mp3',
    '3V3': '/sounds/aram-missions/3v3_music.mp3',
};

interface EventOverlayProps {
    event: RoomEvent;
    onDismiss: (eventId: string) => void;
}

function getDifficultyStyle(difficulty: string) {
    switch (difficulty) {
        case 'easy':
            return { bg: 'bg-green-600/80', text: 'text-green-100', label: 'Facile' };
        case 'medium':
            return { bg: 'bg-yellow-600/80', text: 'text-yellow-100', label: 'Moyen' };
        case 'hard':
            return { bg: 'bg-red-600/80', text: 'text-red-100', label: 'Difficile' };
        default:
            return { bg: 'bg-gray-600/80', text: 'text-gray-100', label: difficulty };
    }
}

export function EventOverlay({ event, onDismiss }: EventOverlayProps) {
    const [countdown, setCountdown] = useState(() => {
        // Calculer le countdown restant depuis appearedAt (server-authoritative)
        if (event.appearedAt) {
            const elapsed = (Date.now() - new Date(event.appearedAt).getTime()) / 1000;
            return Math.max(0, Math.ceil(event.event.duration - elapsed));
        }
        return event.event.duration;
    });
    const hasAnnouncedRef = useRef(false);
    const musicRef = useRef<HTMLAudioElement | null>(null);

    const displayText = event.resolvedText || event.event.text;

    const playEventMusic = () => {
        const musicCode = event.event.music;
        if (!musicCode) return;
        const musicPath = EVENT_MUSIC_MAP[musicCode];
        if (!musicPath) return;

        const audio = new Audio(musicPath);
        audio.volume = 0.5;
        musicRef.current = audio;
        audio.play().catch(() => {});
    };

    // TTS au mount + musique après le TTS
    useEffect(() => {
        if (hasAnnouncedRef.current) return;
        hasAnnouncedRef.current = true;

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const fullText = 'Événement spécial : ' + displayText;

            setTimeout(() => {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance(fullText);
                utterance.lang = 'fr-FR';
                utterance.rate = 1;
                utterance.volume = 0.9;

                const voices = window.speechSynthesis.getVoices();
                const frenchVoice = voices.find(v => v.lang.startsWith('fr'));
                if (frenchVoice) {
                    utterance.voice = frenchVoice;
                }

                utterance.onend = () => playEventMusic();

                window.speechSynthesis.speak(utterance);
            }, 100);
        } else {
            // Pas de TTS disponible : délai de 1s avant la musique
            setTimeout(() => playEventMusic(), 1000);
        }

        return () => {
            if (musicRef.current) {
                musicRef.current.pause();
                musicRef.current = null;
            }
        };
    }, [displayText]);

    // Countdown basé sur appearedAt (server-authoritative, synchronisé multi-clients)
    useEffect(() => {
        const interval = setInterval(() => {
            if (event.appearedAt) {
                const elapsed = (Date.now() - new Date(event.appearedAt).getTime()) / 1000;
                const remaining = Math.max(0, Math.ceil(event.event.duration - elapsed));
                setCountdown(remaining);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [event.appearedAt, event.event.duration]);

    // Auto-dismiss quand le countdown atteint 0
    useEffect(() => {
        if (countdown === 0) {
            onDismiss(event.id);
        }
    }, [countdown, event.id, onDismiss]);

    const diff = getDifficultyStyle(event.event.difficulty);

    // Format countdown en mm:ss si > 60s
    const countdownMinutes = Math.floor(countdown / 60);
    const countdownSeconds = countdown % 60;
    const countdownDisplay = countdown >= 60
        ? `${countdownMinutes}:${String(countdownSeconds).padStart(2, '0')}`
        : `${countdown}s`;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="w-full max-w-lg px-4 text-center">
                {/* Header */}
                <div className="mb-6">
                    <div className="text-5xl mb-3 animate-bounce">⚡</div>
                    <h2 className="text-3xl font-bold uppercase tracking-wider text-amber-400">
                        Événement Spécial
                    </h2>
                </div>

                {/* Event card */}
                <div className="bg-gradient-to-br from-amber-900/60 to-orange-950/60 border-2 border-amber-500/50 rounded-xl p-8 shadow-lg shadow-amber-500/20">
                    <p className="text-xl text-white leading-relaxed mb-6">
                        {displayText}
                    </p>

                    <div className="flex items-center justify-center gap-3">
                        <span className={`text-sm px-3 py-1 rounded font-bold ${diff.bg} ${diff.text}`}>
                            {diff.label}
                        </span>
                        <span className="text-sm font-bold text-amber-300 bg-amber-900/50 px-3 py-1 rounded border border-amber-500/30">
                            +{event.event.points} pts
                        </span>
                    </div>
                </div>

                {/* Countdown et bouton dismiss */}
                <div className="mt-6 space-y-3">
                    <div className="text-2xl font-bold font-mono text-amber-300">
                        ⏱ {countdownDisplay}
                    </div>
                    <button
                        onClick={() => onDismiss(event.id)}
                        className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-all text-lg"
                    >
                        Compris
                    </button>
                </div>
            </div>
        </div>
    );
}
