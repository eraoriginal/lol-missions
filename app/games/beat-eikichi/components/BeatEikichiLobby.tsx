'use client';

import { useState } from 'react';
import type { Room } from '@/app/types/room';
import { LeaveRoomButton } from '@/app/components/LeaveRoomButton';

interface BeatEikichiLobbyProps {
  room: Room;
  roomCode: string;
}

export function BeatEikichiLobby({ room, roomCode }: BeatEikichiLobbyProps) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const creatorToken =
    typeof window !== 'undefined'
      ? localStorage.getItem(`room_${roomCode}_creator`)
      : null;
  const isCreator = !!creatorToken;

  // La source de vérité est le serveur (room.beatEikichiEikichiId) — partagée par Pusher.
  const eikichiPlayerId = room.beatEikichiEikichiId ?? null;
  const eikichiPlayer = room.players.find((p) => p.id === eikichiPlayerId);

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
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
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-widest text-purple-400/70">
                Code de la room
              </div>
              <div className="text-3xl font-bold tracking-widest text-amber-300">
                {roomCode}
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="px-4 py-2 rounded-lg bg-purple-900/40 border border-purple-500/30 text-purple-100 hover:bg-purple-900/60 transition"
            >
              {copied ? '✓ Copié' : 'Copier'}
            </button>
          </div>
          <p className="text-sm text-purple-300/70">
            Partage ce code avec tes amis pour qu&apos;ils rejoignent la partie.
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

        {isCreator && (
          <div className="arcane-card p-6 space-y-3">
            <h2 className="text-lg font-semibold text-purple-100">
              Désigner un &laquo; Je suis Eikichi &raquo;{' '}
              <span className="text-sm font-normal text-purple-300/60">
                (optionnel)
              </span>
            </h2>
            <p className="text-sm text-purple-300/70">
              Si l&apos;Eikichi trouve la bonne réponse, la question passe
              immédiatement à la suivante pour tout le monde — les autres ont
              perdu leur chance.
            </p>
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
          </div>
        )}

        {!isCreator && eikichiPlayer && (
          <div className="arcane-card p-4 text-center">
            <span className="text-sm text-purple-300/70">
              Le maître a désigné{' '}
              <span className="text-amber-300 font-semibold">
                {eikichiPlayer.name}
              </span>{' '}
              comme &laquo; Je suis Eikichi &raquo;
            </span>
          </div>
        )}

        {isCreator ? (
          <div className="arcane-card p-6 space-y-3">
            <h2 className="text-lg font-semibold text-purple-100">Lancement</h2>
            <p className="text-sm text-purple-300/70">
              20 images de jeux vidéo à deviner. 60 secondes par question. Tous
              les joueurs répondent en même temps.
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
