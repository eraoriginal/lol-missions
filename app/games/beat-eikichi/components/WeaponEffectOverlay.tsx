'use client';

import { useEffect, useMemo, useState } from 'react';
import type { BeatEikichiWeaponEvent } from '@/app/types/room';
import { getWeapon } from '@/lib/beatEikichi/weapons';
import { AC, AC_FONT_DISPLAY_HEAVY, AC_FONT_MONO } from '@/app/components/arcane';

interface WeaponEffectOverlayProps {
  events: BeatEikichiWeaponEvent[];
  myPlayerId: string | null;
  currentQuestionIndex: number;
  imageUrl: string;
  /** Horodatage (ISO) du début de la question courante. Utilisé par les armes
   * dont l'animation dépend du temps écoulé (ex. Acide qui grandit avec le timer). */
  questionStartedAt?: string | Date | null;
  /** Durée totale du timer de la question (secondes). Pour les armes dont la
   * vitesse dépend du temps disponible (ex. Acide couvre tout à T-5s). */
  timerSeconds?: number;
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
  questionStartedAt,
  timerSeconds,
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
      {activeEffect.weaponId === 'c4' && <C4Overlay />}
      {activeEffect.weaponId === 'blade' && (
        <BladeOverlay key={activeEffect.eventId} />
      )}
      {activeEffect.weaponId === 'freeze' && (
        <FreezeOverlay key={activeEffect.eventId} imageUrl={imageUrl} />
      )}
      {activeEffect.weaponId === 'zoomghost' && <ZoomGhostOverlay />}
      {activeEffect.weaponId === 'tornado' && <TornadoOverlay />}
      {activeEffect.weaponId === 'puzzle' && (
        <PuzzleOverlay key={activeEffect.eventId} imageUrl={imageUrl} />
      )}
      {activeEffect.weaponId === 'speed' && (
        <SpeedOverlay imageUrl={imageUrl} />
      )}
      {activeEffect.weaponId === 'tag' && <TagOverlay />}
      {activeEffect.weaponId === 'glitch' && <GlitchOverlay imageUrl={imageUrl} />}
      {activeEffect.weaponId === 'acid' && (
        <AcidOverlay
          key={activeEffect.eventId}
          questionStartedAt={questionStartedAt ?? null}
          timerSeconds={timerSeconds}
          now={now}
        />
      )}
      {activeEffect.weaponId === 'strobe' && <StrobeOverlay />}
    </>
  );
}

/* --- FUMIGÈNE · V1 PAINT CURTAIN --------------------------------- */

/**
 * Coulures de peinture liquides qui descendent depuis le haut (7 "drips"
 * lissés par le filtre `#ac-goo`), puis un wash bone/bone2 qui couvre
 * progressivement l'image, plus un grain de papier + tag "FUMIGÈNE".
 * État final : image couverte par le wash. Play-once avec fill: both.
 */
const SMOKE_DRIPS: Array<{ x: number; w: number; delay: number; dur: number }> = [
  { x: 4, w: 34, delay: 0, dur: 2.2 },
  { x: 18, w: 26, delay: 0.3, dur: 2.5 },
  { x: 32, w: 40, delay: 0.1, dur: 2.0 },
  { x: 50, w: 32, delay: 0.5, dur: 2.3 },
  { x: 66, w: 28, delay: 0.2, dur: 2.4 },
  { x: 78, w: 36, delay: 0.4, dur: 2.1 },
  { x: 90, w: 26, delay: 0.15, dur: 2.6 },
];

