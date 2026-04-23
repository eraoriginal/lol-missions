// Modals + notifications screens — all rendered over a dimmed background of
// either the lobby or the playing screen, so context is clear.

// ─────────────────────────────────────────────────────────────
// Shared: torn-clip modal card
// ─────────────────────────────────────────────────────────────
const MODAL_CLIP = 'polygon(2% 6%, 8% 1%, 25% 4%, 50% 1%, 76% 4%, 94% 2%, 99% 12%, 97% 45%, 99% 78%, 96% 98%, 75% 96%, 50% 99%, 28% 96%, 8% 99%, 1% 82%, 3% 40%)';

function ModalDim({ children, intensity = 0.72 }) {
  return (
    <div style={{
      position:'absolute', inset:0,
      background: `rgba(13,11,8,${intensity})`,
      backdropFilter: 'blur(6px) saturate(0.9)',
      WebkitBackdropFilter: 'blur(6px) saturate(0.9)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding: 30,
    }}>
      {children}
    </div>
  );
}

function ModalCard({ children, width = 520, tone = AC.shimmer, tapeLabel, style = {} }) {
  return (
    <div style={{
      position:'relative', width, maxWidth:'100%',
      background: 'linear-gradient(180deg, #1A160F 0%, #0D0B08 100%)',
      color: AC.bone,
      clipPath: MODAL_CLIP,
      padding: '36px 34px 34px',
      boxShadow: `inset 0 0 0 2px ${AC.bone}`,
      ...style,
    }}>
      {/* accent paint bar */}
      <div style={{position:'absolute', top: 0, left: 20, right: 20, height: 10, pointerEvents:'none'}}>
        <AcDrip color={tone} height={10} seed={2}/>
      </div>
      {tapeLabel && (
        <span style={{
          position:'absolute', top: 14, right: 22,
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 10, letterSpacing:'0.22em',
          color: AC.bone2, border:`1.5px dashed ${AC.bone2}`,
          padding:'3px 8px', transform:'rotate(-3deg)', textTransform:'uppercase',
        }}>{tapeLabel}</span>
      )}
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Miniature "frozen" backdrop — schematic of lobby / playing so the
// screenshot shows the modal's parent context without redrawing the full screen.
// ─────────────────────────────────────────────────────────────
function LobbyBackdropSketch() {
  return (
    <div style={{position:'absolute', inset:0, padding: 30, overflow:'hidden'}}>
      {/* bg */}
      <div style={{position:'absolute', inset:0, background:'radial-gradient(ellipse at 20% 10%, #3A2D4A 0%, #2A1E3A 40%, #1F1830 80%)'}}/>
      <div style={{position:'absolute', inset:0,
        backgroundImage:'repeating-linear-gradient(45deg, transparent 0 3px, rgba(240,228,193,0.025) 3px 4px)'}}/>
      <div style={{position:'absolute', top: -60, right: -40, pointerEvents:'none'}}>
        <AcSplat color={AC.shimmer} size={360} opacity={0.25} seed={1}/>
      </div>
      <div style={{position:'absolute', bottom: -60, left: -40, pointerEvents:'none'}}>
        <AcSplat color={AC.violet} size={340} opacity={0.22} seed={2}/>
      </div>
      {/* top bar */}
      <div style={{display:'flex', alignItems:'center', gap: 14, marginBottom: 28}}>
        <div style={{height: 28, width: 82, background: AC.rust, clipPath: AC_CLIP}}/>
        <div style={{flex:1, height: 10, borderTop:`1.5px dashed ${AC.bone2}`, opacity:0.4}}/>
        <div style={{display:'flex', gap:4}}>
          {'GW8BRK'.split('').map((c,i)=>(
            <span key={i} style={{
              fontFamily:"'JetBrains Mono', monospace", fontSize: 16, fontWeight:700,
              color: AC.gold, border:`1.5px dashed ${AC.bone2}`, padding:'1px 5px',
            }}>{c}</span>
          ))}
        </div>
      </div>
      {/* title */}
      <div style={{marginBottom: 28, opacity:0.9}}>
        <AcGraffitiText size={56} color={AC.bone} shadow={AC.ink}>SALLE D'ATTENTE</AcGraffitiText>
      </div>
      {/* two columns */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap: 18}}>
        <div>
          <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 10, letterSpacing:'0.2em', color: AC.chem, marginBottom: 8}}>// JOUEURS · 2/12</div>
          <div style={{height: 88, background:'rgba(26,22,15,0.6)', border:`1.5px dashed ${AC.bone2}`, marginBottom: 14}}/>
          <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 10, letterSpacing:'0.2em', color: AC.chem, marginBottom: 8}}>// MON ARME</div>
          <div style={{height: 140, background:'rgba(26,22,15,0.6)', border:`1.5px dashed ${AC.bone2}`}}/>
        </div>
        <div>
          <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 10, letterSpacing:'0.2em', color: AC.chem, marginBottom: 8}}>// RÉGLAGES</div>
          <div style={{height: 260, background:'rgba(26,22,15,0.6)', border:`1.5px dashed ${AC.bone2}`}}/>
        </div>
      </div>
    </div>
  );
}

