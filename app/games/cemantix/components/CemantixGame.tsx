'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SoloScreen } from '@/app/games/solo/SoloScreen';
import { usePersistedState } from '@/app/games/solo/usePersistedState';
import {
  AC,
  AcButton,
  AcGlyph,
} from '@/app/components/arcane';
import { tierLabel, type CemantixTier } from '@/lib/cemantix/shared';
import { dailyDateKey } from '@/lib/solo/dailyIndex';

/**
 * `La Cémantix d'Era` — UI redesign 2026-04-30 (cf. maquettes/Cemantix FX.html).
 *
 * **Variante visuelle retenue** : V02 « Liste peinte · gouttes goo ».
 *   - Feedback animé en haut pour le dernier essai (curseur balayant + barre
 *     remplie + verdict %).
 *   - Liste triée par similarité décroissante : taille du mot proportionnelle
 *     à la chaleur, barre peinte avec filtre `#ac-goo`, % et rang à droite.
 *
 * **Animation victoire retenue** : C « Confetti Blast · éclat graffiti ».
 *   - Flash gold sur l'input quand on trouve.
 *   - 80 confettis tirés du centre de l'input, gravity-driven via CSS keyframes
 *     paramétrées via vars CSS (`--cmx-dx/dy/spin`).
 *   - Ribbon « TROUVÉ EN N ESSAIS » qui se déroule.
 *   - Stamp du mot du jour qui apparaît avec scale-back-out.
 *
 * Persistance localStorage : key `cemantix_v2_<date>` (v2 = nouveau format
 * avec `similarity`). Joue l'animation une seule fois (flag `winAnimPlayed`).
 */

interface Attempt {
  word: string;
  rank: number;
  tier: CemantixTier;
  /** Cosine similarity dans [-1, 1] retournée par le serveur, ou null si rank>1000. */
  similarity: number | null;
  order: number;
}

interface SavedState {
  date: string;
  attempts: Attempt[];
  /** Mot du jour révélé par le serveur quand won. */
  target: string | null;
  /** Sens optionnel (« avocat (fruit) ») pour désambiguïser. */
  sense?: string | null;
  /** Indique si l'animation Confetti Blast a déjà été jouée. */
  winAnimPlayed?: boolean;
}

function normalizeForDedup(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9 -]/g, '');
}

/**
 * Convertit similarity → "heat" en [0, 1] pour le sizing/couleurs de la
 * barre. Les similarities négatives (mots sémantiquement opposés à la cible)
 * sont clampées à 0 — la barre reste vide. Pour distinguer « inconnu » d'une
 * « température négative explicite », utiliser `isFreezing(sim)`.
 */
function similarityToHeat(sim: number | null): number {
  if (sim === null || !Number.isFinite(sim)) return 0;
  return Math.max(0, Math.min(1, sim));
}

/** Vrai si la similarity est négative (mot sémantiquement opposé). */
function isFreezing(sim: number | null): boolean {
  return sim !== null && Number.isFinite(sim) && sim < 0;
}

/** Formate la similarity en degré affiché (peut être négatif). */
function formatTemp(sim: number | null): string {
  if (sim === null || !Number.isFinite(sim)) return '—';
  const pct = sim * 100;
  return `${pct >= 0 ? '' : '−'}${Math.abs(pct).toFixed(1)}°`;
}

/** Tier sémantique fin (7 paliers visuels) — synchro avec les maquettes V02. */
function cmxTier(heat: number): {
  key: string;
  label: string;
  color: string;
  accent: string;
  icon: string;
} {
  if (heat >= 0.95) return { key: 'incandescent', label: 'INCANDESCENT', color: AC.rust, accent: AC.gold, icon: '🔥' };
  if (heat >= 0.85) return { key: 'brulant', label: 'BRÛLANT', color: AC.gold, accent: AC.shimmer, icon: '🔥' };
  if (heat >= 0.7) return { key: 'chaud', label: 'CHAUD', color: AC.shimmer, accent: AC.gold, icon: '♨' };
  if (heat >= 0.55) return { key: 'tiede', label: 'TIÈDE', color: AC.violet, accent: AC.shimmer, icon: '~' };
  if (heat >= 0.35) return { key: 'frais', label: 'FRAIS', color: AC.hex, accent: AC.bone2, icon: '·' };
  if (heat >= 0.15) return { key: 'froid', label: 'FROID', color: AC.chem, accent: AC.bone2, icon: '❄' };
  return { key: 'glace', label: 'GLACÉ', color: '#7CC9F2', accent: AC.bone2, icon: '❅' };
}

