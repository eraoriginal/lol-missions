'use client';

import { useEffect, useRef, useState } from 'react';
import type { Room } from '@/app/types/room';
import { BeatEikichiTimer } from './BeatEikichiTimer';
import { PlayerAnswerInput } from './PlayerAnswerInput';
import { PlayerScoreList } from './PlayerScoreList';
import type { CatalogEntry } from './AutocompleteInput';
import { BEAT_EIKICHI_CONFIG } from '@/lib/beatEikichi/config';
import { LeaveRoomButton } from '@/app/components/LeaveRoomButton';
import { BackToLobbyButton } from './BackToLobbyButton';
import { HintsPanel } from './HintsPanel';
import { ZoomPanImage } from './ZoomPanImage';

interface PlayingViewProps {
  room: Room;
  roomCode: string;
  playerToken: string;
  catalog: CatalogEntry[];
  refetch?: () => void;
}

export function PlayingView({
  room,
  roomCode,
  playerToken,
  catalog,
  refetch,
}: PlayingViewProps) {
  const game = room.beatEikichiGame!;
  const currentIndex = game.currentIndex;
  const total = BEAT_EIKICHI_CONFIG.QUESTIONS_PER_GAME;
  const question = game.questions[currentIndex];
  const timerSeconds = game.timerSeconds;

  const player = room.players.find((p) => p.token === playerToken);
  const state = player
    ? game.playerStates.find((s) => s.playerId === player.id)
    : null;
  const alreadyFound =
    state?.answers.some((a) => a.position === currentIndex && a.correct) ??
    false;

  const creatorPlayerId =
    room.players.find((p) => p.token === room.creatorToken)?.id ?? null;

  // Anti-double-trigger côté client pour /next.
  const nextTriggeredRef = useRef<number | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Garde une réf stable sur refetch pour l'utiliser depuis un setInterval.
  const refetchRef = useRef(refetch);
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state on prop change is intentional
    setImageLoaded(false);
    nextTriggeredRef.current = null;
  }, [currentIndex]);

  // Safeguard anti-desync : si le timer est dépassé depuis plus de 3 s sans que
  // currentIndex change (Pusher event raté, skipped "already advanced", etc.),
  // on force un refetch toutes les 2 s jusqu'à ce que l'état serveur arrive.
  useEffect(() => {
    if (!game.questionStartedAt) return;
    const startMs = new Date(game.questionStartedAt).getTime();
    const timerMs = timerSeconds * 1000;
    const id = setInterval(() => {
      const overshoot = Date.now() - startMs - timerMs;
      if (overshoot > 3000) {
        refetchRef.current?.();
      }
    }, 2000);
    return () => clearInterval(id);
  }, [game.questionStartedAt, currentIndex, timerSeconds]);

  // Mode "blur" : calcule l'intensité du flou qui diminue linéairement de MAX_BLUR
  // au début à 0 à (timerSeconds - 10). On recalcule toutes les ~300ms pour fluidité.
  const MAX_BLUR_PX = 20;
  const [blurPx, setBlurPx] = useState(() =>
    game.mode === 'blur' ? MAX_BLUR_PX : 0,
  );
  useEffect(() => {
    if (game.mode !== 'blur' || !game.questionStartedAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state on mode/prop change is intentional
      setBlurPx(0);
      return;
    }
    const startMs = new Date(game.questionStartedAt).getTime();
    const fadeMs = Math.max(1000, (timerSeconds - 10) * 1000);
    const tick = () => {
      const elapsedMs = Date.now() - startMs;
      const ratio = Math.max(0, Math.min(1, elapsedMs / fadeMs));
      setBlurPx(MAX_BLUR_PX * (1 - ratio));
    };
    tick();
    const id = setInterval(tick, 300);
    return () => clearInterval(id);
  }, [game.mode, game.questionStartedAt, timerSeconds]);

  const handleTimeout = async () => {
    if (nextTriggeredRef.current === currentIndex) return;
    nextTriggeredRef.current = currentIndex;
    try {
      const res = await fetch(`/api/games/beat-eikichi/${roomCode}/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerToken,
          expectedIndex: currentIndex,
        }),
      });
      const data: { ok?: boolean; skipped?: string } = await res
        .json()
        .catch(() => ({}));

      // Si le serveur dit "déjà avancé", c'est qu'un autre client a fait avancer
      // la question et notre état est désynchronisé. On force un refetch immédiat
      // pour se resynchroniser (on ne peut pas compter sur Pusher seul).
      if (data.skipped === 'already advanced') {
        refetchRef.current?.();
        return;
      }

      // Si le serveur a rejeté parce que son horloge trouve le timer pas écoulé
      // (décalage d'horloge client/serveur), on relâche le verrou pour retenter
      // 1 s plus tard.
      if (!res.ok || data.skipped === 'timer not elapsed') {
        setTimeout(() => {
          if (nextTriggeredRef.current === currentIndex) {
            nextTriggeredRef.current = null;
          }
        }, 1000);
      }
    } catch {
      nextTriggeredRef.current = null;
    }
  };

  if (!question) {
    return (
      <div className="min-h-screen arcane-bg p-8 text-purple-100">
        Chargement de la question…
      </div>
    );
  }

  return (
    <div className="min-h-screen arcane-bg p-4 md:p-6">
      <div className="max-w-7xl mx-auto flex justify-end items-center gap-2 mb-3">
        <BackToLobbyButton roomCode={roomCode} />
        <LeaveRoomButton roomCode={roomCode} />
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 md:gap-6">
        {/* Colonne centrale : image + timer + input */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-purple-300/70">
              Question{' '}
              <span className="text-purple-100 font-semibold">
                {currentIndex + 1}
              </span>
              {' / '}
              {total}
            </div>
            <BeatEikichiTimer
              questionStartedAt={game.questionStartedAt}
              timerSeconds={timerSeconds}
              onTimeout={handleTimeout}
            />
          </div>

          <div className="arcane-card p-0 aspect-[16/10] overflow-hidden bg-black/40">
            {question.imageUrl ? (
              <ZoomPanImage
                src={question.imageUrl}
                alt="Devine le jeu"
                onLoad={() => setImageLoaded(true)}
                className={`object-contain transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                blurPx={blurPx}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-purple-300/50">
                Image indisponible
              </div>
            )}
          </div>

          <div>
            <PlayerAnswerInput
              roomCode={roomCode}
              playerToken={playerToken}
              catalog={catalog}
              alreadyFound={alreadyFound}
              questionKey={currentIndex}
            />
          </div>

          {room.beatEikichiHintsEnabled && (
            <HintsPanel
              questionStartedAt={game.questionStartedAt}
              timerSeconds={timerSeconds}
              hintGenre={question.hintGenre ?? null}
              hintTerm={question.hintTerm ?? null}
              hintPlatforms={question.hintPlatforms ?? null}
            />
          )}
        </div>

        {/* Colonne droite : liste des joueurs */}
        <div className="lg:sticky lg:top-6 self-start">
          <PlayerScoreList
            players={room.players}
            playerStates={game.playerStates}
            currentIndex={currentIndex}
            creatorPlayerId={creatorPlayerId}
            eikichiPlayerId={game.eikichiPlayerId}
          />
        </div>
      </div>
    </div>
  );
}
