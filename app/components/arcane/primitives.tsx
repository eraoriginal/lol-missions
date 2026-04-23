/**
 * Arcane.kit — primitives réutilisables.
 *
 * Portage TypeScript de `maquettes/assets/arcane-primitives.jsx`. Les composants
 * utilisent majoritairement des inline styles car ils embarquent des transforms,
 * clip-paths et filters SVG tightly couplés. Le layout autour (grilles, gaps)
 * reste en Tailwind dans les écrans qui les utilisent.
 */

'use client';

import type { CSSProperties, ReactNode } from 'react';
import {
  AC,
  AC_CLIP,
  AC_FONT_BODY,
  AC_FONT_DISPLAY_HEAVY,
  AC_FONT_MONO,
  type AcColor,
} from './tokens';

// ═══════════════════════════════════════════════════════════════
//  TITRES & TEXTE
// ═══════════════════════════════════════════════════════════════

interface AcHeadlineProps {
  children: ReactNode;
  size?: number;
  color?: string;
  weight?: number;
  paint?: 'none' | 'light' | 'heavy';
  shadow?: string;
  style?: CSSProperties;
}

export function AcHeadline({
  children,
  size = 56,
  color = AC.bone,
  weight = 700,
  paint = 'light',
  shadow,
  style = {},
}: AcHeadlineProps) {
  const filter =
    paint === 'heavy'
      ? 'url(#ac-paint-text-heavy)'
      : paint === 'none'
        ? 'none'
        : 'url(#ac-paint-text)';
  return (
    <span
      style={{
        fontFamily: AC_FONT_DISPLAY_HEAVY,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 0.92,
        letterSpacing: '-0.005em',
        color,
        textTransform: 'uppercase',
        display: 'inline-block',
        filter,
        textShadow: shadow || 'none',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** Titre hero — passe par le filtre `#ac-paint-text`. */
export function AcDisplay({
  children,
  size = 58,
  style = {},
}: {
  children: ReactNode;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <h1
      style={{
        fontFamily: AC_FONT_DISPLAY_HEAVY,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 0.92,
        letterSpacing: '-0.005em',
        textTransform: 'uppercase',
        color: AC.bone,
        filter: 'url(#ac-paint-text)',
        margin: 0,
        textWrap: 'balance',
        ...style,
      }}
    >
      {children}
    </h1>
  );
}

/** Accent inline dans un `<AcDisplay>` — couleur shimmer par défaut. */
export function AcShim({
  children,
  color = AC.shimmer,
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <span
      style={{
        color,
        filter: 'url(#ac-paint-text-heavy)',
        display: 'inline-block',
      }}
    >
      {children}
    </span>
  );
}

/** Variante graffiti du titre — avec `textShadow` décalé. */
export function AcGraffitiText({
  children,
  size = 58,
  color = AC.shimmer,
  shadow = AC.ink,
  style = {},
}: {
  children: ReactNode;
  size?: number;
  color?: string;
  shadow?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        fontFamily: AC_FONT_DISPLAY_HEAVY,
        fontWeight: 800,
        fontSize: size,
        lineHeight: 0.92,
        letterSpacing: '-0.005em',
        color,
        textTransform: 'uppercase',
        display: 'inline-block',
        filter: 'url(#ac-paint-text)',
        textShadow: `3px 3px 0 ${shadow}`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
//  DRIPS, SPLATS, EMOTES, GLYPHES
// ═══════════════════════════════════════════════════════════════

/** Bandeau de gouttes qui fusionnent, pleine largeur. */
export function AcDrip({
  color = AC.shimmer,
  height = 26,
  seed = 0,
}: {
  color?: string;
  height?: number;
  seed?: number;
}) {
  const drops = [
    { cx: 12, cy: 14, r: 6 },
    { cx: 34 + seed * 2, cy: 17, r: 5 },
    { cx: 58, cy: 13, r: 7 },
    { cx: 78 - seed, cy: 18, r: 4 },
    { cx: 92, cy: 15, r: 5 },
  ];
  return (
    <svg
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      style={{ width: '100%', height, display: 'block', pointerEvents: 'none' }}
    >
      <g filter="url(#ac-goo)" fill={color}>
        <rect x={-5} y={-5} width={110} height={10} />
        {drops.map((d, i) => (
          <circle key={i} cx={d.cx} cy={d.cy} r={d.r} />
        ))}
      </g>
    </svg>
  );
}

/** Splat de peinture — positionné en absolu par le parent. */
export function AcSplat({
  color = AC.violet,
  size = 260,
  opacity = 0.85,
  seed = 1,
  style = {},
}: {
  color?: string;
  size?: number;
  opacity?: number;
  seed?: number;
  style?: CSSProperties;
}) {
  const satellites = [
    { cx: 168, cy: 52, r: 14 },
    { cx: 42, cy: 46, r: 9 },
    { cx: 180, cy: 152, r: 11 },
    { cx: 28, cy: 150, r: 7 },
    { cx: 100, cy: 176, r: 15 },
  ];
  return (
    <svg
      viewBox="0 0 200 200"
      style={{
        width: size,
        height: size,
        opacity,
        pointerEvents: 'none',
        ...style,
      }}
      aria-hidden="true"
    >
      <g filter="url(#ac-paint-spread)">
        <ellipse cx={100} cy={100} rx={60 + seed * 3} ry={52} fill={color} />
        {satellites.map((s, i) => (
          <circle key={i} cx={s.cx + seed} cy={s.cy} r={s.r} fill={color} />
        ))}
      </g>
    </svg>
  );
}

/** Émoticône graffiti (`:-)`, `;-)`, `>:(`, etc.) rendue en SVG. */
export function AcEmote({
  face = ':-)',
  color = AC.bone,
  size = 44,
  style = {},
  title,
}: {
  face?: string;
  color?: string;
  size?: number;
  style?: CSSProperties;
  title?: string;
}) {
  return (
    <svg
      viewBox="0 0 120 80"
      style={{ width: Math.floor(size * 1.5), height: size, ...style }}
      role="img"
      aria-label={title || face}
    >
      <text
        x={60}
        y={58}
        textAnchor="middle"
        fontFamily="'Barlow Condensed', 'Bebas Neue', sans-serif"
        fontWeight={800}
        fontSize={44}
        fill={color}
        // Applique le filtre peint uniquement sur les émotes ≥ 24px où c'est
        // visible à l'œil. Les petites (toasts, cards de review) n'en profitent
        // pas mais payent le coût compositing — on les laisse « propres ».
        filter={size >= 24 ? 'url(#ac-rougher)' : undefined}
      >
        {face}
      </text>
    </svg>
  );
}

/**
 * Glyph stencil (stroke-based). Choisir un `kind` parmi la liste.
 * Note : on pourrait passer en discriminated union mais le simple `string`
 * suffit ici — si le kind est inconnu on fallback sur `plus`.
 */
export type AcGlyphKind =
  | 'plus'
  | 'x'
  | 'check'
  | 'ring'
  | 'dot'
  | 'arrowRight'
  | 'arrowLeft'
  | 'copy'
  | 'link'
  | 'play'
  | 'pause'
  | 'smoke'
  | 'bomb'
  | 'saber'
  | 'ice'
  | 'zoom'
  | 'tornado'
  | 'puzzle'
  | 'speed'
  | 'shield'
  | 'target'
  | 'flame'
  | 'snow'
  | 'thermometer'
  | 'image'
  | 'blur'
  | 'lightning';

export function AcGlyph({
  kind = 'plus',
  color = AC.bone,
  size = 22,
  stroke = 3,
  painted = false,
}: {
  kind?: AcGlyphKind;
  color?: string;
  size?: number;
  stroke?: number;
  /** Applique le filtre SVG « peint » sur le glyph. Off par défaut : trop
   * coûteux en compositing quand on en rend 20+ simultanément (chaque filter
   * ajoute un layer). Activer uniquement sur les glyphes « hero » de grande
   * taille où l'effet est visible. */
  painted?: boolean;
}) {
  const paths: Record<AcGlyphKind, ReactNode> = {
    plus: (
      <g>
        <line x1={20} y1={4} x2={20} y2={36} />
        <line x1={4} y1={20} x2={36} y2={20} />
      </g>
    ),
    x: (
      <g>
        <line x1={6} y1={6} x2={34} y2={34} />
        <line x1={34} y1={6} x2={6} y2={34} />
      </g>
    ),
    check: <polyline points="6,22 16,32 34,8" />,
    ring: <circle cx={20} cy={20} r={14} />,
    dot: <circle cx={20} cy={20} r={6} fill={color} />,
    arrowRight: (
      <g>
        <line x1={4} y1={20} x2={34} y2={20} />
        <polyline points="24,10 34,20 24,30" />
      </g>
    ),
    arrowLeft: (
      <g>
        <line x1={6} y1={20} x2={36} y2={20} />
        <polyline points="16,10 6,20 16,30" />
      </g>
    ),
    copy: (
      <g>
        <rect x={6} y={10} width={20} height={24} />
        <rect x={14} y={6} width={20} height={24} />
      </g>
    ),
    link: (
      <g>
        <path d="M12 24 L20 16" />
        <path d="M10 14 h8 v8" />
        <path d="M30 22 v8 h-8" />
      </g>
    ),
    play: <polygon points="12,8 32,20 12,32" fill={color} />,
    pause: (
      <g>
        <rect x={10} y={8} width={7} height={24} fill={color} />
        <rect x={23} y={8} width={7} height={24} fill={color} />
      </g>
    ),
    smoke: (
      <g>
        <circle cx={14} cy={24} r={6} />
        <circle cx={24} cy={16} r={7} />
        <circle cx={28} cy={28} r={5} />
      </g>
    ),
    bomb: (
      <g>
        <circle cx={20} cy={24} r={10} />
        <line x1={20} y1={14} x2={26} y2={6} />
        <circle cx={28} cy={4} r={2} fill={color} />
      </g>
    ),
    saber: (
      <g>
        <line x1={8} y1={32} x2={32} y2={8} />
        <line x1={28} y1={4} x2={36} y2={12} />
      </g>
    ),
    ice: (
      <g>
        <line x1={20} y1={4} x2={20} y2={36} />
        <line x1={4} y1={20} x2={36} y2={20} />
        <line x1={8} y1={8} x2={32} y2={32} />
        <line x1={32} y1={8} x2={8} y2={32} />
      </g>
    ),
    zoom: (
      <g>
        <circle cx={17} cy={17} r={10} />
        <line x1={25} y1={25} x2={34} y2={34} />
      </g>
    ),
    tornado: (
      <g>
        <path d="M4 8 L36 8" />
        <path d="M8 16 L32 16" />
        <path d="M12 24 L28 24" />
        <path d="M16 32 L24 32" />
      </g>
    ),
    puzzle: (
      <g>
        <rect x={4} y={4} width={14} height={14} />
        <rect x={22} y={4} width={14} height={14} />
        <rect x={4} y={22} width={14} height={14} />
        <rect x={22} y={22} width={14} height={14} />
      </g>
    ),
    speed: (
      <g>
        <polyline points="4,28 16,14 22,22 36,6" />
      </g>
    ),
    shield: (
      <path d="M20 4 L34 10 V22 C34 30 20 36 20 36 C20 36 6 30 6 22 V10 Z" />
    ),
    target: (
      <g>
        <circle cx={20} cy={20} r={14} />
        <circle cx={20} cy={20} r={7} />
        <circle cx={20} cy={20} r={2} fill={color} />
      </g>
    ),
    flame: (
      <path
        d="M20 4 C14 14 24 16 20 26 C16 30 10 28 10 22 C8 30 14 36 20 36 C28 36 32 30 30 22 C28 14 22 14 20 4 Z"
        fill={color}
      />
    ),
    snow: (
      <g>
        <line x1={20} y1={4} x2={20} y2={36} />
        <line x1={6} y1={12} x2={34} y2={28} />
        <line x1={6} y1={28} x2={34} y2={12} />
        <polyline points="16,8 20,12 24,8" />
        <polyline points="16,32 20,28 24,32" />
      </g>
    ),
    thermometer: (
      <g>
        <line x1={20} y1={6} x2={20} y2={28} />
        <circle cx={20} cy={32} r={5} fill={color} />
      </g>
    ),
    image: (
      <g>
        <rect x={4} y={6} width={32} height={28} />
        <polyline points="4,28 14,20 20,24 28,14 36,22" />
      </g>
    ),
    blur: (
      <g opacity={0.5}>
        <circle cx={20} cy={20} r={14} />
      </g>
    ),
    lightning: (
      <polygon
        points="22,4 10,22 18,22 14,36 30,16 22,16"
        fill={color}
      />
    ),
  };
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      style={{ display: 'block' }}
    >
      <g
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={painted ? 'url(#ac-rougher)' : undefined}
      >
        {paths[kind] ?? paths.plus}
      </g>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
//  BOUTON, TAMPON, ALERTE, CARTE
// ═══════════════════════════════════════════════════════════════

export type AcButtonVariant =
  | 'primary'
  | 'chem'
  | 'gold'
  | 'danger'
  | 'hex'
  | 'violet'
  | 'ghost'
  | 'ink';

export type AcSize = 'sm' | 'md' | 'lg';

interface AcButtonProps {
  variant?: AcButtonVariant;
  size?: AcSize;
  children: ReactNode;
  icon?: ReactNode;
  drip?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  style?: CSSProperties;
  'aria-label'?: string;
}

/** Bouton aux bords déchirés (clip-path), drip optionnel au-dessous. */
export function AcButton({
  variant = 'primary',
  size = 'md',
  children,
  icon,
  drip,
  fullWidth,
  disabled,
  onClick,
  type = 'button',
  style = {},
  'aria-label': ariaLabel,
}: AcButtonProps) {
  const variantBg: Record<AcButtonVariant, string> = {
    primary: AC.shimmer,
    chem: AC.chem,
    gold: AC.gold,
    danger: AC.rust,
    hex: AC.hex,
    violet: AC.violet,
    ghost: 'transparent',
    ink: AC.ink2,
  };
  const bg = variantBg[variant];
  const textColor =
    variant === 'danger' ||
    variant === 'violet' ||
    variant === 'ghost' ||
    variant === 'ink'
      ? AC.bone
      : AC.ink;
  const px = size === 'lg' ? 26 : size === 'sm' ? 12 : 20;
  const py = size === 'lg' ? 16 : size === 'sm' ? 7 : 12;
  const fs = size === 'lg' ? 18 : size === 'sm' ? 11 : 13;
  return (
    <div
      style={{
        position: 'relative',
        display: fullWidth ? 'block' : 'inline-block',
        ...style,
      }}
    >
      <button
        type={type}
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        style={{
          fontFamily: AC_FONT_DISPLAY_HEAVY,
          fontWeight: 700,
          fontSize: fs,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          padding: `${py}px ${px}px`,
          border: 'none',
          cursor: disabled ? 'not-allowed' : 'pointer',
          background: bg,
          color: textColor,
          clipPath: AC_CLIP,
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled ? 0.55 : 1,
          boxShadow:
            variant === 'ghost' ? `inset 0 0 0 2px ${AC.bone}` : 'none',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {icon}
        <span>{children}</span>
      </button>
      {drip && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: -22,
            height: 26,
            pointerEvents: 'none',
          }}
        >
          <AcDrip color={bg} seed={1} />
        </div>
      )}
    </div>
  );
}

/** Tampon posé avec scotch — mono uppercase en border dashed. */
export function AcStamp({
  children,
  color = AC.bone2,
  bg = 'transparent',
  rotate = 4,
  style = {},
}: {
  children: ReactNode;
  color?: string;
  bg?: string;
  rotate?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        fontFamily: AC_FONT_MONO,
        fontSize: 10,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color,
        background: bg,
        border: `1.5px dashed ${color}`,
        padding: '6px 10px',
        transform: `rotate(${rotate}deg)`,
        display: 'inline-block',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** Séparateur horizontal pointillé. */
export function AcDashed({
  color = AC.bone2,
  style = {},
}: {
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        height: 0,
        borderTop: `1.5px dashed ${color}`,
        opacity: 0.6,
        ...style,
      }}
    />
  );
}

/** Jauge peinte — la tête bave vers la droite grâce au filtre goo. */
export function AcPaintedBar({
  value = 0.6,
  color = AC.chem,
  height = 18,
  style = {},
}: {
  value?: number;
  color?: string;
  height?: number;
  style?: CSSProperties;
}) {
  const pct = Math.max(0, Math.min(1, value));
  const w = pct * 100;
  return (
    <div
      style={{
        position: 'relative',
        height,
        background: 'rgba(240,228,193,0.06)',
        border: `1px solid ${AC.bone2}`,
        overflow: 'visible',
        ...style,
      }}
    >
      <svg
        viewBox="0 0 100 18"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
        <g filter="url(#ac-goo)" fill={color}>
          <rect x={0} y={3} width={Math.max(0, w - 2)} height={12} />
          {w > 2 && <circle cx={w} cy={9} r={5} />}
          {w > 8 && <circle cx={w - 4} cy={13} r={3} />}
        </g>
      </svg>
    </div>
  );
}

export type AcAlertTone =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'shimmer';

/** Alerte à ruban (bande colorée à gauche) + scotch optionnel en haut à droite. */
export function AcAlert({
  tone = 'warning',
  children,
  tape,
  style = {},
}: {
  tone?: AcAlertTone;
  children: ReactNode;
  tape?: string;
  style?: CSSProperties;
}) {
  const toneColor: Record<AcAlertTone, string> = {
    success: AC.chem,
    warning: AC.gold,
    danger: AC.rust,
    info: AC.hex,
    shimmer: AC.shimmer,
  };
  const toneBg: Record<AcAlertTone, string> = {
    success: 'rgba(18,214,168,0.10)',
    warning: 'rgba(245,185,18,0.10)',
    danger: 'rgba(200,68,30,0.14)',
    info: 'rgba(94,184,255,0.10)',
    shimmer: 'rgba(255,61,139,0.10)',
  };
  return (
    <div
      style={{
        position: 'relative',
        padding: '12px 14px 12px 18px',
        borderLeft: `6px solid ${toneColor[tone]}`,
        background: toneBg[tone],
        color: AC.bone,
        fontFamily: AC_FONT_MONO,
        fontSize: 12,
        ...style,
      }}
    >
      {tape && (
        <span
          style={{
            position: 'absolute',
            top: -9,
            right: 14,
            background: AC.gold,
            color: AC.ink,
            fontFamily: AC_FONT_MONO,
            fontSize: 9,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            padding: '3px 8px',
            transform: 'rotate(-2deg)',
          }}
        >
          {tape}
        </span>
      )}
      {children}
    </div>
  );
}

/** Carte avec coin plié + option drip. */
export function AcCard({
  children,
  fold = true,
  dashed = false,
  drip = false,
  dripColor = AC.shimmer,
  style = {},
}: {
  children: ReactNode;
  fold?: boolean;
  dashed?: boolean;
  drip?: boolean;
  dripColor?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #1A160F 0%, #0D0B08 100%)',
        padding: 18,
        overflow: 'visible',
        boxShadow: dashed ? 'none' : `inset 0 0 0 1.5px ${AC.bone}`,
        border: dashed ? `1.5px dashed ${AC.bone2}` : 'none',
        ...style,
      }}
    >
      {fold && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '0 22px 22px 0',
            borderColor: `transparent ${AC.bone} transparent transparent`,
            zIndex: 2,
          }}
          aria-hidden="true"
        />
      )}
      {children}
      {drip && (
        <div
          style={{
            position: 'absolute',
            left: 10,
            right: 10,
            bottom: -20,
            height: 24,
          }}
        >
          <AcDrip color={dripColor} seed={2} />
        </div>
      )}
    </div>
  );
}

/** Badge numéro de section mono vert, façon « 01 ». */
export function AcSectionNum({ n }: { n: number | string }) {
  const label =
    typeof n === 'number' ? String(n).padStart(2, '0') : n.toUpperCase();
  return (
    <span
      style={{
        fontFamily: AC_FONT_MONO,
        fontSize: 11,
        letterSpacing: '0.2em',
        color: AC.chem,
        background: 'rgba(18,214,168,0.12)',
        border: `1px solid ${AC.chem}`,
        padding: '3px 7px',
      }}
    >
      {label}
    </span>
  );
}

/** Séparateur pointillé avec label mono au milieu. */
export function AcDottedLabel({
  children,
  color = AC.bone2,
  style = {},
}: {
  children: ReactNode;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 10, color, ...style }}
    >
      <div
        style={{ flex: 1, borderTop: `1.5px dashed ${color}`, opacity: 0.5 }}
      />
      <span
        style={{
          fontFamily: AC_FONT_MONO,
          fontSize: 10,
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
        }}
      >
        {children}
      </span>
      <div
        style={{ flex: 1, borderTop: `1.5px dashed ${color}`, opacity: 0.5 }}
      />
    </div>
  );
}