/** Lerp entre 2 hex colors, p ∈ [0, 1]. */
function lerpHex(h1: string, h2: string, p: number): string {
  const a = Number.parseInt(h1.slice(1), 16);
  const b = Number.parseInt(h2.slice(1), 16);
  const r1 = (a >> 16) & 255;
  const g1 = (a >> 8) & 255;
  const b1 = a & 255;
  const r2 = (b >> 16) & 255;
  const g2 = (b >> 8) & 255;
  const bb2 = b & 255;
  const r = Math.round(r1 + (r2 - r1) * p);
  const g = Math.round(g1 + (g2 - g1) * p);
  const bb = Math.round(b1 + (bb2 - b1) * p);
  return '#' + [r, g, bb].map((x) => x.toString(16).padStart(2, '0')).join('');
}

/** Couleur continue glacé→incandescent. */
function cmxHeatColor(heat: number): string {
  const stops: [number, string][] = [
    [0.0, '#7CC9F2'],
    [0.2, AC.hex],
    [0.45, AC.violet],
    [0.7, AC.shimmer],
    [0.88, AC.gold],
    [1.0, AC.rust],
  ];
  const t = Math.max(0, Math.min(1, heat));
  for (let i = 0; i < stops.length - 1; i++) {
    const [a, ca] = stops[i];
    const [b, cb] = stops[i + 1];
    if (t >= a && t <= b) {
      return lerpHex(ca, cb, (t - a) / (b - a));
    }
  }
  return AC.shimmer;
}

interface CemantixGameProps {
  /**
   * Cible d'hier (UTC), fournie par la page server-side. `null` si pas
   * encore de puzzle pour cette date (cron pas lancé ou très première
   * session après déploiement).
   */
  yesterday?: {
    puzzleDate: string;
    word: string;
    sense: string | null;
  } | null;
}

