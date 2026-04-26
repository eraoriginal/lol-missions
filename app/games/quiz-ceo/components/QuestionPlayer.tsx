'use client';

import { useMemo, useRef, useState } from 'react';
import type {
  QuizCeoQuestion,
  QuizCeoSubmitted,
  QuizCeoRankingItem,
} from '@/app/types/room';
import { AC } from '@/app/components/arcane';
import { QUESTION_TYPE_MAP } from '@/lib/quizCeo/config';
import { ALL_COUNTRIES } from '@/lib/quizCeo/allCountries';
import {
  LOL_CONTOURS_FILTER,
  type LolChampionPayload,
} from '@/lib/quizCeo/lolChampion';
import type { LolMatchCardData } from '@/lib/quizCeo/lolMatchCard';
import { LolMatchCard } from './LolMatchCard';
import {
  applyRankingDrop,
  computeRankingHoverIndex,
  computeRankingOffset,
} from '@/lib/quizCeo/rankingDrag';

interface Props {
  question: QuizCeoQuestion;
  initialValue: QuizCeoSubmitted;
  /** Appelée dès qu'une valeur est prête — le parent throttle / debounce la soumission. */
  onChange: (value: QuizCeoSubmitted) => void;
  disabled?: boolean;
}

/**
 * Rend à la fois l'affichage de la question et l'input de réponse selon le type.
 *
 * `onChange` est appelée à chaque modification de la réponse courante. Le parent
 * (PlayingView) décide quand soumettre au serveur (typiquement à l'expiration
 * du timer ou à un clic "Valider").
 */
export function QuestionPlayer({
  question,
  initialValue,
  onChange,
  disabled = false,
}: Props) {
  const typeLabel = QUESTION_TYPE_MAP[question.type as keyof typeof QUESTION_TYPE_MAP]?.label
    ?? question.type;

  return (
    <div>
      {/* Badge type + consigne */}
      <div className="mb-4">
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 10,
            letterSpacing: '0.25em',
            color: AC.gold,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          {'// '}
          {typeLabel} · {question.points} pt{question.points > 1 ? 's' : ''}
        </div>
        <div
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 700,
            fontSize: 22,
            color: AC.bone,
            textTransform: 'uppercase',
            letterSpacing: '0.01em',
            lineHeight: 1.25,
          }}
        >
          {question.prompt}
        </div>
      </div>

      {/* Affichage + input selon le type */}
      <TypedBody
        question={question}
        value={initialValue}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

