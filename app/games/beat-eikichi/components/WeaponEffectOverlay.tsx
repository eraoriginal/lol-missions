'use client';

import { useEffect, useMemo, useState } from 'react';
import type { BeatEikichiWeaponEvent } from '@/app/types/room';
import { getWeapon } from '@/lib/beatEikichi/weapons';

interface WeaponEffectOverlayProps {
  events: BeatEikichiWeaponEvent[];
  myPlayerId: string | null;
  currentQuestionIndex: number;
  imageUrl: string;
}

interface ActiveEffect {
  eventId: string;
  weaponId: string;
  startedAtMs: number;
  endsAtMs: number;
}

/**
 * True si le joueur est protégé par un bouclier pour la question donnée.
 * Exporté pour que PlayingView puisse générer les toasts "attaque bloquée".
 */
export function isShielded(
  events: BeatEikichiWeaponEvent[],
  targetId: string | null,
  questionIndex: number,
): boolean {
  if (!targetId) return false;
  return events.some(
    (e) =>
      e.weaponId === 'shield' &&
      e.targetPlayerId === targetId &&
      e.questionIndex === questionIndex,
  );
}

/**
 * Calcule l'effet visuel actuellement actif sur le joueur courant.
 * Règles :
 *   - Les tirs sont désormais "programmés" : questionIndex = question à laquelle
 *     l'effet s'applique (fire-weapon enregistre currentIndex + 1).
 *   - Si le joueur est sous bouclier pour cette question, aucun effet visuel ne
 *     s'applique (retourne null).
 *   - Le bouclier lui-même n'a pas d'effet visuel (purement défensif).
 *   - Si plusieurs tirs (hors bouclier) visent le même joueur sur la même question,
 *     c'est le plus récent qui est affiché (il "écrase" les précédents).
 */
function computeActiveEffect(
  events: BeatEikichiWeaponEvent[],
  targetId: string | null,
  questionIndex: number,
  nowMs: number,
): ActiveEffect | null {
  if (!targetId) return null;
  if (isShielded(events, targetId, questionIndex)) return null;

  const latest = events
    .filter(
      (e) =>
        e.targetPlayerId === targetId &&
        e.questionIndex === questionIndex &&
        e.weaponId !== 'shield',
    )
    .filter((e) => nowMs >= new Date(e.firedAt).getTime())
    .sort(
      (a, b) =>
        new Date(b.firedAt).getTime() - new Date(a.firedAt).getTime(),
    )[0];

  if (!latest) return null;

  return {
    eventId: latest.id,
    weaponId: latest.weaponId,
    startedAtMs: new Date(latest.firedAt).getTime(),
    // Jamais borné dans le temps : l'effet cesse automatiquement au prochain
    // /next (changement de questionIndex → sortie du filter ci-dessus).
    endsAtMs: Infinity,
  };
}

export function WeaponEffectOverlay({
  events,
  myPlayerId,
  currentQuestionIndex,
  imageUrl,
}: WeaponEffectOverlayProps) {
  const [now, setNow] = useState(() => Date.now());

  // Tick pour mettre à jour l'état d'effet actif.
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, []);

  const activeEffect = useMemo(
    () => computeActiveEffect(events, myPlayerId, currentQuestionIndex, now),
    [events, myPlayerId, currentQuestionIndex, now],
  );

  if (!activeEffect) return null;

  const weapon = getWeapon(activeEffect.weaponId);
  const elapsedMs = now - activeEffect.startedAtMs;

  return (
    <>
      {/* Label du haut : précise l'effet en cours au joueur. Masqué pour C4 (redondant avec l'effet visuel). */}
      {activeEffect.weaponId !== 'c4' && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-3 py-1 rounded-full bg-rose-900/80 border border-rose-400 text-xs font-bold text-white shadow-lg flex items-center gap-2 pointer-events-none">
          <span>{weapon?.icon}</span>
          <span>{weapon?.name}</span>
        </div>
      )}

      {/* Chaque arme a son propre overlay visuel. */}
      {activeEffect.weaponId === 'smoke' && <SmokeOverlay />}
      {activeEffect.weaponId === 'c4' && <C4Overlay elapsedMs={elapsedMs} />}
      {activeEffect.weaponId === 'blade' && (
        <BladeOverlay key={activeEffect.eventId} imageUrl={imageUrl} />
      )}
      {activeEffect.weaponId === 'freeze' && (
        <FreezeOverlay key={activeEffect.eventId} />
      )}
      {activeEffect.weaponId === 'zoomghost' && (
        <ZoomGhostOverlay imageUrl={imageUrl} />
      )}
      {activeEffect.weaponId === 'tornado' && <TornadoOverlay />}
      {activeEffect.weaponId === 'puzzle' && (
        <PuzzleOverlay key={activeEffect.eventId} imageUrl={imageUrl} />
      )}
      {activeEffect.weaponId === 'speed' && (
        <SpeedOverlay imageUrl={imageUrl} />
      )}
    </>
  );
}

