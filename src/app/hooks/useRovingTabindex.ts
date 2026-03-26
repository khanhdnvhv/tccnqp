import { useCallback } from 'react';

/**
 * WAI-ARIA Tabs roving tabindex pattern.
 * Returns tabIndex for each tab and an onKeyDown handler for the tablist.
 *
 * Usage:
 *   const { getTabIndex, handleTablistKeyDown } = useRovingTabindex(keys, activeKey, setActiveKey);
 *   <div role="tablist" onKeyDown={handleTablistKeyDown}>
 *     {keys.map(k => <button role="tab" tabIndex={getTabIndex(k)} ... />)}
 *   </div>
 */
export function useRovingTabindex<T extends string>(
  keys: T[],
  activeKey: T,
  setActiveKey: (key: T) => void,
) {
  const getTabIndex = useCallback(
    (key: T) => (key === activeKey ? 0 : -1),
    [activeKey],
  );

  const handleTablistKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const idx = keys.indexOf(activeKey);
      let nextIdx = -1;

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextIdx = (idx + 1) % keys.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextIdx = (idx - 1 + keys.length) % keys.length;
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextIdx = 0;
      } else if (e.key === 'End') {
        e.preventDefault();
        nextIdx = keys.length - 1;
      }

      if (nextIdx >= 0) {
        setActiveKey(keys[nextIdx]);
        // Focus the newly active tab button
        const tablist = e.currentTarget as HTMLElement;
        const tabs = tablist.querySelectorAll<HTMLElement>('[role="tab"]');
        tabs[nextIdx]?.focus();
      }
    },
    [keys, activeKey, setActiveKey],
  );

  return { getTabIndex, handleTablistKeyDown };
}
