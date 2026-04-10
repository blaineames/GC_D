import { useState, useMemo } from 'react';
import { Plus, Trash2, Edit2, CheckCircle2, Circle, Filter } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { Chore, ChoreFrequency, ChoreStatus } from '../types';

const FREQUENCY_LABELS: Record<ChoreFrequency, string> = {
  once: 'One-time',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

const STATUS_LABELS: Record<ChoreStatus, string> = {
  pending: 'To Do',
  in_progress: 'In Progress',
  done: 'Done',
};

interface ChoreForm {
  title: string;
  description: string;
  assignedTo: string;
  frequency: ChoreFrequency;
  status: ChoreStatus;
  dueDate: string;
  points: number;
}

const DEFAULT_FORM: ChoreForm = {
  title: '', description: '', assignedTo: '', frequency: 'weekly',
  status: 'pending', dueDate: '', points: 10,
};

export function Chores() {
  const { state, addChore, updateChore, deleteChore, toggleChore } = useFamily();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ChoreForm>(DEFAULT_FORM);
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [memberFilter, setMemberFilter] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return state.chores.filter(c => {
      if (filter === 'pending' && c.status === 'done') return false;
      if (filter === 'done' && c.status !== 'done') return false;
      if (memberFilter !== 'all' && c.assignedTo !== memberFilter) return false;
      return true;
    }).sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      return a.title.localeCompare(b.title);
    });
  }, [state.chores, filter, memberFilter]);

  const stats = useMemo(() => ({
    total: state.chores.length,
    done: state.chores.filter(c => c.status === 'done').length,
    pending: state.chores.filter(c => c.status !== 'done').length,
  }), [state.chores]);

  const openAdd = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setModalOpen(true);
  };

  const openEdit = (chore: Chore) => {
    setEditingId(chore.id);
    setForm({
      title: chore.title,
      description: chore.description,
      assignedTo: chore.assignedTo ?? '',
      frequency: chore.frequency,
      status: chore.status,
      dueDate: chore.dueDate ?? '',
      points: chore.points,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const data = {
      title: form.title.trim(),
      description: form.description.trim(),
      assignedTo: form.assignedTo || null,
      frequency: form.frequency,
      status: form.status,
      dueDate: form.dueDate || null,
      points: form.points,
    };
    if (editingId) {
      updateChore(editingId, data);
    } else {
      addChore(data);
    }
    setModalOpen(false);
  };

  const getMember = (id: string | null) => state.members.find(m => m.id === id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Chores & Tasks</h1>
          <p className="text-gray-500 text-sm mt-1">{stats.pending} pending · {stats.done} completed</p>
        </div>
        <Button onClick={openAdd} size="sm"><Plus size={16} /> Add Chore</Button>
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm text-gray-500">{stats.done}/{stats.total} complete</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3">
            <div className="h-3 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all" style={{ width: `${(stats.done / stats.total) * 100}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{Math.round((stats.done / stats.total) * 100)}% done</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium"><Filter size={13} /> Filter:</div>
        {(['all', 'pending', 'done'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filter === f ? 'bg-indigo-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            {f === 'all' ? 'All' : f === 'pending' ? 'To Do' : 'Done'}
          </button>
        ))}
        <div className="h-4 w-px bg-gray-200 mx-1" />
        <button
          onClick={() => setMemberFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${memberFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          All Members
        </button>
        {state.members.map(m => (
          <button
            key={m.id}
            onClick={() => setMemberFilter(m.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${memberFilter === m.id ? 'text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            style={memberFilter === m.id ? { backgroundColor: m.color } : undefined}
          >
            {m.avatar} {m.name}
          </button>
        ))}
      </div>

      {/* Chore list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-gray-500 text-sm">No chores matching the current filters</p>
          </div>
        ) : (
          filtered.map(chore => {
            const member = getMember(chore.assignedTo);
            const isDone = chore.status === 'done';
            return (
              <div
                key={chore.id}
                className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3 hover:shadow-md transition-shadow ${isDone ? 'opacity-75' : ''}`}
              >
                <button onClick={() => toggleChore(chore.id)} className="mt-0.5 shrink-0 transition-colors">
                  {isDone
                    ? <CheckCircle2 size={22} className="text-emerald-500" />
                    : <Circle size={22} className="text-gray-300 hover:text-indigo-400" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-medium text-gray-800 ${isDone ? 'line-through text-gray-400' : ''}`}>{chore.title}</p>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-xs font-semibold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">+{chore.points}pt</span>
                      <button onClick={() => openEdit(chore)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => setDeleteConfirm(chore.id)} className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  {chore.description && <p className="text-sm text-gray-400 mt-0.5 truncate">{chore.description}</p>}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge>{FREQUENCY_LABELS[chore.frequency]}</Badge>
                    {chore.dueDate && (
                      <Badge className={new Date(chore.dueDate) < new Date() && !isDone ? '!bg-red-50 !text-red-500' : ''}>
                        Due {new Date(chore.dueDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Badge>
                    )}
                    {member ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: member.color + '20', color: member.color }}>
                        {member.avatar} {member.name}
                      </span>
                    ) : (
                      <Badge>Unassigned</Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Chore' : 'Add Chore'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="e.g. Vacuum the living room"
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign to</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.assignedTo}
                onChange={e => setForm(f => ({ ...f, assignedTo: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {state.members.map(m => <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.frequency}
                onChange={e => setForm(f => ({ ...f, frequency: e.target.value as ChoreFrequency }))}
              >
                {Object.entries(FREQUENCY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.dueDate}
                onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Points</label>
              <input
                type="number"
                min={1}
                max={100}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.points}
                onChange={e => setForm(f => ({ ...f, points: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="flex gap-2">
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <button
                  key={k}
                  onClick={() => setForm(f => ({ ...f, status: k as ChoreStatus }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-all ${form.status === k ? 'bg-indigo-500 text-white border-indigo-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={handleSave} disabled={!form.title.trim()}>
              {editingId ? 'Save Changes' : 'Add Chore'}
            </Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Chore" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Are you sure you want to delete this chore?</p>
          <div className="flex gap-2">
            <Button variant="danger" className="flex-1" onClick={() => { deleteConfirm && deleteChore(deleteConfirm); setDeleteConfirm(null); }}>
              <Trash2 size={14} /> Delete
            </Button>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
