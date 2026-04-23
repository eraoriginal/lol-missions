// Screen 2 — Beat Eikichi Lobby
// Plus a WeaponModal variant shown on top.

const WEAPONS = [
  { key:'smoke',   name:'FUMIGÈNE',     glyph:'smoke',   color: AC.bone2,   desc:'Nappe l\u2019image d\u2019une fumée épaisse pendant 6s.' },
  { key:'c4',      name:'C4',           glyph:'bomb',    color: AC.rust,    desc:'Explose l\u2019image — flash + tremblement 2s.' },
  { key:'saber',   name:'SABRE',        glyph:'saber',   color: AC.shimmer, desc:'Entaille l\u2019image en deux. Rouge qui coule.' },
  { key:'freeze',  name:'GEL',          glyph:'ice',     color: AC.hex,     desc:'Gèle l\u2019image. Cristaux + teinte cyan.' },
  { key:'zoom',    name:'ZOOM PARASITE',glyph:'zoom',    color: AC.violet,  desc:'Zoom aléatoire, cadre qui tremble.' },
  { key:'tornado', name:'TORNADE',      glyph:'tornado', color: AC.gold,    desc:'Fait tourner l\u2019image en continu.' },
  { key:'puzzle',  name:'PUZZLE BREAK', glyph:'puzzle',  color: AC.chem,    desc:'Découpe l\u2019image en 12 cases mélangées.' },
  { key:'speed',   name:'SPEED',        glyph:'speed',   color: AC.shimmer, desc:'Accélère le timer de 5s — respire vite.' },
];

const LOBBY_PLAYERS = [
  { name:'Léa',     initials:'LE', color: AC.shimmer, role:'CRÉATEUR', weapon: WEAPONS[0], score: 0 },
  { name:'Théo',    initials:'TH', color: AC.chem,    role:'EIKICHI',  weapon: WEAPONS[3], score: 0 },
  { name:'Camille', initials:'CA', color: AC.hex,     weapon: WEAPONS[1], score: 0 },
  { name:'Noa',     initials:'NO', color: AC.gold,    weapon: WEAPONS[6], score: 0 },
  { name:'Jules',   initials:'JU', color: AC.violet,  weapon: null, score: 0 },
  { name:'Sara',    initials:'SA', color: AC.rust,    weapon: WEAPONS[2], score: 0 },
];

function RoomCode({ code = '7XK3PQ', large = true }) {
  return (
    <div style={{display:'flex', gap: 4, alignItems:'center'}}>
      {code.split('').map((c,i)=>(
        <span key={i} style={{
          fontFamily:"'JetBrains Mono', 'Courier New', monospace",
          fontSize: large ? 44 : 26,
          color: AC.gold, fontWeight: 'bold', letterSpacing: '0.05em',
          border: `2px dashed ${AC.bone2}`,
          padding: large ? '4px 10px' : '2px 6px',
          background: 'rgba(245,185,18,0.05)',
        }}>{c}</span>
      ))}
    </div>
  );
}

function PlayerRow({ p, showEikichiHalo }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', gap: 14,
      padding: '10px 12px',
      borderBottom:`1.5px dashed ${AC.bone2}`,
      position:'relative',
    }}>
      <AcAvatar name={p.name} color={p.color} size={40} halo={showEikichiHalo && p.role==='EIKICHI' ? AC.shimmer : null}/>
      <div style={{flex:1, minWidth:0}}>
        <div style={{display:'flex', alignItems:'center', gap: 8, flexWrap:'wrap'}}>
          <span style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 15, letterSpacing:'0.02em', display:'inline-block'}}>{p.name.toUpperCase()}</span>
          {p.role === 'CRÉATEUR' && (
            <span style={{background: AC.gold, color: AC.ink, fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 9, letterSpacing:'0.2em', padding:'2px 6px'}}>CRÉATEUR</span>
          )}
          {p.role === 'EIKICHI' && (
            <span style={{position:'relative', display:'inline-block'}}>
              <span style={{background: AC.shimmer, color: AC.ink, fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 9, letterSpacing:'0.2em', padding:'2px 6px'}}>EIKICHI</span>
              <span style={{position:'absolute', left:0, right:0, bottom:-10, height: 10, pointerEvents:'none'}}>
                <AcDrip color={AC.shimmer} height={10} seed={3}/>
              </span>
            </span>
          )}
        </div>
        <div style={{display:'flex', alignItems:'center', gap:6, marginTop: 6}}>
          {p.weapon ? (
            <>
              <AcGlyph kind={p.weapon.glyph} color={p.weapon.color} size={14} stroke={2}/>
              <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, letterSpacing:'0.15em', color: AC.bone2}}>// {p.weapon.name}</span>
            </>
          ) : (
            <AcStamp color={AC.rust} rotate={-4}>// AUCUNE ARME</AcStamp>
          )}
        </div>
      </div>
      {p.role === 'EIKICHI' && (
        <div style={{position:'absolute', top: -10, right: 18}}>
          <AcEmote face=">:(" color={AC.shimmer} size={28}/>
        </div>
      )}
    </div>
  );
}

