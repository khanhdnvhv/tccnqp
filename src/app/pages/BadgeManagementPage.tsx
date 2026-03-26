import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { toast } from 'sonner';
import {
  CreditCard, Plus, Search, X, Check, AlertCircle, Filter,
  Ban, RefreshCw, ShieldAlert,
} from 'lucide-react';
import {
  badges as initialBadges, type Badge, type BadgeStatus, type BadgeType,
  badgeStatusLabels, badgeStatusColors, badgeTypeLabels,
} from '../data/visitorData';
import { useAuth } from '../context/AuthContext';

type FilterTab = 'all' | BadgeStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Hiệu lực' },
  { key: 'expired', label: 'Hết hạn' },
  { key: 'lost', label: 'Báo mất' },
  { key: 'suspended', label: 'Tạm khóa' },
];

const BADGE_TYPES: BadgeType[] = ['day', 'monthly', 'project', 'permanent'];

interface FormData {
  code: string; visitorName: string; organization: string;
  issuedDate: string; expiryDate: string;
  type: BadgeType; zones: string;
}
const EMPTY_FORM: FormData = {
  code: '', visitorName: '', organization: '',
  issuedDate: '2026-03-26', expiryDate: '2026-03-26',
  type: 'day', zones: '',
};

function BadgeStatusBadge({ status }: { status: BadgeStatus }) {
  const c = badgeStatusColors[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
      {badgeStatusLabels[status]}
    </span>
  );
}

