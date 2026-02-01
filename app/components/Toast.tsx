'use client';

import { useEffect } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    onClose: () => void;
    duration?: number;
}

export function Toast({ message, type = 'info', onClose, duration = 5000 }: ToastProps) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    const colors = {
        success: 'bg-gradient-to-r from-green-600 to-green-700 border-green-500/50 shadow-green-500/30',
        error: 'bg-gradient-to-r from-red-600 to-red-700 border-red-500/50 shadow-red-500/30',
        warning: 'bg-gradient-to-r from-orange-600 to-orange-700 border-orange-500/50 shadow-orange-500/30',
        info: 'bg-gradient-to-r from-[#0AC8B9] to-[#0397AB] border-[#0AC8B9]/50 shadow-[#0AC8B9]/30',
    };

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    };

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className={`${colors[type]} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md border`}>
                <span className="text-2xl">{icons[type]}</span>
                <p className="flex-1 font-medium">{message}</p>
                <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
