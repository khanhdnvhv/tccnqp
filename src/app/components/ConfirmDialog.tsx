import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

const variantConfig = {
  danger: {
    bg: 'bg-red-50 dark:bg-red-900/30',
    iconColor: 'text-red-600 dark:text-red-400',
    btnBg: 'bg-red-600 hover:bg-red-700',
    Icon: AlertTriangle,
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    btnBg: 'bg-amber-600 hover:bg-amber-700',
    Icon: AlertTriangle,
  },
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    btnBg: 'bg-blue-600 hover:bg-blue-700',
    Icon: Info,
  },
  success: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    btnBg: 'bg-emerald-600 hover:bg-emerald-700',
    Icon: CheckCircle2,
  },
};

export function ConfirmDialog({
  isOpen, title, message, confirmLabel = 'Xác nhận', cancelLabel = 'Hủy',
  variant = 'danger', onConfirm, onCancel,
}: ConfirmDialogProps) {
  const cfg = variantConfig[variant];
  const IconComp = cfg.Icon;
  const dialogRef = useFocusTrap<HTMLDivElement>(isOpen);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={onCancel}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative bg-card rounded-2xl border border-border w-full max-w-sm overflow-hidden"
            style={{ boxShadow: 'var(--shadow-xl)' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            ref={dialogRef}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0`}>
                  <IconComp className={`w-5 h-5 ${cfg.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 id="confirm-dialog-title" className="text-foreground text-[15px] mb-1" style={{ fontFamily: "var(--font-display)" }}>{title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{message}</p>
                </div>
                <button onClick={onCancel} className="p-1 rounded-lg hover:bg-accent shrink-0 -mr-1 -mt-1 transition-colors" aria-label="Đóng">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-surface-2/50">
              <button onClick={onCancel} className="px-4 py-2 rounded-xl text-[13px] text-muted-foreground hover:bg-accent transition-colors">
                {cancelLabel}
              </button>
              <button onClick={onConfirm} className={`px-5 py-2 rounded-xl text-[13px] text-white ${cfg.btnBg} transition-colors active:scale-[0.98]`} style={{ boxShadow: 'var(--shadow-sm)' }}>
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}