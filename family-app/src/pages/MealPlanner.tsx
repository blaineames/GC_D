import { useState, useMemo } from 'react';
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import type { Meal, MealType } from '../types';

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const MEAL_TYPE_CONFIG: Record<MealType, { label: string; emoji: string; color: string }> = {
  breakfast: { label: 'Breakfast', emoji: '🌅', color: '#f59e0b' },
  lunch: { label: 'Lunch', emoji: '☀️', color: '#3b82f6' },
  dinner: { label: 'Dinner', emoji: '🌙', color: '#6366f1' },
  snack: { label: 'Snack', emoji: '🍎', color: '#10b981' },
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface MealForm {
  name: string;
  type: MealType;
  date: string;
  notes: string;
  assignedTo: string;
}

export function MealPlanner() {
  const { state, addMeal, deleteMeal } = useFamily();

  // Week starting Sunday
  const [weekStart, setWeekStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().split('T')[0];
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<MealForm>({ name: '', type: 'dinner', date: new Date().toISOString().split('T')[0], notes: '', assignedTo: '' });
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart + 'T00:00:00');
      d.setDate(d.getDate() + i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days;
  }, [weekStart]);

  const mealsByDate = useMemo(() => {
    const map: Record<string, Meal[]> = {};
    state.meals.forEach(m => {
      if (!map[m.date]) map[m.date] = [];
      map[m.date].push(m);
    });
    return map;
  }, [state.meals]);

  const today = new Date().toISOString().split('T')[0];

  const prevWeek = () => {
    const d = new Date(weekStart + 'T00:00:00');
    d.setDate(d.getDate() - 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };

  const nextWeek = () => {
    const d = new Date(weekStart + 'T00:00:00');
    d.setDate(d.getDate() + 7);
    setWeekStart(d.toISOString().split('T')[0]);
  };

  const thisWeek = () => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    setWeekStart(d.toISOString().split('T')[0]);
  };

  const openAdd = (date?: string) => {
    setForm({ name: '', type: 'dinner', date: date ?? today, notes: '', assignedTo: '' });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    addMeal({ name: form.name.trim(), type: form.type, date: form.date, notes: form.notes.trim(), assignedTo: form.assignedTo || null });
    setModalOpen(false);
  };

  const weekLabel = () => {
    const start = new Date(weekStart + 'T00:00:00');
    const end = new Date(weekStart + 'T00:00:00');
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meal Planner</h1>
          <p className="text-gray-500 text-sm mt-1">{state.meals.length} meals planned</p>
        </div>
        <Button onClick={() => openAdd()} size="sm"><Plus size={16} /> Add Meal</Button>
      </div>

      {/* Week navigator */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <button onClick={prevWeek} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><ChevronLeft size={18} /></button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-700">{weekLabel()}</span>
            <button onClick={thisWeek} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">This week</button>
          </div>
          <button onClick={nextWeek} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><ChevronRight size={18} /></button>
        </div>

        {/* Week grid */}
        <div className="overflow-x-auto">
          <div className="grid grid-cols-7 min-w-[700px]">
            {/* Day headers */}
            {weekDays.map((date, i) => {
              const d = new Date(date + 'T00:00:00');
              const isToday = date === today;
              return (
                <div key={date} className={`px-2 pt-3 pb-2 border-r border-gray-50 last:border-r-0 ${isToday ? 'bg-indigo-50' : ''}`}>
                  <div className="text-center">
                    <div className="text-xs text-gray-400 font-medium">{DAY_LABELS[i]}</div>
                    <div className={`text-lg font-bold mx-auto w-8 h-8 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-500 text-white' : 'text-gray-700'}`}>
                      {d.getDate()}
                    </div>
                  </div>
                  <button
                    onClick={() => openAdd(date)}
                    className="mt-2 w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs text-gray-300 hover:text-indigo-400 hover:bg-indigo-50 transition-colors border border-dashed border-gray-200 hover:border-indigo-300"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              );
            })}
          </div>

          {/* Meal rows per type */}
          {MEAL_TYPES.map(type => {
            const config = MEAL_TYPE_CONFIG[type];
            const hasAny = weekDays.some(d => (mealsByDate[d] ?? []).some(m => m.type === type));
            if (!hasAny) return null;
            return (
              <div key={type} className="grid grid-cols-7 border-t border-gray-50 min-w-[700px]">
                {weekDays.map(date => {
                  const meals = (mealsByDate[date] ?? []).filter(m => m.type === type);
                  const isToday = date === today;
                  return (
                    <div key={date} className={`px-2 py-2 border-r border-gray-50 last:border-r-0 min-h-[60px] ${isToday ? 'bg-indigo-50/50' : ''}`}>
                      {meals.map(meal => {
                        const cook = state.members.find(m => m.id === meal.assignedTo);
                        return (
                          <div
                            key={meal.id}
                            className="group relative rounded-lg px-2 py-1.5 mb-1 text-xs font-medium"
                            style={{ backgroundColor: config.color + '15', color: config.color }}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="leading-snug">{config.emoji} {meal.name}</span>
                              <button
                                onClick={() => setDeleteConfirm(meal.id)}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all shrink-0 mt-0.5"
                              >
                                <Trash2 size={11} />
                              </button>
                            </div>
                            {cook && <div className="text-xs opacity-70 mt-0.5">{cook.avatar} {cook.name}</div>}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}

          {/* Empty week message */}
          {!weekDays.some(d => (mealsByDate[d] ?? []).length > 0) && (
            <div className="text-center py-8 text-gray-400 text-sm col-span-7">
              <p className="text-2xl mb-2">🍽️</p>
              <p>No meals planned for this week. Click a day to add!</p>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {MEAL_TYPES.map(type => {
          const config = MEAL_TYPE_CONFIG[type];
          return (
            <div key={type} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: config.color }} />
              {config.emoji} {config.label}
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Plan a Meal">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Meal Name *</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="e.g. Chicken Stir Fry"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cook</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.assignedTo}
                onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
              >
                <option value="">Anyone</option>
                {state.members.map(m => <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Meal Type</label>
            <div className="grid grid-cols-2 gap-2">
              {MEAL_TYPES.map(type => {
                const c = MEAL_TYPE_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => setForm(f => ({ ...f, type }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${form.type === type ? 'text-white border-transparent' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    style={form.type === type ? { backgroundColor: c.color } : undefined}
                  >
                    <span>{c.emoji}</span> {c.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              rows={2}
              placeholder="Recipe notes, dietary restrictions..."
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={handleSave} disabled={!form.name.trim()}>Add Meal</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Remove Meal" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Remove this meal from the plan?</p>
          <div className="flex gap-2">
            <Button variant="danger" className="flex-1" onClick={() => { deleteConfirm && deleteMeal(deleteConfirm); setDeleteConfirm(null); }}>
              <Trash2 size={14} /> Remove
            </Button>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