function TypedBody({
  question,
  value,
  onChange,
  disabled,
}: {
  question: QuizCeoQuestion;
  value: QuizCeoSubmitted;
  onChange: (v: QuizCeoSubmitted) => void;
  disabled: boolean;
}) {
  const payload = question.payload;
  switch (question.type) {
    case 'image-personality':
    case 'brand-logo':
      return (
        <>
          <ImageFrame url={String(payload.imageUrl ?? '')} />
          <TextAnswerInput
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder="Tape ta réponse…"
          />
        </>
      );
    case 'lol-player-match': {
      // Carte de match LoL réelle — devine quel joueur a joué ça.
      // Mécanique QCM : 4 choix (1 correct + 3 distractors random) générés
      // à chaque partie par `start/route.ts`. Le payload contient à la fois
      // les data de la MatchCard ET le tableau `choices: [string × 4]`.
      const matchPayload = payload as unknown as LolMatchCardData;
      const choices = (payload.choices as string[]) ?? [];
      return (
        <>
          <div className="mb-4">
            <LolMatchCard data={matchPayload} />
          </div>
          <ChoicesInput
            choices={choices}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        </>
      );
    }
    case 'text-question':
    case 'expression':
    case 'translation':
    case 'country-motto':
    case 'who-said':
      return (
        <>
          <TextCard text={String(payload.text ?? '')} />
          <TextAnswerInput
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder="Tape ta réponse…"
          />
        </>
      );
    case 'music':
      return (
        <>
          <AudioPlayer url={String(payload.audioUrl ?? '')} />
          <TextAnswerInput
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder="Ex : Queen - Bohemian Rhapsody"
            kind="music"
          />
        </>
      );
    case 'multiple-choice':
    case 'odd-one-out':
      return (
        <>
          <TextCard text={String(payload.text ?? '')} />
          <ChoicesInput
            choices={(payload.choices as string[]) ?? []}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        </>
      );
    case 'absurd-law':
      return (
        <>
          <TextCard text={String(payload.text ?? '')} />
          <BooleanInput value={value} onChange={onChange} disabled={disabled} />
        </>
      );
    case 'price':
      return (
        <>
          <ImageFrame url={String(payload.imageUrl ?? '')} />
          <PriceInput value={value} onChange={onChange} disabled={disabled} />
        </>
      );
    case 'ranking':
      return (
        <RankingInput
          items={(payload.items as QuizCeoRankingItem[]) ?? []}
          shuffledOrder={(payload.shuffledOrder as string[]) ?? []}
          value={value}
          onChange={onChange}
          disabled={disabled}
        />
      );
    case 'worldle':
      return (
        <>
          <CountryShape url={String(payload.imageUrl ?? '')} />
          <WorldleInput value={value} onChange={onChange} disabled={disabled} />
        </>
      );
    case 'lol-champion': {
      // Discrimine sur `payload.mode` (splash | spells) — voir
      // `lib/quizCeo/lolChampion.ts`.
      const lolPayload = payload as unknown as LolChampionPayload;
      return (
        <>
          <LolChampionDisplay payload={lolPayload} />
          <TextAnswerInput
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder="Tape le nom du champion…"
          />
        </>
      );
    }
    default:
      return (
        <div style={{ color: AC.bone2 }}>Type de question inconnu : {question.type}</div>
      );
  }
}

// ========== Sous-composants d'affichage ==========

