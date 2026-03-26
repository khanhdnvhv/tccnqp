import { useState, useMemo, useRef } from 'react';
import { useRovingTabindex } from '../hooks/useRovingTabindex';
import { useColumnVisibility, type ColumnDef } from '../hooks/useColumnVisibility';
import { useColumnResize } from '../hooks/useColumnResize';
import { useColumnOrder } from '../hooks/useColumnOrder';
import { useReducedData } from '../hooks/useReducedData';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { ColumnToggle } from '../components/ColumnToggle';
import { ResizeHandle } from '../components/ResizeHandle';
import { ResetWidthsButton } from '../components/ResetWidthsButton';
import { DraggableHeader } from '../components/DraggableHeader';
import { incomingDocs, outgoingDocs, internalDocs, type EnhancedDocument } from '../data/documentData';
import { enhancedTasks } from '../data/taskData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, Legend,
} from 'recharts';
import {
  FileInput, FileOutput, FileText, ClipboardList, Download, Calendar,
  TrendingUp, TrendingDown, Users, Clock, BarChart3, PieChart as PieChartIcon,
  Activity, Target, AlertTriangle, CheckCircle2, Filter, Columns,
} from 'lucide-react';
import { motion } from 'motion/react';

const COLORS = ['#2563eb', '#0891b2', '#059669', '#d97706', '#7c3aed', '#dc2626', '#94a3b8', '#ec4899'];

