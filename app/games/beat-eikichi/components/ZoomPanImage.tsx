'use client';

import { useEffect, useRef, useState, WheelEvent } from 'react';

interface ZoomPanImageProps {
  src: string;
  alt: string;
  onLoad?: () => void;
  /** Appelé si l'image échoue à charger (404 / CORS / URL invalide). Laisse au
   * parent le soin d'afficher un fallback ou de marquer la question terminée. */
  onError?: () => void;
  className?: string;
  /** Intensité du flou en pixels appliqué à l'image (mode "blur"). 0 = pas de flou. */
  blurPx?: number;
  /** Si true, applique une animation de rotation continue sur l'image (arme Tornade). */
  rotating?: boolean;
}

const MIN_SCALE = 1;
const MAX_SCALE = 5;
const SCALE_STEP = 1.2;

/**
 * Image zoomable/pannable **in-place** (sans overlay) :
 *   - molette pour zoomer (centré sur le curseur)
 *   - clic gauche + drag pour déplacer (quand zoomé)
 *   - boutons +/−/1:1 en bas à droite
 */
export function ZoomPanImage({
  src,
  alt,
  onLoad,
  onError,
  className,
  blurPx,
  rotating,
}: ZoomPanImageProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  // Affiche un placeholder si l'image échoue à charger (404 / CORS / URL invalide).
  // Indispensable car certains GIFs GIPHY peuvent disparaître après le seed, et
  // ne rien afficher en silence rend la question impossible.
  const [errored, setErrored] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{
    startX: number;
    startY: number;
    initOX: number;
    initOY: number;
  } | null>(null);

  // Reset scale + offset + flag erreur quand l'image change (nouvelle question).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset state on prop change is intentional
    setScale(1);
    setOffset({ x: 0, y: 0 });
    setErrored(false);
  }, [src]);

  // Filet de sauvetage : si l'image n'a ni `onLoad` ni `onError` au bout de 8s
  // (cas observé sur certains CDN qui hangent en silence), on bascule en mode
  // erreur. Sinon le parent garde l'image en `opacity-0` à jamais et la
  // question paraît cassée.
  useEffect(() => {
    if (!src || errored) return;
    const timeout = setTimeout(() => {
      setErrored(true);
      // On notifie aussi `onLoad` pour que le parent désactive son loader CSS.
      onLoad?.();
      onError?.();
    }, 8000);
    return () => clearTimeout(timeout);
  }, [src, errored, onLoad, onError]);

  const clampOffset = (ox: number, oy: number, s: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const w = containerRef.current.clientWidth;
    const h = containerRef.current.clientHeight;
    const maxOx = ((s - 1) * w) / 2;
    const maxOy = ((s - 1) * h) / 2;
    return {
      x: Math.max(-maxOx, Math.min(maxOx, ox)),
      y: Math.max(-maxOy, Math.min(maxOy, oy)),
    };
  };

  // Zoom en conservant le pixel sous le curseur (cx, cy relatifs au container).
  const zoomAt = (cx: number, cy: number, newScale: number) => {
    const w = containerRef.current?.clientWidth ?? 0;
    const h = containerRef.current?.clientHeight ?? 0;
    const ccx = w / 2;
    const ccy = h / 2;
    const dx = cx - ccx;
    const dy = cy - ccy;
    const r = newScale / scale;
    const newOx = dx * (1 - r) + offset.x * r;
    const newOy = dy * (1 - r) + offset.y * r;
    setScale(newScale);
    setOffset(clampOffset(newOx, newOy, newScale));
  };

  // Pour bloquer le scroll de la page, il faut un listener non-passif — ajouté via
  // addEventListener plutôt que onWheel React (qui est passif par défaut sur Chrome).
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = (e: globalThis.WheelEvent) => {
      e.preventDefault();
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? SCALE_STEP : 1 / SCALE_STEP;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * factor));
    if (newScale !== scale) zoomAt(cx, cy, newScale);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (scale <= 1) return;
    e.preventDefault();
    setDragging(true);
    dragStateRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initOX: offset.x,
      initOY: offset.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const ds = dragStateRef.current;
    if (!ds) return;
    const dx = e.clientX - ds.startX;
    const dy = e.clientY - ds.startY;
    setOffset(clampOffset(ds.initOX + dx, ds.initOY + dy, scale));
  };

  const endDrag = () => {
    dragStateRef.current = null;
    setDragging(false);
  };

  const zoomIn = () => {
    const w = containerRef.current?.clientWidth ?? 0;
    const h = containerRef.current?.clientHeight ?? 0;
    const newScale = Math.min(MAX_SCALE, scale * SCALE_STEP);
    if (newScale !== scale) zoomAt(w / 2, h / 2, newScale);
  };
  const zoomOut = () => {
    const w = containerRef.current?.clientWidth ?? 0;
    const h = containerRef.current?.clientHeight ?? 0;
    const newScale = Math.max(MIN_SCALE, scale / SCALE_STEP);
    if (newScale !== scale) zoomAt(w / 2, h / 2, newScale);
  };
  const resetZoom = () => {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  };

  const canPan = scale > 1;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden select-none"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={endDrag}
      onMouseLeave={endDrag}
      style={{
        cursor: dragging ? 'grabbing' : canPan ? 'grab' : 'default',
      }}
    >
      {/* Wrapper pour la rotation Tornade (laisse le transform scale/translate
          sur l'img et applique la rotation à un niveau séparé). */}
      <div
        className={`absolute inset-0 ${rotating ? 'bek-fx-tornado-pull' : ''}`}
      >
        {errored ? (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{
              color: '#8A7A5C',
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 12,
              letterSpacing: '0.15em',
              textAlign: 'center',
              padding: '24px',
            }}
          >
            <div style={{ fontSize: 28, color: '#C8441E' }}>⚠</div>
            <div>{'// image indisponible'}</div>
            <div style={{ fontSize: 10, color: '#5C5040' }}>
              {'// l\'asset n\'a pas pu être chargé — la question reste valide'}
            </div>
          </div>
        ) : (
          <img
            src={src}
            alt={alt}
            onLoad={onLoad}
            // Sur erreur réseau (404 / CORS / URL invalide), on affiche un
            // placeholder explicite au lieu de laisser l'image en opacity-0
            // (le parent garde la transition `imageLoaded`).
            onError={() => {
              setErrored(true);
              // Forcer l'avancée du loader parent : sinon il attend onLoad
              // qui ne fire jamais sur une 404.
              onLoad?.();
              onError?.();
            }}
            onDragStart={(e) => e.preventDefault()}
            className={`w-full h-full pointer-events-none ${className ?? ''}`}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
              transformOrigin: 'center center',
              // Transition courte sur le filter pour que la révélation progressive du
              // mode "blur" reste fluide entre deux recalculs.
              transition: dragging
                ? 'none'
                : 'transform 0.12s ease-out, filter 0.4s linear',
              filter: blurPx && blurPx > 0.05 ? `blur(${blurPx}px)` : undefined,
            }}
          />
        )}
      </div>

      {/* Contrôles zoom en bas à droite */}
      <div
        className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 rounded-lg border border-white/10 backdrop-blur-sm p-1"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <ZoomButton
          onClick={zoomOut}
          disabled={scale <= MIN_SCALE}
          title="Zoom arrière (molette vers le bas)"
        >
          −
        </ZoomButton>
        <button
          onClick={resetZoom}
          disabled={scale === 1 && offset.x === 0 && offset.y === 0}
          title="Réinitialiser le zoom"
          className="px-2 h-8 rounded text-xs font-semibold text-white/90 hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          1:1
        </button>
        <ZoomButton
          onClick={zoomIn}
          disabled={scale >= MAX_SCALE}
          title="Zoom avant (molette vers le haut)"
        >
          +
        </ZoomButton>
      </div>

      {/* Indicateur d'aide quand pas encore zoomé */}
      {scale === 1 && (
        <div className="absolute top-2 left-2 text-xs text-white/50 bg-black/40 rounded px-2 py-0.5 pointer-events-none">
          Molette pour zoomer
        </div>
      )}
    </div>
  );
}

function ZoomButton({
  onClick,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded text-lg font-bold text-white/90 hover:bg-white/10 transition disabled:opacity-30 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}
