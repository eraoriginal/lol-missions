// Screen 3 — Beat Eikichi PLAYING — multiple states.

const PLAYING_PLAYERS = [
  { name:'Théo',    initials:'TH', color: AC.chem,    role:'EIKICHI', score: 42, status:'typing' },
  { name:'Camille', initials:'CA', color: AC.hex,     score: 35, status:'found' },
  { name:'Noa',     initials:'NO', color: AC.gold,    score: 28, status:'typing' },
  { name:'Jules',   initials:'JU', color: AC.violet,  score: 21, status:'typing' },
  { name:'Sara',    initials:'SA', color: AC.rust,    score: 18, status:'typing' },
];

const SUGGESTIONS = [
  'Metroid Prime', 'Metroid Dread', 'Metroid: Samus Returns', 'Metroid Fusion',
  'Metroid Zero Mission', 'Metro Exodus', 'Metro 2033', 'Metro: Last Light',
  'Mirror\u2019s Edge', 'Mirror\u2019s Edge Catalyst', 'Mighty Goose', 'Minit',
];

function Timer({ seconds = 18, pulse = false, mobile=false }) {
  const urgent = seconds <= 10;
  return (
    <div style={{display:'flex', alignItems:'center', gap: 10}}>
      <span style={{
        fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
        fontSize: mobile?38:54, fontWeight:'900',
        color: urgent ? AC.rust : AC.bone,
        textShadow: urgent ? `2px 2px 0 ${AC.ink}, -1px 1px 0 ${AC.gold}` : `2px 2px 0 ${AC.ink}`,
        letterSpacing:'-0.02em', fontVariantNumeric:'tabular-nums',
        animation: pulse ? 'ac-pulse 1s infinite' : 'none',
      }}>{String(seconds).padStart(2,'0')}<span style={{fontSize: mobile?18:28, color: AC.bone2}}>s</span></span>
    </div>
  );
}

function TimerBar({ pct = 0.6, urgent = false }) {
  const w = Math.max(0, Math.min(1, pct)) * 100;
  const color = urgent ? AC.rust : AC.chem;
  return (
    <div style={{position:'relative', height: 18, background:'rgba(240,228,193,0.06)', border:`1px solid ${AC.bone2}`, overflow:'visible'}}>
      <svg viewBox="0 0 100 24" preserveAspectRatio="none" style={{position:'absolute', inset:0, width:'100%', height: 24}}>
        <g filter="url(#ac-goo)" fill={color}>
          <rect x="0" y="4" width={Math.max(0,w-3)} height="11"/>
          {w>3 && <circle cx={w} cy="10" r="5"/>}
          {w>8 && <circle cx={w-6} cy="16" r="3"/>}
          {w>15 && <circle cx={w-12} cy="19" r="2"/>}
        </g>
      </svg>
    </div>
  );
}

function OtherPlayerChip({ p, targeting }) {
  return (
    <div style={{
      position:'relative', display:'flex', flexDirection:'column', alignItems:'center', gap: 4,
      padding: 8, minWidth: 64,
      cursor: targeting ? 'crosshair' : 'default',
      border: targeting ? `2px solid ${AC.rust}` : `1.5px dashed ${AC.bone2}`,
      background: targeting ? 'rgba(200,68,30,0.08)' : 'transparent',
    }}>
      <AcAvatar name={p.name} color={p.color} size={34} halo={p.role==='EIKICHI'?AC.shimmer:null}/>
      <div style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 10, letterSpacing:'0.04em'}}>{p.name.toUpperCase()}</div>
      <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, color: AC.gold}}>{p.score}pts</div>
      {p.status === 'found' ? (
        <AcGlyph kind="check" color={AC.chem} size={14} stroke={2.5}/>
      ) : (
        <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize:10, color: AC.bone2}}>...</span>
      )}
      {p.role === 'EIKICHI' && (
        <span style={{position:'absolute', top: -8, left: -4, fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 8, color: AC.shimmer, letterSpacing:'0.2em'}}>// E</span>
      )}
    </div>
  );
}

function HintSlot({ label, n, value, revealed }) {
  return (
    <div style={{
      padding: '10px 12px',
      border:`1.5px dashed ${revealed ? AC.chem : AC.bone2}`,
      background: revealed ? 'rgba(18,214,168,0.08)' : 'rgba(240,228,193,0.02)',
      minHeight: 52,
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 4}}>
        <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 9, letterSpacing:'0.25em', color: revealed ? AC.chem : AC.bone2}}>// INDICE {n}/3 · {label}</span>
        {revealed && <AcGlyph kind="check" color={AC.chem} size={12} stroke={2.5}/>}
      </div>
      {revealed ? (
        <div style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 15, color: AC.bone}}>{value}</div>
      ) : (
        <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, color: AC.bone2, fontStyle:'italic'}}>// révélé au moment voulu…</div>
      )}
    </div>
  );
}

