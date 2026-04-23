// Weapon FX — 4 NEW weapons proposed in the same Arcane universe.
// Tag Spray, Glitch, Acide, Strobe.
// Each is designed to obstruct a game-screenshot-guessing session in a
// punk/paint aesthetic that doesn't overlap with existing mechanics.

// ────────────────────────────────────────────────────────────────────
// NEW #1 · TAG — "L'image reçoit une bombe de tags graffiti"
// Mechanic: aggressive aerosol paint layers (opaque, colorful, layered)
// Differs from Fumigène (translucent wash) by being OPAQUE and CHAOTIC
// ────────────────────────────────────────────────────────────────────

// V1 · BOMB CHAIN — 5 successive graffiti throws cover ~85% of the image
function Tag_BombChain() {
  const throws = [
    { kind: 'throwup', x: 25, y: 35, size: 180, color: AC.shimmer, rot: -6,  delay: 0.0 },
    { kind: 'scribble', x: 72, y: 30, size: 160, color: AC.gold,   rot: 4,   delay: 0.2 },
    { kind: 'bigtag',  x: 45, y: 60, size: 200, color: AC.rust,    rot: -8,  delay: 0.4 },
    { kind: 'burst',   x: 18, y: 70, size: 110, color: AC.chem,    rot: 3,   delay: 0.6 },
    { kind: 'cross',   x: 82, y: 75, size: 120, color: AC.shimmer, rot: 10,  delay: 0.8 },
  ];
  const renderThrow = (t, i) => {
    if (t.kind === 'throwup') {
      // Bubble throw-up
      return (
        <svg width={t.size} height={t.size * 0.55} viewBox="0 0 200 110">
          <g filter="url(#ac-paint-spread)">
            <ellipse cx="40" cy="55" rx="30" ry="40" fill={t.color}/>
            <ellipse cx="85" cy="55" rx="25" ry="38" fill={t.color}/>
            <ellipse cx="130" cy="55" rx="28" ry="40" fill={t.color}/>
            <ellipse cx="165" cy="55" rx="20" ry="32" fill={t.color}/>
            <ellipse cx="55" cy="55" rx="8" ry="20" fill={AC.ink}/>
            <ellipse cx="100" cy="55" rx="6" ry="18" fill={AC.ink}/>
            <ellipse cx="145" cy="55" rx="7" ry="20" fill={AC.ink}/>
          </g>
        </svg>
      );
    }
    if (t.kind === 'scribble') {
      return (
        <svg width={t.size} height={t.size * 0.4} viewBox="0 0 200 80">
          <path d="M 5 40 Q 20 10 40 40 Q 60 70 80 40 Q 100 10 120 40 Q 140 70 160 40 Q 180 10 195 40"
            stroke={t.color} strokeWidth="8" fill="none" filter="url(#ac-paint-spread)" strokeLinecap="round"/>
          <path d="M 5 55 Q 20 25 40 55 Q 60 85 80 55 Q 100 25 120 55 Q 140 85 160 55"
            stroke={t.color} strokeWidth="4" fill="none" opacity="0.8"/>
        </svg>
      );
    }
    if (t.kind === 'bigtag') {
      return (
        <div style={{
          fontFamily: AC_FONT_DISPLAY_HEAVY, fontWeight: 800, fontSize: t.size * 0.3,
          color: t.color, textTransform: 'uppercase', lineHeight: 0.85,
          letterSpacing: '-0.03em', filter: 'url(#ac-paint-text-heavy)',
          WebkitTextStroke: `3px ${AC.ink}`,
          textShadow: `4px 4px 0 ${AC.ink}`,
        }}>RAID</div>
      );
    }
    if (t.kind === 'burst') {
      return (
        <svg width={t.size} height={t.size} viewBox="0 0 100 100">
          <g filter="url(#ac-paint-spread)" fill={t.color}>
            <polygon points="50,5 58,35 90,30 62,50 80,85 50,65 20,85 38,50 10,30 42,35"/>
          </g>
        </svg>
      );
    }
    if (t.kind === 'cross') {
      return (
        <svg width={t.size} height={t.size} viewBox="0 0 100 100">
          <g stroke={t.color} strokeWidth="14" strokeLinecap="square" filter="url(#ac-paint-spread)">
            <line x1="15" y1="15" x2="85" y2="85"/>
            <line x1="85" y1="15" x2="15" y2="85"/>
          </g>
        </svg>
      );
    }
    return null;
  };
  return (
    <FxCanvas>
      {throws.map((t, i) => (
        <div key={i} className="tg1-slam" style={{
          position: 'absolute', left: `${t.x}%`, top: `${t.y}%`,
          transform: `translate(-50%, -50%) rotate(${t.rot}deg)`,
          animationDelay: `${t.delay}s`,
        }}>
          {renderThrow(t, i)}
        </div>
      ))}
      {/* Spray-can drip underneath tags */}
      <svg viewBox="0 0 100 40" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40%' }}>
        <g filter="url(#ac-goo)" className="tg1-drips">
          <rect x="22" y="0" width="2" height="0" className="tg1-d tg1-d1" fill={AC.shimmer}/>
          <rect x="38" y="0" width="2" height="0" className="tg1-d tg1-d2" fill={AC.gold}/>
          <rect x="54" y="0" width="2" height="0" className="tg1-d tg1-d3" fill={AC.rust}/>
          <rect x="70" y="0" width="2" height="0" className="tg1-d tg1-d4" fill={AC.chem}/>
          <rect x="82" y="0" width="2" height="0" className="tg1-d tg1-d5" fill={AC.shimmer}/>
        </g>
      </svg>
    </FxCanvas>
  );
}

