// Cemantix — 5 propositions visuelles
// Toutes utilisent les mêmes données pour faciliter la comparaison.

// ============================================================
// DONNÉES PARTAGÉES — mot du jour: SABRE
// ============================================================
//   sim:  0..1   similarité sémantique
//   rank: numéro top-1000 (null = hors top)
// ============================================================

const CMX_GUESSES = [
  // Brûlants (top 1000)
  { word:'lame',     sim:0.972, rank:3   },
  { word:'épée',     sim:0.951, rank:7   },
  { word:'katana',   sim:0.918, rank:24  },
  // Chauds
  { word:'couteau',  sim:0.847, rank:89  },
  { word:'arme',     sim:0.792, rank:214 },
  // Tièdes
  { word:'samouraï', sim:0.681, rank:612 },
  { word:'combat',   sim:0.643, rank:891 },
  { word:'guerre',   sim:0.572, rank:null },
  // Froids
  { word:'soldat',   sim:0.488, rank:null },
  { word:'japon',    sim:0.421, rank:null },
  { word:'fer',      sim:0.395, rank:null },
  { word:'histoire', sim:0.312, rank:null },
  // Glacés
  { word:'musique',  sim:0.184, rank:null },
  { word:'voiture',  sim:0.092, rank:null },
  { word:'forme',    sim:0.038, rank:null },
];

const CMX_LATEST = 'lame';      // Le dernier mot tapé (highlight)
const CMX_BEST   = 'lame';      // Le record actuel
const CMX_TOTAL  = CMX_GUESSES.length;

// ============================================================
// BARÈME — sim → palier visuel
// ============================================================

function cmxTier(sim) {
  if (sim >= 0.95) return { key:'incandescent', label:'INCANDESCENT', color:AC.rust,    accent:AC.gold,    icon:'🔥', frenchTemp:'>95°' };
  if (sim >= 0.85) return { key:'brulant',      label:'BRÛLANT',     color:AC.gold,    accent:AC.shimmer, icon:'🔥', frenchTemp:'85-95°' };
  if (sim >= 0.70) return { key:'chaud',        label:'CHAUD',       color:AC.shimmer, accent:AC.gold,    icon:'♨',  frenchTemp:'70-85°' };
  if (sim >= 0.55) return { key:'tiede',        label:'TIÈDE',       color:AC.violet,  accent:AC.shimmer, icon:'~',  frenchTemp:'55-70°' };
  if (sim >= 0.35) return { key:'frais',        label:'FRAIS',       color:AC.hex,     accent:AC.bone2,   icon:'·',  frenchTemp:'35-55°' };
  if (sim >= 0.15) return { key:'froid',        label:'FROID',       color:AC.chem,    accent:AC.bone2,   icon:'❄',  frenchTemp:'15-35°' };
  return            { key:'glace',        label:'GLACÉ',       color:'#7CC9F2',  accent:AC.bone2,   icon:'❅',  frenchTemp:'<15°' };
}

// Couleur interpolée continue (cyan glace → bleu → violet → rose → or → rouge)
function cmxHeatColor(sim) {
  // stops: [pct, hex]
  const stops = [
    [0.00, '#7CC9F2'], // glacé
    [0.20, '#5EB8FF'], // hex
    [0.45, '#8A3DD4'], // violet
    [0.70, '#FF3D8B'], // shimmer
    [0.88, '#F5B912'], // gold
    [1.00, '#C8441E'], // rust
  ];
  const t = Math.max(0, Math.min(1, sim));
  for (let i=0;i<stops.length-1;i++) {
    const [a, ca] = stops[i], [b, cb] = stops[i+1];
    if (t >= a && t <= b) {
      const p = (t-a)/(b-a);
      return cmxLerpHex(ca, cb, p);
    }
  }
  return '#FF3D8B';
}
function cmxLerpHex(h1, h2, p) {
  const a = parseInt(h1.slice(1),16), b = parseInt(h2.slice(1),16);
  const r1=(a>>16)&255, g1=(a>>8)&255, b1=a&255;
  const r2=(b>>16)&255, g2=(b>>8)&255, b2_=b&255;
  const r = Math.round(r1+(r2-r1)*p);
  const g = Math.round(g1+(g2-g1)*p);
  const bb= Math.round(b1+(b2_-b1)*p);
  return '#'+[r,g,bb].map(x=>x.toString(16).padStart(2,'0')).join('');
}

// ============================================================
// CADRE COMMUN — wrapper Era Games (header CEMANTIX + mat-bg)
// ============================================================

function CmxFrame({ children, variantNum, variantName, latestSim }) {
  return (
    <div style={{
      position:'relative',
      background: 'radial-gradient(circle at 15% 10%, #1F1A13 0%, #0D0B08 65%)',
      color: AC.bone,
      fontFamily: "'Inter', sans-serif",
      padding: '32px 36px 40px',
      minHeight: '100%',
      overflow:'hidden',
    }}>
      <ArcanePaintDefs />
      {/* hatching overlay */}
      <div style={{position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(45deg, transparent 0 3px, rgba(240,228,193,0.018) 3px 4px)', pointerEvents:'none'}}/>
      {/* grain */}
      <div style={{position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 1px 1px, rgba(240,228,193,0.04) 1px, transparent 1px)', backgroundSize:'3px 3px', pointerEvents:'none', mixBlendMode:'overlay'}}/>

      {/* Header */}
      <div style={{position:'relative', display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom: 18, gap: 24}}>
        <div>
          <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 4}}>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 10, color: AC.bone2, letterSpacing:'0.2em'}}>// VARIANTE {String(variantNum).padStart(2,'0')}</span>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 10, color: AC.shimmer, letterSpacing:'0.2em'}}>{variantName}</span>
          </div>
          <h1 style={{
            fontFamily:"'Barlow Condensed', 'Bebas Neue', sans-serif",
            fontSize: 64, fontWeight: 900,
            margin: 0, lineHeight: 0.85,
            letterSpacing:'-0.02em', textTransform:'uppercase',
            color: AC.shimmer,
            textShadow:`3px 3px 0 ${AC.ink}, -1px 1px 0 ${AC.violet}`,
          }}>Cemantix</h1>
          <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, color: AC.bone2, letterSpacing:'0.18em', marginTop: 6}}>
            // {CMX_TOTAL} ESSAIS · PROXIMITÉ SÉMANTIQUE · MEILLEUR ▸ <span style={{color: cmxHeatColor(0.972)}}>{CMX_BEST.toUpperCase()} · 97.2°</span>
          </div>
        </div>

        <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap: 6}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 9, color: AC.shimmer, background: 'rgba(255,61,139,0.12)', border:`1px solid ${AC.shimmer}`, padding:'2px 6px', letterSpacing:'0.2em'}}>DAILY</span>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, color: AC.bone2, letterSpacing:'0.1em'}}>// 2026-04-30</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: AC.bone2, letterSpacing:'0.18em'}}>ABANDON</span>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: AC.bone2, letterSpacing:'0.18em'}}>·</span>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: AC.bone, letterSpacing:'0.18em', borderBottom: `1px solid ${AC.bone2}`, paddingBottom: 1}}>RÈGLES</span>
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}

