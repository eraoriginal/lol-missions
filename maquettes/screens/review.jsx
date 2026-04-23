// Screen 4, 5, 6 — Review Intro, Review, Leaderboard

function ReviewIntroScreen({ mobile=false }) {
  return (
    <AcScreen style={{minHeight: mobile?700:800}}>
      {/* Pulsing background splats */}
      <div style={{position:'absolute', top: '10%', left: '8%', animation:'ac-pulse 2.4s infinite'}}>
        <AcSplat color={AC.violet} size={mobile?320:520} opacity={0.6} seed={2}/>
      </div>
      <div style={{position:'absolute', bottom: '8%', right: '10%', animation:'ac-pulse 2.4s infinite 0.8s'}}>
        <AcSplat color={AC.shimmer} size={mobile?260:420} opacity={0.55} seed={3}/>
      </div>
      <AcGraffitiLayer density="heavy" palette={[AC.shimmer, AC.hex, AC.chem, AC.violet, AC.gold]}/>

      {/* Floating emotes */}
      <div style={{position:'absolute', top: '20%', right: '15%'}}>
        <AcEmote face=":-D" color={AC.shimmer} size={60} style={{transform:'rotate(-8deg)'}}/>
      </div>
      <div style={{position:'absolute', bottom: '22%', left: '12%'}}>
        <AcEmote face=";-)" color={AC.chem} size={44} style={{transform:'rotate(6deg)'}}/>
      </div>
      <div style={{position:'absolute', top: '60%', right: '22%'}}>
        <AcEmote face=">:(" color={AC.gold} size={52} style={{transform:'rotate(-4deg)'}}/>
      </div>

      {/* Central content */}
      <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding: 30}}>
        <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 11, letterSpacing:'0.3em', color: AC.chem, marginBottom: 18}}>// PHASE 03 · REVIEW</div>
        <div style={{position:'relative'}}>
          <AcDisplay size={mobile?56:108} style={{textAlign:'center', lineHeight: 0.9}}>
            REGARDONS<br/>
            <AcShim color={AC.shimmer}>VOS RÉPONSES</AcShim>
          </AcDisplay>
          <div style={{position:'absolute', left: 0, right:0, bottom: -32, height: 32}}>
            <AcDrip color={AC.shimmer} seed={1}/>
          </div>
        </div>
        <div style={{marginTop: 60, display:'flex', alignItems:'center', gap: 16}}>
          <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 14, letterSpacing:'0.2em', color: AC.bone2}}>// question 01 / 20 dans</span>
          <span style={{
            fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 54,
            color: AC.gold, textShadow:`3px 3px 0 ${AC.ink}`, }}>3</span>
          <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 14, letterSpacing:'0.2em', color: AC.bone2}}>sec</span>
        </div>
      </div>
      <style>{`@keyframes ac-pulse { 0%,100% {opacity:1} 50% {opacity:0.55} }`}</style>
    </AcScreen>
  );
}

const REVIEW_ANSWERS = [
  { name:'Théo',    initials:'TH', color: AC.chem,    role:'EIKICHI', answer:'metroid prime',      correct:true,  time:3.8, emote:':-D' },
  { name:'Camille', initials:'CA', color: AC.hex,     answer:'Metroid Dread',      correct:false, time:null, emote:':-(' },
  { name:'Noa',     initials:'NO', color: AC.gold,    answer:'Metroid Prime',      correct:true,  time:7.1, emote:':-D' },
  { name:'Jules',   initials:'JU', color: AC.violet,  answer:'un truc de samus?',  correct:false, time:null, emote:':-(' },
  { name:'Sara',    initials:'SA', color: AC.rust,    answer:'metroid prime 2',    correct:false, time:null, emote:'>:(' },
  { name:'Léa',     initials:'LE', color: AC.shimmer, answer:'Metroid Prime',      correct:true,  time:22.4, emote:':-|' },
];

