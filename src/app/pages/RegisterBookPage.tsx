import { useState, useMemo } from 'react';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { BookOpen, Printer, ChevronLeft, ChevronRight, LogIn, LogOut, Star } from 'lucide-react';
import { visitors, entryLogs, visitorTypeLabels } from '../data/visitorData';

const DATES = ['2026-03-26', '2026-03-25', '2026-03-24'];

const DAY_LABELS: Record<number, string> = {
  0: 'Chủ nhật', 1: 'Thứ hai', 2: 'Thứ ba', 3: 'Thứ tư',
  4: 'Thứ năm', 5: 'Thứ sáu', 6: 'Thứ bảy',
};

function formatFullDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${DAY_LABELS[d.getDay()]}, ngày ${String(d.getDate()).padStart(2, '0')} tháng ${String(d.getMonth() + 1).padStart(2, '0')} năm ${d.getFullYear()}`;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export function RegisterBookPage() {
  const [dateIdx, setDateIdx] = useState(0);
  const currentDate = DATES[dateIdx];

  const dayVisitors = useMemo(() => {
    return visitors.filter((v) => v.createdAt.startsWith(currentDate));
  }, [currentDate]);

  const dayLogs = useMemo(() => {
    return entryLogs
      .filter((l) => l.timestamp.startsWith(currentDate))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [currentDate]);

  const insideCount = dayVisitors.filter((v) => v.status === 'inside' || v.status === 'overstay').length;
  const completedCount = dayVisitors.filter((v) => v.status === 'completed').length;

  return (
    <PageTransition>
      <Header title="Sổ đăng ký đối tác" />
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {/* Date nav */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setDateIdx((i) => Math.min(i + 1, DATES.length - 1))}
              disabled={dateIdx === DATES.length - 1}
              className="p-2 rounded-xl border border-border hover:bg-accent disabled:opacity-40 transition-colors" aria-label="Ngày trước">
              <ChevronLeft className="w-4 h-4 text-muted-foreground" />
            </button>
            <div className="text-center px-4">
              <p className="text-[13px] text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                {formatFullDate(currentDate)}
              </p>
            </div>
            <button onClick={() => setDateIdx((i) => Math.max(i - 1, 0))}
              disabled={dateIdx === 0}
              className="p-2 rounded-xl border border-border hover:bg-accent disabled:opacity-40 transition-colors" aria-label="Ngày sau">
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] text-muted-foreground hover:bg-accent border border-border transition-colors">
            <Printer className="w-3.5 h-3.5" /> In sổ
          </button>
        </div>

        {/* Main register book */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-md)' }}>
          {/* Book header */}
          <div className="px-8 py-6 border-b-2 border-border" style={{
            background: 'linear-gradient(to bottom, var(--surface-2), var(--card))',
          }}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-3.5 h-3.5 text-[#c9a547] fill-[#c9a547]" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em]">Bộ Quốc Phòng</p>
                </div>
                <h2 className="text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                  SỔ ĐĂNG KÝ ĐỐI TÁC VÀO LÀM VIỆC
                </h2>
                <p className="text-[13px] text-muted-foreground mt-1">
                  {formatFullDate(currentDate)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-center px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30">
                  <p className="text-[20px] text-emerald-700 dark:text-emerald-400" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{dayVisitors.length}</p>
                  <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70">Đăng ký</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-primary/5 border border-primary/10">
                  <p className="text-[20px] text-primary" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{insideCount}</p>
                  <p className="text-[11px] text-primary/60">Còn trong</p>
                </div>
                <div className="text-center px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                  <p className="text-[20px] text-gray-600 dark:text-gray-400" style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{completedCount}</p>
                  <p className="text-[11px] text-gray-500/70">Đã ra</p>
                </div>
              </div>
            </div>
          </div>

          {/* Register entries */}
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]" role="grid" aria-label="Sổ đăng ký đối tác">
              <thead>
                <tr className="border-b-2 border-border bg-surface-2 text-left">
                  <th className="px-5 py-3 text-[11px] text-muted-foreground uppercase tracking-wide whitespace-nowrap w-8">STT</th>
                  <th className="px-5 py-3 text-[11px] text-muted-foreground uppercase tracking-wide whitespace-nowrap">Giờ vào</th>
                  <th className="px-5 py-3 text-[11px] text-muted-foreground uppercase tracking-wide whitespace-nowrap">Giờ ra</th>
                  <th className="px-5 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Họ và tên</th>
                  <th className="px-5 py-3 text-[11px] text-muted-foreground uppercase tracking-wide whitespace-nowrap">CCCD/CMND</th>
                  <th className="px-5 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Đơn vị / Tổ chức</th>
                  <th className="px-5 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Mục đích</th>
                  <th className="px-5 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Phân loại</th>
                  <th className="px-5 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Người tiếp</th>
                  <th className="px-5 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Cán bộ duyệt</th>
                  <th className="px-5 py-3 text-[11px] text-muted-foreground uppercase tracking-wide">Ký nhận</th>
                </tr>
              </thead>
              <tbody>
                {dayVisitors.length > 0 ? dayVisitors.map((v, idx) => (
                  <tr key={v.id} className={`border-b border-border/60 hover:bg-accent/20 transition-colors ${idx % 2 === 1 ? 'bg-surface-2/30' : ''}`}>
                    <td className="px-5 py-3 text-[12px] text-muted-foreground text-center">{idx + 1}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {v.checkIn ? (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <LogIn className="w-3 h-3" />
                          <span className="text-[12px]">{formatTime(v.checkIn)}</span>
                        </span>
                      ) : <span className="text-muted-foreground text-[12px]">—</span>}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      {v.checkOut ? (
                        <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
                          <LogOut className="w-3 h-3" />
                          <span className="text-[12px]">{formatTime(v.checkOut)}</span>
                        </span>
                      ) : (
                        v.status === 'inside' || v.status === 'overstay'
                          ? <span className="text-[11px] text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">Còn trong</span>
                          : <span className="text-muted-foreground text-[12px]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-foreground">{v.fullName}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground text-[12px] whitespace-nowrap">{v.idNumber}</td>
                    <td className="px-5 py-3">
                      <p className="text-muted-foreground truncate max-w-[160px]">{v.organization}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-muted-foreground truncate max-w-[180px]">{v.purpose}</p>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-muted-foreground whitespace-nowrap">
                      {visitorTypeLabels[v.type]}
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-muted-foreground truncate max-w-[130px]">{v.hostName}</p>
                      <p className="text-[11px] text-muted-foreground/60 truncate max-w-[130px]">{v.hostUnit}</p>
                    </td>
                    <td className="px-5 py-3 text-[12px] text-muted-foreground truncate max-w-[120px]">{v.approvedBy}</td>
                    <td className="px-5 py-3">
                      <div className="w-20 h-8 border border-dashed border-border rounded flex items-center justify-center">
                        <span className="text-[10px] text-muted-foreground/30">Ký</span>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={11} className="text-center py-12 text-muted-foreground text-[13px]">
                      <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-20" />
                      Không có đăng ký nào ngày {currentDate}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Signature section */}
          {dayVisitors.length > 0 && (
            <div className="px-8 py-6 border-t-2 border-border bg-surface-2/40">
              <div className="grid grid-cols-3 gap-8 text-center">
                {[
                  { title: 'Cán bộ trực ban', sub: '(Ký, ghi rõ họ tên)' },
                  { title: 'Trưởng ca bảo vệ', sub: '(Ký, ghi rõ họ tên)' },
                  { title: 'Chỉ huy trực tiếp', sub: '(Ký, đóng dấu)' },
                ].map((sig) => (
                  <div key={sig.title}>
                    <p className="text-[12px] text-foreground" style={{ fontFamily: 'var(--font-display)' }}>{sig.title}</p>
                    <p className="text-[10px] text-muted-foreground mb-12">{sig.sub}</p>
                    <div className="border-b border-dashed border-border" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Entry log section */}
        {dayLogs.length > 0 && (
          <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-xs)' }}>
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                Nhật ký ra vào chi tiết — {formatFullDate(currentDate)}
              </h3>
            </div>
            <div className="divide-y divide-border/50">
              {dayLogs.map((log, idx) => (
                <div key={log.id} className="flex items-center gap-4 px-5 py-3 hover:bg-accent/20 transition-colors">
                  <span className="text-[11px] text-muted-foreground w-6 text-right shrink-0">{idx + 1}</span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    log.event === 'in'
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                  }`}>
                    {log.event === 'in' ? <LogIn className="w-3.5 h-3.5" /> : <LogOut className="w-3.5 h-3.5" />}
                  </div>
                  <div className="w-16 shrink-0">
                    <p className="text-[12px] text-foreground">{formatTime(log.timestamp)}</p>
                    <p className="text-[10px] text-muted-foreground">{log.event === 'in' ? 'VÀO' : 'RA'}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-foreground truncate">{log.fullName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{log.organization}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">{log.gate}</span>
                  <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">{log.officer}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
