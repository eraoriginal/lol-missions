'use client';

import { useState } from 'react';
import { GameBoard } from './GameBoard';
import { useCodenameSound } from '../hooks/useCodenameSound';

interface Card {
  id: string;
  word: string;
  color: string;
  category?: string | null;
  revealed: boolean;
  position: number;
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
  const [interestedCards, setInterestedCards] = useState<Set<string>>(new Set());
  const { play } = useCodenameSound();

  const canGuess = isMyTurn && hasClue && guessesLeft > 0 && !guessing;

  const handleToggleInterest = (cardId: string) => {
    if (!canGuess) return;
    setInterestedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
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
        play(data.result.type as 'correct' | 'wrong_team' | 'neutral' | 'assassin');

        // Check for victory
        if (data.game?.gameOver && data.game?.winner) {
          setTimeout(() => play('victory'), 500);
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
        cards={cards}
        isSpymaster={false}
        isClickable={canGuess}
        onGuess={handleGuess}
        onToggleInterest={handleToggleInterest}
        interestedCards={interestedCards}
        playerName={playerName}
      />

      {guessing && (
        <div className="text-center text-purple-300/70 text-sm">
          ⏳ Révélation...
        </div>
      )}
    </div>
  );
}
