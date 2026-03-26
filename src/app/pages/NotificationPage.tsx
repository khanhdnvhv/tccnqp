import { useState, useMemo, useEffect } from 'react';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { EmptyState } from '../components/EmptyState';
import { initialNotifications, notificationTypeConfig, type EnhancedNotification, type NotificationType } from '../data/notificationData';
import { useNavigate } from 'react-router';
import { toast as sonnerToast } from 'sonner';
import { useDebounce } from '../hooks/useDebounce';
import {
  Bell, BellOff, Check, CheckCheck, Star, Trash2, Filter, Search,
  FileInput, FileOutput, FileText, GitBranch, ClipboardList, Calendar,
  Settings, X, Clock, AlertCircle, ChevronRight, Archive,
  type LucideIcon,
} from 'lucide-react';

const typeIcons: Record<NotificationType, LucideIcon> = {
  doc_incoming: FileInput,
  doc_outgoing: FileOutput,
  doc_internal: FileText,
  workflow: GitBranch,
  task: ClipboardList,
  calendar: Calendar,
  system: Settings,
  reminder: Bell,
};

// Simulated realtime notifications
const realtimeMessages: Omit<EnhancedNotification, 'id' | 'timestamp'>[] = [
  { title: 'Ý kiến mới trên văn bản', message: 'Trần Văn Minh đã thêm ý kiến chỉ đạo trên VB #1245/UBND-VP.', type: 'workflow', read: false, starred: false, link: '/incoming', refType: 'document', actorName: 'Trần Văn Minh', actorAvatar: 'TVM', priority: 'normal' },
  { title: 'Công việc mới được giao', message: 'Bạn vừa được giao công việc "Lập báo cáo tổng hợp tháng 3/2026".', type: 'task', read: false, starred: false, link: '/tasks', refType: 'task', priority: 'normal' },
  { title: 'Nhắc: Họp giao ban ngày mai', message: 'Ngày mai 08:00 có cuộc họp giao ban đầu tuần tại Phòng họp A1.', type: 'calendar', read: false, starred: false, link: '/calendar', refType: 'event', priority: 'normal' },
];

