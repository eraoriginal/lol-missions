// Weapon FX — animation prototypes for C4 + Fumigène
// Each FX is a standalone component that loops a CSS animation over a
// fake "game image" background. No JS timeline needed — pure CSS keyframes
// driven from a shared style block.

// ────────────────────────────────────────────────────────────────────
// Fake game image — used as the canvas for every weapon effect.
// Same visual language as AcImagePlaceholder but simpler since FX sits on top.
// ────────────────────────────────────────────────────────────────────
function FxCanvas({ children, style = {} }) {
  return (
    <div style={{
      position: 'relative', width: '100%', aspectRatio: '16 / 10',
      overflow: 'hidden',
      background: `url('assets/poki-avatar.jpg') center/cover no-repeat, #0D0B08`,
      boxShadow: `inset 0 0 0 2px ${AC.bone}`,
      clipPath: 'polygon(1% 4%, 4% 1%, 20% 3%, 50% 1%, 78% 4%, 98% 2%, 99% 20%, 97% 55%, 99% 82%, 96% 99%, 70% 97%, 40% 99%, 12% 97%, 2% 99%, 1% 80%, 3% 40%)',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// C4 — 3 variations
// ────────────────────────────────────────────────────────────────────

// V1 · PAINT BLAST — image cracks radially, paint drips bleed from fractures
function C4_PaintBlast() {
  const cracks = [
    { x1: 50, y1: 50, x2: 6,  y2: 4,   delay: 0 },
    { x1: 50, y1: 50, x2: 96, y2: 12,  delay: 0.05 },
    { x1: 50, y1: 50, x2: 90, y2: 96,  delay: 0.1 },
    { x1: 50, y1: 50, x2: 14, y2: 92,  delay: 0.07 },
    { x1: 50, y1: 50, x2: 48, y2: 2,   delay: 0.12 },
    { x1: 50, y1: 50, x2: 52, y2: 98,  delay: 0.15 },
    { x1: 50, y1: 50, x2: 98, y2: 52,  delay: 0.08 },
    { x1: 50, y1: 50, x2: 2,  y2: 50,  delay: 0.13 },
  ];
  const drips = [
    { x: 18, d: 0.4, c: AC.rust    },
    { x: 32, d: 0.6, c: AC.shimmer },
    { x: 50, d: 0.35,c: AC.rust    },
    { x: 68, d: 0.55,c: AC.shimmer },
    { x: 82, d: 0.45,c: AC.rust    },
  ];
  return (
    <FxCanvas>
      <div className="c4-shake" style={{ position: 'absolute', inset: 0 }}>
        {/* Flash */}
        <div className="c4-flash" style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 50% 50%, ${AC.gold} 0%, ${AC.rust} 30%, transparent 60%)`,
          mixBlendMode: 'screen',
        }}/>
        {/* Cracks */}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <g stroke={AC.bone} strokeWidth="0.6" fill="none" filter="url(#ac-rougher)">
            {cracks.map((c, i) => (
              <line key={i} x1={c.x1} y1={c.y1} x2={c.x2} y2={c.y2}
                className="c4-crack" style={{ animationDelay: `${c.delay}s` }}/>
            ))}
          </g>
        </svg>
        {/* Paint drips from center outward */}
        {drips.map((d, i) => (
          <div key={i} className="c4-drip" style={{
            position: 'absolute', left: `${d.x}%`, top: '40%',
            width: 18, height: '60%',
            animationDelay: `${d.d}s`,
            transformOrigin: 'top center',
          }}>
            <svg viewBox="0 0 20 80" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <g fill={d.c} filter="url(#ac-goo)">
                <rect x="5" y="0" width="10" height="60"/>
                <circle cx="10" cy="60" r="6"/>
                <circle cx="14" cy="50" r="3"/>
              </g>
            </svg>
          </div>
        ))}
        {/* BOOM stamp */}
        <div className="c4-boom" style={{
          position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%) rotate(-5deg)',
        }}>
          <span style={{
            fontFamily: AC_FONT_DISPLAY_HEAVY, fontWeight: 800, fontSize: 64,
            color: AC.shimmer, letterSpacing: '-0.02em', textTransform: 'uppercase',
            filter: 'url(#ac-paint-text-heavy)',
            textShadow: `4px 4px 0 ${AC.ink}, -2px -2px 0 ${AC.gold}`,
            WebkitTextStroke: `2px ${AC.ink}`,
          }}>BOOM</span>
        </div>
      </div>
    </FxCanvas>
  );
}

// V2 · INK BLAST — ink splat erupts from center, covers 60%, drips, reveals
function C4_InkBlast() {
  return (
    <FxCanvas>
      <div className="c4v2-shake" style={{ position: 'absolute', inset: 0 }}>
        {/* Shockwave ring */}
        <div className="c4v2-ring" style={{
          position: 'absolute', left: '50%', top: '50%',
          width: 40, height: 40, marginLeft: -20, marginTop: -20,
          border: `4px solid ${AC.gold}`, borderRadius: '50%',
          filter: 'url(#ac-rougher)',
        }}/>
        {/* Main ink blob */}
        <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
          }}>
          <g className="c4v2-blob" filter="url(#ac-paint-spread)">
            <ellipse cx="100" cy="100" rx="70" ry="60" fill={AC.rust}/>
            <ellipse cx="160" cy="90"  rx="14" ry="10" fill={AC.rust}/>
            <ellipse cx="40"  cy="110" rx="12" ry="9"  fill={AC.rust}/>
            <ellipse cx="130" cy="160" rx="16" ry="12" fill={AC.rust}/>
            <ellipse cx="60"  cy="40"  rx="10" ry="8"  fill={AC.rust}/>
            <ellipse cx="90"  cy="170" rx="14" ry="10" fill={AC.shimmer}/>
            <ellipse cx="170" cy="140" rx="10" ry="8"  fill={AC.shimmer}/>
          </g>
        </svg>
        {/* Ink drips down */}
        <svg viewBox="0 0 200 100" preserveAspectRatio="none"
          style={{ position: 'absolute', left: 0, right: 0, top: '50%', width: '100%', height: '50%' }}>
          <g className="c4v2-drips" fill={AC.rust} filter="url(#ac-goo)">
            <rect x="30"  y="-5" width="12" height="0" className="c4v2-drop c4v2-drop-1"/>
            <rect x="70"  y="-5" width="10" height="0" className="c4v2-drop c4v2-drop-2"/>
            <rect x="105" y="-5" width="14" height="0" className="c4v2-drop c4v2-drop-3"/>
            <rect x="140" y="-5" width="10" height="0" className="c4v2-drop c4v2-drop-4"/>
            <rect x="170" y="-5" width="12" height="0" className="c4v2-drop c4v2-drop-5"/>
          </g>
        </svg>
        {/* C4 tag */}
        <div className="c4v2-tag" style={{
          position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%) rotate(-8deg)',
        }}>
          <span style={{
            fontFamily: AC_FONT_DISPLAY_HEAVY, fontWeight: 800, fontSize: 84,
            color: AC.bone, textTransform: 'uppercase',
            filter: 'url(#ac-paint-text-heavy)',
            WebkitTextStroke: `3px ${AC.ink}`,
          }}>C4</span>
        </div>
      </div>
    </FxCanvas>
  );
}

// V3 · GRAFFITI TAG RAID — rapid-fire graffiti marks cover the image, ending in a big tag
function C4_GraffitiRaid() {
  const tags = [
    { type: 'x',     x: 18, y: 20, size: 60, color: AC.rust,    rot: -12, delay: 0.05 },
    { type: 'star',  x: 78, y: 18, size: 70, color: AC.shimmer, rot: 8,   delay: 0.12 },
    { type: 'zigzag',x: 50, y: 30, size: 160, color: AC.gold,   rot: -4,  delay: 0.2  },
    { type: 'x',     x: 82, y: 70, size: 80, color: AC.rust,    rot: 14,  delay: 0.28 },
    { type: 'star',  x: 22, y: 74, size: 60, color: AC.chem,    rot: -8,  delay: 0.35 },
    { type: 'zigzag',x: 50, y: 80, size: 140, color: AC.shimmer,rot: 6,   delay: 0.42 },
    { type: 'x',     x: 50, y: 50, size: 140, color: AC.shimmer,rot: -5,  delay: 0.55 },
  ];
  return (
    <FxCanvas>
      <div className="c4v3-shake" style={{ position: 'absolute', inset: 0 }}>
        {tags.map((t, i) => (
          <div key={i} className="c4v3-slam" style={{
            position: 'absolute', left: `${t.x}%`, top: `${t.y}%`,
            transform: `translate(-50%, -50%) rotate(${t.rot}deg)`,
            animationDelay: `${t.delay}s`,
          }}>
            {t.type === 'x' && <AcCrossTag color={t.color} size={t.size} stroke={8}/>}
            {t.type === 'star' && <AcStar color={t.color} size={t.size} filled={i % 2 === 0} stroke={5}/>}
            {t.type === 'zigzag' && <AcZigzag color={t.color} size={t.size} stroke={6}/>}
          </div>
        ))}
        {/* Final BOOM stencil */}
        <div className="c4v3-boom" style={{
          position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%) rotate(-4deg)',
        }}>
          <div style={{
            display: 'inline-block', padding: '8px 24px',
            background: AC.ink, border: `4px solid ${AC.shimmer}`,
          }}>
            <span style={{
              fontFamily: AC_FONT_DISPLAY_HEAVY, fontWeight: 800, fontSize: 68,
              color: AC.shimmer, letterSpacing: '0.04em', textTransform: 'uppercase',
              filter: 'url(#ac-paint-text-heavy)',
            }}>BOOM</span>
          </div>
        </div>
      </div>
    </FxCanvas>
  );
}

// ────────────────────────────────────────────────────────────────────
// FUMIGÈNE — 3 variations
// ────────────────────────────────────────────────────────────────────

// V1 · PAINT CURTAIN — thick goo drips descend from top, pool into a wash
function Fume_PaintCurtain() {
  const drips = [
    { x: 4,  w: 34, delay: 0,    dur: 2.2 },
    { x: 18, w: 26, delay: 0.3,  dur: 2.5 },
    { x: 32, w: 40, delay: 0.1,  dur: 2.0 },
    { x: 50, w: 32, delay: 0.5,  dur: 2.3 },
    { x: 66, w: 28, delay: 0.2,  dur: 2.4 },
    { x: 78, w: 36, delay: 0.4,  dur: 2.1 },
    { x: 90, w: 26, delay: 0.15, dur: 2.6 },
  ];
  return (
    <FxCanvas>
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox="0 0 100 100" preserveAspectRatio="none">
        <g filter="url(#ac-goo)" fill={AC.bone2}>
          {drips.map((d, i) => (
            <g key={i} className="fm-drip" style={{ animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }}>
              <rect x={d.x} y="-10" width={d.w / 4} height="10"/>
              <circle cx={d.x + d.w / 8} cy="0" r={d.w / 8}/>
            </g>
          ))}
        </g>
      </svg>
      {/* Final wash cover */}
      <div className="fm-wash" style={{
        position: 'absolute', inset: 0,
        background: `
          radial-gradient(ellipse at 20% 30%, ${AC.bone} 0%, transparent 40%),
          radial-gradient(ellipse at 70% 60%, ${AC.bone2} 0%, transparent 45%),
          radial-gradient(ellipse at 50% 80%, ${AC.bone} 0%, transparent 40%),
          ${AC.bone2}
        `,
        filter: 'url(#ac-paint-spread)',
      }}/>
      {/* Grain overlay on wash */}
      <div className="fm-grain" style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(13,11,8,0.18) 1px, transparent 1px)',
        backgroundSize: '4px 4px',
      }}/>
      {/* Tag */}
      <div className="fm-tag" style={{
        position: 'absolute', left: '50%', top: '52%', transform: 'translate(-50%, -50%) rotate(-4deg)',
      }}>
        <span style={{
          fontFamily: AC_FONT_DISPLAY_HEAVY, fontWeight: 800, fontSize: 46,
          color: AC.ink, textTransform: 'uppercase', letterSpacing: '0.02em',
          filter: 'url(#ac-paint-text)',
        }}>FUMIGÈNE</span>
      </div>
    </FxCanvas>
  );
}

// V2 · INK WASH — 4 giant splats from corners merge via goo.
// Semi-transparent: the image stays visible through the paint (~55% opacity).
function Fume_InkWash() {
  // Translucent bone tones — image silhouette shows through
  const paint1 = 'rgba(240, 228, 193, 0.58)'; // AC.bone @ 58%
  const paint2 = 'rgba(201, 187, 148, 0.55)'; // AC.bone2 @ 55%
  return (
    <FxCanvas>
      {/* Splats layer — translucent so game image remains legible */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox="0 0 100 100" preserveAspectRatio="none">
        <g filter="url(#ac-goo)">
          <g className="fm2-splat fm2-s1" fill={paint2}>
            <ellipse cx="10" cy="10" rx="20" ry="16"/>
            <circle cx="30" cy="8"  r="6"/>
            <circle cx="6"  cy="30" r="5"/>
          </g>
          <g className="fm2-splat fm2-s2" fill={paint1}>
            <ellipse cx="92" cy="14" rx="22" ry="18"/>
            <circle cx="74" cy="10" r="6"/>
            <circle cx="90" cy="36" r="7"/>
          </g>
          <g className="fm2-splat fm2-s3" fill={paint2}>
            <ellipse cx="14" cy="92" rx="22" ry="16"/>
            <circle cx="36" cy="88" r="7"/>
          </g>
          <g className="fm2-splat fm2-s4" fill={paint1}>
            <ellipse cx="88" cy="86" rx="24" ry="18"/>
            <circle cx="66" cy="88" r="6"/>
          </g>
          <g className="fm2-splat fm2-s5" fill={paint2}>
            <ellipse cx="50" cy="50" rx="26" ry="20"/>
          </g>
        </g>
      </svg>
      {/* Paper grain on the wash — reads as "paint", not "fog" */}
      <div className="fm2-grain" style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(13,11,8,0.22) 1px, transparent 1px)',
        backgroundSize: '3px 3px',
        mixBlendMode: 'multiply',
      }}/>
      {/* Drips at the bottom edge */}
      <svg style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40%' }}
        viewBox="0 0 100 40" preserveAspectRatio="none">
        <g filter="url(#ac-goo)" fill={paint2} className="fm2-bottomdrips">
          <rect x="18" y="0" width="3" height="0" className="fm2-d fm2-d1"/>
          <rect x="42" y="0" width="4" height="0" className="fm2-d fm2-d2"/>
          <rect x="68" y="0" width="3" height="0" className="fm2-d fm2-d3"/>
          <rect x="86" y="0" width="4" height="0" className="fm2-d fm2-d4"/>
        </g>
      </svg>
      <div className="fm2-tag" style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
      }}>
        <AcStamp color={AC.ink} bg={AC.bone} rotate={-3}>// NAPPÉ PAR FUMIGÈNE</AcStamp>
      </div>
    </FxCanvas>
  );
}

// V3 · HATCHING ROLLER — diagonal brushwork sweeps across, covering image
function Fume_HatchingRoller() {
  return (
    <FxCanvas>
      <div className="fm3-roller" style={{
        position: 'absolute', inset: 0,
        background: `
          repeating-linear-gradient(-50deg, ${AC.bone} 0 8px, ${AC.bone2} 8px 14px, ${AC.bone} 14px 22px, transparent 22px 26px)
        `,
        filter: 'url(#ac-paint-spread)',
      }}/>
      {/* Paint drips from the roller edge as it completes */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox="0 0 100 100" preserveAspectRatio="none">
        <g className="fm3-dripset" filter="url(#ac-goo)" fill={AC.bone2}>
          <rect x="10" y="0" width="3" height="0" className="fm3-d fm3-d1"/>
          <rect x="28" y="0" width="4" height="0" className="fm3-d fm3-d2"/>
          <rect x="48" y="0" width="3" height="0" className="fm3-d fm3-d3"/>
          <rect x="66" y="0" width="4" height="0" className="fm3-d fm3-d4"/>
          <rect x="84" y="0" width="3" height="0" className="fm3-d fm3-d5"/>
        </g>
      </svg>
      <div className="fm3-tag" style={{
        position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%) rotate(-3deg)',
      }}>
        <span style={{
          fontFamily: AC_FONT_DISPLAY_HEAVY, fontWeight: 800, fontSize: 52,
          color: AC.ink, textTransform: 'uppercase',
          filter: 'url(#ac-paint-text)',
          WebkitTextStroke: `1.5px ${AC.bone}`,
        }}>COUVERT</span>
      </div>
    </FxCanvas>
  );
}

// ────────────────────────────────────────────────────────────────────
// Prototype page
// ────────────────────────────────────────────────────────────────────

function WeaponFxCard({ title, subtitle, tint, children }) {
  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{
          fontFamily: AC_FONT_MONO, fontSize: 10, letterSpacing: '0.3em',
          color: tint, background: `${tint}22`, border: `1px solid ${tint}`,
          padding: '3px 7px', textTransform: 'uppercase', flexShrink: 0,
          lineHeight: 1.2,
        }}>{subtitle}</span>
        <span style={{
          fontFamily: AC_FONT_DISPLAY_HEAVY, fontWeight: 700, fontSize: 20,
          color: AC.bone, letterSpacing: '-0.005em', textTransform: 'uppercase',
          filter: 'url(#ac-paint-text)', whiteSpace: 'nowrap', lineHeight: 1,
        }}>{title}</span>
      </div>
      {children}
    </div>
  );
}

function WeaponFxScreen() {
  return (
    <AcScreen style={{ minHeight: 2200 }}>
      {/* Background splats */}
      <div style={{ position: 'absolute', top: -60, left: -60, pointerEvents: 'none' }}>
        <AcSplat color={AC.rust} size={360} opacity={0.4} seed={2}/>
      </div>
      <div style={{ position: 'absolute', bottom: -40, right: -60, pointerEvents: 'none' }}>
        <AcSplat color={AC.bone2} size={320} opacity={0.35} seed={4}/>
      </div>

      <div style={{ position: 'relative', padding: 52, maxWidth: 1240, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 30 }}>
          <div>
            <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, letterSpacing: '0.3em', color: AC.chem, marginBottom: 8 }}>
              // ARMORY.FX / proto.v1
            </div>
            <AcDisplay size={56}>EFFETS D&apos;<AcShim>ARME</AcShim></AcDisplay>
            <div style={{ fontFamily: AC_FONT_MONO, fontSize: 13, color: AC.bone2, marginTop: 14, maxWidth: 680 }}>
              // Boucle 3s · direction peinture / punk · jamais du « smoke » générique — de la bombe, de l&apos;encre, des drips.
            </div>
          </div>
          <AcStamp color={AC.gold} rotate={4}>// 36 PROPOSITIONS · 12 RETENUS</AcStamp>
        </div>

        {/* ============== RETENU · 12 ARMES ============== */}
        <div style={{
          position: 'relative', marginBottom: 60,
          border: `2px solid ${AC.chem}`, background: 'rgba(18,214,168,0.05)',
          padding: 28,
        }}>
          <div style={{
            position: 'absolute', top: -12, left: 24,
            background: AC.chem, color: AC.ink,
            fontFamily: AC_FONT_MONO, fontSize: 11, letterSpacing: '0.3em',
            padding: '4px 10px', transform: 'rotate(-2deg)', textTransform: 'uppercase',
          }}>// RETENU · 12 ARMES</div>
          <div style={{
            position: 'absolute', top: -14, right: 28,
          }}>
            <AcStamp color={AC.gold} rotate={3}>// À PRODUIRE</AcStamp>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 28, marginTop: 18,
          }}>
            {[
              { glyph: 'bomb',        name: 'C4',             shim: 'GRAFFITI RAID',  version: 'V3', Comp: C4_GraffitiRaid,        color: AC.gold,    desc: '// 6 tags posés (X, étoile, zigzag) → stencil BOOM final.' },
              { glyph: 'smoke',       name: 'FUMIGÈNE',       shim: 'PAINT CURTAIN',  version: 'V1', Comp: Fume_PaintCurtain,      color: AC.bone,    desc: '// coulures depuis le haut, goo filter → wash bone → tag.' },
              { glyph: 'saber',       name: 'SABRE',          shim: 'MULTI-SLASH',    version: 'V3', Comp: Sabre_MultiSlash,       color: AC.ink,     desc: '// 3 slashs consécutifs → 3 triangles ink · badge ×3.' },
              { glyph: 'snow',        name: 'GEL',            shim: 'SHATTER',        version: 'V3', Comp: Gel_Shatter,            color: AC.hex,     desc: '// l\u2019image se fige → éclats de glace s\u2019écartent · CRACKED.' },
              { glyph: 'zoom',        name: 'ZOOM PARASITE',  shim: 'SPOTLIGHT',      version: 'V1', Comp: ZoomParasite_Spotlight, color: AC.shimmer, desc: '// loupe circulaire + viseur shimmer · se déplace.' },
              { glyph: 'tornado',     name: 'TORNADE',        shim: 'CYCLONE PULL',   version: 'V3', Comp: Tornade_CyclonePull,    color: AC.violet,  desc: '// image tourne + rétrécit vers un trou noir central.' },
              { glyph: 'puzzle',      name: 'PUZZLE BREAK',   shim: 'POP-OUT',        version: 'V3', Comp: PuzzleBreak_PopOut,     color: AC.shimmer, desc: '// tuiles sautent en séquence · gaps ink avec « ? ».' },
              { glyph: 'speed',       name: 'SPEED',          shim: 'CONVEYOR BLUR',  version: 'V1', Comp: Speed_ConveyorBlur,     color: AC.shimmer, desc: '// image floue défile + lignes shimmer + chevrons gold.' },
              { glyph: 'flame',       name: 'TAG AÉROSOL',    shim: 'SPRAY CLOUD',    version: 'V2', Comp: Tag_SprayCloud,         color: AC.gold,    desc: '// 4 nuages aérosol (shimmer/gold/rust/chem) + tag TAG.' },
              { glyph: 'lightning',   name: 'GLITCH',         shim: 'DATAMOSH',       version: 'V3', Comp: Glitch_Datamosh,        color: AC.chem,    desc: '// bandes smearent + RGB split saturé + blocs corrupt.' },
              { glyph: 'thermometer', name: 'ACIDE',          shim: 'CORROSION',      version: 'V1', Comp: Acide_Corrosion,        color: AC.chem,    desc: '// 5 trous cascade + ring chem + rigole ink sous chaque.' },
              { glyph: 'target',      name: 'STROBE',         shim: 'NEON',           version: 'V1', Comp: Strobe_Neon,            color: AC.shimmer, desc: '// flash cycle 9 couleurs + anneau pulse + tag RAVE.' },
            ].map((w, i) => {
              const Comp = w.Comp;
              return (
                <div key={i} style={{ position: 'relative' }}>
                  {/* Index chip · top-left */}
                  <div style={{
                    position: 'absolute', top: -8, left: -8, zIndex: 3,
                    background: AC.ink, color: AC.chem,
                    fontFamily: AC_FONT_MONO, fontSize: 9, letterSpacing: '0.2em',
                    padding: '3px 6px', border: `1px solid ${AC.chem}`,
                  }}>{String(i + 1).padStart(2, '0')}</div>

                  {/* Header row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <AcGlyph kind={w.glyph} color={w.color} size={20} stroke={2.5}/>
                    <span style={{
                      fontFamily: AC_FONT_DISPLAY_HEAVY, fontWeight: 700, fontSize: 15,
                      color: AC.bone, letterSpacing: '-0.005em', textTransform: 'uppercase',
                      filter: 'url(#ac-paint-text)', whiteSpace: 'nowrap', lineHeight: 1,
                    }}>{w.name}</span>
                    <span style={{
                      fontFamily: AC_FONT_MONO, fontSize: 9, letterSpacing: '0.25em',
                      color: AC.gold, background: `${AC.gold}22`, border: `1px solid ${AC.gold}`,
                      padding: '2px 5px', textTransform: 'uppercase',
                    }}>{w.version}</span>
                  </div>
                  <div style={{
                    fontFamily: AC_FONT_MONO, fontSize: 10, letterSpacing: '0.25em',
                    color: w.color, marginBottom: 10, textTransform: 'uppercase',
                  }}>{w.shim}</div>
                  <Comp/>
                  <div style={{ fontFamily: AC_FONT_MONO, fontSize: 10, color: AC.bone2, marginTop: 10, lineHeight: 1.55 }}>
                    {w.desc}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ============== EXPLORATION (toutes les options) ============== */}
        <div style={{ marginBottom: 26 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            fontFamily: AC_FONT_MONO, fontSize: 10, letterSpacing: '0.3em', color: AC.bone2,
          }}>
            <span>// EXPLORATION COMPLÈTE</span>
            <div style={{ flex: 1, height: 0, borderTop: `1.5px dashed ${AC.bone2}`, opacity: 0.5 }}/>
            <span>36 variations · 12 armes</span>
          </div>
        </div>

        {/* C4 section */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap', rowGap: 8 }}>
            <AcSectionNum n={1}/>
            <AcGlyph kind="bomb" color={AC.rust} size={28} stroke={3}/>
            <AcDisplay size={30} style={{ whiteSpace: "nowrap", lineHeight: 1 }}>C4 · <AcShim color={AC.rust}>EXPLOSION</AcShim></AcDisplay>
          </div>
          <div style={{ fontFamily: AC_FONT_MONO, fontSize: 12, color: AC.bone2, marginBottom: 20 }}>
            // image qui détonne · flash + shake · laisse des traces qui bavent
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <WeaponFxCard title="Paint Blast" subtitle="V1" tint={AC.shimmer}>
              <C4_PaintBlast/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // fissures radiales → drips shimmer/rust → stamp BOOM. Secousse courte.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Ink Blast" subtitle="V2" tint={AC.rust}>
              <C4_InkBlast/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // onde choc gold → splat rust énorme → coulures down → tag C4.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Graffiti Raid" subtitle="V3" tint={AC.gold}>
              <C4_GraffitiRaid/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // 6 tags posés en 0.5s (X, étoile, zigzag) → stencil BOOM final.
              </div>
            </WeaponFxCard>
          </div>
        </div>

        {/* Fumigène section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap', rowGap: 8 }}>
            <AcSectionNum n={2}/>
            <AcGlyph kind="smoke" color={AC.bone2} size={28} stroke={3}/>
            <AcDisplay size={30} style={{ whiteSpace: "nowrap", lineHeight: 1 }}>FUMIGÈNE · <AcShim color={AC.bone2}>NAPPAGE</AcShim></AcDisplay>
          </div>
          <div style={{ fontFamily: AC_FONT_MONO, fontSize: 12, color: AC.bone2, marginBottom: 20 }}>
            // couverture progressive · bone paper qui bave sur l&apos;image · pas de flou gaussien
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <WeaponFxCard title="Paint Curtain" subtitle="V1" tint={AC.bone}>
              <Fume_PaintCurtain/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // coulures depuis le haut, goo filter → wash bone → tag « FUMIGÈNE ».
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Ink Wash" subtitle="V2" tint={AC.bone2}>
              <Fume_InkWash/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // 5 splats croissants fusionnent via goo → drips bas → tampon mono.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Hatching Roller" subtitle="V3" tint={AC.chem}>
              <Fume_HatchingRoller/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // rouleau diagonal qui balaie · hachures bone → drips + COUVERT.
              </div>
            </WeaponFxCard>
          </div>
        </div>

        {/* ═══════════ SABRE ═══════════ */}
        <div style={{ marginTop: 60, marginBottom: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap', rowGap: 8 }}>
            <AcSectionNum n={3}/>
            <AcGlyph kind="saber" color={AC.shimmer} size={28} stroke={3}/>
            <AcDisplay size={30} style={{ whiteSpace: "nowrap", lineHeight: 1 }}>SABRE · <AcShim color={AC.shimmer}>COUPE NETTE</AcShim></AcDisplay>
          </div>
          <div style={{ fontFamily: AC_FONT_MONO, fontSize: 12, color: AC.bone2, marginBottom: 20 }}>
            // coupe diagonale · une moitié passe à l&apos;encre · ne jamais couvrir les deux moitiés
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <WeaponFxCard title="Clean Slash" subtitle="V1" tint={AC.shimmer}>
              <Sabre_CleanSlash/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // trait de pinceau diagonal → moitié sup. remplie d&apos;encre → splatter + tag CUT.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Paper Tear" subtitle="V2" tint={AC.rust}>
              <Sabre_PaperTear/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // déchirure papier diagonale → rabat qui pivote → encre révélée dessous + drips.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Multi-Slash" subtitle="V3" tint={AC.ink}>
              <Sabre_MultiSlash/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // 3 slashs consécutifs → 3 triangles ink se remplissent · badge ×3 en bas-droite.
              </div>
            </WeaponFxCard>
          </div>
        </div>

        {/* ═══════════ GEL ═══════════ */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap', rowGap: 8 }}>
            <AcSectionNum n={4}/>
            <AcGlyph kind="snow" color={AC.hex} size={28} stroke={3}/>
            <AcDisplay size={30} style={{ whiteSpace: "nowrap", lineHeight: 1 }}>GEL · <AcShim color={AC.hex}>GIVRE</AcShim></AcDisplay>
          </div>
          <div style={{ fontFamily: AC_FONT_MONO, fontSize: 12, color: AC.bone2, marginBottom: 20 }}>
            // teinte bleue + craquelures + flocons · l&apos;image reste lisible mais figée
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <WeaponFxCard title="Ice Cracks" subtitle="V1" tint={AC.hex}>
              <Gel_IceCracks/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // teinte hex + fissures radiales qui s&apos;étendent + flocons bone qui tombent.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Frost Stencil" subtitle="V2" tint={AC.bone}>
              <Gel_FrostStencil/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // givre dendritique bone qui pousse depuis les 4 bords vers le centre.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Shatter" subtitle="V3" tint={AC.hex}>
              <Gel_Shatter/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // l'image se fige → éclats de glace s'écartent → tampon CRACKED.
              </div>
            </WeaponFxCard>
          </div>
        </div>

        {/* ═══════════ ZOOM PARASITE ═══════════ */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap', rowGap: 8 }}>
            <AcSectionNum n={5}/>
            <AcGlyph kind="zoom" color={AC.gold} size={28} stroke={3}/>
            <AcDisplay size={30} style={{ whiteSpace: "nowrap", lineHeight: 1 }}>ZOOM PARASITE · <AcShim color={AC.gold}>LUNETTE</AcShim></AcDisplay>
          </div>
          <div style={{ fontFamily: AC_FONT_MONO, fontSize: 12, color: AC.bone2, marginBottom: 20 }}>
            // fenêtre qui se balade · seul un petit crop visible à la fois · le reste couvert
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <WeaponFxCard title="Spotlight Zoom" subtitle="V1" tint={AC.shimmer}>
              <ZoomParasite_Spotlight/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // loupe circulaire + viseur shimmer + fond bone avec coulures · se déplace.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Paint Viewfinder" subtitle="V2" tint={AC.gold}>
              <ZoomParasite_Viewfinder/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // cadre rectangulaire gold + rayures verticales couvrent tout le reste.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Scan Bar" subtitle="V3" tint={AC.rust}>
              <ZoomParasite_ScanBar/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // fente horizontale gold qui scanne de haut en bas · seule cette bande est visible.
              </div>
            </WeaponFxCard>
          </div>
        </div>

        {/* ═══════════ TORNADE ═══════════ */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap', rowGap: 8 }}>
            <AcSectionNum n={6}/>
            <AcGlyph kind="tornado" color={AC.violet} size={28} stroke={3}/>
            <AcDisplay size={30} style={{ whiteSpace: "nowrap", lineHeight: 1 }}>TORNADE · <AcShim color={AC.violet}>SPIRALE</AcShim></AcDisplay>
          </div>
          <div style={{ fontFamily: AC_FONT_MONO, fontSize: 12, color: AC.bone2, marginBottom: 20 }}>
            // rotation lente de l&apos;image · traînées de peinture centrifuges · désoriente
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <WeaponFxCard title="Slow Spin" subtitle="V1" tint={AC.shimmer}>
              <Tornade_SlowSpin/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // image qui rote 6s/tour + 6 traînées rust/shimmer qui rotent 2× + vortex centre.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Paint Whirlpool" subtitle="V2" tint={AC.rust}>
              <Tornade_PaintWhirlpool/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // spirale de 60 points rust/shimmer/gold qui tourne · image tourne plus lentement.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Cyclone Pull" subtitle="V3" tint={AC.ink}>
              <Tornade_CyclonePull/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // l'image tourne et rétrécit vers un point noir central · cercles shimmer autour.
              </div>
            </WeaponFxCard>
          </div>
        </div>

        {/* ═══════════ PUZZLE BREAK ═══════════ */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap', rowGap: 8 }}>
            <AcSectionNum n={7}/>
            <AcGlyph kind="puzzle" color={AC.chem} size={28} stroke={3}/>
            <AcDisplay size={30} style={{ whiteSpace: "nowrap", lineHeight: 1 }}>PUZZLE BREAK · <AcShim color={AC.chem}>3×3</AcShim></AcDisplay>
          </div>
          <div style={{ fontFamily: AC_FONT_MONO, fontSize: 12, color: AC.bone2, marginBottom: 20 }}>
            // 9 tuiles aux bords déchirés · mélangées ou retournées · numérotées pour guider l&apos;œil
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <WeaponFxCard title="Torn Shuffle" subtitle="V1" tint={AC.chem}>
              <PuzzleBreak_TornShuffle/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // 9 tuiles aux clip-path déchirés · micro-offset/rotation pulse.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Tile Flip" subtitle="V2" tint={AC.hex}>
              <PuzzleBreak_TileFlip/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // tuiles qui flip 3D · dos hachuré bone/bone2 avec « ? » · plus lisible.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Pop-Out" subtitle="V3" tint={AC.shimmer}>
              <PuzzleBreak_PopOut/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // les tuiles sautent en séquence · gaps ink avec « ? » shimmer apparaissent.
              </div>
            </WeaponFxCard>
          </div>
        </div>

        {/* ═══════════ SPEED ═══════════ */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap', rowGap: 8 }}>
            <AcSectionNum n={8}/>
            <AcGlyph kind="speed" color={AC.gold} size={28} stroke={3}/>
            <AcDisplay size={30} style={{ whiteSpace: "nowrap", lineHeight: 1 }}>SPEED · <AcShim color={AC.gold}>DÉFILEMENT</AcShim></AcDisplay>
          </div>
          <div style={{ fontFamily: AC_FONT_MONO, fontSize: 12, color: AC.bone2, marginBottom: 20 }}>
            // défilement horizontal rapide · motion blur · marques de vitesse par-dessus
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <WeaponFxCard title="Conveyor Blur" subtitle="V1" tint={AC.shimmer}>
              <Speed_ConveyorBlur/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // image floue + défile infini + lignes shimmer pointillées + chevrons gold.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Reel Film" subtitle="V2" tint={AC.bone}>
              <Speed_ReelFilm/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // pellicule : perforations haut/bas bone sur ink + image qui défile au centre.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Hyperspace" subtitle="V3" tint={AC.gold}>
              <Speed_Hyperspace/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // zoom-pulse au centre · 20 traînées radiales shimmer/gold · flash central.
              </div>
            </WeaponFxCard>
          </div>
        </div>

        {/* ═══════════ DIVIDER — NOUVELLES ARMES ═══════════ */}
        <div style={{
          margin: '80px 0 40px', padding: '24px 0',
          borderTop: `2px solid ${AC.shimmer}`, borderBottom: `2px solid ${AC.shimmer}`,
          background: 'rgba(255,61,139,0.05)',
          textAlign: 'center', position: 'relative',
        }}>
          <div style={{
            position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
            background: AC.shimmer, color: AC.ink,
            fontFamily: AC_FONT_MONO, fontSize: 11, letterSpacing: '0.3em',
            padding: '4px 14px', textTransform: 'uppercase',
          }}>// 4 NOUVELLES PROPOSITIONS</div>
          <AcDisplay size={42} style={{ whiteSpace: "nowrap", lineHeight: 1 }}>
            EN <AcShim color={AC.shimmer}>PLUS</AcShim>&nbsp;DU CATALOGUE
          </AcDisplay>
          <div style={{ fontFamily: AC_FONT_MONO, fontSize: 12, color: AC.bone2, marginTop: 14, maxWidth: 720, margin: '14px auto 0' }}>
            // mécaniques d&apos;obstruction distinctes des 8 existantes · TAG (aérosol opaque)<br/>
            // GLITCH (CRT punk) · ACIDE (trous qui coulent) · STROBE (flash haute fréquence)
          </div>
        </div>

        {/* ═══════════ TAG ═══════════ */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap', rowGap: 8 }}>
            <AcSectionNum n={9}/>
            <AcGlyph kind="flame" color={AC.shimmer} size={28}/>
            <AcDisplay size={30} style={{ whiteSpace: "nowrap", lineHeight: 1 }}>TAG · <AcShim color={AC.shimmer}>AÉROSOL</AcShim></AcDisplay>
          </div>
          <div style={{ fontFamily: AC_FONT_MONO, fontSize: 12, color: AC.bone2, marginBottom: 20 }}>
            // 5 throws de graffiti opaques qui se superposent · distinct du Fumigène (transparent)<br/>
            // pitch : « un crew passe et flingue l&apos;image à coups de bombes »
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <WeaponFxCard title="Bomb Chain" subtitle="V1" tint={AC.shimmer}>
              <Tag_BombChain/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // throw-up + scribble + bigtag « RAID » + burst + cross · posés en 0.8s, drips en bas.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Spray Cloud" subtitle="V2" tint={AC.gold}>
              <Tag_SprayCloud/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // 4 nuages d&apos;aérosol (shimmer/gold/rust/chem) se superposent + tag TAG final.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Stencil Barrage" subtitle="V3" tint={AC.rust}>
              <Tag_StencilBarrage/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // 4 pochoirs (skull, OUT, TAG, target) slam en rythme · drips sous chacun.
              </div>
            </WeaponFxCard>
          </div>
        </div>

        {/* ═══════════ GLITCH ═══════════ */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap', rowGap: 8 }}>
            <AcSectionNum n={10}/>
            <AcGlyph kind="lightning" color={AC.hex} size={28}/>
            <AcDisplay size={30} style={{ whiteSpace: "nowrap", lineHeight: 1 }}>GLITCH · <AcShim color={AC.hex}>INTERFÉRENCE</AcShim></AcDisplay>
          </div>
          <div style={{ fontFamily: AC_FONT_MONO, fontSize: 12, color: AC.bone2, marginBottom: 20 }}>
            // bandes qui se déplacent + split RGB + scanlines · esthétique CRT/VHS punk<br/>
            // pitch : « la cassette est morte · bon courage pour lire le titre »
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <WeaponFxCard title="Band Tear" subtitle="V1" tint={AC.hex}>
              <Glitch_BandTear/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // 9 bandes horizontales glissent de ±12% + split RGB + scanlines + NO SIGNAL.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Pixel Crunch" subtitle="V2" tint={AC.shimmer}>
              <Glitch_PixelCrunch/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // pixels qui sautent + blocs colorés qui clignotent + erreur mono ERR 0x04.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Datamosh" subtitle="V3" tint={AC.chem}>
              <Glitch_Datamosh/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // bandes qui smearent horizontalement + split RGB saturé + blocs corrupt · tag MOSH.
              </div>
            </WeaponFxCard>
          </div>
        </div>

        {/* ═══════════ ACIDE ═══════════ */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap', rowGap: 8 }}>
            <AcSectionNum n={11}/>
            <AcGlyph kind="thermometer" color={AC.chem} size={28} stroke={3}/>
            <AcDisplay size={30} style={{ whiteSpace: "nowrap", lineHeight: 1 }}>ACIDE · <AcShim color={AC.chem}>CORROSION</AcShim></AcDisplay>
          </div>
          <div style={{ fontFamily: AC_FONT_MONO, fontSize: 12, color: AC.bone2, marginBottom: 20 }}>
            // des trous d&apos;encre se forment et coulent · chem autour du contour<br/>
            // pitch : « quelqu&apos;un a renversé de l&apos;acide sur l&apos;écran »
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <WeaponFxCard title="Corrosion" subtitle="V1" tint={AC.chem}>
              <Acide_Corrosion/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // 5 trous apparaissent en cascade + ring chem + rigole ink sous chaque trou.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Melt" subtitle="V2" tint={AC.ink}>
              <Acide_Melt/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // rideau qui descend depuis le haut, bord ondulé + 5 gouttes + tag pH.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Pool Rise" subtitle="V3" tint={AC.chem}>
              <Acide_PoolRise/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // flaque d'acide monte depuis le bas · surface ondulée chem + bulles qui montent.
              </div>
            </WeaponFxCard>
          </div>
        </div>

        {/* ═══════════ STROBE ═══════════ */}
        <div style={{ marginBottom: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22, flexWrap: 'wrap', rowGap: 8 }}>
            <AcSectionNum n={12}/>
            <AcGlyph kind="target" color={AC.violet} size={28} stroke={3}/>
            <AcDisplay size={30} style={{ whiteSpace: "nowrap", lineHeight: 1 }}>STROBE · <AcShim color={AC.violet}>FLASH</AcShim></AcDisplay>
          </div>
          <div style={{ fontFamily: AC_FONT_MONO, fontSize: 12, color: AC.bone2, marginBottom: 20 }}>
            // pulses de couleur haute fréquence · l&apos;image reste lisible mais fatigue l&apos;œil<br/>
            // pitch : « tu viens de te prendre un gyrophare en pleine face · bonne chance »<br/>
            // ⚠ accessibilité : afficher l&apos;option &quot;réduire les flashs&quot; dans les settings.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            <WeaponFxCard title="Neon Strobe" subtitle="V1" tint={AC.shimmer}>
              <Strobe_Neon/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // full-screen flash cycle 9 couleurs + anneau qui pulse + tag RAVE qui scintille.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Seizure Bars" subtitle="V2" tint={AC.gold}>
              <Strobe_SeizureBars/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // barres verticales 8 couleurs + flash bone en difference + tag 12Hz.
              </div>
            </WeaponFxCard>
            <WeaponFxCard title="Grid Flash" subtitle="V3" tint={AC.chem}>
              <Strobe_GridFlash/>
              <div style={{ fontFamily: AC_FONT_MONO, fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5 }}>
                // grille 3×3 de cellules qui flashent 9 couleurs différentes en séquence.
              </div>
            </WeaponFxCard>
          </div>
        </div>

        {/* Footer notes */}
        <div style={{ marginTop: 60, padding: '20px 22px', border: `1.5px dashed ${AC.bone2}`, background: 'rgba(240,228,193,0.03)' }}>
          <div style={{ fontFamily: AC_FONT_MONO, fontSize: 10, letterSpacing: '0.3em', color: AC.chem, marginBottom: 10 }}>
            // NOTES D&apos;IMPLÉM
          </div>
          <ul style={{
            fontFamily: AC_FONT_MONO, fontSize: 12, color: AC.bone, lineHeight: 1.8,
            margin: 0, paddingLeft: 20,
          }}>
            <li>// Filtres SVG : <span style={{color: AC.chem}}>ac-goo</span> (coulures fusionnées), <span style={{color: AC.chem}}>ac-paint-spread</span> (bords bavés), <span style={{color: AC.chem}}>ac-rougher</span> (tracés craqués).</li>
            <li>// Toutes les anims bouclent en 3s, mais dans le jeu la durée est définie par l&apos;arme (C4 = 2s, Fumigène = 6s).</li>
            <li>// Shake = <span style={{color: AC.chem}}>transform: translate</span> sur conteneur parent, 0.3s. Déclencher aussi une courte vibration device sur mobile.</li>
            <li>// La palette est strictement limitée aux tokens : rust + shimmer + gold pour C4 ; bone + bone2 pour Fumigène.</li>
            <li>// Assets produits via CSS + SVG uniquement — aucune bitmap — pour rester net à toutes tailles.</li>
          </ul>
        </div>
      </div>

      <WeaponFxStyles/>
    </AcScreen>
  );
}

// ────────────────────────────────────────────────────────────────────
// Keyframes — shared block
// ────────────────────────────────────────────────────────────────────
function WeaponFxStyles() {
  return (
    <style>{`
      /* ===== C4 V1 — PAINT BLAST ===== */
      @keyframes c4-shake {
        0%, 100% { transform: translate(0,0); }
        8%       { transform: translate(-6px, 3px); }
        16%      { transform: translate(5px, -4px); }
        24%      { transform: translate(-3px, -2px); }
        32%      { transform: translate(4px, 3px); }
        40%      { transform: translate(-2px, 0); }
        50%      { transform: translate(0,0); }
      }
      .c4-shake { animation: c4-shake 3s linear infinite; }
      @keyframes c4-flash {
        0%, 100% { opacity: 0; }
        2%       { opacity: 1; }
        12%      { opacity: 0.4; }
        25%      { opacity: 0; }
      }
      .c4-flash { animation: c4-flash 3s linear infinite; }
      @keyframes c4-crack {
        0%, 100%   { stroke-dasharray: 120; stroke-dashoffset: 120; opacity: 0; }
        6%         { opacity: 1; }
        25%        { stroke-dashoffset: 0; opacity: 1; }
        80%        { opacity: 1; }
        95%        { opacity: 0; }
      }
      .c4-crack { animation: c4-crack 3s ease-out infinite; }
      @keyframes c4-drip {
        0%, 35%  { transform: scaleY(0); opacity: 0; }
        45%      { transform: scaleY(0.2); opacity: 1; }
        90%      { transform: scaleY(1); opacity: 1; }
        100%     { transform: scaleY(1); opacity: 0; }
      }
      .c4-drip { animation: c4-drip 3s ease-in infinite; }
      @keyframes c4-boom {
        0%, 100% { opacity: 0; transform: translate(-50%, -50%) rotate(-5deg) scale(0); }
        8%       { opacity: 1; transform: translate(-50%, -50%) rotate(-5deg) scale(1.3); }
        16%      { opacity: 1; transform: translate(-50%, -50%) rotate(-5deg) scale(1); }
        70%      { opacity: 1; transform: translate(-50%, -50%) rotate(-5deg) scale(1); }
        85%      { opacity: 0; transform: translate(-50%, -50%) rotate(-5deg) scale(1.1); }
      }
      .c4-boom { animation: c4-boom 3s ease-out infinite; }

      /* ===== C4 V2 — INK BLAST ===== */
      @keyframes c4v2-shake {
        0%, 100% { transform: translate(0,0); }
        6%       { transform: translate(-5px, 2px); }
        12%      { transform: translate(4px, -3px); }
        20%      { transform: translate(-2px, 0); }
        28%      { transform: translate(0,0); }
      }
      .c4v2-shake { animation: c4v2-shake 3s linear infinite; }
      @keyframes c4v2-ring {
        0%   { width: 40px; height: 40px; margin-left: -20px; margin-top: -20px; opacity: 1; }
        20%  { width: 360px; height: 360px; margin-left: -180px; margin-top: -180px; opacity: 0; }
        100% { width: 360px; height: 360px; opacity: 0; }
      }
      .c4v2-ring { animation: c4v2-ring 3s ease-out infinite; }
      @keyframes c4v2-blob {
        0%, 100% { transform: translate(100px, 100px) scale(0); transform-origin: center; }
        10%      { transform: translate(0, 0) scale(1.2); }
        20%      { transform: translate(0, 0) scale(1); }
        80%      { transform: translate(0, 0) scale(1); }
        95%      { transform: translate(0, 0) scale(1); opacity: 0; }
      }
      .c4v2-blob {
        animation: c4v2-blob 3s ease-out infinite;
        transform-box: fill-box; transform-origin: center;
      }
      @keyframes c4v2-drop {
        0%, 20%  { height: 0; opacity: 0; }
        30%      { height: 0; opacity: 1; }
        70%      { height: 80px; opacity: 1; }
        90%      { height: 90px; opacity: 1; }
        100%     { height: 90px; opacity: 0; }
      }
      .c4v2-drop   { animation: c4v2-drop 3s ease-in infinite; }
      .c4v2-drop-1 { animation-delay: 0.2s; }
      .c4v2-drop-2 { animation-delay: 0.35s; }
      .c4v2-drop-3 { animation-delay: 0.25s; }
      .c4v2-drop-4 { animation-delay: 0.4s; }
      .c4v2-drop-5 { animation-delay: 0.3s; }
      @keyframes c4v2-tag {
        0%, 15%  { opacity: 0; transform: translate(-50%, -50%) rotate(-8deg) scale(0.3); }
        22%      { opacity: 1; transform: translate(-50%, -50%) rotate(-8deg) scale(1.2); }
        30%      { opacity: 1; transform: translate(-50%, -50%) rotate(-8deg) scale(1); }
        80%      { opacity: 1; transform: translate(-50%, -50%) rotate(-8deg) scale(1); }
        95%      { opacity: 0; }
      }
      .c4v2-tag { animation: c4v2-tag 3s ease-out infinite; }

      /* ===== C4 V3 — GRAFFITI RAID ===== */
      @keyframes c4v3-shake {
        0%, 100% { transform: translate(0,0); }
        10%      { transform: translate(-3px, 2px); }
        20%      { transform: translate(3px, -2px); }
        30%      { transform: translate(-2px, -1px); }
        40%      { transform: translate(2px, 2px); }
        50%      { transform: translate(0,0); }
      }
      .c4v3-shake { animation: c4v3-shake 3s linear infinite; }
      @keyframes c4v3-slam {
        0%, 100% { opacity: 0; transform: translate(-50%, -50%) rotate(var(--r, 0deg)) scale(0); }
        /* placeholder; individual delays animate in */
      }
      @keyframes c4v3-slamIn {
        0%         { opacity: 0; transform: translate(-50%, -50%) scale(1.6); }
        30%        { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        70%        { opacity: 1; }
        85%        { opacity: 0; }
        100%       { opacity: 0; }
      }
      .c4v3-slam { animation: c4v3-slamIn 3s ease-out infinite; opacity: 0; }
      @keyframes c4v3-boom {
        0%, 60%  { opacity: 0; transform: translate(-50%, -50%) rotate(-4deg) scale(0); }
        68%      { opacity: 1; transform: translate(-50%, -50%) rotate(-4deg) scale(1.25); }
        76%      { opacity: 1; transform: translate(-50%, -50%) rotate(-4deg) scale(1); }
        90%      { opacity: 1; transform: translate(-50%, -50%) rotate(-4deg) scale(1); }
        100%     { opacity: 0; }
      }
      .c4v3-boom { animation: c4v3-boom 3s ease-out infinite; }

      /* ===== FUMIGÈNE V1 — PAINT CURTAIN ===== */
      @keyframes fm-drip {
        0%   { transform: translateY(0); }
        100% { transform: translateY(110%); }
      }
      .fm-drip { animation-name: fm-drip; animation-timing-function: cubic-bezier(.55,.05,.68,.53); animation-iteration-count: infinite; transform-box: fill-box; }
      @keyframes fm-wash {
        0%, 30% { opacity: 0; }
        55%     { opacity: 0.7; }
        75%, 90%{ opacity: 0.92; }
        100%    { opacity: 0; }
      }
      .fm-wash { animation: fm-wash 3s ease-in infinite; }
      @keyframes fm-grain {
        0%, 30% { opacity: 0; }
        60%     { opacity: 0.4; }
        90%     { opacity: 0.4; }
        100%    { opacity: 0; }
      }
      .fm-grain { animation: fm-grain 3s ease-in infinite; }
      @keyframes fm-tag {
        0%, 70%  { opacity: 0; transform: translate(-50%, -50%) rotate(-4deg) scale(0.6); }
        82%      { opacity: 1; transform: translate(-50%, -50%) rotate(-4deg) scale(1); }
        92%      { opacity: 1; }
        100%     { opacity: 0; }
      }
      .fm-tag { animation: fm-tag 3s ease-out infinite; }

      /* ===== FUMIGÈNE V2 — INK WASH ===== */
      @keyframes fm2-splat {
        0%, 100% { transform: scale(0); opacity: 0; }
        20%      { transform: scale(1.1); opacity: 1; }
        40%      { transform: scale(1); opacity: 1; }
        85%      { transform: scale(1); opacity: 1; }
        95%      { opacity: 0; }
      }
      .fm2-splat { animation: fm2-splat 3s ease-out infinite; transform-box: fill-box; transform-origin: center; }
      @keyframes fm2-grain {
        0%, 20%  { opacity: 0; }
        50%      { opacity: 0.5; }
        85%      { opacity: 0.5; }
        100%     { opacity: 0; }
      }
      .fm2-grain { animation: fm2-grain 3s ease-out infinite; }
      .fm2-s1 { animation-delay: 0s; }
      .fm2-s2 { animation-delay: 0.15s; }
      .fm2-s3 { animation-delay: 0.3s; }
      .fm2-s4 { animation-delay: 0.45s; }
      .fm2-s5 { animation-delay: 0.8s; }
      @keyframes fm2-drop {
        0%, 55%  { height: 0; opacity: 0; }
        70%      { height: 20; opacity: 1; }
        90%      { height: 38; opacity: 1; }
        100%     { opacity: 0; }
      }
      .fm2-d   { animation: fm2-drop 3s ease-in infinite; }
      .fm2-d1  { animation-delay: 0.1s; }
      .fm2-d2  { animation-delay: 0.25s; }
      .fm2-d3  { animation-delay: 0.15s; }
      .fm2-d4  { animation-delay: 0.3s; }
      @keyframes fm2-tag {
        0%, 80%  { opacity: 0; transform: translate(-50%, -50%) rotate(-3deg); }
        88%      { opacity: 1; }
        95%      { opacity: 1; }
        100%     { opacity: 0; }
      }
      .fm2-tag { animation: fm2-tag 3s ease-out infinite; }

      /* ===== FUMIGÈNE V3 — HATCHING ROLLER ===== */
      @keyframes fm3-roller {
        0%   { clip-path: inset(0 100% 0 0); }
        60%  { clip-path: inset(0 0 0 0); }
        85%  { clip-path: inset(0 0 0 0); }
        100% { clip-path: inset(0 0 0 0); opacity: 0; }
      }
      .fm3-roller { animation: fm3-roller 3s ease-out infinite; }
      @keyframes fm3-d {
        0%, 55%  { height: 0; opacity: 0; }
        75%      { height: 25; opacity: 1; }
        90%      { height: 42; opacity: 1; }
        100%     { opacity: 0; }
      }
      .fm3-d  { animation: fm3-d 3s ease-in infinite; }
      .fm3-d1 { animation-delay: 0.1s; }
      .fm3-d2 { animation-delay: 0.25s; }
      .fm3-d3 { animation-delay: 0.18s; }
      .fm3-d4 { animation-delay: 0.3s; }
      .fm3-d5 { animation-delay: 0.2s; }
      @keyframes fm3-tag {
        0%, 70%  { opacity: 0; transform: translate(-50%, -50%) rotate(-3deg) scale(0.5); }
        82%      { opacity: 1; transform: translate(-50%, -50%) rotate(-3deg) scale(1); }
        92%      { opacity: 1; }
        100%     { opacity: 0; }
      }
      .fm3-tag { animation: fm3-tag 3s ease-out infinite; }
    `}</style>
  );
}

Object.assign(window, { WeaponFxScreen, FxCanvas });
