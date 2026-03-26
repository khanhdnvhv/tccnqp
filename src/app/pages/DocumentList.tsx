import { useState, useMemo, useEffect, useCallback, memo, useRef } from 'react';
import { useFocusReturn } from '../hooks/useFocusReturn';
import { useDebounce } from '../hooks/useDebounce';
import { useSortState } from '../hooks/useSortState';
import { useColumnVisibility, type ColumnDef } from '../hooks/useColumnVisibility';
import { useColumnResize } from '../hooks/useColumnResize';
import { useColumnOrder } from '../hooks/useColumnOrder';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ColumnToggle } from '../components/ColumnToggle';
import { ResizeHandle } from '../components/ResizeHandle';
import { ResetWidthsButton } from '../components/ResetWidthsButton';
import { DraggableHeader } from '../components/DraggableHeader';
import { useAuth } from '../context/AuthContext';
import { DocumentDetail } from '../components/DocumentDetail';
import { DocumentCreate } from '../components/DocumentCreate';
import { EmptyState } from '../components/EmptyState';
import { DocumentListSkeleton } from '../components/Skeleton';
import {
  type EnhancedDocument, type IncomingStatus, type OutgoingStatus, type InternalStatus,
  getStatusConfig, priorityLabels, securityLabels,
  incomingDocs, outgoingDocs, internalDocs,
} from '../data/documentData';
import {
  Search, Filter, Plus, Download, ChevronLeft, ChevronRight,
  Eye, Pencil, Trash2, FileText, X, Hash, Clock, AlertCircle,
  Shield, Lock, Paperclip, BarChart3,
  CheckSquare, Square, Calendar, ChevronDown, ChevronUp,
  ArrowUpDown,
} from 'lucide-react';

import { toast as sonnerToast } from 'sonner';
import { motion } from 'motion/react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface DocumentListProps {
  title: string;
  type: 'incoming' | 'outgoing' | 'internal';
}

