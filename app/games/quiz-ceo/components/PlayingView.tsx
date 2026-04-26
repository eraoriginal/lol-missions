'use client';

import { useEffect, useRef, useState } from 'react';
import type { Room, QuizCeoSubmitted } from '@/app/types/room';
import { LeaveRoomButton } from '@/app/components/LeaveRoomButton';
import { BackToLobbyButton } from './BackToLobbyButton';
import { QuestionPlayer } from './QuestionPlayer';
import {
  AC,
  AcCard,
  AcDottedLabel,
  AcGraffitiLayer,
  AcPaintedBar,
  AcScreen,
  AcStamp,
} from '@/app/components/arcane';

interface Props {
  room: Room;
  roomCode: string;
  playerToken: string;
  refetch?: () => void;
}

export function PlayingView({ room, roomCode, playerToken, refetch }: Props) {
  const game = room.quizCeoGame!;
  const total = game.questions.length;
  const currentIndex = game.currentIndex;
  const question = game.questions[currentIndex];
  const me = room.players.find((p) => p.token === playerToken) ?? null;
  const myState = me
    ? game.playerStates.find((s) => s.playerId === me.id) ?? null
    : null;

  const myAnswerEntry = myState?.answers.find((a) => a.position === currentIndex);
  const [draftValue, setDraftValue] = useState<QuizCeoSubmitted>(
    myAnswerEntry?.submitted ?? null,
  );

  // Resync le brouillon quand on change de question. Pattern "derived state
  // from previous render" recommandé par React plutôt que useEffect.
  const [lastIdx, setLastIdx] = useState<number>(currentIndex);
  if (lastIdx !== currentIndex) {
    setLastIdx(currentIndex);
    setDraftValue(myAnswerEntry?.submitted ?? null);
  }

  // Timer local décompté à partir de questionStartedAt. On laisse `secondsLeft`
  // descendre en négatif (jusqu'à -∞) pour que l'effet retry ci-dessous
  // continue à re-fire après expiration. L'UI clamp à [0, timerSeconds] via
  // `timerFrac`, donc l'affichage reste propre.
  const computeLeft = () => {
    if (!game.questionStartedAt) return game.timerSeconds;
    const started = new Date(game.questionStartedAt).getTime();
    return game.timerSeconds - (Date.now() - started) / 1000;
  };
  const [secondsLeft, setSecondsLeft] = useState<number>(() => computeLeft());
  const [lastStart, setLastStart] = useState<string | null>(
    game.questionStartedAt,
  );
  if (lastStart !== game.questionStartedAt) {
    setLastStart(game.questionStartedAt);
    setSecondsLeft(computeLeft());
  }
  useEffect(() => {
    if (!game.questionStartedAt) return;
    const started = new Date(game.questionStartedAt).getTime();
    const id = setInterval(() => {
      setSecondsLeft(game.timerSeconds - (Date.now() - started) / 1000);
    }, 200);
    return () => clearInterval(id);
  }, [game.questionStartedAt, game.timerSeconds]);

  // Auto-submit (debounce) dès que l'utilisateur modifie sa réponse.
  const submitTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submit = (value: QuizCeoSubmitted) => {
    if (!value) return;
    fetch(`/api/games/quiz-ceo/${roomCode}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerToken, submitted: value }),
    }).catch(() => {});
  };
  const scheduleSubmit = (value: QuizCeoSubmitted) => {
    if (submitTimeout.current) clearTimeout(submitTimeout.current);
    submitTimeout.current = setTimeout(() => submit(value), 500);
  };

  const handleChange = (value: QuizCeoSubmitted) => {
    setDraftValue(value);
    scheduleSubmit(value);
  };

  // Appel /next à expiration (chaque client le fait, idempotent côté serveur).
  // Avec retry agressif : on re-call /next toutes les 800ms tant que la
  // question n'a pas avancé (cas où le 1er appel a renvoyé `skipped: 'too-early'`
  // pour clock drift, ou si le push Pusher s'est perdu). Chaque appel est
  // suivi d'un refetch pour rattraper rapidement la nouvelle phase si le
  // serveur a déjà avancé sans qu'on l'ait appris via Pusher.
  const nextCalledForIndexRef = useRef<number>(-1);
  const nextLastCalledAtRef = useRef<number>(0);
  useEffect(() => {
    if (secondsLeft > 0) return;
    const now = Date.now();
    const sameIndex = nextCalledForIndexRef.current === currentIndex;
    const recentlyCalled = sameIndex && now - nextLastCalledAtRef.current < 800;
    if (recentlyCalled) return;
    nextCalledForIndexRef.current = currentIndex;
    nextLastCalledAtRef.current = now;
    // Première tentative pour cet index : on soumet la réponse courante au
    // cas où le debounce n'a pas fire. Sur une retry on n'a plus besoin.
    if (!sameIndex) {
      if (submitTimeout.current) {
        clearTimeout(submitTimeout.current);
        submitTimeout.current = null;
      }
      if (draftValue) {
        fetch(`/api/games/quiz-ceo/${roomCode}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerToken, submitted: draftValue }),
        }).catch(() => {});
      }
    }
    fetch(`/api/games/quiz-ceo/${roomCode}/next`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expectedIndex: currentIndex }),
    })
      .catch(() => {})
      // Refetch systématique après /next : si le push Pusher est rapide on
      // n'a pas besoin (le push a déjà refetché), si le push tarde ou flanche
      // on rattrape immédiatement la nouvelle phase.
      .finally(() => refetch?.());
  }, [secondsLeft, currentIndex, draftValue, roomCode, playerToken, refetch]);

  // Combien de joueurs ont répondu à cette question (visible uniquement par le créateur
  // côté backend — pour les joueurs non-créateurs on ne voit que son propre état).
  const submittedCount = game.playerStates.filter((s) =>
    s.answers.some((a) => a.position === currentIndex),
  ).length;

  const timerFrac = Math.max(0, Math.min(1, secondsLeft / game.timerSeconds));

  if (!question) {
    return (
      <AcScreen>
        <div className="min-h-screen flex items-center justify-center">
          <AcStamp color={AC.bone2} rotate={-2}>{'// question introuvable'}</AcStamp>
        </div>
      </AcScreen>
    );
  }

  return (
    <AcScreen>
      <AcGraffitiLayer density="normal" />
      <div
        className="relative mx-auto px-4 sm:px-8 py-6 sm:py-9"
        style={{ maxWidth: 1200 }}
      >
        {/* Top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3 flex-wrap">
            <BackToLobbyButton roomCode={roomCode} />
            <AcDottedLabel>{'// PARTIE EN COURS'}</AcDottedLabel>
          </div>
          <LeaveRoomButton roomCode={roomCode} />
        </div>

        {/* Header timer + progress + compteur compact */}
        <div className="mb-5">
          <div className="flex justify-between items-baseline mb-1.5 gap-3 flex-wrap">
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
            <div className="flex items-baseline gap-4">
              <span
                style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: 11,
                  letterSpacing: '0.22em',
                  color: AC.bone2,
                  textTransform: 'uppercase',
                }}
              >
                {'// '}
                {submittedCount}/{room.players.length} répondu
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontWeight: 700,
                  fontSize: 26,
                  color: secondsLeft < 6 ? AC.rust : AC.gold,
                }}
              >
                {Math.max(0, Math.ceil(secondsLeft))}s
              </span>
            </div>
          </div>
          <AcPaintedBar
            value={timerFrac}
            color={secondsLeft < 6 ? AC.rust : AC.gold}
          />
        </div>

        {/* Question + input — pleine largeur, plus de respiration.
            La `key` force un remount complet entre 2 questions pour vider
            les inputs non-contrôlés (number, drag state, etc.). */}
        <AcCard fold={false} style={{ padding: 28 }}>
          <QuestionPlayer
            key={`q-${currentIndex}`}
            question={question}
            initialValue={draftValue}
            onChange={handleChange}
            disabled={secondsLeft <= 0}
          />
        </AcCard>

        <div
          className="mt-4 text-center"
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 11,
            letterSpacing: '0.22em',
            color: AC.bone2,
            textTransform: 'uppercase',
          }}
        >
          {'// réponse sauvegardée automatiquement'}
        </div>
      </div>
    </AcScreen>
  );
}
