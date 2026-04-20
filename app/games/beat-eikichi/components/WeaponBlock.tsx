'use client';

import { getWeapon } from '@/lib/beatEikichi/weapons';

interface WeaponBlockProps {
  weaponId: string | null;
  usesLeft: number;
  targeting: boolean;
  onStartTargeting: () => void;
  onCancelTargeting: () => void;
}

/**
 * Bloc à gauche de l'image qui affiche l'arme du joueur, ses utilisations restantes
 * et un bouton pour tirer. Les attaques programment un effet pour la PROCHAINE question
 * (plus de cooldown intra-question). Le bouclier est géré séparément dans ShieldBlock.
 */
export function WeaponBlock({
  weaponId,
  usesLeft,
  targeting,
  onStartTargeting,
  onCancelTargeting,
}: WeaponBlockProps) {
  if (!weaponId) {
    return (
      <div className="arcane-card p-4 text-center text-sm text-purple-300/50 italic">
        Pas d&apos;arme choisie pour cette partie.
      </div>
    );
  }

  const weapon = getWeapon(weaponId);
  if (!weapon) {
    return null;
  }

  const canFire = usesLeft > 0;
  const disabledReason = usesLeft <= 0 ? "Plus d'utilisations." : null;

  return (
    <div
      className={`arcane-card p-4 space-y-3 ${
        targeting ? 'border-rose-500/70 bg-rose-900/10' : ''
      }`}
    >
      <div className="flex items-center gap-2">
        <span className="text-3xl">{weapon.icon}</span>
        <div>
          <div className="text-sm font-semibold text-purple-100">
            {weapon.name}
          </div>
          <div className="text-xs text-purple-300/70">
            {usesLeft}/3 utilisation{usesLeft > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="text-xs text-purple-300/60 leading-snug">
        {weapon.description}
      </div>

      {targeting ? (
        <div className="space-y-2">
          <div className="px-3 py-2 rounded bg-rose-900/40 border border-rose-500/60 text-center text-xs font-semibold text-rose-100">
            Choisis une cible →
          </div>
          <button
            onClick={onCancelTargeting}
            className="w-full py-2 rounded-lg bg-purple-900/40 border border-purple-500/40 text-purple-100 hover:bg-purple-900/60 transition text-sm"
          >
            Annuler
          </button>
        </div>
      ) : (
        <button
          onClick={onStartTargeting}
          disabled={!canFire}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-rose-600 to-orange-500 hover:from-rose-500 hover:to-orange-400 text-white font-semibold text-sm transition disabled:from-purple-900/50 disabled:to-purple-900/50 disabled:text-purple-400/50 disabled:cursor-not-allowed"
          title={disabledReason ?? "Utiliser l'arme (effet à la prochaine question)"}
        >
          {disabledReason ?? 'Utiliser'}
        </button>
      )}
    </div>
  );
}
