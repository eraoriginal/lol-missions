'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  AutocompleteInput,
  type CatalogEntry,
} from '@/app/games/beat-eikichi/components/AutocompleteInput';
import {
  WeaponEffectOverlay,
  isShielded,
  containerClassForEffect,
} from '@/app/games/beat-eikichi/components/WeaponEffectOverlay';
import { isAcceptedAnswer, computeCloseness } from '@/lib/beatEikichi/fuzzyMatch';
import type { BeatEikichiWeaponEvent } from '@/app/types/room';
import { WEAPONS } from '@/lib/beatEikichi/weapons';

/**
 * /test/beat-eikichi — harnais de QA pour la validation Beat Eikichi.
 *
 * Deux sections :
 *   1. BULK — pour chaque jeu du catalogue, génère une batterie de variantes
 *      d'écriture (casse, accents, romains ↔ arabes, "the", "&"/"and", alias,
 *      suffixes d'édition, typo) et roule `isAcceptedAnswer`. Affiche le taux
 *      de passage + la liste des échecs (utile pour détecter les cas où un
 *      alias manque, un suffixe n'est pas strippé, etc.).
 *   2. SANDBOX — AutocompleteInput réel alimenté par le catalogue, avec des
 *      contrôles pour simuler :
 *        - un changement de question à chaud (resetKey)
 *        - un shake (mauvaise réponse)
 *        - un Eikichi actif qui avance automatiquement
 *        - un effet d'arme par-dessus l'image
 *
 *  Cette page est volontairement hors flow (pas de room, pas de Pusher) : elle
 *  exerce uniquement la chaîne validation + UX de l'input.
 */

// ═══════════════════════════════════════════════════════════════════
//  VARIANTS
// ═══════════════════════════════════════════════════════════════════

interface Variant {
  label: string;
  input: string;
  expected: boolean;
}

const ROMAN_RE = /\b(II|III|IV|V|VI|VII|VIII|IX|X|XI|XII|XIII|XIV|XV|XVI|XVII|XVIII|XIX|XX)\b/;
const ROMAN_TO_ARABIC: Record<string, string> = {
  II: '2', III: '3', IV: '4', V: '5', VI: '6', VII: '7', VIII: '8',
  IX: '9', X: '10', XI: '11', XII: '12', XIII: '13', XIV: '14',
  XV: '15', XVI: '16', XVII: '17', XVIII: '18', XIX: '19', XX: '20',
};
const ARABIC_TO_ROMAN: Record<string, string> = Object.fromEntries(
  Object.entries(ROMAN_TO_ARABIC).map(([r, a]) => [a, r]),
);

