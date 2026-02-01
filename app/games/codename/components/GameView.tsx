'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CodenameRoomLobby } from './CodenameRoomLobby';
import { RoleSelection } from './RoleSelection';
import { SpymasterView } from './SpymasterView';
import { OperativeView } from './OperativeView';
import { GameStatus } from './GameStatus';
import { GameBoard } from './GameBoard';
import { RulesModal } from './RulesModal';
import { useCodenameSound } from '../hooks/useCodenameSound';

interface Card {
  id: string;
  word: string;
  color: string;
  category?: string | null;
  revealed: boolean;
  position: number;
}

interface CodenameGame {
  id: string;
  currentTeam: string;
  redRemaining: number;
  blueRemaining: number;
  gameOver: boolean;
  winner: string | null;
  currentClue: string | null;
  currentNumber: number | null;
  guessesLeft: number;
  cards: Card[];
}

interface Player {
  id: string;
  name: string;
  avatar: string;
  team: string;
  role: string | null;
  token: string;
  missions: any[];
}

interface Room {
  id: string;
  code: string;
  gameStarted: boolean;
  players: Player[];
  codenameGame?: CodenameGame | null;
  selectedCategories?: string[];
}

interface GameViewProps {
  room: Room;
  roomCode: string;
}

export function GameView({ room, roomCode }: GameViewProps) {
  const [generating, setGenerating] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const { play } = useCodenameSound();
  const router = useRouter();

  const playerToken =
    typeof window !== 'undefined' ? localStorage.getItem(`room_${roomCode}_player`) : null;

  const creatorToken =
    typeof window !== 'undefined' ? localStorage.getItem(`room_${roomCode}_creator`) : null;

  const isCreator = !!creatorToken;
  const currentPlayer = room.players.find((p) => p.token === playerToken);
  const game = room.codenameGame;

  // Game phases:
  // 1. Lobby: gameStarted = false, codenameGame = null
  // 2. Role Selection: gameStarted = true, codenameGame exists but has no cards
  // 3. Playing: codenameGame has cards
  // 4. Game Over: codenameGame.gameOver = true

  const isLobby = !room.gameStarted;
  const isRoleSelection = room.gameStarted && game && game.cards.length === 0;
  const isPlaying = game && game.cards.length > 0 && !game.gameOver;
  const isGameOver = game?.gameOver;

  // Current player's state
  const isSpymaster = currentPlayer?.role === 'spymaster';
  const isOperative = currentPlayer?.role === 'operative';
  const isOnCurrentTeam = currentPlayer?.team === game?.currentTeam;
  const isMyTurn = isOnCurrentTeam && !!game;

  // Team info
  const redPlayers = room.players.filter((p) => p.team === 'red');
  const bluePlayers = room.players.filter((p) => p.team === 'blue');

  const handleGenerateBoard = async () => {
    if (!creatorToken) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch(`/api/games/codename/${roomCode}/generate-board`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorToken }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setGenerating(false);
    }
  };

  const handleRestart = async () => {
    if (!creatorToken) return;
    setRestarting(true);
    setError(null);

    try {
      const res = await fetch(`/api/games/codename/${roomCode}/restart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorToken }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setRestarting(false);
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

  // Phase 1: Lobby - team selection
  if (isLobby) {
    return <CodenameRoomLobby room={room} roomCode={roomCode} />;
  }

  // Phase 2: Role Selection
  if (isRoleSelection) {
    return (
      <>
        <div className="space-y-4">
          {/* Header */}
          <div className="poki-panel p-4">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <h1 className="text-xl font-bold poki-title">
                  🕵️ Codename du CEO
                </h1>
                <p className="text-purple-300/70 text-sm">
                  Room : <span className="font-mono font-bold text-pink-400">{roomCode}</span>
                </p>
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

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <RoleSelection
            roomCode={roomCode}
            players={room.players}
            currentPlayerToken={playerToken || ''}
            isCreator={isCreator}
            onGenerateBoard={handleGenerateBoard}
            generating={generating}
            selectedCategories={room.selectedCategories || []}
          />
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
      </>
    );
  }

  // Phase 3 & 4: Playing / Game Over
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="poki-panel p-3">
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <h1 className="text-lg font-bold poki-title">
              🕵️ Codename du CEO
            </h1>
            <p className="text-purple-300/70 text-xs">
              Room : <span className="font-mono font-bold text-pink-400">{roomCode}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <RulesModal />
            {isCreator && isGameOver && (
              <button
                onClick={handleRestart}
                disabled={restarting}
                className="poki-btn-primary px-3 py-1.5 text-sm"
              >
                {restarting ? '⏳...' : '🔄 Rejouer'}
              </button>
            )}
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

      {error && <p className="text-red-400 text-sm text-center">{error}</p>}

      {/* Game status */}
      {game && (
        <GameStatus
          currentTeam={game.currentTeam}
          redRemaining={game.redRemaining}
          blueRemaining={game.blueRemaining}
          currentClue={game.currentClue}
          currentNumber={game.currentNumber}
          guessesLeft={game.guessesLeft}
          gameOver={game.gameOver}
          winner={game.winner}
        />
      )}

      {/* Playing phase */}
      {isPlaying && currentPlayer && game && (
        <>
          {isSpymaster ? (
            <SpymasterView
              roomCode={roomCode}
              playerToken={playerToken || ''}
              cards={game.cards}
              isMyTurn={isMyTurn}
              hasGivenClue={!!game.currentClue}
            />
          ) : isOperative ? (
            <OperativeView
              roomCode={roomCode}
              playerToken={playerToken || ''}
              playerName={currentPlayer?.name || ''}
              cards={game.cards}
              isMyTurn={isMyTurn}
              hasClue={!!game.currentClue}
              guessesLeft={game.guessesLeft}
              currentTeam={game.currentTeam}
            />
          ) : (
            // Spectator view
            <div className="space-y-4">
              <div className="text-center text-stone-400 text-sm">
                👁️ Mode spectateur
              </div>
              <GameBoard cards={game.cards} isSpymaster={false} isClickable={false} />
            </div>
          )}
        </>
      )}

      {/* Game over - show final board */}
      {isGameOver && game && (
        <div className="space-y-4">
          <GameBoard cards={game.cards} isSpymaster={true} isClickable={false} />

          {isCreator && (
            <div className="text-center">
              <button
                onClick={handleRestart}
                disabled={restarting}
                className="poki-btn-primary px-6 py-3 font-bold text-lg"
              >
                {restarting ? '⏳ Préparation...' : '🔄 Nouvelle partie'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Team rosters during game - compact */}
      {(isPlaying || isGameOver) && (
        <div className="grid grid-cols-2 gap-3">
          {/* Red team */}
          <div className="poki-panel p-2 border border-red-500/30">
            <h4 className="text-xs font-bold text-red-400 mb-1.5">🔴 Rouge</h4>
            <div className="space-y-0.5 text-xs">
              {redPlayers.map((p) => (
                <div key={p.id} className="flex items-center gap-1 text-purple-200/80">
                  <span className="text-[10px]">{p.role === 'spymaster' ? '🔮' : '🎯'}</span>
                  <span className="truncate">{p.name}</span>
                  {p.token === playerToken && (
                    <span className="text-[10px] text-pink-400">(vous)</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Blue team */}
          <div className="poki-panel p-2 border border-blue-500/30">
            <h4 className="text-xs font-bold text-blue-400 mb-1.5">🔵 Bleu</h4>
            <div className="space-y-0.5 text-xs">
              {bluePlayers.map((p) => (
                <div key={p.id} className="flex items-center gap-1 text-purple-200/80">
                  <span className="text-[10px]">{p.role === 'spymaster' ? '🔮' : '🎯'}</span>
                  <span className="truncate">{p.name}</span>
                  {p.token === playerToken && (
                    <span className="text-[10px] text-pink-400">(vous)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
