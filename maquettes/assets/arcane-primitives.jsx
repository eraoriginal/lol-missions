// Arcane primitives — shared across all screens.
// Export each component to window at the bottom so other Babel scripts can use them.

const AC = {
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
};

// One-time SVG defs — include once per document.
function ArcanePaintDefs() {
  return (
    <svg width="0" height="0" style={{position:'absolute', pointerEvents:'none'}} aria-hidden="true">
      <defs>
        <filter id="ac-rough" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5"/>
        </filter>
        <filter id="ac-rougher" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="3" seed="3" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="10"/>
        </filter>
        <filter id="ac-paint-spread" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="1"/>
          <feDisplacementMap in="SourceGraphic" scale="3"/>
        </filter>
        <filter id="ac-goo" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b"/>
          <feColorMatrix in="b" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"/>
        </filter>
        {/* Paint filter for headlines — slight bleed + edge displacement */}
        <filter id="ac-paint-text" x="-5%" y="-15%" width="110%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.022 0.04" numOctaves="2" seed="5" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2"/>
          <feMorphology operator="dilate" radius="0.4"/>
        </filter>
        {/* Heavier wet-paint look for hero titles */}
        <filter id="ac-paint-text-heavy" x="-5%" y="-15%" width="110%" height="130%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018 0.05" numOctaves="2" seed="2" result="n"/>
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5"/>
        </filter>
      </defs>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
//  TYPE — modern condensed display + paint effect
// ═══════════════════════════════════════════════════════════════
const AC_FONT_DISPLAY = "'Bebas Neue', 'Barlow Condensed', 'Helvetica Neue', sans-serif";
const AC_FONT_DISPLAY_HEAVY = "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif";
const AC_FONT_BODY    = "'Inter', 'Helvetica Neue', Arial, sans-serif";
const AC_FONT_MONO    = "'JetBrains Mono', 'Courier New', monospace";

// Headline with painted-edge filter — readable, modern, painted
function AcHeadline({ children, size = 56, color = AC.bone, weight = 700, paint = 'light', shadow, style = {} }) {
  const filt = paint === 'heavy' ? 'url(#ac-paint-text-heavy)' : paint === 'none' ? 'none' : 'url(#ac-paint-text)';
  return (
    <span style={{
      fontFamily: AC_FONT_DISPLAY_HEAVY,
      fontWeight: weight,
      fontSize: size,
      lineHeight: 0.92,
      letterSpacing: '-0.005em',
      color,
      textTransform: 'uppercase',
      display: 'inline-block',
      filter: filt,
      textShadow: shadow || 'none',
      ...style,
    }}>{children}</span>
  );
}

// A dripping-paint strip below a block. Width stretches; height is fixed.
function AcDrip({ color = AC.shimmer, height = 26, seed = 0 }) {
  // deterministic variation
  const drops = [
    { cx: 12, cy: 14, r: 6 },
    { cx: 34 + seed*2, cy: 17, r: 5 },
    { cx: 58, cy: 13, r: 7 },
    { cx: 78 - seed, cy: 18, r: 4 },
    { cx: 92, cy: 15, r: 5 },
  ];
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none"
      style={{ width: '100%', height, display: 'block', pointerEvents: 'none' }}>
      <g filter="url(#ac-goo)" fill={color}>
        <rect x="-5" y="-5" width="110" height="10"/>
        {drops.map((d,i)=>(<circle key={i} cx={d.cx} cy={d.cy} r={d.r}/>))}
      </g>
    </svg>
  );
}

// A paint splat for backgrounds. Absolutely positioned by parent.
function AcSplat({ color = AC.violet, size = 260, opacity = 0.85, seed = 1, style = {} }) {
  const satellites = [
    { cx: 168, cy: 52, r: 14 },
    { cx: 42, cy: 46, r: 9 },
    { cx: 180, cy: 152, r: 11 },
    { cx: 28, cy: 150, r: 7 },
    { cx: 100, cy: 176, r: 15 },
  ];
  return (
    <svg viewBox="0 0 200 200"
      style={{ width: size, height: size, opacity, pointerEvents: 'none', ...style }}
      aria-hidden="true">
      <g filter="url(#ac-paint-spread)">
        <ellipse cx="100" cy="100" rx={60 + seed*3} ry={52} fill={color}/>
        {satellites.map((s,i)=>(<circle key={i} cx={s.cx+seed} cy={s.cy} r={s.r} fill={color}/>))}
      </g>
    </svg>
  );
}

// Graffiti emoticon — ASCII rendered in SVG with rougher filter.
function AcEmote({ face = ':-)', color = AC.bone, size = 44, style = {}, title }) {
  return (
    <svg viewBox="0 0 120 80" style={{ width: (size * 1.5)|0, height: size, ...style }}
      role="img" aria-label={title || face}>
      <text x="60" y="58" textAnchor="middle"
        fontFamily="'Barlow Condensed', 'Bebas Neue', sans-serif" fontWeight="800" fontSize="44"
        fill={color} filter="url(#ac-rougher)">{face}</text>
    </svg>
  );
}

// A stencil glyph: +, ×, ◯, →, ✓, ✗, etc. Stroke-based.
function AcGlyph({ kind = 'plus', color = AC.bone, size = 22, stroke = 3 }) {
  const paths = {
    plus: <g><line x1="20" y1="4" x2="20" y2="36"/><line x1="4" y1="20" x2="36" y2="20"/></g>,
    x: <g><line x1="6" y1="6" x2="34" y2="34"/><line x1="34" y1="6" x2="6" y2="34"/></g>,
    check: <polyline points="6,22 16,32 34,8" />,
    ring: <circle cx="20" cy="20" r="14" />,
    dot: <circle cx="20" cy="20" r="6" fill={color}/>,
    arrowRight: <g><line x1="4" y1="20" x2="34" y2="20"/><polyline points="24,10 34,20 24,30"/></g>,
    arrowLeft: <g><line x1="6" y1="20" x2="36" y2="20"/><polyline points="16,10 6,20 16,30"/></g>,
    copy: <g><rect x="6" y="10" width="20" height="24"/><rect x="14" y="6" width="20" height="24"/></g>,
    link: <g><path d="M12 24 L20 16" /><path d="M10 14 h8 v8" /><path d="M30 22 v8 h-8" /></g>,
    play: <polygon points="12,8 32,20 12,32" fill={color}/>,
    pause: <g><rect x="10" y="8" width="7" height="24" fill={color}/><rect x="23" y="8" width="7" height="24" fill={color}/></g>,
    smoke: <g><circle cx="14" cy="24" r="6"/><circle cx="24" cy="16" r="7"/><circle cx="28" cy="28" r="5"/></g>,
    bomb: <g><circle cx="20" cy="24" r="10"/><line x1="20" y1="14" x2="26" y2="6"/><circle cx="28" cy="4" r="2" fill={color}/></g>,
    saber: <g><line x1="8" y1="32" x2="32" y2="8"/><line x1="28" y1="4" x2="36" y2="12"/></g>,
    ice: <g><line x1="20" y1="4" x2="20" y2="36"/><line x1="4" y1="20" x2="36" y2="20"/><line x1="8" y1="8" x2="32" y2="32"/><line x1="32" y1="8" x2="8" y2="32"/></g>,
    zoom: <g><circle cx="17" cy="17" r="10"/><line x1="25" y1="25" x2="34" y2="34"/></g>,
    tornado: <g><path d="M4 8 L36 8"/><path d="M8 16 L32 16"/><path d="M12 24 L28 24"/><path d="M16 32 L24 32"/></g>,
    puzzle: <g><rect x="4" y="4" width="14" height="14"/><rect x="22" y="4" width="14" height="14"/><rect x="4" y="22" width="14" height="14"/><rect x="22" y="22" width="14" height="14"/></g>,
    speed: <g><polyline points="4,28 16,14 22,22 36,6"/></g>,
    shield: <path d="M20 4 L34 10 V22 C34 30 20 36 20 36 C20 36 6 30 6 22 V10 Z" />,
    target: <g><circle cx="20" cy="20" r="14"/><circle cx="20" cy="20" r="7"/><circle cx="20" cy="20" r="2" fill={color}/></g>,
    flame: <path d="M20 4 C14 14 24 16 20 26 C16 30 10 28 10 22 C8 30 14 36 20 36 C28 36 32 30 30 22 C28 14 22 14 20 4 Z" fill={color}/>,
    snow: <g><line x1="20" y1="4" x2="20" y2="36"/><line x1="6" y1="12" x2="34" y2="28"/><line x1="6" y1="28" x2="34" y2="12"/><polyline points="16,8 20,12 24,8"/><polyline points="16,32 20,28 24,32"/></g>,
    thermometer: <g><line x1="20" y1="6" x2="20" y2="28"/><circle cx="20" cy="32" r="5" fill={color}/></g>,
    image: <g><rect x="4" y="6" width="32" height="28"/><polyline points="4,28 14,20 20,24 28,14 36,22"/></g>,
    blur: <g opacity="0.5"><circle cx="20" cy="20" r="14"/></g>,
    lightning: <polygon points="22,4 10,22 18,22 14,36 30,16 22,16" fill={color}/>,
  };
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} style={{display:'block'}}>
      <g stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeLinejoin="round"
         filter="url(#ac-rougher)">
        {paths[kind] || paths.plus}
      </g>
    </svg>
  );
}