function FeedbackRibbon({ tone }) {
  const cfg = {
    close:  { face:':-D', color: AC.rust,    label:'TRÈS CHAUD !',      glyph:'flame', desc:'// à un cheveu — reessaie' },
    medium: { face:':-|', color: AC.gold,    label:'TIÈDE…',            glyph:'thermometer', desc:'// pas loin, pas proche' },
    far:    { face:':-(', color: AC.hex,     label:'FROID.',            glyph:'snow', desc:'// rien à voir' },
  }[tone] || { face:':-|', color: AC.gold, label:'TIÈDE…', glyph:'thermometer', desc:'' };
  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 14,
      padding: '10px 14px',
      borderLeft:`8px solid ${cfg.color}`,
      background: `color-mix(in oklab, ${cfg.color} 12%, transparent)`,
    }}>
      <div style={{
        width: 42, height: 42, background: cfg.color, color: AC.ink,
        display:'flex', alignItems:'center', justifyContent:'center',
        clipPath: AC_CLIP,
      }}>
        <AcGlyph kind={cfg.glyph} color={AC.ink} size={22} stroke={2.5}/>
      </div>
      <div style={{flex:1}}>
        <div style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 16, letterSpacing:'0.04em'}}>{cfg.label}</div>
        <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, color: AC.bone2, marginTop: 2}}>{cfg.desc}</div>
      </div>
      <AcEmote face={cfg.face} color={cfg.color} size={30}/>
    </div>
  );
}

function Toast({ tone = 'warning', children, emote }) {
  const col = { warning: AC.rust, success: AC.chem, error: AC.gold }[tone] || AC.gold;
  return (
    <div style={{
      position:'relative', padding:'10px 14px 10px 18px', maxWidth: 300,
      borderLeft: `6px solid ${col}`, background: 'rgba(13,11,8,0.9)', color: AC.bone,
      boxShadow:`inset 0 0 0 1px ${AC.bone2}`,
    }}>
      <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 11, lineHeight: 1.45}}>{children}</div>
      {emote && <div style={{position:'absolute', top:-12, right:8}}><AcEmote face={emote} color={col} size={22}/></div>}
    </div>
  );
}

