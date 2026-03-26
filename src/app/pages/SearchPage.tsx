import { useState, useMemo, useCallback } from 'react';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { incomingDocs, outgoingDocs, internalDocs, getStatusConfig, priorityLabels, type EnhancedDocument } from '../data/documentData';
import { enhancedTasks, calendarEvents, type EnhancedTask, type CalendarEvent } from '../data/taskData';
import { useNavigate } from 'react-router';
import { useDebounce } from '../hooks/useDebounce';
import {
  Search, X, Filter, FileInput, FileOutput, FileText, ClipboardList,
  Calendar, Clock, Hash, ChevronDown, ChevronUp, Sliders, Tag, MapPin,
  User, Building2, History, Star, ArrowRight,
} from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'incoming' | 'outgoing' | 'internal' | 'task' | 'event';
  title: string;
  subtitle: string;
  date: string;
  priority?: string;
  status?: string;
  matchField: string;
  link: string;
  raw: EnhancedDocument | EnhancedTask | CalendarEvent;
}

const recentSearches = [
  'chuyển đổi số',
  'dịch bệnh quý I',
  'ngân sách 2025',
  'cấp giấy chứng nhận',
  'đào tạo cán bộ',
];

const savedSearches = [
  { label: 'VB chưa xử lý', query: '', filters: { status: 'processing', type: 'all' } },
  { label: 'Khẩn & Hỏa tốc', query: '', filters: { priority: 'urgent', type: 'all' } },
  { label: 'Quá hn', query: '', filters: { status: 'overdue', type: 'all' } },
];

