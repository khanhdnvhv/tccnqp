import { useState, useCallback, useEffect, useRef } from 'react';

export interface ColumnDef<K extends string> {
  key: K;
  label: string;
  required?: boolean;
}

interface UseColumnVisibilityOptions<K extends string> {
  storageKey: string;
  columns: ColumnDef<K>[];
}

export function useColumnVisibility<K extends string>({ storageKey, columns }: UseColumnVisibilityOptions<K>) {
  const fullKey = `colvis_${storageKey}`;

  const [hiddenCols, setHiddenCols] = useState<Set<K>>(() => {
    try {
      const stored = localStorage.getItem(fullKey);
      if (stored) return new Set(JSON.parse(stored) as K[]);
    } catch (_e) { /* ignore */ }
    return new Set();
  });

  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState('');
  const typeAheadRef = useRef('');
  const typeAheadTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(fullKey, JSON.stringify([...hiddenCols]));
    } catch (_e) { /* ignore */ }
  }, [hiddenCols, fullKey]);

  const isVisible = useCallback((col: K) => !hiddenCols.has(col), [hiddenCols]);

  const toggle = useCallback((col: K) => {
    const colDef = columns.find(c => c.key === col);
    if (colDef?.required) return;
    setHiddenCols(prev => {
      const next = new Set(prev);
      const willHide = !next.has(col);
      willHide ? next.add(col) : next.delete(col);
      setAnnouncement(`Cột "${colDef?.label}" đã ${willHide ? 'ẩn' : 'hiện'}`);
      return next;
    });
  }, [columns]);

  const resetAll = useCallback(() => {
    setHiddenCols(new Set());
    setAnnouncement('Đã hiện tất cả cột');
  }, []);

  const showOnlyRequired = useCallback(() => {
    const optional = columns.filter(c => !c.required).map(c => c.key);
    setHiddenCols(new Set(optional));
    setAnnouncement('Chỉ hiện các cột bắt buộc');
  }, [columns]);

  const hideAllOptional = useCallback(() => {
    const optional = columns.filter(c => !c.required).map(c => c.key);
    setHiddenCols(new Set(optional));
    setAnnouncement('Đã ẩn tất cả cột tùy chọn');
  }, [columns]);

  const allOptionalVisible = columns.filter(c => !c.required).every(c => !hiddenCols.has(c.key));
  const allOptionalHidden = columns.filter(c => !c.required).every(c => hiddenCols.has(c.key));

  // Keyboard: Escape closes menu, Arrow Up/Down navigates, Home/End jump, TypeAhead
  const handleMenuKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      setIsOpen(false);
      return;
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const container = e.currentTarget as HTMLElement;
      const items = container.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]:not([aria-disabled]), button');
      if (items.length === 0) return;
      const current = Array.from(items).indexOf(document.activeElement as HTMLElement);
      let next: number;
      if (e.key === 'ArrowDown') {
        next = current < items.length - 1 ? current + 1 : 0;
      } else {
        next = current > 0 ? current - 1 : items.length - 1;
      }
      items[next]?.focus();
      return;
    }
    if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      const container = e.currentTarget as HTMLElement;
      const items = container.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]:not([aria-disabled]), button');
      if (items.length === 0) return;
      (e.key === 'Home' ? items[0] : items[items.length - 1])?.focus();
      return;
    }
    // TypeAhead: single printable character jumps to matching column
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      clearTimeout(typeAheadTimerRef.current);
      typeAheadRef.current += e.key.toLowerCase();
      const search = typeAheadRef.current;
      const container = e.currentTarget as HTMLElement;
      const items = container.querySelectorAll<HTMLElement>('[role="menuitemcheckbox"]');
      for (const item of items) {
        const label = item.textContent?.trim().toLowerCase() || '';
        if (label.startsWith(search)) {
          item.focus();
          break;
        }
      }
      typeAheadTimerRef.current = setTimeout(() => { typeAheadRef.current = ''; }, 500);
    }
  }, []);

  const visibleCount = columns.length - hiddenCols.size;
  const hasHidden = hiddenCols.size > 0;

  return {
    hiddenCols,
    isOpen,
    setIsOpen,
    menuRef,
    isVisible,
    toggle,
    resetAll,
    showOnlyRequired,
    hideAllOptional,
    allOptionalVisible,
    allOptionalHidden,
    handleMenuKeyDown,
    visibleCount,
    totalCount: columns.length,
    hasHidden,
    columns,
    announcement,
  };
}