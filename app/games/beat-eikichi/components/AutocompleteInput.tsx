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
  /** Déclenche une petite animation de "shake" quand la valeur change. */
  shakeKey?: number;
}

const MAX_SUGGESTIONS = 5;

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
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 120)}
        disabled={disabled}
        placeholder={placeholder}
        key={shakeKey} // re-mount ne simule pas un shake proprement ; on se base sur la classe ci-dessous
        className={`w-full px-4 py-3 rounded-lg bg-purple-950/40 border border-purple-500/40 text-purple-100 placeholder-purple-400/50 focus:outline-none focus:border-pink-400 transition disabled:opacity-60 disabled:cursor-not-allowed text-lg ${
          shakeKey > 0 ? 'beat-eikichi-shake' : ''
        }`}
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />

      {focused && suggestions.length > 0 && (
        <ul className="absolute z-10 left-0 right-0 mt-1 max-h-64 overflow-auto rounded-lg bg-[#1a0f2e] border border-purple-500/40 shadow-lg">
          {suggestions.map((g, i) => (
            <li
              key={g.id}
              onMouseDown={(e) => {
                e.preventDefault();
                onSubmit(g.name);
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