// V2 · SPRAY CLOUD — aerosol particle cloud builds with can-shake
function Tag_SprayCloud() {
  const clouds = [
    { x: 25, y: 30, size: 180, color: AC.shimmer, delay: 0.0 },
    { x: 70, y: 40, size: 180, color: AC.gold,    delay: 0.25 },
    { x: 40, y: 65, size: 200, color: AC.rust,    delay: 0.5 },
    { x: 80, y: 75, size: 150, color: AC.chem,    delay: 0.75 },
  ];
  return (
    <FxCanvas>
      {clouds.map((c, i) => (
        <div key={i} className="tg2-cloud" style={{
          position: 'absolute', left: `${c.x}%`, top: `${c.y}%`,
          width: c.size, height: c.size * 0.75,
          transform: 'translate(-50%, -50%)',
          animationDelay: `${c.delay}s`,
        }}>
          <svg viewBox="0 0 200 150" style={{ width: '100%', height: '100%' }}>
            <g fill={c.color} filter="url(#ac-paint-spread)" opacity="0.85">
              {/* Dense center */}
              <circle cx="100" cy="75" r="50"/>
              <circle cx="75" cy="60" r="30"/>
              <circle cx="125" cy="60" r="30"/>
              <circle cx="80" cy="95" r="28"/>
              <circle cx="120" cy="95" r="28"/>
              {/* Particle splatter */}
              <circle cx="40" cy="40" r="4" opacity="0.7"/>
              <circle cx="160" cy="30" r="3" opacity="0.7"/>
              <circle cx="180" cy="80" r="5" opacity="0.7"/>
              <circle cx="25" cy="80" r="4" opacity="0.7"/>
              <circle cx="55" cy="120" r="3" opacity="0.6"/>
              <circle cx="150" cy="130" r="4" opacity="0.6"/>
              <circle cx="30" cy="110" r="2" opacity="0.5"/>
              <circle cx="170" cy="115" r="3" opacity="0.6"/>
              <circle cx="15" cy="55" r="2" opacity="0.5"/>
              <circle cx="185" cy="50" r="2" opacity="0.5"/>
            </g>
          </svg>
        </div>
      ))}
      {/* TAG stamp at the end */}
      <div className="tg2-stamp" style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%) rotate(-4deg)',
      }}>
        <span style={{
          fontFamily: AC_FONT_DISPLAY_HEAVY, fontWeight: 800, fontSize: 64,
          color: AC.bone, textTransform: 'uppercase', letterSpacing: '-0.02em',
          filter: 'url(#ac-paint-text-heavy)',
          WebkitTextStroke: `3px ${AC.ink}`,
          textShadow: `4px 4px 0 ${AC.shimmer}`,
        }}>TAG</span>
      </div>
    </FxCanvas>
  );
}

// ────────────────────────────────────────────────────────────────────
// NEW #2 · GLITCH — "CRT punk interference"
// Mechanic: horizontal tears shift left/right + RGB chroma split + scanlines
// Obstruction: image breaks into displaced bands, very hard to parse subject
// ────────────────────────────────────────────────────────────────────