export function CemantixGame({ yesterday = null }: CemantixGameProps = {}) {
  const today = dailyDateKey();
  const storageKey = `cemantix_v2_${today}`;

  const defaultState = useMemo<SavedState>(
    () => ({ date: today, attempts: [], target: null, sense: null, winAnimPlayed: false }),
    [today],
  );
  const [saved, setSaved] = usePersistedState<SavedState>(
    storageKey,
    defaultState,
  );
  const attempts = useMemo(
    () => (saved.date === today ? saved.attempts : []),
    [saved, today],
  );
  const target = saved.date === today ? saved.target : null;
  const sense = saved.date === today ? saved.sense ?? null : null;
  const winAnimPlayed = saved.date === today ? saved.winAnimPlayed === true : false;

  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const won = target !== null && attempts.some((a) => a.rank === 0);

  // Trigger animation seulement à la PREMIÈRE win (jamais au refresh).
  const [animActive, setAnimActive] = useState(false);
  useEffect(() => {
    if (won && !winAnimPlayed && !animActive) {
      setAnimActive(true);
      // Marque comme jouée après 6.5s (durée totale de l'animation).
      const t = setTimeout(() => {
        setSaved({ ...saved, winAnimPlayed: true });
      }, 6500);
      return () => clearTimeout(t);
    }
  }, [won, winAnimPlayed, animActive, saved, setSaved]);

  const submit = useCallback(async () => {
    if (won || submitting) return;
    const norm = normalizeForDedup(input);
    if (!norm) return;
    if (attempts.some((a) => normalizeForDedup(a.word) === norm)) {
      setInput('');
      inputRef.current?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/solo/cemantix/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: input.trim() }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as {
        rank: number;
        tier: CemantixTier;
        similarity: number | null;
        won: boolean;
        target?: string;
        sense?: string | null;
      };
      const entry: Attempt = {
        word: norm,
        rank: data.rank,
        tier: data.tier,
        similarity: data.similarity,
        order: attempts.length + 1,
      };
      setSaved({
        date: today,
        attempts: [...attempts, entry],
        target: data.target ?? saved.target,
        sense: data.sense ?? saved.sense ?? null,
        winAnimPlayed: saved.winAnimPlayed === true,
      });
      setInput('');
    } finally {
      setSubmitting(false);
    }
  }, [attempts, input, saved.target, saved.sense, saved.winAnimPlayed, setSaved, submitting, today, won]);

  // Re-focus auto après chaque essai.
  useEffect(() => {
    if (submitting || won) return;
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [submitting, won, attempts.length]);

  // Liste triée par proximité (similarity / heat décroissante).
  // Sort par similarité décroissante. Les valeurs négatives (mots opposés)
  // apparaissent tout en bas — on n'utilise pas `similarityToHeat` qui
  // clampe à 0 et écraserait l'ordre des mots négatifs.
  const sorted = useMemo(() => {
    const simOf = (s: number | null) =>
      s === null || !Number.isFinite(s) ? -Infinity : s;
    return [...attempts].sort(
      (a, b) => simOf(b.similarity) - simOf(a.similarity),
    );
  }, [attempts]);

  const latestAttempt = attempts.length > 0 ? attempts[attempts.length - 1] : null;
  const bestHeat = sorted.length > 0 ? similarityToHeat(sorted[0].similarity) : 0;

  return (
    <SoloScreen title="LA CÉMANTIX D'ERA" accent={AC.shimmer}>
      {/* Stats : nombre d'essais + meilleur score */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 11,
            letterSpacing: '0.22em',
            color: AC.bone2,
            textTransform: 'uppercase',
          }}
        >
          {`// ${attempts.length} essai${attempts.length > 1 ? 's' : ''} · proximité sémantique`}
        </span>
        {sorted.length > 0 && !won && (
          <span
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 11,
              letterSpacing: '0.18em',
              color: AC.bone2,
              textTransform: 'uppercase',
            }}
          >
            {'// meilleur ▸ '}
            <span style={{ color: cmxHeatColor(bestHeat), fontWeight: 700 }}>
              {sorted[0].word.toUpperCase()} · {(bestHeat * 100).toFixed(1)}°
            </span>
          </span>
        )}
        {sense && (
          <span
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              letterSpacing: '0.18em',
              color: AC.gold,
              border: `1px dashed ${AC.gold}`,
              padding: '2px 8px',
              textTransform: 'uppercase',
            }}
          >
            sens : {sense}
          </span>
        )}
        {yesterday && (
          <span
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              letterSpacing: '0.22em',
              color: AC.bone2,
              border: `1px dashed ${AC.bone2}`,
              padding: '2px 8px',
              textTransform: 'uppercase',
              marginLeft: 'auto',
            }}
            title={
              yesterday.sense
                ? `Hier (${yesterday.puzzleDate}) — sens : ${yesterday.sense}`
                : `Hier — ${yesterday.puzzleDate}`
            }
          >
            {'// hier ▸ '}
            <span style={{ color: AC.gold, fontWeight: 700 }}>
              {yesterday.word.toUpperCase()}
            </span>
          </span>
        )}
      </div>

      {/* Input + bouton (peint, avec flash gold au win) */}
      {!won && (
        <CmxInput
          ref={inputRef}
          value={input}
          onChange={setInput}
          onSubmit={submit}
          submitting={submitting}
          flash={false}
        />
      )}

      {/* Feedback animé du dernier essai */}
      {!won && latestAttempt && (
        <CmxLatestFeedback
          // re-mount sur chaque nouveau guess pour rejouer l'animation
          key={latestAttempt.order}
          attempt={latestAttempt}
        />
      )}

      {/* Liste peinte triée — du plus chaud au plus froid */}
      {sorted.length > 0 && (
        <div
          style={{
            position: 'relative',
            background: 'rgba(13,11,8,0.55)',
            border: `1.5px solid ${AC.bone}`,
            padding: '6px 0',
          }}
        >
          {sorted.map((a, i) => (
            <PaintedRow
              key={a.order}
              attempt={a}
              index={i}
              total={sorted.length}
              isLatest={latestAttempt?.order === a.order}
              isLast={i === sorted.length - 1}
              dimmed={animActive}
            />
          ))}

          {/* Animation Confetti Blast en overlay sur la liste quand on gagne */}
          {won && animActive && target && (
            <ConfettiBlast
              target={target}
              total={attempts.length}
              onDone={() => {
                /* géré par le useEffect setTimeout */
              }}
            />
          )}
        </div>
      )}

      {/* Card de résumé final (après que l'animation se soit terminée) */}
      {won && winAnimPlayed && target && (
        <div
          className="mt-5"
          style={{
            position: 'relative',
            background: 'rgba(245,185,18,0.08)',
            border: `1.5px solid ${AC.gold}`,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 10,
                letterSpacing: '0.22em',
                color: AC.gold,
                textTransform: 'uppercase',
              }}
            >
              {'// trouvé en '}
              {attempts.length} essais
            </div>
            <div
              style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: 36,
                fontWeight: 900,
                color: AC.gold,
                textShadow: `2px 2px 0 ${AC.ink}`,
                letterSpacing: '-0.02em',
                textTransform: 'uppercase',
                lineHeight: 0.9,
                marginTop: 2,
              }}
            >
              {target}
            </div>
            {sense && (
              <div
                style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  color: AC.bone2,
                  marginTop: 4,
                }}
              >
                {'// sens : '}
                {sense}
              </div>
            )}
          </div>
        </div>
      )}
    </SoloScreen>
  );
}

