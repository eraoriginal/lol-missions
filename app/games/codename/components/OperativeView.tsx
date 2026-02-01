'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { GameBoard } from './GameBoard';
import { useCodenameSound } from '../hooks/useCodenameSound';

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

interface OperativeViewProps {
  roomCode: string;
  playerToken: string;
  playerName: string;
  cards: Card[];
  isMyTurn: boolean;
  hasClue: boolean;
  guessesLeft: number;
  currentTeam: string;
}

export function OperativeView({
  roomCode,
  playerToken,
  playerName,
  cards,
  isMyTurn,
  hasClue,
  guessesLeft,
  currentTeam,
}: OperativeViewProps) {
  const [guessing, setGuessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Optimistic local state: cardId -> expected state (true = interested, false = not interested)
  const [optimisticInterests, setOptimisticInterests] = useState<Record<string, boolean>>({});
  const { play } = useCodenameSound();

  const canGuess = isMyTurn && hasClue && guessesLeft > 0 && !guessing;

  // Clean up optimistic state when server data matches expected state
  useEffect(() => {
    setOptimisticInterests(prev => {
      const newState = { ...prev };
      let changed = false;

      for (const cardId of Object.keys(prev)) {
        const card = cards.find(c => c.id === cardId);
        const serverHasInterest = card?.interests?.some(i => i.playerName === playerName) ?? false;
        const expectedState = prev[cardId];

        // If server now matches what we expected, remove from optimistic state
        if (serverHasInterest === expectedState) {
          delete newState[cardId];
          changed = true;
        }
      }

      return changed ? newState : prev;
    });
  }, [cards, playerName]);

  // Merge server interests with optimistic local state
  const cardsWithOptimisticInterests = useMemo(() => {
    return cards.map(card => {
      const serverInterests = card.interests || [];
      const expectedState = optimisticInterests[card.id];

      // If no optimistic state for this card, use server data as-is
      if (expectedState === undefined) {
        return card;
      }

      const playerInServer = serverInterests.some(i => i.playerName === playerName);

      // If server already matches expected state, use server data
      if (playerInServer === expectedState) {
        return card;
      }

      // Apply optimistic change
      let finalInterests = [...serverInterests];

      if (expectedState && !playerInServer) {
        // Add optimistic interest
        finalInterests.push({ id: 'optimistic', cardId: card.id, playerName });
      } else if (!expectedState && playerInServer) {
        // Remove optimistic interest
        finalInterests = finalInterests.filter(i => i.playerName !== playerName);
      }

      return { ...card, interests: finalInterests };
    });
  }, [cards, optimisticInterests, playerName]);

  const handleToggleInterest = async (cardId: string) => {
    // Find current displayed state (including optimistic)
    const card = cardsWithOptimisticInterests.find(c => c.id === cardId);
    const isCurrentlyShown = card?.interests?.some(i => i.playerName === playerName) ?? false;
    const newExpectedState = !isCurrentlyShown;

    // Optimistic update - instant UI feedback
    setOptimisticInterests(prev => ({
      ...prev,
      [cardId]: newExpectedState
    }));

    try {
      await fetch(`/api/games/codename/${roomCode}/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerToken, cardId }),
      });
      // Don't clear optimistic state here - let the useEffect clean it up
      // when server data arrives and matches expected state
    } catch (err) {
      console.error('Error toggling interest:', err);
      // Revert optimistic update on error
      setOptimisticInterests(prev => {
        const newState = { ...prev };
        delete newState[cardId];
        return newState;
      });
    }
  };

  const handleGuess = async (cardId: string) => {
    if (!canGuess) return;

    setGuessing(true);
    setError(null);

    try {
      const res = await fetch(`/api/games/codename/${roomCode}/guess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerToken, cardId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur');
      }

      // Play appropriate sound based on result
      if (data.result) {
        const isVictory = data.game?.gameOver && data.game?.winner;
        const isWinByCorrectGuess = isVictory && data.result.type === 'correct';

        if (isWinByCorrectGuess) {
          // Only play victory sound when winning by finding all cards
          play('victory');
        } else if (isVictory) {
          // Other game over scenarios (assassin, opponent helped us win)
          play(data.result.type as 'correct' | 'wrong_team' | 'neutral' | 'assassin');
          setTimeout(() => play('victory'), 500);
        } else {
          // Normal guess, no victory
          play(data.result.type as 'correct' | 'wrong_team' | 'neutral' | 'assassin');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setGuessing(false);
    }
  };

  const handlePass = async () => {
    if (!isMyTurn || !hasClue) return;

    try {
      const res = await fetch(`/api/games/codename/${roomCode}/pass`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerToken }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }

      play('turn_change');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <div className="space-y-4">
      {/* Small role badge + action bar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30">
          <span>🎯</span>
          <span>Agent</span>
        </span>

        <div className="flex items-center gap-3">
          {isMyTurn && hasClue && (
            <>
              <span className="text-sm text-green-400 animate-pulse">→ Cliquez ✓ pour révéler</span>
              <button
                onClick={handlePass}
                className="text-sm poki-btn-secondary px-3 py-1"
              >
                ⏭️ Passer
              </button>
            </>
          )}
          {isMyTurn && !hasClue && (
            <span className="text-sm text-purple-300/70">Attendez l'indice...</span>
          )}
          {!isMyTurn && (
            <span className="text-sm text-purple-400/50">
              Tour {currentTeam === 'red' ? 'Rouge' : 'Bleu'}
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="text-center text-red-400 text-sm bg-red-500/20 px-3 py-2 rounded-lg border border-red-500/50">
          {error}
        </div>
      )}

      {/* Game board - operative only sees revealed colors */}
      <GameBoard
        cards={cardsWithOptimisticInterests}
        isSpymaster={false}
        isClickable={canGuess}
        onGuess={handleGuess}
        onToggleInterest={handleToggleInterest}
      />

      {guessing && (
        <div className="text-center text-purple-300/70 text-sm">
          ⏳ Révélation...
        </div>
      )}
    </div>
  );
}