// V1 · BAND TEAR — horizontal bands shift erratically + color split
function Glitch_BandTear() {
  const bands = [
    { y: 0,  h: 12, d: 0.1, dir: 1 },
    { y: 12, h: 8,  d: 0.3, dir: -1 },
    { y: 20, h: 14, d: 0.2, dir: 1 },
    { y: 34, h: 6,  d: 0.5, dir: -1 },
    { y: 40, h: 18, d: 0.15, dir: 1 },
    { y: 58, h: 10, d: 0.4, dir: -1 },
    { y: 68, h: 14, d: 0.25, dir: 1 },
    { y: 82, h: 8,  d: 0.45, dir: -1 },
    { y: 90, h: 10, d: 0.35, dir: 1 },
  ];
  const img =
    "url('assets/poki-avatar.jpg') center/cover no-repeat";
  return (
    <FxCanvas>
      {/* RGB split — 3 tinted copies offset */}
      <div className="gl-rgb gl-r" style={{
        position: 'absolute', inset: 0, background: img,
        mixBlendMode: 'screen', opacity: 0.7,
        filter: 'hue-rotate(330deg) saturate(2)',
      }}/>
      <div className="gl-rgb gl-g" style={{
        position: 'absolute', inset: 0, background: img,
        mixBlendMode: 'screen', opacity: 0.7,
        filter: 'hue-rotate(150deg) saturate(2)',
      }}/>
      {/* Displaced bands */}
      {bands.map((b, i) => (
        <div key={i} className="glb-band" style={{
          position: 'absolute', left: 0, top: `${b.y}%`, width: '100%', height: `${b.h}%`,
          overflow: 'hidden',
          animationDelay: `${b.d}s`,
          '--dir': b.dir,
        }}>
          <div style={{
            position: 'absolute', left: 0, top: `-${b.y}%`, width: '100%', height: '1000%',
            background: img,
          }}/>
        </div>
      ))}
      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `repeating-linear-gradient(0deg, rgba(13,11,8,0.35) 0 1px, transparent 1px 3px)`,
        pointerEvents: 'none', mixBlendMode: 'multiply',
      }}/>
      {/* NO SIGNAL bar — intermittent */}
      <div className="glb-nosignal" style={{
        position: 'absolute', left: '50%', top: '20%', transform: 'translateX(-50%)',
      }}>
        <div style={{
          fontFamily: AC_FONT_MONO, fontSize: 11, letterSpacing: '0.35em',
          color: AC.bone, background: AC.rust, padding: '4px 10px',
          textTransform: 'uppercase', boxShadow: `2px 2px 0 ${AC.ink}`,
        }}>// NO SIGNAL</div>
      </div>
    </FxCanvas>
  );
}

// V2 · PIXEL CRUNCH — image pixelates + glitchy block displacement
function Glitch_PixelCrunch() {
  const img =
    "url('assets/poki-avatar.jpg') center/cover no-repeat";
  return (
    <FxCanvas>
      <div className="gl2-pix" style={{
        position: 'absolute', inset: 0,
        background: img,
        imageRendering: 'pixelated',
      }}/>
      {/* Mosaic blocks that "jump" */}
      <svg viewBox="0 0 20 14" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g className="gl2-blocks">
          {Array.from({length: 20}, (_, i) => {
            const x = (i * 7) % 20;
            const y = Math.floor((i * 7) / 20);
            const col = [AC.shimmer, AC.chem, AC.gold, AC.hex, AC.rust][i % 5];
            return <rect key={i} x={x} y={y} width="1.5" height="1" fill={col}
              className={`gl2-b gl2-b${i % 5}`} opacity="0" style={{animationDelay: `${(i * 0.13) % 1.5}s`}}/>;
          })}
        </g>
      </svg>
      {/* ERROR stamp */}
      <div className="gl2-err" style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
      }}>
        <span style={{
          fontFamily: AC_FONT_MONO, fontSize: 22, letterSpacing: '0.35em',
          color: AC.shimmer, background: AC.ink, padding: '6px 14px',
          textTransform: 'uppercase',
          boxShadow: `3px 3px 0 ${AC.rust}`,
        }}>ERR · 0x04</span>
      </div>
    </FxCanvas>
  );
}

