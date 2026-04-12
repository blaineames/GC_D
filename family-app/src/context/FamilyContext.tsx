import React, { createContext, useContext, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type {
  FamilyState,
  FamilyMember,
  Chore,
  ShoppingItem,
  FamilyEvent,
  Meal,
  FamilyNote,
} from '../types';

const SEED_MEMBERS: FamilyMember[] = [
  { id: '1', name: 'Alex', role: 'parent', color: '#6366f1', avatar: '👨', createdAt: new Date().toISOString() },
  { id: '2', name: 'Jordan', role: 'parent', color: '#ec4899', avatar: '👩', createdAt: new Date().toISOString() },
  { id: '3', name: 'Sam', role: 'child', color: '#f59e0b', avatar: '🧒', createdAt: new Date().toISOString() },
];

const SEED_CHORES: Chore[] = [
  { id: '1', title: 'Vacuum living room', description: '', assignedTo: '3', frequency: 'weekly', status: 'pending', dueDate: new Date().toISOString().split('T')[0], points: 10, createdAt: new Date().toISOString(), completedAt: null },
  { id: '2', title: 'Do the dishes', description: '', assignedTo: '2', frequency: 'daily', status: 'done', dueDate: null, points: 5, createdAt: new Date().toISOString(), completedAt: new Date().toISOString() },
  { id: '3', title: 'Take out trash', description: '', assignedTo: '1', frequency: 'weekly', status: 'pending', dueDate: new Date().toISOString().split('T')[0], points: 5, createdAt: new Date().toISOString(), completedAt: null },
];

const SEED_SHOPPING: ShoppingItem[] = [
  { id: '1', name: 'Milk', quantity: '2 gallons', category: 'Dairy', store: 'Whole Foods', checked: false, addedBy: '2', createdAt: new Date().toISOString() },
  { id: '2', name: 'Apples', quantity: '1 bag', category: 'Produce', store: 'Whole Foods', checked: false, addedBy: '3', createdAt: new Date().toISOString() },
  { id: '3', name: 'Bread', quantity: '1 loaf', category: 'Bakery', store: 'Trader Joes', checked: false, addedBy: '1', createdAt: new Date().toISOString() },
  { id: '4', name: 'Olive Oil', quantity: '1 bottle', category: 'Other', store: 'Trader Joes', checked: false, addedBy: '2', createdAt: new Date().toISOString() },
  { id: '5', name: 'Paper Towels', quantity: '12 pack', category: 'Household', store: 'Costco', checked: false, addedBy: '1', createdAt: new Date().toISOString() },
  { id: '6', name: 'Chicken Breast', quantity: '5 lbs', category: 'Meat', store: 'Costco', checked: false, addedBy: '2', createdAt: new Date().toISOString() },
];

const today = new Date();
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

const SEED_EVENTS: FamilyEvent[] = [
  { id: '1', title: 'Family Dinner', description: 'Pizza night!', date: today.toISOString().split('T')[0], time: '18:30', endDate: null, endTime: null, color: '#6366f1', assignedTo: ['1', '2', '3'], createdAt: new Date().toISOString() },
  { id: '2', title: 'Sam\'s Soccer Practice', description: '', date: tomorrow.toISOString().split('T')[0], time: '16:00', endDate: null, endTime: '17:30', color: '#f59e0b', assignedTo: ['3'], createdAt: new Date().toISOString() },
  { id: '3', title: 'Parent-Teacher Conference', description: '', date: nextWeek.toISOString().split('T')[0], time: '10:00', endDate: null, endTime: null, color: '#ec4899', assignedTo: ['1', '2'], createdAt: new Date().toISOString() },
];

const SEED_MEALS: Meal[] = [
  { id: '1', name: 'Pancakes', date: today.toISOString().split('T')[0], type: 'breakfast', notes: '', assignedTo: '1', createdAt: new Date().toISOString() },
  { id: '2', name: 'Pasta Bolognese', date: today.toISOString().split('T')[0], type: 'dinner', notes: 'Use whole wheat pasta', assignedTo: '2', createdAt: new Date().toISOString() },
  { id: '3', name: 'Grilled Chicken', date: tomorrow.toISOString().split('T')[0], type: 'dinner', notes: '', assignedTo: '1', createdAt: new Date().toISOString() },
];

const SEED_NOTES: FamilyNote[] = [
  { id: '1', content: '🎉 Sam got an A on his math test! Great job!', pinned: true, color: '#fef3c7', createdBy: '2', createdAt: new Date().toISOString() },
  { id: '2', content: 'Plumber coming Thursday between 2-4pm', pinned: false, color: '#e0f2fe', createdBy: '1', createdAt: new Date().toISOString() },
];

const INITIAL_STATE: FamilyState = {
  familyName: 'The Smiths',
  members: SEED_MEMBERS,
  chores: SEED_CHORES,
  shoppingItems: SEED_SHOPPING,
  events: SEED_EVENTS,
  meals: SEED_MEALS,
  notes: SEED_NOTES,
};

interface FamilyContextType {
  state: FamilyState;
  // Family name
  setFamilyName: (name: string) => void;
  // Members
  addMember: (member: Omit<FamilyMember, 'id' | 'createdAt'>) => void;
  updateMember: (id: string, updates: Partial<FamilyMember>) => void;
  deleteMember: (id: string) => void;
  // Chores
  addChore: (chore: Omit<Chore, 'id' | 'createdAt' | 'completedAt'>) => void;
  updateChore: (id: string, updates: Partial<Chore>) => void;
  deleteChore: (id: string) => void;
  toggleChore: (id: string) => void;
  // Shopping
  addShoppingItem: (item: Omit<ShoppingItem, 'id' | 'createdAt'>) => void;
  updateShoppingItem: (id: string, updates: Partial<ShoppingItem>) => void;
  deleteShoppingItem: (id: string) => void;
  toggleShoppingItem: (id: string) => void;
  clearCheckedItems: (store?: string) => void;
  // Events
  addEvent: (event: Omit<FamilyEvent, 'id' | 'createdAt'>) => void;
  updateEvent: (id: string, updates: Partial<FamilyEvent>) => void;
  deleteEvent: (id: string) => void;
  // Meals
  addMeal: (meal: Omit<Meal, 'id' | 'createdAt'>) => void;
  updateMeal: (id: string, updates: Partial<Meal>) => void;
  deleteMeal: (id: string) => void;
  // Notes
  addNote: (note: Omit<FamilyNote, 'id' | 'createdAt'>) => void;
  updateNote: (id: string, updates: Partial<FamilyNote>) => void;
  deleteNote: (id: string) => void;
}

const FamilyContext = createContext<FamilyContextType | null>(null);

const genId = () => Math.random().toString(36).slice(2, 10);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useLocalStorage<FamilyState>('family-app-state', INITIAL_STATE);

  const setFamilyName = useCallback((name: string) => {
    setState(s => ({ ...s, familyName: name }));
  }, [setState]);

  // Members
  const addMember = useCallback((member: Omit<FamilyMember, 'id' | 'createdAt'>) => {
    setState(s => ({ ...s, members: [...s.members, { ...member, id: genId(), createdAt: new Date().toISOString() }] }));
  }, [setState]);

  const updateMember = useCallback((id: string, updates: Partial<FamilyMember>) => {
    setState(s => ({ ...s, members: s.members.map(m => m.id === id ? { ...m, ...updates } : m) }));
  }, [setState]);

  const deleteMember = useCallback((id: string) => {
    setState(s => ({ ...s, members: s.members.filter(m => m.id !== id) }));
  }, [setState]);

  // Chores
  const addChore = useCallback((chore: Omit<Chore, 'id' | 'createdAt' | 'completedAt'>) => {
    setState(s => ({ ...s, chores: [...s.chores, { ...chore, id: genId(), createdAt: new Date().toISOString(), completedAt: null }] }));
  }, [setState]);

  const updateChore = useCallback((id: string, updates: Partial<Chore>) => {
    setState(s => ({ ...s, chores: s.chores.map(c => c.id === id ? { ...c, ...updates } : c) }));
  }, [setState]);

  const deleteChore = useCallback((id: string) => {
    setState(s => ({ ...s, chores: s.chores.filter(c => c.id !== id) }));
  }, [setState]);

  const toggleChore = useCallback((id: string) => {
    setState(s => ({
      ...s,
      chores: s.chores.map(c => {
        if (c.id !== id) return c;
        const isDone = c.status === 'done';
        return { ...c, status: isDone ? 'pending' : 'done', completedAt: isDone ? null : new Date().toISOString() };
      }),
    }));
  }, [setState]);

  // Shopping
  const addShoppingItem = useCallback((item: Omit<ShoppingItem, 'id' | 'createdAt'>) => {
    setState(s => ({ ...s, shoppingItems: [...s.shoppingItems, { ...item, id: genId(), createdAt: new Date().toISOString() }] }));
  }, [setState]);

  const updateShoppingItem = useCallback((id: string, updates: Partial<ShoppingItem>) => {
    setState(s => ({ ...s, shoppingItems: s.shoppingItems.map(i => i.id === id ? { ...i, ...updates } : i) }));
  }, [setState]);

  const deleteShoppingItem = useCallback((id: string) => {
    setState(s => ({ ...s, shoppingItems: s.shoppingItems.filter(i => i.id !== id) }));
  }, [setState]);

  const toggleShoppingItem = useCallback((id: string) => {
    setState(s => ({
      ...s,
      shoppingItems: s.shoppingItems.map(i => i.id === id ? { ...i, checked: !i.checked } : i),
    }));
  }, [setState]);

  const clearCheckedItems = useCallback((store?: string) => {
    setState(s => ({
      ...s,
      shoppingItems: s.shoppingItems.map(i =>
        !store || i.store === store ? { ...i, checked: false } : i
      ),
    }));
  }, [setState]);

  // Events
  const addEvent = useCallback((event: Omit<FamilyEvent, 'id' | 'createdAt'>) => {
    setState(s => ({ ...s, events: [...s.events, { ...event, id: genId(), createdAt: new Date().toISOString() }] }));
  }, [setState]);

  const updateEvent = useCallback((id: string, updates: Partial<FamilyEvent>) => {
    setState(s => ({ ...s, events: s.events.map(e => e.id === id ? { ...e, ...updates } : e) }));
  }, [setState]);

  const deleteEvent = useCallback((id: string) => {
    setState(s => ({ ...s, events: s.events.filter(e => e.id !== id) }));
  }, [setState]);

  // Meals
  const addMeal = useCallback((meal: Omit<Meal, 'id' | 'createdAt'>) => {
    setState(s => ({ ...s, meals: [...s.meals, { ...meal, id: genId(), createdAt: new Date().toISOString() }] }));
  }, [setState]);

  const updateMeal = useCallback((id: string, updates: Partial<Meal>) => {
    setState(s => ({ ...s, meals: s.meals.map(m => m.id === id ? { ...m, ...updates } : m) }));
  }, [setState]);

  const deleteMeal = useCallback((id: string) => {
    setState(s => ({ ...s, meals: s.meals.filter(m => m.id !== id) }));
  }, [setState]);

  // Notes
  const addNote = useCallback((note: Omit<FamilyNote, 'id' | 'createdAt'>) => {
    setState(s => ({ ...s, notes: [...s.notes, { ...note, id: genId(), createdAt: new Date().toISOString() }] }));
  }, [setState]);

  const updateNote = useCallback((id: string, updates: Partial<FamilyNote>) => {
    setState(s => ({ ...s, notes: s.notes.map(n => n.id === id ? { ...n, ...updates } : n) }));
  }, [setState]);

  const deleteNote = useCallback((id: string) => {
    setState(s => ({ ...s, notes: s.notes.filter(n => n.id !== id) }));
  }, [setState]);

  return (
    <FamilyContext.Provider value={{
      state,
      setFamilyName,
      addMember, updateMember, deleteMember,
      addChore, updateChore, deleteChore, toggleChore,
      addShoppingItem, updateShoppingItem, deleteShoppingItem, toggleShoppingItem, clearCheckedItems,
      addEvent, updateEvent, deleteEvent,
      addMeal, updateMeal, deleteMeal,
      addNote, updateNote, deleteNote,
    }}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error('useFamily must be used inside FamilyProvider');
  return ctx;
}
