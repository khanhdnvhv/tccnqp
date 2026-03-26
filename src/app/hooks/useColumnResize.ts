import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

interface ColumnWidthConfig {
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
}

interface UseColumnResizeOptions<K extends string> {
  storageKey: string;
  columns: K[];
  config?: Partial<Record<K, ColumnWidthConfig>>;
  defaultMinWidth?: number;
  defaultMaxWidth?: number;
  defaultWidth?: number;
}

export function useColumnResize<K extends string>({
  storageKey,
  columns,
  config = {},
  defaultMinWidth = 80,
  defaultMaxWidth = 500,
  defaultWidth = 150,
}: UseColumnResizeOptions<K>) {
  const fullKey = `colresize_${storageKey}`;

  const [widths, setWidths] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem(fullKey);
      if (stored) return JSON.parse(stored);
    } catch (_e) { /* ignore */ }
    const init: Record<string, number> = {};
    columns.forEach(col => {
      init[col] = config[col]?.defaultWidth ?? defaultWidth;
    });
    return init;
  });

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(fullKey, JSON.stringify(widths));
    } catch (_e) { /* ignore */ }
  }, [widths, fullKey]);

  const dragRef = useRef<{
    col: K;
    startX: number;
    startWidth: number;
  } | null>(null);

  const getWidth = useCallback((col: K): number => {
    return widths[col] ?? config[col]?.defaultWidth ?? defaultWidth;
  }, [widths, config, defaultWidth]);

  const onResizeStart = useCallback((col: K, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = widths[col] ?? config[col]?.defaultWidth ?? defaultWidth;
    dragRef.current = { col, startX, startWidth };

    const colConf = config[col] ?? {};
    const min = colConf.minWidth ?? defaultMinWidth;
    const max = colConf.maxWidth ?? defaultMaxWidth;

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const delta = ev.clientX - dragRef.current.startX;
      const newWidth = Math.min(max, Math.max(min, dragRef.current.startWidth + delta));
      setWidths(prev => ({ ...prev, [col]: newWidth }));
    };

    const onMouseUp = () => {
      dragRef.current = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [widths, config, defaultWidth, defaultMinWidth, defaultMaxWidth]);

  const resetWidths = useCallback(() => {
    const init: Record<string, number> = {};
    columns.forEach(col => {
      init[col] = config[col]?.defaultWidth ?? defaultWidth;
    });
    setWidths(init);
  }, [columns, config, defaultWidth]);

  const getHeaderProps = useCallback((col: K) => ({
    style: { width: getWidth(col), minWidth: config[col]?.minWidth ?? defaultMinWidth } as React.CSSProperties,
  }), [getWidth, config, defaultMinWidth]);

  const getCellProps = useCallback((col: K) => ({
    style: { width: getWidth(col), minWidth: config[col]?.minWidth ?? defaultMinWidth } as React.CSSProperties,
  }), [getWidth, config, defaultMinWidth]);

  // Auto-fit: measure all cells in a column and set width to max content width
  const autoFit = useCallback((col: K, tableEl?: HTMLTableElement | null) => {
    if (!tableEl) return;
    const colConf = config[col] ?? {};
    const min = colConf.minWidth ?? defaultMinWidth;
    const max = colConf.maxWidth ?? defaultMaxWidth;

    // Find column index by matching header text
    const headers = tableEl.querySelectorAll('thead th');
    let colIdx = -1;
    headers.forEach((th, i) => {
      if (th.getAttribute('style')?.includes(String(getWidth(col)))) {
        colIdx = i;
      }
    });

    // Fallback: measure all cells and find max natural width
    const cells = tableEl.querySelectorAll(`tbody td:nth-child(${colIdx + 1})`);
    let maxW = min;
    cells.forEach(cell => {
      const el = cell as HTMLElement;
      // Temporarily remove fixed width to measure natural width
      const origW = el.style.width;
      const origMin = el.style.minWidth;
      el.style.width = 'auto';
      el.style.minWidth = '0';
      maxW = Math.max(maxW, el.scrollWidth + 16); // +16 padding
      el.style.width = origW;
      el.style.minWidth = origMin;
    });

    // Also measure header
    if (colIdx >= 0 && headers[colIdx]) {
      const th = headers[colIdx] as HTMLElement;
      const origW = th.style.width;
      th.style.width = 'auto';
      maxW = Math.max(maxW, th.scrollWidth + 24);
      th.style.width = origW;
    }

    const finalWidth = Math.min(max, Math.max(min, maxW));
    setWidths(prev => ({ ...prev, [col]: finalWidth }));
  }, [config, defaultMinWidth, defaultMaxWidth, getWidth]);

  // Keyboard resize: adjust width by delta, clamped to min/max
  const keyboardResize = useCallback((col: K, delta: number) => {
    const colConf = config[col] ?? {};
    const min = colConf.minWidth ?? defaultMinWidth;
    const max = colConf.maxWidth ?? defaultMaxWidth;
    setWidths(prev => {
      const current = prev[col] ?? colConf.defaultWidth ?? defaultWidth;
      const newWidth = Math.min(max, Math.max(min, current + delta));
      return { ...prev, [col]: newWidth };
    });
  }, [config, defaultMinWidth, defaultMaxWidth, defaultWidth]);

  // Track if widths differ from defaults
  const isResized = useMemo(() => {
    return columns.some(col => {
      const current = widths[col] ?? config[col]?.defaultWidth ?? defaultWidth;
      const def = config[col]?.defaultWidth ?? defaultWidth;
      return current !== def;
    });
  }, [widths, columns, config, defaultWidth]);

  return {
    widths,
    getWidth,
    onResizeStart,
    resetWidths,
    getHeaderProps,
    getCellProps,
    autoFit,
    keyboardResize,
    isResized,
  };
}