function SmokeOverlay() {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      <svg
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        <g filter="url(#ac-goo)" fill={AC.bone2}>
          {SMOKE_DRIPS.map((d, i) => (
            <g
              key={i}
              className="bek-fx-smoke-drip"
              style={{
                animationDelay: `${d.delay}s`,
                animationDuration: `${d.dur}s`,
              }}
            >
              <rect x={d.x} y={-10} width={d.w / 4} height={10} />
              <circle cx={d.x + d.w / 8} cy={0} r={d.w / 8} />
            </g>
          ))}
        </g>
      </svg>
      <div
        className="bek-fx-smoke-wash"
        style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(ellipse at 20% 30%, ${AC.bone} 0%, transparent 40%),
            radial-gradient(ellipse at 70% 60%, ${AC.bone2} 0%, transparent 45%),
            radial-gradient(ellipse at 50% 80%, ${AC.bone} 0%, transparent 40%),
            ${AC.bone2}
          `,
          filter: 'url(#ac-paint-spread)',
        }}
      />
      <div
        className="bek-fx-smoke-wash"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(13,11,8,0.18) 1px, transparent 1px)',
          backgroundSize: '4px 4px',
        }}
      />
      <div
        className="bek-fx-smoke-tag"
        style={{
          position: 'absolute',
          left: '50%',
          top: '52%',
          transform: 'translate(-50%, -50%) rotate(-4deg)',
        }}
      >
        <span
          style={{
            fontFamily: AC_FONT_DISPLAY_HEAVY,
            fontWeight: 800,
            fontSize: 'clamp(28px, 5vw, 52px)',
            color: AC.ink,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            filter: 'url(#ac-paint-text)',
          }}
        >
          FUMIGÈNE
        </span>
      </div>
    </div>
  );
}

/* --- C4 · V3 GRAFFITI RAID --------------------------------------- */

/**
 * 7 graffiti tags (X, étoile, zigzag) s'écrasent en cascade sur l'image, puis
 * un stencil géant "BOOM" claque au centre. Le cadre tremble pendant 1.8s.
 * 100% CSS, pas de vidéo. État final : BOOM visible + tags persistants.
 */
const C4_TAGS: Array<{
  type: 'x' | 'star' | 'zigzag';
  x: number;
  y: number;
  size: number;
  color: string;
  rot: number;
  delay: number;
  filled?: boolean;
}> = [
  { type: 'x', x: 18, y: 20, size: 180, color: AC.rust, rot: -12, delay: 0.05 },
  { type: 'star', x: 78, y: 18, size: 210, color: AC.shimmer, rot: 8, delay: 0.25, filled: true },
  { type: 'zigzag', x: 50, y: 30, size: 420, color: AC.gold, rot: -4, delay: 0.4 },
  { type: 'x', x: 82, y: 70, size: 230, color: AC.rust, rot: 14, delay: 0.6 },
  { type: 'star', x: 22, y: 74, size: 180, color: AC.chem, rot: -8, delay: 0.75 },
  { type: 'zigzag', x: 50, y: 80, size: 390, color: AC.shimmer, rot: 6, delay: 0.9 },
  { type: 'x', x: 50, y: 50, size: 360, color: AC.shimmer, rot: -5, delay: 1.1 },
];

function C4Overlay() {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      <div className="bek-fx-c4-shake absolute inset-0">
        {C4_TAGS.map((t, i) => (
          <div
            key={i}
            className="bek-fx-c4-slam"
            style={{
              position: 'absolute',
              left: `${t.x}%`,
              top: `${t.y}%`,
              transform: `translate(-50%, -50%) rotate(${t.rot}deg)`,
              animationDelay: `${t.delay}s`,
              ['--r' as string]: `${t.rot}deg`,
            }}
          >
            {t.type === 'x' && <CrossTag color={t.color} size={t.size} />}
            {t.type === 'star' && (
              <StarTag color={t.color} size={t.size} filled={t.filled} />
            )}
            {t.type === 'zigzag' && <ZigzagTag color={t.color} size={t.size} />}
          </div>
        ))}
        <div
          className="bek-fx-c4-boom"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) rotate(-4deg)',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '20px 56px',
              background: AC.ink,
              border: `8px solid ${AC.shimmer}`,
            }}
          >
            <span
              style={{
                fontFamily: AC_FONT_DISPLAY_HEAVY,
                fontWeight: 800,
                fontSize: 'clamp(110px, 22vw, 240px)',
                color: AC.shimmer,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                filter: 'url(#ac-paint-text-heavy)',
              }}
            >
              BOOM
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Glyphs graffiti dessinés en SVG pour C4. Reprend le langage des AcCrossTag /
   AcStar / AcZigzag des maquettes Arcane.kit — simplifiés pour rester autonomes. */
function CrossTag({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <g
        stroke={color}
        strokeWidth={8}
        strokeLinecap="round"
        fill="none"
        filter="url(#ac-rougher)"
      >
        <line x1="8" y1="8" x2="32" y2="32" />
        <line x1="32" y1="8" x2="8" y2="32" />
      </g>
    </svg>
  );
}

function StarTag({
  color,
  size,
  filled,
}: {
  color: string;
  size: number;
  filled?: boolean;
}) {
  const points =
    '20,4 24,15 36,15 26,22 30,34 20,27 10,34 14,22 4,15 16,15';
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <polygon
        points={points}
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={5}
        strokeLinejoin="round"
        filter="url(#ac-rougher)"
      />
    </svg>
  );
}

function ZigzagTag({ color, size }: { color: string; size: number }) {
  return (
    <svg width={size} height={size / 3} viewBox="0 0 120 40" aria-hidden>
      <polyline
        points="4,36 20,4 36,36 52,4 68,36 84,4 100,36 116,4"
        stroke={color}
        strokeWidth={6}
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
        filter="url(#ac-rougher)"
      />
    </svg>
  );
}

/* --- SABRE · V3 MULTI-SLASH -------------------------------------- */

/**
 * 3 slashs diagonaux tracés en shimmer (delays 0 / 0.2 / 0.45s) → révèlent 3
 * triangles d'encre qui couvrent 3 zones de l'image. Un badge "×3" apparaît
 * en bas à droite. État final : triangles visibles, image partiellement
 * masquée. `imageUrl` ignorée — plus besoin du fallback image.
 */
function BladeOverlay() {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      <div
        className="bek-fx-blade-ink"
        style={{
          position: 'absolute',
          inset: 0,
          background: AC.ink,
          clipPath: 'polygon(0 0, 65% 0, 0 100%)',
        }}
      />
      <div
        className="bek-fx-blade-ink"
        style={{
          position: 'absolute',
          inset: 0,
          background: AC.ink,
          clipPath: 'polygon(100% 0, 100% 75%, 35% 0)',
          animationDelay: '0.25s',
        }}
      />
      <div
        className="bek-fx-blade-ink"
        style={{
          position: 'absolute',
          inset: 0,
          background: AC.ink,
          clipPath: 'polygon(100% 100%, 0 100%, 100% 25%)',
          animationDelay: '0.5s',
        }}
      />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
        aria-hidden
      >
        <g filter="url(#ac-paint-spread)">
          <path
            d="M 0 100 L 60 0"
            className="bek-fx-blade-stroke"
            stroke={AC.shimmer}
            strokeWidth={2}
            fill="none"
          />
          <path
            d="M 40 0 L 100 70"
            className="bek-fx-blade-stroke"
            stroke={AC.shimmer}
            strokeWidth={2}
            fill="none"
            style={{ animationDelay: '0.2s' }}
          />
          <path
            d="M 110 30 L -10 110"
            className="bek-fx-blade-stroke"
            stroke={AC.shimmer}
            strokeWidth={2}
            fill="none"
            style={{ animationDelay: '0.45s' }}
          />
        </g>
      </svg>
      <div
        className="bek-fx-blade-badge"
        style={{
          position: 'absolute',
          right: '10%',
          bottom: '15%',
          fontFamily: AC_FONT_DISPLAY_HEAVY,
          fontSize: 'clamp(28px, 5vw, 52px)',
          fontWeight: 800,
          color: AC.shimmer,
          letterSpacing: '-0.02em',
          textTransform: 'uppercase',
          filter: 'url(#ac-paint-text-heavy)',
          transform: 'rotate(-6deg)',
          WebkitTextStroke: `2px ${AC.ink}`,
        }}
      >
        ×3
      </div>
    </div>
  );
}

/* --- GEL · V3 SHATTER -------------------------------------------- */

/**
 * L'image se fige sous une teinte bleue (hex), puis se casse en 5 "shards"
 * (polygones clip-path) qui dérivent dans des directions opposées. Craquelures
 * + stamp "// CRACKED". Zoom désactivé (identique à l'ancien comportement).
 *
 * Le découpage préserve l'image : chaque shard affiche la même image via
 * `background-image` + `clip-path`, décalée via --tx/--ty/--r.
 */
const FREEZE_SHARDS: Array<{
  clip: string;
  tx: string;
  ty: string;
  r: string;
  delay: number;
}> = [
  { clip: 'polygon(0 0, 50% 0, 40% 50%, 0 60%)', tx: '-14%', ty: '-8%', r: '-6deg', delay: 0 },
  { clip: 'polygon(50% 0, 100% 0, 100% 45%, 60% 55%, 40% 50%)', tx: '16%', ty: '-6%', r: '4deg', delay: 0.1 },
  { clip: 'polygon(0 60%, 40% 50%, 35% 100%, 0 100%)', tx: '-12%', ty: '10%', r: '6deg', delay: 0.2 },
  { clip: 'polygon(40% 50%, 60% 55%, 70% 100%, 35% 100%)', tx: '0%', ty: '14%', r: '-2deg', delay: 0.15 },
  { clip: 'polygon(60% 55%, 100% 45%, 100% 100%, 70% 100%)', tx: '14%', ty: '10%', r: '5deg', delay: 0.25 },
];

function FreezeOverlay({ imageUrl }: { imageUrl?: string }) {
  const bg = imageUrl ? `url("${imageUrl}") center/cover no-repeat` : 'transparent';
  return (
    <>
      <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
        {/* Fond ink opaque : masque complètement l'image d'origine, seuls les
            shards (au-dessus) révèlent des portions de l'image. */}
        <div
          className="bek-fx-freeze-tint"
          style={{
            position: 'absolute',
            inset: 0,
            background: AC.ink,
          }}
        />
        {/* Léger voile bleuté par-dessus le fond, pour la teinte « glace » sur
            les zones sans shard. */}
        <div
          className="bek-fx-freeze-tint"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(94,184,255,0.22)',
          }}
        />
        {FREEZE_SHARDS.map((s, i) => (
          <div
            key={i}
            className="bek-fx-freeze-shard"
            style={{
              position: 'absolute',
              inset: 0,
              background: bg,
              clipPath: s.clip,
              animationDelay: `${s.delay}s`,
              boxShadow: `0 0 0 0.5px ${AC.bone}`,
              ['--tx' as string]: s.tx,
              ['--ty' as string]: s.ty,
              ['--r' as string]: s.r,
            }}
          />
        ))}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
          aria-hidden
        >
          <g
            stroke={AC.bone}
            strokeWidth={0.5}
            fill="none"
            className="bek-fx-freeze-cracks"
            filter="url(#ac-rough)"
          >
            <path d="M 50 0 L 40 50 L 0 60" />
            <path d="M 50 0 L 60 55 L 100 45" />
            <path d="M 40 50 L 35 100" />
            <path d="M 60 55 L 70 100" />
          </g>
        </svg>
        <div
          className="bek-fx-freeze-tag"
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%) rotate(-3deg)',
          }}
        >
          <span
            style={{
              fontFamily: AC_FONT_DISPLAY_HEAVY,
              fontSize: 'clamp(20px, 3.5vw, 32px)',
              fontWeight: 800,
              color: AC.hex,
              background: AC.ink,
              padding: '4px 12px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              border: `2px solid ${AC.hex}`,
            }}
          >
            {'// CRACKED'}
          </span>
        </div>
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

/* --- ZOOM PARASITE · V1 SPOTLIGHT -------------------------------- */

/**
 * Un voile bone2 couvre toute l'image, sauf un trou circulaire (la "lentille")
 * qui se balade aléatoirement. Le joueur n'entrevoit qu'une petite zone à la
 * fois. Loop infinie. Zoom manuel bloqué pour empêcher de contourner.
 * `imageUrl` ignorée — le voile est opaque, pas besoin de montrer le contenu.
 */
function ZoomGhostOverlay() {
  return (
    <>
      <div
        className="absolute inset-0 z-20 pointer-events-none overflow-hidden"
        aria-hidden
      >
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
          }}
        >
          <defs>
            <mask id="bek-fx-zoom-mask">
              <rect x="0" y="0" width="100" height="100" fill="white" />
              <g className="bek-fx-zoom-roam">
                <circle cx="50" cy="50" r="16" fill="black" />
              </g>
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100"
            height="100"
            fill={AC.bone2}
            opacity={1}
            mask="url(#bek-fx-zoom-mask)"
            filter="url(#ac-paint-spread)"
          />
          <g className="bek-fx-zoom-roam">
            <circle
              cx="50"
              cy="50"
              r="16"
              fill="none"
              stroke={AC.shimmer}
              strokeWidth={1.2}
              filter="url(#ac-rougher)"
            />
            <line x1="50" y1="34" x2="50" y2="66" stroke={AC.shimmer} strokeWidth={0.4} />
            <line x1="34" y1="50" x2="66" y2="50" stroke={AC.shimmer} strokeWidth={0.4} />
          </g>
        </svg>
      </div>
      {/* Bloque le zoom manuel. */}
      <div
        className="absolute inset-0 z-25 cursor-not-allowed"
        style={{ pointerEvents: 'auto' }}
      />
    </>
  );
}

/* --- TORNADE · V3 CYCLONE PULL ----------------------------------- */

/**
 * L'image elle-même tourne + rétrécit vers un trou noir central (la rotation
 * est appliquée au container via `containerClassForEffect`). Par-dessus :
 * anneaux concentriques qui tournent, flèches spiralées en sweep continu,
 * trou central pulsant. Loop infinie 3.4s.
 */
function TornadoOverlay() {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      <svg
        viewBox="-50 -50 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
        aria-hidden
      >
        <g
          className="bek-fx-tornado-rings"
          stroke={AC.shimmer}
          strokeWidth={0.4}
          fill="none"
          filter="url(#ac-rough)"
        >
          {[8, 16, 24, 32, 40].map((r, i) => (
            <circle
              key={i}
              cx={0}
              cy={0}
              r={r}
              strokeDasharray={`${4 + i}`}
              opacity={0.5 + i * 0.1}
            />
          ))}
        </g>
      </svg>
      <svg
        viewBox="-50 -50 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
        aria-hidden
      >
        <g className="bek-fx-tornado-sweep" filter="url(#ac-goo)" fill={AC.rust}>
          {[0, 72, 144, 216, 288].map((deg, i) => (
            <g key={i} transform={`rotate(${deg})`}>
              <path d="M 0 -38 L -2 -26 L 2 -26 Z" opacity={0.7} />
            </g>
          ))}
        </g>
      </svg>
      <div
        className="bek-fx-tornado-hole"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: AC.ink,
          boxShadow: `0 0 14px 4px ${AC.ink}`,
        }}
      />
    </div>
  );
}

/* --- PUZZLE BREAK · V3 POP-OUT ----------------------------------- */

/**
 * 9 tuiles de l'image pop out en séquence (animation-delay échelonné) →
 * révèle des fonds ink avec des "?" shimmer. Une fois pop out, restent
 * invisibles. Play-once, état final : grille de "?" visible.
 */
const PUZZLE_ORDER = [0, 3, 6, 1, 4, 7, 2, 5, 8]; // ordre d'apparition = colonnes
// Espacement entre deux pop successifs. L'animation elle-même dure 0.8s (voir
// `.bek-fx-puzzle-tile` dans globals.css) → avec 0.5s de stagger, chaque tuile
// finit son pop avant que la suivante ne commence → effet « une par une » net.
const PUZZLE_STAGGER_S = 0.5;

function PuzzleOverlay({ imageUrl }: { imageUrl: string }) {
  const bg = `url("${imageUrl}") center/cover no-repeat`;
  // Indice de la tuile actuellement retournée (dévoile l'image) ; une seule à
  // la fois. Reset naturellement quand le parent remonte via key={eventId}.
  const [flipped, setFlipped] = useState<number | null>(null);

  return (
    <div
      className="absolute inset-0 z-20 overflow-hidden"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: 2,
        perspective: '1000px',
      }}
    >
      {Array.from({ length: 9 }, (_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const popDelay = PUZZLE_ORDER.indexOf(i) * PUZZLE_STAGGER_S;
        const isFlipped = flipped === i;
        return (
          <div
            key={i}
            style={{ position: 'relative', overflow: 'visible' }}
          >
            {/* Carte flippable : face = « ? » sur fond ink, dos = crop image.
                Toggle rotateY sur click. Sous la tuile pop-out pendant l'anim
                (sa scale(0) ouvre la possibilité d'interagir ensuite). */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setFlipped((f) => (f === i ? null : i));
              }}
              onMouseDown={(e) => e.stopPropagation()}
              aria-label={isFlipped ? `Cacher pièce ${i + 1}` : `Révéler pièce ${i + 1}`}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'transparent',
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                transition: 'transform 0.45s ease',
              }}
            >
              {/* Face = « ? » */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: AC.ink,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: AC.shimmer,
                  fontFamily: AC_FONT_DISPLAY_HEAVY,
                  fontSize: 'clamp(18px, 4vw, 36px)',
                  fontWeight: 800,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  boxShadow: `inset 0 0 0 1px ${AC.bone2}`,
                }}
              >
                ?
              </div>
              {/* Dos = crop image correspondant à la position de la tuile */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: bg,
                  backgroundPosition: `${col * 50}% ${row * 50}%`,
                  backgroundSize: '300% 300%',
                  transform: 'rotateY(180deg)',
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  boxShadow: `inset 0 0 0 1px ${AC.bone2}`,
                }}
              />
            </button>
            {/* Pop-out initial : joue une fois, scale(0) à la fin → libère les
                clics vers la carte en dessous. `pointer-events: none` pour que
                pendant l'anim un clic pionçant traverse quand même. */}
            <div
              className="bek-fx-puzzle-tile"
              style={{
                position: 'absolute',
                inset: 0,
                background: bg,
                backgroundPosition: `${col * 50}% ${row * 50}%`,
                backgroundSize: '300% 300%',
                animationDelay: `${popDelay}s`,
                boxShadow: `inset 0 0 0 1px ${AC.bone2}`,
                pointerEvents: 'none',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* --- SPEED · V1 CONVEYOR BLUR ------------------------------------ */

/**
 * L'image défile à toute vitesse (2 copies côte-à-côte qui translate en
 * boucle → seamless). Flou léger + lignes de vitesse shimmer dashées en
 * overlay + chevrons dorés pulsants à droite. Loop infini.
 */
function SpeedOverlay({ imageUrl }: { imageUrl: string }) {
  const bg = `url("${imageUrl}") center/cover no-repeat`;
  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      <div
        className="bek-fx-speed-scroll"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          width: '200%',
          filter: 'blur(1.5px)',
        }}
      >
        <div style={{ flex: 1, background: bg }} />
        <div style={{ flex: 1, background: bg }} />
      </div>
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
        aria-hidden
      >
        <g
          stroke={AC.shimmer}
          strokeWidth={0.5}
          fill="none"
          filter="url(#ac-paint-spread)"
        >
          {Array.from({ length: 14 }, (_, i) => (
            <line
              key={i}
              x1={0}
              y1={8 + i * 7}
              x2={100}
              y2={8 + i * 7}
              strokeDasharray={`${20 + (i % 5) * 8} ${10 + (i % 3) * 5}`}
              opacity={0.5 + (i % 3) * 0.15}
            />
          ))}
        </g>
      </svg>
      <div
        className="bek-fx-speed-chev"
        style={{
          position: 'absolute',
          right: '8%',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        <svg width={56} height={36} viewBox="0 0 44 28" aria-hidden>
          <g
            stroke={AC.gold}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            filter="url(#ac-rougher)"
          >
            <polyline points="2,4 14,14 2,24" />
            <polyline points="16,4 28,14 16,24" />
            <polyline points="30,4 42,14 30,24" />
          </g>
        </svg>
      </div>
    </div>
  );
}

/* --- TAG AÉROSOL · V2 SPRAY CLOUD ------------------------------- */

/**
 * 4 nuages aérosol opaques qui se posent en cascade (delays 0 / 0.25 / 0.5 /
 * 0.75s). Chaque nuage = grand cercle dense + satellites + splatters, le tout
 * lissé par le filtre `#ac-paint-spread`. Une stamp "TAG" apparaît au centre
 * après les nuages. Une fois posé, tout reste visible jusqu'à la fin de la
 * question (animation `both`, pas de loop).
 */
const TAG_CLOUDS: Array<{
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}> = [
  { x: 20, y: 25, size: 780, color: AC.shimmer, delay: 0.0 },
  { x: 75, y: 30, size: 760, color: AC.gold, delay: 0.25 },
  { x: 35, y: 70, size: 820, color: AC.rust, delay: 0.5 },
  { x: 80, y: 75, size: 700, color: AC.chem, delay: 0.75 },
];

function TagOverlay() {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      {TAG_CLOUDS.map((c, i) => (
        <div
          key={i}
          className="bek-fx-tag-cloud"
          style={{
            position: 'absolute',
            left: `${c.x}%`,
            top: `${c.y}%`,
            width: c.size,
            height: c.size * 0.75,
            transform: 'translate(-50%, -50%)',
            animationDelay: `${c.delay}s`,
          }}
        >
          <svg viewBox="0 0 200 150" style={{ width: '100%', height: '100%' }} aria-hidden>
            <g fill={c.color} filter="url(#ac-paint-spread)" opacity={1}>
              <circle cx="100" cy="75" r="50" />
              <circle cx="75" cy="60" r="30" />
              <circle cx="125" cy="60" r="30" />
              <circle cx="80" cy="95" r="28" />
              <circle cx="120" cy="95" r="28" />
              <circle cx="40" cy="40" r="4" opacity="0.7" />
              <circle cx="160" cy="30" r="3" opacity="0.7" />
              <circle cx="180" cy="80" r="5" opacity="0.7" />
              <circle cx="25" cy="80" r="4" opacity="0.7" />
              <circle cx="55" cy="120" r="3" opacity="0.6" />
              <circle cx="150" cy="130" r="4" opacity="0.6" />
              <circle cx="30" cy="110" r="2" opacity="0.5" />
              <circle cx="170" cy="115" r="3" opacity="0.6" />
              <circle cx="15" cy="55" r="2" opacity="0.5" />
              <circle cx="185" cy="50" r="2" opacity="0.5" />
            </g>
          </svg>
        </div>
      ))}
      <div
        className="bek-fx-tag-stamp"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) rotate(-4deg)',
        }}
      >
        <span
          style={{
            fontFamily: AC_FONT_DISPLAY_HEAVY,
            fontWeight: 800,
            fontSize: 'clamp(110px, 22vw, 240px)',
            color: AC.bone,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            filter: 'url(#ac-paint-text-heavy)',
            WebkitTextStroke: `5px ${AC.ink}`,
            textShadow: `8px 8px 0 ${AC.shimmer}`,
          }}
        >
          TAG
        </span>
      </div>
    </div>
  );
}