// =============================================================================
// CmxInput — input peint (V02)
// =============================================================================

interface CmxInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  flash: boolean;
}
const CmxInput = function CmxInput({
  value,
  onChange,
  onSubmit,
  submitting,
  flash,
  ref,
}: CmxInputProps & { ref?: React.RefObject<HTMLInputElement | null> }) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        gap: 10,
        alignItems: 'stretch',
        marginBottom: 14,
      }}
    >
      <div
        className={flash ? 'cmx-input-flash' : ''}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(13,11,8,0.85)',
          border: `1.5px solid ${flash ? AC.gold : AC.bone}`,
          padding: '12px 16px',
          position: 'relative',
          animation: flash ? 'cmx-input-flash 0.6s ease-out forwards' : undefined,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 11,
            color: AC.shimmer,
            marginRight: 10,
            letterSpacing: '0.18em',
          }}
        >
          ▸
        </span>
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onSubmit();
          }}
          disabled={submitting}
          placeholder="Tape un mot et devine le mot du jour…"
          className="ac-input"
          autoFocus
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: AC.bone,
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 14,
            outline: 'none',
            letterSpacing: '0.04em',
          }}
        />
      </div>
      <AcButton
        variant="primary"
        size="md"
        onClick={onSubmit}
        disabled={!value.trim() || submitting}
        icon={<AcGlyph kind="arrowRight" color={AC.ink} size={12} />}
      >
        ENVOYER
      </AcButton>
    </div>
  );
};

// =============================================================================
// CmxLatestFeedback — barre animée + verdict pour le dernier essai
// =============================================================================

