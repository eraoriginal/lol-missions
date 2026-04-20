'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
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
import { WeaponBlock } from './WeaponBlock';
import { ShieldBlock } from './ShieldBlock';
import {
  WeaponEffectOverlay,
  isShielded,
  isTornadoActive,
} from './WeaponEffectOverlay';
import { getWeapon } from '@/lib/beatEikichi/weapons';

type ToastType = 'success' | 'error' | 'warning' | 'info';
interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

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

  // État de l'arme + bouclier du joueur courant.
  const myWeaponId = state?.weaponId ?? null;
  const myUsesLeft = state?.weaponUsesLeft ?? 0;
  const myShieldUsesLeft = state?.shieldUsesLeft ?? 0;

  // Mode ciblage : on arme, les avatars deviennent cliquables.
  const [targeting, setTargeting] = useState(false);

  // Reset le mode ciblage quand la question change.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state on prop change is intentional
    setTargeting(false);
  }, [currentIndex]);

  const handleFireWeapon = async (targetPlayerId: string) => {
    setTargeting(false);
    try {
      await fetch(`/api/games/beat-eikichi/${roomCode}/fire-weapon`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerToken, targetPlayerId }),
      });
    } catch {
      /* pushRoomUpdate finira par rattraper, ou pas */
    }
  };

  // Activation du bouclier (route séparée, indépendant de l'arme).
  const handleFireShield = async () => {
    try {
      const res = await fetch(`/api/games/beat-eikichi/${roomCode}/fire-shield`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerToken }),
      });
      if (res.ok) {
        addToast('Bouclier armé pour la prochaine question', 'info');
      }
    } catch {
      /* pushRoomUpdate finira par rattraper, ou pas */
    }
  };

  // Bouclier déjà armé pour la prochaine question ?
  const shieldArmed = (game.weaponEvents ?? []).some(
    (e) =>
      e.weaponId === 'shield' &&
      e.targetPlayerId === player?.id &&
      e.questionIndex === currentIndex + 1,
  );

  // ---------- Toasts (notifications affichées à la question où l'effet atterrit) ----------
  // Le défenseur n'est PAS prévenu au moment du tir ; il découvre l'attaque (ou son
  // blocage par bouclier) seulement quand elle atterrit à la question courante.
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seenLandingRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const toastIdRef = useRef(0);

  const addToast = useCallback((message: string, type: ToastType) => {
    const id = `bek-toast-${++toastIdRef.current}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, [setToasts]);

  useEffect(() => {
    const events = game.weaponEvents ?? [];

    // Au premier mount, on considère tous les events existants comme "déjà vus"
    // pour éviter de spammer les toasts au chargement de la page en cours de partie.
    if (!initializedRef.current) {
      events.forEach((e) => {
        seenLandingRef.current.add(e.id);
      });
      initializedRef.current = true;
      return;
    }

    const myId = player?.id ?? null;
    if (!myId) return;

    // Events qui "atterrissent" à la question courante.
    for (const ev of events) {
      if (seenLandingRef.current.has(ev.id)) continue;
      if (ev.questionIndex !== currentIndex) continue;
      if (ev.weaponId === 'shield') continue;

      seenLandingRef.current.add(ev.id);
      const attacker = room.players.find((p) => p.id === ev.firedByPlayerId);
      const weapon = getWeapon(ev.weaponId);
      const targetShielded = isShielded(
        events,
        ev.targetPlayerId,
        currentIndex,
      );

      if (ev.targetPlayerId === myId) {
        if (targetShielded) {
          addToast(
            `Tu as empêché l'attaque de ${attacker?.name ?? 'un joueur'}`,
            'success',
          );
        } else {
          addToast(
            `${attacker?.name ?? 'Un joueur'} a utilisé ${weapon?.name ?? ev.weaponId}`,
            'warning',
          );
        }
      }
      if (ev.firedByPlayerId === myId && targetShielded) {
        addToast(`L'attaque a échouée`, 'error');
      }
    }
  }, [game.weaponEvents, currentIndex, player?.id, room.players, addToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Escape annule le ciblage.
  useEffect(() => {
    if (!targeting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTargeting(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [targeting]);

  // Tick pour réévaluer quels effets d'arme sont actifs sur le joueur courant
  // (tornade nécessite une re-évaluation périodique car son état dépend du temps).
  const [fxNow, setFxNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setFxNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);
  const tornadoActive = isTornadoActive(
    game.weaponEvents ?? [],
    player?.id ?? null,
    currentIndex,
    fxNow,
  );

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
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr_280px] gap-4 md:gap-6">
        {/* Colonne gauche : arme du joueur */}
        <div className="order-2 lg:order-1 lg:sticky lg:top-6 self-start space-y-3">
          <WeaponBlock
            weaponId={myWeaponId}
            usesLeft={myUsesLeft}
            targeting={targeting}
            onStartTargeting={() => setTargeting(true)}
            onCancelTargeting={() => setTargeting(false)}
          />
          <ShieldBlock
            usesLeft={myShieldUsesLeft}
            armed={shieldArmed}
            onFire={handleFireShield}
          />
        </div>

        {/* Colonne centrale : image + timer + input */}
        <div className="order-1 lg:order-2 space-y-4">
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

          <div className="arcane-card p-0 aspect-[16/10] overflow-hidden bg-black/40 relative">
            {question.imageUrl ? (
              <ZoomPanImage
                src={question.imageUrl}
                alt="Devine le jeu"
                onLoad={() => setImageLoaded(true)}
                className={`object-contain transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                blurPx={blurPx}
                rotating={tornadoActive}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-purple-300/50">
                Image indisponible
              </div>
            )}
            {/* Effets d'armes ciblant le joueur courant, rendus en overlay. */}
            {question.imageUrl && player && (game.weaponEvents?.length ?? 0) > 0 && (
              <WeaponEffectOverlay
                events={game.weaponEvents ?? []}
                myPlayerId={player.id}
                currentQuestionIndex={currentIndex}
                imageUrl={question.imageUrl}
              />
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
        <div className="order-3 lg:sticky lg:top-6 self-start">
          <PlayerScoreList
            players={room.players}
            playerStates={game.playerStates}
            currentIndex={currentIndex}
            creatorPlayerId={creatorPlayerId}
            eikichiPlayerId={game.eikichiPlayerId}
            targetingMode={targeting}
            selfPlayerId={player?.id ?? null}
            onTargetPlayer={handleFireWeapon}
          />
        </div>
      </div>

      {/* Stack de toasts : warnings d'attaque, résultats d'attaque, blocages de bouclier. */}
      {toasts.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
          {toasts.map((t) => (
            <BeatEikichiToast
              key={t.id}
              message={t.message}
              type={t.type}
              onClose={() => removeToast(t.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BeatEikichiToast({
  message,
  type,
  onClose,
}: {
  message: string;
  type: ToastType;
  onClose: () => void;
}) {
  const colorClass = {
    success: 'from-emerald-600 to-emerald-700 border-emerald-500/60',
    error: 'from-red-600 to-red-700 border-red-500/60',
    warning: 'from-orange-600 to-amber-700 border-orange-500/60',
    info: 'from-cyan-600 to-cyan-700 border-cyan-500/60',
  }[type];
  const icon = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' }[type];

  return (
    <div
      className={`bg-gradient-to-r ${colorClass} text-white px-5 py-3 rounded-lg shadow-xl border flex items-center gap-3 min-w-[280px] max-w-md animate-slide-in pointer-events-auto`}
    >
      <span className="text-xl">{icon}</span>
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="text-white/70 hover:text-white transition text-sm"
        aria-label="Fermer"
      >
        ✕
      </button>
    </div>
  );
}
