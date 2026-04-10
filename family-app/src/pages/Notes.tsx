import { useState } from 'react';
import { Plus, Pin, Trash2, Edit2 } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import type { FamilyNote } from '../types';

const NOTE_COLORS = ['#fef3c7', '#e0f2fe', '#fce7f3', '#d1fae5', '#ede9fe', '#fee2e2', '#f3f4f6'];

interface NoteForm {
  content: string;
  color: string;
  pinned: boolean;
  createdBy: string;
}

const DEFAULT_FORM: NoteForm = { content: '', color: NOTE_COLORS[0], pinned: false, createdBy: '' };

export function Notes() {
  const { state, addNote, updateNote, deleteNote } = useFamily();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<NoteForm>(DEFAULT_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const pinned = state.notes.filter(n => n.pinned);
  const unpinned = state.notes.filter(n => !n.pinned);

  const openAdd = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setModalOpen(true);
  };

  const openEdit = (note: FamilyNote) => {
    setEditingId(note.id);
    setForm({ content: note.content, color: note.color, pinned: note.pinned, createdBy: note.createdBy ?? '' });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.content.trim()) return;
    const data = { content: form.content.trim(), color: form.color, pinned: form.pinned, createdBy: form.createdBy || null };
    if (editingId) updateNote(editingId, data);
    else addNote(data);
    setModalOpen(false);
  };

  const NoteCard = ({ note }: { note: FamilyNote }) => {
    const author = state.members.find(m => m.id === note.createdBy);
    return (
      <div className="rounded-2xl p-4 shadow-sm border border-black/5 group relative" style={{ backgroundColor: note.color }}>
        <div className="flex items-start justify-between gap-2 mb-2">
          {note.pinned && <Pin size={14} className="text-gray-500 shrink-0 mt-0.5" />}
          <div className="flex-1" />
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => updateNote(note.id, { pinned: !note.pinned })}
              className={`p-1 rounded-lg hover:bg-black/10 transition-colors ${note.pinned ? 'text-gray-700' : 'text-gray-400'}`}
              title={note.pinned ? 'Unpin' : 'Pin'}
            >
              <Pin size={13} />
            </button>
            <button onClick={() => openEdit(note)} className="p-1 rounded-lg hover:bg-black/10 text-gray-400 transition-colors"><Edit2 size={13} /></button>
            <button onClick={() => setDeleteConfirm(note.id)} className="p-1 rounded-lg hover:bg-red-200 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={13} /></button>
          </div>
        </div>
        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{note.content}</p>
        <div className="flex items-center justify-between mt-3">
          {author && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span>{author.avatar}</span> {author.name}
            </span>
          )}
          <span className="text-xs text-gray-400 ml-auto">
            {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Family Notes</h1>
          <p className="text-gray-500 text-sm mt-1">{state.notes.length} note{state.notes.length !== 1 ? 's' : ''} · {pinned.length} pinned</p>
        </div>
        <Button onClick={openAdd} size="sm"><Plus size={16} /> Add Note</Button>
      </div>

      {state.notes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-gray-500">No notes yet. Add one to get started!</p>
        </div>
      ) : (
        <>
          {pinned.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2"><Pin size={13} /> Pinned</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinned.map(note => <NoteCard key={note.id} note={note} />)}
              </div>
            </section>
          )}
          {unpinned.length > 0 && (
            <section>
              {pinned.length > 0 && <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Other Notes</h2>}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unpinned.map(note => <NoteCard key={note.id} note={note} />)}
              </div>
            </section>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Note' : 'Add Note'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
              rows={4}
              placeholder="Write your note here..."
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {NOTE_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-9 h-9 rounded-xl border-2 transition-all ${form.color === c ? 'border-gray-700 scale-110' : 'border-transparent hover:border-gray-300'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.createdBy}
                onChange={e => setForm(f => ({ ...f, createdBy: e.target.value }))}
              >
                <option value="">Anonymous</option>
                {state.members.map(m => <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pin note</label>
              <button
                onClick={() => setForm(f => ({ ...f, pinned: !f.pinned }))}
                className={`w-full py-2 rounded-xl text-sm font-medium border transition-all ${form.pinned ? 'bg-amber-400 text-white border-amber-400' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                <Pin size={14} className="inline mr-1.5" />
                {form.pinned ? 'Pinned' : 'Pin it'}
              </button>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={handleSave} disabled={!form.content.trim()}>
              {editingId ? 'Save Changes' : 'Add Note'}
            </Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Note" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Delete this note permanently?</p>
          <div className="flex gap-2">
            <Button variant="danger" className="flex-1" onClick={() => { deleteConfirm && deleteNote(deleteConfirm); setDeleteConfirm(null); }}>
              <Trash2 size={14} /> Delete
            </Button>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