// Input commun (visuel) ------------------------------------------
function CmxInput({ width = 'auto', placeholder='Tape un mot et devine le mot du jour…' }) {
  return (
    <div style={{position:'relative', display:'flex', gap:10, alignItems:'stretch', width, marginBottom: 16}}>
      <div style={{
        flex:1, display:'flex', alignItems:'center',
        background: 'rgba(13,11,8,0.85)',
        border:`1.5px solid ${AC.bone}`,
        padding:'14px 18px', position:'relative',
      }}>
        <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:11, color: AC.shimmer, marginRight:10, letterSpacing:'0.18em'}}>▸</span>
        <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:14, color: AC.bone2, letterSpacing:'0.04em'}}>{placeholder}</span>
        <span style={{marginLeft: 6, width: 9, height: 18, background: AC.shimmer, animation:'cmx-blink 1s step-end infinite'}}/>
      </div>
      <button style={{
        background: AC.shimmer, color: AC.ink, border:'none', cursor:'pointer',
        fontFamily:"'Barlow Condensed', sans-serif", fontWeight:900, letterSpacing:'0.12em',
        textTransform:'uppercase', fontSize:14, padding:'0 26px',
        clipPath:'polygon(8% 6%, 95% 0, 100% 50%, 92% 100%, 6% 96%, 0 50%)',
      }}>Envoyer ▸</button>
    </div>
  );
}

// ============================================================
// 01 · THERMOMÈTRE — colonne verticale peinte
// ============================================================

