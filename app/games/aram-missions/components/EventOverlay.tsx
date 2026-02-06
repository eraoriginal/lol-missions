'use client';

import { useEffect, useRef, useState } from 'react';
import type { RoomEvent } from '@/app/types/room';

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
    const [countdown, setCountdown] = useState(10);
    const hasAnnouncedRef = useRef(false);

    // TTS au mount
    useEffect(() => {
        if (hasAnnouncedRef.current) return;
        hasAnnouncedRef.current = true;

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const fullText = 'Événement spécial : ' + event.event.text;

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

                window.speechSynthesis.speak(utterance);
            }, 100);
        }
    }, [event.event.text]);

    // Auto-dismiss countdown
    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Dismiss quand le countdown atteint 0, en dehors du state updater
    useEffect(() => {
        if (countdown === 0) {
            onDismiss(event.id);
        }
    }, [countdown, event.id, onDismiss]);

    const diff = getDifficultyStyle(event.event.difficulty);

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
                        {event.event.text}
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

                {/* Dismiss button */}
                <button
                    onClick={() => onDismiss(event.id)}
                    className="mt-6 px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-all text-lg"
                >
                    Compris ({countdown}s)
                </button>
            </div>
        </div>
    );
}
