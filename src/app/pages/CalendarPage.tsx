import { motion } from 'motion/react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRovingTabindex } from '../hooks/useRovingTabindex';
import { useFocusReturn } from '../hooks/useFocusReturn';
import { Header } from '../components/Header';
import { PageTransition } from '../components/PageTransition';
import { useAuth } from '../context/AuthContext';
import { useFocusTrap } from '../hooks/useFocusTrap';
import { calendarEvents as initialEvents, meetingRooms, eventTypeLabels, type CalendarEvent, type EventType, type MeetingRoom } from '../data/taskData';
import {
  ChevronLeft, ChevronRight, Clock, MapPin, Plus, X, Users,
  Monitor, Calendar, Check, AlertCircle, Eye, Trash2, Building2,
  Wifi, Mic, Camera, Coffee,
} from 'lucide-react';
import { toast as sonnerToast } from 'sonner';

const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
const hours = Array.from({ length: 12 }, (_, i) => i + 7); // 7:00 - 18:00

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDayOfMonth(y: number, m: number) { return new Date(y, m, 1).getDay(); }

export function CalendarPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [currentDate, setCurrentDate] = useState(new Date(2026, 2, 17));
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'rooms'>('month');
  const [selectedDate, setSelectedDate] = useState<string>('2026-03-17');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  // Focus return for modals
  useFocusReturn(!!selectedEvent);
  useFocusReturn(showCreate);

  const calViewKeys = useMemo(() => ['month', 'week', 'rooms'] as const, []);
  const { getTabIndex: getCalTabIndex, handleTablistKeyDown: handleCalTablistKeyDown } = useRovingTabindex(
    calViewKeys as unknown as string[],
    viewMode,
    (key) => setViewMode(key as any),
  );

  // Escape key handler for modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showCreate) setShowCreate(false);
        else if (selectedEvent) setSelectedEvent(null);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [showCreate, selectedEvent]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const showToast = (msg: string) => { sonnerToast.success(msg); };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.date === dateStr);
  };

  const selectedDayEvents = useMemo(() => {
    return events.filter((e) => e.date === selectedDate).sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [events, selectedDate]);

  // Week view: get 7 days starting from Monday of current week
  const weekDays = useMemo(() => {
    const d = new Date(selectedDate);
    const dayOfWeek = d.getDay();
    const monday = new Date(d);
    monday.setDate(d.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      return day;
    });
  }, [selectedDate]);

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  // Create form
  const [createForm, setCreateForm] = useState({
    title: '', description: '', date: selectedDate, startTime: '09:00', endTime: '10:00',
    location: '', type: 'meeting' as EventType, roomId: '', attendees: '',
  });

  const handleCreate = () => {
    if (!createForm.title.trim()) return;
    // Check room conflict
    if (createForm.roomId) {
      const conflict = events.find((e) => e.date === createForm.date && e.roomId === createForm.roomId &&
        ((createForm.startTime >= e.startTime && createForm.startTime < e.endTime) ||
         (createForm.endTime > e.startTime && createForm.endTime <= e.endTime)));
      if (conflict) {
        showToast('Phòng họp đã được đặt trong khung giờ này!');
        return;
      }
    }
    const room = meetingRooms.find((r) => r.id === createForm.roomId);
    const newEvent: CalendarEvent = {
      id: `EVT-${Date.now()}`, title: createForm.title, description: createForm.description,
      date: createForm.date, startTime: createForm.startTime, endTime: createForm.endTime,
      location: room?.name || createForm.location, type: createForm.type,
      color: createForm.type === 'meeting' ? '#1e40af' : createForm.type === 'deadline' ? '#dc2626' : createForm.type === 'event' ? '#059669' : '#f59e0b',
      creatorId: user?.id || '', creatorName: user?.fullName || '',
      attendees: createForm.attendees ? createForm.attendees.split(',').map((s) => s.trim()) : [],
      roomId: createForm.roomId || undefined, isAllDay: false, status: 'scheduled',
    };
    setEvents([...events, newEvent]);
    setShowCreate(false);
    showToast('Tạo sự kiện thành công!');
    setCreateForm({ title: '', description: '', date: selectedDate, startTime: '09:00', endTime: '10:00', location: '', type: 'meeting', roomId: '', attendees: '' });
  };

  const handleDelete = (eventId: string) => {
    setEvents(events.filter((e) => e.id !== eventId));
    setSelectedEvent(null);
    showToast('Đã xóa sự kiện');
  };

  // Room availability for selected date
  const getRoomBookings = (roomId: string) => {
    return events.filter((e) => e.date === selectedDate && e.roomId === roomId);
  };

  return (
    <PageTransition>
      <Header title="Lịch làm việc & Phòng họp" />
      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-full">
          {/* Main Calendar */}
          <div className="xl:col-span-3 bg-card rounded-xl border border-border overflow-hidden flex flex-col" style={{ boxShadow: 'var(--shadow-xs)' }}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <div className="flex items-center gap-1 bg-surface-2 rounded-lg p-0.5" role="tablist" aria-label="Chế độ xem lịch" onKeyDown={handleCalTablistKeyDown}>
                {[
                  { key: 'month', label: 'Tháng' },
                  { key: 'week', label: 'Tuần' },
                  { key: 'rooms', label: 'Phòng họp' },
                ].map((v) => (
                  <button key={v.key} onClick={() => setViewMode(v.key as any)}
                    role="tab" aria-selected={viewMode === v.key} aria-controls={`tabpanel-${v.key}`} id={`tab-${v.key}`}
                    tabIndex={getCalTabIndex(v.key)}
                    className={`px-3 py-1.5 rounded-md text-[12px] transition-all ${viewMode === v.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
                    style={viewMode === v.key ? { boxShadow: 'var(--shadow-sm)' } : undefined}>
                    {v.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Tháng trước"><ChevronLeft className="w-4 h-4 text-muted-foreground" /></button>
                <h3 className="text-foreground min-w-[140px] text-center text-[14px]" style={{ fontFamily: "var(--font-display)" }}>{monthNames[month]} {year}</h3>
                <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-accent transition-colors" aria-label="Tháng sau"><ChevronRight className="w-4 h-4 text-muted-foreground" /></button>
              </div>
              <button onClick={() => { setCreateForm({ ...createForm, date: selectedDate }); setShowCreate(true); }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-primary text-primary-foreground rounded-xl text-[12px] hover:opacity-90 transition-all active:scale-[0.98]"
                style={{ boxShadow: 'var(--shadow-sm)' }}>
                <Plus className="w-4 h-4" /> Thêm sự kiện
              </button>
            </div>

            {/* MONTH VIEW */}
            {viewMode === 'month' && (
              <div role="tabpanel" id="tabpanel-month" aria-labelledby="tab-month">
                <div className="grid grid-cols-7 border-b border-border">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="text-center py-2.5 text-[11px] text-muted-foreground">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 flex-1">
                  {calendarDays.map((day, idx) => {
                    const evts = day ? getEventsForDay(day) : [];
                    const dateStr = day ? `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                    const isToday = dateStr === '2026-03-17';
                    const isSelected = dateStr === selectedDate;
                    return (
                      <div key={idx}
                        className={`min-h-[90px] border-b border-r border-border/30 p-1.5 transition-colors ${
                          day ? 'hover:bg-accent/20 cursor-pointer' : 'bg-muted/10'
                        } ${isSelected ? 'bg-primary/5 ring-1 ring-primary/20' : ''}`}
                        onClick={() => day && setSelectedDate(dateStr)}
                        aria-label={day ? `Ngày ${day} ${monthNames[month]}, ${evts.length > 0 ? evts.length + ' sự kiện' : 'không có sự kiện'}` : undefined}
                        aria-current={isToday ? 'date' : undefined}
                        role={day ? 'button' : undefined}
                        tabIndex={day ? 0 : undefined}
                        onKeyDown={day ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDate(dateStr); } } : undefined}
                      >
                        {day && (
                          <>
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[12px] ${
                              isToday ? 'bg-primary text-primary-foreground' : isSelected ? 'bg-primary/10 text-primary' : 'text-foreground'
                            }`}>{day}</span>
                            <div className="space-y-0.5 mt-0.5">
                              {evts.slice(0, 2).map((evt) => (
                                <div key={evt.id} onClick={(e) => { e.stopPropagation(); setSelectedEvent(evt); }}
                                  className="text-[10px] px-1.5 py-0.5 rounded truncate text-white hover:opacity-90"
                                  style={{ backgroundColor: evt.color }}
                                  role="button" tabIndex={0} aria-label={`${evt.title}${evt.startTime !== evt.endTime ? ', ' + evt.startTime + '-' + evt.endTime : ''}`}
                                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); setSelectedEvent(evt); } }}>
                                  {evt.startTime !== evt.endTime && <span className="opacity-80">{evt.startTime} </span>}
                                  {evt.title}
                                </div>
                              ))}
                              {evts.length > 2 && (
                                <span className="text-[10px] text-primary px-1.5">+{evts.length - 2} khác</span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* WEEK VIEW */}
            {viewMode === 'week' && (
              <div className="flex-1 overflow-auto" role="tabpanel" id="tabpanel-week" aria-labelledby="tab-week">
                <div className="flex min-w-[700px]">
                  {/* Time column */}
                  <div className="w-16 shrink-0 border-r border-border">
                    <div className="h-10 border-b border-border" />
                    {hours.map((h) => (
                      <div key={h} className="h-16 border-b border-border/30 flex items-start justify-center pt-1">
                        <span className="text-[10px] text-muted-foreground">{String(h).padStart(2, '0')}:00</span>
                      </div>
                    ))}
                  </div>
                  {/* Day columns */}
                  {weekDays.map((day) => {
                    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                    const dayEvents = events.filter((e) => e.date === dateStr);
                    const isToday = dateStr === '2026-03-17';
                    return (
                      <div key={dateStr} className={`flex-1 border-r border-border/30 ${isToday ? 'bg-primary/3' : ''}`}>
                        <div className={`h-10 border-b border-border flex flex-col items-center justify-center ${isToday ? 'bg-primary/5' : ''}`}>
                          <span className="text-[10px] text-muted-foreground">{daysOfWeek[day.getDay()]}</span>
                          <span className={`text-[12px] ${isToday ? 'text-primary bg-primary/10 rounded-full w-6 h-6 flex items-center justify-center' : 'text-foreground'}`}>
                            {day.getDate()}
                          </span>
                        </div>
                        <div className="relative">
                          {hours.map((h) => (
                            <div key={h} className="h-16 border-b border-border/20" />
                          ))}
                          {/* Events */}
                          {dayEvents.map((evt) => {
                            const startH = parseInt(evt.startTime.split(':')[0]);
                            const startM = parseInt(evt.startTime.split(':')[1] || '0');
                            const endH = parseInt(evt.endTime.split(':')[0]);
                            const endM = parseInt(evt.endTime.split(':')[1] || '0');
                            const top = ((startH - 7) * 64) + (startM / 60 * 64);
                            const height = Math.max(24, ((endH - startH) * 64) + ((endM - startM) / 60 * 64));
                            return (
                              <div key={evt.id} onClick={() => setSelectedEvent(evt)}
                                className="absolute left-0.5 right-0.5 rounded-md px-1.5 py-1 text-white text-[10px] cursor-pointer hover:opacity-90 overflow-hidden"
                                style={{ top: `${top}px`, height: `${height}px`, backgroundColor: evt.color, zIndex: 5 }}
                                role="button" tabIndex={0} aria-label={`${evt.title}, ${evt.startTime}-${evt.endTime}`}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedEvent(evt); } }}>
                                <p className="truncate">{evt.title}</p>
                                <p className="opacity-80 truncate">{evt.startTime}-{evt.endTime}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ROOMS VIEW */}
            {viewMode === 'rooms' && (
              <div className="flex-1 overflow-auto p-5 space-y-4" role="tabpanel" id="tabpanel-rooms" aria-labelledby="tab-rooms">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-[13px] text-foreground">Phòng họp ngày {new Date(selectedDate).toLocaleDateString('vi-VN')}</span>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {meetingRooms.map((room) => {
                    const bookings = getRoomBookings(room.id);
                    return (
                      <div key={room.id} className="rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border" style={{ borderLeftWidth: '4px', borderLeftColor: room.color }}>
                          <div>
                            <h4 className="text-[14px] text-foreground">{room.name}</h4>
                            <p className="text-[11px] text-muted-foreground">{room.floor} | {room.capacity} chỗ</p>
                          </div>
                          <button onClick={() => { setCreateForm({ ...createForm, date: selectedDate, roomId: room.id, location: room.name }); setShowCreate(true); }}
                            aria-label={`Đặt ${room.name}`}
                            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-[11px] hover:opacity-90">
                            Đặt phòng
                          </button>
                        </div>
                        <div className="p-3">
                          {/* Equipment */}
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {room.equipment.map((eq) => (
                              <span key={eq} className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground flex items-center gap-0.5">
                                {eq.includes('Máy chiếu') ? <Monitor className="w-3 h-3" /> :
                                 eq.includes('Micro') ? <Mic className="w-3 h-3" /> :
                                 eq.includes('Camera') ? <Camera className="w-3 h-3" /> :
                                 eq.includes('cà phê') ? <Coffee className="w-3 h-3" /> :
                                 <Wifi className="w-3 h-3" />}
                                {eq}
                              </span>
                            ))}
                          </div>
                          {/* Timeline */}
                          <div className="relative h-8 bg-accent/30 rounded-lg overflow-hidden">
                            {/* Hour markers */}
                            {[7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17].map((h) => (
                              <div key={h} className="absolute top-0 bottom-0 border-l border-border/30" style={{ left: `${((h - 7) / 11) * 100}%` }}>
                                <span className="text-[8px] text-muted-foreground absolute -top-0 left-0.5">{h}</span>
                              </div>
                            ))}
                            {/* Bookings */}
                            {bookings.map((b) => {
                              const sH = parseInt(b.startTime.split(':')[0]);
                              const eH = parseInt(b.endTime.split(':')[0]);
                              const sM = parseInt(b.startTime.split(':')[1] || '0');
                              const eM = parseInt(b.endTime.split(':')[1] || '0');
                              const left = ((sH - 7 + sM / 60) / 11) * 100;
                              const width = ((eH - sH + (eM - sM) / 60) / 11) * 100;
                              return (
                                <div key={b.id} className="absolute top-1 bottom-1 rounded-md cursor-pointer hover:opacity-80"
                                  style={{ left: `${left}%`, width: `${width}%`, backgroundColor: b.color }}
                                  onClick={() => setSelectedEvent(b)} title={`${b.startTime}-${b.endTime}: ${b.title}`}
                                  role="img" aria-label={`${b.title}, ${b.startTime}-${b.endTime}`}>
                                  <span className="text-[8px] text-white px-1 truncate block leading-snug">{b.title}</span>
                                </div>
                              );
                            })}
                          </div>
                          {/* Bookings list */}
                          {bookings.length > 0 ? (
                            <div className="mt-2 space-y-1">
                              {bookings.map((b) => (
                                <div key={b.id} className="flex items-center gap-2 text-[11px] text-muted-foreground px-1">
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: b.color }} />
                                  <span>{b.startTime}-{b.endTime}</span>
                                  <span className="text-foreground truncate">{b.title}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-muted-foreground mt-2 text-center">Trống cả ngày</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-border">
              <h3 className="text-foreground text-[14px]">
                {new Date(selectedDate).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
              </h3>
              <p className="text-[12px] text-muted-foreground mt-0.5" aria-live="polite">{selectedDayEvents.length} sự kiện</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-[13px] text-muted-foreground">Không có sự kiện</p>
                  <button onClick={() => { setCreateForm({ ...createForm, date: selectedDate }); setShowCreate(true); }}
                    className="mt-2 text-[12px] text-primary hover:underline">+ Thêm sự kiện</button>
                </div>
              ) : selectedDayEvents.map((evt) => {
                const typeCfg = eventTypeLabels[evt.type];
                return (
                  <div key={evt.id} onClick={() => setSelectedEvent(evt)}
                    className="p-3.5 rounded-lg border border-border hover:border-primary/20 transition-colors cursor-pointer"
                    style={{ borderLeftWidth: '3px', borderLeftColor: evt.color }}>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${typeCfg.bg} ${typeCfg.color}`}>{typeCfg.label}</span>
                      {evt.roomId && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Building2 className="w-3 h-3" />{meetingRooms.find((r) => r.id === evt.roomId)?.name}</span>}
                    </div>
                    <p className="text-[13px] text-foreground mb-1.5">{evt.title}</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{evt.startTime} - {evt.endTime}</span>
                      </div>
                      {evt.location && (
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{evt.location}</span>
                        </div>
                      )}
                      {evt.attendees.length > 0 && (
                        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                          <Users className="w-3.5 h-3.5" />
                          <span>{evt.attendees.slice(0, 3).join(', ')}{evt.attendees.length > 3 ? ` +${evt.attendees.length - 3}` : ''}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mini rooms status */}
            <div className="border-t border-border px-4 py-3">
              <h4 className="text-[12px] text-muted-foreground mb-2 flex items-center gap-1"><Building2 className="w-3.5 h-3.5" /> Trạng thái phòng họp</h4>
              <div className="grid grid-cols-2 gap-1.5">
                {meetingRooms.slice(0, 4).map((room) => {
                  const booked = getRoomBookings(room.id).length > 0;
                  return (
                    <div key={room.id} className={`text-[10px] px-2 py-1.5 rounded-lg flex items-center gap-1.5 ${booked ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${booked ? 'bg-red-400' : 'bg-emerald-400'}`} />
                      {room.name.replace('Phòng ', '')}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onDelete={(id) => handleDelete(id)} />
      )}

      {/* Create Event Modal */}
      {showCreate && (
        <CreateEventModal
          createForm={createForm}
          setCreateForm={setCreateForm}
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </PageTransition>
  );
}

// ==========================================
// EVENT DETAIL MODAL
// ==========================================
function EventDetailModal({ event, onClose, onDelete }: {
  event: CalendarEvent;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const dialogRef = useFocusTrap<HTMLDivElement>(true);
  const typeCfg = eventTypeLabels[event.type];
  const room = event.roomId ? meetingRooms.find((r) => r.id === event.roomId) : null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-md" onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-labelledby="event-detail-title"
        style={{ boxShadow: 'var(--shadow-xl)' }}
        ref={dialogRef}>
        <div className="px-6 py-4 border-b border-border" style={{ borderTopWidth: '4px', borderTopColor: event.color, borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${typeCfg.bg} ${typeCfg.color}`}>
                  {typeCfg.label}
                </span>
              </div>
              <h3 id="event-detail-title" className="text-foreground" style={{ fontFamily: "var(--font-display)" }}>{event.title}</h3>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-accent transition-colors" aria-label="Đóng"><X className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="p-6 space-y-3">
          {event.description && (
            <p className="text-[13px] text-foreground p-3 bg-accent/30 rounded-lg">{event.description}</p>
          )}
          <div className="flex items-center gap-3 text-[13px]">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{event.startTime} - {event.endTime}</span>
          </div>
          <div className="flex items-center gap-3 text-[13px]">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{new Date(event.date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
          </div>
          {(event.location || room) && (
            <div className="flex items-center gap-3 text-[13px]">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{event.location || room?.name}</span>
            </div>
          )}
          {event.attendees.length > 0 && (
            <div className="flex items-start gap-3 text-[13px]">
              <Users className="w-4 h-4 text-muted-foreground mt-0.5" />
              <div className="flex flex-wrap gap-1.5">
                {event.attendees.map((a) => (
                  <span key={a} className="text-[11px] px-2 py-0.5 rounded-lg bg-secondary text-secondary-foreground">{a}</span>
                ))}
              </div>
            </div>
          )}
          {room && (
            <div className="p-3 bg-accent/20 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-[13px] text-foreground">{room.name}</span>
                <span className="text-[11px] text-muted-foreground">({room.capacity} chỗ)</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {room.equipment.map((eq) => (
                  <span key={eq} className="text-[10px] px-2 py-0.5 rounded-full bg-card text-muted-foreground">{eq}</span>
                ))}
              </div>
            </div>
          )}
          <div className="text-[11px] text-muted-foreground pt-2 border-t border-border">
            Tạo bởi: {event.creatorName}
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={() => onDelete(event.id)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-[13px] transition-colors">
            <Trash2 className="w-4 h-4" /> Xóa
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-[13px] text-muted-foreground hover:bg-accent transition-colors">Đóng</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CREATE EVENT MODAL
// ==========================================
function CreateEventModal({ createForm, setCreateForm, onClose, onCreate }: {
  createForm: {
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    type: EventType;
    roomId: string;
    attendees: string;
  };
  setCreateForm: (form: {
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    location: string;
    type: EventType;
    roomId: string;
    attendees: string;
  }) => void;
  onClose: () => void;
  onCreate: () => void;
}) {
  const dialogRef = useFocusTrap<HTMLDivElement>(true);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-lg" onClick={(e) => e.stopPropagation()}
        role="dialog" aria-modal="true" aria-labelledby="create-event-title"
        style={{ boxShadow: 'var(--shadow-xl)' }}
        ref={dialogRef}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 id="create-event-title" className="text-foreground" style={{ fontFamily: "var(--font-display)" }}>Thêm sự kiện mới</h3>
          <button onClick={() => onClose()} className="p-1.5 rounded-lg hover:bg-accent transition-colors" aria-label="Đóng"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label htmlFor="event-title" className="block text-[13px] text-foreground mb-1.5">Tiêu đề *</label>
            <input id="event-title" type="text" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              aria-required="true"
              className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 focus:ring-2 focus:ring-primary/10 outline-none" />
          </div>
          <div>
            <label htmlFor="event-description" className="block text-[13px] text-foreground mb-1.5">Mô tả</label>
            <textarea id="event-description" rows={2} value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none resize-none" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="event-date" className="block text-[13px] text-foreground mb-1.5">Ngày</label>
              <input id="event-date" type="date" value={createForm.date} onChange={(e) => setCreateForm({ ...createForm, date: e.target.value })}
                aria-required="true"
                className="w-full px-3 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none" />
            </div>
            <div>
              <label htmlFor="event-start-time" className="block text-[13px] text-foreground mb-1.5">Bắt đầu</label>
              <input id="event-start-time" type="time" value={createForm.startTime} onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                aria-required="true"
                className="w-full px-3 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none" />
            </div>
            <div>
              <label htmlFor="event-end-time" className="block text-[13px] text-foreground mb-1.5">Kết thúc</label>
              <input id="event-end-time" type="time" value={createForm.endTime} onChange={(e) => setCreateForm({ ...createForm, endTime: e.target.value })}
                aria-required="true"
                className="w-full px-3 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="event-type" className="block text-[13px] text-foreground mb-1.5">Loại sự kiện</label>
              <select id="event-type" value={createForm.type} onChange={(e) => setCreateForm({ ...createForm, type: e.target.value as EventType })}
                className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                <option value="meeting">Cuộc họp</option>
                <option value="event">Sự kiện</option>
                <option value="deadline">Hạn chót</option>
                <option value="reminder">Nhắc nhở</option>
              </select>
            </div>
            <div>
              <label htmlFor="event-room" className="block text-[13px] text-foreground mb-1.5">Phòng họp</label>
              <select id="event-room" value={createForm.roomId} onChange={(e) => {
                const room = meetingRooms.find((r) => r.id === e.target.value);
                setCreateForm({ ...createForm, roomId: e.target.value, location: room?.name || '' });
              }}
                className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none cursor-pointer">
                <option value="">-- Không đặt phòng --</option>
                {meetingRooms.map((r) => <option key={r.id} value={r.id}>{r.name} ({r.capacity} chỗ)</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="event-attendees" className="block text-[13px] text-foreground mb-1.5">Người tham dự (phân cách bằng dấu phẩy)</label>
            <input id="event-attendees" type="text" value={createForm.attendees} onChange={(e) => setCreateForm({ ...createForm, attendees: e.target.value })}
              placeholder="VD: Nguyễn Văn An, Lê Thị Hương..."
              className="w-full px-3.5 py-2.5 bg-input-background rounded-lg text-[13px] border border-transparent focus:border-primary/30 outline-none" />
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
          <button onClick={() => onClose()} className="px-4 py-2 rounded-xl text-[13px] text-muted-foreground hover:bg-accent transition-colors">Hủy</button>
          <button onClick={onCreate} disabled={!createForm.title.trim()}
            className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-[13px] hover:opacity-90 disabled:opacity-40 transition-all active:scale-[0.98]"
            style={{ boxShadow: 'var(--shadow-sm)' }}>
            Tạo sự kiện
          </button>
        </div>
      </div>
    </div>
  );
}