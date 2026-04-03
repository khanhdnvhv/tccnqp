import { useState, useMemo, useCallback } from 'react';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import {
  doanVaoData, doanRaData,
  type DoanVao, type DoanRa,
} from '../data/reportData';
import {
  Users, Globe, ArrowDownToLine, ArrowUpFromLine,
  Search, Printer, FileSpreadsheet, Filter, Plane, Ship,
  BarChart3, X, Building2, CalendarDays, TrendingUp,
  ArrowUpDown, ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

type ReportTab = 'tong-hop' | 'doan-vao' | 'doan-ra';

// ---- CSV Export ----
function downloadCSV(filename: string, headers: string[], rows: string[][]) {
  const BOM = '\uFEFF';
  const csv = BOM + [headers.join(','), ...rows.map((r) => r.map((c) => `"${(c ?? '').replace(/"/g, '""')}"`).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>('tong-hop');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [doiTacFilterVao, setDoiTacFilterVao] = useState<string>('all');
  const [donViFilterVao, setDonViFilterVao] = useState<string>('all');
  const [doiTacFilterRa, setDoiTacFilterRa] = useState<string>('all');
  const [donViFilterRa, setDonViFilterRa] = useState<string>('all');
  const [searchVao, setSearchVao] = useState('');
  const [searchRa, setSearchRa] = useState('');

  // ---- Extract unique filter options ----
  const vaoDoiTacOptions = useMemo(() => [...new Set(doanVaoData.map((d) => d.congTyDoiTac))].sort(), []);
  const vaoDonViOptions = useMemo(() => [...new Set(doanVaoData.map((d) => d.donVi))].sort(), []);
  const raDoiTacOptions = useMemo(() => [...new Set(doanRaData.map((d) => d.doiTacMoi).filter(Boolean))].sort(), []);
  const raDonViOptions = useMemo(() => [...new Set(doanRaData.map((d) => d.donVi))].sort(), []);
  const yearOptions = useMemo(() => {
    const years = new Set<string>();
    doanVaoData.forEach((d) => { const m = d.congVanTongCuc.match(/\/(\d{2})$/); if (m) years.add('20' + m[1]); });
    doanRaData.forEach((d) => { const m = d.congVanTongCuc.match(/\/(\d{2,4})$/); if (m) years.add(m[1].length === 2 ? '20' + m[1] : m[1]); });
    years.add('2025'); years.add('2026');
    return [...years].sort().reverse();
  }, []);

  // ---- Filtered data ----
  const filteredVao = useMemo(() => {
    let data = doanVaoData;
    if (doiTacFilterVao !== 'all') data = data.filter((d) => d.congTyDoiTac === doiTacFilterVao);
    if (donViFilterVao !== 'all') data = data.filter((d) => d.donVi === donViFilterVao);
    if (searchVao.trim()) {
      const q = searchVao.toLowerCase();
      data = data.filter((d) =>
        d.congTyDoiTac.toLowerCase().includes(q) ||
        d.mucDich.toLowerCase().includes(q) ||
        d.donVi.toLowerCase().includes(q) ||
        d.congVanTongCuc.toLowerCase().includes(q) ||
        d.danhSachDoiTac.some((p) => p.hoTen.toLowerCase().includes(q) || p.quocTich.toLowerCase().includes(q))
      );
    }
    return data;
  }, [doiTacFilterVao, donViFilterVao, searchVao]);

  const filteredRa = useMemo(() => {
    let data = doanRaData;
    if (doiTacFilterRa !== 'all') data = data.filter((d) => d.doiTacMoi === doiTacFilterRa);
    if (donViFilterRa !== 'all') data = data.filter((d) => d.donVi === donViFilterRa);
    if (searchRa.trim()) {
      const q = searchRa.toLowerCase();
      data = data.filter((d) =>
        d.truongDoan.toLowerCase().includes(q) ||
        d.mucDich.toLowerCase().includes(q) ||
        d.nuocDi.toLowerCase().includes(q) ||
        d.donVi.toLowerCase().includes(q) ||
        d.doiTacMoi.toLowerCase().includes(q)
      );
    }
    return data;
  }, [doiTacFilterRa, donViFilterRa, searchRa]);

  // ---- Computed stats from filtered data ----
  const vaoStats = useMemo(() => ({
    total: filteredVao.length,
    totalNguoi: filteredVao.reduce((s, d) => s + d.soLuong, 0),
    soQuocGia: new Set(filteredVao.flatMap((d) => d.danhSachDoiTac.map((p) => p.quocTich))).size,
    byQuocGia: Object.entries(
      filteredVao.flatMap((d) => d.danhSachDoiTac.map((p) => p.quocTich))
        .reduce<Record<string, number>>((acc, qg) => { acc[qg] = (acc[qg] || 0) + 1; return acc; }, {})
    ).sort((a, b) => b[1] - a[1]),
    byDonVi: Object.entries(
      filteredVao.reduce<Record<string, number>>((acc, d) => { acc[d.donVi] = (acc[d.donVi] || 0) + 1; return acc; }, {})
    ).sort((a, b) => b[1] - a[1]),
    byThang: Array.from({ length: 12 }, (_, i) => ({
      thang: i + 1,
      soLuong: filteredVao.filter((d) => d.thangVao === i + 1).length,
    })),
  }), [filteredVao]);

  const raStats = useMemo(() => ({
    total: filteredRa.length,
    totalNguoi: filteredRa.reduce((s, d) => s + d.soLuong, 0),
    soNuoc: new Set(filteredRa.flatMap((d) => d.nuocDi.split(/[,&]/).map((s) => s.trim())).filter(Boolean)).size,
    byNuoc: Object.entries(
      filteredRa.flatMap((d) => d.nuocDi.split(/[,&]/).map((s) => s.trim())).filter(Boolean)
        .reduce<Record<string, number>>((acc, n) => { acc[n] = (acc[n] || 0) + 1; return acc; }, {})
    ).sort((a, b) => b[1] - a[1]),
    byDonVi: Object.entries(
      filteredRa.reduce<Record<string, number>>((acc, d) => { acc[d.donVi] = (acc[d.donVi] || 0) + 1; return acc; }, {})
    ).sort((a, b) => b[1] - a[1]),
  }), [filteredRa]);

  // ---- Export handlers ----
  const handleExportVao = useCallback(() => {
    const headers = ['TT', 'CV Tổng cục', 'CV Đơn vị', 'CV Cục Tác chiến', 'CV Cục BVAN', 'Độ mật', 'SL', 'Họ tên', 'Hộ chiếu', 'Quốc tịch', 'Tháng vào', 'Tháng về', 'TG cụ thể', 'Đơn vị', 'Công ty/Đối tác', 'Mục đích', 'Ghi chú'];
    const rows: string[][] = [];
    filteredVao.forEach((d) => {
      d.danhSachDoiTac.forEach((p, i) => {
        rows.push([
          i === 0 ? String(d.stt) : '',
          i === 0 ? d.congVanTongCuc : '', i === 0 ? d.congVanDonVi : '',
          i === 0 ? d.cvCucTacChien : '', i === 0 ? d.cvCucBVAN : '',
          i === 0 ? d.doMat : '', i === 0 ? String(d.soLuong) : '',
          p.hoTen, p.hoChieu, p.quocTich,
          i === 0 ? String(d.thangVao) : '', i === 0 ? String(d.thangVe) : '',
          i === 0 ? d.thoiGianCuThe : '', i === 0 ? d.donVi : '',
          i === 0 ? d.congTyDoiTac : '', i === 0 ? d.mucDich : '', i === 0 ? d.ghiChu : '',
        ]);
      });
    });
    downloadCSV(`Doan_Vao_${yearFilter === 'all' ? 'TatCa' : yearFilter}.csv`, headers, rows);
    toast.success(`Đã xuất báo cáo Đoàn vào (${filteredVao.length} đoàn) dạng CSV`);
  }, [filteredVao, yearFilter]);

  const handleExportRa = useCallback(() => {
    const headers = ['TT', 'CV Tổng cục', 'CV Đơn vị', 'Trích yếu', 'Số QĐ', 'Người nhận', 'Đơn vị', 'SL', 'Trưởng đoàn', 'Nước đi', 'TG Đi', 'TG Về', 'TG cụ thể', 'Mục đích', 'Đối tác mới', 'Ghi chú'];
    const rows = filteredRa.map((d) => [
      String(d.stt), d.congVanTongCuc, d.congVanDonVi, d.trichYeu, d.soQuyetDinh,
      d.nguoiNhan, d.donVi, String(d.soLuong), d.truongDoan, d.nuocDi,
      String(d.thoiGianDi), String(d.thoiGianVe), d.thoiGianCuThe,
      d.mucDich, d.doiTacMoi, d.ghiChu,
    ]);
    downloadCSV(`Doan_Ra_${yearFilter === 'all' ? 'TatCa' : yearFilter}.csv`, headers, rows);
    toast.success(`Đã xuất báo cáo Đoàn ra (${filteredRa.length} đoàn) dạng CSV`);
  }, [filteredRa, yearFilter]);

  const handleExportAll = useCallback(() => {
    handleExportVao();
    setTimeout(() => handleExportRa(), 300);
  }, [handleExportVao, handleExportRa]);

  const clearFiltersVao = () => { setDoiTacFilterVao('all'); setDonViFilterVao('all'); setSearchVao(''); };
  const clearFiltersRa = () => { setDoiTacFilterRa('all'); setDonViFilterRa('all'); setSearchRa(''); };
  const hasFiltersVao = doiTacFilterVao !== 'all' || donViFilterVao !== 'all' || searchVao.trim() !== '';
  const hasFiltersRa = doiTacFilterRa !== 'all' || donViFilterRa !== 'all' || searchRa.trim() !== '';

  // ---- Mini bar chart using CSS ----
  const MiniBar = ({ data, maxVal }: { data: { label: string; value: number }[]; maxVal: number }) => (
    <div className="space-y-1.5">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground w-24 shrink-0 truncate text-right">{d.label}</span>
          <div className="flex-1 h-5 bg-surface-2 rounded-md overflow-hidden relative">
            <div className="h-full bg-primary/20 rounded-md transition-all" style={{ width: maxVal > 0 ? `${(d.value / maxVal) * 100}%` : '0%' }} />
            <span className="absolute inset-0 flex items-center px-2 text-[11px] text-foreground" style={{ fontWeight: 500 }}>{d.value}</span>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <PageTransition>
      <Header title="Báo cáo & Thống kê" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* ---- Tab bar + Global year filter ---- */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1 bg-card rounded-xl border border-border p-1" style={{ boxShadow: 'var(--shadow-xs)' }}>
            {([
              { key: 'tong-hop' as ReportTab, label: 'Tổng hợp', icon: BarChart3 },
              { key: 'doan-vao' as ReportTab, label: 'Đoàn vào', icon: ArrowDownToLine },
              { key: 'doan-ra' as ReportTab, label: 'Đoàn ra', icon: ArrowUpFromLine },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] transition-all ${
                  activeTab === tab.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
                }`}
                style={activeTab === tab.key ? { boxShadow: 'var(--shadow-sm)' } : undefined}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-3 py-2 bg-surface-2 border border-border rounded-xl text-[13px] outline-none cursor-pointer text-foreground"
            >
              <option value="all">Tất cả năm</option>
              {yearOptions.map((y) => <option key={y} value={y}>Năm {y}</option>)}
            </select>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-xl text-[13px] text-muted-foreground hover:bg-accent transition-colors"
            >
              <Printer className="w-4 h-4" /> In
            </button>
            <button
              onClick={activeTab === 'doan-vao' ? handleExportVao : activeTab === 'doan-ra' ? handleExportRa : handleExportAll}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[13px] transition-colors"
              style={{ boxShadow: 'var(--shadow-sm)' }}
            >
              <FileSpreadsheet className="w-4 h-4" /> Xuất Excel
            </button>
          </div>
        </div>

        {/* ==================== TỔNG HỢP ==================== */}
        {activeTab === 'tong-hop' && (
          <div className="space-y-4">
            {/* Summary KPI */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: ArrowDownToLine, label: 'Đoàn vào', value: vaoStats.total, sub: `${vaoStats.totalNguoi} người`, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { icon: ArrowUpFromLine, label: 'Đoàn ra', value: raStats.total, sub: `${raStats.totalNguoi} người`, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                { icon: Globe, label: 'Quốc gia đến VN', value: vaoStats.soQuocGia, sub: 'quốc tịch', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                { icon: Plane, label: 'Nước ta đi', value: raStats.soNuoc, sub: 'quốc gia', color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
              ].map((s) => (
                <div key={s.label} className="p-4 rounded-xl border border-border bg-card" style={{ boxShadow: 'var(--shadow-xs)' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                      <s.icon className={`w-4.5 h-4.5 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-[22px] text-foreground leading-none" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{s.value}</p>
                      <p className="text-[11px] text-muted-foreground">{s.label}</p>
                    </div>
                  </div>
                  <p className="text-[12px] text-muted-foreground ml-12">{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Charts side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Đoàn vào theo Quốc gia */}
              <div className="bg-card rounded-xl border border-border p-4" style={{ boxShadow: 'var(--shadow-xs)' }}>
                <h3 className="text-[13px] text-foreground mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}>
                  <Ship className="w-4 h-4 text-blue-600" /> Đoàn vào — theo Quốc tịch
                </h3>
                {vaoStats.byQuocGia.length > 0 ? (
                  <MiniBar
                    data={vaoStats.byQuocGia.map(([label, value]) => ({ label, value }))}
                    maxVal={Math.max(...vaoStats.byQuocGia.map(([, v]) => v))}
                  />
                ) : (
                  <p className="text-[12px] text-muted-foreground text-center py-6">Không có dữ liệu</p>
                )}
              </div>

              {/* Đoàn ra theo Nước */}
              <div className="bg-card rounded-xl border border-border p-4" style={{ boxShadow: 'var(--shadow-xs)' }}>
                <h3 className="text-[13px] text-foreground mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}>
                  <Plane className="w-4 h-4 text-orange-600" /> Đoàn ra — theo Nước đến
                </h3>
                {raStats.byNuoc.length > 0 ? (
                  <MiniBar
                    data={raStats.byNuoc.map(([label, value]) => ({ label, value }))}
                    maxVal={Math.max(...raStats.byNuoc.map(([, v]) => v))}
                  />
                ) : (
                  <p className="text-[12px] text-muted-foreground text-center py-6">Không có dữ liệu</p>
                )}
              </div>

              {/* Đoàn vào theo Đơn vị */}
              <div className="bg-card rounded-xl border border-border p-4" style={{ boxShadow: 'var(--shadow-xs)' }}>
                <h3 className="text-[13px] text-foreground mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}>
                  <Building2 className="w-4 h-4 text-blue-600" /> Đoàn vào — theo Đơn vị tiếp nhận
                </h3>
                {vaoStats.byDonVi.length > 0 ? (
                  <MiniBar
                    data={vaoStats.byDonVi.map(([label, value]) => ({ label, value }))}
                    maxVal={Math.max(...vaoStats.byDonVi.map(([, v]) => v))}
                  />
                ) : (
                  <p className="text-[12px] text-muted-foreground text-center py-6">Không có dữ liệu</p>
                )}
              </div>

              {/* Đoàn ra theo Đơn vị */}
              <div className="bg-card rounded-xl border border-border p-4" style={{ boxShadow: 'var(--shadow-xs)' }}>
                <h3 className="text-[13px] text-foreground mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}>
                  <Building2 className="w-4 h-4 text-orange-600" /> Đoàn ra — theo Đơn vị cử
                </h3>
                {raStats.byDonVi.length > 0 ? (
                  <MiniBar
                    data={raStats.byDonVi.map(([label, value]) => ({ label, value }))}
                    maxVal={Math.max(...raStats.byDonVi.map(([, v]) => v))}
                  />
                ) : (
                  <p className="text-[12px] text-muted-foreground text-center py-6">Không có dữ liệu</p>
                )}
              </div>
            </div>

            {/* Monthly timeline for Đoàn vào */}
            <div className="bg-card rounded-xl border border-border p-4" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <h3 className="text-[13px] text-foreground mb-3 flex items-center gap-2" style={{ fontWeight: 600 }}>
                <CalendarDays className="w-4 h-4 text-primary" /> Đoàn vào — theo Tháng
              </h3>
              <div className="flex items-end gap-1.5 h-24">
                {vaoStats.byThang.map((m) => {
                  const maxH = Math.max(...vaoStats.byThang.map((x) => x.soLuong), 1);
                  const h = m.soLuong > 0 ? Math.max((m.soLuong / maxH) * 100, 12) : 4;
                  return (
                    <div key={m.thang} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex items-end justify-center" style={{ height: 80 }}>
                        <div
                          className={`w-full max-w-[28px] rounded-t-md transition-all ${m.soLuong > 0 ? 'bg-primary/70' : 'bg-muted/30'}`}
                          style={{ height: `${h}%` }}
                          title={`T${m.thang}: ${m.soLuong} đoàn`}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground">T{m.thang}</span>
                      {m.soLuong > 0 && <span className="text-[10px] text-foreground" style={{ fontWeight: 600 }}>{m.soLuong}</span>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick summary tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Recent Đoàn vào */}
              <div className="bg-card rounded-xl border border-border p-4" style={{ boxShadow: 'var(--shadow-xs)' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[13px] text-foreground flex items-center gap-2" style={{ fontWeight: 600 }}>
                    <ArrowDownToLine className="w-4 h-4 text-blue-600" /> Đoàn vào gần đây
                  </h3>
                  <button onClick={() => setActiveTab('doan-vao')} className="text-[11px] text-primary hover:underline">Xem tất cả</button>
                </div>
                <div className="space-y-2">
                  {filteredVao.slice(0, 5).map((d) => (
                    <div key={d.id} className="flex items-center gap-3 p-2.5 bg-surface-2 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-foreground truncate" style={{ fontWeight: 500 }}>{d.congTyDoiTac}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{d.mucDich}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[12px] text-foreground" style={{ fontWeight: 600 }}>{d.soLuong} người</p>
                        <p className="text-[10px] text-muted-foreground">{d.thoiGianCuThe}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Đoàn ra */}
              <div className="bg-card rounded-xl border border-border p-4" style={{ boxShadow: 'var(--shadow-xs)' }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[13px] text-foreground flex items-center gap-2" style={{ fontWeight: 600 }}>
                    <ArrowUpFromLine className="w-4 h-4 text-orange-600" /> Đoàn ra gần đây
                  </h3>
                  <button onClick={() => setActiveTab('doan-ra')} className="text-[11px] text-primary hover:underline">Xem tất cả</button>
                </div>
                <div className="space-y-2">
                  {filteredRa.slice(0, 5).map((d) => (
                    <div key={d.id} className="flex items-center gap-3 p-2.5 bg-surface-2 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-foreground truncate" style={{ fontWeight: 500 }}>{d.truongDoan}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{d.nuocDi} — {d.mucDich}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[12px] text-foreground" style={{ fontWeight: 600 }}>{d.soLuong} người</p>
                        <p className="text-[10px] text-muted-foreground">{d.thoiGianCuThe}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ĐOÀN VÀO ==================== */}
        {activeTab === 'doan-vao' && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Ship, label: 'Tổng đoàn vào', value: vaoStats.total, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { icon: Users, label: 'Tổng người', value: vaoStats.totalNguoi, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                { icon: Globe, label: 'Quốc gia', value: vaoStats.soQuocGia, color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-900/20' },
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

            {/* Filters */}
            <div className="bg-card rounded-xl border border-border p-3" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                  <input
                    type="text"
                    placeholder="Tìm đối tác, đơn vị, mục đích..."
                    value={searchVao}
                    onChange={(e) => setSearchVao(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 outline-none transition-all"
                  />
                </div>
                <select
                  value={doiTacFilterVao}
                  onChange={(e) => setDoiTacFilterVao(e.target.value)}
                  className="px-3 py-2 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 outline-none cursor-pointer max-w-[220px]"
                >
                  <option value="all">Tất cả đối tác</option>
                  {vaoDoiTacOptions.map((dt) => <option key={dt} value={dt}>{dt.length > 35 ? dt.slice(0, 35) + '...' : dt}</option>)}
                </select>
                <select
                  value={donViFilterVao}
                  onChange={(e) => setDonViFilterVao(e.target.value)}
                  className="px-3 py-2 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 outline-none cursor-pointer"
                >
                  <option value="all">Tất cả đơn vị</option>
                  {vaoDonViOptions.map((dv) => <option key={dv} value={dv}>{dv}</option>)}
                </select>
                {hasFiltersVao && (
                  <button onClick={clearFiltersVao} className="flex items-center gap-1 px-2.5 py-2 text-[12px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <X className="w-3.5 h-3.5" /> Xóa bộ lọc
                  </button>
                )}
                <span className="text-[12px] text-muted-foreground ml-auto">
                  {filteredVao.length} / {doanVaoData.length} đoàn
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="text-center py-1 print:py-4">
              <h2 className="text-[17px] text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                ĐOÀN VÀO {yearFilter !== 'all' ? `NĂM ${yearFilter}` : ''}
              </h2>
              {hasFiltersVao && (
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  (Lọc: {doiTacFilterVao !== 'all' ? doiTacFilterVao : ''} {donViFilterVao !== 'all' ? `— ĐV: ${donViFilterVao}` : ''} {searchVao ? `— "${searchVao}"` : ''})
                </p>
              )}
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] border-collapse" aria-label="Báo cáo đoàn vào">
                  <thead>
                    <tr className="bg-surface-2/80 text-left">
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 text-center whitespace-nowrap w-10">TT</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap min-w-[120px]">CV Tổng cục</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap min-w-[110px]">CV đơn vị</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap min-w-[110px] bg-amber-50/60 dark:bg-amber-900/10">CV Cục Tác chiến</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap min-w-[110px] bg-amber-50/60 dark:bg-amber-900/10">CV Cục BVAN</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap text-center">Độ mật</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap text-center">SL</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap min-w-[140px]">Họ tên đối tác</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap min-w-[90px]">Hộ chiếu</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap">Quốc tịch</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap text-center">T. vào</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap text-center">T. về</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap">TG cụ thể</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap">Đơn vị</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap min-w-[140px]">Công ty, Đối tác</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 min-w-[200px]">Mục đích</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap min-w-[100px]">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVao.map((d) => {
                      const rowSpan = d.danhSachDoiTac.length || 1;
                      return d.danhSachDoiTac.map((person, pIdx) => (
                        <tr key={`${d.id}-${pIdx}`} className="border-b border-border/40 hover:bg-accent/30 transition-colors">
                          {pIdx === 0 && (
                            <>
                              <td rowSpan={rowSpan} className="px-2 py-2 text-center text-foreground border border-border/30 align-top">{d.stt}</td>
                              <td rowSpan={rowSpan} className="px-2 py-2 text-foreground border border-border/30 align-top">{d.congVanTongCuc}</td>
                              <td rowSpan={rowSpan} className="px-2 py-2 text-foreground border border-border/30 align-top">{d.congVanDonVi}</td>
                              <td rowSpan={rowSpan} className="px-2 py-2 text-foreground border border-border/30 align-top bg-amber-50/40 dark:bg-amber-900/10">{d.cvCucTacChien}</td>
                              <td rowSpan={rowSpan} className="px-2 py-2 text-foreground border border-border/30 align-top bg-amber-50/40 dark:bg-amber-900/10">{d.cvCucBVAN}</td>
                              <td rowSpan={rowSpan} className="px-2 py-2 text-center text-foreground border border-border/30 align-top">{d.doMat}</td>
                              <td rowSpan={rowSpan} className="px-2 py-2 text-center text-foreground border border-border/30 align-top" style={{ fontWeight: 600 }}>{d.soLuong}</td>
                            </>
                          )}
                          <td className="px-2 py-1.5 text-foreground border border-border/30">{person.hoTen}</td>
                          <td className="px-2 py-1.5 text-muted-foreground border border-border/30 font-mono text-[11px]">{person.hoChieu}</td>
                          <td className="px-2 py-1.5 text-muted-foreground border border-border/30">{person.quocTich}</td>
                          {pIdx === 0 && (
                            <>
                              <td rowSpan={rowSpan} className="px-2 py-2 text-center text-foreground border border-border/30 align-top">{d.thangVao}</td>
                              <td rowSpan={rowSpan} className="px-2 py-2 text-center text-foreground border border-border/30 align-top">{d.thangVe}</td>
                              <td rowSpan={rowSpan} className="px-2 py-2 text-foreground border border-border/30 align-top">{d.thoiGianCuThe}</td>
                              <td rowSpan={rowSpan} className="px-2 py-2 text-foreground border border-border/30 align-top">{d.donVi}</td>
                              <td rowSpan={rowSpan} className="px-2 py-2 text-foreground border border-border/30 align-top">{d.congTyDoiTac}</td>
                              <td rowSpan={rowSpan} className="px-2 py-2 text-foreground border border-border/30 align-top">{d.mucDich}</td>
                              <td rowSpan={rowSpan} className="px-2 py-2 text-muted-foreground border border-border/30 align-top">{d.ghiChu}</td>
                            </>
                          )}
                        </tr>
                      ));
                    })}
                    {filteredVao.length === 0 && (
                      <tr>
                        <td colSpan={17} className="text-center py-12 text-muted-foreground">
                          <Filter className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          Không có dữ liệu phù hợp
                        </td>
                      </tr>
                    )}
                    {/* Footer tổng */}
                    {filteredVao.length > 0 && (
                      <tr className="bg-surface-2/60 border-t-2 border-border">
                        <td colSpan={6} className="px-2 py-2.5 text-[12px] text-foreground border border-border/30 text-right" style={{ fontWeight: 600 }}>TỔNG CỘNG</td>
                        <td className="px-2 py-2.5 text-center text-foreground border border-border/30 text-[13px]" style={{ fontWeight: 700 }}>{vaoStats.totalNguoi}</td>
                        <td colSpan={10} className="px-2 py-2.5 text-[12px] text-muted-foreground border border-border/30">
                          {filteredVao.length} đoàn — {vaoStats.soQuocGia} quốc gia
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ĐOÀN RA ==================== */}
        {activeTab === 'doan-ra' && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Plane, label: 'Tổng đoàn ra', value: raStats.total, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                { icon: Users, label: 'Tổng người', value: raStats.totalNguoi, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                { icon: Globe, label: 'Nước đến', value: raStats.soNuoc, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
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

            {/* Filters */}
            <div className="bg-card rounded-xl border border-border p-3" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[180px] max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
                  <input
                    type="text"
                    placeholder="Tìm trưởng đoàn, đơn vị, nước đến..."
                    value={searchRa}
                    onChange={(e) => setSearchRa(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 outline-none transition-all"
                  />
                </div>
                <select
                  value={doiTacFilterRa}
                  onChange={(e) => setDoiTacFilterRa(e.target.value)}
                  className="px-3 py-2 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 outline-none cursor-pointer max-w-[220px]"
                >
                  <option value="all">Tất cả đối tác</option>
                  {raDoiTacOptions.map((dt) => <option key={dt} value={dt}>{dt.length > 35 ? dt.slice(0, 35) + '...' : dt}</option>)}
                </select>
                <select
                  value={donViFilterRa}
                  onChange={(e) => setDonViFilterRa(e.target.value)}
                  className="px-3 py-2 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 outline-none cursor-pointer"
                >
                  <option value="all">Tất cả đơn vị</option>
                  {raDonViOptions.map((dv) => <option key={dv} value={dv}>{dv}</option>)}
                </select>
                {hasFiltersRa && (
                  <button onClick={clearFiltersRa} className="flex items-center gap-1 px-2.5 py-2 text-[12px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                    <X className="w-3.5 h-3.5" /> Xóa bộ lọc
                  </button>
                )}
                <span className="text-[12px] text-muted-foreground ml-auto">
                  {filteredRa.length} / {doanRaData.length} đoàn
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="text-center py-1 print:py-4">
              <h2 className="text-[17px] text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                ĐOÀN RA {yearFilter !== 'all' ? `NĂM ${yearFilter}` : ''}
              </h2>
              {hasFiltersRa && (
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  (Lọc: {doiTacFilterRa !== 'all' ? doiTacFilterRa : ''} {donViFilterRa !== 'all' ? `— ĐV: ${donViFilterRa}` : ''} {searchRa ? `— "${searchRa}"` : ''})
                </p>
              )}
            </div>

            {/* Table */}
            <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-xs)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-[12px] border-collapse" aria-label="Báo cáo đoàn ra">
                  <thead>
                    <tr className="bg-surface-2/80 text-left">
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 text-center whitespace-nowrap w-10">TT</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap min-w-[120px]">CV Tổng cục</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap min-w-[120px]">CV Đơn vị</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap min-w-[140px]">Trích yếu</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap min-w-[120px]">Số quyết định</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap">Người nhận</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap">Đơn vị</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap text-center">SL</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 min-w-[200px]">Trưởng đoàn</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap min-w-[120px]">Nước đi</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap text-center">TG Đi</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap text-center">TG Về</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap min-w-[100px]">TG cụ thể</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 min-w-[200px]">Mục đích</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap min-w-[130px]">Đối tác mới</th>
                      <th className="px-2 py-2.5 text-[10px] text-muted-foreground uppercase tracking-wide border border-border/50 whitespace-nowrap min-w-[100px]">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRa.map((d) => (
                      <tr key={d.id} className="border-b border-border/40 hover:bg-accent/30 transition-colors">
                        <td className="px-2 py-2.5 text-center text-foreground border border-border/30">{d.stt}</td>
                        <td className="px-2 py-2.5 text-foreground border border-border/30">{d.congVanTongCuc}</td>
                        <td className="px-2 py-2.5 text-foreground border border-border/30">{d.congVanDonVi}</td>
                        <td className="px-2 py-2.5 text-foreground border border-border/30">{d.trichYeu}</td>
                        <td className="px-2 py-2.5 text-foreground border border-border/30">{d.soQuyetDinh || '—'}</td>
                        <td className="px-2 py-2.5 text-foreground border border-border/30">{d.nguoiNhan}</td>
                        <td className="px-2 py-2.5 text-foreground border border-border/30">{d.donVi}</td>
                        <td className="px-2 py-2.5 text-center text-foreground border border-border/30" style={{ fontWeight: 600 }}>{d.soLuong}</td>
                        <td className="px-2 py-2.5 text-foreground border border-border/30">{d.truongDoan}</td>
                        <td className="px-2 py-2.5 text-foreground border border-border/30">{d.nuocDi}</td>
                        <td className="px-2 py-2.5 text-center text-foreground border border-border/30">{d.thoiGianDi}</td>
                        <td className="px-2 py-2.5 text-center text-foreground border border-border/30">{d.thoiGianVe}</td>
                        <td className="px-2 py-2.5 text-foreground border border-border/30">{d.thoiGianCuThe}</td>
                        <td className="px-2 py-2.5 text-foreground border border-border/30">{d.mucDich}</td>
                        <td className="px-2 py-2.5 text-foreground border border-border/30">{d.doiTacMoi}</td>
                        <td className="px-2 py-2.5 text-muted-foreground border border-border/30">{d.ghiChu || '—'}</td>
                      </tr>
                    ))}
                    {filteredRa.length === 0 && (
                      <tr>
                        <td colSpan={16} className="text-center py-12 text-muted-foreground">
                          <Filter className="w-8 h-8 mx-auto mb-2 opacity-20" />
                          Không có dữ liệu phù hợp
                        </td>
                      </tr>
                    )}
                    {/* Footer tổng */}
                    {filteredRa.length > 0 && (
                      <tr className="bg-surface-2/60 border-t-2 border-border">
                        <td colSpan={7} className="px-2 py-2.5 text-[12px] text-foreground border border-border/30 text-right" style={{ fontWeight: 600 }}>TỔNG CỘNG</td>
                        <td className="px-2 py-2.5 text-center text-foreground border border-border/30 text-[13px]" style={{ fontWeight: 700 }}>{raStats.totalNguoi}</td>
                        <td colSpan={8} className="px-2 py-2.5 text-[12px] text-muted-foreground border border-border/30">
                          {filteredRa.length} đoàn — {raStats.soNuoc} quốc gia
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
