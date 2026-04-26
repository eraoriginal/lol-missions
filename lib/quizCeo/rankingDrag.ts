/**
 * Helpers purs pour l'animation drag & drop des questions ranking du Quiz CEO.
 *
 * Logique extraite du composant `RankingInput` (cf. QuestionPlayer.tsx) pour
 * être unit-testable. Aucune dépendance React / DOM.
 *
 * Mécanique « live insertion » : pendant le drag d'un item, les autres se
 * décalent visuellement (translateY) pour libérer la place où l'item va
 * atterrir. Détection du hover par cursor Y au niveau du container (pas
 * per-row) → pas de feedback loop avec le shift visuel.
 */

/**
 * Calcule le décalage vertical (en px) à appliquer à un item pendant le drag.
 *
 * @param myIdx     index actuel de l'item dans `order`
 * @param fromIdx   index de l'item draggé (-1 si pas de drag)
 * @param overIdx   index sous le cursor (-1 si pas de hover)
 * @param rowHeight hauteur d'une row + gap (pixels)
 * @param isDragging true si l'item considéré est celui qu'on drag
 * @returns offset en pixels (négatif = remonte, positif = descend, 0 = aucun)
 *
 * Règles :
 *   - Si l'item draggé n'existe pas (pas de drag actif) → 0
 *   - L'item draggé lui-même → 0 (le ghost browser suit la souris)
 *   - Drag vers le bas (fromIdx < overIdx) :
 *       items dans (fromIdx, overIdx] remontent d'une row
 *   - Drag vers le haut (fromIdx > overIdx) :
 *       items dans [overIdx, fromIdx) descendent d'une row
 *   - Sinon → 0
 */
export function computeRankingOffset(
  myIdx: number,
  fromIdx: number,
  overIdx: number,
  rowHeight: number,
  isDragging: boolean,
): number {
  if (fromIdx < 0 || overIdx < 0) return 0;
  if (isDragging) return 0;
  if (fromIdx < overIdx) {
    if (myIdx > fromIdx && myIdx <= overIdx) return -rowHeight;
  } else if (fromIdx > overIdx) {
    if (myIdx >= overIdx && myIdx < fromIdx) return rowHeight;
  }
  return 0;
}

/**
 * Calcule l'index « logique » sous le cursor à partir de sa position Y.
 *
 * Le calcul utilise le top du container + la hauteur d'une row, donc il
 * reste stable même quand les rows enfants ont des `transform: translateY`
 * appliqués (le container lui-même ne bouge pas). C'est ce qui élimine le
 * feedback loop responsable du tremblement de l'animation.
 *
 * @param clientY      e.clientY du DragEvent
 * @param containerTop containerRef.current.getBoundingClientRect().top
 * @param rowHeight    hauteur d'une row + gap
 * @param orderLength  nombre d'items dans `order`
 * @returns index dans [0, orderLength - 1], ou null si paramètres invalides
 */
export function computeRankingHoverIndex(
  clientY: number,
  containerTop: number,
  rowHeight: number,
  orderLength: number,
): number | null {
  if (rowHeight <= 0 || orderLength <= 0) return null;
  const y = clientY - containerTop;
  if (y < 0) return 0;
  return Math.max(0, Math.min(orderLength - 1, Math.floor(y / rowHeight)));
}

/**
 * Calcule le nouvel ordre après un drop. Pure : pas de side-effect.
 *
 * @param order      ordre actuel
 * @param draggingId id de l'item draggé
 * @param targetId   id de l'item au-dessus duquel on drop (la cible)
 * @returns nouvel ordre, ou `order` inchangé si le drop est invalide
 */
export function applyRankingDrop(
  order: readonly string[],
  draggingId: string,
  targetId: string,
): string[] {
  if (draggingId === targetId) return order.slice();
  const from = order.indexOf(draggingId);
  const to = order.indexOf(targetId);
  if (from < 0 || to < 0) return order.slice();
  const next = order.slice();
  next.splice(from, 1);
  next.splice(to, 0, draggingId);
  return next;
}
