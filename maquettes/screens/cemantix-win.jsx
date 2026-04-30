// Cemantix — 5 animations "TROUVÉ"
// Toutes utilisent la base visuelle de la proposition #02 (liste peinte).
// Chacune est un Stage scrubbable de ~6s.

const WIN_WORD = 'sabre';

// ─── Données pré-victoire ────────────────────────────────────────────────
// Le joueur a 16 essais : les 15 précédents + l'essai gagnant.
const WIN_PRIOR = [
  { word:'lame',     sim:0.972, rank:3   },
  { word:'épée',     sim:0.951, rank:7   },
  { word:'katana',   sim:0.918, rank:24  },
  { word:'couteau',  sim:0.847, rank:89  },
  { word:'arme',     sim:0.792, rank:214 },
  { word:'samouraï', sim:0.681, rank:612 },
  { word:'combat',   sim:0.643, rank:891 },
  { word:'guerre',   sim:0.572, rank:null },
  { word:'soldat',   sim:0.488, rank:null },
  { word:'japon',    sim:0.421, rank:null },
];

const WIN_TOTAL = WIN_PRIOR.length + 1; // +1 pour sabre

// ─── Helpers locaux (récupère cmxHeatColor + cmxTier de cemantix.jsx) ──
// On suppose que cemantix.jsx est chargé avant, donc cmxHeatColor existe.

// ─── Petit utilitaire : palette ───────────────────────────────────────────
const WIN_GOLD    = '#F5B912';
const WIN_RUST    = '#C8441E';
const WIN_SHIMMER = '#FF3D8B';
const WIN_INK     = '#0D0B08';
const WIN_BONE    = '#F0E4C1';
const WIN_BONE2   = '#C9BB94';
const WIN_VIOLET  = '#8A3DD4';
const WIN_CHEM    = '#12D6A8';

// ────────────────────────────────────────────────────────────────────
// CADRE COMMUN — header + input
// ────────────────────────────────────────────────────────────────────
function WinFrame({ children, num, name }) {
  return (
    <div style={{
      position:'relative', width:'100%', height:'100%',
      background: 'radial-gradient(circle at 15% 10%, #1F1A13 0%, #0D0B08 65%)',
      color: WIN_BONE, fontFamily: "'Inter', sans-serif",
      padding:'28px 32px 24px', overflow:'hidden',
    }}>
      <ArcanePaintDefs/>
      <div style={{position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(45deg, transparent 0 3px, rgba(240,228,193,0.018) 3px 4px)', pointerEvents:'none'}}/>
      <div style={{position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 1px 1px, rgba(240,228,193,0.04) 1px, transparent 1px)', backgroundSize:'3px 3px', pointerEvents:'none', mixBlendMode:'overlay'}}/>

      <div style={{position:'relative', display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 16}}>
        <div>
          <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 4}}>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 10, color: WIN_BONE2, letterSpacing:'0.2em'}}>// ANIM {String(num).padStart(2,'0')}</span>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 10, color: WIN_SHIMMER, letterSpacing:'0.2em'}}>{name}</span>
          </div>
          <h1 style={{
            fontFamily:"'Barlow Condensed', 'Bebas Neue', sans-serif",
            fontSize: 50, fontWeight: 900, margin: 0, lineHeight: 0.85,
            letterSpacing:'-0.02em', textTransform:'uppercase',
            color: WIN_SHIMMER,
            textShadow:`3px 3px 0 ${WIN_INK}, -1px 1px 0 ${WIN_VIOLET}`,
          }}>Cemantix</h1>
        </div>
        <div style={{textAlign:'right'}}>
          <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 10, color: WIN_BONE2, letterSpacing:'0.2em'}}>// ESSAI #{WIN_TOTAL} ▸ </span>
          <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 10, color: WIN_SHIMMER, letterSpacing:'0.2em', fontWeight:700}}>VICTOIRE</span>
        </div>
      </div>
      {children}
    </div>
  );
}

// Liste précédente compacte (les essais avant le bon mot) -----------
function WinPriorList({ rowH = 28, dimAt = 1, fadeAt = 5 }) {
  const t = useTime();
  const dimP = clamp((t - dimAt) / 1.5, 0, 1);
  const fadeP = clamp((t - fadeAt) / 1.5, 0, 1);
  return (
    <div style={{position:'relative', opacity: 1 - fadeP*0.7}}>
      {WIN_PRIOR.map((g, i) => {
        const c = cmxHeatColor(g.sim);
        const wPct = g.sim*100;
        return (
          <div key={g.word} style={{
            display:'grid', gridTemplateColumns:'42px 160px 1fr 70px 60px',
            alignItems:'center', gap: 12,
            padding:'4px 14px', height: rowH,
            borderBottom: `1px dashed rgba(201,187,148,0.22)`,
            opacity: 1 - dimP*0.55,
            filter: `grayscale(${dimP*0.4})`,
          }}>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: WIN_BONE2, letterSpacing:'0.18em'}}>#{String(WIN_TOTAL - 1 - i).padStart(2,'0')}</span>
            <span style={{
              fontFamily:"'Barlow Condensed', sans-serif",
              fontSize: 16 + Math.round(g.sim*8),
              fontWeight: 800, textTransform:'uppercase',
              color: c, textShadow: `1px 1px 0 ${WIN_INK}`,
              letterSpacing:'-0.01em',
            }}>{g.word}</span>
            <div style={{position:'relative', height: 14, background:'rgba(240,228,193,0.05)', border:`1px solid rgba(201,187,148,0.25)`}}>
              <svg viewBox="0 0 100 18" preserveAspectRatio="none" style={{position:'absolute', inset:0, width:'100%', height: 18, top:-2}}>
                <g filter="url(#ac-goo)" fill={c}>
                  <rect x="0" y="3" width={Math.max(0,wPct-3)} height="10"/>
                  {wPct>3 && <circle cx={wPct} cy="8" r="4"/>}
                </g>
              </svg>
            </div>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:11, color: c, fontWeight:700, textAlign:'right'}}>{(g.sim*100).toFixed(1)}°</span>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: g.rank ? c : WIN_BONE2, letterSpacing:'0.18em', textAlign:'right'}}>{g.rank ? `▸${String(g.rank).padStart(4,' ')}` : '—'}</span>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================
