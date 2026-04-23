/**
 * Arcane.kit — barrel export.
 *
 * Import typique dans un écran :
 *   import { AcScreen, AcCard, AcButton, AcDisplay, AcShim, AC } from '@/app/components/arcane';
 */

export {
  AC,
  AC_CLIP,
  AC_IMAGE_FRAME_CLIP,
  AC_FONT_DISPLAY,
  AC_FONT_DISPLAY_HEAVY,
  AC_FONT_BODY,
  AC_FONT_MONO,
  type AcColor,
} from './tokens';

export { ArcanePaintDefs } from './PaintDefs';

export {
  // Typo & titres
  AcHeadline,
  AcDisplay,
  AcShim,
  AcGraffitiText,
  // Drips, splats, emotes, glyphes
  AcDrip,
  AcSplat,
  AcEmote,
  AcGlyph,
  type AcGlyphKind,
  // UI
  AcButton,
  type AcButtonVariant,
  type AcSize,
  AcStamp,
  AcDashed,
  AcPaintedBar,
  AcAlert,
  type AcAlertTone,
  AcCard,
  AcSectionNum,
  AcDottedLabel,
  AcAvatar,
  AcScreen,
} from './primitives';

export {
  AcStar,
  AcHeart,
  AcCrown,
  AcCloudTat,
  AcSpray,
  AcCrossTag,
  AcArrowTag,
  AcBoltTag,
  AcZigzag,
  AcBurst,
  AcTriangle,
  AcHash,
  AcChevron,
  AcDiamond,
  AcScribble,
  AcGraffitiLayer,
} from './graffiti';

export { AcModalCard, AcModalDim, AC_MODAL_CLIP } from './AcModalCard';
export { AcToast, AcToastStack, type AcToastTone } from './AcToast';
