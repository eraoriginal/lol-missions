'use client';

import { useState } from 'react';
import { AC, AC_CLIP, AcGlyph } from '@/app/components/arcane';

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

function hexWithAlpha(hex: string, alpha: number): string {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return hex;
  const bigint = parseInt(m[1], 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

// Arcane palette mapping pour les 4 couleurs du jeu.
// - red → rust (danger, chaud)
// - blue → hex (info, froid)
// - neutral → bone2 (papier)
// - assassin → ink + bone (crâne, menace)
const COLOR_STYLES: Record<
  string,
  { accent: string; textColor: string; bg: string }
> = {
  red: { accent: AC.rust, textColor: AC.bone, bg: AC.rust },
  blue: { accent: AC.hex, textColor: AC.ink, bg: AC.hex },
  neutral: { accent: AC.bone2, textColor: AC.ink, bg: AC.bone2 },
  assassin: { accent: AC.ink, textColor: AC.bone, bg: '#1A160F' },
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

  const handleCardClick = () => {
    if (!isClickable || card.revealed || isSpymaster) return;
    if (onToggleInterest) {
      onToggleInterest(card.id);
    }
  };

  const handleRevealClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isClickable || card.revealed || isSpymaster) return;
    if (onGuess) {
      setIsFlipping(true);
      onGuess(card.id);
    }
  };

  const style = COLOR_STYLES[card.color] || COLOR_STYLES.neutral;
  const isRevealed = card.revealed || isFlipping;
  const hasInterests = interestedPlayers.length > 0 && !card.revealed;
  const showRevealButton = isClickable && !card.revealed && !isSpymaster;
  const isAssassin = card.color === 'assassin';

  return (
    <div
      className={isClickable && !card.revealed && !isSpymaster ? 'cursor-pointer group' : ''}
      onClick={handleCardClick}
      style={{ position: 'relative', width: '100%', aspectRatio: '4 / 3' }}
    >
      {/* FRONT - unrevealed */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isSpymaster
            ? `linear-gradient(180deg, ${hexWithAlpha(style.accent, 0.22)} 0%, rgba(13,11,8,0.55) 100%)`
            : 'linear-gradient(180deg, rgba(240,228,193,0.08) 0%, rgba(13,11,8,0.6) 100%)',
          border: isSpymaster
            ? `2px solid ${style.accent}`
            : hasInterests
              ? `2px solid ${AC.shimmer}`
              : `1.5px dashed ${AC.bone2}`,
          clipPath: AC_CLIP,
          opacity: isRevealed ? 0 : 1,
          pointerEvents: isRevealed ? 'none' : 'auto',
          transition: 'opacity 0.25s',
          padding: 6,
        }}
      >
        {/* Reveal button — coin haut-gauche */}
        {showRevealButton && (
          <button
            type="button"
            onClick={handleRevealClick}
            title="Révéler cette carte"
            aria-label="Révéler cette carte"
            style={{
              position: 'absolute',
              top: 3,
              left: 3,
              zIndex: 3,
              width: 24,
              height: 24,
              background: AC.chem,
              color: AC.ink,
              border: `1.5px solid ${AC.ink}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              clipPath: AC_CLIP,
            }}
          >
            <AcGlyph kind="check" color={AC.ink} size={14} stroke={3} />
          </button>
        )}

        {/* Category label top-right */}
        {card.category && (
          <div
            style={{
              position: 'absolute',
              top: 3,
              right: 3,
              background: isSpymaster ? 'rgba(13,11,8,0.6)' : 'rgba(13,11,8,0.6)',
              color: isSpymaster ? AC.bone : AC.bone2,
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 8,
              letterSpacing: '0.15em',
              padding: '2px 5px',
              textTransform: 'uppercase',
              border: `1px dashed ${AC.bone2}`,
              zIndex: 2,
            }}
          >
            {card.category}
          </div>
        )}

        {/* Assassin skull — spymaster view */}
        {isSpymaster && isAssassin && (
          <div
            style={{
              position: 'absolute',
              top: 4,
              left: card.category ? undefined : 4,
              right: card.category ? 4 : undefined,
              zIndex: 2,
            }}
          >
            <AcGlyph kind="x" color={AC.rust} size={16} stroke={3} />
          </div>
        )}

        {/* Word */}
        <span
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(12px, 1.6vw, 18px)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: isSpymaster ? style.textColor : AC.bone,
            padding: '0 6px',
            lineHeight: 1.1,
          }}
        >
          {card.word}
        </span>

        {/* Interests — bottom */}
        {hasInterests && (
          <div
            style={{
              position: 'absolute',
              bottom: 3,
              left: 3,
              right: 3,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            {interestedPlayers.slice(0, 4).map((name) => (
              <span
                key={name}
                style={{
                  background: AC.shimmer,
                  color: AC.ink,
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: 7,
                  letterSpacing: '0.12em',
                  padding: '1px 4px',
                  textTransform: 'uppercase',
                  maxWidth: '45%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* BACK - revealed */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isAssassin
            ? 'repeating-linear-gradient(45deg, #1A160F 0 6px, #0D0B08 6px 12px)'
            : style.bg,
          border: `2px solid ${style.accent}`,
          clipPath: AC_CLIP,
          opacity: isRevealed ? 1 : 0,
          pointerEvents: isRevealed ? 'auto' : 'none',
          transition: 'opacity 0.3s',
          padding: 6,
        }}
      >
        {/* Stencil stamp when revealed */}
        <div
          style={{
            position: 'absolute',
            inset: 6,
            border: `1.5px dashed ${isAssassin ? AC.rust : hexWithAlpha(style.textColor, 0.3)}`,
            pointerEvents: 'none',
          }}
        />

        {/* Category */}
        {card.category && (
          <div
            style={{
              position: 'absolute',
              top: 3,
              right: 3,
              background: 'rgba(13,11,8,0.5)',
              color: isAssassin ? AC.bone : style.textColor,
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 8,
              letterSpacing: '0.15em',
              padding: '2px 5px',
              textTransform: 'uppercase',
              border: `1px dashed ${isAssassin ? AC.bone : style.textColor}`,
              zIndex: 2,
            }}
          >
            {card.category}
          </div>
        )}

        {isAssassin && (
          <div
            style={{
              position: 'absolute',
              top: 4,
              left: card.category ? undefined : 4,
              right: card.category ? 4 : undefined,
              zIndex: 2,
            }}
          >
            <AcGlyph kind="x" color={AC.rust} size={16} stroke={3} />
          </div>
        )}

        <span
          style={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(12px, 1.6vw, 18px)',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: style.textColor,
            padding: '0 6px',
            lineHeight: 1.1,
          }}
        >
          {card.word}
        </span>
      </div>
    </div>
  );
}