function PlayingBackdropSketch() {
  return (
    <div style={{position:'absolute', inset:0, padding: 30, overflow:'hidden'}}>
      <div style={{position:'absolute', inset:0, background:'radial-gradient(ellipse at 20% 10%, #3A2D4A 0%, #2A1E3A 40%, #1F1830 80%)'}}/>
      <div style={{position:'absolute', inset:0,
        backgroundImage:'repeating-linear-gradient(45deg, transparent 0 3px, rgba(240,228,193,0.025) 3px 4px)'}}/>
      <div style={{position:'absolute', top: -40, right: -30, pointerEvents:'none'}}>
        <AcSplat color={AC.chem} size={280} opacity={0.18} seed={3}/>
      </div>
      {/* top bar */}
      <div style={{display:'flex', alignItems:'center', gap: 18, marginBottom: 24}}>
        <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, letterSpacing:'0.2em', color: AC.chem, border:`1px solid ${AC.chem}`, padding:'3px 7px'}}>02</span>
        <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, letterSpacing:'0.2em', color: AC.bone2}}>QUESTION 02 / 20</span>
        <div style={{flex:1}}/>
        <AcGraffitiText size={34} color={AC.gold}>30s</AcGraffitiText>
        <div style={{flex:0.6, height: 10, background: AC.chem, opacity:0.7}}/>
        <div style={{height: 28, width: 72, background: AC.rust, clipPath: AC_CLIP}}/>
      </div>
      {/* 3 arme/bouclier/joueurs blocks */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap: 16, marginBottom: 20}}>
        {[AC.shimmer, AC.hex, AC.gold].map((c,i)=>(
          <div key={i} style={{height: 76, border:`1.5px dashed ${c}`, background:`${c}15`}}/>
        ))}
      </div>
      {/* big image placeholder */}
      <div style={{height: 420, background:'#14100a', boxShadow:`inset 0 0 0 2px ${AC.bone}`}}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 07 · Join Room