// Torn-edge button via clip-path.
const AC_CLIP = 'polygon(3% 10%, 12% 0, 30% 8%, 55% 2%, 78% 10%, 98% 4%, 100% 40%, 97% 75%, 99% 100%, 80% 96%, 55% 100%, 30% 94%, 10% 100%, 1% 88%, 2% 50%)';

function AcButton({ variant = 'primary', drip, children, size = 'md', style = {}, onClick, disabled, fullWidth, icon }) {
  const bg = {
    primary: AC.shimmer, chem: AC.chem, gold: AC.gold, danger: AC.rust, hex: AC.hex, violet: AC.violet,
    ghost: 'transparent', ink: AC.ink2,
  }[variant];
  const color = (variant === 'danger' || variant === 'violet' || variant === 'ghost' || variant === 'ink') ? AC.bone : AC.ink;
  const px = size === 'lg' ? 26 : size === 'sm' ? 12 : 20;
  const py = size === 'lg' ? 16 : size === 'sm' ? 7 : 12;
  const fs = size === 'lg' ? 18 : size === 'sm' ? 11 : 13;
  return (
    <div style={{ position:'relative', display: fullWidth ? 'block' : 'inline-block', ...style }}>
      <button onClick={onClick} disabled={disabled}
        style={{
          fontFamily: AC_FONT_DISPLAY_HEAVY,
          fontWeight: 700,
          fontSize: fs, letterSpacing: '0.06em', textTransform: 'uppercase',
          padding: `${py}px ${px}px`, border: 'none', cursor: disabled?'not-allowed':'pointer',
          background: bg, color,
          clipPath: AC_CLIP,
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled ? 0.55 : 1,
          boxShadow: variant === 'ghost' ? `inset 0 0 0 2px ${AC.bone}` : 'none',
          display:'inline-flex', alignItems:'center', justifyContent:'center', gap: 8,
        }}>
        {icon}<span>{children}</span>
      </button>
      {drip && (
        <div style={{ position:'absolute', left: 0, right: 0, bottom: -22, height: 26, pointerEvents:'none' }}>
          <AcDrip color={bg} seed={1} />
        </div>
      )}
    </div>
  );
}

