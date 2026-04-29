/**
 * Helpers pour construire les URLs des images IGDB.
 *
 * IGDB ne stocke pas l'URL complète : il renvoie un `image_id` court
 * (ex: "co1r7d") et l'URL est calculée par concaténation de :
 *   - la base CDN images.igdb.com
 *   - le chemin t_<size>
 *   - l'image_id + extension .jpg
 *
 * Stocker juste l'imageId en DB nous permet de switcher de taille (mobile,
 * preview, plein écran) sans re-seeder.
 *
 * Sizes IGDB officielles (cf. https://api-docs.igdb.com/#images) :
 *   - t_screenshot_huge : 1280×720  (utilisé par Beat Eikichi)
 *   - t_screenshot_big  : 889×500
 *   - t_1080p           : 1920×1080
 *   - t_cover_big       : 264×374   (jaquettes)
 *   - t_thumb           : 90×90
 */

export type IgdbImageSize =
  | 'screenshot_huge'
  | 'screenshot_big'
  | 't_1080p'
  | 'cover_big'
  | 'thumb';

const IGDB_IMAGE_BASE = 'https://images.igdb.com/igdb/image/upload';

/**
 * Construit l'URL d'une image IGDB à partir de son `image_id`.
 *
 * @param imageId  L'identifiant retourné par IGDB (ex: "co1r7d")
 * @param size     Taille demandée (défaut: screenshot_huge 1280×720)
 */
export function igdbImageUrl(
  imageId: string,
  size: IgdbImageSize = 'screenshot_huge',
): string {
  return `${IGDB_IMAGE_BASE}/t_${size}/${imageId}.jpg`;
}
