'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

/**
 * Hook de persistance localStorage compatible SSR + lint strict.
 *
 * Contrairement au pattern `useState + useEffect(hydrate)` qui déclenche
 * `react-hooks/set-state-in-effect`, on s'appuie sur `useSyncExternalStore`
 * pour récupérer une snapshot synchrone du store externe (localStorage).
 *
 * Note : on ne subscribe qu'au storage event cross-onglet ; les modifs de
 * l'onglet courant sont re-lues à chaque render en passant par le hook
 * (acceptable vu la taille des payloads et la faible fréquence de rerender).
 */
export function usePersistedState<T>(
  key: string,
  defaultValue: T,
): [T, (next: T) => void] {
  const subscribe = useCallback(
    (cb: () => void) => {
      if (typeof window === 'undefined') return () => {};
      const handler = (e: StorageEvent) => {
        if (e.key === key) cb();
      };
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    },
    [key],
  );

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }, [key]);

  const getServerSnapshot = useCallback(() => null, []);

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo<T>(() => {
    if (raw === null) return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return defaultValue;
    }
  }, [raw, defaultValue]);

  const setValue = useCallback(
    (next: T) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
        // Dispatch un évènement local pour que useSyncExternalStore re-trigger
        // (le storage event natif ne se dispatch PAS dans l'onglet qui écrit).
        window.dispatchEvent(
          new StorageEvent('storage', { key, newValue: JSON.stringify(next) }),
        );
      } catch {
        /* ignore */
      }
    },
    [key],
  );

  return [value, setValue];
}
