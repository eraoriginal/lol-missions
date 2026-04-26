'use client';

/**
 * Composant `<MatchCard>` partagé — utilisé par :
 *   - `app/test/lol-match-cards/page.tsx` (POC visuel + QA)
 *   - `app/games/quiz-ceo/components/QuestionPlayer.tsx` (catégorie
 *     `lol-player-match` du Quiz CEO)
 *   - `app/games/quiz-ceo/components/ReviewView.tsx` (correction par le créateur)
 *
 * Mécanique : on affiche une carte de match LoL réelle (champion, KDA,
 * items, summoner spells, victoire/défaite, durée, position) et le joueur
 * doit deviner qui a joué cette partie.
 */

import {
  formatCsPerMin,
  formatDuration,
  formatKDA,
  formatKp,
  getChampionPortraitPath,
  getItemIconPath,
  getSummonerSpellPath,
  type LolMatchCardData,
} from '@/lib/quizCeo/lolMatchCard';
import { AC, AC_FONT_DISPLAY_HEAVY, AC_FONT_MONO } from '@/app/components/arcane';

interface Props {
  data: LolMatchCardData;
  /** Si fourni, affiché en bas à droite (en mode review/leaderboard). */
  player?: string | null;
}

export function LolMatchCard({ data, player }: Props) {
  const accentColor = data.win ? AC.chem : AC.rust;
  const kdaRatio = formatKDA(data.kills, data.deaths, data.assists);
  const csPerMin = formatCsPerMin(data.cs, data.durationSec);
  const kp = formatKp(data.killParticipation);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        gap: 14,
        padding: 14,
        background: 'rgba(13,11,8,0.6)',
        border: `1.5px solid ${AC.bone2}`,
        borderLeft: `4px solid ${accentColor}`,
        flexWrap: 'wrap',
      }}
    >
      {/* Portrait + summoner spells */}
      <div className="flex items-center gap-2">
        <div
          style={{
            position: 'relative',
            width: 64,
            height: 64,
            background: '#0a0907',
            border: `1px solid ${AC.bone2}`,
            overflow: 'hidden',
          }}
        >
          <img
            src={getChampionPortraitPath(data.championId)}
            alt={data.championName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div className="flex flex-col gap-1">
          {data.summonerSpells.map((spellId, i) => (
            <Icon
              key={`spell-${i}`}
              src={getSummonerSpellPath(spellId)}
              size={28}
              alt={`spell-${spellId}`}
            />
          ))}
        </div>
      </div>

      {/* KDA + stats */}
      <div className="flex flex-col justify-center" style={{ minWidth: 180 }}>
        <div
          style={{
            fontFamily: AC_FONT_DISPLAY_HEAVY,
            fontWeight: 800,
            fontSize: 28,
            color: AC.bone,
            letterSpacing: '0.03em',
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          {data.kills}
          <span style={{ color: AC.bone2 }}> / </span>
          <span style={{ color: AC.rust }}>{data.deaths}</span>
          <span style={{ color: AC.bone2 }}> / </span>
          {data.assists}
        </div>
        <div
          style={{
            fontFamily: AC_FONT_MONO,
            fontSize: 11,
            color: AC.bone2,
            letterSpacing: '0.1em',
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: AC.bone, fontWeight: 700 }}>{kdaRatio}</span>
          {' KDA'}
          <br />
          {csPerMin} CS/m
          <br />
          {kp} KP
        </div>
      </div>

      {/* Items grid 4×2 */}
      <div className="flex-1 flex items-center justify-end">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 36px)',
            gridTemplateRows: 'repeat(2, 36px)',
            gap: 4,
          }}
        >
          {data.items.map((itemId, i) => (
            <Icon
              key={`item-${i}`}
              src={getItemIconPath(itemId)}
              size={36}
              alt={itemId === 0 ? 'empty' : `item-${itemId}`}
              empty={itemId === 0}
            />
          ))}
          <div />
        </div>
      </div>

      {/* Métadonnées + révélation joueur (optionnelle) */}
      <div
        className="flex flex-col justify-center items-end"
        style={{ minWidth: 140 }}
      >
        <div
          style={{
            fontFamily: AC_FONT_MONO,
            fontSize: 10,
            letterSpacing: '0.22em',
            color: accentColor,
            textTransform: 'uppercase',
            fontWeight: 800,
          }}
        >
          {data.win ? 'VICTOIRE' : 'DÉFAITE'}
        </div>
        <div
          style={{
            fontFamily: AC_FONT_MONO,
            fontSize: 10,
            color: AC.bone2,
            letterSpacing: '0.15em',
            marginBottom: 6,
          }}
        >
          {formatDuration(data.durationSec)}
          {data.position && data.position !== 'NONE'
            ? ` · ${data.position}`
            : ''}
        </div>
        {player && (
          <div
            style={{
              fontFamily: AC_FONT_DISPLAY_HEAVY,
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: AC.shimmer,
            }}
          >
            {player}
          </div>
        )}
      </div>
    </div>
  );
}

function Icon({
  src,
  size,
  alt,
  empty = false,
}: {
  src: string;
  size: number;
  alt: string;
  empty?: boolean;
}) {
  if (empty || !src) {
    return (
      <div
        style={{
          width: size,
          height: size,
          background: '#0a0907',
          border: `1px dashed ${AC.bone2}`,
          opacity: 0.4,
        }}
        aria-label={alt}
      />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        display: 'block',
        background: '#0a0907',
        border: `1px solid ${AC.bone2}`,
      }}
    />
  );
}