const EDITION_RE =
  /\s*[-:–—(,]?\s*(?:hd\s+)?remaster(?:ed)?\b.*$|\s*[-:–—(,]\s*(?:maximum|definitive|complete|enhanced|collector'?s?|goty|game of the year|anniversary|deluxe|gold|hd|legendary|ultimate|special|standard)\s+edition\b.*$/i;

/**
 * Génère les variantes testables pour un jeu. L'intention de chaque variante
 * (expected: true/false) est codée directement — c'est le contrat que
 * `isAcceptedAnswer` doit respecter.
 */
function generateVariants(game: CatalogEntry): Variant[] {
  const variants: Variant[] = [];
  const name = game.name;

  variants.push({ label: 'canonical', input: name, expected: true });
  variants.push({ label: 'lowercase', input: name.toLowerCase(), expected: true });
  variants.push({ label: 'uppercase', input: name.toUpperCase(), expected: true });
  variants.push({ label: 'padded', input: `  ${name}  `, expected: true });
  variants.push({ label: 'ponctuation-extra', input: `${name}!`, expected: true });

  // « The » en préfixe : toggle
  if (/^the\s+/i.test(name)) {
    variants.push({
      label: 'drop-the',
      input: name.replace(/^the\s+/i, ''),
      expected: true,
    });
  } else {
    variants.push({ label: 'add-the', input: `The ${name}`, expected: true });
  }

  // Accents / diacritiques
  const stripped = name.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (stripped !== name) {
    variants.push({ label: 'no-accents', input: stripped, expected: true });
  }

  // Romain → arabe
  const romanMatch = ROMAN_RE.exec(name);
  if (romanMatch) {
    const roman = romanMatch[0].toUpperCase();
    variants.push({
      label: `roman→arabic(${roman})`,
      input: name.replace(ROMAN_RE, ROMAN_TO_ARABIC[roman]),
      expected: true,
    });
  }

  // Arabe isolé → romain (ex. "Street Fighter 2" → "Street Fighter II").
  // - Ne prend que les chiffres 2..20 (intersection avec la mappe).
  // - Exige que le caractère précédent ne soit NI un chiffre NI une lettre
  //   romaine isolée (sinon on colle deux romains : « Sniper Elite V2 » →
  //   « Sniper Elite VII » qui vaut 7, pas 2). On exclut I/V/X minuscules et
  //   majuscules collés au chiffre.
  const arabicMatch = /(^|[^0-9ivxIVX])(2|3|4|5|6|7|8|9|10|11|12|13|14|15|16|17|18|19|20)(?![0-9])/.exec(name);
  if (arabicMatch && !romanMatch) {
    const num = arabicMatch[2];
    variants.push({
      label: `arabic→roman(${num})`,
      input: name.replace(arabicMatch[0], `${arabicMatch[1]}${ARABIC_TO_ROMAN[num]}`),
      expected: true,
    });
  }

  // Esperluette
  if (name.includes('&')) {
    variants.push({ label: '&→and', input: name.replace(/&/g, 'and'), expected: true });
  }
  if (/\band\b/i.test(name)) {
    variants.push({
      label: 'and→&',
      input: name.replace(/\band\b/gi, '&'),
      expected: true,
    });
  }

  // Suffixe d'édition : tester que la version nue est acceptée
  if (EDITION_RE.test(name)) {
    const withoutEdition = name.replace(EDITION_RE, '').trim();
    if (withoutEdition && withoutEdition !== name) {
      variants.push({
        label: 'strip-edition',
        input: withoutEdition,
        expected: true,
      });
    }
  }

  // Aliases : retirés du catalogue depuis la refonte IGDB (CLAUDE.md : « Seul
  // le nom canonique fait foi »). Plus de tests d'aliases ici.

  // Typo — doit échouer (Levenshtein strict côté validation).
  // On drop un caractère *alphanumérique* (pas un espace/ponctuation, sinon
  // le normalize strippe tout pareil et le match passe, ce qui fausse le test).
  const alphanumIndex = name.split('').findIndex((c, i) => i > 2 && /[a-z0-9]/i.test(c));
  if (alphanumIndex > 2) {
    const typo = name.slice(0, alphanumIndex) + name.slice(alphanumIndex + 1);
    variants.push({ label: 'typo-drop-char', input: typo, expected: false });
  }

  // Chaîne vide
  variants.push({ label: 'empty', input: '', expected: false });

  return variants;
}

// ═══════════════════════════════════════════════════════════════════
//  BULK TEST
// ═══════════════════════════════════════════════════════════════════

interface BulkFailure {
  gameId: string;
  gameName: string;
  variantLabel: string;
  input: string;
  expected: boolean;
  actual: boolean;
}

interface BulkResult {
  totalGames: number;
  totalTests: number;
  passed: number;
  failed: number;
  failures: BulkFailure[];
  durationMs: number;
}

function runBulkTests(catalog: CatalogEntry[]): BulkResult {
  const t0 = performance.now();
  let passed = 0;
  let failed = 0;
  let totalTests = 0;
  const failures: BulkFailure[] = [];

  for (const game of catalog) {
    const variants = generateVariants(game);
    for (const v of variants) {
      totalTests++;
      const actual = isAcceptedAnswer(v.input, game.name);
      if (actual === v.expected) {
        passed++;
      } else {
        failed++;
        if (failures.length < 200) {
          failures.push({
            gameId: game.id,
            gameName: game.name,
            variantLabel: v.label,
            input: v.input,
            expected: v.expected,
            actual,
          });
        }
      }
    }
  }

  return {
    totalGames: catalog.length,
    totalTests,
    passed,
    failed,
    failures,
    durationMs: performance.now() - t0,
  };
}

// ═══════════════════════════════════════════════════════════════════
//  PAGE
// ═══════════════════════════════════════════════════════════════════

export default function BeatEikichiTestPage() {
  const [catalog, setCatalog] = useState<CatalogEntry[] | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [bulk, setBulk] = useState<BulkResult | null>(null);
  const [bulkRunning, setBulkRunning] = useState(false);
  const [filterFailure, setFilterFailure] = useState('');

  // Charge le catalogue une fois.
  useEffect(() => {
    let alive = true;
    // no-store pour toujours voir la DB à jour pendant la QA (le endpoint renvoie
    // `Cache-Control: max-age=3600` ce qui piège les tests après cleanup).
    fetch('/api/games/beat-eikichi/TEST/catalog', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        if (Array.isArray(d.games)) setCatalog(d.games);
        else setCatalogError('Bad response shape');
      })
      .catch((e) => {
        if (alive) setCatalogError(String(e));
      });
    return () => {
      alive = false;
    };
  }, []);

  const runBulk = useCallback(() => {
    if (!catalog) return;
    setBulkRunning(true);
    // Laisse React peindre l'état "running" avant de bloquer le thread.
    setTimeout(() => {
      const result = runBulkTests(catalog);
      setBulk(result);
      setBulkRunning(false);
    }, 20);
  }, [catalog]);

  const filteredFailures = useMemo(() => {
    if (!bulk) return [];
    if (!filterFailure) return bulk.failures;
    const n = filterFailure.toLowerCase();
    return bulk.failures.filter(
      (f) =>
        f.gameName.toLowerCase().includes(n) ||
        f.input.toLowerCase().includes(n) ||
        f.variantLabel.toLowerCase().includes(n),
    );
  }, [bulk, filterFailure]);

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0D0B08',
        color: '#F0E4C1',
        fontFamily:
          "'JetBrains Mono', 'Courier New', monospace",
        padding: '32px 24px 120px',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1
          style={{
            fontFamily:
              "'Barlow Condensed', 'Bebas Neue', sans-serif",
            fontSize: 40,
            fontWeight: 800,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            margin: 0,
          }}
        >
          Beat Eikichi · Test de validation
        </h1>
        <p style={{ color: '#8A7A5C', fontSize: 13, marginTop: 8 }}>
          {'// '}
          Hors flow. Exerce `isAcceptedAnswer` + UX de l&apos;input.
        </p>

        <Section title="1. Bulk — variantes d'écriture sur tout le catalogue">
          {catalogError && (
            <div style={{ color: '#C8441E' }}>
              Erreur catalogue : {catalogError}
            </div>
          )}
          {!catalog && !catalogError && <div>Chargement du catalogue…</div>}
          {catalog && (
            <>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={runBulk}
                  disabled={bulkRunning}
                  style={btnStyle('#FF3D8B')}
                >
                  {bulkRunning ? 'En cours…' : `Lancer les tests sur ${catalog.length} jeux`}
                </button>
                {bulk && <Stat label="jeux" value={bulk.totalGames} />}
                {bulk && <Stat label="tests" value={bulk.totalTests} />}
                {bulk && (
                  <Stat
                    label="passés"
                    value={bulk.passed}
                    color={bulk.failed === 0 ? '#12D6A8' : undefined}
                  />
                )}
                {bulk && (
                  <Stat
                    label="échecs"
                    value={bulk.failed}
                    color={bulk.failed === 0 ? '#12D6A8' : '#C8441E'}
                  />
                )}
                {bulk && (
                  <Stat label="durée" value={`${Math.round(bulk.durationMs)}ms`} />
                )}
              </div>
              {bulk && bulk.failures.length > 0 && (
                <>
                  <input
                    type="text"
                    value={filterFailure}
                    onChange={(e) => setFilterFailure(e.target.value)}
                    placeholder="Filtrer les échecs (jeu / input / label)…"
                    style={inputStyle}
                  />
                  <div
                    style={{
                      marginTop: 10,
                      color: '#8A7A5C',
                      fontSize: 11,
                    }}
                  >
                    {'// '}
                    {filteredFailures.length} / {bulk.failures.length} visibles
                    {bulk.failures.length >= 200 &&
                      ' (capé à 200 premiers)'}
                  </div>
                  <FailureTable failures={filteredFailures} />
                </>
              )}
              {bulk && bulk.failures.length === 0 && (
                <div style={{ color: '#12D6A8', marginTop: 10 }}>
                  ✓ Tous les tests passent.
                </div>
              )}
            </>
          )}
        </Section>

        <Section title="2. Sandbox — interaction & animations">
          {catalog && <Sandbox catalog={catalog} />}
        </Section>
      </div>
    </main>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  COMPONENTS
// ═══════════════════════════════════════════════════════════════════

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section
      style={{
        marginTop: 40,
        border: '1.5px dashed #8A7A5C',
        padding: 20,
      }}
    >
      <h2
        style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: 22,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          margin: '0 0 16px',
          color: '#12D6A8',
        }}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  return (
    <div
      style={{
        padding: '6px 12px',
        border: `1.5px solid ${color ?? '#8A7A5C'}`,
        fontSize: 12,
      }}
    >
      <span style={{ color: '#8A7A5C' }}>{label}: </span>
      <strong style={{ color: color ?? '#F0E4C1' }}>{value}</strong>
    </div>
  );
}