function ImageFrame({ url }: { url: string }) {
  if (!url) return null;
  return (
    <div
      className="relative mb-4"
      style={{
        width: '100%',
        maxHeight: 360,
        minHeight: 220,
        background: 'rgba(13,11,8,0.5)',
        border: `2px solid ${AC.bone2}`,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <img
        src={url}
        alt=""
        style={{
          maxWidth: '100%',
          maxHeight: 360,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );
}

function TextCard({ text }: { text: string }) {
  return (
    <div
      className="mb-5 p-5"
      style={{
        background: 'rgba(245,185,18,0.05)',
        border: `1.5px dashed ${AC.gold}`,
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
        fontSize: 18,
        lineHeight: 1.5,
        color: AC.bone,
      }}
    >
      {text}
    </div>
  );
}

function AudioPlayer({ url }: { url: string }) {
  if (!url) return null;
  return (
    <div
      className="mb-4 p-4"
      style={{
        background: 'rgba(13,11,8,0.5)',
        border: `2px solid ${AC.bone2}`,
      }}
    >
      <audio controls src={url} style={{ width: '100%' }} />
    </div>
  );
}

function LolChampionDisplay({ payload }: { payload: LolChampionPayload }) {
  if (payload.mode === 'splash') {
    // Splash art 1280×720 + filtre CSS « Contours » (validé visuellement
    // sur /test/lol-champions). Pas d'asset détouré dispo publiquement → on
    // reste sur l'image source avec inversion + grayscale + contraste.
    return (
      <div
        className="relative mb-4"
        style={{
          width: '100%',
          maxHeight: 360,
          minHeight: 220,
          background: 'rgba(13,11,8,0.5)',
          border: `2px solid ${AC.bone2}`,
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={payload.imageUrl}
          alt=""
          style={{
            maxWidth: '100%',
            maxHeight: 360,
            objectFit: 'contain',
            display: 'block',
            filter: LOL_CONTOURS_FILTER,
          }}
        />
      </div>
    );
  }
  // mode === 'spells' — disposition « Passif central » : passif au centre,
  // 4 sorts Q/W/E/R aux 4 coins. Validé visuellement sur /test/lol-champion-spells.
  const { iconUrls } = payload;
  const iconBorder: React.CSSProperties = {
    border: `1.5px solid ${AC.bone2}`,
    background: '#0a0907',
    display: 'block',
  };
  return (
    <div
      className="mb-4"
      style={{
        background: 'rgba(13,11,8,0.5)',
        border: `2px solid ${AC.bone2}`,
        padding: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: 220,
          height: 160,
        }}
      >
        {/* Passif au centre, plus gros */}
        <img
          src={iconUrls.p}
          alt="Passif"
          width={72}
          height={72}
          style={{
            ...iconBorder,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 72,
            height: 72,
          }}
        />
        {/* Q top-left */}
        <img
          src={iconUrls.q}
          alt="Q"
          width={52}
          height={52}
          style={{ ...iconBorder, position: 'absolute', top: 0, left: 0, width: 52, height: 52 }}
        />
        {/* W top-right */}
        <img
          src={iconUrls.w}
          alt="W"
          width={52}
          height={52}
          style={{ ...iconBorder, position: 'absolute', top: 0, right: 0, width: 52, height: 52 }}
        />
        {/* E bottom-left */}
        <img
          src={iconUrls.e}
          alt="E"
          width={52}
          height={52}
          style={{ ...iconBorder, position: 'absolute', bottom: 0, left: 0, width: 52, height: 52 }}
        />
        {/* R bottom-right */}
        <img
          src={iconUrls.r}
          alt="R"
          width={52}
          height={52}
          style={{ ...iconBorder, position: 'absolute', bottom: 0, right: 0, width: 52, height: 52 }}
        />
      </div>
    </div>
  );
}

// ========== Inputs ==========

function TextAnswerInput({
  value,
  onChange,
  disabled,
  placeholder,
  kind = 'text',
}: {
  value: QuizCeoSubmitted;
  onChange: (v: QuizCeoSubmitted) => void;
  disabled: boolean;
  placeholder: string;
  kind?: 'text' | 'music';
}) {
  const current =
    value && (value.kind === 'text' || value.kind === 'music')
      ? value.value
      : '';
  return (
    <input
      type="text"
      value={current}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v ? { kind, value: v } : null);
      }}
      className="ac-input"
      style={{
        width: '100%',
        padding: '14px 16px',
        background: 'rgba(240,228,193,0.04)',
        border: `1.5px solid ${AC.bone}`,
        outline: 'none',
        color: AC.bone,
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        fontSize: 17,
      }}
    />
  );
}

function ChoicesInput({
  choices,
  value,
  onChange,
  disabled,
}: {
  choices: string[];
  value: QuizCeoSubmitted;
  onChange: (v: QuizCeoSubmitted) => void;
  disabled: boolean;
}) {
  const selected = value?.kind === 'choice' ? value.index : -1;
  return (
    <div className="grid gap-2" style={{ gridTemplateColumns: '1fr' }}>
      {choices.map((c, i) => {
        const isActive = i === selected;
        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onChange({ kind: 'choice', index: i })}
            style={{
              padding: '14px 16px',
              background: isActive ? 'rgba(245,185,18,0.15)' : 'rgba(240,228,193,0.03)',
              border: isActive ? `2px solid ${AC.gold}` : `1.5px dashed ${AC.bone2}`,
              color: AC.bone,
              cursor: disabled ? 'default' : 'pointer',
              fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
              fontSize: 15,
              textAlign: 'left',
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 11,
                color: isActive ? AC.gold : AC.bone2,
                marginRight: 10,
              }}
            >
              {String.fromCharCode(65 + i)}.
            </span>
            {c}
          </button>
        );
      })}
    </div>
  );
}

function BooleanInput({
  value,
  onChange,
  disabled,
}: {
  value: QuizCeoSubmitted;
  onChange: (v: QuizCeoSubmitted) => void;
  disabled: boolean;
}) {
  const current = value?.kind === 'boolean' ? value.value : undefined;
  return (
    <div className="grid grid-cols-2 gap-3">
      {[
        { v: true, label: 'VRAI', color: AC.chem },
        { v: false, label: 'FAUX', color: AC.rust },
      ].map((o) => {
        const active = current === o.v;
        return (
          <button
            key={String(o.v)}
            type="button"
            disabled={disabled}
            onClick={() => onChange({ kind: 'boolean', value: o.v })}
            style={{
              padding: '18px 12px',
              background: active ? o.color : 'rgba(240,228,193,0.04)',
              border: active ? `2px solid ${o.color}` : `1.5px dashed ${AC.bone2}`,
              color: active ? AC.ink : AC.bone,
              fontFamily:
                "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
              fontWeight: 800,
              fontSize: 22,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: disabled ? 'default' : 'pointer',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function PriceInput({
  value,
  onChange,
  disabled,
}: {
  value: QuizCeoSubmitted;
  onChange: (v: QuizCeoSubmitted) => void;
  disabled: boolean;
}) {
  const current =
    value?.kind === 'price' && Number.isFinite(value.value) ? value.value : '';
  const numericCurrent = typeof current === 'number' ? current : 0;

  const setValue = (next: number) => {
    const safe = Math.max(0, next);
    onChange({ kind: 'price', value: Number(safe.toFixed(2)) });
  };

  return (
    <div className="flex items-stretch gap-2">
      {/* Wrapper input + spinners custom — `appearance: textfield` cache les
          flèches natives du browser pour qu'on contrôle complètement le style. */}
      <div className="flex items-stretch flex-1">
        <input
          type="number"
          min={0}
          step="any"
          inputMode="decimal"
          value={current}
          disabled={disabled}
          placeholder="0"
          onChange={(e) => {
            const n = parseFloat(e.target.value);
            if (e.target.value === '' || !Number.isFinite(n)) {
              onChange(null);
            } else {
              onChange({ kind: 'price', value: n });
            }
          }}
          className="ac-price-input"
          style={{
            flex: 1,
            padding: '14px 16px',
            background: 'rgba(240,228,193,0.04)',
            border: `1.5px solid ${AC.bone}`,
            borderRight: 'none',
            outline: 'none',
            color: AC.gold,
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 22,
            fontWeight: 700,
            textAlign: 'right',
            minWidth: 0,
          }}
        />
        <div
          className="flex flex-col"
          style={{ borderLeft: 'none' }}
        >
          <PriceSpinner
            label="+"
            disabled={disabled}
            onClick={() => setValue(numericCurrent + 1)}
            position="top"
          />
          <PriceSpinner
            label="−"
            disabled={disabled || numericCurrent <= 0}
            onClick={() => setValue(numericCurrent - 1)}
            position="bottom"
          />
        </div>
      </div>
      <span
        className="flex items-center px-3"
        style={{
          fontFamily:
            "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
          fontSize: 26,
          fontWeight: 800,
          color: AC.gold,
          background: 'rgba(245,185,18,0.08)',
          border: `1.5px solid ${AC.gold}`,
          minWidth: 56,
          justifyContent: 'center',
        }}
      >
        €
      </span>
    </div>
  );
}

function PriceSpinner({
  label,
  disabled,
  onClick,
  position,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  position: 'top' | 'bottom';
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label === '+' ? 'Augmenter' : 'Diminuer'}
      style={{
        flex: 1,
        minWidth: 38,
        padding: '0 12px',
        background: 'rgba(245,185,18,0.08)',
        border: `1.5px solid ${AC.bone}`,
        borderTop: position === 'bottom' ? 'none' : `1.5px solid ${AC.bone}`,
        color: AC.gold,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        fontSize: 18,
        fontWeight: 800,
        lineHeight: 1,
        transition: 'background 0.12s',
      }}
      onMouseEnter={(e) => {
        if (!disabled) e.currentTarget.style.background = 'rgba(245,185,18,0.22)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(245,185,18,0.08)';
      }}
    >
      {label}
    </button>
  );
}

// ========== Ranking (drag & drop + fallback up/down arrows) ==========

function RankingInput({
  items,
  shuffledOrder,
  value,
  onChange,
  disabled,
}: {
  items: QuizCeoRankingItem[];
  shuffledOrder: string[];
  value: QuizCeoSubmitted;
  onChange: (v: QuizCeoSubmitted) => void;
  disabled: boolean;
}) {
  const itemsById = useMemo(() => {
    const m = new Map<string, QuizCeoRankingItem>();
    items.forEach((it) => m.set(it.id, it));
    return m;
  }, [items]);

  // L'ordre courant : initial = ce que le joueur a posté, sinon l'ordre mélangé.
  const initialOrder = useMemo(() => {
    if (value?.kind === 'ranking' && value.order.length === shuffledOrder.length) {
      return value.order;
    }
    return shuffledOrder;
  }, [value, shuffledOrder]);

  const [order, setOrder] = useState<string[]>(initialOrder);
  // resync si shuffledOrder change (nouvelle question) — pattern "derived state
  // from previous render" recommandé par React.
  const currentSig = shuffledOrder.join(',');
  const [lastSig, setLastSig] = useState<string>(currentSig);
  if (lastSig !== currentSig) {
    setLastSig(currentSig);
    setOrder(initialOrder);
  }

  const move = (id: string, dir: -1 | 1) => {
    const idx = order.indexOf(id);
    if (idx < 0) return;
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= order.length) return;
    const next = order.slice();
    [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
    setOrder(next);
    onChange({ kind: 'ranking', order: next });
  };

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  // Mesure de la hauteur d'une row + le gap (gap-2 Tailwind = 0.5rem = 8px),
  // pour calculer les `translateY` qui décalent visuellement les autres items
  // pendant le drag. useState (pas useRef) car lu dans le render body — refs
  // interdites en render par eslint-plugin-react-hooks strict.
  const [rowHeight, setRowHeight] = useState<number>(60);
  // Container ref : on lit `getBoundingClientRect().top` UNIQUEMENT depuis
  // les event handlers (lint OK). Permet le tracking du hover par cursor Y
  // au lieu de per-row dragOver — élimine le feedback loop responsable du
  // tremblement de l'animation (les items shiftent → cursor change de row
  // logique → setOverId → re-shift → ad nauseam).
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    if (disabled) return;
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
    // setData requis par Firefox sinon le drag ne s'amorce pas.
    e.dataTransfer.setData('text/plain', id);
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const measured = rect.height + 8;
    if (Math.abs(measured - rowHeight) > 1) setRowHeight(measured);
  };
  const handleDragEnd = () => {
    setDraggingId(null);
    setOverId(null);
  };

  const handleContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!draggingId) return;
    const el = containerRef.current;
    if (!el) return;
    const idx = computeRankingHoverIndex(
      e.clientY,
      el.getBoundingClientRect().top,
      rowHeight,
      order.length,
    );
    if (idx === null) return;
    const targetId = order[idx];
    if (targetId && targetId !== overId) setOverId(targetId);
  };

  const handleContainerDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggingId) {
      setOverId(null);
      return;
    }
    const el = containerRef.current;
    if (!el) {
      setDraggingId(null);
      setOverId(null);
      return;
    }
    const idx = computeRankingHoverIndex(
      e.clientY,
      el.getBoundingClientRect().top,
      rowHeight,
      order.length,
    );
    const targetId = idx === null ? null : order[idx];
    if (!targetId || targetId === draggingId) {
      setDraggingId(null);
      setOverId(null);
      return;
    }
    const next = applyRankingDrop(order, draggingId, targetId);
    setOrder(next);
    onChange({ kind: 'ranking', order: next });
    setDraggingId(null);
    setOverId(null);
  };

  // Voir computeRankingOffset (lib/quizCeo/rankingDrag.ts) pour la logique
  // pure + les tests unitaires (scripts/test-ranking-drag.ts).
  const fromIdx = draggingId ? order.indexOf(draggingId) : -1;
  const overIdx = overId ? order.indexOf(overId) : -1;

  return (
    <div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 10,
          letterSpacing: '0.22em',
          color: AC.bone2,
          marginBottom: 8,
        }}
      >
        {'// glisse par la poignée ⋮⋮ ou utilise les flèches — #1 en haut'}
      </div>
      <div
        ref={containerRef}
        className="flex flex-col gap-2"
        onDragOver={handleContainerDragOver}
        onDrop={handleContainerDrop}
      >
        {order.map((id, i) => {
          const it = itemsById.get(id);
          if (!it) return null;
          const isDragging = draggingId === id;
          const offset = computeRankingOffset(
            i,
            fromIdx,
            overIdx,
            rowHeight,
            isDragging,
          );
          const cls = [
            'qc-drag-row',
            'flex',
            'items-center',
            'gap-2.5',
            disabled ? 'qc-drag-row--disabled' : '',
            isDragging ? 'qc-drag-row--dragging' : '',
          ]
            .filter(Boolean)
            .join(' ');
          return (
            <div
              key={id}
              draggable={!disabled}
              onDragStart={handleDragStart(id)}
              onDragEnd={handleDragEnd}
              className={cls}
              style={{
                padding: 10,
                background: 'rgba(240,228,193,0.04)',
                border: `1.5px dashed ${AC.bone2}`,
                cursor: disabled ? 'default' : 'grab',
                // Inline transform / transition pour l'animation « live insertion » :
                // l'item draggé garde son tilt visuel (.qc-drag-row--dragging
                // déclare scale + rotate) ; les autres items se décalent pour
                // laisser la place. La transition est désactivée sur l'item
                // en cours de drag pour éviter qu'il « rattrape » le ghost.
                transform: isDragging
                  ? 'scale(0.97) rotate(-0.6deg)'
                  : `translateY(${offset}px)`,
                transition: isDragging
                  ? 'none'
                  : 'transform 200ms cubic-bezier(0.2, 0.8, 0.2, 1)',
                willChange: draggingId ? 'transform' : 'auto',
              }}
            >
              <span
                aria-hidden="true"
                className="qc-drag-handle"
                title="Glisser pour réordonner"
              >
                <span /><span /><span />
              </span>
              <span
                style={{
                  fontFamily:
                    "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                  fontWeight: 900,
                  fontSize: 20,
                  color: AC.gold,
                  minWidth: 28,
                  textAlign: 'center',
                }}
              >
                #{i + 1}
              </span>
              <div
                style={{
                  width: 48,
                  height: 36,
                  background: 'rgba(13,11,8,0.6)',
                  border: `1px solid ${AC.bone2}`,
                  overflow: 'hidden',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={it.url}
                  alt={it.label}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>
              <span
                className="flex-1"
                style={{
                  fontFamily:
                    "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                  fontWeight: 700,
                  fontSize: 14,
                  color: AC.bone,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                }}
              >
                {it.label}
              </span>
              <div className="flex flex-col" style={{ gap: 0 }}>
                <RankNudge
                  label="▲"
                  ariaLabel="Monter"
                  disabled={disabled || i === 0}
                  onClick={() => move(id, -1)}
                  position="top"
                />
                <RankNudge
                  label="▼"
                  ariaLabel="Descendre"
                  disabled={disabled || i === order.length - 1}
                  onClick={() => move(id, 1)}
                  position="bottom"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RankNudge({
  label,
  ariaLabel,
  disabled,
  onClick,
  position,
}: {
  label: string;
  ariaLabel: string;
  disabled: boolean;
  onClick: () => void;
  position: 'top' | 'bottom';
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        padding: '4px 12px',
        background: 'rgba(245,185,18,0.06)',
        border: `1.5px solid ${AC.bone2}`,
        borderTop: position === 'bottom' ? 'none' : `1.5px solid ${AC.bone2}`,
        color: AC.gold,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        fontSize: 12,
        fontWeight: 800,
        lineHeight: 1,
        transition: 'background 0.12s, border-color 0.12s',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = 'rgba(245,185,18,0.18)';
          e.currentTarget.style.borderColor = AC.gold;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(245,185,18,0.06)';
        e.currentTarget.style.borderColor = AC.bone2;
      }}
    >
      {label}
    </button>
  );
}

// ========== Worldle (silhouette + autocomplete pays) ==========

/**
 * Affiche la silhouette d'un pays sur fond sombre, format `ImageFrame`-compatible
 * mais limité en hauteur pour laisser la place à l'input + datalist en dessous.
 */
function CountryShape({ url }: { url: string }) {
  if (!url) return null;
  return (
    <div
      className="mb-4"
      style={{
        width: '100%',
        maxHeight: 320,
        minHeight: 220,
        background: 'rgba(13,11,8,0.55)',
        border: `2px solid ${AC.bone2}`,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
      }}
    >
      <img
        src={url}
        alt=""
        style={{
          maxWidth: '100%',
          maxHeight: 280,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );
}

/**
 * Input pour Worldle : texte libre avec autocomplete sur les pays connus.
 * Le joueur tape le nom, voit des suggestions, en choisit une (ou tape librement).
 * Soumet en `kind: 'text'` — la validation est manuelle par le créateur en review.
 */
function WorldleInput({
  value,
  onChange,
  disabled,
}: {
  value: QuizCeoSubmitted;
  onChange: (v: QuizCeoSubmitted) => void;
  disabled: boolean;
}) {
  const current = value && value.kind === 'text' ? value.value : '';
  const [focused, setFocused] = useState(false);
  const [highlighted, setHighlighted] = useState(0);

  // Filtre les pays par préfixe normalisé sur nom + aliases.
  // Range ̀-ͯ = combining diacritical marks (accents NFD).
  const norm = (s: string) =>
    s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const suggestions = useMemo(() => {
    const n = norm(current.trim());
    if (!n) return [];
    return ALL_COUNTRIES.filter((c) => {
      const candidates = [c.name, ...c.aliases];
      return candidates.some((s) => norm(s).includes(n));
    }).slice(0, 8);
  }, [current]);

  const setText = (v: string) => {
    onChange(v ? { kind: 'text', value: v } : null);
    setHighlighted(0);
  };

  const showDropdown = focused && suggestions.length > 0 && !disabled;

  return (
    <div className="relative">
      <input
        type="text"
        value={current}
        disabled={disabled}
        placeholder="Tape un pays — Allemagne, Japon, Brésil…"
        autoComplete="off"
        onChange={(e) => setText(e.target.value)}
        onFocus={() => setFocused(true)}
        // Délai sur blur pour permettre le clic sur une suggestion.
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlighted((h) => Math.max(h - 1, 0));
          } else if (e.key === 'Enter') {
            const pick = suggestions[highlighted];
            if (pick) {
              e.preventDefault();
              setText(pick.name);
              setFocused(false);
            }
          } else if (e.key === 'Escape') {
            setFocused(false);
          }
        }}
        className="ac-input"
        style={{
          width: '100%',
          padding: '14px 16px',
          background: 'rgba(240,228,193,0.04)',
          border: `1.5px solid ${AC.bone}`,
          outline: 'none',
          color: AC.bone,
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 17,
        }}
      />
      {showDropdown && (
        <ul
          className="absolute z-10 list-none m-0 p-0"
          style={{
            top: '100%',
            left: 0,
            right: 0,
            marginTop: 4,
            background: AC.ink2,
            border: `1.5px solid ${AC.bone2}`,
            maxHeight: 240,
            overflowY: 'auto',
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          {suggestions.map((c, i) => (
            <li
              key={c.id}
              onMouseDown={(e) => {
                e.preventDefault();
                setText(c.name);
                setFocused(false);
              }}
              onMouseEnter={() => setHighlighted(i)}
              style={{
                padding: '8px 14px',
                background: i === highlighted ? AC.shimmer : 'transparent',
                color: i === highlighted ? AC.ink : AC.bone,
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 13,
                cursor: 'pointer',
                borderBottom: `1px dotted rgba(240,228,193,0.1)`,
              }}
            >
              {c.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
