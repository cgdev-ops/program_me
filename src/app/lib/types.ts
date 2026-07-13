// 1. Dynamic Category Management
interface Category {
  id: string;
  name: string; // e.g., "DSA", "System Design", "Bug Fix"
  themeColor: string; // For the UI tags
}

// 2. The Execution Deck (Mastery Log)
interface FocusSession {
  id: string;
  date: string; // ISO string
  categoryId: string; // Pre-selected before timer, but fully editable after
  durationMinutes: number;
  takeawayNote: string; // Link to challenge, bug details, or documentation read
}

// 3. The Hexagonal Grid (Atomic Habits)
interface HexNode {
  date: string; // YYYY-MM-DD format as the primary key
  status: "active" | "missed" | "frozen";
  freezeComment?: string; // If populated, the streak calculation ignores the 'missed' status
}

// 4. The Deep Work EXP Bar (Psycho-Cybernetics & Flow)
interface IdentityState {
  currentTitle: string; // e.g., "Disciplined Engineer"
  totalDeepWorkHours: number; // The core mastery metric
  currentLevel: number; // Calculated based on total hours (e.g., Level 1 = 0-10 hrs)
  currentStreak: number; // Active days + Frozen days
}

// 5. The Root Application State
interface AppState {
  identity: IdentityState;
  categories: Category[];
  sessions: FocusSession[];
  hexGrid: Record<string, HexNode>; // Fast lookup by date string
}