/* --- GLITCH · V3 DATAMOSH ---------------------------------------- */

/**
 * CRT/VHS interference : 2 copies de l'image teintées rouge/vert avec
 * chromatic aberration, 5 bandes qui "smearent" horizontalement, 5 blocs
 * corrompus colorés qui clignotent. Bouclé à l'infini (effet continu).
 *
 * Coût perf : 2 BG-image en `filter` + 5 smears en overflow:hidden. Testé
 * sur M1 laptop — stable à 60fps. Sur mobile bas de gamme ça peut limiter
 * à 30-40fps. Les `will-change` sur les transforms permettent au compositor
 * de promouvoir sur GPU.
 */
const GLITCH_SMEARS = [
  { y: 8, h: 10, d: 0 },
  { y: 24, h: 14, d: 0.3 },
  { y: 44, h: 8, d: 0.1 },
  { y: 58, h: 18, d: 0.5 },
  { y: 78, h: 12, d: 0.2 },
];

function GlitchOverlay({ imageUrl }: { imageUrl: string }) {
  const bg = `url("${imageUrl}") center/cover no-repeat`;
  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      {/* Deux copies teintées pour l'aberration chromatique RGB */}
      <div
        className="bek-fx-gli-r"
        style={{
          position: 'absolute',
          inset: 0,
          background: bg,
          filter: 'hue-rotate(310deg) saturate(2.5)',
          mixBlendMode: 'screen',
          opacity: 0.85,
        }}
      />
      <div
        className="bek-fx-gli-g"
        style={{
          position: 'absolute',
          inset: 0,
          background: bg,
          filter: 'hue-rotate(130deg) saturate(2.5)',
          mixBlendMode: 'screen',
          opacity: 0.85,
        }}
      />
      {/* Bandes smear — chaque bande révèle l'image floutée shiftée */}
      {GLITCH_SMEARS.map((s, i) => (
        <div
          key={i}
          className="bek-fx-gli-smear"
          style={{
            position: 'absolute',
            left: 0,
            top: `${s.y}%`,
            width: '100%',
            height: `${s.h}%`,
            overflow: 'hidden',
            animationDelay: `${s.d}s`,
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: `-${(s.y * 100) / s.h}%`,
              width: '100%',
              height: `${(100 * 100) / s.h}%`,
              background: bg,
              filter: 'blur(1.5px)',
            }}
          />
        </div>
      ))}
      {/* Blocs de corruption qui clignotent */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
        aria-hidden
      >
        <g className="bek-fx-gli-blocks">
          <rect x="10" y="20" width="12" height="4" fill={AC.shimmer} opacity="0.9" />
          <rect x="60" y="12" width="18" height="3" fill={AC.chem} opacity="0.9" />
          <rect x="30" y="52" width="8" height="5" fill={AC.gold} opacity="0.9" />
          <rect x="70" y="68" width="14" height="3" fill={AC.rust} opacity="0.9" />
          <rect x="40" y="82" width="16" height="4" fill={AC.shimmer} opacity="0.9" />
        </g>
      </svg>
      {/* Tag // MOSH en bas à droite */}
      <div
        style={{
          position: 'absolute',
          right: 14,
          bottom: 14,
        }}
      >
        <span
          style={{
            fontFamily: AC_FONT_MONO,
            fontSize: 10,
            letterSpacing: '0.3em',
            color: AC.ink,
            background: AC.shimmer,
            padding: '4px 8px',
            textTransform: 'uppercase',
          }}
        >
          {'// MOSH'}
        </span>
      </div>
    </div>
  );
}

