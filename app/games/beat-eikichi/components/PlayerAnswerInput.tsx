'use client';

import { useEffect, useRef, useState } from 'react';
import { AutocompleteInput, type CatalogEntry } from './AutocompleteInput';
import { BEAT_EIKICHI_CONFIG } from '@/lib/beatEikichi/config';
import {
  AC,
  AC_CLIP,
  AcEmote,
  AcGlyph,
  type AcGlyphKind,
} from '@/app/components/arcane';

interface PlayerAnswerInputProps {
  roomCode: string;
  playerToken: string;
  catalog: CatalogEntry[];
  /** Si true, le joueur a déjà trouvé : on verrouille. */
  alreadyFound: boolean;
  /** Reset le champ quand la question change (nouvelle `questionKey`). */
  questionKey: string | number;
  /** Temps écoulé depuis le début de la question (en secondes) au moment où
   * le joueur a trouvé — utilisé pour l'affichage « en X.Xs ». */
  foundAtSeconds?: number | null;
}

type Closeness = 'close' | 'medium' | 'far';

export function PlayerAnswerInput({
  roomCode,
  playerToken,
  catalog,
  alreadyFound,
  questionKey,
  foundAtSeconds,
}: PlayerAnswerInputProps) {
  const [value, setValue] = useState('');
  const [shakeKey, setShakeKey] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  // Feedback de proximité affiché après une mauvaise réponse.
  const [feedback, setFeedback] = useState<{
    closeness: Closeness;
    at: number;
  } | null>(null);

  const lastTypingSentRef = useRef<{ text: string; at: number }>({
    text: '',
    at: 0,
  });

  // Reset à chaque nouvelle question.
  useEffect(() => {
    setValue('');
    setShakeKey(0);
    setFeedback(null);
    lastTypingSentRef.current = { text: '', at: 0 };
  }, [questionKey]);

  // Efface le feedback après ~2.5s s'il n'y a pas eu de nouvelle soumission.
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 2500);
    return () => clearTimeout(t);
  }, [feedback]);

  // Throttle persistance de la saisie côté serveur.
  useEffect(() => {
    if (alreadyFound) return;
    const delay = BEAT_EIKICHI_CONFIG.TYPING_PERSIST_THROTTLE_MS;
    const timeSinceLast = Date.now() - lastTypingSentRef.current.at;
    if (value === lastTypingSentRef.current.text) return;

    const t = setTimeout(
      () => {
        fetch(`/api/games/beat-eikichi/${roomCode}/typing`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerToken, text: value }),
        }).catch(() => {
          /* on ignore, ce n'est qu'un fallback */
        });
        lastTypingSentRef.current = { text: value, at: Date.now() };
      },
      Math.max(0, delay - timeSinceLast),
    );

    return () => clearTimeout(t);
  }, [value, roomCode, playerToken, alreadyFound]);

  const handleSubmit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || submitting || alreadyFound) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/games/beat-eikichi/${roomCode}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerToken, text: trimmed }),
      });
      const data: { correct?: boolean; closeness?: Closeness } = await res
        .json()
        .catch(() => ({}));
      if (res.ok && data.correct) {
        // succès : on laisse le serveur pousser la mise à jour ;
        // le parent verra `alreadyFound=true` et verrouillera.
        setValue(trimmed);
        setFeedback(null);
      } else {
        // mauvaise réponse : shake + reset du champ + feedback de proximité
        setShakeKey((k) => k + 1);
        setValue('');
        if (data.closeness) {
          setFeedback({ closeness: data.closeness, at: Date.now() });
        }
      }
    } catch {
      setShakeKey((k) => k + 1);
    } finally {
      setSubmitting(false);
    }
  };

  if (alreadyFound) {
    return <FoundBanner seconds={foundAtSeconds ?? null} />;
  }

  const isWrong = feedback !== null;

  return (
    <div className="flex flex-col gap-3">
      <AutocompleteInput
        catalog={catalog}
        value={value}
        onChange={setValue}
        onSubmit={handleSubmit}
        disabled={submitting}
        shakeKey={shakeKey}
        resetKey={questionKey}
        error={isWrong}
      />
      {feedback && <FeedbackRibbon tone={feedback.closeness} at={feedback.at} />}
    </div>
  );
}

// -------------------------------------------------------------------------
//  Banner « trouvé » + Ruban de feedback
// -------------------------------------------------------------------------

function FoundBanner({ seconds }: { seconds: number | null }) {
  return (
    <div
      className="relative text-center"
      style={{
        padding: 18,
        background: 'rgba(18,214,168,0.12)',
        border: `2px solid ${AC.chem}`,
        clipPath: AC_CLIP,
        color: AC.bone,
      }}
    >
      <div
        style={{
          fontFamily:
            "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
          fontWeight: 800,
          fontSize: 'clamp(22px, 3vw, 32px)',
          color: AC.chem,
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
        }}
      >
        ✓ TU AS TROUVÉ
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 12,
          color: AC.bone2,
          marginTop: 6,
        }}
      >
        {seconds != null
          ? `// en ${seconds.toFixed(1)}s — en attente des autres joueurs…`
          : '// en attente des autres joueurs…'}
      </div>
      <div className="absolute" style={{ top: -16, right: 18 }}>
        <AcEmote face=":-D" color={AC.chem} size={36} />
      </div>
    </div>
  );
}

function FeedbackRibbon({
  tone,
  at,
}: {
  tone: Closeness;
  at: number;
}) {
  const cfg: Record<
    Closeness,
    {
      face: string;
      color: string;
      label: string;
      glyph: AcGlyphKind;
      desc: string;
    }
  > = {
    close: {
      face: ':-D',
      color: AC.rust,
      label: 'TRÈS CHAUD !',
      glyph: 'flame',
      desc: "// à un cheveu — réessaie",
    },
    medium: {
      face: ':-|',
      color: AC.gold,
      label: 'TIÈDE…',
      glyph: 'thermometer',
      desc: '// pas loin, pas proche',
    },
    far: {
      face: ':-(',
      color: AC.hex,
      label: 'FROID.',
      glyph: 'snow',
      desc: '// rien à voir',
    },
  };
  const c = cfg[tone];

  return (
    <div
      key={at}
      className="flex items-center gap-3.5"
      style={{
        padding: '10px 14px',
        borderLeft: `8px solid ${c.color}`,
        background: mixBg(tone),
        animation: 'ac-slide-in-right 0.25s ease-out',
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          background: c.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          clipPath: AC_CLIP,
          flexShrink: 0,
        }}
      >
        <AcGlyph kind={c.glyph} color={AC.ink} size={22} stroke={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: AC.bone,
          }}
        >
          {c.label}
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 10,
            color: AC.bone2,
            marginTop: 2,
          }}
        >
          {c.desc}
        </div>
      </div>
      <AcEmote face={c.face} color={c.color} size={30} />
    </div>
  );
}

function mixBg(tone: Closeness): string {
  // Teintes soft pour les 3 feedbacks — pas de color-mix pour garder une large
  // compat navigateur.
  if (tone === 'close') return 'rgba(200,68,30,0.12)';
  if (tone === 'medium') return 'rgba(245,185,18,0.10)';
  return 'rgba(94,184,255,0.10)';
}
