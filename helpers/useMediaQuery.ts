import { useCallback, useSyncExternalStore } from 'react';

/**
 * Tracks a CSS media query. Used to render the market as a table on
 * desktop and as cards on phones with a SINGLE DOM — Tailwind's
 * hidden/block trick would duplicate every control (and its test id
 * and accessible name) into two copies, one invisible.
 */
export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onStoreChange);
      return () => mql.removeEventListener('change', onStoreChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
};
