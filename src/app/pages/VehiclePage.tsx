import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { toast } from 'sonner';
import { Car, Plus, Search, X, Check, AlertCircle, LogOut, Filter, Truck, Bike, MapPin } from 'lucide-react';
import {
  vehicles as initialVehicles, type Vehicle, type VehicleStatus, type VehicleType,
  vehicleStatusLabels, vehicleStatusColors, vehicleTypeLabels,
} from '../data/visitorData';

type FilterTab = 'all' | VehicleStatus;
const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'Tất cả' },
  { key: 'inside', label: 'Trong khu vực' },
  { key: 'overstay', label: 'Quá giờ' },
  { key: 'outside', label: 'Đã ra' },
];

const VEHICLE_TYPES: VehicleType[] = ['car', 'motorcycle', 'truck', 'other'];

interface FormData {
  plate: string; type: VehicleType; model: string; color: string;
  ownerName: string; ownerOrg: string; purpose: string; parkingSlot: string;
}
const EMPTY_FORM: FormData = {
  plate: '', type: 'car', model: '', color: '',
  ownerName: '', ownerOrg: '', purpose: '', parkingSlot: '',
};

function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  const c = vehicleStatusColors[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
      {vehicleStatusLabels[status]}
    </span>
  );
}

const VehicleIcon = ({ type }: { type: VehicleType }) => {
  if (type === 'truck') return <Truck className="w-4 h-4" />;
  if (type === 'motorcycle') return <Bike className="w-4 h-4" />;
  return <Car className="w-4 h-4" />;
};

