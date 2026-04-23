/**
 * Mapping arme (backend `lib/beatEikichi/weapons.ts`) → rendu Arcane.kit.
 *
 * Vit ici (côté app) pour que le backend/seed n'ait pas à connaître le
 * langage visuel. Ajoute une couleur et un glyph à chaque weapon.id.
 */
import { AC } from '@/app/components/arcane';
import type { AcGlyphKind } from '@/app/components/arcane';

export interface WeaponVisual {
  glyph: AcGlyphKind;
  color: string;
}

export const WEAPON_VISUALS: Record<string, WeaponVisual> = {
  smoke: { glyph: 'smoke', color: AC.bone2 },
  c4: { glyph: 'bomb', color: AC.rust },
  blade: { glyph: 'saber', color: AC.shimmer },
  freeze: { glyph: 'ice', color: AC.hex },
  zoomghost: { glyph: 'zoom', color: AC.violet },
  tornado: { glyph: 'tornado', color: AC.gold },
  puzzle: { glyph: 'puzzle', color: AC.chem },
  speed: { glyph: 'speed', color: AC.shimmer },
  tag: { glyph: 'flame', color: AC.gold },
  glitch: { glyph: 'lightning', color: AC.chem },
  acid: { glyph: 'thermometer', color: AC.chem },
  strobe: { glyph: 'target', color: AC.shimmer },
  shield: { glyph: 'shield', color: AC.hex },
};

export function getWeaponVisual(weaponId: string | null): WeaponVisual {
  if (!weaponId) return { glyph: 'ring', color: AC.bone2 };
  return WEAPON_VISUALS[weaponId] ?? { glyph: 'ring', color: AC.bone2 };
}
