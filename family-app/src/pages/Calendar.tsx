import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Edit2 } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import type { FamilyEvent } from '../types';

const EVENT_COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f97316', '#8b5cf6', '#ef4444'];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

interface EventForm {
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  color: string;
  assignedTo: string[];
}

function makeDefaultForm(date?: string): EventForm {
  return { title: '', description: '', date: date ?? new Date().toISOString().split('T')[0], time: '09:00', endTime: '', color: EVENT_COLORS[0], assignedTo: [] };
}

export function Calendar() {
  const { state, addEvent, updateEvent, deleteEvent } = useFamily();
  const today = new Date().toISOString().split('T')[0];

  const [current, setCurrent] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<EventForm>(makeDefaultForm());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { year, month } = current;
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const calDays = useMemo(() => {
    const days: Array<{ date: string; day: number; isToday: boolean; isOtherMonth: boolean }> = [];
    // Padding from previous month
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      days.push({ date: d.toISOString().split('T')[0], day: prevMonthDays - i, isToday: false, isOtherMonth: true });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d).toISOString().split('T')[0];
      days.push({ date, day: d, isToday: date === today, isOtherMonth: false });
    }
    // Fill remaining
    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const date = new Date(year, month + 1, d).toISOString().split('T')[0];
      days.push({ date, day: d, isToday: false, isOtherMonth: true });
    }
    return days;
  }, [year, month, today, firstDay, daysInMonth]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, FamilyEvent[]> = {};
    state.events.forEach(ev => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [state.events]);

  const selectedEvents = useMemo(() => {
    if (!selectedDay) return [];
    return (eventsByDate[selectedDay] ?? []).sort((a, b) => a.time.localeCompare(b.time));
  }, [selectedDay, eventsByDate]);

  const upcomingEvents = useMemo(() => {
    return state.events
      .filter(e => e.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
      .slice(0, 10);
  }, [state.events, today]);

  const openAdd = (date?: string) => {
    setEditingId(null);
    setForm(makeDefaultForm(date));
    setModalOpen(true);
  };

  const openEdit = (ev: FamilyEvent) => {
    setEditingId(ev.id);
    setForm({ title: ev.title, description: ev.description, date: ev.date, time: ev.time, endTime: ev.endTime ?? '', color: ev.color, assignedTo: [...ev.assignedTo] });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.date) return;
    const data = { title: form.title.trim(), description: form.description.trim(), date: form.date, time: form.time, endDate: null, endTime: form.endTime || null, color: form.color, assignedTo: form.assignedTo };
    if (editingId) updateEvent(editingId, data);
    else addEvent(data);
    setModalOpen(false);
  };

  const toggleMember = (id: string) => {
    setForm(f => ({
      ...f,
      assignedTo: f.assignedTo.includes(id) ? f.assignedTo.filter(x => x !== id) : [...f.assignedTo, id],
    }));
  };

  const prevMonth = () => setCurrent(c => {
    if (c.month === 0) return { year: c.year - 1, month: 11 };
    return { ...c, month: c.month - 1 };
  });

  const nextMonth = () => setCurrent(c => {
    if (c.month === 11) return { year: c.year + 1, month: 0 };
    return { ...c, month: c.month + 1 };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Family Calendar</h1>
          <p className="text-gray-500 text-sm mt-1">{state.events.length} event{state.events.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => openAdd()} size="sm"><Plus size={16} /> Add Event</Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><ChevronLeft size={18} /></button>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-800">{MONTHS[month]} {year}</h2>
              <button
                onClick={() => { const d = new Date(); setCurrent({ year: d.getFullYear(), month: d.getMonth() }); }}
                className="text-xs text-indigo-500 hover:text-indigo-700 font-medium"
              >
                Today
              </button>
            </div>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><ChevronRight size={18} /></button>
          </div>
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-100">
            {DAYS.map(d => <div key={d} className="text-center py-2 text-xs font-medium text-gray-400">{d}</div>)}
          </div>
          {/* Day cells */}
          <div className="grid grid-cols-7">
            {calDays.map(({ date, day, isToday, isOtherMonth }) => {
              const dayEvents = eventsByDate[date] ?? [];
              const isSelected = selectedDay === date;
              return (
                <div
                  key={date}
                  onClick={() => setSelectedDay(isSelected ? null : date)}
                  className={`min-h-[72px] p-1 border-b border-r border-gray-50 cursor-pointer transition-colors ${isOtherMonth ? 'bg-gray-50/50' : 'hover:bg-indigo-50/50'} ${isSelected ? 'bg-indigo-50' : ''}`}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium mx-auto mb-1 ${isToday ? 'bg-indigo-500 text-white' : isOtherMonth ? 'text-gray-300' : 'text-gray-700'}`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 2).map(ev => (
                      <div key={ev.id} className="text-xs px-1 py-0.5 rounded truncate font-medium" style={{ backgroundColor: ev.color + '20', color: ev.color }}>
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && <div className="text-xs text-gray-400 px-1">+{dayEvents.length - 2} more</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-4">
          {/* Selected day events */}
          {selectedDay && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">
                  {new Date(selectedDay + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </h3>
                <button onClick={() => openAdd(selectedDay)} className="p-1 rounded-lg hover:bg-gray-100 text-indigo-500">
                  <Plus size={16} />
                </button>
              </div>
              {selectedEvents.length === 0 ? (
                <p className="px-5 py-4 text-sm text-gray-400 text-center">No events — click + to add one</p>
              ) : (
                <div className="divide-y divide-gray-50">
                  {selectedEvents.map(ev => {
                    const members = state.members.filter(m => ev.assignedTo.includes(m.id));
                    return (
                      <div key={ev.id} className="flex items-start gap-2.5 px-4 py-3">
                        <div className="w-1 rounded-full self-stretch min-h-[2rem] mt-0.5 shrink-0" style={{ backgroundColor: ev.color }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{ev.title}</p>
                          <p className="text-xs text-gray-400">{ev.time}{ev.endTime ? ` – ${ev.endTime}` : ''}</p>
                          {ev.description && <p className="text-xs text-gray-400 mt-0.5">{ev.description}</p>}
                          <div className="flex gap-0.5 mt-1.5">
                            {members.map(m => <span key={m.id} title={m.name} className="text-sm">{m.avatar}</span>)}
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => openEdit(ev)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400"><Edit2 size={12} /></button>
                          <button onClick={() => setDeleteConfirm(ev.id)} className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Upcoming events */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Upcoming Events</h3>
            </div>
            {upcomingEvents.length === 0 ? (
              <p className="px-5 py-4 text-sm text-gray-400 text-center">No upcoming events</p>
            ) : (
              <div className="divide-y divide-gray-50">
                {upcomingEvents.map(ev => {
                  const d = new Date(ev.date + 'T00:00:00');
                  const isToday = ev.date === today;
                  return (
                    <div
                      key={ev.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => { setSelectedDay(ev.date); setCurrent({ year: d.getFullYear(), month: d.getMonth() }); }}
                    >
                      <div className="w-9 h-9 rounded-xl flex flex-col items-center justify-center shrink-0" style={{ backgroundColor: ev.color + '15', color: ev.color }}>
                        <span className="text-xs font-bold leading-none">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                        <span className="text-sm font-bold leading-none">{d.getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                        <p className="text-xs text-gray-400">{isToday ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' })} · {ev.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Event' : 'Add Event'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Event title..."
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              rows={2}
              placeholder="Optional details..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start time</label>
              <input
                type="time"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End time</label>
              <input
                type="time"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.endTime}
                onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2">
              {EVENT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          {state.members.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Attendees</label>
              <div className="flex flex-wrap gap-2">
                {state.members.map(m => (
                  <button
                    key={m.id}
                    onClick={() => toggleMember(m.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${form.assignedTo.includes(m.id) ? 'text-white border-transparent' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    style={form.assignedTo.includes(m.id) ? { backgroundColor: m.color } : undefined}
                  >
                    {m.avatar} {m.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={handleSave} disabled={!form.title.trim()}>
              {editingId ? 'Save Changes' : 'Add Event'}
            </Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Event" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Are you sure you want to delete this event?</p>
          <div className="flex gap-2">
            <Button variant="danger" className="flex-1" onClick={() => { deleteConfirm && deleteEvent(deleteConfirm); setDeleteConfirm(null); }}>
              <Trash2 size={14} /> Delete
            </Button>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
