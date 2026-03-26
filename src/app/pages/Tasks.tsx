import { useReducedMotion } from '../hooks/useReducedMotion';
import { useDebounce } from '../hooks/useDebounce';
import { useRovingTabindex } from '../hooks/useRovingTabindex';
import { useFocusReturn } from '../hooks/useFocusReturn';
import { useSortState } from '../hooks/useSortState';
import { useColumnVisibility, type ColumnDef } from '../hooks/useColumnVisibility';
import { useColumnResize } from '../hooks/useColumnResize';
import { useColumnOrder } from '../hooks/useColumnOrder';
import { useState, useMemo, useEffect, useCallback, memo, useRef } from 'react';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';
import { enhancedTasks, type EnhancedTask, type TaskStatus, type TaskPriority } from '../data/taskData';
import { PriorityBadge, StatusBadge } from '../components/StatusBadge';
import { ColumnToggle } from '../components/ColumnToggle';
import { ResizeHandle } from '../components/ResizeHandle';
import { DraggableHeader } from '../components/DraggableHeader';
import { ResetWidthsButton } from '../components/ResetWidthsButton';
import {
  Plus, MoreHorizontal, Clock, Search, Filter, X, Check, Trash2,
  AlertCircle, Send, User, FileText, CheckSquare, Square,
  MessageSquare, BarChart3, List, LayoutGrid, GanttChart,
  ChevronDown, ChevronRight, Calendar, ChevronUp, ArrowUpDown,
  Columns,
} from 'lucide-react';