// ANIM 01 · OVERFLOW
//   La barre du bon mot remplit, EXPLOSE en peinture qui inonde
//   le bas de l'écran. Stamp TROUVÉ slam-in.
// ============================================================
function WinAnim01_Overflow() {
  const t = useTime();

  // Phases
  // 0.0 - 0.4 : input typing
  // 0.4 - 1.6 : bar grows from 0 → 100°
  // 1.6 - 2.0 : bar hits wall, screen flashes
  // 2.0 - 2.6 : explosion + paint flood from row across whole list
  // 2.6 - 3.5 : answer banner slam in
  // 3.5 - 6.0 : settled state with stats

  const fillP = clamp((t - 0.4) / 1.2, 0, 1);
  const fillEase = Easing.easeOutCubic(fillP);
  const wPct = fillEase * 100;

  const flashP = clamp((t - 1.6) / 0.4, 0, 1);
  const flash = Math.sin(flashP * Math.PI) * (1 - flashP);

  const floodP = clamp((t - 2.0) / 0.7, 0, 1);
  const floodEase = Easing.easeOutQuart(floodP);

  const stampP = clamp((t - 2.6) / 0.5, 0, 1);
  const stampEase = Easing.easeOutBack(stampP);

  const statsP = clamp((t - 3.4) / 0.6, 0, 1);

  return (
    <WinFrame num={1} name="OVERFLOW · LA PEINTURE DÉBORDE">
      {/* INPUT (gagnant) */}
      <div style={{position:'relative', display:'flex', gap:10, alignItems:'stretch', marginBottom: 14}}>
        <div style={{
          flex:1, display:'flex', alignItems:'center',
          background: 'rgba(13,11,8,0.85)',
          border:`2px solid ${t > 1.6 ? WIN_GOLD : WIN_BONE}`,
          padding:'14px 18px',
          boxShadow: t > 1.6 ? `0 0 36px rgba(245,185,18,${0.4 + flash*0.6})` : 'none',
          transition:'border-color 0.2s',
        }}>
          <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:11, color: WIN_SHIMMER, marginRight:10, letterSpacing:'0.18em'}}>▸</span>
          <span style={{
            fontFamily:"'Barlow Condensed', sans-serif",
            fontSize: 28, fontWeight: 900, textTransform:'uppercase',
            color: t > 1.6 ? WIN_GOLD : WIN_BONE,
            textShadow: `2px 2px 0 ${WIN_INK}`,
            letterSpacing:'-0.01em',
          }}>{WIN_WORD}</span>
        </div>
        <button style={{
          background: t > 1.6 ? WIN_GOLD : WIN_SHIMMER, color: WIN_INK, border:'none',
          fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, letterSpacing:'0.12em',
          textTransform:'uppercase', fontSize:14, padding:'0 26px',
          clipPath:'polygon(8% 6%, 95% 0, 100% 50%, 92% 100%, 6% 96%, 0 50%)',
        }}>{t > 1.6 ? '✓ TROUVÉ' : 'Envoyer ▸'}</button>
      </div>

      {/* Liste précédente (qui s'éteint progressivement) */}
      <div style={{position:'relative', background:'rgba(13,11,8,0.5)', border:`1.5px solid ${WIN_BONE}`, padding:'4px 0'}}>
        <WinPriorList dimAt={1.6} fadeAt={2.0}/>

        {/* Ligne du mot gagnant */}
        <div style={{position:'relative', display:'grid', gridTemplateColumns:'42px 160px 1fr 70px 60px', alignItems:'center', gap: 12, padding:'10px 14px'}}>
          <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: WIN_GOLD, letterSpacing:'0.2em'}}>#{String(WIN_TOTAL).padStart(2,'0')}</span>
          <span style={{
            fontFamily:"'Barlow Condensed', sans-serif",
            fontSize: 26 + (t > 1.6 ? 6 : 0),
            fontWeight: 900, textTransform:'uppercase',
            color: WIN_GOLD, textShadow: `2px 2px 0 ${WIN_INK}, 0 0 20px ${WIN_GOLD}`,
            letterSpacing:'-0.01em',
          }}>{WIN_WORD}</span>
          <div style={{position:'relative', height: 22, background:'rgba(240,228,193,0.05)', border:`1px solid ${WIN_GOLD}`, overflow:'visible'}}>
            <svg viewBox="0 0 100 28" preserveAspectRatio="none" style={{position:'absolute', inset:0, width:'100%', height: 28, top:-3}}>
              <g filter="url(#ac-goo)" fill={WIN_GOLD}>
                <rect x="0" y="6" width={Math.max(0, wPct-4)} height="14"/>
                {wPct>4 && <circle cx={wPct} cy="13" r={6 + flash*4}/>}
                {wPct > 95 && (
                  <>
                    <circle cx={wPct + 2} cy="6" r={3 + flash*2}/>
                    <circle cx={wPct + 4} cy="22" r={3 + flash*2}/>
                  </>
                )}
              </g>
            </svg>
          </div>
          <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:13, color: WIN_GOLD, fontWeight:700, textAlign:'right'}}>{(wPct).toFixed(1)}°</span>
          <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: WIN_GOLD, letterSpacing:'0.18em', textAlign:'right'}}>{wPct >= 99 ? '▸ R   1' : '—'}</span>
        </div>

        {/* INONDATION : peinture qui descend depuis la ligne gagnante */}
        {floodP > 0 && (
          <div style={{position:'absolute', left:0, right:0, bottom:0, height: `${floodEase*100}%`, overflow:'hidden', pointerEvents:'none'}}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{width:'100%', height:'100%'}}>
              <defs>
                <linearGradient id="flood-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor={WIN_GOLD}/>
                  <stop offset="0.6" stopColor={WIN_RUST}/>
                  <stop offset="1" stopColor={WIN_RUST} stopOpacity="0.92"/>
                </linearGradient>
              </defs>
              <g filter="url(#ac-goo)" fill="url(#flood-grad)">
                <rect x="-5" y="0" width="110" height="100"/>
                <circle cx={20} cy={-2} r={6}/>
                <circle cx={50} cy={-4} r={8}/>
                <circle cx={75} cy={-2} r={5}/>
              </g>
            </svg>
          </div>
        )}

        {/* SPLATS ÉCLABOUSSURE */}
        {floodP > 0 && [
          {x:'12%', y:'62%', s:120, c:WIN_GOLD,    d:0   },
          {x:'72%', y:'45%', s:160, c:WIN_RUST,    d:0.05},
          {x:'48%', y:'25%', s:140, c:WIN_SHIMMER, d:0.1 },
          {x:'88%', y:'70%', s:100, c:WIN_GOLD,    d:0.08},
          {x:'8%',  y:'18%', s:90,  c:WIN_SHIMMER, d:0.12},
        ].map((s,i) => {
          const lp = clamp((t - 2.0 - s.d) / 0.5, 0, 1);
          const e = Easing.easeOutBack(lp);
          return (
            <div key={i} style={{position:'absolute', left:s.x, top:s.y, transform:`translate(-50%,-50%) scale(${e}) rotate(${i*47}deg)`, width:s.s, height:s.s, opacity: lp, pointerEvents:'none'}}>
              <svg viewBox="0 0 200 200" style={{width:'100%', height:'100%'}}>
                <g filter="url(#ac-paint-spread)">
                  <circle cx="100" cy="100" r="58" fill={s.c}/>
                  <circle cx="155" cy="60" r="14" fill={s.c}/>
                  <circle cx="55" cy="50" r="10" fill={s.c}/>
                  <circle cx="40" cy="150" r="8" fill={s.c}/>
                  <circle cx="160" cy="150" r="12" fill={s.c}/>
                </g>
              </svg>
            </div>
          );
        })}

        {/* STAMP TROUVÉ */}
        {stampP > 0 && (
          <div style={{
            position:'absolute', top: '38%', left: '50%',
            transform:`translate(-50%,-50%) rotate(${-6 + (1-stampEase)*30}deg) scale(${stampEase})`,
            opacity: stampP, pointerEvents:'none', zIndex:5,
          }}>
            <div style={{
              border:`5px solid ${WIN_BONE}`, padding:'14px 36px',
              background:`rgba(13,11,8,0.92)`,
              boxShadow:`0 0 0 3px ${WIN_INK}, 0 0 0 8px ${WIN_BONE}, 8px 8px 0 ${WIN_RUST}`,
            }}>
              <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, color: WIN_GOLD, letterSpacing:'0.32em', textAlign:'center', marginBottom: 4}}>// MOT DU JOUR</div>
              <div style={{
                fontFamily:"'Barlow Condensed', sans-serif", fontSize: 92, fontWeight:900,
                color: WIN_GOLD, textShadow:`4px 4px 0 ${WIN_INK}, -2px 2px 0 ${WIN_RUST}`,
                letterSpacing:'-0.03em', textTransform:'uppercase', lineHeight:0.85,
              }}>{WIN_WORD}</div>
              <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 12, color: WIN_BONE, letterSpacing:'0.32em', textAlign:'center', marginTop: 6}}>▸ TROUVÉ EN {WIN_TOTAL} ESSAIS ◂</div>
            </div>
          </div>
        )}
      </div>

      {/* STATS final */}
      {statsP > 0 && (
        <div style={{
          marginTop: 16,
          display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap: 12,
          opacity: statsP, transform:`translateY(${(1-statsP)*16}px)`,
        }}>
          {[
            ['ESSAIS',    WIN_TOTAL, WIN_GOLD],
            ['MEILLEUR',  '100.0°',  WIN_RUST],
            ['STREAK',    '13j 🔥',  WIN_SHIMMER],
            ['RANG',      '#1 / —',  WIN_GOLD],
          ].map(([k,v,c],i) => (
            <div key={i} style={{background:'rgba(13,11,8,0.7)', border:`1.5px dashed ${c}`, padding:'10px 14px'}}>
              <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: WIN_BONE2, letterSpacing:'0.2em'}}>// {k}</div>
              <div style={{fontFamily:"'Barlow Condensed', sans-serif", fontSize: 26, fontWeight: 900, color: c, textShadow:`1px 1px 0 ${WIN_INK}`}}>{v}</div>
            </div>
          ))}
        </div>
      )}
    </WinFrame>
  );
}