function LobbyScreen({ mobile = false, showModal = false, isCreator = true }) {
  const pad = mobile ? 18 : 36;
  const currentWeapon = WEAPONS[0]; // Fumigène
  return (
    <AcScreen style={{minHeight: mobile ? 1500 : 1100}}>
      {/* Decorative splats */}
      <div style={{position:'absolute', top: -40, right: -80, pointerEvents:'none'}}>
        <AcSplat color={AC.shimmer} size={mobile?260:420} opacity={0.5} seed={2}/>
      </div>
      <div style={{position:'absolute', bottom: 60, left: -60, pointerEvents:'none'}}>
        <AcSplat color={AC.violet} size={mobile?200:340} opacity={0.45} seed={4}/>
      </div>
      <AcGraffitiLayer palette={[AC.shimmer, AC.hex, AC.chem, AC.violet, AC.gold]}/>

      <div style={{position:'relative', padding: pad, maxWidth: mobile?'100%':1200, margin:'0 auto'}}>
        {/* Top bar */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems: mobile?'flex-start':'center', flexDirection: mobile?'column':'row', gap: 14, marginBottom: 22}}>
          <div style={{display:'flex', alignItems:'center', gap: 14, flexWrap:'wrap'}}>
            <AcButton variant="danger" size="sm" icon={<AcGlyph kind="arrowLeft" color={AC.bone} size={12}/>}>QUITTER</AcButton>
            <AcDottedLabel color={AC.bone2} style={{minWidth: mobile?200:260}}>// ROOM ACTIVE</AcDottedLabel>
          </div>
          <div style={{display:'flex', alignItems:'center', gap: 14, flexWrap:'wrap'}}>
            <div style={{display:'flex', alignItems:'center', gap: 8}}>
              <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 11, color: AC.bone2, letterSpacing:'0.2em'}}>CODE:</span>
              <RoomCode code="7XK3PQ" large={!mobile}/>
            </div>
            <div style={{display:'flex', gap: 6}}>
              <button style={{background:'transparent', border:`1.5px solid ${AC.bone2}`, color: AC.bone2, padding:'8px', cursor:'pointer'}}>
                <AcGlyph kind="copy" color={AC.bone2} size={18}/>
              </button>
              <button style={{background:'transparent', border:`1.5px solid ${AC.bone2}`, color: AC.bone2, padding:'8px', cursor:'pointer'}}>
                <AcGlyph kind="link" color={AC.bone2} size={18}/>
              </button>
            </div>
          </div>
        </div>

        {/* Hero title */}
        <div style={{marginBottom: 28}}>
          <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, letterSpacing:'0.3em', color: AC.chem, marginBottom: 6}}>// GAME: BEAT EIKICHI · LOBBY</div>
          <AcDisplay size={mobile?40:60}>
            SALLE <AcShim>D&apos;ATTENTE</AcShim>
          </AcDisplay>
        </div>

        {/* Main grid */}
        <div style={{display:'grid', gridTemplateColumns: mobile?'1fr':'1.15fr 1fr', gap: 26}}>
          {/* Players column */}
          <div>
            <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 12}}>
              <AcSectionNum n={1}/>
              <h3 style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 18, margin:0, letterSpacing:'0.04em'}}>JOUEURS · {LOBBY_PLAYERS.length}/12</h3>
            </div>
            <AcCard fold={false} style={{padding: 0}}>
              {LOBBY_PLAYERS.map((p,i) => (
                <PlayerRow key={i} p={p} showEikichiHalo/>
              ))}
            </AcCard>

            {/* My weapon */}
            <div style={{marginTop: 26}}>
              <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 12}}>
                <AcSectionNum n={2}/>
                <h3 style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 18, margin:0, }}>MON ARME</h3>
              </div>
              <AcCard fold drip dripColor={AC.shimmer} style={{padding: 18}}>
                <div style={{display:'flex', gap: 16, alignItems:'center'}}>
                  <div style={{
                    width: 72, height: 72, background: 'rgba(255,61,139,0.15)',
                    border: `2px solid ${AC.shimmer}`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    clipPath: AC_CLIP,
                  }}>
                    <AcGlyph kind={currentWeapon.glyph} color={AC.shimmer} size={36} stroke={3}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 22, letterSpacing:'0.02em'}}>{currentWeapon.name}</div>
                    <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 11, color: AC.bone2, marginTop: 4, lineHeight: 1.5}}>{currentWeapon.desc}</div>
                    <div style={{display:'flex', gap: 10, alignItems:'center', marginTop: 8}}>
                      <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, letterSpacing:'0.2em', color: AC.chem}}>// 2 UTILISATIONS · 1 BOUCLIER</span>
                    </div>
                  </div>
                </div>
                <div style={{marginTop: 16, display:'flex', gap: 10}}>
                  <AcButton variant="ghost" size="sm" icon={<AcGlyph kind="ring" color={AC.bone} size={12}/>}>CHANGER D&apos;ARME</AcButton>
                </div>
              </AcCard>
            </div>
          </div>

          {/* Settings column */}
          <div>
            <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 12}}>
              <AcSectionNum n={3}/>
              <h3 style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 18, margin:0, }}>RÉGLAGES {!isCreator && <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize:10, color:AC.bone2, marginLeft:8}}>// lecture seule</span>}</h3>
            </div>
            <AcCard fold={false} dashed style={{padding: 20}}>
              {/* Timer */}
              <div style={{marginBottom: 22}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom: 8}}>
                  <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, letterSpacing:'0.25em', color: AC.chem}}>&gt; DURÉE / QUESTION</span>
                  <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 22, color: AC.gold, fontWeight:'bold'}}>30<span style={{fontSize: 12, color: AC.bone2, marginLeft: 4}}>sec</span></span>
                </div>
                <AcPaintedBar value={0.08} color={AC.chem}/>
                <div style={{display:'flex', justifyContent:'space-between', fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 9, letterSpacing:'0.2em', color: AC.bone2, marginTop: 6}}>
                  <span>10s</span><span>300s</span>
                </div>
              </div>

              <AcDashed style={{margin:'0 0 22px'}}/>

              {/* Mode */}
              <div style={{marginBottom: 22}}>
                <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, letterSpacing:'0.25em', color: AC.chem, marginBottom: 10}}>&gt; MODE VISUEL</div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 10}}>
                  {[
                    { key:'standard', label:'STANDARD', desc:'image nette', active:true, icon:'image' },
                    { key:'blur', label:'BLUR', desc:'floutée, se défloute', active:false, icon:'blur' },
                  ].map(m => (
                    <div key={m.key} style={{
                      padding: 12, textAlign:'center',
                      background: m.active ? 'rgba(255,61,139,0.15)' : 'rgba(240,228,193,0.03)',
                      border: m.active ? `2px solid ${AC.shimmer}` : `1.5px dashed ${AC.bone2}`,
                      clipPath: AC_CLIP,
                    }}>
                      <div style={{display:'flex', justifyContent:'center', marginBottom: 6}}>
                        <AcGlyph kind={m.icon} color={m.active ? AC.shimmer : AC.bone2} size={24}/>
                      </div>
                      <div style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 13, }}>{m.label}</div>
                      <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 9, color: AC.bone2, marginTop: 4}}>// {m.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <AcDashed style={{margin:'0 0 22px'}}/>

              {/* Hints */}
              <div style={{marginBottom: 22, display:'flex', alignItems:'center', justifyContent:'space-between', gap: 12}}>
                <div>
                  <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, letterSpacing:'0.25em', color: AC.chem, marginBottom: 4}}>&gt; INDICES</div>
                  <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 11, color: AC.bone2}}>// 3 indices révélés pendant le timer</div>
                </div>
                {/* Painted switch */}
                <div style={{position:'relative', width: 68, height: 32, background: AC.chem, boxShadow:`inset 0 0 0 2px ${AC.ink}`, cursor:'pointer'}}>
                  <div style={{position:'absolute', top: 2, left: 38, width: 26, height: 26, background: AC.ink, border:`2px solid ${AC.bone}`}}/>
                  <span style={{position:'absolute', left: 8, top: 8, fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 10, color: AC.ink, letterSpacing:'0.1em'}}>ON</span>
                </div>
              </div>

              <AcDashed style={{margin:'0 0 22px'}}/>

              {/* Eikichi */}
              <div style={{marginBottom: 8}}>
                <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, letterSpacing:'0.25em', color: AC.chem, marginBottom: 10}}>&gt; EIKICHI (rôle spécial)</div>
                <div style={{
                  display:'flex', alignItems:'center', gap: 12, padding:'10px 12px',
                  border:`1.5px solid ${AC.shimmer}`, background:'rgba(255,61,139,0.08)',
                }}>
                  <AcAvatar name="Théo" color={AC.chem} size={34} halo={AC.shimmer}/>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 14, }}>THÉO</div>
                    <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, color: AC.bone2}}>// coupe la question s&apos;il trouve avant les autres</div>
                  </div>
                  <AcGlyph kind="arrowRight" color={AC.bone2} size={16} stroke={2}/>
                </div>
                <div style={{marginTop: 8, fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, color: AC.bone2}}>// clique pour changer · option "aucun" disponible</div>
              </div>
            </AcCard>

            {/* Launch CTA */}
            <div style={{marginTop: 30}}>
              {isCreator ? (
                <AcButton variant="primary" size="lg" drip fullWidth icon={<AcGlyph kind="play" color={AC.ink} size={16}/>}>
                  LANCER LA PARTIE · 20 QUESTIONS
                </AcButton>
              ) : (
                <div style={{textAlign:'center'}}>
                  <AcStamp color={AC.bone2} rotate={-2} style={{fontSize: 12, padding:'10px 14px'}}>// EN ATTENTE DU CRÉATEUR <span className="ac-dots">...</span></AcStamp>
                </div>
              )}
            </div>

            {/* Not enough players warning (example, showing the component) */}
            <div style={{marginTop: 22}}>
              <AcAlert tone="warning" tape="// WARN">
                <span style={{color: AC.bone}}>// il faut au moins 2 joueurs pour lancer — ici on en a 6, tout va bien</span>
              </AcAlert>
            </div>
          </div>
        </div>
      </div>

      {/* Weapon modal */}
      {showModal && <WeaponModal/>}
    </AcScreen>
  );
}

