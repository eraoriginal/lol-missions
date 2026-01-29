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
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-orange-500',
        info: 'bg-blue-500',
    };

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ',
    };

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
            <div className={`${colors[type]} text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[300px] max-w-md`}>
                <span className="text-2xl">{icons[type]}</span>
                <p className="flex-1">{message}</p>
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