// ============================================================
// ANIM 02 · LADDER CLIMB
//   Toutes les barres se "ré-allument" rapidement de bas en haut
//   (du froid au chaud) puis le mot gagnant pousse une barre 100° qui dépasse.
// ============================================================
function WinAnim02_Ladder() {
  const t = useTime();
  const allRows = [...WIN_PRIOR].sort((a,b) => a.sim - b.sim); // froid → chaud
  const N = allRows.length;
  const stepDur = 0.13;
  const startClimb = 0.5;

  // Each row "re-fills" sequentially from cold to hot
  // After all rows pulse, win row blasts in
  const winStart = startClimb + N*stepDur + 0.2;

  const winFillP = clamp((t - winStart) / 0.7, 0, 1);
  const wPct = Easing.easeOutCubic(winFillP) * 100;

  const revealP = clamp((t - winStart - 0.6) / 0.6, 0, 1);

  return (
    <WinFrame num={2} name="LADDER CLIMB · ÉCHELLE THERMIQUE">
      <div style={{position:'relative', display:'flex', gap:10, alignItems:'stretch', marginBottom: 14}}>
        <div style={{flex:1, display:'flex', alignItems:'center', background:'rgba(13,11,8,0.85)', border:`2px solid ${WIN_GOLD}`, padding:'14px 18px', boxShadow:`0 0 24px rgba(245,185,18,0.3)`}}>
          <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:11, color: WIN_SHIMMER, marginRight:10}}>▸</span>
          <span style={{fontFamily:"'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, textTransform:'uppercase', color: WIN_GOLD, textShadow:`2px 2px 0 ${WIN_INK}`}}>{WIN_WORD}</span>
        </div>
        <button style={{background: WIN_GOLD, color: WIN_INK, border:'none', fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, letterSpacing:'0.12em', textTransform:'uppercase', fontSize:14, padding:'0 26px', clipPath:'polygon(8% 6%, 95% 0, 100% 50%, 92% 100%, 6% 96%, 0 50%)'}}>✓ TROUVÉ</button>
      </div>

      <div style={{position:'relative', background:'rgba(13,11,8,0.5)', border:`1.5px solid ${WIN_BONE}`, padding:'4px 0'}}>
        {/* Lignes anciennes — qui PULSENT en cascade froid→chaud */}
        {[...WIN_PRIOR].map((g, i) => {
          // index froid→chaud : trouver le rang
          const climbIdx = allRows.findIndex(r => r.word === g.word);
          const tStart = startClimb + climbIdx * stepDur;
          const pulseP = clamp((t - tStart) / 0.4, 0, 1);
          const pulse = Math.sin(pulseP * Math.PI);
          const c = cmxHeatColor(g.sim);
          const wRow = g.sim*100;

          return (
            <div key={g.word} style={{
              display:'grid', gridTemplateColumns:'42px 160px 1fr 70px 60px',
              alignItems:'center', gap: 12,
              padding:'4px 14px', height: 28,
              borderBottom:`1px dashed rgba(201,187,148,0.22)`,
              background: pulseP > 0 && pulseP < 1 ? `linear-gradient(90deg, ${c}22 0%, transparent 70%)` : 'transparent',
            }}>
              <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: WIN_BONE2, letterSpacing:'0.18em'}}>#{String(WIN_TOTAL - 1 - i).padStart(2,'0')}</span>
              <span style={{
                fontFamily:"'Barlow Condensed', sans-serif",
                fontSize: 16 + Math.round(g.sim*8) + pulse*4,
                fontWeight: 800, textTransform:'uppercase',
                color: c, textShadow: `1px 1px 0 ${WIN_INK}${pulse > 0.3 ? `, 0 0 ${pulse*16}px ${c}` : ''}`,
                letterSpacing:'-0.01em',
                transform: `translateX(${pulse*4}px)`,
              }}>{g.word}</span>
              <div style={{position:'relative', height: 14, background:'rgba(240,228,193,0.05)', border:`1px solid ${pulse > 0.2 ? c : 'rgba(201,187,148,0.25)'}`}}>
                <svg viewBox="0 0 100 18" preserveAspectRatio="none" style={{position:'absolute', inset:0, width:'100%', height: 18, top:-2}}>
                  <g filter="url(#ac-goo)" fill={c}>
                    <rect x="0" y="3" width={Math.max(0, wRow-3)} height="10"/>
                    {wRow>3 && <circle cx={wRow} cy="8" r={4 + pulse*3}/>}
                  </g>
                </svg>
              </div>
              <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:11, color: c, fontWeight:700, textAlign:'right'}}>{(wRow).toFixed(1)}°</span>
              <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: g.rank ? c : WIN_BONE2, letterSpacing:'0.18em', textAlign:'right'}}>{g.rank ? `▸${String(g.rank).padStart(4,' ')}` : '—'}</span>
            </div>
          );
        })}

        {/* Ligne gagnante : barre qui défonce */}
        <div style={{position:'relative', display:'grid', gridTemplateColumns:'42px 160px 1fr 70px 60px', alignItems:'center', gap: 12, padding:'12px 14px', borderTop:`2px solid ${WIN_GOLD}`, background: t > winStart ? `linear-gradient(90deg, ${WIN_GOLD}18, transparent 80%)` : 'transparent'}}>
          <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: WIN_GOLD, letterSpacing:'0.2em', fontWeight:700}}>#{String(WIN_TOTAL).padStart(2,'0')}</span>
          <span style={{
            fontFamily:"'Barlow Condensed', sans-serif",
            fontSize: 28 + winFillP*4,
            fontWeight: 900, textTransform:'uppercase',
            color: WIN_GOLD, textShadow:`2px 2px 0 ${WIN_INK}, 0 0 ${20 + winFillP*20}px ${WIN_GOLD}`,
            letterSpacing:'-0.01em',
          }}>{WIN_WORD}</span>
          <div style={{position:'relative', height: 26, background:'rgba(240,228,193,0.05)', border:`1.5px solid ${WIN_GOLD}`, overflow:'visible'}}>
            <svg viewBox="0 0 100 32" preserveAspectRatio="none" style={{position:'absolute', inset:0, width:'100%', height: 32, top:-3}}>
              <defs>
                <linearGradient id="ladder-bar" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0" stopColor={WIN_SHIMMER}/>
                  <stop offset="0.5" stopColor={WIN_GOLD}/>
                  <stop offset="1" stopColor={WIN_RUST}/>
                </linearGradient>
              </defs>
              <g filter="url(#ac-goo)" fill="url(#ladder-bar)">
                <rect x="0" y="6" width={Math.max(0, wPct-4)} height="20"/>
                {wPct > 4 && <circle cx={wPct} cy="16" r="9"/>}
                {wPct > 95 && (
                  <>
                    <circle cx={wPct+3} cy="4" r="4"/>
                    <circle cx={wPct+5} cy="28" r="4"/>
                  </>
                )}
              </g>
            </svg>
          </div>
          <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:14, color: WIN_GOLD, fontWeight:900, textAlign:'right'}}>{(wPct).toFixed(1)}°</span>
          <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: WIN_GOLD, letterSpacing:'0.18em', textAlign:'right', fontWeight:700}}>{wPct >= 99 ? '▸ #  1' : '—'}</span>
        </div>

        {/* Banner reveal */}
        {revealP > 0 && (
          <div style={{
            position:'absolute', top:'50%', left:'50%',
            transform:`translate(-50%,-50%) skew(-3deg) scale(${0.7 + revealP*0.3})`,
            opacity: revealP, pointerEvents:'none', textAlign:'center',
          }}>
            <div style={{
              background: WIN_GOLD, color: WIN_INK,
              padding: '6px 28px', display:'inline-block',
              fontFamily:"'JetBrains Mono', monospace", fontSize: 12, letterSpacing:'0.32em', fontWeight:700,
              transform:'rotate(-2deg)',
            }}>// CIBLE ATTEINTE //</div>
            <div style={{
              fontFamily:"'Barlow Condensed', sans-serif", fontSize: 110, fontWeight: 900,
              color: WIN_BONE, textShadow:`4px 4px 0 ${WIN_INK}, -3px 3px 0 ${WIN_GOLD}, 0 0 40px ${WIN_RUST}`,
              letterSpacing:'-0.03em', textTransform:'uppercase', lineHeight: 0.85, marginTop: 6,
            }}>{WIN_WORD}</div>
            <div style={{
              background: WIN_RUST, color: WIN_BONE, padding:'6px 22px', display:'inline-block', marginTop: 6,
              fontFamily:"'JetBrains Mono', monospace", fontSize: 12, letterSpacing:'0.3em', fontWeight:700,
              transform:'rotate(2deg)',
            }}>▸ {WIN_TOTAL} ESSAIS · STREAK 13j</div>
          </div>
        )}
      </div>
    </WinFrame>
  );
}