function CmxV01_Thermometre({ width = 1240 }) {
  // On trie pour pouvoir placer chaque mot à sa hauteur
  const sorted = [...CMX_GUESSES].sort((a,b) => b.sim - a.sim);
  const latest = CMX_LATEST;

  // Hauteur du tube
  const TUBE_H = 720;
  const TUBE_W = 84;

  // Niveau de remplissage = meilleur score
  const bestSim = Math.max(...CMX_GUESSES.map(g => g.sim));
  const fillH = TUBE_H * bestSim;

  // Paliers visuels
  const tiers = [
    { sim:1.00, label:'INCANDESCENT', deg:'100°', color: AC.rust   },
    { sim:0.85, label:'BRÛLANT',      deg:' 85°', color: AC.gold   },
    { sim:0.70, label:'CHAUD',        deg:' 70°', color: AC.shimmer},
    { sim:0.55, label:'TIÈDE',        deg:' 55°', color: AC.violet },
    { sim:0.35, label:'FRAIS',        deg:' 35°', color: AC.hex    },
    { sim:0.15, label:'FROID',        deg:' 15°', color: AC.chem   },
    { sim:0.00, label:'GLACÉ',        deg:'  0°', color: '#7CC9F2' },
  ];

  return (
    <CmxFrame variantNum={1} variantName="THERMOMÈTRE PEINT" latestSim={bestSim}>
      <CmxInput/>

      <div style={{display:'grid', gridTemplateColumns: '320px 1fr', gap: 28, alignItems:'flex-start'}}>

        {/* THERMOMÈTRE */}
        <div style={{
          position:'relative',
          background:'rgba(13,11,8,0.6)',
          border:`1.5px dashed ${AC.bone2}`,
          padding: '24px 24px 28px',
        }}>
          <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.bone2, letterSpacing:'0.2em', marginBottom: 14}}>// THERMOMÈTRE / SIM°</div>

          <div style={{position:'relative', height: TUBE_H + 60, display:'flex', justifyContent:'center'}}>
            {/* Graduations + labels */}
            <div style={{position:'absolute', top: 0, left: 0, height: TUBE_H + 30}}>
              {tiers.map((t,i) => {
                const y = TUBE_H * (1 - t.sim);
                return (
                  <div key={i} style={{position:'absolute', top: y, left: 0, display:'flex', alignItems:'center', gap:6, fontFamily:"'JetBrains Mono', monospace", fontSize:9, letterSpacing:'0.18em', whiteSpace:'nowrap'}}>
                    <span style={{color: t.color, width: 32}}>{t.deg}</span>
                    <span style={{height: 1, width: 14, background: t.color}}/>
                    <span style={{color: t.color, fontWeight: 700}}>{t.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Tube */}
            <div style={{
              position:'absolute', top: 0, left: 200, width: TUBE_W, height: TUBE_H,
              border:`2px solid ${AC.bone}`,
              background:`linear-gradient(180deg, ${AC.ink} 0%, ${AC.ink2} 100%)`,
              overflow:'hidden',
            }}>
              {/* Remplissage peint avec gradient cold→hot */}
              <svg width={TUBE_W-4} height={fillH} viewBox={`0 0 ${TUBE_W-4} ${fillH}`} style={{position:'absolute', bottom:0, left:2, display:'block'}} preserveAspectRatio="none">
                <defs>
                  <linearGradient id="cmx-thermo" x1="0" y1="1" x2="0" y2="0">
                    <stop offset="0" stopColor="#7CC9F2"/>
                    <stop offset="0.20" stopColor={AC.hex}/>
                    <stop offset="0.45" stopColor={AC.violet}/>
                    <stop offset="0.70" stopColor={AC.shimmer}/>
                    <stop offset="0.88" stopColor={AC.gold}/>
                    <stop offset="1" stopColor={AC.rust}/>
                  </linearGradient>
                </defs>
                <g filter="url(#ac-goo)">
                  <rect x="0" y="0" width={TUBE_W-4} height={fillH} fill="url(#cmx-thermo)"/>
                  {/* bulles qui montent */}
                  <circle cx="22" cy="40" r="6" fill="url(#cmx-thermo)"/>
                  <circle cx="55" cy="80" r="4" fill="url(#cmx-thermo)"/>
                  <circle cx="34" cy="160" r="5" fill="url(#cmx-thermo)"/>
                </g>
              </svg>

              {/* gouttes en haut du remplissage */}
              <svg viewBox={`0 0 ${TUBE_W-4} 24`} style={{position:'absolute', left:2, bottom: fillH-6, width: TUBE_W-4, height: 24}} preserveAspectRatio="none">
                <g filter="url(#ac-goo)" fill={cmxHeatColor(bestSim)}>
                  <circle cx="20" cy="6" r="6"/>
                  <circle cx="44" cy="2" r="5"/>
                  <circle cx="64" cy="8" r="4"/>
                </g>
              </svg>
            </div>

            {/* Bulbe */}
            <div style={{
              position:'absolute', top: TUBE_H - 4, left: 174,
              width: 138, height: 138, borderRadius:'50%',
              background:`radial-gradient(circle at 35% 30%, ${AC.rust}, #6B1F0E 60%, ${AC.ink} 100%)`,
              border:`2px solid ${AC.bone}`,
              boxShadow:`inset -10px -12px 30px rgba(0,0,0,0.6), 0 0 32px rgba(200,68,30,0.4)`,
            }}>
              {/* étiquette degré actuel */}
              <div style={{
                position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                fontFamily:"'Barlow Condensed', sans-serif", color: AC.bone, textShadow:`2px 2px 0 ${AC.ink}`,
              }}>
                <div style={{fontSize:38, fontWeight:900, lineHeight:0.9}}>97<span style={{fontSize:18}}>°</span></div>
                <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize:8, color: AC.gold, letterSpacing:'0.2em'}}>BEST</div>
              </div>
            </div>
          </div>
        </div>

        {/* COLONNE DE DROITE : mots placés à leur niveau */}
        <div style={{position:'relative'}}>
          <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom: 14}}>
            <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.bone2, letterSpacing:'0.2em'}}>// MOTS PLACÉS · DU PLUS CHAUD AU PLUS FROID</div>
            <div style={{display:'flex', gap:10}}>
              <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.bone2, letterSpacing:'0.18em'}}>TRI ▸ <span style={{color: AC.bone}}>SIM°</span></span>
              <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.bone2, letterSpacing:'0.18em'}}>RANG</span>
            </div>
          </div>

          <div style={{
            position:'relative',
            border:`1.5px dashed ${AC.bone2}`,
            background:'rgba(13,11,8,0.4)',
            padding: 0,
            height: TUBE_H + 80,
            overflow:'hidden',
          }}>
            {/* Lignes de palier en arrière-plan */}
            {tiers.map((t,i) => {
              const y = (TUBE_H+30) * (1 - t.sim) + 24;
              return (
                <div key={i} style={{position:'absolute', top: y, left: 0, right: 0, height: 0, borderTop: `1px dashed ${t.color}`, opacity: 0.18}}/>
              );
            })}

            {sorted.map((g, i) => {
              const tier = cmxTier(g.sim);
              const color = cmxHeatColor(g.sim);
              const y = (TUBE_H + 30) * (1 - g.sim) + 14;
              const isLatest = g.word === latest;
              return (
                <div key={g.word} style={{
                  position:'absolute', top: y, left: 22, right: 18, height: 32,
                  display:'flex', alignItems:'center', gap: 12,
                }}>
                  {/* trait depuis la gauche */}
                  <span style={{flexShrink:0, width: 18, height:1, background: color, opacity: 0.8}}/>
                  {/* badge sim */}
                  <span style={{
                    flexShrink:0, fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.ink,
                    background: color, padding:'3px 8px', letterSpacing:'0.1em', fontWeight: 700,
                  }}>{(g.sim*100).toFixed(1)}°</span>
                  {/* mot */}
                  <span style={{
                    flexShrink: 0,
                    fontFamily:"'Barlow Condensed', sans-serif",
                    fontSize: isLatest ? 28 : 22,
                    fontWeight: 800, textTransform:'uppercase',
                    color: isLatest ? AC.bone : color,
                    textShadow: isLatest ? `2px 2px 0 ${AC.ink}, -1px 1px 0 ${color}` : `1px 1px 0 ${AC.ink}`,
                    letterSpacing:'-0.01em',
                  }}>{g.word}</span>
                  {/* rang */}
                  {g.rank && (
                    <span style={{
                      flexShrink:0, fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: tier.accent,
                      border:`1px dashed ${tier.accent}`, padding:'1px 5px', letterSpacing:'0.16em',
                    }}>RANG {g.rank}</span>
                  )}
                  {/* mini barre de remplissage */}
                  <span style={{flex:1, height: 6, background:'rgba(240,228,193,0.06)', position:'relative', alignSelf:'center', marginTop: 2}}>
                    <span style={{position:'absolute', inset:0, width: `${g.sim*100}%`, background: color}}/>
                  </span>
                  {/* tag */}
                  <span style={{
                    flexShrink:0, fontFamily:"'JetBrains Mono', monospace", fontSize:8, color: color,
                    letterSpacing:'0.2em',
                  }}>{tier.label}</span>
                  {isLatest && (
                    <span style={{flexShrink:0, fontFamily:"'JetBrains Mono', monospace", fontSize:8, color: AC.shimmer, letterSpacing:'0.2em', background:'rgba(255,61,139,0.12)', padding:'2px 6px', border:`1px solid ${AC.shimmer}`}}>{'<<'} ESSAI #{CMX_TOTAL}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </CmxFrame>
  );
}

// ============================================================
// 02 · LISTE PEINTE — chaque essai = barre goo, intensité graduelle
// ============================================================

// Carte "Dernier essai" : montre le mot que le joueur vient de taper,
// avec un curseur qui balaye le gradient froid→chaud puis la peinture
// remplit jusqu'au degré atteint. Boucle toutes les 5s.
function CmxLatestFeedback() {
  const latest = CMX_GUESSES.find(g => g.word === CMX_LATEST);
  const tier = cmxTier(latest.sim);
  const color = cmxHeatColor(latest.sim);
  const wPct = latest.sim * 100;

  return (
    <div style={{
      position:'relative', display:'grid', gridTemplateColumns:'auto 1fr auto',
      alignItems:'center', gap: 22,
      marginBottom: 18,
      background: `linear-gradient(90deg, rgba(13,11,8,0.85) 0%, rgba(13,11,8,0.55) 100%)`,
      border:`1.5px solid ${color}`,
      padding: '14px 20px',
      boxShadow: latest.sim >= 0.85 ? `0 0 28px ${color}33, inset 0 0 0 1px rgba(245,185,18,0.12)` : 'none',
    }}>
      {/* Mot tapé */}
      <div style={{display:'flex', flexDirection:'column', gap: 2, minWidth: 240}}>
        <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.bone2, letterSpacing:'0.22em'}}>
          // DERNIER ESSAI · #{String(CMX_TOTAL).padStart(2,'0')}
        </div>
        <div style={{
          fontFamily:"'Barlow Condensed', sans-serif",
          fontSize: 56, fontWeight: 900, textTransform:'uppercase',
          color: AC.bone, textShadow:`3px 3px 0 ${AC.ink}, -1px 1px 0 ${color}`,
          letterSpacing:'-0.02em', lineHeight: 0.85,
          animation: 'cmx-feedback-word 5s ease-out infinite',
        }}>{latest.word}</div>
      </div>

      {/* Bande gradient + curseur balayant */}
      <div style={{position:'relative', height: 38}}>
        {/* Track gradient cold→hot */}
        <div style={{
          position:'absolute', left: 0, right: 0, top: 8, height: 22,
          background: `linear-gradient(90deg,
            #7CC9F2 0%,
            ${AC.chem} 15%,
            ${AC.hex} 35%,
            ${AC.violet} 55%,
            ${AC.shimmer} 70%,
            ${AC.gold} 88%,
            ${AC.rust} 100%)`,
          border:`1px solid ${AC.bone2}`,
          opacity: 0.35,
        }}/>
        {/* Tiers ticks */}
        {[
          {p:0.15, l:'FROID',   c:AC.chem},
          {p:0.35, l:'FRAIS',   c:AC.hex},
          {p:0.55, l:'TIÈDE',   c:AC.violet},
          {p:0.70, l:'CHAUD',   c:AC.shimmer},
          {p:0.85, l:'BRÛLANT', c:AC.gold},
          {p:0.95, l:'INCAND.', c:AC.rust},
        ].map((t,i) => (
          <div key={i} style={{position:'absolute', left:`${t.p*100}%`, top: 0, bottom: 0, width: 0, borderLeft:`1px dashed ${t.c}`, opacity: 0.5}}>
            <span style={{position:'absolute', top: -2, left: 4, fontFamily:"'JetBrains Mono', monospace", fontSize:8, color: t.c, letterSpacing:'0.15em', whiteSpace:'nowrap', fontWeight:700}}>{t.l}</span>
          </div>
        ))}

        {/* Peinture remplie jusqu'à wPct (animée) */}
        <div style={{
          position:'absolute', left: 0, top: 8, height: 22,
          width: `${wPct}%`,
          overflow:'hidden',
          animation:'cmx-feedback-fill 5s cubic-bezier(0.22, 1, 0.36, 1) infinite',
          transformOrigin: 'left center',
        }}>
          <svg viewBox={`0 0 ${wPct} 28`} preserveAspectRatio="none" style={{position:'absolute', inset:0, width:'100%', height:'100%', top:-3}}>
            <defs>
              <linearGradient id="cmx-feedback-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#7CC9F2"/>
                <stop offset="0.15" stopColor={AC.chem}/>
                <stop offset="0.35" stopColor={AC.hex}/>
                <stop offset="0.55" stopColor={AC.violet}/>
                <stop offset="0.70" stopColor={AC.shimmer}/>
                <stop offset="0.88" stopColor={AC.gold}/>
                <stop offset="1" stopColor={AC.rust}/>
              </linearGradient>
            </defs>
            <g filter="url(#ac-goo)">
              <rect x="0" y="6" width={Math.max(0,wPct-4)} height="16" fill="url(#cmx-feedback-grad)"/>
              {wPct > 4 && <circle cx={wPct} cy="14" r="8" fill={color}/>}
              {wPct > 12 && <circle cx={wPct-8} cy="24" r="3" fill={color}/>}
              {wPct > 92 && <circle cx={wPct+3} cy="4" r="3" fill={AC.gold}/>}
            </g>
            {/* Flammes pour brûlant+ */}
            {latest.sim >= 0.85 && (
              <g filter="url(#ac-rougher)" fill={AC.gold}>
                <path d={`M${wPct-3} 2 Q${wPct} -6 ${wPct+3} 2 Q${wPct+1} 4 ${wPct} 6 Q${wPct-1} 4 ${wPct-3} 2`}/>
              </g>
            )}
          </svg>
        </div>

        {/* Curseur balayant : passe une fois sur tout, finit à wPct */}
        <div style={{
          position:'absolute', top: -4, left: 0, width: 2, height: 38,
          background: AC.bone,
          boxShadow: `0 0 12px ${color}, 0 0 22px ${color}`,
          animation:'cmx-feedback-cursor 5s cubic-bezier(0.22, 1, 0.36, 1) infinite',
        }}>
          <span style={{position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)', fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: AC.bone, letterSpacing:'0.1em', whiteSpace:'nowrap', fontWeight:700, textShadow:`1px 1px 0 ${AC.ink}`}}>▼</span>
        </div>
      </div>

      {/* Verdict */}
      <div style={{display:'flex', flexDirection:'column', alignItems:'flex-end', gap: 4, minWidth: 130}}>
        <div style={{
          fontFamily:"'Barlow Condensed', sans-serif",
          fontSize: 38, fontWeight: 900,
          color: color, textShadow:`2px 2px 0 ${AC.ink}`,
          letterSpacing:'-0.01em', lineHeight: 0.9,
          fontVariantNumeric:'tabular-nums',
          animation:'cmx-feedback-verdict 5s ease-out infinite',
        }}>
          {wPct.toFixed(1)}<span style={{fontSize:22}}>°</span>
        </div>
        <div style={{
          fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.ink,
          background: color, padding:'3px 10px', letterSpacing:'0.22em', fontWeight:700,
          animation:'cmx-feedback-verdict 5s ease-out infinite',
        }}>{tier.label}</div>
        {latest.rank && (
          <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: tier.accent, letterSpacing:'0.18em', border:`1px dashed ${tier.accent}`, padding:'1px 6px'}}>
            ▸ RANG {latest.rank}
          </div>
        )}
      </div>
    </div>
  );
}

function CmxV02_PaintedList({ width = 1240 }) {
  const sorted = [...CMX_GUESSES].sort((a,b) => b.sim - a.sim);

  return (
    <CmxFrame variantNum={2} variantName="LISTE PEINTE · GOUTTES GOO">
      <CmxInput/>

      {/* Dernier essai — feedback animé du froid au chaud */}
      <CmxLatestFeedback/>

      {/* Liste */}
      <div style={{
        background:'rgba(13,11,8,0.55)',
        border:`1.5px solid ${AC.bone}`,
        padding: '6px 0',
      }}>
        {sorted.map((g, i) => {
          const tier = cmxTier(g.sim);
          const color = cmxHeatColor(g.sim);
          const isLatest = g.word === CMX_LATEST;
          // intensité graphique: largeur barre, opacité, taille mot
          const wPct = g.sim*100;

          return (
            <div key={g.word} style={{
              position:'relative',
              display:'grid', gridTemplateColumns: '52px 220px 1fr 110px 80px 24px',
              alignItems:'center', gap: 14,
              padding: '12px 18px',
              borderBottom: i < sorted.length-1 ? `1px dashed rgba(201,187,148,0.25)` : 'none',
              background: isLatest ? `linear-gradient(90deg, rgba(255,61,139,0.08) 0%, rgba(255,61,139,0) 60%)` : 'transparent',
            }}>
              {/* num */}
              <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.bone2, letterSpacing:'0.2em'}}>
                #{String(CMX_TOTAL - i).padStart(2,'0')}
              </span>

              {/* mot */}
              <div style={{display:'flex', alignItems:'baseline', gap: 10}}>
                <span style={{
                  fontFamily:"'Barlow Condensed', sans-serif",
                  fontSize: 22 + Math.round(g.sim * 14), // 22 → 36
                  fontWeight: 800, textTransform:'uppercase',
                  color: isLatest ? AC.bone : color,
                  textShadow: g.sim >= 0.85
                    ? `2px 2px 0 ${AC.ink}, -1px 1px 0 ${color}, 0 0 24px ${color}`
                    : `1px 1px 0 ${AC.ink}`,
                  letterSpacing:'-0.01em',
                  filter: g.sim < 0.2 ? 'blur(0.4px)' : 'none',
                  opacity: g.sim < 0.15 ? 0.7 : 1,
                  textDecoration: g.sim < 0.1 ? `line-through ${AC.bone2}` : 'none',
                }}>{g.word}</span>
                {isLatest && (
                  <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:8, color: AC.shimmer, letterSpacing:'0.2em', border:`1px solid ${AC.shimmer}`, padding:'1px 5px'}}>NEW</span>
                )}
              </div>

              {/* barre peinte goo */}
              <div style={{position:'relative', height: 22, background:'rgba(240,228,193,0.05)', border:`1px solid rgba(201,187,148,0.3)`, overflow:'visible'}}>
                <svg viewBox="0 0 100 28" preserveAspectRatio="none" style={{position:'absolute', inset:0, width:'100%', height: 28, top:-3}}>
                  <g filter="url(#ac-goo)" fill={color}>
                    <rect x="0" y="6" width={Math.max(0,wPct-4)} height="14"/>
                    {wPct > 4 && <circle cx={wPct} cy="13" r="6"/>}
                    {wPct > 12 && <circle cx={wPct-8} cy="22" r="3"/>}
                    {wPct > 20 && <circle cx={wPct-15} cy="6" r="2"/>}
                  </g>
                  {/* flammes pour brûlant+ */}
                  {g.sim >= 0.85 && (
                    <g filter="url(#ac-rougher)" fill={AC.gold}>
                      <path d={`M${wPct-2} -2 Q${wPct} -8 ${wPct+2} -2 Q${wPct+1} 0 ${wPct} 2 Q${wPct-1} 0 ${wPct-2} -2`}/>
                    </g>
                  )}
                </svg>
                {/* tics */}
                <div style={{position:'absolute', top: -6, left: 0, right: 0, display:'flex', justifyContent:'space-between'}}>
                  {[0,25,50,75,100].map(t => <span key={t} style={{width:1, height: 4, background: AC.bone2, opacity: 0.4}}/>)}
                </div>
              </div>

              {/* sim degrees */}
              <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 13, color: color, letterSpacing:'0.06em', fontWeight: 700, textAlign:'right'}}>
                {(g.sim*100).toFixed(1)}°
              </span>

              {/* rang */}
              <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: g.rank ? tier.accent : AC.bone2, letterSpacing:'0.18em', textAlign:'right'}}>
                {g.rank ? `▸${String(g.rank).padStart(4,' ')}` : '—'}
              </span>

              {/* glyphe */}
              <span style={{display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'JetBrains Mono', monospace", fontSize: 16, color: color}}>
                {g.sim >= 0.95 ? '🔥'
                 : g.sim >= 0.85 ? '◆'
                 : g.sim >= 0.70 ? '♥'
                 : g.sim >= 0.55 ? '◇'
                 : g.sim >= 0.35 ? '·'
                 : g.sim >= 0.15 ? '❄'
                 : '·'}
              </span>
            </div>
          );
        })}
      </div>
    </CmxFrame>
  );
}