export function DocumentListEnhanced({ title, type }: DocumentListProps) {
  const { user, hasPermission, hasRole } = useAuth();
  const isAdmin = hasRole('role-admin');

  // Skeleton loading
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  // Initial data
  const getInitialDocs = () => {
    if (type === 'incoming') return [...incomingDocs];
    if (type === 'outgoing') return [...outgoingDocs];
    return [...internalDocs];
  };

  const [docs, setDocs] = useState<EnhancedDocument[]>(getInitialDocs);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDoc, setSelectedDoc] = useState<EnhancedDocument | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Focus return for modals
  useFocusReturn(!!selectedDoc);
  useFocusReturn(showCreate);
  useFocusReturn(!!deleteConfirm);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [fieldFilter, setFieldFilter] = useState('all');
  const itemsPerPage = 8;

  // Column visibility (persisted to localStorage)
  type ColKey = 'number' | 'title' | 'sender' | 'date' | 'category' | 'priority' | 'status' | 'actions';
  const docColDefs = useMemo<ColumnDef<ColKey>[]>(() => [
    { key: 'number', label: 'Số hiệu' },
    { key: 'title', label: 'Trích yếu', required: true },
    { key: 'sender', label: type === 'outgoing' ? 'Nơi nhận' : 'Nơi gửi' },
    { key: 'date', label: 'Ngày' },
    { key: 'category', label: 'Loại' },
    { key: 'priority', label: 'Độ khẩn' },
    { key: 'status', label: 'Trạng thái' },
    { key: 'actions', label: 'Thao tác', required: true },
  ], [type]);
  const colVis = useColumnVisibility<ColKey>({ storageKey: `doclist_${type}`, columns: docColDefs });
  const isColVisible = colVis.isVisible;

  // Column resize (persisted to localStorage)
  const resizableCols = useMemo(() => ['number', 'title', 'sender', 'date', 'category', 'priority', 'status', 'actions'] as ColKey[], []);
  const colResize = useColumnResize<ColKey>({
    storageKey: `doclist_${type}`,
    columns: resizableCols,
    config: {
      number: { defaultWidth: 120, minWidth: 80, maxWidth: 200 },
      title: { defaultWidth: 280, minWidth: 160, maxWidth: 500 },
      sender: { defaultWidth: 160, minWidth: 100, maxWidth: 300 },
      date: { defaultWidth: 110, minWidth: 80, maxWidth: 180 },
      category: { defaultWidth: 110, minWidth: 70, maxWidth: 200 },
      priority: { defaultWidth: 100, minWidth: 70, maxWidth: 160 },
      status: { defaultWidth: 130, minWidth: 90, maxWidth: 200 },
      actions: { defaultWidth: 100, minWidth: 80, maxWidth: 150 },
    },
    defaultMinWidth: 70,
  });
  const docTableRef = useRef<HTMLTableElement>(null);

  // Column order (drag-and-drop reorder, persisted to localStorage)
  const defaultColOrder = useMemo<ColKey[]>(() => ['number', 'title', 'sender', 'date', 'category', 'priority', 'status', 'actions'], []);
  const docColLabels = useMemo<Record<ColKey, string>>(() => ({
    number: 'Số hiệu', title: 'Trích yếu', sender: type === 'outgoing' ? 'Nơi nhận' : 'Nơi gửi',
    date: 'Ngày', category: 'Loại VB', priority: 'Độ ưu tiên', status: 'Trạng thái', actions: 'Thao tác',
  }), [type]);
  const colOrder = useColumnOrder<ColKey>({ storageKey: `doclist_${type}`, defaultOrder: defaultColOrder, labels: docColLabels });
  const orderedVisibleCols = useMemo(() => colOrder.order.filter(k => k === 'title' || isColVisible(k)), [colOrder.order, isColVisible]);

  // Column sorting
  type SortKey = 'number' | 'title' | 'sender' | 'date' | 'category' | 'priority' | 'status';
  const sortLabels: Record<SortKey, string> = {
    number: 'Số hiệu', title: 'Trích yếu', sender: type === 'outgoing' ? 'Nơi nhận' : 'Nơi gửi',
    date: 'Ngày', category: 'Loại', priority: 'Độ khẩn', status: 'Trạng thái',
  };
  const { sortKey, sortDir, announcement: sortAnnouncement, handleSort, handleSortKeyDown, getAriaSort, resetSort, isSorted } = useSortState<SortKey>({
    storageKey: `doclist_${type}`,
    labels: sortLabels,
  });

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="inline-flex ml-1 align-middle">
      {sortKey === col
        ? (sortDir === 'ascending' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
        : <ArrowUpDown className="w-3 h-3 opacity-0 group-hover/th:opacity-40 transition-opacity" />
      }
    </span>
  );

  const debouncedSearch = useDebounce(searchQuery, 250);

  const showToast = (type: 'success' | 'error', message: string) => {
    if (type === 'success') sonnerToast.success(message);
    else sonnerToast.error(message);
  };

  // Get status options
  const statusOptions = useMemo(() => {
    if (type === 'incoming') return [
      { value: 'all', label: 'Tất cả' }, { value: 'received', label: 'Đã tiếp nhận' },
      { value: 'assigned', label: 'Đã phân công' }, { value: 'processing', label: 'Đang xử lý' },
      { value: 'completed', label: 'Hoàn thành' }, { value: 'overdue', label: 'Quá hạn' },
    ];
    if (type === 'outgoing') return [
      { value: 'all', label: 'Tất cả' }, { value: 'draft', label: 'Nháp' },
      { value: 'dept_review', label: 'TP xem xét' }, { value: 'leader_review', label: 'LĐ xem xét' },
      { value: 'approved', label: 'Đã duyệt' }, { value: 'published', label: 'Đã phát hành' },
      { value: 'rejected', label: 'Từ chối' },
    ];
    return [
      { value: 'all', label: 'Tất cả' }, { value: 'draft', label: 'Nháp' },
      { value: 'review', label: 'Chờ duyệt' }, { value: 'approved', label: 'Đã duyệt' },
      { value: 'distributed', label: 'Đã phân phối' },
    ];
  }, [type]);

  // Filter
  const filtered = useMemo(() => {
    return docs.filter((doc) => {
      const matchSearch = doc.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        doc.number.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        doc.sender.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        doc.receiver.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchStatus = statusFilter === 'all' || doc.status === statusFilter;
      const matchPriority = priorityFilter === 'all' || doc.priority === priorityFilter;
      const matchCategory = categoryFilter === 'all' || doc.category === categoryFilter;
      const matchField = fieldFilter === 'all' || doc.field === fieldFilter;
      const matchDateFrom = !dateFrom || doc.date >= dateFrom;
      const matchDateTo = !dateTo || doc.date <= dateTo;
      return matchSearch && matchStatus && matchPriority && matchCategory && matchField && matchDateFrom && matchDateTo;
    });
  }, [docs, debouncedSearch, statusFilter, priorityFilter, categoryFilter, fieldFilter, dateFrom, dateTo]);

  // Apply sorting
  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const priorityOrder = ['urgent_top', 'urgent', 'high', 'medium', 'low'];
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'number': cmp = a.number.localeCompare(b.number, 'vi'); break;
        case 'title': cmp = a.title.localeCompare(b.title, 'vi'); break;
        case 'sender': cmp = (type === 'outgoing' ? a.receiver : a.sender).localeCompare(type === 'outgoing' ? b.receiver : b.sender, 'vi'); break;
        case 'date': cmp = a.date.localeCompare(b.date); break;
        case 'category': cmp = a.category.localeCompare(b.category, 'vi'); break;
        case 'priority': cmp = priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority); break;
        case 'status': cmp = a.status.localeCompare(b.status, 'vi'); break;
      }
      return sortDir === 'ascending' ? cmp : -cmp;
    });
  }, [filtered, sortKey, sortDir, type]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Categories from data
  const categories = useMemo(() => {
    const cats = [...new Set(docs.map((d) => d.category))];
    return cats;
  }, [docs]);

  // Fields from data
  const fields = useMemo(() => [...new Set(docs.map((d) => d.field))], [docs]);

  // Bulk selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const toggleSelectAll = () => {
    if (selectedIds.size === paginated.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginated.map((d) => d.id)));
    }
  };
  const clearSelection = () => setSelectedIds(new Set());
  const handleBulkDelete = () => {
    const deletable = [...selectedIds].filter((id) => {
      const d = docs.find((doc) => doc.id === id);
      return d && !d.isLocked && !['published', 'distributed'].includes(d.status);
    });
    if (deletable.length === 0) {
      showToast('error', 'Không có VB nào có thể xóa (đã phát hành/khóa)');
      return;
    }
    setDocs((prev) => prev.filter((d) => !deletable.includes(d.id)));
    setSelectedIds(new Set());
    showToast('success', `Đã xóa ${deletable.length} văn bản`);
  };
  const handleBulkExport = () => {
    showToast('success', `Đã xuất ${selectedIds.size} văn bản ra Excel`);
    clearSelection();
  };

  // Stats
  const stats = useMemo(() => {
    const total = docs.length;
    const processing = docs.filter((d) => ['processing', 'assigned', 'dept_review', 'leader_review', 'review'].includes(d.status)).length;
    const completed = docs.filter((d) => ['completed', 'published', 'distributed'].includes(d.status)).length;
    const overdue = docs.filter((d) => d.status === 'overdue' || (d.deadline && new Date(d.deadline) < new Date() && !['completed', 'published', 'distributed'].includes(d.status))).length;
    return { total, processing, completed, overdue };
  }, [docs]);

  // Permissions
  const canCreate = type === 'incoming' ? hasPermission('doc.incoming.create') : type === 'outgoing' ? hasPermission('doc.outgoing.create') : hasPermission('doc.internal.create');
  const canDelete = type === 'incoming' ? hasPermission('doc.incoming.delete') : type === 'outgoing' ? hasPermission('doc.outgoing.delete') : hasPermission('doc.internal.delete');

  // Handle doc creation
  const handleCreateDoc = (newDoc: EnhancedDocument) => {
    setDocs([newDoc, ...docs]);
    setShowCreate(false);
    showToast('success', 'Tạo văn bản thành công!');
  };

  // Handle delete
  const handleDelete = (docId: string) => {
    const doc = docs.find((d) => d.id === docId);
    if (!doc) return;

    if (doc.isLocked) {
      showToast('error', 'Không thể xóa văn bản đã phát hành!');
      setDeleteConfirm(null);
      return;
    }

    if (['published', 'distributed'].includes(doc.status)) {
      showToast('error', 'Không thể xóa văn bản ã phát hành/phn phối!');
      setDeleteConfirm(null);
      return;
    }

    setDocs(docs.filter((d) => d.id !== docId));
    setDeleteConfirm(null);
    showToast('success', 'Đã xóa văn bản!');
  };

  // Handle workflow actions from detail view
  const handleDocAction = (docId: string, action: string, data?: Record<string, string>) => {
    setDocs((prev) =>
      prev.map((doc) => {
        if (doc.id !== docId) return doc;

        const updatedDoc = { ...doc };
        const now = new Date().toISOString();
        const userName = user?.fullName || '';
        const userRole = user?.position || '';

        switch (action) {
          case 'comment':
            updatedDoc.comments = [
              ...doc.comments,
              { id: `cmt-${Date.now()}`, userId: user?.id || '', userName, userAvatar: user?.avatar || '', content: data?.comment || '', timestamp: now },
            ];
            break;

          case 'assign':
            updatedDoc.status = 'assigned' as IncomingStatus;
            updatedDoc.assignedToNames = data?.assignees?.split(',').map((s) => s.trim()) || [];
            updatedDoc.workflow = doc.workflow.map((wf) =>
              wf.status === 'current' ? { ...wf, status: 'completed' as const, timestamp: now, comment: data?.comment || `Giao cho: ${data?.assignees}` } : wf
            );
            updatedDoc.workflow.push({
              id: `wf-${Date.now()}`, action: 'Xử lý văn bản',
              actorId: '', actorName: data?.assignees?.split(',')[0]?.trim() || '', actorRole: '',
              timestamp: '', comment: '', status: 'current',
            });
            break;

          case 'process':
            updatedDoc.status = 'completed' as IncomingStatus;
            updatedDoc.workflow = doc.workflow.map((wf) =>
              wf.status === 'current' ? { ...wf, status: 'completed' as const, timestamp: now, comment: data?.comment || 'Hoàn thành xử lý' } : wf
            );
            break;

          case 'return':
            updatedDoc.status = 'returned' as IncomingStatus;
            updatedDoc.workflow = doc.workflow.map((wf) =>
              wf.status === 'current' ? { ...wf, status: 'rejected' as const, timestamp: now, comment: data?.comment || 'Trả lại' } : wf
            );
            break;

          case 'submit_review':
            if (type === 'outgoing') {
              updatedDoc.status = 'dept_review' as OutgoingStatus;
            } else {
              updatedDoc.status = 'review' as InternalStatus;
            }
            updatedDoc.workflow = doc.workflow.map((wf) =>
              wf.status === 'current' ? { ...wf, status: 'completed' as const, timestamp: now, comment: data?.comment || 'Trình duyệt' } : wf
            );
            updatedDoc.workflow.push({
              id: `wf-${Date.now()}`, action: type === 'outgoing' ? 'Trưởng phòng xem xét' : 'Lãnh đạo duyệt',
              actorId: '', actorName: '', actorRole: type === 'outgoing' ? 'Trưởng phòng' : 'Lãnh đạo',
              timestamp: '', comment: '', status: 'current',
            });
            break;

          case 'dept_approve':
            updatedDoc.status = 'leader_review' as OutgoingStatus;
            updatedDoc.workflow = doc.workflow.map((wf) =>
              wf.status === 'current' ? { ...wf, status: 'completed' as const, timestamp: now, comment: data?.comment || 'Đồng ý, trình Lãnh đạo', actorName: userName, actorRole: userRole } : wf
            );
            updatedDoc.workflow.push({
              id: `wf-${Date.now()}`, action: 'Lãnh đạo phê duyệt',
              actorId: '', actorName: '', actorRole: 'Lãnh đạo',
              timestamp: '', comment: '', status: 'current',
            });
            break;

          case 'leader_approve':
            updatedDoc.status = 'approved' as OutgoingStatus;
            updatedDoc.workflow = doc.workflow.map((wf) =>
              wf.status === 'current' ? { ...wf, status: 'completed' as const, timestamp: now, comment: data?.comment || 'Phê duyệt', actorName: userName, actorRole: userRole } : wf
            );
            updatedDoc.workflow.push({
              id: `wf-${Date.now()}`, action: 'Phát hành',
              actorId: '', actorName: '', actorRole: 'Văn thư',
              timestamp: '', comment: '', status: 'current',
            });
            break;

          case 'approve':
            updatedDoc.status = 'approved' as InternalStatus;
            updatedDoc.workflow = doc.workflow.map((wf) =>
              wf.status === 'current' ? { ...wf, status: 'completed' as const, timestamp: now, comment: data?.comment || 'Phê duyt', actorName: userName, actorRole: userRole } : wf
            );
            updatedDoc.workflow.push({
              id: `wf-${Date.now()}`, action: 'Phân phối',
              actorId: '', actorName: '', actorRole: 'Văn thư',
              timestamp: '', comment: '', status: 'current',
            });
            break;

          case 'publish': {
            const nextNum = Math.max(345, ...docs.filter((d) => d.bookNumber).map((d) => d.bookNumber!)) + 1;
            updatedDoc.status = 'published' as OutgoingStatus;
            updatedDoc.number = `${nextNum}/${doc.category === 'Công văn' ? 'CV' : doc.category === 'Báo cáo' ? 'BC' : doc.category === 'Kế hoạch' ? 'KH' : doc.category === 'Quyết định' ? 'QD' : 'VB'}-UBND`;
            updatedDoc.bookNumber = nextNum;
            updatedDoc.isLocked = true;
            updatedDoc.workflow = doc.workflow.map((wf) =>
              wf.status === 'current' ? { ...wf, status: 'completed' as const, timestamp: now, comment: data?.comment || `Cấp số ${updatedDoc.number}, phát hành`, actorName: userName, actorRole: userRole } : wf
            );
            break;
          }

          case 'distribute':
            updatedDoc.status = 'distributed' as InternalStatus;
            updatedDoc.number = updatedDoc.number || `NB-${String(docs.filter((d) => d.number.startsWith('NB-')).length + 1).padStart(2, '0')}/${new Date().getFullYear()}`;
            updatedDoc.isLocked = true;
            updatedDoc.workflow = doc.workflow.map((wf) =>
              wf.status === 'current' ? { ...wf, status: 'completed' as const, timestamp: now, comment: data?.comment || 'Đã phân phối', actorName: userName, actorRole: userRole } : wf
            );
            break;

          case 'reject':
            updatedDoc.status = (type === 'outgoing' ? 'rejected' : type === 'internal' ? 'rejected' : 'returned') as any;
            updatedDoc.workflow = doc.workflow.map((wf) =>
              wf.status === 'current' ? { ...wf, status: 'rejected' as const, timestamp: now, comment: data?.comment || 'Từ chối', actorName: userName, actorRole: userRole } : wf
            );
            break;
        }

        updatedDoc.updatedAt = now;
        return updatedDoc;
      })
    );

    // Refresh selected doc
    setTimeout(() => {
      setDocs((prev) => {
        const updated = prev.find((d) => d.id === docId);
        if (updated) setSelectedDoc({ ...updated });
        return prev;
      });
    }, 50);

    if (action !== 'comment') {
      const messages: Record<string, string> = {
        assign: 'Đã phân công xử lý',
        process: 'Đã báo cáo hoàn thành',
        return: 'Đã trả lại văn bản',
        submit_review: 'Đã trình duyệt',
        dept_approve: 'Đã đồng ý, trình Lãnh đạo',
        leader_approve: 'Đã phê duyệt',
        approve: 'Đã phê duyệt',
        publish: 'Đã phát hành văn bản!',
        distribute: 'Đã phân phối văn bản!',
        reject: 'Đã từ chối văn bản',
      };
      showToast('success', messages[action] || 'Thao tác thành công');
    }
  };

  const isOverdue = (doc: EnhancedDocument) => {
    return doc.deadline && new Date(doc.deadline) < new Date() && !['completed', 'published', 'distributed'].includes(doc.status);
  };

  return (
    <PageTransition>
      <Header title={title} />
      {isLoading ? (
        <div aria-busy="true" aria-label="Đang tải danh sách văn bản">
          <DocumentListSkeleton />
        </div>
      ) : (
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Tổng số" value={stats.total} icon="total" />
          <StatCard label="Đang xử lý" value={stats.processing} icon="processing" />
          <StatCard label={type === 'outgoing' ? 'Đã phát hành' : 'Hoàn thành'} value={stats.completed} icon="completed" />
          <StatCard label="Quá hạn" value={stats.overdue} icon="overdue" />
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-xs)' }}>
          {/* Toolbar */}
          <div className="p-4 border-b border-border">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <input type="text" placeholder="Tìm kiếm theo số hiệu, trích yếu, nơi gửi..."
                  value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  aria-label="Tìm kiếm văn bản"
                  className="w-full pl-9 pr-4 py-2.5 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/40" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  aria-label="Lọc theo trạng thái"
                  className="px-3 py-2 bg-surface-2 rounded-lg text-[13px] border border-transparent focus:border-primary/20 outline-none cursor-pointer text-foreground">
                  {statusOptions.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
                <select value={priorityFilter} onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
                  aria-label="Lọc theo độ khẩn"
                  className="px-3 py-2 bg-surface-2 rounded-lg text-[13px] border border-transparent focus:border-primary/20 outline-none cursor-pointer text-foreground">
                  <option value="all">Tất cả mức độ</option>
                  <option value="urgent_top">Hỏa tốc</option>
                  <option value="urgent">Khẩn</option>
                  <option value="high">Cao</option>
                  <option value="medium">Trung bình</option>
                  <option value="low">Thấp</option>
                </select>
                <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                  aria-label="Lọc theo loại văn bản"
                  className="px-3 py-2 bg-surface-2 rounded-lg text-[13px] border border-transparent focus:border-primary/20 outline-none cursor-pointer text-foreground">
                  <option value="all">Tất cả loại</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={fieldFilter} onChange={(e) => { setFieldFilter(e.target.value); setCurrentPage(1); }}
                  aria-label="Lọc theo lĩnh vực"
                  className="px-3 py-2 bg-surface-2 rounded-lg text-[13px] border border-transparent focus:border-primary/20 outline-none cursor-pointer text-foreground">
                  <option value="all">Tất cả lĩnh vực</option>
                  {fields.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
                <button onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
                  aria-expanded={showAdvancedFilter}
                  aria-controls="advanced-filter-panel"
                  className="flex items-center gap-1.5 px-3 py-2 bg-surface-2 rounded-lg text-[13px] text-muted-foreground hover:bg-accent transition-colors">
                  {showAdvancedFilter ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />} Lọc nâng cao
                </button>
              </div>
              <div className="flex items-center gap-2 lg:ml-auto shrink-0">
                <ColumnToggle
                  isOpen={colVis.isOpen}
                  setIsOpen={colVis.setIsOpen}
                  columns={colVis.columns}
                  isVisible={colVis.isVisible}
                  toggle={colVis.toggle}
                  resetAll={colVis.resetAll}
                  showOnlyRequired={colVis.showOnlyRequired}
                  hideAllOptional={colVis.hideAllOptional}
                  allOptionalVisible={colVis.allOptionalVisible}
                  allOptionalHidden={colVis.allOptionalHidden}
                  handleMenuKeyDown={colVis.handleMenuKeyDown}
                  visibleCount={colVis.visibleCount}
                  totalCount={colVis.totalCount}
                  hasHidden={colVis.hasHidden}
                  announcement={colVis.announcement}
                />
                <button onClick={() => showToast('success', 'Đã xuất file Excel thành công!')} className="flex items-center gap-1.5 px-3 py-2 bg-surface-2 rounded-lg text-[13px] text-muted-foreground hover:bg-accent transition-colors">
                  <Download className="w-4 h-4" /> Xuất Excel
                </button>
                {canCreate && (
                  <button onClick={() => setShowCreate(true)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-[13px] hover:opacity-90 transition-all active:scale-[0.98]"
                    style={{ boxShadow: 'var(--shadow-sm)' }}>
                    <Plus className="w-4 h-4" />
                    {type === 'incoming' ? 'Tiếp nhận VB' : 'Tạo mới'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Advanced Filter Row */}
          {showAdvancedFilter && (
            <div id="advanced-filter-panel" className="px-4 py-3 border-b border-border bg-surface-2/50">
              <div className="flex items-center gap-3 flex-wrap">
                <Calendar className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                <span className="text-[12px] text-muted-foreground">Từ ngày:</span>
                <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setCurrentPage(1); }}
                  aria-label="Lọc từ ngày"
                  className="px-3 py-1.5 bg-card rounded-lg text-[12px] border border-border focus:border-primary/30 outline-none text-foreground" />
                <span className="text-[12px] text-muted-foreground">đến:</span>
                <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setCurrentPage(1); }}
                  aria-label="Lọc đến ngày"
                  className="px-3 py-1.5 bg-card rounded-lg text-[12px] border border-border focus:border-primary/30 outline-none text-foreground" />
                {(dateFrom || dateTo) && (
                  <button onClick={() => { setDateFrom(''); setDateTo(''); setCurrentPage(1); }}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <X className="w-3 h-3" /> Xóa lọc ngày
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Bulk Action Bar */}
          {selectedIds.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="px-4 py-2.5 border-b border-primary/20 bg-primary/5 flex items-center gap-3">
              <span className="text-[12px] text-primary">Đã chọn {selectedIds.size} văn bản</span>
              <button onClick={handleBulkExport}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[11px] hover:opacity-90">
                <Download className="w-3.5 h-3.5" /> Xuất Excel
              </button>
              {canDelete && (
                <button onClick={handleBulkDelete}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-[11px] hover:opacity-90">
                  <Trash2 className="w-3.5 h-3.5" /> Xóa
                </button>
              )}
              <button onClick={clearSelection}
                className="flex items-center gap-1 px-3 py-1.5 text-[11px] text-muted-foreground hover:bg-accent rounded-lg ml-auto">
                <X className="w-3.5 h-3.5" /> Bỏ chọn
              </button>
            </motion.div>
          )}

          {/* Table */}
          <div className="overflow-auto max-h-[65vh]">
            <table ref={docTableRef} className="w-full" style={{ tableLayout: 'fixed' }} aria-rowcount={sorted.length + 1}>
              <caption className="sr-only">Danh sách văn bản {type === 'incoming' ? 'đến' : type === 'outgoing' ? 'đi' : 'nội bộ'}</caption>
              <thead className="sticky-header">
                <tr className="bg-accent/30">
                  <th scope="col" role="columnheader" aria-colindex={1} className="w-10 px-3 py-3" onClick={(e) => { e.stopPropagation(); toggleSelectAll(); }}>
                    <div className="cursor-pointer" role="checkbox" aria-checked={selectedIds.size === paginated.length && paginated.length > 0} aria-label="Chọn tất cả văn bản">
                      {selectedIds.size === paginated.length && paginated.length > 0
                        ? <CheckSquare className="w-4 h-4 text-primary" />
                        : <Square className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </th>
                  {orderedVisibleCols.map((colKey, idx) => {
                    const colIdx = idx + 2;
                    const sortableClass = "relative text-left px-4 py-3 text-[11px] text-muted-foreground tracking-wide whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors group/th";
                    const headerLabels: Record<ColKey, string> = {
                      number: 'SỐ HIỆU', title: 'TRÍCH YẾU',
                      sender: type === 'outgoing' ? 'NƠI NHẬN' : 'NƠI GỬI',
                      date: 'NGÀY', category: 'LOẠI', priority: 'ĐỘ KHẨN',
                      status: 'TRẠNG THÁI', actions: 'THAO TÁC',
                    };
                    if (colKey === 'actions') {
                      return (
                        <th key={colKey} scope="col" role="columnheader" aria-colindex={colIdx} className="text-center px-4 py-3 text-[11px] text-muted-foreground tracking-wide whitespace-nowrap" style={colResize.getHeaderProps('actions').style}>THAO TÁC</th>
                      );
                    }
                    const sortCol = colKey as SortKey;
                    return (
                      <DraggableHeader
                        key={colKey}
                        colKey={colKey}
                        index={colOrder.getColumnIndex(colKey)}
                        onMove={colOrder.moveColumn}
                        onKeyboardMove={(k, d) => colOrder.moveColumnByKey(k as ColKey, d)}
                        scope="col"
                        role="columnheader"
                        aria-colindex={colIdx}
                        aria-sort={getAriaSort(sortCol)}
                        tabIndex={0}
                        title="Nhấn Enter để sắp xếp, Alt+← → để di chuyển cột"
                        aria-describedby="doc-sort-hint"
                        className={sortableClass}
                        style={colResize.getHeaderProps(colKey).style}
                        onClick={() => handleSort(sortCol)}
                        onKeyDown={(e) => handleSortKeyDown(e, sortCol)}
                      >
                        {headerLabels[colKey]} <SortIcon col={sortCol} />
                        <ResizeHandle onResizeStart={(e) => colResize.onResizeStart(colKey, e)} onDoubleClick={() => colResize.autoFit(colKey, docTableRef.current)} onKeyboardResize={(d) => colResize.keyboardResize(colKey, d)} />
                      </DraggableHeader>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {paginated.map((doc, idx) => {
                  const statusCfg = getStatusConfig(doc);
                  const priCfg = priorityLabels[doc.priority];
                  const docOverdue = isOverdue(doc);
                  return (
                    <tr key={doc.id}
                      aria-rowindex={(currentPage - 1) * itemsPerPage + idx + 2}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === ' ') { e.preventDefault(); toggleSelect(doc.id); }
                        if (e.key === 'Enter') { setSelectedDoc(doc); }
                      }}
                      className={`border-b border-border/50 hover:bg-accent/30 transition-colors group cursor-pointer ${
                        docOverdue ? 'bg-red-50/50 dark:bg-red-900/10' : ''
                      }`}
                      onClick={() => setSelectedDoc(doc)}
                    >
                      <td aria-colindex={1} className="w-10 px-3 py-3" onClick={(e) => { e.stopPropagation(); toggleSelect(doc.id); }}>
                        <div className="cursor-pointer" role="checkbox" aria-checked={selectedIds.has(doc.id)} aria-label={`Chọn văn bản ${doc.number || doc.title}`}>
                          {selectedIds.has(doc.id)
                            ? <CheckSquare className="w-4 h-4 text-primary" />
                            : <Square className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors" />}
                        </div>
                      </td>
                      {orderedVisibleCols.map((colKey) => {
                        switch (colKey) {
                          case 'number': return (
                            <td key="number" className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                {doc.number ? (
                                  <span className="text-[12px] text-primary whitespace-nowrap flex items-center gap-1"><Hash className="w-3 h-3" />{doc.number}</span>
                                ) : (
                                  <span className="text-[12px] text-muted-foreground italic">Chưa cấp số</span>
                                )}
                                {doc.isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                              </div>
                            </td>
                          );
                          case 'title': return (
                            <td key="title" className="px-4 py-3 max-w-xs">
                              <p className="text-[13px] text-foreground truncate">{doc.title}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {doc.attachments.length > 0 && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Paperclip className="w-3 h-3" /> {doc.attachments.length}</span>}
                                {doc.comments.length > 0 && <span className="text-[10px] text-muted-foreground">{doc.comments.length} ý kiến</span>}
                                {docOverdue && <span className="text-[10px] text-red-600 flex items-center gap-0.5"><Clock className="w-3 h-3" /> Quá hạn</span>}
                              </div>
                            </td>
                          );
                          case 'sender': return (
                            <td key="sender" className="px-4 py-3 text-[13px] text-muted-foreground whitespace-nowrap">
                              {type === 'outgoing' ? doc.receiver : doc.sender}
                            </td>
                          );
                          case 'date': return (
                            <td key="date" className="px-4 py-3 text-[12px] text-muted-foreground whitespace-nowrap">
                              {new Date(doc.date).toLocaleDateString('vi-VN')}
                            </td>
                          );
                          case 'category': return (
                            <td key="category" className="px-4 py-3">
                              <span className="text-[11px] px-2 py-0.5 rounded bg-secondary text-secondary-foreground whitespace-nowrap">{doc.category}</span>
                            </td>
                          );
                          case 'priority': return (
                            <td key="priority" className="px-4 py-3">
                              <span className={`text-[11px] px-2 py-0.5 rounded ${priCfg.bg} ${priCfg.color} whitespace-nowrap`}>{priCfg.label}</span>
                            </td>
                          );
                          case 'status': return (
                            <td key="status" className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${statusCfg?.bg} ${statusCfg?.color} whitespace-nowrap`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg?.dot}`} />
                                {statusCfg?.label}
                              </span>
                            </td>
                          );
                          case 'actions': return (
                            <td key="actions" className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-all">
                                <button onClick={() => setSelectedDoc(doc)} className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Xem chi tiết" aria-label={`Xem chi tiết văn bản ${doc.number}`}>
                                  <Eye className="w-4 h-4 text-muted-foreground" />
                                </button>
                                {canDelete && !doc.isLocked && (
                                  <button onClick={() => setDeleteConfirm(doc.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Xóa" aria-label={`Xóa văn bản ${doc.number}`}>
                                    <Trash2 className="w-4 h-4 text-red-400" />
                                  </button>
                                )}
                              </div>
                            </td>
                          );
                          default: return null;
                        }
                      })}
                    </tr>
                  );
                })}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={orderedVisibleCols.length + 1} className="px-5 py-4 text-center">
                      <EmptyState
                        icon={FileText}
                        title="Không tìm thấy văn bản nào"
                        description={searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                          ? "Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
                          : "Chưa có văn bản nào trong danh sách này"}
                        compact
                      />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filtered.length > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface-2/30">
              <div className="flex items-center gap-3">
                <p className="text-[13px] text-muted-foreground" aria-live="polite" role="status">
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} / {filtered.length}
                </p>
                {isSorted && (
                  <button onClick={() => { resetSort(); setCurrentPage(1); }}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                    aria-label="Xóa sắp xếp">
                    <X className="w-3 h-3" /> Xóa sắp xếp
                  </button>
                )}
                <ResetWidthsButton isResized={colResize.isResized} onReset={colResize.resetWidths} />
                {colOrder.isReordered && (
                  <button onClick={colOrder.resetOrder}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                    aria-label="Đặt lại thứ tự cột">
                    <ArrowUpDown className="w-3 h-3" /> Đặt lại thứ tự
                  </button>
                )}
              </div>
              <nav className="flex items-center gap-1" aria-label="Phân trang">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                  aria-label="Trang trước"
                  className="p-2 rounded-lg hover:bg-accent disabled:opacity-40 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    aria-current={page === currentPage ? 'page' : undefined}
                    aria-label={`Trang ${page}`}
                    className={`w-8 h-8 rounded-lg text-[13px] transition-colors ${page === currentPage ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'}`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  aria-label="Trang sau"
                  className="p-2 rounded-lg hover:bg-accent disabled:opacity-40 transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </nav>
            </div>
          )}
        </div>
      </div>
      )}
      {/* Detail Modal */}
      {selectedDoc && (
        <DocumentDetail
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onAction={handleDocAction}
        />
      )}

      {/* Create Modal */}
      {showCreate && (
        <DocumentCreate
          type={type}
          onClose={() => setShowCreate(false)}
          onSave={handleCreateDoc}
        />
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Xóa văn bản?"
        message="Hành động này không thể hoàn tác. Văn bản và toàn bộ dữ liệu liên quan sẽ bị xóa vĩnh viễn."
        confirmLabel="Xóa văn bản"
        variant="danger"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        onCancel={() => setDeleteConfirm(null)}
      />

      {/* Sort announcement live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {sortAnnouncement}
      </div>

      {/* Column order announcement live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {colOrder.announcement}
      </div>

      {/* Sort hint for aria-describedby */}
      <span id="doc-sort-hint" className="sr-only">Nhấn Enter hoặc Space để sắp xếp cột, Escape để xóa sắp xếp</span>
    </PageTransition>
  );
}

const StatCard = memo(function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  const reducedMotion = useReducedMotion();
  const configs: Record<string, { bg: string; iconBg: string; color: string; darkColor: string }> = {
    total: { bg: 'bg-blue-50 dark:bg-blue-900/20', iconBg: 'bg-blue-100 dark:bg-blue-900/40', color: 'text-blue-700', darkColor: 'dark:text-blue-400' },
    processing: { bg: 'bg-amber-50 dark:bg-amber-900/20', iconBg: 'bg-amber-100 dark:bg-amber-900/40', color: 'text-amber-700', darkColor: 'dark:text-amber-400' },
    completed: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', iconBg: 'bg-emerald-100 dark:bg-emerald-900/40', color: 'text-emerald-700', darkColor: 'dark:text-emerald-400' },
    overdue: { bg: 'bg-red-50 dark:bg-red-900/20', iconBg: 'bg-red-100 dark:bg-red-900/40', color: 'text-red-700', darkColor: 'dark:text-red-400' },
  };
  const cfg = configs[icon] || configs.total;
  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={reducedMotion ? { duration: 0 } : { duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className={`${cfg.bg} rounded-xl p-4 flex items-center gap-3 border border-border/50`}
    >
      <div className={`w-10 h-10 rounded-lg ${cfg.iconBg} flex items-center justify-center shrink-0`}>
        <BarChart3 className={`w-5 h-5 ${cfg.color} ${cfg.darkColor}`} />
      </div>
      <div>
        <div className={`text-[22px] tabular-nums ${cfg.color} ${cfg.darkColor}`} style={{ fontFamily: "var(--font-display)" }}>{value}</div>
        <div className="text-[12px] text-muted-foreground">{label}</div>
      </div>
    </motion.div>
  );
});