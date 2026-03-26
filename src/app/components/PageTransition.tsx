import { motion } from 'motion/react';
import type { ReactNode } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

export function PageTransition({ children }: { children: ReactNode }) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 flex flex-col overflow-hidden"
    >
      {children}
    </motion.div>
  );
}