function FailureTable({ failures }: { failures: BulkFailure[] }) {
  if (failures.length === 0) {
    return (
      <div style={{ color: '#8A7A5C', marginTop: 10 }}>Aucun échec visible.</div>
    );
  }
  return (
    <div style={{ marginTop: 12, overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 11,
        }}
      >
        <thead>
          <tr style={{ color: '#8A7A5C', textAlign: 'left' }}>
            <th style={thStyle}>Jeu</th>
            <th style={thStyle}>Variante</th>
            <th style={thStyle}>Input</th>
            <th style={thStyle}>Attendu</th>
            <th style={thStyle}>Obtenu</th>
          </tr>
        </thead>
        <tbody>
          {failures.map((f, i) => (
            <tr
              key={i}
              style={{ borderTop: '1px dashed #3a3226' }}
            >
              <td style={tdStyle}>{f.gameName}</td>
              <td style={{ ...tdStyle, color: '#F5B912' }}>{f.variantLabel}</td>
              <td style={{ ...tdStyle, color: '#FF3D8B' }}>
                {JSON.stringify(f.input)}
              </td>
              <td style={tdStyle}>{f.expected ? 'match' : 'no match'}</td>
              <td style={{ ...tdStyle, color: '#C8441E' }}>
                {f.actual ? 'match' : 'no match'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  SANDBOX
// ═══════════════════════════════════════════════════════════════════

const ALL_WEAPONS = ['(aucune)', ...WEAPONS.map((w) => w.id)] as const;

function Sandbox({ catalog }: { catalog: CatalogEntry[] }) {
  // Cherche une image valide avec /catalog n'étant pas disponible ici, on se
  // rabat sur une image statique pour les tests visuels.
  const fakeImageUrl =
    'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Example.svg/600px-Example.svg.png';

  const [questionIndex, setQuestionIndex] = useState(0);
  const [targetGameId, setTargetGameId] = useState<string>(
    () => catalog[0]?.id ?? '',
  );
  const [input, setInput] = useState('');
  const [lastResult, setLastResult] = useState<{
    text: string;
    correct: boolean;
    closeness?: 'close' | 'medium' | 'far';
    ts: number;
  } | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [error, setError] = useState(false);
  const [eikichiMode, setEikichiMode] = useState(false);
  const [activeWeapon, setActiveWeapon] = useState<string>('(aucune)');
  // Horodatage de référence figé au mount : évite Date.now() pendant le render
  // (pure render rule). L'effet est considéré comme déjà déclenché par rapport
  // à ce t0, donc toujours actif tant que activeWeapon est sélectionné.
  const [t0Ms] = useState(() => Date.now());
  // Timer "simulé" : le joueur peut choisir une durée et redémarrer un timer
  // pour voir les effets qui dépendent du temps (ex. Acide qui grandit).
  const [timerSeconds, setTimerSeconds] = useState<number>(30);
  const [questionStartedAtMs, setQuestionStartedAtMs] = useState<number>(
    () => Date.now(),
  );

  const targetGame = useMemo(
    () => catalog.find((g) => g.id === targetGameId) ?? catalog[0],
    [catalog, targetGameId],
  );

  const resetKey = `q-${questionIndex}`;
  const myPlayerId = 'SANDBOX_PLAYER';

  // Événements d'arme synthétiques pour piloter WeaponEffectOverlay.
  const weaponEvents = useMemo<BeatEikichiWeaponEvent[]>(() => {
    if (activeWeapon === '(aucune)') return [];
    return [
      {
        id: 'fx-test',
        gameId: 'sandbox',
        firedByPlayerId: 'ghost',
        targetPlayerId: myPlayerId,
        weaponId: activeWeapon,
        questionIndex,
        firedAt: new Date(t0Ms).toISOString(),
        data: null,
      } as unknown as BeatEikichiWeaponEvent,
    ];
  }, [activeWeapon, questionIndex, t0Ms]);

  const handleSubmit = useCallback(
    (text: string) => {
      if (!targetGame) return;
      const correct = isAcceptedAnswer(text, targetGame.name);
      if (!correct) {
        const closeness = computeCloseness(text, targetGame.name);
        setShakeKey((k) => k + 1);
        setError(true);
        setLastResult({ text, correct, closeness, ts: Date.now() });
      } else {
        setError(false);
        setLastResult({ text, correct, ts: Date.now() });
        if (eikichiMode) {
          // Simule l'avance automatique Eikichi : on change de question
          // immédiatement, ce qui doit reset l'input + dropdown via resetKey.
          setQuestionIndex((q) => q + 1);
          setInput('');
        }
      }
    },
    [targetGame, eikichiMode],
  );

  const nextQuestion = () => {
    setQuestionIndex((q) => q + 1);
    setInput('');
    setError(false);
  };

  // Raccourci : "shake" manuel sans submit.
  const triggerShake = () => {
    setShakeKey((k) => k + 1);
    setError(true);
  };

  // Pour l'évaluation : le refire est toujours considéré comme passé (t0 + 1s).
  // Pas besoin de Date.now() pendant le render.
  const containerClass = containerClassForEffect(
    weaponEvents,
    myPlayerId,
    questionIndex,
    t0Ms + 1000,
  );
  const shielded = isShielded(weaponEvents, myPlayerId, questionIndex);

  return (
    <div style={{ display: 'grid', gap: 24, gridTemplateColumns: '1fr 1fr' }}>
      {/* Colonne gauche : contrôles + résultat */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={labelStyle}>
          <span style={{ color: '#8A7A5C' }}>Jeu cible (question actuelle)</span>
          <select
            value={targetGame?.id ?? ''}
            onChange={(e) => setTargetGameId(e.target.value)}
            style={inputStyle}
          >
            {catalog.slice(0, 500).map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={nextQuestion}
            style={btnStyle('#5EB8FF')}
          >
            Question suivante (+resetKey)
          </button>
          <button
            type="button"
            onClick={triggerShake}
            style={btnStyle('#F5B912')}
          >
            Forcer shake
          </button>
        </div>

        <label style={labelStyle}>
          <input
            type="checkbox"
            checked={eikichiMode}
            onChange={(e) => setEikichiMode(e.target.checked)}
          />
          <span>
            Je suis <strong>Eikichi</strong> (bonne réponse → avance
            automatique)
          </span>
        </label>

        <label style={labelStyle}>
          <span style={{ color: '#8A7A5C' }}>Effet d&apos;arme actif sur l&apos;image</span>
          <select
            value={activeWeapon}
            onChange={(e) => {
              setActiveWeapon(e.target.value);
              // Redémarre le timer à chaque changement d'arme pour que les
              // effets dépendant du temps (Acide) repartent de zéro.
              setQuestionStartedAtMs(Date.now());
            }}
            style={inputStyle}
          >
            {ALL_WEAPONS.map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
        </label>

        <label style={labelStyle}>
          <span style={{ color: '#8A7A5C' }}>Durée du timer (secondes)</span>
          <input
            type="number"
            min={10}
            max={300}
            value={timerSeconds}
            onChange={(e) =>
              setTimerSeconds(Math.max(10, parseInt(e.target.value, 10) || 30))
            }
            style={inputStyle}
          />
        </label>

        <button
          type="button"
          onClick={() => setQuestionStartedAtMs(Date.now())}
          style={btnStyle('#12D6A8')}
        >
          Redémarrer le timer (Acide)
        </button>

        <div
          style={{
            padding: 10,
            border: '1.5px dashed #3a3226',
            fontSize: 12,
            color: '#8A7A5C',
          }}
        >
          <div>questionIndex: <strong style={{ color: '#F0E4C1' }}>{questionIndex}</strong></div>
          <div>resetKey: <strong style={{ color: '#F0E4C1' }}>{resetKey}</strong></div>
          <div>shakeKey: <strong style={{ color: '#F0E4C1' }}>{shakeKey}</strong></div>
          <div>error: <strong style={{ color: '#F0E4C1' }}>{String(error)}</strong></div>
          <div>eikichi: <strong style={{ color: '#F0E4C1' }}>{String(eikichiMode)}</strong></div>
          <div>weapon: <strong style={{ color: '#F0E4C1' }}>{activeWeapon}</strong></div>
        </div>

        {lastResult && (
          <div
            style={{
              padding: 10,
              border: `2px solid ${lastResult.correct ? '#12D6A8' : '#C8441E'}`,
              fontSize: 13,
            }}
          >
            <div style={{ color: '#8A7A5C', fontSize: 10 }}>
              {'// '}dernier submit @ {new Date(lastResult.ts).toLocaleTimeString()}
            </div>
            <div style={{ marginTop: 6 }}>
              input: <code style={{ color: '#FF3D8B' }}>{JSON.stringify(lastResult.text)}</code>
            </div>
            <div>
              résultat:{' '}
              <strong style={{ color: lastResult.correct ? '#12D6A8' : '#C8441E' }}>
                {lastResult.correct ? 'CORRECT' : 'FAUX'}
              </strong>
              {!lastResult.correct && lastResult.closeness && (
                <>
                  {' '}(proximité:{' '}
                  <span style={{ color: '#F5B912' }}>{lastResult.closeness}</span>)
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Colonne droite : AutocompleteInput + image + overlay d'arme */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <AutocompleteInput
          catalog={catalog}
          value={input}
          onChange={(v) => {
            setInput(v);
            if (error) setError(false);
          }}
          onSubmit={handleSubmit}
          shakeKey={shakeKey}
          resetKey={resetKey}
          error={error}
        />

        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16 / 10',
            background: '#1A160F',
            overflow: 'hidden',
            border: '2px solid #8A7A5C',
          }}
        >
          <img
            src={fakeImageUrl}
            alt="Sandbox test image"
            className={`w-full h-full object-contain ${containerClass}`}
            style={{ pointerEvents: 'none' }}
          />
          <WeaponEffectOverlay
            events={weaponEvents}
            myPlayerId={myPlayerId}
            currentQuestionIndex={questionIndex}
            imageUrl={fakeImageUrl}
            questionStartedAt={new Date(questionStartedAtMs).toISOString()}
            timerSeconds={timerSeconds}
          />
          {shielded && (
            <div
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                padding: '4px 8px',
                background: '#5EB8FF',
                color: '#0D0B08',
                fontSize: 10,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
              }}
            >
              SHIELDED
            </div>
          )}
        </div>

        <div
          style={{
            padding: 10,
            border: '1.5px dashed #3a3226',
            fontSize: 11,
            color: '#8A7A5C',
            lineHeight: 1.55,
          }}
        >
          <div>
            {'// '}Tape une variante puis Enter. Le shake + flag error se déclenchent
            sur faux, les suggestions se filtrent en direct.
          </div>
          <div>
            {'// '}Change la question pendant que tu tapes : l&apos;input et la
            liste doivent se reset (resetKey).
          </div>
          <div>
            {'// '}Active un effet d&apos;arme : l&apos;overlay se monte par-dessus
            l&apos;image sans bloquer la saisie.
          </div>
        </div>

        <div
          style={{
            padding: 10,
            border: '1.5px solid #FF3D8B',
            fontSize: 11,
            color: '#F0E4C1',
            lineHeight: 1.55,
            background: 'rgba(255,61,139,0.05)',
          }}
        >
          <div style={{ color: '#FF3D8B', fontWeight: 700, marginBottom: 6 }}>
            {'// '}SCENARIOS DE NON-RÉGRESSION (à passer après toute modif AutocompleteInput)
          </div>
          <div>
            <strong style={{ color: '#12D6A8' }}>S1 — Souris ne vole pas la sélection clavier :</strong>
            <br />
            1. Tape <code>halo</code> · 2. ↓↓ (highlighted=2) · 3. bouge la
            souris sur l&apos;item 4 SANS cliquer · 4. Entrée → doit soumettre
            l&apos;item 2 (sélection clavier).
          </div>
          <div>
            <strong style={{ color: '#12D6A8' }}>S2 — Mouse mode après mousemove explicite :</strong>
            <br />
            1. Tape <code>halo</code> · 2. déplace la souris (vrai mousemove)
            sur l&apos;item 4 · 3. Entrée → doit soumettre la saisie littérale
            <code> halo</code> (userNavigated=false). Pour soumettre l&apos;item,
            il faut cliquer.
          </div>
          <div>
            <strong style={{ color: '#12D6A8' }}>S3 — Saisie pendant nav clavier :</strong>
            <br />
            1. Tape <code>halo</code> · 2. ↓↓↓↓↓ (h=5) · 3. ajoute
            <code> 2</code> à la saisie (suggestions filtrées) · 4. Entrée → doit
            soumettre <code>halo 2</code> littéral (highlighted reset à 0,
            userNavigated=false).
          </div>
          <div>
            <strong style={{ color: '#12D6A8' }}>S4 — Pas de crash hors bornes :</strong>
            <br />
            Forcer une situation où highlighted &gt; suggestions.length-1 ne
            doit jamais crasher (garde-fou explicite dans le handler Enter).
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════════════════

const inputStyle: React.CSSProperties = {
  padding: '8px 10px',
  background: 'rgba(240,228,193,0.05)',
  border: '1.5px solid #8A7A5C',
  color: '#F0E4C1',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 13,
  marginTop: 4,
  width: '100%',
};

const labelStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  fontSize: 12,
};

const thStyle: React.CSSProperties = {
  padding: '6px 8px',
  borderBottom: '1.5px solid #8A7A5C',
};

const tdStyle: React.CSSProperties = {
  padding: '4px 8px',
  verticalAlign: 'top',
};

function btnStyle(color: string): React.CSSProperties {
  return {
    padding: '8px 14px',
    background: color,
    color: '#0D0B08',
    border: 'none',
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    cursor: 'pointer',
  };
}
