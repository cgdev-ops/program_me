import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================================
// --- INTERFACES ---
// ============================================================================

interface Category {
  id: string;
  name: string;
  isDefault: boolean;
}

interface AppSettings {
  defaultTimerMinutes: number;
  defaultBreakMinutes: number;
}

interface Session {
  id: string;
  date: string;
  durationMinutes: number;
  categoryId?: string; // Optional to support both old and new components
  note?: string;
}

interface DailyTask {
  day: number;
  description: string;
  durationSpent: number; // in seconds
  isCompleted: boolean;
}

interface Plan {
  id: string;
  name: string;
  totalDays: number;
  tasks: DailyTask[];
}

interface AppState {
  // UI & Settings
  theme: "os" | "hub";
  setTheme: (theme: "os" | "hub") => void;
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  hasSeenTour: boolean;
  completeTour: () => void;
  resetTour: () => void;
  // Categories
  categories: Category[];
  addCategory: (name: string) => void;

  // Sessions
  sessions: Session[];
  addSession: (session: Session) => void;

  // Plans & Tasks
  plans: Plan[];
  addPlan: (plan: Plan) => void;
  deletePlan: (id: string) => void;
  updateTask: (planId: string, day: number, data: Partial<DailyTask>) => void;

  // Data Management
  exportData: () => void;
  exportPlan: (planId: string) => void;
  importData: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

// ============================================================================
// --- UTILS ---
// ============================================================================

const generateId = () => {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15);
};

const triggerDownload = (data: any, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ============================================================================
// --- STORE ---
// ============================================================================

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial UI & Settings State
      theme: "os",
      setTheme: (theme) => set({ theme }),
      settings: {
        defaultTimerMinutes: 25,
        defaultBreakMinutes: 5,
      },
      updateSettings: (newSettings) =>
        set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      hasSeenTour: false,
      completeTour: () => set({ hasSeenTour: true }),
  resetTour: () => set({ hasSeenTour: false }),
      // Initial Categories State
      categories: [
        { id: "1", name: "Deep Work", isDefault: true },
        { id: "2", name: "Learning", isDefault: true },
      ],
      addCategory: (name) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { id: generateId(), name, isDefault: false },
          ],
        })),

      // Initial Sessions State
      sessions: [],
      addSession: (session) =>
        set((state) => ({ sessions: [...state.sessions, session] })),

      // Initial Plans State
      plans: [],
      addPlan: (plan) => set((state) => ({ plans: [...state.plans, plan] })),
      deletePlan: (id) =>
        set((state) => ({ plans: state.plans.filter((p) => p.id !== id) })),
      updateTask: (planId, day, data) =>
        set((state) => ({
          plans: state.plans.map((plan) =>
            plan.id === planId
              ? {
                  ...plan,
                  tasks: plan.tasks.map((task) =>
                    task.day === day ? { ...task, ...data } : task,
                  ),
                }
              : plan,
          ),
        })),

      // Data Management
      exportData: () => {
        const state = get();
        const data = {
          type: "SYNAPSE_BACKUP",
          sessions: state.sessions,
          plans: state.plans,
          theme: state.theme,
          settings: state.settings,
          categories: state.categories,
        };
        triggerDownload(
          data,
          `synapse-backup-${new Date().toISOString().slice(0, 10)}.json`,
        );
      },
      exportPlan: (planId) => {
        const plan = get().plans.find((p) => p.id === planId);
        if (!plan) return;
        const data = { type: "SYNAPSE_PATHWAY", plan };
        triggerDownload(
          data,
          `pathway-${plan.name.replace(/\s+/g, "-").toLowerCase()}.json`,
        );
      },
      importData: (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsed = JSON.parse(e.target?.result as string);
            if (parsed.type === "SYNAPSE_BACKUP") {
              if (parsed.sessions) set({ sessions: parsed.sessions });
              if (parsed.plans) set({ plans: parsed.plans });
              if (parsed.theme) set({ theme: parsed.theme });
              if (parsed.settings) set({ settings: parsed.settings });
              if (parsed.categories) set({ categories: parsed.categories });
              alert("Full backup restored!");
            } else if (parsed.type === "SYNAPSE_PATHWAY" && parsed.plan) {
              const newPlan = { ...parsed.plan, id: generateId() };
              set((state) => ({ plans: [...state.plans, newPlan] }));
              alert(`Pathway "${newPlan.name}" successfully imported!`);
            } else {
              alert("Invalid file format.");
            }
          } catch (error) {
            alert("Error parsing backup file.");
          }
        };
        reader.readAsText(file);
      },
    }),
    { name: "synapse-storage" },
  ),
);
export default useAppStore;


