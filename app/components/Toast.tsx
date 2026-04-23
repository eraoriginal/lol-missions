'use client';

import {
    AC,
    AcGlyph,
    AcToast,
    AcToastStack,
    type AcToastTone,
} from './arcane';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'warning' | 'info';
    onClose: () => void;
    duration?: number;
}

/**
 * Wrapper backcompat autour de `AcToast` — conserve l'API simple
 * `message/type/onClose/duration` utilisée par les call-sites existants
 * (LeaveRoomButton, room/[code]/page.tsx, etc.).
 *
 * Pour les toasts riches avec titre + sous-titre + tape + drip, utiliser
 * directement `AcToast` depuis `@/app/components/arcane`.
 */
export function Toast({
    message,
    type = 'info',
    onClose,
    duration = 5000,
}: ToastProps) {
    const toneMap: Record<NonNullable<ToastProps['type']>, AcToastTone> = {
        success: 'success',
        error: 'danger',
        warning: 'warning',
        info: 'info',
    };
    const iconKindMap: Record<NonNullable<ToastProps['type']>, 'check' | 'x' | 'flame' | 'ring'> = {
        success: 'check',
        error: 'x',
        warning: 'flame',
        info: 'ring',
    };
    const iconColorMap: Record<NonNullable<ToastProps['type']>, string> = {
        success: AC.chem,
        error: AC.rust,
        warning: AC.gold,
        info: AC.hex,
    };
    const tone = toneMap[type];

    return (
        <AcToastStack>
            <AcToast
                tone={tone}
                title={message}
                tape={type === 'error' ? '// ERREUR' : '// SYSTÈME'}
                icon={<AcGlyph kind={iconKindMap[type]} color={iconColorMap[type]} size={22} stroke={3} />}
                duration={duration}
                onClose={onClose}
                drip={type === 'success'}
            />
        </AcToastStack>
    );
}
