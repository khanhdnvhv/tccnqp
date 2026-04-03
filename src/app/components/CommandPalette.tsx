import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Calendar, ScanSearch, Bell, BarChart3, Settings,
  Users, FolderCog, LayoutDashboard, ArrowRight,
  Command, Hash, UserSearch,
} from 'lucide-react';

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: typeof Search;
  path: string;
  group: string;
}

const commands: CommandItem[] = [
  { id: 'dashboard', label: 'Tổng quan', description: 'Dashboard + Lịch trực quan đoàn ra vào', icon: LayoutDashboard, path: '/', group: 'Điều hành' },
  { id: 'partner-dossier', label: 'Lý lịch Đối tác', description: 'Thông tin, hợp đồng, quà tặng', icon: UserSearch, path: '/partner-dossier', group: 'Nghiệp vụ' },
  { id: 'delegations', label: 'Quản lý Đoàn vào', description: 'Công văn, nhân sự, xuất mẫu Word', icon: Users, path: '/delegations', group: 'Nghiệp vụ' },
  { id: 'archive', label: 'Kho số hóa (OCR)', description: 'Tra cứu nội dung văn bản', icon: ScanSearch, path: '/archive', group: 'Dữ liệu' },
  { id: 'reports', label: 'Báo cáo & Thống kê', description: 'Xuất báo cáo Excel', icon: BarChart3, path: '/reports', group: 'Dữ liệu' },
  { id: 'notifications', label: 'Cảnh báo', description: 'Cảnh báo & thông báo hệ thống', icon: Bell, path: '/notifications', group: 'Hệ thống' },
  { id: 'settings', label: 'Cài đặt', description: 'Tùy chỉnh hệ thống', icon: Settings, path: '/settings', group: 'Quản trị' },
  { id: 'categories', label: 'Danh mục', description: 'Quản lý danh mục hệ thống', icon: FolderCog, path: '/categories', group: 'Quản trị' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Ctrl+K to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (c) => c.label.toLowerCase().includes(q) || c.description.toLowerCase().includes(q) || c.group.toLowerCase().includes(q)
    );
  }, [query]);

  const groups = useMemo(() => {
    const map: Record<string, CommandItem[]> = {};
    filtered.forEach((c) => {
      if (!map[c.group]) map[c.group] = [];
      map[c.group].push(c);
    });
    return map;
  }, [filtered]);

  const flatItems = useMemo(() => filtered, [filtered]);

  const handleSelect = useCallback((item: CommandItem) => {
    setOpen(false);
    setQuery('');
    navigate(item.path);
  }, [navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, flatItems.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && flatItems[selectedIndex]) {
      handleSelect(flatItems[selectedIndex]);
    }
  };

  useEffect(() => { setSelectedIndex(0); }, [query]);

  let globalIndex = -1;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg bg-card rounded-2xl border border-border z-[101] overflow-hidden"
            style={{ boxShadow: 'var(--shadow-xl)' }}
            role="dialog"
            aria-modal="true"
            aria-label="Command Palette"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập lệnh hoặc tìm kiếm..."
                className="flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-muted-foreground"
                role="combobox"
                aria-expanded={true}
                aria-controls="command-palette-listbox"
                aria-activedescendant={flatItems[selectedIndex] ? `cmd-item-${flatItems[selectedIndex].id}` : undefined}
                aria-autocomplete="list"
              />
              <kbd className="hidden sm:flex items-center gap-0.5 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="max-h-[360px] overflow-y-auto py-2" id="command-palette-listbox" role="listbox" aria-label="Kết quả tìm kiếm">
              <div className="sr-only" aria-live="polite" aria-atomic="true">
                {flatItems.length === 0 ? 'Không tìm thấy kết quả' : `${flatItems.length} kết quả`}
              </div>
              {flatItems.length === 0 ? (
                <div className="py-8 text-center">
                  <Search className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-[13px] text-muted-foreground">Không tìm thấy kết quả</p>
                </div>
              ) : (
                Object.entries(groups).map(([group, items]) => (
                  <div key={group} role="group" aria-label={group}>
                    <p className="text-[10px] text-muted-foreground px-4 py-1.5 uppercase tracking-wider">{group}</p>
                    {items.map((item) => {
                      globalIndex++;
                      const idx = globalIndex;
                      return (
                        <button
                          key={item.id}
                          id={`cmd-item-${item.id}`}
                          role="option"
                          aria-selected={selectedIndex === idx}
                          onClick={() => handleSelect(item)}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                            selectedIndex === idx ? 'bg-primary/8 text-primary' : 'text-foreground hover:bg-accent/50'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            selectedIndex === idx ? 'bg-primary/10' : 'bg-muted'
                          }`}>
                            <item.icon className={`w-4 h-4 ${selectedIndex === idx ? 'text-primary' : 'text-muted-foreground'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] truncate">{item.label}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{item.description}</p>
                          </div>
                          {selectedIndex === idx && <ArrowRight className="w-4 h-4 text-primary/50 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/30">
              <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1"><kbd className="bg-muted px-1 py-0.5 rounded text-[9px]">↑↓</kbd> Di chuyển</span>
                <span className="flex items-center gap-1"><kbd className="bg-muted px-1 py-0.5 rounded text-[9px]">↵</kbd> Chọn</span>
                <span className="flex items-center gap-1"><kbd className="bg-muted px-1 py-0.5 rounded text-[9px]">Esc</kbd> Đóng</span>
              </div>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Command className="w-3 h-3" /> e-Office
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}