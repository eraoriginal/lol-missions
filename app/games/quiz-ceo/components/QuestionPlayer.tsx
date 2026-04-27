'use client';

import { useMemo, useState } from 'react';
import type { QuizCeoQuestion, QuizCeoSubmitted } from '@/app/types/room';
import { AC } from '@/app/components/arcane';
import { QUESTION_TYPE_MAP } from '@/lib/quizCeo/config';
import { ALL_COUNTRIES } from '@/lib/quizCeo/allCountries';
import {
  LOL_CONTOURS_FILTER,
  type LolChampionPayload,
} from '@/lib/quizCeo/lolChampion';
import type { LolMatchCardData } from '@/lib/quizCeo/lolMatchCard';
import { LolMatchCard } from './LolMatchCard';

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
    case 'acronyme-sigle':
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
    case 'zodiac-mbti':
    case 'slogan-pub':
    case 'know-era':
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
    case 'bouffe-internationale':
    case 'panneau-signalisation':
      return (
        <>
          <ImageFrame url={String(payload.imageUrl ?? '')} />
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
        <img
          src={iconUrls.q}
          alt="Q"
          width={52}
          height={52}
          style={{ ...iconBorder, position: 'absolute', top: 0, left: 0, width: 52, height: 52 }}
        />
        <img
          src={iconUrls.w}
          alt="W"
          width={52}
          height={52}
          style={{ ...iconBorder, position: 'absolute', top: 0, right: 0, width: 52, height: 52 }}
        />
        <img
          src={iconUrls.e}
          alt="E"
          width={52}
          height={52}
          style={{ ...iconBorder, position: 'absolute', bottom: 0, left: 0, width: 52, height: 52 }}
        />
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
}: {
  value: QuizCeoSubmitted;
  onChange: (v: QuizCeoSubmitted) => void;
  disabled: boolean;
  placeholder: string;
}) {
  const current = value && value.kind === 'text' ? value.value : '';
  return (
    <input
      type="text"
      value={current}
      disabled={disabled}
      placeholder={placeholder}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v ? { kind: 'text', value: v } : null);
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
