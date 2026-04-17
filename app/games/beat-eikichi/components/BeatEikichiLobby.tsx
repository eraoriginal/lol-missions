'use client';

import { useEffect, useState } from 'react';
import type { Room } from '@/app/types/room';
import { LeaveRoomButton } from '@/app/components/LeaveRoomButton';

interface BeatEikichiLobbyProps {
  room: Room;
  roomCode: string;
}

export function BeatEikichiLobby({ room, roomCode }: BeatEikichiLobbyProps) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const creatorToken =
    typeof window !== 'undefined'
      ? localStorage.getItem(`room_${roomCode}_creator`)
      : null;
  const isCreator = !!creatorToken;

  // La source de vérité est le serveur (room.beatEikichiEikichiId) — partagée par Pusher.
  const eikichiPlayerId = room.beatEikichiEikichiId ?? null;
  const eikichiPlayer = room.players.find((p) => p.id === eikichiPlayerId);
  const hintsEnabled = room.beatEikichiHintsEnabled ?? false;
  const timerSeconds = room.beatEikichiTimerSeconds ?? 30;
  const mode: 'standard' | 'blur' = room.beatEikichiMode ?? 'standard';

  // État local pour le champ timer : permet de taper librement avant de persister.
  const [timerInput, setTimerInput] = useState(String(timerSeconds));
  useEffect(() => {
    // Si la source serveur change (autre client), on sync l'input pour rester aligné.
    setTimerInput(String(timerSeconds));
  }, [timerSeconds]);

  const handleSetTimer = async (value: number) => {
    if (!creatorToken) return;
    const clamped = Math.max(10, Math.min(300, Math.round(value)));
    try {
      await fetch(`/api/games/beat-eikichi/${roomCode}/set-timer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorToken, timerSeconds: clamped }),
      });
    } catch {
      /* ignore */
    }
  };

  const handleSetMode = async (newMode: 'standard' | 'blur') => {
    if (!creatorToken) return;
    try {
      await fetch(`/api/games/beat-eikichi/${roomCode}/set-mode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorToken, mode: newMode }),
      });
    } catch {
      /* ignore */
    }
  };

  const handleToggleHints = async (enabled: boolean) => {
    if (!creatorToken) return;
    try {
      await fetch(`/api/games/beat-eikichi/${roomCode}/set-hints-enabled`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorToken, enabled }),
      });
    } catch {
      /* ignore */
    }
  };

  const handleSetEikichi = async (newId: string | null) => {
    if (!creatorToken) return;
    try {
      await fetch(`/api/games/beat-eikichi/${roomCode}/set-eikichi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorToken, eikichiPlayerId: newId }),
      });
    } catch {
      /* on ignore, Pusher finira par rattraper */
    }
  };

  const handleStart = async () => {
    if (!creatorToken) return;
    setStarting(true);
    setError(null);
    try {
      const res = await fetch(`/api/games/beat-eikichi/${roomCode}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Le serveur utilise room.beatEikichiEikichiId par défaut (pas besoin de renvoyer).
        body: JSON.stringify({ creatorToken }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Échec du démarrage');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setStarting(false);
    }
  };

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/room/${roomCode}`
      : '';

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-h-screen arcane-bg p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl md:text-4xl font-light text-purple-100 tracking-wide">
            Beat Eikichi
          </h1>
          <LeaveRoomButton roomCode={roomCode} />
        </div>

        <div className="arcane-card p-6 space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="text-xs uppercase tracking-widest text-purple-400/70">
                Code de la room
              </div>
              <div className="text-3xl font-bold tracking-widest text-amber-300">
                {roomCode}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="px-4 py-2 rounded-lg bg-purple-900/40 border border-purple-500/30 text-purple-100 hover:bg-purple-900/60 transition text-sm"
                title="Copier le code"
              >
                {copiedCode ? '✓ Code copié' : '📋 Copier le code'}
              </button>
              <button
                onClick={handleCopyLink}
                className="px-4 py-2 rounded-lg bg-pink-900/40 border border-pink-500/40 text-pink-100 hover:bg-pink-900/60 transition text-sm"
                title="Copier le lien d'invitation"
              >
                {copiedLink ? '✓ Lien copié' : '🔗 Copier le lien'}
              </button>
            </div>
          </div>
          <p className="text-sm text-purple-300/70">
            Partage le code <span className="font-semibold">ou</span> le lien
            avec tes amis pour qu&apos;ils rejoignent la partie.
          </p>
        </div>

        <div className="arcane-card p-6">
          <h2 className="text-lg font-semibold text-purple-100 mb-4">
            Joueurs ({room.players.length})
          </h2>
          <ul className="space-y-2">
            {room.players.map((p) => {
              const isThisEikichi = p.id === eikichiPlayerId;
              return (
                <li
                  key={p.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition ${
                    isThisEikichi
                      ? 'beat-eikichi-highlight'
                      : 'bg-purple-900/20 border-purple-500/20'
                  }`}
                >
                  {p.avatar ? (
                    <img
                      src={p.avatar}
                      alt=""
                      className={`w-10 h-10 rounded-full object-cover ${
                        isThisEikichi ? 'beat-eikichi-avatar' : ''
                      }`}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-800/50 flex items-center justify-center text-purple-200 font-bold">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-purple-100 font-medium">{p.name}</span>
                  {p.token === room.creatorToken && (
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-900/40 border border-amber-500/40 text-amber-300">
                      Maître
                    </span>
                  )}
                  {isThisEikichi && (
                    <span className="ml-auto beat-eikichi-badge">
                      JE SUIS EIKICHI
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        <div className="arcane-card p-6 space-y-3">
          <h2 className="text-lg font-semibold text-purple-100">
            Le rôle du &laquo; Je suis Eikichi &raquo;{' '}
            <span className="text-sm font-normal text-purple-300/60">
              (optionnel)
            </span>
          </h2>
          <p className="text-sm text-purple-300/70">
            Le maître de la room peut désigner un joueur comme Eikichi. Si
            l&apos;Eikichi trouve la bonne réponse, la question passe
            immédiatement à la suivante pour tout le monde — les autres ont
            perdu leur chance. S&apos;il n&apos;y a pas d&apos;Eikichi, les
            questions se terminent au timer.
          </p>

          {isCreator ? (
            <select
              value={eikichiPlayerId ?? ''}
              onChange={(e) => handleSetEikichi(e.target.value || null)}
              className="w-full px-4 py-2.5 rounded-lg bg-purple-950/40 border border-purple-500/40 text-purple-100 focus:outline-none focus:border-amber-400"
            >
              <option value="">— Aucun Eikichi —</option>
              {room.players.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          ) : eikichiPlayer ? (
            <div className="px-4 py-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-sm text-purple-200">
              Eikichi désigné :{' '}
              <span className="text-amber-300 font-semibold">
                {eikichiPlayer.name}
              </span>
            </div>
          ) : (
            <div className="px-4 py-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-sm text-purple-300/60 italic">
              Aucun Eikichi désigné pour l&apos;instant.
            </div>
          )}
        </div>

        <div className="arcane-card p-6 space-y-3">
          <h2 className="text-lg font-semibold text-purple-100">
            Indices{' '}
            <span className="text-sm font-normal text-purple-300/60">
              (optionnel)
            </span>
          </h2>
          <p className="text-sm text-purple-300/70">
            Si les indices sont activés, 3 indices seront révélés au cours de
            chaque question : le <strong>genre</strong> dès l&apos;affichage de
            l&apos;image, un <strong>terme distinctif</strong> à la moitié du
            timer, et les <strong>plateformes</strong> à 10 secondes de la fin.
          </p>
          {isCreator ? (
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hintsEnabled}
                onChange={(e) => handleToggleHints(e.target.checked)}
                className="w-5 h-5 rounded accent-pink-500"
              />
              <span className="text-sm text-purple-100">
                Activer les indices pour cette partie
              </span>
            </label>
          ) : (
            <div className="px-4 py-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-sm text-purple-200">
              Indices :{' '}
              <span
                className={
                  hintsEnabled
                    ? 'text-emerald-300 font-semibold'
                    : 'text-purple-300/60'
                }
              >
                {hintsEnabled ? 'activés' : 'désactivés'}
              </span>{' '}
              <span className="text-purple-300/60">
                (choix du maître)
              </span>
            </div>
          )}
        </div>

        <div className="arcane-card p-6 space-y-3">
          <h2 className="text-lg font-semibold text-purple-100">
            Durée d&apos;une question
          </h2>
          <p className="text-sm text-purple-300/70">
            Réglable entre 10 et 300 secondes. Affecte aussi les déclenchements
            des indices (mi-temps et -10 s).
          </p>
          {isCreator ? (
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={10}
                max={300}
                step={5}
                value={timerInput}
                onChange={(e) => setTimerInput(e.target.value)}
                onBlur={() => {
                  const n = parseInt(timerInput, 10);
                  if (!Number.isFinite(n)) {
                    setTimerInput(String(timerSeconds));
                    return;
                  }
                  const clamped = Math.max(10, Math.min(300, n));
                  setTimerInput(String(clamped));
                  if (clamped !== timerSeconds) handleSetTimer(clamped);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                }}
                className="w-28 px-3 py-2.5 rounded-lg bg-purple-950/40 border border-purple-500/40 text-purple-100 focus:outline-none focus:border-amber-400 text-center text-lg font-semibold"
              />
              <span className="text-sm text-purple-300/70">secondes</span>
            </div>
          ) : (
            <div className="px-4 py-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-sm text-purple-200">
              Durée :{' '}
              <span className="text-amber-300 font-semibold">
                {timerSeconds} s
              </span>{' '}
              <span className="text-purple-300/60">(choix du maître)</span>
            </div>
          )}
        </div>

        <div className="arcane-card p-6 space-y-3">
          <h2 className="text-lg font-semibold text-purple-100">Mode de jeu</h2>
          {isCreator ? (
            <div className="space-y-2">
              <label className="flex items-start gap-3 p-3 rounded-lg bg-purple-950/30 border border-purple-500/30 cursor-pointer hover:border-purple-500/60 transition">
                <input
                  type="radio"
                  name="beat-eikichi-mode"
                  value="standard"
                  checked={mode === 'standard'}
                  onChange={() => handleSetMode('standard')}
                  className="mt-1 accent-pink-500"
                />
                <div>
                  <div className="text-sm font-semibold text-purple-100">
                    Standard
                  </div>
                  <div className="text-xs text-purple-300/70">
                    L&apos;image est affichée normalement dès le début.
                  </div>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-lg bg-purple-950/30 border border-purple-500/30 cursor-pointer hover:border-purple-500/60 transition">
                <input
                  type="radio"
                  name="beat-eikichi-mode"
                  value="blur"
                  checked={mode === 'blur'}
                  onChange={() => handleSetMode('blur')}
                  className="mt-1 accent-pink-500"
                />
                <div>
                  <div className="text-sm font-semibold text-purple-100">
                    Flou
                  </div>
                  <div className="text-xs text-purple-300/70">
                    L&apos;image est fortement floutée au début, puis se révèle
                    progressivement. Nette à 10 s de la fin du timer.
                  </div>
                </div>
              </label>
            </div>
          ) : (
            <div className="px-4 py-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-sm text-purple-200">
              Mode :{' '}
              <span className="text-amber-300 font-semibold">
                {mode === 'blur' ? 'Flou' : 'Standard'}
              </span>{' '}
              <span className="text-purple-300/60">(choix du maître)</span>
            </div>
          )}
        </div>

        {isCreator ? (
          <div className="arcane-card p-6 space-y-3">
            <h2 className="text-lg font-semibold text-purple-100">Lancement</h2>
            <p className="text-sm text-purple-300/70">
              20 images de jeux vidéo à deviner. {timerSeconds} secondes par
              question. Tous les joueurs répondent en même temps.
            </p>
            <button
              onClick={handleStart}
              disabled={starting}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold transition disabled:opacity-50"
            >
              {starting ? 'Démarrage…' : '▶ Lancer la partie'}
            </button>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        ) : (
          <div className="arcane-card p-6 text-center text-purple-300/70">
            En attente que le maître de la room lance la partie…
          </div>
        )}
      </div>
    </div>
  );
}
