// Weapon FX — existing weapons (Sabre, Gel, Zoom, Tornade, Puzzle, Speed).
// Each function takes no props and renders a self-contained FxCanvas with
// the effect running on a 3s loop. Keyframes defined in weapon-fx-styles.jsx.

// ────────────────────────────────────────────────────────────────────
// SABRE — "Une moitié de l'image devient noire"
// ────────────────────────────────────────────────────────────────────

// V1 · CLEAN SLASH — brush-stroke diagonal slash; half fills with ink + splatter
function Sabre_CleanSlash() {
  return (
    <FxCanvas>
      {/* Ink fill for upper-right half — clipped diagonally */}
      <div className="sb1-ink" style={{
        position: 'absolute', inset: 0,
        background: AC.ink,
        clipPath: 'polygon(100% 0, 0 0, 100% 100%)', // upper-right triangle
      }}/>
      {/* Splatter at slash edge */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g className="sb1-splat" filter="url(#ac-goo)" fill={AC.ink}>
          <ellipse cx="30" cy="35" rx="5" ry="3"/>
          <circle cx="22" cy="42" r="2.5"/>
          <circle cx="42" cy="28" r="3"/>
          <circle cx="55" cy="18" r="2"/>
          <circle cx="12" cy="50" r="2"/>
          <circle cx="68" cy="12" r="1.5"/>
        </g>
        {/* The slash stroke itself — diagonal paint swipe */}
        <g className="sb1-stroke" filter="url(#ac-paint-spread)">
          <path d="M -10 110 L 110 -10" stroke={AC.ink} strokeWidth="3" fill="none"/>
          <path d="M -8 108 L 108 -8" stroke={AC.shimmer} strokeWidth="1" fill="none" opacity="0.9"/>
        </g>
      </svg>
      {/* CUT tag at the blade exit point */}
      <div className="sb1-tag" style={{
        position: 'absolute', right: '12%', top: '8%',
        transform: 'rotate(-42deg)',
      }}>
        <span style={{
          fontFamily: AC_FONT_DISPLAY_HEAVY, fontWeight: 800, fontSize: 34,
          color: AC.shimmer, textTransform: 'uppercase', filter: 'url(#ac-paint-text)',
          textShadow: `2px 2px 0 ${AC.ink}`,
        }}>CUT</span>
      </div>
    </FxCanvas>
  );
}

// V2 · PAPER TEAR — diagonal paper rip, upper half flips off revealing ink
function Sabre_PaperTear() {
  return (
    <FxCanvas>
      {/* The "peeling" flap — upper-right image fragment that rotates off */}
      <div className="sb2-flap" style={{
        position: 'absolute', inset: 0,
        background:
          'repeating-linear-gradient(135deg, rgba(240,228,193,0.06) 0 12px, rgba(240,228,193,0.02) 12px 24px),' +
          'radial-gradient(ellipse at 70% 30%, #2a2317 0%, #14100a 70%)',
        clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
        transformOrigin: '100% 0%',
      }}/>
      {/* Ink underside that gets revealed */}
      <div className="sb2-reveal" style={{
        position: 'absolute', inset: 0,
        background: AC.ink,
        clipPath: 'polygon(100% 0, 0 0, 100% 100%)',
      }}/>
      {/* Torn edge — jagged line from bottom-left to top-right */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g className="sb2-edge">
          <path d="M -5 105 L 8 88 L 14 92 L 25 75 L 32 80 L 44 60 L 52 65 L 64 45 L 72 50 L 85 28 L 93 32 L 105 -5"
            stroke={AC.bone} strokeWidth="1.2" fill="none" filter="url(#ac-rougher)"/>
        </g>
        {/* Paint drips from the cut edge */}
        <g className="sb2-drips" filter="url(#ac-goo)" fill={AC.shimmer}>
          <rect x="20" y="76" width="2" height="0" className="sb2-drop sb2-drop-1"/>
          <rect x="40" y="56" width="2" height="0" className="sb2-drop sb2-drop-2"/>
          <rect x="60" y="36" width="2" height="0" className="sb2-drop sb2-drop-3"/>
          <rect x="80" y="16" width="2" height="0" className="sb2-drop sb2-drop-4"/>
        </g>
      </svg>
    </FxCanvas>
  );
}

// ────────────────────────────────────────────────────────────────────
// GEL — "Craquelures de glace, flocons, image gelée"
// ────────────────────────────────────────────────────────────────────

// V1 · ICE CRACKS — blue tint + radial crystalline fractures + stenciled snowflakes
function Gel_IceCracks() {
  return (
    <FxCanvas>
      {/* Blue freeze overlay */}
      <div className="gl1-tint" style={{
        position: 'absolute', inset: 0,
        background: 'rgba(94,184,255,0.28)',
        mixBlendMode: 'screen',
      }}/>
      {/* Frost at edges */}
      <div className="gl1-frost" style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse at 0% 0%,   rgba(240,228,193,0.5) 0%, transparent 30%),
          radial-gradient(ellipse at 100% 0%, rgba(240,228,193,0.5) 0%, transparent 30%),
          radial-gradient(ellipse at 0% 100%, rgba(240,228,193,0.4) 0%, transparent 30%),
          radial-gradient(ellipse at 100% 100%, rgba(240,228,193,0.4) 0%, transparent 30%)
        `,
        filter: 'url(#ac-paint-spread)',
      }}/>
      {/* Crystalline cracks — radial from 2 points */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g stroke={AC.hex} strokeWidth="0.4" fill="none" filter="url(#ac-rough)">
          <g className="gl1-crack gl1-c1">
            <line x1="35" y1="45" x2="10" y2="20"/>
            <line x1="35" y1="45" x2="60" y2="25"/>
            <line x1="35" y1="45" x2="15" y2="70"/>
            <line x1="35" y1="45" x2="55" y2="80"/>
            <line x1="35" y1="45" x2="70" y2="55"/>
            <line x1="20" y1="30" x2="12" y2="15"/>
            <line x1="50" y1="35" x2="58" y2="22"/>
          </g>
          <g className="gl1-crack gl1-c2">
            <line x1="75" y1="60" x2="95" y2="40"/>
            <line x1="75" y1="60" x2="65" y2="85"/>
            <line x1="75" y1="60" x2="92" y2="78"/>
            <line x1="75" y1="60" x2="88" y2="48"/>
          </g>
        </g>
        {/* Snowflakes — 6-point stars drifting down */}
        <g stroke={AC.bone} strokeWidth="0.4" fill="none">
          {[ {x:15,y:0,s:3,d:0},{x:38,y:0,s:4,d:0.5},{x:58,y:0,s:3,d:1},{x:82,y:0,s:4,d:0.3} ].map((f,i)=>(
            <g key={i} className="gl1-flake" style={{ animationDelay: `${f.d}s` }}>
              <g transform={`translate(${f.x} ${f.y})`}>
                <line x1="-3" y1="0" x2="3" y2="0"/>
                <line x1="0" y1="-3" x2="0" y2="3"/>
                <line x1="-2" y1="-2" x2="2" y2="2"/>
                <line x1="-2" y1="2" x2="2" y2="-2"/>
              </g>
            </g>
          ))}
        </g>
      </svg>
    </FxCanvas>
  );
}

// V2 · FROST STENCIL — dendritic bone frost grows from edges inward
function Gel_FrostStencil() {
  return (
    <FxCanvas>
      {/* Blue tint */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'rgba(94,184,255,0.18)',
        mixBlendMode: 'screen',
      }}/>
      {/* Dendritic frost on edges */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <clipPath id="gl2-clip">
            <rect x="0" y="0" width="100" height="100"/>
          </clipPath>
        </defs>
        <g clipPath="url(#gl2-clip)">
          {/* Top edge frost */}
          <g stroke={AC.bone} strokeWidth="0.6" fill="none" className="gl2-frost gl2-top" filter="url(#ac-rough)">
            {Array.from({length: 12}, (_, i) => (
              <g key={i} transform={`translate(${i * 9 + 4} 0)`}>
                <line x1="0" y1="0" x2="0" y2="15"/>
                <line x1="-2" y1="5" x2="2" y2="3"/>
                <line x1="-3" y1="10" x2="3" y2="8"/>
                <line x1="-1" y1="13" x2="3" y2="15"/>
              </g>
            ))}
          </g>
          {/* Bottom edge frost */}
          <g stroke={AC.bone} strokeWidth="0.6" fill="none" className="gl2-frost gl2-bot" filter="url(#ac-rough)">
            {Array.from({length: 12}, (_, i) => (
              <g key={i} transform={`translate(${i * 9 + 4} 100) scale(1 -1)`}>
                <line x1="0" y1="0" x2="0" y2="12"/>
                <line x1="-2" y1="4" x2="2" y2="2"/>
                <line x1="-3" y1="8" x2="3" y2="6"/>
              </g>
            ))}
          </g>
          {/* Left edge frost */}
          <g stroke={AC.bone} strokeWidth="0.6" fill="none" className="gl2-frost gl2-left" filter="url(#ac-rough)">
            {Array.from({length: 8}, (_, i) => (
              <g key={i} transform={`translate(0 ${i * 12 + 6}) rotate(-90)`}>
                <line x1="0" y1="0" x2="0" y2="10"/>
                <line x1="-2" y1="4" x2="2" y2="2"/>
              </g>
            ))}
          </g>
          {/* Right edge frost */}
          <g stroke={AC.bone} strokeWidth="0.6" fill="none" className="gl2-frost gl2-right" filter="url(#ac-rough)">
            {Array.from({length: 8}, (_, i) => (
              <g key={i} transform={`translate(100 ${i * 12 + 6}) rotate(90)`}>
                <line x1="0" y1="0" x2="0" y2="10"/>
                <line x1="-2" y1="4" x2="2" y2="2"/>
              </g>
            ))}
          </g>
        </g>
      </svg>
      {/* Central ice crystal — grows then freezes */}
      <div className="gl2-crystal" style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        fontFamily: AC_FONT_DISPLAY_HEAVY, fontWeight: 800, fontSize: 28,
        color: AC.hex, letterSpacing: '0.3em',
        filter: 'url(#ac-paint-text)',
        textShadow: `2px 2px 0 ${AC.ink}`,
      }}>// GELÉ //</div>
    </FxCanvas>
  );
}

// ────────────────────────────────────────────────────────────────────
// ZOOM PARASITE — roaming magnifier
// ────────────────────────────────────────────────────────────────────

// V1 · SPOTLIGHT ZOOM — circular window roams, outside covered in paint
function ZoomParasite_Spotlight() {
  return (
    <FxCanvas>
      {/* Bone paint cover with a circular hole punched in (mask via SVG) */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <mask id="zp1-mask">
            <rect x="0" y="0" width="100" height="100" fill="white"/>
            <circle cx="50" cy="50" r="16" fill="black" className="zp1-hole"/>
          </mask>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill={AC.bone2} opacity="0.85"
          mask="url(#zp1-mask)" filter="url(#ac-paint-spread)"/>
        {/* Paper grain on the cover */}
        <rect x="0" y="0" width="100" height="100" fill="url(#zp1-grain)" mask="url(#zp1-mask)"/>
        {/* Lens outline */}
        <circle cx="50" cy="50" r="16" fill="none" stroke={AC.shimmer} strokeWidth="1.2"
          filter="url(#ac-rougher)" className="zp1-lens-outline"/>
        {/* Crosshair */}
        <g stroke={AC.shimmer} strokeWidth="0.4" className="zp1-lens-outline">
          <line x1="50" y1="34" x2="50" y2="66" className="zp1-cross"/>
          <line x1="34" y1="50" x2="66" y2="50" className="zp1-cross"/>
        </g>
      </svg>
      {/* Roaming group */}
      <style>{`
        .zp1-hole, .zp1-lens-outline, .zp1-cross { animation: zp1-roam 6s ease-in-out infinite; transform-box: view-box; }
      `}</style>
      {/* Drips from the paint cover */}
      <svg viewBox="0 0 100 40" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40%' }}>
        <g filter="url(#ac-goo)" fill={AC.bone2} opacity="0.85">
          <rect x="12" y="0" width="2" height="8"/>
          <rect x="28" y="0" width="2" height="5"/>
          <rect x="70" y="0" width="2" height="7"/>
          <rect x="86" y="0" width="2" height="4"/>
        </g>
      </svg>
    </FxCanvas>
  );
}

// V2 · PAINT VIEWFINDER — rectangular viewport roaming, vertical stripes outside
function ZoomParasite_Viewfinder() {
  return (
    <FxCanvas>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <mask id="zp2-mask">
            <rect x="0" y="0" width="100" height="100" fill="white"/>
            <rect className="zp2-hole" x="35" y="35" width="30" height="22" fill="black"/>
          </mask>
          <pattern id="zp2-stripes" x="0" y="0" width="4" height="100" patternUnits="userSpaceOnUse">
            <rect x="0" y="0" width="2.5" height="100" fill={AC.bone2}/>
          </pattern>
        </defs>
        <rect x="0" y="0" width="100" height="100" fill="url(#zp2-stripes)" opacity="0.85"
          mask="url(#zp2-mask)" filter="url(#ac-paint-spread)"/>
        {/* Viewport frame + crosshair */}
        <g className="zp2-frame" stroke={AC.gold} strokeWidth="0.8" fill="none" filter="url(#ac-rougher)">
          <rect x="35" y="35" width="30" height="22"/>
          {/* Corner brackets */}
          <path d="M 35 40 L 35 35 L 40 35"/>
          <path d="M 60 35 L 65 35 L 65 40"/>
          <path d="M 35 52 L 35 57 L 40 57"/>
          <path d="M 60 57 L 65 57 L 65 52"/>
        </g>
      </svg>
      <style>{`.zp2-hole, .zp2-frame { animation: zp2-roam 5s ease-in-out infinite; transform-box: view-box; }`}</style>
    </FxCanvas>
  );
}

// ────────────────────────────────────────────────────────────────────
// TORNADE — slow rotation
// ────────────────────────────────────────────────────────────────────

// V1 · SLOW SPIN — image rotates + centrifugal paint streaks
function Tornade_SlowSpin() {
  return (
    <FxCanvas style={{ overflow: 'hidden' }}>
      <div className="tn1-spin" style={{
        position: 'absolute', inset: '-15%',
        background:
          "url('assets/poki-avatar.jpg') center/cover no-repeat",
      }}/>
      {/* Centrifugal paint streaks */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <g className="tn1-streaks" filter="url(#ac-goo)">
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <g key={i} transform={`rotate(${deg} 50 50)`}>
              <ellipse cx="50" cy="10" rx="1.5" ry="8" fill={i % 2 ? AC.shimmer : AC.rust} opacity="0.6"/>
            </g>
          ))}
        </g>
      </svg>
      {/* Center vortex mark */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        width: 20, height: 20, borderRadius: '50%',
        background: AC.shimmer, opacity: 0.3,
        filter: 'url(#ac-goo)',
      }}/>
    </FxCanvas>
  );
}

// V2 · PAINT WHIRLPOOL — spiral paint strokes rotate, image underneath also spins
function Tornade_PaintWhirlpool() {
  return (
    <FxCanvas style={{ overflow: 'hidden' }}>
      <div className="tn2-img" style={{
        position: 'absolute', inset: '-15%',
        background:
          "url('assets/poki-avatar.jpg') center/cover no-repeat",
      }}/>
      {/* Spiral paint */}
      <svg viewBox="-50 -50 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g className="tn2-spiral" filter="url(#ac-goo)">
          {Array.from({length: 60}, (_, i) => {
            const r = 3 + i * 0.7;
            const a = (i / 60) * Math.PI * 6;
            const x = Math.cos(a) * r;
            const y = Math.sin(a) * r;
            return <circle key={i} cx={x} cy={y} r={0.5 + (i/60) * 3}
              fill={i % 3 === 0 ? AC.rust : i % 3 === 1 ? AC.shimmer : AC.gold} opacity={0.75}/>;
          })}
        </g>
      </svg>
    </FxCanvas>
  );
}

// ────────────────────────────────────────────────────────────────────
// PUZZLE BREAK — 3×3 shuffled tiles
// ────────────────────────────────────────────────────────────────────

// V1 · TORN SHUFFLE — 9 torn-paper tiles rotate and swap positions
function PuzzleBreak_TornShuffle() {
  // 3×3 grid: each tile shows an arbitrary crop of the image
  // Animate: initial offset → shuffle positions (via CSS transforms)
  const tiles = [
    // [bgX, bgY, tx, ty, rot, delay]
    { sx: 0,   sy: 0,   d: 0.0, order: 4 },
    { sx: 100, sy: 0,   d: 0.08, order: 7 },
    { sx: 200, sy: 0,   d: 0.16, order: 2 },
    { sx: 0,   sy: 65,  d: 0.24, order: 9 },
    { sx: 100, sy: 65,  d: 0.32, order: 1 },
    { sx: 200, sy: 65,  d: 0.40, order: 5 },
    { sx: 0,   sy: 130, d: 0.48, order: 3 },
    { sx: 100, sy: 130, d: 0.56, order: 8 },
    { sx: 200, sy: 130, d: 0.64, order: 6 },
  ];
  return (
    <FxCanvas>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)',
        gap: 2,
      }}>
        {tiles.map((t, i) => (
          <div key={i} className={`pz1-tile pz1-t${t.order}`} style={{
            position: 'relative', overflow: 'hidden',
            clipPath: [
              'polygon(2% 4%, 98% 0%, 100% 96%, 0% 100%)',
              'polygon(0% 0%, 96% 4%, 100% 100%, 4% 98%)',
              'polygon(4% 0%, 100% 2%, 96% 100%, 0% 96%)',
            ][i % 3],
            background:
              'repeating-linear-gradient(135deg, rgba(240,228,193,0.06) 0 8px, rgba(240,228,193,0.02) 8px 16px),' +
              'radial-gradient(ellipse at 30% 40%, #2a2317 0%, #14100a 70%)',
            boxShadow: `inset 0 0 0 1px ${AC.bone2}`,
            animationDelay: `${t.d}s`,
          }}>
            <span style={{
              position: 'absolute', top: 4, left: 6,
              fontFamily: AC_FONT_MONO, fontSize: 9, color: AC.bone2, opacity: 0.6,
            }}>{String(t.order).padStart(2,'0')}</span>
          </div>
        ))}
      </div>
    </FxCanvas>
  );
}

// V2 · PAINT-TILE FLIP — tiles flip 3D showing painted backside
function PuzzleBreak_TileFlip() {
  return (
    <FxCanvas>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)',
        gap: 2, perspective: 600,
      }}>
        {Array.from({length: 9}, (_, i) => (
          <div key={i} className="pz2-tile" style={{
            position: 'relative', transformStyle: 'preserve-3d',
            animationDelay: `${i * 0.08}s`,
          }}>
            {/* Front = image crop */}
            <div style={{
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
              background:
                'repeating-linear-gradient(135deg, rgba(240,228,193,0.06) 0 8px, rgba(240,228,193,0.02) 8px 16px),' +
                'radial-gradient(ellipse at 30% 40%, #2a2317 0%, #14100a 70%)',
              boxShadow: `inset 0 0 0 1px ${AC.bone2}`,
            }}/>
            {/* Back = paint hatch */}
            <div style={{
              position: 'absolute', inset: 0, backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              background: `repeating-linear-gradient(-45deg, ${AC.bone} 0 4px, ${AC.bone2} 4px 8px)`,
              boxShadow: `inset 0 0 0 1px ${AC.ink}`,
            }}>
              <span style={{
                position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: AC_FONT_DISPLAY_HEAVY, fontSize: 28, color: AC.ink, fontWeight: 800,
                filter: 'url(#ac-paint-text)',
              }}>?</span>
            </div>
          </div>
        ))}
      </div>
    </FxCanvas>
  );
}

// ────────────────────────────────────────────────────────────────────
// SPEED — horizontal high-speed scroll
// ────────────────────────────────────────────────────────────────────

// V1 · CONVEYOR BLUR — image scrolls + paint speed lines
function Speed_ConveyorBlur() {
  return (
    <FxCanvas>
      {/* Scrolling image strip (2× duplicated for seamless scroll) */}
      <div className="sp1-scroll" style={{
        position: 'absolute', inset: 0,
        display: 'flex', width: '200%', filter: 'blur(1.5px)',
      }}>
        <div style={{
          flex: 1,
          background:
            "url('assets/poki-avatar.jpg') center/cover no-repeat",
        }}/>
        <div style={{
          flex: 1,
          background:
            "url('assets/poki-avatar.jpg') center/cover no-repeat",
        }}/>
      </div>
      {/* Horizontal motion lines overlay */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g stroke={AC.shimmer} strokeWidth="0.5" fill="none" className="sp1-lines" filter="url(#ac-paint-spread)">
          {Array.from({length: 14}, (_, i) => (
            <line key={i} x1="0" y1={8 + i * 7} x2="100" y2={8 + i * 7}
              strokeDasharray={`${20 + (i % 5) * 8} ${10 + (i % 3) * 5}`}
              opacity={0.5 + (i % 3) * 0.15}/>
          ))}
        </g>
      </svg>
      {/* Chevrons pointing right */}
      <div className="sp1-chev" style={{
        position: 'absolute', right: '8%', top: '50%', transform: 'translateY(-50%)',
      }}>
        <svg width="44" height="28" viewBox="0 0 44 28">
          <g stroke={AC.gold} strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#ac-rougher)">
            <polyline points="2,4 14,14 2,24"/>
            <polyline points="16,4 28,14 16,24"/>
            <polyline points="30,4 42,14 30,24"/>
          </g>
        </svg>
      </div>
    </FxCanvas>
  );
}

// V2 · REEL FILM — filmstrip with sprocket holes, fast scroll
function Speed_ReelFilm() {
  return (
    <FxCanvas>
      {/* Sprocket holes top */}
      <svg viewBox="0 0 100 8" preserveAspectRatio="none"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '8%' }}>
        <rect x="0" y="0" width="100" height="8" fill={AC.ink}/>
        <g className="sp2-sprockets" fill={AC.bone}>
          {Array.from({length: 14}, (_, i) => (
            <rect key={i} x={i * 8 + 1} y="2" width="4" height="4"/>
          ))}
        </g>
      </svg>
      {/* Scrolling image */}
      <div className="sp2-scroll" style={{
        position: 'absolute', inset: '8% 0', display: 'flex', width: '200%', filter: 'blur(0.8px)',
      }}>
        <div style={{
          flex: 1,
          background:
            "url('assets/poki-avatar.jpg') center/cover no-repeat",
        }}/>
        <div style={{
          flex: 1,
          background:
            "url('assets/poki-avatar.jpg') center/cover no-repeat",
        }}/>
      </div>
      {/* Sprocket holes bottom */}
      <svg viewBox="0 0 100 8" preserveAspectRatio="none"
        style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '8%' }}>
        <rect x="0" y="0" width="100" height="8" fill={AC.ink}/>
        <g className="sp2-sprockets" fill={AC.bone}>
          {Array.from({length: 14}, (_, i) => (
            <rect key={i} x={i * 8 + 1} y="2" width="4" height="4"/>
          ))}
        </g>
      </svg>
    </FxCanvas>
  );
}

Object.assign(window, {
  Sabre_CleanSlash, Sabre_PaperTear, Sabre_MultiSlash,
  Gel_IceCracks, Gel_FrostStencil, Gel_Shatter,
  ZoomParasite_Spotlight, ZoomParasite_Viewfinder, ZoomParasite_ScanBar,
  Tornade_SlowSpin, Tornade_PaintWhirlpool, Tornade_CyclonePull,
  PuzzleBreak_TornShuffle, PuzzleBreak_TileFlip, PuzzleBreak_PopOut,
  Speed_ConveyorBlur, Speed_ReelFilm, Speed_Hyperspace,
});

// ════════════════════════════════════════════════════════════════════
// V3 VARIATIONS — one per weapon (Sabre, Gel, ZoomParasite, Tornade,
// PuzzleBreak, Speed). Each is visually distinct from V1 + V2.
// ════════════════════════════════════════════════════════════════════

// SABRE V3 · MULTI-SLASH — three quick slashes carving ink triangles
function Sabre_MultiSlash() {
  return (
    <FxCanvas>
      {/* 3 ink triangles revealed by successive slashes */}
      <div className="sb3-ink sb3-i1" style={{
        position: 'absolute', inset: 0, background: AC.ink,
        clipPath: 'polygon(0 0, 50% 0, 0 100%)',
      }}/>
      <div className="sb3-ink sb3-i2" style={{
        position: 'absolute', inset: 0, background: AC.ink,
        clipPath: 'polygon(100% 0, 100% 60%, 50% 0)',
      }}/>
      <div className="sb3-ink sb3-i3" style={{
        position: 'absolute', inset: 0, background: AC.ink,
        clipPath: 'polygon(100% 100%, 0 100%, 100% 40%)',
      }}/>
      {/* 3 slash strokes */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g filter="url(#ac-paint-spread)">
          <path d="M 0 100 L 60 0" className="sb3-stroke sb3-s1" stroke={AC.shimmer} strokeWidth="2" fill="none"/>
          <path d="M 40 0 L 100 70" className="sb3-stroke sb3-s2" stroke={AC.shimmer} strokeWidth="2" fill="none"/>
          <path d="M 110 30 L -10 110" className="sb3-stroke sb3-s3" stroke={AC.shimmer} strokeWidth="2" fill="none"/>
        </g>
        <g className="sb3-splat sb3-sp3" filter="url(#ac-goo)" fill={AC.ink}>
          <circle cx="50" cy="50" r="4"/>
          <circle cx="40" cy="60" r="2"/>
          <circle cx="62" cy="42" r="2.5"/>
        </g>
      </svg>
      {/* Kanji-style CUT badge, bottom right */}
      <div className="sb3-badge" style={{
        position: 'absolute', right: '10%', bottom: '15%',
        fontFamily: AC_FONT_DISPLAY_HEAVY, fontSize: 42, fontWeight: 800,
        color: AC.shimmer, letterSpacing: '-0.02em', textTransform: 'uppercase',
        filter: 'url(#ac-paint-text-heavy)', transform: 'rotate(-6deg)',
        WebkitTextStroke: `2px ${AC.ink}`,
      }}>×3</div>
    </FxCanvas>
  );
}

// GEL V3 · SHATTER — image freezes then shatters into 6 ice shards drifting away
function Gel_Shatter() {
  const shards = [
    { clip: 'polygon(0 0, 50% 0, 40% 50%, 0 60%)',         tx: -14, ty:  -8, r: -6, d: 0 },
    { clip: 'polygon(50% 0, 100% 0, 100% 45%, 60% 55%, 40% 50%)', tx: 16,  ty:  -6, r:  4, d: 0.1 },
    { clip: 'polygon(0 60%, 40% 50%, 35% 100%, 0 100%)',   tx: -12, ty:  10, r:  6, d: 0.2 },
    { clip: 'polygon(40% 50%, 60% 55%, 70% 100%, 35% 100%)', tx: 0, ty: 14, r: -2, d: 0.15 },
    { clip: 'polygon(60% 55%, 100% 45%, 100% 100%, 70% 100%)', tx: 14, ty: 10, r: 5, d: 0.25 },
  ];
  return (
    <FxCanvas>
      {/* Blue freeze wash behind */}
      <div className="gl3-freeze" style={{
        position: 'absolute', inset: 0,
        background: 'rgba(94,184,255,0.25)',
        mixBlendMode: 'screen',
      }}/>
      {/* Shards each showing the image, drifting apart */}
      {shards.map((s, i) => (
        <div key={i} className="gl3-shard" style={{
          position: 'absolute', inset: 0,
          background: "url('assets/poki-avatar.jpg') center/cover no-repeat",
          clipPath: s.clip,
          '--tx': `${s.tx}px`, '--ty': `${s.ty}px`, '--r': `${s.r}deg`,
          animationDelay: `${s.d}s`,
          boxShadow: `0 0 0 0.5px ${AC.bone}`,
        }}/>
      ))}
      {/* Ice crack lines in the gaps */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <g stroke={AC.bone} strokeWidth="0.5" fill="none" className="gl3-cracks" filter="url(#ac-rough)">
          <path d="M 50 0 L 40 50 L 0 60"/>
          <path d="M 50 0 L 60 55 L 100 45"/>
          <path d="M 40 50 L 35 100"/>
          <path d="M 60 55 L 70 100"/>
        </g>
      </svg>
      {/* SHATTERED stamp */}
      <div className="gl3-tag" style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%) rotate(-3deg)',
      }}>
        <span style={{
          fontFamily: AC_FONT_DISPLAY_HEAVY, fontSize: 28, fontWeight: 800,
          color: AC.hex, background: AC.ink, padding: '4px 12px',
          letterSpacing: '0.1em', textTransform: 'uppercase',
          border: `2px solid ${AC.hex}`,
        }}>// CRACKED</span>
      </div>
    </FxCanvas>
  );
}

// ZOOM PARASITE V3 · SCAN BAR — narrow horizontal reveal slit scans up/down
function ZoomParasite_ScanBar() {
  return (
    <FxCanvas>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <defs>
          <mask id="zp3-mask">
            <rect x="0" y="0" width="100" height="100" fill="white"/>
            <rect className="zp3-slit" x="0" y="45" width="100" height="10" fill="black"/>
          </mask>
        </defs>
        {/* Bone cover with slit cut */}
        <rect x="0" y="0" width="100" height="100" fill={AC.bone2} opacity="0.85"
          mask="url(#zp3-mask)" filter="url(#ac-paint-spread)"/>
      </svg>
      {/* Slit frame + guide lines */}
      <div className="zp3-frame" style={{
        position: 'absolute', left: 0, right: 0, height: '10%',
        borderTop: `1.5px solid ${AC.gold}`,
        borderBottom: `1.5px solid ${AC.gold}`,
        pointerEvents: 'none',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
          width: 12, height: 2, background: AC.gold,
        }}/>
        <div style={{
          position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
          width: 12, height: 2, background: AC.gold,
        }}/>
      </div>
      {/* SCAN label */}
      <div className="zp3-label zp3-frame" style={{
        position: 'absolute', right: 14,
        fontFamily: AC_FONT_MONO, fontSize: 10, letterSpacing: '0.3em',
        color: AC.ink, background: AC.gold, padding: '2px 6px',
        textTransform: 'uppercase', transform: 'translateY(-140%)',
      }}>// SCAN</div>
    </FxCanvas>
  );
}

// TORNADE V3 · CYCLONE PULL — image scales down + rotates fast into vortex
function Tornade_CyclonePull() {
  return (
    <FxCanvas style={{ overflow: 'hidden' }}>
      <div className="tn3-pull" style={{
        position: 'absolute', inset: 0,
        background: "url('assets/poki-avatar.jpg') center/cover no-repeat",
        transformOrigin: 'center',
      }}/>
      {/* Concentric cyclone rings */}
      <svg viewBox="-50 -50 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g className="tn3-rings" stroke={AC.shimmer} strokeWidth="0.4" fill="none" filter="url(#ac-rough)">
          {[8, 16, 24, 32, 40].map((r, i) => (
            <circle key={i} cx="0" cy="0" r={r} strokeDasharray={`${4 + i}`} opacity={0.5 + i * 0.1}/>
          ))}
        </g>
      </svg>
      {/* Arrow sweep spiral */}
      <svg viewBox="-50 -50 100 100" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g className="tn3-sweep" filter="url(#ac-goo)" fill={AC.rust}>
          {[0, 72, 144, 216, 288].map((deg, i) => (
            <g key={i} transform={`rotate(${deg})`}>
              <path d="M 0 -38 L -2 -26 L 2 -26 Z" opacity="0.7"/>
            </g>
          ))}
        </g>
      </svg>
      {/* Center black hole */}
      <div className="tn3-hole" style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        width: 10, height: 10, borderRadius: '50%',
        background: AC.ink,
        boxShadow: `0 0 14px 4px ${AC.ink}`,
      }}/>
    </FxCanvas>
  );
}

// PUZZLE BREAK V3 · POP-OUT — 9 tiles pop out in sequence revealing ink gaps + ? marks
function PuzzleBreak_PopOut() {
  return (
    <FxCanvas>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)',
        gap: 2,
      }}>
        {Array.from({length: 9}, (_, i) => {
          const col = i % 3, row = Math.floor(i / 3);
          return (
            <div key={i} style={{ position: 'relative', overflow: 'hidden' }}>
              {/* Ink background = gap shown when tile pops */}
              <div style={{
                position: 'absolute', inset: 0, background: AC.ink,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: AC.shimmer, fontFamily: AC_FONT_DISPLAY_HEAVY, fontSize: 24, fontWeight: 800,
              }}>?</div>
              {/* The image tile that pops forward + fades */}
              <div className="pz3-tile" style={{
                position: 'absolute', inset: 0,
                background: `url('assets/poki-avatar.jpg') ${col * 50}% ${row * 50}% / 300% 300% no-repeat`,
                animationDelay: `${((i * 3) % 9) * 0.09}s`,
                boxShadow: `inset 0 0 0 1px ${AC.bone2}`,
              }}/>
            </div>
          );
        })}
      </div>
    </FxCanvas>
  );
}

// SPEED V3 · HYPERSPACE — radial speed lines burst from center toward edges
function Speed_Hyperspace() {
  return (
    <FxCanvas>
      {/* Image zoom-pulsing */}
      <div className="sp3-zoom" style={{
        position: 'absolute', inset: 0,
        background: "url('assets/poki-avatar.jpg') center/cover no-repeat",
        filter: 'blur(1.2px)',
      }}/>
      {/* Radial streaks */}
      <svg viewBox="-50 -50 100 100" preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
        <g className="sp3-lines">
          {Array.from({length: 20}, (_, i) => {
            const a = (i / 20) * Math.PI * 2 + (i % 2 ? 0.08 : 0);
            const r1 = 4 + (i % 3);
            const r2 = 55;
            const x1 = Math.cos(a) * r1, y1 = Math.sin(a) * r1;
            const x2 = Math.cos(a) * r2, y2 = Math.sin(a) * r2;
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={i % 2 ? AC.shimmer : AC.gold} strokeWidth="0.5"
              opacity={0.6 + (i % 3) * 0.15}/>;
          })}
        </g>
      </svg>
      {/* Center flash */}
      <div className="sp3-core" style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
        width: 40, height: 40, borderRadius: '50%',
        background: `radial-gradient(circle, ${AC.bone} 0%, transparent 70%)`,
        mixBlendMode: 'screen',
      }}/>
    </FxCanvas>
  );
}