function CmxLatestFeedback({ attempt }: { attempt: Attempt }) {
  const heat = similarityToHeat(attempt.similarity);
  const freezing = isFreezing(attempt.similarity);
  // Pour les températures négatives, on force la couleur en cyan glacial
  // (pas de violet/shimmer interpolé qui n'aurait aucun sens).
  const color = freezing ? '#7CC9F2' : cmxHeatColor(heat);
  const tier = freezing
    ? { key: 'glace', label: 'GLACÉ', color, accent: AC.bone2, icon: '❅' }
    : cmxTier(heat);
  const wPct = heat * 100;
  // Durée de l'animation : ralentissement final lisible (le easeOutQuart
  // condense ~70% de l'avancée sur les 30 premiers % du temps).
  const animDur = '2.6s';
  const animEase = 'cubic-bezier(0.22, 1, 0.36, 1)';

  return (
    <div
      style={{
        // CSS var consommée par les keyframes `cmx-feedback-cursor` et la
        // largeur `width` du conteneur de fill — garantit que le curseur
        // s'arrête EXACTEMENT à la position de la chaleur, en synchro avec
        // la peinture qui se remplit. Pour les valeurs négatives (freezing),
        // on garde 0% : le curseur reste planqué à gauche, la barre vide.
        ['--cmx-final-pct' as string]: `${wPct}%`,
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'minmax(180px, auto) 1fr minmax(110px, auto)',
        alignItems: 'center',
        gap: 18,
        marginBottom: 16,
        background:
          'linear-gradient(90deg, rgba(13,11,8,0.85) 0%, rgba(13,11,8,0.55) 100%)',
        border: `1.5px solid ${color}`,
        padding: '14px 20px',
        boxShadow:
          heat >= 0.85
            ? `0 0 28px ${color}33, inset 0 0 0 1px rgba(245,185,18,0.12)`
            : freezing
            ? `0 0 20px rgba(124,201,242,0.18)`
            : 'none',
      }}
    >
      {/* Mot tapé — dans la couleur de la chaleur (rosé pour tiède, gold
          pour brûlant…), pas en bone neutre. */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 10,
            color: AC.bone2,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
          }}
        >
          {'// dernier essai · #'}
          {String(attempt.order).padStart(2, '0')}
        </div>
        <div
          style={{
            fontFamily: "'Barlow Condensed', 'Bebas Neue', sans-serif",
            fontSize: 'clamp(40px, 6vw, 56px)',
            fontWeight: 900,
            textTransform: 'uppercase',
            color,
            textShadow: `3px 3px 0 ${AC.ink}`,
            letterSpacing: '-0.02em',
            lineHeight: 0.85,
            animation: `cmx-feedback-word 1.4s ease-out forwards`,
          }}
        >
          {attempt.word}
        </div>
      </div>

      {/* Bande gradient + tier labels + curseur balayant */}
      <div style={{ position: 'relative', height: 38 }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 8,
            height: 22,
            background: `linear-gradient(90deg,
              #7CC9F2 0%,
              ${AC.hex} 18%,
              ${AC.violet} 40%,
              ${AC.shimmer} 62%,
              ${AC.gold} 84%,
              ${AC.rust} 100%)`,
            border: `1px solid ${AC.bone2}`,
            opacity: 0.32,
          }}
        />
        {/* Tier labels au-dessus de la barre — comme la maquette. */}
        {[
          { p: 0.15, l: 'FROID', c: AC.hex },
          { p: 0.35, l: 'FRAIS', c: AC.violet },
          { p: 0.55, l: 'TIÈDE', c: AC.shimmer },
          { p: 0.7, l: 'CHAUD', c: AC.shimmer },
          { p: 0.85, l: 'BRÛLANT', c: AC.gold },
        ].map((t) => (
          <div
            key={t.l}
            style={{
              position: 'absolute',
              left: `${t.p * 100}%`,
              top: 0,
              bottom: 0,
              width: 0,
              borderLeft: `1px dashed ${t.c}`,
              opacity: 0.5,
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: -2,
                left: 4,
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 8,
                color: t.c,
                letterSpacing: '0.15em',
                whiteSpace: 'nowrap',
                fontWeight: 700,
              }}
            >
              {t.l}
            </span>
          </div>
        ))}
        {/* Peinture remplie animée — width = wPct% pour que scaleX(0→1) la
            fasse pousser jusqu'à la position cible. */}
        <div
          className="cmx-feedback-fill"
          style={{
            position: 'absolute',
            left: 0,
            top: 8,
            height: 22,
            width: `${wPct}%`,
            overflow: 'visible',
            transformOrigin: 'left center',
            animation: `cmx-feedback-fill ${animDur} ${animEase} forwards`,
          }}
        >
          <svg
            viewBox={`0 0 ${Math.max(1, wPct)} 28`}
            preserveAspectRatio="none"
            style={{ position: 'absolute', inset: 0, width: '100%', height: 28, top: -3 }}
          >
            <g filter="url(#ac-goo)">
              <rect x="0" y="6" width={Math.max(0, wPct - 4)} height="16" fill={color} />
              {wPct > 4 && <circle cx={wPct} cy="14" r="6" fill={color} />}
              {wPct > 12 && <circle cx={wPct - 8} cy="22" r="3" fill={color} />}
            </g>
          </svg>
        </div>
        {/* Curseur balayant — s'arrête à `--cmx-final-pct` (cf. keyframe). */}
        <div
          className="cmx-feedback-cursor"
          style={{
            position: 'absolute',
            top: -4,
            left: 0,
            width: 2,
            height: 38,
            background: AC.bone,
            boxShadow: `0 0 12px ${color}, 0 0 22px ${color}`,
            animation: `cmx-feedback-cursor ${animDur} ${animEase} forwards`,
          }}
        />
      </div>

      {/* Verdict % + tier */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 4,
        }}
      >
        <div
          className="cmx-feedback-verdict"
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(28px, 5vw, 38px)',
            fontWeight: 900,
            color,
            textShadow: `2px 2px 0 ${AC.ink}`,
            letterSpacing: '-0.01em',
            lineHeight: 0.9,
            fontVariantNumeric: 'tabular-nums',
            animation: `cmx-feedback-verdict ${animDur} ease-out forwards`,
          }}
        >
          {formatTemp(attempt.similarity)}
        </div>
        <div
          className="cmx-feedback-verdict"
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 10,
            color: AC.ink,
            background: color,
            padding: '3px 10px',
            letterSpacing: '0.22em',
            fontWeight: 700,
            animation: `cmx-feedback-verdict ${animDur} ease-out forwards`,
          }}
        >
          {tier.label}
        </div>
        {attempt.rank > 0 && attempt.rank < 9999 && (
          <div
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              color: tier.accent,
              letterSpacing: '0.18em',
              border: `1px dashed ${tier.accent}`,
              padding: '1px 6px',
            }}
          >
            ▸ RANG {attempt.rank}
          </div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// PaintedRow — une ligne de la liste V02
