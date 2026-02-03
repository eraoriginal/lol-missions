'use client';

import { GameBoard } from './GameBoard';
import { ClueInput } from './ClueInput';

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

interface SpymasterViewProps {
  roomCode: string;
  playerToken: string;
  cards: Card[];
  isMyTurn: boolean;
  hasGivenClue: boolean;
}

export function SpymasterView({
  roomCode,
  playerToken,
  cards,
  isMyTurn,
  hasGivenClue,
}: SpymasterViewProps) {
  return (
    <div className="space-y-4">
      {/* Clue input (only if it's my turn and I haven't given a clue yet) */}
      {isMyTurn && !hasGivenClue && (
        <ClueInput roomCode={roomCode} playerToken={playerToken} />
      )}

      {/* Game board - spymaster sees all colors */}
      <GameBoard cards={cards} isSpymaster={true} isClickable={false} />

      {/* Legend */}
      <div className="flex justify-center gap-4 text-xs text-purple-300/70">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span>Rouge</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span>Bleu</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-stone-400"></div>
          <span>Neutre</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-900 border border-gray-600"></div>
          <span>💀 Assassin</span>
        </div>
      </div>
    </div>
  );
}