/* --- ACIDE · V1 CORROSION ---------------------------------------- */

/**
 * 5 trous d'encre qui apparaissent en cascade sur l'image, cerclés d'un halo
 * chem (#12D6A8), avec une rigole noire qui coule vers le bas. Une fois posés,
 * ils restent jusqu'à la fin de la question.
 */
/** Tâche d'acide progressive : démarre petite au centre et grandit jusqu'à
 *  couvrir toute l'image, vitesse indexée sur le timer de la question.
 *
 *  Profil temporel :
 *    t = 0           → rayon minimal (≈8 % de l'image, petite goutte)
 *    t = timer - 5s  → couverture totale (rayon suffisant pour déborder)
 *    t > timer - 5s  → reste à couverture max
 *
 *  Le rayon est piloté par `scale()` sur un blob SVG rendu via `#ac-goo` pour
 *  lisser les bords en forme organique. Quelques bulles chem flottent autour
 *  pour donner vie à l'effet.
 *
 *  Fallback si timer/questionStartedAt absents : profil fixe de 20s.
 */
function AcidOverlay({
  questionStartedAt,
  timerSeconds,
  now,
}: {
  questionStartedAt: string | Date | null;
  timerSeconds?: number;
  now: number;
}) {
  const startedMs = questionStartedAt
    ? new Date(questionStartedAt).getTime()
    : now;
  const elapsedMs = Math.max(0, now - startedMs);
  // Fin d'expansion : 5 s avant la fin du timer. Si timer absent → 20 s.
  const fullCoverMs =
    (timerSeconds && timerSeconds > 5 ? timerSeconds - 5 : 20) * 1000;
  const progress = Math.min(1, elapsedMs / fullCoverMs);

  // Rayon en % de la dimension principale (le SVG est 0..100). À 0 : petite
  // goutte (r=6). À 1 : large (r=90) → le goo filter bouche tout.
  const MIN_R = 6;
  const MAX_R = 90;
  // Easing léger (ease-in) pour que le démarrage soit perceptiblement lent puis
  // accélère à mesure que le timer se consume.
  const eased = progress * progress * (3 - 2 * progress); // smoothstep
  const radius = MIN_R + (MAX_R - MIN_R) * eased;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        aria-hidden
      >
        <g filter="url(#ac-goo)">
          {/* Halo chem qui entoure la tâche */}
          <circle cx={50} cy={50} r={radius + 3} fill={AC.chem} opacity={0.5} />
          {/* Blob principal d'encre noire (le "trou" d'acide) */}
          <circle cx={50} cy={50} r={radius} fill={AC.ink} />
          {/* Satellites pour casser la forme parfaitement ronde — positionnés
              relativement au rayon courant. */}
          <circle
            cx={50 - radius * 0.65}
            cy={50 - radius * 0.3}
            r={radius * 0.35}
            fill={AC.ink}
          />
          <circle
            cx={50 + radius * 0.55}
            cy={50 + radius * 0.4}
            r={radius * 0.4}
            fill={AC.ink}
          />
          <circle
            cx={50 - radius * 0.2}
            cy={50 + radius * 0.7}
            r={radius * 0.28}
            fill={AC.ink}
          />
          <circle
            cx={50 + radius * 0.25}
            cy={50 - radius * 0.75}
            r={radius * 0.3}
            fill={AC.ink}
          />
        </g>
      </svg>
      {/* Bulles qui flottent autour du bord de la tâche — positions en
          coordonnées polaires relatives au rayon courant. */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        aria-hidden
      >
        <g fill={AC.chem}>
          {[0, 60, 120, 180, 240, 300].map((deg, i) => {
            const rad = (deg * Math.PI) / 180;
            const br = Math.min(48, radius + 2);
            const cx = 50 + Math.cos(rad) * br;
            const cy = 50 + Math.sin(rad) * br;
            return (
              <circle
                key={i}
                cx={cx}
                cy={cy}
                r={1.2 + (i % 3) * 0.4}
                opacity={0.35}
                className="bek-fx-acid-bubble"
                style={{ animationDelay: `${(i * 0.25) % 1.5}s` }}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}

/* --- STROBE · V1 NEON -------------------------------------------- */

/**
 * Flashs de couleur plein écran à ~12Hz (cycle shimmer/chem/gold/violet/hex
 * via steps). L'image reste lisible entre les flashs mais l'œil fatigue.
 * Un pulse central qui s'expand rapidement accentue le "rave".
 *
 * A11y : `prefers-reduced-motion` (cf. globals.css) remplace les flashs par
 * un voile rose fixe discret. TODO : ajouter un setting joueur explicite
 * "Réduire les flashs" + warning épilepsie au premier lancement (P2).
 */
function StrobeOverlay() {
  return (
    <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
      <div className="bek-fx-str-flash absolute inset-0" />
      <div
        className="bek-fx-str-pulse"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          width: 40,
          height: 40,
          marginLeft: -20,
          marginTop: -20,
          borderRadius: '50%',
          border: `4px solid ${AC.shimmer}`,
          filter: 'url(#ac-rougher)',
        }}
      />
      <div
        className="bek-fx-str-tag"
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        <span
          style={{
            fontFamily: AC_FONT_DISPLAY_HEAVY,
            fontWeight: 800,
            fontSize: 'clamp(32px, 6vw, 64px)',
            color: AC.bone,
            textTransform: 'uppercase',
            filter: 'url(#ac-paint-text-heavy)',
            WebkitTextStroke: `3px ${AC.ink}`,
          }}
        >
          RAVE
        </span>
      </div>
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
  if (active.weaponId === 'tornado') return 'bek-fx-tornado-pull';
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