// ============================================================
// ANIM 03 · CONFETTI BLAST
//   Quand le mot match, des confettis peints fusent depuis l'input
//   et un ruban se déroule avec la réponse.
// ============================================================
function WinAnim03_Confetti() {
  const t = useTime();

  // 0 - 0.5  : input flash gold
  // 0.5 - 1.0: confetti burst from input center
  // 0.7 - ∞  : confetti continues falling/rotating
  // 1.2 - 2.0: ribbon unfurls
  // 2.0 - end: word stamps in

  const flashP = clamp((t - 0.0) / 0.4, 0, 1);
  const burstP = clamp((t - 0.5) / 0.4, 0, 1);
  const ribbonP = clamp((t - 1.2) / 0.7, 0, 1);
  const wordP = clamp((t - 2.0) / 0.5, 0, 1);

  // Confettis : 60 pieces, fixed seed
  const PIECES = React.useMemo(() => {
    const arr = [];
    const colors = [WIN_SHIMMER, WIN_GOLD, WIN_VIOLET, WIN_CHEM, WIN_RUST, WIN_BONE];
    const shapes = ['rect','triangle','disc','x','star'];
    for (let i = 0; i < 80; i++) {
      const a = (i / 80) * Math.PI * 2 + (i*0.31)%1;
      const speed = 320 + (i*53)%280;
      arr.push({
        angle: a + (Math.sin(i*0.7))*0.5,
        speed,
        color: colors[i % colors.length],
        shape: shapes[i % shapes.length],
        size: 6 + (i*3)%14,
        rot: (i*47)%360,
        spin: (i % 2 ? 1 : -1) * (180 + (i*23)%240),
      });
    }
    return arr;
  }, []);

  return (
    <WinFrame num={3} name="CONFETTI BLAST · ÉCLAT GRAFFITI">
      {/* INPUT */}
      <div style={{position:'relative', display:'flex', gap:10, alignItems:'stretch', marginBottom: 14, zIndex: 5}}>
        <div style={{
          flex:1, display:'flex', alignItems:'center',
          background: 'rgba(13,11,8,0.85)',
          border:`2px solid ${flashP > 0.3 ? WIN_GOLD : WIN_BONE}`,
          padding:'14px 18px',
          boxShadow: flashP > 0.3 ? `0 0 ${flashP*40}px rgba(245,185,18,0.6)` : 'none',
        }}>
          <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:11, color: WIN_SHIMMER, marginRight:10}}>▸</span>
          <span style={{
            fontFamily:"'Barlow Condensed', sans-serif",
            fontSize: 28, fontWeight: 900, textTransform:'uppercase',
            color: flashP > 0.3 ? WIN_GOLD : WIN_BONE, textShadow:`2px 2px 0 ${WIN_INK}`,
          }}>{WIN_WORD}</span>
        </div>
        <button style={{
          background: flashP > 0.3 ? WIN_GOLD : WIN_SHIMMER, color: WIN_INK, border:'none',
          fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, letterSpacing:'0.12em',
          textTransform:'uppercase', fontSize:14, padding:'0 26px',
          clipPath:'polygon(8% 6%, 95% 0, 100% 50%, 92% 100%, 6% 96%, 0 50%)',
        }}>{flashP > 0.3 ? '✓ TROUVÉ' : 'Envoyer ▸'}</button>
      </div>

      <div style={{position:'relative', background:'rgba(13,11,8,0.5)', border:`1.5px solid ${WIN_BONE}`, padding:'4px 0', minHeight: 480}}>
        <WinPriorList dimAt={0.5} fadeAt={1.5}/>

        {/* Origin point of confetti = center of input (above the list) */}
        {/* Confetti pieces */}
        {PIECES.map((p,i) => {
          if (burstP <= 0) return null;
          const dt = clamp((t - 0.5) / 4.0, 0, 1);
          const dx = Math.cos(p.angle) * p.speed * dt;
          const dy = Math.sin(p.angle) * p.speed * dt + 580 * dt * dt; // gravity
          const rot = p.rot + p.spin * dt;
          const opacity = dt < 0.15 ? dt/0.15 : (dt > 0.9 ? (1 - (dt-0.9)/0.1) : 1);
          return (
            <div key={i} style={{
              position:'absolute', top: -56, left: '50%',
              transform:`translate(${dx}px, ${dy}px) rotate(${rot}deg)`,
              opacity, pointerEvents:'none', zIndex: 4,
              willChange:'transform',
            }}>
              <ConfettiPiece shape={p.shape} color={p.color} size={p.size}/>
            </div>
          );
        })}

        {/* Ribbon */}
        {ribbonP > 0 && (
          <div style={{
            position:'absolute', top: '32%', left: '50%',
            transform:`translate(-50%,-50%) rotate(-2deg)`,
            zIndex: 3, pointerEvents:'none',
          }}>
            <div style={{
              position:'relative',
              width: ribbonP * 760, maxWidth: 760, height: 70, overflow:'hidden',
              background: WIN_SHIMMER, color: WIN_INK,
              clipPath:'polygon(2% 12%, 12% 0, 30% 8%, 55% 2%, 78% 10%, 98% 4%, 100% 40%, 97% 75%, 99% 100%, 80% 96%, 55% 100%, 30% 94%, 10% 100%, 1% 88%, 2% 50%)',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 13, letterSpacing:'0.4em', fontWeight:800, opacity: clamp((t-1.6)/0.4, 0, 1)}}>// TROUVÉ EN {WIN_TOTAL} ESSAIS //</span>
            </div>
          </div>
        )}

        {/* Word stamp */}
        {wordP > 0 && (
          <div style={{
            position:'absolute', top:'58%', left:'50%',
            transform:`translate(-50%, -50%) rotate(${-3 + (1-wordP)*8}deg) scale(${0.7 + Easing.easeOutBack(wordP)*0.3})`,
            opacity: wordP, zIndex: 4, pointerEvents:'none', textAlign:'center',
          }}>
            <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize:11, color: WIN_GOLD, letterSpacing:'0.32em', marginBottom:4}}>// MOT DU JOUR ▸</div>
            <div style={{
              fontFamily:"'Barlow Condensed', sans-serif", fontSize: 130, fontWeight: 900,
              color: WIN_GOLD, textShadow:`5px 5px 0 ${WIN_INK}, -2px 2px 0 ${WIN_RUST}, 0 0 40px ${WIN_GOLD}`,
              letterSpacing:'-0.03em', textTransform:'uppercase', lineHeight:0.85,
            }}>{WIN_WORD}</div>
          </div>
        )}
      </div>
    </WinFrame>
  );
}

