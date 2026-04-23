'use client';

import { getWeapon } from '@/lib/beatEikichi/weapons';
import {
  AC,
  AC_CLIP,
  AcButton,
  AcGlyph,
} from '@/app/components/arcane';
import { getWeaponVisual } from '../weaponVisuals';

interface WeaponBlockProps {
  weaponId: string | null;
  usesLeft: number;
  targeting: boolean;
  onStartTargeting: () => void;
  onCancelTargeting: () => void;
}

/**
 * Bloc à gauche de l'image qui affiche l'arme du joueur, ses utilisations
 * restantes et un bouton pour tirer. Les attaques programment un effet pour la
 * PROCHAINE question. Skin Arcane.kit : carré shimmer + icône glyph + CTA.
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
      <div
        style={{
          padding: 12,
          border: `1.5px dashed ${AC.bone2}`,
          textAlign: 'center',
          color: AC.bone2,
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 11,
          fontStyle: 'italic',
        }}
      >
        {"// pas d'arme choisie"}
      </div>
    );
  }
  const weapon = getWeapon(weaponId);
  if (!weapon) return null;

  const visual = getWeaponVisual(weaponId);
  const canFire = usesLeft > 0;
  const tint = targeting ? AC.rust : AC.shimmer;
  const bgTint = targeting ? 'rgba(200,68,30,0.12)' : 'rgba(255,61,139,0.08)';

  return (
    <div
      style={{
        padding: 12,
        border: `2px solid ${tint}`,
        background: bgTint,
        position: 'relative',
      }}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 10,
          letterSpacing: '0.25em',
          color: tint,
          marginBottom: 8,
          textTransform: 'uppercase',
        }}
      >
        {targeting ? '// CIBLE UN JOUEUR' : '// MON ARME'}
      </div>
      <div className="flex items-center gap-2.5">
        <div
          style={{
            width: 44,
            height: 44,
            background: tint,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            clipPath: AC_CLIP,
            flexShrink: 0,
          }}
        >
          <AcGlyph kind={visual.glyph} color={AC.ink} size={22} stroke={2.5} />
        </div>
        <div className="flex-1 min-w-0">
          <div
            style={{
              fontFamily:
                "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
              fontWeight: 800,
              fontSize: 15,
              color: AC.bone,
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            {weapon.name.toUpperCase()}
          </div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              color: AC.bone2,
            }}
          >
            x{usesLeft} utilisation{usesLeft > 1 ? 's' : ''}
          </div>
        </div>
        {targeting ? (
          <AcButton variant="ghost" size="sm" onClick={onCancelTargeting}>
            ANNULER
          </AcButton>
        ) : (
          <AcButton
            variant="primary"
            size="sm"
            onClick={onStartTargeting}
            disabled={!canFire}
          >
            ARMER
          </AcButton>
        )}
      </div>
    </div>
  );
}