export function VehiclePage() {
  const [list, setList] = useState<Vehicle[]>(initialVehicles);
  const [tab, setTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const modalRef = useFocusTrap<HTMLDivElement>(showModal);

  const filtered = useMemo(() => {
    let data = list;
    if (tab !== 'all') data = data.filter((v) => v.status === tab);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((v) =>
        v.plate.toLowerCase().includes(q) ||
        v.ownerName.toLowerCase().includes(q) ||
        v.ownerOrg.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q)
      );
    }
    return data;
  }, [list, tab, search]);

  const handleCheckOut = (id: string) => {
    setList((prev) => prev.map((v) => v.id === id ? { ...v, status: 'outside', checkOut: new Date().toISOString() } : v));
    toast.success('Đã ghi nhận xe ra khỏi khu vực!');
  };

  const handleCheckIn = () => {
    if (!formData.plate.trim()) { setFormError('Vui lòng nhập biển số xe'); return; }
    if (!formData.ownerName.trim()) { setFormError('Vui lòng nhập tên chủ xe'); return; }
    const newV: Vehicle = {
      id: 'veh-' + Date.now(), ...formData,
      status: 'inside', checkIn: new Date().toISOString(),
    };
    setList((prev) => [newV, ...prev]);
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowModal(false);
    toast.success('Đã đăng ký xe vào khu vực!');
  };

  const formatTime = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const insideCount = list.filter((v) => v.status === 'inside').length;
  const overstayCount = list.filter((v) => v.status === 'overstay').length;
  const todayOut = list.filter((v) => v.status === 'outside').length;

  return (
    <PageTransition>
      <Header title="Quản lý phương tiện" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Car, label: 'Trong khu vực', value: insideCount, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { icon: AlertCircle, label: 'Quá giờ', value: overstayCount, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
            { icon: LogOut, label: 'Đã ra hôm nay', value: todayOut, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
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
              const cnt = t.key === 'all' ? list.length : list.filter((v) => v.status === t.key).length;
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
              <input type="text" placeholder="Tìm biển số, chủ xe..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 outline-none" />
            </div>
            <button onClick={() => { setFormData(EMPTY_FORM); setFormError(''); setShowModal(true); }}
              className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] text-white bg-primary hover:opacity-90 transition-all"
              style={{ boxShadow: 'var(--shadow-sm)' }}>
              <Plus className="w-3.5 h-3.5" /> Đăng ký xe vào
            </button>
          </div>
        </div>

        {/* Vehicle Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <div key={v.id} className={`bg-card rounded-xl border overflow-hidden transition-all hover:shadow-md ${
              v.status === 'overstay' ? 'border-red-200 dark:border-red-900/40' : 'border-border'
            }`} style={{ boxShadow: 'var(--shadow-xs)' }}>
              {/* Card header */}
              <div className={`px-4 py-3 flex items-center justify-between ${
                v.status === 'inside' ? 'bg-emerald-50 dark:bg-emerald-900/10' :
                v.status === 'overstay' ? 'bg-red-50 dark:bg-red-900/10' :
                'bg-surface-2'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    v.status === 'inside' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                    v.status === 'overstay' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    <VehicleIcon type={v.type} />
                  </div>
                  <div>
                    <p className="text-[14px] text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{v.plate}</p>
                    <p className="text-[11px] text-muted-foreground">{vehicleTypeLabels[v.type]} • {v.color}</p>
                  </div>
                </div>
                <VehicleStatusBadge status={v.status} />
              </div>

              {/* Card body */}
              <div className="px-4 py-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-[11px] text-muted-foreground w-16 shrink-0">Mẫu xe:</span>
                  <span className="text-[12px] text-foreground">{v.model}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[11px] text-muted-foreground w-16 shrink-0">Chủ xe:</span>
                  <span className="text-[12px] text-foreground truncate">{v.ownerName}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[11px] text-muted-foreground w-16 shrink-0">Đơn vị:</span>
                  <span className="text-[12px] text-muted-foreground truncate">{v.ownerOrg}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[11px] text-muted-foreground w-16 shrink-0">Mục đích:</span>
                  <span className="text-[12px] text-muted-foreground truncate">{v.purpose}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span>Vào: {formatTime(v.checkIn)}</span>
                    {v.checkOut && <span>Ra: {formatTime(v.checkOut)}</span>}
                  </div>
                  {v.parkingSlot && (
                    <span className="flex items-center gap-1 text-[11px] text-primary">
                      <MapPin className="w-3 h-3" /> {v.parkingSlot}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              {(v.status === 'inside' || v.status === 'overstay') && (
                <div className="px-4 py-3 border-t border-border">
                  <button onClick={() => handleCheckOut(v.id)}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] text-white bg-primary hover:opacity-90 transition-all"
                    style={{ boxShadow: 'var(--shadow-sm)' }}>
                    <LogOut className="w-3.5 h-3.5" /> Ghi nhận ra
                  </button>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full bg-card rounded-xl border border-border p-12 text-center">
              <Filter className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-[13px] text-muted-foreground">Không có phương tiện phù hợp</p>
            </div>
          )}
        </div>
      </div>

      {/* Check-in Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div ref={modalRef} role="dialog" aria-modal="true" aria-labelledby="vehicle-modal-title"
            className="bg-card rounded-2xl border border-border w-full max-w-md" style={{ boxShadow: 'var(--shadow-xl)' }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Car className="w-4 h-4 text-primary" />
                </div>
                <h3 id="vehicle-modal-title" style={{ fontFamily: 'var(--font-display)' }}>Đăng ký xe vào</h3>
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
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Biển số xe *</label>
                  <input type="text" placeholder="VD: 51G-12345" value={formData.plate}
                    onChange={(e) => setFormData({ ...formData, plate: e.target.value.toUpperCase() })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Loại xe</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value as VehicleType })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                    {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{vehicleTypeLabels[t]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Mẫu xe</label>
                  <input type="text" placeholder="VD: Toyota Fortuner" value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Màu xe</label>
                  <input type="text" placeholder="VD: Trắng" value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Tên chủ xe *</label>
                  <input type="text" value={formData.ownerName} onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Đơn vị</label>
                  <input type="text" value={formData.ownerOrg} onChange={(e) => setFormData({ ...formData, ownerOrg: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Mục đích</label>
                  <input type="text" value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
                <div>
                  <label className="block text-[12px] text-muted-foreground mb-1.5">Vị trí đỗ</label>
                  <input type="text" placeholder="VD: P-A12" value={formData.parkingSlot}
                    onChange={(e) => setFormData({ ...formData, parkingSlot: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-input-background rounded-xl text-[13px] border border-transparent focus:border-primary/30 outline-none" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-xl text-[13px] text-muted-foreground hover:bg-accent transition-colors">Hủy</button>
              <button onClick={handleCheckIn} className="px-5 py-2 bg-primary text-white rounded-xl text-[13px] hover:opacity-90 transition-all flex items-center gap-2" style={{ boxShadow: 'var(--shadow-sm)' }}>
                <Check className="w-3.5 h-3.5" /> Đăng ký vào
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