// ============================================================
// 03 · HEATMAP GRAFFITI — mots en graffiti scatter sur heatmap
// ============================================================

function CmxV03_Heatmap({ width = 1240 }) {
  const sorted = [...CMX_GUESSES].sort((a,b) => b.sim - a.sim);

  // Disposition manuelle des graffiti pour rythme
  // Coordonnées normalisées (en %)
  const POSITIONS = [
    { x: 50, y: 50, rot: -3 },   // sim le + chaud, centre
    { x: 35, y: 35, rot:  4 },
    { x: 65, y: 38, rot: -5 },
    { x: 28, y: 60, rot:  2 },
    { x: 70, y: 62, rot: -2 },
    { x: 18, y: 28, rot: -4 },
    { x: 78, y: 25, rot:  3 },
    { x: 14, y: 78, rot:  5 },
    { x: 84, y: 75, rot: -3 },
    { x: 50, y: 18, rot:  2 },
    { x: 50, y: 85, rot: -4 },
    { x: 8,  y: 45, rot:  6 },
    { x: 90, y: 50, rot: -6 },
    { x: 30, y: 90, rot:  3 },
    { x: 75, y: 90, rot: -2 },
  ];

  const HEAT_W = width - 72;
  const HEAT_H = 720;

  return (
    <CmxFrame variantNum={3} variantName="HEATMAP GRAFFITI · CHAUD AU CENTRE">
      <CmxInput/>

      <div style={{position:'relative', height: HEAT_H + 60}}>
        {/* HEATMAP background */}
        <div style={{
          position:'absolute', inset: '0 0 60px 0',
          background: 'rgba(13,11,8,0.5)',
          border:`1.5px solid ${AC.bone}`,
          overflow:'hidden',
        }}>
          {/* halo central chaud */}
          <div style={{
            position:'absolute', inset: 0,
            background: `
              radial-gradient(ellipse 35% 38% at 50% 50%, rgba(200,68,30,0.55) 0%, rgba(200,68,30,0) 70%),
              radial-gradient(ellipse 50% 50% at 50% 50%, rgba(245,185,18,0.30) 0%, rgba(245,185,18,0) 70%),
              radial-gradient(ellipse 60% 55% at 50% 50%, rgba(255,61,139,0.18) 0%, rgba(255,61,139,0) 70%),
              radial-gradient(ellipse 78% 70% at 50% 50%, rgba(138,61,212,0.12) 0%, rgba(138,61,212,0) 70%)
            `,
            mixBlendMode:'screen',
          }}/>
          {/* bord gel */}
          <div style={{
            position:'absolute', inset: 0,
            background: `
              radial-gradient(ellipse 40% 40% at 0% 0%, rgba(124,201,242,0.18) 0%, transparent 70%),
              radial-gradient(ellipse 40% 40% at 100% 0%, rgba(124,201,242,0.18) 0%, transparent 70%),
              radial-gradient(ellipse 40% 40% at 0% 100%, rgba(124,201,242,0.18) 0%, transparent 70%),
              radial-gradient(ellipse 40% 40% at 100% 100%, rgba(124,201,242,0.18) 0%, transparent 70%)
            `,
            mixBlendMode:'screen',
          }}/>
          {/* anneaux concentriques pour repérer les paliers */}
          <svg style={{position:'absolute', inset:0, width:'100%', height:'100%'}} preserveAspectRatio="none" viewBox="0 0 100 100">
            {[
              {sim:0.95, color: AC.rust,   d:'4 6'},
              {sim:0.85, color: AC.gold,   d:'3 5'},
              {sim:0.70, color: AC.shimmer,d:'2 4'},
              {sim:0.55, color: AC.violet, d:'2 4'},
              {sim:0.35, color: AC.hex,    d:'1 3'},
              {sim:0.15, color: AC.chem,   d:'1 3'},
            ].map((r,i) => {
              const rx = 50 * (1 - r.sim);
              const ry = 50 * (1 - r.sim);
              return <ellipse key={i} cx="50" cy="50" rx={rx} ry={ry} fill="none" stroke={r.color} strokeWidth="0.15" strokeDasharray={r.d} opacity="0.45"/>;
            })}
          </svg>
          {/* grain */}
          <div style={{position:'absolute', inset:0, backgroundImage:'radial-gradient(circle at 1px 1px, rgba(240,228,193,0.05) 1px, transparent 1px)', backgroundSize:'4px 4px', mixBlendMode:'overlay'}}/>

          {/* étiquettes paliers en bord */}
          <div style={{position:'absolute', top: 12, left: 14, fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: '#7CC9F2', letterSpacing:'0.2em'}}>
            {'<<'} GLACÉ
          </div>
          <div style={{position:'absolute', top: 12, right: 14, fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: '#7CC9F2', letterSpacing:'0.2em'}}>
            GLACÉ {'>>'}
          </div>
          <div style={{position:'absolute', bottom: 12, left: 14, fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: '#7CC9F2', letterSpacing:'0.2em'}}>
            GLACÉ ⌐
          </div>
          <div style={{position:'absolute', bottom: 12, right: 14, fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: '#7CC9F2', letterSpacing:'0.2em'}}>
            ¬ GLACÉ
          </div>
          <div style={{position:'absolute', top: '50%', left: '50%', transform:'translate(-50%,-50%)', textAlign:'center', pointerEvents:'none'}}>
            <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: AC.gold, letterSpacing:'0.3em', opacity: 0.6}}>· INCANDESCENT ·</div>
          </div>

          {/* MOTS */}
          {sorted.map((g, i) => {
            const pos = POSITIONS[i] || { x: 50, y: 50, rot: 0 };
            const tier = cmxTier(g.sim);
            const color = cmxHeatColor(g.sim);
            const fontSize = 18 + Math.round(g.sim * 56); // 18 → 74
            const isLatest = g.word === CMX_LATEST;

            return (
              <div key={g.word} style={{
                position:'absolute',
                left: `${pos.x}%`, top: `${pos.y}%`,
                transform:`translate(-50%,-50%) rotate(${pos.rot}deg)`,
                textAlign:'center',
                pointerEvents:'none',
              }}>
                <div style={{
                  fontFamily:"'Barlow Condensed', sans-serif",
                  fontSize, fontWeight: 900,
                  textTransform:'uppercase', letterSpacing:'-0.02em',
                  color,
                  textShadow: g.sim >= 0.85
                    ? `3px 3px 0 ${AC.ink}, -1px 1px 0 ${AC.bone}, 0 0 30px ${color}`
                    : g.sim >= 0.55
                      ? `2px 2px 0 ${AC.ink}, 0 0 14px ${color}`
                      : `2px 2px 0 ${AC.ink}`,
                  filter: g.sim < 0.20 ? 'blur(1px)' : 'none',
                  opacity: g.sim < 0.10 ? 0.4 : 1,
                  lineHeight: 0.85,
                }}>{g.word}</div>
                <div style={{
                  fontFamily:"'JetBrains Mono', monospace",
                  fontSize: 9, color: color,
                  letterSpacing:'0.18em', marginTop: 2,
                  textShadow: `1px 1px 0 ${AC.ink}`,
                }}>
                  {(g.sim*100).toFixed(1)}° {g.rank ? `· R${g.rank}` : ''}
                </div>
                {isLatest && (
                  <div style={{
                    position:'absolute', top: -22, left: '50%', transform:'translateX(-50%) rotate(3deg)',
                    fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: AC.ink, background: AC.shimmer, padding:'2px 6px', letterSpacing:'0.2em', whiteSpace:'nowrap',
                  }}>NOUVEAU ▸ #{CMX_TOTAL}</div>
                )}
              </div>
            );
          })}

          {/* splat central pour récompenser le focus */}
          <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width: 280, height: 280, pointerEvents:'none', zIndex:0}}>
            <svg viewBox="0 0 200 200" style={{width:'100%', height:'100%', opacity: 0.25}}>
              <g filter="url(#ac-paint-spread)">
                <circle cx="100" cy="100" r="60" fill={AC.rust}/>
                <circle cx="155" cy="60" r="10" fill={AC.gold}/>
                <circle cx="55" cy="50" r="8" fill={AC.shimmer}/>
                <circle cx="40" cy="140" r="6" fill={AC.gold}/>
                <circle cx="160" cy="150" r="9" fill={AC.shimmer}/>
              </g>
            </svg>
          </div>
        </div>

        {/* Légende sous heatmap */}
        <div style={{position:'absolute', bottom: 0, left: 0, right: 0, height: 48, display:'flex', alignItems:'center', justifyContent:'center', gap: 24}}>
          <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.bone2, letterSpacing:'0.2em'}}>// PROXIMITÉ ▸ LE CENTRE EST BRÛLANT · LES BORDS GLACÉS · TAILLE = SIM°</span>
          <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.gold, letterSpacing:'0.2em'}}>BEST ▸ LAME · 97.2°</span>
        </div>
      </div>
    </CmxFrame>
  );
}