type ReportTab = 'overview' | 'documents' | 'tasks' | 'staff';

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const reducedData = useReducedData();

  const reportTabKeys = useMemo(() => ['overview', 'documents', 'tasks', 'staff'] as const, []);
  const { getTabIndex: getReportTabIndex, handleTablistKeyDown: handleReportTablistKeyDown } = useRovingTabindex(
    reportTabKeys as unknown as string[],
    activeTab,
    (key) => setActiveTab(key as ReportTab),
  );

  const [periodFilter, setPeriodFilter] = useState('month');

  // Staff table column visibility
  type StaffColKey = 'name' | 'tasks' | 'done' | 'docs' | 'rate' | 'progress';
  const staffColDefs = useMemo<ColumnDef<StaffColKey>[]>(() => [
    { key: 'name', label: 'Cán bộ', required: true },
    { key: 'tasks', label: 'Công việc' },
    { key: 'done', label: 'Hoàn thành' },
    { key: 'docs', label: 'VB xử lý' },
    { key: 'rate', label: 'Tỷ lệ' },
    { key: 'progress', label: 'TB tiến độ' },
  ], []);
  const staffColVis = useColumnVisibility<StaffColKey>({ storageKey: 'reports_staff', columns: staffColDefs });

  const staffResizeCols = useMemo(() => ['name', 'tasks', 'done', 'docs', 'rate', 'progress'] as StaffColKey[], []);
  const staffColResize = useColumnResize<StaffColKey>({
    storageKey: 'reports_staff',
    columns: staffResizeCols,
    config: {
      name: { defaultWidth: 200, minWidth: 120, maxWidth: 320 },
      tasks: { defaultWidth: 100, minWidth: 60, maxWidth: 160 },
      done: { defaultWidth: 100, minWidth: 60, maxWidth: 160 },
      docs: { defaultWidth: 100, minWidth: 60, maxWidth: 160 },
      rate: { defaultWidth: 100, minWidth: 60, maxWidth: 160 },
      progress: { defaultWidth: 140, minWidth: 80, maxWidth: 220 },
    },
    defaultMinWidth: 60,
  });
  const staffTableRef = useRef<HTMLTableElement>(null);

  // Column order for staff table
  const defaultStaffColOrder = useMemo<StaffColKey[]>(() => ['name', 'tasks', 'done', 'docs', 'rate', 'progress'], []);
  const staffColLabels = useMemo<Record<StaffColKey, string>>(() => ({
    name: 'Nhân viên', tasks: 'Công việc', done: 'Hoàn thành',
    docs: 'Văn bản', rate: 'Tỷ lệ', progress: 'Tiến độ',
  }), []);
  const staffColOrder = useColumnOrder<StaffColKey>({ storageKey: 'reports_staff', defaultOrder: defaultStaffColOrder, labels: staffColLabels });
  const staffOrderedVisibleCols = useMemo(() => staffColOrder.order.filter(k => k === 'name' || staffColVis.isVisible(k)), [staffColOrder.order, staffColVis]);

  const allDocs = useMemo(() => [...incomingDocs, ...outgoingDocs, ...internalDocs], []);

  // === Document Stats ===
  const docStats = useMemo(() => {
    const byType = [
      { name: 'VB Đến', value: incomingDocs.length, color: '#1e40af' },
      { name: 'VB Đi', value: outgoingDocs.length, color: '#059669' },
      { name: 'Nội bộ', value: internalDocs.length, color: '#7c3aed' },
    ];
    const byCategory: Record<string, number> = {};
    allDocs.forEach((d) => { byCategory[d.category] = (byCategory[d.category] || 0) + 1; });
    const byCategoryArr = Object.entries(byCategory).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const byField: Record<string, number> = {};
    allDocs.forEach((d) => { byField[d.field] = (byField[d.field] || 0) + 1; });
    const byFieldArr = Object.entries(byField).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    const byPriority = [
      { name: 'Hỏa tốc', value: allDocs.filter((d) => d.priority === 'urgent_top').length, color: '#dc2626' },
      { name: 'Khẩn', value: allDocs.filter((d) => d.priority === 'urgent').length, color: '#f97316' },
      { name: 'Cao', value: allDocs.filter((d) => d.priority === 'high').length, color: '#eab308' },
      { name: 'TB', value: allDocs.filter((d) => d.priority === 'medium').length, color: '#0891b2' },
      { name: 'Thấp', value: allDocs.filter((d) => d.priority === 'low').length, color: '#94a3b8' },
    ];

    const overdue = allDocs.filter((d) => d.deadline && new Date(d.deadline) < new Date() && !['completed', 'published', 'distributed'].includes(d.status)).length;
    const completed = allDocs.filter((d) => ['completed', 'published', 'distributed'].includes(d.status)).length;
    const processing = allDocs.filter((d) => ['processing', 'assigned', 'dept_review', 'leader_review', 'review'].includes(d.status)).length;

    return { byType, byCategoryArr, byFieldArr, byPriority, overdue, completed, processing, total: allDocs.length };
  }, [allDocs]);

  // === Task Stats ===
  const taskStats = useMemo(() => {
    const total = enhancedTasks.length;
    const done = enhancedTasks.filter((t) => t.status === 'done').length;
    const inProgress = enhancedTasks.filter((t) => t.status === 'in_progress').length;
    const overdue = enhancedTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length;
    const avgProgress = Math.round(enhancedTasks.reduce((sum, t) => sum + t.progress, 0) / total);
    const completionRate = Math.round((done / total) * 100);

    const byStatus = [
      { name: 'Chờ xử lý', value: enhancedTasks.filter((t) => t.status === 'todo').length, color: '#94a3b8' },
      { name: 'Đang làm', value: inProgress, color: '#1e40af' },
      { name: 'Chờ duyệt', value: enhancedTasks.filter((t) => t.status === 'review').length, color: '#7c3aed' },
      { name: 'Hoàn thành', value: done, color: '#059669' },
    ];

    const byPriority = [
      { name: 'Khẩn cấp', value: enhancedTasks.filter((t) => t.priority === 'urgent').length, color: '#dc2626' },
      { name: 'Cao', value: enhancedTasks.filter((t) => t.priority === 'high').length, color: '#f97316' },
      { name: 'TB', value: enhancedTasks.filter((t) => t.priority === 'medium').length, color: '#0891b2' },
      { name: 'Thấp', value: enhancedTasks.filter((t) => t.priority === 'low').length, color: '#94a3b8' },
    ];

    return { total, done, inProgress, overdue, avgProgress, completionRate, byStatus, byPriority };
  }, []);

  // === Staff Performance ===
  const staffStats = useMemo(() => {
    const staffMap: Record<string, { name: string; avatar: string; tasks: number; done: number; docs: number; avgProgress: number }> = {};
    enhancedTasks.forEach((t) => {
      if (!staffMap[t.assignee]) staffMap[t.assignee] = { name: t.assignee, avatar: t.assigneeAvatar, tasks: 0, done: 0, docs: 0, avgProgress: 0 };
      staffMap[t.assignee].tasks++;
      if (t.status === 'done') staffMap[t.assignee].done++;
      staffMap[t.assignee].avgProgress += t.progress;
    });
    allDocs.forEach((d) => {
      if (d.processorName && staffMap[d.processorName]) staffMap[d.processorName].docs++;
    });
    return Object.values(staffMap).map((s) => ({
      ...s,
      avgProgress: s.tasks > 0 ? Math.round(s.avgProgress / s.tasks) : 0,
      completionRate: s.tasks > 0 ? Math.round((s.done / s.tasks) * 100) : 0,
    })).sort((a, b) => b.completionRate - a.completionRate);
  }, [allDocs]);

  // Monthly trend mock data
  const monthlyTrend = [
    { month: 'T1', incoming: 120, outgoing: 85, internal: 30 },
    { month: 'T2', incoming: 98, outgoing: 72, internal: 28 },
    { month: 'T3', incoming: 145, outgoing: 95, internal: 42 },
    { month: 'T4', incoming: 132, outgoing: 88, internal: 35 },
    { month: 'T5', incoming: 156, outgoing: 102, internal: 45 },
    { month: 'T6', incoming: 178, outgoing: 118, internal: 52 },
    { month: 'T7', incoming: 142, outgoing: 96, internal: 38 },
    { month: 'T8', incoming: 165, outgoing: 110, internal: 48 },
    { month: 'T9', incoming: 189, outgoing: 125, internal: 55 },
    { month: 'T10', incoming: 201, outgoing: 132, internal: 58 },
    { month: 'T11', incoming: 175, outgoing: 115, internal: 50 },
    { month: 'T12', incoming: 152, outgoing: 98, internal: 42 },
  ];

  // Task completion weekly mock
  const weeklyCompletion = [
    { week: 'Tuần 1', assigned: 12, completed: 8, overdue: 2 },
    { week: 'Tuần 2', assigned: 15, completed: 11, overdue: 1 },
    { week: 'Tuần 3', assigned: 18, completed: 14, overdue: 3 },
    { week: 'Tuần 4', assigned: 10, completed: 6, overdue: 1 },
  ];

  const tabs = [
    { key: 'overview' as ReportTab, label: 'Tổng quan', icon: BarChart3 },
    { key: 'documents' as ReportTab, label: 'Văn bản', icon: FileText },
    { key: 'tasks' as ReportTab, label: 'Công việc', icon: ClipboardList },
    { key: 'staff' as ReportTab, label: 'Nhân sự', icon: Users },
  ];

  // Custom chart tooltip for dark mode
  const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-card border border-border rounded-xl px-3 py-2" style={{ boxShadow: 'var(--shadow-lg)' }}>
        <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-[12px] text-foreground">
            <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
            {entry.name}: <span style={{ fontWeight: 500 }}>{entry.value}</span>
          </p>
        ))}
      </div>
    );
  };

  // Reduced data fallback for slow connections
  const ReducedDataFallback = ({ label }: { label: string }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <BarChart3 className="w-8 h-8 text-muted-foreground/30 mb-2" />
      <p className="text-[12px] text-muted-foreground">Biểu đồ {label} đã tắt để tiết kiệm dữ liệu</p>
      <p className="text-[11px] text-muted-foreground/60 mt-0.5">Tắt chế độ tiết kiệm dữ liệu để xem biểu đồ</p>
    </div>
  );

  return (
    <PageTransition>
      <Header title="Báo cáo & Thống kê" />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Tab bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-card rounded-xl border border-border p-1" style={{ boxShadow: 'var(--shadow-xs)' }} role="tablist" aria-label="Loại báo cáo" onKeyDown={handleReportTablistKeyDown}>
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                role="tab"
                aria-selected={activeTab === tab.key}
                aria-controls={`tabpanel-${tab.key}`}
                id={`tab-${tab.key}`}
                tabIndex={getReportTabIndex(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] transition-all ${
                  activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                }`}
                style={activeTab === tab.key ? { boxShadow: 'var(--shadow-sm)' } : undefined}>
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}
              aria-label="Lọc theo kỳ báo cáo"
              className="px-3 py-2 bg-surface-2 border border-border rounded-xl text-[13px] outline-none cursor-pointer text-foreground">
              <option value="week">Tuần này</option>
              <option value="month">Tháng này</option>
              <option value="quarter">Quý này</option>
              <option value="year">Năm 2026</option>
            </select>
            <button className="flex items-center gap-1.5 px-3.5 py-2 bg-card border border-border rounded-xl text-[13px] text-muted-foreground hover:bg-accent transition-colors"
              onClick={() => {
                const tabLabel = tabs.find(t => t.key === activeTab)?.label || 'báo cáo';
                import('sonner').then(({ toast }) => toast.success(`Đã xuất ${tabLabel} dạng PDF thành công!`));
              }}>
              <Download className="w-4 h-4" /> Xuất báo cáo
            </button>
          </div>
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-5" role="tabpanel" id="tabpanel-overview" aria-labelledby="tab-overview">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Tổng văn bản', value: docStats.total, icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30', trend: '+12%', up: true },
                { label: 'Đang xử lý', value: docStats.processing, icon: Activity, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30', trend: `${docStats.processing}`, up: false },
                { label: 'Hoàn thành', value: docStats.completed, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', trend: '+18%', up: true },
                { label: 'Quá hạn', value: docStats.overdue, icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30', trend: '-25%', up: true },
              ].map((card) => (
                <div key={card.label} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full flex items-center gap-0.5 ${card.up ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}>
                      {card.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {card.trend}
                    </span>
                  </div>
                  <p className="text-[26px] text-foreground" style={{ fontFamily: "var(--font-display)" }}>{card.value}</p>
                  <p className="text-[12px] text-muted-foreground mt-0.5">{card.label}</p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 bg-card rounded-xl border border-border p-5">
                <h3 className="text-foreground text-[14px] mb-1" style={{ fontFamily: "var(--font-display)" }}>Xu hướng văn bản theo tháng</h3>
                <p className="text-[12px] text-muted-foreground mb-4">So sánh VB đến, đi, nội bộ qua các tháng</p>
                <div role="img" aria-label="Biểu đồ xu hướng văn bản đến, đi, nội bộ qua 12 tháng">
                {reducedData ? <ReducedDataFallback label="xu hướng" /> : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart id="reports-area-monthly" data={monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Area type="monotone" dataKey="incoming" stroke="#1e40af" fill="#1e40af" fillOpacity={0.1} strokeWidth={2} name="VB Đến" />
                    <Area type="monotone" dataKey="outgoing" stroke="#059669" fill="#059669" fillOpacity={0.1} strokeWidth={2} name="VB Đi" />
                    <Area type="monotone" dataKey="internal" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.06} strokeWidth={2} strokeDasharray="4 2" name="Nội bộ" />
                  </AreaChart>
                </ResponsiveContainer>
                )}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-foreground text-[14px] mb-1" style={{ fontFamily: "var(--font-display)" }}>Phân loại văn bản</h3>
                <p className="text-[12px] text-muted-foreground mb-3">Theo loại hình văn bản</p>
                <div role="img" aria-label={`Biểu đồ tròn phân loại: ${docStats.byType.map(t => `${t.name} ${t.value}`).join(', ')}`}>
                {reducedData ? <ReducedDataFallback label="phân loại" /> : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart id="reports-pie-bytype">
                    <Pie data={docStats.byType} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                      {docStats.byType.map((entry, i) => <Cell key={`reports-bytype-cell-${i}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                )}
                </div>
                <div className="space-y-2 mt-2">
                  {docStats.byType.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-[12px]">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-muted-foreground">{item.name}</span>
                      </div>
                      <span className="text-foreground">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Task completion chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-foreground text-[14px] mb-1" style={{ fontFamily: "var(--font-display)" }}>Tiến độ công việc theo tuần</h3>
                <p className="text-[12px] text-muted-foreground mb-4">Tháng 3/2026</p>
                <div role="img" aria-label="Biểu đồ tiến độ công việc theo tuần, tháng 3/2026">
                {reducedData ? <ReducedDataFallback label="tiến độ" /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart id="reports-bar-weekly" data={weeklyCompletion} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="assigned" fill="#1e40af" radius={[4, 4, 0, 0]} barSize={20} name="Giao" />
                    <Bar dataKey="completed" fill="#059669" radius={[4, 4, 0, 0]} barSize={20} name="Hoàn thành" />
                    <Bar dataKey="overdue" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={20} name="Quá hạn" />
                  </BarChart>
                </ResponsiveContainer>
                )}
                </div>
              </div>

              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-foreground text-[14px] mb-1" style={{ fontFamily: "var(--font-display)" }}>Trạng thái công việc</h3>
                <p className="text-[12px] text-muted-foreground mb-3">Phân bố theo trạng thái</p>
                <div role="img" aria-label={`Biểu đồ trạng thái: ${taskStats.byStatus.map(s => `${s.name} ${s.value}`).join(', ')}`}>
                {reducedData ? <ReducedDataFallback label="trạng thái" /> : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart id="reports-pie-taskstatus">
                    <Pie data={taskStats.byStatus} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {taskStats.byStatus.map((entry, i) => <Cell key={`task-status-cell-${i}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                )}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {taskStats.byStatus.map((item) => (
                    <div key={item.name} className="flex items-center gap-2 text-[12px]">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                      <span className="text-foreground ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="space-y-5" role="tabpanel" id="tabpanel-documents" aria-labelledby="tab-documents">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
              {docStats.byPriority.map((p) => (
                <div key={p.name} className="bg-card rounded-xl border border-border p-4 text-center">
                  <p className="text-[22px] text-foreground tabular-nums" style={{ fontFamily: "var(--font-display)" }}>{p.value}</p>
                  <p className="text-[12px] text-muted-foreground flex items-center justify-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />{p.name}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-foreground text-[14px] mb-4" style={{ fontFamily: "var(--font-display)" }}>Theo loại văn bản</h3>
                <div role="img" aria-label="Biểu đồ phân bố văn bản theo loại">
                {reducedData ? <ReducedDataFallback label="phân bố" /> : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart id="reports-bar-doccat" data={docStats.byCategoryArr} layout="vertical" barSize={18}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Bar dataKey="value" fill="#1e40af" radius={[0, 6, 6, 0]} name="Số lượng" />
                  </BarChart>
                </ResponsiveContainer>
                )}
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-foreground text-[14px] mb-4" style={{ fontFamily: "var(--font-display)" }}>Theo lĩnh vực</h3>
                <div role="img" aria-label="Biểu đồ tròn phân bố văn bản theo lĩnh vực">
                {reducedData ? <ReducedDataFallback label="lĩnh vực" /> : (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart id="reports-pie-field">
                    <Pie data={docStats.byFieldArr} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {docStats.byFieldArr.map((_, i) => <Cell key={`doc-field-cell-${i}`} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="space-y-5" role="tabpanel" id="tabpanel-tasks" aria-labelledby="tab-tasks">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Tổng công việc', value: taskStats.total, icon: ClipboardList, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
                { label: 'Tỷ lệ hoàn thành', value: `${taskStats.completionRate}%`, icon: Target, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
                { label: 'TB tiến độ', value: `${taskStats.avgProgress}%`, icon: Activity, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/30' },
                { label: 'Quá hạn', value: taskStats.overdue, icon: AlertTriangle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
              ].map((card) => (
                <div key={card.label} className="bg-card rounded-xl border border-border p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center`}>
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <p className="text-[12px] text-muted-foreground">{card.label}</p>
                  </div>
                  <p className="text-[26px] text-foreground" style={{ fontFamily: "var(--font-display)" }}>{card.value}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-foreground text-[14px] mb-4" style={{ fontFamily: "var(--font-display)" }}>Theo mức độ ưu tiên</h3>
                <div role="img" aria-label="Biểu đồ công việc theo mức độ ưu tiên">
                {reducedData ? <ReducedDataFallback label="ưu tiên" /> : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart id="reports-bar-priority" data={taskStats.byPriority} barSize={32}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} name="Số lượng">
                      {taskStats.byPriority.map((entry, i) => <Cell key={`task-priority-cell-${i}`} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                )}
                </div>
              </div>
              <div className="bg-card rounded-xl border border-border p-5">
                <h3 className="text-foreground text-[14px] mb-4" style={{ fontFamily: "var(--font-display)" }}>Tiến độ từng công việc</h3>
                <div className="space-y-3 max-h-[280px] overflow-y-auto">
                  {enhancedTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/80 to-blue-400 flex items-center justify-center text-white text-[8px] shrink-0">{task.assigneeAvatar}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-foreground truncate">{task.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 bg-muted rounded-full h-2" role="progressbar" aria-valuenow={task.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ ${task.title}: ${task.progress}%`}>
                            <div className={`h-2 rounded-full transition-all ${task.progress === 100 ? 'bg-emerald-500' : task.progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                              style={{ width: `${task.progress}%` }} />
                          </div>
                          <span className="text-[11px] text-muted-foreground w-8 text-right">{task.progress}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STAFF TAB */}
        {activeTab === 'staff' && (
          <div className="space-y-5" role="tabpanel" id="tabpanel-staff" aria-labelledby="tab-staff">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                <h3 className="text-foreground text-[14px]" style={{ fontFamily: "var(--font-display)" }}>Hiệu suất làm việc cán bộ</h3>
                <div className="flex items-center gap-2">
                  <ColumnToggle
                    isOpen={staffColVis.isOpen}
                    setIsOpen={staffColVis.setIsOpen}
                    columns={staffColVis.columns}
                    isVisible={staffColVis.isVisible}
                    toggle={staffColVis.toggle}
                    resetAll={staffColVis.resetAll}
                    showOnlyRequired={staffColVis.showOnlyRequired}
                    hideAllOptional={staffColVis.hideAllOptional}
                    allOptionalVisible={staffColVis.allOptionalVisible}
                    allOptionalHidden={staffColVis.allOptionalHidden}
                    handleMenuKeyDown={staffColVis.handleMenuKeyDown}
                    visibleCount={staffColVis.visibleCount}
                    totalCount={staffColVis.totalCount}
                    hasHidden={staffColVis.hasHidden}
                    announcement={staffColVis.announcement}
                  />
                  <ResetWidthsButton isResized={staffColResize.isResized} onReset={staffColResize.resetWidths} />
                  {staffColOrder.isReordered && (
                    <button onClick={staffColOrder.resetOrder} className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" aria-label="Đặt lại thứ tự cột">
                      <Activity className="w-3 h-3" /> Đặt lại thứ tự
                    </button>
                  )}
                  <button onClick={() => { import('sonner').then(({ toast }) => toast.success('Đã xuất bảng hiệu suất nhân sự dạng Excel!')); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-input-background rounded-lg text-[12px] text-muted-foreground hover:bg-muted">
                    <Download className="w-3.5 h-3.5" /> Xuất
                  </button>
                </div>
              </div>
              <div className="overflow-auto max-h-[65vh]">
                <table ref={staffTableRef} className="w-full" style={{ tableLayout: 'fixed' }} aria-rowcount={staffStats.length + 1}>
                  <caption className="sr-only">Báo cáo chi tiết văn bản theo phòng ban</caption>
                  <thead className="sticky-header">
                    <tr className="bg-accent/30">
                      {staffOrderedVisibleCols.map((colKey, idx) => {
                        const colIdx = idx + 1;
                        const headerLabels: Record<StaffColKey, string> = {
                          name: 'CÁN BỘ', tasks: 'CÔNG VIỆC', done: 'HOÀN THÀNH',
                          docs: 'VĂN BẢN XỬ LÝ', rate: 'TỶ LỆ', progress: 'TB TIẾN ĐỘ',
                        };
                        const alignClass = colKey === 'name' || colKey === 'progress' ? 'text-left' : 'text-center';
                        return (
                          <DraggableHeader key={colKey} colKey={colKey} index={staffColOrder.getColumnIndex(colKey)} onMove={staffColOrder.moveColumn} onKeyboardMove={(k, d) => staffColOrder.moveColumnByKey(k as StaffColKey, d)}
                            scope="col" role="columnheader" aria-colindex={colIdx} tabIndex={0}
                            title="Alt+← → để di chuyển cột"
                            className={`relative ${alignClass} px-5 py-3 text-[11px] text-muted-foreground`} style={staffColResize.getHeaderProps(colKey).style}>
                            {headerLabels[colKey]}
                            <ResizeHandle onResizeStart={(e) => staffColResize.onResizeStart(colKey, e)} onDoubleClick={() => staffColResize.autoFit(colKey, staffTableRef.current)} onKeyboardResize={(d) => staffColResize.keyboardResize(colKey, d)} />
                          </DraggableHeader>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {staffStats.map((staff, idx) => (
                      <tr key={staff.name} aria-rowindex={idx + 2} className="border-b border-border/50 hover:bg-accent/20 transition-colors">
                        {staffOrderedVisibleCols.map((colKey) => {
                          switch (colKey) {
                            case 'name': return (
                              <td key="name" className="px-5 py-3.5">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-blue-400 flex items-center justify-center text-white text-[10px]">{staff.avatar}</div>
                                  <span className="text-[13px] text-foreground">{staff.name}</span>
                                </div>
                              </td>
                            );
                            case 'tasks': return <td key="tasks" className="px-5 py-3.5 text-center text-[13px] text-foreground">{staff.tasks}</td>;
                            case 'done': return <td key="done" className="px-5 py-3.5 text-center text-[13px] text-emerald-600">{staff.done}</td>;
                            case 'docs': return <td key="docs" className="px-5 py-3.5 text-center text-[13px] text-foreground">{staff.docs}</td>;
                            case 'rate': return (
                              <td key="rate" className="px-5 py-3.5 text-center">
                                <span className={`text-[12px] px-2 py-0.5 rounded-full ${
                                  staff.completionRate >= 75 ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                  staff.completionRate >= 50 ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' :
                                  'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                                }`}>{staff.completionRate}%</span>
                              </td>
                            );
                            case 'progress': return (
                              <td key="progress" className="px-5 py-3.5">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-muted rounded-full h-2" role="progressbar" aria-valuenow={staff.avgProgress} aria-valuemin={0} aria-valuemax={100} aria-label={`Tiến độ trung bình ${staff.name}: ${staff.avgProgress}%`}>
                                    <div className={`h-2 rounded-full ${staff.avgProgress >= 75 ? 'bg-emerald-500' : staff.avgProgress >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`}
                                      style={{ width: `${staff.avgProgress}%` }} />
                                  </div>
                                  <span className="text-[11px] text-muted-foreground w-8 text-right">{staff.avgProgress}%</span>
                                </div>
                              </td>
                            );
                            default: return null;
                          }
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Staff workload chart */}
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="text-foreground text-[14px] mb-4" style={{ fontFamily: "var(--font-display)" }}>Khối lượng công việc</h3>
              <div role="img" aria-label="Biểu đồ khối lượng công việc nhân sự">
              {reducedData ? <ReducedDataFallback label="khối lượng" /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart id="reports-bar-staff" data={staffStats} layout="vertical" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={120} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="tasks" fill="#1e40af" radius={[0, 4, 4, 0]} barSize={14} name="Tổng CV" />
                  <Bar dataKey="done" fill="#059669" radius={[0, 4, 4, 0]} barSize={14} name="Hoàn thành" />
                </BarChart>
              </ResponsiveContainer>
              )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Column order announcement live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {staffColOrder.announcement}
      </div>
    </PageTransition>
  );
}