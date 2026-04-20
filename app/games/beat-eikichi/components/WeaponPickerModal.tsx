'use client';

import { useEffect } from 'react';
import { WEAPONS } from '@/lib/beatEikichi/weapons';

interface WeaponPickerModalProps {
  open: boolean;
  onClose: () => void;
  onPick: (weaponId: string | null) => void;
  currentWeaponId: string | null;
}

/**
 * Modal plein écran (semi-transparent) pour choisir son arme. Affiche la grille
 * des 8 armes + option "Aucune arme". Se ferme au clic sur le fond, touche Escape,
 * ou sélection d'une arme.
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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 beat-eikichi-zoom-fade"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="arcane-card max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 beat-eikichi-scroll"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-purple-100">
            Choisis ton arme
          </h2>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 text-white/80 text-lg transition"
          >
            ×
          </button>
        </div>

        <p className="text-sm text-purple-300/70 mb-4">
          3 utilisations max, 1 par question. L&apos;effet reste actif sur la
          cible jusqu&apos;à la fin du timer de la question.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {WEAPONS.map((w) => {
            const isMine = w.id === currentWeaponId;
            return (
              <button
                key={w.id}
                onClick={() => onPick(w.id)}
                className={`text-left p-3 rounded-lg border transition ${
                  isMine
                    ? 'border-amber-400/80 bg-amber-900/25 shadow-md'
                    : 'border-purple-500/30 bg-purple-950/30 hover:border-purple-400/60 hover:bg-purple-900/40'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{w.icon}</span>
                  <span className="text-sm font-semibold text-purple-100">
                    {w.name}
                  </span>
                </div>
                <div className="text-xs text-purple-300/70 leading-snug">
                  {w.description}
                </div>
              </button>
            );
          })}
        </div>

        {currentWeaponId && (
          <button
            onClick={() => onPick(null)}
            className="mt-4 w-full py-2 rounded-lg bg-purple-900/40 border border-purple-500/30 text-purple-200 hover:bg-purple-900/60 transition text-sm"
          >
            Retirer ma sélection
          </button>
        )}
      </div>
    </div>
  );
}
