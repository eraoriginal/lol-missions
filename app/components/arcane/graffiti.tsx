/**
 * Arcane.kit — tags graffiti + couche de décor.
 *
 * 15 glyphes inspirés des murs de Zaun (Jinx) + un `AcGraffitiLayer` qui les
 * dispose en coins d'écran pour laisser le centre respirant. Portage TS de
 * `maquettes/assets/arcane-primitives.jsx`.
 */

'use client';

import type { CSSProperties } from 'react';
import { AC } from './tokens';

// ---------- Glyphes individuels ---------------------------------------------

export function AcStar({
  color = AC.shimmer,
  size = 60,
  filled = true,
  stroke = 3,
  rotate = 0,
  style = {},
}: {
  color?: string;
  size?: number;
  filled?: boolean;
  stroke?: number;
  rotate?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
    >
      <polygon
        points="50,6 61,38 96,40 68,60 78,94 50,74 22,94 32,60 4,40 39,38"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={stroke}
        strokeLinejoin="round"
        filter="url(#ac-rougher)"
      />
    </svg>
  );
}

export function AcHeart({
  color = AC.shimmer,
  size = 50,
  filled = false,
  stroke = 4,
  rotate = 0,
  style = {},
}: {
  color?: string;
  size?: number;
  filled?: boolean;
  stroke?: number;
  rotate?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
    >
      <path
        d="M50 86 C 10 60 10 30 30 22 C 42 18 50 28 50 36 C 50 28 58 18 70 22 C 90 30 90 60 50 86 Z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={stroke}
        strokeLinejoin="round"
        filter="url(#ac-rougher)"
      />
    </svg>
  );
}

export function AcCrown({
  color = AC.gold,
  size = 50,
  stroke = 3,
  style = {},
}: {
  color?: string;
  size?: number;
  stroke?: number;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 100 60" width={size} height={size * 0.6} style={style}>
      <g
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinejoin="round"
        strokeLinecap="round"
        filter="url(#ac-rougher)"
      >
        <polyline points="8,50 8,20 28,34 50,8 72,34 92,20 92,50" />
        <line x1={8} y1={50} x2={92} y2={50} />
        <circle cx={8} cy={16} r={3} fill={color} />
        <circle cx={50} cy={4} r={3} fill={color} />
        <circle cx={92} cy={16} r={3} fill={color} />
      </g>
    </svg>
  );
}

export function AcCloudTat({
  color = AC.hex,
  size = 80,
  style = {},
}: {
  color?: string;
  size?: number;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 120 80" width={size} height={size * 0.66} style={style}>
      <g
        fill="none"
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
        filter="url(#ac-rougher)"
      >
        <path d="M20 50 Q 10 30 30 28 Q 40 12 55 22 Q 70 10 85 22 Q 105 20 100 40 Q 110 52 92 58 Q 85 72 65 66 Q 50 76 38 62 Q 22 66 20 50 Z" />
        <circle cx={40} cy={40} r={6} />
        <circle cx={70} cy={36} r={5} />
        <circle cx={58} cy={52} r={4} />
      </g>
    </svg>
  );
}

export function AcSpray({
  color = AC.shimmer,
  size = 120,
  seed = 1,
  style = {},
}: {
  color?: string;
  size?: number;
  seed?: number;
  style?: CSSProperties;
}) {
  // Déterministe : hash entier (xxhash-like) — `Math.sin` à grandes valeurs
  // diverge légèrement entre Node et V8 du navigateur et casse l'hydratation.
  const rand = (n: number) => {
    let x = ((n + seed) | 0) + 0x9e3779b9;
    x = Math.imul(x ^ (x >>> 16), 0x85ebca6b);
    x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35);
    x = x ^ (x >>> 16);
    return (x >>> 0) / 4294967296;
  };
  const shards: string[] = [];
  for (let i = 0; i < 18; i++) {
    const cx = 10 + rand(i) * 100;
    const cy = 10 + rand(i + 99) * 100;
    const s = 2 + rand(i + 33) * 5;
    shards.push(`${cx},${cy - s} ${cx + s},${cy + s} ${cx - s},${cy + s}`);
  }
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      style={{ pointerEvents: 'none', ...style }}
    >
      <g fill={color} filter="url(#ac-paint-spread)">
        <polygon points="60,36 76,56 72,82 48,86 38,62 46,42" opacity={0.85} />
        {shards.map((pts, i) => (
          <polygon key={i} points={pts} opacity={0.4 + rand(i) * 0.5} />
        ))}
      </g>
    </svg>
  );
}

export function AcCrossTag({
  color = AC.rust,
  size = 50,
  stroke = 5,
  rotate = 0,
  style = {},
}: {
  color?: string;
  size?: number;
  stroke?: number;
  rotate?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 60 60"
      width={size}
      height={size}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
    >
      <g
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        filter="url(#ac-rougher)"
      >
        <line x1={8} y1={8} x2={52} y2={52} />
        <line x1={52} y1={8} x2={8} y2={52} />
      </g>
    </svg>
  );
}