/* --- SMOKE ------------------------------------------------------- */

function SmokeOverlay() {
  // Technique blend-difference sur deux textures de bruit (voir globals.css).
  // Le tout dans un seul div suffit.
  return (
    <div className="absolute inset-0 z-20 pointer-events-none beat-eikichi-fx-smoke" />
  );
}

/* --- C4 ---------------------------------------------------------- */

/** Une explosion = un <video> transparent qui joue à un moment donné.
 * Le WebM est chargé une fois et réutilisé (cache navigateur). */
function Explosion({
  top,
  left,
  sizePct,
  delay,
  parentElapsedMs,
}: {
  top: string;
  left: string;
  sizePct: number;
  delay: number;
  parentElapsedMs: number;
}) {
  // On attend que le délai soit écoulé avant de monter la vidéo, puis elle se
  // joue naturellement (autoPlay).
  const elapsedFromExplosionStart = parentElapsedMs / 1000 - delay;
  // Affichage : commence `delay`s après le début de C4, dure ~3.5s (durée du webm).
  const shouldRender =
    elapsedFromExplosionStart >= 0 && elapsedFromExplosionStart < 3.5;
  if (!shouldRender) return null;

  return (
    <video
      src="/videos/beat-eikichi/explosion.webm"
      autoPlay
      muted
      playsInline
      className="beat-eikichi-fx-explosion-video"
      style={{
        top,
        left,
        width: `${sizePct}%`,
      }}
    />
  );
}

// Pool de positions/tailles, cyclé pour couvrir indéfiniment la durée de la question.
const C4_POOL: Array<{ top: string; left: string; sizePct: number }> = [
  { top: '40%', left: '20%', sizePct: 170 },
  { top: '55%', left: '70%', sizePct: 190 },
  { top: '30%', left: '55%', sizePct: 170 },
  { top: '70%', left: '30%', sizePct: 180 },
  { top: '45%', left: '80%', sizePct: 170 },
  { top: '60%', left: '45%', sizePct: 220 },
  { top: '25%', left: '35%', sizePct: 170 },
  { top: '75%', left: '65%', sizePct: 180 },
  { top: '45%', left: '25%', sizePct: 180 },
  { top: '35%', left: '70%', sizePct: 190 },
  { top: '65%', left: '15%', sizePct: 175 },
  { top: '30%', left: '50%', sizePct: 200 },
  { top: '70%', left: '55%', sizePct: 180 },
  { top: '50%', left: '85%', sizePct: 180 },
  { top: '40%', left: '30%', sizePct: 190 },
  { top: '60%', left: '60%', sizePct: 200 },
  { top: '30%', left: '70%', sizePct: 175 },
  { top: '55%', left: '40%', sizePct: 190 },
];
const C4_CADENCE_S = 0.8;
const C4_MAX_EXPLOSIONS = 120; // ~96 s de couverture, suffisant pour les timers longs

