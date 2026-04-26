'use client';

import { useState } from 'react';
import type { Room } from '@/app/types/room';
import { LeaveRoomButton } from '@/app/components/LeaveRoomButton';
import { BackToLobbyButton } from './BackToLobbyButton';
import {
  AC,
  AcAlert,
  AcButton,
  AcCard,
  AcDisplay,
  AcGlyph,
  AcGraffitiLayer,
  AcScreen,
  AcShim,
  AcSplat,
  AcStamp,
} from '@/app/components/arcane';

interface Props {
  room: Room;
  roomCode: string;
  isCreator: boolean;
  creatorToken: string | null;
}

export function WaitingReviewView({ room, roomCode, isCreator, creatorToken }: Props) {
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartReview = async () => {
    if (!creatorToken) return;
    setStarting(true);
    setError(null);
    try {
      const res = await fetch(`/api/games/quiz-ceo/${roomCode}/review-start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ creatorToken }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? 'Échec du lancement de la correction');
      }
    } catch {
      setError('Erreur réseau');
    } finally {
      setStarting(false);
    }
  };

  const game = room.quizCeoGame!;
  const total = game.questions.length;

  return (
    <AcScreen>
      <div style={{ position: 'absolute', top: -40, left: -40, pointerEvents: 'none' }}>
        <AcSplat color={AC.gold} size={380} opacity={0.45} seed={1} />
      </div>
      <div style={{ position: 'absolute', bottom: 40, right: -40, pointerEvents: 'none' }}>
        <AcSplat color={AC.shimmer} size={340} opacity={0.45} seed={3} />
      </div>
      <AcGraffitiLayer />

      <div
        className="relative mx-auto px-4 sm:px-8 py-8 min-h-screen flex flex-col"
        style={{ maxWidth: 900 }}
      >
        <div className="flex items-center justify-between mb-8">
          <BackToLobbyButton roomCode={roomCode} />
          <LeaveRoomButton roomCode={roomCode} />
        </div>

        <div className="flex-1 flex items-center justify-center">
          <AcCard fold style={{ padding: 32, textAlign: 'center', maxWidth: 620 }}>
            <div
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 11,
                letterSpacing: '0.3em',
                color: AC.gold,
                marginBottom: 10,
              }}
            >
              {'// PHASE 02 · CORRECTION'}
            </div>
            <AcDisplay style={{ fontSize: 'clamp(30px, 5vw, 48px)' }}>
              TOUTES LES <AcShim color={AC.gold}>QUESTIONS POSÉES</AcShim>
            </AcDisplay>

            <div
              className="mt-4 mb-6"
              style={{
                fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                fontSize: 15,
                color: AC.bone2,
                lineHeight: 1.55,
              }}
            >
              Les {total} questions sont terminées. Le créateur va maintenant
              passer les réponses une par une et valider celles qui sont
              correctes.
            </div>

            {isCreator ? (
              <>
                <AcButton
                  variant="primary"
                  size="lg"
                  drip
                  fullWidth
                  onClick={handleStartReview}
                  disabled={starting}
                  icon={<AcGlyph kind="play" color={AC.ink} size={14} />}
                >
                  {starting ? 'LANCEMENT…' : 'LANCER LA CORRECTION'}
                </AcButton>
                {error && (
                  <div className="mt-4">
                    <AcAlert tone="danger" tape="// ERR">
                      <span style={{ color: AC.bone }}>
                        {'// '}
                        {error}
                      </span>
                    </AcAlert>
                  </div>
                )}
              </>
            ) : (
              <AcStamp
                color={AC.bone2}
                rotate={-2}
                style={{ fontSize: 12, padding: '12px 18px' }}
              >
                {'// EN ATTENTE DU CRÉATEUR…'}
              </AcStamp>
            )}
          </AcCard>
        </div>
      </div>
    </AcScreen>
  );
}
