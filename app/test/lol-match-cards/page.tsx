'use client';

import { useMemo, useState } from 'react';
import { LOL_PLAYER_MATCHES } from '@/lib/quizCeo/lolPlayerMatches';
import { LolMatchCard } from '@/app/games/quiz-ceo/components/LolMatchCard';
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
 * /test/lol-match-cards — POC visuel + harnais de QA pour la catégorie
 * Quiz CEO `lol-player-match`.
 *
 * Source : `lib/quizCeo/lolPlayerMatches.ts` (généré par
 * `npx tsx scripts/download-lol-match-history.ts`). Si vide, lance le DL.
 *
 * Filtres :
 *   - Par joueur (radio : tous / un seul)
 *   - Toggle révélation joueur (clic carte)
 */

export default function LolMatchCardsTestPage() {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [filterPlayer, setFilterPlayer] = useState<string>('ALL');

  const players = useMemo(() => {
    const counts = new Map<string, number>();
    for (const m of LOL_PLAYER_MATCHES) {
      counts.set(m.playerName, (counts.get(m.playerName) ?? 0) + 1);
    }
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, []);

  const matches = useMemo(() => {
    if (filterPlayer === 'ALL') return LOL_PLAYER_MATCHES;
    return LOL_PLAYER_MATCHES.filter((m) => m.playerName === filterPlayer);
  }, [filterPlayer]);

  const toggleReveal = (matchId: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(matchId)) next.delete(matchId);
      else next.add(matchId);
      return next;
    });
  };

  return (
    <AcScreen>
      <div className="mx-auto" style={{ maxWidth: 1100, padding: 32 }}>
        <div className="mb-6 flex items-center gap-3">
          <AcSectionNum n={'MAT'} />
          <AcDisplay style={{ fontSize: 36, lineHeight: 1 }}>
            LoL Match Cards — guess the player
          </AcDisplay>
        </div>

        <AcCard fold={false} dashed style={{ padding: 16, marginBottom: 24 }}>
          <div
            style={{
              fontFamily: AC_FONT_MONO,
              fontSize: 12,
              color: AC.bone2,
              lineHeight: 1.6,
              marginBottom: 12,
            }}
          >
            {'// '}
            {LOL_PLAYER_MATCHES.length} matches en catalogue ·{' '}
            {players.length} joueur(s) distinct(s). Données réelles tirées via
            la Riot Match v5 API (cf.{' '}
            {'`scripts/download-lol-match-history.ts`'}). Clique une carte pour
            révéler / masquer le joueur.
          </div>

          {LOL_PLAYER_MATCHES.length === 0 && (
            <div
              style={{
                fontFamily: AC_FONT_MONO,
                fontSize: 12,
                color: AC.gold,
                background: 'rgba(245,185,18,0.06)',
                border: `1.5px dashed ${AC.gold}`,
                padding: 12,
                marginBottom: 12,
              }}
            >
              {'// catalogue vide — lance d\'abord :'}
              <br />
              <code style={{ color: AC.bone, fontSize: 11 }}>
                npx tsx scripts/download-lol-match-history.ts --limit 50
              </code>
            </div>
          )}

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
            {'> filtrer par joueur'}
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterPill
              active={filterPlayer === 'ALL'}
              label={`TOUS (${LOL_PLAYER_MATCHES.length})`}
              onClick={() => setFilterPlayer('ALL')}
            />
            {players.map(([name, count]) => (
              <FilterPill
                key={name}
                active={filterPlayer === name}
                label={`${name} (${count})`}
                onClick={() => setFilterPlayer(name)}
              />
            ))}
          </div>
        </AcCard>

        <div className="flex flex-col gap-3">
          {matches.map((entry) => (
            <button
              key={entry.matchId}
              type="button"
              onClick={() => toggleReveal(entry.matchId)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 0,
                textAlign: 'left',
                cursor: 'pointer',
                width: '100%',
              }}
            >
              <LolMatchCard
                data={entry.data}
                player={revealed.has(entry.matchId) ? entry.playerName : null}
              />
            </button>
          ))}
          {matches.length === 0 && LOL_PLAYER_MATCHES.length > 0 && (
            <div
              style={{
                fontFamily: AC_FONT_MONO,
                fontSize: 12,
                color: AC.bone2,
                padding: 24,
                textAlign: 'center',
              }}
            >
              {'// aucun match pour ce filtre'}
            </div>
          )}
        </div>
      </div>
    </AcScreen>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
//  Sous-composants
// ═══════════════════════════════════════════════════════════════════════════

function FilterPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '6px 12px',
        background: active ? 'rgba(255,61,139,0.18)' : 'rgba(240,228,193,0.04)',
        border: active ? `2px solid ${AC.shimmer}` : `1.5px dashed ${AC.bone2}`,
        color: active ? AC.bone : AC.bone2,
        fontFamily: AC_FONT_DISPLAY_HEAVY,
        fontWeight: 800,
        fontSize: 12,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

// MatchCard + Icon extraits dans `app/games/quiz-ceo/components/LolMatchCard.tsx`
// (composant partagé avec QuestionPlayer + ReviewView).