function C4Overlay({ elapsedMs }: { elapsedMs: number }) {
  // Flash blanc bref global (aveuglement) au tout début.
  const flashOpacity = Math.max(0, 1 - elapsedMs / 300);

  // Chaque slot i est une explosion au temps delay = i × cadence. La vidéo ne
  // s'affiche que dans sa fenêtre [delay, delay + 3.5 s] via la logique du
  // composant Explosion (shouldRender), donc seules ~4-5 vidéos sont montées
  // à la fois même si la liste en contient 120.
  const explosions = Array.from({ length: C4_MAX_EXPLOSIONS }, (_, i) => ({
    ...C4_POOL[i % C4_POOL.length],
    delay: i * C4_CADENCE_S,
  }));

  return (
    <>
      {flashOpacity > 0 && (
        <div
          className="absolute inset-0 z-30 bg-white pointer-events-none"
          style={{ opacity: flashOpacity }}
        />
      )}
      {/* Voile orangé permanent : teinte chaude semi-opaque qui couvre tout le
          cadre pendant la durée de C4, pour combler les espaces entre deux
          explosions. */}
      <div className="absolute inset-0 z-15 pointer-events-none beat-eikichi-fx-c4-haze" />
      <div className="absolute inset-0 z-20 pointer-events-none beat-eikichi-fx-shake" />
      <div className="absolute inset-0 z-25 pointer-events-none overflow-hidden">
        {explosions.map((e, i) => (
          <Explosion key={i} {...e} parentElapsedMs={elapsedMs} />
        ))}
      </div>
    </>
  );
}

/* --- BLADE ------------------------------------------------------- */

/**
 * Séquence blade :
 *   1. Variant aléatoire : la coupe laisse 25 % intact soit en haut-droite ("top"),
 *      soit en bas-gauche ("bottom"). Les 75 % restants tombent.
 *   2. Le katana (SVG dessiné) traverse l'image le long de la ligne de coupe
 *   3. Flash blanc lumineux au passage de la lame
 *   4. Le duplicata des 75 % bascule et tombe hors de l'écran en révélant un fond noir
 */
function BladeOverlay({ imageUrl }: { imageUrl: string }) {
  // Variant stable pendant la vie du composant (le parent remonte via `key={eventId}`).
  const [variant] = useState<'top' | 'bottom'>(() =>
    Math.random() < 0.5 ? 'top' : 'bottom',
  );

  return (
    <div
      className={`absolute inset-0 z-25 pointer-events-none overflow-hidden beat-eikichi-fx-blade-variant-${variant}`}
    >
      <div className="beat-eikichi-fx-blade-black" />
      <div
        className="beat-eikichi-fx-blade-fall"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      <div className="beat-eikichi-fx-blade-slash" />
      <Katana />
    </div>
  );
}

/**
 * Katana SVG dessiné : lame courbée (hamon visible), tsuba (garde) dorée,
 * tsuka (poignée) avec motif losange ito, menuki ornementaux, kashira (pommeau).
 * Orientation naturelle : lame à gauche (pointe en x=15), manche à droite.
 * La rotation est appliquée via CSS (.beat-eikichi-fx-katana).
 */
function Katana() {
  return (
    <svg
      className="beat-eikichi-fx-katana"
      viewBox="0 0 1000 80"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <linearGradient id="bek-blade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dde3eb" />
          <stop offset="35%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f2f5f9" />
          <stop offset="100%" stopColor="#8f98a5" />
        </linearGradient>
        <linearGradient id="bek-handle" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a1212" />
          <stop offset="100%" stopColor="#140505" />
        </linearGradient>
      </defs>

      {/* Lame (pointe à gauche, se termine juste avant la tsuba) */}
      <path
        d="M 15 40 Q 60 37 200 36 L 720 37 L 740 40 L 720 47 L 200 48 Q 60 47 15 45 Z"
        fill="url(#bek-blade)"
        stroke="#8b96a3"
        strokeWidth="0.5"
      />
      {/* Hamon (ligne de trempe) */}
      <path
        d="M 20 42 Q 60 41 200 40 Q 400 40 720 42"
        stroke="#b8c0cc"
        strokeWidth="0.8"
        fill="none"
        opacity="0.5"
      />
      {/* Éclat sur le tranchant */}
      <path d="M 30 39 L 700 39" stroke="#ffffff" strokeWidth="0.6" opacity="0.75" />

      {/* Tsuba (garde) */}
      <rect x="740" y="22" width="12" height="36" fill="#1a1a1a" stroke="#d4a03a" strokeWidth="1" />
      <circle cx="746" cy="40" r="4" fill="#d4a03a" />
      <circle cx="746" cy="40" r="2" fill="#1a1a1a" />

      {/* Tsuka (manche) */}
      <rect x="752" y="28" width="216" height="24" fill="url(#bek-handle)" />
      {/* Motif losange ito */}
      <g stroke="#8a5a1a" strokeWidth="1.2" fill="none" opacity="0.9">
        <path d="M 758 28 L 778 52 L 798 28 L 818 52 L 838 28 L 858 52 L 878 28 L 898 52 L 918 28 L 938 52 L 958 28" />
        <path d="M 758 52 L 778 28 L 798 52 L 818 28 L 838 52 L 858 28 L 878 52 L 898 28 L 918 52 L 938 28 L 958 52" />
      </g>
      {/* Menuki (ornements sur manche) */}
      <ellipse cx="810" cy="40" rx="6" ry="4" fill="#d4a03a" opacity="0.85" />
      <ellipse cx="900" cy="40" rx="6" ry="4" fill="#d4a03a" opacity="0.85" />

      {/* Kashira (pommeau) */}
      <rect x="968" y="25" width="12" height="30" fill="#1a1a1a" stroke="#d4a03a" strokeWidth="0.5" />
      <circle cx="974" cy="40" r="2" fill="#d4a03a" />
    </svg>
  );
}