export function AcArrowTag({
  color = AC.chem,
  size = 120,
  stroke = 4,
  flip = false,
  style = {},
}: {
  color?: string;
  size?: number;
  stroke?: number;
  flip?: boolean;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 160 60"
      width={size}
      height={size * 0.375}
      style={{ transform: `scaleX(${flip ? -1 : 1})`, ...style }}
    >
      <g
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#ac-rougher)"
      >
        <path d="M8 36 Q 40 10 80 30 Q 110 44 140 24" />
        <polyline points="125,16 140,24 132,38" />
      </g>
    </svg>
  );
}

export function AcBoltTag({
  color = AC.gold,
  size = 60,
  rotate = 0,
  style = {},
}: {
  color?: string;
  size?: number;
  rotate?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 60 80"
      width={size * 0.75}
      height={size}
      style={{ transform: `rotate(${rotate}deg)`, ...style }}
    >
      <polygon
        points="32,4 6,44 24,44 18,76 52,30 32,30 40,4"
        fill={color}
        stroke={AC.ink}
        strokeWidth={1.5}
        strokeLinejoin="round"
        filter="url(#ac-rougher)"
      />
    </svg>
  );
}

export function AcZigzag({
  color = AC.violet,
  size = 120,
  stroke = 4,
  style = {},
}: {
  color?: string;
  size?: number;
  stroke?: number;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 160 60"
      width={size}
      height={size * 0.375}
      style={style}
    >
      <polyline
        points="6,40 24,14 42,40 60,14 78,40 96,14 114,40 132,14 154,36"
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#ac-rougher)"
      />
    </svg>
  );
}

export function AcBurst({
  color = AC.chem,
  size = 80,
  stroke = 3,
  style = {},
}: {
  color?: string;
  size?: number;
  stroke?: number;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} style={style}>
      <g
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        fill="none"
        filter="url(#ac-rougher)"
      >
        <line x1={40} y1={4} x2={40} y2={22} />
        <line x1={40} y1={58} x2={40} y2={76} />
        <line x1={4} y1={40} x2={22} y2={40} />
        <line x1={58} y1={40} x2={76} y2={40} />
        <line x1={12} y1={12} x2={26} y2={26} />
        <line x1={54} y1={54} x2={68} y2={68} />
        <line x1={68} y1={12} x2={54} y2={26} />
        <line x1={12} y1={68} x2={26} y2={54} />
      </g>
      <polygon
        points="40,28 48,40 40,52 32,40"
        fill={color}
        filter="url(#ac-rougher)"
      />
    </svg>
  );
}

export function AcTriangle({
  color = AC.hex,
  size = 70,
  stroke = 3,
  filled = true,
  style = {},
}: {
  color?: string;
  size?: number;
  stroke?: number;
  filled?: boolean;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} style={style}>
      <polygon
        points="40,8 72,68 8,68"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={stroke}
        strokeLinejoin="round"
        filter="url(#ac-rougher)"
      />
    </svg>
  );
}

export function AcHash({
  color = AC.gold,
  size = 60,
  stroke = 4,
  style = {},
}: {
  color?: string;
  size?: number;
  stroke?: number;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={style}>
      <g
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        filter="url(#ac-rougher)"
      >
        <line x1={10} y1={52} x2={30} y2={8} />
        <line x1={22} y1={52} x2={42} y2={8} />
        <line x1={34} y1={52} x2={54} y2={8} />
      </g>
    </svg>
  );
}

export function AcChevron({
  color = AC.shimmer,
  size = 70,
  stroke = 4,
  style = {},
}: {
  color?: string;
  size?: number;
  stroke?: number;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} style={style}>
      <g
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#ac-rougher)"
      >
        <polyline points="10,20 40,40 70,20" />
        <polyline points="10,40 40,60 70,40" />
        <polyline points="10,60 40,80 70,60" />
      </g>
    </svg>
  );
}

export function AcDiamond({
  color = AC.chem,
  size = 60,
  stroke = 4,
  filled = false,
  style = {},
}: {
  color?: string;
  size?: number;
  stroke?: number;
  filled?: boolean;
  style?: CSSProperties;
}) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={style}>
      <polygon
        points="30,4 56,30 30,56 4,30"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={stroke}
        strokeLinejoin="round"
        filter="url(#ac-rougher)"
      />
    </svg>
  );
}