// =============================================================================

function PaintedRow({
  attempt,
  index: _index,
  total,
  isLatest,
  isLast,
  dimmed,
}: {
  attempt: Attempt;
  index: number;
  total: number;
  isLatest: boolean;
  isLast: boolean;
  dimmed: boolean;
}) {
  const heat = similarityToHeat(attempt.similarity);
  const freezing = isFreezing(attempt.similarity);
  // Pour les températures négatives, force cyan glacial.
  const color = freezing ? '#7CC9F2' : cmxHeatColor(heat);
  const tier = freezing
    ? { key: 'glace', label: 'GLACÉ', color, accent: AC.bone2, icon: '❅' }
    : cmxTier(heat);
  const wPct = heat * 100;
  const isTarget = attempt.rank === 0;

  return (
    <div
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '52px minmax(160px, 1fr) minmax(180px, 2fr) 90px 80px 24px',
        alignItems: 'center',
        gap: 14,
        padding: '10px 18px',
        borderBottom: !isLast ? `1px dashed rgba(201,187,148,0.25)` : 'none',
        background: isLatest
          ? `linear-gradient(90deg, rgba(255,61,139,0.08) 0%, rgba(255,61,139,0) 60%)`
          : 'transparent',
        opacity: dimmed ? 0.18 : 1,
        transition: 'opacity 0.4s ease',
      }}
    >
      {/* Numéro de classement (decroissant : top = plus haut) */}
      <span
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 10,
          color: AC.bone2,
          letterSpacing: '0.2em',
        }}
      >
        #{String(total - _index).padStart(2, '0')}
      </span>

      {/* Mot — taille proportionnelle à la chaleur, couleur = chaleur (rosé
          pour tiède, gold pour brûlant, etc.). Pas de strikethrough sur les
          mots glacials : juste un léger blur + opacité réduite. */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, minWidth: 0 }}>
        <span
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 22 + Math.round(heat * 14),
            fontWeight: 800,
            textTransform: 'uppercase',
            color,
            textShadow:
              heat >= 0.85
                ? `2px 2px 0 ${AC.ink}, -1px 1px 0 ${color}, 0 0 24px ${color}`
                : `1px 1px 0 ${AC.ink}`,
            letterSpacing: '-0.01em',
            filter: heat < 0.2 ? 'blur(0.4px)' : 'none',
            opacity: heat < 0.15 ? 0.7 : 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {attempt.word}
        </span>
        {isLatest && !isTarget && (
          <span
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 8,
              color: AC.shimmer,
              letterSpacing: '0.2em',
              border: `1px solid ${AC.shimmer}`,
              padding: '1px 5px',
              flexShrink: 0,
            }}
          >
            NEW
          </span>
        )}
        {isTarget && (
          <span
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 9,
              color: AC.ink,
              background: AC.gold,
              letterSpacing: '0.2em',
              padding: '2px 6px',
              flexShrink: 0,
              fontWeight: 700,
            }}
          >
            ✓ MOT DU JOUR
          </span>
        )}
      </div>

      {/* Barre peinte goo */}
      <div
        style={{
          position: 'relative',
          height: 18,
          background: 'rgba(240,228,193,0.05)',
          border: `1px solid rgba(201,187,148,0.3)`,
          overflow: 'visible',
        }}
      >
        <svg
          viewBox="0 0 100 28"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: 28, top: -5 }}
        >
          <g filter="url(#ac-goo)" fill={color}>
            <rect x="0" y="6" width={Math.max(0, wPct - 4)} height="14" />
            {wPct > 4 && <circle cx={wPct} cy="13" r="6" />}
            {wPct > 12 && <circle cx={wPct - 8} cy="22" r="3" />}
            {wPct > 20 && <circle cx={wPct - 15} cy="6" r="2" />}
          </g>
        </svg>
      </div>

      {/* % similarité (peut être négatif pour les mots opposés) */}
      <span
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 13,
          color,
          letterSpacing: '0.06em',
          fontWeight: 700,
          textAlign: 'right',
        }}
      >
        {formatTemp(attempt.similarity)}
      </span>

      {/* Rang dans le top 1000 (ou —) */}
      <span
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 9,
          color: attempt.rank > 0 && attempt.rank < 9999 ? tier.accent : AC.bone2,
          letterSpacing: '0.18em',
          textAlign: 'right',
        }}
      >
        {attempt.rank > 0 && attempt.rank < 9999
          ? `▸${String(attempt.rank).padStart(4, ' ')}`
          : '—'}
      </span>

      {/* Glyphe tier */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 16,
          color,
        }}
      >
        {tier.icon}
      </span>
    </div>
  );
}