// Tampon
function AcStamp({ children, color = AC.bone2, bg = 'transparent', rotate = 4, style = {} }) {
  return (
    <span style={{
      fontFamily: AC_FONT_MONO,
      fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
      color, background: bg, border: `1.5px dashed ${color}`,
      padding: '6px 10px', transform: `rotate(${rotate}deg)`,
      display: 'inline-block', ...style,
    }}>{children}</span>
  );
}

// Dashed horizontal divider
function AcDashed({ color = AC.bone2, style = {} }) {
  return <div style={{
    height: 0,
    borderTop: `1.5px dashed ${color}`,
    opacity: 0.6, ...style
  }}/>;
}

// Painted bar/gauge using goo. value 0..1
function AcPaintedBar({ value = 0.6, color = AC.chem, height = 18, style = {} }) {
  const pct = Math.max(0, Math.min(1, value));
  const w = pct * 100;
  return (
    <div style={{
      position:'relative', height, background: 'rgba(240,228,193,0.06)',
      border: `1px solid ${AC.bone2}`, overflow: 'visible', ...style
    }}>
      <svg viewBox="0 0 100 18" preserveAspectRatio="none"
        style={{ position:'absolute', inset:0, width:'100%', height:'100%' }}>
        <g filter="url(#ac-goo)" fill={color}>
          <rect x="0" y="3" width={Math.max(0,w-2)} height="12"/>
          {w>2 && <circle cx={w} cy="9" r="5"/>}
          {w>8 && <circle cx={w-4} cy="13" r="3"/>}
        </g>
      </svg>
    </div>
  );
}

// Ribbon alert — colored band on left, optional tape in top-right
function AcAlert({ tone = 'warning', children, tape, style = {} }) {
  const col = { success: AC.chem, warning: AC.gold, danger: AC.rust, info: AC.hex, shimmer: AC.shimmer }[tone] || AC.gold;
  const bg = tone === 'danger' ? 'rgba(200,68,30,0.14)' : tone === 'success' ? 'rgba(18,214,168,0.10)' : tone === 'info' ? 'rgba(94,184,255,0.10)' : tone === 'shimmer' ? 'rgba(255,61,139,0.10)' : 'rgba(245,185,18,0.10)';
  return (
    <div style={{
      position:'relative', padding: '12px 14px 12px 18px',
      borderLeft: `6px solid ${col}`, background: bg, color: AC.bone,
      fontFamily: AC_FONT_MONO, fontSize: 12, ...style,
    }}>
      {tape && (
        <span style={{
          position:'absolute', top:-9, right:14, background: AC.gold, color: AC.ink,
          fontFamily: AC_FONT_MONO, fontSize:9, letterSpacing:'0.15em',
          textTransform:'uppercase', padding:'3px 8px', transform:'rotate(-2deg)',
        }}>{tape}</span>
      )}
      {children}
    </div>
  );
}

