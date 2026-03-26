import { useState, useRef, useId, type ReactNode } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function Tooltip({ content, children, position = 'top', delay = 300, className = '' }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const tooltipId = useId();

  const show = () => {
    timeoutRef.current = setTimeout(() => setVisible(true), delay);
  };

  const hide = () => {
    clearTimeout(timeoutRef.current);
    setVisible(false);
  };

  const positionClasses: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-3',
  };

  const arrowClasses: Record<string, string> = {
    top: 'top-full left-1/2 -translate-x-1/2 -translate-y-1 rotate-45',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 translate-y-1 rotate-45',
    left: 'left-full top-1/2 -translate-y-1/2 -translate-x-1 rotate-45',
    right: 'right-full top-1/2 -translate-y-1/2 translate-x-1 rotate-45',
  };

  return (
    <div
      className={`relative inline-flex ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && content && (
        <div
          className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
          role="tooltip"
          id={tooltipId}
        >
          <div
            className="relative px-2.5 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-[11px] rounded-lg whitespace-nowrap"
            style={{
              boxShadow: 'var(--shadow-lg)',
              animation: 'fade-in 0.15s ease-out',
            }}
          >
            {content}
            <span className={`absolute w-2 h-2 bg-gray-900 dark:bg-gray-100 rounded-sm ${arrowClasses[position]}`} />
          </div>
        </div>
      )}
    </div>
  );
}