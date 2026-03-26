import { type LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  compact?: boolean;
}

export function EmptyState({ icon: Icon, title, description, action, compact = false }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`flex flex-col items-center justify-center text-center ${compact ? 'py-8' : 'py-16'}`}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 20 }}
        className={`${compact ? 'w-12 h-12 mb-3' : 'w-16 h-16 mb-4'} rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center`}
      >
        <Icon className={`${compact ? 'w-5 h-5' : 'w-7 h-7'} text-primary/40`} />
      </motion.div>

      <h3
        className={`text-foreground ${compact ? 'text-[14px] mb-1' : 'text-[16px] mb-2'}`}
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {title}
      </h3>

      {description && (
        <p className={`text-muted-foreground max-w-sm ${compact ? 'text-[12px]' : 'text-[13px] leading-relaxed'}`}>
          {description}
        </p>
      )}

      {action && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={action.onClick}
          className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[13px] hover:opacity-90 transition-all active:scale-[0.98]"
          style={{ boxShadow: 'var(--shadow-sm)' }}
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}