'use client';

import { GameBoard } from './GameBoard';
import { ClueInput } from './ClueInput';
import { AC } from '@/app/components/arcane';

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
    <div className="flex flex-col gap-4">
      {isMyTurn && !hasGivenClue && (
        <ClueInput roomCode={roomCode} playerToken={playerToken} />
      )}

      <GameBoard cards={cards} isSpymaster={true} isClickable={false} />

      {/* Legend */}
      <div
        className="flex justify-center gap-3 flex-wrap"
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 10,
          letterSpacing: '0.2em',
          color: AC.bone2,
          textTransform: 'uppercase',
        }}
      >
        <LegendItem color={AC.rust} label="ROUGE" />
        <LegendItem color={AC.hex} label="BLEU" />
        <LegendItem color={AC.bone2} label="NEUTRE" />
        <LegendItem color="#1A160F" label="ASSASSIN" striped />
      </div>
    </div>
  );
}

function LegendItem({
  color,
  label,
  striped,
}: {
  color: string;
  label: string;
  striped?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        style={{
          width: 12,
          height: 12,
          background: striped
            ? 'repeating-linear-gradient(45deg, #1A160F 0 3px, #0D0B08 3px 6px)'
            : color,
          border: `1.5px solid ${striped ? AC.rust : color}`,
          display: 'inline-block',
        }}
      />
      <span>{label}</span>
    </div>
  );
}
