import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, FileInput, FileOutput, FileText, ClipboardList, Calendar,
  BookOpen, Bell, BarChart3, Settings, Users, Building2, FolderCog,
  LayoutDashboard, ArrowRight, Command, Hash,
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
  { id: 'dashboard', label: 'Tổng quan', description: 'Bảng điều khiển chính', icon: LayoutDashboard, path: '/', group: 'Điều hướng' },
  { id: 'incoming', label: 'Văn bản đến', description: 'Quản lý văn bản đến', icon: FileInput, path: '/incoming', group: 'Văn bản' },
  { id: 'outgoing', label: 'Văn bản đi', description: 'Quản lý văn bản đi', icon: FileOutput, path: '/outgoing', group: 'Văn bản' },
  { id: 'internal', label: 'Văn bản nội bộ', description: 'Quản lý văn bản nội bộ', icon: FileText, path: '/internal', group: 'Văn bản' },
  { id: 'tasks', label: 'Công việc', description: 'Quản lý & theo dõi công việc', icon: ClipboardList, path: '/tasks', group: 'Công việc' },
  { id: 'calendar', label: 'Lịch làm việc', description: 'Lịch họp & sự kiện', icon: Calendar, path: '/calendar', group: 'Công việc' },
  { id: 'docbook', label: 'Sổ văn bản & Lưu trữ', description: 'Sổ đăng ký văn bản', icon: BookOpen, path: '/document-book', group: 'Lưu trữ' },
  { id: 'notifications', label: 'Thông báo', description: 'Xem tất cả thông báo', icon: Bell, path: '/notifications', group: 'Hệ thống' },
  { id: 'reports', label: 'Báo cáo & Thống kê', description: 'Phân tích dữ liệu', icon: BarChart3, path: '/reports', group: 'Báo cáo' },
  { id: 'search', label: 'Tìm kiếm nâng cao', description: 'Tìm kiếm toàn hệ thống', icon: Search, path: '/search', group: 'Hệ thống' },
  { id: 'settings', label: 'Cài đặt', description: 'Tùy chỉnh hệ thống', icon: Settings, path: '/settings', group: 'Quản trị' },
  { id: 'users', label: 'Quản lý người dùng', description: 'Tài khoản & phân quyền', icon: Users, path: '/users', group: 'Quản trị' },
  { id: 'org', label: 'Cơ cấu tổ chức', description: 'Phòng ban & đơn vị', icon: Building2, path: '/organization', group: 'Quản trị' },
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