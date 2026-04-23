/**
 * Arcane.kit — design tokens.
 *
 * Palette, typo et clip-path. Source : `maquettes/assets/arcane-primitives.jsx`.
 * Les CSS variables correspondantes sont dans `globals.css` (`--ac-*`).
 */

export const AC = {
  ink: '#0D0B08',
  ink2: '#1A160F',
  bone: '#F0E4C1',
  bone2: '#C9BB94',
  chem: '#12D6A8',
  hex: '#5EB8FF',
  shimmer: '#FF3D8B',
  gold: '#F5B912',
  rust: '#C8441E',
  violet: '#8A3DD4',
} as const;

export type AcColor = (typeof AC)[keyof typeof AC];

/** Typographies — toutes chargées via next/font/google dans `layout.tsx`. */
export const AC_FONT_DISPLAY =
  "'Bebas Neue', 'Barlow Condensed', 'Helvetica Neue', sans-serif";
export const AC_FONT_DISPLAY_HEAVY =
  "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif";
export const AC_FONT_BODY =
  "'Inter', 'Helvetica Neue', Arial, sans-serif";
export const AC_FONT_MONO =
  "'JetBrains Mono', 'Courier New', monospace";

/**
 * Clip-path irrégulier appliqué aux boutons et swatches pour obtenir des bords
 * « arrachés » à la peinture. Stable (pas de random) pour éviter de rompre la
 * continuité visuelle entre deux renders.
 */
export const AC_CLIP =
  'polygon(3% 10%, 12% 0, 30% 8%, 55% 2%, 78% 10%, 98% 4%, 100% 40%, 97% 75%, 99% 100%, 80% 96%, 55% 100%, 30% 94%, 10% 100%, 1% 88%, 2% 50%)';

/** Clip-path pour le cadre peint de l'image (maquette). */
export const AC_IMAGE_FRAME_CLIP =
  'polygon(1% 4%, 4% 1%, 20% 3%, 50% 1%, 78% 4%, 98% 2%, 99% 20%, 97% 55%, 99% 82%, 96% 99%, 70% 97%, 40% 99%, 12% 97%, 2% 99%, 1% 80%, 3% 40%)';