// Card with folded corner
function AcCard({ children, fold = true, dashed = false, drip, dripColor = AC.shimmer, style = {} }) {
  return (
    <div style={{
      position:'relative',
      background: 'linear-gradient(135deg, #1A160F 0%, #0D0B08 100%)',
      padding: 18,
      overflow: 'visible',
      boxShadow: dashed ? 'none' : `inset 0 0 0 1.5px ${AC.bone}`,
      border: dashed ? `1.5px dashed ${AC.bone2}` : 'none',
      ...style,
    }}>
      {fold && (
        <div style={{
          position:'absolute', top:0, right:0, width:0, height:0,
          borderStyle:'solid', borderWidth:'0 22px 22px 0',
          borderColor:`transparent ${AC.bone} transparent transparent`,
          zIndex: 2,
        }}/>
      )}
      {children}
      {drip && (
        <div style={{position:'absolute', left: 10, right: 10, bottom: -20, height: 24}}>
          <AcDrip color={dripColor} seed={2}/>
        </div>
      )}
    </div>
  );
}

// Section number badge — mono green "01", "02"...
function AcSectionNum({ n }) {
  return (
    <span style={{
      fontFamily: AC_FONT_MONO, fontSize: 11, letterSpacing:'0.2em',
      color: AC.chem, background: 'rgba(18,214,168,0.12)',
      border: `1px solid ${AC.chem}`,
      padding: '3px 7px',
    }}>{String(n).padStart(2,'0')}</span>
  );
}

// Hero title helper — modern condensed display + paint filter on edges.
// Readable, no skew, no chunky outline. Paint character via SVG filter.
function AcDisplay({ children, size = 58, style = {} }) {
  return (
    <h1 style={{
      fontFamily: AC_FONT_DISPLAY_HEAVY,
      fontWeight: 800,
      fontSize: size, lineHeight: 0.92, letterSpacing:'-0.005em',
      textTransform: 'uppercase',
      color: AC.bone,
      filter: 'url(#ac-paint-text)',
      margin: 0, textWrap: 'balance',
      ...style,
    }}>{children}</h1>
  );
}

// Inline accent span used inside display titles — colored paint stroke
function AcShim({ children, color = AC.shimmer }) {
  return <span style={{
    color,
    filter: 'url(#ac-paint-text-heavy)',
    display: 'inline-block',
  }}>{children}</span>;
}

