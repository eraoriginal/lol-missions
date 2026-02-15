'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TeamSelector } from '@/app/components/TeamSelector';
import { RulesModal } from './RulesModal';

interface Player {
  id: string;
  name: string;
  avatar: string;
  team: string;
  role: string | null;
  token: string;
  missions: { mission: { id: string; text: string; type: string; category: string; difficulty: string; points: number; isPrivate: boolean }; type: string; validated: boolean; decided: boolean; pointsEarned: number; resolvedText?: string }[];
}

interface Room {
  id: string;
  code: string;
  players: Player[];
}

interface CodenameRoomLobbyProps {
  room: Room;
  roomCode: string;
}

export function CodenameRoomLobby({ room, roomCode }: CodenameRoomLobbyProps) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const router = useRouter();

  const creatorToken =
    typeof window !== 'undefined' ? localStorage.getItem(`room_${roomCode}_creator`) : null;
  const isCreator = !!creatorToken;

  const playerToken =
    typeof window !== 'undefined' ? localStorage.getItem(`room_${roomCode}_player`) : null;

  const redTeam = room.players.filter((p) => p.team === 'red');
  const blueTeam = room.players.filter((p) => p.team === 'blue');

  // Check if we have enough players on each team
  const hasEnoughPlayers = redTeam.length >= 2 && blueTeam.length >= 2;

  const handleStart = async () => {
    if (!creatorToken) return;
    setStarting(true);
    setError(null);

    try {
      const response = await fetch(`/api/games/codename/${roomCode}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorToken }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to start game');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
      setStarting(false);
    }
  };

  const handleLeaveClick = () => {
    if (isCreator) {
      setShowLeaveConfirm(true);
    } else {
      confirmLeave();
    }
  };

  const confirmLeave = async () => {
    setShowLeaveConfirm(false);
    setLeaving(true);
    try {
      await fetch(`/api/rooms/${roomCode}/leave`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerToken,
          creatorToken,
        }),
      });
    } catch (err) {
      console.error('Error leaving room:', err);
    } finally {
      localStorage.removeItem(`room_${roomCode}_player`);
      localStorage.removeItem(`room_${roomCode}_creator`);
      router.push('/');
    }
  };

  const shareUrl =
    typeof window !== 'undefined' ? `${window.location.origin}/room/${roomCode}` : '';

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header compact */}
      <div className="poki-panel p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold poki-title">
              🕵️ Codename du CEO
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={copyCode}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-lg font-bold transition-all ${
                  copiedCode
                    ? 'bg-green-500/20 border border-green-500 text-green-400'
                    : 'bg-[#1a0525] border border-pink-500/50 text-pink-400 hover:border-pink-500 hover:bg-pink-500/10'
                }`}
                title="Copier le code"
              >
                {roomCode}
                <span className="text-sm">{copiedCode ? '✓' : '📋'}</span>
              </button>
              <button
                onClick={copyLink}
                className={`poki-btn-secondary px-3 py-1.5 rounded-lg text-sm ${
                  copiedLink ? 'border-green-500 text-green-400' : ''
                }`}
                title="Copier le lien"
              >
                {copiedLink ? '✓' : '🔗'} Lien
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <RulesModal />
            <button
              onClick={handleLeaveClick}
              disabled={leaving}
              className="poki-btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
            >
              {leaving ? '⏳...' : '🚪 Quitter'}
            </button>
          </div>
        </div>
      </div>

      {/* Team selector */}
      <TeamSelector
        players={room.players}
        roomCode={roomCode}
        currentPlayerToken={playerToken}
      />

      {/* Start button (creator only) */}
      {isCreator && (
        <div className="poki-panel p-5">
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={starting || !hasEnoughPlayers}
            className="poki-btn-primary w-full py-3 font-bold text-lg"
          >
            {starting ? '🕵️ Préparation...' : '🕵️ COMMENCER LA SÉLECTION DES ESPIONS'}
          </button>

          {!hasEnoughPlayers && (
            <p className="mt-3 text-center text-sm text-purple-300/60">
              Il faut au moins 2 joueurs par équipe (Rouge: {redTeam.length}/2, Bleu: {blueTeam.length}/2)
            </p>
          )}
        </div>
      )}

      {!isCreator && (
        <div className="poki-panel p-5 text-center">
          <div className="text-3xl mb-2">⏳</div>
          <p className="text-pink-400">En attente que le créateur lance la partie...</p>
        </div>
      )}

      {/* Game explanation */}
      <div className="poki-panel p-5">
        <h3 className="text-lg font-bold text-pink-400 mb-3 poki-text flex items-center gap-2">
          <span>💡</span> Comment jouer
        </h3>
        <div className="space-y-2 text-purple-200/80 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-pink-400 font-bold">1.</span>
            <p>Rejoignez une équipe (Rouge ou Bleue) - minimum 2 joueurs par équipe</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-pink-400 font-bold">2.</span>
            <p>Le créateur lance la sélection des espions</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-pink-400 font-bold">3.</span>
            <p>Un joueur par équipe se désigne comme Maître-Espion (🔮)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-pink-400 font-bold">4.</span>
            <p>Le créateur génère le plateau de jeu</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-pink-400 font-bold">5.</span>
            <p>Les Maîtres-Espions donnent des indices, les Agents devinent les mots !</p>
          </div>
        </div>
      </div>

      {/* Leave confirmation modal for creator */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="poki-panel p-6 max-w-md w-full animate-scale-in">
            <h2 className="text-xl font-bold poki-title mb-3">⚠️ Tu es le créateur !</h2>
            <p className="text-purple-200/80 leading-relaxed mb-6">
              Si tu quittes, la room sera supprimée et tous les joueurs seront déconnectés. Es-tu sûr ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 px-4 py-3 poki-btn-secondary font-medium"
              >
                Rester
              </button>
              <button
                onClick={confirmLeave}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-red-500/30"
              >
                Quitter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