/* --- FREEZE ------------------------------------------------------ */

const BEK_SNOWFLAKE_CHARS = ['❄', '❅', '❆', '✦', '✧'];
const BEK_SNOWFLAKE_COUNT = 40;

function FreezeOverlay() {
  // Voile bleuté dense (image à peine perceptible) + craquelures SVG accentuées
  // + nombreux flocons animés (tailles, caractères et vitesses variés).
  // useState avec initializer paresseux : calculé une seule fois au mount.
  // (useMemo est rejeté par react-hooks/purity sur Math.random.)
  const [snowflakes] = useState(() =>
    Array.from({ length: BEK_SNOWFLAKE_COUNT }, () => ({
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 5,
      size: 10 + Math.random() * 14,
      opacity: 0.55 + Math.random() * 0.4,
      char: BEK_SNOWFLAKE_CHARS[
        Math.floor(Math.random() * BEK_SNOWFLAKE_CHARS.length)
      ],
    })),
  );

  return (
    <>
      <div className="absolute inset-0 z-20 pointer-events-none beat-eikichi-fx-freeze" />
      <FreezeCracks />
      <div className="absolute inset-0 z-22 pointer-events-none overflow-hidden">
        {snowflakes.map((f, i) => (
          <span
            key={i}
            className="beat-eikichi-fx-snowflake"
            style={{
              left: f.left,
              animationDelay: `${f.delay}s`,
              animationDuration: `${f.duration}s`,
              fontSize: `${f.size}px`,
              opacity: f.opacity,
            }}
          >
            {f.char}
          </span>
        ))}
      </div>
      {/* Overlay transparent qui absorbe les clics pour désactiver le zoom. */}
      <div
        className="absolute inset-0 z-25 cursor-not-allowed"
        style={{ pointerEvents: 'auto' }}
        title="Gel : zoom désactivé"
      />
    </>
  );
}

/**
 * Craquelures de glace dessinées en SVG : point d'impact central, branches
 * principales radiales, branches secondaires, micro-fissures, le tout doublé
 * d'une ombre bleu foncé pour donner de la profondeur.
 */
