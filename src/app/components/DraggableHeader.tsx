import React, { useRef, memo, useCallback } from 'react';
import { useDrag, useDrop } from 'react-dnd';

const COLUMN_DND_TYPE = 'COLUMN_HEADER';

interface DragItem {
  colKey: string;
  index: number;
}

interface DraggableHeaderProps {
  colKey: string;
  index: number;
  onMove: (fromIndex: number, toIndex: number) => void;
  onKeyboardMove?: (colKey: string, direction: -1 | 1) => void;
  children: React.ReactNode;
  scope?: string;
  role?: string;
  'aria-colindex'?: number;
  'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
  tabIndex?: number;
  title?: string;
  'aria-describedby'?: string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

function DraggableHeaderInner({
  colKey,
  index,
  onMove,
  onKeyboardMove,
  children,
  className = '',
  style,
  onKeyDown: externalKeyDown,
  ...thProps
}: DraggableHeaderProps) {
  const ref = useRef<HTMLTableCellElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: COLUMN_DND_TYPE,
    item: (): DragItem => ({ colKey, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver, canDrop }, drop] = useDrop<DragItem, void, { isOver: boolean; canDrop: boolean }>({
    accept: COLUMN_DND_TYPE,
    canDrop: (item) => item.colKey !== colKey,
    drop: (item) => {
      if (item.index !== index) {
        onMove(item.index, index);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  drag(drop(ref));

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.altKey && onKeyboardMove) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        e.stopPropagation();
        onKeyboardMove(colKey, -1);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        e.stopPropagation();
        onKeyboardMove(colKey, 1);
        return;
      }
    }
    externalKeyDown?.(e);
  }, [colKey, onKeyboardMove, externalKeyDown]);

  const isDropTarget = isOver && canDrop;

  return (
    <th
      ref={ref}
      {...thProps}
      className={`${className} transition-all duration-150 ${isDragging ? 'opacity-30 scale-[0.97]' : ''} ${isDropTarget ? 'bg-primary/8 ring-1 ring-inset ring-primary/25' : ''}`}
      style={{
        ...style,
        cursor: isDragging ? 'grabbing' : 'grab',
        position: 'relative',
      }}
      onKeyDown={handleKeyDown}
      aria-grabbed={isDragging}
      aria-roledescription="draggable column header"
    >
      {/* Drop indicator - left edge */}
      {isDropTarget && (
        <div
          className="absolute top-1 bottom-1 left-0 w-[3px] rounded-full bg-primary shadow-[0_0_6px_rgba(37,99,235,0.4)]"
          style={{ pointerEvents: 'none' }}
          aria-hidden="true"
        />
      )}
      {/* Drag grip indicator */}
      <span
        className={`inline-flex mr-1.5 opacity-0 group-hover/th:opacity-30 transition-opacity align-middle ${isDragging ? '!opacity-60' : ''}`}
        aria-hidden="true"
        style={{ fontSize: '10px', letterSpacing: '1px', lineHeight: 1 }}
      >⠿</span>
      {children}
    </th>
  );
}

export const DraggableHeader = memo(DraggableHeaderInner);