// ─────────────────────────────────────────────────────────────
function JoinRoomScreen({ mobile = false, code = 'K5K3QX', pseudo = 'Le Mari de Poki' }) {
  return (
    <AcScreen>
      <AcGraffitiLayer density="normal" palette={[AC.shimmer, AC.hex, AC.chem, AC.violet, AC.gold]}/>
      <div style={{position:'absolute', top: -40, left: -60, pointerEvents:'none'}}>
        <AcSplat color={AC.violet} size={mobile?220:340} opacity={0.45} seed={2}/>
      </div>
      <div style={{position:'absolute', bottom: -40, right: -40, pointerEvents:'none'}}>
        <AcSplat color={AC.shimmer} size={mobile?200:300} opacity={0.4} seed={1}/>
      </div>

      <div style={{position:'relative', width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', padding: 30}}>
        <ModalCard width={mobile ? '100%' : 580} tone={AC.chem} tapeLabel="// REJOINDRE">
          <div style={{textAlign:'center', marginBottom: 6}}>
            <AcDisplay size={mobile?40:54}>REJOINDRE <AcShim color={AC.chem}>LA ROOM</AcShim></AcDisplay>
          </div>
          <div style={{textAlign:'center', marginTop: 14, marginBottom: 28}}>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, letterSpacing:'0.22em', color: AC.bone2, textTransform:'uppercase'}}>// CODE&nbsp;&nbsp;</span>
            <span style={{display:'inline-flex', gap: 4, verticalAlign:'middle'}}>
              {code.split('').map((c,i)=>(
                <span key={i} style={{
                  fontFamily:"'JetBrains Mono', monospace",
                  fontSize: mobile?22:30, color: AC.gold, fontWeight:700,
                  border:`1.5px dashed ${AC.bone2}`, padding: mobile?'2px 6px':'3px 8px',
                  background:'rgba(245,185,18,0.05)',
                }}>{c}</span>
              ))}
            </span>
          </div>

          <div style={{marginBottom: 22}}>
            <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 10, letterSpacing:'0.22em', color: AC.chem, marginBottom: 8, textTransform:'uppercase'}}>// TON PSEUDO D'INVOCATEUR</div>
            <div style={{
              position:'relative',
              border:`1.5px solid ${AC.bone}`, background:'rgba(240,228,193,0.04)',
              padding:'14px 16px',
              fontFamily: AC_FONT_MONO, fontSize: mobile?15:17, color: AC.bone,
            }}>
              {pseudo}
              <span style={{display:'inline-block', width: 2, height: 18, background: AC.shimmer, marginLeft: 2, verticalAlign:'middle'}}/>
              <span style={{position:'absolute', top: -10, right: 14, background: AC.ink2, color: AC.bone2, fontFamily:"'JetBrains Mono', monospace", fontSize: 9, letterSpacing:'0.2em', padding:'2px 6px', textTransform:'uppercase'}}>12/24</span>
            </div>
          </div>

          <AcButton variant="chem" size="lg" fullWidth drip
            icon={<AcGlyph kind="arrowRight" color={AC.ink} size={16}/>}>
            REJOINDRE LA PARTIE
          </AcButton>

          <div style={{marginTop: 28, textAlign:'center'}}>
            <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, letterSpacing:'0.2em', color: AC.bone2, textTransform:'uppercase', cursor:'pointer', borderBottom:`1px dashed ${AC.bone2}`, paddingBottom: 2}}>
              ← Retour à l'accueil
            </span>
          </div>
        </ModalCard>
      </div>
    </AcScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 08 · Leave Room — standard player variant (lobby dimmed behind)
