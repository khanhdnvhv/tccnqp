import { useState, useCallback, useMemo } from 'react';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { toast } from 'sonner';
import {
  UserPlus, Search, X, Check, AlertCircle, Download, LogIn, LogOut,
  Eye, Filter, Users, Clock, AlertTriangle, CheckCircle2,
} from 'lucide-react';
import {
  visitors as initialVisitors, type Visitor, type VisitorStatus, type VisitorType,
  visitorStatusLabels, visitorStatusColors, visitorTypeLabels, visitorTypeColors,
} from '../data/visitorData';
import { useAuth } from '../context/AuthContext';

type FilterTab = 'all' | VisitorStatus;

const TABS: { key: FilterTab; label: string; count: (v: Visitor[]) => number }[] = [
  { key: 'all', label: 'Tất cả', count: (v) => v.length },
  { key: 'waiting', label: 'Chờ vào', count: (v) => v.filter((x) => x.status === 'waiting').length },
  { key: 'inside', label: 'Đang trong', count: (v) => v.filter((x) => x.status === 'inside').length },
  { key: 'overstay', label: 'Quá giờ', count: (v) => v.filter((x) => x.status === 'overstay').length },
  { key: 'completed', label: 'Đã ra', count: (v) => v.filter((x) => x.status === 'completed').length },
  { key: 'cancelled', label: 'Đã hủy', count: (v) => v.filter((x) => x.status === 'cancelled').length },
];

const VISITOR_TYPES: VisitorType[] = ['contractor', 'partner', 'supplier', 'government', 'personal', 'maintenance'];

interface FormData {
  fullName: string; idNumber: string; organization: string; phone: string;
  purpose: string; hostName: string; hostUnit: string; type: VisitorType;
  vehiclePlate: string; note: string;
}

const EMPTY_FORM: FormData = {
  fullName: '', idNumber: '', organization: '', phone: '',
  purpose: '', hostName: '', hostUnit: '', type: 'partner',
  vehiclePlate: '', note: '',
};

function VisitorStatusBadge({ status }: { status: VisitorStatus }) {
  const c = visitorStatusColors[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
      {visitorStatusLabels[status]}
    </span>
  );
}

