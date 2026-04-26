'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { LOL_CHAMPIONS } from '@/lib/quizCeo/lolChampions';
import {
  AC,
  AC_FONT_DISPLAY_HEAVY,
  AC_FONT_MONO,
  AcCard,
  AcDisplay,
  AcSectionNum,
  AcScreen,
} from '@/app/components/arcane';

/**
 * /test/lol-champions — harnais visuel pour la catégorie `lol-champion` du
 * Quiz du CEO. Les splash arts sont des JPEG 1280×720 AVEC fond de scène
 * (Community Dragon ne fournit pas de PNG alpha) — la « silhouette » doit
 * donc être obtenue par des effets CSS/SVG sur l'image source.
 *
 * Cette page expose 6 traitements visuels appliqués via filtres CSS pour
 * juger lequel produit le meilleur effet « devine le champion ».
 */

type Treatment = {
  id: string;
  label: string;
  description: string;
  filter: string;
  background?: string;
  scale?: number;
  blendOver?: string;
  mask?: string;
};

const TREATMENTS: Treatment[] = [
  {
    id: 'normal',
    label: 'Normal',
    description: 'Référence : le splash centered tel qu\'il sort du CDN.',
    filter: 'none',
  },
  {
    id: 'silhouette-naive',
    label: 'Silhouette naïve',
    description:
      "filter: brightness(0) — montre que sans alpha la silhouette = un rectangle noir. Inutilisable.",
    filter: 'brightness(0)',
  },
  {
    id: 'blur',
    label: 'Flou',
    description:
      'filter: blur(20px) — version « brouillon ». Reconnaissable aux silhouettes/couleurs.',
    filter: 'blur(20px) saturate(1.4)',
  },
  {
    id: 'pixelate',
    label: 'Pixel',
    description:
      'image-rendering: pixelated + scale 0.05 — version 8-bit. Très lisible pour les fans.',
    filter: 'none',
    scale: 0.04,
  },
  {
    id: 'edges',
    label: 'Contours',
    description:
      'filter: invert + grayscale + contrast — type « croquis ». Lisibilité moyenne.',
    filter: 'invert(1) grayscale(1) contrast(2.2) brightness(1.1)',
  },
  {
    id: 'duotone-dark',
    label: 'Ombre noire',
    description:
      'filter: brightness(0.55) contrast(2.2) grayscale(1) — décor désaturé, contrastes durcis. Sujet visible mais ambigu.',
    filter: 'brightness(0.55) contrast(2.2) grayscale(1)',
  },
  {
    id: 'spotlight-center',
    label: 'Spot centre',
    description:
      'mask radial : on garde le centre (sujet) + fondu vers le noir aux bords. Splash centered = sujet bien centré → silhouette propre du buste.',
    filter: 'brightness(0.85) contrast(1.6) grayscale(1)',
    mask: 'radial-gradient(ellipse 35% 60% at 50% 55%, black 35%, transparent 90%)',
  },
  {
    id: 'edge-detect',
    label: 'Détection bords',
    description:
      'SVG feMorphology + feColorMatrix → contours blancs sur noir, comme un négatif tracé.',
    filter: 'url(#lol-edge-filter)',
  },
];

