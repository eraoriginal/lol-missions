'use client';

import { useState } from 'react';

/**
 * /test/beat-eikichi-sim — Harnais de simulation multi-joueurs.
 *
 * Lance des scénarios server-side qui :
 *   - Créent une room jetable avec 7 joueurs (1 Eikichi + 6 réguliers)
 *   - Appellent les VRAIES routes API (pas des mocks)
 *   - Forcent des conditions de course extrêmes (Promise.all sur 7-50 calls)
 *   - Inspectent l'état final en DB
 *   - Cleanup la room
 *
 * Chaque scénario est isolé dans sa propre room (pas de collision entre tests).
 */

interface ScenarioResult {
  id: string;
  label: string;
  ok: boolean;
  details: string[];
  error?: string;
}

interface ApiResponse {
  summary?: { total: number; passed: number; failed: number };
  scenarios?: ScenarioResult[];
  error?: string;
}

export default function BeatEikichiSimPage() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'failed'>('all');

  const runAll = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch('/api/test/beat-eikichi-sim/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data: ApiResponse = await res.json();
      if (!res.ok) {
        setError(data.error || `HTTP ${res.status}`);
      } else {
        setResult(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  const runOne = async (scenarioId: string) => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch('/api/test/beat-eikichi-sim/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenarioId }),
      });
      const data: ApiResponse = await res.json();
      if (!res.ok) {
        setError(data.error || `HTTP ${res.status}`);
      } else {
        // Merge le résultat individuel dans le résultat global existant.
        setResult((prev) => {
          if (!prev?.scenarios || !data.scenarios) return data;
          const next = [...prev.scenarios];
          for (const s of data.scenarios) {
            const idx = next.findIndex((x) => x.id === s.id);
            if (idx >= 0) next[idx] = s;
            else next.push(s);
          }
          const passed = next.filter((s) => s.ok).length;
          return {
            summary: { total: next.length, passed, failed: next.length - passed },
            scenarios: next,
          };
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRunning(false);
    }
  };

  const visible = result?.scenarios?.filter((s) =>
    filter === 'all' ? true : !s.ok,
  );

  return (
    <main
      style={{
        minHeight: '100vh',
        background: '#0D0B08',
        color: '#F0E4C1',
        fontFamily: "'JetBrains Mono', 'Courier New', monospace",
        padding: '32px 24px 120px',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1
          style={{
            fontFamily: "'Barlow Condensed', 'Bebas Neue', sans-serif",
            fontSize: 38,
            fontWeight: 800,
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
            margin: 0,
            color: '#F0E4C1',
          }}
        >
          Beat Eikichi · Simulation multi-joueurs
        </h1>
        <p style={{ color: '#8A7A5C', fontSize: 13, marginTop: 8, marginBottom: 24 }}>
          {'// '}Crée 7 joueurs (1 Eikichi + 6) en DB, lance des conditions de course extrêmes via les vraies routes API, vérifie qu&apos;aucune question ne saute.
        </p>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          <button
            type="button"
            onClick={runAll}
            disabled={running}
            style={{
              padding: '10px 18px',
              background: '#FF3D8B',
              color: '#0D0B08',
              border: 'none',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: running ? 'wait' : 'pointer',
              opacity: running ? 0.55 : 1,
            }}
          >
            {running ? 'Exécution…' : 'Lancer tous les scénarios'}
          </button>

          {result?.summary && (
            <>
              <Stat label="total" value={result.summary.total} />
              <Stat
                label="passés"
                value={result.summary.passed}
                color={result.summary.failed === 0 ? '#12D6A8' : undefined}
              />
              <Stat
                label="échecs"
                value={result.summary.failed}
                color={result.summary.failed === 0 ? '#12D6A8' : '#C8441E'}
              />
              <button
                type="button"
                onClick={() => setFilter(filter === 'all' ? 'failed' : 'all')}
                style={{
                  padding: '6px 12px',
                  background: 'transparent',
                  color: '#F5B912',
                  border: '1.5px solid #F5B912',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  cursor: 'pointer',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Filtre: {filter === 'all' ? 'tout' : 'échecs uniquement'}
              </button>
            </>
          )}
        </div>

        {error && (
          <div
            style={{
              padding: 14,
              border: '2px solid #C8441E',
              color: '#C8441E',
              marginBottom: 24,
              fontSize: 13,
            }}
          >
            ✗ Erreur API : {error}
          </div>
        )}

        {visible && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {visible.map((s) => (
              <ScenarioCard key={s.id} scenario={s} onRerun={runOne} disabled={running} />
            ))}
            {visible.length === 0 && (
              <div style={{ color: '#8A7A5C', fontSize: 13 }}>
                {'// '}Aucun scénario à afficher avec ce filtre.
              </div>
            )}
          </div>
        )}

        {!result && !running && !error && (
          <div
            style={{
              padding: 20,
              border: '1.5px dashed #3a3226',
              color: '#8A7A5C',
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            <div style={{ color: '#12D6A8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {'// '}13 scénarios à exécuter
            </div>
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              <li>S1 — 7 joueurs /next en parallèle (race classique)</li>
              <li>S2 — Eikichi /submit + 6 /next concurrents (race Eikichi vs timeout)</li>
              <li>S3 — 7 /submit corrects en parallèle (all-found)</li>
              <li>S4 — Eikichi avec mauvaise réponse n&apos;avance pas</li>
              <li>S5 — Stale expectedIndex rejeté</li>
              <li>S6 — Spam 50× /next du même client</li>
              <li>S7 — Double-submit rejeté (Already answered)</li>
              <li>S8 — Tirs armes concurrents pendant avance</li>
              <li>S9 — 4 transitions consécutives sans skip</li>
              <li>S10 — F5 simulé : joueur récupère état frais après avance</li>
              <li>S11 — Contrat fuzzyMatch (variantes acceptées/rejetées)</li>
              <li>S12 — Tous mauvaises réponses → pas d&apos;avance</li>
              <li>S13 — Submit late : bonne réponse ne devient jamais faux negatif</li>
            </ul>
            <div style={{ marginTop: 14, color: '#5C5040', fontSize: 11 }}>
              ⚠ Chaque run crée et supprime des rooms en DB. Lance UNIQUEMENT en local / staging.
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color?: string }) {
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

function ScenarioCard({
  scenario,
  onRerun,
  disabled,
}: {
  scenario: ScenarioResult;
  onRerun: (id: string) => void;
  disabled: boolean;
}) {
  const borderColor = scenario.ok ? '#12D6A8' : '#C8441E';
  const tone = scenario.ok ? '#12D6A8' : '#C8441E';
  return (
    <div
      style={{
        padding: 14,
        border: `2px solid ${borderColor}`,
        background: scenario.ok ? 'rgba(18,214,168,0.05)' : 'rgba(200,68,30,0.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '3px 8px',
              background: tone,
              color: '#0D0B08',
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            {scenario.id}
          </span>
          <strong
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: 15,
              letterSpacing: '0.04em',
              color: '#F0E4C1',
              textTransform: 'uppercase',
            }}
          >
            {scenario.label}
          </strong>
          <span style={{ color: tone, fontWeight: 700, fontSize: 13 }}>
            {scenario.ok ? '✓ PASS' : '✗ FAIL'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onRerun(scenario.id)}
          disabled={disabled}
          style={{
            padding: '4px 10px',
            background: 'transparent',
            color: '#5EB8FF',
            border: '1.5px solid #5EB8FF',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            cursor: disabled ? 'wait' : 'pointer',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          ↻ relancer
        </button>
      </div>

      {scenario.details.length > 0 && (
        <ul
          style={{
            margin: '10px 0 0',
            padding: '0 0 0 4px',
            listStyle: 'none',
            fontSize: 11.5,
            lineHeight: 1.6,
            color: '#C8B89E',
          }}
        >
          {scenario.details.map((d, i) => (
            <li
              key={i}
              style={{
                color: d.startsWith('✓') ? '#12D6A8' : d.startsWith('✗') ? '#C8441E' : '#C8B89E',
              }}
            >
              {d}
            </li>
          ))}
        </ul>
      )}

      {scenario.error && (
        <div
          style={{
            marginTop: 10,
            padding: 8,
            background: '#1a0e0a',
            color: '#FF8866',
            fontSize: 11,
            border: '1px dashed #C8441E',
          }}
        >
          [crash] {scenario.error}
        </div>
      )}
    </div>
  );
}
