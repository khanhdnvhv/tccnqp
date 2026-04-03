import { motion } from 'motion/react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useState, useMemo, useCallback } from 'react';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import {
  delegations,
  delegationStatusLabels,
  delegationStatusColors,
  priorityLabels,
  priorityColors,
  getDelegationStats,
  type Delegation,
  type DelegationStatus,
} from '../data/delegationData';
import { doanVaoData, doanRaData } from '../data/reportData';
import {
  Users, ArrowDownToLine, ArrowUpFromLine, AlertTriangle,
  ChevronLeft, ChevronRight, Calendar, Clock, MapPin,
  ArrowRight, Shield, BarChart3, Building2, Eye, X,
  FileText, UserCheck, Gift, Flag, Bell,
} from 'lucide-react';

// ---- Calendar helpers ----
const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }
function toDateStr(y: number, m: number, d: number) { return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`; }
function formatDate(iso: string) { return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }); }

// ---- Map delegation status to calendar color scheme ----
// Vàng = Đang làm thủ tục (draft, pending_approval)
// Xanh = Đã phê duyệt (approved, in_progress)
// Xám  = Đã hoàn thành (completed, cancelled)
type CalendarColor = 'yellow' | 'green' | 'gray';
function getCalendarColor(status: DelegationStatus): CalendarColor {
  if (status === 'draft' || status === 'pending_approval') return 'yellow';
  if (status === 'approved' || status === 'in_progress') return 'green';
  return 'gray';
}

const calendarColorStyles: Record<CalendarColor, { bg: string; border: string; text: string; dot: string }> = {
  yellow: { bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-300 dark:border-amber-700', text: 'text-amber-800 dark:text-amber-300', dot: 'bg-amber-500' },
  green: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', border: 'border-emerald-300 dark:border-emerald-700', text: 'text-emerald-800 dark:text-emerald-300', dot: 'bg-emerald-500' },
  gray: { bg: 'bg-gray-100 dark:bg-gray-800', border: 'border-gray-300 dark:border-gray-600', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
};

function StatusBadge({ status }: { status: DelegationStatus }) {
  const c = delegationStatusColors[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
      {delegationStatusLabels[status]}
    </span>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const reducedMotion = useReducedMotion();

  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState<string>('2026-04-05');
  const [viewDelegation, setViewDelegation] = useState<Delegation | null>(null);
  const viewRef = useFocusTrap<HTMLDivElement>(!!viewDelegation);

  const stats = useMemo(() => getDelegationStats(), []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  // Get delegations that overlap with a given date
  const getDelegationsForDay = useCallback((dateStr: string) => {
    return delegations.filter((d) => dateStr >= d.scheduledDate && dateStr <= d.scheduledEndDate);
  }, []);

  const selectedDayDelegations = useMemo(() => {
    return getDelegationsForDay(selectedDate).sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate));
  }, [selectedDate, getDelegationsForDay]);

  // Build calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  // Week view
  const weekDays = useMemo(() => {
    const d = new Date(selectedDate);
    const dow = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      return day;
    });
  }, [selectedDate]);

  // Upcoming alerts: delegations in next 3 days missing approval docs
  const urgentAlerts = useMemo(() => {
    return delegations.filter((d) => {
      if (d.priority === 'directive') return false;
      if (['completed', 'cancelled'].includes(d.status)) return false;
      if (d.approvalDocStatus === 'received') return false;
      const scheduled = new Date(d.scheduledDate);
      const diffDays = Math.ceil((scheduled.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 3;
    });
  }, []);

  // Summary numbers
  const totalDoanVao = doanVaoData.length;
  const totalDoanRa = doanRaData.length;
  const pendingCount = delegations.filter((d) => d.status === 'pending_approval' || d.status === 'draft').length;
  const approvedCount = delegations.filter((d) => d.status === 'approved' || d.status === 'in_progress').length;

  const daysUntil = (date: string) => Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <PageTransition>
      <Header title="Tổng quan" />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Urgent Alerts */}
        {urgentAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400" />
              <p className="text-[13px] text-red-800 dark:text-red-300" style={{ fontWeight: 600 }}>
                Cảnh báo: Đoàn sắp vào chưa có Văn bản đồng ý
              </p>
            </div>
            {urgentAlerts.map((d) => (
              <p key={d.id} className="text-[12px] text-red-700 dark:text-red-400 ml-6 mb-0.5">
                {d.code} — <strong>{d.partnerName}</strong> — {formatDate(d.scheduledDate)} (còn {daysUntil(d.scheduledDate)} ngày)
              </p>
            ))}
          </motion.div>
        )}

        {/* Welcome + Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              Chào mừng, {user?.fullName?.split(' ').pop() || 'Thủ trưởng'}!
            </h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              {today.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/delegations" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] text-white bg-primary hover:opacity-90 transition-all" style={{ boxShadow: 'var(--shadow-sm)' }}>
              <Users className="w-3.5 h-3.5" /> Quản lý Đoàn
            </Link>
            <Link to="/reports" className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] text-muted-foreground bg-card border border-border hover:bg-accent transition-all">
              <BarChart3 className="w-3.5 h-3.5" /> Báo cáo
            </Link>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: ArrowDownToLine, label: 'Đoàn vào (năm)', value: totalDoanVao, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { icon: ArrowUpFromLine, label: 'Đoàn ra (năm)', value: totalDoanRa, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
            { icon: Clock, label: 'Đang làm thủ tục', value: pendingCount, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { icon: Shield, label: 'Đã phê duyệt', value: approvedCount, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="p-4 rounded-xl border border-border bg-card"
              style={{ boxShadow: 'var(--shadow-xs)' }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-[22px] text-foreground leading-none" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Color Legend */}
        <div className="flex items-center gap-4 px-1">
          <span className="text-[11px] text-muted-foreground">Mã màu:</span>
          {[
            { color: 'yellow', label: 'Đang làm thủ tục' },
            { color: 'green', label: 'Đã phê duyệt' },
            { color: 'gray', label: 'Đã hoàn thành' },
          ].map((c) => (
            <span key={c.color} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className={`w-3 h-3 rounded-sm ${calendarColorStyles[c.color as CalendarColor].bg} border ${calendarColorStyles[c.color as CalendarColor].border}`} />
              {c.label}
            </span>
          ))}
        </div>

        {/* Calendar */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Calendar Grid */}
          <div className="xl:col-span-2 bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-xs)' }}>
            {/* Calendar Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-3">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-accent transition-colors" aria-label="Tháng trước">
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
                <h3 className="text-[15px] text-foreground min-w-[140px] text-center" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                  {monthNames[month]} {year}
                </h3>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-accent transition-colors" aria-label="Tháng sau">
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode('month')}
                  className={`px-3 py-1 rounded-md text-[12px] transition-all ${viewMode === 'month' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Tháng
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={`px-3 py-1 rounded-md text-[12px] transition-all ${viewMode === 'week' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Tuần
                </button>
              </div>
            </div>

            {/* Month View */}
            {viewMode === 'month' && (
              <div className="p-3">
                {/* Weekday headers */}
                <div className="grid grid-cols-7 mb-1">
                  {daysOfWeek.map((d) => (
                    <div key={d} className="text-center text-[10px] text-muted-foreground uppercase tracking-wider py-1.5">{d}</div>
                  ))}
                </div>
                {/* Days */}
                <div className="grid grid-cols-7 gap-px bg-border/30 rounded-lg overflow-hidden">
                  {calendarDays.map((day, idx) => {
                    if (day === null) return <div key={`e-${idx}`} className="bg-card min-h-[72px]" />;

                    const dateStr = toDateStr(year, month, day);
                    const dayDelegations = getDelegationsForDay(dateStr);
                    const isSelected = dateStr === selectedDate;
                    const isToday = dateStr === todayStr;

                    return (
                      <div
                        key={day}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`bg-card min-h-[72px] p-1 cursor-pointer transition-all hover:bg-accent/30 ${
                          isSelected ? 'ring-2 ring-primary ring-inset' : ''
                        }`}
                      >
                        <span className={`text-[11px] w-6 h-6 flex items-center justify-center rounded-full mb-0.5 ${
                          isToday ? 'bg-primary text-white' : 'text-foreground'
                        }`}>
                          {day}
                        </span>
                        <div className="space-y-0.5">
                          {dayDelegations.slice(0, 2).map((d) => {
                            const cc = calendarColorStyles[getCalendarColor(d.status)];
                            return (
                              <div
                                key={d.id}
                                onClick={(e) => { e.stopPropagation(); setViewDelegation(d); }}
                                className={`text-[9px] px-1 py-0.5 rounded ${cc.bg} ${cc.text} truncate cursor-pointer hover:opacity-80`}
                                title={`${d.partnerName} — ${delegationStatusLabels[d.status]}`}
                              >
                                {d.partnerName}
                              </div>
                            );
                          })}
                          {dayDelegations.length > 2 && (
                            <div className="text-[9px] text-muted-foreground text-center">+{dayDelegations.length - 2}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Week View */}
            {viewMode === 'week' && (
              <div className="p-3">
                <div className="space-y-1">
                  {weekDays.map((wd) => {
                    const dateStr = toDateStr(wd.getFullYear(), wd.getMonth(), wd.getDate());
                    const dayDelegations = getDelegationsForDay(dateStr);
                    const isToday = dateStr === todayStr;
                    const isSelected = dateStr === selectedDate;

                    return (
                      <div
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`flex gap-3 p-2.5 rounded-lg cursor-pointer transition-all ${
                          isSelected ? 'bg-primary/5 border border-primary/20' : 'hover:bg-accent/30 border border-transparent'
                        }`}
                      >
                        <div className="w-14 shrink-0 text-center">
                          <p className="text-[10px] text-muted-foreground uppercase">{daysOfWeek[wd.getDay()]}</p>
                          <p className={`text-[18px] leading-tight ${isToday ? 'text-primary' : 'text-foreground'}`} style={{ fontWeight: isToday ? 700 : 500 }}>
                            {wd.getDate()}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          {dayDelegations.length > 0 ? (
                            <div className="space-y-1">
                              {dayDelegations.map((d) => {
                                const cc = calendarColorStyles[getCalendarColor(d.status)];
                                return (
                                  <div
                                    key={d.id}
                                    onClick={(e) => { e.stopPropagation(); setViewDelegation(d); }}
                                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${cc.bg} ${cc.border} cursor-pointer hover:opacity-80`}
                                  >
                                    <span className={`w-2 h-2 rounded-full ${cc.dot} shrink-0`} />
                                    <div className="flex-1 min-w-0">
                                      <p className={`text-[12px] truncate ${cc.text}`} style={{ fontWeight: 500 }}>{d.partnerName}</p>
                                      <p className="text-[10px] text-muted-foreground truncate">{d.title}</p>
                                    </div>
                                    <span className="text-[10px] text-muted-foreground shrink-0">{d.members.length} người</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-[12px] text-muted-foreground/40 py-1">Không có đoàn</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: selected day detail + upcoming list */}
          <div className="space-y-4">
            {/* Selected day detail */}
            <div className="bg-card rounded-xl border border-border p-4" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <h3 className="text-[13px] text-foreground mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <Calendar className="w-4 h-4 text-primary" />
                {new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </h3>
              {selectedDayDelegations.length > 0 ? (
                <div className="space-y-2">
                  {selectedDayDelegations.map((d) => {
                    const cc = calendarColorStyles[getCalendarColor(d.status)];
                    return (
                      <div
                        key={d.id}
                        onClick={() => setViewDelegation(d)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:opacity-80 ${cc.bg} ${cc.border}`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-2 h-2 rounded-full ${cc.dot}`} />
                          <span className={`text-[12px] ${cc.text}`} style={{ fontWeight: 600 }}>{d.partnerName}</span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate mb-1.5">{d.title}</p>
                        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{d.members.length}</span>
                          <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" />{d.hostName}</span>
                          {d.meetingRoom && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{d.meetingRoom}</span>}
                        </div>
                        <div className="mt-1.5">
                          <StatusBadge status={d.status} />
                          {d.priority === 'directive' && (
                            <span className="ml-1 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                              <Shield className="w-2.5 h-2.5" /> TT chỉ đạo
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[12px] text-muted-foreground/50 text-center py-4">Không có đoàn nào trong ngày này</p>
              )}
            </div>

            {/* Upcoming delegations */}
            <div className="bg-card rounded-xl border border-border p-4" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] text-foreground flex items-center gap-2" style={{ fontWeight: 600 }}>
                  <Bell className="w-4 h-4 text-amber-600" /> Đoàn sắp tới
                </h3>
                <Link to="/delegations" className="text-[11px] text-primary hover:underline flex items-center gap-1">
                  Xem tất cả <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-2">
                {delegations
                  .filter((d) => !['completed', 'cancelled'].includes(d.status))
                  .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
                  .slice(0, 5)
                  .map((d) => {
                    const cc = calendarColorStyles[getCalendarColor(d.status)];
                    const days = daysUntil(d.scheduledDate);
                    return (
                      <div
                        key={d.id}
                        onClick={() => setViewDelegation(d)}
                        className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-accent/30 cursor-pointer transition-colors"
                      >
                        <span className={`w-2.5 h-2.5 rounded-full ${cc.dot} shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] text-foreground truncate" style={{ fontWeight: 500 }}>{d.partnerName}</p>
                          <p className="text-[10px] text-muted-foreground">{formatDate(d.scheduledDate)} — {d.members.length} người</p>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 ${
                          days <= 1 ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                          days <= 3 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {days <= 0 ? 'Hôm nay' : `${days} ngày`}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Tổng đoàn vào (năm)', value: `${doanVaoData.reduce((s, d) => s + d.soLuong, 0)} người`, icon: ArrowDownToLine, color: 'text-blue-600' },
            { label: 'Tổng đoàn ra (năm)', value: `${doanRaData.reduce((s, d) => s + d.soLuong, 0)} người`, icon: ArrowUpFromLine, color: 'text-orange-600' },
            { label: 'Quốc gia đối tác', value: `${new Set(doanVaoData.flatMap((d) => d.danhSachDoiTac.map((p) => p.quocTich))).size}`, icon: Building2, color: 'text-violet-600' },
            { label: 'Đoàn cần xử lý', value: `${stats.pending + stats.missingDoc}`, icon: AlertTriangle, color: 'text-red-600' },
          ].map((item) => (
            <div key={item.label} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <item.icon className={`w-4 h-4 ${item.color}`} />
              </div>
              <div>
                <p className="text-[15px] text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{item.value}</p>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {viewDelegation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewDelegation(null)}>
          <div
            ref={viewRef}
            role="dialog"
            aria-modal="true"
            className="bg-card rounded-2xl border border-border w-full max-w-xl max-h-[85vh] overflow-y-auto"
            style={{ boxShadow: 'var(--shadow-xl)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] text-muted-foreground">{viewDelegation.code}</span>
                  <StatusBadge status={viewDelegation.status} />
                </div>
                <h3 className="text-[14px] text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{viewDelegation.title}</h3>
              </div>
              <button onClick={() => setViewDelegation(null)} className="p-2 rounded-lg hover:bg-accent" aria-label="Đóng">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Đối tác', value: viewDelegation.partnerName, icon: Building2 },
                  { label: 'Ngày', value: `${formatDate(viewDelegation.scheduledDate)}${viewDelegation.scheduledEndDate !== viewDelegation.scheduledDate ? ` → ${formatDate(viewDelegation.scheduledEndDate)}` : ''}`, icon: Calendar },
                  { label: 'Người tiếp', value: `${viewDelegation.hostName} — ${viewDelegation.hostUnit}`, icon: UserCheck },
                  { label: 'Phòng họp', value: viewDelegation.meetingRoom || '—', icon: MapPin },
                  { label: 'VB đồng ý', value: viewDelegation.approvalDocNumber || (viewDelegation.priority === 'directive' ? 'Miễn (TT chỉ đạo)' : 'Chưa có'), icon: FileText },
                  { label: 'Mục đích', value: viewDelegation.purpose, icon: Flag },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-2">
                    <row.icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">{row.label}</p>
                      <p className="text-[12px] text-foreground">{row.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Members */}
              <div>
                <p className="text-[12px] text-foreground mb-1.5 flex items-center gap-1" style={{ fontWeight: 600 }}>
                  <Users className="w-3.5 h-3.5" /> Nhân sự ({viewDelegation.members.length})
                </p>
                <div className="bg-surface-2 rounded-lg divide-y divide-border/50">
                  {viewDelegation.members.map((m, i) => (
                    <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 text-[11px]">
                      <span className="text-muted-foreground w-5">{i + 1}</span>
                      <span className="text-foreground flex-1">{m.fullName}</span>
                      {m.isLeader && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">Trưởng đoàn</span>}
                      <span className="text-muted-foreground">{m.position}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gifts */}
              {viewDelegation.gifts.length > 0 && (
                <div>
                  <p className="text-[12px] text-foreground mb-1.5 flex items-center gap-1" style={{ fontWeight: 600 }}>
                    <Gift className="w-3.5 h-3.5 text-amber-600" /> Quà tặng ({viewDelegation.gifts.length})
                  </p>
                  {viewDelegation.gifts.map((g) => (
                    <div key={g.id} className="flex items-center gap-2 px-3 py-1.5 bg-amber-50/50 dark:bg-amber-900/10 rounded-lg text-[11px]">
                      <span className="text-foreground flex-1">{g.description}</span>
                      <span className="text-muted-foreground">x{g.quantity}</span>
                    </div>
                  ))}
                </div>
              )}

              {viewDelegation.note && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg">
                  <p className="text-[11px] text-amber-700 dark:text-amber-400">{viewDelegation.note}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
