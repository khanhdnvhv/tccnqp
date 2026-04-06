import { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { EmptyState } from '../components/EmptyState';
import { initialNotifications, notificationTypeConfig, type EnhancedNotification, type NotificationType } from '../data/notificationData';
import {
  getUnapprovedUpcomingDelegations, getAllPendingDelegations,
  delegationStatusLabels, delegationStatusColors, priorityLabels, priorityColors,
  type DelegationAlert, type AlertUrgency, type Delegation,
} from '../data/delegationData';
import { useNavigate } from 'react-router';
import { toast as sonnerToast } from 'sonner';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';
import {
  Bell, BellOff, Check, CheckCheck, Star, Trash2, Filter, Search,
  FileInput, FileOutput, FileText, GitBranch, ClipboardList, Calendar,
  Settings, X, Clock, AlertCircle, ChevronRight, Archive,
  Users, AlertTriangle, ShieldAlert, Info, Eye, Send,
  SlidersHorizontal, CheckCircle2, XCircle, FileWarning,
  Timer, Building2, Shield, MapPin, ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ======== TAB DEFINITIONS ========
type PageTab = 'alerts' | 'notifications';

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

// ======== URGENCY CONFIG ========
const urgencyConfig: Record<AlertUrgency, {
  border: string; bg: string; iconBg: string; iconColor: string;
  label: string; labelBg: string; Icon: LucideIcon; pulse: boolean;
}> = {
  overdue: {
    border: 'border-red-400 dark:border-red-600',
    bg: 'bg-red-50/80 dark:bg-red-950/50',
    iconBg: 'bg-red-100 dark:bg-red-900/60',
    iconColor: 'text-red-600 dark:text-red-400',
    label: 'Quá hạn',
    labelBg: 'bg-red-600 text-white',
    Icon: XCircle,
    pulse: true,
  },
  critical: {
    border: 'border-red-300 dark:border-red-700',
    bg: 'bg-red-50 dark:bg-red-950/40',
    iconBg: 'bg-red-100 dark:bg-red-900/50',
    iconColor: 'text-red-600 dark:text-red-400',
    label: 'Khẩn cấp',
    labelBg: 'bg-red-100 text-red-700 dark:bg-red-900/60 dark:text-red-300',
    Icon: AlertTriangle,
    pulse: true,
  },
  warning: {
    border: 'border-amber-300 dark:border-amber-700',
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
    iconColor: 'text-amber-600 dark:text-amber-400',
    label: 'Cảnh báo',
    labelBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    Icon: AlertCircle,
    pulse: false,
  },
  info: {
    border: 'border-blue-300 dark:border-blue-700',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50',
    iconColor: 'text-blue-600 dark:text-blue-400',
    label: 'Nhắc nhở',
    labelBg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    Icon: Info,
    pulse: false,
  },
};

// ======== APPROVAL DOC STATUS ========
const approvalDocConfig = {
  none: { label: 'Chưa có VB', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/40', icon: XCircle },
  pending: { label: 'Đang chờ VB', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/40', icon: Timer },
  received: { label: 'Đã có VB', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/40', icon: CheckCircle2 },
};

// ======== ALERT FILTER ========
type AlertFilter = 'all' | AlertUrgency;

export function NotificationPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canApprove = hasPermission('delegation.approve');
  const canSubmit = hasPermission('delegation.submit');
  const [activeTab, setActiveTab] = useState<PageTab>('alerts');

  // ---- Alert state ----
  const [alertDays, setAlertDays] = useState<number>(() => {
    const saved = localStorage.getItem('vms_alert_days');
    return saved ? parseInt(saved, 10) : 3;
  });
  const [alertFilter, setAlertFilter] = useState<AlertFilter>('all');
  const [alertSearch, setAlertSearch] = useState('');
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);

  const debouncedAlertSearch = useDebounce(alertSearch, 250);

  const delegationAlerts = useMemo(() => getUnapprovedUpcomingDelegations(alertDays), [alertDays]);
  const allPending = useMemo(() => getAllPendingDelegations(), []);

  const filteredAlerts = useMemo(() => {
    return delegationAlerts
      .filter((a) => !dismissedAlerts.includes(a.delegation.id))
      .filter((a) => alertFilter === 'all' || a.urgencyLevel === alertFilter)
      .filter((a) => {
        if (!debouncedAlertSearch) return true;
        const q = debouncedAlertSearch.toLowerCase();
        const d = a.delegation;
        return d.title.toLowerCase().includes(q) || d.partnerName.toLowerCase().includes(q) || d.code.toLowerCase().includes(q) || d.hostName.toLowerCase().includes(q);
      });
  }, [delegationAlerts, dismissedAlerts, alertFilter, debouncedAlertSearch]);

  // Count by urgency
  const urgencyCounts = useMemo(() => {
    const counts: Record<AlertUrgency, number> = { overdue: 0, critical: 0, warning: 0, info: 0 };
    delegationAlerts.forEach((a) => { if (!dismissedAlerts.includes(a.delegation.id)) counts[a.urgencyLevel]++; });
    return counts;
  }, [delegationAlerts, dismissedAlerts]);

  const totalAlertCount = urgencyCounts.overdue + urgencyCounts.critical + urgencyCounts.warning + urgencyCounts.info;

  const handleSetAlertDays = (days: number) => {
    setAlertDays(days);
    localStorage.setItem('vms_alert_days', String(days));
    sonnerToast.success(`Đã cập nhật: cảnh báo trước ${days} ngày`);
  };

  const dismissAlert = useCallback((id: string) => {
    setDismissedAlerts((prev) => [...prev, id]);
    sonnerToast.info('Đã ẩn cảnh báo');
  }, []);

  const restoreAllAlerts = useCallback(() => {
    setDismissedAlerts([]);
    sonnerToast.success('Đã khôi phục tất cả cảnh báo');
  }, []);

  // ---- Notification state ----
  const [notifications, setNotifications] = useState<EnhancedNotification[]>(initialNotifications);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [liveEnabled, setLiveEnabled] = useState(true);

  const showToast = (msg: string) => { sonnerToast.success(msg); };

  useEffect(() => {
    if (!liveEnabled) return;
    let msgIdx = 0;
    const interval = setInterval(() => {
      if (msgIdx < realtimeMessages.length) {
        const msg = realtimeMessages[msgIdx];
        const newNotif: EnhancedNotification = { ...msg, id: `NOTIF-LIVE-${Date.now()}`, timestamp: new Date().toISOString() };
        setNotifications((prev) => [newNotif, ...prev]);
        msgIdx++;
      }
    }, 12000);
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

  const markAsRead = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => { setNotifications((prev) => prev.map((n) => ({ ...n, read: true }))); showToast('Đã đánh dấu tất cả đã đọc'); };
  const toggleStar = (id: string) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, starred: !n.starred } : n));
  const deleteNotif = (id: string) => { setNotifications((prev) => prev.filter((n) => n.id !== id)); showToast('Đã xóa thông báo'); };
  const clearAll = () => { setNotifications((prev) => prev.filter((n) => n.starred)); showToast('Đã xóa tất cả thông báo (trừ starred)'); };
  const handleClick = (notif: EnhancedNotification) => { markAsRead(notif.id); if (notif.link) navigate(notif.link); };

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

  // ======== HELPER: format days text ========
  const formatDaysText = (days: number) => {
    if (days < 0) return `Quá hạn ${Math.abs(days)} ngày`;
    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Ngày mai';
    return `Còn ${days} ngày`;
  };

  // ======== RENDER ========
  return (
    <PageTransition>
      <Header title="Cảnh báo & Thông báo" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* ======== TAB SWITCHER ======== */}
        <div className="flex items-center gap-1 bg-card rounded-xl border border-border p-1" style={{ boxShadow: 'var(--shadow-xs)' }}>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] transition-all flex-1 justify-center ${
              activeTab === 'alerts' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            Cảnh báo Đoàn vào
            {totalAlertCount > 0 && (
              <span className={`min-w-[20px] h-[20px] px-1.5 text-[10px] rounded-full flex items-center justify-center ${
                activeTab === 'alerts' ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
              }`}>
                {totalAlertCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] transition-all flex-1 justify-center ${
              activeTab === 'notifications' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent'
            }`}
          >
            <Bell className="w-4 h-4" />
            Thông báo chung
            {unreadCount > 0 && (
              <span className={`min-w-[20px] h-[20px] px-1.5 text-[10px] rounded-full flex items-center justify-center ${
                activeTab === 'notifications' ? 'bg-white/20 text-white' : 'bg-red-500 text-white'
              }`}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* ========================================================== */}
        {/* TAB: CẢNH BÁO ĐOÀN VÀO                                    */}
        {/* ========================================================== */}
        {activeTab === 'alerts' && (
          <div className="space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {([
                { key: 'all' as AlertFilter, label: 'Tổng cảnh báo', count: totalAlertCount, icon: ShieldAlert, color: 'blue', active: totalAlertCount > 0 },
                { key: 'overdue' as AlertFilter, label: 'Quá hạn', count: urgencyCounts.overdue, icon: XCircle, color: 'red', active: urgencyCounts.overdue > 0 },
                { key: 'critical' as AlertFilter, label: 'Khẩn cấp (0-1 ngày)', count: urgencyCounts.critical, icon: AlertTriangle, color: 'red', active: urgencyCounts.critical > 0 },
                { key: 'warning' as AlertFilter, label: 'Cảnh báo (2 ngày)', count: urgencyCounts.warning, icon: AlertCircle, color: 'amber', active: urgencyCounts.warning > 0 },
                { key: 'info' as AlertFilter, label: `Nhắc nhở (3 ngày)`, count: urgencyCounts.info, icon: Info, color: 'blue', active: urgencyCounts.info > 0 },
              ]).map((stat) => {
                const isSelected = alertFilter === stat.key;
                const IconComp = stat.icon;
                const colorMap: Record<string, { iconBg: string; iconText: string; activeIconBg: string; activeText: string }> = {
                  blue: { iconBg: 'bg-blue-50 dark:bg-blue-900/30', iconText: 'text-blue-600 dark:text-blue-400', activeIconBg: 'bg-blue-100 dark:bg-blue-800/40', activeText: 'text-blue-600 dark:text-blue-400' },
                  red: { iconBg: 'bg-red-50 dark:bg-red-900/30', iconText: 'text-red-600 dark:text-red-400', activeIconBg: 'bg-red-100 dark:bg-red-800/40', activeText: 'text-red-600 dark:text-red-400' },
                  amber: { iconBg: 'bg-amber-50 dark:bg-amber-900/30', iconText: 'text-amber-600 dark:text-amber-400', activeIconBg: 'bg-amber-100 dark:bg-amber-800/40', activeText: 'text-amber-600 dark:text-amber-400' },
                };
                const c = colorMap[stat.color];
                return (
                  <button
                    key={stat.key}
                    onClick={() => setAlertFilter(stat.key)}
                    className={`bg-card rounded-xl border p-3 flex items-center gap-3 transition-all text-left ${
                      isSelected ? `border-primary/40 ring-2 ring-primary/10` : 'border-border hover:bg-accent/30'
                    }`}
                    style={{ boxShadow: 'var(--shadow-xs)' }}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${stat.active ? c.iconBg : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <IconComp className={`w-5 h-5 ${stat.active ? c.iconText : 'text-gray-400'}`} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[20px] leading-none ${stat.active ? c.activeText : 'text-foreground'}`} style={{ fontFamily: 'var(--font-display)' }}>{stat.count}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{stat.label}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Toolbar */}
            <div className="bg-card rounded-xl border border-border p-3" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                  <input
                    type="text" placeholder="Tìm đoàn, đối tác, mã đoàn..."
                    value={alertSearch} onChange={(e) => setAlertSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-surface-2 rounded-lg text-[13px] border border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/40"
                  />
                </div>
                <div className="flex items-center gap-2 sm:ml-auto flex-wrap">
                  {dismissedAlerts.length > 0 && (
                    <button onClick={restoreAllAlerts} className="flex items-center gap-1.5 px-3 py-2 bg-surface-2 rounded-lg text-[12px] text-muted-foreground hover:bg-accent transition-colors">
                      <Archive className="w-3.5 h-3.5" /> Khôi phục ({dismissedAlerts.length})
                    </button>
                  )}
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] transition-colors ${showSettings ? 'bg-primary/10 text-primary' : 'bg-surface-2 text-muted-foreground hover:bg-accent'}`}
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" /> Cài đặt
                  </button>
                </div>
              </div>

              {/* Settings panel */}
              <AnimatePresence>
                {showSettings && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-3 mt-3 border-t border-border">
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="text-[12px] text-muted-foreground">Nhắc nhở trước:</span>
                        {[1, 2, 3, 5, 7].map((d) => (
                          <button
                            key={d}
                            onClick={() => handleSetAlertDays(d)}
                            className={`px-3 py-1.5 rounded-lg text-[12px] transition-all ${
                              alertDays === d ? 'bg-primary text-primary-foreground shadow-sm' : 'bg-surface-2 text-muted-foreground hover:bg-accent'
                            }`}
                          >
                            {d} ngày
                          </button>
                        ))}
                      </div>
                      <p className="text-[11px] text-muted-foreground/60 mt-2">
                        Hệ thống sẽ cảnh báo các đoàn vào chưa được duyệt trong vòng {alertDays} ngày tới (bao gồm cả đoàn đã quá hạn).
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Alert cards */}
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredAlerts.length === 0 && (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <EmptyState
                      icon={CheckCircle2}
                      title={alertFilter !== 'all' || debouncedAlertSearch
                        ? 'Không tìm thấy cảnh báo phù hợp'
                        : 'Không có cảnh báo nào'}
                      description={alertFilter !== 'all' || debouncedAlertSearch
                        ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                        : `Tất cả đoàn vào trong ${alertDays} ngày tới đều đã được duyệt`}
                    />
                  </motion.div>
                )}

                {filteredAlerts.map((alert, idx) => {
                  const { delegation: del, daysUntil, urgencyLevel: level } = alert;
                  const cfg = urgencyConfig[level];
                  const UrgencyIcon = cfg.Icon;
                  const statusColor = delegationStatusColors[del.status];
                  const pColor = priorityColors[del.priority];
                  const docCfg = approvalDocConfig[del.approvalDocStatus];
                  const DocIcon = docCfg.icon;
                  const scheduledDate = new Date(del.scheduledDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
                  const endDate = new Date(del.scheduledEndDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
                  const daysText = formatDaysText(daysUntil);

                  return (
                    <motion.div
                      key={del.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: idx * 0.05 }}
                      className={`relative rounded-xl border-2 ${cfg.border} ${cfg.bg} p-5 transition-all hover:shadow-lg group`}
                      style={{ boxShadow: 'var(--shadow-sm)' }}
                      role="alert"
                    >
                      {/* Dismiss */}
                      <button
                        onClick={() => dismissAlert(del.id)}
                        className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Ẩn cảnh báo" title="Ẩn cảnh báo"
                      >
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>

                      {/* Pulse indicator for critical/overdue */}
                      {cfg.pulse && (
                        <div className="absolute top-4 right-12">
                          <span className="relative flex h-3 w-3">
                            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${level === 'overdue' ? 'bg-red-500' : 'bg-red-400'}`} />
                            <span className={`relative inline-flex rounded-full h-3 w-3 ${level === 'overdue' ? 'bg-red-600' : 'bg-red-500'}`} />
                          </span>
                        </div>
                      )}

                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div className={`w-14 h-14 rounded-xl ${cfg.iconBg} flex items-center justify-center shrink-0`}>
                          <UrgencyIcon className={`w-7 h-7 ${cfg.iconColor}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          {/* Top badges */}
                          <div className="flex items-center gap-2 flex-wrap mb-1.5">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${cfg.labelBg}`}>{cfg.label}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusColor.bg} ${statusColor.text}`}>
                              {delegationStatusLabels[del.status]}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full ${pColor.bg} ${pColor.text}`}>
                              {del.priority === 'directive' && '★ '}{priorityLabels[del.priority]}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${docCfg.bg} ${docCfg.color}`}>
                              <DocIcon className="w-3 h-3" />{docCfg.label}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-[14px] text-foreground font-medium leading-snug mb-1.5 pr-12">
                            {del.title}
                          </h3>

                          {/* Code */}
                          <p className="text-[11px] text-muted-foreground/70 mb-2 font-mono">{del.code}</p>

                          {/* Info grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[12px] text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" />
                              <strong className="text-foreground/80">{del.partnerName}</strong> &middot; {del.members.length} thành viên
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" />
                              {scheduledDate} → {endDate}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" />
                              Tiếp đón: {del.hostName}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 shrink-0 text-muted-foreground/50" />
                              {del.hostUnit}
                              {del.meetingRoom && <> &middot; <MapPin className="w-3 h-3" /> {del.meetingRoom}</>}
                            </span>
                          </div>

                          {/* Purpose */}
                          <p className="text-[11px] text-muted-foreground/70 mt-2 line-clamp-1">
                            Mục đích: {del.purpose}
                          </p>

                          {/* Approval doc info */}
                          {del.approvalDocNumber && (
                            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                              <FileText className="w-3 h-3" /> Số VB: <span className="font-mono text-foreground/70">{del.approvalDocNumber}</span>
                            </p>
                          )}

                          {/* Bottom: time + actions */}
                          <div className="flex items-center gap-3 mt-3 flex-wrap">
                            <span className={`inline-flex items-center gap-1.5 text-[13px] font-bold ${cfg.iconColor}`}>
                              <Clock className="w-4 h-4" />
                              {daysText}
                            </span>

                            <div className="flex-1" />

                            {/* Action buttons */}
                            <div className="flex items-center gap-2">
                              {del.status === 'draft' && canSubmit && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); navigate('/delegations'); sonnerToast.info(`Vui lòng trình duyệt đoàn "${del.code}"`); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-sm"
                                >
                                  <Send className="w-3.5 h-3.5" /> Trình duyệt
                                </button>
                              )}
                              {del.status === 'pending_approval' && canApprove && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); navigate('/delegations'); sonnerToast.info(`Vui lòng phê duyệt đoàn "${del.code}"`); }}
                                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-sm"
                                >
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Phê duyệt
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); navigate('/delegations'); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] bg-surface-2 text-muted-foreground hover:bg-accent transition-colors border border-border"
                              >
                                <Eye className="w-3.5 h-3.5" /> Xem chi tiết
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Summary: tất cả đoàn chưa duyệt */}
            {allPending.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4" style={{ boxShadow: 'var(--shadow-xs)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <FileWarning className="w-4 h-4 text-amber-500" />
                  <h3 className="text-[13px] text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                    Tổng hợp Đoàn chưa duyệt ({allPending.length})
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border">
                        <th className="pb-2 pr-3 font-medium">Mã đoàn</th>
                        <th className="pb-2 pr-3 font-medium">Đối tác</th>
                        <th className="pb-2 pr-3 font-medium">Ngày dự kiến</th>
                        <th className="pb-2 pr-3 font-medium">Thời gian</th>
                        <th className="pb-2 pr-3 font-medium">Trạng thái</th>
                        <th className="pb-2 pr-3 font-medium">VB đồng ý</th>
                        <th className="pb-2 font-medium">Ưu tiên</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {allPending.map((d) => {
                        const sc = delegationStatusColors[d.status];
                        const pc = priorityColors[d.priority];
                        const dc = approvalDocConfig[d.approvalDocStatus];
                        const DIcon = dc.icon;
                        const isUrgent = d.daysUntil <= 3;
                        return (
                          <tr key={d.id} className={`hover:bg-accent/20 cursor-pointer transition-colors ${isUrgent ? 'bg-red-50/30 dark:bg-red-950/10' : ''}`} onClick={() => navigate('/delegations')}>
                            <td className="py-2.5 pr-3 font-mono text-foreground/70">{d.code}</td>
                            <td className="py-2.5 pr-3 text-foreground">{d.partnerName}</td>
                            <td className="py-2.5 pr-3">{new Date(d.scheduledDate).toLocaleDateString('vi-VN')}</td>
                            <td className={`py-2.5 pr-3 font-medium ${d.daysUntil < 0 ? 'text-red-600' : d.daysUntil <= 1 ? 'text-red-500' : d.daysUntil <= 3 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                              {formatDaysText(d.daysUntil)}
                            </td>
                            <td className="py-2.5 pr-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] ${sc.bg} ${sc.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                                {delegationStatusLabels[d.status]}
                              </span>
                            </td>
                            <td className="py-2.5 pr-3">
                              <span className={`inline-flex items-center gap-1 text-[11px] ${dc.color}`}>
                                <DIcon className="w-3 h-3" />{dc.label}
                              </span>
                            </td>
                            <td className="py-2.5">
                              <span className={`text-[10px] px-2 py-0.5 rounded-md ${pc.bg} ${pc.text}`}>
                                {priorityLabels[d.priority]}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* TAB: THÔNG BÁO CHUNG                                       */}
        {/* ========================================================== */}
        {activeTab === 'notifications' && (
          <div className="space-y-4">
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
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${typeCfg.bg}`}>
                            <TypeIcon className={`w-4 h-4 ${typeCfg.color}`} />
                          </div>
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
                          {!notif.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-3" aria-hidden="true" />}
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </PageTransition>
  );
}
