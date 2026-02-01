'use client';

import { useState } from 'react';

interface Card {
  id: string;
  word: string;
  color: string;
  category?: string | null;
  revealed: boolean;
  position: number;
}

interface CodenameCardProps {
  card: Card;
  isSpymaster: boolean;
  isClickable: boolean;
  onGuess?: (cardId: string) => void;
  onToggleInterest?: (cardId: string) => void;
  interestedPlayers?: string[];
}

const colorStyles: Record<string, { bg: string; border: string; text: string; shadow: string }> = {
  red: {
    bg: 'bg-gradient-to-br from-red-400 to-red-500',
    border: 'border-red-400',
    text: 'text-white',
    shadow: 'shadow-red-500/50',
  },
  blue: {
    bg: 'bg-gradient-to-br from-blue-400 to-blue-500',
    border: 'border-blue-400',
    text: 'text-white',
    shadow: 'shadow-blue-500/50',
  },
  neutral: {
    bg: 'bg-gradient-to-br from-stone-300 to-stone-400',
    border: 'border-stone-300',
    text: 'text-stone-700',
    shadow: 'shadow-stone-400/40',
  },
  assassin: {
    bg: 'bg-gradient-to-br from-gray-800 to-gray-950',
    border: 'border-gray-600',
    text: 'text-white',
    shadow: 'shadow-black/60',
  },
};

export function CodenameCard({
  card,
  isSpymaster,
  isClickable,
  onGuess,
  onToggleInterest,
  interestedPlayers = [],
}: CodenameCardProps) {
  const [isFlipping, setIsFlipping] = useState(false);

  // Click on card body = toggle interest
  const handleCardClick = () => {
    if (!isClickable || card.revealed || isSpymaster) return;
    if (onToggleInterest) {
      onToggleInterest(card.id);
    }
  };

  // Click on reveal button = actually reveal the card
  const handleRevealClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger card click
    if (!isClickable || card.revealed || isSpymaster) return;
    if (onGuess) {
      setIsFlipping(true);
      onGuess(card.id);
    }
  };

  const style = colorStyles[card.color] || colorStyles.neutral;

  const isRevealed = card.revealed || isFlipping;
  const hasInterests = interestedPlayers.length > 0 && !card.revealed;
  const showRevealButton = isClickable && !card.revealed && !isSpymaster;

  return (
    <div
      className={`
        relative w-full aspect-[4/3]
        ${isClickable && !card.revealed && !isSpymaster ? 'cursor-pointer group' : ''}
      `}
      onClick={handleCardClick}
    >
      {/* Front of card (unrevealed) */}
      <div
        className={`
          absolute inset-0 rounded-xl flex items-center justify-center
          ${isSpymaster ? 'bg-gradient-to-br from-slate-200 to-slate-300' : 'poki-card'} border-2
          ${isSpymaster ? style.border : 'border-amber-400/50'}
          ${hasInterests ? 'border-pink-400 shadow-lg shadow-pink-400/30' : ''}
          ${isClickable && !card.revealed && !isSpymaster && !hasInterests ? 'group-hover:border-pink-400/50' : ''}
          transition-all duration-300
          ${isRevealed ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}
        style={{
          boxShadow: isSpymaster ? '0 4px 12px rgba(0, 0, 0, 0.15)' : undefined,
        }}
      >
        {/* Reveal button (top-left) - only for operatives when clickable */}
        {showRevealButton && (
          <button
            onClick={handleRevealClick}
            className="absolute top-0.5 left-0.5 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-green-500 hover:bg-green-400 text-white flex items-center justify-center transition-all hover:scale-110 shadow-lg shadow-green-500/50"
            title="Révéler cette carte"
          >
            <span className="text-xs sm:text-sm">✓</span>
          </button>
        )}

        {/* Spymaster color indicator */}
        {isSpymaster && (
          <div
            className={`absolute inset-1 rounded-lg opacity-50 ${style.bg}`}
          />
        )}

        {/* Category indicator (top-right) */}
        {card.category && (
          <div
            className={`absolute top-0.5 right-0.5 text-[8px] sm:text-[9px] px-1 py-0.5 rounded
              ${isSpymaster
                ? 'bg-black/30 text-white/80'
                : 'bg-amber-800/30 text-amber-700'
              }
            `}
          >
            {card.category}
          </div>
        )}

        <span
          className={`
            relative z-10 text-center font-bold text-xs sm:text-sm md:text-base uppercase tracking-wide px-1
            ${isSpymaster ? style.text : 'text-amber-900'}
          `}
          style={{ textShadow: isSpymaster ? '0 1px 3px rgba(0,0,0,0.4)' : 'none' }}
        >
          {card.word}
        </span>

        {/* Player interest indicators (bottom) */}
        {hasInterests && (
          <div className="absolute bottom-0.5 left-0.5 right-0.5 z-10 flex flex-wrap gap-0.5 justify-center">
            {interestedPlayers.slice(0, 4).map((name) => (
              <div
                key={name}
                className="bg-pink-500/90 text-white text-[7px] sm:text-[8px] px-1 py-0.5 rounded truncate max-w-[45%]"
              >
                {name}
              </div>
            ))}
          </div>
        )}

        {/* Assassin skull indicator for spymaster */}
        {isSpymaster && card.color === 'assassin' && !card.category && (
          <div className="absolute top-0.5 right-0.5 text-base">💀</div>
        )}
        {isSpymaster && card.color === 'assassin' && card.category && (
          <div className="absolute top-0.5 left-0.5 text-base">💀</div>
        )}
      </div>

      {/* Back of card (revealed) */}
      <div
        className={`
          absolute inset-0 rounded-xl flex items-center justify-center
          ${style.bg} ${style.border} border-2 shadow-lg ${style.shadow}
          transition-all duration-300
          ${isRevealed ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        {/* Category indicator (top-right) on revealed card */}
        {card.category && (
          <div className="absolute top-0.5 right-0.5 text-[8px] sm:text-[9px] px-1 py-0.5 rounded bg-black/30 text-white/80">
            {card.category}
          </div>
        )}

        <span
          className={`text-center font-bold text-xs sm:text-sm md:text-base uppercase tracking-wide px-1 ${style.text}`}
          style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
        >
          {card.word}
        </span>
        {card.color === 'assassin' && !card.category && (
          <div className="absolute top-0.5 right-0.5 text-base">💀</div>
        )}
        {card.color === 'assassin' && card.category && (
          <div className="absolute top-0.5 left-0.5 text-base">💀</div>
        )}
      </div>
    </div>
  );
}
