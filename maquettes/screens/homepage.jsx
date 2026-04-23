// Screen 1 — Homepage (desktop & mobile). Renders a DesignCanvas-agnostic
// standalone screen you can drop inside a DCArtboard.

function HomepageScreen({ width = 1440, mobile = false }) {
  const H = mobile ? {
    heroSize: 42, pad: 20, cardPad: 16, gap: 20, cols: 1,
  } : {
    heroSize: 96, pad: 52, cardPad: 26, gap: 28, cols: 2,
  };

  const games = [
    { key:'aram', name:'ARAM MISSIONS', emote:';-)', tag:'LOL', desc:'Missions secrètes à accomplir pendant vos parties.', color: AC.violet, icon:'ring' },
    { key:'codename', name:'CODENAME DU CEO', emote:':-P', tag:'WORDS', desc:'Jeu de mots en équipe. Inspiré de Codenames.', color: AC.hex, icon:'puzzle' },
    { key:'beat', name:'BEAT EIKICHI', emote:':-D', tag:'GUESS', desc:'Devine le jeu vidéo à partir d\u2019une image. 20 questions, 1 gagnant.', color: AC.shimmer, featured: true, icon:'image' },
    { key:'soon', name:'?????', emote:'O_o', tag:'SOON', desc:'Un nouveau mini-jeu arrive bientôt.', color: AC.bone2, disabled:true, icon:'dot' },
  ];

  return (
    <AcScreen style={{minHeight: mobile ? 1400 : 1800}}>
      {/* Background splats */}
      <div style={{position:'absolute', top: -60, left: -80, pointerEvents:'none'}}>
        <AcSplat color={AC.violet} size={mobile?320:520} opacity={0.6} seed={3}/>
      </div>
      <div style={{position:'absolute', top: 140, right: -40, pointerEvents:'none'}}>
        <AcSplat color={AC.shimmer} size={mobile?220:340} opacity={0.45} seed={1}/>
      </div>
      <div style={{position:'absolute', bottom: 200, left: -40, pointerEvents:'none'}}>
        <AcSpray color={AC.hex} size={mobile?200:300} seed={2}/>
      </div>
      <AcGraffitiLayer density="heavy" palette={[AC.shimmer, AC.hex, AC.chem, AC.violet, AC.gold]}/>

      <div style={{position:'relative', padding: H.pad, maxWidth: mobile ? '100%' : 1280, margin:'0 auto'}}>
        {/* Topbar */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: mobile?28:48}}>
          <div style={{display:'flex', alignItems:'center', gap:10}}>
            <AcGlyph kind="flame" color={AC.shimmer} size={22}/>
            <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize:11, letterSpacing:'0.25em', color: AC.bone2, textTransform:'uppercase'}}>// le.bureau/v0.3</span>
          </div>
          <div style={{display:'flex', gap:10, alignItems:'center'}}>
            <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize:10, letterSpacing:'0.2em', color: AC.chem}}>● ONLINE · 42 rooms</span>
          </div>
        </div>

        {/* Hero */}
        <div style={{position:'relative', marginBottom: mobile?36:68}}>
          <AcDisplay size={H.heroSize} style={{maxWidth: mobile?'100%':980}}>
            LE BUREAU DU<br/>
            <AcShim>[MARI DE POKI]</AcShim>
          </AcDisplay>
          <div style={{marginTop: 18, fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: mobile?13:15, letterSpacing:'0.1em', color: AC.bone2}}>
            // mini-jeux punk pour vos soirées entre amis — pas d&apos;inscription, pas de compte, juste un code et trois bières
          </div>
        </div>

        {/* Two-column action blocks */}
        <div style={{display:'grid', gridTemplateColumns: mobile?'1fr':'1.25fr 1fr', gap: H.gap, marginBottom: mobile?60:96}}>
          {/* CREATE */}
          <AcCard fold drip dripColor={AC.shimmer} style={{padding: H.cardPad}}>
            <div style={{display:'flex', alignItems:'baseline', gap: 12, marginBottom: 16}}>
              <AcSectionNum n={1}/>
              <h2 style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: mobile?22:30, margin:0, letterSpacing:'-0.01em', }}>CRÉER UNE ROOM</h2>
            </div>
            <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize:12, color: AC.bone2, marginBottom: 20}}>
              // tu deviens créateur — tu règles et tu lances
            </div>

            <label style={{display:'block', marginBottom: 20}}>
              <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize:10, letterSpacing:'0.25em', color: AC.chem, marginBottom: 6, textTransform:'uppercase'}}>&gt; TON NOM</div>
              <input readOnly value="Léa"
                style={{width:'100%', background:'transparent', border:'none', borderBottom:`2px solid ${AC.bone}`,
                  color: AC.shimmer, fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 16, padding: '6px 2px'}}/>
            </label>

            <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize:10, letterSpacing:'0.25em', color: AC.chem, marginBottom: 10, textTransform:'uppercase'}}>&gt; CHOISIS TON JEU</div>
            <div style={{display:'grid', gridTemplateColumns: mobile?'1fr 1fr':'1fr 1fr', gap: 10, marginBottom: 22}}>
              {games.map(g => {
                const selected = g.key === 'beat';
                return (
                  <div key={g.key} style={{
                    position:'relative', padding: 10,
                    background: selected ? 'rgba(255,61,139,0.12)' : 'rgba(240,228,193,0.03)',
                    border: selected ? `2px solid ${AC.shimmer}` : `1.5px dashed ${AC.bone2}`,
                    opacity: g.disabled ? 0.45 : 1,
                    clipPath: 'polygon(2% 6%, 12% 2%, 50% 4%, 88% 2%, 98% 8%, 98% 92%, 90% 98%, 50% 96%, 10% 98%, 2% 92%)',
                  }}>
                    <div style={{display:'flex', alignItems:'center', gap: 8}}>
                      <AcGlyph kind={g.icon} color={g.color} size={20}/>
                      <div style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 12, letterSpacing:'0.04em', }}>{g.name}</div>
                    </div>
                    <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize:10, color: AC.bone2, marginTop: 6, lineHeight:1.35}}>{g.desc}</div>
                    {selected && (
                      <div style={{position:'absolute', top:-8, right:8}}>
                        <AcStamp color={AC.shimmer} rotate={-4}>✓ SÉLECTIONNÉ</AcStamp>
                      </div>
                    )}
                    {g.disabled && (
                      <div style={{position:'absolute', top: 10, right: 8}}>
                        <AcStamp color={AC.bone2} rotate={6}>COMING SOON</AcStamp>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <AcButton variant="primary" size="lg" drip fullWidth icon={<AcGlyph kind="play" color={AC.ink} size={14}/>}>
              CRÉER LA ROOM
            </AcButton>
          </AcCard>

          {/* JOIN */}
          <div style={{position:'relative'}}>
            <AcCard fold={false} dashed style={{padding: H.cardPad}}>
              <div style={{display:'flex', alignItems:'baseline', gap: 12, marginBottom: 16}}>
                <AcSectionNum n={2}/>
                <h2 style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: mobile?22:30, margin:0, }}>REJOINDRE</h2>
              </div>
              <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize:12, color: AC.bone2, marginBottom: 20}}>
                // entre le code partagé par l&apos;hôte
              </div>

              <label style={{display:'block', marginBottom: 22}}>
                <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize:10, letterSpacing:'0.25em', color: AC.chem, marginBottom: 6, textTransform:'uppercase'}}>&gt; CODE DE LA ROOM</div>
                <div style={{
                  display:'flex', gap: 6, alignItems:'center',
                  padding: '10px 12px',
                  border:`1.5px dashed ${AC.bone2}`, background:'rgba(18,214,168,0.04)',
                }}>
                  {'7XK3PQ'.split('').map((c,i)=>(
                    <span key={i} style={{
                      fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 26, color: AC.chem,
                      fontWeight: 'bold', letterSpacing:'0.1em', width: 22, textAlign:'center',
                    }}>{c}</span>
                  ))}
                </div>
              </label>

              <label style={{display:'block', marginBottom: 26}}>
                <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize:10, letterSpacing:'0.25em', color: AC.chem, marginBottom: 6, textTransform:'uppercase'}}>&gt; TON NOM</div>
                <input readOnly value="Camille"
                  style={{width:'100%', background:'transparent', border:'none', borderBottom:`2px solid ${AC.bone}`,
                    color: AC.bone, fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 16, padding: '6px 2px'}}/>
              </label>

              <AcButton variant="hex" size="lg" fullWidth icon={<AcGlyph kind="arrowRight" color={AC.ink} size={14}/>}>
                REJOINDRE LA ROOM
              </AcButton>
            </AcCard>

            <div style={{position:'absolute', top: -14, right: 20, zIndex: 3}}>
              <AcStamp color={AC.gold} rotate={-6}>// 42 rooms live</AcStamp>
            </div>
          </div>
        </div>

        {/* HOW IT WORKS */}
        <div style={{marginBottom: mobile?48:80}}>
          <AcDottedLabel color={AC.bone2} style={{marginBottom: 30}}>// COMMENT ÇA MARCHE</AcDottedLabel>
          <div style={{display:'grid', gridTemplateColumns: mobile?'1fr':'1fr 1fr 1fr', gap: H.gap}}>
            {[
              { n:1, title:'CHOISIS TON JEU', desc:'Crée une room ou rejoins celle d\u2019un pote avec un code à 6 caractères.', color: AC.shimmer, icon: 'ring' },
              { n:2, title:'INVITE TES AMIS', desc:'Partage le code ou le lien. Jusqu\u2019à 12 joueurs par room.', color: AC.chem, icon:'link' },
              { n:3, title:'JOUEZ', desc:'Parties de 5 à 15 minutes. Pas d\u2019inscription. Pas de compte.', color: AC.gold, icon:'play' },
            ].map(s => (
              <div key={s.n} style={{position:'relative', padding: 18, border:`1.5px dashed ${AC.bone2}`}}>
                <div style={{display:'flex', alignItems:'center', gap: 14, marginBottom: 12}}>
                  <AcSectionNum n={s.n}/>
                  <AcGlyph kind={s.icon} color={s.color} size={24}/>
                </div>
                <div style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 18, letterSpacing:'0.03em', marginBottom: 6}}>{s.title}</div>
                <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 12, color: AC.bone2, lineHeight: 1.55}}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* GAMES AVAILABLE */}
        <div style={{marginBottom: mobile?30:60}}>
          <AcDottedLabel color={AC.bone2} style={{marginBottom: 30}}>// JEUX DISPONIBLES</AcDottedLabel>
          <div style={{display:'grid', gridTemplateColumns: mobile?'1fr':'repeat(4, 1fr)', gap: 16}}>
            {games.map(g => (
              <div key={g.key} style={{
                position:'relative', padding: 16,
                background: 'linear-gradient(135deg, rgba(26,22,15,0.9) 0%, rgba(13,11,8,0.9) 100%)',
                boxShadow: g.featured ? `inset 0 0 0 2px ${AC.shimmer}` : `inset 0 0 0 1px ${AC.bone2}`,
                opacity: g.disabled ? 0.5 : 1,
              }}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 12}}>
                  <AcGlyph kind={g.icon} color={g.color} size={26}/>
                  <AcEmote face={g.emote} color={g.color} size={26}/>
                </div>
                <div style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 16, letterSpacing:'0.02em', }}>{g.name}</div>
                <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, color: g.color, marginTop: 4, letterSpacing:'0.2em'}}>// {g.tag}</div>
                <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 11, color: AC.bone2, marginTop: 10, lineHeight: 1.5}}>{g.desc}</div>
                {g.featured && (
                  <div style={{position:'absolute', top:-10, left: 12}}>
                    <AcStamp color={AC.shimmer} bg={AC.ink} rotate={-3}>★ NOUVEAU</AcStamp>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop: 18, borderTop: `1.5px dashed ${AC.bone2}` , opacity: 0.7}}>
          <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, letterSpacing:'0.2em', color: AC.bone2}}>// v0.3 — EOF</span>
          <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, letterSpacing:'0.2em', color: AC.bone2}}>// fait à la main à zaun</span>
        </div>
      </div>
    </AcScreen>
  );
}

Object.assign(window, { HomepageScreen });