// Placeholder for a game screenshot. Striped + monospace label.
function AcImagePlaceholder({ label = 'GAME SCREENSHOT', ratio = '16 / 10', seed = 1, style = {}, overlays, effect }) {
  // Effect can be: 'blur' | 'smoke' | 'cut' | 'freeze' | 'zoom' | 'tornado' | 'puzzle' | 'speed'
  const base = (
    <div style={{
      position:'absolute', inset:0,
      background:
        `repeating-linear-gradient(135deg, rgba(240,228,193,0.06) 0 12px, rgba(240,228,193,0.02) 12px 24px),` +
        `radial-gradient(ellipse at 30% 40%, #2a2317 0%, #14100a 70%)`,
    }}/>
  );
  // Fake game scene bits
  const scene = (
    <svg viewBox="0 0 320 200" preserveAspectRatio="none"
      style={{ position:'absolute', inset:0, width:'100%', height:'100%',
      filter: effect === 'blur' ? 'blur(14px)' : effect === 'freeze' ? 'hue-rotate(180deg) brightness(1.1)' : 'none',
      transform: effect === 'tornado' ? 'rotate(6deg)' : 'none' }}>
      <rect x="0" y="0" width="320" height="200" fill="#0D0B08"/>
      <polygon points="0,140 80,90 160,120 240,80 320,110 320,200 0,200" fill="#2a2317"/>
      <polygon points="0,160 60,130 140,150 220,120 320,140 320,200 0,200" fill="#1a160f"/>
      <circle cx="60" cy="50" r="16" fill="#F5B912" opacity="0.5"/>
      <rect x="160" y="60" width="24" height="60" fill="#8A3DD4" opacity="0.7"/>
      <rect x="200" y="70" width="14" height="50" fill="#12D6A8" opacity="0.6"/>
      <line x1="0" y1="170" x2="320" y2="170" stroke="#F0E4C1" strokeWidth="0.5" opacity="0.15"/>
    </svg>
  );
  const lbl = (
    <div style={{
      position:'absolute', left: 10, top: 10,
      fontFamily: "'Courier New', monospace", fontSize: 10, letterSpacing: '0.2em',
      color: AC.bone2, background: 'rgba(13,11,8,0.75)', padding: '3px 7px',
      border: `1px dashed ${AC.bone2}`, textTransform:'uppercase',
    }}>{`// ${label}`}</div>
  );

  // Painted frame via clip-path (irregular)
  const FRAME_CLIP = 'polygon(1% 4%, 4% 1%, 20% 3%, 50% 1%, 78% 4%, 98% 2%, 99% 20%, 97% 55%, 99% 82%, 96% 99%, 70% 97%, 40% 99%, 12% 97%, 2% 99%, 1% 80%, 3% 40%)';

  // Effect overlays
  let fx = null;
  if (effect === 'smoke') {
    fx = (
      <div style={{position:'absolute', inset:0, background:
        'radial-gradient(circle at 30% 60%, rgba(240,228,193,0.55), transparent 40%),' +
        'radial-gradient(circle at 70% 40%, rgba(240,228,193,0.55), transparent 40%),' +
        'radial-gradient(circle at 50% 80%, rgba(240,228,193,0.35), transparent 40%)'}}/>
    );
  } else if (effect === 'cut') {
    fx = (
      <svg style={{position:'absolute', inset:0, width:'100%', height:'100%'}} viewBox="0 0 320 200" preserveAspectRatio="none">
        <line x1="-20" y1="20" x2="340" y2="220" stroke={AC.rust} strokeWidth="3" filter="url(#ac-rougher)"/>
        <line x1="-20" y1="80" x2="340" y2="180" stroke={AC.rust} strokeWidth="2" opacity="0.6" filter="url(#ac-rougher)"/>
      </svg>
    );
  } else if (effect === 'zoom') {
    fx = (
      <div style={{position:'absolute', inset:0, background:'rgba(94,184,255,0.18)', mixBlendMode:'screen'}}>
        <div style={{position:'absolute', top:'50%', left:'50%', width: 80, height: 80, marginLeft:-40, marginTop:-40, border:`2px solid ${AC.hex}`, borderRadius:'50%'}}/>
      </div>
    );
  } else if (effect === 'puzzle') {
    fx = (
      <svg style={{position:'absolute', inset:0, width:'100%', height:'100%'}} viewBox="0 0 320 200" preserveAspectRatio="none">
        <g stroke={AC.bone} strokeWidth="1" fill="none" opacity="0.5">
          <line x1="80" y1="0" x2="80" y2="200"/>
          <line x1="160" y1="0" x2="160" y2="200"/>
          <line x1="240" y1="0" x2="240" y2="200"/>
          <line x1="0" y1="66" x2="320" y2="66"/>
          <line x1="0" y1="133" x2="320" y2="133"/>
        </g>
      </svg>
    );
  } else if (effect === 'speed') {
    fx = (
      <svg style={{position:'absolute', inset:0, width:'100%', height:'100%'}} viewBox="0 0 320 200" preserveAspectRatio="none">
        <g stroke={AC.shimmer} strokeWidth="2" opacity="0.7">
          {Array.from({length:10}).map((_,i)=>(<line key={i} x1={i*32} y1="0" x2={i*32+30} y2="200"/>))}
        </g>
      </svg>
    );
  }

  return (
    <div style={{
      position:'relative', width: '100%', aspectRatio: ratio, overflow:'hidden',
      clipPath: FRAME_CLIP,
      boxShadow: `inset 0 0 0 2px ${AC.bone}`,
      ...style,
    }}>
      {base}
      {scene}
      {fx}
      {lbl}
      {overlays}
    </div>
  );
}

// Dotted separator with mono label in the middle
function AcDottedLabel({ children, color = AC.bone2, style = {} }) {
  return (
    <div style={{display:'flex', alignItems:'center', gap: 10, color, ...style}}>
      <div style={{flex:1, borderTop:`1.5px dashed ${color}`, opacity:0.5}}/>
      <span style={{fontFamily:"'Courier New', monospace", fontSize: 10, letterSpacing:'0.25em', textTransform:'uppercase'}}>{children}</span>
      <div style={{flex:1, borderTop:`1.5px dashed ${color}`, opacity:0.5}}/>
    </div>
  );
}

// Mini avatar — initials in a bone disc with rough border
function AcAvatar({ name = 'AA', color = AC.shimmer, size = 36, halo }) {
  const initials = name.split(' ').map(s=>s[0]).join('').slice(0,2).toUpperCase();
  return (
    <div style={{position:'relative', width:size, height:size, flexShrink:0}}>
      {halo && (
        <div style={{
          position:'absolute', inset: -5, borderRadius:'50%',
          background: `radial-gradient(circle, ${halo}66 0%, transparent 70%)`,
        }}/>
      )}
      <div style={{
        position:'relative', width:size, height:size, borderRadius:'50%',
        background: color, color: AC.ink,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontFamily:"'Arial Black', Impact, sans-serif", fontSize: size*0.42,
        boxShadow: `inset 0 0 0 2px ${AC.ink}`,
      }}>{initials}</div>
    </div>
  );
}

