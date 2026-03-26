import React, { useRef, useEffect, useCallback, useId, useState } from 'react';
import { Columns, Info } from 'lucide-react';
import type { ColumnDef } from '../hooks/useColumnVisibility';

interface ColumnToggleProps<K extends string> {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  columns: ColumnDef<K>[];
  isVisible: (col: K) => boolean;
  toggle: (col: K) => void;
  resetAll: () => void;
  showOnlyRequired?: () => void;
  hideAllOptional?: () => void;
  allOptionalVisible?: boolean;
  allOptionalHidden?: boolean;
  handleMenuKeyDown: (e: React.KeyboardEvent) => void;
  visibleCount: number;
  totalCount: number;
  hasHidden: boolean;
  announcement?: string;
}

function ColumnToggleInner<K extends string>({
  isOpen, setIsOpen, columns, isVisible, toggle, resetAll, showOnlyRequired,
  hideAllOptional, allOptionalVisible, allOptionalHidden,
  handleMenuKeyDown, visibleCount, totalCount, hasHidden, announcement,
}: ColumnToggleProps<K>) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const menuId = `${baseId}-coltoggle-menu`;
  const [showHint, setShowHint] = useState(false);

  // Focus trap: focus first checkbox when opening, restore trigger on close
  useEffect(() => {
    if (!isOpen) return;
    const menu = menuRef.current;
    if (!menu) return;

    // Focus first interactive element
    requestAnimationFrame(() => {
      const first = menu.querySelector<HTMLElement>('[role="menuitemcheckbox"]:not([aria-disabled]), button');
      first?.focus();
    });

    const handleTrap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusables = menu.querySelectorAll<HTMLElement>(
        '[role="menuitemcheckbox"]:not([aria-disabled]), button:not([disabled])'
      );
      if (focusables.length === 0) return;
      const firstEl = focusables[0];
      const lastEl = focusables[focusables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTrap);
    return () => {
      document.removeEventListener('keydown', handleTrap);
      // Restore focus to trigger button
      triggerRef.current?.focus();
    };
  }, [isOpen]);

  return (
    <div className="relative print:hidden">
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-1.5 px-3 py-2 bg-surface-2 rounded-lg text-[13px] text-muted-foreground hover:bg-accent transition-colors"
        aria-label="Hiển thị/ẩn cột"
        aria-controls={isOpen ? menuId : undefined}
      >
        <Columns className="w-4 h-4" /> Cột
        {hasHidden && (
          <span className="ml-0.5 px-1.5 py-0 rounded-full bg-primary/10 text-primary text-[10px]">
            {visibleCount}/{totalCount}
          </span>
        )}
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div
            ref={menuRef}
            id={menuId}
            className="absolute right-0 top-full mt-1 z-40 bg-card rounded-xl border border-border py-2 w-52"
            style={{ boxShadow: 'var(--shadow-lg)' }}
            role="menu"
            aria-label="Chọn cột hiển thị"
            onKeyDown={handleMenuKeyDown}
          >
            <p className="px-3 py-1 text-[11px] text-muted-foreground tracking-wide flex items-center justify-between" aria-hidden="true">
              <span>HIỂN THỊ CỘT</span>
              <button
                className="relative p-0.5 rounded hover:bg-accent/50 transition-colors"
                onClick={() => setShowHint(h => !h)}
                aria-label="Hiện gợi ý phím tắt"
                type="button"
              >
                <Info className="w-3 h-3" />
              </button>
            </p>
            {showHint && (
              <div className="mx-3 mb-1 px-2 py-1.5 bg-surface-2 rounded-lg text-[10px] text-muted-foreground space-y-0.5">
                <p><kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">↑↓</kbd> Di chuyển</p>
                <p><kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">Home/End</kbd> Đầu/cuối</p>
                <p><kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">Space/Enter</kbd> Bật/tắt</p>
                <p><kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">Gõ ký tự</kbd> Tìm nhanh</p>
                <p><kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">Esc</kbd> Đóng</p>
              </div>
            )}
            {/* Select All / Deselect All toggle */}
            <div className="px-3 py-1 border-b border-border mb-1">
              <button
                onClick={allOptionalVisible ? (hideAllOptional ?? showOnlyRequired) : resetAll}
                className="text-[11px] text-primary hover:underline py-0.5"
                type="button"
              >
                {allOptionalVisible ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            </div>
            {columns.map((col, i) => (
              <div
                key={col.key}
                id={`${menuId}-item-${i}`}
                className={`flex items-center gap-2.5 px-3 py-1.5 text-[13px] cursor-pointer hover:bg-accent/50 transition-colors select-none ${col.required ? 'opacity-50 cursor-not-allowed' : ''}`}
                role="menuitemcheckbox"
                aria-checked={isVisible(col.key)}
                aria-disabled={col.required || undefined}
                tabIndex={0}
                onClick={() => !col.required && toggle(col.key)}
                onKeyDown={(e) => {
                  if ((e.key === ' ' || e.key === 'Enter') && !col.required) {
                    e.preventDefault();
                    toggle(col.key);
                  }
                }}
              >
                <span
                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${isVisible(col.key) ? 'bg-primary border-primary' : 'border-border bg-transparent'}`}
                  aria-hidden="true"
                >
                  {isVisible(col.key) && (
                    <svg className="w-2.5 h-2.5 text-primary-foreground" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  )}
                </span>
                <span className="text-foreground">{col.label}</span>
              </div>
            ))}
            <div className="border-t border-border mt-1 pt-1 px-3 flex items-center gap-2">
              {hasHidden && (
                <button onClick={resetAll} className="text-[11px] text-primary hover:underline py-1">
                  Hiện tất cả
                </button>
              )}
              {showOnlyRequired && !hasHidden && (
                <button onClick={showOnlyRequired} className="text-[11px] text-muted-foreground hover:text-foreground hover:underline py-1">
                  Chỉ cột bắt buộc
                </button>
              )}
              {showOnlyRequired && hasHidden && (
                <>
                  <span className="text-border">|</span>
                  <button onClick={showOnlyRequired} className="text-[11px] text-muted-foreground hover:text-foreground hover:underline py-1">
                    Chỉ bắt buộc
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </div>
  );
}

export const ColumnToggle = React.memo(ColumnToggleInner) as unknown as typeof ColumnToggleInner;