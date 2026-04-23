'use client';

import {
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { normalize } from '@/lib/beatEikichi/fuzzyMatch';
import { AC, AC_CLIP } from '@/app/components/arcane';

export interface CatalogEntry {
  id: string;
  name: string;
  aliases: string[];
}

interface AutocompleteInputProps {
  catalog: CatalogEntry[];
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Incrément à chaque nouvelle mauvaise réponse : déclenche une animation de shake. */
  shakeKey?: number;
  /** Clé qui, quand elle change, reset l'état interne (highlight, navigation, dismissal).
   * À brancher sur `questionKey` du parent pour repartir propre à chaque nouvelle question
   * (utile notamment quand l'Eikichi coupe la question). */
  resetKey?: string | number;
  /** Si true, l'input est en état « erreur » (bordure rust). */
  error?: boolean;
}

const MAX_SUGGESTIONS = 12;
/** Hauteur max du dropdown — ~5 items visibles, le reste atteignable via scroll. */
const DROPDOWN_MAX_HEIGHT_PX = 220;

export function AutocompleteInput({
  catalog,
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = 'TAPE LE NOM DU JEU…',
  shakeKey = 0,
  resetKey,
  error,
}: AutocompleteInputProps) {
  const [focused, setFocused] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  // true UNIQUEMENT si l'utilisateur a bougé avec les flèches : garde-fou pour que
  // Enter ne vole pas la saisie littérale quand on tape le nom complet et que la
  // 1re suggestion est juste un préfixe (« Street Fighter » avant « Street Fighter II »).
  const [userNavigated, setUserNavigated] = useState(false);
  // Dismiss via Escape : cache le dropdown sans blur l'input ; rouvert dès la saisie.
  const [dismissed, setDismissed] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  // Garde le setTimeout du blur pour l'annuler si le focus revient entre-temps
  // (cas typique : mauvaise réponse → input disable pendant la fetch → browser blur,
  // puis le shake effect refocus. Sans annulation, le blur retardé gagnait la course).
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = useMemo(() => {
    const n = normalize(value);
    if (!n) return [];
    return catalog
      .filter((g) => {
        const candidates = [g.name, ...g.aliases];
        return candidates.some((c) => normalize(c).includes(n));
      })
      .slice(0, MAX_SUGGESTIONS);
  }, [catalog, value]);

  // Reset complet à chaque nouvelle question (resetKey = questionKey côté parent).
  // Indispensable quand l'Eikichi coupe la question : on ne veut ni highlight
  // résiduel, ni état « dismissed » qui survit à la question suivante.
  /* eslint-disable react-hooks/set-state-in-effect -- reset interne sur changement d'ID/value est intentionnel */
  useEffect(() => {
    setHighlighted(0);
    setUserNavigated(false);
    setDismissed(false);
  }, [resetKey]);

  // Reset highlight + navigation + dismiss dès que la saisie change : taper rouvre
  // toujours la liste et repart d'une sélection à 0 (sinon on peut submit la mauvaise
  // suggestion avec Enter après avoir changé le texte).
  useEffect(() => {
    setHighlighted(0);
    setUserNavigated(false);
    setDismissed(false);
  }, [value]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Scroll-into-view sur l'item highlighted (navigation clavier fluide quand la liste scroll).
  useEffect(() => {
    const el = itemRefs.current[highlighted];
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlighted]);

  // Déclenche l'animation de shake en re-posant la classe via DOM (sans re-mount,
  // sinon on perd le focus utilisateur).
  useEffect(() => {
    if (shakeKey === 0) return;
    const el = inputRef.current;
    if (!el) return;
    el.classList.remove('beat-eikichi-shake');
    // Force reflow pour que la nouvelle pose de la classe redémarre l'animation.
    void el.offsetWidth;
    el.classList.add('beat-eikichi-shake');
    const t = setTimeout(() => el.classList.remove('beat-eikichi-shake'), 400);
    // Assure le focus ET l'état `focused=true` : après une mauvaise réponse le
    // blur timer peut avoir fired pendant le fetch, et `.focus()` seul ne garantit
    // pas que `onFocus` se déclenche (iOS Safari async, race desktop). On force
    // donc l'état React explicitement, sinon le dropdown reste invisible.
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    el.focus();
    // eslint-disable-next-line react-hooks/set-state-in-effect -- force l'état `focused` après le refocus programmatique : crucial pour que la liste réapparaisse même si onFocus ne fire pas (iOS Safari async, race desktop)
    setFocused(true);
    setDismissed(false);
    return () => clearTimeout(t);
  }, [shakeKey]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setDismissed(false);
      if (suggestions.length === 0) return;
      setUserNavigated(true);
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setDismissed(false);
      if (suggestions.length === 0) return;
      setUserNavigated(true);
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Priorité à la saisie littérale : on ne soumet une suggestion que si
      // l'utilisateur l'a choisie explicitement via les flèches. Sinon il tape
      // "Street Fighter II" en entier et Enter soumet bien ça, pas la 1re suggestion.
      if (userNavigated && suggestions.length > 0 && highlighted >= 0) {
        onSubmit(suggestions[highlighted].name);
      } else if (value.trim().length > 0) {
        onSubmit(value);
      }
    } else if (e.key === 'Escape') {
      // Ferme la liste mais garde le focus : l'utilisateur peut continuer à taper.
      setDismissed(true);
    }
  };

  const showDropdown = focused && suggestions.length > 0 && !dismissed;
  const borderColor = error ? AC.rust : AC.bone;
  const normValue = normalize(value);

  return (
    <div className="relative">
      <div
        className="relative"
        style={{
          padding: '14px 16px',
          background: 'rgba(240,228,193,0.04)',
          boxShadow: `inset 0 0 0 2px ${borderColor}`,
          clipPath: AC_CLIP,
          opacity: disabled ? 0.65 : 1,
        }}
      >
        <span
          aria-hidden="true"
          style={{
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 11,
            color: AC.chem,
            letterSpacing: '0.2em',
            marginRight: 8,
          }}
        >
          &gt;
        </span>
        <input
          ref={inputRef}
          type="text"
          className="ac-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (blurTimeoutRef.current) {
              clearTimeout(blurTimeoutRef.current);
              blurTimeoutRef.current = null;
            }
            setFocused(true);
            setDismissed(false);
          }}
          onBlur={() => {
            // Ignore le blur quand l'input vient de passer en `disabled` (submit en cours) :
            // c'est un blur forcé par le navigateur, pas un blur utilisateur. Sans ça,
            // le timer ci-dessous finit par poser `focused=false` et la liste ne
            // réapparaît plus une fois la réponse rejetée. La closure capte la valeur
            // de `disabled` au render qui a posé ce onBlur ; comme React recrée le
            // handler à chaque commit, on voit bien `disabled=true` quand le browser
            // déclenche le blur à cause de la désactivation.
            if (disabled) return;
            if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
            blurTimeoutRef.current = setTimeout(() => {
              setFocused(false);
              blurTimeoutRef.current = null;
            }, 150);
          }}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: value ? AC.shimmer : AC.bone,
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 16,
            width: 'calc(100% - 40px)',
            letterSpacing: '0.05em',
          }}
        />
        {/* Curseur clignotant shimmer (décoration, n'empêche pas la saisie). */}
        {focused && !disabled && (
          <span
            className="ac-blink"
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: 2,
              height: 20,
              background: AC.shimmer,
              verticalAlign: 'middle',
            }}
          />
        )}
      </div>

      {showDropdown && (
        <div
          className="ac-scroll"
          style={{
            position: 'absolute',
            zIndex: 10,
            left: 0,
            right: 0,
            marginTop: 6,
            background: AC.ink2,
            boxShadow: `inset 0 0 0 1.5px ${AC.bone}`,
            maxHeight: DROPDOWN_MAX_HEIGHT_PX,
            overflowY: 'auto',
          }}
          // Empêche le blur de l'input si l'utilisateur clique dans la zone du dropdown
          // hors d'un <li> (ex : la scrollbar). Sinon la liste se ferme dès qu'on
          // essaie de scroller manuellement.
          onMouseDown={(e) => e.preventDefault()}
        >
          <div
            style={{
              padding: '6px 12px',
              borderBottom: `1.5px dashed ${AC.bone2}`,
              fontFamily: "'JetBrains Mono', 'Courier New', monospace",
              fontSize: 10,
              letterSpacing: '0.2em',
              color: AC.bone2,
              display: 'flex',
              justifyContent: 'space-between',
              textTransform: 'uppercase',
            }}
          >
            <span>
              {'// '}
              {suggestions.length}
              {' SUGGESTIONS · ↑↓ POUR NAVIGUER · ↵ POUR VALIDER'}
            </span>
            <span style={{ color: AC.chem }}>
              MATCH {highlighted + 1}/{suggestions.length}
            </span>
          </div>
          <ul className="list-none m-0 p-0">
            {suggestions.map((g, i) => (
              <li
                key={g.id}
                ref={(el) => {
                  itemRefs.current[i] = el;
                }}
                onMouseDown={(e) => {
                  // preventDefault évite de déplacer le focus vers le <li>.
                  e.preventDefault();
                  onSubmit(g.name);
                  // Sécurité : refocus explicite après le submit au cas où.
                  inputRef.current?.focus();
                }}
                onMouseEnter={() => setHighlighted(i)}
                style={{
                  padding: '8px 14px',
                  background: i === highlighted ? AC.shimmer : 'transparent',
                  color: i === highlighted ? AC.ink : AC.bone,
                  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                  fontSize: 13,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: `1px dotted rgba(240,228,193,0.1)`,
                  cursor: 'pointer',
                }}
              >
                <SuggestionLabel name={g.name} match={normValue} />
                {i === highlighted && (
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', 'Courier New', monospace",
                      fontSize: 9,
                      letterSpacing: '0.2em',
                      color: AC.ink,
                    }}
                  >
                    ↵ ENTRÉE
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Surligne en gras la portion du nom qui correspond au normalisé saisi, pour
 * aider l'utilisateur à voir pourquoi ce jeu matche. Cherche la 1re occurrence
 * du premier caractère normalisé dans le nom affiché (fallback : pas de highlight).
 */
function SuggestionLabel({ name, match }: { name: string; match: string }) {
  if (!match) return <span>{name}</span>;
  const lower = name.toLowerCase();
  const idx = lower.indexOf(match.toLowerCase());
  if (idx < 0) return <span>{name}</span>;
  return (
    <span>
      {name.slice(0, idx)}
      <strong style={{ fontWeight: 700 }}>
        {name.slice(idx, idx + match.length)}
      </strong>
      {name.slice(idx + match.length)}
    </span>
  );
}
