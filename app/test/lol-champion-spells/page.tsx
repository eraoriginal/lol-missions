'use client';

import { useMemo, useState } from 'react';
import {
  LOL_CHAMPION_SPELLS,
  type LolChampionSpells,
} from '@/lib/quizCeo/lolChampionSpells';
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
 * /test/lol-champion-spells — harnais visuel pour la catégorie « devine le
 * champion à partir de ses sorts » du Quiz du CEO.
 *
 * Chaque champion est représenté par 5 icônes 64×64 PNG transparentes :
 *   Q · W · E · R · Passif
 * Source : Riot Data Dragon (img/spell + img/passive). Pas de splash, pas
 * de portrait — juste le « kit » du champion.
 *
 * Cette mécanique contourne le problème d'absence d'asset transparent pour
 * les portraits : les icônes de sorts SONT alpha 64×64, parfaitement nettes.
 * Pour un fan de LoL, le kit est très discriminant (Lee Sin Q = poing volant,
 * Yasuo R = tornade, Aatrox R = sphère noire, etc.).
 */

type Layout = 'row' | 'pyramid' | 'big-passive';
type Difficulty = 'all' | 'q-only' | 'qwer' | 'no-passive';

const LAYOUTS: Array<{ id: Layout; label: string; description: string }> = [
  {
    id: 'row',
    label: 'Ligne Q W E R P',
    description: 'Les 5 icônes en ligne, ordre canonique LoL.',
  },
  {
    id: 'pyramid',
    label: 'Pyramide R en haut',
    description:
      'L\'ultime (R) en haut, Q W E en ligne, passif détaché en bas — hiérarchie visuelle.',
  },
  {
    id: 'big-passive',
    label: 'Passif central',
    description:
      'Le passif au centre (souvent le plus iconique), les 4 sorts en cercle autour.',
  },
];

const DIFFICULTIES: Array<{
  id: Difficulty;
  label: string;
  description: string;
}> = [
  {
    id: 'all',
    label: 'Tout (5 icônes)',
    description: 'Niveau facile : tout le kit visible.',
  },
  {
    id: 'no-passive',
    label: 'Sans passif',
    description: 'Niveau moyen : Q W E R seulement (le passif est souvent la clé).',
  },
  {
    id: 'qwer',
    label: 'Q W E seulement',
    description: 'Niveau hard : pas d\'ult ni de passif.',
  },
  {
    id: 'q-only',
    label: 'Q seulement',
    description: 'Niveau extrême : 1 seule icône (le Q de base).',
  },
];

export default function LolChampionSpellsTestPage() {
  const [layoutId, setLayoutId] = useState<Layout>('row');
  const [diffId, setDiffId] = useState<Difficulty>('all');
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');

  const layout = LAYOUTS.find((l) => l.id === layoutId) ?? LAYOUTS[0];
  const diff = DIFFICULTIES.find((d) => d.id === diffId) ?? DIFFICULTIES[0];

  const champions = useMemo(() => {
    if (!search.trim()) return LOL_CHAMPION_SPELLS;
    const q = search.trim().toLowerCase();
    return LOL_CHAMPION_SPELLS.filter(
      (c) =>
        c.championId.includes(q) ||
        c.championName.toLowerCase().includes(q) ||
        c.championTitle.toLowerCase().includes(q),
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
      <div className="mx-auto" style={{ maxWidth: 1400, padding: 32 }}>
        <div className="mb-6 flex items-center gap-3">
          <AcSectionNum n={'KIT'} />
          <AcDisplay style={{ fontSize: 40, lineHeight: 1 }}>
            Sorts de champions LoL — test visuel
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
            {LOL_CHAMPION_SPELLS.length} champions × 5 icônes (Q · W · E · R · P)
            téléchargées depuis Data Dragon. Vraies PNG 64×64 transparentes,
            ~3-5 KB chacune. Mécanique : on affiche le « kit » du champion, le
            joueur devine. Idéal pour les fans LoL — bien plus discriminant
            qu’une silhouette grossière de splash art.
          </div>

          <div
            style={{
              fontFamily: AC_FONT_MONO,
              fontSize: 11,
              color: AC.chem,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            {'> mise en page'}
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {LAYOUTS.map((l) => {
              const active = l.id === layout.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setLayoutId(l.id)}
                  style={{
                    padding: '8px 14px',
                    background: active
                      ? 'rgba(94,184,255,0.18)'
                      : 'rgba(240,228,193,0.04)',
                    border: active
                      ? `2px solid ${AC.hex}`
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
                  {l.label}
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
              marginBottom: 6,
            }}
          >
            {'> difficulté (icônes affichées)'}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {DIFFICULTIES.map((d) => {
              const active = d.id === diff.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setDiffId(d.id)}
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
                  {d.label}
                </button>
              );
            })}
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
            {'// '}
            {layout.description} · {diff.description}
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
            {champions.length} / {LOL_CHAMPION_SPELLS.length} affichés
          </div>
        </AcCard>

        <div
          className="grid gap-4"
          style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          }}
        >
          {champions.map((c) => {
            const isRevealed = revealed.has(c.championId);
            return (
              <SpellTile
                key={c.championId}
                champ={c}
                layout={layoutId}
                diff={diffId}
                revealed={isRevealed}
                onToggle={() => toggleReveal(c.championId)}
              />
            );
          })}
        </div>
      </div>
    </AcScreen>
  );
}

function SpellTile({
  champ,
  layout,
  diff,
  revealed,
  onToggle,
}: {
  champ: LolChampionSpells;
  layout: Layout;
  diff: Difficulty;
  revealed: boolean;
  onToggle: () => void;
}) {
  const base = `/lol-champion-spells/${champ.championId}`;
  const showSlot: Record<'q' | 'w' | 'e' | 'r' | 'p', boolean> = {
    q: true,
    w: diff !== 'q-only',
    e: diff !== 'q-only',
    r: diff === 'all' || diff === 'no-passive',
    p: diff === 'all',
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: 'relative',
        background: 'rgba(13,11,8,0.6)',
        border: `1.5px solid ${AC.bone2}`,
        padding: 16,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
      }}
    >
      <div
        style={{
          minHeight: 110,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 8,
          background: 'rgba(0,0,0,0.35)',
          marginBottom: 10,
        }}
      >
        <SpellsLayout
          layout={layout}
          base={base}
          showSlot={showSlot}
          spellNames={champ.spellNames}
          passiveName={champ.passiveName}
        />
      </div>

      <div
        style={{
          fontFamily: AC_FONT_DISPLAY_HEAVY,
          fontWeight: 800,
          fontSize: 16,
          letterSpacing: '0.04em',
          textTransform: 'uppercase',
          color: revealed ? AC.shimmer : AC.bone2,
        }}
      >
        {revealed ? champ.championName : '???'}
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
        {revealed ? champ.championTitle : champ.championId}
      </div>
    </button>
  );
}

