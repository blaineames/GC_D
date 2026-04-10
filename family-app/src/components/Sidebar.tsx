import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  ShoppingCart,
  Calendar,
  UtensilsCrossed,
  StickyNote,
  Home,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useFamily } from '../context/FamilyContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/members', label: 'Family', icon: Users },
  { to: '/chores', label: 'Chores', icon: CheckSquare },
  { to: '/shopping', label: 'Shopping', icon: ShoppingCart },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/meals', label: 'Meals', icon: UtensilsCrossed },
  { to: '/notes', label: 'Notes', icon: StickyNote },
];

export function Sidebar() {
  const { state } = useFamily();
  const [mobileOpen, setMobileOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              isActive
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Home size={16} className="text-white" />
          </div>
          <span className="font-semibold text-gray-800">{state.familyName}</span>
        </div>
        <button onClick={() => setMobileOpen(v => !v)} className="p-2 rounded-lg hover:bg-gray-100">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="relative bg-white w-64 h-full shadow-xl flex flex-col pt-4 gap-4">
            <div className="flex items-center gap-2 px-6">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                <Home size={16} className="text-white" />
              </div>
              <span className="font-semibold text-gray-800">{state.familyName}</span>
            </div>
            {nav}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 min-h-screen bg-white border-r border-gray-200 shrink-0">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
            <Home size={18} className="text-white" />
          </div>
          <div>
            <div className="text-xs text-gray-400 font-medium">Home</div>
            <div className="text-sm font-semibold text-gray-800 leading-tight">{state.familyName}</div>
          </div>
        </div>
        <div className="flex-1 py-4 overflow-y-auto">
          {nav}
        </div>
        <div className="px-5 py-4 border-t border-gray-100">
          <div className="flex flex-wrap gap-1">
            {state.members.map(m => (
              <div
                key={m.id}
                title={m.name}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-white shadow-sm"
                style={{ backgroundColor: m.color + '30', color: m.color, borderColor: m.color + '40' }}
              >
                {m.avatar}
              </div>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