// Root container — warm dark backdrop with grain + hatching (no pure black)
function AcScreen({ children, style = {} }) {
  return (
    <div style={{
      position: 'relative',
      width: '100%', height: '100%',
      background: 'radial-gradient(ellipse at 20% 10%, #3A2D4A 0%, #2A1E3A 35%, #1F1830 75%, #1A1428 100%)',
      color: AC.bone,
      fontFamily: AC_FONT_BODY,
      overflow: 'hidden',
      ...style,
    }}>
      {/* warm rust glow bottom-right */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        background: 'radial-gradient(ellipse at 90% 95%, rgba(200,68,30,0.18) 0%, transparent 45%)',
      }}/>
      {/* chem teal glow bottom-left */}
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        background: 'radial-gradient(ellipse at 5% 90%, rgba(18,214,168,0.10) 0%, transparent 40%)',
      }}/>
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage: 'repeating-linear-gradient(45deg, transparent 0 3px, rgba(240,228,193,0.025) 3px 4px)',
      }}/>
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(240,228,193,0.05) 1px, transparent 1px)',
        backgroundSize: '3px 3px',
        mixBlendMode: 'overlay',
      }}/>
      <div style={{position:'relative', width:'100%', height:'100%'}}>{children}</div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ARCANE-UNIVERSE GRAFFITI SHAPES (Jinx-style wall tags)
// ═══════════════════════════════════════════════════════════════

// 5-pointed graffiti star — spiky, irregular
function AcStar({ color = AC.shimmer, size = 60, filled = true, stroke = 3, rotate = 0, style = {} }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{transform:`rotate(${rotate}deg)`, ...style}}>
      <polygon points="50,6 61,38 96,40 68,60 78,94 50,74 22,94 32,60 4,40 39,38"
        fill={filled?color:'none'} stroke={color} strokeWidth={stroke}
        strokeLinejoin="round" filter="url(#ac-rougher)"/>
    </svg>
  );
}

// Scribble heart
function AcHeart({ color = AC.shimmer, size = 50, filled = false, stroke = 4, rotate = 0, style = {} }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{transform:`rotate(${rotate}deg)`, ...style}}>
      <path d="M50 86 C 10 60 10 30 30 22 C 42 18 50 28 50 36 C 50 28 58 18 70 22 C 90 30 90 60 50 86 Z"
        fill={filled?color:'none'} stroke={color} strokeWidth={stroke}
        strokeLinejoin="round" filter="url(#ac-rougher)"/>
    </svg>
  );
}

// Little spiky crown
function AcCrown({ color = AC.gold, size = 50, stroke = 3, style = {} }) {
  return (
    <svg viewBox="0 0 100 60" width={size} height={size*0.6} style={style}>
      <g fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round" strokeLinecap="round"
         filter="url(#ac-rougher)">
        <polyline points="8,50 8,20 28,34 50,8 72,34 92,20 92,50"/>
        <line x1="8" y1="50" x2="92" y2="50"/>
        <circle cx="8" cy="16" r="3" fill={color}/>
        <circle cx="50" cy="4" r="3" fill={color}/>
        <circle cx="92" cy="16" r="3" fill={color}/>
      </g>
    </svg>
  );
}

// Spray-paint cloud / tattoo swirl (Jinx shoulder tattoo reference)
function AcCloudTat({ color = AC.hex, size = 80, style = {} }) {
  return (
    <svg viewBox="0 0 120 80" width={size} height={size*0.66} style={style}>
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
         filter="url(#ac-rougher)">
        <path d="M20 50 Q 10 30 30 28 Q 40 12 55 22 Q 70 10 85 22 Q 105 20 100 40 Q 110 52 92 58 Q 85 72 65 66 Q 50 76 38 62 Q 22 66 20 50 Z"/>
        <circle cx="40" cy="40" r="6"/>
        <circle cx="70" cy="36" r="5"/>
        <circle cx="58" cy="52" r="4"/>
      </g>
    </svg>
  );
}

// Spray-paint splatter — angular shards + drips (no round blobs)
function AcSpray({ color = AC.shimmer, size = 120, seed = 1, style = {} }) {
  const rand = (n) => ((Math.sin((n+seed)*12.9898)*43758.5453)%1+1)%1;
  const shards = [];
  for (let i=0; i<18; i++) {
    const cx = 10+rand(i)*100, cy = 10+rand(i+99)*100, s = 2 + rand(i+33)*5;
    shards.push(`${cx},${cy-s} ${cx+s},${cy+s} ${cx-s},${cy+s}`);
  }
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={{pointerEvents:'none', ...style}}>
      <g fill={color} filter="url(#ac-paint-spread)">
        <polygon points="60,36 76,56 72,82 48,86 38,62 46,42" opacity="0.85"/>
        {shards.map((pts,i)=>(<polygon key={i} points={pts} opacity={0.4 + rand(i)*0.5}/>))}
      </g>
    </svg>
  );
}

// X / cross tag (graffiti "X" or "nope" scribble)
function AcCrossTag({ color = AC.rust, size = 50, stroke = 5, rotate = 0, style = {} }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={{transform:`rotate(${rotate}deg)`, ...style}}>
      <g stroke={color} strokeWidth={stroke} strokeLinecap="round" fill="none"
         filter="url(#ac-rougher)">
        <line x1="8" y1="8" x2="52" y2="52"/>
        <line x1="52" y1="8" x2="8" y2="52"/>
      </g>
    </svg>
  );
}