import { toast as sonnerToast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { useFocusTrap } from '../hooks/useFocusTrap';

const columns = [
  { id: 'todo' as TaskStatus, label: 'Chờ xử lý', color: 'bg-gray-400', light: 'bg-gray-50 dark:bg-gray-800/40', border: 'border-gray-200 dark:border-gray-700' },
  { id: 'in_progress' as TaskStatus, label: 'Đang thực hiện', color: 'bg-blue-500', light: 'bg-blue-50 dark:bg-blue-900/30', border: 'border-blue-200 dark:border-blue-800' },
  { id: 'review' as TaskStatus, label: 'Chờ duyệt', color: 'bg-purple-500', light: 'bg-purple-50 dark:bg-purple-900/30', border: 'border-purple-200 dark:border-purple-800' },
  { id: 'done' as TaskStatus, label: 'Hoàn thành', color: 'bg-emerald-500', light: 'bg-emerald-50 dark:bg-emerald-900/30', border: 'border-emerald-200 dark:border-emerald-800' },
];

type TaskColKey = 'title' | 'assignee' | 'dueDate' | 'priority' | 'status' | 'progress' | 'actions';

export function Tasks() {
  const { user, hasPermission } = useAuth();
  const [tasks, setTasks] = useState<EnhancedTask[]>(enhancedTasks);
  const [viewMode, setViewMode] = useState<'board' | 'list' | 'gantt'>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<EnhancedTask | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set());
  const reducedMotion = useReducedMotion();

  // Task list column visibility
  const taskColDefs = useMemo<ColumnDef<TaskColKey>[]>(() => [
    { key: 'title', label: 'Công việc', required: true },
    { key: 'assignee', label: 'Người thực hiện' },
    { key: 'dueDate', label: 'Thời hạn' },
    { key: 'priority', label: 'Ưu tiên' },
    { key: 'status', label: 'Trạng thái' },
    { key: 'progress', label: 'Tiến độ' },
    { key: 'actions', label: 'Chuyển', required: true },
  ], []);
  const taskColVis = useColumnVisibility<TaskColKey>({ storageKey: 'tasks_list', columns: taskColDefs });

  // Task list column resize
  const taskResizeCols = useMemo(() => ['title', 'assignee', 'dueDate', 'priority', 'status', 'progress', 'actions'] as TaskColKey[], []);
  const taskColResize = useColumnResize<TaskColKey>({
    storageKey: 'tasks_list',
    columns: taskResizeCols,
    config: {
      title: { defaultWidth: 260, minWidth: 150, maxWidth: 450 },
      assignee: { defaultWidth: 160, minWidth: 100, maxWidth: 280 },
      dueDate: { defaultWidth: 110, minWidth: 80, maxWidth: 180 },
      priority: { defaultWidth: 100, minWidth: 70, maxWidth: 160 },
      status: { defaultWidth: 120, minWidth: 80, maxWidth: 200 },
      progress: { defaultWidth: 140, minWidth: 90, maxWidth: 220 },
      actions: { defaultWidth: 120, minWidth: 80, maxWidth: 180 },
    },
    defaultMinWidth: 70,
  });
  const taskTableRef = useRef<HTMLTableElement>(null);

  // Column order (drag-and-drop reorder)
  const defaultTaskColOrder = useMemo<TaskColKey[]>(() => ['title', 'assignee', 'dueDate', 'priority', 'status', 'progress', 'actions'], []);
  const taskColLabels = useMemo<Record<TaskColKey, string>>(() => ({
    title: 'Nhiệm vụ', assignee: 'Người thực hiện', dueDate: 'Hạn',
    priority: 'Độ ưu tiên', status: 'Trạng thái', progress: 'Tiến độ', actions: 'Thao tác',
  }), []);
  const taskColOrder = useColumnOrder<TaskColKey>({ storageKey: 'tasks_list', defaultOrder: defaultTaskColOrder, labels: taskColLabels });
  const taskOrderedVisibleCols = useMemo(() => taskColOrder.order.filter(k => k === 'title' || taskColVis.isVisible(k)), [taskColOrder.order, taskColVis]);

  // Task list sort
  type TaskSortKey = 'title' | 'assignee' | 'dueDate' | 'priority' | 'status' | 'progress';
  const taskSortLabels: Record<TaskSortKey, string> = {
    title: 'Công việc', assignee: 'Người thực hiện', dueDate: 'Thời hạn',
    priority: 'Ưu tiên', status: 'Trạng thái', progress: 'Tiến độ',
  };
  const { sortKey: taskSortKey, sortDir: taskSortDir, announcement: taskSortAnnouncement, handleSort: handleTaskSort, handleSortKeyDown: handleTaskSortKeyDown, getAriaSort: getTaskAriaSort, resetSort: resetTaskSort, isSorted: isTaskSorted } = useSortState<TaskSortKey>({
    storageKey: 'tasks_list',
    labels: taskSortLabels,
  });

  const TaskSortIcon = ({ col }: { col: TaskSortKey }) => (
    <span className="inline-flex ml-1 align-middle">
      {taskSortKey === col
        ? (taskSortDir === 'ascending' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
        : <ArrowUpDown className="w-3 h-3 opacity-0 group-hover/th:opacity-40 transition-opacity" />
      }
    </span>
  );

  // Focus return for modals
  useFocusReturn(!!selectedTask);
  useFocusReturn(showCreate);

  // Escape key handler for modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCreate) setShowCreate(false);
        else if (selectedTask) setSelectedTask(null);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showCreate, selectedTask]);

  // Create form
  const [createForm, setCreateForm] = useState({
    title: '', description: '', assignee: '', priority: 'medium' as TaskPriority,
    dueDate: '', startDate: new Date().toISOString().split('T')[0], tags: '',
  });

  const showToast = (msg: string) => { sonnerToast.success(msg); };

  // Row selection helpers for list view
  const toggleTaskSelect = useCallback((id: string) => {
    setSelectedTaskIds(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }, []);
  const toggleTaskSelectAll = useCallback((ids: string[]) => {
    setSelectedTaskIds(prev => prev.size === ids.length ? new Set() : new Set(ids));
  }, []);
  const handleBulkTaskDelete = useCallback(() => {
    setTasks(prev => prev.filter(t => !selectedTaskIds.has(t.id)));
    sonnerToast.success(`Đã xóa ${selectedTaskIds.size} công việc`);
    setSelectedTaskIds(new Set());
  }, [selectedTaskIds]);
  const handleBulkTaskComplete = useCallback(() => {
    setTasks(prev => prev.map(t => selectedTaskIds.has(t.id) ? { ...t, status: 'done' as TaskStatus, progress: 100, completedDate: new Date().toISOString() } : t));
    sonnerToast.success(`Đã hoàn thành ${selectedTaskIds.size} công việc`);
    setSelectedTaskIds(new Set());
  }, [selectedTaskIds]);

  const assignees = useMemo(() => [...new Set(tasks.map((t) => t.assignee))], [tasks]);

  const debouncedSearch = useDebounce(searchQuery, 250);

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch = t.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        t.assignee.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      const matchAssignee = assigneeFilter === 'all' || t.assignee === assigneeFilter;
      return matchSearch && matchPriority && matchAssignee;
    });
  }, [tasks, debouncedSearch, priorityFilter, assigneeFilter]);

  const stats = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter((t) => t.status === 'todo').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    review: tasks.filter((t) => t.status === 'review').length,
    done: tasks.filter((t) => t.status === 'done').length,
    overdue: tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
  }), [tasks]);

  const moveTask = useCallback((taskId: string, newStatus: TaskStatus) => {
    setTasks((prev) => prev.map((t) => {
      if (t.id !== taskId) return t;
      const progress = newStatus === 'done' ? 100 : newStatus === 'review' ? 90 : newStatus === 'in_progress' ? Math.max(t.progress, 10) : 0;
      return { ...t, status: newStatus, progress, completedDate: newStatus === 'done' ? new Date().toISOString() : undefined, updatedAt: new Date().toISOString() };
    }));
    showToast('Đã cập nhật trạng thái công việc');
    setSelectedTask((prev) => prev && prev.id === taskId ? { ...prev, status: newStatus } : prev);
  }, []);

  const toggleChecklist = useCallback((taskId: string, checkId: string) => {
    setTasks((prev) => prev.map((t) => {
      if (t.id !== taskId) return t;
      const checklist = t.checklist.map((c) => c.id === checkId ? { ...c, completed: !c.completed } : c);
      const completedCount = checklist.filter((c) => c.completed).length;
      const progress = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : t.progress;
      return { ...t, checklist, progress };
    }));
  }, []);

  const addComment = useCallback((taskId: string, content: string) => {
    if (!content.trim() || !user) return;
    setTasks((prev) => prev.map((t) => {
      if (t.id !== taskId) return t;
      return { ...t, comments: [...t.comments, { id: `tc-${Date.now()}`, userId: user.id, userName: user.fullName, userAvatar: user.avatar, content, timestamp: new Date().toISOString() }] };
    }));
  }, [user]);

  const handleSelectTask = useCallback((task: EnhancedTask) => {
    setSelectedTask(task);
  }, []);

  const handleCreate = useCallback(() => {
    if (!createForm.title.trim()) return;
    const newTask: EnhancedTask = {
      id: `TASK-${Date.now()}`, title: createForm.title, description: createForm.description,
      assigneeId: user?.id || '', assignee: createForm.assignee || user?.fullName || '',
      assigneeAvatar: (createForm.assignee || user?.fullName || '').split(' ').map((w) => w[0]).slice(-2).join('').toUpperCase(),
      creatorId: user?.id || '', creatorName: user?.fullName || '',
      departmentId: '', departmentName: '', dueDate: createForm.dueDate, startDate: createForm.startDate,
      status: 'todo', priority: createForm.priority, progress: 0,
      tags: createForm.tags ? createForm.tags.split(',').map((s) => s.trim()) : [],
      checklist: [], comments: [],
      createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString(),
    };
    setTasks([newTask, ...tasks]);
    setShowCreate(false);
    setCreateForm({ title: '', description: '', assignee: '', priority: 'medium', dueDate: '', startDate: new Date().toISOString().split('T')[0], tags: '' });
    showToast('Tạo công việc thành công!');
  }, [createForm, tasks, user]);

  const isOverdue = (t: EnhancedTask) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done';

  // Kanban keyboard navigation state
  const [focusedCol, setFocusedCol] = useState(0);
  const [focusedCard, setFocusedCard] = useState(0);
  const kanbanRef = useRef<HTMLDivElement>(null);

  const viewModeKeys = useMemo(() => ['board', 'list', 'gantt'] as const, []);
  const { getTabIndex: getViewTabIndex, handleTablistKeyDown: handleViewTablistKeyDown } = useRovingTabindex(
    viewModeKeys as unknown as string[],
    viewMode,
    (key) => setViewMode(key as any),
  );

  // Build column->tasks map for keyboard nav
  const columnTasks = useMemo(() => columns.map((col) => filtered.filter((t) => t.status === col.id)), [filtered]);

  // Sorted tasks for list view
  const sortedFiltered = useMemo(() => {
    if (!taskSortKey) return filtered;
    const priorityOrder = ['urgent', 'high', 'medium', 'low'];
    const statusOrder = ['todo', 'in_progress', 'review', 'done'];
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (taskSortKey) {
        case 'title': cmp = a.title.localeCompare(b.title, 'vi'); break;
        case 'assignee': cmp = a.assignee.localeCompare(b.assignee, 'vi'); break;
        case 'dueDate': cmp = (a.dueDate || '').localeCompare(b.dueDate || ''); break;
        case 'priority': cmp = priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority); break;
        case 'status': cmp = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status); break;
        case 'progress': cmp = a.progress - b.progress; break;
      }
      return taskSortDir === 'ascending' ? cmp : -cmp;
    });
  }, [filtered, taskSortKey, taskSortDir]);

  const handleKanbanKeyDown = useCallback((e: React.KeyboardEvent) => {
    const colCount = columns.length;
    const currentCards = columnTasks[focusedCol] || [];
    const cardCount = currentCards.length;

    switch (e.key) {
      case 'ArrowRight': {
        e.preventDefault();
        const nextCol = Math.min(focusedCol + 1, colCount - 1);
        setFocusedCol(nextCol);
        const nextCards = columnTasks[nextCol] || [];
        setFocusedCard(Math.min(focusedCard, Math.max(0, nextCards.length - 1)));
        break;
      }
      case 'ArrowLeft': {
        e.preventDefault();
        const prevCol = Math.max(focusedCol - 1, 0);
        setFocusedCol(prevCol);
        const prevCards = columnTasks[prevCol] || [];
        setFocusedCard(Math.min(focusedCard, Math.max(0, prevCards.length - 1)));
        break;
      }
      case 'ArrowDown':
        e.preventDefault();
        setFocusedCard(Math.min(focusedCard + 1, Math.max(0, cardCount - 1)));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedCard(Math.max(focusedCard - 1, 0));
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (currentCards[focusedCard]) {
          handleSelectTask(currentCards[focusedCard]);
        }
        break;
    }
  }, [focusedCol, focusedCard, columnTasks, handleSelectTask]);

  // Scroll focused card into view
  useEffect(() => {
    if (viewMode !== 'board') return;
    const card = kanbanRef.current?.querySelector(`[data-kanban-col="${focusedCol}"][data-kanban-card="${focusedCard}"]`) as HTMLElement | null;
    card?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [focusedCol, focusedCard, viewMode]);

  return (
    <PageTransition>
      <Header title="Quản lý Công việc" />
      <div className="flex-1 overflow-hidden p-6 flex flex-col">
        {/* Stats Mini */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
          {[
            { l: 'Tổng', v: stats.total, c: 'text-foreground', bg: 'bg-card border border-border' },
            { l: 'Chờ xử lý', v: stats.todo, c: 'text-gray-600 dark:text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800/50' },
            { l: 'Đang làm', v: stats.inProgress, c: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
            { l: 'Chờ duyệt', v: stats.review, c: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30' },
            { l: 'Hoàn thành', v: stats.done, c: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
            { l: 'Quá hạn', v: stats.overdue, c: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-900/30' },
          ].map((s, idx) => (
            <motion.div
              key={s.l}
              initial={reducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={reducedMotion ? { duration: 0 } : { delay: idx * 0.04, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`${s.bg} rounded-xl px-3 py-2.5 flex items-center gap-2`}
            >
              <span className={`text-[20px] tabular-nums ${s.c}`} style={{ fontFamily: "var(--font-display)" }}>{s.v}</span>
              <span className="text-[12px] text-muted-foreground">{s.l}</span>
            </motion.div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-card rounded-xl border border-border p-1" role="tablist" aria-label="Chế độ xem công việc" style={{ boxShadow: 'var(--shadow-xs)' }} onKeyDown={handleViewTablistKeyDown}>
            {[
              { key: 'board', label: 'Kanban', icon: LayoutGrid },
              { key: 'list', label: 'Danh sách', icon: List },
              { key: 'gantt', label: 'Gantt', icon: GanttChart },
            ].map((v) => (
              <button key={v.key} onClick={() => setViewMode(v.key as any)}
                role="tab"
                aria-selected={viewMode === v.key}
                aria-controls={`tabpanel-tasks-${v.key}`}
                id={`tab-tasks-${v.key}`}
                tabIndex={getViewTabIndex(v.key)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13px] transition-all ${viewMode === v.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
                style={viewMode === v.key ? { boxShadow: 'var(--shadow-sm)' } : undefined}>
                <v.icon className="w-4 h-4" /> {v.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <input type="text" placeholder="Tìm kiếm..." value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Tìm kiếm công việc"
                className="pl-9 pr-3 py-2 bg-surface-2 border border-transparent rounded-xl text-[13px] w-48 outline-none focus:border-primary/20 focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-muted-foreground/40" />
            </div>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Lọc theo mức ộ ưu tiên"
              className="px-3 py-2 bg-surface-2 border border-transparent rounded-lg text-[13px] outline-none cursor-pointer text-foreground focus:border-primary/20">
              <option value="all">Tất cả ưu tiên</option>
              <option value="urgent">Khẩn cấp</option>
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
            <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)}
              aria-label="Lọc theo người thực hiện"
              className="px-3 py-2 bg-surface-2 border border-transparent rounded-lg text-[13px] outline-none cursor-pointer text-foreground focus:border-primary/20">
              <option value="all">Tất cả người</option>
              {assignees.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            {viewMode === 'list' && (
              <ColumnToggle
                isOpen={taskColVis.isOpen}
                setIsOpen={taskColVis.setIsOpen}
                columns={taskColVis.columns}
                isVisible={taskColVis.isVisible}
                toggle={taskColVis.toggle}
                resetAll={taskColVis.resetAll}
                showOnlyRequired={taskColVis.showOnlyRequired}
                hideAllOptional={taskColVis.hideAllOptional}
                allOptionalVisible={taskColVis.allOptionalVisible}
                allOptionalHidden={taskColVis.allOptionalHidden}
                handleMenuKeyDown={taskColVis.handleMenuKeyDown}
                visibleCount={taskColVis.visibleCount}
                totalCount={taskColVis.totalCount}
                hasHidden={taskColVis.hasHidden}
                announcement={taskColVis.announcement}
              />
            )}
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[13px] hover:opacity-90 transition-all active:scale-[0.98]"
              style={{ boxShadow: 'var(--shadow-sm)' }}>
              <Plus className="w-4 h-4" /> Thêm
            </button>
          </div>
        </div>

        {/* Filter result count - screen reader announcement */}
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          Hiển thị {filtered.length} / {tasks.length} công việc
        </p>

        {/* KANBAN VIEW */}
        {viewMode === 'board' && (
          <div className="flex-1 overflow-x-auto" ref={kanbanRef} onKeyDown={handleKanbanKeyDown} tabIndex={0}
            role="region" aria-label="Bảng Kanban công việc" aria-roledescription="Kanban board"
            id="tabpanel-tasks-board" aria-labelledby="tab-tasks-board">
            <div className="flex gap-4 h-full min-w-max pb-4">
              {columns.map((col) => {
                const colTasks = filtered.filter((t) => t.status === col.id);
                return (
                  <div key={col.id} className="w-[310px] flex flex-col shrink-0" role="group" aria-label={`${col.label} — ${colTasks.length} công việc`}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                        <h4 className="text-[13px] text-foreground">{col.label}</h4>
                        <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{colTasks.length}</span>
                      </div>
                    </div>
                    <div className={`flex-1 rounded-xl p-2 space-y-2 ${col.light} ${col.border} border overflow-y-auto`}>
                      {colTasks.map((task, cardIdx) => (
                        <KanbanCard
                          key={task.id}
                          task={task}
                          isOverdue={isOverdue(task)}
                          onSelect={handleSelectTask}
                          colIndex={columns.indexOf(col)}
                          cardIndex={cardIdx}
                          isFocused={viewMode === 'board' && focusedCol === columns.indexOf(col) && focusedCard === cardIdx}
                        />
                      ))}
                      {colTasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center mb-2">
                            <Plus className="w-4 h-4 text-muted-foreground/30" />
                          </div>
                          <p className="text-[12px] text-muted-foreground">Chưa có công việc</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LIST VIEW */}
        {viewMode === 'list' && (
          <div className="flex-1 overflow-y-auto bg-card rounded-xl border border-border"
            id="tabpanel-tasks-list" role="tabpanel" aria-labelledby="tab-tasks-list">
            {selectedTaskIds.size > 0 && (
              <div className="px-4 py-2.5 border-b border-primary/20 bg-primary/5 flex items-center gap-3">
                <span className="text-[12px] text-primary">Đã chọn {selectedTaskIds.size} công việc</span>
                <button onClick={handleBulkTaskComplete} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[11px] hover:opacity-90">
                  <Check className="w-3.5 h-3.5" /> Hoàn thành
                </button>
                <button onClick={handleBulkTaskDelete} className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-[11px] hover:opacity-90">
                  <Trash2 className="w-3.5 h-3.5" /> Xóa
                </button>
                <button onClick={() => setSelectedTaskIds(new Set())} className="flex items-center gap-1 px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-accent rounded-lg ml-auto">
                  <X className="w-3.5 h-3.5" /> Bỏ chọn
                </button>
              </div>
            )}
            <div className="overflow-auto max-h-[65vh]">
              <table ref={taskTableRef} className="w-full" style={{ tableLayout: 'fixed' }} aria-rowcount={filtered.length + 1}>
                <caption className="sr-only">Danh sách công việc — {filtered.length} mục</caption>
                <thead className="sticky-header">
                  <tr className="bg-accent/30">
                    <th scope="col" role="columnheader" className="w-10 px-3 py-3">
                      <div className="cursor-pointer" role="checkbox" aria-checked={selectedTaskIds.size === sortedFiltered.length && sortedFiltered.length > 0} aria-label="Chọn tất cả công việc"
                        onClick={() => toggleTaskSelectAll(sortedFiltered.map(t => t.id))}>
                        {selectedTaskIds.size === sortedFiltered.length && sortedFiltered.length > 0
                          ? <CheckSquare className="w-4 h-4 text-primary" />
                          : <Square className="w-4 h-4 text-muted-foreground" />}
                      </div>
                    </th>
                    {taskOrderedVisibleCols.map((colKey, idx) => {
                      const colIdx = idx + 1;
                      const sortableClass = "relative text-left px-4 py-3 text-[11px] text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors group/th";
                      const headerLabels: Record<TaskColKey, string> = {
                        title: 'CÔNG VIỆC', assignee: 'NGƯỜI THỰC HIỆN', dueDate: 'THỜI HẠN',
                        priority: 'ƯU TIÊN', status: 'TRẠNG THÁI', progress: 'TIẾN ĐỘ', actions: 'CHUYỂN',
                      };
                      if (colKey === 'actions') {
                        return <th key={colKey} scope="col" role="columnheader" aria-colindex={colIdx} className="text-center px-4 py-3 text-[11px] text-muted-foreground" style={taskColResize.getHeaderProps('actions').style}>CHUYỂN</th>;
                      }
                      const sortCol = colKey as TaskSortKey;
                      return (
                        <DraggableHeader key={colKey} colKey={colKey} index={taskColOrder.getColumnIndex(colKey)} onMove={taskColOrder.moveColumn} onKeyboardMove={(k, d) => taskColOrder.moveColumnByKey(k as TaskColKey, d)}
                          scope="col" role="columnheader" aria-colindex={colIdx} aria-sort={getTaskAriaSort(sortCol)} tabIndex={0}
                          title="Nhấn Enter để sắp xếp, Alt+← → để di chuyển cột" aria-describedby="task-sort-hint"
                          className={sortableClass} style={taskColResize.getHeaderProps(colKey).style}
                          onClick={() => handleTaskSort(sortCol)} onKeyDown={(e) => handleTaskSortKeyDown(e, sortCol)}>
                          {headerLabels[colKey]} <TaskSortIcon col={sortCol} />
                          <ResizeHandle onResizeStart={(e) => taskColResize.onResizeStart(colKey, e)} onDoubleClick={() => taskColResize.autoFit(colKey, taskTableRef.current)} onKeyboardResize={(d) => taskColResize.keyboardResize(colKey, d)} />
                        </DraggableHeader>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {sortedFiltered.map((task) => (
                    <TaskListRow key={task.id} task={task} isOverdue={isOverdue(task)} onSelect={handleSelectTask} onMove={moveTask} isColVisible={taskColVis.isVisible} orderedCols={taskOrderedVisibleCols} isSelected={selectedTaskIds.has(task.id)} onToggleSelect={toggleTaskSelect} />
                  ))}
                </tbody>
              </table>
            </div>
            {(isTaskSorted || taskColResize.isResized || taskColOrder.isReordered) && (
              <div className="flex items-center px-4 py-2 border-t border-border bg-surface-2/30">
                {isTaskSorted && (
                  <button onClick={resetTaskSort}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                    aria-label="Xóa sắp xếp">
                    <X className="w-3 h-3" /> Xóa sắp xếp
                  </button>
                )}
                <ResetWidthsButton isResized={taskColResize.isResized} onReset={taskColResize.resetWidths} />
                {taskColOrder.isReordered && (
                  <button onClick={taskColOrder.resetOrder} className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" aria-label="Đặt lại thứ tự cột">
                    <ArrowUpDown className="w-3 h-3" /> Đặt lại thứ tự
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* GANTT VIEW */}
        {viewMode === 'gantt' && <div id="tabpanel-tasks-gantt" role="tabpanel" aria-labelledby="tab-tasks-gantt"><MemoizedGanttView tasks={filtered} onSelectTask={setSelectedTask} /></div>}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onMove={moveTask}
          onToggleChecklist={toggleChecklist}
          onAddComment={addComment}
        />
      )}

      {/* Create Modal */}
      {showCreate && (
        <CreateTaskModal
          createForm={createForm}
          setCreateForm={setCreateForm}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
          userName={user?.fullName}
        />
      )}

      {/* Sort announcement live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {taskSortAnnouncement}
      </div>

      {/* Column order announcement live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {taskColOrder.announcement}
      </div>

      {/* Sort hint for aria-describedby */}
      <span id="task-sort-hint" className="sr-only">Nhấn Enter hoặc Space để sắp xếp cột, Escape để xóa sắp xếp</span>
    </PageTransition>
  );
}

// ==========================================
// GANTT VIEW
// ==========================================
function GanttView({ tasks, onSelectTask }: { tasks: EnhancedTask[]; onSelectTask: (t: EnhancedTask) => void }) {
  const today = new Date();
  const startOfRange = new Date(2026, 2, 1); // March 1
  const endOfRange = new Date(2026, 3, 5); // April 5
  const totalDays = Math.ceil((endOfRange.getTime() - startOfRange.getTime()) / (1000 * 60 * 60 * 24));

  const days = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(startOfRange);
    d.setDate(d.getDate() + i);
    return d;
  });

  const getBarStyle = (task: EnhancedTask) => {
    const start = task.startDate ? new Date(task.startDate) : new Date(task.createdAt);
    const end = task.dueDate ? new Date(task.dueDate) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    const startOffset = Math.max(0, Math.ceil((start.getTime() - startOfRange.getTime()) / (1000 * 60 * 60 * 24)));
    const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const left = (startOffset / totalDays) * 100;
    const width = (duration / totalDays) * 100;
    return { left: `${left}%`, width: `${Math.min(width, 100 - left)}%` };
  };

  const getBarColor = (task: EnhancedTask) => {
    if (task.status === 'done') return 'bg-emerald-400';
    if (task.status === 'review') return 'bg-purple-400';
    if (task.status === 'in_progress') return 'bg-blue-400';
    return 'bg-gray-300';
  };

  const todayOffset = Math.ceil((today.getTime() - startOfRange.getTime()) / (1000 * 60 * 60 * 24));
  const todayPosition = (todayOffset / totalDays) * 100;

  return (
    <div className="flex-1 overflow-auto bg-card rounded-xl border border-border">
      <div className="flex min-w-[900px]">
        {/* Task names */}
        <div className="w-[280px] shrink-0 border-r border-border">
          <div className="h-14 px-4 flex items-center border-b border-border bg-accent/30">
            <span className="text-[12px] text-muted-foreground">CÔNG VIỆC</span>
          </div>
          {tasks.map((task) => (
            <div key={task.id} onClick={() => onSelectTask(task)}
              className="h-12 px-4 flex items-center border-b border-border/50 hover:bg-accent/20 cursor-pointer">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary/80 to-blue-400 flex items-center justify-center text-white text-[8px] shrink-0">{task.assigneeAvatar}</div>
                <span className="text-[12px] text-foreground truncate">{task.title}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="flex-1 relative">
          {/* Header - days */}
          <div className="h-14 flex border-b border-border bg-accent/30 relative">
            {days.map((day, i) => {
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              const isToday = day.toDateString() === today.toDateString();
              return (
                <div key={i} className={`flex-shrink-0 flex flex-col items-center justify-center border-r border-border/30 ${isWeekend ? 'bg-red-50/30 dark:bg-red-900/10' : ''} ${isToday ? 'bg-primary/5' : ''}`}
                  style={{ width: `${100 / totalDays}%`, minWidth: '24px' }}>
                  <span className="text-[9px] text-muted-foreground">{['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day.getDay()]}</span>
                  <span className={`text-[10px] ${isToday ? 'text-primary bg-primary/10 rounded-full w-5 h-5 flex items-center justify-center' : 'text-foreground'}`}>{day.getDate()}</span>
                </div>
              );
            })}
          </div>

          {/* Rows */}
          {tasks.map((task) => {
            const barStyle = getBarStyle(task);
            return (
              <div key={task.id} className="h-12 relative border-b border-border/50" onClick={() => onSelectTask(task)}>
                {/* Background grid */}
                <div className="absolute inset-0 flex">
                  {days.map((day, i) => {
                    const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                    return <div key={i} className={`flex-shrink-0 border-r border-border/10 ${isWeekend ? 'bg-red-50/20 dark:bg-red-900/10' : ''}`} style={{ width: `${100 / totalDays}%`, minWidth: '24px' }} />;
                  })}
                </div>
                {/* Task bar */}
                <div className="absolute top-2 h-8 cursor-pointer" style={barStyle}
                  role="button"
                  tabIndex={0}
                  aria-label={`${task.title}: tiến độ ${task.progress}%, ${task.startDate ? new Date(task.startDate).toLocaleDateString('vi-VN') : ''} – ${task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : ''}`}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectTask(task); } }}>
                  <div className={`h-full rounded-md ${getBarColor(task)} relative overflow-hidden hover:opacity-80 transition-opacity`}>
                    <div className="absolute inset-0 bg-white/20 rounded-md" style={{ width: `${task.progress}%` }} />
                    <span className="absolute inset-0 flex items-center px-2 text-[10px] text-white truncate">{task.progress}%</span>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Today line */}
          {todayPosition >= 0 && todayPosition <= 100 && (
            <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" style={{ left: `${todayPosition}%` }}
              role="img" aria-label={`Mốc hôm nay: ${today.toLocaleDateString('vi-VN')}`}>
              <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-red-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const MemoizedGanttView = memo(GanttView);

// ==========================================
// TASK DETAIL MODAL
// ==========================================
function TaskDetailModal({ task, onClose, onMove, onToggleChecklist, onAddComment }: {
  task: EnhancedTask;
  onClose: () => void;
  onMove: (id: string, status: TaskStatus) => void;
  onToggleChecklist: (taskId: string, checkId: string) => void;
  onAddComment: (taskId: string, content: string) => void;
}) {
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState<'detail' | 'checklist' | 'comments'>('detail');
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
  const dialogRef = useFocusTrap<HTMLDivElement>(true);
  const reducedMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-labelledby="task-detail-title"
        style={{ boxShadow: 'var(--shadow-xl)' }}
        ref={dialogRef}>
        <div className="px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded">{task.id}</span>
                <PriorityBadge priority={task.priority} />
                <StatusBadge status={task.status} />
                {isOverdue && <span className="text-[11px] text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-0.5 rounded-full flex items-center gap-0.5"><AlertCircle className="w-3 h-3" /> Quá hạn</span>}
              </div>
              <h2 id="task-detail-title" className="text-foreground text-[16px]" style={{ fontFamily: "var(--font-display)" }}>{task.title}</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Đóng"><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>
          {/* Quick status change */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-[12px] text-muted-foreground">Chuyển sang:</span>
            {columns.filter((c) => c.id !== task.status).map((col) => (
              <button key={col.id} onClick={() => onMove(task.id, col.id)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] bg-accent hover:bg-accent/80 text-foreground transition-colors">
                <div className={`w-2 h-2 rounded-full ${col.color}`} /> {col.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0 px-2">
          {[
            { key: 'detail', label: 'Chi tiết', icon: FileText },
            { key: 'checklist', label: `Checklist (${task.checklist.filter((c) => c.completed).length}/${task.checklist.length})`, icon: CheckSquare },
            { key: 'comments', label: `Ý kiến (${task.comments.length})`, icon: MessageSquare },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-1.5 px-4 py-3 text-[13px] relative ${activeTab === tab.key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
              {activeTab === tab.key && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'detail' && (
            <div className="space-y-4">
              {task.description && (
                <div className="p-4 bg-accent/30 rounded-lg text-[13px] text-foreground leading-relaxed">{task.description}</div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon={User} label="Người thực hiện" value={task.assignee} />
                <InfoItem icon={User} label="Người giao" value={task.creatorName} />
                <InfoItem icon={Calendar} label="Bắt đầu" value={task.startDate ? new Date(task.startDate).toLocaleDateString('vi-VN') : '--'} />
                <InfoItem icon={Clock} label="Hạn hoàn thành" value={task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : '--'} valueClass={isOverdue ? 'text-red-600' : ''} />
                {task.documentRef && <InfoItem icon={FileText} label="Văn bản" value={`${task.documentRef} - ${task.documentTitle || ''}`} />}
              </div>
              <div>
                <span className="text-[12px] text-muted-foreground">Tiến độ</span>
                <div className="flex items-center gap-3 mt-1.5">
                  <div className="flex-1 bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${task.progress}%` }} />
                  </div>
                  <span className="text-[14px] text-primary">{task.progress}%</span>
                </div>
              </div>
              {task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {task.tags.map((t) => <span key={t} className="text-[11px] px-2 py-1 rounded-lg bg-secondary text-secondary-foreground">{t}</span>)}
                </div>
              )}
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-2">
              {task.checklist.length === 0 ? (
                <div className="text-center py-8 text-[13px] text-muted-foreground">
                  <CheckSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  Chưa có danh mục công việc con
                </div>
              ) : (
                task.checklist.map((item) => (
                  <label key={item.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/30 cursor-pointer transition-colors">
                    <button onClick={() => onToggleChecklist(task.id, item.id)}
                      className="shrink-0">
                      {item.completed
                        ? <CheckSquare className="w-5 h-5 text-primary" />
                        : <Square className="w-5 h-5 text-muted-foreground/50" />}
                    </button>
                    <span className={`text-[13px] ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.title}</span>
                  </label>
                ))
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="space-y-4">
              {task.comments.map((cmt) => (
                <div key={cmt.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/80 to-blue-400 flex items-center justify-center text-white text-[10px] shrink-0">{cmt.userAvatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[13px] text-foreground">{cmt.userName}</span>
                      <span className="text-[11px] text-muted-foreground">{new Date(cmt.timestamp).toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="p-3 bg-accent/40 rounded-lg text-[13px] text-foreground">{cmt.content}</div>
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-3 border-t border-border">
                <textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Thêm ý kiến..."
                  className="flex-1 px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/20 outline-none resize-none" />
                <button onClick={() => { if (comment.trim()) { onAddComment(task.id, comment); setComment(''); } }}
                  disabled={!comment.trim()}
                  className="px-4 self-end py-2.5 bg-primary text-primary-foreground rounded-lg text-[12px] hover:opacity-90 disabled:opacity-40 shadow-sm">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value, valueClass = '' }: { icon: typeof User; label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-start gap-2.5 p-3 rounded-lg bg-accent/20">
      <Icon className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
      <div>
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={`text-[13px] mt-0.5 text-foreground ${valueClass}`}>{value}</p>
      </div>
    </div>
  );
}

// ==========================================
// CREATE TASK MODAL
// ==========================================
function CreateTaskModal({ createForm, setCreateForm, onClose, onCreate, userName }: {
  createForm: { title: string; description: string; assignee: string; priority: TaskPriority; dueDate: string; startDate: string; tags: string; };
  setCreateForm: (form: { title: string; description: string; assignee: string; priority: TaskPriority; dueDate: string; startDate: string; tags: string; }) => void;
  onClose: () => void;
  onCreate: () => void;
  userName: string | undefined;
}) {
  const dialogRef = useFocusTrap<HTMLDivElement>(true);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg" onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-labelledby="create-task-title"
        style={{ boxShadow: 'var(--shadow-xl)' }}
        ref={dialogRef}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 id="create-task-title" className="text-foreground" style={{ fontFamily: "var(--font-display)" }}>Thêm công việc mới</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors" aria-label="Đóng"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="task-title" className="block text-[13px] text-foreground mb-1.5">Tiêu đề *</label>
            <input id="task-title" type="text" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              aria-required="true"
              className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
          </div>
          <div>
            <label htmlFor="task-desc" className="block text-[13px] text-foreground mb-1.5">Mô tả</label>
            <textarea id="task-desc" rows={3} value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-assignee" className="block text-[13px] text-foreground mb-1.5">Người thực hiện</label>
              <input id="task-assignee" type="text" value={createForm.assignee} onChange={(e) => setCreateForm({ ...createForm, assignee: e.target.value })} placeholder={userName}
                className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none" />
            </div>
            <div>
              <label htmlFor="task-priority" className="block text-[13px] text-foreground mb-1.5">Mức độ</label>
              <select id="task-priority" value={createForm.priority} onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value as TaskPriority })}
                className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                <option value="urgent">Khẩn cấp</option>
                <option value="high">Cao</option>
                <option value="medium">Trung bình</option>
                <option value="low">Thấp</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-start" className="block text-[13px] text-foreground mb-1.5">Ngày bắt đầu</label>
              <input id="task-start" type="date" value={createForm.startDate} onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none" />
            </div>
            <div>
              <label htmlFor="task-due" className="block text-[13px] text-foreground mb-1.5">Hạn hoàn thành</label>
              <input id="task-due" type="date" value={createForm.dueDate} onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none" />
            </div>
          </div>
          <div>
            <label htmlFor="task-tags" className="block text-[13px] text-foreground mb-1.5">Nhãn (phân cách bằng dấu phẩy)</label>
            <input id="task-tags" type="text" value={createForm.tags} onChange={(e) => setCreateForm({ ...createForm, tags: e.target.value })} placeholder="VD: Báo cáo, CNTT"
              className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] text-muted-foreground hover:bg-accent transition-colors">Hủy</button>
          <button onClick={onCreate} disabled={!createForm.title.trim()}
            className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-[13px] hover:opacity-90 disabled:opacity-40 transition-all active:scale-[0.98]"
            style={{ boxShadow: 'var(--shadow-sm)' }}>Tạo công việc</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// KANBAN CARD (memoized)
// ==========================================
const KanbanCard = memo(function KanbanCard({ task, isOverdue, onSelect, colIndex, cardIndex, isFocused }: { task: EnhancedTask; isOverdue: boolean; onSelect: (t: EnhancedTask) => void; colIndex: number; cardIndex: number; isFocused: boolean }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div key={task.id}
      layout={!reducedMotion}
      initial={reducedMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={reducedMotion ? undefined : { y: -2, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.1), 0 4px 10px -6px rgba(0,0,0,0.05)' }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onSelect(task)}
      className={`bg-card rounded-xl border border-border p-3.5 shadow-sm cursor-pointer group ${isOverdue ? 'border-l-3 border-l-red-400' : ''}`}
      data-kanban-col={colIndex}
      data-kanban-card={cardIndex}
      tabIndex={isFocused ? 0 : -1}
      aria-label={`${task.title}`}
      aria-describedby={`kanban-desc-${task.id}`}
      style={isFocused ? { outline: '2px solid var(--primary)' } : { outline: 'none' }}>
      <span id={`kanban-desc-${task.id}`} className="sr-only">
        Người thực hiện: {task.assignee}. Hạn: {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : 'Chưa đặt'}.{isOverdue ? ' Quá hạn.' : ''} Tiến độ: {task.progress}%.
      </span>
      <div className="flex items-start justify-between mb-1.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {task.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/5 text-primary">{tag}</span>
          ))}
        </div>
        <PriorityBadge priority={task.priority} />
      </div>
      <p className="text-[13px] text-foreground mb-2 line-clamp-2">{task.title}</p>
      {task.documentRef && (
        <span className="text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded mb-2 inline-flex items-center gap-0.5">
          <FileText className="w-3 h-3" /> {task.documentRef}
        </span>
      )}
      {task.checklist.length > 0 && (
        <div className="flex items-center gap-1.5 mb-2 text-[11px] text-muted-foreground">
          <CheckSquare className="w-3 h-3" />
          {task.checklist.filter((c) => c.completed).length}/{task.checklist.length}
        </div>
      )}
      {task.progress > 0 && task.progress < 100 && (
        <div className="mb-2">
          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-primary h-1.5 rounded-full transition-all" style={{ width: `${task.progress}%` }} />
          </div>
        </div>
      )}
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/80 to-blue-400 flex items-center justify-center text-white text-[9px]">{task.assigneeAvatar}</div>
          <span className="text-[11px] text-muted-foreground">{task.assignee.split(' ').pop()}</span>
        </div>
        <div className="flex items-center gap-2">
          {task.comments.length > 0 && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><MessageSquare className="w-3 h-3" />{task.comments.length}</span>}
          <span className={`text-[11px] flex items-center gap-0.5 ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
            <Clock className="w-3 h-3" />{task.dueDate?.slice(5) || '--'}
          </span>
        </div>
      </div>
    </motion.div>
  );
});

// ==========================================
// TASK LIST ROW (memoized)
// ==========================================
const TaskListRow = memo(function TaskListRow({ task, isOverdue, onSelect, onMove, isColVisible, orderedCols, isSelected, onToggleSelect }: { task: EnhancedTask; isOverdue: boolean; onSelect: (t: EnhancedTask) => void; onMove: (id: string, status: TaskStatus) => void; isColVisible: (col: string) => boolean; orderedCols: TaskColKey[]; isSelected?: boolean; onToggleSelect?: (id: string) => void }) {
  return (
    <tr className={`border-b border-border/50 hover:bg-accent/20 transition-colors cursor-pointer group ${isOverdue ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`} onClick={() => onSelect(task)}
      tabIndex={0} onKeyDown={(e) => { if (e.key === ' ' && onToggleSelect) { e.preventDefault(); onToggleSelect(task.id); } if (e.key === 'Enter') onSelect(task); }}>
      {onToggleSelect && (
        <td className="w-10 px-3 py-3" onClick={(e) => { e.stopPropagation(); onToggleSelect(task.id); }}>
          <div className="cursor-pointer" role="checkbox" aria-checked={!!isSelected} aria-label={`Chọn ${task.title}`}>
            {isSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />}
          </div>
        </td>
      )}
      {orderedCols.map((colKey) => {
        switch (colKey) {
          case 'title': return (
            <td key="title" className="px-4 py-3">
              <p className="text-[13px] text-foreground">{task.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {task.documentRef && <span className="text-[10px] text-primary">{task.documentRef}</span>}
                {task.tags.slice(0, 2).map((t) => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground">{t}</span>)}
              </div>
            </td>
          );
          case 'assignee': return (
            <td key="assignee" className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/80 to-blue-400 flex items-center justify-center text-white text-[9px]">{task.assigneeAvatar}</div>
                <span className="text-[13px] text-muted-foreground">{task.assignee}</span>
              </div>
            </td>
          );
          case 'dueDate': return (
            <td key="dueDate" className={`px-4 py-3 text-[12px] ${isOverdue ? 'text-red-600' : 'text-muted-foreground'}`}>
              {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : '--'}
            </td>
          );
          case 'priority': return <td key="priority" className="px-4 py-3"><PriorityBadge priority={task.priority} /></td>;
          case 'status': return <td key="status" className="px-4 py-3"><StatusBadge status={task.status} /></td>;
          case 'progress': return (
            <td key="progress" className="px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-1.5">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: `${task.progress}%` }} />
                </div>
                <span className="text-[11px] text-muted-foreground w-8 text-right">{task.progress}%</span>
              </div>
            </td>
          );
          case 'actions': return (
            <td key="actions" className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
              <select value={task.status} onChange={(e) => onMove(task.id, e.target.value as TaskStatus)}
                aria-label={`Chuyển trạng thái công việc ${task.title}`}
                className="px-2 py-1 bg-input-background rounded text-[11px] border-none outline-none cursor-pointer">
                {columns.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </td>
          );
          default: return null;
        }
      })}
    </tr>
  );
});