// =============================================================================
// ConfettiBlast — animation victoire
// =============================================================================

const CONFETTI_COLORS = [AC.shimmer, AC.gold, AC.violet, AC.chem, AC.rust, AC.bone];
const CONFETTI_SHAPES = ['rect', 'triangle', 'disc', 'x', 'star'] as const;
type ConfettiShape = (typeof CONFETTI_SHAPES)[number];

interface ConfettiPieceData {
  dx: number;
  dy: number;
  spin: number;
  color: string;
  shape: ConfettiShape;
  size: number;
}

function ConfettiBlast({
  target,
  total,
  onDone,
}: {
  target: string;
  total: number;
  onDone: () => void;
}) {
  // 80 confettis générés avec un PRNG déterministe pour stabilité visuelle
  // (pas de re-render cosmétique). Vitesse / angle / couleur / forme indexés.
  const pieces = useMemo<ConfettiPieceData[]>(() => {
    const arr: ConfettiPieceData[] = [];
    for (let i = 0; i < 80; i++) {
      const angle = (i / 80) * Math.PI * 2 + Math.sin(i * 0.7) * 0.5;
      const speed = 280 + ((i * 53) % 280);
      const dx = Math.cos(angle) * speed;
      // gravity simulée : on additionne ~600px sur la fin
      const dy = Math.sin(angle) * speed + 600;
      const spin = (i % 2 ? 1 : -1) * (180 + ((i * 23) % 240));
      arr.push({
        dx,
        dy,
        spin,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        shape: CONFETTI_SHAPES[i % CONFETTI_SHAPES.length],
        size: 6 + ((i * 3) % 14),
      });
    }
    return arr;
  }, []);

  // Trigger onDone après la durée totale.
  useEffect(() => {
    const t = setTimeout(onDone, 4500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        // Pas de overflow:hidden — sinon les confettis qui débordent à
        // gauche/droite/bas de la liste sont clippés. On les laisse voler
        // librement par-dessus l'écran (pas de scroll horizontal possible
        // grâce à AcScreen + max-width sur SoloScreen).
        zIndex: 10,
      }}
    >
      {/* Confettis émergeant du centre haut de la liste */}
      {pieces.map((p, i) => (
        <div
          key={i}
          className="cmx-confetti"
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: 0,
            height: 0,
            // Vars CSS consommées par l'animation cmx-confetti-burst
            ['--cmx-dx' as string]: `${p.dx}px`,
            ['--cmx-dy' as string]: `${p.dy}px`,
            ['--cmx-spin' as string]: `${p.spin}deg`,
            animation: `cmx-confetti-burst 3.2s cubic-bezier(0.18, 0.7, 0.32, 1) forwards`,
            animationDelay: `${0.4 + (i % 8) * 0.02}s`,
            willChange: 'transform, opacity',
          }}
        >
          <ConfettiPiece shape={p.shape} color={p.color} size={p.size} />
        </div>
      ))}

      {/* Ribbon « TROUVÉ EN N ESSAIS » */}
      <div
        className="cmx-ribbon"
        style={{
          position: 'absolute',
          top: '32%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-2deg)',
          height: 56,
          maxWidth: 'min(640px, 90vw)',
          ['--cmx-ribbon-w' as string]: 'min(640px, 90vw)',
          background: AC.shimmer,
          color: AC.ink,
          clipPath:
            'polygon(2% 12%, 12% 0, 30% 8%, 55% 2%, 78% 10%, 98% 4%, 100% 40%, 97% 75%, 99% 100%, 80% 96%, 55% 100%, 30% 94%, 10% 100%, 1% 88%, 2% 50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'cmx-ribbon-unfurl 0.7s ease-out 1.0s both',
          opacity: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 13,
            letterSpacing: '0.4em',
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          {`// TROUVÉ EN ${total} ESSAI${total > 1 ? 'S' : ''} //`}
        </span>
      </div>

      {/* Stamp du mot du jour */}
      <div
        className="cmx-word-stamp"
        style={{
          position: 'absolute',
          top: '60%',
          left: '50%',
          textAlign: 'center',
          animation: 'cmx-word-stamp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 2.0s both',
          opacity: 0,
          willChange: 'transform, opacity',
        }}
      >
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 11,
            color: AC.gold,
            letterSpacing: '0.32em',
            marginBottom: 4,
          }}
        >
          {'// MOT DU JOUR ▸'}
        </div>
        <div
          style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: 'clamp(64px, 14vw, 130px)',
            fontWeight: 900,
            color: AC.gold,
            textShadow: `5px 5px 0 ${AC.ink}, -2px 2px 0 ${AC.rust}, 0 0 40px ${AC.gold}`,
            letterSpacing: '-0.03em',
            textTransform: 'uppercase',
            lineHeight: 0.85,
            whiteSpace: 'nowrap',
          }}
        >
          {target}
        </div>
      </div>
    </div>
  );
}