function ConfettiPiece({ shape, color, size }) {
  const s = size;
  if (shape === 'rect')
    return <div style={{width: s, height: s*0.45, background: color, boxShadow:`1px 1px 0 ${WIN_INK}`}}/>;
  if (shape === 'triangle')
    return <div style={{width:0, height:0, borderLeft:`${s/2}px solid transparent`, borderRight:`${s/2}px solid transparent`, borderBottom:`${s}px solid ${color}`, filter:`drop-shadow(1px 1px 0 ${WIN_INK})`}}/>;
  if (shape === 'disc')
    return <div style={{width:s, height:s, borderRadius:'50%', background: color, boxShadow:`1px 1px 0 ${WIN_INK}`}}/>;
  if (shape === 'x')
    return (
      <svg width={s+4} height={s+4} viewBox="0 0 20 20">
        <g stroke={color} strokeWidth="4" strokeLinecap="round" filter="url(#ac-rougher)">
          <line x1="3" y1="3" x2="17" y2="17"/>
          <line x1="17" y1="3" x2="3" y2="17"/>
        </g>
      </svg>
    );
  // star
  return (
    <svg width={s+4} height={s+4} viewBox="0 0 24 24">
      <polygon points="12,2 14.5,9 22,9 16,13.5 18.5,21 12,16.5 5.5,21 8,13.5 2,9 9.5,9" fill={color} filter="url(#ac-rougher)" stroke={WIN_INK} strokeWidth="0.5"/>
    </svg>
  );
}