function ReviewScreen({ mobile=false, isCreator=true }) {
  const pad = mobile?16:32;
  return (
    <AcScreen style={{minHeight: mobile?1500:1100}}>
      <div style={{position:'relative', padding: pad, maxWidth: mobile?'100%':1240, margin:'0 auto'}}>
        {/* Header */}
        <div style={{display:'flex', justifyContent:'space-between', alignItems: mobile?'flex-start':'center', flexDirection: mobile?'column':'row', gap: 12, marginBottom: 16}}>
          <div>
            <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, letterSpacing:'0.3em', color: AC.chem}}>// PHASE · REVIEW</div>
            <div style={{display:'flex', alignItems:'baseline', gap: 14, marginTop: 6}}>
              <AcSectionNum n={7}/>
              <AcDisplay size={mobile?28:44}>QUESTION 07 / 20</AcDisplay>
            </div>
          </div>
          <div style={{display:'flex', alignItems:'center', gap: 12, flexWrap:'wrap'}}>
            <AcStamp color={AC.gold} rotate={-3}>// TEMPS MOYEN 11.3s</AcStamp>
            <AcStamp color={AC.chem} rotate={2}>// 3 TROUVÉ · 3 RATÉ</AcStamp>
          </div>
        </div>

        <AcDashed style={{marginBottom: 18}}/>

        {/* Image + reveal */}
        <div style={{position:'relative', marginBottom: 22}}>
          <AcImagePlaceholder label="METROID PRIME · screenshot original" ratio="16 / 10"/>
          {/* Reveal banner */}
          <div style={{
            position:'absolute', left: '50%', bottom: -24, transform:'translateX(-50%)',
            padding:'16px 28px', background: AC.ink, boxShadow:`inset 0 0 0 2px ${AC.shimmer}`,
            clipPath: AC_CLIP, minWidth: 'min(640px, 90%)',
          }}>
            <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, letterSpacing:'0.3em', color: AC.chem, textAlign:'center', marginBottom: 4}}>// NOM CANONIQUE</div>
            <AcDisplay size={mobile?28:44} style={{textAlign:'center'}}>
              <AcShim>METROID PRIME</AcShim>
            </AcDisplay>
            <div style={{position:'absolute', left: 20, right: 20, bottom: -22, height: 26}}>
              <AcDrip color={AC.shimmer} seed={2}/>
            </div>
          </div>
        </div>

        <div style={{height: 40}}/>

        {/* Answers grid */}
        <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 14}}>
          <AcSectionNum n={1}/>
          <h3 style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 18, margin:0, }}>RÉPONSES DES JOUEURS</h3>
        </div>

        <div style={{display:'grid', gridTemplateColumns: mobile?'1fr':'repeat(3, 1fr)', gap: 14}}>
          {REVIEW_ANSWERS.map((a,i) => {
            const slow = a.time && a.time > 20;
            return (
              <div key={i} style={{
                position:'relative', padding: 14,
                background: 'linear-gradient(135deg, rgba(26,22,15,0.9), rgba(13,11,8,0.9))',
                boxShadow: `inset 0 0 0 1.5px ${a.correct ? AC.chem : AC.rust}`,
              }}>
                <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 10}}>
                  <AcAvatar name={a.name} color={a.color} size={34} halo={a.role==='EIKICHI'?AC.shimmer:null}/>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 14, }}>{a.name.toUpperCase()}</div>
                    {a.role && (
                      <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 9, color: AC.shimmer, letterSpacing:'0.2em'}}>// EIKICHI</span>
                    )}
                  </div>
                  <AcEmote face={a.emote} color={a.correct?AC.chem:(slow?AC.gold:AC.rust)} size={26}/>
                </div>
                {/* Graffiti bubble */}
                <div style={{
                  position:'relative', padding: '10px 12px',
                  background: 'rgba(240,228,193,0.04)',
                  border:`1.5px dashed ${AC.bone2}`,
                  fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 13, color: AC.bone,
                  marginBottom: 10,
                }}>
                  <span style={{color: AC.bone2}}>«</span> {a.answer || <span style={{color: AC.bone2, fontStyle:'italic'}}>(rien)</span>} <span style={{color: AC.bone2}}>»</span>
                </div>
                {a.correct ? (
                  <div style={{display:'flex', alignItems:'center', gap: 8}}>
                    <span style={{background: AC.chem, color: AC.ink, fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, letterSpacing:'0.2em', padding:'3px 8px'}}>✓ TROUVÉ</span>
                    <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 11, color: AC.chem}}>en {a.time}s</span>
                    {slow && <AcStamp color={AC.gold} rotate={-4}>// lent</AcStamp>}
                  </div>
                ) : (
                  <div style={{display:'flex', alignItems:'center', gap: 8}}>
                    <span style={{background: AC.rust, color: AC.bone, fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 10, letterSpacing:'0.2em', padding:'3px 8px'}}>✗ RATÉ</span>
                    <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 11, color: AC.rust}}>// timeout</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Controls */}
        <div style={{marginTop: 30, display:'flex', justifyContent:'space-between', alignItems:'center', gap: 16, flexWrap:'wrap'}}>
          <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 11, letterSpacing:'0.2em', color: AC.bone2}}>// navigation manuelle · créateur uniquement</div>
          {isCreator ? (
            <div style={{display:'flex', gap: 10}}>
              <AcButton variant="hex" icon={<AcGlyph kind="arrowLeft" color={AC.ink} size={14}/>}>QUESTION PRÉCÉDENTE</AcButton>
              <AcButton variant="primary" drip icon={<AcGlyph kind="arrowRight" color={AC.ink} size={14}/>}>QUESTION SUIVANTE</AcButton>
            </div>
          ) : (
            <AcStamp color={AC.bone2} rotate={-2} style={{fontSize:12, padding:'10px 14px'}}>// EN ATTENTE DU CRÉATEUR…</AcStamp>
          )}
        </div>
      </div>
    </AcScreen>
  );
}

