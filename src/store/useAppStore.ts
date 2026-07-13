import { create } from "zustand";
import { persist } from "zustand/middleware";

// --- Interfaces ---
interface Category {
  id: string;
  name: string;
  isDefault: boolean;
}
interface FocusSession {
  id: string;
  date: string;
  categoryId: string;
  duration: number;
  note: string;
}
interface AppSettings {
  theme: "synapse-os" | "synapse-hub";
  defaultTimerMinutes: number;
  defaultBreakMinutes: number;
}

interface AppState {
  // Data
  categories: Category[];
  sessions: FocusSession[];
  settings: AppSettings;

  // Actions
  addSession: (session: FocusSession) => void;
  addCategory: (name: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  exportData: () => void;
}

// --- Global Store ---
export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      categories: [
        { id: "1", name: "DSA & Algorithms", isDefault: true },
        { id: "2", name: "System Architecture", isDefault: true },
        { id: "3", name: "Debugging", isDefault: true },
        { id: "4", name: "Documentation", isDefault: true },
      ],
      sessions: [],
      settings: {
        theme: "synapse-os",
        defaultTimerMinutes: 30, // Your requested recommended baseline
        defaultBreakMinutes: 5,
      },

      addSession: (session) =>
        set((state) => ({
          sessions: [...state.sessions, session],
        })),

      addCategory: (name) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { id: crypto.randomUUID(), name, isDefault: false },
          ],
        })),

      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),

      exportData: () => {
        const dataStr = JSON.stringify(get(), null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `synapse-backup-${new Date().toISOString().split("T")[0]}.json`;
        a.click();
      },
    }),
    {
      name: "synapse-storage", // The key used in LocalStorage
    },
  ),
);
