import Link from 'next/link';
import { CreateRoomForm } from './components/CreateRoomForm';
import { JoinRoomForm } from './components/JoinRoomForm';
import { SOLO_GAMES } from './components/gameCatalog';
import {
  AC,
  AcCard,
  AcDisplay,
  AcDottedLabel,
  AcGlyph,
  AcGraffitiLayer,
  AcScreen,
  AcSectionNum,
  AcShim,
  AcSplat,
  AcSpray,
  AcStamp,
} from './components/arcane';

export default function Home() {
  return (
    <AcScreen>
      {/* Splats et spray positionnés pour déborder sans voler la place au contenu. */}
      <div style={{ position: 'absolute', top: -60, left: -80, pointerEvents: 'none' }}>
        <AcSplat color={AC.violet} size={520} opacity={0.6} seed={3} />
      </div>
      <div style={{ position: 'absolute', top: 140, right: -40, pointerEvents: 'none' }}>
        <AcSplat color={AC.shimmer} size={340} opacity={0.45} seed={1} />
      </div>
      <div style={{ position: 'absolute', bottom: 200, left: -40, pointerEvents: 'none' }}>
        <AcSpray color={AC.hex} size={300} seed={2} />
      </div>
      <AcGraffitiLayer density="heavy" />

      <div
        className="relative mx-auto px-5 sm:px-8 lg:px-12 py-6 sm:py-10"
        style={{ maxWidth: 1280 }}
      >
        {/* Topbar */}
        <header className="flex items-center justify-between mb-7 sm:mb-12">
          <div className="flex items-center gap-2.5">
            <AcGlyph kind="flame" color={AC.shimmer} size={22} />
            <span
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 11,
                letterSpacing: '0.25em',
                color: AC.bone2,
                textTransform: 'uppercase',
              }}
            >
              {'// le.bureau/v0.3'}
            </span>
          </div>
          <span
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              letterSpacing: '0.2em',
              color: AC.chem,
            }}
          >
            ● ONLINE
          </span>
        </header>

        {/* Hero */}
        <section className="relative mb-10 sm:mb-16">
          <AcDisplay
            style={{
              fontSize: 'clamp(42px, 8vw, 96px)',
              maxWidth: 980,
            }}
          >
            LA SALLE
            <br />
            <AcShim>DE PAUSE</AcShim>
          </AcDisplay>
          <div
            className="mt-4 sm:mt-5"
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 'clamp(13px, 1.4vw, 15px)',
              letterSpacing: '0.1em',
              color: AC.bone2,
              maxWidth: 760,
            }}
          >
            {"// mini-jeux punk pour vos soirées entre amis — pas d'inscription, pas de compte, juste un code et trois bières"}
          </div>
        </section>

        {/* Section 01 — MULTI JOUEURS : Create + Join */}
        <section className="mb-10 sm:mb-14">
          <div className="flex items-baseline gap-3 mb-5">
            <AcSectionNum n={1} />
            <h2
              className="m-0"
              style={{
                fontFamily:
                  "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(22px, 3vw, 30px)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                color: AC.bone,
              }}
            >
              MULTI <AcShim color={AC.shimmer}>JOUEURS</AcShim>
            </h2>
            <span
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 10,
                letterSpacing: '0.22em',
                color: AC.bone2,
                textTransform: 'uppercase',
              }}
            >
              {'// en room — avec des potes'}
            </span>
          </div>
          <div className="grid gap-7 lg:grid-cols-[1.25fr_1fr]">
            <AcCard fold drip dripColor={AC.shimmer} style={{ padding: 20 }}>
              <CreateRoomForm />
            </AcCard>

            <div className="relative">
              <AcCard fold={false} dashed style={{ padding: 20 }}>
                <JoinRoomForm />
              </AcCard>
              <div className="absolute z-10" style={{ top: -14, right: 20 }}>
                <AcStamp color={AC.gold} rotate={-6}>
                  {'// 42 rooms live'}
                </AcStamp>
              </div>
            </div>
          </div>
        </section>

        {/* Section 02 — SOLO : jeux quotidiens */}
        <section className="mb-12 sm:mb-20">
          <div className="flex items-baseline gap-3 mb-5 flex-wrap">
            <AcSectionNum n={2} />
            <h2
              className="m-0"
              style={{
                fontFamily:
                  "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                fontWeight: 800,
                fontSize: 'clamp(22px, 3vw, 30px)',
                letterSpacing: '0.02em',
                textTransform: 'uppercase',
                color: AC.bone,
              }}
            >
              MODE <AcShim color={AC.chem}>SOLO</AcShim>
            </h2>
            <span
              style={{
                fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                fontSize: 10,
                letterSpacing: '0.22em',
                color: AC.bone2,
                textTransform: 'uppercase',
              }}
            >
              {'// un puzzle par jour — clique et joue'}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SOLO_GAMES.map((g) => (
              <Link
                key={g.id}
                href={`/play/${g.id}`}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <AcCard
                  fold={false}
                  dashed
                  style={{
                    padding: 18,
                    cursor: 'pointer',
                    height: '100%',
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <AcGlyph kind={g.icon} color={g.color} size={22} />
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                        fontSize: 9,
                        letterSpacing: '0.22em',
                        color: g.color,
                        background: 'rgba(13,11,8,0.55)',
                        padding: '2px 6px',
                        border: `1px solid ${g.color}`,
                      }}
                    >
                      {g.tag}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily:
                        "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                      fontWeight: 800,
                      fontSize: 22,
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      color: AC.bone,
                      marginBottom: 4,
                    }}
                  >
                    {g.name}
                  </div>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                      fontSize: 11,
                      color: AC.bone2,
                      lineHeight: 1.5,
                    }}
                  >
                    {g.description}
                  </div>
                </AcCard>
              </Link>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mb-12 sm:mb-20">
          <div className="mb-7">
            <AcDottedLabel color={AC.bone2}>{'// COMMENT ÇA MARCHE'}</AcDottedLabel>
          </div>
          <div className="grid gap-5 sm:gap-7 md:grid-cols-3">
            {[
              {
                n: 1,
                title: 'CHOISIS TON JEU',
                desc: "Crée une room ou rejoins celle d'un pote avec un code à 6 caractères.",
                color: AC.shimmer,
                icon: 'ring' as const,
              },
              {
                n: 2,
                title: 'INVITE TES AMIS',
                desc: "Partage le code ou le lien. Jusqu'à 12 joueurs par room.",
                color: AC.chem,
                icon: 'link' as const,
              },
              {
                n: 3,
                title: 'JOUEZ',
                desc: "Parties de 5 à 15 minutes. Pas d'inscription. Pas de compte.",
                color: AC.gold,
                icon: 'play' as const,
              },
            ].map((s) => (
              <div
                key={s.n}
                className="relative"
                style={{ padding: 18, border: `1.5px dashed ${AC.bone2}` }}
              >
                <div className="flex items-center gap-3.5 mb-3">
                  <AcSectionNum n={s.n} />
                  <AcGlyph kind={s.icon} color={s.color} size={24} />
                </div>
                <div
                  style={{
                    fontFamily:
                      "'Barlow Condensed', 'Bebas Neue', 'Helvetica Neue', sans-serif",
                    fontWeight: 700,
                    fontSize: 18,
                    letterSpacing: '0.03em',
                    color: AC.bone,
                    marginBottom: 6,
                    textTransform: 'uppercase',
                  }}
                >
                  {s.title}
                </div>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                    fontSize: 12,
                    color: AC.bone2,
                    lineHeight: 1.55,
                  }}
                >
                  {s.desc}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer
          className="flex justify-between items-center pt-4 opacity-70"
          style={{ borderTop: `1.5px dashed ${AC.bone2}` }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              letterSpacing: '0.2em',
              color: AC.bone2,
            }}
          >
            {'// v0.3 — EOF'}
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              letterSpacing: '0.2em',
              color: AC.bone2,
            }}
          >
            {'// fait à la main à zaun'}
          </span>
        </footer>
      </div>
    </AcScreen>
  );
}
