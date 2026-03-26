import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { toast } from 'sonner';
import {
  CalendarClock, Plus, X, Check, AlertCircle, Search, Clock,
  CheckCircle2, XCircle, Car, Users, Eye, Filter,
} from 'lucide-react';
import {
  appointments as initialApts, type Appointment, type AppointmentStatus,
  appointmentStatusLabels, appointmentStatusColors,
} from '../data/visitorData';
import { useAuth } from '../context/AuthContext';

type FilterTab = 'all' | AppointmentStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'approved', label: 'Đã duyệt' },
  { key: 'rejected', label: 'Từ chối' },
  { key: 'completed', label: 'Hoàn thành' },
  { key: 'cancelled', label: 'Đã hủy' },
];

interface FormData {
  visitorName: string; visitorOrg: string; visitorIdNumber: string; visitorPhone: string;
  purpose: string; hostName: string; hostUnit: string;
  scheduledDate: string; scheduledTime: string; duration: string;
  vehicleRequired: boolean; vehiclePlate: string; note: string;
}

const EMPTY_FORM: FormData = {
  visitorName: '', visitorOrg: '', visitorIdNumber: '', visitorPhone: '',
  purpose: '', hostName: '', hostUnit: '',
  scheduledDate: '2026-03-27', scheduledTime: '09:00', duration: '60',
  vehicleRequired: false, vehiclePlate: '', note: '',
};

function AptStatusBadge({ status }: { status: AppointmentStatus }) {
  const c = appointmentStatusColors[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
      {appointmentStatusLabels[status]}
    </span>
  );
}

