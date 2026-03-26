import { useState, useMemo, useCallback, useRef } from 'react';
import { useColumnResize } from '../hooks/useColumnResize';
import { useColumnOrder } from '../hooks/useColumnOrder';
import { useRovingTabindex } from '../hooks/useRovingTabindex';
import { useSortState } from '../hooks/useSortState';
import { useColumnVisibility, type ColumnDef } from '../hooks/useColumnVisibility';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { ColumnToggle } from '../components/ColumnToggle';
import { ResizeHandle } from '../components/ResizeHandle';
import { ResetWidthsButton } from '../components/ResetWidthsButton';
import { DraggableHeader } from '../components/DraggableHeader';
import { incomingDocs, outgoingDocs, internalDocs, getStatusConfig, priorityLabels, type EnhancedDocument } from '../data/documentData';
import {
  Search, Download, ChevronLeft, ChevronRight, BookOpen, Hash,
  FileInput, FileOutput, FileText, Filter, Calendar, Lock,
  Archive, Eye, Printer, BarChart3, ChevronUp, ChevronDown, ArrowUpDown,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '../components/EmptyState';
import { useDebounce } from '../hooks/useDebounce';

type BookTab = 'incoming' | 'outgoing' | 'archive';

export function DocumentBookPage() {
  const [activeTab, setActiveTab] = useState<BookTab>('incoming');

  const bookTabKeys = useMemo(() => ['incoming', 'outgoing', 'archive'] as const, []);
  const { getTabIndex: getBookTabIndex, handleTablistKeyDown: handleBookTablistKeyDown } = useRovingTabindex(
    bookTabKeys as unknown as string[],
    activeTab,
    (key) => setActiveTab(key as BookTab),
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('2026');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Column visibility
  type BookColKey = 'stt' | 'number' | 'title' | 'sender' | 'date' | 'category' | 'priority' | 'status';
  const bookColDefs = useMemo<ColumnDef<BookColKey>[]>(() => [
    { key: 'stt', label: 'STT' },
    { key: 'number', label: 'Số hiệu' },
    { key: 'title', label: 'Trích yếu', required: true },
    { key: 'sender', label: 'Nơi gửi/nhận' },
    { key: 'date', label: 'Ngày' },
    { key: 'category', label: 'Loại' },
    { key: 'priority', label: 'Độ khẩn' },
    { key: 'status', label: 'Trạng thái', required: true },
  ], []);
  const bookColVis = useColumnVisibility<BookColKey>({ storageKey: 'docbook', columns: bookColDefs });
  const isBookColVisible = bookColVis.isVisible;

  const bookResizeCols = useMemo(() => ['stt', 'number', 'title', 'sender', 'date', 'category', 'priority', 'status'] as BookColKey[], []);
  const bookColResize = useColumnResize<BookColKey>({
    storageKey: 'docbook',
    columns: bookResizeCols,
    config: {
      stt: { defaultWidth: 60, minWidth: 40, maxWidth: 100 },
      number: { defaultWidth: 130, minWidth: 80, maxWidth: 200 },
      title: { defaultWidth: 260, minWidth: 150, maxWidth: 450 },
      sender: { defaultWidth: 160, minWidth: 100, maxWidth: 280 },
      date: { defaultWidth: 110, minWidth: 80, maxWidth: 170 },
      category: { defaultWidth: 110, minWidth: 70, maxWidth: 180 },
      priority: { defaultWidth: 100, minWidth: 70, maxWidth: 160 },
      status: { defaultWidth: 130, minWidth: 90, maxWidth: 200 },
    },
    defaultMinWidth: 50,
  });
  const bookTableRef = useRef<HTMLTableElement>(null);

  // Column order (drag-and-drop reorder)
  const defaultBookColOrder = useMemo<BookColKey[]>(() => ['stt', 'number', 'title', 'sender', 'date', 'category', 'priority', 'status'], []);
  const bookColLabels = useMemo<Record<BookColKey, string>>(() => ({
    stt: 'STT', number: 'Số hiệu', title: 'Trích yếu', sender: 'Nơi gửi/nhận',
    date: 'Ngày', category: 'Loại', priority: 'Độ khẩn', status: 'Trạng thái',
  }), []);
  const bookColOrder = useColumnOrder<BookColKey>({ storageKey: 'docbook', defaultOrder: defaultBookColOrder, labels: bookColLabels });

  // Sort state for book table
  type BookSortKey = 'number' | 'title' | 'sender' | 'date' | 'category' | 'priority' | 'status';
  const bookSortLabels: Record<BookSortKey, string> = {
    number: 'Số hiệu', title: 'Trích yếu', sender: 'Nơi gửi/nhận',
    date: 'Ngày', category: 'Loại', priority: 'Độ khẩn', status: 'Trạng thái',
  };
  const { sortKey: bookSortKey, sortDir: bookSortDir, announcement: bookSortAnnouncement, handleSort: handleBookSort, handleSortKeyDown: handleBookSortKeyDown, getAriaSort: getBookAriaSort, resetSort: resetBookSort, isSorted: isBookSorted } = useSortState<BookSortKey>({
    storageKey: 'docbook',
    labels: bookSortLabels,
  });

  const BookSortIcon = ({ col }: { col: BookSortKey }) => (
    <span className="inline-flex ml-1 align-middle">
      {bookSortKey === col
        ? (bookSortDir === 'ascending' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
        : <ArrowUpDown className="w-3 h-3 opacity-0 group-hover/th:opacity-40 transition-opacity" />
      }
    </span>
  );

  // All docs have bookNumber => they're registered in the book
  const incomingBookDocs = useMemo(() =>
    incomingDocs.filter((d) => d.bookNumber).sort((a, b) => (a.bookNumber || 0) - (b.bookNumber || 0)),
    []
  );
  const outgoingBookDocs = useMemo(() =>
    outgoingDocs.filter((d) => d.bookNumber).sort((a, b) => (a.bookNumber || 0) - (b.bookNumber || 0)),
    []
  );
  // Archive: all completed/published/distributed docs
  const archivedDocs = useMemo(() => {
    const all = [...incomingDocs, ...outgoingDocs, ...internalDocs];
    return all.filter((d) => ['completed', 'published', 'distributed'].includes(d.status) && d.isLocked)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, []);

  const currentDocs = activeTab === 'incoming' ? incomingBookDocs :
    activeTab === 'outgoing' ? outgoingBookDocs : archivedDocs;

  const categories = useMemo(() => [...new Set(currentDocs.map((d) => d.category))], [currentDocs]);

  const debouncedSearch = useDebounce(searchQuery, 250);

  const filtered = useMemo(() => {
    return currentDocs.filter((doc) => {
      const matchSearch = doc.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        doc.number.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        doc.sender.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        doc.receiver.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchYear = yearFilter === 'all' || doc.year.toString() === yearFilter;
      const matchCategory = categoryFilter === 'all' || doc.category === categoryFilter;
      return matchSearch && matchYear && matchCategory;
    });
  }, [currentDocs, debouncedSearch, yearFilter, categoryFilter]);

  // Sorted filtered docs
  const sortedFiltered = useMemo(() => {
    if (!bookSortKey) return filtered;
    const priorityOrder = ['urgent', 'high', 'normal', 'low'];
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      switch (bookSortKey) {
        case 'number': cmp = a.number.localeCompare(b.number, 'vi'); break;
        case 'title': cmp = a.title.localeCompare(b.title, 'vi'); break;
        case 'sender': cmp = (activeTab === 'outgoing' ? a.receiver : a.sender).localeCompare(activeTab === 'outgoing' ? b.receiver : b.sender, 'vi'); break;
        case 'date': cmp = a.date.localeCompare(b.date); break;
        case 'category': cmp = a.category.localeCompare(b.category, 'vi'); break;
        case 'priority': cmp = priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority); break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
      }
      return bookSortDir === 'ascending' ? cmp : -cmp;
    });
  }, [filtered, bookSortKey, bookSortDir, activeTab]);

  const totalPages = Math.ceil(sortedFiltered.length / itemsPerPage);
  const paginated = sortedFiltered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = useMemo(() => ({
    totalIncoming: incomingBookDocs.length,
    totalOutgoing: outgoingBookDocs.length,
    totalArchived: archivedDocs.length,
    totalAll: incomingBookDocs.length + outgoingBookDocs.length,
  }), [incomingBookDocs, outgoingBookDocs, archivedDocs]);

  const tabs = [
    { key: 'incoming' as BookTab, label: 'Sổ VB Đến', icon: FileInput, count: stats.totalIncoming, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { key: 'outgoing' as BookTab, label: 'Sổ VB Đi', icon: FileOutput, count: stats.totalOutgoing, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    { key: 'archive' as BookTab, label: 'Lưu trữ', icon: Archive, count: stats.totalArchived, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/30' },
  ];

  return (
    <PageTransition>
      <Header title="Sổ văn bản & Lưu trữ" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[22px] text-foreground" style={{ fontFamily: "var(--font-display)" }}>{stats.totalAll}</p>
              <p className="text-[12px] text-muted-foreground">Tổng đăng ký</p>
            </div>
          </div>
          {tabs.map((tab) => (
            <div key={tab.key} className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}>
              <div className={`w-11 h-11 rounded-lg ${tab.bg} flex items-center justify-center`}>
                <tab.icon className={`w-5 h-5 ${tab.color}`} />
              </div>
              <div>
                <p className="text-[22px] text-foreground" style={{ fontFamily: "var(--font-display)" }}>{tab.count}</p>
                <p className="text-[12px] text-muted-foreground">{tab.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 bg-card rounded-xl border border-border p-1" role="tablist" aria-label="Loại sổ văn bản" style={{ boxShadow: 'var(--shadow-xs)' }} onKeyDown={handleBookTablistKeyDown}>
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setCurrentPage(1); setSearchQuery(''); setCategoryFilter('all'); }}
              role="tab"
              aria-selected={activeTab === tab.key}
              aria-controls={`tabpanel-${tab.key}`}
              id={`tab-${tab.key}`}
              tabIndex={getBookTabIndex(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-[13px] transition-all flex-1 justify-center ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent'
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-card rounded-xl border border-border overflow-hidden" role="tabpanel" id={`tabpanel-${activeTab}`} aria-labelledby={`tab-${activeTab}`} style={{ boxShadow: 'var(--shadow-xs)' }}>
          {/* Toolbar */}
          <div className="p-4 border-b border-border">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                <input type="text" placeholder="Tìm theo số hiệu, trích yếu, nơi gửi/nhận..."
                  value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  aria-label="Tìm kiếm sổ văn bản"
                  className="w-full pl-9 pr-4 py-2.5 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/40" />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-muted-foreground/50" />
                <select value={yearFilter} onChange={(e) => { setYearFilter(e.target.value); setCurrentPage(1); }}
                  aria-label="Lọc theo năm"
                  className="px-3 py-2 bg-surface-2 rounded-lg text-[13px] border border-transparent focus:border-primary/20 outline-none cursor-pointer text-foreground">
                  <option value="all">Tất cả năm</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                </select>
                <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                  aria-label="Lọc theo loi văn bản"
                  className="px-3 py-2 bg-surface-2 rounded-lg text-[13px] border border-transparent focus:border-primary/20 outline-none cursor-pointer text-foreground">
                  <option value="all">Tất cả loại</option>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2 lg:ml-auto">
                <ColumnToggle
                  isOpen={bookColVis.isOpen}
                  setIsOpen={bookColVis.setIsOpen}
                  columns={bookColVis.columns}
                  isVisible={bookColVis.isVisible}
                  toggle={bookColVis.toggle}
                  resetAll={bookColVis.resetAll}
                  showOnlyRequired={bookColVis.showOnlyRequired}
                  hideAllOptional={bookColVis.hideAllOptional}
                  allOptionalVisible={bookColVis.allOptionalVisible}
                  allOptionalHidden={bookColVis.allOptionalHidden}
                  handleMenuKeyDown={bookColVis.handleMenuKeyDown}
                  visibleCount={bookColVis.visibleCount}
                  totalCount={bookColVis.totalCount}
                  hasHidden={bookColVis.hasHidden}
                  announcement={bookColVis.announcement}
                />
                <button onClick={() => { toast.info('Đang mở hộp thoại in...'); setTimeout(() => window.print(), 300); }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-surface-2 rounded-lg text-[13px] text-muted-foreground hover:bg-accent transition-colors">
                  <Printer className="w-4 h-4" /> In sổ
                </button>
                <button onClick={() => toast.success('Đã xuất file Excel sổ văn bản thành công!')}
                  className="flex items-center gap-1.5 px-3 py-2 bg-surface-2 rounded-lg text-[13px] text-muted-foreground hover:bg-accent transition-colors">
                  <Download className="w-4 h-4" /> Xuất Excel
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto max-h-[65vh]">
            <table ref={bookTableRef} className="w-full" style={{ tableLayout: 'fixed' }} aria-rowcount={sortedFiltered.length + 1}>
              <caption className="sr-only">
                {activeTab === 'incoming' ? 'Sổ văn bản đến' : activeTab === 'outgoing' ? 'Sổ văn bản đi' : 'Văn bản lưu trữ'} — {filtered.length} bản ghi
              </caption>
              <thead className="sticky-header">
                <tr className="bg-accent/30">
                  {isBookColVisible('stt') && (
                    <th scope="col" role="columnheader" aria-colindex={1} className="relative text-left px-4 py-3 text-[11px] text-muted-foreground tracking-wide whitespace-nowrap" style={bookColResize.getHeaderProps('stt').style}>STT<ResizeHandle onResizeStart={(e) => bookColResize.onResizeStart('stt', e)} onDoubleClick={() => bookColResize.autoFit('stt', bookTableRef.current)} onKeyboardResize={(d) => bookColResize.keyboardResize('stt', d)} /></th>
                  )}
                  {isBookColVisible('number') && (
                    <DraggableHeader colKey="number" index={bookColOrder.getColumnIndex('number')} onMove={bookColOrder.moveColumn} onKeyboardMove={(k, d) => bookColOrder.moveColumnByKey(k as BookColKey, d)}
                      scope="col" role="columnheader" aria-colindex={2} aria-sort={getBookAriaSort('number')} tabIndex={0} title="Nhấn Enter để sắp xếp, Alt+← → để di chuyển cột" aria-describedby="book-sort-hint" className="relative text-left px-4 py-3 text-[11px] text-muted-foreground tracking-wide whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors group/th" style={bookColResize.getHeaderProps('number').style} onClick={() => handleBookSort('number')} onKeyDown={(e) => handleBookSortKeyDown(e, 'number')}>
                      SỐ HIỆU <BookSortIcon col="number" />
                      <ResizeHandle onResizeStart={(e) => bookColResize.onResizeStart('number', e)} onDoubleClick={() => bookColResize.autoFit('number', bookTableRef.current)} onKeyboardResize={(d) => bookColResize.keyboardResize('number', d)} />
                    </DraggableHeader>
                  )}
                  {isBookColVisible('title') && (
                    <DraggableHeader colKey="title" index={bookColOrder.getColumnIndex('title')} onMove={bookColOrder.moveColumn} onKeyboardMove={(k, d) => bookColOrder.moveColumnByKey(k as BookColKey, d)}
                      scope="col" role="columnheader" aria-colindex={3} aria-sort={getBookAriaSort('title')} tabIndex={0} title="Nhấn Enter để sắp xếp, Alt+← → để di chuyển cột" aria-describedby="book-sort-hint" className="relative text-left px-4 py-3 text-[11px] text-muted-foreground tracking-wide cursor-pointer select-none hover:text-foreground transition-colors group/th" style={bookColResize.getHeaderProps('title').style} onClick={() => handleBookSort('title')} onKeyDown={(e) => handleBookSortKeyDown(e, 'title')}>
                      TRÍCH YẾU <BookSortIcon col="title" />
                      <ResizeHandle onResizeStart={(e) => bookColResize.onResizeStart('title', e)} onDoubleClick={() => bookColResize.autoFit('title', bookTableRef.current)} onKeyboardResize={(d) => bookColResize.keyboardResize('title', d)} />
                    </DraggableHeader>
                  )}
                  {isBookColVisible('sender') && (
                    <DraggableHeader colKey="sender" index={bookColOrder.getColumnIndex('sender')} onMove={bookColOrder.moveColumn} onKeyboardMove={(k, d) => bookColOrder.moveColumnByKey(k as BookColKey, d)}
                      scope="col" role="columnheader" aria-colindex={4} aria-sort={getBookAriaSort('sender')} tabIndex={0} title="Nhấn Enter để sắp xếp, Alt+← → để di chuyển cột" aria-describedby="book-sort-hint" className="relative text-left px-4 py-3 text-[11px] text-muted-foreground whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors group/th" style={bookColResize.getHeaderProps('sender').style} onClick={() => handleBookSort('sender')} onKeyDown={(e) => handleBookSortKeyDown(e, 'sender')}>
                      {activeTab === 'outgoing' || activeTab === 'archive' ? 'NƠI NHẬN' : 'NƠI GỬI'} <BookSortIcon col="sender" />
                      <ResizeHandle onResizeStart={(e) => bookColResize.onResizeStart('sender', e)} onDoubleClick={() => bookColResize.autoFit('sender', bookTableRef.current)} onKeyboardResize={(d) => bookColResize.keyboardResize('sender', d)} />
                    </DraggableHeader>
                  )}
                  {isBookColVisible('date') && (
                    <DraggableHeader colKey="date" index={bookColOrder.getColumnIndex('date')} onMove={bookColOrder.moveColumn} onKeyboardMove={(k, d) => bookColOrder.moveColumnByKey(k as BookColKey, d)}
                      scope="col" role="columnheader" aria-colindex={5} aria-sort={getBookAriaSort('date')} tabIndex={0} title="Nhấn Enter để sắp xếp, Alt+← → để di chuyển cột" aria-describedby="book-sort-hint" className="relative text-left px-4 py-3 text-[11px] text-muted-foreground whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors group/th" style={bookColResize.getHeaderProps('date').style} onClick={() => handleBookSort('date')} onKeyDown={(e) => handleBookSortKeyDown(e, 'date')}>
                      NGÀY VĂN BẢN <BookSortIcon col="date" />
                      <ResizeHandle onResizeStart={(e) => bookColResize.onResizeStart('date', e)} onDoubleClick={() => bookColResize.autoFit('date', bookTableRef.current)} onKeyboardResize={(d) => bookColResize.keyboardResize('date', d)} />
                    </DraggableHeader>
                  )}
                  {activeTab === 'incoming' && (
                    <th scope="col" role="columnheader" className="text-left px-4 py-3 text-[11px] text-muted-foreground whitespace-nowrap">NGÀY NHẬN</th>
                  )}
                  {isBookColVisible('category') && (
                    <DraggableHeader colKey="category" index={bookColOrder.getColumnIndex('category')} onMove={bookColOrder.moveColumn} onKeyboardMove={(k, d) => bookColOrder.moveColumnByKey(k as BookColKey, d)}
                      scope="col" role="columnheader" aria-colindex={6} aria-sort={getBookAriaSort('category')} tabIndex={0} title="Nhấn Enter để sắp xếp, Alt+← → để di chuyển cột" aria-describedby="book-sort-hint" className="relative text-left px-4 py-3 text-[11px] text-muted-foreground whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors group/th" style={bookColResize.getHeaderProps('category').style} onClick={() => handleBookSort('category')} onKeyDown={(e) => handleBookSortKeyDown(e, 'category')}>
                      LOẠI <BookSortIcon col="category" />
                      <ResizeHandle onResizeStart={(e) => bookColResize.onResizeStart('category', e)} onDoubleClick={() => bookColResize.autoFit('category', bookTableRef.current)} onKeyboardResize={(d) => bookColResize.keyboardResize('category', d)} />
                    </DraggableHeader>
                  )}
                  {isBookColVisible('priority') && (
                    <DraggableHeader colKey="priority" index={bookColOrder.getColumnIndex('priority')} onMove={bookColOrder.moveColumn} onKeyboardMove={(k, d) => bookColOrder.moveColumnByKey(k as BookColKey, d)}
                      scope="col" role="columnheader" aria-colindex={7} aria-sort={getBookAriaSort('priority')} tabIndex={0} title="Nhấn Enter để sắp xếp, Alt+← → để di chuyển cột" aria-describedby="book-sort-hint" className="relative text-left px-4 py-3 text-[11px] text-muted-foreground whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors group/th" style={bookColResize.getHeaderProps('priority').style} onClick={() => handleBookSort('priority')} onKeyDown={(e) => handleBookSortKeyDown(e, 'priority')}>
                      ĐỘ KHẨN <BookSortIcon col="priority" />
                      <ResizeHandle onResizeStart={(e) => bookColResize.onResizeStart('priority', e)} onDoubleClick={() => bookColResize.autoFit('priority', bookTableRef.current)} onKeyboardResize={(d) => bookColResize.keyboardResize('priority', d)} />
                    </DraggableHeader>
                  )}
                  {isBookColVisible('status') && (
                    <DraggableHeader colKey="status" index={bookColOrder.getColumnIndex('status')} onMove={bookColOrder.moveColumn} onKeyboardMove={(k, d) => bookColOrder.moveColumnByKey(k as BookColKey, d)}
                      scope="col" role="columnheader" aria-colindex={8} aria-sort={getBookAriaSort('status')} tabIndex={0} title="Nhấn Enter để sắp xếp, Alt+← → để di chuyển cột" aria-describedby="book-sort-hint" className="relative text-left px-4 py-3 text-[11px] text-muted-foreground whitespace-nowrap cursor-pointer select-none hover:text-foreground transition-colors group/th" style={bookColResize.getHeaderProps('status').style} onClick={() => handleBookSort('status')} onKeyDown={(e) => handleBookSortKeyDown(e, 'status')}>
                      TRẠNG THÁI <BookSortIcon col="status" />
                      <ResizeHandle onResizeStart={(e) => bookColResize.onResizeStart('status', e)} onDoubleClick={() => bookColResize.autoFit('status', bookTableRef.current)} onKeyboardResize={(d) => bookColResize.keyboardResize('status', d)} />
                    </DraggableHeader>
                  )}
                  {activeTab === 'archive' && (
                    <th scope="col" role="columnheader" className="text-left px-4 py-3 text-[11px] text-muted-foreground whitespace-nowrap">NGUỒN</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {paginated.map((doc, idx) => {
                  const statusCfg = getStatusConfig(doc);
                  const priCfg = priorityLabels[doc.priority];
                  return (
                    <tr key={doc.id} aria-rowindex={(currentPage - 1) * itemsPerPage + idx + 2} className="border-b border-border/50 hover:bg-accent/20 transition-colors cursor-pointer">
                      {isBookColVisible('stt') && (
                        <td aria-colindex={1} className="px-4 py-3 text-[12px] text-muted-foreground">
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-accent/50 text-[11px]">
                            {doc.bookNumber || (currentPage - 1) * itemsPerPage + idx + 1}
                          </span>
                        </td>
                      )}
                      {isBookColVisible('number') && (
                        <td aria-colindex={2} className="px-4 py-3">
                          <span className="text-[12px] text-primary flex items-center gap-1 whitespace-nowrap">
                            <Hash className="w-3 h-3" />{doc.number || 'Chưa cấp số'}
                          </span>
                        </td>
                      )}
                      {isBookColVisible('title') && (
                        <td aria-colindex={3} className="px-4 py-3 max-w-sm">
                          <p className="text-[13px] text-foreground truncate">{doc.title}</p>
                          {doc.isLocked && (
                            <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                              <Lock className="w-3 h-3" /> Đã khóa
                            </span>
                          )}
                        </td>
                      )}
                      {isBookColVisible('sender') && (
                        <td aria-colindex={4} className="px-4 py-3 text-[12px] text-muted-foreground whitespace-nowrap">
                          {activeTab === 'outgoing' ? doc.receiver : doc.sender}
                        </td>
                      )}
                      {isBookColVisible('date') && (
                        <td aria-colindex={5} className="px-4 py-3 text-[12px] text-muted-foreground whitespace-nowrap">
                          {new Date(doc.date).toLocaleDateString('vi-VN')}
                        </td>
                      )}
                      {activeTab === 'incoming' && (
                        <td className="px-4 py-3 text-[12px] text-muted-foreground whitespace-nowrap">
                          {doc.receivedDate ? new Date(doc.receivedDate).toLocaleDateString('vi-VN') : '--'}
                        </td>
                      )}
                      {isBookColVisible('category') && (
                        <td aria-colindex={6} className="px-4 py-3">
                          <span className="text-[11px] px-2 py-0.5 rounded bg-secondary text-secondary-foreground whitespace-nowrap">{doc.category}</span>
                        </td>
                      )}
                      {isBookColVisible('priority') && (
                        <td aria-colindex={7} className="px-4 py-3">
                          <span className={`text-[11px] px-2 py-0.5 rounded ${priCfg.bg} ${priCfg.color} whitespace-nowrap`}>{priCfg.label}</span>
                        </td>
                      )}
                      {isBookColVisible('status') && (
                        <td aria-colindex={8} className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${statusCfg?.bg} ${statusCfg?.color} whitespace-nowrap`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusCfg?.dot}`} />{statusCfg?.label}
                          </span>
                        </td>
                      )}
                      {activeTab === 'archive' && (
                        <td className="px-4 py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                            doc.type === 'incoming' ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                            doc.type === 'outgoing' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                            'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                          }`}>
                            {doc.type === 'incoming' ? 'VB đến' : doc.type === 'outgoing' ? 'VB đi' : 'Nội bộ'}
                          </span>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={10} className="px-5 py-4 text-center">
                      <EmptyState
                        icon={BookOpen}
                        title={activeTab === 'archive' ? 'Chưa có văn bản lưu trữ' : 'Sổ văn bản trống'}
                        description={searchQuery ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm' : 'Chưa có văn bản nào được đăng ký vào sổ'}
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
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <p className="text-[13px] text-muted-foreground" aria-live="polite" role="status">
                {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filtered.length)} / {filtered.length}
              </p>
              {isBookSorted && (
                <button onClick={() => { resetBookSort(); setCurrentPage(1); }}
                  className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                  aria-label="Xóa sắp xếp">
                  <X className="w-3 h-3" /> Xóa sắp xếp
                </button>
              )}
              <ResetWidthsButton isResized={bookColResize.isResized} onReset={bookColResize.resetWidths} />
              {bookColOrder.isReordered && (
                <button onClick={bookColOrder.resetOrder} className="flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors" aria-label="Đặt lại thứ tự cột">
                  <ArrowUpDown className="w-3 h-3" /> Đặt lại thứ tự
                </button>
              )}
              <nav className="flex items-center gap-1" aria-label="Phân trang">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                  aria-label="Trang trước"
                  className="p-2 rounded-lg hover:bg-accent disabled:opacity-40"><ChevronLeft className="w-4 h-4" /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    aria-current={page === currentPage ? 'page' : undefined}
                    aria-label={`Trang ${page}`}
                    className={`w-8 h-8 rounded-lg text-[13px] ${page === currentPage ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'}`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                  aria-label="Trang sau"
                  className="p-2 rounded-lg hover:bg-accent disabled:opacity-40"><ChevronRight className="w-4 h-4" /></button>
              </nav>
            </div>
          )}
        </div>
      </div>

      {/* Sort announcement live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {bookSortAnnouncement}
      </div>

      {/* Sort hint for aria-describedby */}
      <span id="book-sort-hint" className="sr-only">Nhấn Enter hoặc Space để sắp xếp cột, Escape để xóa sắp xếp</span>

      {/* Column order announcement live region */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" role="status">
        {bookColOrder.announcement}
      </div>
    </PageTransition>
  );
}