'use client';

import type { CSSProperties, ReactNode } from 'react';
import { AC, AC_FONT_MONO } from './tokens';
import { AcDrip } from './primitives';

/** Clip-path irrégulier pour la carte modale — différent d'AC_CLIP (plus rond). */
export const AC_MODAL_CLIP =
  'polygon(2% 6%, 8% 1%, 25% 4%, 50% 1%, 76% 4%, 94% 2%, 99% 12%, 97% 45%, 99% 78%, 96% 98%, 75% 96%, 50% 99%, 28% 96%, 8% 99%, 1% 82%, 3% 40%)';

/**
 * Backdrop semi-transparent pour modales — dim + blur subtil pour faire passer
 * au second plan le lobby/playing qui reste partiellement visible.
 *
 * Positionné en `absolute inset:0`, doit être rendu à l'intérieur d'un `AcScreen`
 * (ou équivalent) pour couvrir uniquement l'écran courant.
 */
export function AcModalDim({
  children,
  intensity = 0.78,
  style = {},
  onClick,
}: {
  children?: ReactNode;
  intensity?: number;
  style?: CSSProperties;
  /** Clic sur le backdrop — typiquement utilisé pour fermer la modale.
   *  Les enfants (AcModalCard) doivent stopPropagation pour ne pas trigger. */
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? -1 : undefined}
      style={{
        position: 'fixed',
        inset: 0,
        background: `rgba(13,11,8,${intensity})`,
        backdropFilter: 'blur(6px) saturate(0.9)',
        WebkitBackdropFilter: 'blur(6px) saturate(0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        zIndex: 50,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * Carte modale avec clip-path « peint », drip de couleur en haut, et étiquette
 * « tape » optionnelle en haut-droite (rotation -3°). À utiliser dans une
 * `<AcModalDim>` pour les confirmations / dialogues / écrans focalisés.
 */
export function AcModalCard({
  children,
  width = 520,
  tone = AC.shimmer,
  tapeLabel,
  style = {},
  onClick,
}: {
  children: ReactNode;
  /** Largeur maximale ; passer une string `'100%'` pour mobile plein écran. */
  width?: number | string;
  /** Couleur du drip en haut + accent ; aide à signaler la gravité (rust/gold/chem). */
  tone?: string;
  /** Étiquette scotchée en haut-droite (ex : `// CONFIRMATION`, `// CRÉATEUR`). */
  tapeLabel?: string;
  style?: CSSProperties;
  /** Si fourni, stopPropagation du clic — typiquement utilisé pour ne pas fermer
   *  la modale quand on clique dans la carte. */
  onClick?: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        width,
        maxWidth: '100%',
        background: 'linear-gradient(180deg, #1A160F 0%, #0D0B08 100%)',
        color: AC.bone,
        clipPath: AC_MODAL_CLIP,
        padding: '36px 34px 34px',
        boxShadow: `inset 0 0 0 2px ${AC.bone}`,
        ...style,
      }}
    >
      {/* Drip coloré en haut : signale le ton de la modale (danger/gold/chem/…) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 20,
          right: 20,
          height: 10,
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        <AcDrip color={tone} height={10} seed={2} />
      </div>
      {tapeLabel && (
        <span
          style={{
            position: 'absolute',
            top: 14,
            right: 22,
            fontFamily: AC_FONT_MONO,
            fontSize: 10,
            letterSpacing: '0.22em',
            color: AC.bone2,
            border: `1.5px dashed ${AC.bone2}`,
            padding: '3px 8px',
            transform: 'rotate(-3deg)',
            textTransform: 'uppercase',
            background: AC.ink,
          }}
        >
          {tapeLabel}
        </span>
      )}
      {children}
    </div>
  );
}
