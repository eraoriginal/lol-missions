'use client';

import { useMemo, useState } from 'react';
import type {
  QuizCeoQuestion,
  QuizCeoSubmitted,
  Room,
} from '@/app/types/room';
import { LeaveRoomButton } from '@/app/components/LeaveRoomButton';
import { BackToLobbyButton } from './BackToLobbyButton';
import {
  AC,
  AcAvatar,
  AcButton,
  AcCard,
  AcDisplay,
  AcDottedLabel,
  AcGlyph,
  AcGraffitiLayer,
  AcPaintedBar,
  AcScreen,
  AcShim,
  AcStamp,
} from '@/app/components/arcane';
import type { LolChampionPayload } from '@/lib/quizCeo/lolChampion';
import type { LolMatchCardData } from '@/lib/quizCeo/lolMatchCard';
import { LolMatchCard } from './LolMatchCard';
import { QUESTION_TYPE_MAP } from '@/lib/quizCeo/config';

interface Props {
  room: Room;
  roomCode: string;
  isCreator: boolean;
  creatorToken: string | null;
  refetch?: () => void;
}

function colorForPlayer(id: string): string {
  const palette = [AC.shimmer, AC.chem, AC.hex, AC.gold, AC.violet, AC.rust];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

type Override = {
  validated?: boolean;
};

export function ReviewView({ room, roomCode, isCreator, creatorToken, refetch }: Props) {
  const game = room.quizCeoGame!;
  const total = game.questions.length;
  const currentIndex = game.currentIndex;
  const question = game.questions[currentIndex];

  const [busy, setBusy] = useState(false);

  // Override optimiste : on bascule la UI immédiatement à chaque clic Bon/Faux
  // sans attendre le round-trip serveur + push Pusher + refetch (~200-600ms).
  // Indexé par `${position}-${playerId}`. Vidé quand on change de question.
  const [overrides, setOverrides] = useState<Map<string, Override>>(new Map());
  // Pattern « derived state from previous render » (cf. CLAUDE.md) — refs
  // interdites dans le render body par eslint-plugin-react-hooks strict.
  const [lastIdx, setLastIdx] = useState<number>(currentIndex);
  if (lastIdx !== currentIndex) {
    setLastIdx(currentIndex);
    if (overrides.size > 0) setOverrides(new Map());
    // Le serveur a confirmé l'avance (Pusher push reçu) → on déverrouille
    // la barre de boutons. Sans ça, `busy` se remettrait à false dès que
    // fetch() retourne, ouvrant la fenêtre où l'utilisateur peut re-cliquer
    // alors que la transition n'est pas encore visible (cf. bug rapporté :
    // « QUESTION SUIVANTE ne fait rien, mais un autre CTA change de question »).
    if (busy) setBusy(false);
  }

  // Pas de cleanup explicite des overrides "déjà reflétés en DB" : les
  // overrides sont déjà purgés au changement de `currentIndex` (cf. le bloc
  // « derived state » plus haut), et un override redondant n'altère pas la
  // valeur calculée par `mergedEntry`. Garder une useEffect avec setState ici
  // déclencherait des cascades de re-render (lint react-hooks/set-state-in-effect).

  const post = async (path: string, body: object): Promise<boolean> => {
    try {
      const res = await fetch(`/api/games/quiz-ceo/${roomCode}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        console.error(`[QUIZ-CEO] POST ${path} → ${res.status}`, detail);
        return false;
      }
      return true;
    } catch (err) {
      console.error(`[QUIZ-CEO] POST ${path} network error`, err);
      return false;
    }
  };

  const handleNext = async (direction: 'next' | 'prev' = 'next') => {
    if (!creatorToken) return;
    setBusy(true);
    // `fromIndex` permet au serveur de no-op si le client est déjà désync
    // (cf. JSDoc review-next/route.ts) — empêche de skip une question lors
    // d'un retry après push perdu.
    const ok = await post('review-next', {
      creatorToken,
      direction,
      fromIndex: currentIndex,
    });
    if (!ok) {
      // Échec serveur : on déverrouille tout de suite pour permettre une
      // re-tentative manuelle. Sinon la barre resterait bloquée jusqu'à
      // un éventuel changement d'index (qui n'arrivera pas).
      setBusy(false);
      return;
    }
    // Refetch immédiat — ne pas attendre le push Pusher qui peut être perdu
    // ou throttlé par useRoom (anti-spam 500ms). Le refetch sync l'état UI
    // dès que la mutation serveur est confirmée.
    refetch?.();
    // En cas de succès : on garde `busy=true` jusqu'à ce que `currentIndex`
    // change — le reset se fait dans le bloc « derived state » plus haut.
    // Évite la fenêtre de re-clic prématuré.
    // Fallback : si le refetch n'a pas encore vu la nouvelle valeur, on
    // re-fetch une seconde fois à 500ms et on déverrouille à 1.5s pour ne
    // pas bloquer la UI à vie. Ne re-tirer pas review-next côté client : le
    // serveur est désormais idempotent via fromIndex, mais on évite quand
    // même de spammer.
    setTimeout(() => refetch?.(), 500);
    setTimeout(() => setBusy(false), 1500);
  };

  const handleValidate = (playerId: string, validated: boolean) => {
    if (!creatorToken || !question) return;
    const key = `${currentIndex}-${playerId}`;
    setOverrides((prev) => {
      const next = new Map(prev);
      next.set(key, { ...(next.get(key) ?? {}), validated });
      return next;
    });
    // Fire-and-forget : la confirmation revient via Pusher + refetch.
    void post('review-validate', {
      creatorToken,
      playerId,
      position: currentIndex,
      validated,
    });
  };

  // Helper : merge override + entry serveur pour la lecture.
  const mergedEntry = useMemo(
    () => (playerId: string) => {
      const ps = game.playerStates.find((s) => s.playerId === playerId);
      const entry = ps?.answers.find((a) => a.position === currentIndex);
      const ov = overrides.get(`${currentIndex}-${playerId}`);
      if (!ov) return entry;
      return {
        ...(entry ?? { position: currentIndex, type: question?.type ?? 'text-question', submitted: null }),
        ...(ov.validated !== undefined ? { validated: ov.validated } : {}),
      };
    },
    [game.playerStates, overrides, currentIndex, question?.type],
  );

  if (!question) {
    return (
      <AcScreen>
        <div className="min-h-screen flex items-center justify-center">
          <AcStamp color={AC.bone2} rotate={-2}>
            {'// question introuvable'}
          </AcStamp>
        </div>
      </AcScreen>
    );
  }

  const typeLabel = QUESTION_TYPE_MAP[question.type as keyof typeof QUESTION_TYPE_MAP]
    ?.label ?? question.type;
  const answer = question.answer ?? {};

  return (
    <AcScreen>
      <AcGraffitiLayer density="normal" />
      <div
        className="relative mx-auto px-4 sm:px-8 py-6 sm:py-9"
        style={{ maxWidth: 1240 }}
      >
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 flex-wrap">
            <BackToLobbyButton roomCode={roomCode} />
            <AcDottedLabel>{'// CORRECTION EN COURS'}</AcDottedLabel>
          </div>
          <LeaveRoomButton roomCode={roomCode} />
        </div>

        {/* Header */}
        <div className="mb-5">
          <div className="flex justify-between items-baseline mb-1.5">
            <div
              style={{
                fontFamily:
                  "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                fontWeight: 800,
                fontSize: 22,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: AC.bone,
              }}
            >
              QUESTION {currentIndex + 1} / {total}
            </div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 11,
                letterSpacing: '0.25em',
                color: AC.gold,
                textTransform: 'uppercase',
              }}
            >
              {'// '}
              {typeLabel} · {question.points} pt{question.points > 1 ? 's' : ''}
            </div>
          </div>
          <AcPaintedBar value={(currentIndex + 1) / total} color={AC.gold} />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          {/* Question + solution */}
          <AcCard fold={false} style={{ padding: 20 }}>
            <div
              style={{
                fontFamily:
                  "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                fontWeight: 700,
                fontSize: 20,
                color: AC.bone,
                marginBottom: 14,
                textTransform: 'uppercase',
                lineHeight: 1.25,
              }}
            >
              {question.prompt}
            </div>

            <QuestionDisplay question={question} />

            <div className="mt-5">
              <div
                style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: 10,
                  letterSpacing: '0.25em',
                  color: AC.chem,
                  marginBottom: 6,
                  textTransform: 'uppercase',
                }}
              >
                {'// BONNE RÉPONSE'}
              </div>
              <div
                className="p-4"
                style={{
                  background: 'rgba(18,214,168,0.08)',
                  border: `2px solid ${AC.chem}`,
                }}
              >
                <CanonicalAnswer question={question} />
              </div>
            </div>
          </AcCard>

          {/* Réponses des joueurs */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5 mb-1">
              <AcDisplay style={{ fontSize: 20 }}>
                RÉPONSES <AcShim color={AC.shimmer}>DES JOUEURS</AcShim>
              </AcDisplay>
            </div>
            <div className="flex flex-col gap-2.5">
              {room.players.map((p) => {
                const entry = mergedEntry(p.id);
                return (
                  <PlayerAnswerRow
                    key={p.id}
                    name={p.name}
                    avatarColor={colorForPlayer(p.id)}
                    question={question}
                    answer={answer}
                    submitted={entry?.submitted ?? null}
                    validated={entry?.validated}
                    pointsAwarded={entry?.pointsAwarded}
                    isCreator={isCreator}
                    onValidate={(v) => handleValidate(p.id, v)}
                  />
                );
              })}
            </div>

            {isCreator ? (
              (() => {
                // Le créateur doit avoir noté chaque joueur (Bon ou Faux) avant
                // d'avancer.
                const pendingPlayers = room.players.filter((p) => {
                  const entry = mergedEntry(p.id);
                  return entry?.validated === undefined;
                });
                const allRated = pendingPlayers.length === 0;
                return (
                  <>
                    <div className="flex gap-2.5 mt-2">
                      <AcButton
                        variant="ghost"
                        size="md"
                        disabled={busy || currentIndex === 0}
                        onClick={() => handleNext('prev')}
                        icon={<AcGlyph kind="arrowLeft" color={AC.bone} size={12} />}
                      >
                        PRÉCÉDENT
                      </AcButton>
                      <AcButton
                        variant="primary"
                        size="md"
                        drip
                        disabled={busy || !allRated}
                        fullWidth
                        onClick={() => handleNext('next')}
                        icon={<AcGlyph kind="arrowRight" color={AC.ink} size={12} />}
                      >
                        {currentIndex >= total - 1 ? 'VOIR LE CLASSEMENT' : 'QUESTION SUIVANTE'}
                      </AcButton>
                    </div>
                    {!allRated && (
                      <div
                        className="mt-2 p-2 text-center"
                        style={{
                          fontFamily:
                            "'JetBrains Mono', 'Courier New', monospace",
                          fontSize: 11,
                          letterSpacing: '0.18em',
                          color: AC.gold,
                          border: `1.5px dashed ${AC.gold}`,
                          background: 'rgba(245,185,18,0.06)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {'// '}
                        {pendingPlayers.length === 1
                          ? `note encore ${pendingPlayers[0].name}`
                          : `note encore ${pendingPlayers.length} joueur${pendingPlayers.length > 1 ? 's' : ''} : ${pendingPlayers
                              .map((p) => p.name)
                              .join(', ')}`}
                      </div>
                    )}
                  </>
                );
              })()
            ) : (
              <div className="text-center mt-2">
                <AcStamp color={AC.bone2} rotate={-2}>
                  {'// en attente du créateur…'}
                </AcStamp>
              </div>
            )}
          </div>
        </div>
      </div>
    </AcScreen>
  );
}

// ========== Sous-composants ==========

function QuestionDisplay({ question }: { question: QuizCeoQuestion }) {
  const p = question.payload;
  switch (question.type) {
    case 'brand-logo':
    case 'worldle':
      return <ImageFrame url={String(p.imageUrl ?? '')} />;
    case 'bouffe-internationale':
    case 'panneau-signalisation': {
      const choices = (p.choices as string[]) ?? [];
      return (
        <div>
          <ImageFrame url={String(p.imageUrl ?? '')} />
          <div className="flex flex-col gap-1.5 mt-3">
            {choices.map((c, i) => (
              <div
                key={i}
                className="px-3 py-2"
                style={{
                  background: 'rgba(240,228,193,0.03)',
                  border: `1px dashed ${AC.bone2}`,
                  color: AC.bone,
                  fontSize: 13,
                  fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    color: AC.bone2,
                    fontSize: 11,
                    marginRight: 8,
                  }}
                >
                  {String.fromCharCode(65 + i)}.
                </span>
                {c}
              </div>
            ))}
          </div>
        </div>
      );
    }
    case 'lol-champion': {
      const lp = p as unknown as LolChampionPayload;
      return <LolChampionReviewDisplay payload={lp} />;
    }
    case 'lol-player-match': {
      const matchData = p as unknown as LolMatchCardData;
      return <LolMatchCard data={matchData} />;
    }
    case 'text-question':
    case 'expression':
    case 'translation':
    case 'country-motto':
    case 'who-said':
    case 'absurd-law':
    case 'acronyme-sigle':
      return (
        <div
          className="p-4"
          style={{
            background: 'rgba(245,185,18,0.05)',
            border: `1.5px dashed ${AC.gold}`,
            fontSize: 16,
            color: AC.bone,
            lineHeight: 1.5,
          }}
        >
          {String(p.text ?? '')}
        </div>
      );
    case 'zodiac-mbti':
    case 'slogan-pub':
    case 'know-era': {
      const choices = (p.choices as string[]) ?? [];
      return (
        <div>
          <div
            className="p-3 mb-3"
            style={{
              background: 'rgba(245,185,18,0.05)',
              border: `1.5px dashed ${AC.gold}`,
              fontSize: 15,
              color: AC.bone,
            }}
          >
            {String(p.text ?? '')}
          </div>
          <div className="flex flex-col gap-1.5">
            {choices.map((c, i) => (
              <div
                key={i}
                className="px-3 py-2"
                style={{
                  background: 'rgba(240,228,193,0.03)',
                  border: `1px dashed ${AC.bone2}`,
                  color: AC.bone,
                  fontSize: 13,
                  fontFamily:
                    "'Inter', 'Helvetica Neue', Arial, sans-serif",
                }}
              >
                <span
                  style={{
                    fontFamily:
                      "'JetBrains Mono', 'Courier New', monospace",
                    color: AC.bone2,
                    fontSize: 11,
                    marginRight: 8,
                  }}
                >
                  {String.fromCharCode(65 + i)}.
                </span>
                {c}
              </div>
            ))}
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}

function ImageFrame({ url }: { url: string }) {
  if (!url) return null;
  return (
    <div
      style={{
        width: '100%',
        maxHeight: 260,
        minHeight: 180,
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
          maxHeight: 260,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );
}

function LolChampionReviewDisplay({ payload }: { payload: LolChampionPayload }) {
  if (payload.mode === 'splash') {
    // En review on affiche le splash NORMAL (pas de filtre Contours) — la
    // partie est terminée pour cette question, le créateur a besoin de voir
    // le visuel original pour valider la réponse.
    return <ImageFrame url={payload.imageUrl} />;
  }
  // mode === 'spells' : disposition « Passif central » compacte (review =
  // vignette, on réduit les tailles vs le QuestionPlayer).
  const { iconUrls } = payload;
  const iconBorder: React.CSSProperties = {
    border: `1px solid ${AC.bone2}`,
    background: '#0a0907',
    display: 'block',
  };
  return (
    <div
      style={{
        background: 'rgba(13,11,8,0.5)',
        border: `2px solid ${AC.bone2}`,
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ position: 'relative', width: 160, height: 110 }}>
        <img
          src={iconUrls.p}
          alt="Passif"
          width={52}
          height={52}
          style={{
            ...iconBorder,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 52,
            height: 52,
          }}
        />
        <img
          src={iconUrls.q}
          alt="Q"
          width={36}
          height={36}
          style={{ ...iconBorder, position: 'absolute', top: 0, left: 0, width: 36, height: 36 }}
        />
        <img
          src={iconUrls.w}
          alt="W"
          width={36}
          height={36}
          style={{ ...iconBorder, position: 'absolute', top: 0, right: 0, width: 36, height: 36 }}
        />
        <img
          src={iconUrls.e}
          alt="E"
          width={36}
          height={36}
          style={{ ...iconBorder, position: 'absolute', bottom: 0, left: 0, width: 36, height: 36 }}
        />
        <img
          src={iconUrls.r}
          alt="R"
          width={36}
          height={36}
          style={{ ...iconBorder, position: 'absolute', bottom: 0, right: 0, width: 36, height: 36 }}
        />
      </div>
    </div>
  );
}

function CanonicalAnswer({ question }: { question: QuizCeoQuestion }) {
  const a = question.answer ?? {};
  switch (question.type) {
    case 'text-question':
    case 'expression':
    case 'translation':
    case 'country-motto':
    case 'brand-logo':
    case 'who-said':
    case 'lol-champion':
    case 'acronyme-sigle':
      return (
        <div
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 24,
            color: AC.chem,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
          }}
        >
          {String(a.text ?? '—')}
        </div>
      );
    case 'zodiac-mbti':
    case 'lol-player-match':
    case 'bouffe-internationale':
    case 'panneau-signalisation':
    case 'slogan-pub':
    case 'know-era': {
      const idx = Number(a.correctIndex ?? -1);
      const choices = (question.payload.choices as string[]) ?? [];
      return (
        <div
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 22,
            color: AC.chem,
          }}
        >
          {String.fromCharCode(65 + idx)}. {choices[idx] ?? '—'}
        </div>
      );
    }
    case 'absurd-law': {
      const v = Boolean(a.value);
      return (
        <div
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 26,
            color: v ? AC.chem : AC.rust,
            textTransform: 'uppercase',
          }}
        >
          {v ? 'VRAI' : 'FAUX'}
        </div>
      );
    }
    case 'worldle':
      return (
        <div
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 24,
            color: AC.chem,
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
          }}
        >
          {String(a.countryName ?? '—')}
        </div>
      );
    default:
      return <span style={{ color: AC.bone2 }}>—</span>;
  }
}

function PlayerAnswerRow({
  name,
  avatarColor,
  question,
  answer: _answer,
  submitted,
  validated,
  pointsAwarded,
  isCreator,
  onValidate,
}: {
  name: string;
  avatarColor: string;
  question: QuizCeoQuestion;
  answer: Record<string, unknown>;
  submitted: QuizCeoSubmitted;
  validated?: boolean;
  pointsAwarded?: number;
  isCreator: boolean;
  onValidate: (v: boolean) => void;
}) {
  void _answer;
  const submittedLabel = formatSubmitted(submitted, question);
  const isFullyValidated = validated === true;
  const isMarkedWrong = validated === false;

  // Bordure de couleur selon le verdict — feedback visuel pour les joueurs aussi.
  const borderColor = isFullyValidated
    ? AC.chem
    : isMarkedWrong
    ? AC.rust
    : undefined;

  return (
    <AcCard
      fold={false}
      dashed
      style={{
        padding: 12,
        borderColor,
      }}
    >
      <div className="flex items-center gap-3 mb-2">
        <AcAvatar name={name} color={avatarColor} size={32} />
        <span
          className="flex-1"
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            color: AC.bone,
          }}
        >
          {name}
        </span>
        {pointsAwarded !== undefined && pointsAwarded > 0 && (
          <span
            style={{
              background: AC.chem,
              color: AC.ink,
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              letterSpacing: '0.18em',
              padding: '2px 7px',
              fontWeight: 700,
            }}
          >
            +{pointsAwarded} pt{pointsAwarded > 1 ? 's' : ''}
          </span>
        )}
        {isMarkedWrong && (
          <span
            style={{
              background: AC.rust,
              color: AC.bone,
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              letterSpacing: '0.18em',
              padding: '2px 7px',
              fontWeight: 700,
            }}
          >
            ✗ FAUX
          </span>
        )}
      </div>
      <div
        className="mb-2 p-2"
        style={{
          background: isMarkedWrong
            ? 'rgba(200,68,30,0.08)'
            : 'rgba(240,228,193,0.03)',
          border: `1.5px dashed ${isMarkedWrong ? AC.rust : AC.bone2}`,
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 13,
          color: submittedLabel ? AC.bone : AC.bone2,
          minHeight: 28,
          textDecoration: isMarkedWrong ? 'line-through' : undefined,
          textDecorationColor: isMarkedWrong ? AC.rust : undefined,
        }}
      >
        {submittedLabel || '// aucune réponse'}
      </div>
      {isCreator && (
        <div className="flex flex-wrap gap-2">
          <ValidatePill
            label={`Bon (+${question.points})`}
            active={validated === true}
            color={AC.chem}
            onClick={() => onValidate(true)}
          />
          <ValidatePill
            label="Faux (0)"
            active={validated === false}
            color={AC.rust}
            onClick={() => onValidate(false)}
          />
        </div>
      )}
    </AcCard>
  );
}

function ValidatePill({
  label,
  active,
  color,
  onClick,
}: {
  label: string;
  active: boolean;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 12px',
        background: active ? color : 'transparent',
        border: `1.5px solid ${color}`,
        color: active ? AC.ink : color,
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        fontSize: 10,
        letterSpacing: '0.18em',
        fontWeight: 700,
        cursor: 'pointer',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </button>
  );
}

function formatSubmitted(
  s: QuizCeoSubmitted,
  question: QuizCeoQuestion,
): string {
  if (!s) return '';
  switch (s.kind) {
    case 'text':
      return `« ${s.value} »`;
    case 'choice': {
      const choices = (question.payload.choices as string[]) ?? [];
      return `${String.fromCharCode(65 + s.index)}. ${choices[s.index] ?? ''}`;
    }
    case 'boolean':
      return s.value ? 'VRAI' : 'FAUX';
  }
}
