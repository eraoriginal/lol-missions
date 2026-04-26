'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  AC,
  AcButton,
  AcDisplay,
  AcDottedLabel,
  AcGlyph,
  AcGraffitiLayer,
  AcScreen,
  AcShim,
  AcSplat,
} from '@/app/components/arcane';
import { dailyDateKey } from '@/lib/solo/dailyIndex';

interface Props {
  title: string;
  accent?: string; // couleur d'accent (AcShim)
  tag?: string; // "DAILY" par défaut
  children: ReactNode;
  headerExtra?: ReactNode;
}

/**
 * Wrapper visuel partagé par tous les jeux solo.
 *
 * Apporte :
 *   - AcScreen + splats décoratifs
 *   - Topbar : bouton retour + badge « DAILY · YYYY-MM-DD »
 *   - Titre hero (AcDisplay) avec shim
 *   - Slot pour le contenu du jeu
 */
export function SoloScreen({
  title,
  accent = AC.chem,
  tag = 'DAILY',
  children,
  headerExtra,
}: Props) {
  const dateKey = dailyDateKey();

  return (
    <AcScreen>
      <div style={{ position: 'absolute', top: -40, left: -60, pointerEvents: 'none' }}>
        <AcSplat color={accent} size={360} opacity={0.4} seed={1} />
      </div>
      <div style={{ position: 'absolute', bottom: 60, right: -40, pointerEvents: 'none' }}>
        <AcSplat color={AC.violet} size={320} opacity={0.38} seed={3} />
      </div>
      <AcGraffitiLayer density="normal" />

      <div
        className="relative mx-auto px-4 sm:px-8 py-6 sm:py-8"
        style={{ maxWidth: 1024 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link href="/" style={{ textDecoration: 'none' }}>
            <AcButton
              variant="ghost"
              size="sm"
              icon={<AcGlyph kind="arrowLeft" color={AC.bone} size={12} />}
            >
              RETOUR
            </AcButton>
          </Link>
          <div className="flex items-center gap-2">
            <span
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 10,
                letterSpacing: '0.22em',
                color: accent,
                border: `1px solid ${accent}`,
                padding: '2px 8px',
                textTransform: 'uppercase',
              }}
            >
              {tag}
            </span>
            <AcDottedLabel>{'// ' + dateKey}</AcDottedLabel>
          </div>
        </div>

        <div className="mb-7">
          <AcDisplay style={{ fontSize: 'clamp(36px, 7vw, 64px)' }}>
            <AcShim color={accent}>{title}</AcShim>
          </AcDisplay>
          {headerExtra}
        </div>

        {children}
      </div>
    </AcScreen>
  );
}
