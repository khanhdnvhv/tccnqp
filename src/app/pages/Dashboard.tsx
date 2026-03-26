import { motion } from 'motion/react';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import {
  Users, UserPlus, CalendarClock, Car, AlertTriangle,
  CheckCircle2, TrendingUp, ArrowRight, Activity,
  Clock, Shield, BarChart3, ArrowUpRight,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import {
  dashboardStats, weeklyVisitorData, visitorTypeDistribution,
  visitors, appointments, visitorStatusColors, visitorStatusLabels,
  visitorTypeColors, visitorTypeLabels, appointmentStatusColors, appointmentStatusLabels,
} from '../data/visitorData';

const CHART_COLORS = ['#1a5c32', '#c9a547', '#0b1829', '#d97706', '#94a3b8'];

function useCounter(target: number, duration = 900) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

function AnimatedNumber({ value }: { value: number }) {
  const count = useCounter(value, 800);
  return <>{count.toLocaleString()}</>;
}

function CustomBarTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 text-[12px]" style={{ boxShadow: 'var(--shadow-lg)' }}>
      <p className="text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: <span className="text-foreground">{p.value}</span></p>
      ))}
    </div>
  );
}

function CustomPieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 text-[12px]" style={{ boxShadow: 'var(--shadow-lg)' }}>
      <p className="text-foreground">{payload[0].name}: <span className="text-primary">{payload[0].value}%</span></p>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAuth();
  const reducedMotion = useReducedMotion();

  const statCards = [
    {
      label: 'Đang trong khu vực', value: dashboardStats.insideNow, icon: Users,
      gradient: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400', change: 'Trực tiếp', link: '/visitors',
      changeColor: 'text-emerald-600',
    },
    {
      label: 'Đăng ký hôm nay', value: dashboardStats.totalToday, icon: UserPlus,
      gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400', change: '+8 so hôm qua', link: '/visitors',
      changeColor: 'text-blue-600',
    },
    {
      label: 'Lịch hẹn chờ duyệt', value: dashboardStats.pendingAppointments, icon: CalendarClock,
      gradient: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20',
      iconColor: 'text-amber-600 dark:text-amber-400', change: 'Cần xử lý', link: '/appointments',
      changeColor: 'text-amber-600',
    },
    {
      label: 'Xe đang đỗ', value: dashboardStats.vehiclesInside, icon: Car,
      gradient: 'from-violet-500 to-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20',
      iconColor: 'text-violet-600 dark:text-violet-400', change: '2 bãi A, 2 bãi B', link: '/vehicles',
      changeColor: 'text-violet-600',
    },
    {
      label: 'Đã ra hôm nay', value: dashboardStats.todayCompleted, icon: CheckCircle2,
      gradient: 'from-teal-500 to-teal-600', bg: 'bg-teal-50 dark:bg-teal-900/20',
      iconColor: 'text-teal-600 dark:text-teal-400', change: '+5% so tuần trước', link: '/entry-history',
      changeColor: 'text-teal-600',
    },
    {
      label: 'Quá giờ quy định', value: dashboardStats.overstayNow, icon: AlertTriangle,
      gradient: 'from-red-500 to-red-600', bg: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400', change: 'Cần kiểm tra ngay', link: '/visitors',
      changeColor: 'text-red-600',
    },
  ];

  const quickActions = [
    { label: 'Đăng ký mới', icon: UserPlus, link: '/visitors', bg: 'from-emerald-500 to-emerald-600' },
    { label: 'Lịch hẹn', icon: CalendarClock, link: '/appointments', bg: 'from-blue-500 to-blue-600' },
    { label: 'Lịch sử', icon: Activity, link: '/entry-history', bg: 'from-violet-500 to-violet-600' },
    { label: 'Báo cáo', icon: BarChart3, link: '/reports', bg: 'from-amber-500 to-amber-600' },
  ];

  const overstayVisitors = visitors.filter((v) => v.status === 'overstay');
  const currentlyInside = visitors.filter((v) => v.status === 'inside').slice(0, 5);
  const upcomingApts = appointments.filter((a) => a.status === 'pending' || a.status === 'approved').slice(0, 4);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <PageTransition>
      <Header title="Tổng quan" />
      <div className="flex-1 overflow-y-auto p-6 space-y-6">

        {/* Overstay Alert */}
        {overstayVisitors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-4 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] text-red-800 dark:text-red-300" style={{ fontFamily: 'var(--font-display)' }}>
                <span className="font-semibold">Cảnh báo quá giờ:</span>{' '}
                {overstayVisitors.map((v) => v.fullName).join(', ')} đã vượt thời gian cho phép.
              </p>
            </div>
            <Link to="/visitors" className="shrink-0 text-[12px] text-red-600 dark:text-red-400 hover:underline flex items-center gap-1">
              Xem ngay <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        )}

        {/* Welcome + Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              Chào mừng, {user?.fullName?.split(' ').pop() || 'Cán bộ'}!
            </h2>
            <p className="text-[13px] text-muted-foreground mt-0.5">
              Thứ Năm, 26/03/2026 &nbsp;•&nbsp; Ca trực: Sáng (06:00 – 14:00)
            </p>
          </div>
          <div className="flex items-center gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.link}
                to={action.link}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] text-white bg-gradient-to-r ${action.bg} hover:opacity-90 transition-all active:scale-[0.97]`}
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <action.icon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={reducedMotion ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <Link to={card.link} className="block group">
                <div
                  className="bg-card rounded-xl p-4 border border-border hover:shadow-md transition-all duration-200 cursor-pointer h-full"
                  style={{ boxShadow: 'var(--shadow-xs)' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
                      <card.icon className={`w-4.5 h-4.5 ${card.iconColor}`} />
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[24px] text-foreground leading-none mb-1" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                    <AnimatedNumber value={card.value} />
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-tight mb-1.5">{card.label}</p>
                  <p className={`text-[10px] ${card.changeColor}`}>{card.change}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar chart */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5" style={{ boxShadow: 'var(--shadow-xs)' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Lượng đối tác theo ngày</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">7 ngày qua</p>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block" />Người</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-amber-400 inline-block" />Xe</span>
              </div>
            </div>
            <div className="h-52" aria-label="Biểu đồ lượng đối tác theo ngày" role="img">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart id="dash-bar-weekly" data={weeklyVisitorData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar dataKey="visitors" name="Người" fill="#1a5c32" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="vehicles" name="Xe" fill="#c9a547" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie chart */}
          <div className="bg-card rounded-xl border border-border p-5" style={{ boxShadow: 'var(--shadow-xs)' }}>
            <div className="mb-4">
              <h3 className="text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Phân loại đối tác</h3>
              <p className="text-[12px] text-muted-foreground mt-0.5">Tháng 3/2026</p>
            </div>
            <div className="h-36" aria-label="Biểu đồ phân loại đối tác" role="img">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart id="dash-pie-type">
                  <Pie
                    data={visitorTypeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={58}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {visitorTypeDistribution.map((_, idx) => (
                      <Cell key={`dash-pie-cell-${idx}`} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-2">
              {visitorTypeDistribution.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CHART_COLORS[idx % CHART_COLORS.length] }} />
                    <span className="text-[11px] text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="text-[11px] text-foreground">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Currently inside */}
          <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-xs)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Đang trong khu vực</h3>
                <span className="text-[11px] px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full">{currentlyInside.length}</span>
              </div>
              <Link to="/visitors" className="text-[12px] text-primary hover:underline flex items-center gap-1">
                Xem tất cả <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border/50">
              {currentlyInside.map((v) => {
                const typeColor = visitorTypeColors[v.type];
                return (
                  <div key={v.id} className="flex items-center gap-3 px-5 py-3 hover:bg-accent/30 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-emerald-600 flex items-center justify-center text-white text-[10px] shrink-0">
                      {v.fullName.split(' ').slice(-1)[0][0]}{v.fullName.split(' ').slice(-2)[0][0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-foreground truncate">{v.fullName}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{v.organization}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${typeColor.bg} ${typeColor.text}`}>
                        {visitorTypeLabels[v.type]}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1 justify-end">
                        <Clock className="w-2.5 h-2.5" /> {formatTime(v.checkIn)}
                      </p>
                    </div>
                  </div>
                );
              })}
              {currentlyInside.length === 0 && (
                <div className="text-center py-8 text-[13px] text-muted-foreground">Không có ai trong khu vực</div>
              )}
            </div>
          </div>

          {/* Upcoming appointments */}
          <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-xs)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-primary" />
                <h3 className="text-foreground" style={{ fontFamily: 'var(--font-display)' }}>Lịch hẹn sắp tới</h3>
              </div>
              <Link to="/appointments" className="text-[12px] text-primary hover:underline flex items-center gap-1">
                Xem tất cả <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="divide-y divide-border/50">
              {upcomingApts.map((apt) => {
                const stColor = appointmentStatusColors[apt.status];
                return (
                  <div key={apt.id} className="px-5 py-3 hover:bg-accent/30 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-foreground truncate">{apt.visitorName}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{apt.visitorOrg}</p>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${stColor.bg} ${stColor.text}`}>
                        <span className={`w-1 h-1 rounded-full ${stColor.dot}`} />
                        {appointmentStatusLabels[apt.status]}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{apt.scheduledDate} {apt.scheduledTime}</span>
                      <span className="truncate">• {apt.hostUnit}</span>
                    </div>
                  </div>
                );
              })}
              {upcomingApts.length === 0 && (
                <div className="text-center py-8 text-[13px] text-muted-foreground">Không có lịch hẹn sắp tới</div>
              )}
            </div>
          </div>
        </div>

        {/* Stats footer */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: TrendingUp, label: 'Tuần này', value: dashboardStats.weeklyTotal, unit: 'lượt', color: 'text-primary' },
            { icon: Shield, label: 'Tháng này', value: dashboardStats.monthlyTotal, unit: 'lượt', color: 'text-blue-600' },
            { icon: CheckCircle2, label: 'Hoàn thành HN', value: appointments.filter((a) => a.status === 'completed').length, unit: 'cuộc', color: 'text-emerald-600' },
            { icon: Activity, label: 'Thẻ hiệu lực', value: 5, unit: 'thẻ', color: 'text-amber-600' },
          ].map((item) => (
            <div key={item.label} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <item.icon className={`w-4.5 h-4.5 ${item.color}`} />
              </div>
              <div>
                <p className="text-[18px] text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  <AnimatedNumber value={item.value} /> <span className="text-[11px] text-muted-foreground">{item.unit}</span>
                </p>
                <p className="text-[11px] text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </PageTransition>
  );
}