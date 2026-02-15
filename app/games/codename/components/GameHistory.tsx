'use client';

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

export function GameHistory({ history }: GameHistoryProps) {
  if (history.length === 0) {
    return null;
  }

  // Group history by clue (each clue followed by its guesses)
  const groupedHistory: { clue: HistoryEntry; guesses: HistoryEntry[] }[] = [];
  let currentGroup: { clue: HistoryEntry; guesses: HistoryEntry[] } | null = null;

  for (const entry of history) {
    if (entry.type === 'clue') {
      if (currentGroup) {
        groupedHistory.push(currentGroup);
      }
      currentGroup = { clue: entry, guesses: [] };
    } else if (entry.type === 'guess' && currentGroup) {
      currentGroup.guesses.push(entry);
    }
  }
  if (currentGroup) {
    groupedHistory.push(currentGroup);
  }

  const getCardColorClass = (color: string | null) => {
    switch (color) {
      case 'red':
        return 'text-red-400';
      case 'blue':
        return 'text-blue-400';
      case 'neutral':
        return 'text-slate-300';
      case 'assassin':
        return 'text-gray-500';
      default:
        return 'text-purple-300';
    }
  };

  const getCardColorEmoji = (color: string | null) => {
    switch (color) {
      case 'red':
        return '🔴';
      case 'blue':
        return '🔵';
      case 'neutral':
        return '⚪';
      case 'assassin':
        return '💀';
      default:
        return '❓';
    }
  };

  return (
    <div className="poki-panel p-3">
      <h4 className="text-xs font-bold text-purple-300 mb-2">📜 Historique</h4>
      <div className="space-y-2 max-h-48 overflow-y-auto text-xs">
        {groupedHistory.map((group) => (
          <div key={group.clue.id} className="border-b border-purple-500/20 pb-2 last:border-b-0">
            {/* Clue */}
            <div className={`flex items-center gap-1 ${group.clue.team === 'red' ? 'text-red-400' : 'text-blue-400'}`}>
              <span>{group.clue.team === 'red' ? '🔴' : '🔵'}</span>
              <span className="font-bold">{group.clue.clue}</span>
              <span className="text-purple-400">({group.clue.number === 0 ? '∞' : group.clue.number})</span>
            </div>
            {/* Guesses */}
            {group.guesses.length > 0 && (
              <div className="ml-4 mt-1 flex flex-wrap gap-1">
                {group.guesses.map((guess) => (
                  <span
                    key={guess.id}
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${getCardColorClass(guess.cardColor)} bg-purple-500/10`}
                  >
                    <span className="text-[10px]">{getCardColorEmoji(guess.cardColor)}</span>
                    <span>{guess.cardWord}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
