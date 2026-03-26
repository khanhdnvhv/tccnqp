import { useEffect, useRef } from 'react';

/**
 * Saves the currently focused element when `isOpen` becomes true,
 * and restores focus to that element when `isOpen` becomes false.
 * Follows WAI-ARIA dialog focus management best practices.
 */
export function useFocusReturn(isOpen: boolean) {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Save the element that triggered the modal
      triggerRef.current = document.activeElement as HTMLElement | null;
    } else if (triggerRef.current) {
      // Restore focus to trigger when modal closes
      const el = triggerRef.current;
      // Small delay to allow DOM updates after modal unmounts
      requestAnimationFrame(() => {
        if (el && typeof el.focus === 'function' && document.contains(el)) {
          el.focus();
        }
      });
      triggerRef.current = null;
    }
  }, [isOpen]);
}
