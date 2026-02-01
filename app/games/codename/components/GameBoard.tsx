'use client';

import { CodenameCard } from './CodenameCard';

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

interface GameBoardProps {
  cards: Card[];
  isSpymaster: boolean;
  isClickable: boolean;
  onGuess?: (cardId: string) => void;
  onToggleInterest?: (cardId: string) => void;
}

export function GameBoard({
  cards,
  isSpymaster,
  isClickable,
  onGuess,
  onToggleInterest,
}: GameBoardProps) {
  // Sort cards by position
  const sortedCards = [...cards].sort((a, b) => a.position - b.position);

  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4 w-full max-w-4xl mx-auto">
      {sortedCards.map((card) => (
        <CodenameCard
          key={card.id}
          card={card}
          isSpymaster={isSpymaster}
          isClickable={isClickable}
          onGuess={onGuess}
          onToggleInterest={onToggleInterest}
          interestedPlayers={card.interests?.map((i) => i.playerName) || []}
        />
      ))}
    </div>
  );
}