// Scribble arrow (bent graffiti arrow)
function AcArrowTag({ color = AC.chem, size = 120, stroke = 4, flip = false, style = {} }) {
  return (
    <svg viewBox="0 0 160 60" width={size} height={size*0.375}
         style={{transform:`scaleX(${flip?-1:1})`, ...style}}>
      <g stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeLinejoin="round"
         filter="url(#ac-rougher)">
        <path d="M8 36 Q 40 10 80 30 Q 110 44 140 24"/>
        <polyline points="125,16 140,24 132,38"/>
      </g>
    </svg>
  );
}

// Lightning bolt tag (Jinx energy)
function AcBoltTag({ color = AC.gold, size = 60, rotate = 0, style = {} }) {
  return (
    <svg viewBox="0 0 60 80" width={size*0.75} height={size} style={{transform:`rotate(${rotate}deg)`, ...style}}>
      <polygon points="32,4 6,44 24,44 18,76 52,30 32,30 40,4"
        fill={color} stroke={AC.ink} strokeWidth="1.5" strokeLinejoin="round"
        filter="url(#ac-rougher)"/>
    </svg>
  );
}

// Zig-zag lightning scribble (replaces spiral)
function AcZigzag({ color = AC.violet, size = 120, stroke = 4, style = {} }) {
  return (
    <svg viewBox="0 0 160 60" width={size} height={size*0.375} style={style}>
      <polyline points="6,40 24,14 42,40 60,14 78,40 96,14 114,40 132,14 154,36"
        fill="none" stroke={color} strokeWidth={stroke}
        strokeLinecap="round" strokeLinejoin="round"
        filter="url(#ac-rougher)"/>
    </svg>
  );
}

// Triangle burst — angular starburst (replaces bubble)
function AcBurst({ color = AC.chem, size = 80, stroke = 3, style = {} }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} style={style}>
      <g stroke={color} strokeWidth={stroke} strokeLinecap="round" fill="none"
         filter="url(#ac-rougher)">
        <line x1="40" y1="4" x2="40" y2="22"/>
        <line x1="40" y1="58" x2="40" y2="76"/>
        <line x1="4" y1="40" x2="22" y2="40"/>
        <line x1="58" y1="40" x2="76" y2="40"/>
        <line x1="12" y1="12" x2="26" y2="26"/>
        <line x1="54" y1="54" x2="68" y2="68"/>
        <line x1="68" y1="12" x2="54" y2="26"/>
        <line x1="12" y1="68" x2="26" y2="54"/>
      </g>
      <polygon points="40,28 48,40 40,52 32,40" fill={color} filter="url(#ac-rougher)"/>
    </svg>
  );
}

// Triangle tag — solid triangle with inner notch
function AcTriangle({ color = AC.hex, size = 70, stroke = 3, filled = true, style = {} }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} style={style}>
      <polygon points="40,8 72,68 8,68"
        fill={filled?color:'none'} stroke={color} strokeWidth={stroke}
        strokeLinejoin="round" filter="url(#ac-rougher)"/>
    </svg>
  );
}

// Hash tag (##) — three parallel diagonal strokes
function AcHash({ color = AC.gold, size = 60, stroke = 4, style = {} }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={style}>
      <g stroke={color} strokeWidth={stroke} strokeLinecap="round"
         filter="url(#ac-rougher)">
        <line x1="10" y1="52" x2="30" y2="8"/>
        <line x1="22" y1="52" x2="42" y2="8"/>
        <line x1="34" y1="52" x2="54" y2="8"/>
      </g>
    </svg>
  );
}

// Chevron stack — three stacked V's
function AcChevron({ color = AC.shimmer, size = 70, stroke = 4, style = {} }) {
  return (
    <svg viewBox="0 0 80 80" width={size} height={size} style={style}>
      <g fill="none" stroke={color} strokeWidth={stroke}
         strokeLinecap="round" strokeLinejoin="round" filter="url(#ac-rougher)">
        <polyline points="10,20 40,40 70,20"/>
        <polyline points="10,40 40,60 70,40"/>
        <polyline points="10,60 40,80 70,60"/>
      </g>
    </svg>
  );
}

// Diamond / rhombus
function AcDiamond({ color = AC.chem, size = 60, stroke = 4, filled = false, style = {} }) {
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} style={style}>
      <polygon points="30,4 56,30 30,56 4,30"
        fill={filled?color:'none'} stroke={color} strokeWidth={stroke}
        strokeLinejoin="round" filter="url(#ac-rougher)"/>
    </svg>
  );
}