export function BadgeManagementPage() {
  const { hasPermission } = useAuth();
  const canManage = hasPermission('user.view');
  const [list, setList] = useState<Badge[]>(initialBadges);
  const [tab, setTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [revokeConfirm, setRevokeConfirm] = useState<string | null>(null);
  const modalRef = useFocusTrap<HTMLDivElement>(showModal);

  const filtered = useMemo(() => {
    let data = list;
    if (tab !== 'all') data = data.filter((b) => b.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((b) =>
        b.code.toLowerCase().includes(q) ||
        b.visitorName.toLowerCase().includes(q) ||
        b.organization.toLowerCase().includes(q)
      );
    }
    return data;
  }, [list, tab, search]);

  const handleSuspend = (id: string) => {
    setList((prev) => prev.map((b) => b.id === id ? { ...b, status: 'suspended' } : b));
    toast.success('Đã tạm khóa thẻ!');
  };

  const handleActivate = (id: string) => {
    setList((prev) => prev.map((b) => b.id === id ? { ...b, status: 'active' } : b));
    toast.success('Đã kích hoạt lại thẻ!');
  };

  const handleMarkLost = (id: string) => {
    setList((prev) => prev.map((b) => b.id === id ? { ...b, status: 'lost' } : b));
    setRevokeConfirm(null);
    toast.success('Đã báo mất thẻ!');
  };

  const handleIssue = () => {
    if (!formData.code.trim()) { setFormError('Vui lòng nhập mã thẻ'); return; }
    if (!formData.visitorName.trim()) { setFormError('Vui lòng nhập tên người dùng'); return; }
    const newBadge: Badge = {
      id: 'b-' + Date.now(), ...formData,
      zones: formData.zones.split(',').map((z) => z.trim()).filter(Boolean),
      status: 'active', issuedBy: 'Cán bộ trực ban',
    };
    setList((prev) => [newBadge, ...prev]);
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowModal(false);
    toast.success('Đã cấp thẻ mới!');
  };

  const isExpiringSoon = (expiryDate: string) => {
    const today = new Date('2026-03-26');
    const exp = new Date(expiryDate);
    const diffDays = (exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 3;
  };

  const counts = useMemo(() => ({
    active: list.filter((b) => b.status === 'active').length,
    expired: list.filter((b) => b.status === 'expired').length,
    lost: list.filter((b) => b.status === 'lost').length,
    expiringSoon: list.filter((b) => b.status === 'active' && isExpiringSoon(b.expiryDate)).length,
  }), [list]);

  return (
    <PageTransition>
      <Header title="Quản lý thẻ tạm" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* Summary */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: CreditCard, label: 'Đang hiệu lực', value: counts.active, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { icon: AlertCircle, label: 'Sắp hết hạn', value: counts.expiringSoon, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
            { icon: Ban, label: 'Hết hạn', value: counts.expired, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' },
            { icon: ShieldAlert, label: 'Báo mất', value: counts.lost, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
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
              const cnt = t.key === 'all' ? list.length : list.filter((b) => b.status === t.key).length;
              return (
                <button key={t.key} onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[12px] whitespace-nowrap border-b-2 transition-colors ${
                    tab === t.key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}>
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
              <input type="text" placeholder="Tìm mã thẻ, tên, đơn vị..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 outline-none" />
            </div>
            {canManage && (
              <button onClick={() => { setFormData(EMPTY_FORM); setFormError(''); setShowModal(true); }}
                className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] text-white bg-primary hover:opacity-90 transition-all"
                style={{ boxShadow: 'var(--shadow-sm)' }}>
                <Plus className="w-3.5 h-3.5" /> Cấp thẻ mới
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-xs)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]" role="grid" aria-label="Danh sách thẻ tạm">
              <thead>
                <tr className="border-b border-border bg-surface-2/60 text-left">
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">#</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Mã thẻ</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Tên người dùng</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Đơn vị</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Loại</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Ngày cấp</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Hạn dùng</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Khu vực</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Trạng thái</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((badge, idx) => {
                  const expiring = badge.status === 'active' && isExpiringSoon(badge.expiryDate);
                  return (
                    <tr key={badge.id} className={`border-b border-border/60 hover:bg-accent/30 transition-colors ${expiring ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''}`}>
                      <td className="px-4 py-3 text-muted-foreground text-[12px]">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <code className="text-[12px] text-primary bg-primary/5 px-1.5 py-0.5 rounded">{badge.code}</code>
                      </td>
                      <td className="px-4 py-3 text-foreground truncate max-w-[140px]">{badge.visitorName}</td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[140px]">{badge.organization}</td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] px-2 py-0.5 bg-muted text-muted-foreground rounded-md">
                          {badgeTypeLabels[badge.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-[12px] whitespace-nowrap">{badge.issuedDate}</td>
                      <td className="px-4 py-3 text-[12px] whitespace-nowrap">
                        <span className={expiring ? 'text-amber-600' : 'text-muted-foreground'}>{badge.expiryDate}</span>
                        {expiring && <span className="ml-1 text-[10px] text-amber-600">⚠ Sắp hết hạn</span>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                          {badge.zones.join(', ')}
                        </p>
                      </td>
                      <td className="px-4 py-3"><BadgeStatusBadge status={badge.status} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {badge.status === 'active' && (
                            <button onClick={() => handleSuspend(badge.id)}
                              className="p-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors" title="Tạm khóa">
                              <Ban className="w-3.5 h-3.5 text-amber-500" />
                            </button>
                          )}
                          {(badge.status === 'suspended' || badge.status === 'expired') && (
                            <button onClick={() => handleActivate(badge.id)}
                              className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Kích hoạt lại">
                              <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                            </button>
                          )}
                          {badge.status === 'active' && (
                            <button onClick={() => setRevokeConfirm(badge.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Báo mất">
                              <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-12 text-muted-foreground text-[13px]">
                      <Filter className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      Không có thẻ nào phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Issue Badge Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="badge-modal-title"
            className="bg-card rounded-2xl border border-border w-full max-w-md" style={{ boxShadow: 'var(--shadow-xl)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <h3 id="badge-modal-title" style={{ fontFamily: 'var(--font-display)' }}>Cấp thẻ mới</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-accent" aria-label="Đóng"><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <div className="p-6 space-y-4">
              {formError && (
                <div role="alert" className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 rounded-xl text-[13px] text-red-600">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Mã thẻ *</label>
                  <input type="text" placeholder="VD: TD-2026-0001" value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Loại thẻ</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as BadgeType })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                    {BADGE_TYPES.map((t) => <option key={t} value={t}>{badgeTypeLabels[t]}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Tên người dùng *</label>
                  <input type="text" value={formData.visitorName} onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Đơn vị</label>
                  <input type="text" value={formData.organization} onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Ngày cấp</label>
                  <input type="date" value={formData.issuedDate} onChange={(e) => setFormData({ ...formData, issuedDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Hạn dùng</label>
                  <input type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Khu vực được phép (phân cách bằng dấu phẩy)</label>
                  <input type="text" placeholder="VD: Khu A, Phòng họp B" value={formData.zones}
                    onChange={(e) => setFormData({ ...formData, zones: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-[13px] text-muted-foreground hover:bg-accent transition-colors">Hủy</button>
              <button onClick={handleIssue} className="px-5 py-2 bg-primary text-white rounded-xl text-[13px] hover:opacity-90 transition-all flex items-center gap-2" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <Check className="w-3.5 h-3.5" /> Cấp thẻ
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!revokeConfirm}
        title="Báo mất thẻ?"
        message="Thẻ sẽ bị vô hiệu hóa ngay lập tức và cần cấp thẻ mới."
        confirmLabel="Xác nhận báo mất"
        variant="danger"
        onConfirm={() => revokeConfirm && handleMarkLost(revokeConfirm)}
        onCancel={() => setRevokeConfirm(null)}
      />
    </PageTransition>
  );
}
