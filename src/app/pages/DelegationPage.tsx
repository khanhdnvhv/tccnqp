import { useState, useMemo, useCallback } from 'react';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { toast } from 'sonner';
import {
  Users, Search, Plus, Eye, X, Calendar, Clock, MapPin,
  FileText, AlertTriangle, CheckCircle2, ChevronRight,
  Download, UserCheck, Gift, Shield, Building2, Flag,
  Check, AlertCircle, Trash2, ScanLine, FileCode,
  FileImage, FileSpreadsheet, ChevronDown, Tag,
} from 'lucide-react';
import {
  delegations as initialDelegations,
  delegationStatusLabels,
  delegationStatusColors,
  priorityLabels,
  priorityColors,
  getDelegationStats,
  type Delegation,
  type DelegationStatus,
  type DelegationPriority,
  type DelegationMember,
  type DelegationGift,
} from '../data/delegationData';
import { partners } from '../data/partnerData';
import {
  archiveDocuments,
  docCategoryLabels,
  docCategoryColors,
  type ArchiveDocument,
} from '../data/archiveData';

type FilterTab = 'all' | DelegationStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'draft', label: 'Nháp' },
  { key: 'pending_approval', label: 'Chờ duyệt' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'in_progress', label: 'Đang làm việc' },
  { key: 'completed', label: 'Hoàn thành' },
];

