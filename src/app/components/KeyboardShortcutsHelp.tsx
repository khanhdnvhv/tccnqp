import { useState, useEffect } from 'react';
import { X, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const shortcuts = [
  { category: 'Điều hướng chung', items: [
    { keys: ['Ctrl', 'K'], desc: 'Mở Command Palette' },
    { keys: ['?'], desc: 'Hiện phím tắt' },
    { keys: ['Esc'], desc: 'Đóng modal / dialog' },
  ]},
  { category: 'Trang chức năng', items: [
    { keys: ['G', 'D'], desc: 'Đi đến Tổng quan (Dashboard)' },
    { keys: ['G', 'I'], desc: 'Đi đến Văn bản đến' },
    { keys: ['G', 'O'], desc: 'Đi đến Văn bản đi' },
    { keys: ['G', 'T'], desc: 'Đi đến Công việc' },
    { keys: ['G', 'C'], desc: 'Đi đến Lịch làm việc' },
    { keys: ['G', 'S'], desc: 'Đi đến Cài đặt' },
  ]},
  { category: 'Thao tác', items: [
    { keys: ['N'], desc: 'Tạo mới (văn bản / công việc)' },
    { keys: ['/'], desc: 'Focus vào ô tìm kiếm' },
    { keys: ['Ctrl', 'P'], desc: 'In văn bản' },
  ]},
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
      if (target.isContentEditable) return;

      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2 }}
            className="relative bg-card rounded-2xl shadow-2xl border border-border w-full max-w-lg max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="keyboard-shortcuts-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-primary" />
                <h3 id="keyboard-shortcuts-title" className="text-foreground text-[15px]">Phím tắt</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-accent" aria-label="Đóng">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[60vh] p-6 space-y-6">
              {shortcuts.map((group) => (
                <div key={group.category}>
                  <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-3">{group.category}</p>
                  <div className="space-y-2">
                    {group.items.map((shortcut, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5">
                        <span className="text-[13px] text-foreground">{shortcut.desc}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.keys.map((key, ki) => (
                            <span key={ki}>
                              <kbd className="min-w-[24px] h-6 px-1.5 bg-muted rounded-md text-[11px] text-muted-foreground flex items-center justify-center border border-border/50 shadow-sm">
                                {key}
                              </kbd>
                              {ki < shortcut.keys.length - 1 && (
                                <span className="text-[10px] text-muted-foreground mx-0.5">+</span>
                              )}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-border bg-accent/20">
              <p className="text-[11px] text-muted-foreground text-center">
                Nhấn <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] border border-border/50">?</kbd> để đóng
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}