const LEADERBOARD = [
  { rank:1, name:'Théo',    initials:'TH', color: AC.chem,    score: 127, emote:':-D', right:14, wrong:6,  fast:true },
  { rank:2, name:'Noa',     initials:'NO', color: AC.gold,    score: 104, emote:':-)', right:11, wrong:9 },
  { rank:3, name:'Camille', initials:'CA', color: AC.hex,     score:  88, emote:':-|', right:9,  wrong:11 },
  { rank:4, name:'Léa',     initials:'LE', color: AC.shimmer, score:  72, emote:':-|', right:7,  wrong:13 },
  { rank:5, name:'Jules',   initials:'JU', color: AC.violet,  score:  54, emote:':-(', right:5,  wrong:15 },
  { rank:6, name:'Sara',    initials:'SA', color: AC.rust,    score:  38, emote:'>:(', right:4,  wrong:16, hottest:true },
];

function PodiumStep({ place, player, h, color }) {
  const clips = {
    1: 'polygon(4% 8%, 50% 2%, 96% 6%, 98% 94%, 90% 100%, 10% 100%, 2% 96%)',
    2: 'polygon(6% 12%, 48% 4%, 94% 14%, 96% 92%, 88% 100%, 12% 100%, 4% 94%)',
    3: 'polygon(8% 16%, 50% 8%, 92% 20%, 94% 90%, 86% 100%, 14% 100%, 6% 92%)',
  };
  return (
    <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap: 10, flex:1}}>
      <AcEmote face={player.emote} color={color} size={48}/>
      <div style={{
        position:'relative', padding: 14, width: '100%',
        background: 'rgba(13,11,8,0.7)',
        boxShadow:`inset 0 0 0 2px ${color}`,
      }}>
        <AcAvatar name={player.name} color={color} size={54}/>
        <div style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 18, marginTop: 8, letterSpacing:'0.02em'}}>{player.name.toUpperCase()}</div>
        <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 11, color: AC.bone2}}>// {player.right}/{player.right+player.wrong} trouvé</div>
      </div>
      <div style={{
        width:'100%', height: h,
        background: color,
        clipPath: clips[place],
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        color: AC.ink,
        position:'relative',
      }}>
        <div style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 64, lineHeight: 1, }}>#{place}</div>
        <div style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 26, marginTop: 4}}>{player.score}<span style={{fontSize: 14, marginLeft: 4}}>pts</span></div>
      </div>
    </div>
  );
}