export default function LolChampionsTestPage() {
  const [treatmentId, setTreatmentId] = useState<string>('blur');
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const treatment = useMemo(
    () => TREATMENTS.find((t) => t.id === treatmentId) ?? TREATMENTS[0],
    [treatmentId],
  );

  const champions = useMemo(() => {
    if (!search.trim()) return LOL_CHAMPIONS;
    const q = search.trim().toLowerCase();
    return LOL_CHAMPIONS.filter(
      (c) =>
        c.id.includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q),
    );
  }, [search]);

  const toggleReveal = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <AcScreen>
      <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden>
        <defs>
          <filter id="lol-edge-filter" x="0" y="0" width="100%" height="100%">
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      1 1 1 0 0"
            />
            <feMorphology operator="dilate" radius="1" />
            <feComposite operator="out" in2="SourceGraphic" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1
                      0 0 0 0 1
                      0 0 0 0 1
                      0 0 0 8 0"
            />
          </filter>
        </defs>
      </svg>
      <div className="mx-auto" style={{ maxWidth: 1400, padding: 32 }}>
        <div className="mb-6 flex items-center gap-3">
          <AcSectionNum n={'LOL'} />
          <AcDisplay style={{ fontSize: 40, lineHeight: 1 }}>
            Champions LoL — test visuel
          </AcDisplay>
        </div>

        <AcCard fold={false} dashed style={{ padding: 18, marginBottom: 24 }}>
          <div
            style={{
              fontFamily: AC_FONT_MONO,
              fontSize: 12,
              color: AC.bone2,
              lineHeight: 1.6,
              marginBottom: 14,
            }}
          >
            {'// '}
            {LOL_CHAMPIONS.length} champions téléchargés depuis Community Dragon
            (1280×720 JPEG, ~80-150 KB chacun). Les splashs ont un décor de
            scène : aucun PNG transparent disponible publiquement → la mode
            {'« silhouette » doit passer par un effet CSS sur l’image source.'}
            Choisis ci-dessous le traitement à comparer ; clique sur une vignette
            pour révéler / masquer le nom.
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {TREATMENTS.map((t) => {
              const active = t.id === treatment.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTreatmentId(t.id)}
                  style={{
                    padding: '8px 14px',
                    background: active
                      ? 'rgba(255,61,139,0.18)'
                      : 'rgba(240,228,193,0.04)',
                    border: active
                      ? `2px solid ${AC.shimmer}`
                      : `1.5px dashed ${AC.bone2}`,
                    color: active ? AC.bone : AC.bone2,
                    fontFamily: AC_FONT_DISPLAY_HEAVY,
                    fontWeight: 800,
                    fontSize: 13,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div
            style={{
              fontFamily: AC_FONT_MONO,
              fontSize: 11,
              color: AC.chem,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            {'> '}
            {treatment.label}
          </div>
          <div
            style={{
              fontFamily: AC_FONT_MONO,
              fontSize: 12,
              color: AC.bone,
              lineHeight: 1.5,
              marginBottom: 14,
            }}
          >
            {treatment.description}
          </div>

          <input
            type="text"
            placeholder="filtrer par nom (ex: ahri, jhin, …)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="ac-input"
            style={{
              width: '100%',
              padding: '10px 14px',
              background: 'rgba(13,11,8,0.6)',
              border: `1.5px solid ${AC.bone2}`,
              color: AC.bone,
              fontFamily: AC_FONT_MONO,
              fontSize: 13,
            }}
          />
          <div
            style={{
              fontFamily: AC_FONT_MONO,
              fontSize: 11,
              color: AC.bone2,
              marginTop: 6,
            }}
          >
            {'// '}
            {champions.length} / {LOL_CHAMPIONS.length} affichés
          </div>
        </AcCard>

        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns:
              'repeat(auto-fill, minmax(180px, 1fr))',
          }}
        >
          {champions.map((c) => {
            const isRevealed = revealed.has(c.id);
            return (
              <ChampionTile
                key={c.id}
                id={c.id}
                name={c.name}
                title={c.title}
                treatment={treatment}
                revealed={isRevealed}
                onToggle={() => toggleReveal(c.id)}
              />
            );
          })}
        </div>
      </div>
    </AcScreen>
  );
}

function ChampionTile({
  id,
  name,
  title,
  treatment,
  revealed,
  onToggle,
}: {
  id: string;
  name: string;
  title: string;
  treatment: Treatment;
  revealed: boolean;
  onToggle: () => void;
}) {
  const src = `/lol-champions/${id}.jpg`;

  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: 'relative',
        background: 'rgba(13,11,8,0.6)',
        border: `1.5px solid ${AC.bone2}`,
        padding: 0,
        overflow: 'hidden',
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          overflow: 'hidden',
          background: '#0a0907',
        }}
      >
        {treatment.id === 'pixelate' ? (
          <PixelateImg src={src} alt={name} />
        ) : (
          <img
            src={src}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: revealed ? 'none' : treatment.filter,
              transition: 'filter 200ms ease',
              ...(treatment.mask && !revealed
                ? {
                    WebkitMaskImage: treatment.mask,
                    maskImage: treatment.mask,
                  }
                : {}),
            }}
          />
        )}
        {!revealed && treatment.blendOver && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: treatment.blendOver,
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
      <div style={{ padding: '8px 10px' }}>
        <div
          style={{
            fontFamily: AC_FONT_DISPLAY_HEAVY,
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: revealed ? AC.shimmer : AC.bone2,
          }}
        >
          {revealed ? name : '???'}
        </div>
        <div
          style={{
            fontFamily: AC_FONT_MONO,
            fontSize: 10,
            color: AC.bone2,
            marginTop: 2,
            opacity: revealed ? 1 : 0.4,
          }}
        >
          {revealed ? title : id}
        </div>
      </div>
    </button>
  );
}

function PixelateImg({ src, alt }: { src: string; alt: string }) {
  // Pixelation réelle : downsample sur canvas (24×13), affichage upscaled
  // via image-rendering: pixelated.
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const PX_W = 24;
      const PX_H = Math.max(
        1,
        Math.round((PX_W * img.naturalHeight) / img.naturalWidth),
      );
      canvas.width = PX_W;
      canvas.height = PX_H;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, PX_W, PX_H);
    };
    img.src = src;
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      aria-label={alt}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        imageRendering: 'pixelated',
        background: '#0a0907',
      }}
    />
  );
}