export function AcScribble({
  color = AC.shimmer,
  size = 160,
  stroke = 4,
  seed = 1,
  style = {},
}: {
  color?: string;
  size?: number;
  stroke?: number;
  seed?: number;
  style?: CSSProperties;
}) {
  const paths = [
    'M10 40 Q 30 10 60 40 T 110 30 T 150 50',
    'M8 30 Q 40 50 70 20 T 140 40 T 155 20',
    'M12 50 Q 50 20 80 50 T 148 30',
  ];
  return (
    <svg viewBox="0 0 160 60" width={size} height={size * 0.375} style={style}>
      <path
        d={paths[seed % paths.length]}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        filter="url(#ac-rougher)"
      />
    </svg>
  );
}

// ---------- Couche de graffitis en fond -------------------------------------

type TagType =
  | 'star'
  | 'heart'
  | 'crown'
  | 'cloud'
  | 'spray'
  | 'cross'
  | 'arrow'
  | 'bolt'
  | 'zigzag'
  | 'burst'
  | 'triangle'
  | 'hash'
  | 'chevron'
  | 'diamond'
  | 'scribble';

interface TagItem {
  type: TagType;
  x: string;
  y: string;
  size: number;
  rot?: number;
  color: string;
  opacity: number;
  seed?: number;
}

/**
 * Décors graffiti positionnés en coins uniquement — densité « normal » pose
 * 5 items, « heavy » en ajoute 2. Le centre 60% de l'écran reste toujours libre
 * pour que le texte ne passe pas dessus.
 */
export function AcGraffitiLayer({
  density = 'normal',
  palette,
  style = {},
}: {
  density?: 'normal' | 'heavy';
  palette?: readonly string[];
  style?: CSSProperties;
}) {
  const pal =
    palette ?? [AC.shimmer, AC.hex, AC.chem, AC.violet, AC.gold];
  const items: TagItem[] = [
    { type: 'triangle', x: '94%', y: '4%', size: 54, rot: 14, color: pal[1], opacity: 0.35 },
    { type: 'hash', x: '88%', y: '12%', size: 44, rot: 8, color: pal[4], opacity: 0.30 },
    { type: 'star', x: '4%', y: '94%', size: 50, rot: -10, color: pal[0], opacity: 0.35 },
    { type: 'zigzag', x: '14%', y: '88%', size: 130, rot: 4, color: pal[3], opacity: 0.22 },
    { type: 'diamond', x: '96%', y: '92%', size: 40, rot: 0, color: pal[2], opacity: 0.30 },
  ];
  const extra: TagItem[] =
    density === 'heavy'
      ? [
          { type: 'chevron', x: '92%', y: '30%', size: 50, rot: 0, color: pal[2], opacity: 0.25 },
          { type: 'cross', x: '7%', y: '74%', size: 32, rot: -6, color: pal[4], opacity: 0.30 },
        ]
      : [];
  const all = [...items, ...extra];

  const render = (it: TagItem, i: number) => {
    const wrap: CSSProperties = {
      position: 'absolute',
      left: it.x,
      top: it.y,
      opacity: it.opacity,
      transform: `translate(-50%,-50%) rotate(${it.rot ?? 0}deg)`,
      pointerEvents: 'none',
    };
    let el: React.ReactNode = null;
    switch (it.type) {
      case 'star':
        el = <AcStar color={it.color} size={it.size} filled={i % 2 === 0} />;
        break;
      case 'heart':
        el = <AcHeart color={it.color} size={it.size} filled={i % 3 === 0} />;
        break;
      case 'crown':
        el = <AcCrown color={it.color} size={it.size} />;
        break;
      case 'cloud':
        el = <AcCloudTat color={it.color} size={it.size} />;
        break;
      case 'spray':
        el = <AcSpray color={it.color} size={it.size} seed={it.seed ?? 1} />;
        break;
      case 'cross':
        el = <AcCrossTag color={it.color} size={it.size} />;
        break;
      case 'arrow':
        el = <AcArrowTag color={it.color} size={it.size} />;
        break;
      case 'bolt':
        el = <AcBoltTag color={it.color} size={it.size} />;
        break;
      case 'zigzag':
        el = <AcZigzag color={it.color} size={it.size} />;
        break;
      case 'burst':
        el = <AcBurst color={it.color} size={it.size} />;
        break;
      case 'triangle':
        el = <AcTriangle color={it.color} size={it.size} filled={i % 2 === 0} />;
        break;
      case 'hash':
        el = <AcHash color={it.color} size={it.size} />;
        break;
      case 'chevron':
        el = <AcChevron color={it.color} size={it.size} />;
        break;
      case 'diamond':
        el = <AcDiamond color={it.color} size={it.size} filled={i % 2 === 1} />;
        break;
      case 'scribble':
        el = <AcScribble color={it.color} size={it.size} seed={it.seed ?? i} />;
        break;
    }
    return (
      <div key={i} style={wrap}>
        {el}
      </div>
    );
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        ...style,
      }}
      aria-hidden="true"
    >
      {all.map(render)}
    </div>
  );
}
