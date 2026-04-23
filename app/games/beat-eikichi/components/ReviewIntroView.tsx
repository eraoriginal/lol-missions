'use client';

import { useState } from 'react';
import { LeaveRoomButton } from '@/app/components/LeaveRoomButton';
import { BackToLobbyButton } from './BackToLobbyButton';
import {
  AC,
  AcAlert,
  AcButton,
  AcDisplay,
  AcDrip,
  AcEmote,
  AcGlyph,
  AcGraffitiLayer,
  AcScreen,
  AcShim,
  AcSplat,
} from '@/app/components/arcane';

interface ReviewIntroViewProps {
  roomCode: string;
  isCreator: boolean;
  creatorToken: string | null;
}

export function ReviewIntroView({
  roomCode,
  isCreator,
  creatorToken,
}: ReviewIntroViewProps) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    if (!creatorToken) return;
    setStarting(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/games/beat-eikichi/${roomCode}/review-start`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ creatorToken }),
        },
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? 'Erreur');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setStarting(false);
    }
  };

  return (
    <AcScreen>
      <div
        className="ac-pulse-soft"
        style={{
          position: 'absolute',
          top: '10%',
          left: '8%',
          pointerEvents: 'none',
        }}
      >
        <AcSplat color={AC.violet} size={520} opacity={0.55} seed={2} />
      </div>
      <div
        className="ac-pulse-soft"
        style={{
          position: 'absolute',
          bottom: '8%',
          right: '10%',
          pointerEvents: 'none',
          animationDelay: '0.8s',
        }}
      >
        <AcSplat color={AC.shimmer} size={420} opacity={0.5} seed={3} />
      </div>
      <AcGraffitiLayer density="heavy" />

      {/* Émoticônes flottantes pour le fun */}
      <div style={{ position: 'absolute', top: '20%', right: '15%' }}>
        <AcEmote face=":-D" color={AC.shimmer} size={60} style={{ transform: 'rotate(-8deg)' }} />
      </div>
      <div style={{ position: 'absolute', bottom: '22%', left: '12%' }}>
        <AcEmote face=";-)" color={AC.chem} size={44} style={{ transform: 'rotate(6deg)' }} />
      </div>
      <div style={{ position: 'absolute', top: '60%', right: '22%' }}>
        <AcEmote face=">:(" color={AC.gold} size={52} style={{ transform: 'rotate(-4deg)' }} />
      </div>

      <div className="relative min-h-screen flex flex-col">
        <div className="flex justify-end items-center gap-2 px-6 pt-5">
          <BackToLobbyButton roomCode={roomCode} />
          <LeaveRoomButton roomCode={roomCode} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 11,
              letterSpacing: '0.3em',
              color: AC.chem,
              marginBottom: 18,
            }}
          >
            {'// PHASE 03 · REVIEW'}
          </div>
          <div className="relative inline-block">
            <AcDisplay
              style={{
                fontSize: 'clamp(48px, 9vw, 108px)',
                textAlign: 'center',
                lineHeight: 0.9,
              }}
            >
              {isCreator ? (
                <>
                  REGARDONS
                  <br />
                  <AcShim>VOS RÉPONSES</AcShim>
                </>
              ) : (
                <>
                  EN <AcShim>ATTENTE</AcShim>
                </>
              )}
            </AcDisplay>
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: -32,
                height: 32,
              }}
            >
              <AcDrip color={AC.shimmer} seed={1} />
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center gap-5 max-w-xl">
            {isCreator ? (
              <>
                <p
                  style={{
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    fontSize: 13,
                    color: AC.bone2,
                    letterSpacing: '0.05em',
                  }}
                >
                  {'// les 20 questions sont bouclées. lance le récap quand tout le monde est prêt.'}
                </p>
                <AcButton
                  variant="primary"
                  size="lg"
                  drip
                  onClick={handleStart}
                  disabled={starting}
                  icon={<AcGlyph kind="play" color={AC.ink} size={14} />}
                >
                  {starting ? 'DÉMARRAGE…' : 'COMMENCER LE RÉCAP'}
                </AcButton>
                {error && (
                  <AcAlert tone="danger" tape="// ERR">
                    <span style={{ color: AC.bone }}>
                      {'// '}
                      {error}
                    </span>
                  </AcAlert>
                )}
              </>
            ) : (
              <p
                style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: 13,
                  color: AC.bone2,
                  letterSpacing: '0.05em',
                }}
              >
                {'// le créateur va bientôt lancer le récapitulatif…'}
              </p>
            )}
          </div>
        </div>
      </div>
    </AcScreen>
  );
}
