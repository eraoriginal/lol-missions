'use client';

import { AC, AC_CLIP, AcButton, AcGlyph, AcStamp } from '@/app/components/arcane';

interface ShieldBlockProps {
  usesLeft: number;
  /** Vrai si un bouclier est déjà armé pour la prochaine question. */
  armed: boolean;
  onFire: () => void;
}

/**
 * Bloc bouclier disponible pour tous les joueurs. Activer = prochaine question
 * annule toute attaque reçue. Une fois `armed`, le bouton se verrouille en
 * tampon « ARMÉ » (vert chem) pour éviter de gaspiller une charge.
 */
export function ShieldBlock({ usesLeft, armed, onFire }: ShieldBlockProps) {
  const noUses = usesLeft <= 0;
  const canFire = !noUses && !armed;
  const tint = armed ? AC.chem : AC.hex;
  const bgTint = armed
    ? 'rgba(18,214,168,0.12)'
    : 'rgba(94,184,255,0.08)';

  return (
    <div
      style={{
        padding: 12,
        border: `2px solid ${tint}`,
        background: bgTint,
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
        {'// MON BOUCLIER'}
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
          <AcGlyph kind="shield" color={AC.ink} size={22} stroke={2.5} />
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
            BOUCLIER
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
        {armed ? (
          <AcStamp color={AC.chem} rotate={-2} bg="rgba(18,214,168,0.12)">
            ✓ ARMÉ
          </AcStamp>
        ) : (
          <AcButton
            variant="hex"
            size="sm"
            onClick={onFire}
            disabled={!canFire}
          >
            ACTIVER
          </AcButton>
        )}
      </div>
    </div>
  );
}
