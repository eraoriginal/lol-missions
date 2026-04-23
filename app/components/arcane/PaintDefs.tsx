/**
 * ArcanePaintDefs — les 6 filtres SVG du design system.
 *
 * À monter UNE SEULE FOIS dans `layout.tsx` pour que tous les composants Arcane
 * puissent les référencer via `filter="url(#ac-...)"`.
 *
 *   - `#ac-rough`            bords légèrement peints (subtil)
 *   - `#ac-rougher`          bords fortement déformés (glyphes, émoticônes)
 *   - `#ac-paint-spread`     éclaboussures (splats de fond)
 *   - `#ac-goo`              gouttes qui fusionnent (drips, jauges)
 *   - `#ac-paint-text`       bords peints légers pour titres (lisible)
 *   - `#ac-paint-text-heavy` bords peints plus marqués pour accents
 */
export function ArcanePaintDefs() {
  return (
    <svg
      width="0"
      height="0"
      style={{ position: 'absolute', pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <defs>
        <filter id="ac-rough" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.04"
            numOctaves={2}
            seed={7}
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={5} />
        </filter>
        {/* `ac-rougher` : appliqué à tous les glyphes/emotes/tags. Baissé de
            numOctaves 3→2 et scale 10→6 : visuel quasi identique, coût de
            compositing divisé par ~2. L'effet reste « peinture bombée » mais
            le framerate remonte quand 20+ glyphes sont visibles à la fois. */}
        <filter id="ac-rougher" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.08"
            numOctaves={2}
            seed={3}
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={6} />
        </filter>
        <filter
          id="ac-paint-spread"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves={2}
            seed={1}
          />
          <feDisplacementMap in="SourceGraphic" scale={3} />
        </filter>
        <filter id="ac-goo" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={3} result="b" />
          <feColorMatrix
            in="b"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
          />
        </filter>
        {/* Pour les titres : léger bleed + petit displacement, texte reste lisible. */}
        <filter
          id="ac-paint-text"
          x="-5%"
          y="-15%"
          width="110%"
          height="130%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.022 0.04"
            numOctaves={2}
            seed={5}
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={2.2} />
          <feMorphology operator="dilate" radius="0.4" />
        </filter>
        {/* Pour les accents/shimmer : effet « peinture fraîche » plus marqué. */}
        <filter
          id="ac-paint-text-heavy"
          x="-5%"
          y="-15%"
          width="110%"
          height="130%"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.018 0.05"
            numOctaves={2}
            seed={2}
            result="n"
          />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={3.5} />
        </filter>
      </defs>
    </svg>
  );
}