export function AppointmentPage() {
  const { hasPermission } = useAuth();
  const canApprove = hasPermission('doc.incoming.view');
  const [apts, setApts] = useState<Appointment[]>(initialApts);
  const [tab, setTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [viewApt, setViewApt] = useState<Appointment | null>(null);
  const [rejectConfirm, setRejectConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const modalRef = useFocusTrap<HTMLDivElement>(showModal);
  const viewRef = useFocusTrap<HTMLDivElement>(!!viewApt);

  const filtered = useMemo(() => {
    let data = apts;
    if (tab !== 'all') data = data.filter((a) => a.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((a) =>
        a.visitorName.toLowerCase().includes(q) ||
        a.visitorOrg.toLowerCase().includes(q) ||
        a.hostName.toLowerCase().includes(q) ||
        a.purpose.toLowerCase().includes(q)
      );
    }
    return data;
  }, [apts, tab, search]);

  const handleApprove = (id: string) => {
    setApts((prev) => prev.map((a) => a.id === id ? { ...a, status: 'approved', approvedBy: 'Cán bộ trực ban' } : a));
    setViewApt(null);
    toast.success('Đã duyệt lịch hẹn!');
  };

  const handleReject = (id: string) => {
    setApts((prev) => prev.map((a) => a.id === id ? { ...a, status: 'rejected' } : a));
    setRejectConfirm(null);
    setViewApt(null);
    toast.success('Đã từ chối lịch hẹn.');
  };

  const handleSave = () => {
    if (!formData.visitorName.trim()) { setFormError('Vui lòng nhập họ tên đối tác'); return; }
    if (!formData.visitorOrg.trim()) { setFormError('Vui lòng nhập đơn vị'); return; }
    if (!formData.purpose.trim()) { setFormError('Vui lòng nhập mục đích'); return; }
    if (!formData.hostName.trim()) { setFormError('Vui lòng nhập người tiếp đón'); return; }
    const newApt: Appointment = {
      id: 'apt-' + Date.now(), ...formData,
      duration: parseInt(formData.duration) || 60,
      status: 'pending', createdAt: new Date().toISOString(),
    };
    setApts((prev) => [newApt, ...prev]);
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowModal(false);
    toast.success('Đã tạo lịch hẹn. Chờ phê duyệt!');
  };

  const counts = useMemo(() => ({
    pending: apts.filter((a) => a.status === 'pending').length,
    approved: apts.filter((a) => a.status === 'approved').length,
    today: apts.filter((a) => a.scheduledDate === '2026-03-26').length,
  }), [apts]);

  return (
    <PageTransition>
      <Header title="Lịch hẹn vào làm việc" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: AlertCircle, label: 'Chờ duyệt', value: counts.pending, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { icon: CheckCircle2, label: 'Đã duyệt', value: counts.approved, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { icon: CalendarClock, label: 'Hôm nay', value: counts.today, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
              </div>
              <div>
                <p className="text-[20px] text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="bg-card rounded-xl border border-border" style={{ boxShadow: 'var(--shadow-xs)' }}>
          <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-border overflow-x-auto">
            {TABS.map((t) => {
              const cnt = t.key === 'all' ? apts.length : apts.filter((a) => a.status === t.key).length;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[12px] whitespace-nowrap border-b-2 transition-colors ${
                    tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
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
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
              <input type="text" placeholder="Tìm tên, đơn vị, mục đích..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 outline-none" />
            </div>
            <button onClick={() => { setFormData(EMPTY_FORM); setFormError(''); setShowModal(true); }}
              className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] text-white bg-primary hover:opacity-90 transition-all"
              style={{ boxShadow: 'var(--shadow-sm)' }}>
              <Plus className="w-3.5 h-3.5" /> Tạo lịch hẹn
            </button>
          </div>
        </div>

        {/* Appointments list */}
        <div className="space-y-3">
          {filtered.map((apt) => (
            <div key={apt.id} className="bg-card rounded-xl border border-border p-5 hover:shadow-md transition-all" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <div className="flex items-start gap-4">
                {/* Date block */}
                <div className="shrink-0 w-14 h-14 rounded-xl bg-primary/10 border border-primary/15 flex flex-col items-center justify-center">
                  <span className="text-[18px] text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                    {apt.scheduledDate.split('-')[2]}
                  </span>
                  <span className="text-[10px] text-primary/70">
                    T{new Date(apt.scheduledDate).getDay() || 7}/{apt.scheduledDate.split('-')[1]}
                  </span>
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <p className="text-[14px] text-foreground" style={{ fontFamily: 'var(--font-display)' }}>{apt.visitorName}</p>
                      <p className="text-[12px] text-muted-foreground">{apt.visitorOrg}</p>
                    </div>
                    <AptStatusBadge status={apt.status} />
                  </div>

                  <p className="text-[13px] text-foreground/80 mb-3 line-clamp-2">{apt.purpose}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[12px] text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />{apt.scheduledTime} ({apt.duration} phút)
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />{apt.hostName} — {apt.hostUnit}
                    </span>
                    {apt.vehicleRequired && (
                      <span className="flex items-center gap-1.5">
                        <Car className="w-3.5 h-3.5" />{apt.vehiclePlate || 'Có xe'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 shrink-0">
                  <button onClick={() => setViewApt(apt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-muted-foreground hover:bg-accent border border-border transition-colors">
                    <Eye className="w-3.5 h-3.5" /> Chi tiết
                  </button>
                  {apt.status === 'pending' && canApprove && (
                    <>
                      <button onClick={() => handleApprove(apt.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
                      </button>
                      <button onClick={() => setRejectConfirm(apt.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border border-red-200 dark:border-red-900/30 transition-colors">
                        <XCircle className="w-3.5 h-3.5" /> Từ chối
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-12 text-center">
              <Filter className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-[13px] text-muted-foreground">Không có lịch hẹn phù hợp</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="apt-modal-title"
            className="bg-card rounded-2xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto"
            style={{ boxShadow: 'var(--shadow-xl)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CalendarClock className="w-4 h-4 text-primary" />
                </div>
                <h3 id="apt-modal-title" style={{ fontFamily: 'var(--font-display)' }}>Tạo lịch hẹn mới</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-accent" aria-label="Đóng"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div role="alert" className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl text-[13px] text-red-600 dark:text-red-400">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Họ tên đối tác *</label>
                  <input type="text" value={formData.visitorName} onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">CCCD/CMND *</label>
                  <input type="text" value={formData.visitorIdNumber} onChange={(e) => setFormData({ ...formData, visitorIdNumber: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Số điện thoại</label>
                  <input type="text" value={formData.visitorPhone} onChange={(e) => setFormData({ ...formData, visitorPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Đơn vị / Tổ chức *</label>
                  <input type="text" value={formData.visitorOrg} onChange={(e) => setFormData({ ...formData, visitorOrg: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Mục đích *</label>
                  <input type="text" value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Người tiếp đón *</label>
                  <input type="text" value={formData.hostName} onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Đơn vị tiếp đón *</label>
                  <input type="text" value={formData.hostUnit} onChange={(e) => setFormData({ ...formData, hostUnit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Ngày hẹn</label>
                  <input type="date" value={formData.scheduledDate} onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Giờ hẹn</label>
                  <input type="time" value={formData.scheduledTime} onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="apt-vehicle" checked={formData.vehicleRequired}
                    onChange={(e) => setFormData({ ...formData, vehicleRequired: e.target.checked })}
                    className="rounded accent-primary cursor-pointer" />
                  <label htmlFor="apt-vehicle" className="text-[13px] text-foreground cursor-pointer">Có phương tiện đi kèm</label>
                </div>
                {formData.vehicleRequired && (
                  <div className="col-span-2">
                    <label className="block text-[12px] text-muted-foreground mb-1.5">Biển số xe</label>
                    <input type="text" placeholder="VD: 51G-12345" value={formData.vehiclePlate}
                      onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-[13px] text-muted-foreground hover:bg-accent transition-colors">Hủy</button>
              <button onClick={handleSave} className="px-5 py-2 bg-primary text-white rounded-xl text-[13px] hover:opacity-90 transition-all flex items-center gap-2" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <Check className="w-3.5 h-3.5" /> Tạo lịch hẹn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View detail modal */}
      {viewApt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setViewApt(null)}>
          <div ref={viewRef} role="dialog" aria-modal="true" aria-labelledby="view-apt-title"
            className="bg-card rounded-2xl border border-border w-full max-w-md" style={{ boxShadow: 'var(--shadow-xl)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 id="view-apt-title" style={{ fontFamily: 'var(--font-display)' }}>Chi tiết lịch hẹn</h3>
              <button onClick={() => setViewApt(null)} className="p-1.5 rounded-lg hover:bg-accent" aria-label="Đóng"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="p-6 space-y-3">
              {[
                ['Đối tác', viewApt.visitorName],
                ['Đơn vị', viewApt.visitorOrg],
                ['CCCD/CMND', viewApt.visitorIdNumber],
                ['Điện thoại', viewApt.visitorPhone],
                ['Mục đích', viewApt.purpose],
                ['Người tiếp', `${viewApt.hostName} — ${viewApt.hostUnit}`],
                ['Ngày hẹn', `${viewApt.scheduledDate} ${viewApt.scheduledTime}`],
                ['Thời lượng', `${viewApt.duration} phút`],
                ['Phương tiện', viewApt.vehicleRequired ? (viewApt.vehiclePlate || 'Có xe') : 'Không có'],
                ['Duyệt bởi', viewApt.approvedBy || '—'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-[12px] text-muted-foreground w-28 shrink-0">{label}:</span>
                  <span className="text-[13px] text-foreground flex-1">{value}</span>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <span className="text-[12px] text-muted-foreground w-28 shrink-0">Trạng thái:</span>
                <AptStatusBadge status={viewApt.status} />
              </div>
            </div>
            {viewApt.status === 'pending' && canApprove && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
                <button onClick={() => setRejectConfirm(viewApt.id)} className="px-4 py-2 rounded-xl text-[13px] text-red-600 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">Từ chối</button>
                <button onClick={() => handleApprove(viewApt.id)} className="px-4 py-2 rounded-xl text-[13px] text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Duyệt
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!rejectConfirm}
        title="Từ chối lịch hẹn?"
        message="Lịch hẹn sẽ bị từ chối và thông báo cho bên liên quan."
        confirmLabel="Từ chối"
        variant="danger"
        onConfirm={() => rejectConfirm && handleReject(rejectConfirm)}
        onCancel={() => setRejectConfirm(null)}
      />
    </PageTransition>
  );
}
