import { useState, useRef, useEffect, useCallback } from 'react';
import { Bell, Search, ChevronDown, X, FileText, ClipboardList, Settings as SettingsIcon, User, Key, LogOut, FileInput, FileOutput, GitBranch, Calendar, Check, Sun, Moon, ArrowLeftRight, Shield, Users } from 'lucide-react';
import { initialNotifications, notificationTypeConfig, type EnhancedNotification, type NotificationType } from '../data/notificationData';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router';
import { Breadcrumb } from './Breadcrumb';
import { motion, AnimatePresence } from 'motion/react';
import { toast as sonnerToast } from 'sonner';

const typeIcons: Record<NotificationType, typeof FileText> = {
  doc_incoming: FileInput,
  doc_outgoing: FileOutput,
  doc_internal: FileText,
  workflow: GitBranch,
  task: ClipboardList,
  calendar: Calendar,
  system: SettingsIcon,
  reminder: Bell,
};

export function Header({ title }: { title: string }) {
  const { user, roles, logout, switchUser } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notifications, setNotifications] = useState<EnhancedNotification[]>(initialNotifications);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifBtnRef = useRef<HTMLButtonElement>(null);
  const profileBtnRef = useRef<HTMLButtonElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifListRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Keyboard: Escape to close dropdowns & return focus; arrow keys for menu
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showNotif) {
          setShowNotif(false);
          notifBtnRef.current?.focus();
        }
        if (showProfile) {
          setShowProfile(false);
          profileBtnRef.current?.focus();
        }
      }
      // Arrow key navigation inside profile menu
      if (showProfile && profileMenuRef.current && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        const items = profileMenuRef.current.querySelectorAll<HTMLElement>('[role="menuitem"]');
        if (items.length === 0) return;
        const focused = document.activeElement as HTMLElement;
        const idx = Array.from(items).indexOf(focused);
        let next: number;
        if (e.key === 'ArrowDown') {
          next = idx < 0 ? 0 : (idx + 1) % items.length;
        } else {
          next = idx <= 0 ? items.length - 1 : idx - 1;
        }
        items[next].focus();
      }
      // Arrow key navigation inside notification list
      if (showNotif && notifListRef.current && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault();
        const items = notifListRef.current.querySelectorAll<HTMLElement>('[data-notif-item]');
        if (items.length === 0) return;
        const focused = document.activeElement as HTMLElement;
        const idx = Array.from(items).indexOf(focused);
        let next: number;
        if (e.key === 'ArrowDown') {
          next = idx < 0 ? 0 : (idx + 1) % items.length;
        } else {
          next = idx <= 0 ? items.length - 1 : idx - 1;
        }
        items[next].focus();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showNotif, showProfile]);

  // Focus first menu item when profile menu opens
  useEffect(() => {
    if (showProfile && profileMenuRef.current) {
      const first = profileMenuRef.current.querySelector<HTMLElement>('[role="menuitem"]');
      if (first) requestAnimationFrame(() => first.focus());
    }
  }, [showProfile]);

  // Focus first notification item when notification dropdown opens
  useEffect(() => {
    if (showNotif && notifListRef.current) {
      const first = notifListRef.current.querySelector<HTMLElement>('[data-notif-item]');
      if (first) requestAnimationFrame(() => first.focus());
    }
  }, [showNotif]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const roleName = roles.length > 0 ? roles[0].name : '';

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const formatTime = (ts: string) => {
    const d = new Date(ts);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  return (
    <header className="bg-card/80 backdrop-blur-md border-b border-border shrink-0 sticky top-0 z-30">
      <div className="h-16 flex items-center justify-between px-6">
        <div className="flex flex-col pl-10 lg:pl-0 min-w-0">
          <h2
            id="page-heading"
            tabIndex={-1}
            className="text-foreground text-[16px] truncate outline-none"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h2>
          <Breadcrumb />
        </div>

        <div className="flex items-center gap-1.5">
          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Tìm kiếm... (Ctrl+K)"
              aria-label="Tìm kiếm"
              className="pl-9 pr-4 py-2 bg-surface-2 rounded-xl text-[13px] w-52 border border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 transition-all outline-none cursor-pointer hover:bg-surface-3 placeholder:text-muted-foreground/40"
              onFocus={() => navigate('/search')}
              readOnly
            />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-xl hover:bg-accent transition-all duration-200 active:scale-95"
            title={resolvedTheme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
            aria-label={resolvedTheme === 'dark' ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
          >
            <motion.div
              key={resolvedTheme}
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-[18px] h-[18px] text-amber-400" />
              ) : (
                <Moon className="w-[18px] h-[18px] text-muted-foreground" />
              )}
            </motion.div>
          </button>

          {/* Role Switcher */}
          <div className="flex items-center bg-surface-2 rounded-xl p-0.5 gap-0.5">
            {([
              { userId: 'user-vms-tt', label: 'Thủ trưởng', shortLabel: 'TT', icon: Shield, color: 'violet' },
              { userId: 'user-vms-cb', label: 'CB P.QHQT', shortLabel: 'CB', icon: Users, color: 'cyan' },
            ] as const).map((role) => {
              const isActive = user?.id === role.userId;
              const RIcon = role.icon;
              return (
                <button
                  key={role.userId}
                  onClick={() => {
                    if (!isActive) {
                      switchUser(role.userId);
                      sonnerToast.success(`Đã chuyển sang vai trò: ${role.label}`);
                    }
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] transition-all duration-200 ${
                    isActive
                      ? role.color === 'violet'
                        ? 'bg-violet-600 text-white shadow-sm'
                        : 'bg-cyan-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:bg-accent'
                  }`}
                  title={`Chuyển sang: ${role.label}`}
                  aria-label={`Chuyển vai trò: ${role.label}`}
                  aria-pressed={isActive}
                >
                  <RIcon className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{role.label}</span>
                  <span className="lg:hidden">{role.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              ref={notifBtnRef}
              onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
              className="relative p-2 rounded-xl hover:bg-accent transition-all duration-200 active:scale-95"
              aria-label={`Thông báo${unreadCount > 0 ? `, ${unreadCount} chưa đọc` : ''}`}
              aria-expanded={showNotif}
              aria-haspopup="true"
            >
              <Bell className="w-[18px] h-[18px] text-muted-foreground" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center"
                  style={{ boxShadow: '0 0 0 2px var(--card)' }}
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </button>
            <AnimatePresence>
              {showNotif && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-12 w-[400px] bg-card rounded-2xl border border-border z-50 overflow-hidden"
                  style={{ boxShadow: 'var(--shadow-xl)' }}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] text-foreground" style={{ fontFamily: "var(--font-display)" }}>Thông báo</h4>
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">{unreadCount} mới</span>
                      )}
                    </div>
                    <div className="flex items-center gap-0.5">
                      <button onClick={markAllRead} className="p-1.5 hover:bg-accent rounded-lg transition-colors" title="Đọc tất cả" aria-label="Đánh dấu tất cả đã đọc">
                        <Check className="w-4 h-4 text-muted-foreground" />
                      </button>
                      <button onClick={() => setShowNotif(false)} className="p-1.5 hover:bg-accent rounded-lg transition-colors" aria-label="Đóng thông báo">
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto" ref={notifListRef} role="listbox" aria-label="Danh sách thông báo">
                    {notifications.slice(0, 8).map((n, idx) => {
                      const typeCfg = notificationTypeConfig[n.type];
                      const TypeIcon = typeIcons[n.type];
                      return (
                        <motion.div
                          key={n.id}
                          data-notif-item
                          tabIndex={-1}
                          role="option"
                          aria-selected={!n.read}
                          aria-label={`${n.title}${n.priority === 'urgent' ? ' - Khẩn' : ''}, ${formatTime(n.timestamp)}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className={`flex items-start gap-3 px-4 py-3 border-b border-border/50 hover:bg-accent/50 focus:bg-accent/50 transition-colors cursor-pointer outline-none ${
                            !n.read ? 'bg-primary/[0.03]' : ''
                          }`}
                          onClick={() => { markAsRead(n.id); if (n.link) { setShowNotif(false); navigate(n.link); } }}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); markAsRead(n.id); if (n.link) { setShowNotif(false); navigate(n.link); } } }}
                        >
                          <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${typeCfg.bg}`}>
                            <TypeIcon className={`w-4 h-4 ${typeCfg.color}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <p className={`text-[13px] leading-snug truncate ${!n.read ? 'text-foreground' : 'text-muted-foreground'}`}>{n.title}</p>
                              {n.priority === 'urgent' && (
                                <span className="text-[8px] px-1 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 shrink-0">Khẩn</span>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground line-clamp-1">{n.message}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{formatTime(n.timestamp)}</p>
                          </div>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
                        </motion.div>
                      );
                    })}
                  </div>
                  <div className="px-4 py-2.5 text-center border-t border-border bg-surface-2/50">
                    <button onClick={() => { setShowNotif(false); navigate('/notifications'); }}
                      className="text-[13px] text-primary hover:underline">Xem tất cả thông báo</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Divider */}
          <div className="w-px h-6 bg-border mx-1 hidden md:block" />

          {/* User Profile */}
          <div className="relative" ref={profileRef}>
            <button
              ref={profileBtnRef}
              onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
              className="flex items-center gap-2.5 pl-2 pr-2 py-1.5 rounded-xl hover:bg-accent transition-all duration-200 active:scale-[0.98]"
              aria-label="Menu người dùng"
              aria-expanded={showProfile}
              aria-haspopup="true"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-[11px]">
                  {user?.avatar || 'U'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-card" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[13px] text-foreground leading-tight">{user?.fullName || 'User'}</p>
                <p className="text-[11px] text-muted-foreground leading-tight">{roleName}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50 hidden md:block" />
            </button>
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute right-0 top-12 w-56 bg-card rounded-2xl border border-border z-50 overflow-hidden py-1"
                  style={{ boxShadow: 'var(--shadow-xl)' }}
                  ref={profileMenuRef}
                >
                  <div className="px-4 py-3 border-b border-border">
                    <p className="text-[13px] text-foreground">{user?.fullName}</p>
                    <p className="text-[11px] text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="py-1" role="menu" aria-label="Tài khoản">
                    <button role="menuitem" tabIndex={-1} onClick={() => { setShowProfile(false); navigate('/settings'); }}
                      className="w-full text-left px-4 py-2 text-[13px] hover:bg-accent transition-colors flex items-center gap-2.5 text-foreground">
                      <User className="w-4 h-4 text-muted-foreground" /> Thông tin cá nhân
                    </button>
                    <button role="menuitem" tabIndex={-1} onClick={() => { setShowProfile(false); navigate('/settings'); }}
                      className="w-full text-left px-4 py-2 text-[13px] hover:bg-accent transition-colors flex items-center gap-2.5 text-foreground">
                      <Key className="w-4 h-4 text-muted-foreground" /> Đổi mật khẩu
                    </button>
                  </div>
                  <div className="border-t border-border py-1" role="menu" aria-label="Phiên làm việc">
                    <button role="menuitem" tabIndex={-1} onClick={() => { setShowProfile(false); logout(); navigate('/login'); }}
                      className="w-full text-left px-4 py-2 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2.5">
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}