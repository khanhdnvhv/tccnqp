import { useState, useCallback, useEffect, useRef } from 'react';

interface UseSortStateOptions<K extends string> {
  storageKey: string;
  labels: Record<K, string>;
}

export function useSortState<K extends string>({ storageKey, labels }: UseSortStateOptions<K>) {
  const labelsRef = useRef(labels);
  labelsRef.current = labels;

  const [sortKey, setSortKey] = useState<K | null>(() => {
    try {
      const saved = localStorage.getItem(`sort_${storageKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.key || null;
      }
    } catch {}
    return null;
  });

  const [sortDir, setSortDir] = useState<'ascending' | 'descending'>(() => {
    try {
      const saved = localStorage.getItem(`sort_${storageKey}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.dir || 'ascending';
      }
    } catch {}
    return 'ascending';
  });

  const [announcement, setAnnouncement] = useState('');

  // Persist to localStorage
  useEffect(() => {
    try {
      if (sortKey) {
        localStorage.setItem(`sort_${storageKey}`, JSON.stringify({ key: sortKey, dir: sortDir }));
      } else {
        localStorage.removeItem(`sort_${storageKey}`);
      }
    } catch {}
  }, [sortKey, sortDir, storageKey]);

  const handleSort = useCallback((key: K) => {
    let newDir: 'ascending' | 'descending';
    if (sortKey === key) {
      newDir = sortDir === 'ascending' ? 'descending' : 'ascending';
      setSortDir(newDir);
    } else {
      newDir = 'ascending';
      setSortKey(key);
      setSortDir(newDir);
    }
    setAnnouncement(`Sắp xếp theo ${labelsRef.current[key]}, ${newDir === 'ascending' ? 'tăng dần' : 'giảm dần'}`);
  }, [sortKey, sortDir]);

  const handleSortKeyDown = useCallback((e: React.KeyboardEvent, key: K) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSort(key);
    } else if (e.key === 'Escape' && sortKey !== null) {
      e.preventDefault();
      setSortKey(null);
      setSortDir('ascending');
      setAnnouncement('Đã xóa sắp xếp, trở về thứ tự mặc định');
    }
  }, [handleSort, sortKey]);

  const getAriaSort = (key: K): 'ascending' | 'descending' | 'none' =>
    sortKey === key ? sortDir : 'none';

  const resetSort = useCallback(() => {
    setSortKey(null);
    setSortDir('ascending');
    setAnnouncement('Đã xóa sắp xếp, trở về thứ tự mặc định');
  }, []);

  return {
    sortKey,
    sortDir,
    announcement,
    handleSort,
    handleSortKeyDown,
    getAriaSort,
    resetSort,
    isSorted: sortKey !== null,
  };
}