// ─────────────────────────────────────────────────────────────
function LeaveRoomScreen({ mobile = false }) {
  return (
    <AcScreen>
      <LobbyBackdropSketch/>
      <ModalDim intensity={0.78}>
        <ModalCard width={mobile ? '100%' : 500} tone={AC.rust} tapeLabel="// CONFIRMATION">
          <div style={{display:'flex', alignItems:'flex-start', gap: 14, marginBottom: 14}}>
            <div style={{flexShrink:0, marginTop: 2}}>
              <AcGlyph kind="arrowLeft" color={AC.rust} size={34} stroke={3.5}/>
            </div>
            <div>
              <AcDisplay size={mobile?30:38}>QUITTER LA <AcShim color={AC.rust}>ROOM&nbsp;?</AcShim></AcDisplay>
            </div>
          </div>

          <div style={{
            fontFamily: AC_FONT_BODY, fontSize: mobile?14:15, lineHeight: 1.55,
            color: AC.bone2, marginBottom: 26, marginLeft: mobile?0:48,
          }}>
            Es-tu sûr de vouloir quitter cette room&nbsp;? Tu pourras la rejoindre plus tard avec le même code.
          </div>

          <div style={{display:'flex', gap: 12, justifyContent:'flex-end', flexWrap:'wrap'}}>
            <AcButton variant="ghost">RESTER</AcButton>
            <AcButton variant="danger" drip
              icon={<AcGlyph kind="arrowLeft" color={AC.bone} size={13}/>}>QUITTER</AcButton>
          </div>

          <div style={{marginTop: 22, fontFamily:"'JetBrains Mono', monospace", fontSize: 10, letterSpacing:'0.2em', color: AC.bone2, opacity:0.6, textTransform:'uppercase'}}>
            // ROOM · GW8BRK
          </div>
        </ModalCard>
      </ModalDim>
    </AcScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 09 · Creator Leave — stronger variant (room gets deleted)
// ─────────────────────────────────────────────────────────────
function CreatorLeaveScreen({ mobile = false }) {
  return (
    <AcScreen>
      <LobbyBackdropSketch/>
      <ModalDim intensity={0.8}>
        <ModalCard width={mobile ? '100%' : 560} tone={AC.shimmer} tapeLabel="// CRÉATEUR">
          <div style={{display:'flex', alignItems:'flex-start', gap: 14, marginBottom: 10}}>
            <div style={{flexShrink:0, marginTop: 2}}>
              <AcEmote face=">:(" color={AC.shimmer} size={46}/>
            </div>
            <div>
              <AcDisplay size={mobile?28:34}>TU ES LE <AcShim color={AC.shimmer}>CRÉATEUR</AcShim></AcDisplay>
              <div style={{marginTop: 6}}>
                <AcStamp color={AC.rust} rotate={-2}>// ACTION DESTRUCTIVE</AcStamp>
              </div>
            </div>
          </div>

          <AcAlert tone="danger" style={{marginTop: 18, marginBottom: 22}}>
            <div style={{fontFamily: AC_FONT_BODY, fontSize: mobile?13:14, lineHeight: 1.55, color: AC.bone}}>
              Si tu quittes, la <b style={{color:AC.shimmer}}>room sera supprimée</b> et tous les joueurs seront déconnectés. Cette action est irréversible.
            </div>
          </AcAlert>

          {/* tiny player list preview to show what gets nuked */}
          <div style={{marginBottom: 26}}>
            <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 10, letterSpacing:'0.22em', color: AC.bone2, marginBottom: 10, textTransform:'uppercase'}}>
              // 6 INVOCATEURS SERONT DÉCONNECTÉS
            </div>
            <div style={{display:'flex', gap: 8, flexWrap:'wrap'}}>
              {[
                {name:'LÉ', color: AC.shimmer},
                {name:'TH', color: AC.chem},
                {name:'CA', color: AC.hex},
                {name:'NO', color: AC.gold},
                {name:'JU', color: AC.violet},
                {name:'SA', color: AC.rust},
              ].map((p,i)=>(
                <AcAvatar key={i} name={p.name} color={p.color} size={32}/>
              ))}
            </div>
          </div>

          <div style={{display:'flex', gap: 12, justifyContent:'flex-end', flexWrap:'wrap'}}>
            <AcButton variant="ghost">RESTER</AcButton>
            <AcButton variant="danger" drip
              icon={<AcGlyph kind="x" color={AC.bone} size={13}/>}>SUPPRIMER LA ROOM</AcButton>
          </div>
        </ModalCard>
      </ModalDim>
    </AcScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// 10 · Back to Lobby (mid-game)
// ─────────────────────────────────────────────────────────────
function BackToLobbyScreen({ mobile = false }) {
  return (
    <AcScreen>
      <PlayingBackdropSketch/>
      <ModalDim intensity={0.78}>
        <ModalCard width={mobile ? '100%' : 540} tone={AC.gold} tapeLabel="// EN PLEINE PARTIE">
          <div style={{display:'flex', alignItems:'flex-start', gap: 14, marginBottom: 14}}>
            <div style={{flexShrink:0, marginTop: 2}}>
              <AcGlyph kind="pause" color={AC.gold} size={34}/>
            </div>
            <div>
              <AcDisplay size={mobile?28:34}>RETOUR AU <AcShim color={AC.gold}>LOBBY&nbsp;?</AcShim></AcDisplay>
            </div>
          </div>

          <div style={{
            fontFamily: AC_FONT_BODY, fontSize: mobile?14:15, lineHeight: 1.55,
            color: AC.bone2, marginLeft: mobile?0:48, marginBottom: 18,
          }}>
            La partie en cours sera <b style={{color:AC.bone}}>annulée</b>. Les scores et réponses seront perdus. Tu pourras relancer une nouvelle partie ensuite.
          </div>

          {/* mini stats being nuked */}
          <div style={{
            display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap: 10,
            padding: '12px 14px', border:`1.5px dashed ${AC.bone2}`,
            background:'rgba(245,185,18,0.04)', marginBottom: 24,
          }}>
            {[
              {k:'QUESTIONS', v:'02 / 20'},
              {k:'JOUEURS', v:'6'},
              {k:'POINTS', v:'14'},
            ].map((s,i)=>(
              <div key={i}>
                <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 9, letterSpacing:'0.2em', color: AC.bone2, textTransform:'uppercase', marginBottom: 4}}>// {s.k}</div>
                <div style={{fontFamily: AC_FONT_DISPLAY_HEAVY, fontSize: 20, fontWeight:800, color: AC.bone}}>{s.v}</div>
              </div>
            ))}
          </div>

          <div style={{display:'flex', gap: 12, justifyContent:'flex-end', flexWrap:'wrap'}}>
            <AcButton variant="ghost">CONTINUER LA PARTIE</AcButton>
            <AcButton variant="gold" drip
              icon={<AcGlyph kind="arrowLeft" color={AC.ink} size={13}/>}>REVENIR AU LOBBY</AcButton>
          </div>
        </ModalCard>
      </ModalDim>
    </AcScreen>
  );
}