// Hand-written scribble mark (big 'signature' streak)
function AcScribble({ color = AC.shimmer, size = 160, stroke = 4, seed = 1, style = {} }) {
  const paths = [
    'M10 40 Q 30 10 60 40 T 110 30 T 150 50',
    'M8 30 Q 40 50 70 20 T 140 40 T 155 20',
    'M12 50 Q 50 20 80 50 T 148 30',
  ];
  return (
    <svg viewBox="0 0 160 60" width={size} height={size*0.375} style={style}>
      <path d={paths[seed%paths.length]}
        fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        filter="url(#ac-rougher)"/>
    </svg>
  );
}

// Sparse graffiti — corners only, never behind text. Subtle, modern.
function AcGraffitiLayer({ density = 'normal', palette, style = {} }) {
  const pal = palette || [AC.shimmer, AC.hex, AC.chem, AC.violet, AC.gold];
  // Tucked into top-right and bottom-left corners. Center 60% stays clear.
  const items = [
    { type:'triangle', x:'94%', y:'4%',  size: 54, rot: 14,  color: pal[1], opacity: 0.35 },
    { type:'hash',     x:'88%', y:'12%', size: 44, rot: 8,   color: pal[4], opacity: 0.30 },
    { type:'star',     x:'4%',  y:'94%', size: 50, rot: -10, color: pal[0], opacity: 0.35 },
    { type:'zigzag',   x:'14%', y:'88%', size: 130, rot: 4,  color: pal[3], opacity: 0.22 },
    { type:'diamond',  x:'96%', y:'92%', size: 40, rot: 0,   color: pal[2], opacity: 0.30 },
  ];
  const extra = density === 'heavy' ? [
    { type:'chevron',  x:'92%', y:'30%', size: 50, rot: 0,  color: pal[2], opacity: 0.25 },
    { type:'cross',    x:'7%',  y:'74%', size: 32, rot: -6, color: pal[4], opacity: 0.30 },
  ] : [];
  const all = [...items, ...extra];

  const render = (it, i) => {
    const wrap = { position:'absolute', left: it.x, top: it.y, opacity: it.opacity, transform:`translate(-50%,-50%) rotate(${it.rot||0}deg)`, pointerEvents:'none' };
    let el = null;
    switch(it.type) {
      case 'star':     el = <AcStar color={it.color} size={it.size} filled={i%2===0}/>; break;
      case 'heart':    el = <AcHeart color={it.color} size={it.size} filled={i%3===0}/>; break;
      case 'crown':    el = <AcCrown color={it.color} size={it.size}/>; break;
      case 'cloud':    el = <AcCloudTat color={it.color} size={it.size}/>; break;
      case 'spray':    el = <AcSpray color={it.color} size={it.size} seed={it.seed||1}/>; break;
      case 'cross':    el = <AcCrossTag color={it.color} size={it.size}/>; break;
      case 'arrow':    el = <AcArrowTag color={it.color} size={it.size}/>; break;
      case 'bolt':     el = <AcBoltTag color={it.color} size={it.size}/>; break;
      case 'zigzag':   el = <AcZigzag color={it.color} size={it.size}/>; break;
      case 'burst':    el = <AcBurst color={it.color} size={it.size}/>; break;
      case 'triangle': el = <AcTriangle color={it.color} size={it.size} filled={i%2===0}/>; break;
      case 'hash':     el = <AcHash color={it.color} size={it.size}/>; break;
      case 'chevron':  el = <AcChevron color={it.color} size={it.size}/>; break;
      case 'diamond':  el = <AcDiamond color={it.color} size={it.size} filled={i%2===1}/>; break;
      case 'scribble': el = <AcScribble color={it.color} size={it.size} seed={it.seed||i}/>; break;
      default: el = null;
    }
    return <div key={i} style={wrap}>{el}</div>;
  };
  return (
    <div style={{position:'absolute', inset:0, overflow:'hidden', pointerEvents:'none', ...style}} aria-hidden="true">
      {all.map(render)}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
//  PAINTED TEXT — readable graffiti style
//  Dense ink fill + chunky stroke outline + offset color shadow.
//  Uses -webkit-text-stroke for bone outline on shimmer text.
// ═══════════════════════════════════════════════════════════════

function AcGraffitiText({ children, size = 58, color = AC.shimmer, outline = AC.ink, shadow = AC.ink, drip = false, style = {} }) {
  return (
    <span style={{
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
    }}>{children}</span>
  );
}

Object.assign(window, {
  AC, ArcanePaintDefs, AcDrip, AcSplat, AcEmote, AcGlyph, AcButton, AcStamp,
  AcDashed, AcPaintedBar, AcAlert, AcCard, AcSectionNum, AcDisplay, AcShim,
  AcImagePlaceholder, AcDottedLabel, AcAvatar, AcScreen, AC_CLIP,
  AcStar, AcHeart, AcCrown, AcCloudTat, AcSpray, AcCrossTag, AcArrowTag,
  AcBoltTag, AcZigzag, AcBurst, AcTriangle, AcHash, AcChevron, AcDiamond,
  AcScribble, AcGraffitiLayer, AcGraffitiText,
});
