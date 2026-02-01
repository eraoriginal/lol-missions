'use client';

import { CodenameCard } from './CodenameCard';

interface Card {
  id: string;
  word: string;
  color: string;
  category?: string | null;
  revealed: boolean;
  position: number;
}

interface GameBoardProps {
  cards: Card[];
  isSpymaster: boolean;
  isClickable: boolean;
  onGuess?: (cardId: string) => void;
  onToggleInterest?: (cardId: string) => void;
  interestedCards?: Set<string>;
  playerName?: string;
}

export function GameBoard({
  cards,
  isSpymaster,
  isClickable,
  onGuess,
  onToggleInterest,
  interestedCards,
  playerName,
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
          isInterested={interestedCards?.has(card.id) || false}
          playerName={playerName}
        />
      ))}
    </div>
  );
}