// ============================================================
// ANIM 04 · FLAME PILLAR
//   Le mot gagnant déclenche un pilier de flammes qui monte
//   à travers la liste, brûlant chaque ligne en passant.
// ============================================================
function WinAnim04_Flame() {
  const t = useTime();

  // 0 - 0.4 : input ignites
  // 0.4 - 1.8 : flame pillar climbs from bottom to top
  // 1.0 - end : ash particles
  // 1.8 - 3.0 : full screen char + word emerges from fire

  const igniteP = clamp((t - 0.0) / 0.5, 0, 1);
  const climbP = clamp((t - 0.4) / 1.4, 0, 1);
  const climbE = Easing.easeInOutCubic(climbP);
  const wordP = clamp((t - 1.7) / 0.6, 0, 1);

  // The flame "front" Y position from bottom of list
  const flameY = climbE; // 0 = bottom, 1 = top

  return (
    <WinFrame num={4} name="FLAME PILLAR · COMBUSTION">
      <div style={{position:'relative', display:'flex', gap:10, alignItems:'stretch', marginBottom: 14, zIndex: 3}}>
        <div style={{
          flex:1, display:'flex', alignItems:'center',
          background: 'rgba(13,11,8,0.85)',
          border:`2px solid ${WIN_RUST}`,
          padding:'14px 18px',
          boxShadow: `0 0 ${28+igniteP*30}px rgba(200,68,30,0.7)`,
        }}>
          <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:11, color: WIN_SHIMMER, marginRight:10}}>▸</span>
          <span style={{
            fontFamily:"'Barlow Condensed', sans-serif",
            fontSize: 28, fontWeight: 900, textTransform:'uppercase',
            color: WIN_GOLD, textShadow:`2px 2px 0 ${WIN_INK}, 0 0 ${igniteP*20}px ${WIN_RUST}`,
          }}>{WIN_WORD}</span>
        </div>
        <button style={{background: WIN_RUST, color: WIN_BONE, border:'none', fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, letterSpacing:'0.12em', textTransform:'uppercase', fontSize:14, padding:'0 26px', clipPath:'polygon(8% 6%, 95% 0, 100% 50%, 92% 100%, 6% 96%, 0 50%)'}}>🔥 TROUVÉ</button>
      </div>

      <div style={{position:'relative', background:'rgba(13,11,8,0.55)', border:`1.5px solid ${WIN_BONE}`, padding:'4px 0', overflow:'hidden', minHeight: 480}}>
        {/* Liste précédente — qui se charbonne quand la flamme passe */}
        {[...WIN_PRIOR].map((g, i) => {
          // bottom row (index N-1) is reached at climbE = 0, top row at climbE = 1
          // row's Y-fraction (0 = top, 1 = bottom):
          const rowFrac = (i+0.5) / WIN_PRIOR.length;
          const flameTop = 1 - flameY; // 1 → 0
          // burned if flameTop has passed this row's fraction (row burns when flame above it)
          const burned = rowFrac > flameTop ? 1 : 0;
          // burning intensity near front
          const dist = Math.abs(rowFrac - flameTop);
          const heat = Math.max(0, 1 - dist*5);

          const c = cmxHeatColor(g.sim);
          const wRow = g.sim*100;
          return (
            <div key={g.word} style={{
              display:'grid', gridTemplateColumns:'42px 160px 1fr 70px 60px',
              alignItems:'center', gap: 12,
              padding:'4px 14px', height: 28,
              borderBottom:`1px dashed rgba(201,187,148,0.22)`,
              background: heat > 0.1 ? `linear-gradient(90deg, rgba(245,185,18,${heat*0.3}) 0%, rgba(200,68,30,${heat*0.2}) 100%)` : 'transparent',
              opacity: 1 - burned*0.7,
              filter: `grayscale(${burned}) brightness(${1 - burned*0.4})`,
            }}>
              <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: burned ? '#3a2e1c' : WIN_BONE2, letterSpacing:'0.18em'}}>#{String(WIN_TOTAL - 1 - i).padStart(2,'0')}</span>
              <span style={{
                fontFamily:"'Barlow Condensed', sans-serif",
                fontSize: 16 + Math.round(g.sim*8),
                fontWeight: 800, textTransform:'uppercase',
                color: burned ? '#5a4a36' : c,
                textShadow: `1px 1px 0 ${WIN_INK}${heat > 0.3 ? `, 0 0 ${heat*16}px ${WIN_RUST}` : ''}`,
                letterSpacing:'-0.01em',
                textDecoration: burned > 0.5 ? `line-through ${WIN_BONE2}` : 'none',
              }}>{g.word}</span>
              <div style={{position:'relative', height: 14, background:'rgba(240,228,193,0.05)', border:`1px solid rgba(201,187,148,0.25)`}}>
                <svg viewBox="0 0 100 18" preserveAspectRatio="none" style={{position:'absolute', inset:0, width:'100%', height: 18, top:-2}}>
                  <g filter="url(#ac-goo)" fill={burned ? '#3a2e1c' : c}>
                    <rect x="0" y="3" width={Math.max(0, wRow-3)} height="10"/>
                    {wRow>3 && <circle cx={wRow} cy="8" r="4"/>}
                  </g>
                </svg>
              </div>
              <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:11, color: burned ? '#5a4a36' : c, fontWeight:700, textAlign:'right'}}>{(wRow).toFixed(1)}°</span>
              <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: g.rank ? (burned ? '#5a4a36' : c) : WIN_BONE2, letterSpacing:'0.18em', textAlign:'right'}}>{g.rank ? `▸${String(g.rank).padStart(4,' ')}` : '—'}</span>
            </div>
          );
        })}

        {/* Pillier de flamme - SVG goo qui balaye de bas en haut */}
        {climbP > 0 && climbP < 1.2 && (
          <div style={{
            position:'absolute', left:0, right:0,
            top: `${(1-flameY)*100 - 8}%`,
            height: '24%',
            pointerEvents:'none', zIndex: 2,
            filter: `blur(0.2px)`,
          }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{width:'100%', height:'100%'}}>
              <defs>
                <linearGradient id="flame-grad" x1="0" y1="1" x2="0" y2="0">
                  <stop offset="0" stopColor={WIN_RUST} stopOpacity="0.9"/>
                  <stop offset="0.4" stopColor={WIN_GOLD}/>
                  <stop offset="0.8" stopColor={WIN_SHIMMER} stopOpacity="0.6"/>
                  <stop offset="1" stopColor={WIN_SHIMMER} stopOpacity="0"/>
                </linearGradient>
              </defs>
              <g filter="url(#ac-goo)" fill="url(#flame-grad)">
                <rect x="-5" y="20" width="110" height="80"/>
                {[15,30,45,60,75,90].map((cx,j) => {
                  const wob = Math.sin((t*4 + j))*8;
                  const r = 6 + (j%3)*4;
                  return <ellipse key={j} cx={cx} cy={10 + wob*0.5} rx={r*0.8} ry={r*1.4}/>;
                })}
              </g>
            </svg>
          </div>
        )}

        {/* Sparks/embers rising */}
        {climbP > 0.1 && (
          <>
            {Array.from({length: 30}, (_, i) => {
              const phase = ((t*0.6 + i*0.13) % 1.2) / 1.2;
              const x = 5 + (i*7 + i*i*3)%90;
              const y = 100 - phase*100;
              const opacity = 1 - phase;
              const size = 2 + (i%3);
              const c = i % 3 === 0 ? WIN_GOLD : i % 3 === 1 ? WIN_SHIMMER : WIN_RUST;
              return <div key={i} style={{position:'absolute', left:`${x}%`, top:`${y}%`, width: size, height: size, background: c, opacity, boxShadow:`0 0 ${size*2}px ${c}`, zIndex: 3}}/>;
            })}
          </>
        )}

        {/* Word reveal in fire */}
        {wordP > 0 && (
          <div style={{
            position:'absolute', top:'45%', left:'50%',
            transform:`translate(-50%,-50%) scale(${0.6 + Easing.easeOutBack(wordP)*0.4})`,
            opacity: wordP, pointerEvents:'none', zIndex: 5, textAlign:'center',
          }}>
            <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 12, color: WIN_GOLD, letterSpacing:'0.4em', marginBottom: 6, textShadow:`1px 1px 0 ${WIN_INK}`}}>▸ MOT DU JOUR ◂</div>
            <div style={{
              fontFamily:"'Barlow Condensed', sans-serif", fontSize: 140, fontWeight: 900,
              color: WIN_GOLD,
              textShadow: `
                4px 4px 0 ${WIN_INK},
                -2px 2px 0 ${WIN_RUST},
                0 0 30px ${WIN_GOLD},
                0 0 60px ${WIN_RUST},
                0 0 90px ${WIN_RUST}
              `,
              letterSpacing:'-0.03em', textTransform:'uppercase', lineHeight: 0.85,
            }}>{WIN_WORD}</div>
            <div style={{display:'flex', justifyContent:'center', gap:10, marginTop: 12}}>
              <span style={{background: WIN_GOLD, color: WIN_INK, padding:'4px 12px', fontFamily:"'JetBrains Mono', monospace", fontSize:11, letterSpacing:'0.3em', fontWeight:700}}>RANG 1</span>
              <span style={{background: WIN_RUST, color: WIN_BONE, padding:'4px 12px', fontFamily:"'JetBrains Mono', monospace", fontSize:11, letterSpacing:'0.3em', fontWeight:700}}>{WIN_TOTAL} ESSAIS</span>
              <span style={{background: WIN_SHIMMER, color: WIN_INK, padding:'4px 12px', fontFamily:"'JetBrains Mono', monospace", fontSize:11, letterSpacing:'0.3em', fontWeight:700}}>STREAK 13j 🔥</span>
            </div>
          </div>
        )}
      </div>
    </WinFrame>
  );
}