function ConfettiPiece({
  shape,
  color,
  size,
}: {
  shape: ConfettiShape;
  color: string;
  size: number;
}) {
  if (shape === 'rect') {
    return <div style={{ width: size, height: size * 0.45, background: color, boxShadow: `1px 1px 0 ${AC.ink}` }} />;
  }
  if (shape === 'triangle') {
    return (
      <div
        style={{
          width: 0,
          height: 0,
          borderLeft: `${size / 2}px solid transparent`,
          borderRight: `${size / 2}px solid transparent`,
          borderBottom: `${size}px solid ${color}`,
          filter: `drop-shadow(1px 1px 0 ${AC.ink})`,
        }}
      />
    );
  }
  if (shape === 'disc') {
    return <div style={{ width: size, height: size, borderRadius: '50%', background: color, boxShadow: `1px 1px 0 ${AC.ink}` }} />;
  }
  if (shape === 'x') {
    return (
      <svg width={size + 4} height={size + 4} viewBox="0 0 20 20">
        <g stroke={color} strokeWidth="4" strokeLinecap="round">
          <line x1="3" y1="3" x2="17" y2="17" />
          <line x1="17" y1="3" x2="3" y2="17" />
        </g>
      </svg>
    );
  }
  // star
  return (
    <svg width={size + 4} height={size + 4} viewBox="0 0 24 24">
      <polygon
        points="12,2 14.5,9 22,9 16,13.5 18.5,21 12,16.5 5.5,21 8,13.5 2,9 9.5,9"
        fill={color}
        stroke={AC.ink}
        strokeWidth="0.5"
      />
    </svg>
  );
}
