import { useState, useEffect } from 'react';

/**
 * Detects `prefers-reduced-data: reduce` media query.
 * Returns true if the user prefers reduced data usage (e.g. slow connection, data saver mode).
 * Charts and heavy visuals can be skipped when this returns true.
 */
export function useReducedData(): boolean {
  const [reducedData, setReducedData] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.matchMedia('(prefers-reduced-data: reduce)').matches;
    } catch (_e) {
      return false;
    }
  });

  useEffect(() => {
    let mql: MediaQueryList;
    try {
      mql = window.matchMedia('(prefers-reduced-data: reduce)');
    } catch (_e) {
      return;
    }
    const handler = (e: MediaQueryListEvent) => setReducedData(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return reducedData;
}
