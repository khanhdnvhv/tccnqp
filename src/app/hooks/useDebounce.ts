import { useState, useEffect } from 'react';

/**
 * Debounces a value by the specified delay.
 * Useful for search inputs to reduce expensive re-renders/filtering.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 250ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay = 250): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
