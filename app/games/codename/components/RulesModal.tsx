'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AC,
  AcButton,
  AcCard,
  AcDashed,
  AcDisplay,
  AcGlyph,
  AcSectionNum,
  AcShim,
} from '@/app/components/arcane';

export function RulesModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted] = useState(() => typeof window !== 'undefined');

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const modalContent = isOpen ? (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center p-4 pt-8 overflow-y-auto"
      style={{ background: 'rgba(13,11,8,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={() => setIsOpen(false)}
    >
      <div
        className="ac-scroll w-full max-h-[90vh] overflow-y-auto my-4"
        style={{ maxWidth: 720 }}
        onClick={(e) => e.stopPropagation()}
      >
        <AcCard fold style={{ padding: 28 }}>
          <div className="flex justify-between items-start mb-4 gap-3">
            <div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: 10,
                  letterSpacing: '0.3em',
                  color: AC.chem,
                }}
              >
                {'// RULEBOOK v1'}
              </div>
              <AcDisplay style={{ fontSize: 'clamp(26px, 4vw, 36px)', marginTop: 6 }}>
                RÈGLES DU <AcShim>JEU</AcShim>
              </AcDisplay>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Fermer"
              style={{
                background: 'transparent',
                border: `1.5px solid ${AC.bone2}`,
                padding: 8,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <AcGlyph kind="x" color={AC.bone} size={16} />
            </button>
          </div>

          <div
            style={{
              fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
              fontSize: 14,
              color: AC.bone,
              lineHeight: 1.6,
            }}
          >
            <Section n={1} title="OBJECTIF" color={AC.shimmer}>
              Deux équipes s&apos;affrontent. Chaque équipe doit retrouver tous ses
              agents (mots) avant l&apos;équipe adverse, en se basant sur les indices
              donnés par son <AcShim>maître-espion</AcShim>.
            </Section>

            <AcDashed style={{ margin: '14px 0' }} />

            <Section n={2} title="RÔLES" color={AC.violet}>
              <div className="flex flex-col gap-2">
                <RoleLine
                  icon="zoom"
                  color={AC.violet}
                  title="MAÎTRE-ESPION"
                  desc="voit toutes les couleurs. Donne un indice d'un seul mot + un nombre."
                />
                <RoleLine
                  icon="target"
                  color={AC.chem}
                  title="AGENT"
                  desc="ne voit que les mots. Devine les cartes de son équipe."
                />
              </div>
            </Section>

            <AcDashed style={{ margin: '14px 0' }} />

            <Section n={3} title="TOUR DE JEU" color={AC.hex}>
              <ol className="flex flex-col gap-1.5 m-0" style={{ paddingLeft: 0, listStyle: 'none' }}>
                {[
                  "Le maître-espion donne un indice (mot + nombre)",
                  "Les agents devinent les cartes (nombre + 1 essais max)",
                  "Si bonne couleur : continuez à deviner",
                  "Si mauvaise couleur ou neutre : fin du tour",
                  "Les agents peuvent \"passer\" pour finir leur tour",
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      style={{
                        fontFamily:
                          "'JetBrains Mono', 'Courier New', monospace",
                        fontSize: 11,
                        color: AC.hex,
                        flexShrink: 0,
                        minWidth: 22,
                      }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </Section>

            <AcDashed style={{ margin: '14px 0' }} />

            <Section n={4} title="CARTES" color={AC.gold}>
              <div className="flex flex-col gap-1.5">
                <CardLine color={AC.rust} label="9 cartes rouges (équipe rouge)" />
                <CardLine color={AC.hex} label="8 cartes bleues (équipe bleue)" />
                <CardLine color={AC.bone2} label="7 cartes neutres (fin de tour)" />
                <CardLine color="#1A160F" striped label="1 assassin · défaite immédiate" />
              </div>
            </Section>

            <AcDashed style={{ margin: '14px 0' }} />

            <Section n={5} title="VICTOIRE" color={AC.chem}>
              <ul className="flex flex-col gap-1 m-0" style={{ paddingLeft: 0, listStyle: 'none' }}>
                <li className="flex gap-2">
                  <AcGlyph kind="check" color={AC.chem} size={14} stroke={2.5} />
                  Trouvez tous vos agents en premier
                </li>
                <li className="flex gap-2">
                  <AcGlyph kind="x" color={AC.rust} size={14} stroke={2.5} />
                  Évitez l&apos;assassin à tout prix
                </li>
              </ul>
            </Section>
          </div>

          <div className="mt-6 text-center">
            <AcButton
              variant="primary"
              size="md"
              drip
              onClick={() => setIsOpen(false)}
              icon={<AcGlyph kind="check" color={AC.ink} size={14} />}
            >
              COMPRIS
            </AcButton>
          </div>
        </AcCard>
      </div>
    </div>
  ) : null;

  return (
    <>
      <AcButton
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        icon={<AcGlyph kind="puzzle" color={AC.bone} size={12} />}
      >
        RÈGLES
      </AcButton>

      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}

function Section({
  n,
  title,
  color,
  children,
}: {
  n: number;
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2.5 mb-2">
        <AcSectionNum n={n} />
        <h3
          className="m-0"
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color,
          }}
        >
          {title}
        </h3>
      </div>
      <div style={{ color: AC.bone }}>{children}</div>
    </section>
  );
}

function RoleLine({
  icon,
  color,
  title,
  desc,
}: {
  icon: 'zoom' | 'target';
  color: string;
  title: string;
  desc: string;
}) {
  return (
    <div
      className="flex items-start gap-2.5 px-3 py-2"
      style={{
        border: `1.5px dashed ${color}`,
        background: `rgba(255,255,255,0.02)`,
      }}
    >
      <AcGlyph kind={icon} color={color} size={18} stroke={2.5} />
      <div>
        <span
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color,
            marginRight: 8,
          }}
        >
          {title}
        </span>
        <span style={{ color: AC.bone2, fontSize: 13 }}>: {desc}</span>
      </div>
    </div>
  );
}

function CardLine({
  color,
  label,
  striped,
}: {
  color: string;
  label: string;
  striped?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        style={{
          width: 16,
          height: 16,
          background: striped
            ? 'repeating-linear-gradient(45deg, #1A160F 0 3px, #0D0B08 3px 6px)'
            : color,
          border: `1.5px solid ${striped ? AC.rust : color}`,
          display: 'inline-block',
        }}
      />
      <span>{label}</span>
    </div>
  );
}
