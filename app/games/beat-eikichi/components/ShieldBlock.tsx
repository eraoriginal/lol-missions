'use client';

import { SHIELD_ICON, SHIELD_NAME } from '@/lib/beatEikichi/weapons';

interface ShieldBlockProps {
  usesLeft: number;
  /** Vrai si un bouclier est déjà armé pour la prochaine question. */
  armed: boolean;
  onFire: () => void;
}

/**
 * Bloc bouclier disponible pour tous les joueurs en plus de leur arme.
 * Active le bouclier pour la PROCHAINE question → toute attaque reçue y est annulée.
 * Quand `armed === true`, le bouton passe en état "Armé ✓" (désactivé) pour confirmer
 * visuellement au joueur que son clic a bien pris effet et éviter de gaspiller des charges.
 */
export function ShieldBlock({ usesLeft, armed, onFire }: ShieldBlockProps) {
  const noUses = usesLeft <= 0;
  const canFire = !noUses && !armed;

  let label: string;
  let buttonClass: string;
  let title: string;

  if (noUses) {
    label = 'Plus de boucliers disponibles.';
    buttonClass =
      'from-purple-900/50 to-purple-900/50 text-purple-400/50 cursor-not-allowed';
    title = label;
  } else if (armed) {
    label = 'Armé ✓';
    buttonClass =
      'from-emerald-600 to-teal-500 text-white cursor-default beat-eikichi-shield-armed';
    title = 'Bouclier armé pour la prochaine question';
  } else {
    label = 'Activer';
    buttonClass =
      'from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white';
    title = 'Activer le bouclier pour la prochaine question';
  }

  return (
    <div
      className={`arcane-card p-4 space-y-3 transition ${
        armed ? 'border-emerald-500/70 bg-emerald-900/10' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-3xl">{SHIELD_ICON}</span>
        <div>
          <div className="text-sm font-semibold text-purple-100">
            {SHIELD_NAME}
          </div>
          <div className="text-xs text-purple-300/70">
            {usesLeft}/3 bouclier{usesLeft > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="text-xs text-purple-300/60 leading-snug">
        Annule toute attaque reçue à la prochaine question.
      </div>

      <button
        onClick={onFire}
        disabled={!canFire}
        className={`w-full py-2 rounded-lg bg-gradient-to-r font-semibold text-sm transition ${buttonClass}`}
        title={title}
      >
        {label}
      </button>
    </div>
  );
}
