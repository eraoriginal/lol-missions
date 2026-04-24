'use client';

import { useState, useMemo, useEffect } from 'react';
import { GameBoard } from './GameBoard';
import {
  AC,
  AcAlert,
  AcButton,
  AcGlyph,
} from '@/app/components/arcane';

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
}: OperativeViewProps) {
  const [guessing, setGuessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticInterests, setOptimisticInterests] = useState<
    Record<string, boolean>
  >({});

  const canGuess = isMyTurn && hasClue && guessesLeft > 0 && !guessing;

  useEffect(() => {
    setOptimisticInterests((prev) => {
      const newState = { ...prev };
      let changed = false;
      for (const cardId of Object.keys(prev)) {
        const card = cards.find((c) => c.id === cardId);
        const serverHasInterest =
          card?.interests?.some((i) => i.playerName === playerName) ?? false;
        const expectedState = prev[cardId];
        if (serverHasInterest === expectedState) {
          delete newState[cardId];
          changed = true;
        }
      }
      return changed ? newState : prev;
    });
  }, [cards, playerName]);

  const cardsWithOptimisticInterests = useMemo(() => {
    return cards.map((card) => {
      const serverInterests = card.interests || [];
      const expectedState = optimisticInterests[card.id];
      if (expectedState === undefined) return card;
      const playerInServer = serverInterests.some(
        (i) => i.playerName === playerName,
      );
      if (playerInServer === expectedState) return card;
      let finalInterests = [...serverInterests];
      if (expectedState && !playerInServer) {
        finalInterests.push({
          id: 'optimistic',
          cardId: card.id,
          playerName,
        });
      } else if (!expectedState && playerInServer) {
        finalInterests = finalInterests.filter(
          (i) => i.playerName !== playerName,
        );
      }
      return { ...card, interests: finalInterests };
    });
  }, [cards, optimisticInterests, playerName]);

  const handleToggleInterest = async (cardId: string) => {
    const card = cardsWithOptimisticInterests.find((c) => c.id === cardId);
    const isCurrentlyShown =
      card?.interests?.some((i) => i.playerName === playerName) ?? false;
    const newExpectedState = !isCurrentlyShown;

    setOptimisticInterests((prev) => ({
      ...prev,
      [cardId]: newExpectedState,
    }));

    try {
      await fetch(`/api/games/codename/${roomCode}/interest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerToken, cardId }),
      });
    } catch (err) {
      console.error('Error toggling interest:', err);
      setOptimisticInterests((prev) => {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Action bar */}
      {isMyTurn && hasClue && (
        <div
          className="flex items-center justify-center gap-3 flex-wrap"
          style={{
            padding: '10px 14px',
            border: `1.5px dashed ${AC.chem}`,
            background: 'rgba(18,214,168,0.08)',
          }}
        >
          <div className="flex items-center gap-2">
            <AcGlyph kind="target" color={AC.chem} size={16} stroke={2.5} />
            <span
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 11,
                letterSpacing: '0.2em',
                color: AC.chem,
                textTransform: 'uppercase',
              }}
            >
              {'// clique le bouton ✓ pour révéler une carte'}
            </span>
          </div>
          <AcButton
            variant="ghost"
            size="sm"
            onClick={handlePass}
            icon={<AcGlyph kind="arrowRight" color={AC.bone} size={12} />}
          >
            PASSER
          </AcButton>
        </div>
      )}

      {error && (
        <AcAlert tone="danger" tape="// ERR">
          <span style={{ color: AC.bone }}>{'// '}{error}</span>
        </AcAlert>
      )}

      <GameBoard
        cards={cardsWithOptimisticInterests}
        isSpymaster={false}
        isClickable={canGuess}
        onGuess={handleGuess}
        onToggleInterest={handleToggleInterest}
      />

      {guessing && (
        <div
          className="text-center"
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 11,
            letterSpacing: '0.2em',
            color: AC.bone2,
            textTransform: 'uppercase',
          }}
        >
          {'// révélation en cours...'}
        </div>
      )}
    </div>
  );
}
