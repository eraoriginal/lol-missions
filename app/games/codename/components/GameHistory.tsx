'use client';

import { AC, AcCard, AcGlyph, AcSectionNum } from '@/app/components/arcane';

interface HistoryEntry {
  id: string;
  team: string;
  type: string;
  clue: string | null;
  number: number | null;
  cardWord: string | null;
  cardColor: string | null;
  createdAt: string;
}

interface GameHistoryProps {
  history: HistoryEntry[];
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

const CARD_COLORS: Record<string, string> = {
  red: AC.rust,
  blue: AC.hex,
  neutral: AC.bone2,
  assassin: AC.ink,
};

export function GameHistory({ history }: GameHistoryProps) {
  if (history.length === 0) return null;

  const groupedHistory: { clue: HistoryEntry; guesses: HistoryEntry[] }[] = [];
  let currentGroup: { clue: HistoryEntry; guesses: HistoryEntry[] } | null = null;

  for (const entry of history) {
    if (entry.type === 'clue') {
      if (currentGroup) groupedHistory.push(currentGroup);
      currentGroup = { clue: entry, guesses: [] };
    } else if (entry.type === 'guess' && currentGroup) {
      currentGroup.guesses.push(entry);
    }
  }
  if (currentGroup) groupedHistory.push(currentGroup);

  return (
    <div>
      <div className="flex items-center gap-2.5 mb-3">
        <AcSectionNum n={'LOG'} />
        <h3
          className="m-0"
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          JOURNAL DE MISSION
          <span
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              color: AC.bone2,
              marginLeft: 8,
              textTransform: 'none',
              letterSpacing: '0.15em',
            }}
          >
            {'// '}
            {groupedHistory.length} tour{groupedHistory.length > 1 ? 's' : ''}
          </span>
        </h3>
      </div>

      <AcCard fold={false} dashed style={{ padding: 14 }}>
        <div
          className="ac-scroll"
          style={{
            maxHeight: 240,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          {groupedHistory.map((group) => {
            const teamColor = group.clue.team === 'red' ? AC.rust : AC.hex;
            const clueNum = group.clue.number;
            return (
              <div
                key={group.clue.id}
                style={{
                  borderLeft: `3px solid ${teamColor}`,
                  paddingLeft: 10,
                  paddingBottom: 6,
                }}
              >
                {/* Clue header */}
                <div
                  className="flex items-center gap-2 flex-wrap"
                  style={{
                    fontFamily:
                      "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: teamColor,
                  }}
                >
                  <span
                    style={{
                      background: teamColor,
                      color: group.clue.team === 'red' ? AC.bone : AC.ink,
                      padding: '1px 6px',
                      fontSize: 10,
                      letterSpacing: '0.18em',
                    }}
                  >
                    {group.clue.team === 'red' ? 'ROUGE' : 'BLEU'}
                  </span>
                  <span style={{ color: AC.bone }}>{group.clue.clue}</span>
                  <span
                    style={{
                      color: AC.bone2,
                      fontFamily:
                        "'JetBrains Mono', 'Courier New', monospace",
                      fontSize: 12,
                    }}
                  >
                    ({clueNum === 0 ? '∞' : clueNum})
                  </span>
                </div>

                {/* Guesses */}
                {group.guesses.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {group.guesses.map((guess) => {
                      const c =
                        CARD_COLORS[guess.cardColor || 'neutral'] || AC.bone2;
                      const isAssassin = guess.cardColor === 'assassin';
                      return (
                        <span
                          key={guess.id}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5"
                          style={{
                            background: hexWithAlpha(c, 0.15),
                            border: `1px dashed ${c}`,
                            color: c,
                            fontFamily:
                              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                            fontWeight: 700,
                            fontSize: 11,
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {isAssassin && (
                            <AcGlyph kind="x" color={AC.rust} size={10} stroke={2.5} />
                          )}
                          {guess.cardWord}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </AcCard>
    </div>
  );
}
