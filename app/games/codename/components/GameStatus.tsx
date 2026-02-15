'use client';

interface GameStatusProps {
  currentTeam: string;
  redRemaining: number;
  blueRemaining: number;
  currentClue: string | null;
  currentNumber: number | null;
  guessesLeft: number;
  gameOver: boolean;
  winner: string | null;
}

export function GameStatus({
  currentTeam,
  redRemaining,
  blueRemaining,
  currentClue,
  currentNumber,
  guessesLeft,
  gameOver,
  winner,
}: GameStatusProps) {
  if (gameOver) {
    return (
      <div className="poki-panel p-6 text-center poki-glow">
        <div className="text-6xl mb-4">🏆</div>
        <h2 className="text-3xl font-bold mb-2 poki-text">
          <span className={winner === 'red' ? 'text-red-400' : 'text-blue-400'}>
            {winner === 'red' ? 'Équipe Rouge' : 'Équipe Bleue'}
          </span>{' '}
          remporte la victoire !
        </h2>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main status bar */}
      <div className="poki-panel p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Score */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-red-500/20 px-3 py-2 rounded-lg border border-red-500/50">
              <div className="w-4 h-4 rounded-full bg-red-500"></div>
              <span className="text-2xl font-bold text-red-400">{redRemaining}</span>
            </div>
            <span className="text-purple-400 text-2xl font-bold">VS</span>
            <div className="flex items-center gap-2 bg-blue-500/20 px-3 py-2 rounded-lg border border-blue-500/50">
              <span className="text-2xl font-bold text-blue-400">{blueRemaining}</span>
              <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            </div>
          </div>

          {/* Current turn indicator */}
          <div
            className={`px-4 py-2 rounded-lg border ${
              currentTeam === 'red'
                ? 'bg-red-500/20 border-red-500/50'
                : 'bg-blue-500/20 border-blue-500/50'
            }`}
          >
            <div className="text-xs text-purple-300/70 uppercase tracking-wider">Tour</div>
            <div
              className={`text-lg font-bold ${
                currentTeam === 'red' ? 'text-red-400' : 'text-blue-400'
              }`}
            >
              {currentTeam === 'red' ? '🔴 Rouge' : '🔵 Bleu'}
            </div>
          </div>
        </div>
      </div>

      {/* Clue display - PROMINENT */}
      <div
        className={`poki-panel p-4 ${
          currentClue
            ? currentTeam === 'red'
              ? 'border-red-500/50 shadow-lg shadow-red-500/20'
              : 'border-blue-500/50 shadow-lg shadow-blue-500/20'
            : ''
        }`}
      >
        {currentClue ? (
          <div className="text-center">
            <div className="text-xs text-purple-300/70 uppercase tracking-wider mb-2">
              Indice actuel
            </div>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <div
                className={`text-4xl md:text-5xl font-bold ${
                  currentTeam === 'red' ? 'text-red-400' : 'text-blue-400'
                }`}
                style={{ textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}
              >
                &quot;{currentClue}&quot;
              </div>
              <div
                className={`text-4xl md:text-5xl font-bold px-4 py-2 rounded-xl ${
                  currentTeam === 'red'
                    ? 'bg-red-500/30 text-red-300 border-2 border-red-500/50'
                    : 'bg-blue-500/30 text-blue-300 border-2 border-blue-500/50'
                }`}
              >
                {currentNumber === 0 ? '∞' : currentNumber}
              </div>
            </div>
            <div className="mt-3 text-lg text-purple-200/80">
              <span className="font-bold text-pink-400">{guessesLeft === 999 ? '∞' : guessesLeft}</span>{' '}
              essai{guessesLeft !== 1 ? 's' : ''} restant{guessesLeft !== 1 ? 's' : ''}
            </div>
          </div>
        ) : (
          <div className="text-center py-2">
            <div className="text-purple-300/70 text-lg">
              ⏳ En attente de l&apos;indice du{' '}
              <span className={currentTeam === 'red' ? 'text-red-400' : 'text-blue-400'}>
                Maître-Espion {currentTeam === 'red' ? 'Rouge' : 'Bleu'}
              </span>
              ...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
