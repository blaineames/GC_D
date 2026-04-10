import { Link } from 'react-router-dom';
import { CheckSquare, ShoppingCart, Calendar, UtensilsCrossed, TrendingUp, Star } from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { Badge } from '../components/ui/Badge';

export function Dashboard() {
  const { state } = useFamily();

  const today = new Date().toISOString().split('T')[0];
  const pendingChores = state.chores.filter(c => c.status !== 'done');
  const dueToday = state.chores.filter(c => c.dueDate === today && c.status !== 'done');
  const uncheckedItems = state.shoppingItems.filter(i => !i.checked);
  const todayEvents = state.events
    .filter(e => e.date === today)
    .sort((a, b) => a.time.localeCompare(b.time));
  const upcomingEvents = state.events
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
    .slice(0, 5);
  const todayMeals = state.meals.filter(m => m.date === today);
  const pinnedNotes = state.notes.filter(n => n.pinned);

  // Calculate member points
  const memberPoints = state.members.map(member => {
    const completedChores = state.chores.filter(c => c.assignedTo === member.id && c.status === 'done');
    const totalPoints = completedChores.reduce((sum, c) => sum + c.points, 0);
    return { member, points: totalPoints };
  }).sort((a, b) => b.points - a.points);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T00:00:00');
    const diff = Math.round((d.getTime() - new Date(today + 'T00:00:00').getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const mealTypeOrder: Record<string, number> = { breakfast: 0, lunch: 1, dinner: 2, snack: 3 };
  const mealTypeLabel: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Good {getGreeting()}, {state.familyName}! 👋</h1>
        <p className="text-gray-500 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          to="/chores"
          icon={<CheckSquare className="text-indigo-500" size={20} />}
          label="Pending Chores"
          value={pendingChores.length}
          sub={dueToday.length > 0 ? `${dueToday.length} due today` : 'Nothing due today'}
          color="indigo"
        />
        <StatCard
          to="/shopping"
          icon={<ShoppingCart className="text-emerald-500" size={20} />}
          label="Shopping Items"
          value={uncheckedItems.length}
          sub={`${state.shoppingItems.length} total items`}
          color="emerald"
        />
        <StatCard
          to="/calendar"
          icon={<Calendar className="text-sky-500" size={20} />}
          label="Today's Events"
          value={todayEvents.length}
          sub={upcomingEvents.length > 0 ? `${upcomingEvents.length} upcoming` : 'All clear!'}
          color="sky"
        />
        <StatCard
          to="/meals"
          icon={<UtensilsCrossed className="text-orange-500" size={20} />}
          label="Meals Planned"
          value={todayMeals.length}
          sub="Today"
          color="orange"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's schedule */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Calendar size={16} className="text-sky-500" /> Today</h2>
            <Link to="/calendar" className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {todayEvents.length === 0 && todayMeals.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-400 text-center">Nothing scheduled for today</p>
            ) : (
              <>
                {todayEvents.map(ev => {
                  const members = state.members.filter(m => ev.assignedTo.includes(m.id));
                  return (
                    <div key={ev.id} className="flex items-start gap-3 px-5 py-3">
                      <div className="w-1 h-full rounded-full self-stretch mt-1 min-h-[2rem]" style={{ backgroundColor: ev.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                        <p className="text-xs text-gray-400">{ev.time}{ev.endTime ? ` – ${ev.endTime}` : ''}</p>
                      </div>
                      <div className="flex -space-x-1">
                        {members.slice(0, 3).map(m => (
                          <div key={m.id} className="w-6 h-6 rounded-full text-xs flex items-center justify-center border border-white" style={{ backgroundColor: m.color + '30' }}>{m.avatar}</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {todayMeals.sort((a, b) => mealTypeOrder[a.type] - mealTypeOrder[b.type]).map(meal => {
                  const cook = state.members.find(m => m.id === meal.assignedTo);
                  return (
                    <div key={meal.id} className="flex items-start gap-3 px-5 py-3">
                      <div className="w-1 h-full rounded-full self-stretch mt-1 min-h-[2rem] bg-orange-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{meal.name}</p>
                        <p className="text-xs text-gray-400">{mealTypeLabel[meal.type]}{cook ? ` · ${cook.name} cooking` : ''}</p>
                      </div>
                      <span className="text-xs bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">{mealTypeLabel[meal.type]}</span>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* Upcoming events */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><TrendingUp size={16} className="text-indigo-500" /> Upcoming</h2>
            <Link to="/calendar" className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">View calendar</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {upcomingEvents.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-400 text-center">No upcoming events</p>
            ) : (
              upcomingEvents.map(ev => (
                <div key={ev.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-10 h-10 rounded-xl flex flex-col items-center justify-center text-center shrink-0" style={{ backgroundColor: ev.color + '15', color: ev.color }}>
                    <span className="text-xs font-bold leading-none">{new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}</span>
                    <span className="text-base font-bold leading-none">{new Date(ev.date + 'T00:00:00').getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{ev.title}</p>
                    <p className="text-xs text-gray-400">{formatDate(ev.date)} at {ev.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chore leaderboard */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2"><Star size={16} className="text-amber-400" /> Chore Points</h2>
            <Link to="/chores" className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">Manage chores</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {memberPoints.length === 0 ? (
              <p className="px-5 py-6 text-sm text-gray-400 text-center">No members yet</p>
            ) : (
              memberPoints.map(({ member, points }, i) => (
                <div key={member.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="text-sm text-gray-400 w-5 text-center font-medium">{i + 1}</span>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg border-2" style={{ backgroundColor: member.color + '20', borderColor: member.color + '40' }}>
                    {member.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{member.name}</p>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                      <div className="h-1.5 rounded-full" style={{ width: `${Math.min(100, (points / Math.max(1, memberPoints[0].points)) * 100)}%`, backgroundColor: member.color }} />
                    </div>
                  </div>
                  <Badge color={member.color}>{points} pts</Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pinned Notes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">📌 Pinned Notes</h2>
            <Link to="/notes" className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">All notes</Link>
          </div>
          <div className="p-4 flex flex-col gap-3">
            {pinnedNotes.length === 0 ? (
              <p className="py-4 text-sm text-gray-400 text-center">No pinned notes</p>
            ) : (
              pinnedNotes.map(note => {
                const author = state.members.find(m => m.id === note.createdBy);
                return (
                  <div key={note.id} className="rounded-xl p-4 text-sm text-gray-700" style={{ backgroundColor: note.color }}>
                    <p>{note.content}</p>
                    {author && <p className="mt-2 text-xs text-gray-400">— {author.name}</p>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ to, icon, label, value, sub, color }: {
  to: string; icon: React.ReactNode; label: string; value: number; sub: string; color: string;
}) {
  const colors: Record<string, string> = {
    indigo: 'bg-indigo-50',
    emerald: 'bg-emerald-50',
    sky: 'bg-sky-50',
    orange: 'bg-orange-50',
  };
  return (
    <Link to={to} className={`${colors[color]} rounded-2xl p-4 flex flex-col gap-2 hover:shadow-md transition-shadow border border-white`}>
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm">{icon}</div>
        <span className="text-2xl font-bold text-gray-800">{value}</span>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
    </Link>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