function FreezeCracks() {
  return (
    <svg
      className="beat-eikichi-fx-freeze-cracks"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Ombre sous-jacente (épaisse, bleu foncé) pour creuser les craquelures. */}
      <g stroke="rgba(30, 70, 110, 0.75)" strokeWidth="0.8" fill="none" strokeLinecap="round">
        <path d="M 48 48 L 30 30 L 15 15 L 4 3" />
        <path d="M 48 48 L 65 32 L 80 18 L 94 4" />
        <path d="M 48 48 L 32 60 L 18 75 L 6 92" />
        <path d="M 48 48 L 68 62 L 82 76 L 95 94" />
        <path d="M 48 48 L 49 25 L 48 8 L 49 0" />
        <path d="M 48 48 L 47 68 L 48 85 L 47 100" />
        <path d="M 48 48 L 25 47 L 8 48 L 0 49" />
        <path d="M 48 48 L 72 48 L 90 49 L 100 50" />
      </g>
      {/* Craquelures principales (blanches brillantes) */}
      <g stroke="rgba(240, 250, 255, 1)" strokeWidth="0.45" fill="none" strokeLinecap="round">
        <path d="M 48 48 L 30 30 L 15 15 L 4 3" />
        <path d="M 48 48 L 65 32 L 80 18 L 94 4" />
        <path d="M 48 48 L 32 60 L 18 75 L 6 92" />
        <path d="M 48 48 L 68 62 L 82 76 L 95 94" />
        <path d="M 48 48 L 49 25 L 48 8 L 49 0" />
        <path d="M 48 48 L 47 68 L 48 85 L 47 100" />
        <path d="M 48 48 L 25 47 L 8 48 L 0 49" />
        <path d="M 48 48 L 72 48 L 90 49 L 100 50" />
      </g>
      {/* Branches secondaires */}
      <g stroke="rgba(220, 240, 255, 0.95)" strokeWidth="0.28" fill="none" strokeLinecap="round">
        <path d="M 22 22 L 14 18 L 8 12" />
        <path d="M 22 22 L 18 14" />
        <path d="M 75 22 L 82 14" />
        <path d="M 75 22 L 84 22" />
        <path d="M 22 72 L 14 76 L 6 82" />
        <path d="M 22 72 L 16 66" />
        <path d="M 75 72 L 84 80" />
        <path d="M 75 72 L 84 68" />
        <path d="M 35 35 L 32 26" />
        <path d="M 62 35 L 66 28" />
        <path d="M 35 62 L 28 66" />
        <path d="M 62 62 L 70 67" />
        <path d="M 48 25 L 55 22" />
        <path d="M 48 70 L 42 72" />
        <path d="M 25 48 L 22 52" />
        <path d="M 72 48 L 76 52" />
      </g>
      {/* Micro-fissures */}
      <g stroke="rgba(255, 255, 255, 0.75)" strokeWidth="0.2" fill="none" strokeLinecap="round">
        <path d="M 10 40 L 4 42 L 0 42" />
        <path d="M 90 38 L 96 36 L 100 34" />
        <path d="M 38 12 L 40 4 L 38 0" />
        <path d="M 58 88 L 60 95 L 58 100" />
        <path d="M 18 58 L 12 60 L 8 64" />
        <path d="M 82 58 L 88 62 L 94 66" />
        <path d="M 60 18 L 66 12 L 70 8" />
        <path d="M 40 82 L 34 86 L 30 92" />
      </g>
      {/* Point d'impact central : petit éclat lumineux */}
      <circle cx="48" cy="48" r="1.8" fill="rgba(255, 255, 255, 0.9)" />
      <circle cx="48" cy="48" r="0.6" fill="white" />
    </svg>
  );
}

/* --- ZOOM GHOST -------------------------------------------------- */

/**
 * Zoom parasite : l'image entière est fortement floutée, et une lentille circulaire
 * (style objectif photo pro) se déplace toute seule dans le cadre en affichant une
 * version zoomée 7× du contenu qu'elle survole. Les points (cx, cy) de la lentille
 * et du transform-origin sont synchronisés via deux variables CSS animées (@property).
 */
function ZoomGhostOverlay({ imageUrl }: { imageUrl: string }) {
  // URL entre guillemets : évite les ennuis si imageUrl contient des parenthèses,
  // espaces ou caractères spéciaux (RAWG/GIPHY URLs peuvent en avoir).
  const bg = { backgroundImage: `url("${imageUrl}")` };
  return (
    <>
      <div
        className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
        aria-hidden
      >
        <div className="beat-eikichi-fx-zoomghost-blur" style={bg} />
        <div className="beat-eikichi-fx-zoomghost-lens">
          <div className="beat-eikichi-fx-zoomghost-lens-inner" style={bg} />
        </div>
        <div className="beat-eikichi-fx-zoomghost-scope" />
      </div>
      {/* Bloque le zoom manuel. */}
      <div
        className="absolute inset-0 z-25 cursor-not-allowed"
        style={{ pointerEvents: 'auto' }}
      />
    </>
  );
}

/* --- TORNADO ----------------------------------------------------- */

/**
 * Tornade : l'image est déformée pixel par pixel via un filtre SVG
 * (feTurbulence + feDisplacementMap) qui anime sa fréquence et son amplitude
 * de déplacement pour un effet "distorsion organique". La rotation lente du
 * wrapper image est appliquée via classe CSS dans ZoomPanImage (prop rotating).
 * Une vignette orageuse pulsante encadre le tout.
 */
