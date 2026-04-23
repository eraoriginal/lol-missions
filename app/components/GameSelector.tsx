'use client';

import { AC, AcGlyph, AcStamp } from './arcane';
import { GAMES } from './gameCatalog';

interface GameSelectorProps {
  selectedGame: string;
  onSelectGame: (gameId: string) => void;
}

const OPTION_CLIP =
  'polygon(2% 6%, 12% 2%, 50% 4%, 88% 2%, 98% 8%, 98% 92%, 90% 98%, 50% 96%, 10% 98%, 2% 92%)';

export function GameSelector({ selectedGame, onSelectGame }: GameSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {GAMES.map((g) => {
        const selected = g.id === selectedGame;
        const disabled = !g.available;
        return (
          // Wrapper non-cliqué : porte le `position: relative` pour ancrer les
          // stamps en absolute SANS être clippé par le bouton en dessous.
          // Sans ce wrapper, clip-path du bouton mange les bords du tampon.
          <div key={g.id} className="relative" style={{ overflow: 'visible' }}>
            <button
              type="button"
              onClick={() => g.available && onSelectGame(g.id)}
              disabled={disabled}
              className="w-full text-left"
              style={{
                padding: 12,
                background: selected
                  ? 'rgba(255,61,139,0.12)'
                  : 'rgba(240,228,193,0.03)',
                border: selected
                  ? `2px solid ${AC.shimmer}`
                  : `1.5px dashed ${AC.bone2}`,
                opacity: disabled ? 0.45 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer',
                clipPath: OPTION_CLIP,
                color: AC.bone,
              }}
            >
              <div className="flex items-center gap-2">
                <AcGlyph kind={g.icon} color={g.color} size={20} />
                <div
                  className="text-xs"
                  style={{
                    fontFamily:
                      "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                    fontWeight: 700,
                    letterSpacing: '0.04em',
                  }}
                >
                  {g.name}
                </div>
              </div>
              <div
                className="mt-1.5"
                style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: 10,
                  color: AC.bone2,
                  lineHeight: 1.35,
                }}
              >
                {g.description}
              </div>
            </button>
            {/* Stamps rendus EN DEHORS du <button> clippé pour ne pas être
                coupés par le clip-path. Positionnés absolus dans le wrapper. */}
            {selected && (
              <div
                className="absolute pointer-events-none"
                style={{ top: -10, right: -6, zIndex: 2 }}
              >
                <AcStamp color={AC.shimmer} rotate={-4} bg={AC.ink}>
                  ✓ SÉLECTIONNÉ
                </AcStamp>
              </div>
            )}
            {disabled && (
              <div
                className="absolute pointer-events-none"
                style={{ top: -8, right: -4, zIndex: 2 }}
              >
                <AcStamp color={AC.bone2} rotate={6} bg={AC.ink}>
                  COMING SOON
                </AcStamp>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
