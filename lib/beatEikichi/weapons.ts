/**
 * Catalogue des armes Beat Eikichi.
 * Chaque arme a un ID stable, un nom/icône affichés et une description.
 * La durée de l'effet correspond à la durée restante de la question courante
 * (l'effet cesse automatiquement au passage à la question suivante).
 */

export interface Weapon {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const WEAPONS: Weapon[] = [
  {
    id: 'smoke',
    name: 'Fumigène',
    icon: '💨',
    description: 'Épaisse fumée grise : l\'image devient quasi illisible.',
  },
  {
    id: 'c4',
    name: 'C4',
    icon: '💥',
    description: 'Explosions successives qui recouvrent toute l\'image.',
  },
  {
    id: 'blade',
    name: 'Sabre',
    icon: '🗡️',
    description: 'Coupe diagonale : une moitié de l\'image devient noire.',
  },
  {
    id: 'freeze',
    name: 'Gel',
    icon: '❄️',
    description: 'Craquelures de glace, flocons, image gelée et zoom désactivé.',
  },
  {
    id: 'zoomghost',
    name: 'Zoom parasite',
    icon: '🎯',
    description: 'Un zoom plein cadre se balade sur l\'image, zoom manuel bloqué.',
  },
  {
    id: 'tornado',
    name: 'Tornade',
    icon: '🌀',
    description: 'L\'image tourne lentement.',
  },
  {
    id: 'puzzle',
    name: 'Puzzle Break',
    icon: '🧩',
    description: 'Image découpée en 9 carrés mélangés.',
  },
  {
    id: 'speed',
    name: 'Speed',
    icon: '⚡',
    description: "L'image défile à grande vitesse de gauche à droite : lecture quasi impossible.",
  },
  {
    id: 'tag',
    name: 'Tag aérosol',
    icon: '🎨',
    description: 'Un crew a repeint ton écran : 4 nuages aérosol opaques s\'étalent en cascade.',
  },
  {
    id: 'glitch',
    name: 'Glitch',
    icon: '📺',
    description: 'La cassette est morte. Bandes qui smearent, split RGB, blocs corrompus.',
  },
  {
    id: 'acid',
    name: 'Acide',
    icon: '🧪',
    description: 'Quelqu\'un a renversé de l\'acide sur ton écran : 5 trous noirs coulent vers le bas.',
  },
  {
    id: 'strobe',
    name: 'Strobe',
    icon: '⚠️',
    description: 'Tu viens de te prendre un gyrophare en pleine face : flashs multicolores rapides.',
  },
];

/**
 * Le bouclier n'est PAS une arme : tous les joueurs en disposent en plus de leur arme
 * choisie. Il est stocké comme un BeatEikichiWeaponEvent avec weaponId='shield' pour
 * simplifier la logique côté `computeActiveEffect`, mais ne figure pas dans WEAPONS.
 */
export const SHIELD_WEAPON_ID = 'shield';
export const SHIELD_ICON = '🛡️';
export const SHIELD_NAME = 'Bouclier';

export function getWeapon(id: string): Weapon | undefined {
  return WEAPONS.find((w) => w.id === id);
}

export const WEAPON_IDS = WEAPONS.map((w) => w.id);