/** Mini avatar — disque coloré + initiales. Halo optionnel. */
export function AcAvatar({
  name = 'AA',
  color = AC.shimmer,
  size = 36,
  halo,
}: {
  name?: string;
  color?: string;
  size?: number;
  halo?: string;
}) {
  const initials = name
    .split(' ')
    .map((s) => s[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {halo && (
        <div
          style={{
            position: 'absolute',
            inset: -5,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${halo}66 0%, transparent 70%)`,
          }}
          aria-hidden="true"
        />
      )}
      <div
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          background: color,
          color: AC.ink,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: AC_FONT_DISPLAY_HEAVY,
          fontWeight: 800,
          fontSize: size * 0.42,
          boxShadow: `inset 0 0 0 2px ${AC.ink}`,
        }}
      >
        {initials}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ÉCRAN RACINE
// ═══════════════════════════════════════════════════════════════

/**
 * Conteneur de page — fond violet chaud avec glows rust + chem, grain + hachures.
 * Les écrans sont ensuite rendus à l'intérieur avec leurs propres grilles.
 */
export function AcScreen({
  children,
  style = {},
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        background:
          'radial-gradient(ellipse at 20% 10%, #3A2D4A 0%, #2A1E3A 35%, #1F1830 75%, #1A1428 100%)',
        color: AC.bone,
        fontFamily: AC_FONT_BODY,
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* warm rust glow bottom-right */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 90% 95%, rgba(200,68,30,0.18) 0%, transparent 45%)',
        }}
        aria-hidden="true"
      />
      {/* chem teal glow bottom-left */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 5% 90%, rgba(18,214,168,0.10) 0%, transparent 40%)',
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent 0 3px, rgba(240,228,193,0.025) 3px 4px)',
        }}
        aria-hidden="true"
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(240,228,193,0.05) 1px, transparent 1px)',
          backgroundSize: '3px 3px',
          mixBlendMode: 'overlay',
        }}
        aria-hidden="true"
      />
      <div style={{ position: 'relative', width: '100%', minHeight: '100vh' }}>
        {children}
      </div>
    </div>
  );
}

// Re-export tokens pour confort d'import
export { AC, type AcColor, AC_CLIP, AC_FONT_MONO, AC_FONT_DISPLAY_HEAVY, AC_FONT_BODY };