function StatusBadge({ status }: { status: DelegationStatus }) {
  const c = delegationStatusColors[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
      {delegationStatusLabels[status]}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: Delegation['priority'] }) {
  const c = priorityColors[priority];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] ${c.bg} ${c.text}`}>
      {priority === 'directive' && <Shield className="w-3 h-3 mr-1" />}
      {priorityLabels[priority]}
    </span>
  );
}

// ---- Document preview expandable ----
function DocPreview({ doc, icon, cc }: { doc: ArchiveDocument; icon: React.ReactNode; cc: { bg: string; text: string; icon: string } }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <div onClick={() => setExpanded(!expanded)} className="flex items-center gap-2.5 p-3 cursor-pointer hover:bg-accent/30 transition-colors">
        {icon}
        <div className="flex-1 min-w-0">
          <p className="text-[12px] text-foreground truncate" style={{ fontWeight: 500 }}>{doc.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${cc.bg} ${cc.text}`}>{cc.icon} {docCategoryLabels[doc.category]}</span>
            <span className="text-[10px] text-muted-foreground">{doc.number}</span>
            <span className="text-[10px] text-muted-foreground">{new Date(doc.date).toLocaleDateString('vi-VN')}</span>
            <span className="text-[10px] text-muted-foreground">{doc.size}</span>
          </div>
        </div>
        {doc.ocrStatus === 'done' && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 flex items-center gap-0.5 shrink-0"><ScanLine className="w-2.5 h-2.5" /> OCR</span>}
        {doc.classification === 'mat' && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-bold shrink-0">MẬT</span>}
        {doc.classification === 'bi-mat' && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold shrink-0">BÍ MẬT</span>}
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/40 transition-transform shrink-0 ${expanded ? 'rotate-180' : ''}`} />
      </div>
      {expanded && (
        <div className="px-3 pb-3 border-t border-border/50 space-y-2.5">
          {/* Meta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2.5">
            {[
              { label: 'Từ', value: doc.sender },
              { label: 'Đến', value: doc.receiver },
              { label: 'Số trang', value: doc.pages ? `${doc.pages} trang` : 'N/A' },
              { label: 'Định dạng', value: doc.fileType.toUpperCase() },
            ].map((r) => (
              <div key={r.label} className="bg-muted/30 rounded-lg p-2">
                <p className="text-[9px] text-muted-foreground uppercase">{r.label}</p>
                <p className="text-[11px] text-foreground truncate" style={{ fontWeight: 500 }}>{r.value}</p>
              </div>
            ))}
          </div>
          {/* OCR content */}
          {doc.ocrContent ? (
            <div>
              <p className="text-[11px] text-foreground mb-1 flex items-center gap-1" style={{ fontWeight: 600 }}>
                <ScanLine className="w-3 h-3 text-violet-500" /> Nội dung văn bản {doc.isScanned ? '(OCR từ bản scan)' : '(Toàn văn)'}
              </p>
              <div className="bg-muted/20 border border-border rounded-lg p-3 text-[12px] text-foreground/80 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                {doc.ocrContent}
              </div>
            </div>
          ) : (
            <div className="bg-muted/20 border border-dashed border-border rounded-lg p-4 text-center">
              <p className="text-[12px] text-muted-foreground">Chưa có nội dung OCR — cần quét tại Kho số hóa</p>
            </div>
          )}
          {/* Tags */}
          {doc.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {doc.tags.map((tag) => <span key={tag} className="text-[10px] bg-muted/50 px-2 py-0.5 rounded-full border border-border text-muted-foreground">{tag}</span>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Empty form state ----
interface CreateForm {
  title: string;
  partnerId: string;
  purpose: string;
  scheduledDate: string;
  scheduledEndDate: string;
  priority: DelegationPriority;
  hostName: string;
  hostUnit: string;
  meetingRoom: string;
  note: string;
  members: { fullName: string; position: string; idNumber: string; organization: string; isLeader: boolean }[];
}

const EMPTY_FORM: CreateForm = {
  title: '', partnerId: '', purpose: '',
  scheduledDate: '', scheduledEndDate: '', priority: 'normal',
  hostName: '', hostUnit: '', meetingRoom: '', note: '',
  members: [{ fullName: '', position: '', idNumber: '', organization: '', isLeader: true }],
};

// ---- CSV export for Word compatibility ----
function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const BOM = '\uFEFF';
  const csv = BOM + [headers.join(','), ...rows.map((r) => r.map((c) => `"${(c ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export function DelegationPage() {
  const [list, setList] = useState<Delegation[]>(initialDelegations);
  const [tab, setTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [viewDelegation, setViewDelegation] = useState<Delegation | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const viewRef = useFocusTrap<HTMLDivElement>(!!viewDelegation);
  const createRef = useFocusTrap<HTMLDivElement>(showCreate);

  const stats = useMemo(() => {
    const total = list.length;
    const pending = list.filter((d) => d.status === 'pending_approval').length;
    const approved = list.filter((d) => d.status === 'approved').length;
    const missingDoc = list.filter(
      (d) => d.approvalDocStatus === 'none' && d.priority !== 'directive' && !['completed', 'cancelled'].includes(d.status)
    ).length;
    const upcomingNoDocs = list.filter((d) => {
      if (d.priority === 'directive') return false;
      if (['completed', 'cancelled'].includes(d.status)) return false;
      if (d.approvalDocStatus === 'received') return false;
      const diff = Math.ceil((new Date(d.scheduledDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 3;
    });
    return { total, pending, approved, missingDoc, upcomingNoDocs };
  }, [list]);

  const filtered = useMemo(() => {
    let data = list;
    if (tab !== 'all') data = data.filter((d) => d.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((d) =>
        d.title.toLowerCase().includes(q) ||
        d.partnerName.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.hostName.toLowerCase().includes(q)
      );
    }
    return data;
  }, [list, tab, search]);

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const daysUntil = (date: string) => Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  // ---- Create handler ----
  const handleCreate = () => {
    if (!form.title.trim()) { setFormError('Vui lòng nhập tiêu đề đoàn'); return; }
    if (!form.partnerId) { setFormError('Vui lòng chọn đối tác'); return; }
    if (!form.scheduledDate) { setFormError('Vui lòng chọn ngày dự kiến'); return; }
    if (!form.hostName.trim()) { setFormError('Vui lòng nhập người tiếp đón'); return; }
    if (form.members.length === 0 || !form.members[0].fullName.trim()) { setFormError('Cần ít nhất 1 thành viên'); return; }

    const partner = partners.find((p) => p.id === form.partnerId);
    const newDel: Delegation = {
      id: 'del-' + Date.now(),
      code: `DV-${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(list.length + 1).padStart(3, '0')}`,
      title: form.title,
      partnerId: form.partnerId,
      partnerName: partner?.shortName || form.partnerId,
      purpose: form.purpose,
      scheduledDate: form.scheduledDate,
      scheduledEndDate: form.scheduledEndDate || form.scheduledDate,
      status: 'draft',
      priority: form.priority,
      approvalDocStatus: 'none',
      hostName: form.hostName,
      hostUnit: form.hostUnit,
      meetingRoom: form.meetingRoom || undefined,
      members: form.members.filter((m) => m.fullName.trim()).map((m, i) => ({
        id: `m-new-${i}`,
        ...m,
      })),
      gifts: [],
      note: form.note || undefined,
      createdBy: 'Cán bộ QHQT',
      createdAt: new Date().toISOString(),
    };

    setList((prev) => [newDel, ...prev]);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowCreate(false);
    toast.success('Đã tạo đoàn mới thành công!');
  };

  // ---- Status change ----
  const changeStatus = (id: string, newStatus: DelegationStatus) => {
    setList((prev) => prev.map((d) => d.id === id ? { ...d, status: newStatus } : d));
    setViewDelegation(null);
    toast.success(`Đã chuyển trạng thái sang "${delegationStatusLabels[newStatus]}"`);
  };

  // ---- Delete ----
  const handleDelete = () => {
    if (!deleteConfirm) return;
    setList((prev) => prev.filter((d) => d.id !== deleteConfirm));
    setDeleteConfirm(null);
    setViewDelegation(null);
    toast.success('Đã xóa đoàn');
  };

  // ---- Export ----
  const handleExport = useCallback(() => {
    const headers = ['Mã', 'Tiêu đề', 'Đối tác', 'Ngày dự kiến', 'Kết thúc', 'Trạng thái', 'Ưu tiên', 'Người tiếp', 'Đơn vị', 'Phòng họp', 'SL người', 'Danh sách', 'VB đồng ý', 'Ghi chú'];
    const rows = filtered.map((d) => [
      d.code, d.title, d.partnerName, d.scheduledDate, d.scheduledEndDate,
      delegationStatusLabels[d.status], priorityLabels[d.priority],
      d.hostName, d.hostUnit, d.meetingRoom || '',
      String(d.members.length),
      d.members.map((m) => `${m.fullName} (${m.position})`).join('; '),
      d.approvalDocNumber || (d.priority === 'directive' ? 'TT chỉ đạo' : 'Chưa có'),
      d.note || '',
    ]);
    downloadCSV(`Doan_vao_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    toast.success(`Đã xuất ${filtered.length} đoàn dạng CSV/Excel`);
  }, [filtered]);

  // ---- Add/remove member in form ----
  const addMember = () => setForm((f) => ({ ...f, members: [...f.members, { fullName: '', position: '', idNumber: '', organization: '', isLeader: false }] }));
  const removeMember = (idx: number) => setForm((f) => ({ ...f, members: f.members.filter((_, i) => i !== idx) }));
  const updateMember = (idx: number, key: string, val: string | boolean) => {
    setForm((f) => ({ ...f, members: f.members.map((m, i) => i === idx ? { ...m, [key]: val } : key === 'isLeader' && val === true ? { ...m, isLeader: false } : m) }));
  };

  // ---- Auto-fill from partner ----
  const handlePartnerChange = (partnerId: string) => {
    const p = partners.find((x) => x.id === partnerId);
    setForm((f) => ({
      ...f,
      partnerId,
      title: p ? `Đoàn ${p.shortName} - ` : f.title,
      members: f.members.length === 1 && !f.members[0].fullName
        ? [{ fullName: p?.contactPerson || '', position: p?.contactPosition || '', idNumber: '', organization: p?.name || '', isLeader: true }]
        : f.members,
    }));
  };

  return (
    <PageTransition>
      <Header title="Quản lý Đoàn vào" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Users, label: 'Tổng đoàn', value: stats.total, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
            { icon: Clock, label: 'Chờ duyệt', value: stats.pending, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { icon: CheckCircle2, label: 'Đã duyệt', value: stats.approved, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { icon: AlertTriangle, label: 'Thiếu VB đồng ý', value: stats.missingDoc, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card" style={{ boxShadow: 'var(--shadow-xs)' }}>
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

        {/* Alerts */}
        {stats.upcomingNoDocs.length > 0 && (
          <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center gap-2 text-red-700 dark:text-red-400 text-[13px] mb-1" style={{ fontWeight: 600 }}>
              <AlertTriangle className="w-4 h-4" /> Cảnh báo: Đoàn sắp vào chưa có Văn bản đồng ý
            </div>
            {stats.upcomingNoDocs.map((d) => (
              <p key={d.id} className="text-[12px] text-red-600 dark:text-red-400 ml-6">
                {d.code} — {d.partnerName} — Ngày: {formatDate(d.scheduledDate)} (còn {daysUntil(d.scheduledDate)} ngày)
              </p>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-card rounded-xl border border-border" style={{ boxShadow: 'var(--shadow-xs)' }}>
          <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-border overflow-x-auto">
            {TABS.map((t) => {
              const cnt = t.key === 'all' ? list.length : list.filter((d) => d.status === t.key).length;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[12px] whitespace-nowrap border-b-2 transition-colors ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                  {t.label}
                  {cnt > 0 && <span className={`min-w-[18px] h-[18px] px-1 text-[10px] rounded-full flex items-center justify-center ${tab === t.key ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>{cnt}</span>}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
              <input type="text" placeholder="Tìm đoàn, đối tác, mã..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 outline-none transition-all" />
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] text-muted-foreground hover:bg-accent border border-border transition-colors">
                <Download className="w-3.5 h-3.5" /> Xuất Excel
              </button>
              <button onClick={() => { setForm(EMPTY_FORM); setFormError(''); setShowCreate(true); }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] text-white bg-primary hover:opacity-90 transition-all active:scale-[0.98]" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <Plus className="w-3.5 h-3.5" /> Tạo đoàn mới
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="space-y-3">
          {filtered.map((delegation) => {
            const days = daysUntil(delegation.scheduledDate);
            const isUrgent = days >= 0 && days <= 3 && delegation.approvalDocStatus !== 'received' && delegation.priority !== 'directive';
            return (
              <div key={delegation.id} onClick={() => setViewDelegation(delegation)}
                className={`bg-card rounded-xl border p-4 cursor-pointer hover:border-primary/30 transition-all ${isUrgent ? 'border-red-300 dark:border-red-800' : 'border-border'}`} style={{ boxShadow: 'var(--shadow-xs)' }}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[11px] text-muted-foreground">{delegation.code}</span>
                      <StatusBadge status={delegation.status} />
                      <PriorityBadge priority={delegation.priority} />
                      {delegation.approvalDocStatus === 'received' && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"><FileText className="w-3 h-3" /> Có VB</span>}
                      {isUrgent && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 animate-pulse"><AlertTriangle className="w-3 h-3" /> Thiếu VB — còn {days} ngày</span>}
                    </div>
                    <h3 className="text-[14px] text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{delegation.title}</h3>
                    <p className="text-[12px] text-muted-foreground mt-0.5">{delegation.purpose}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/40 mt-1 shrink-0" />
                </div>
                <div className="flex items-center gap-4 mt-3 text-[12px] text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {delegation.partnerName}</span>
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(delegation.scheduledDate)}{delegation.scheduledEndDate !== delegation.scheduledDate && ` → ${formatDate(delegation.scheduledEndDate)}`}</span>
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {delegation.members.length} người</span>
                  <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> {delegation.hostName}</span>
                  {delegation.meetingRoom && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {delegation.meetingRoom}</span>}
                  {delegation.gifts.length > 0 && <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><Gift className="w-3 h-3" /> {delegation.gifts.length} quà</span>}
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div className="text-center py-12 text-muted-foreground"><Users className="w-8 h-8 mx-auto mb-2 opacity-20" /><p className="text-[13px]">Không có đoàn nào phù hợp</p></div>}
        </div>
      </div>

      {/* ========== CREATE MODAL ========== */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreate(false)}>
          <div ref={createRef} role="dialog" aria-modal="true"
            className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: 'var(--shadow-xl)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><Plus className="w-4 h-4 text-primary" /></div><h3 style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>Tạo đoàn mới</h3></div>
              <button onClick={() => setShowCreate(false)} className="p-1.5 rounded-lg hover:bg-accent"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && <div role="alert" className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl text-[13px] text-red-600 dark:text-red-400"><AlertCircle className="w-4 h-4 shrink-0" /> {formError}</div>}

              <div className="grid grid-cols-2 gap-4">
                {/* Partner select with auto-fill */}
                <div className="col-span-2">
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Đối tác *</label>
                  <select value={form.partnerId} onChange={(e) => handlePartnerChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                    <option value="">— Chọn đối tác —</option>
                    {partners.map((p) => <option key={p.id} value={p.id}>{p.shortName} — {p.name}</option>)}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Tiêu đề đoàn *</label>
                  <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="VD: Đoàn Viettel - Nghiệm thu dự án..."
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>

                <div className="col-span-2">
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Mục đích</label>
                  <input type="text" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>

                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Ngày bắt đầu *</label>
                  <input type="date" value={form.scheduledDate} onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Ngày kết thúc</label>
                  <input type="date" value={form.scheduledEndDate} onChange={(e) => setForm({ ...form, scheduledEndDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>

                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Mức ưu tiên</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as DelegationPriority })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                    <option value="normal">Bình thường</option>
                    <option value="high">Ưu tiên</option>
                    <option value="directive">Thủ trưởng chỉ đạo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Phòng họp</label>
                  <input type="text" value={form.meetingRoom} onChange={(e) => setForm({ ...form, meetingRoom: e.target.value })} placeholder="VD: Phòng họp A1"
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>

                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Người tiếp đón *</label>
                  <input type="text" value={form.hostName} onChange={(e) => setForm({ ...form, hostName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Đơn vị tiếp đón</label>
                  <input type="text" value={form.hostUnit} onChange={(e) => setForm({ ...form, hostUnit: e.target.value })} placeholder="VD: Phòng QHQT"
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>

                <div className="col-span-2">
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Ghi chú</label>
                  <textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none resize-none" />
                </div>
              </div>

              {/* Members */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[13px] text-foreground" style={{ fontWeight: 600 }}>Danh sách nhân sự ({form.members.length})</p>
                  <button onClick={addMember} className="text-[12px] text-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Thêm</button>
                </div>
                <div className="space-y-2">
                  {form.members.map((m, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center bg-surface-2 rounded-lg p-2">
                      <input type="text" placeholder="Họ tên *" value={m.fullName} onChange={(e) => updateMember(i, 'fullName', e.target.value)}
                        className="col-span-3 px-2 py-1.5 bg-input-background rounded-lg text-[12px] border border-transparent focus:border-primary/30 outline-none" />
                      <input type="text" placeholder="Chức vụ" value={m.position} onChange={(e) => updateMember(i, 'position', e.target.value)}
                        className="col-span-3 px-2 py-1.5 bg-input-background rounded-lg text-[12px] border border-transparent focus:border-primary/30 outline-none" />
                      <input type="text" placeholder="Số HC/CCCD" value={m.idNumber} onChange={(e) => updateMember(i, 'idNumber', e.target.value)}
                        className="col-span-2 px-2 py-1.5 bg-input-background rounded-lg text-[12px] border border-transparent focus:border-primary/30 outline-none" />
                      <input type="text" placeholder="Đơn vị" value={m.organization} onChange={(e) => updateMember(i, 'organization', e.target.value)}
                        className="col-span-2 px-2 py-1.5 bg-input-background rounded-lg text-[12px] border border-transparent focus:border-primary/30 outline-none" />
                      <div className="col-span-2 flex items-center gap-1">
                        <button onClick={() => updateMember(i, 'isLeader', true)} title="Trưởng đoàn"
                          className={`p-1 rounded ${m.isLeader ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground'}`}>
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                        {form.members.length > 1 && (
                          <button onClick={() => removeMember(i)} className="p-1 rounded text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl text-[13px] text-muted-foreground hover:bg-accent">Hủy</button>
              <button onClick={handleCreate} className="px-5 py-2 bg-primary text-white rounded-xl text-[13px] hover:opacity-90 flex items-center gap-2" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <Check className="w-3.5 h-3.5" /> Tạo đoàn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========== DETAIL MODAL ========== */}
      {viewDelegation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewDelegation(null)}>
          <div ref={viewRef} role="dialog" aria-modal="true"
            className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ boxShadow: 'var(--shadow-xl)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card z-10">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] text-muted-foreground">{viewDelegation.code}</span>
                  <StatusBadge status={viewDelegation.status} />
                  <PriorityBadge priority={viewDelegation.priority} />
                </div>
                <h3 className="text-[15px] text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{viewDelegation.title}</h3>
              </div>
              <button onClick={() => setViewDelegation(null)} className="p-2 rounded-lg hover:bg-accent"><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Đối tác', value: viewDelegation.partnerName, icon: Building2 },
                  { label: 'Mục đích', value: viewDelegation.purpose, icon: FileText },
                  { label: 'Ngày dự kiến', value: `${formatDate(viewDelegation.scheduledDate)}${viewDelegation.scheduledEndDate !== viewDelegation.scheduledDate ? ` → ${formatDate(viewDelegation.scheduledEndDate)}` : ''}`, icon: Calendar },
                  { label: 'Người tiếp', value: `${viewDelegation.hostName} — ${viewDelegation.hostUnit}`, icon: UserCheck },
                  { label: 'Phòng họp', value: viewDelegation.meetingRoom || '—', icon: MapPin },
                  { label: 'Số VB đồng ý', value: viewDelegation.approvalDocNumber || (viewDelegation.priority === 'directive' ? 'Miễn (TT chỉ đạo)' : 'Chưa có'), icon: FileText },
                ].map((row) => (
                  <div key={row.label} className="flex items-start gap-2">
                    <row.icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <div><p className="text-[10px] text-muted-foreground">{row.label}</p><p className="text-[13px] text-foreground">{row.value}</p></div>
                  </div>
                ))}
              </div>

              {/* Công văn & Tài liệu từ Kho số hóa */}
              {(() => {
                const relDocs = archiveDocuments.filter((doc) => {
                  const partnerName = viewDelegation.partnerName.toLowerCase();
                  const matchPartner = doc.relatedPartner?.toLowerCase().includes(partnerName);
                  const matchCode = doc.title.toLowerCase().includes(viewDelegation.code.toLowerCase());
                  const matchKeyword = [viewDelegation.partnerName, viewDelegation.title].some((kw) =>
                    doc.title.toLowerCase().includes(kw.toLowerCase()) || doc.ocrContent?.toLowerCase().includes(kw.toLowerCase())
                  );
                  return matchPartner || matchCode || matchKeyword;
                });
                return (
                  <div>
                    <p className="text-[13px] text-foreground mb-2 flex items-center gap-1.5" style={{ fontWeight: 600 }}>
                      <ScanLine className="w-4 h-4 text-violet-600" /> Công văn & Tài liệu ({relDocs.length})
                      {relDocs.length === 0 && <span className="text-[11px] text-muted-foreground font-normal ml-1">— Chưa có trong Kho số hóa</span>}
                    </p>
                    {relDocs.length > 0 ? (
                      <div className="space-y-1.5">
                        {relDocs.map((doc) => {
                          const cc = docCategoryColors[doc.category];
                          const ftIcon = doc.fileType === 'pdf' ? <FileText className="w-4 h-4 text-red-500" /> : doc.fileType === 'docx' ? <FileCode className="w-4 h-4 text-blue-500" /> : doc.fileType === 'xlsx' ? <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> : doc.fileType === 'jpg' || doc.fileType === 'png' ? <FileImage className="w-4 h-4 text-amber-500" /> : <FileText className="w-4 h-4 text-muted-foreground" />;
                          return (
                            <DocPreview key={doc.id} doc={doc} icon={ftIcon} cc={cc} />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3 border border-dashed border-border rounded-xl text-center">
                        <ScanLine className="w-6 h-6 mx-auto mb-1 text-muted-foreground/30" />
                        <p className="text-[12px] text-muted-foreground">Chưa có công văn / biên bản nào được số hóa cho đoàn này</p>
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5">Tải lên tại Kho số hóa (OCR) để liên kết tự động</p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Members table */}
              <div>
                <p className="text-[13px] text-foreground mb-2 flex items-center gap-1.5" style={{ fontWeight: 600 }}><Users className="w-4 h-4" /> Nhân sự ({viewDelegation.members.length})</p>
                <div className="bg-surface-2 rounded-xl overflow-hidden">
                  <table className="w-full text-[12px]">
                    <thead><tr className="border-b border-border text-left">
                      <th className="px-3 py-2 text-[10px] text-muted-foreground uppercase">STT</th>
                      <th className="px-3 py-2 text-[10px] text-muted-foreground uppercase">Họ tên</th>
                      <th className="px-3 py-2 text-[10px] text-muted-foreground uppercase">Chức vụ</th>
                      <th className="px-3 py-2 text-[10px] text-muted-foreground uppercase">Số CCCD/HC</th>
                      <th className="px-3 py-2 text-[10px] text-muted-foreground uppercase">Đơn vị</th>
                    </tr></thead>
                    <tbody>{viewDelegation.members.map((m, idx) => (
                      <tr key={m.id} className="border-b border-border/50">
                        <td className="px-3 py-2 text-muted-foreground">{idx + 1}</td>
                        <td className="px-3 py-2 text-foreground">{m.fullName}{m.isLeader && <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] bg-primary/10 text-primary"><Flag className="w-2.5 h-2.5 mr-0.5" /> Trưởng đoàn</span>}</td>
                        <td className="px-3 py-2 text-muted-foreground">{m.position}</td>
                        <td className="px-3 py-2 text-muted-foreground">{m.idNumber}</td>
                        <td className="px-3 py-2 text-muted-foreground">{m.organization}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>

              {/* Gifts */}
              {viewDelegation.gifts.length > 0 && (
                <div>
                  <p className="text-[13px] text-foreground mb-2 flex items-center gap-1.5" style={{ fontWeight: 600 }}><Gift className="w-4 h-4 text-amber-600" /> Quà tặng ({viewDelegation.gifts.length})</p>
                  <div className="space-y-2">{viewDelegation.gifts.map((g) => (
                    <div key={g.id} className="flex items-center gap-3 p-3 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-900/30 rounded-lg">
                      <Gift className="w-4 h-4 text-amber-600 shrink-0" />
                      <div className="flex-1 min-w-0"><p className="text-[13px] text-foreground">{g.description}</p>{g.note && <p className="text-[11px] text-muted-foreground">{g.note}</p>}</div>
                      <span className="text-[11px] text-muted-foreground shrink-0">x{g.quantity}</span>
                      {g.estimatedValue && <span className="text-[11px] text-amber-600 shrink-0">~{g.estimatedValue} tr</span>}
                      <span className={`text-[10px] px-2 py-0.5 rounded-md ${g.fromPartner ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>{g.fromPartner ? 'Từ đối tác' : 'Tặng đối tác'}</span>
                    </div>
                  ))}</div>
                </div>
              )}

              {viewDelegation.result && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl">
                  <p className="text-[12px] text-emerald-700 dark:text-emerald-400 flex items-start gap-1.5"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /><span><strong>Kết quả:</strong> {viewDelegation.result}</span></p>
                </div>
              )}
              {viewDelegation.note && (
                <div className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl">
                  <p className="text-[12px] text-amber-700 dark:text-amber-400 flex items-start gap-1.5"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /><span>{viewDelegation.note}</span></p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-border flex items-center justify-between flex-wrap gap-2">
                <div className="text-[11px] text-muted-foreground">
                  Tạo bởi: {viewDelegation.createdBy} — {formatDate(viewDelegation.createdAt)}
                </div>
                <div className="flex items-center gap-2">
                  {viewDelegation.status === 'draft' && (
                    <button onClick={() => changeStatus(viewDelegation.id, 'pending_approval')} className="px-3 py-1.5 rounded-lg text-[12px] bg-amber-500 text-white hover:opacity-90 flex items-center gap-1"><Clock className="w-3 h-3" /> Gửi duyệt</button>
                  )}
                  {viewDelegation.status === 'pending_approval' && (
                    <button onClick={() => changeStatus(viewDelegation.id, 'approved')} className="px-3 py-1.5 rounded-lg text-[12px] bg-emerald-500 text-white hover:opacity-90 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Phê duyệt</button>
                  )}
                  {viewDelegation.status === 'approved' && (
                    <button onClick={() => changeStatus(viewDelegation.id, 'in_progress')} className="px-3 py-1.5 rounded-lg text-[12px] bg-blue-500 text-white hover:opacity-90 flex items-center gap-1"><Users className="w-3 h-3" /> Đoàn đã vào</button>
                  )}
                  {viewDelegation.status === 'in_progress' && (
                    <button onClick={() => changeStatus(viewDelegation.id, 'completed')} className="px-3 py-1.5 rounded-lg text-[12px] bg-gray-500 text-white hover:opacity-90 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Hoàn thành</button>
                  )}
                  <button onClick={() => { setDeleteConfirm(viewDelegation.id); }} className="px-3 py-1.5 rounded-lg text-[12px] text-red-500 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog isOpen={!!deleteConfirm} title="Xóa đoàn?" message="Bạn có chắc chắn muốn xóa đoàn này? Thao tác không thể hoàn tác."
        confirmLabel="Xóa" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteConfirm(null)} />
    </PageTransition>
  );
}