// ────────────────────────────────────────────────────────────────────
// NEW #3 · ACIDE — "Corrosion : des trous se forment et coulent"
// Mechanic: holes appear at random points, grow, drip ink downward
// Obstruction: eats into the image from multiple foci
// ────────────────────────────────────────────────────────────────────

// V1 · CORROSION — 4 acid holes grow then drip
function Acide_Corrosion() {
  const holes = [
    { x: 30, y: 35, r: 12, color: AC.chem, delay: 0   },
    { x: 68, y: 25, r: 10, color: AC.chem, delay: 0.2 },
    { x: 50, y: 55, r: 15, color: AC.chem, delay: 0.4 },
    { x: 82, y: 68, r: 9,  color: AC.chem, delay: 0.6 },
    { x: 18, y: 72, r: 11, color: AC.chem, delay: 0.3 },
  ];
  return (
    <FxCanvas>
      {/* Base image visible */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <filter id="ac-acid-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        <g filter="url(#ac-goo)">
          {holes.map((h, i) => (
            <g key={i} className="ac1-hole" style={{ animationDelay: `${h.delay}s` }}>
              {/* Ring of acid color */}
              <circle cx={h.x} cy={h.y} r={h.r + 2} fill={h.color} opacity="0.45"/>
              {/* Ink hole */}
              <circle cx={h.x} cy={h.y} r={h.r} fill={AC.ink}/>
              {/* Drip down */}
              <rect x={h.x - 1.5} y={h.y} width="3" height={h.r + 6} fill={AC.ink}/>
              <circle cx={h.x} cy={h.y + h.r + 6} r="2.5" fill={AC.ink}/>
            </g>
          ))}
        </g>
      </svg>
      {/* Bubble particles on acid ring */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g fill={AC.chem} className="ac1-bubbles">
          {holes.map((h, i) => [
            <circle key={`${i}a`} cx={h.x - h.r} cy={h.y - h.r/2} r="1.2" opacity="0.7"/>,
            <circle key={`${i}b`} cx={h.x + h.r} cy={h.y - h.r/3} r="1" opacity="0.7"/>,
            <circle key={`${i}c`} cx={h.x + h.r/2} cy={h.y - h.r - 1} r="0.8" opacity="0.6"/>,
          ]).flat()}
        </g>
      </svg>
    </FxCanvas>
  );
}

// V2 · MELT — top of image melts downward, revealing ink + chem drips
function Acide_Melt() {
  return (
    <FxCanvas>
      {/* Acid dripping down from the top */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g filter="url(#ac-goo)">
          {/* Top melt curtain — a wavy bottom edge descending */}
          <g className="ac2-curtain" fill={AC.ink}>
            <path d="M 0 0 L 100 0 L 100 30 Q 95 35 88 32 Q 82 36 76 30 Q 68 38 60 30 Q 52 38 44 30 Q 36 36 28 32 Q 20 38 12 30 Q 6 36 0 32 Z"/>
          </g>
          {/* Acid glow at the melt edge */}
          <g className="ac2-curtain" fill={AC.chem} opacity="0.6">
            <path d="M 0 28 Q 10 34 20 30 Q 30 36 40 32 Q 50 38 60 32 Q 70 36 80 30 Q 90 36 100 32 L 100 30 Q 95 35 88 32 Q 82 36 76 30 Q 68 38 60 30 Q 52 38 44 30 Q 36 36 28 32 Q 20 38 12 30 Q 6 36 0 32 Z"/>
          </g>
          {/* Long drips hanging below the curtain */}
          <g fill={AC.ink} className="ac2-drips">
            <rect x="14" y="0" width="3" height="0" className="ac2-drop ac2-drop-1"/>
            <rect x="32" y="0" width="3" height="0" className="ac2-drop ac2-drop-2"/>
            <rect x="50" y="0" width="3" height="0" className="ac2-drop ac2-drop-3"/>
            <rect x="68" y="0" width="3" height="0" className="ac2-drop ac2-drop-4"/>
            <rect x="86" y="0" width="3" height="0" className="ac2-drop ac2-drop-5"/>
          </g>
        </g>
      </svg>
      {/* Chem tag */}
      <div className="ac2-tag" style={{
        position: 'absolute', left: '50%', bottom: 24, transform: 'translateX(-50%)',
      }}>
        <span style={{
          fontFamily: AC_FONT_MONO, fontSize: 11, letterSpacing: '0.3em',
          color: AC.chem, background: AC.ink, padding: '4px 10px',
          border: `1px solid ${AC.chem}`, textTransform: 'uppercase',
        }}>// pH 0.5 · CORROSION</span>
      </div>
    </FxCanvas>
  );
}

// ────────────────────────────────────────────────────────────────────
// NEW #4 · STROBE — "Flash haute fréquence qui fatigue l'œil"
// Mechanic: full-screen color pulses cycle rapidly. Image visible between
// flashes but retinal persistence makes parsing hard.
// ────────────────────────────────────────────────────────────────────

// V1 · NEON STROBE — shimmer / chem / gold flashes + center pulse
function Strobe_Neon() {
  return (
    <FxCanvas>
      <div className="st1-flash" style={{
        position: 'absolute', inset: 0,
        mixBlendMode: 'screen',
      }}/>
      {/* Pulsing circle overlay */}
      <div className="st1-pulse" style={{
        position: 'absolute', left: '50%', top: '50%',
        width: 40, height: 40, marginLeft: -20, marginTop: -20,
        borderRadius: '50%', border: `4px solid ${AC.shimmer}`,
        filter: 'url(#ac-rougher)',
      }}/>
      {/* Rave tag */}
      <div className="st1-tag" style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
      }}>
        <span style={{
          fontFamily: AC_FONT_DISPLAY_HEAVY, fontWeight: 800, fontSize: 52,
          color: AC.bone, textTransform: 'uppercase',
          filter: 'url(#ac-paint-text-heavy)',
          WebkitTextStroke: `3px ${AC.ink}`,
        }}>RAVE</span>
      </div>
    </FxCanvas>
  );
}

// V2 · SEIZURE BARS — vertical alternating color bars strobe across
function Strobe_SeizureBars() {
  return (
    <FxCanvas>
      <div className="st2-bars" style={{
        position: 'absolute', inset: 0,
        background: `repeating-linear-gradient(90deg, ${AC.shimmer} 0 12%, ${AC.chem} 12% 24%, ${AC.gold} 24% 36%, ${AC.violet} 36% 48%, ${AC.rust} 48% 60%, ${AC.shimmer} 60% 72%, ${AC.chem} 72% 84%, ${AC.gold} 84% 100%)`,
        mixBlendMode: 'screen',
      }}/>
      <div className="st2-flash" style={{
        position: 'absolute', inset: 0,
        background: AC.bone, mixBlendMode: 'difference',
      }}/>
      <div className="st2-tag" style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
      }}>
        <span style={{
          fontFamily: AC_FONT_MONO, fontSize: 14, letterSpacing: '0.3em',
          color: AC.ink, background: AC.bone, padding: '6px 12px',
          textTransform: 'uppercase', boxShadow: `3px 3px 0 ${AC.rust}`,
        }}>// STROBE 12Hz</span>
      </div>
    </FxCanvas>
  );
}