export function NotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<EnhancedNotification[]>(initialNotifications);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveEnabled, setLiveEnabled] = useState(true);

  const showToast = (msg: string) => { sonnerToast.success(msg); };

  // Simulate realtime notifications
  useEffect(() => {
    if (!liveEnabled) return;
    let msgIdx = 0;
    const interval = setInterval(() => {
      if (msgIdx < realtimeMessages.length) {
        const msg = realtimeMessages[msgIdx];
        const newNotif: EnhancedNotification = {
          ...msg,
          id: `NOTIF-LIVE-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        setNotifications((prev) => [newNotif, ...prev]);
        msgIdx++;
      }
    }, 12000); // every 12 seconds
    return () => clearInterval(interval);
  }, [liveEnabled]);

  const debouncedSearch = useDebounce(searchQuery, 250);

  const filtered = useMemo(() => {
    return notifications.filter((n) => {
      const matchType = typeFilter === 'all' || n.type === typeFilter;
      const matchRead = readFilter === 'all' || (readFilter === 'unread' && !n.read) || (readFilter === 'read' && n.read) || (readFilter === 'starred' && n.starred);
      const matchSearch = debouncedSearch === '' || n.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || n.message.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchType && matchRead && matchSearch;
    });
  }, [notifications, typeFilter, readFilter, debouncedSearch]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const starredCount = notifications.filter((n) => n.starred).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Đã đánh dấu tất cả đã đọc');
  };

  const toggleStar = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, starred: !n.starred } : n));
  };

  const deleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast('Đã xóa thông báo');
  };

  const clearAll = () => {
    setNotifications((prev) => prev.filter((n) => n.starred));
    showToast('Đã xóa tất cả thông báo (trừ starred)');
  };

  const handleClick = (notif: EnhancedNotification) => {
    markAsRead(notif.id);
    if (notif.link) navigate(notif.link);
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
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  // Group by date
  const grouped = useMemo(() => {
    const groups: Record<string, EnhancedNotification[]> = {};
    filtered.forEach((n) => {
      const date = new Date(n.timestamp).toLocaleDateString('vi-VN');
      if (!groups[date]) groups[date] = [];
      groups[date].push(n);
    });
    return Object.entries(groups);
  }, [filtered]);

  const typeOptions = [
    { value: 'all', label: 'Tất cả' },
    ...Object.entries(notificationTypeConfig).map(([key, cfg]) => ({ value: key, label: cfg.label })),
  ];

  return (
    <PageTransition>
      <Header title="Thông báo" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3" style={{ boxShadow: 'var(--shadow-xs)' }}>
            <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[22px] text-foreground" style={{ fontFamily: "var(--font-display)" }}>{notifications.length}</p>
              <p className="text-[12px] text-muted-foreground">Tổng thông báo</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3" style={{ boxShadow: 'var(--shadow-xs)' }}>
            <div className="w-11 h-11 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-[22px] text-foreground" style={{ fontFamily: "var(--font-display)" }}>{unreadCount}</p>
              <p className="text-[12px] text-muted-foreground">Chưa đọc</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3" style={{ boxShadow: 'var(--shadow-xs)' }}>
            <div className="w-11 h-11 rounded-lg bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-[22px] text-foreground">{starredCount}</p>
              <p className="text-[12px] text-muted-foreground">Đánh dấu</p>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 cursor-pointer" style={{ boxShadow: 'var(--shadow-xs)' }} onClick={() => setLiveEnabled(!liveEnabled)}
            role="switch" aria-checked={liveEnabled} aria-label="Bật/tắt thông báo realtime" tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setLiveEnabled(!liveEnabled); } }}>
            <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${liveEnabled ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
              {liveEnabled ? <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> : <BellOff className="w-5 h-5 text-gray-400" />}
            </div>
            <div>
              <p className={`text-[14px] ${liveEnabled ? 'text-emerald-600' : 'text-muted-foreground'}`}>{liveEnabled ? 'Bật' : 'Tắt'}</p>
              <p className="text-[12px] text-muted-foreground">Realtime</p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-card rounded-xl border border-border p-4" style={{ boxShadow: 'var(--shadow-xs)' }}>
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <input type="text" placeholder="Tìm kiếm thông báo..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Tìm kiếm thông báo"
                className="w-full pl-9 pr-4 py-2.5 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/40" />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-muted-foreground/50" />
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                aria-label="Lọc theo loại thông báo"
                className="px-3 py-2 bg-surface-2 rounded-lg text-[13px] border border-transparent focus:border-primary/20 outline-none cursor-pointer text-foreground">
                {typeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={readFilter} onChange={(e) => setReadFilter(e.target.value)}
                aria-label="Lọc theo trạng thái đọc"
                className="px-3 py-2 bg-surface-2 rounded-lg text-[13px] border border-transparent focus:border-primary/20 outline-none cursor-pointer text-foreground">
                <option value="all">Tất cả</option>
                <option value="unread">Chưa đọc</option>
                <option value="read">Đã đọc</option>
                <option value="starred">Đánh dấu</option>
              </select>
            </div>
            <div className="flex items-center gap-2 lg:ml-auto">
              <button onClick={markAllRead} disabled={unreadCount === 0}
                className="flex items-center gap-1.5 px-3 py-2 bg-surface-2 rounded-lg text-[13px] text-muted-foreground hover:bg-accent disabled:opacity-40 transition-colors">
                <CheckCheck className="w-4 h-4" /> Đọc tất cả
              </button>
              <button onClick={clearAll}
                className="flex items-center gap-1.5 px-3 py-2 bg-surface-2 rounded-lg text-[13px] text-muted-foreground hover:bg-accent transition-colors">
                <Trash2 className="w-4 h-4" /> Xóa đã đọc
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4" aria-live="polite" aria-label="Danh sách thông báo">
          {grouped.length === 0 && (
            <EmptyState
              icon={Bell}
              title="Không có thông báo nào"
              description={searchQuery || typeFilter !== 'all' || readFilter !== 'all'
                ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                : "Bạn đã xem hết tất cả thông báo"}
            />
          )}
          {grouped.map(([date, notifs]) => (
            <div key={date} role="group" aria-label={`Thông báo ngày ${date}`}>
              <div className="flex items-center gap-2 mb-2 px-1">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[12px] text-muted-foreground">{date}</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border/50" style={{ boxShadow: 'var(--shadow-xs)' }}>
                {notifs.map((notif) => {
                  const typeCfg = notificationTypeConfig[notif.type];
                  const TypeIcon = typeIcons[notif.type];
                  return (
                    <article key={notif.id}
                      aria-label={`${notif.title}${!notif.read ? ' — chưa đọc' : ''}`}
                      className={`flex items-start gap-3 px-4 py-3.5 hover:bg-accent/30 transition-colors cursor-pointer group ${
                        !notif.read ? 'bg-primary/[0.02]' : ''
                      }`}
                      onClick={() => handleClick(notif)}
                    >
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${typeCfg.bg}`}>
                        <TypeIcon className={`w-4 h-4 ${typeCfg.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className={`text-[13px] ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>{notif.title}</h4>
                          {notif.priority === 'urgent' && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">Khẩn</span>
                          )}
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${typeCfg.bg} ${typeCfg.color}`}>{typeCfg.label}</span>
                        </div>
                        <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{notif.message}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          {notif.actorName && (
                            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <span className="w-4 h-4 rounded-full bg-gradient-to-br from-primary/60 to-blue-400 flex items-center justify-center text-white text-[7px]">{notif.actorAvatar}</span>
                              {notif.actorName}
                            </span>
                          )}
                          <span className="text-[11px] text-muted-foreground">{formatTime(notif.timestamp)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        {!notif.read && (
                          <button onClick={() => markAsRead(notif.id)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Đánh dấu đã đọc" aria-label="Đánh dấu đã đọc">
                            <Check className="w-3.5 h-3.5 text-muted-foreground" />
                          </button>
                        )}
                        <button onClick={() => toggleStar(notif.id)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Đánh dấu" aria-label={notif.starred ? 'Bỏ đánh dấu' : 'Đánh dấu sao'}>
                          <Star className={`w-3.5 h-3.5 ${notif.starred ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'}`} />
                        </button>
                        <button onClick={() => deleteNotif(notif.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Xóa" aria-label="Xóa thông báo">
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      </div>

                      {/* Unread dot */}
                      {!notif.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-3" aria-hidden="true" />}
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}