export function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    priority: 'all',
    status: 'all',
    category: 'all',
    field: 'all',
    dateFrom: '',
    dateTo: '',
    sender: '',
    assignee: '',
  });

  const allDocs = useMemo(() => [...incomingDocs, ...outgoingDocs, ...internalDocs], []);

  const categories = useMemo(() => [...new Set(allDocs.map((d) => d.category))], [allDocs]);
  const fields = useMemo(() => [...new Set(allDocs.map((d) => d.field))], [allDocs]);

  const debouncedQuery = useDebounce(query, 300);

  const highlight = useCallback((text: string, q: string): string => {
    if (!q.trim()) return text;
    return text;
  }, []);

  const results = useMemo((): SearchResult[] => {
    const q = debouncedQuery.toLowerCase().trim();
    const results: SearchResult[] = [];

    // Search documents
    if (filters.type === 'all' || ['incoming', 'outgoing', 'internal'].includes(filters.type)) {
      const docsToSearch = filters.type === 'all' ? allDocs :
        filters.type === 'incoming' ? incomingDocs :
        filters.type === 'outgoing' ? outgoingDocs : internalDocs;

      docsToSearch.forEach((doc) => {
        if (!q && !showAdvanced) return;

        const matchTitle = q ? doc.title.toLowerCase().includes(q) : true;
        const matchNumber = q ? doc.number.toLowerCase().includes(q) : false;
        const matchContent = q ? doc.content.toLowerCase().includes(q) : false;
        const matchSender = q ? doc.sender.toLowerCase().includes(q) : false;
        const hasTextMatch = q ? (matchTitle || matchNumber || matchContent || matchSender) : true;

        if (!hasTextMatch) return;

        // Advanced filters
        if (filters.priority !== 'all' && doc.priority !== filters.priority) return;
        if (filters.category !== 'all' && doc.category !== filters.category) return;
        if (filters.field !== 'all' && doc.field !== filters.field) return;
        if (filters.dateFrom && doc.date < filters.dateFrom) return;
        if (filters.dateTo && doc.date > filters.dateTo) return;
        if (filters.sender && !doc.sender.toLowerCase().includes(filters.sender.toLowerCase())) return;
        if (filters.status !== 'all') {
          if (filters.status === 'overdue' && !(doc.deadline && new Date(doc.deadline) < new Date() && !['completed', 'published', 'distributed'].includes(doc.status))) return;
          else if (filters.status !== 'overdue' && doc.status !== filters.status) return;
        }

        const matchField = matchNumber ? 'Số hiệu' : matchTitle ? 'Trích yếu' : matchContent ? 'Nội dung' : matchSender ? 'Nơi gi' : 'Bộ lọc';
        results.push({
          id: doc.id,
          type: doc.type,
          title: doc.title,
          subtitle: `${doc.number || 'Chưa cấp số'} · ${doc.sender} → ${doc.receiver}`,
          date: doc.date,
          priority: doc.priority,
          status: doc.status,
          matchField,
          link: `/${doc.type === 'incoming' ? 'incoming' : doc.type === 'outgoing' ? 'outgoing' : 'internal'}`,
          raw: doc,
        });
      });
    }

    // Search tasks
    if (filters.type === 'all' || filters.type === 'task') {
      enhancedTasks.forEach((task) => {
        if (!q && !showAdvanced) return;

        const matchTitle = q ? task.title.toLowerCase().includes(q) : true;
        const matchAssignee = q ? task.assignee.toLowerCase().includes(q) : false;
        const matchDesc = q ? task.description.toLowerCase().includes(q) : false;
        const hasTextMatch = q ? (matchTitle || matchAssignee || matchDesc) : true;

        if (!hasTextMatch) return;
        if (filters.priority !== 'all' && task.priority !== filters.priority) return;
        if (filters.assignee && !task.assignee.toLowerCase().includes(filters.assignee.toLowerCase())) return;
        if (filters.status !== 'all') {
          if (filters.status === 'overdue' && !(task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done')) return;
          else if (filters.status !== 'overdue' && task.status !== filters.status) return;
        }

        results.push({
          id: task.id,
          type: 'task',
          title: task.title,
          subtitle: `${task.assignee} · ${task.departmentName} · ${task.progress}%`,
          date: task.dueDate || task.createdAt,
          priority: task.priority,
          status: task.status,
          matchField: matchTitle ? 'Tiêu đề' : matchAssignee ? 'Người thực hiện' : 'Mô tả',
          link: '/tasks',
          raw: task,
        });
      });
    }

    // Search events
    if (filters.type === 'all' || filters.type === 'event') {
      calendarEvents.forEach((evt) => {
        if (!q && !showAdvanced) return;

        const matchTitle = q ? evt.title.toLowerCase().includes(q) : true;
        const matchLocation = q ? evt.location.toLowerCase().includes(q) : false;
        const matchDesc = q ? evt.description.toLowerCase().includes(q) : false;
        const hasTextMatch = q ? (matchTitle || matchLocation || matchDesc) : true;

        if (!hasTextMatch) return;
        if (filters.dateFrom && evt.date < filters.dateFrom) return;
        if (filters.dateTo && evt.date > filters.dateTo) return;

        results.push({
          id: evt.id,
          type: 'event',
          title: evt.title,
          subtitle: `${evt.date} · ${evt.startTime}-${evt.endTime}${evt.location ? ' · ' + evt.location : ''}`,
          date: evt.date,
          matchField: matchTitle ? 'Tiêu đề' : matchLocation ? 'Địa điểm' : 'Mô tả',
          link: '/calendar',
          raw: evt,
        });
      });
    }

    return results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [debouncedQuery, filters, allDocs, showAdvanced]);

  const typeIcons: Record<string, typeof FileText> = {
    incoming: FileInput,
    outgoing: FileOutput,
    internal: FileText,
    task: ClipboardList,
    event: Calendar,
  };

  const typeLabels: Record<string, { label: string; color: string; bg: string }> = {
    incoming: { label: 'VB Đến', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    outgoing: { label: 'VB Đi', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    internal: { label: 'Nội bộ', color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-900/30' },
    task: { label: 'Công việc', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
    event: { label: 'Sự kiện', color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-900/30' },
  };

  const clearFilters = () => {
    setFilters({ type: 'all', priority: 'all', status: 'all', category: 'all', field: 'all', dateFrom: '', dateTo: '', sender: '', assignee: '' });
  };

  const hasActiveFilters = Object.entries(filters).some(([k, v]) => v !== 'all' && v !== '');

  const resultTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    results.forEach((r) => { counts[r.type] = (counts[r.type] || 0) + 1; });
    return counts;
  }, [results]);

  return (
    <PageTransition>
      <Header title="Tìm kiếm nâng cao" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Search Bar */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-sm)' }}>
          <div className="p-5">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
              <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm văn bản, công việc, sự kiện theo số hiệu, trích yếu, nơi gửi, người xử lý..."
                aria-label="Tìm kiếm toàn hệ thống"
                className="w-full pl-12 pr-24 py-3.5 bg-surface-2 rounded-xl text-[14px] border border-transparent focus:border-primary/20 focus:ring-2 focus:ring-primary/10 outline-none transition-all placeholder:text-muted-foreground/40"
                autoFocus />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {query && (
                  <button onClick={() => setQuery('')} className="p-2 rounded-lg hover:bg-accent" aria-label="Xóa tìm kiếm">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
                <button onClick={() => setShowAdvanced(!showAdvanced)}
                  aria-expanded={showAdvanced}
                  aria-controls="search-advanced-filters"
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] transition-colors ${showAdvanced ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground hover:bg-muted'}`}>
                  <Sliders className="w-3.5 h-3.5" /> Bộ lọc
                  {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Type filter chips */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {[
                { value: 'all', label: 'Tất cả' },
                { value: 'incoming', label: 'VB Đến' },
                { value: 'outgoing', label: 'VB Đi' },
                { value: 'internal', label: 'Nội bộ' },
                { value: 'task', label: 'Công việc' },
                { value: 'event', label: 'Sự kiện' },
              ].map((opt) => (
                <button key={opt.value} onClick={() => setFilters({ ...filters, type: opt.value })}
                  className={`px-3 py-1.5 rounded-full text-[12px] transition-colors ${
                    filters.type === opt.value ? 'bg-primary text-primary-foreground' : 'bg-accent text-muted-foreground hover:bg-muted'
                  }`}>
                  {opt.label}
                  {opt.value !== 'all' && resultTypeCounts[opt.value] !== undefined && (
                    <span className="ml-1 opacity-75">({resultTypeCounts[opt.value]})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div id="search-advanced-filters" className="px-5 pb-5 pt-2 border-t border-border space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label htmlFor="search-priority" className="block text-[11px] text-muted-foreground mb-1">Mức độ ưu tiên</label>
                  <select id="search-priority" value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    aria-label="Lọc theo mức độ ưu tiên"
                    className="w-full px-3 py-2 bg-input-background rounded-lg text-[12px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                    <option value="all">Tất cả</option>
                    <option value="urgent_top">Hỏa tốc</option>
                    <option value="urgent">Khẩn</option>
                    <option value="high">Cao</option>
                    <option value="medium">Trung bình</option>
                    <option value="low">Thấp</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="search-status" className="block text-[11px] text-muted-foreground mb-1">Trạng thái</label>
                  <select id="search-status" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    aria-label="Lọc theo trạng thái"
                    className="w-full px-3 py-2 bg-input-background rounded-lg text-[12px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                    <option value="all">Tất cả</option>
                    <option value="processing">Đang xử lý</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="published">Đã phát hành</option>
                    <option value="overdue">Quá hạn</option>
                    <option value="draft">Nháp</option>
                    <option value="received">Đã tiếp nhận</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="search-category" className="block text-[11px] text-muted-foreground mb-1">Loại văn bản</label>
                  <select id="search-category" value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    aria-label="Lọc theo loại văn bản"
                    className="w-full px-3 py-2 bg-input-background rounded-lg text-[12px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                    <option value="all">Tất cả</option>
                    {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="search-field" className="block text-[11px] text-muted-foreground mb-1">Lĩnh vực</label>
                  <select id="search-field" value={filters.field} onChange={(e) => setFilters({ ...filters, field: e.target.value })}
                    aria-label="Lọc theo lĩnh vực"
                    className="w-full px-3 py-2 bg-input-background rounded-lg text-[12px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                    <option value="all">Tất cả</option>
                    {fields.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label htmlFor="search-date-from" className="block text-[11px] text-muted-foreground mb-1">Từ ngày</label>
                  <input id="search-date-from" type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="w-full px-3 py-2 bg-input-background rounded-lg text-[12px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div>
                  <label htmlFor="search-date-to" className="block text-[11px] text-muted-foreground mb-1">Đến ngày</label>
                  <input id="search-date-to" type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="w-full px-3 py-2 bg-input-background rounded-lg text-[12px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div>
                  <label htmlFor="search-sender" className="block text-[11px] text-muted-foreground mb-1">Nơi gửi</label>
                  <input id="search-sender" type="text" value={filters.sender} onChange={(e) => setFilters({ ...filters, sender: e.target.value })} placeholder="Tìm nơi gửi..."
                    className="w-full px-3 py-2 bg-input-background rounded-lg text-[12px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div>
                  <label htmlFor="search-assignee" className="block text-[11px] text-muted-foreground mb-1">Người xử lý</label>
                  <input id="search-assignee" type="text" value={filters.assignee} onChange={(e) => setFilters({ ...filters, assignee: e.target.value })} placeholder="Tìm người xử lý..."
                    className="w-full px-3 py-2 bg-input-background rounded-lg text-[12px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="text-[12px] text-primary hover:underline">Xóa bộ lọc</button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">
          {/* Results */}
          <div className="xl:col-span-3 space-y-3">
            {/* Results count */}
            {(query || hasActiveFilters) && (
              <div className="flex items-center justify-between">
                <p className="text-[13px] text-muted-foreground" aria-live="polite">
                  Tìm thấy <span className="text-foreground">{results.length}</span> kết quả
                  {query && <> cho "<span className="text-primary">{query}</span>"</>}
                </p>
              </div>
            )}

            {/* No query state */}
            {!query && !hasActiveFilters && (
              <div className="bg-card rounded-xl border border-border py-16 text-center" style={{ boxShadow: 'var(--shadow-xs)' }}>
                <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-primary/30" />
                </div>
                <h3 className="text-[16px] text-foreground mb-2" style={{ fontFamily: "var(--font-display)" }}>Tìm kiếm nâng cao</h3>
                <p className="text-[13px] text-muted-foreground max-w-md mx-auto leading-relaxed">
                  Nhập từ khóa để tìm kiếm trong tất cả văn bản, công việc và sự kiện.
                  Sử dụng bộ lọc nâng cao để thu hẹp kết quả.
                </p>
              </div>
            )}

            {/* No results */}
            {(query || hasActiveFilters) && results.length === 0 && (
              <div className="bg-card rounded-xl border border-border py-12 text-center" role="status" aria-live="polite">
                <Search className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-[14px] text-muted-foreground">Không tìm thấy kết quả phù hợp</p>
                <p className="text-[12px] text-muted-foreground mt-1">Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc</p>
              </div>
            )}

            {/* Results list */}
            {results.length > 0 && (
              <div className="bg-card rounded-xl border border-border overflow-hidden divide-y divide-border/50" role="feed" aria-label="Kết quả tìm kiếm">
                {results.map((result) => {
                  const TypeIcon = typeIcons[result.type];
                  const typeLabel = typeLabels[result.type];
                  return (
                    <article key={result.id}
                      aria-label={`${typeLabel.label}: ${result.title}`}
                      className="flex items-start gap-3 px-5 py-4 hover:bg-accent/20 transition-colors cursor-pointer group"
                      onClick={() => navigate(result.link)}
                    >
                      <div className={`w-9 h-9 rounded-lg ${typeLabel.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                        <TypeIcon className={`w-4 h-4 ${typeLabel.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${typeLabel.bg} ${typeLabel.color}`}>{typeLabel.label}</span>
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{result.id}</span>
                          <span className="text-[10px] text-muted-foreground">{result.matchField}</span>
                          {result.priority && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              result.priority === 'urgent' || result.priority === 'urgent_top' ? 'bg-red-50 text-red-700' :
                              result.priority === 'high' ? 'bg-orange-50 text-orange-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {result.priority === 'urgent_top' ? 'Hỏa tốc' : result.priority === 'urgent' ? 'Khẩn' :
                               result.priority === 'high' ? 'Cao' : result.priority === 'medium' ? 'TB' : 'Thấp'}
                            </span>
                          )}
                        </div>
                        <p className="text-[13px] text-foreground mb-0.5 line-clamp-1">{result.title}</p>
                        <p className="text-[12px] text-muted-foreground line-clamp-1">{result.subtitle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="w-3 h-3" /> {new Date(result.date).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors shrink-0 mt-2" />
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Recent Searches */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h4 className="text-[13px] text-foreground flex items-center gap-1.5 mb-3">
                <History className="w-4 h-4 text-muted-foreground" /> Tìm kiếm gần đây
              </h4>
              <div className="space-y-1">
                {recentSearches.map((s) => (
                  <button key={s} onClick={() => setQuery(s)}
                    className="w-full text-left px-3 py-2 rounded-lg text-[12px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" /> {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Saved Searches */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h4 className="text-[13px] text-foreground flex items-center gap-1.5 mb-3">
                <Star className="w-4 h-4 text-amber-500" /> Bộ lọc đã lưu
              </h4>
              <div className="space-y-1">
                {savedSearches.map((s) => (
                  <button key={s.label} onClick={() => { setFilters({ ...filters, ...s.filters as any }); setShowAdvanced(true); }}
                    className="w-full text-left px-3 py-2 rounded-lg text-[12px] text-muted-foreground hover:bg-accent hover:text-foreground transition-colors flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5" /> {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Stats summary */}
            {(query || hasActiveFilters) && results.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4">
                <h4 className="text-[13px] text-foreground mb-3">Phân bố kết quả</h4>
                <div className="space-y-2">
                  {Object.entries(resultTypeCounts).map(([type, count]) => {
                    const cfg = typeLabels[type];
                    return (
                      <div key={type} className="flex items-center justify-between text-[12px]">
                        <span className={cfg.color}>{cfg.label}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-muted rounded-full h-1.5" role="progressbar" aria-valuenow={count} aria-valuemin={0} aria-valuemax={results.length} aria-label={`${cfg.label}: ${count} kết quả`}>
                            <div className="h-1.5 rounded-full bg-primary" style={{ width: `${(count / results.length) * 100}%` }} />
                          </div>
                          <span className="text-muted-foreground w-6 text-right">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}