// ─────────────────────────────────────────────────────────────
// Toast primitive (used by Notifications screen)
// ─────────────────────────────────────────────────────────────
function Toast({ tone = 'success', icon, title, subtitle, tape, dismissable = true, drip = false }) {
  const col = {
    success: AC.chem, warning: AC.gold, danger: AC.rust, info: AC.hex, shimmer: AC.shimmer, violet: AC.violet,
  }[tone] || AC.chem;
  const bg = {
    success: 'rgba(18,214,168,0.12)', warning: 'rgba(245,185,18,0.12)',
    danger: 'rgba(200,68,30,0.14)', info: 'rgba(94,184,255,0.12)',
    shimmer: 'rgba(255,61,139,0.12)', violet: 'rgba(138,61,212,0.14)',
  }[tone] || 'rgba(18,214,168,0.12)';

  return (
    <div style={{
      position:'relative',
      width: 380, maxWidth:'100%',
      background: `linear-gradient(180deg, #1A160F 0%, #0F0C07 100%)`,
      borderLeft:`5px solid ${col}`,
      boxShadow: `inset 0 0 0 1px rgba(240,228,193,0.15), 4px 6px 0 ${AC.ink}`,
      padding: '12px 36px 12px 14px',
      color: AC.bone,
    }}>
      {/* tape tag */}
      {tape && (
        <span style={{
          position:'absolute', top: -8, left: 14,
          background: col, color: tone==='danger'||tone==='violet'? AC.bone : AC.ink,
          fontFamily:"'JetBrains Mono', monospace", fontSize: 9,
          letterSpacing:'0.22em', padding:'3px 8px', transform:'rotate(-2deg)',
          textTransform:'uppercase',
        }}>{tape}</span>
      )}

      <div style={{display:'flex', alignItems:'flex-start', gap: 10}}>
        {icon && <div style={{flexShrink:0, marginTop: 1}}>{icon}</div>}
        <div style={{flex:1, minWidth:0}}>
          <div style={{
            fontFamily: AC_FONT_DISPLAY_HEAVY, fontWeight: 700, fontSize: 15,
            letterSpacing:'0.02em', lineHeight: 1.15,
            color: AC.bone, textTransform:'uppercase',
          }}>{title}</div>
          {subtitle && (
            <div style={{
              fontFamily:"'JetBrains Mono', monospace", fontSize: 11,
              letterSpacing:'0.08em', color: AC.bone2, marginTop: 3, lineHeight: 1.4,
            }}>{subtitle}</div>
          )}
        </div>
        {dismissable && (
          <button style={{
            position:'absolute', top: 10, right: 10,
            background:'transparent', border:'none', cursor:'pointer',
            color: AC.bone2, padding: 2, lineHeight: 0,
          }} aria-label="Close">
            <AcGlyph kind="x" color={AC.bone2} size={14} stroke={2.5}/>
          </button>
        )}
      </div>

      {drip && (
        <div style={{position:'absolute', left: 12, right: 36, bottom: -10, height: 12, pointerEvents:'none'}}>
          <AcDrip color={col} height={12} seed={3}/>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 11 · Notifications screen — shows stacked toast variants over a sketch
// ─────────────────────────────────────────────────────────────
function NotificationsScreen({ mobile = false, variant = 'gallery' }) {
  // variant: 'gallery' = all variants at once (documentation);
  //          'attack'  = in-game attack+counter pair (matches attack and counter.jpg);
  //          'room-deleted' = top-right success "Room supprimée avec succès";
  //          'room-closed'  = top-right warning "La room a été fermée par le créateur".

  const Backdrop = variant === 'attack' ? PlayingBackdropSketch : LobbyBackdropSketch;

  return (
    <AcScreen>
      <Backdrop/>

      {/* Toast area, top-right for single variants */}
      {(variant === 'room-deleted' || variant === 'room-closed' || variant === 'attack') && (
        <div style={{position:'absolute', top: 22, right: 22, display:'flex', flexDirection:'column', gap: 14, zIndex: 5, maxWidth: 400}}>
          {variant === 'room-deleted' && (
            <Toast
              tone="success"
              tape="// SYSTÈME"
              drip
              icon={<AcGlyph kind="check" color={AC.chem} size={22} stroke={3}/>}
              title="Room supprimée avec succès"
              subtitle="// tous les invocateurs ont été renvoyés à l'accueil"
            />
          )}
          {variant === 'room-closed' && (
            <Toast
              tone="warning"
              tape="// SYSTÈME"
              drip
              icon={<AcGlyph kind="x" color={AC.gold} size={20} stroke={3}/>}
              title="La room a été fermée par le créateur"
              subtitle="// tu as été renvoyé à l'accueil · K5K3QX"
            />
          )}
          {variant === 'attack' && (
            <>
              <Toast
                tone="success"
                tape="// BOUCLIER"
                drip
                icon={<AcGlyph kind="shield" color={AC.chem} size={22} stroke={3}/>}
                title="Tu as bloqué l'attaque de Le Mari de Poki"
                subtitle="// bouclier x1 · -1 charge restante"
              />
              <Toast
                tone="warning"
                tape="// ATTAQUE"
                icon={<AcGlyph kind="x" color={AC.gold} size={20} stroke={3}/>}
                title="L'attaque a échoué"
                subtitle="// Le Mari de Poki · fumigène bloqué"
              />
            </>
          )}
        </div>
      )}

      {/* Gallery variant — all toast styles side by side on a clean bg */}
      {variant === 'gallery' && (
        <div style={{position:'absolute', inset:0, overflow:'auto', padding: mobile?20:40}}>
          <div style={{position:'relative', maxWidth: 1100, margin:'0 auto'}}>
            <AcGraffitiLayer density="normal"/>

            <div style={{marginBottom: 10, display:'flex', alignItems:'center', gap: 14, flexWrap:'wrap'}}>
              <AcSectionNum n={7}/>
              <AcDottedLabel color={AC.bone2} style={{minWidth: 220}}>// CATALOGUE NOTIFICATIONS</AcDottedLabel>
            </div>
            <div style={{marginBottom: 28}}>
              <AcDisplay size={mobile?36:54}>TOASTS <AcShim color={AC.chem}>&amp; ALERTES</AcShim></AcDisplay>
            </div>

            {/* Section 1 — SYSTÈME */}
            <div style={{marginBottom: 28}}>
              <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, letterSpacing:'0.22em', color: AC.chem, marginBottom: 12, textTransform:'uppercase'}}>
                // SYSTÈME (room lifecycle)
              </div>
              <div style={{display:'grid', gridTemplateColumns: mobile?'1fr':'1fr 1fr', gap: 18}}>
                <Toast tone="success" tape="// SYSTÈME" drip
                  icon={<AcGlyph kind="check" color={AC.chem} size={22} stroke={3}/>}
                  title="Room supprimée avec succès"
                  subtitle="// tous les invocateurs ont été renvoyés"/>
                <Toast tone="warning" tape="// SYSTÈME" drip
                  icon={<AcGlyph kind="x" color={AC.gold} size={20} stroke={3}/>}
                  title="La room a été fermée par le créateur"
                  subtitle="// tu as été renvoyé à l'accueil"/>
                <Toast tone="info" tape="// SYSTÈME"
                  icon={<AcGlyph kind="link" color={AC.hex} size={20} stroke={3}/>}
                  title="Lien d'invitation copié"
                  subtitle="// beat-eikichi.gg/r/K5K3QX"/>
                <Toast tone="danger" tape="// ERREUR"
                  icon={<AcGlyph kind="x" color={AC.rust} size={20} stroke={3}/>}
                  title="Connexion perdue"
                  subtitle="// reconnexion automatique dans 3s"/>
              </div>
            </div>

            {/* Section 2 — ATTAQUES */}
            <div style={{marginBottom: 28}}>
              <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, letterSpacing:'0.22em', color: AC.shimmer, marginBottom: 12, textTransform:'uppercase'}}>
                // ATTAQUES &amp; BOUCLIERS
              </div>
              <div style={{display:'grid', gridTemplateColumns: mobile?'1fr':'1fr 1fr', gap: 18}}>
                <Toast tone="shimmer" tape="// ATTAQUE REÇUE" drip
                  icon={<AcGlyph kind="smoke" color={AC.shimmer} size={22} stroke={3}/>}
                  title="Fumigène lancé par Théo"
                  subtitle="// image brouillée pendant 6s"/>
                <Toast tone="success" tape="// BOUCLIER" drip
                  icon={<AcGlyph kind="shield" color={AC.chem} size={22} stroke={3}/>}
                  title="Tu as bloqué l'attaque de Le Mari de Poki"
                  subtitle="// bouclier x1 · -1 charge restante"/>
                <Toast tone="warning" tape="// ATTAQUE"
                  icon={<AcGlyph kind="x" color={AC.gold} size={20} stroke={3}/>}
                  title="L'attaque a échoué"
                  subtitle="// Le Mari de Poki · fumigène bloqué"/>
                <Toast tone="violet" tape="// ARME PRÊTE"
                  icon={<AcGlyph kind="bomb" color={AC.violet} size={22} stroke={3}/>}
                  title="C4 rechargée (+1 utilisation)"
                  subtitle="// disponible après la question 05"/>
              </div>
            </div>

            {/* Section 3 — JEU */}
            <div style={{marginBottom: 28}}>
              <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize: 11, letterSpacing:'0.22em', color: AC.gold, marginBottom: 12, textTransform:'uppercase'}}>
                // DÉROULÉ DE PARTIE
              </div>
              <div style={{display:'grid', gridTemplateColumns: mobile?'1fr':'1fr 1fr', gap: 18}}>
                <Toast tone="success" tape="// +3 PTS" drip
                  icon={<AcGlyph kind="check" color={AC.chem} size={22} stroke={3}/>}
                  title="ERA a trouvé : Control"
                  subtitle="// +3 pts · verrouillé en 08s"/>
                <Toast tone="info" tape="// INDICES"
                  icon={<AcGlyph kind="ring" color={AC.hex} size={20} stroke={3}/>}
                  title="Indices révélés"
                  subtitle="// GENRE : FPS · ANNÉE : 2019"/>
                <Toast tone="shimmer" tape="// EIKICHI"
                  icon={<AcEmote face=">:(" color={AC.shimmer} size={22}/>}
                  title="Tu es l'Eikichi cette manche"
                  subtitle="// les questions concernent tes goûts"/>
                <Toast tone="warning" tape="// CHRONO"
                  icon={<AcGlyph kind="flame" color={AC.gold} size={22} stroke={3}/>}
                  title="Plus que 5 secondes"
                  subtitle="// temps écoulé = 0 points"/>
              </div>
            </div>
          </div>
        </div>
      )}
    </AcScreen>
  );
}

// expose
Object.assign(window, {
  JoinRoomScreen, LeaveRoomScreen, CreatorLeaveScreen, BackToLobbyScreen,
  NotificationsScreen,
});
