'use client';

import {
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { normalize } from '@/lib/beatEikichi/fuzzyMatch';

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
}

const MAX_SUGGESTIONS = 12;
/** Hauteur max du dropdown — ~5 items visibles, le reste atteignable via scroll. */
const DROPDOWN_MAX_HEIGHT_PX = 200;

export function AutocompleteInput({
  catalog,
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = 'Nom du jeu…',
  shakeKey = 0,
}: AutocompleteInputProps) {
  const [focused, setFocused] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
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

  // Reset highlight quand la liste change.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset index on list change is intentional
    setHighlighted(0);
  }, [suggestions.length]);

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
    // Assure le focus : utile si l'utilisateur a sélectionné via clic dans le dropdown.
    el.focus();
    return () => clearTimeout(t);
  }, [shakeKey]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length === 0) return;
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length === 0) return;
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focused && suggestions.length > 0 && highlighted >= 0) {
        onSubmit(suggestions[highlighted].name);
      } else if (value.trim().length > 0) {
        onSubmit(value);
      }
    } else if (e.key === 'Escape') {
      setFocused(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current);
            blurTimeoutRef.current = null;
          }
          setFocused(true);
        }}
        onBlur={() => {
          if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
          blurTimeoutRef.current = setTimeout(() => {
            setFocused(false);
            blurTimeoutRef.current = null;
          }, 120);
        }}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded-lg bg-purple-950/40 border border-purple-500/40 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:border-pink-400 transition disabled:opacity-60 disabled:cursor-not-allowed text-lg"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />

      {focused && suggestions.length > 0 && (
        <ul
          className="absolute z-10 left-0 right-0 mt-1 overflow-y-auto rounded-lg bg-[#1a0f2e] border border-purple-500/40 shadow-lg beat-eikichi-scroll"
          style={{ maxHeight: DROPDOWN_MAX_HEIGHT_PX }}
        >
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
              className={`px-4 py-2 cursor-pointer text-purple-100 ${
                i === highlighted
                  ? 'bg-purple-800/60'
                  : 'hover:bg-purple-900/40'
              }`}
            >
              {g.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