function WeaponModal() {
  return (
    <>
      <div style={{position:'absolute', inset:0, background:'rgba(13,11,8,0.82)', zIndex: 10}}/>
      <div style={{
        position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)',
        width:'min(820px, 92%)', zIndex: 11,
      }}>
        <AcCard fold style={{padding: 24, background:'linear-gradient(135deg,#1F1A13,#0D0B08)'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 16}}>
            <div>
              <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, letterSpacing:'0.3em', color: AC.chem}}>// ARMORY · 8 armes disponibles</div>
              <AcDisplay size={36} style={{marginTop: 8}}>CHOISIS <AcShim>TON ARME</AcShim></AcDisplay>
            </div>
            <button style={{background:'transparent', border:`1.5px solid ${AC.bone2}`, padding: 8, cursor:'pointer'}}>
              <AcGlyph kind="x" color={AC.bone} size={16}/>
            </button>
          </div>

          <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 12, color: AC.bone2, marginBottom: 18, lineHeight: 1.55}}>
            // 1 utilisation sauf indication. L&apos;effet s&apos;applique à la cible sur la prochaine question.
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap: 12}}>
            {WEAPONS.map((w,i) => {
              const selected = i === 0;
              return (
                <div key={w.key} style={{
                  padding: 14, cursor:'pointer', position:'relative',
                  background: selected ? 'rgba(255,61,139,0.15)' : 'rgba(240,228,193,0.03)',
                  border: selected ? `2px solid ${AC.shimmer}` : `1.5px dashed ${AC.bone2}`,
                  clipPath: AC_CLIP,
                }}>
                  <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 6}}>
                    <AcGlyph kind={w.glyph} color={w.color} size={26} stroke={2.5}/>
                    <div style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 13, letterSpacing:'0.02em'}}>{w.name}</div>
                  </div>
                  <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, color: AC.bone2, lineHeight: 1.5}}>{w.desc}</div>
                  {selected && (
                    <div style={{position:'absolute', top:-10, right: 6}}>
                      <AcStamp color={AC.shimmer} bg={AC.ink} rotate={-4}>✓ ÉQUIPÉ</AcStamp>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{marginTop: 20, display:'flex', justifyContent:'space-between', alignItems:'center', gap: 12}}>
            <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, color: AC.bone2}}>// change d&apos;avis jusqu&apos;au lancement</span>
            <AcButton variant="primary" drip icon={<AcGlyph kind="check" color={AC.ink} size={12}/>}>VALIDER MON CHOIX</AcButton>
          </div>
        </AcCard>
      </div>
    </>
  );
}

Object.assign(window, { LobbyScreen, WeaponModal, WEAPONS, LOBBY_PLAYERS });
