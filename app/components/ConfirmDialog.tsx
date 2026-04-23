'use client';

import type { ReactNode } from 'react';
import {
  AC,
  AcButton,
  AcDisplay,
  AcGlyph,
  AcModalCard,
  AcModalDim,
  AcShim,
  type AcButtonVariant,
} from './arcane';

export type ConfirmColor = 'red' | 'blue' | 'green' | 'orange';

interface ConfirmDialogProps {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    /** Couleur du CTA principal. Mappé sur les tons Arcane : red=rust, blue=hex,
     * green=chem, orange=gold. */
    confirmColor?: ConfirmColor;
    /** Variante « destructive forte » — rend le titre en shimmer + stamp
     * « // ACTION IRRÉVERSIBLE » + alerte en ruban. Utilisé pour le créateur
     * qui quitte (supprime la room) ou le retour-lobby en cours de partie. */
    destructive?: boolean;
    /** Zone optionnelle entre le message et les boutons — ex : mini-liste d'avatars
     * impactés, stats de partie, etc. */
    extra?: ReactNode;
    /** Étiquette scotchée en haut de la modale (ex : `// CONFIRMATION`). */
    tapeLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

/**
 * Boîte de dialogue de confirmation dans le langage Arcane.kit.
 *
 * Gère 2 niveaux de gravité :
 *   - standard : message simple + CTA de couleur (rust/gold/chem/hex)
 *   - destructive : titre shimmer + stamp « action irréversible » + ruban danger
 *
 * Peut recevoir un contenu `extra` entre le message et les boutons pour afficher
 * un aperçu de ce qui va être détruit (ex : liste des joueurs expulsés).
 */
export function ConfirmDialog({
                                  title,
                                  message,
                                  confirmText = 'Confirmer',
                                  cancelText = 'Annuler',
                                  confirmColor = 'red',
                                  destructive = false,
                                  extra,
                                  tapeLabel = '// CONFIRMATION',
                                  onConfirm,
                                  onCancel,
                              }: ConfirmDialogProps) {
    // Map couleur → token + variant AcButton.
    const colorMap: Record<ConfirmColor, { tone: string; variant: AcButtonVariant }> = {
        red: { tone: AC.rust, variant: 'danger' },
        blue: { tone: AC.hex, variant: 'hex' },
        green: { tone: AC.chem, variant: 'chem' },
        orange: { tone: AC.gold, variant: 'gold' },
    };
    const { tone, variant } = colorMap[confirmColor];

    return (
        <AcModalDim intensity={0.78} onClick={onCancel}>
            <AcModalCard
                width={520}
                tone={destructive ? AC.shimmer : tone}
                tapeLabel={tapeLabel}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
                    <div style={{ flexShrink: 0, marginTop: 2 }}>
                        <AcGlyph
                            kind={destructive ? 'x' : 'arrowLeft'}
                            color={destructive ? AC.shimmer : tone}
                            size={destructive ? 40 : 34}
                            stroke={3.5}
                            painted
                        />
                    </div>
                    <div>
                        <AcDisplay style={{ fontSize: 'clamp(24px, 3.5vw, 34px)' }}>
                            <TitleWithShim title={title} tone={destructive ? AC.shimmer : tone} />
                        </AcDisplay>
                    </div>
                </div>

                <div
                    style={{
                        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
                        fontSize: 15,
                        lineHeight: 1.55,
                        color: AC.bone2,
                        marginBottom: 26,
                        marginLeft: 48,
                    }}
                >
                    {message}
                </div>

                {extra && <div style={{ marginBottom: 22 }}>{extra}</div>}

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <AcButton variant="ghost" onClick={onCancel}>
                        {cancelText.toUpperCase()}
                    </AcButton>
                    <AcButton
                        variant={destructive ? 'danger' : variant}
                        drip
                        onClick={onConfirm}
                        icon={<AcGlyph kind={destructive ? 'x' : 'arrowLeft'} color={destructive ? AC.bone : AC.ink} size={13} />}
                    >
                        {confirmText.toUpperCase()}
                    </AcButton>
                </div>
            </AcModalCard>
        </AcModalDim>
    );
}

/** Met le dernier mot du titre en shimmer. Heuristique simple qui marche pour
 *  les titres courts type « QUITTER LA ROOM ? » ou « TU ES LE CRÉATEUR ». */
function TitleWithShim({ title, tone }: { title: string; tone: string }) {
    const words = title.trim().split(' ');
    if (words.length < 2) return <>{title.toUpperCase()}</>;
    const head = words.slice(0, -1).join(' ');
    const tail = words[words.length - 1];
    return (
        <>
            {head.toUpperCase()} <AcShim color={tone}>{tail.toUpperCase()}</AcShim>
        </>
    );
}
