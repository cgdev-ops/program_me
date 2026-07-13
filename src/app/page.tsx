"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Play,
  Square,
  Download,
  Plus,
  X,
  Hexagon,
} from "lucide-react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// --- Utility for ID Generation (replaces crypto.randomUUID for secure context compliance) ---
const generateUUID = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

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
  durationMinutes: number;
  takeawayNote: string;
}

interface AppSettings {
  theme: "synapse-os" | "synapse-hub";
  defaultTimerMinutes: number;
  defaultBreakMinutes: number;
}

interface AppState {
  identityTitle: string;
  categories: Category[];
  sessions: FocusSession[];
  settings: AppSettings;
  addSession: (session: FocusSession) => void;
  addCategory: (name: string) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  exportData: () => void;
}

// --- Global Zustand Store ---
const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      identityTitle: "Disciplined Engineer",
      categories: [
        { id: "1", name: "DSA & Algorithms", isDefault: true },
        { id: "2", name: "System Architecture", isDefault: true },
        { id: "3", name: "Debugging", isDefault: true },
        { id: "4", name: "Documentation", isDefault: true },
      ],
      sessions: [],
      settings: {
        theme: "synapse-os",
        defaultTimerMinutes: 30,
        defaultBreakMinutes: 5,
      },
      addSession: (session) =>
        set((state) => ({ sessions: [...state.sessions, session] })),
      addCategory: (name) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { id: generateUUID(), name, isDefault: false },
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
    { name: "synapse-storage" },
  ),
);

// --- Settings Modal Component ---
const SettingsModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { settings, updateSettings, exportData } = useAppStore();
  const [newCatName, setNewCatName] = useState("");
  const addCategory = useAppStore((state) => state.addCategory);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:hover:text-white"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          System Configuration
        </h2>

        <div className="space-y-6">
          {/* Theme Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Visual Interface
            </label>
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-zinc-950 rounded-lg">
              <button
                onClick={() => updateSettings({ theme: "synapse-os" })}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-bold transition-all ${settings.theme === "synapse-os" ? "bg-zinc-800 text-blue-400 shadow-lg border border-blue-500/30" : "text-gray-500 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-800/50"}`}
              >
                Synapse OS
              </button>
              <button
                onClick={() => updateSettings({ theme: "synapse-hub" })}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-bold transition-all ${settings.theme === "synapse-hub" ? "bg-white text-gray-900 shadow-lg border border-gray-200" : "text-gray-500 dark:text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-800/50"}`}
              >
                Synapse Hub
              </button>
            </div>
          </div>

          {/* Defaults */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Default Focus (Min)
              </label>
              <input
                type="number"
                value={settings.defaultTimerMinutes}
                onChange={(e) =>
                  updateSettings({
                    defaultTimerMinutes: Number(e.target.value),
                  })
                }
                className="w-full p-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Default Break (Min)
              </label>
              <input
                type="number"
                value={settings.defaultBreakMinutes}
                onChange={(e) =>
                  updateSettings({
                    defaultBreakMinutes: Number(e.target.value),
                  })
                }
                className="w-full p-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Quick Category Add */}
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Add New Category
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g., Marketing, Emails..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="flex-1 p-2 bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={() => {
                  if (newCatName) {
                    addCategory(newCatName);
                    setNewCatName("");
                  }
                }}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Export */}
          <div className="pt-4 border-t dark:border-zinc-800">
            <button
              onClick={exportData}
              className="flex items-center justify-center gap-2 w-full p-3 bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
            >
              <Download size={18} /> Export JSON Backup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Flow Engine Component ---
