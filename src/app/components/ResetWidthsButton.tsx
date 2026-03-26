import React from 'react';
import { RotateCcw } from 'lucide-react';

interface ResetWidthsButtonProps {
  isResized: boolean;
  onReset: () => void;
}

function ResetWidthsButtonInner({ isResized, onReset }: ResetWidthsButtonProps) {
  if (!isResized) return null;
  return (
    <button
      onClick={onReset}
      className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
      aria-label="Đặt lại kích thước cột về mặc định"
      title="Đặt lại kích thước cột"
    >
      <RotateCcw className="w-3 h-3" /> Đặt lại cột
    </button>
  );
}

export const ResetWidthsButton = React.memo(ResetWidthsButtonInner);
