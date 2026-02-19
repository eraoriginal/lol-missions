'use client';

import { useEffect, useState, useRef } from 'react';
import type { PlayerMission } from '@/app/types/room';

const MISSION_OVERLAY_DURATION = 30;

interface MissionOverlayProps {
    mission: PlayerMission;
    type: 'START' | 'MID' | 'LATE';
    missionVisibility: 'all' | 'team' | 'hidden';
    onDismiss: () => void;
}

const typeLabels = {
    START: { icon: '⚔️', title: 'Nouvelle Mission', subtitle: 'Début de partie' },
    MID: { icon: '⚡', title: 'Mission MID', subtitle: 'Nouvelle mission débloquée' },
    LATE: { icon: '🔥', title: 'Mission Finale', subtitle: 'Dernière mission débloquée' },
};

function getOverlayTheme(difficulty: string, isPrivate: boolean) {
    if (isPrivate) {
        return {
            gradient: 'from-yellow-900/60 to-amber-950/60',
            border: 'border-yellow-500/50',
            shadow: 'shadow-yellow-500/20',
            titleColor: 'text-yellow-400',
            countdownColor: 'text-yellow-300',
            buttonBg: 'bg-yellow-600 hover:bg-yellow-700',
            diffBg: 'bg-yellow-600/80',
            diffText: 'text-yellow-100',
            diffLabel: 'Secrète',
            pointsBorder: 'border-yellow-500/30',
        };
    }
    switch (difficulty) {
        case 'easy':
            return {
                gradient: 'from-green-900/60 to-emerald-950/60',
                border: 'border-green-500/50',
                shadow: 'shadow-green-500/20',
                titleColor: 'text-green-400',
                countdownColor: 'text-green-300',
                buttonBg: 'bg-green-600 hover:bg-green-700',
                diffBg: 'bg-green-600/80',
                diffText: 'text-green-100',
                diffLabel: 'Facile',
                pointsBorder: 'border-green-500/30',
            };
        case 'hard':
            return {
                gradient: 'from-red-900/60 to-rose-950/60',
                border: 'border-red-500/50',
                shadow: 'shadow-red-500/20',
                titleColor: 'text-red-400',
                countdownColor: 'text-red-300',
                buttonBg: 'bg-red-600 hover:bg-red-700',
                diffBg: 'bg-red-600/80',
                diffText: 'text-red-100',
                diffLabel: 'Difficile',
                pointsBorder: 'border-red-500/30',
            };
        default: // medium
            return {
                gradient: 'from-blue-900/60 to-sky-950/60',
                border: 'border-blue-500/50',
                shadow: 'shadow-blue-500/20',
                titleColor: 'text-blue-400',
                countdownColor: 'text-blue-300',
                buttonBg: 'bg-blue-600 hover:bg-blue-700',
                diffBg: 'bg-blue-600/80',
                diffText: 'text-blue-100',
                diffLabel: 'Moyen',
                pointsBorder: 'border-blue-500/30',
            };
    }
}

export function MissionOverlay({ mission, type, missionVisibility, onDismiss }: MissionOverlayProps) {
    const [countdown, setCountdown] = useState(MISSION_OVERLAY_DURATION);
    const startTimeRef = useRef(0);

    const displayText = mission.resolvedText || mission.mission.text;
    const isPrivate = mission.mission.isPrivate && missionVisibility !== 'hidden';
    const labels = typeLabels[type];
    const theme = getOverlayTheme(mission.mission.difficulty, isPrivate);

    // Countdown client-side (pas de pause du timer)
    useEffect(() => {
        startTimeRef.current = Date.now();
        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            const remaining = Math.max(0, Math.ceil(MISSION_OVERLAY_DURATION - elapsed));
            setCountdown(remaining);
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Auto-dismiss quand le countdown atteint 0
    useEffect(() => {
        if (countdown === 0) {
            onDismiss();
        }
    }, [countdown, onDismiss]);

    return (
        <div className="fixed inset-0 z-[55] flex items-center justify-center bg-black/90 backdrop-blur-md">
            <div className="w-full max-w-lg px-4 text-center">
                {/* Header */}
                <div className="mb-6">
                    <div className="text-5xl mb-3 animate-bounce">{labels.icon}</div>
                    <h2 className={`text-3xl font-bold uppercase tracking-wider ${theme.titleColor}`}>
                        {labels.title}
                    </h2>
                    <p className="text-sm text-gray-400 mt-1">{labels.subtitle}</p>
                </div>

                {/* Mission card */}
                <div className={`bg-gradient-to-br ${theme.gradient} border-2 ${theme.border} rounded-xl p-8 shadow-lg ${theme.shadow}`}>
                    {isPrivate && (
                        <div className="mb-3 text-sm font-bold text-yellow-300 uppercase tracking-wider">
                            🔒 Mission Secrète
                        </div>
                    )}
                    <p className="text-xl text-white leading-relaxed mb-6">
                        {displayText}
                    </p>

                    <div className="flex items-center justify-center gap-3">
                        <span className={`text-sm px-3 py-1 rounded font-bold ${theme.diffBg} ${theme.diffText}`}>
                            {theme.diffLabel}
                        </span>
                        <span className={`text-sm font-bold ${theme.countdownColor} bg-black/30 px-3 py-1 rounded border ${theme.pointsBorder}`}>
                            +{mission.mission.points} pts
                        </span>
                    </div>
                </div>

                {/* Countdown et bouton dismiss */}
                <div className="mt-6 space-y-3">
                    <div className={`text-2xl font-bold font-mono ${theme.countdownColor}`}>
                        ⏱ {countdown}s
                    </div>
                    <button
                        onClick={onDismiss}
                        className={`px-8 py-3 ${theme.buttonBg} text-white font-bold rounded-lg transition-all text-lg`}
                    >
                        Compris
                    </button>
                </div>
            </div>
        </div>
    );
}
