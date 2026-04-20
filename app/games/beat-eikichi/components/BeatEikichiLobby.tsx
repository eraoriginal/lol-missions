'use client';

import { useEffect, useState } from 'react';
import type { Room } from '@/app/types/room';
import { LeaveRoomButton } from '@/app/components/LeaveRoomButton';
import { WeaponPickerModal } from './WeaponPickerModal';
import { getWeapon } from '@/lib/beatEikichi/weapons';

interface BeatEikichiLobbyProps {
  room: Room;
  roomCode: string;
}

export function BeatEikichiLobby({ room, roomCode }: BeatEikichiLobbyProps) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [weaponModalOpen, setWeaponModalOpen] = useState(false);

  const creatorToken =
    typeof window !== 'undefined'
      ? localStorage.getItem(`room_${roomCode}_creator`)
      : null;
  const isCreator = !!creatorToken;

  const playerToken =
    typeof window !== 'undefined'
      ? localStorage.getItem(`room_${roomCode}_player`)
      : null;
  const myPlayer = room.players.find((p) => p.token === playerToken);
  const myWeaponId = myPlayer?.beatEikichiWeaponId ?? null;

  // Réglages courants (source de vérité = serveur, sync via Pusher).
  const eikichiPlayerId = room.beatEikichiEikichiId ?? null;
  const eikichiPlayer = room.players.find((p) => p.id === eikichiPlayerId);
  const hintsEnabled = room.beatEikichiHintsEnabled ?? false;
  const timerSeconds = room.beatEikichiTimerSeconds ?? 30;
  const mode: 'standard' | 'blur' = room.beatEikichiMode ?? 'standard';

  const [timerInput, setTimerInput] = useState(String(timerSeconds));
  useEffect(() => {
    setTimerInput(String(timerSeconds));
  }, [timerSeconds]);

  // --- API calls (fire and forget, Pusher pousse l'update) -----------------
  const post = async (path: string, body: object) => {
    try {
      await fetch(`/api/games/beat-eikichi/${roomCode}/${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      /* ignore */
    }
  };

  const handleSetTimer = (value: number) => {
    const clamped = Math.max(10, Math.min(300, Math.round(value)));
    post('set-timer', { creatorToken, timerSeconds: clamped });
  };
  const handleSetMode = (newMode: 'standard' | 'blur') =>
    post('set-mode', { creatorToken, mode: newMode });
  const handleToggleHints = (enabled: boolean) =>
    post('set-hints-enabled', { creatorToken, enabled });
  const handleSetEikichi = (newId: string | null) =>
    post('set-eikichi', { creatorToken, eikichiPlayerId: newId });
  const handleSetWeapon = (weaponId: string | null) => {
    post('set-weapon', { playerToken, weaponId });
    setWeaponModalOpen(false);
  };

  const handleStart = async () => {
    if (!creatorToken) return;
    setStarting(true);
    setError(null);
    try {
      const res = await fetch(`/api/games/beat-eikichi/${roomCode}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  const handleCopy = async (text: string, setter: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(text);
      setter(true);
      setTimeout(() => setter(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="min-h-screen arcane-bg p-4 md:p-6">
      <div className="max-w-2xl mx-auto space-y-3">
        {/* Header compact */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-light text-purple-100 tracking-wide">
            Beat Eikichi
          </h1>
          <LeaveRoomButton roomCode={roomCode} />
        </div>

        {/* Code room + boutons copie */}
        <div className="arcane-card p-4 flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-purple-400/70">
              Code
            </div>
            <div className="text-2xl font-bold tracking-widest text-amber-300">
              {roomCode}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleCopy(roomCode, setCopiedCode)}
              className="px-3 py-2 rounded-lg bg-purple-900/40 border border-purple-500/30 text-purple-100 hover:bg-purple-900/60 transition text-xs"
              title="Copier le code"
            >
              {copiedCode ? '✓ Code' : '📋 Code'}
            </button>
            <button
              onClick={() => handleCopy(shareUrl, setCopiedLink)}
              className="px-3 py-2 rounded-lg bg-pink-900/40 border border-pink-500/40 text-pink-100 hover:bg-pink-900/60 transition text-xs"
              title="Copier le lien d'invitation"
            >
              {copiedLink ? '✓ Lien' : '🔗 Lien'}
            </button>
          </div>
        </div>

        {/* Joueurs */}
        <div className="arcane-card p-4">
          <div className="text-xs uppercase tracking-widest text-purple-400/70 mb-2">
            Joueurs ({room.players.length})
          </div>
          <ul className="space-y-1.5">
            {room.players.map((p) => {
              const isMe = p.id === myPlayer?.id;
              const isThisCreator = p.token === room.creatorToken;
              const isThisEikichi = p.id === eikichiPlayerId;
              const weapon = p.beatEikichiWeaponId
                ? getWeapon(p.beatEikichiWeaponId)
                : null;
              return (
                <li
                  key={p.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition ${
                    isThisEikichi
                      ? 'beat-eikichi-highlight'
                      : 'bg-purple-900/20 border-purple-500/20'
                  }`}
                >
                  {p.avatar ? (
                    <img
                      src={p.avatar}
                      alt=""
                      className={`w-8 h-8 rounded-full object-cover ${
                        isThisEikichi ? 'beat-eikichi-avatar' : ''
                      }`}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-800/50 flex items-center justify-center text-purple-200 font-bold text-xs">
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-sm text-purple-100 font-medium flex-1 min-w-0 truncate">
                    {p.name}
                    {isMe && (
                      <span className="text-purple-300/60 text-xs ml-1">(toi)</span>
                    )}
                  </span>
                  {isThisCreator && (
                    <span
                      className="text-amber-300 text-sm"
                      title="Maître de la room"
                    >
                      ★
                    </span>
                  )}
                  {isThisEikichi && (
                    <span className="beat-eikichi-badge">EIKICHI</span>
                  )}
                  {/* Arme choisie : icône + tooltip */}
                  {weapon ? (
                    <span
                      className="text-lg"
                      title={`Arme : ${weapon.name} — ${weapon.description}`}
                    >
                      {weapon.icon}
                    </span>
                  ) : (
                    <span
                      className="text-xs text-purple-400/40 italic"
                      title="Aucune arme choisie"
                    >
                      —
                    </span>
                  )}
                  {/* Bouton "changer mon arme" (visible uniquement sur sa propre ligne) */}
                  {isMe && (
                    <button
                      onClick={() => setWeaponModalOpen(true)}
                      className="text-xs px-2 py-1 rounded bg-rose-900/40 border border-rose-500/40 text-rose-100 hover:bg-rose-900/60 transition"
                      title="Changer d'arme"
                    >
                      {weapon ? 'Changer' : 'Choisir'}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Réglages : un seul bloc avec description par ligne, édition pour le maître,
            affichage en lecture seule pour les autres. */}
        <div className="arcane-card p-4 space-y-1">
          <div className="text-xs uppercase tracking-widest text-purple-400/70 mb-2">
            Réglages
            {!isCreator && (
              <span className="ml-2 normal-case tracking-normal text-purple-400/50">
                (choix du maître)
              </span>
            )}
          </div>

          <SettingsRow
            label="Durée"
            description="Temps de réflexion sur chaque question. Affecte aussi la révélation des indices (mi-temps puis -10 s)."
          >
            {isCreator ? (
              <>
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
                  className="w-20 px-2 py-1 rounded bg-purple-950/40 border border-purple-500/40 text-purple-100 focus:outline-none focus:border-amber-400 text-center text-sm font-semibold"
                />
                <span className="text-xs text-purple-300/60">s</span>
              </>
            ) : (
              <ReadOnlyValue>{timerSeconds}s</ReadOnlyValue>
            )}
          </SettingsRow>

          <SettingsRow
            label="Mode"
            description={
              <>
                <strong>Standard</strong> : image nette dès le début.{' '}
                <strong>Flou</strong> : image fortement floutée au départ puis
                progressivement révélée, nette à 10 s de la fin du timer.
              </>
            }
          >
            {isCreator ? (
              <div className="flex gap-1">
                <ModeToggleButton
                  active={mode === 'standard'}
                  onClick={() => handleSetMode('standard')}
                >
                  Standard
                </ModeToggleButton>
                <ModeToggleButton
                  active={mode === 'blur'}
                  onClick={() => handleSetMode('blur')}
                >
                  Flou
                </ModeToggleButton>
              </div>
            ) : (
              <ReadOnlyValue>{mode === 'blur' ? 'Flou' : 'Standard'}</ReadOnlyValue>
            )}
          </SettingsRow>

          <SettingsRow
            label="Eikichi"
            description="Joueur désigné. Si l'Eikichi trouve la bonne réponse, la question passe immédiatement à la suivante — les autres ont perdu leur chance."
          >
            {isCreator ? (
              <select
                value={eikichiPlayerId ?? ''}
                onChange={(e) => handleSetEikichi(e.target.value || null)}
                className="flex-1 max-w-[200px] px-2 py-1 rounded bg-purple-950/40 border border-purple-500/40 text-purple-100 focus:outline-none focus:border-amber-400 text-sm"
              >
                <option value="">— Aucun —</option>
                {room.players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            ) : (
              <ReadOnlyValue>
                {eikichiPlayer?.name ?? 'aucun désigné'}
              </ReadOnlyValue>
            )}
          </SettingsRow>

          <SettingsRow
            label="Indices"
            description="Révèle 3 indices pendant la question : genre (dès le début), terme distinctif (à mi-timer), plateformes (-10 s)."
          >
            {isCreator ? (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hintsEnabled}
                  onChange={(e) => handleToggleHints(e.target.checked)}
                  className="w-4 h-4 rounded accent-pink-500"
                />
                <span className="text-xs text-purple-200">
                  {hintsEnabled ? 'Activés' : 'Désactivés'}
                </span>
              </label>
            ) : (
              <ReadOnlyValue>
                {hintsEnabled ? 'activés' : 'désactivés'}
              </ReadOnlyValue>
            )}
          </SettingsRow>
        </div>

        {/* Lancement */}
        {isCreator ? (
          <div className="arcane-card p-4 space-y-2">
            <button
              onClick={handleStart}
              disabled={starting}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold transition disabled:opacity-50"
            >
              {starting
                ? 'Démarrage…'
                : `▶ Lancer la partie (${timerSeconds}s × 20)`}
            </button>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        ) : (
          <div className="arcane-card p-3 text-center text-xs text-purple-300/70">
            En attente du maître pour lancer…
          </div>
        )}
      </div>

      <WeaponPickerModal
        open={weaponModalOpen}
        onClose={() => setWeaponModalOpen(false)}
        onPick={handleSetWeapon}
        currentWeaponId={myWeaponId}
      />
    </div>
  );
}

/* --- Helpers locaux ------------------------------------------------------- */

function SettingsRow({
  label,
  description,
  children,
}: {
  label: string;
  description: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-purple-500/10 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-purple-100">{label}</div>
        <div className="text-xs text-purple-300/60 mt-0.5 leading-snug">
          {description}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-wrap shrink-0 pt-0.5">
        {children}
      </div>
    </div>
  );
}

function ReadOnlyValue({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-1 rounded bg-purple-950/40 border border-purple-500/30 text-sm text-amber-300 font-semibold">
      {children}
    </span>
  );
}

function ModeToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded text-xs font-medium transition border ${
        active
          ? 'bg-pink-600 border-pink-400 text-white'
          : 'bg-purple-950/40 border-purple-500/40 text-purple-200 hover:bg-purple-900/60'
      }`}
    >
      {children}
    </button>
  );
}
