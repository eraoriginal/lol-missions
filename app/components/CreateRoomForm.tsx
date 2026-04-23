'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameSelector } from './GameSelector';
import {
  AC,
  AcAlert,
  AcButton,
  AcGlyph,
  AcSectionNum,
} from './arcane';

export function CreateRoomForm() {
  const [name, setName] = useState('');
  const [selectedGame, setSelectedGame] = useState('beat-eikichi');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creatorName: name,
          gameType: selectedGame,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      const data = await response.json();

      localStorage.setItem(
        `room_${data.room.code}_creator`,
        data.creatorToken,
      );
      localStorage.setItem(
        `room_${data.room.code}_player`,
        data.playerToken,
      );

      router.push(`/room/${data.room.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-baseline gap-3">
        <AcSectionNum n={1} />
        <h2
          className="m-0"
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(22px, 3vw, 30px)',
            letterSpacing: '-0.01em',
            textTransform: 'uppercase',
            color: AC.bone,
            filter: 'url(#ac-paint-text)',
          }}
        >
          CRÉER UNE ROOM
        </h2>
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 12,
          color: AC.bone2,
        }}
      >
        {'// tu deviens créateur — tu règles et tu lances'}
      </div>

      <label className="block">
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 10,
            letterSpacing: '0.25em',
            color: AC.chem,
            marginBottom: 6,
            textTransform: 'uppercase',
          }}
        >
          &gt; TON NOM
        </div>
        <input
          type="text"
          name="pseudo"
          className="ac-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={50}
          autoComplete="nickname"
          placeholder="Entre ton pseudo"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${AC.bone}`,
            color: AC.shimmer,
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 16,
            padding: '6px 2px',
            outline: 'none',
          }}
        />
      </label>

      <div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 10,
            letterSpacing: '0.25em',
            color: AC.chem,
            marginBottom: 10,
            textTransform: 'uppercase',
          }}
        >
          &gt; CHOISIS TON JEU
        </div>
        <GameSelector selectedGame={selectedGame} onSelectGame={setSelectedGame} />
      </div>

      {error && (
        <AcAlert tone="danger" tape="// ERR">
          <span style={{ color: AC.bone }}>{'// '}{error}</span>
        </AcAlert>
      )}

      <AcButton
        type="submit"
        variant="primary"
        size="lg"
        drip
        fullWidth
        disabled={loading || !name.trim()}
        icon={<AcGlyph kind="play" color={AC.ink} size={14} />}
      >
        {loading ? 'CRÉATION…' : 'CRÉER LA ROOM'}
      </AcButton>
    </form>
  );
}
