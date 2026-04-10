import { useState, useMemo } from 'react';
import { Plus, Trash2, Check, ShoppingCart } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import type { ShoppingCategory, ShoppingItem } from '../types';

const CATEGORIES: ShoppingCategory[] = [
  'Produce', 'Dairy', 'Meat', 'Bakery', 'Frozen',
  'Beverages', 'Snacks', 'Household', 'Personal Care', 'Other',
];

const CATEGORY_EMOJI: Record<ShoppingCategory, string> = {
  Produce: '🥦',
  Dairy: '🥛',
  Meat: '🥩',
  Bakery: '🍞',
  Frozen: '🧊',
  Beverages: '🥤',
  Snacks: '🍿',
  Household: '🧴',
  'Personal Care': '🪥',
  Other: '🛒',
};


interface ItemForm {
  name: string;
  quantity: string;
  category: ShoppingCategory;
  addedBy: string;
}

const DEFAULT_FORM: ItemForm = { name: '', quantity: '', category: 'Other', addedBy: '' };

export function Shopping() {
  const { state, addShoppingItem, deleteShoppingItem, toggleShoppingItem, clearCheckedItems } = useFamily();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ItemForm>(DEFAULT_FORM);
  const [quickAdd, setQuickAdd] = useState('');

  const grouped = useMemo(() => {
    const unchecked = state.shoppingItems.filter(i => !i.checked);
    const checked = state.shoppingItems.filter(i => i.checked);
    const groups: Record<string, ShoppingItem[]> = {};
    unchecked.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return { groups, checked, unchecked };
  }, [state.shoppingItems]);

  const handleSave = () => {
    if (!form.name.trim()) return;
    addShoppingItem({ ...form, name: form.name.trim(), addedBy: form.addedBy || null, checked: false });
    setForm(DEFAULT_FORM);
    setModalOpen(false);
  };

  const handleQuickAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && quickAdd.trim()) {
      addShoppingItem({ name: quickAdd.trim(), quantity: '', category: 'Other', addedBy: null, checked: false });
      setQuickAdd('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping List</h1>
          <p className="text-gray-500 text-sm mt-1">
            {grouped.unchecked.length} items remaining · {grouped.checked.length} checked
          </p>
        </div>
        <div className="flex gap-2">
          {grouped.checked.length > 0 && (
            <Button variant="secondary" size="sm" onClick={clearCheckedItems}>
              Clear Checked
            </Button>
          )}
          <Button onClick={() => setModalOpen(true)} size="sm"><Plus size={16} /> Add Item</Button>
        </div>
      </div>

      {/* Quick add */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3">
        <ShoppingCart size={18} className="text-gray-400 shrink-0" />
        <input
          className="flex-1 text-sm focus:outline-none placeholder:text-gray-300"
          placeholder="Quick add — type an item and press Enter..."
          value={quickAdd}
          onChange={e => setQuickAdd(e.target.value)}
          onKeyDown={handleQuickAdd}
        />
      </div>

      {/* Empty state */}
      {state.shoppingItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-4xl mb-3">🛒</p>
          <p className="text-gray-500">Your shopping list is empty!</p>
          <p className="text-gray-400 text-sm mt-1">Add items to get started.</p>
        </div>
      ) : (
        <>
          {/* Grouped unchecked items */}
          {Object.entries(grouped.groups).map(([category, items]) => (
            <div key={category} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-50">
                <span className="text-lg">{CATEGORY_EMOJI[category as ShoppingCategory]}</span>
                <h2 className="text-sm font-semibold text-gray-700">{category}</h2>
                <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map(item => <ShoppingItemRow key={item.id} item={item} onToggle={toggleShoppingItem} onDelete={deleteShoppingItem} members={state.members} />)}
              </div>
            </div>
          ))}

          {/* Checked items */}
          {grouped.checked.length > 0 && (
            <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3 border-b border-gray-100">
                <Check size={14} className="text-emerald-500" />
                <h2 className="text-sm font-semibold text-gray-500">In the cart ({grouped.checked.length})</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {grouped.checked.map(item => <ShoppingItemRow key={item.id} item={item} onToggle={toggleShoppingItem} onDelete={deleteShoppingItem} members={state.members} />)}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Shopping Item">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name *</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              placeholder="e.g. Almond milk"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                placeholder="e.g. 2 boxes"
                value={form.quantity}
                onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Added by</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                value={form.addedBy}
                onChange={e => setForm(f => ({ ...f, addedBy: e.target.value }))}
              >
                <option value="">Unknown</option>
                {state.members.map(m => <option key={m.id} value={m.id}>{m.avatar} {m.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setForm(f => ({ ...f, category: cat }))}
                  className={`flex items-center gap-1.5 px-2 py-2 rounded-xl text-xs font-medium border transition-all ${form.category === cat ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <span>{CATEGORY_EMOJI[cat]}</span>
                  <span className="truncate">{cat}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1" onClick={handleSave} disabled={!form.name.trim()}>Add to List</Button>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ShoppingItemRow({ item, onToggle, onDelete, members }: {
  item: ShoppingItem;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  members: import('../types').FamilyMember[];
}) {
  const addedBy = members.find(m => m.id === item.addedBy);
  return (
    <div className={`flex items-center gap-3 px-5 py-3 ${item.checked ? 'opacity-60' : ''}`}>
      <button
        onClick={() => onToggle(item.id)}
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${item.checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-emerald-400'}`}
      >
        {item.checked && <Check size={11} className="text-white" strokeWidth={3} />}
      </button>
      <div className="flex-1 min-w-0">
        <span className={`text-sm font-medium ${item.checked ? 'line-through text-gray-400' : 'text-gray-700'}`}>{item.name}</span>
        {item.quantity && <span className="text-xs text-gray-400 ml-2">{item.quantity}</span>}
      </div>
      {addedBy && (
        <span className="text-xs shrink-0" style={{ color: addedBy.color }}>{addedBy.avatar}</span>
      )}
      <button onClick={() => onDelete(item.id)} className="p-1 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors">
        <Trash2 size={13} />
      </button>
    </div>
  );
}