function TornadoOverlay() {
  return (
    <>
      {/* Définition du filtre SVG : invisible, posée dans le DOM pour que
          `filter: url(#beat-eikichi-fx-tornado-warp)` dans la CSS de
          .beat-eikichi-fx-tornado-rotate la résolve. */}
      <svg
        aria-hidden
        style={{
          position: 'absolute',
          width: 0,
          height: 0,
          pointerEvents: 'none',
        }}
      >
        <defs>
          <filter
            id="beat-eikichi-fx-tornado-warp"
            x="-60%"
            y="-60%"
            width="220%"
            height="220%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.018"
              numOctaves={3}
              seed={3}
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                values="0.010 0.016; 0.026 0.020; 0.016 0.028; 0.010 0.016"
                dur="6s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={100}>
              <animate
                attributeName="scale"
                values="80; 160; 110; 180; 80"
                dur="4.5s"
                repeatCount="indefinite"
              />
            </feDisplacementMap>
          </filter>
        </defs>
      </svg>
      {/* Vignette orageuse pulsante (cadre le chaos de la distorsion). */}
      <div className="absolute inset-0 z-10 pointer-events-none beat-eikichi-fx-tornado-overlay" />
    </>
  );
}

/* --- PUZZLE ------------------------------------------------------ */

const BEK_PUZZLE_IDENTITY = [0, 1, 2, 3, 4, 5, 6, 7, 8];

/**
 * Chemin SVG d'une pièce de puzzle dans sa cellule locale.
 *
 * Cellule 160×100 (aspect 1.6:1, identique au conteneur 16:10 → pas de distorsion).
 * Tenons isotropes : longueur de base 30 unités, profondeur 15. Convention : chaque
 * arête interne du 3×3 a un TENON (protubérance sortante) côté haut/gauche et une
 * MORTAISE (indentation entrante) côté bas/droite — les tenons d'une pièce débordent
 * donc dans le territoire de ses voisines, comme dans un vrai puzzle.
 */
function puzzlePiecePath(row: number, col: number): string {
  const top = row === 0 ? 'L 160 0' : 'L 65 0 C 65 15, 95 15, 95 0 L 160 0';
  const right =
    col === 2 ? 'L 160 100' : 'L 160 35 C 175 35, 175 65, 160 65 L 160 100';
  const bottom =
    row === 2 ? 'L 0 100' : 'L 95 100 C 95 115, 65 115, 65 100 L 0 100';
  const left = col === 0 ? 'L 0 0' : 'L 0 65 C 15 65, 15 35, 0 35 L 0 0';
  return `M 0 0 ${top} ${right} ${bottom} ${left} Z`;
}

function PuzzleOverlay({ imageUrl }: { imageUrl: string }) {
  // Shuffle + rotation aléatoire calculés une seule fois au mount.
  // Le parent passe `key={eventId}` → chaque nouveau tir regénère des positions.
  const [pieces] = useState(() => {
    const shuffled = [...BEK_PUZZLE_IDENTITY];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.map((displayIdx, originalIdx) => {
      const originalRow = Math.floor(originalIdx / 3);
      const originalCol = originalIdx % 3;
      return {
        id: originalIdx,
        originalRow,
        originalCol,
        displayRow: Math.floor(displayIdx / 3),
        displayCol: displayIdx % 3,
        path: puzzlePiecePath(originalRow, originalCol),
        rotation: (Math.random() - 0.5) * 7,
      };
    });
  });

  return (
    <div className="absolute inset-0 z-20 pointer-events-none beat-eikichi-fx-puzzle-bg">
      {pieces.map((p) => (
        <svg
          key={p.id}
          viewBox="0 0 160 100"
          preserveAspectRatio="none"
          className="beat-eikichi-fx-puzzle-piece"
          style={{
            position: 'absolute',
            left: `${(p.displayCol * 100) / 3}%`,
            top: `${(p.displayRow * 100) / 3}%`,
            width: `${100 / 3}%`,
            height: `${100 / 3}%`,
            overflow: 'visible',
            transform: `rotate(${p.rotation}deg)`,
            transformOrigin: 'center',
          }}
        >
          <defs>
            <clipPath id={`bek-puzzle-clip-${p.id}`}>
              <path d={p.path} />
            </clipPath>
          </defs>
          <image
            href={imageUrl}
            x={-p.originalCol * 160}
            y={-p.originalRow * 100}
            width={480}
            height={300}
            preserveAspectRatio="none"
            clipPath={`url(#bek-puzzle-clip-${p.id})`}
          />
          {/* Liseré intérieur clair pour effet glassy / relief */}
          <path
            d={p.path}
            fill="none"
            stroke="rgba(255, 255, 255, 0.28)"
            strokeWidth="0.8"
          />
        </svg>
      ))}
    </div>
  );
}

