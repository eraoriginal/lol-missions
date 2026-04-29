'use client';

import { WEAPONS, getWeapon } from '@/lib/beatEikichi/weapons';
import { AC, AC_CLIP, AcButton, AcGlyph } from '@/app/components/arcane';
import { getWeaponVisual } from '../weaponVisuals';

interface WeaponGridProps {
  /** Map weaponId → usesLeft (3 max par arme). */
  stacks: Record<string, number>;
  /** ID de l'arme actuellement sélectionnée pour viser une cible. */
  armingWeaponId: string | null;
  onStartTargeting: (weaponId: string) => void;
  onCancelTargeting: () => void;
}

/**
 * Grille des 12 armes du Eikichi en mode "all-vs-eikichi".
 *
 * Chaque arme a son propre compteur d'utilisations (initialisé à 3 au /start).
 * Cliquer sur une arme la met en mode "armé" : le joueur peut alors viser un
 * joueur dans la PlayerScoreList. Cliquer une 2e fois sur la même arme (ou sur
 * "ANNULER") sort du mode armé.
 *
 * Une seule arme peut être armée à la fois côté UI ; côté serveur on peut
 * tirer plusieurs armes différentes vers différentes cibles dans la même
 * question (cf. fire-weapon : la contrainte est juste "1 cible max par
 * question pour le Eikichi").
 */
export function WeaponGrid({
  stacks,
  armingWeaponId,
  onStartTargeting,
  onCancelTargeting,
}: WeaponGridProps) {
  return (
    <div
      style={{
        padding: 6,
        border: `1.5px solid ${armingWeaponId ? AC.rust : AC.shimmer}`,
        background: armingWeaponId ? 'rgba(200,68,30,0.10)' : 'rgba(255,61,139,0.05)',
      }}
    >
      {/* Header compact + grille fusionnés sur la même rangée pour gagner en
          hauteur. Le label cours en haut ; en mode "armé" on remplace par
          l'arme + bouton annuler en ligne. */}
      <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
        <span
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 9,
            letterSpacing: '0.2em',
            color: armingWeaponId ? AC.rust : AC.shimmer,
            textTransform: 'uppercase',
            flex: 1,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {armingWeaponId
            ? `// ${getWeapon(armingWeaponId)?.name.toUpperCase() ?? '?'} → CIBLE`
            : '// ARSENAL EIKICHI'}
        </span>
        {armingWeaponId && (
          <AcButton variant="ghost" size="sm" onClick={onCancelTargeting}>
            ANNULER
          </AcButton>
        )}
      </div>

      <div
        className="grid gap-1"
        style={{
          // 12 armes sur 1 rangée plein écran (≥1100px), 6×2 sur écran moyen,
          // 4×3 sur petit écran. minmax 64px = chaque cellule reste lisible
          // (icône 26px + label 9px + compteur).
          gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
        }}
      >
        {WEAPONS.map((w) => {
          const remaining = stacks[w.id] ?? 0;
          const canFire = remaining > 0;
          const isArmed = armingWeaponId === w.id;
          const visual = getWeaponVisual(w.id);
          const tint = isArmed ? AC.rust : AC.shimmer;

          return (
            <button
              key={w.id}
              type="button"
              disabled={!canFire && !isArmed}
              onClick={() => {
                if (isArmed) onCancelTargeting();
                else if (canFire) onStartTargeting(w.id);
              }}
              style={{
                padding: '4px 2px',
                border: `1.5px solid ${isArmed ? AC.rust : canFire ? AC.bone2 : 'rgba(138,122,92,0.3)'}`,
                background: isArmed
                  ? 'rgba(200,68,30,0.18)'
                  : canFire
                    ? 'rgba(240,228,193,0.04)'
                    : 'rgba(0,0,0,0.25)',
                opacity: canFire ? 1 : 0.4,
                cursor: canFire ? 'pointer' : 'not-allowed',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                transition: 'background 0.15s, border-color 0.15s',
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                position: 'relative',
              }}
              title={`${w.name} — ${w.description}`}
            >
              {/* Compteur en badge top-right pour gagner de la hauteur */}
              <span
                style={{
                  position: 'absolute',
                  top: 1,
                  right: 3,
                  fontSize: 8,
                  letterSpacing: '0.05em',
                  color: canFire ? AC.chem : AC.bone2,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                ×{remaining}
              </span>
              <div
                style={{
                  width: 26,
                  height: 26,
                  background: canFire ? tint : AC.bone2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  clipPath: AC_CLIP,
                }}
              >
                <AcGlyph kind={visual.glyph} color={AC.ink} size={14} stroke={2.5} />
              </div>
              <div
                style={{
                  fontFamily: "'Barlow Condensed', 'Bebas Neue', sans-serif",
                  fontSize: 9,
                  fontWeight: 800,
                  color: AC.bone,
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em',
                  textAlign: 'center',
                  lineHeight: 1,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  width: '100%',
                  padding: '0 2px',
                }}
              >
                {w.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
