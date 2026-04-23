'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AC,
  AcAlert,
  AcButton,
  AcGlyph,
  AcSectionNum,
} from './arcane';

export function JoinRoomForm() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const roomCode = code.toUpperCase().trim();

      const response = await fetch(`/api/rooms/${roomCode}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join room');
      }

      const data = await response.json();

      localStorage.setItem(`room_${roomCode}_player`, data.player.token);

      router.push(`/room/${roomCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex items-baseline gap-3">
        <AcSectionNum n={2} />
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
          REJOINDRE
        </h2>
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 12,
          color: AC.bone2,
        }}
      >
        {"// entre le code partagé par l'hôte"}
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
          &gt; CODE DE LA ROOM
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '10px 12px',
            border: `1.5px dashed ${AC.bone2}`,
            background: 'rgba(18,214,168,0.04)',
          }}
        >
          <input
            type="text"
            className="ac-input"
            value={code}
            onChange={(e) =>
              setCode(
                e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6),
              )
            }
            required
            maxLength={6}
            placeholder="7XK3PQ"
            aria-label="Code de la room"
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: AC.chem,
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontWeight: 700,
              fontSize: 26,
              letterSpacing: '0.25em',
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          />
        </div>
      </label>

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
            color: AC.bone,
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 16,
            padding: '6px 2px',
            outline: 'none',
          }}
        />
      </label>

      {error && (
        <AcAlert tone="danger" tape="// ERR">
          <span style={{ color: AC.bone }}>{'// '}{error}</span>
        </AcAlert>
      )}

      <AcButton
        type="submit"
        variant="hex"
        size="lg"
        fullWidth
        disabled={loading || !name.trim() || code.trim().length < 4}
        icon={<AcGlyph kind="arrowRight" color={AC.ink} size={14} />}
      >
        {loading ? 'CONNEXION…' : 'REJOINDRE LA ROOM'}
      </AcButton>
    </form>
  );
}