// ============================================================
// ANIM 05 · STAMP CASCADE
//   Tampons "VALIDÉ / TROUVÉ / +RANG / CIBLE / +STREAK" qui slament
//   en cascade avec des angles, puis le tampon final central.
// ============================================================
function WinAnim05_Stamps() {
  const t = useTime();

  // Stamp schedule
  const STAMPS = [
    { txt:'CIBLE',         sub:'VALIDÉE',  at:0.4, x:'18%', y:'30%', rot:-8,  c:WIN_RUST,    bg:WIN_BONE  },
    { txt:'+1',            sub:'TROUVÉ',   at:0.7, x:'78%', y:'24%', rot:7,   c:WIN_BONE,   bg:WIN_GOLD   },
    { txt:'RANG #1',       sub:'TOP 1000', at:1.0, x:'12%', y:'65%', rot:5,   c:WIN_INK,   bg:WIN_SHIMMER },
    { txt:'+STREAK',       sub:'13j',      at:1.3, x:'82%', y:'70%', rot:-6,  c:WIN_INK,   bg:WIN_CHEM    },
    { txt:`${WIN_TOTAL} ESSAIS`,sub:'·',   at:1.6, x:'25%', y:'82%', rot:-3,  c:WIN_BONE,  bg:WIN_VIOLET },
    { txt:'PARFAIT',       sub:'100.0°',   at:1.9, x:'70%', y:'85%', rot:4,   c:WIN_INK,   bg:WIN_GOLD   },
  ];

  const finalP = clamp((t - 2.4) / 0.6, 0, 1);

  return (
    <WinFrame num={5} name="STAMP CASCADE · TAMPONS QUI SLAMMENT">
      <div style={{position:'relative', display:'flex', gap:10, alignItems:'stretch', marginBottom: 14, zIndex: 2}}>
        <div style={{flex:1, display:'flex', alignItems:'center', background:'rgba(13,11,8,0.85)', border:`2px solid ${WIN_GOLD}`, padding:'14px 18px', boxShadow:`0 0 28px rgba(245,185,18,0.4)`}}>
          <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:11, color: WIN_SHIMMER, marginRight:10}}>▸</span>
          <span style={{fontFamily:"'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, textTransform:'uppercase', color: WIN_GOLD, textShadow:`2px 2px 0 ${WIN_INK}`}}>{WIN_WORD}</span>
        </div>
        <button style={{background: WIN_GOLD, color: WIN_INK, border:'none', fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, letterSpacing:'0.12em', textTransform:'uppercase', fontSize:14, padding:'0 26px', clipPath:'polygon(8% 6%, 95% 0, 100% 50%, 92% 100%, 6% 96%, 0 50%)'}}>✓ TROUVÉ</button>
      </div>

      <div style={{position:'relative', background:'rgba(13,11,8,0.5)', border:`1.5px solid ${WIN_BONE}`, padding:'4px 0', minHeight: 480, overflow:'hidden'}}>
        <WinPriorList dimAt={0.3} fadeAt={1.5}/>

        {/* Cascade stamps */}
        {STAMPS.map((s, i) => {
          const lp = clamp((t - s.at) / 0.18, 0, 1);
          if (lp <= 0) return null;
          const slamE = Easing.easeOutCubic(lp);
          // Slam-in: starts huge, lands at scale 1
          const scale = 3 - slamE*2;
          const opacity = lp < 0.15 ? lp/0.15 : 1;
          // Shake on land
          const shake = lp > 0.6 && lp < 0.95 ? Math.sin((lp-0.6)*40)*(0.95-lp)*8 : 0;

          return (
            <div key={i} style={{
              position:'absolute', left: s.x, top: s.y,
              transform:`translate(-50%,-50%) rotate(${s.rot}deg) scale(${scale}) translate(${shake}px, 0)`,
              opacity,
              zIndex: 3 + i,
              pointerEvents:'none',
            }}>
              <div style={{
                background: s.bg, color: s.c,
                padding: '8px 18px',
                border:`3px solid ${s.c}`,
                boxShadow: `0 0 0 2px ${s.bg}, 4px 4px 0 ${WIN_INK}`,
                filter:`url(#ac-rough)`,
                textAlign:'center',
              }}>
                <div style={{fontFamily:"'Barlow Condensed', sans-serif", fontSize: 32, fontWeight: 900, textTransform:'uppercase', letterSpacing:'-0.02em', lineHeight:0.9}}>{s.txt}</div>
                {s.sub && <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, letterSpacing:'0.28em', fontWeight:700, marginTop:2}}>{s.sub}</div>}
              </div>
            </div>
          );
        })}

        {/* Concentric impact rings */}
        {STAMPS.map((s, i) => {
          const lp = clamp((t - s.at) / 0.5, 0, 1);
          if (lp <= 0 || lp >= 1) return null;
          return (
            <div key={`ring-${i}`} style={{
              position:'absolute', left: s.x, top: s.y,
              transform:`translate(-50%,-50%) scale(${lp*4})`,
              width: 60, height: 60, borderRadius:'50%',
              border:`2px solid ${s.bg}`,
              opacity: 1 - lp,
              pointerEvents:'none', zIndex:1,
            }}/>
          );
        })}

        {/* FINAL stamp central */}
        {finalP > 0 && (
          <div style={{
            position:'absolute', top:'48%', left:'50%',
            transform:`translate(-50%,-50%) rotate(${-3 + (1-Easing.easeOutBack(finalP))*20}deg) scale(${0.4 + Easing.easeOutBack(finalP)*0.6})`,
            opacity: finalP, pointerEvents:'none', zIndex: 20, textAlign:'center',
          }}>
            <div style={{
              border:`6px solid ${WIN_RUST}`,
              padding:'18px 44px',
              background: WIN_BONE,
              color: WIN_INK,
              boxShadow:`6px 6px 0 ${WIN_INK}, 0 0 0 3px ${WIN_BONE}, 0 0 0 8px ${WIN_RUST}`,
              filter:`url(#ac-rough)`,
            }}>
              <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 12, color: WIN_RUST, letterSpacing:'0.35em', fontWeight:800, marginBottom: 4}}>// MOT DU JOUR //</div>
              <div style={{
                fontFamily:"'Barlow Condensed', sans-serif", fontSize: 110, fontWeight: 900,
                color: WIN_RUST, textShadow:`3px 3px 0 ${WIN_GOLD}`,
                letterSpacing:'-0.03em', textTransform:'uppercase', lineHeight: 0.85,
              }}>{WIN_WORD}</div>
              <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 12, letterSpacing:'0.35em', fontWeight:800, marginTop: 6, color: WIN_INK}}>▸ ▸ ▸ TROUVÉ ◂ ◂ ◂</div>
            </div>
          </div>
        )}

        {/* Final dust burst */}
        {finalP > 0 && finalP < 0.6 && (
          <div style={{position:'absolute', top:'48%', left:'50%', transform:`translate(-50%,-50%) scale(${finalP*4})`, width: 80, height: 80, borderRadius:'50%', border:`3px solid ${WIN_GOLD}`, opacity: 1-finalP, pointerEvents:'none', zIndex: 19}}/>
        )}
      </div>
    </WinFrame>
  );
}

// ============================================================
// EXPORT
// ============================================================
Object.assign(window, {
  WinAnim01_Overflow,
  WinAnim02_Ladder,
  WinAnim03_Confetti,
  WinAnim04_Flame,
  WinAnim05_Stamps,
});
