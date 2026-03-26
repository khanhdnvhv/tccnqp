import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { Search, Download, LogIn, LogOut, Filter, History, Calendar } from 'lucide-react';
import { entryLogs, type EntryLog, visitorTypeLabels, visitorTypeColors } from '../data/visitorData';

type EventFilter = 'all' | 'in' | 'out';

export function EntryHistoryPage() {
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState<EventFilter>('all');
  const [dateFrom, setDateFrom] = useState('2026-03-25');
  const [dateTo, setDateTo] = useState('2026-03-26');

  const filtered = useMemo(() => {
    let data = [...entryLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (eventFilter !== 'all') data = data.filter((l) => l.event === eventFilter);
    if (dateFrom) data = data.filter((l) => l.timestamp.split('T')[0] >= dateFrom);
    if (dateTo) data = data.filter((l) => l.timestamp.split('T')[0] <= dateTo);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter((l) =>
        l.fullName.toLowerCase().includes(q) ||
        l.idNumber.includes(q) ||
        l.organization.toLowerCase().includes(q) ||
        l.gate.toLowerCase().includes(q)
      );
    }
    return data;
  }, [search, eventFilter, dateFrom, dateTo]);

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return {
      date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
  };

  const totalIn = filtered.filter((l) => l.event === 'in').length;
  const totalOut = filtered.filter((l) => l.event === 'out').length;

  return (
    <PageTransition>
      <Header title="Lịch sử ra vào" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: History, label: 'Tổng sự kiện', value: filtered.length, color: 'text-primary', bg: 'bg-primary/10' },
            { icon: LogIn, label: 'Lượt vào', value: totalIn, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
            { icon: LogOut, label: 'Lượt ra', value: totalOut, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
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

        {/* Filters */}
        <div className="bg-card rounded-xl border border-border p-4" style={{ boxShadow: 'var(--shadow-xs)' }}>
          <div className="flex flex-wrap items-center gap-3">
            {/* Event type */}
            <div className="flex items-center gap-1 p-1 bg-surface-2 rounded-xl">
              {[
                { key: 'all' as EventFilter, label: 'Tất cả' },
                { key: 'in' as EventFilter, label: 'Vào' },
                { key: 'out' as EventFilter, label: 'Ra' },
              ].map((opt) => (
                <button key={opt.key} onClick={() => setEventFilter(opt.key)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] transition-colors ${eventFilter === opt.key ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}>
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Date range */}
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-1.5 bg-surface-2 rounded-xl text-[12px] border border-transparent focus:border-primary/20 outline-none" />
              <span className="text-muted-foreground text-[12px]">—</span>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-1.5 bg-surface-2 rounded-xl text-[12px] border border-transparent focus:border-primary/20 outline-none" />
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
              <input type="text" placeholder="Tìm tên, CCCD, cổng..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-surface-2 rounded-xl text-[13px] border border-transparent focus:border-primary/20 outline-none" />
            </div>

            <button className="ml-auto flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] text-muted-foreground hover:bg-accent border border-border transition-colors">
              <Download className="w-3.5 h-3.5" /> Xuất file
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-xs)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]" role="grid" aria-label="Lịch sử ra vào">
              <thead>
                <tr className="border-b border-border bg-surface-2/60 text-left">
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">#</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Thời gian</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Sự kiện</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Họ tên & CCCD</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Đơn vị</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Loại</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Cổng</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Cán bộ trực</th>
                  <th className="px-4 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, idx) => {
                  const dt = formatDateTime(log.timestamp);
                  const typeColor = visitorTypeColors[log.type];
                  const isIn = log.event === 'in';
                  return (
                    <tr key={log.id} className="border-b border-border/60 hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground text-[12px]">{idx + 1}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <p className="text-[12px] text-foreground">{dt.time}</p>
                        <p className="text-[10px] text-muted-foreground">{dt.date}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] ${
                          isIn
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                            : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                        }`}>
                          {isIn ? <LogIn className="w-3 h-3" /> : <LogOut className="w-3 h-3" />}
                          {isIn ? 'Vào' : 'Ra'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground truncate max-w-[150px]">{log.fullName}</p>
                        <p className="text-[11px] text-muted-foreground">{log.idNumber}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-foreground truncate max-w-[160px]">{log.organization}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] ${typeColor.bg} ${typeColor.text}`}>
                          {visitorTypeLabels[log.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-muted-foreground whitespace-nowrap">{log.gate}</td>
                      <td className="px-4 py-3 text-[12px] text-muted-foreground truncate max-w-[130px]">{log.officer}</td>
                      <td className="px-4 py-3 text-[11px] text-muted-foreground truncate max-w-[120px]">{log.note || '—'}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted-foreground text-[13px]">
                      <Filter className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      Không có dữ liệu phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-border bg-surface-2/50 text-[12px] text-muted-foreground">
              Hiển thị {filtered.length} sự kiện
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
