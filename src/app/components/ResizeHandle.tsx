import React, { useCallback } from 'react';

interface ResizeHandleProps {
  onResizeStart: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
  onKeyboardResize?: (delta: number) => void;
}

function ResizeHandleInner({ onResizeStart, onDoubleClick, onKeyboardResize }: ResizeHandleProps) {
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!onKeyboardResize) return;
    const step = e.shiftKey ? 20 : 4;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      onKeyboardResize(step);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      e.stopPropagation();
      onKeyboardResize(-step);
    } else if (e.key === 'Home') {
      // Reset to auto-fit via double-click handler
      e.preventDefault();
      onDoubleClick?.();
    }
  }, [onKeyboardResize, onDoubleClick]);

  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize hover:bg-primary/30 active:bg-primary/50 focus-visible:bg-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors z-10 group"
      onMouseDown={onResizeStart}
      onDoubleClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onDoubleClick?.();
      }}
      onKeyDown={handleKeyDown}
      role="separator"
      aria-orientation="vertical"
      aria-label="Kéo hoặc dùng ← → để thay đổi kích thước cột, nhấp đúp hoặc Home để tự động điều chỉnh"
      tabIndex={0}
    >
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-border rounded-full opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity" />
    </div>
  );
}

export const ResizeHandle = React.memo(ResizeHandleInner);