const FlowEngine = () => {
  const { categories, settings, addSession } = useAppStore();
  const [appState, setAppState] = useState<"idle" | "running" | "logging">(
    "idle",
  );
  const [mode, setMode] = useState<"stopwatch" | "timer">("stopwatch");
  const [secondsActive, setSecondsActive] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState(
    settings.defaultTimerMinutes,
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [takeaway, setTakeaway] = useState("");

  // Sync settings if they change
  useEffect(() => {
    setTargetMinutes(settings.defaultTimerMinutes);
  }, [settings.defaultTimerMinutes]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (appState === "running") {
      interval = setInterval(() => {
        setSecondsActive((prev) => {
          const newTotal = prev + 1;
          if (mode === "timer" && newTotal >= targetMinutes * 60) {
            clearInterval(interval);
            setAppState("logging");
            return targetMinutes * 60;
          }
          return newTotal;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [appState, mode, targetMinutes]);

  const handleStart = () => {
    if (!selectedCategory)
      return alert("Select a category to set your intent.");
    setAppState("running");
  };

  const handleSaveCard = () => {
    addSession({
      id: generateUUID(),
      date: new Date().toISOString(),
      categoryId: selectedCategory,
      durationMinutes: Math.floor(secondsActive / 60),
      takeawayNote: takeaway,
    });
    setAppState("idle");
    setSecondsActive(0);
    setTakeaway("");
  };

  const getDisplayTime = () => {
    const displaySeconds =
      mode === "timer" ? targetMinutes * 60 - secondsActive : secondsActive;
    const m = Math.floor(displaySeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (displaySeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm transition-colors h-full min-h-[400px]">
      {appState !== "logging" && (
        <div className="w-full text-center">
          {appState === "idle" && (
            <div className="flex justify-center gap-2 mb-8 p-1 bg-gray-100 dark:bg-zinc-950 rounded-lg w-48 mx-auto">
              <button
                onClick={() => setMode("stopwatch")}
                className={`flex-1 py-1 rounded text-sm font-bold transition ${mode === "stopwatch" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow" : "text-gray-400"}`}
              >
                Up
              </button>
              <button
                onClick={() => setMode("timer")}
                className={`flex-1 py-1 rounded text-sm font-bold transition ${mode === "timer" ? "bg-white dark:bg-zinc-800 text-gray-900 dark:text-white shadow" : "text-gray-400"}`}
              >
                Down
              </button>
            </div>
          )}

          <h2
            className={`text-7xl md:text-8xl font-mono mb-8 font-light tracking-tighter ${appState === "running" ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"}`}
          >
            {getDisplayTime()}
          </h2>

          {appState === "idle" ? (
            <div className="flex flex-col gap-4 max-w-xs mx-auto">
              {mode === "timer" && (
                <input
                  type="number"
                  value={targetMinutes}
                  onChange={(e) => setTargetMinutes(Number(e.target.value))}
                  className="p-3 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-950 text-center font-mono text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              )}
              <select
                className="p-3 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="" disabled>
                  Select Target Focus...
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleStart}
                className="flex items-center justify-center gap-2 bg-blue-600 text-white p-4 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-500/20 mt-2"
              >
                <Play size={20} fill="currentColor" /> Initiate Flow
              </button>
            </div>
          ) : (
            <button
              onClick={() => setAppState("logging")}
              className="flex items-center justify-center gap-2 bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 p-4 rounded-lg font-bold hover:bg-red-600 hover:text-white transition w-full max-w-xs mx-auto"
            >
              <Square size={20} fill="currentColor" /> Halt & Log Session
            </button>
          )}
        </div>
      )}

      {appState === "logging" && (
        <div className="w-full max-w-sm mx-auto flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300">
          <div className="border-b border-gray-200 dark:border-zinc-800 pb-4 mb-2">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
              Execution Log
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Focused duration:{" "}
              <span className="font-mono text-blue-500">
                {Math.floor(secondsActive / 60)}m
              </span>
            </p>
          </div>

          <select
            className="p-3 border border-gray-200 dark:border-zinc-800 rounded-lg bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <textarea
            className="w-full p-4 border border-gray-200 dark:border-zinc-800 rounded-lg h-32 bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none placeholder:text-gray-400 dark:placeholder:text-zinc-600"
            placeholder="Log your reps: Bug details, key takeaways, links to commits..."
            value={takeaway}
            onChange={(e) => setTakeaway(e.target.value)}
          />

          <button
            onClick={handleSaveCard}
            className="bg-green-600 text-white p-4 rounded-lg font-bold hover:bg-green-700 transition shadow-lg shadow-green-500/20 mt-2"
          >
            Commit to Mastery Record
          </button>
        </div>
      )}
    </div>
  );
};

// --- Main Page Assembly ---
export default function Dashboard() {
  const { settings, identityTitle, sessions } = useAppStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Hydration fix for Zustand
  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; // Prevent SSR flash

  // Determine global theme
  const isDark = settings.theme === "synapse-os";
  const totalHours = (
    sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0) / 60
  ).toFixed(1);

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 font-sans transition-colors duration-300 selection:bg-blue-500/30">
        {/* Navigation & Identity Bar */}
        <nav className="w-full px-6 py-4 flex items-center justify-between bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Hexagon className="text-white" size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white leading-tight">
                Synapse
              </h1>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-mono tracking-widest uppercase">
                {identityTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">
                Deep Work
              </span>
              <span className="text-sm font-mono text-gray-900 dark:text-white">
                {totalHours} Hours
              </span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-zinc-800 rounded-lg transition"
            >
              <Settings size={20} />
            </button>
          </div>
        </nav>

        {/* Stoic Quote Identity Primer */}
        <div className="w-full py-8 px-6 text-center border-b border-gray-200 dark:border-zinc-900/50 bg-white/50 dark:bg-zinc-900/20">
          <p className="max-w-2xl mx-auto text-lg md:text-xl font-medium text-gray-600 dark:text-zinc-400 italic">
            "You have power over your mind - not outside events. Realize this,
            and you will find strength."
          </p>
          <p className="text-sm text-gray-400 dark:text-zinc-500 mt-4 font-bold tracking-widest uppercase">
            — Marcus Aurelius
          </p>
        </div>

        {/* Main Content Grid */}
        <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
          {/* Left Column: Flow Engine */}
          <div className="lg:col-span-5 flex flex-col gap-8 h-full">
            <FlowEngine />
          </div>

          {/* Right Column: Hexagonal Tracker Placeholder */}
          <div className="lg:col-span-7 h-full">
            <div className="w-full h-full min-h-[400px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-6 left-6 flex items-center justify-between w-[calc(100%-3rem)]">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Atomic Hex Grid
                </h3>
                <select className="bg-gray-100 dark:bg-zinc-800 text-sm text-gray-600 dark:text-gray-300 border-none rounded px-2 py-1 outline-none">
                  <option>30-Day View</option>
                  <option>All-Time</option>
                </select>
              </div>

              {/* Wireframe Placeholder for next step */}
              <div className="flex flex-col items-center gap-4 opacity-50 dark:opacity-30 mt-8">
                <Hexagon size={64} className="text-gray-400" />
                <p className="text-gray-500 font-medium text-center max-w-sm">
                  The Hexagonal Canvas Engine will inject here in Phase 4,
                  parsing your stored JSON sessions into a living mastery web.
                </p>
              </div>
            </div>
          </div>
        </main>

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </div>
  );
}
// add hexagonal