'use client';

import { useEffect } from 'react';
import { WEAPONS } from '@/lib/beatEikichi/weapons';
import {
  AC,
  AC_CLIP,
  AcButton,
  AcCard,
  AcDisplay,
  AcGlyph,
  AcShim,
  AcStamp,
} from '@/app/components/arcane';
import { getWeaponVisual } from '../weaponVisuals';

interface WeaponPickerModalProps {
  open: boolean;
  onClose: () => void;
  onPick: (weaponId: string | null) => void;
  currentWeaponId: string | null;
}

/**
 * Modale plein écran (fond semi-transparent) pour choisir son arme. Ferme au
 * clic sur le fond, touche Escape, ou sélection d'une arme. Logique inchangée
 * — seul le visuel passe au design system Arcane.kit.
 */
export function WeaponPickerModal({
  open,
  onClose,
  onPick,
  currentWeaponId,
}: WeaponPickerModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(13,11,8,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="ac-scroll w-full max-h-[90vh] overflow-y-auto"
        style={{ maxWidth: 820 }}
        onClick={(e) => e.stopPropagation()}
      >
        <AcCard fold style={{ padding: 24 }}>
          <div className="flex justify-between items-start mb-4">
            <div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: 10,
                  letterSpacing: '0.3em',
                  color: AC.chem,
                }}
              >
                {'// ARMORY · '}
                {WEAPONS.length}
                {' armes disponibles'}
              </div>
              <AcDisplay size={36} style={{ marginTop: 8 }}>
                CHOISIS <AcShim>TON ARME</AcShim>
              </AcDisplay>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              style={{
                background: 'transparent',
                border: `1.5px solid ${AC.bone2}`,
                padding: 8,
                cursor: 'pointer',
              }}
            >
              <AcGlyph kind="x" color={AC.bone} size={16} />
            </button>
          </div>

          <div
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 12,
              color: AC.bone2,
              marginBottom: 18,
              lineHeight: 1.55,
            }}
          >
            {"// 3 utilisations max, 1 par question. L'effet reste actif sur la cible jusqu'à la fin du timer de la question."}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {WEAPONS.map((w) => {
              const visual = getWeaponVisual(w.id);
              const selected = w.id === currentWeaponId;
              return (
                // Wrapper non-clippé pour que le tampon « ÉQUIPÉ » puisse
                // dépasser hors du bouton clippé sans être coupé.
                <div key={w.id} className="relative" style={{ overflow: 'visible' }}>
                  <button
                    type="button"
                    onClick={() => onPick(w.id)}
                    className="w-full text-left"
                    style={{
                      padding: 14,
                      cursor: 'pointer',
                      background: selected
                        ? 'rgba(255,61,139,0.15)'
                        : 'rgba(240,228,193,0.03)',
                      border: selected
                        ? `2px solid ${AC.shimmer}`
                        : `1.5px dashed ${AC.bone2}`,
                      clipPath: AC_CLIP,
                      color: AC.bone,
                    }}
                  >
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <AcGlyph
                        kind={visual.glyph}
                        color={visual.color}
                        size={26}
                        stroke={2.5}
                      />
                      <div
                        style={{
                          fontFamily:
                            "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                          fontWeight: 700,
                          fontSize: 13,
                          letterSpacing: '0.02em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {w.name}
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                        fontSize: 10,
                        color: AC.bone2,
                        lineHeight: 1.5,
                      }}
                    >
                      {w.description}
                    </div>
                  </button>
                  {selected && (
                    <div
                      className="absolute pointer-events-none"
                      style={{ top: -10, right: -2, zIndex: 2 }}
                    >
                      <AcStamp color={AC.shimmer} bg={AC.ink} rotate={-4}>
                        ✓ ÉQUIPÉ
                      </AcStamp>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <span
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 10,
                color: AC.bone2,
              }}
            >
              {"// change d'avis jusqu'au lancement"}
            </span>
            {currentWeaponId && (
              <AcButton
                variant="ghost"
                size="sm"
                onClick={() => onPick(null)}
                icon={<AcGlyph kind="x" color={AC.bone} size={12} />}
              >
                RETIRER MA SÉLECTION
              </AcButton>
            )}
          </div>
        </AcCard>
      </div>
    </div>
  );
}
