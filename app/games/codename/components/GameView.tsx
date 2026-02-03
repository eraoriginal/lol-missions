'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CodenameRoomLobby } from './CodenameRoomLobby';
import { RoleSelection } from './RoleSelection';
import { SpymasterView } from './SpymasterView';
import { OperativeView } from './OperativeView';
import { GameStatus } from './GameStatus';
import { GameBoard } from './GameBoard';
import { RulesModal } from './RulesModal';
import { GameHistory } from './GameHistory';
import { useCardInterests } from '../hooks/useCardInterests';
import { useCodenameSocket } from '../hooks/useCodenameSocket';

interface CardInterest {
  id: string;
  cardId: string;
  playerName: string;
}

interface Card {
  id: string;
  word: string;
  color: string;
  category?: string | null;
  revealed: boolean;
  position: number;
  interests?: CardInterest[];
}

interface HistoryEntry {
  id: string;
  team: string;
  type: string;
  clue: string | null;
  number: number | null;
  cardWord: string | null;
  cardColor: string | null;
  createdAt: string;
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
  history?: HistoryEntry[];
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
  const [resetting, setResetting] = useState(false);
  const [joiningTeam, setJoiningTeam] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);
  // Local cards state for real-time interest updates via Pusher
  const [localCards, setLocalCards] = useState<Card[]>(room.codenameGame?.cards || []);
  // Track current team to detect turn changes
  const [lastKnownTeam, setLastKnownTeam] = useState<string | null>(room.codenameGame?.currentTeam || null);
  const router = useRouter();

  // Listen for sound events via Pusher (all players hear sounds)
  useCodenameSocket(roomCode);

  const playerToken =
    typeof window !== 'undefined' ? localStorage.getItem(`room_${roomCode}_player`) : null;

  const creatorToken =
    typeof window !== 'undefined' ? localStorage.getItem(`room_${roomCode}_creator`) : null;

  const isCreator = !!creatorToken;
  const currentPlayer = room.players.find((p) => p.token === playerToken);
  const game = room.codenameGame;

  // Sync local cards with server cards
  useEffect(() => {
    if (game?.cards) {
      const turnChanged = game.currentTeam !== lastKnownTeam;

      if (turnChanged) {
        // Turn changed - use server data entirely (interests are cleared)
        setLocalCards(game.cards);
        setLastKnownTeam(game.currentTeam);
      } else {
        // Same turn - merge local interests with server data
        setLocalCards(prevCards => {
          return game.cards.map(serverCard => {
            const localCard = prevCards.find(c => c.id === serverCard.id);
            // If card was revealed, use server data
            if (serverCard.revealed) {
              return serverCard;
            }
            // Otherwise, preserve local interests (they may be more up-to-date via Pusher)
            if (localCard && !serverCard.revealed) {
              return {
                ...serverCard,
                interests: localCard.interests || serverCard.interests
              };
            }
            return serverCard;
          });
        });
      }
    }
  }, [game?.cards, game?.currentTeam, lastKnownTeam]);

  // Handle real-time interest updates from Pusher
  const handleCardsUpdate = useCallback((updatedCards: Card[]) => {
    setLocalCards(updatedCards);
  }, []);

  // Subscribe to Pusher interest updates
  useCardInterests(roomCode, localCards, handleCardsUpdate);

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
  const isSpectator = currentPlayer && (!currentPlayer.team || currentPlayer.team === '');

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

  const handleResetToLobby = async () => {
    if (!creatorToken) return;
    setShowResetConfirm(false);
    setResetting(true);
    setError(null);

    try {
      const res = await fetch(`/api/games/codename/${roomCode}/reset-to-lobby`, {
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
      setResetting(false);
    }
  };

  const handleRegenerateBoard = async () => {
    if (!creatorToken) return;
    setGenerating(true);
    setError(null);

    try {
      const res = await fetch(`/api/games/codename/${roomCode}/regenerate-board`, {
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

  const handleJoinTeam = async (team: 'red' | 'blue') => {
    if (!playerToken) return;
    setJoiningTeam(true);
    setError(null);

    try {
      // Join the team
      const teamRes = await fetch(`/api/rooms/${roomCode}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerToken, team }),
      });

      if (!teamRes.ok) {
        const data = await teamRes.json();
        throw new Error(data.error || 'Erreur');
      }

      // If game is already playing (cards generated), automatically set role to operative
      if (game && game.cards.length > 0) {
        const roleRes = await fetch(`/api/games/codename/${roomCode}/role`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ playerToken, role: 'operative' }),
        });

        if (!roleRes.ok) {
          const data = await roleRes.json();
          throw new Error(data.error || 'Erreur');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setJoiningTeam(false);
    }
  };

  // Phase 1: Lobby - team selection
  if (isLobby) {
    return <CodenameRoomLobby room={room} roomCode={roomCode} />;
  }

  // Spectator join panel component
  const SpectatorJoinPanel = () => (
    <div className="poki-panel p-4 border-2 border-yellow-500/50">
      <div className="text-center mb-4">
        <div className="text-3xl mb-2">👁️</div>
        <h3 className="text-lg font-bold text-yellow-400">Mode Spectateur</h3>
        <p className="text-purple-300/70 text-sm mt-1">
          Rejoins une équipe pour participer !
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleJoinTeam('red')}
          disabled={joiningTeam || redPlayers.length >= 5}
          className="py-3 px-4 rounded-xl font-bold text-white transition-all bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {joiningTeam ? '⏳...' : `🔴 Rouge (${redPlayers.length}/5)`}
        </button>
        <button
          onClick={() => handleJoinTeam('blue')}
          disabled={joiningTeam || bluePlayers.length >= 5}
          className="py-3 px-4 rounded-xl font-bold text-white transition-all bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {joiningTeam ? '⏳...' : `🔵 Bleu (${bluePlayers.length}/5)`}
        </button>
      </div>
      {game && game.cards.length > 0 && (
        <p className="text-center text-purple-300/60 text-xs mt-3">
          Tu rejoindras en tant qu'Agent
        </p>
      )}
    </div>
  );

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
                {isCreator && (
                  <button
                    onClick={handleResetToLobby}
                    disabled={resetting}
                    className="poki-btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
                  >
                    {resetting ? '⏳...' : '⬅️ Équipes'}
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

          {/* Spectator panel */}
          {isSpectator && <SpectatorJoinPanel />}

          {/* Role selection (only show if player has a team) */}
          {!isSpectator && (
            <RoleSelection
              roomCode={roomCode}
              players={room.players}
              currentPlayerToken={playerToken || ''}
              isCreator={isCreator}
              onGenerateBoard={handleGenerateBoard}
              generating={generating}
              selectedCategories={room.selectedCategories || []}
            />
          )}

          {/* Show role selection to spectators as read-only */}
          {isSpectator && (
            <div className="opacity-70">
              <RoleSelection
                roomCode={roomCode}
                players={room.players}
                currentPlayerToken={playerToken || ''}
                isCreator={false}
                onGenerateBoard={handleGenerateBoard}
                generating={generating}
                selectedCategories={room.selectedCategories || []}
              />
            </div>
          )}
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

  // Determine background class based on current team
  const getTeamBackgroundClass = () => {
    if (!game || game.gameOver) return '';
    if (game.currentTeam === 'red') {
      return 'codename-bg-red';
    }
    if (game.currentTeam === 'blue') {
      return 'codename-bg-blue';
    }
    return '';
  };

  // Phase 3 & 4: Playing / Game Over
  return (
    <div className={`space-y-4 transition-all duration-500 ${getTeamBackgroundClass()}`}>
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
            {isCreator && isPlaying && (
              <>
                <button
                  onClick={handleRegenerateBoard}
                  disabled={generating}
                  className="poki-btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  {generating ? '⏳...' : '🔄 Plateau'}
                </button>
                <button
                  onClick={handleRestart}
                  disabled={restarting}
                  className="poki-btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
                >
                  {restarting ? '⏳...' : '🎭 Rôles'}
                </button>
              </>
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

      {/* Spectator join panel during game */}
      {isPlaying && isSpectator && <SpectatorJoinPanel />}

      {/* Playing phase */}
      {isPlaying && currentPlayer && game && (
        <>
          {isSpymaster ? (
            <SpymasterView
              roomCode={roomCode}
              playerToken={playerToken || ''}
              cards={localCards}
              isMyTurn={isMyTurn}
              hasGivenClue={!!game.currentClue}
            />
          ) : isOperative ? (
            <OperativeView
              roomCode={roomCode}
              playerToken={playerToken || ''}
              playerName={currentPlayer?.name || ''}
              cards={localCards}
              isMyTurn={isMyTurn}
              hasClue={!!game.currentClue}
              guessesLeft={game.guessesLeft}
              currentTeam={game.currentTeam}
            />
          ) : (
            // Spectator view (player without team or role)
            <div className="space-y-4">
              <GameBoard cards={localCards} isSpymaster={false} isClickable={false} />
            </div>
          )}
        </>
      )}

      {/* Spectator join panel during game over */}
      {isGameOver && isSpectator && <SpectatorJoinPanel />}

      {/* Game over - show final board */}
      {isGameOver && game && (
        <div className="space-y-4">
          <GameBoard cards={localCards} isSpymaster={true} isClickable={false} />

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
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Red team */}
            <div className="poki-panel p-2 border border-red-500/30">
              <h4 className="text-xs font-bold text-red-400 mb-1.5">🔴 Rouge</h4>
              <div className="space-y-0.5 text-xs">
                {redPlayers.map((p) => (
                  <div key={p.id} className={`flex items-center gap-1 ${p.token === playerToken ? 'text-pink-300 font-medium' : 'text-purple-200/80'}`}>
                    <span className="truncate">{p.name}</span>
                    {p.token === playerToken && (
                      <span className="text-[10px] text-pink-400">(vous)</span>
                    )}
                    <span className={`text-[10px] ml-auto whitespace-nowrap ${p.role === 'spymaster' ? 'text-pink-400' : 'text-purple-400/60'}`}>
                      {p.role === 'spymaster' ? '🔮 Espion' : '🎯 Agent'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Blue team */}
            <div className="poki-panel p-2 border border-blue-500/30">
              <h4 className="text-xs font-bold text-blue-400 mb-1.5">🔵 Bleu</h4>
              <div className="space-y-0.5 text-xs">
                {bluePlayers.map((p) => (
                  <div key={p.id} className={`flex items-center gap-1 ${p.token === playerToken ? 'text-cyan-300 font-medium' : 'text-purple-200/80'}`}>
                    <span className="truncate">{p.name}</span>
                    {p.token === playerToken && (
                      <span className="text-[10px] text-cyan-400">(vous)</span>
                    )}
                    <span className={`text-[10px] ml-auto whitespace-nowrap ${p.role === 'spymaster' ? 'text-cyan-400' : 'text-purple-400/60'}`}>
                      {p.role === 'spymaster' ? '🔮 Espion' : '🎯 Agent'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Spectators */}
          {room.players.filter((p) => !p.team || p.team === '').length > 0 && (
            <div className="poki-panel p-2 border border-yellow-500/30">
              <h4 className="text-xs font-bold text-yellow-400 mb-1.5">👁️ Spectateurs</h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {room.players
                  .filter((p) => !p.team || p.team === '')
                  .map((p) => (
                    <div key={p.id} className={`flex items-center gap-1 px-2 py-1 rounded-lg bg-yellow-500/10 border border-yellow-500/20 ${p.token === playerToken ? 'text-yellow-300 font-medium' : 'text-purple-200/80'}`}>
                      <span>{p.name}</span>
                      {p.token === playerToken && (
                        <span className="text-[10px] text-yellow-400">(vous)</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Game history */}
      {(isPlaying || isGameOver) && game?.history && game.history.length > 0 && (
        <GameHistory history={game.history} />
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

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="poki-panel p-6 max-w-md w-full animate-scale-in">
            <h2 className="text-xl font-bold poki-title mb-3">🔄 Recommencer la partie ?</h2>
            <p className="text-purple-200/80 leading-relaxed mb-6">
              La partie en cours sera annulée et tout le monde retournera à la sélection des équipes.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-3 poki-btn-secondary font-medium"
              >
                Annuler
              </button>
              <button
                onClick={handleResetToLobby}
                className="flex-1 px-4 py-3 poki-btn-primary font-medium"
              >
                Recommencer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