function Icon({
  src,
  title,
  size = 48,
}: {
  src: string;
  title: string;
  size?: number;
}) {
  return (
    <img
      src={src}
      alt={title}
      title={title}
      width={size}
      height={size}
      style={{
        display: 'block',
        width: size,
        height: size,
        border: `1px solid ${AC.bone2}`,
        background: '#0a0907',
      }}
    />
  );
}

function Placeholder({ size = 48 }: { size?: number }) {
  return (
    <div
      aria-hidden
      style={{
        width: size,
        height: size,
        border: `1px dashed ${AC.bone2}`,
        background: 'transparent',
        opacity: 0.3,
      }}
    />
  );
}

function SpellsLayout({
  layout,
  base,
  showSlot,
  spellNames,
  passiveName,
}: {
  layout: Layout;
  base: string;
  showSlot: Record<'q' | 'w' | 'e' | 'r' | 'p', boolean>;
  spellNames: { q: string; w: string; e: string; r: string };
  passiveName: string;
}) {
  const slots = (
    [
      ['q', spellNames.q],
      ['w', spellNames.w],
      ['e', spellNames.e],
      ['r', spellNames.r],
      ['p', passiveName],
    ] as const
  ).map(([slot, label]) => ({
    slot,
    label,
    src: `${base}/${slot}.png`,
  }));

  if (layout === 'row') {
    return (
      <div className="flex gap-2">
        {slots.map((s) =>
          showSlot[s.slot] ? (
            <Icon key={s.slot} src={s.src} title={s.label} size={48} />
          ) : (
            <Placeholder key={s.slot} size={48} />
          ),
        )}
      </div>
    );
  }

  if (layout === 'pyramid') {
    return (
      <div className="flex flex-col items-center gap-2">
        {showSlot.r ? (
          <Icon src={`${base}/r.png`} title={spellNames.r} size={56} />
        ) : (
          <Placeholder size={56} />
        )}
        <div className="flex gap-2">
          {showSlot.q ? (
            <Icon src={`${base}/q.png`} title={spellNames.q} size={44} />
          ) : (
            <Placeholder size={44} />
          )}
          {showSlot.w ? (
            <Icon src={`${base}/w.png`} title={spellNames.w} size={44} />
          ) : (
            <Placeholder size={44} />
          )}
          {showSlot.e ? (
            <Icon src={`${base}/e.png`} title={spellNames.e} size={44} />
          ) : (
            <Placeholder size={44} />
          )}
        </div>
        {showSlot.p ? (
          <Icon src={`${base}/p.png`} title={passiveName} size={36} />
        ) : (
          <Placeholder size={36} />
        )}
      </div>
    );
  }

  // big-passive : passif central, sorts en cercle (4 coins)
  return (
    <div
      style={{
        position: 'relative',
        width: 180,
        height: 130,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {showSlot.p ? (
          <Icon src={`${base}/p.png`} title={passiveName} size={56} />
        ) : (
          <Placeholder size={56} />
        )}
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        {showSlot.q ? (
          <Icon src={`${base}/q.png`} title={spellNames.q} size={40} />
        ) : (
          <Placeholder size={40} />
        )}
      </div>
      <div style={{ position: 'absolute', top: 0, right: 0 }}>
        {showSlot.w ? (
          <Icon src={`${base}/w.png`} title={spellNames.w} size={40} />
        ) : (
          <Placeholder size={40} />
        )}
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0 }}>
        {showSlot.e ? (
          <Icon src={`${base}/e.png`} title={spellNames.e} size={40} />
        ) : (
          <Placeholder size={40} />
        )}
      </div>
      <div style={{ position: 'absolute', bottom: 0, right: 0 }}>
        {showSlot.r ? (
          <Icon src={`${base}/r.png`} title={spellNames.r} size={40} />
        ) : (
          <Placeholder size={40} />
        )}
      </div>
    </div>
  );
}
