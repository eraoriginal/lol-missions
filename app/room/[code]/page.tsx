'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRoom } from '@/app/hooks/useRoom';
import { RoomLobby } from '@/app/components/RoomLobby';
import { GameView as AramMissionsGameView } from '@/app/games/aram-missions/components/GameView';
import { GameView as CodenameGameView } from '@/app/games/codename/components/GameView';
import {
    GameView as BeatEikichiGameView,
    BeatEikichiLobby,
} from '@/app/games/beat-eikichi/components';
import { Toast } from '@/app/components/Toast';
import { ComingSoonGame } from '@/app/components/ComingSoonGame';
import {
    AC,
    AcAlert,
    AcButton,
    AcDisplay,
    AcGlyph,
    AcGraffitiLayer,
    AcModalCard,
    AcScreen,
    AcShim,
    AcSplat,
} from '@/app/components/arcane';

export default function RoomPage({
                                     params,
                                 }: {
    params: Promise<{ code: string }>;
}) {
    const { code } = use(params);
    const router = useRouter();
    const { room, loading, error, notification, refetch } = useRoom(code);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [playerName, setPlayerName] = useState('');
    const [joining, setJoining] = useState(false);
    const [joinError, setJoinError] = useState<string | null>(null);
    const [roomDeletedToast, setRoomDeletedToast] = useState(false);

    // Vérifie si l'utilisateur a déjà un token pour cette room
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const playerToken = localStorage.getItem(`room_${code}_player`);
        if (!playerToken) {
            setShowJoinModal(true);
        }
    }, [code]);

    // Si la room est supprimée, affiche un toast et redirige
    useEffect(() => {
        if (error && error.includes('not found')) {
            setRoomDeletedToast(true);
            setTimeout(() => {
                router.push('/');
            }, 3000);
        }
    }, [error, router]);

    const handleJoinRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        setJoining(true);
        setJoinError(null);

        try {
            const response = await fetch(`/api/rooms/${code}/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ playerName }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to join room');
            }

            const data = await response.json();
            localStorage.setItem(`room_${code}_player`, data.player.token);
            setShowJoinModal(false);
        } catch (err) {
            setJoinError(err instanceof Error ? err.message : 'An error occurred');
            setJoining(false);
        }
    };

    // Modale « Rejoindre la room »
    if (showJoinModal) {
        return (
            <AcScreen>
                <AcGraffitiLayer density="normal" />
                <div
                    style={{
                        position: 'absolute',
                        top: -40,
                        left: -60,
                        pointerEvents: 'none',
                    }}
                >
                    <AcSplat color={AC.violet} size={340} opacity={0.45} seed={2} />
                </div>
                <div
                    style={{
                        position: 'absolute',
                        bottom: -40,
                        right: -40,
                        pointerEvents: 'none',
                    }}
                >
                    <AcSplat color={AC.shimmer} size={300} opacity={0.4} seed={1} />
                </div>

                <div className="relative min-h-screen flex items-center justify-center p-6">
                    <AcModalCard width={580} tone={AC.chem} tapeLabel="// REJOINDRE">
                        <div className="text-center mb-1.5">
                            <AcDisplay style={{ fontSize: 'clamp(34px, 6vw, 54px)' }}>
                                REJOINDRE <AcShim color={AC.chem}>LA ROOM</AcShim>
                            </AcDisplay>
                        </div>
                        <div className="text-center mt-4 mb-7">
                            <span
                                style={{
                                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                                    fontSize: 11,
                                    letterSpacing: '0.22em',
                                    color: AC.bone2,
                                    textTransform: 'uppercase',
                                }}
                            >
                                {'// CODE  '}
                            </span>
                            <span className="inline-flex gap-1 align-middle">
                                {code.split('').map((c, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                                            fontSize: 26,
                                            color: AC.gold,
                                            fontWeight: 700,
                                            border: `1.5px dashed ${AC.bone2}`,
                                            padding: '2px 7px',
                                            background: 'rgba(245,185,18,0.05)',
                                        }}
                                    >
                                        {c}
                                    </span>
                                ))}
                            </span>
                        </div>

                        <form onSubmit={handleJoinRoom}>
                            <label className="block mb-5">
                                <div
                                    style={{
                                        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                                        fontSize: 10,
                                        letterSpacing: '0.22em',
                                        color: AC.chem,
                                        marginBottom: 8,
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    {"// TON PSEUDO D'INVOCATEUR"}
                                </div>
                                <input
                                    type="text"
                                    name="pseudo"
                                    className="ac-input"
                                    value={playerName}
                                    onChange={(e) => setPlayerName(e.target.value)}
                                    required
                                    maxLength={24}
                                    autoFocus
                                    autoComplete="nickname"
                                    placeholder="Entre ton pseudo"
                                    style={{
                                        width: '100%',
                                        padding: '14px 16px',
                                        background: 'rgba(240,228,193,0.04)',
                                        border: `1.5px solid ${AC.bone}`,
                                        outline: 'none',
                                        color: AC.bone,
                                        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                                        fontSize: 17,
                                    }}
                                />
                            </label>

                            {joinError && (
                                <div className="mb-4">
                                    <AcAlert tone="danger" tape="// ERR">
                                        <span style={{ color: AC.bone }}>
                                            {'// '}
                                            {joinError}
                                        </span>
                                    </AcAlert>
                                </div>
                            )}

                            <AcButton
                                type="submit"
                                variant="chem"
                                size="lg"
                                fullWidth
                                drip
                                disabled={joining || !playerName.trim()}
                                icon={<AcGlyph kind="arrowRight" color={AC.ink} size={16} />}
                            >
                                {joining ? 'CONNEXION…' : 'REJOINDRE LA PARTIE'}
                            </AcButton>
                        </form>

                        <div className="mt-7 text-center">
                            <Link
                                href="/"
                                style={{
                                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                                    fontSize: 11,
                                    letterSpacing: '0.2em',
                                    color: AC.bone2,
                                    textTransform: 'uppercase',
                                    borderBottom: `1px dashed ${AC.bone2}`,
                                    paddingBottom: 2,
                                    textDecoration: 'none',
                                }}
                            >
                                ← Retour à l&apos;accueil
                            </Link>
                        </div>
                    </AcModalCard>
                </div>
            </AcScreen>
        );
    }

    if (loading) {
        return (
            <AcScreen>
                <div
                    className="min-h-screen flex items-center justify-center"
                    style={{
                        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                        fontSize: 14,
                        color: AC.bone2,
                    }}
                >
                    {'// chargement de la room…'}
                </div>
            </AcScreen>
        );
    }

    if (error || !room) {
        return (
            <>
                {roomDeletedToast && (
                    <Toast
                        message="Cette room n'existe plus ou a été supprimée"
                        type="error"
                        onClose={() => setRoomDeletedToast(false)}
                        duration={3000}
                    />
                )}
                <AcScreen>
                    <div
                        style={{
                            position: 'absolute',
                            top: -40,
                            right: -40,
                            pointerEvents: 'none',
                        }}
                    >
                        <AcSplat color={AC.rust} size={320} opacity={0.35} seed={2} />
                    </div>
                    <div className="relative min-h-screen flex items-center justify-center p-6">
                        <AcModalCard width={520} tone={AC.rust} tapeLabel="// 404">
                            <div className="flex items-start gap-3.5 mb-4">
                                <div style={{ flexShrink: 0, marginTop: 2 }}>
                                    <AcGlyph kind="x" color={AC.rust} size={36} stroke={3.5} painted />
                                </div>
                                <div>
                                    <AcDisplay style={{ fontSize: 'clamp(26px, 3.5vw, 38px)' }}>
                                        ROOM <AcShim color={AC.rust}>INTROUVABLE</AcShim>
                                    </AcDisplay>
                                </div>
                            </div>
                            <div
                                style={{
                                    fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                                    fontSize: 15,
                                    lineHeight: 1.55,
                                    color: AC.bone2,
                                    marginBottom: 24,
                                    marginLeft: 48,
                                }}
                            >
                                {error === 'Room not found'
                                    ? "Cette room n'existe pas ou a été supprimée par le créateur."
                                    : error}
                            </div>
                            <div className="flex justify-end">
                                <Link href="/" style={{ textDecoration: 'none' }}>
                                    <AcButton
                                        variant="primary"
                                        drip
                                        icon={<AcGlyph kind="arrowLeft" color={AC.ink} size={13} />}
                                    >
                                        RETOUR À L&apos;ACCUEIL
                                    </AcButton>
                                </Link>
                            </div>
                        </AcModalCard>
                    </div>
                </AcScreen>
            </>
        );
    }

    // Determine background class based on game type (anciens jeux non-refaits)
    const bgClass = room.gameType === 'codename-ceo' ? 'poki-bg' : 'lol-bg';
    const isNewDesign = room.gameType === 'beat-eikichi';

    // Beat Eikichi utilise le design system Arcane (AcScreen gère le fond).
    // Les autres jeux gardent leur ancien fond `bgClass`.
    const content = (
        <>
            {room.gameType === 'aram-missions' ? (
                room.gameStarted ? (
                    <AramMissionsGameView room={room} roomCode={code} />
                ) : (
                    <RoomLobby room={room} roomCode={code} />
                )
            ) : room.gameType === 'codename-ceo' ? (
                <CodenameGameView room={room} roomCode={code} />
            ) : room.gameType === 'beat-eikichi' ? (
                room.gameStarted ? (
                    <BeatEikichiGameView room={room} roomCode={code} refetch={refetch} />
                ) : (
                    <BeatEikichiLobby room={room} roomCode={code} />
                )
            ) : (
                <ComingSoonGame
                    roomCode={code}
                    gameName={
                        room.gameType === 'coming-game' ? 'Coming Game' : 'À venir'
                    }
                />
            )}
        </>
    );

    return (
        <>
            {notification && (
                <Toast
                    message={notification.message}
                    type={notification.type}
                    onClose={() => {}}
                    duration={3000}
                />
            )}
            {isNewDesign ? (
                content
            ) : (
                <main className={`${bgClass} p-4`}>
                    <div className="max-w-6xl mx-auto py-8">{content}</div>
                </main>
            )}
        </>
    );
}
