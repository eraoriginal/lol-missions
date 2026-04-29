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
import {
  AC,
  AC_IMAGE_FRAME_CLIP,
  AcDashed,
  AcGlyph,
  AcPaintedBar,
  AcScreen,
  AcSectionNum,
  AcToast,
  AcToastStack,
  type AcGlyphKind,
  type AcToastTone,
} from '@/app/components/arcane';

interface ToastItem {
  id: string;
  tone: AcToastTone;
  tape: string;
  title: string;
  subtitle?: string;
  iconKind: AcGlyphKind;
  iconColor: string;
  drip?: boolean;
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
  const myAnswer = state?.answers.find((a) => a.position === currentIndex);
  const alreadyFound = myAnswer?.correct ?? false;
  const foundAtSeconds =
    myAnswer?.correct && myAnswer.answeredAtMs != null
      ? myAnswer.answeredAtMs / 1000
      : null;

  const creatorPlayerId =
    room.players.find((p) => p.token === room.creatorToken)?.id ?? null;

  const myWeaponId = state?.weaponId ?? null;
  const myUsesLeft = state?.weaponUsesLeft ?? 0;
  const myShieldUsesLeft = state?.shieldUsesLeft ?? 0;

  const [targeting, setTargeting] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on prop change is intentional
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

  const handleFireShield = async () => {
    try {
      const res = await fetch(
        `/api/games/beat-eikichi/${roomCode}/fire-shield`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerToken }),
        },
      );
      if (res.ok) {
        addToast({
          tone: 'info',
          tape: '// BOUCLIER',
          title: 'Bouclier armé pour la prochaine question',
          subtitle: '// toute attaque reçue sera annulée',
          iconKind: 'shield',
          iconColor: AC.hex,
        });
      }
    } catch {
      /* pushRoomUpdate finira par rattraper, ou pas */
    }
  };

  const shieldArmed = (game.weaponEvents ?? []).some(
    (e) =>
      e.weaponId === 'shield' &&
      e.targetPlayerId === player?.id &&
      e.questionIndex === currentIndex + 1,
  );

  // Toasts : notifs d'attaque/blocage, affichées à la question où l'effet atterrit.
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const seenLandingRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);
  const toastIdRef = useRef(0);

  const addToast = useCallback(
    (t: Omit<ToastItem, 'id'>) => {
      const id = `bek-toast-${++toastIdRef.current}`;
      setToasts((prev) => [...prev, { id, ...t }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((x) => x.id !== id));
      }, 5000);
    },
    [setToasts],
  );

  /** Helper : mapper un weapon.id vers un glyph adéquat pour les toasts. */
  const weaponGlyph = (weaponId: string): AcGlyphKind => {
    const map: Record<string, AcGlyphKind> = {
      smoke: 'smoke',
      c4: 'bomb',
      blade: 'saber',
      freeze: 'ice',
      zoomghost: 'zoom',
      tornado: 'tornado',
      puzzle: 'puzzle',
      speed: 'speed',
      tag: 'flame',
      glitch: 'lightning',
      acid: 'thermometer',
      strobe: 'target',
    };
    return map[weaponId] ?? 'flame';
  };

  useEffect(() => {
    const events = game.weaponEvents ?? [];
    if (!initializedRef.current) {
      events.forEach((e) => {
        seenLandingRef.current.add(e.id);
      });
      initializedRef.current = true;
      return;
    }
    const myId = player?.id ?? null;
    if (!myId) return;

    for (const ev of events) {
      if (seenLandingRef.current.has(ev.id)) continue;
      if (ev.questionIndex !== currentIndex) continue;
      if (ev.weaponId === 'shield') continue;

      seenLandingRef.current.add(ev.id);
      const attacker = room.players.find((p) => p.id === ev.firedByPlayerId);
      const weapon = getWeapon(ev.weaponId);
      const targetShielded = isShielded(events, ev.targetPlayerId, currentIndex);

      if (ev.targetPlayerId === myId) {
        if (targetShielded) {
          addToast({
            tone: 'success',
            tape: '// BOUCLIER',
            title: `Tu as bloqué l'attaque de ${attacker?.name ?? 'un joueur'}`,
            subtitle: `// ${weapon?.name.toLowerCase() ?? ev.weaponId} · bouclier consommé`,
            iconKind: 'shield',
            iconColor: AC.chem,
            drip: true,
          });
        } else {
          addToast({
            tone: 'shimmer',
            tape: '// ATTAQUE REÇUE',
            title: `${weapon?.name ?? ev.weaponId} lancé par ${attacker?.name ?? 'un joueur'}`,
            subtitle: '// effet actif sur cette question',
            iconKind: weaponGlyph(ev.weaponId),
            iconColor: AC.shimmer,
            drip: true,
          });
        }
      }
      if (ev.firedByPlayerId === myId && targetShielded) {
        addToast({
          tone: 'warning',
          tape: '// ATTAQUE',
          title: "L'attaque a échoué",
          subtitle: `// ${weapon?.name.toLowerCase() ?? ev.weaponId} bloqué par un bouclier`,
          iconKind: 'x',
          iconColor: AC.gold,
        });
      }
    }
  }, [game.weaponEvents, currentIndex, player?.id, room.players, addToast]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    if (!targeting) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setTargeting(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [targeting]);

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

  // Throttle des appels /next : un retry max toutes les 800 ms tant que la
  // question courante n'a pas avancé. Ce pattern (porté de Quiz CEO) couvre :
  //   - le push Pusher perdu (le client retente jusqu'à voir currentIndex bouger)
  //   - les `skipped: 'timer not elapsed'` du serveur (clock drift) → on retry
  //   - les `skipped: 'already advanced'` (le push arrive plus tard, refetch
  //     systématique synchronise immédiatement)
  // Ne pas remplacer par un one-shot `nextTriggeredRef`-style : si le 1er appel
  // échoue silencieusement (réseau, cache, race), le client restait coincé sur
  // la question expirée sans jamais retenter.
  const nextCalledForIdxRef = useRef<number>(-1);
  const nextLastCalledAtRef = useRef<number>(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const refetchRef = useRef(refetch);
  useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on prop change is intentional
    setImageLoaded(false);
    // Reset des refs de throttle à chaque nouvelle question : le retry repart
    // d'une fenêtre fraîche.
    nextCalledForIdxRef.current = -1;
    nextLastCalledAtRef.current = 0;
  }, [currentIndex]);

  // Safeguard anti-desync : si le timer est dépassé depuis plus de 3 s sans que
  // currentIndex change, on force un refetch toutes les 2 s.
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

  // Mode blur : intensité du flou qui diminue linéairement jusqu'à (timerSeconds - 10).
  const MAX_BLUR_PX = 20;
  const [blurPx, setBlurPx] = useState(() =>
    game.mode === 'blur' ? MAX_BLUR_PX : 0,
  );
  useEffect(() => {
    if (game.mode !== 'blur' || !game.questionStartedAt) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on mode/prop change
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

  const handleTimeout = useCallback(async () => {
    const now = Date.now();
    const sameIdx = nextCalledForIdxRef.current === currentIndex;
    // Throttle : 800 ms entre 2 appels sur le même index. Tant que le serveur
    // n'a pas confirmé le passage (currentIndex change), on retente.
    if (sameIdx && now - nextLastCalledAtRef.current < 800) return;
    nextCalledForIdxRef.current = currentIndex;
    nextLastCalledAtRef.current = now;
    try {
      await fetch(`/api/games/beat-eikichi/${roomCode}/next`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerToken,
          expectedIndex: currentIndex,
        }),
      });
    } catch {
      /* ignore : on retente au tick suivant tant que currentIndex ne bouge pas */
    }
    // Refetch SYSTÉMATIQUE après chaque tentative : si le push Pusher est
    // perdu, c'est ce refetch qui synchronise le client à l'état serveur.
    refetchRef.current?.();
  }, [currentIndex, roomCode, playerToken]);

  // Tick pour calculer le pct du timer bar. 500ms = ~2 updates/sec, assez
  // fluide pour une barre de progression sans déclencher un re-render toutes
  // les 250ms (qui cascade tous les filtres SVG du playing view).
  const [timerPct, setTimerPct] = useState(1);
  useEffect(() => {
    if (!game.questionStartedAt) return;
    const startMs = new Date(game.questionStartedAt).getTime();
    const tick = () => {
      const elapsed = (Date.now() - startMs) / 1000;
      const left = Math.max(0, timerSeconds - elapsed);
      setTimerPct(left / timerSeconds);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [game.questionStartedAt, timerSeconds]);
  const urgent = timerPct * timerSeconds <= 10;

  if (!question) {
    return (
      <AcScreen>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 14,
            color: AC.bone2,
          }}
        >
          {'// chargement de la question…'}
        </div>
      </AcScreen>
    );
  }

  return (
    <AcScreen>
      {/* Perf : pas de splat ni de graffiti layer ici — l'écran de jeu tick
          toutes les 250ms (timer bar) et re-render fréquemment (Pusher).
          Garder les filtres SVG au strict nécessaire pour que les clicks
          restent réactifs. La déco se concentre sur homepage / lobby / review. */}
      <div
        className="relative mx-auto px-4 sm:px-8 py-5 sm:py-7"
        style={{ maxWidth: 1240 }}
      >
        {/* TOP STRIP : Question X/Y · Timer + bar · Lobby/Quitter */}
        <div className="grid gap-3.5 sm:grid-cols-[1fr_1.2fr_1fr] items-center mb-4">
          <div className="flex items-center gap-2.5 flex-wrap">
            <AcSectionNum n={currentIndex + 1} />
            <span
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 12,
                letterSpacing: '0.2em',
                color: AC.bone2,
              }}
            >
              QUESTION {String(currentIndex + 1).padStart(2, '0')} /{' '}
              {String(total).padStart(2, '0')}
            </span>
          </div>
          <div className="flex items-center gap-3.5 sm:justify-center">
            <BeatEikichiTimer
              questionStartedAt={game.questionStartedAt}
              timerSeconds={timerSeconds}
              onTimeout={handleTimeout}
            />
            <div className="flex-1 min-w-[140px]">
              <AcPaintedBar
                value={timerPct}
                color={urgent ? AC.rust : AC.chem}
              />
              <div
                style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: 9,
                  letterSpacing: '0.2em',
                  color: AC.bone2,
                  marginTop: 4,
                }}
              >
                {'// '}
                {Math.round(timerPct * timerSeconds)}s / {timerSeconds}s
              </div>
            </div>
          </div>
          <div className="flex gap-2 sm:justify-end flex-wrap">
            <BackToLobbyButton roomCode={roomCode} />
            <LeaveRoomButton roomCode={roomCode} />
          </div>
        </div>

        <AcDashed style={{ marginBottom: 16 }} />

        {/* Arme + Bouclier */}
        <div className="grid gap-3.5 md:grid-cols-2 mb-3.5">
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

        {/* Joueurs — pleine largeur pour accueillir jusqu'à 12 joueurs */}
        <div className="mb-5">
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

        {/* Image + optionnel panneau indices */}
        <div
          className="grid gap-4 items-start"
          style={{
            gridTemplateColumns:
              room.beatEikichiHintsEnabled ? 'minmax(0,1fr) 240px' : 'minmax(0,1fr)',
          }}
        >
          <div>
            <div
              className="relative overflow-hidden"
              style={{
                aspectRatio: '16 / 10',
                background: 'rgba(0,0,0,0.55)',
                clipPath: AC_IMAGE_FRAME_CLIP,
                boxShadow: `inset 0 0 0 2px ${AC.bone}`,
              }}
            >
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
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{
                    color: AC.bone2,
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  }}
                >
                  {'// image indisponible'}
                </div>
              )}
              {question.imageUrl &&
                player &&
                (game.weaponEvents?.length ?? 0) > 0 && (
                  <WeaponEffectOverlay
                    events={game.weaponEvents ?? []}
                    myPlayerId={player.id}
                    currentQuestionIndex={currentIndex}
                    imageUrl={question.imageUrl}
                    questionStartedAt={game.questionStartedAt ?? null}
                    timerSeconds={timerSeconds}
                  />
                )}
            </div>

            {/* Input + feedback ribbon / found banner */}
            <div className="mt-5">
              <PlayerAnswerInput
                roomCode={roomCode}
                playerToken={playerToken}
                catalog={catalog}
                alreadyFound={alreadyFound}
                questionKey={currentIndex}
                currentIndex={currentIndex}
                foundAtSeconds={foundAtSeconds}
              />
            </div>
          </div>

          {/* Hints panel (desktop only) */}
          {room.beatEikichiHintsEnabled && (
            <div className="hidden md:block">
              <HintsPanel
                questionStartedAt={game.questionStartedAt}
                timerSeconds={timerSeconds}
                hintGenre={question.hintGenre ?? null}
                hintTerm={question.hintTerm ?? null}
                hintPlatforms={question.hintPlatforms ?? null}
              />
            </div>
          )}
        </div>
      </div>

      {/* Toasts en haut à droite — primitive AcToast (riche : tape + icon + subtitle + drip) */}
      {toasts.length > 0 && (
        <AcToastStack>
          {toasts.map((t) => (
            <AcToast
              key={t.id}
              tone={t.tone}
              tape={t.tape}
              title={t.title}
              subtitle={t.subtitle}
              icon={
                <AcGlyph
                  kind={t.iconKind}
                  color={t.iconColor}
                  size={22}
                  stroke={3}
                />
              }
              drip={t.drip}
              onClose={() => removeToast(t.id)}
            />
          ))}
        </AcToastStack>
      )}
    </AcScreen>
  );
}
