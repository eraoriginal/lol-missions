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
import {
  AC,
  AC_CLIP,
  AcAlert,
  AcAvatar,
  AcButton,
  AcCard,
  AcDottedLabel,
  AcGlyph,
  AcGraffitiLayer,
  AcScreen,
  AcSectionNum,
  AcSplat,
} from '@/app/components/arcane';
import { LeaveRoomButton } from '@/app/components/LeaveRoomButton';
import { ConfirmDialog } from '@/app/components/ConfirmDialog';

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
  missions: { mission: { id: string; text: string; type: string; category: string; difficulty: string; points: number; isPrivate: boolean }; type: string; validated: boolean; decided: boolean; pointsEarned: number; resolvedText?: string }[];
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

function colorForPlayer(id: string): string {
  const palette = [AC.shimmer, AC.chem, AC.hex, AC.gold, AC.violet, AC.rust];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0;
  return palette[Math.abs(hash) % palette.length];
}

function hexWithAlpha(hex: string, alpha: number): string {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return hex;
  const bigint = parseInt(m[1], 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

export function GameView({ room, roomCode }: GameViewProps) {
  const [generating, setGenerating] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [joiningTeam, setJoiningTeam] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [localCards, setLocalCards] = useState<Card[]>(room.codenameGame?.cards || []);
  const [lastKnownTeam, setLastKnownTeam] = useState<string | null>(
    room.codenameGame?.currentTeam || null,
  );
  const router = useRouter();
  void router;

  const { isMuted, toggleMute } = useCodenameSocket(roomCode);

  const playerToken =
    typeof window !== 'undefined' ? localStorage.getItem(`room_${roomCode}_player`) : null;

  const creatorToken =
    typeof window !== 'undefined' ? localStorage.getItem(`room_${roomCode}_creator`) : null;

  const isCreator = !!creatorToken;
  const currentPlayer = room.players.find((p) => p.token === playerToken);
  const game = room.codenameGame;

  useEffect(() => {
    if (game?.cards) {
      const turnChanged = game.currentTeam !== lastKnownTeam;
      if (turnChanged) {
        setLocalCards(game.cards);
        setLastKnownTeam(game.currentTeam);
      } else {
        setLocalCards((prevCards) => {
          return game.cards.map((serverCard) => {
            const localCard = prevCards.find((c) => c.id === serverCard.id);
            if (serverCard.revealed) return serverCard;
            if (localCard && !serverCard.revealed) {
              return {
                ...serverCard,
                interests: localCard.interests || serverCard.interests,
              };
            }
            return serverCard;
          });
        });
      }
    }
  }, [game?.cards, game?.currentTeam, lastKnownTeam]);

  const handleCardsUpdate = useCallback((updatedCards: Card[]) => {
    setLocalCards(updatedCards);
  }, []);

  useCardInterests(roomCode, localCards, handleCardsUpdate);

  const isLobby = !room.gameStarted;
  const isRoleSelection = room.gameStarted && game && game.cards.length === 0;
  const isPlaying = game && game.cards.length > 0 && !game.gameOver;
  const isGameOver = game?.gameOver;

  const isSpymaster = currentPlayer?.role === 'spymaster';
  const isOperative = currentPlayer?.role === 'operative';
  const isOnCurrentTeam = currentPlayer?.team === game?.currentTeam;
  const isMyTurn = isOnCurrentTeam && !!game;
  const isSpectator = currentPlayer && (!currentPlayer.team || currentPlayer.team === '');

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

  const handleJoinTeam = async (team: 'red' | 'blue') => {
    if (!playerToken) return;
    setJoiningTeam(true);
    setError(null);
    try {
      const teamRes = await fetch(`/api/rooms/${roomCode}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerToken, team }),
      });
      if (!teamRes.ok) {
        const data = await teamRes.json();
        throw new Error(data.error || 'Erreur');
      }
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

  // Phase 1 — Lobby
  if (isLobby) {
    return <CodenameRoomLobby room={room} roomCode={roomCode} />;
  }

  const SpectatorJoinPanel = () => (
    <AcCard fold dashed style={{ padding: 16 }}>
      <div className="flex items-center gap-2.5 mb-3">
        <AcGlyph kind="zoom" color={AC.gold} size={18} stroke={2.5} />
        <h3
          className="m-0"
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: AC.gold,
          }}
        >
          MODE SPECTATEUR
        </h3>
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 11,
          color: AC.bone2,
          marginBottom: 12,
          letterSpacing: '0.1em',
        }}
      >
        {'// rejoins une équipe pour participer'}
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        <AcButton
          variant="danger"
          size="md"
          onClick={() => handleJoinTeam('red')}
          disabled={joiningTeam || redPlayers.length >= 5}
          icon={<AcGlyph kind="plus" color={AC.bone} size={14} />}
        >
          {joiningTeam ? '...' : `ROUGE · ${redPlayers.length}/5`}
        </AcButton>
        <AcButton
          variant="hex"
          size="md"
          onClick={() => handleJoinTeam('blue')}
          disabled={joiningTeam || bluePlayers.length >= 5}
          icon={<AcGlyph kind="plus" color={AC.ink} size={14} />}
        >
          {joiningTeam ? '...' : `BLEU · ${bluePlayers.length}/5`}
        </AcButton>
      </div>
      {game && game.cards.length > 0 && (
        <div
          className="text-center mt-3"
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 10,
            color: AC.bone2,
            letterSpacing: '0.15em',
          }}
        >
          {"// tu rejoindras en tant qu'agent"}
        </div>
      )}
    </AcCard>
  );

  // Common top bar
  const TopBar = () => (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-3 flex-wrap">
        <LeaveRoomButton roomCode={roomCode} />
        <div className="hidden sm:block min-w-[180px]">
          <AcDottedLabel>{'// ROOM · '}{roomCode}</AcDottedLabel>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <RulesModal />
        <AcButton
          variant="ghost"
          size="sm"
          onClick={toggleMute}
          aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
          icon={
            <AcGlyph
              kind={isMuted ? 'x' : 'check'}
              color={AC.bone}
              size={12}
            />
          }
        >
          {isMuted ? 'MUET' : 'SON'}
        </AcButton>
        {isCreator && isGameOver && (
          <AcButton
            variant="primary"
            size="sm"
            onClick={handleRestart}
            disabled={restarting}
            icon={<AcGlyph kind="play" color={AC.ink} size={12} />}
          >
            {restarting ? '...' : 'REJOUER'}
          </AcButton>
        )}
        {isCreator && isPlaying && (
          <>
            <AcButton
              variant="ghost"
              size="sm"
              onClick={handleRegenerateBoard}
              disabled={generating}
              icon={<AcGlyph kind="puzzle" color={AC.bone} size={12} />}
            >
              {generating ? '...' : 'PLATEAU'}
            </AcButton>
            <AcButton
              variant="ghost"
              size="sm"
              onClick={handleRestart}
              disabled={restarting}
              icon={<AcGlyph kind="zoom" color={AC.bone} size={12} />}
            >
              {restarting ? '...' : 'RÔLES'}
            </AcButton>
          </>
        )}
        {isCreator && isRoleSelection && (
          <AcButton
            variant="ghost"
            size="sm"
            onClick={() => setShowResetConfirm(true)}
            disabled={resetting}
            icon={<AcGlyph kind="arrowLeft" color={AC.bone} size={12} />}
          >
            {resetting ? '...' : 'ÉQUIPES'}
          </AcButton>
        )}
      </div>
    </div>
  );

  // Phase 2 — Role selection
  if (isRoleSelection) {
    return (
      <AcScreen>
        <div style={{ position: 'absolute', top: -40, right: -80, pointerEvents: 'none' }}>
          <AcSplat color={AC.violet} size={420} opacity={0.4} seed={2} />
        </div>
        <div style={{ position: 'absolute', bottom: 60, left: -60, pointerEvents: 'none' }}>
          <AcSplat color={AC.chem} size={300} opacity={0.3} seed={4} />
        </div>
        <AcGraffitiLayer />

        <div
          className="relative mx-auto px-4 sm:px-8 py-6 sm:py-9"
          style={{ maxWidth: 1200 }}
        >
          <TopBar />

          {error && (
            <div className="mb-4">
              <AcAlert tone="danger" tape="// ERR">
                <span style={{ color: AC.bone }}>{'// '}{error}</span>
              </AcAlert>
            </div>
          )}

          {isSpectator && (
            <div className="mb-5">
              <SpectatorJoinPanel />
            </div>
          )}

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

          {isSpectator && (
            <div style={{ opacity: 0.6 }}>
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

        {showResetConfirm && (
          <ConfirmDialog
            title="Retour aux équipes ?"
            message="La partie en cours sera annulée et tout le monde retournera au lobby."
            confirmText="Recommencer"
            cancelText="Annuler"
            confirmColor="orange"
            tapeLabel="// RESET"
            onConfirm={handleResetToLobby}
            onCancel={() => setShowResetConfirm(false)}
          />
        )}
      </AcScreen>
    );
  }

  // Phase 3 & 4 — Playing / Game Over
  const turnColor = game
    ? game.currentTeam === 'red'
      ? AC.rust
      : AC.hex
    : AC.bone;

  return (
    <AcScreen>
      <div style={{ position: 'absolute', top: -40, right: -80, pointerEvents: 'none' }}>
        <AcSplat
          color={isPlaying ? turnColor : AC.shimmer}
          size={420}
          opacity={0.35}
          seed={2}
        />
      </div>
      <div style={{ position: 'absolute', bottom: 80, left: -80, pointerEvents: 'none' }}>
        <AcSplat color={AC.chem} size={300} opacity={0.25} seed={4} />
      </div>

      <div
        className="relative mx-auto px-4 sm:px-8 py-6 sm:py-9"
        style={{ maxWidth: 1300 }}
      >
        <TopBar />

        {error && (
          <div className="mb-4">
            <AcAlert tone="danger" tape="// ERR">
              <span style={{ color: AC.bone }}>{'// '}{error}</span>
            </AcAlert>
          </div>
        )}

        {/* Status / Clue */}
        {game && (
          <div className="mb-5">
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
          </div>
        )}

        {isPlaying && isSpectator && (
          <div className="mb-5">
            <SpectatorJoinPanel />
          </div>
        )}

        {/* Playing phase */}
        {isPlaying && currentPlayer && game && (
          <div className="mb-5">
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
              <GameBoard cards={localCards} isSpymaster={false} isClickable={false} />
            )}
          </div>
        )}

        {isGameOver && isSpectator && (
          <div className="mb-5">
            <SpectatorJoinPanel />
          </div>
        )}

        {/* Game over */}
        {isGameOver && game && (
          <div className="mb-5 flex flex-col gap-4">
            <GameBoard cards={localCards} isSpymaster={true} isClickable={false} />
            {isCreator && (
              <div className="text-center">
                <AcButton
                  variant="primary"
                  size="lg"
                  drip
                  onClick={handleRestart}
                  disabled={restarting}
                  icon={<AcGlyph kind="play" color={AC.ink} size={16} />}
                >
                  {restarting ? 'PRÉPARATION…' : 'NOUVELLE PARTIE'}
                </AcButton>
              </div>
            )}
          </div>
        )}

        {/* Team rosters */}
        {(isPlaying || isGameOver) && (
          <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TeamRoster
              label="ROUGE"
              color={AC.rust}
              players={redPlayers}
              playerToken={playerToken}
            />
            <TeamRoster
              label="BLEU"
              color={AC.hex}
              players={bluePlayers}
              playerToken={playerToken}
            />
            {room.players.filter((p) => !p.team || p.team === '').length > 0 && (
              <div className="sm:col-span-2">
                <SpectatorsList
                  players={room.players.filter((p) => !p.team || p.team === '')}
                  playerToken={playerToken}
                />
              </div>
            )}
          </div>
        )}

        {/* History */}
        {(isPlaying || isGameOver) && game?.history && game.history.length > 0 && (
          <GameHistory history={game.history} />
        )}
      </div>
    </AcScreen>
  );
}

function TeamRoster({
  label,
  color,
  players,
  playerToken,
}: {
  label: string;
  color: string;
  players: Player[];
  playerToken: string | null;
}) {
  return (
    <div
      style={{
        padding: 10,
        border: `1.5px solid ${color}`,
        background: `linear-gradient(180deg, ${hexWithAlpha(color, 0.08)} 0%, rgba(13,11,8,0.55) 100%)`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span
          style={{
            background: color,
            color: label === 'ROUGE' ? AC.bone : AC.ink,
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: '0.12em',
            padding: '2px 8px',
          }}
        >
          ÉQUIPE {label}
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 10,
            color: color,
            letterSpacing: '0.15em',
          }}
        >
          {players.length}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        {players.map((p) => {
          const isMe = p.token === playerToken;
          const isSpy = p.role === 'spymaster';
          return (
            <div
              key={p.id}
              className="flex items-center gap-2 px-2 py-1"
              style={{
                background: 'rgba(13,11,8,0.45)',
                border: `1px dashed ${hexWithAlpha(color, 0.3)}`,
              }}
            >
              <AcAvatar name={p.name} color={colorForPlayer(p.id)} size={20} />
              <span
                style={{
                  fontFamily:
                    "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  color: AC.bone,
                  flex: 1,
                }}
              >
                {p.name}
                {isMe && (
                  <span style={{ color: AC.bone2, fontSize: 9, marginLeft: 4 }}>(TOI)</span>
                )}
              </span>
              <span
                className="flex items-center gap-1"
                style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: 9,
                  letterSpacing: '0.15em',
                  color: isSpy ? color : AC.bone2,
                  textTransform: 'uppercase',
                }}
              >
                <AcGlyph
                  kind={isSpy ? 'zoom' : 'target'}
                  color={isSpy ? color : AC.bone2}
                  size={10}
                  stroke={2}
                />
                {isSpy ? 'ESPION' : 'AGENT'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SpectatorsList({
  players,
  playerToken,
}: {
  players: Player[];
  playerToken: string | null;
}) {
  return (
    <div
      style={{
        padding: 10,
        border: `1.5px dashed ${AC.gold}`,
        background: 'rgba(245,185,18,0.06)',
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <AcSectionNum n={'SP'} />
        <span
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 13,
            letterSpacing: '0.08em',
            color: AC.gold,
            textTransform: 'uppercase',
          }}
        >
          SPECTATEURS · {players.length}
        </span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {players.map((p) => {
          const isMe = p.token === playerToken;
          return (
            <div
              key={p.id}
              className="flex items-center gap-1.5 px-2 py-1"
              style={{
                background: 'rgba(13,11,8,0.45)',
                border: `1px dashed ${hexWithAlpha(AC.gold, 0.4)}`,
                clipPath: AC_CLIP,
              }}
            >
              <AcAvatar name={p.name} color={colorForPlayer(p.id)} size={16} />
              <span
                style={{
                  fontFamily:
                    "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  color: AC.bone,
                }}
              >
                {p.name}
                {isMe && (
                  <span style={{ color: AC.bone2, fontSize: 9, marginLeft: 4 }}>(TOI)</span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