/* --- SPEED ------------------------------------------------------- */

/**
 * Speed : l'image défile très vite de gauche à droite. Pour donner l'impression
 * de vitesse :
 *   1. Un "strip" = 2 copies de l'image côte à côte (flex row) qui se déplace
 *      horizontalement en boucle (seamless car les 2 copies sont identiques)
 *   2. Flou de mouvement horizontal (feGaussianBlur avec stdDeviation "6 0")
 *      appliqué au strip pour flouter seulement dans l'axe du mouvement
 *   3. Lignes de vitesse horizontales (repeating-linear-gradient animé) qui
 *      zooment par-dessus à un rythme différent
 *   4. Vignette sombre sur les bords gauche/droite (effet tunnel)
 */
function SpeedOverlay({ imageUrl }: { imageUrl: string }) {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden beat-eikichi-fx-speed-container">
      {/* Filtre SVG : flou de mouvement horizontal uniquement. */}
      <svg
        aria-hidden
        style={{ position: 'absolute', width: 0, height: 0 }}
      >
        <defs>
          <filter
            id="beat-eikichi-fx-speed-blur"
            x="-5%"
            y="-5%"
            width="110%"
            height="110%"
          >
            <feGaussianBlur stdDeviation="6 0" />
          </filter>
        </defs>
      </svg>
      {/* Strip de 2 images côte à côte : translate horizontal en boucle. */}
      <div className="beat-eikichi-fx-speed-strip">
        <img
          src={imageUrl}
          alt=""
          className="beat-eikichi-fx-speed-img"
          draggable={false}
        />
        <img
          src={imageUrl}
          alt=""
          className="beat-eikichi-fx-speed-img"
          draggable={false}
        />
      </div>
      {/* Lignes de vitesse horizontales qui passent à toute vitesse. */}
      <div className="beat-eikichi-fx-speed-lines" />
      {/* Vignette sombre sur les bords gauche/droite (effet tunnel). */}
      <div className="beat-eikichi-fx-speed-vignette" />
    </div>
  );
}

/**
 * Helper exporté pour le parent : quelles classes CSS appliquer au container
 * de l'image selon l'effet actif (utile pour tornade où on veut faire tourner
 * le container entier, et freeze où on veut bloquer le zoom).
 */
export function containerClassForEffect(
  events: BeatEikichiWeaponEvent[],
  myPlayerId: string | null,
  questionIndex: number,
  nowMs: number,
): string {
  const active = computeActiveEffect(events, myPlayerId, questionIndex, nowMs);
  if (!active) return '';
  if (active.weaponId === 'tornado') return 'beat-eikichi-fx-tornado-rotate';
  return '';
}

export function isZoomDisabled(
  events: BeatEikichiWeaponEvent[],
  myPlayerId: string | null,
  questionIndex: number,
  nowMs: number,
): boolean {
  const active = computeActiveEffect(events, myPlayerId, questionIndex, nowMs);
  if (!active) return false;
  return active.weaponId === 'freeze' || active.weaponId === 'zoomghost';
}

/**
 * Renvoie true si l'effet Tornade est actuellement actif sur le joueur.
 * Utilisé pour appliquer la rotation CSS sur ZoomPanImage.
 */
export function isTornadoActive(
  events: BeatEikichiWeaponEvent[],
  myPlayerId: string | null,
  questionIndex: number,
  nowMs: number,
): boolean {
  const active = computeActiveEffect(events, myPlayerId, questionIndex, nowMs);
  return active?.weaponId === 'tornado';
}
