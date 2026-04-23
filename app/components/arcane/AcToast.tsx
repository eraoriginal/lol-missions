'use client';

import { useEffect } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  AC,
  AC_FONT_BODY,
  AC_FONT_DISPLAY_HEAVY,
  AC_FONT_MONO,
} from './tokens';
import { AcDrip } from './primitives';

export type AcToastTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'shimmer'
  | 'violet';

/**
 * Toast riche — titre gras, sous-titre mono optionnel, icône, étiquette « tape »
 * et drip optionnel. Design issu de `maquettes/screens/modals.jsx::Toast`.
 *
 * Auto-dismiss si `duration > 0` (ms). Passe `duration={0}` pour persistant.
 */
export function AcToast({
  tone = 'success',
  title,
  subtitle,
  icon,
  tape,
  drip = false,
  dismissable = true,
  duration = 0,
  onClose,
  style = {},
}: {
  tone?: AcToastTone;
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ReactNode;
  tape?: string;
  drip?: boolean;
  dismissable?: boolean;
  duration?: number;
  onClose?: () => void;
  style?: CSSProperties;
}) {
  useEffect(() => {
    if (!duration || duration <= 0 || !onClose) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [duration, onClose]);

  const toneMap: Record<AcToastTone, { col: string; onCol: string }> = {
    success: { col: AC.chem, onCol: AC.ink },
    warning: { col: AC.gold, onCol: AC.ink },
    danger: { col: AC.rust, onCol: AC.bone },
    info: { col: AC.hex, onCol: AC.ink },
    shimmer: { col: AC.shimmer, onCol: AC.ink },
    violet: { col: AC.violet, onCol: AC.bone },
  };
  const { col, onCol } = toneMap[tone];

  return (
    <div
      className="ac-slide-in pointer-events-auto"
      style={{
        position: 'relative',
        width: 380,
        maxWidth: '100%',
        background: 'linear-gradient(180deg, #1A160F 0%, #0F0C07 100%)',
        borderLeft: `5px solid ${col}`,
        boxShadow: `inset 0 0 0 1px rgba(240,228,193,0.15), 4px 6px 0 ${AC.ink}`,
        padding: '12px 36px 12px 14px',
        color: AC.bone,
        ...style,
      }}
      role="status"
    >
      {tape && (
        <span
          style={{
            position: 'absolute',
            top: -8,
            left: 14,
            background: col,
            color: onCol,
            fontFamily: AC_FONT_MONO,
            fontSize: 9,
            letterSpacing: '0.22em',
            padding: '3px 8px',
            transform: 'rotate(-2deg)',
            textTransform: 'uppercase',
          }}
        >
          {tape}
        </span>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        {icon && <div style={{ flexShrink: 0, marginTop: 1 }}>{icon}</div>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: AC_FONT_DISPLAY_HEAVY,
              fontWeight: 700,
              fontSize: 15,
              letterSpacing: '0.02em',
              lineHeight: 1.15,
              color: AC.bone,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontFamily: AC_FONT_MONO,
                fontSize: 11,
                letterSpacing: '0.08em',
                color: AC.bone2,
                marginTop: 3,
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
        {dismissable && onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: AC.bone2,
              padding: 4,
              lineHeight: 0,
              fontFamily: AC_FONT_BODY,
              fontSize: 14,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {drip && (
        <div
          style={{
            position: 'absolute',
            left: 12,
            right: 36,
            bottom: -10,
            height: 12,
            pointerEvents: 'none',
          }}
          aria-hidden="true"
        >
          <AcDrip color={col} height={12} seed={3} />
        </div>
      )}
    </div>
  );
}

/**
 * Stack de toasts en haut-droite de l'écran — conteneur positionné en
 * `fixed top:22 right:22`. Les toasts passés en children s'empilent verticalement.
 */
export function AcToastStack({
  children,
  position = 'top-right',
}: {
  children: ReactNode;
  position?: 'top-right' | 'top-center';
}) {
  const pos: CSSProperties =
    position === 'top-center'
      ? { top: 22, left: '50%', transform: 'translateX(-50%)' }
      : { top: 22, right: 22 };
  return (
    <div
      style={{
        position: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        zIndex: 60,
        maxWidth: 400,
        pointerEvents: 'none',
        ...pos,
      }}
    >
      {children}
    </div>
  );
}
