/**
 * Helpers Cemantix sans secret — partagés client + serveur. Le tier d'un
 * guess est calculé server-side dans `POST /api/solo/cemantix/guess`, mais
 * l'affichage du label/couleur/emoji se fait client-side pour chaque essai
 * persisté en localStorage.
 */

export type CemantixTier = 1 | 2 | 3 | 4 | 5;

export function tierLabel(tier: CemantixTier): {
  label: string;
  color: string;
  emoji: string;
} {
  switch (tier) {
    case 1:
      return { label: 'brûlant', color: '#FF3D3D', emoji: '🔥' };
    case 2:
      return { label: 'chaud', color: '#F5B912', emoji: '🌶️' };
    case 3:
      return { label: 'tiède', color: '#FF3D8B', emoji: '☕' };
    case 4:
      return { label: 'froid', color: '#5EB8FF', emoji: '🧊' };
    case 5:
      return { label: 'glacial', color: '#8A3DD4', emoji: '❄️' };
  }
}
