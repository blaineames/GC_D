export type MemberRole = 'parent' | 'child';

export interface FamilyMember {
  id: string;
  name: string;
  role: MemberRole;
  color: string;
  avatar: string; // emoji
  createdAt: string;
}

export type ChoreFrequency = 'once' | 'daily' | 'weekly' | 'monthly';
export type ChoreStatus = 'pending' | 'in_progress' | 'done';

export interface Chore {
  id: string;
  title: string;
  description: string;
  assignedTo: string | null; // FamilyMember id
  frequency: ChoreFrequency;
  status: ChoreStatus;
  dueDate: string | null;
  points: number;
  createdAt: string;
  completedAt: string | null;
}

export type ShoppingStore = 'Whole Foods' | 'Trader Joes' | 'Costco' | 'Target';

export type ShoppingCategory =
  | 'Produce'
  | 'Dairy'
  | 'Meat'
  | 'Bakery'
  | 'Frozen'
  | 'Beverages'
  | 'Snacks'
  | 'Household'
  | 'Personal Care'
  | 'Other';

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  category: ShoppingCategory;
  store: ShoppingStore;
  checked: boolean;
  addedBy: string | null; // FamilyMember id
  createdAt: string;
}

export interface FamilyEvent {
  id: string;
  title: string;
  description: string;
  date: string; // ISO date string YYYY-MM-DD
  time: string; // HH:MM
  endDate: string | null;
  endTime: string | null;
  color: string;
  assignedTo: string[]; // FamilyMember ids
  createdAt: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface Meal {
  id: string;
  name: string;
  date: string; // YYYY-MM-DD
  type: MealType;
  notes: string;
  assignedTo: string | null; // FamilyMember id (who's cooking)
  createdAt: string;
}

export interface FamilyNote {
  id: string;
  content: string;
  pinned: boolean;
  color: string;
  createdBy: string | null;
  createdAt: string;
}

export interface FamilyState {
  members: FamilyMember[];
  chores: Chore[];
  shoppingItems: ShoppingItem[];
  events: FamilyEvent[];
  meals: Meal[];
  notes: FamilyNote[];
  familyName: string;
}
