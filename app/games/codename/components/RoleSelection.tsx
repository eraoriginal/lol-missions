'use client';

import { useState } from 'react';
import { CategorySelector } from './CategorySelector';

interface Player {
  id: string;
  name: string;
  avatar: string;
  team: string;
  role: string | null;
  token: string;
}

interface RoleSelectionProps {
  roomCode: string;
  players: Player[];
  currentPlayerToken: string;
  isCreator: boolean;
  onGenerateBoard?: () => void;
  generating?: boolean;
  selectedCategories?: string[];
}

export function RoleSelection({
  roomCode,
  players,
  currentPlayerToken,
  isCreator,
  onGenerateBoard,
  generating,
  selectedCategories = [],
}: RoleSelectionProps) {
  const [selecting, setSelecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentPlayer = players.find((p) => p.token === currentPlayerToken);
  const redPlayers = players.filter((p) => p.team === 'red');
  const bluePlayers = players.filter((p) => p.team === 'blue');

  const redSpymaster = redPlayers.find((p) => p.role === 'spymaster');
  const blueSpymaster = bluePlayers.find((p) => p.role === 'spymaster');

  const bothSpymastersSelected = !!redSpymaster && !!blueSpymaster;

  const handleBecomeSpymaster = async () => {
    if (!currentPlayerToken || !currentPlayer?.team) return;
    setSelecting(true);
    setError(null);

    try {
      const res = await fetch(`/api/games/codename/${roomCode}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerToken: currentPlayerToken, role: 'spymaster' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSelecting(false);
    }
  };

  const handleBecomeOperative = async () => {
    if (!currentPlayerToken || !currentPlayer?.team) return;
    setSelecting(true);
    setError(null);

    try {
      const res = await fetch(`/api/games/codename/${roomCode}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerToken: currentPlayerToken, role: 'operative' }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Erreur');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur');
    } finally {
      setSelecting(false);
    }
  };

  const TeamColumn = ({
    team,
    teamPlayers,
    spymaster,
    colorClass,
    bgClass,
    borderClass,
  }: {
    team: string;
    teamPlayers: Player[];
    spymaster: Player | undefined;
    colorClass: string;
    bgClass: string;
    borderClass: string;
  }) => {
    const isPlayerOnTeam = currentPlayer?.team === team;
    const isPlayerSpymaster = currentPlayer?.role === 'spymaster' && currentPlayer?.team === team;
    const canBecomeSpymaster = isPlayerOnTeam && !isPlayerSpymaster;

    return (
      <div className={`flex-1 poki-panel p-4 ${borderClass}`}>
        <h3 className={`text-xl font-bold text-center mb-4 poki-text ${colorClass}`}>
          {team === 'red' ? '🔴 Équipe Rouge' : '🔵 Équipe Bleue'}
        </h3>

        {/* Spymaster section */}
        <div className={`${bgClass} rounded-xl p-4 mb-4 border ${borderClass}`}>
          <div className="text-sm text-purple-300/70 uppercase tracking-wide mb-3 flex items-center gap-2">
            <span className="text-xl">🔮</span>
            <span className="font-bold">Maître-Espion</span>
          </div>

          {spymaster ? (
            <div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-purple-500/30">

                <img
                  src={spymaster.avatar}
                  alt={spymaster.name}
                  className="w-10 h-10 rounded-lg border-2 border-pink-500"
                />
                <div className="flex-1">
                  <span className="text-pink-400 font-bold">{spymaster.name}</span>
                  {spymaster.token === currentPlayerToken && (
                    <span className="ml-2 text-xs bg-pink-500 text-white px-2 py-0.5 rounded-full">
                      Vous
                    </span>
                  )}
                </div>
                <span className="text-green-400 text-xl">✓</span>
              </div>
              {spymaster.token === currentPlayerToken && (
                <button
                  onClick={handleBecomeOperative}
                  disabled={selecting}
                  className="w-full mt-2 py-2 rounded-lg font-medium text-sm transition-all bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 disabled:opacity-50"
                >
                  {selecting ? '⏳...' : '🎯 Redevenir Agent'}
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-3">
              <div className="py-3 border border-dashed border-purple-500/30 rounded-lg">
                <p className="text-purple-400/50 italic text-sm">En attente...</p>
              </div>
            </div>
          )}

          {/* Button to become/replace spymaster */}
          {canBecomeSpymaster && (
            <button
              onClick={handleBecomeSpymaster}
              disabled={selecting}
              className={`w-full mt-3 py-2 rounded-lg font-bold text-sm transition-all ${
                team === 'red'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white shadow-lg shadow-red-500/30'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white shadow-lg shadow-blue-500/30'
              } disabled:opacity-50`}
            >
              {selecting ? '⏳...' : spymaster ? '🔄 Prendre la place' : '🔮 Devenir Maître-Espion'}
            </button>
          )}
        </div>

        {/* Team members */}
        <div>
          <div className="text-sm text-purple-300/70 uppercase tracking-wide mb-2 flex items-center gap-2">
            <span className="text-lg">🎯</span>
            <span>Agents ({teamPlayers.filter((p) => p.role !== 'spymaster').length})</span>
          </div>
          <div className="space-y-1.5">
            {teamPlayers
              .filter((p) => p.role !== 'spymaster')
              .map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-2 p-2 rounded-lg bg-black/20 border border-purple-500/20"
                >
  
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-7 h-7 rounded-lg"
                  />
                  <span className="text-purple-200/80 text-sm">{player.name}</span>
                  {player.token === currentPlayerToken && (
                    <span className="text-xs bg-pink-500 text-white px-1.5 py-0.5 rounded-full">
                      Vous
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="text-center poki-panel p-4">
        <h2 className="text-xl font-bold poki-title mb-2">
          🎭 Sélection des Maîtres-Espions
        </h2>
        <p className="text-purple-300/70 text-sm">
          Un joueur de chaque équipe doit se désigner comme Maître-Espion.
        </p>
      </div>

      {error && (
        <div className="text-center text-red-400 text-sm p-3 bg-red-500/20 rounded-lg border border-red-500/50">
          {error}
        </div>
      )}

      {/* Team columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TeamColumn
          team="red"
          teamPlayers={redPlayers}
          spymaster={redSpymaster}
          colorClass="text-red-400"
          bgClass="bg-red-500/10"
          borderClass="border-red-500/30"
        />
        <TeamColumn
          team="blue"
          teamPlayers={bluePlayers}
          spymaster={blueSpymaster}
          colorClass="text-blue-400"
          bgClass="bg-blue-500/10"
          borderClass="border-blue-500/30"
        />
      </div>

      {/* Category selector */}
      <CategorySelector
        roomCode={roomCode}
        isCreator={isCreator}
        selectedCategories={selectedCategories}
      />

      {/* Status / Generate board button */}
      <div className="poki-panel p-4 text-center">
        {bothSpymastersSelected ? (
          <>
            <div className="text-3xl mb-2">✅</div>
            <p className="text-pink-400 font-semibold mb-4 poki-text">
              Les deux Maîtres-Espions sont prêts !
            </p>
            {isCreator ? (
              <button
                onClick={onGenerateBoard}
                disabled={generating}
                className="poki-btn-primary px-6 py-3 font-bold text-lg"
              >
                {generating ? '⏳ Génération...' : '🃏 GÉNÉRER LE PLATEAU'}
              </button>
            ) : (
              <p className="text-purple-300/60 text-sm italic">
                En attente que le créateur génère le plateau...
              </p>
            )}
          </>
        ) : (
          <>
            <div className="text-3xl mb-2">⏳</div>
            <p className="text-purple-300/70">En attente des Maîtres-Espions...</p>
            <div className="flex justify-center gap-6 mt-3">
              <div className="flex items-center gap-2">
                <span className={redSpymaster ? 'text-green-400' : 'text-purple-500/50'}>
                  {redSpymaster ? '✓' : '○'}
                </span>
                <span className={redSpymaster ? 'text-red-400' : 'text-purple-500/50'}>
                  Rouge
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={blueSpymaster ? 'text-green-400' : 'text-purple-500/50'}>
                  {blueSpymaster ? '✓' : '○'}
                </span>
                <span className={blueSpymaster ? 'text-blue-400' : 'text-purple-500/50'}>
                  Bleu
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
