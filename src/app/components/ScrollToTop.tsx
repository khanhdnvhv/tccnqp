import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const main = document.querySelector('main');
    if (!main) return;

    const handleScroll = () => {
      setVisible(main.scrollTop > 400);
    };

    // Listen on scroll of the main content area
    const scrollContainers = main.querySelectorAll('.overflow-y-auto');
    scrollContainers.forEach((el) => el.addEventListener('scroll', handleScroll));

    // Also listen on main
    main.addEventListener('scroll', handleScroll);

    return () => {
      scrollContainers.forEach((el) => el.removeEventListener('scroll', handleScroll));
      main.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    const main = document.querySelector('main');
    if (!main) return;
    const scrollEl = main.querySelector('.overflow-y-auto') || main;
    scrollEl.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-30 w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center hover:scale-105 transition-all active:scale-95"
          style={{ boxShadow: 'var(--shadow-lg)' }}
          aria-label="Lên đầu trang"
        >
          <ArrowUp className="w-4 h-4" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}