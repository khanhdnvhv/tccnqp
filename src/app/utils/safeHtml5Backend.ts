import { HTML5Backend } from 'react-dnd-html5-backend';

/**
 * A wrapper around HTML5Backend that resets the singleton guard flag
 * before setup. This prevents "Cannot have two HTML5 backends at the
 * same time" crashes caused by HMR / React Strict Mode double-mounting
 * not properly calling teardown() before the next setup().
 */
export const SafeHTML5Backend: typeof HTML5Backend = (
  manager,
  context,
  options
) => {
  // Reset the stale flag so setup() won't throw on re-mount
  const win = (context as any)?.window ?? (typeof window !== 'undefined' ? window : undefined);
  if (win) {
    (win as any).__isReactDndBackendSetUp = false;
  }
  return HTML5Backend(manager, context, options);
};
