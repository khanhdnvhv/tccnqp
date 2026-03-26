import { useState, useCallback, useMemo, useRef } from 'react';

interface UseColumnOrderOptions<K extends string> {
  storageKey: string;
  defaultOrder: K[];
  labels?: Record<K, string>;
}

export function useColumnOrder<K extends string>({ storageKey, defaultOrder, labels }: UseColumnOrderOptions<K>) {
  const lsKey = `col_order_${storageKey}`;
  const [announcement, setAnnouncement] = useState('');
  const announceTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const announce = useCallback((msg: string) => {
    if (announceTimeoutRef.current) clearTimeout(announceTimeoutRef.current);
    setAnnouncement(msg);
    announceTimeoutRef.current = setTimeout(() => setAnnouncement(''), 1500);
  }, []);

  const getLabel = useCallback((key: K) => labels?.[key] ?? key, [labels]);

  const [order, setOrder] = useState<K[]>(() => {
    try {
      const stored = localStorage.getItem(lsKey);
      if (stored) {
        const parsed = JSON.parse(stored) as K[];
        // Validate: must contain same keys
        if (parsed.length === defaultOrder.length && defaultOrder.every(k => parsed.includes(k))) {
          return parsed;
        }
      }
    } catch { /* ignore */ }
    return [...defaultOrder];
  });

  // Persist to localStorage
  const updateOrder = useCallback((newOrder: K[]) => {
    setOrder(newOrder);
    try { localStorage.setItem(lsKey, JSON.stringify(newOrder)); } catch { /* ignore */ }
  }, [lsKey]);

  const moveColumn = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setOrder(prev => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      try { localStorage.setItem(lsKey, JSON.stringify(next)); } catch { /* ignore */ }
      announce(`Đã di chuyển cột ${getLabel(moved)} sang vị trí ${toIndex + 1}`);
      return next;
    });
  }, [lsKey, announce, getLabel]);

  const moveColumnByKey = useCallback((colKey: K, direction: -1 | 1) => {
    setOrder(prev => {
      const idx = prev.indexOf(colKey);
      if (idx < 0) return prev;
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      try { localStorage.setItem(lsKey, JSON.stringify(next)); } catch { /* ignore */ }
      announce(`Đã di chuyển cột ${getLabel(colKey)} sang vị trí ${targetIdx + 1}`);
      return next;
    });
  }, [lsKey, announce, getLabel]);

  const resetOrder = useCallback(() => {
    updateOrder([...defaultOrder]);
    announce('Đã đặt lại thứ tự cột về mặc định');
  }, [defaultOrder, updateOrder, announce]);

  const isReordered = useMemo(() => {
    return order.some((k, i) => k !== defaultOrder[i]);
  }, [order, defaultOrder]);

  const getColumnIndex = useCallback((col: K) => order.indexOf(col), [order]);

  return {
    order,
    moveColumn,
    moveColumnByKey,
    resetOrder,
    isReordered,
    getColumnIndex,
    announcement,
  };
}