// ============================================================
// 04 · COMPTEUR GEIGER — paliers empilés, dernier essai en stamp
// ============================================================

function CmxV04_Geiger({ width = 1240 }) {
  const tiersConf = [
    { key:'incandescent', label:'INCANDESCENT', range:'95° → 100°', color: AC.rust    },
    { key:'brulant',      label:'BRÛLANT',      range:'85° → 95°',  color: AC.gold    },
    { key:'chaud',        label:'CHAUD',        range:'70° → 85°',  color: AC.shimmer },
    { key:'tiede',        label:'TIÈDE',        range:'55° → 70°',  color: AC.violet  },
    { key:'frais',        label:'FRAIS',        range:'35° → 55°',  color: AC.hex     },
    { key:'froid',        label:'FROID',        range:'15° → 35°',  color: AC.chem    },
    { key:'glace',        label:'GLACÉ',        range:'  0° → 15°', color: '#7CC9F2'  },
  ];

  // group guesses by tier
  const grouped = {};
  tiersConf.forEach(t => grouped[t.key] = []);
  CMX_GUESSES.forEach(g => grouped[cmxTier(g.sim).key].push(g));
  // each group sorted desc
  Object.keys(grouped).forEach(k => grouped[k].sort((a,b) => b.sim - a.sim));

  const latest = CMX_GUESSES.find(g => g.word === CMX_LATEST);
  const latestTier = cmxTier(latest.sim);
  const latestColor = cmxHeatColor(latest.sim);

  return (
    <CmxFrame variantNum={4} variantName="COMPTEUR GEIGER · PALIERS EMPILÉS">

      <div style={{display:'grid', gridTemplateColumns:'1fr 360px', gap: 24, alignItems:'flex-start'}}>
        {/* Colonne gauche : paliers */}
        <div>
          <CmxInput/>
          <div style={{display:'flex', flexDirection:'column', gap: 10}}>
            {tiersConf.map((t,i) => {
              const items = grouped[t.key];
              const filled = items.length > 0;
              return (
                <div key={t.key} style={{
                  position:'relative',
                  display:'grid', gridTemplateColumns: '160px 1fr 50px',
                  alignItems:'stretch',
                  background: filled ? `linear-gradient(90deg, rgba(13,11,8,0.85) 0%, rgba(13,11,8,0.5) 100%)` : 'rgba(13,11,8,0.3)',
                  border: filled ? `1.5px solid ${t.color}` : `1.5px dashed ${AC.bone2}`,
                  minHeight: 60,
                  opacity: filled ? 1 : 0.55,
                }}>
                  {/* Étiquette palier */}
                  <div style={{
                    background: filled ? t.color : 'transparent',
                    color: filled ? AC.ink : AC.bone2,
                    padding: '10px 14px',
                    display:'flex', flexDirection:'column', justifyContent:'center', gap: 2,
                    borderRight: filled ? 'none' : `1.5px dashed ${AC.bone2}`,
                  }}>
                    <div style={{fontFamily:"'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 22, letterSpacing:'-0.01em', textTransform:'uppercase', lineHeight: 0.9}}>{t.label}</div>
                    <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 9, letterSpacing:'0.18em', opacity: filled ? 0.85 : 1}}>{t.range}</div>
                  </div>

                  {/* Mots */}
                  <div style={{padding: '10px 16px', display:'flex', flexWrap:'wrap', alignItems:'center', gap: 10}}>
                    {items.length === 0 ? (
                      <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, color: AC.bone2, letterSpacing:'0.18em'}}>// vide — pousse plus haut</span>
                    ) : items.map(g => {
                      const isLatest = g.word === CMX_LATEST;
                      return (
                        <div key={g.word} style={{
                          display:'flex', alignItems:'center', gap: 6,
                          padding: '4px 10px',
                          background: isLatest ? t.color : 'rgba(13,11,8,0.6)',
                          border:`1px solid ${t.color}`,
                          color: isLatest ? AC.ink : t.color,
                          position:'relative',
                        }}>
                          <span style={{fontFamily:"'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 800, textTransform:'uppercase', letterSpacing:'-0.01em', lineHeight:1}}>{g.word}</span>
                          <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 9, letterSpacing:'0.12em', opacity: 0.85}}>{(g.sim*100).toFixed(1)}°</span>
                          {g.rank && <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 8, letterSpacing:'0.18em', borderLeft:`1px solid ${isLatest ? AC.ink : t.color}`, paddingLeft: 6, opacity: 0.85}}>R{g.rank}</span>}
                          {isLatest && (
                            <span style={{position:'absolute', top: -8, right: -8, fontFamily:"'JetBrains Mono', monospace", fontSize: 8, color: AC.ink, background: AC.shimmer, padding:'1px 5px', letterSpacing:'0.2em', transform:'rotate(3deg)'}}>NEW</span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Compteur à droite */}
                  <div style={{
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:"'Barlow Condensed', sans-serif", fontWeight: 900,
                    fontSize: 28, color: filled ? t.color : AC.bone2,
                    borderLeft: filled ? `1px dashed ${t.color}` : `1.5px dashed ${AC.bone2}`,
                    fontVariantNumeric:'tabular-nums',
                  }}>
                    <span>×{String(items.length).padStart(2, '0')}</span>
                  </div>

                  {/* gouttes au bas du dernier palier rempli */}
                  {filled && i === 0 && (
                    <svg viewBox="0 0 100 30" preserveAspectRatio="none" style={{position:'absolute', bottom:-24, left:0, width:'100%', height:24, pointerEvents:'none'}}>
                      <g filter="url(#ac-goo)" fill={t.color}>
                        <rect x="-5" y="-5" width="110" height="6"/>
                        <circle cx="20" cy="8" r="5"/>
                        <circle cx="48" cy="14" r="6"/>
                        <circle cx="78" cy="10" r="4"/>
                        <circle cx="92" cy="16" r="3"/>
                      </g>
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Colonne droite : compteur Geiger + dernier coup */}
        <div style={{display:'flex', flexDirection:'column', gap: 16}}>
          {/* Compteur Geiger */}
          <div style={{
            position:'relative',
            background: 'rgba(13,11,8,0.85)',
            border:`1.5px solid ${AC.bone}`,
            padding: '20px 22px',
          }}>
            <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.bone2, letterSpacing:'0.2em', marginBottom: 10}}>// COMPTEUR GEIGER</div>

            {/* Cadran circulaire */}
            <div style={{position:'relative', height: 200, display:'flex', alignItems:'center', justifyContent:'center', marginBottom: 10}}>
              <svg viewBox="0 0 200 120" style={{width:'100%', height:'100%'}}>
                <defs>
                  <linearGradient id="cmx-gauge" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#7CC9F2"/>
                    <stop offset="0.20" stopColor={AC.hex}/>
                    <stop offset="0.45" stopColor={AC.violet}/>
                    <stop offset="0.70" stopColor={AC.shimmer}/>
                    <stop offset="0.88" stopColor={AC.gold}/>
                    <stop offset="1" stopColor={AC.rust}/>
                  </linearGradient>
                </defs>
                {/* arc */}
                <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="url(#cmx-gauge)" strokeWidth="14" strokeLinecap="square"/>
                {/* graduations */}
                {[0,0.25,0.5,0.75,1].map((t,i) => {
                  const a = Math.PI * (1 - t);
                  const x1 = 100 + Math.cos(a) * 70;
                  const y1 = 110 - Math.sin(a) * 70;
                  const x2 = 100 + Math.cos(a) * 88;
                  const y2 = 110 - Math.sin(a) * 88;
                  return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={AC.bone} strokeWidth="1.5"/>;
                })}
                {/* aiguille */}
                {(() => {
                  const t = latest.sim;
                  const a = Math.PI * (1 - t);
                  const x = 100 + Math.cos(a) * 78;
                  const y = 110 - Math.sin(a) * 78;
                  return (
                    <g>
                      <line x1="100" y1="110" x2={x} y2={y} stroke={AC.bone} strokeWidth="3" strokeLinecap="round"/>
                      <line x1="100" y1="110" x2={x} y2={y} stroke={latestColor} strokeWidth="1.5" strokeLinecap="round"/>
                      <circle cx="100" cy="110" r="6" fill={AC.ink} stroke={AC.bone} strokeWidth="2"/>
                      <circle cx={x} cy={y} r="4" fill={latestColor} stroke={AC.bone} strokeWidth="1"/>
                    </g>
                  );
                })()}
                {/* labels */}
                <text x="20" y="118" fontFamily="JetBrains Mono" fontSize="8" fill="#7CC9F2" letterSpacing="0.1em">0°</text>
                <text x="100" y="22" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fill={AC.shimmer} letterSpacing="0.1em">50°</text>
                <text x="180" y="118" textAnchor="end" fontFamily="JetBrains Mono" fontSize="8" fill={AC.rust} letterSpacing="0.1em">100°</text>
              </svg>
            </div>

            {/* Lecture */}
            <div style={{textAlign:'center', borderTop:`1px dashed ${AC.bone2}`, paddingTop: 12}}>
              <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize:9, color: AC.bone2, letterSpacing:'0.2em', marginBottom: 4}}>// DERNIER ESSAI</div>
              <div style={{
                fontFamily:"'Barlow Condensed', sans-serif", fontSize: 56, fontWeight: 900, lineHeight: 0.9,
                color: AC.bone, textShadow:`3px 3px 0 ${AC.ink}, -2px 2px 0 ${latestColor}`,
                letterSpacing:'-0.02em', textTransform:'uppercase',
              }}>{latest.word}</div>
              <div style={{
                fontFamily:"'Barlow Condensed', sans-serif", fontSize: 38, fontWeight: 900,
                color: latestColor, textShadow:`2px 2px 0 ${AC.ink}`, marginTop: 4,
              }}>{(latest.sim*100).toFixed(1)}°</div>
              <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize:11, color: latestColor, letterSpacing:'0.3em', marginTop: 4}}>
                ▸ {latestTier.label} {latest.rank ? `· RANG ${latest.rank}` : ''}
              </div>
            </div>
          </div>

          {/* Cartouche stat */}
          <div style={{
            background:'rgba(13,11,8,0.6)',
            border:`1.5px dashed ${AC.bone2}`,
            padding: '14px 18px',
            display:'flex', flexDirection:'column', gap: 8,
          }}>
            <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.bone2, letterSpacing:'0.2em'}}>// SESSION</div>
            {[
              ['Essais',         CMX_TOTAL],
              ['Top 1000 atteint', CMX_GUESSES.filter(g=>g.rank).length],
              ['Meilleur',       `${CMX_BEST.toUpperCase()} · 97.2°'`],
              ['Streak',         '12 jours 🔥'],
            ].map(([k,v],i) => (
              <div key={i} style={{display:'flex', justifyContent:'space-between', fontFamily:"'JetBrains Mono', monospace", fontSize: 11}}>
                <span style={{color: AC.bone2, letterSpacing:'0.12em'}}>{k}</span>
                <span style={{color: AC.bone, letterSpacing:'0.06em'}}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </CmxFrame>
  );
}

// ============================================================
// 05 · FUSION BAR — barre fusion verticale + buckets visuels
// ============================================================

function CmxV05_Fusion({ width = 1240 }) {
  const sorted = [...CMX_GUESSES].sort((a,b) => b.sim - a.sim);
  const bestSim = Math.max(...CMX_GUESSES.map(g => g.sim));

  return (
    <CmxFrame variantNum={5} variantName="FUSION · BARRE PROGRESSIVE + ARCHIVE">
      <CmxInput/>

      {/* Barre fusion XL */}
      <div style={{
        position:'relative',
        background:'rgba(13,11,8,0.85)',
        border:`1.5px solid ${AC.bone}`,
        padding: '18px 22px 22px',
        marginBottom: 22,
      }}>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 10}}>
          <div>
            <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.bone2, letterSpacing:'0.2em'}}>// FUSION ▸ MEILLEUR SCORE ATTEINT</div>
            <div style={{display:'flex', alignItems:'baseline', gap: 14, marginTop: 6}}>
              <span style={{fontFamily:"'Barlow Condensed', sans-serif", fontSize: 64, fontWeight:900, color: cmxHeatColor(bestSim), textShadow:`3px 3px 0 ${AC.ink}, 0 0 30px ${cmxHeatColor(bestSim)}`, letterSpacing:'-0.02em', lineHeight:0.85}}>
                {(bestSim*100).toFixed(1)}°
              </span>
              <span style={{fontFamily:"'Barlow Condensed', sans-serif", fontSize: 28, fontWeight:800, color: AC.bone, textShadow:`2px 2px 0 ${AC.ink}`, textTransform:'uppercase', letterSpacing:'-0.01em'}}>
                ▸ {CMX_BEST}
              </span>
              <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:11, color: AC.gold, letterSpacing:'0.18em', border:`1px solid ${AC.gold}`, padding:'2px 8px', alignSelf:'center'}}>RANG 3 · TOP 1000</span>
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.bone2, letterSpacing:'0.2em'}}>// CIBLE</div>
            <div style={{fontFamily:"'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, color: AC.bone, letterSpacing:'-0.01em'}}>100°</div>
            <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.shimmer, letterSpacing:'0.18em'}}>▸ 2.8° RESTANTS</div>
          </div>
        </div>

        {/* Track fusion */}
        <div style={{position:'relative', height: 56, background:`linear-gradient(90deg, rgba(124,201,242,0.06), rgba(255,61,139,0.06), rgba(245,185,18,0.06), rgba(200,68,30,0.08))`, border:`1.5px solid ${AC.bone}`, overflow:'visible'}}>
          {/* fond gradient teinté très léger */}
          <div style={{position:'absolute', inset:0, background:`repeating-linear-gradient(90deg, transparent 0 22px, rgba(240,228,193,0.07) 22px 23px)`}}/>

          {/* paliers */}
          {[
            {sim:0.15, label:'FROID',    c:AC.chem},
            {sim:0.35, label:'FRAIS',    c:AC.hex},
            {sim:0.55, label:'TIÈDE',    c:AC.violet},
            {sim:0.70, label:'CHAUD',    c:AC.shimmer},
            {sim:0.85, label:'BRÛLANT',  c:AC.gold},
            {sim:0.95, label:'INCAND.',  c:AC.rust},
          ].map((t,i) => (
            <div key={i} style={{position:'absolute', top:-14, bottom:-14, left:`${t.sim*100}%`, width: 1, background: t.c, opacity: 0.55}}>
              <span style={{position:'absolute', top:-15, left:'50%', transform:'translateX(-50%)', fontFamily:"'JetBrains Mono', monospace", fontSize:8, color: t.c, letterSpacing:'0.18em', whiteSpace:'nowrap'}}>{t.label}</span>
              <span style={{position:'absolute', bottom:-14, left:'50%', transform:'translateX(-50%)', fontFamily:"'JetBrains Mono', monospace", fontSize:8, color: t.c, letterSpacing:'0.12em'}}>{(t.sim*100).toFixed(0)}°</span>
            </div>
          ))}

          {/* remplissage goo */}
          <svg viewBox={`0 0 100 56`} preserveAspectRatio="none" style={{position:'absolute', inset:0, width:'100%', height:'100%'}}>
            <defs>
              <linearGradient id="cmx-fusion-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#7CC9F2"/>
                <stop offset="0.20" stopColor={AC.hex}/>
                <stop offset="0.45" stopColor={AC.violet}/>
                <stop offset="0.70" stopColor={AC.shimmer}/>
                <stop offset="0.88" stopColor={AC.gold}/>
                <stop offset="1" stopColor={AC.rust}/>
              </linearGradient>
            </defs>
            <g filter="url(#ac-goo)">
              <rect x="0" y="14" width={bestSim*100} height="28" fill="url(#cmx-fusion-grad)"/>
              <circle cx={bestSim*100} cy="28" r="14" fill={cmxHeatColor(bestSim)}/>
              <circle cx={bestSim*100 - 2} cy="14" r="6" fill={cmxHeatColor(bestSim)}/>
              <circle cx={bestSim*100 - 4} cy="44" r="5" fill={cmxHeatColor(bestSim)}/>
            </g>
          </svg>

          {/* marqueurs des autres essais */}
          {sorted.map((g, i) => g.word === CMX_BEST ? null : (
            <div key={g.word} style={{
              position:'absolute', left:`calc(${g.sim*100}% - 1px)`, top: 8, bottom: 8,
              width: 2, background: cmxHeatColor(g.sim), opacity: 0.55,
            }}/>
          ))}

          {/* flammes au bout */}
          <div style={{position:'absolute', left:`calc(${bestSim*100}% - 18px)`, top:-20, width: 36, height: 36, fontSize: 32, textAlign:'center'}}>
            🔥
          </div>
        </div>

        {/* hint au bout */}
        <div style={{display:'flex', justifyContent:'space-between', marginTop: 28, fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.bone2, letterSpacing:'0.2em'}}>
          <span style={{color:'#7CC9F2'}}>0° ▸ glacé</span>
          <span style={{color: AC.bone2}}>plus tu chauffes, plus tu approches du mot du jour</span>
          <span style={{color: AC.rust}}>brûlant ▸ 100°</span>
        </div>
      </div>

      {/* Archive — liste compacte deux colonnes */}
      <div style={{
        background:'rgba(13,11,8,0.5)',
        border:`1.5px dashed ${AC.bone2}`,
        padding: 18,
      }}>
        <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom: 14}}>
          <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.bone2, letterSpacing:'0.2em'}}>// ARCHIVE · {CMX_TOTAL} ESSAIS</span>
          <div style={{display:'flex', gap: 16}}>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.bone, letterSpacing:'0.18em', borderBottom:`1px solid ${AC.bone}`, paddingBottom: 1}}>SIM°</span>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.bone2, letterSpacing:'0.18em'}}>CHRONO</span>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.bone2, letterSpacing:'0.18em'}}>ALPHA</span>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: '8px 28px'}}>
          {sorted.map((g, i) => {
            const tier = cmxTier(g.sim);
            const color = cmxHeatColor(g.sim);
            const isLatest = g.word === CMX_LATEST;
            return (
              <div key={g.word} style={{
                position:'relative',
                display:'grid', gridTemplateColumns:'34px 1fr 56px 50px 18px', gap: 10,
                alignItems:'center',
                padding:'8px 10px',
                background: isLatest ? `linear-gradient(90deg, rgba(255,61,139,0.10) 0%, transparent 70%)` : 'transparent',
                borderLeft:`3px solid ${color}`,
              }}>
                <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:10, color: AC.bone2, letterSpacing:'0.16em'}}>#{String(CMX_TOTAL - i).padStart(2,'0')}</span>
                <span style={{
                  fontFamily:"'Barlow Condensed', sans-serif",
                  fontSize: 18 + Math.round(g.sim*8),
                  fontWeight: 800, textTransform:'uppercase',
                  color: isLatest ? AC.bone : color,
                  textShadow: g.sim >= 0.85 ? `1px 1px 0 ${AC.ink}, 0 0 12px ${color}` : `1px 1px 0 ${AC.ink}`,
                  letterSpacing:'-0.01em',
                  filter: g.sim < 0.15 ? 'blur(0.4px)' : 'none',
                }}>{g.word}</span>
                <span style={{height: 6, background:'rgba(240,228,193,0.07)', position:'relative'}}>
                  <span style={{position:'absolute', inset:0, width: `${g.sim*100}%`, background: color}}/>
                </span>
                <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:11, color: color, letterSpacing:'0.06em', textAlign:'right', fontWeight:700}}>{(g.sim*100).toFixed(1)}°</span>
                <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:13, color, textAlign:'center'}}>
                  {g.sim >= 0.95 ? '🔥' : g.sim >= 0.85 ? '◆' : g.sim >= 0.70 ? '♥' : g.sim >= 0.55 ? '◇' : g.sim >= 0.35 ? '·' : '❄'}
                </span>
                {isLatest && (
                  <span style={{
                    position:'absolute', top: -6, right: 4,
                    fontFamily:"'JetBrains Mono', monospace", fontSize:8, color: AC.ink, background: AC.shimmer,
                    padding:'1px 5px', letterSpacing:'0.2em', transform:'rotate(2deg)',
                  }}>NEW ▸ #{CMX_TOTAL}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </CmxFrame>
  );
}

// ============================================================
// EXPORT
// ============================================================

Object.assign(window, {
  CmxV01_Thermometre,
  CmxV02_PaintedList,
  CmxV03_Heatmap,
  CmxV04_Geiger,
  CmxV05_Fusion,
});