function LeaderboardScreen({ mobile=false }) {
  const pad = mobile?18:36;
  const top3 = LEADERBOARD.slice(0,3);
  const rest = LEADERBOARD.slice(3);
  // 1st tallest
  const heights = mobile ? [180, 140, 110] : [240, 180, 140];
  const medals = [AC.gold, AC.bone2, AC.rust];
  return (
    <AcScreen style={{minHeight: mobile?1500:1100}}>
      <div style={{position:'absolute', top: -40, left: -40}}><AcSplat color={AC.shimmer} size={mobile?260:440} opacity={0.5} seed={1}/></div>
      <div style={{position:'absolute', bottom: 40, right: -60}}><AcSplat color={AC.violet} size={mobile?220:360} opacity={0.5} seed={3}/></div>
      <AcGraffitiLayer density="heavy" palette={[AC.shimmer, AC.hex, AC.chem, AC.violet, AC.gold]}/>

      <div style={{position:'relative', padding: pad, maxWidth: mobile?'100%':1240, margin:'0 auto'}}>
        {/* Hero */}
        <div style={{textAlign:'center', marginBottom: 36, position:'relative'}}>
          <div style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 11, letterSpacing:'0.3em', color: AC.chem, marginBottom: 10}}>// PHASE 04 · FINAL</div>
          <div style={{position:'relative', display:'inline-block'}}>
            <AcDisplay size={mobile?54:96} style={{textAlign:'center'}}>
              FIN DE <AcShim>LA PARTIE</AcShim>
            </AcDisplay>
            <div style={{position:'absolute', left: 40, right: 40, bottom: -26, height: 28}}>
              <AcDrip color={AC.shimmer} seed={2}/>
            </div>
          </div>
        </div>

        {/* Podium + stats */}
        <div style={{display:'grid', gridTemplateColumns: mobile?'1fr':'2fr 1fr', gap: 30, alignItems:'flex-start', marginBottom: 44}}>
          {/* Podium */}
          <div style={{display:'flex', alignItems:'flex-end', gap: 14, justifyContent:'center', padding: '20px 0'}}>
            <PodiumStep place={2} player={top3[1]} h={heights[1]} color={medals[1]}/>
            <PodiumStep place={1} player={top3[0]} h={heights[0]} color={medals[0]}/>
            <PodiumStep place={3} player={top3[2]} h={heights[2]} color={medals[2]}/>
          </div>

          {/* Stats */}
          <div>
            <div style={{display:'flex', alignItems:'center', gap: 10, marginBottom: 12}}>
              <AcSectionNum n="s"/>
              <h3 style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 16, margin:0, }}>STATS GLOBALES</h3>
            </div>
            <AcCard fold={false} dashed style={{padding: 16}}>
              <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1.5px dashed ${AC.bone2}`}}>
                <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 11, color: AC.bone2}}>// TAUX BONNES RÉPONSES</span>
                <span style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 16, color: AC.chem, }}>52%</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:`1.5px dashed ${AC.bone2}`}}>
                <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 11, color: AC.bone2}}>// TEMPS MOYEN</span>
                <span style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 16, color: AC.gold, }}>11.3s</span>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:`1.5px dashed ${AC.bone2}`}}>
                <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 11, color: AC.bone2}}>// LE PLUS RAPIDE</span>
                <AcStamp color={AC.chem} rotate={-4}>THÉO · 2.1s</AcStamp>
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0'}}>
                <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 11, color: AC.bone2}}>// LE PLUS &quot;CHAUD&quot;</span>
                <AcStamp color={AC.rust} rotate={3}>SARA · 9× 🔥</AcStamp>
              </div>
            </AcCard>
          </div>
        </div>

        {/* Rest of ranking */}
        <div style={{marginBottom: 32}}>
          <AcDottedLabel color={AC.bone2} style={{marginBottom: 14}}>// RESTE DU CLASSEMENT</AcDottedLabel>
          <div style={{display:'flex', flexDirection:'column'}}>
            {rest.map(p => (
              <div key={p.rank} style={{
                display:'flex', alignItems:'center', gap: 14,
                padding:'10px 14px',
                borderBottom:`1.5px dashed ${AC.bone2}`,
              }}>
                <span style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 22, color: AC.bone2, minWidth: 46}}>#{p.rank}</span>
                <AcAvatar name={p.name} color={p.color} size={30}/>
                <span style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 14, flex:1, letterSpacing:'0.02em'}}>{p.name.toUpperCase()}</span>
                <span style={{fontFamily:"'JetBrains Mono', 'Courier New', monospace", fontSize: 11, color: AC.bone2}}>// {p.right}/{p.right+p.wrong}</span>
                <span style={{fontFamily:"'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif", fontSize: 18, color: AC.gold, }}>{p.score}<span style={{fontSize: 10, marginLeft: 4, color: AC.bone2}}>pts</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* CTAs */}
        <div style={{display:'flex', gap: 14, flexWrap:'wrap', justifyContent:'center', paddingTop: 14}}>
          <AcButton variant="primary" size="lg" drip icon={<AcGlyph kind="play" color={AC.ink} size={14}/>}>REJOUER UNE PARTIE</AcButton>
          <AcButton variant="hex" size="lg" icon={<AcGlyph kind="arrowLeft" color={AC.ink} size={14}/>}>RETOUR AU LOBBY</AcButton>
          <AcButton variant="danger" size="sm">QUITTER LA ROOM</AcButton>
        </div>
      </div>
    </AcScreen>
  );
}

Object.assign(window, { ReviewIntroScreen, ReviewScreen, LeaderboardScreen });