function VisitorTypeBadge({ type }: { type: VisitorType }) {
  const c = visitorTypeColors[type];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] ${c.bg} ${c.text}`}>
      {visitorTypeLabels[type]}
    </span>
  );
}

export function VisitorRegistrationPage() {
  const { hasPermission } = useAuth();
  const [list, setList] = useState<Visitor[]>(initialVisitors);
  const [tab, setTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [viewVisitor, setViewVisitor] = useState<Visitor | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [bulkConfirm, setBulkConfirm] = useState(false);
  const modalRef = useFocusTrap<HTMLDivElement>(showModal);
  const viewRef = useFocusTrap<HTMLDivElement>(!!viewVisitor);

  const filtered = useMemo(() => {
    let data = list;
    if (tab !== 'all') data = data.filter((v) => v.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((v) =>
        v.fullName.toLowerCase().includes(q) ||
        v.idNumber.includes(q) ||
        v.organization.toLowerCase().includes(q) ||
        v.hostName.toLowerCase().includes(q)
      );
    }
    return data;
  }, [list, tab, search]);

  const allSelected = filtered.length > 0 && filtered.every((v) => selected.has(v.id));
  const someSelected = selected.size > 0;

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelected((prev) => { const next = new Set(prev); filtered.forEach((v) => next.delete(v.id)); return next; });
    } else {
      setSelected((prev) => { const next = new Set(prev); filtered.forEach((v) => next.add(v.id)); return next; });
    }
  }, [allSelected, filtered]);

  const handleCheckIn = (id: string) => {
    setList((prev) => prev.map((v) => v.id === id ? { ...v, status: 'inside', checkIn: new Date().toISOString() } : v));
    toast.success('Đã cho phép vào khu vực!');
  };

  const handleCheckOut = (id: string) => {
    setList((prev) => prev.map((v) => v.id === id ? { ...v, status: 'completed', checkOut: new Date().toISOString() } : v));
    toast.success('Đã ghi nhận ra khu vực!');
  };

  const handleBulkCheckOut = () => {
    setList((prev) => prev.map((v) => selected.has(v.id) && (v.status === 'inside' || v.status === 'overstay')
      ? { ...v, status: 'completed', checkOut: new Date().toISOString() }
      : v
    ));
    setSelected(new Set());
    setBulkConfirm(false);
    toast.success(`Đã checkout ${selected.size} đối tác`);
  };

  const handleSave = () => {
    if (!formData.fullName.trim()) { setFormError('Vui lòng nhập họ tên'); return; }
    if (!formData.idNumber.trim()) { setFormError('Vui lòng nhập số CCCD/CMND'); return; }
    if (!formData.organization.trim()) { setFormError('Vui lòng nhập đơn vị'); return; }
    if (!formData.purpose.trim()) { setFormError('Vui lòng nhập mục đích'); return; }
    if (!formData.hostName.trim()) { setFormError('Vui lòng nhập người tiếp đón'); return; }
    const newV: Visitor = {
      id: 'v-' + Date.now(), ...formData,
      status: 'waiting', approvedBy: 'Cán bộ trực ban',
      createdAt: new Date().toISOString(),
    };
    setList((prev) => [newV, ...prev]);
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowModal(false);
    toast.success('Đã đăng ký đối tác thành công!');
  };

  const formatTime = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };
  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const insideCount = list.filter((v) => v.status === 'inside' || v.status === 'overstay').length;
  const todayCount = list.filter((v) => v.createdAt.startsWith('2026-03-26')).length;
  const overstayCount = list.filter((v) => v.status === 'overstay').length;

  return (
    <PageTransition>
      <Header title="Đăng ký đối tác vào làm việc" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* Summary strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Users, label: 'Đang trong khu vực', value: insideCount, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { icon: UserPlus, label: 'Đăng ký hôm nay', value: todayCount, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { icon: AlertTriangle, label: 'Quá giờ quy định', value: overstayCount, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
          ].map((s) => (
            <div key={s.label} className={`flex items-center gap-3 p-3 rounded-xl border border-border bg-card`} style={{ boxShadow: 'var(--shadow-xs)' }}>
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
              </div>
              <div>
                <p className="text-[18px] text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-card rounded-xl border border-border" style={{ boxShadow: 'var(--shadow-xs)' }}>
          {/* Tabs */}
          <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-border overflow-x-auto">
            {TABS.map((t) => {
              const cnt = t.count(list);
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[12px] whitespace-nowrap border-b-2 transition-colors ${
                    tab === t.key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                  {cnt > 0 && (
                    <span className={`min-w-[18px] h-[18px] px-1 text-[10px] rounded-full flex items-center justify-center ${
                      tab === t.key ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
                    }`}>{cnt}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search + Actions */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
              <input
                type="text"
                placeholder="Tìm tên, CCCD, đơn vị..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 outline-none transition-all"
              />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] text-muted-foreground hover:bg-accent border border-border transition-colors">
                <Download className="w-3.5 h-3.5" /> Xuất
              </button>
              <button
                onClick={() => { setFormData(EMPTY_FORM); setFormError(''); setShowModal(true); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] text-white bg-primary hover:opacity-90 transition-all active:scale-[0.98]"
                style={{ boxShadow: 'var(--shadow-sm)' }}
              >
                <UserPlus className="w-3.5 h-3.5" /> Đăng ký mới
              </button>
            </div>
          </div>
        </div>

        {/* Bulk action bar */}
        {someSelected && (
          <div className="flex items-center gap-3 px-4 py-3 bg-primary/5 border border-primary/15 rounded-xl">
            <span className="text-[13px] text-primary">{selected.size} đối tác được chọn</span>
            <button onClick={() => setBulkConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-[12px] hover:opacity-90">
              <LogOut className="w-3.5 h-3.5" /> Checkout tất cả
            </button>
            <button onClick={() => setSelected(new Set())} className="ml-auto flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" /> Bỏ chọn
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-xs)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]" role="grid" aria-label="Danh sách đăng ký đối tác">
              <thead>
                <tr className="border-b border-border bg-surface-2/60 text-left">
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" checked={allSelected} onChange={toggleAll}
                      className="rounded accent-primary cursor-pointer" aria-label="Chọn tất cả" />
                  </th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide whitespace-nowrap">STT</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Họ tên & CCCD</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Đơn vị</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Người tiếp</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide whitespace-nowrap">Check-in</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide whitespace-nowrap">Check-out</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Loại</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Trạng thái</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((v, idx) => (
                  <tr key={v.id} className={`border-b border-border/60 hover:bg-accent/30 transition-colors ${selected.has(v.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(v.id)} onChange={() => toggleSelect(v.id)}
                        className="rounded accent-primary cursor-pointer" aria-label={`Chọn ${v.fullName}`} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-[12px]">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <p className="text-foreground truncate max-w-[150px]">{v.fullName}</p>
                      <p className="text-[11px] text-muted-foreground">{v.idNumber}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground truncate max-w-[160px]">{v.organization}</p>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[160px]">{v.purpose}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-foreground truncate max-w-[130px]">{v.hostName}</p>
                      <p className="text-[11px] text-muted-foreground truncate max-w-[130px]">{v.hostUnit}</p>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {v.checkIn ? (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(v.checkIn)}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {v.checkOut ? (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatTime(v.checkOut)}</span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3"><VisitorTypeBadge type={v.type} /></td>
                    <td className="px-4 py-3"><VisitorStatusBadge status={v.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setViewVisitor(v)}
                          className="p-1.5 rounded-lg hover:bg-accent transition-colors" title="Xem chi tiết" aria-label="Xem chi tiết">
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        {v.status === 'waiting' && (
                          <button onClick={() => handleCheckIn(v.id)}
                            className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Check-in" aria-label="Check-in">
                            <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                          </button>
                        )}
                        {(v.status === 'inside' || v.status === 'overstay') && (
                          <button onClick={() => handleCheckOut(v.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Check-out" aria-label="Check-out">
                            <LogOut className="w-3.5 h-3.5 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-muted-foreground text-[13px]">
                      <Filter className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      Không có dữ liệu phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Register Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="reg-modal-title"
            className="bg-card rounded-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: 'var(--shadow-xl)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <UserPlus className="w-4 h-4 text-primary" />
                </div>
                <h3 id="reg-modal-title" style={{ fontFamily: 'var(--font-display)' }}>Đăng ký đối tác mới</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-accent" aria-label="Đóng">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div role="alert" className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl text-[13px] text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label htmlFor="r-name" className="block text-[12px] text-muted-foreground mb-1.5">Họ và tên *</label>
                  <input id="r-name" type="text" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                </div>
                <div>
                  <label htmlFor="r-id" className="block text-[12px] text-muted-foreground mb-1.5">Số CCCD/CMND *</label>
                  <input id="r-id" type="text" value={formData.idNumber} onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                </div>
                <div>
                  <label htmlFor="r-phone" className="block text-[12px] text-muted-foreground mb-1.5">Số điện thoại</label>
                  <input id="r-phone" type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                </div>
                <div className="col-span-2">
                  <label htmlFor="r-org" className="block text-[12px] text-muted-foreground mb-1.5">Đơn vị / Tổ chức *</label>
                  <input id="r-org" type="text" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                </div>
                <div>
                  <label htmlFor="r-type" className="block text-[12px] text-muted-foreground mb-1.5">Phân loại</label>
                  <select id="r-type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as VisitorType })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                    {VISITOR_TYPES.map((t) => <option key={t} value={t}>{visitorTypeLabels[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="r-plate" className="block text-[12px] text-muted-foreground mb-1.5">Biển số xe</label>
                  <input id="r-plate" type="text" placeholder="VD: 51G-12345" value={formData.vehiclePlate} onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                </div>
                <div className="col-span-2">
                  <label htmlFor="r-purpose" className="block text-[12px] text-muted-foreground mb-1.5">Mục đích vào *</label>
                  <input id="r-purpose" type="text" value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                </div>
                <div>
                  <label htmlFor="r-host" className="block text-[12px] text-muted-foreground mb-1.5">Người tiếp đón *</label>
                  <input id="r-host" type="text" value={formData.hostName} onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                </div>
                <div>
                  <label htmlFor="r-unit" className="block text-[12px] text-muted-foreground mb-1.5">Đơn vị tiếp đón *</label>
                  <input id="r-unit" type="text" value={formData.hostUnit} onChange={(e) => setFormData({ ...formData, hostUnit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
                </div>
                <div className="col-span-2">
                  <label htmlFor="r-note" className="block text-[12px] text-muted-foreground mb-1.5">Ghi chú</label>
                  <textarea id="r-note" rows={2} value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none resize-none" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-[13px] text-muted-foreground hover:bg-accent transition-colors">Hủy</button>
              <button onClick={handleSave} className="px-5 py-2 bg-primary text-white rounded-xl text-[13px] hover:opacity-90 transition-all flex items-center gap-2" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <Check className="w-3.5 h-3.5" /> Đăng ký
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewVisitor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewVisitor(null)}>
          <div ref={viewRef} role="dialog" aria-modal="true" aria-labelledby="view-modal-title"
            className="bg-card rounded-2xl border border-border w-full max-w-md" style={{ boxShadow: 'var(--shadow-xl)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 id="view-modal-title" style={{ fontFamily: 'var(--font-display)' }}>Chi tiết đăng ký</h3>
              <button onClick={() => setViewVisitor(null)} className="p-1.5 rounded-lg hover:bg-accent" aria-label="Đóng">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { label: 'Họ tên', value: viewVisitor.fullName },
                { label: 'CCCD/CMND', value: viewVisitor.idNumber },
                { label: 'Đơn vị', value: viewVisitor.organization },
                { label: 'Điện thoại', value: viewVisitor.phone },
                { label: 'Mục đích', value: viewVisitor.purpose },
                { label: 'Người tiếp', value: `${viewVisitor.hostName} — ${viewVisitor.hostUnit}` },
                { label: 'Biển số xe', value: viewVisitor.vehiclePlate || 'Không có' },
                { label: 'Check-in', value: viewVisitor.checkIn ? formatDate(viewVisitor.checkIn) + ' ' + formatTime(viewVisitor.checkIn) : '—' },
                { label: 'Check-out', value: viewVisitor.checkOut ? formatDate(viewVisitor.checkOut) + ' ' + formatTime(viewVisitor.checkOut) : '—' },
                { label: 'Duyệt bởi', value: viewVisitor.approvedBy },
              ].map((row) => (
                <div key={row.label} className="flex items-start gap-3">
                  <span className="text-[12px] text-muted-foreground w-28 shrink-0">{row.label}:</span>
                  <span className="text-[13px] text-foreground flex-1">{row.value}</span>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <span className="text-[12px] text-muted-foreground w-28 shrink-0">Trạng thái:</span>
                <VisitorStatusBadge status={viewVisitor.status} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk checkout confirm */}
      <ConfirmDialog
        isOpen={bulkConfirm}
        title="Checkout hàng loạt?"
        message={`Xác nhận checkout ${selected.size} đối tác đang trong khu vực?`}
        confirmLabel="Xác nhận checkout"
        variant="warning"
        onConfirm={handleBulkCheckOut}
        onCancel={() => setBulkConfirm(false)}
      />
    </PageTransition>
  );
}
