import { useState } from 'react';
import { Plus, Trash2, Edit2, Crown, Star } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import type { FamilyMember, MemberRole } from '../types';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#f97316', '#8b5cf6', '#14b8a6'];
const AVATARS = ['👨', '👩', '🧒', '👧', '🧑', '👦', '👴', '👵', '🧔', '👱'];

interface MemberFormData {
  name: string;
  role: MemberRole;
  color: string;
  avatar: string;
}

const DEFAULT_FORM: MemberFormData = { name: '', role: 'child', color: COLORS[0], avatar: AVATARS[0] };

export function Members() {
  const { state, addMember, updateMember, deleteMember, setFamilyName } = useFamily();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MemberFormData>(DEFAULT_FORM);
  const [editingFamilyName, setEditingFamilyName] = useState(false);
  const [familyNameDraft, setFamilyNameDraft] = useState(state.familyName);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openAdd = () => {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setModalOpen(true);
  };

  const openEdit = (member: FamilyMember) => {
    setEditingId(member.id);
    setForm({ name: member.name, role: member.role, color: member.color, avatar: member.avatar });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updateMember(editingId, form);
    } else {
      addMember(form);
    }
    setModalOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteMember(id);
    setDeleteConfirm(null);
  };

  const getMemberStats = (id: string) => {
    const completed = state.chores.filter(c => c.assignedTo === id && c.status === 'done');
    const pending = state.chores.filter(c => c.assignedTo === id && c.status !== 'done');
    const points = completed.reduce((s, c) => s + c.points, 0);
    return { completed: completed.length, pending: pending.length, points };
  };

  const parents = state.members.filter(m => m.role === 'parent');
  const children = state.members.filter(m => m.role === 'child');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Family Members</h1>
          <p className="text-gray-500 text-sm mt-1">{state.members.length} member{state.members.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => { setEditingFamilyName(true); setFamilyNameDraft(state.familyName); }}>
            Rename Family
          </Button>
          <Button onClick={openAdd} size="sm">
            <Plus size={16} /> Add Member
          </Button>
        </div>
      </div>

      {/* Family name edit */}
      {editingFamilyName && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium shrink-0">Family name:</span>
          <input
            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            value={familyNameDraft}
            onChange={e => setFamilyNameDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setFamilyName(familyNameDraft); setEditingFamilyName(false); } }}
            autoFocus
          />
          <Button size="sm" onClick={() => { setFamilyName(familyNameDraft); setEditingFamilyName(false); }}>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => setEditingFamilyName(false)}>Cancel</Button>
        </div>
      )}

      {/* Parents section */}
      {parents.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2"><Crown size={14} /> Parents / Guardians</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {parents.map(member => <MemberCard key={member.id} member={member} stats={getMemberStats(member.id)} onEdit={openEdit} onDelete={id => setDeleteConfirm(id)} />)}
          </div>
        </section>
      )}

      {/* Children section */}
      {children.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2"><Star size={14} /> Children</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map(member => <MemberCard key={member.id} member={member} stats={getMemberStats(member.id)} onEdit={openEdit} onDelete={id => setDeleteConfirm(id)} />)}
          </div>
        </section>
      )}

      {state.members.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">👨‍👩‍👧‍👦</p>
          <p className="text-gray-500">No family members yet. Add your first one!</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Edit Member' : 'Add Family Member'}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="Enter name..."
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <div className="flex gap-2">
              {(['parent', 'child'] as MemberRole[]).map(role => (
                <button
                  key={role}
                  onClick={() => setForm(f => ({ ...f, role }))}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-all ${form.role === role ? 'bg-indigo-500 text-white border-indigo-500' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  {role === 'parent' ? '👑 Parent' : '⭐ Child'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Avatar</label>
            <div className="flex flex-wrap gap-2">
              {AVATARS.map(av => (
                <button
                  key={av}
                  onClick={() => setForm(f => ({ ...f, avatar: av }))}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${form.avatar === av ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setForm(f => ({ ...f, color: c }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${form.color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={handleSave} disabled={!form.name.trim()}>
              {editingId ? 'Save Changes' : 'Add Member'}
            </Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Remove Member" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Are you sure you want to remove this family member? This won't delete their assigned chores.</p>
          <div className="flex gap-2">
            <Button variant="danger" className="flex-1" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
              <Trash2 size={14} /> Remove
            </Button>
            <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function MemberCard({ member, stats, onEdit, onDelete }: {
  member: FamilyMember;
  stats: { completed: number; pending: number; points: number };
  onEdit: (m: FamilyMember) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-2" style={{ backgroundColor: member.color }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl text-2xl flex items-center justify-center border-2" style={{ backgroundColor: member.color + '20', borderColor: member.color + '40' }}>
              {member.avatar}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{member.name}</h3>
              <Badge color={member.role === 'parent' ? '#6366f1' : '#f59e0b'}>
                {member.role === 'parent' ? '👑 Parent' : '⭐ Child'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => onEdit(member)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
              <Edit2 size={14} />
            </button>
            <button onClick={() => onDelete(member.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gray-50 rounded-xl py-2">
            <div className="text-lg font-bold text-gray-800">{stats.points}</div>
            <div className="text-xs text-gray-400">pts</div>
          </div>
          <div className="bg-gray-50 rounded-xl py-2">
            <div className="text-lg font-bold text-emerald-600">{stats.completed}</div>
            <div className="text-xs text-gray-400">done</div>
          </div>
          <div className="bg-gray-50 rounded-xl py-2">
            <div className="text-lg font-bold text-amber-500">{stats.pending}</div>
            <div className="text-xs text-gray-400">pending</div>
          </div>
        </div>
      </div>
    </div>
  );
}