Object.assign(window, {
  Tag_BombChain, Tag_SprayCloud, Tag_StencilBarrage,
  Glitch_BandTear, Glitch_PixelCrunch, Glitch_Datamosh,
  Acide_Corrosion, Acide_Melt, Acide_PoolRise,
  Strobe_Neon, Strobe_SeizureBars, Strobe_GridFlash,
});

// ════════════════════════════════════════════════════════════════════
// V3 VARIATIONS for NEW weapons (Tag, Glitch, Acide, Strobe)
// ════════════════════════════════════════════════════════════════════

// TAG V3 · STENCIL BARRAGE — 4 crisp stencil shapes slam down in rhythm
function Tag_StencilBarrage() {
  const stencils = [
    { x: 20, y: 30, w: 130, h: 130, color: AC.shimmer, shape: 'skull', delay: 0 },
    { x: 75, y: 25, w: 150, h: 100, color: AC.gold,    shape: 'text',  delay: 0.2, text: 'OUT' },
    { x: 32, y: 72, w: 150, h: 100, color: AC.rust,    shape: 'text',  delay: 0.4, text: 'TAG' },
    { x: 78, y: 76, w: 110, h: 110, color: AC.chem,    shape: 'target',delay: 0.6 },
  ];
  return (
    <FxCanvas>
      {stencils.map((s, i) => (
        <div key={i} className="tg3-slam" style={{
          position: 'absolute', left: `${s.x}%`, top: `${s.y}%`,
          transform: 'translate(-50%, -50%)',
          animationDelay: `${s.delay}s`,
        }}>
          {s.shape === 'skull' && (
            <svg width={s.w} height={s.h} viewBox="0 0 100 100">
              <g filter="url(#ac-paint-spread)" fill={s.color}>
                <ellipse cx="50" cy="45" rx="32" ry="34"/>
                <rect x="35" y="72" width="30" height="16"/>
                <circle cx="38" cy="42" r="6" fill={AC.ink}/>
                <circle cx="62" cy="42" r="6" fill={AC.ink}/>
                <rect x="44" y="55" width="12" height="8" fill={AC.ink}/>
                <rect x="37" y="80" width="3" height="8" fill={AC.ink}/>
                <rect x="48" y="80" width="3" height="8" fill={AC.ink}/>
                <rect x="60" y="80" width="3" height="8" fill={AC.ink}/>
              </g>
            </svg>
          )}
          {s.shape === 'text' && (
            <div style={{
              fontFamily: AC_FONT_DISPLAY_HEAVY, fontSize: s.h * 0.9, fontWeight: 800,
              color: s.color, lineHeight: 0.85, letterSpacing: '-0.03em',
              textTransform: 'uppercase',
              filter: 'url(#ac-paint-text-heavy)',
              WebkitTextStroke: `3px ${AC.ink}`,
            }}>{s.text}</div>
          )}
          {s.shape === 'target' && (
            <svg width={s.w} height={s.h} viewBox="0 0 100 100">
              <g filter="url(#ac-paint-spread)" fill="none" strokeWidth="10" stroke={s.color}>
                <circle cx="50" cy="50" r="42"/>
                <circle cx="50" cy="50" r="26" strokeWidth="8"/>
                <circle cx="50" cy="50" r="10" strokeWidth="6"/>
              </g>
              <circle cx="50" cy="50" r="3" fill={s.color}/>
            </svg>
          )}
        </div>
      ))}
      {/* Paint drips under each stencil */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <g filter="url(#ac-goo)" className="tg3-drips">
          <rect x="20" y="46" width="2" height="0" className="tg3-d tg3-d1" fill={AC.shimmer}/>
          <rect x="75" y="38" width="2" height="0" className="tg3-d tg3-d2" fill={AC.gold}/>
          <rect x="32" y="86" width="2" height="0" className="tg3-d tg3-d3" fill={AC.rust}/>
          <rect x="78" y="90" width="2" height="0" className="tg3-d tg3-d4" fill={AC.chem}/>
        </g>
      </svg>
    </FxCanvas>
  );
}

// GLITCH V3 · DATAMOSH — blocks smear + chromatic sprint across screen
function Glitch_Datamosh() {
  const img = "url('assets/poki-avatar.jpg') center/cover no-repeat";
  const smears = [
    { y:  8, h: 10, d: 0   },
    { y: 24, h: 14, d: 0.3 },
    { y: 44, h: 8,  d: 0.1 },
    { y: 58, h: 18, d: 0.5 },
    { y: 78, h: 12, d: 0.2 },
  ];
  return (
    <FxCanvas>
      {/* Chromatic aberration copies */}
      <div className="gl3-rgb gl3-r" style={{
        position: 'absolute', inset: 0, background: img,
        filter: 'hue-rotate(310deg) saturate(2.5)',
        mixBlendMode: 'screen', opacity: 0.85,
      }}/>
      <div className="gl3-rgb gl3-g" style={{
        position: 'absolute', inset: 0, background: img,
        filter: 'hue-rotate(130deg) saturate(2.5)',
        mixBlendMode: 'screen', opacity: 0.85,
      }}/>
      {/* Smear bands — each shows image shifted + stretched */}
      {smears.map((s, i) => (
        <div key={i} className="gl3-smear" style={{
          position: 'absolute', left: 0, top: `${s.y}%`,
          width: '100%', height: `${s.h}%`,
          overflow: 'hidden',
          animationDelay: `${s.d}s`,
        }}>
          <div style={{
            position: 'absolute', left: 0, top: `-${s.y * (100/s.h)}%`,
            width: '100%', height: `${100 * (100/s.h)}%`,
            background: img,
            filter: 'blur(1.5px)',
          }}/>
        </div>
      ))}
      {/* Digital block corruption */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g className="gl3-blocks">
          <rect x="10" y="20" width="12" height="4" fill={AC.shimmer} opacity="0.9"/>
          <rect x="60" y="12" width="18" height="3" fill={AC.chem} opacity="0.9"/>
          <rect x="30" y="52" width="8" height="5" fill={AC.gold} opacity="0.9"/>
          <rect x="70" y="68" width="14" height="3" fill={AC.rust} opacity="0.9"/>
          <rect x="40" y="82" width="16" height="4" fill={AC.shimmer} opacity="0.9"/>
        </g>
      </svg>
      {/* MOSH tag */}
      <div className="gl3-tag" style={{
        position: 'absolute', right: 14, bottom: 14,
      }}>
        <span style={{
          fontFamily: AC_FONT_MONO, fontSize: 10, letterSpacing: '0.3em',
          color: AC.ink, background: AC.shimmer, padding: '4px 8px',
          textTransform: 'uppercase',
        }}>// MOSH</span>
      </div>
    </FxCanvas>
  );
}

// ACIDE V3 · POOL RISE — acid pool rises from bottom with chem surface + bubbles
function Acide_PoolRise() {
  return (
    <FxCanvas>
      {/* Rising acid pool */}
      <div className="ac3-pool" style={{
        position: 'absolute', left: 0, right: 0, bottom: 0,
        background: AC.ink,
      }}>
        {/* Chem glow along the top edge */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: -4, height: 8,
          background: `linear-gradient(to bottom, transparent, ${AC.chem} 60%, ${AC.chem})`,
          filter: 'blur(1px)',
          opacity: 0.85,
        }}/>
      </div>
      {/* Wavy surface line */}
      <svg viewBox="0 0 100 10" preserveAspectRatio="none"
        className="ac3-surface"
        style={{ position: 'absolute', left: 0, right: 0, width: '100%', height: '8%' }}>
        <path d="M 0 5 Q 12 2 25 5 T 50 5 T 75 5 T 100 5 V 10 H 0 Z"
          fill={AC.ink}/>
        <path d="M 0 5 Q 12 2 25 5 T 50 5 T 75 5 T 100 5"
          stroke={AC.chem} strokeWidth="0.4" fill="none"/>
      </svg>
      {/* Bubbles rising */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <g className="ac3-bubbles" fill={AC.chem}>
          {Array.from({length: 10}, (_, i) => {
            const x = 8 + (i * 9.5) % 90;
            const r = 0.8 + (i % 3) * 0.6;
            return <circle key={i} cx={x} cy="100" r={r}
              className={`ac3-b ac3-b${i % 5}`} style={{ animationDelay: `${(i * 0.17) % 2}s` }}/>;
          })}
        </g>
      </svg>
      {/* Warning tag */}
      <div className="ac3-tag" style={{
        position: 'absolute', left: 14, top: 14,
      }}>
        <span style={{
          fontFamily: AC_FONT_MONO, fontSize: 10, letterSpacing: '0.3em',
          color: AC.chem, background: AC.ink, padding: '4px 8px',
          border: `1px solid ${AC.chem}`, textTransform: 'uppercase',
        }}>// pH 0.3 · RISING</span>
      </div>
    </FxCanvas>
  );
}

// STROBE V3 · GRID FLASH — 3×3 grid of cells flash colors in sequence
function Strobe_GridFlash() {
  const colors = [AC.shimmer, AC.chem, AC.gold, AC.violet, AC.rust, AC.shimmer, AC.chem, AC.gold, AC.hex];
  return (
    <FxCanvas>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)',
        gap: 3,
      }}>
        {colors.map((c, i) => (
          <div key={i} className="st3-cell" style={{
            background: c, mixBlendMode: 'screen',
            animationDelay: `${(i * 0.12) % 1.5}s`,
          }}/>
        ))}
      </div>
      {/* Frame + label */}
      <div className="st3-frame" style={{
        position: 'absolute', inset: '6%',
        border: `1.5px solid ${AC.bone}`,
        pointerEvents: 'none',
      }}/>
      <div className="st3-label" style={{
        position: 'absolute', left: '50%', bottom: 14, transform: 'translateX(-50%)',
        fontFamily: AC_FONT_MONO, fontSize: 11, letterSpacing: '0.3em',
        color: AC.ink, background: AC.bone, padding: '4px 10px',
        textTransform: 'uppercase',
      }}>// STROBE 3×3</div>
    </FxCanvas>
  );
}