function PlayingScreen({ state = 'neutral', mobile = false }) {
  // state: 'neutral' | 'suggestions' | 'wrong' | 'found' | 'smoked' | 'hint'
  const pad = mobile ? 14 : 28;
  const attacked = state === 'smoked';
  const effect = attacked ? 'smoke' : null;
  const timerSec = state === 'smoked' ? 12 : state === 'wrong' ? 18 : state === 'hint' ? 15 : 22;
  const urgent = timerSec <= 10;
  const showSuggestions = state === 'suggestions' || state === 'wrong';
  const showWrong = state === 'wrong';
  const showFound = state === 'found';
  const hintsOn = state === 'hint' || state === 'smoked';

  return (
    <AcScreen style={{minHeight: mobile ? 1350 : 1080}}>
      <div style={{position:'absolute', top: -50, right: -60, pointerEvents:'none'}}>
        <AcSplat color={AC.violet} size={mobile?240:380} opacity={0.4} seed={1}/>
      </div>
      <div style={{position:'absolute', bottom: -40, left: -40, pointerEvents:'none'}}>
        <AcSpray color={AC.shimmer} size={mobile?200:280} seed={3}/>
      </div>
      <AcGraffitiLayer palette={[AC.shimmer, AC.hex, AC.chem, AC.violet, AC.gold]}/>

      <div style={{position:'relative', padding: pad, maxWidth: mobile?'100%':1240, margin:'0 auto'}}>
        {/* TOP STRIP */}
        <div style={{display:'grid', gridTemplateColumns: mobile?'1fr':'1fr 1.2fr 1fr', gap: 14, alignItems:'center', marginBottom: 18}}>
          <div style={{display:'flex', alignItems:'center', gap: 10, flexWrap:'wrap'}}>
            <AcSectionNum n={7}/>
            <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 12, letterSpacing:'0.2em', color: AC.bone2}}>QUESTION 07 / 20</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap: 14, justifyContent: mobile?'flex-start':'center'}}>
            <Timer seconds={timerSec} pulse={urgent} mobile={mobile}/>
            <div style={{flex:1, minWidth: 140, position:'relative'}}>
              <TimerBar pct={timerSec/30} urgent={urgent}/>
              <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 9, letterSpacing:'0.2em', color: AC.bone2, marginTop: 4}}>// {timerSec}s / 30s</div>
            </div>
          </div>
          <div style={{display:'flex', gap: 8, justifyContent: mobile?'flex-start':'flex-end', flexWrap:'wrap'}}>
            <AcButton variant="ghost" size="sm">← LOBBY</AcButton>
            <AcButton variant="danger" size="sm">QUITTER</AcButton>
          </div>
        </div>

        <AcDashed style={{marginBottom: 16}}/>

        {/* WEAPON / SHIELD / PLAYERS */}
        <div style={{display:'grid', gridTemplateColumns: mobile?'1fr':'1fr 1fr 1.6fr', gap: 14, marginBottom: 20}}>
          {/* My weapon */}
          <div style={{
            padding: 12, position:'relative',
            border: `2px solid ${AC.shimmer}`, background:'rgba(255,61,139,0.08)',
          }}>
            <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, letterSpacing:'0.25em', color: AC.shimmer, marginBottom: 8}}>// MON ARME</div>
            <div style={{display:'flex', alignItems:'center', gap: 10}}>
              <div style={{width: 44, height: 44, background: AC.shimmer, display:'flex', alignItems:'center', justifyContent:'center', clipPath: AC_CLIP}}>
                <AcGlyph kind="smoke" color={AC.ink} size={22} stroke={2.5}/>
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 15, }}>FUMIGÈNE</div>
                <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, color: AC.bone2}}>x2 utilisations</div>
              </div>
              <AcButton variant="primary" size="sm">ARMER</AcButton>
            </div>
          </div>

          {/* My shield */}
          <div style={{
            padding: 12, position:'relative',
            border: `2px solid ${AC.hex}`, background:'rgba(94,184,255,0.08)',
          }}>
            <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, letterSpacing:'0.25em', color: AC.hex, marginBottom: 8}}>// MON BOUCLIER</div>
            <div style={{display:'flex', alignItems:'center', gap: 10}}>
              <div style={{width: 44, height: 44, background: AC.hex, display:'flex', alignItems:'center', justifyContent:'center', clipPath: AC_CLIP}}>
                <AcGlyph kind="shield" color={AC.ink} size={22} stroke={2.5}/>
              </div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 15, }}>BOUCLIER</div>
                <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, color: AC.bone2}}>x1 utilisation</div>
              </div>
              <AcButton variant="hex" size="sm">ACTIVER</AcButton>
            </div>
          </div>

          {/* Other players */}
          <div style={{padding: 10, border:`1.5px dashed ${AC.bone2}`}}>
            <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, letterSpacing:'0.25em', color: AC.chem, marginBottom: 8}}>// AUTRES JOUEURS · {PLAYING_PLAYERS.length}</div>
            <div style={{display:'flex', gap: 10, flexWrap:'wrap'}}>
              {PLAYING_PLAYERS.map((p,i)=>(<OtherPlayerChip key={i} p={p} targeting={false}/>))}
            </div>
          </div>
        </div>

        {/* MAIN GAME AREA + OPT HINTS */}
        <div style={{display:'grid', gridTemplateColumns: mobile?'1fr':(hintsOn?'1fr 240px':'1fr'), gap: 18, alignItems:'flex-start'}}>
          <div>
            {/* IMAGE */}
            <div style={{position:'relative'}}>
              <AcImagePlaceholder
                label={`MYSTERY SCREENSHOT · 16:10${effect?` · ${effect.toUpperCase()} ATTACK`:''}`}
                ratio="16 / 10"
                effect={effect}
                overlays={attacked && (
                  <div style={{position:'absolute', top: 12, right: 12}}>
                    <AcStamp color={AC.rust} bg={AC.ink} rotate={-3} style={{fontSize: 12, padding:'8px 12px', color: AC.rust, borderColor: AC.rust}}>
                      // SARA A TIRÉ : FUMIGÈNE
                    </AcStamp>
                  </div>
                )}
              />
            </div>

            {/* INPUT AREA */}
            <div style={{marginTop: 20, position:'relative'}}>
              {showFound ? (
                <div style={{
                  padding: 18, textAlign:'center', position:'relative',
                  background: 'rgba(18,214,168,0.12)',
                  border: `2px solid ${AC.chem}`,
                  clipPath: AC_CLIP,
                }}>
                  <div style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: mobile?22:32, color: AC.chem, letterSpacing:'0.03em'}}>
                    ✓ TU AS TROUVÉ
                  </div>
                  <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 12, color: AC.bone2, marginTop: 6}}>
                    // en 4.2s — en attente des autres joueurs…
                  </div>
                  <div style={{position:'absolute', top: -16, right: 18}}>
                    <AcEmote face=":-D" color={AC.chem} size={36}/>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{
                    position:'relative',
                    padding: '14px 16px',
                    background: 'rgba(240,228,193,0.04)',
                    boxShadow: showWrong ? `inset 0 0 0 2px ${AC.rust}` : `inset 0 0 0 2px ${AC.bone}`,
                    clipPath: AC_CLIP,
                    animation: showWrong ? 'ac-shake 0.4s' : 'none',
                  }}>
                    <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 11, color: AC.chem, letterSpacing:'0.2em', marginRight: 8}}>&gt;</span>
                    <input readOnly value={showSuggestions ? 'met' : ''} placeholder="TAPE LE NOM DU JEU PUIS ENTRÉE…"
                      style={{
                        background:'transparent', border:'none', outline:'none',
                        color: showSuggestions ? AC.shimmer : AC.bone,
                        fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: mobile?15:18,
                        width:'calc(100% - 40px)', letterSpacing:'0.05em',
                      }}/>
                    <span style={{
                      display:'inline-block', width:2, height: 20, background: AC.shimmer,
                      verticalAlign:'middle', animation:'ac-blink 1s infinite',
                    }}/>
                  </div>

                  {showSuggestions && (
                    <div style={{marginTop: 6, background: AC.ink2, boxShadow:`inset 0 0 0 1.5px ${AC.bone}`, maxHeight: 230, overflow:'hidden'}}>
                      <div style={{padding:'6px 12px', borderBottom:`1.5px dashed ${AC.bone2}`, fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, letterSpacing:'0.2em', color: AC.bone2, display:'flex', justifyContent:'space-between'}}>
                        <span>// 12 SUGGESTIONS · ↑↓ POUR NAVIGUER · ↵ POUR VALIDER</span>
                        <span style={{color: AC.chem}}>MATCH 1/12</span>
                      </div>
                      {SUGGESTIONS.slice(0,6).map((s,i)=>(
                        <div key={i} style={{
                          padding:'8px 14px',
                          background: i===0 ? AC.shimmer : (i===1 ? 'rgba(240,228,193,0.06)' : 'transparent'),
                          color: i===0 ? AC.ink : AC.bone,
                          fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 13,
                          display:'flex', justifyContent:'space-between', alignItems:'center',
                          borderBottom:`1px dotted rgba(240,228,193,0.1)`,
                        }}>
                          <span><span style={{fontWeight:'bold'}}>Met</span>{s.slice(3)}</span>
                          {i===0 && <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 9, letterSpacing:'0.2em'}}>↵ ENTRÉE</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  {showWrong && (
                    <div style={{marginTop: 10}}>
                      <FeedbackRibbon tone="close"/>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* HINTS PANEL */}
          {hintsOn && !mobile && (
            <div>
              <div style={{display:'flex', alignItems:'center', gap: 8, marginBottom: 10}}>
                <AcSectionNum n="i"/>
                <span style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 14, letterSpacing:'0.04em'}}>INDICES</span>
              </div>
              <div style={{display:'flex', flexDirection:'column', gap: 10}}>
                <HintSlot n={1} label="GENRE"       value="FPS · Metroidvania" revealed={true}/>
                <HintSlot n={2} label="TERME"       value="&quot;Samus Aran&quot;" revealed={true}/>
                <HintSlot n={3} label="PLATEFORMES" value="" revealed={false}/>
              </div>
              <div style={{marginTop: 14, fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, color: AC.bone2, lineHeight: 1.5}}>
                // 1 indice au début<br/>// 1 à mi-timer<br/>// 1 aux -10s
              </div>
            </div>
          )}
        </div>

        {/* TOASTS (attacked state) */}
        {attacked && (
          <div style={{position:'absolute', top: 20, right: 20, display:'flex', flexDirection:'column', gap: 10, zIndex: 5}}>
            <Toast tone="warning" emote=">:(">SARA a utilisé <strong>FUMIGÈNE</strong></Toast>
            <Toast tone="success" emote=":-)">Tu as empêché l&apos;attaque de <strong>NOA</strong></Toast>
          </div>
        )}
      </div>

      <style>{`
        @keyframes ac-pulse { 0%,100% {opacity:1} 50% {opacity:0.6} }
        @keyframes ac-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-6px)} 40%{transform:translateX(6px)} 60%{transform:translateX(-4px)} 80%{transform:translateX(4px)} }
        @keyframes ac-blink { 0%,50%{opacity:1} 51%,100%{opacity:0} }
      `}</style>
    </AcScreen>
  );
}

Object.assign(window, { PlayingScreen, Timer, TimerBar, FeedbackRibbon, Toast });
