"use client";

import React, { useState, useEffect, useRef } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  Settings,
  Play,
  Pause,
  Square,
  Download,
  Upload,
  Plus,
  Trash2,
  CheckCircle,
  Circle,
  Cross,
  X,
  Book,
} from "lucide-react";

// --- STATE MANAGEMENT ---

interface Session {
  id: string;
  date: string;
  durationMinutes: number;
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
  theme: "os" | "hub";
  setTheme: (theme: "os" | "hub") => void;
  sessions: Session[];
  addSession: (session: Session) => void;
  plans: Plan[];
  addPlan: (plan: Plan) => void;
  deletePlan: (id: string) => void;
  updateTask: (planId: string, day: number, data: Partial<DailyTask>) => void;
  exportData: () => void;
  importData: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const generateId = () => {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15);
};

const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      theme: "os",
      setTheme: (theme) => set({ theme }),
      sessions: [],
      addSession: (session) =>
        set((state) => ({ sessions: [...state.sessions, session] })),
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
      exportData: () => {
        const state = get();
        const data = {
          sessions: state.sessions,
          plans: state.plans,
          theme: state.theme,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `synapse-backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
      },
      importData: (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsed = JSON.parse(e.target?.result as string);
            if (parsed.sessions) set({ sessions: parsed.sessions });
            if (parsed.plans) set({ plans: parsed.plans });
            if (parsed.theme) set({ theme: parsed.theme });
            alert("Data imported successfully!");
          } catch (error) {
            alert("Invalid backup file.");
          }
        };
        reader.readAsText(file);
      },
    }),
    { name: "synapse-storage" },
  ),
);

// --- COMPONENTS ---

const FlowEngine = () => {
  const [isActive, setIsActive] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const addSession = useAppStore((state) => state.addSession);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const handleStop = () => {
    setIsActive(false);
    if (seconds > 60) {
      addSession({
        id: generateId(),
        date: new Date().toISOString(),
        durationMinutes: Math.floor(seconds / 60),
      });
    }
    setSeconds(0);
  };

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${s
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="text-7xl font-bold tracking-tighter mb-8 font-mono text-zinc-900 dark:text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.4)]">
        {formatTime(seconds)}
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => setIsActive(!isActive)}
          className="flex items-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-blue-600/20 text-white dark:text-blue-400 border border-zinc-800 dark:border-blue-500/50 rounded-xl hover:bg-zinc-800 dark:hover:bg-blue-600/40 transition-all font-bold tracking-widest uppercase"
        >
          {isActive ? <Pause size={20} /> : <Play size={20} />}
          {isActive ? "Pause" : "Engage"}
        </button>
        {seconds > 0 && (
          <button
            onClick={handleStop}
            className="flex items-center gap-2 px-8 py-4 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all font-bold tracking-widest uppercase"
          >
            <Book size={20} />
            Log
          </button>
        )}
      </div>
    </div>
  );
};

const HexGrid = ({ plan }: { plan: Plan }) => {
  if (!plan) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2 p-6 max-w-2xl mx-auto">
      {plan.tasks.map((task) => (
        <div
          key={task.day}
          className={`relative w-16 h-16 flex items-center justify-center font-mono text-sm font-bold transition-all duration-300
            ${
              task.isCompleted
                ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.6)] dark:bg-blue-600 dark:text-white"
                : task.durationSpent > 0
                  ? "bg-blue-900/40 text-blue-300 border border-blue-500/50"
                  : "bg-zinc-200 text-zinc-400 dark:bg-zinc-900 dark:text-zinc-600 dark:border-zinc-800 border"
            }
          `}
          style={{
            clipPath:
              "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)",
          }}
        >
          {task.isCompleted ? <CheckCircle size={20} /> : task.day}
        </div>
      ))}
    </div>
  );
};

const PlanCreator = () => {
  const { plans, addPlan, deletePlan, updateTask } = useAppStore();
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanDays, setNewPlanDays] = useState(30);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [activeDayTimer, setActiveDayTimer] = useState<number | null>(null);

  // Timer Ref for Day Cards
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCreatePlan = () => {
    if (!newPlanName) return;
    const tasks: DailyTask[] = Array.from({ length: newPlanDays }).map(
      (_, i) => ({
        day: i + 1,
        description: "",
        durationSpent: 0,
        isCompleted: false,
      }),
    );

    addPlan({
      id: generateId(),
      name: newPlanName,
      totalDays: newPlanDays,
      tasks,
    });
    setNewPlanName("");
  };

  const toggleDayTimer = (
    planId: string,
    day: number,
    currentDuration: number,
  ) => {
    if (activeDayTimer === day) {
      // Stop timer
      if (timerRef.current) clearInterval(timerRef.current);
      setActiveDayTimer(null);
    } else {
      // Start timer
      if (timerRef.current) clearInterval(timerRef.current);
      setActiveDayTimer(day);
      timerRef.current = setInterval(() => {
        updateTask(planId, day, { durationSpent: currentDuration + 1 });
        currentDuration++;
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Left Column: Plan List & Creator */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
          Pathways
        </h2>

        {/* Create Form */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Course/Plan Name..."
            value={newPlanName}
            onChange={(e) => setNewPlanName(e.target.value)}
            className="flex-1 bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-4 py-2 text-zinc-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
          <input
            type="number"
            min="1"
            max="100"
            value={newPlanDays}
            onChange={(e) => setNewPlanDays(parseInt(e.target.value) || 1)}
            className="w-20 bg-zinc-100 dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-lg px-2 py-2 text-zinc-900 dark:text-white text-center focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleCreatePlan}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* Plan List */}
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[500px] pr-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`p-4 rounded-xl cursor-pointer border transition-all flex justify-between items-center ${
                selectedPlanId === plan.id
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 shadow-sm"
                  : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
              }`}
            >
              <div>
                <h3 className="font-bold text-zinc-900 dark:text-zinc-100">
                  {plan.name}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {plan.tasks.filter((t) => t.isCompleted).length} /{" "}
                  {plan.totalDays} Days Completed
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deletePlan(plan.id);
                  if (selectedPlanId === plan.id) setSelectedPlanId(null);
                }}
                className="text-zinc-400 hover:text-red-500 transition-colors p-2"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Right Column: Active Plan Details & Hex Grid */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-6 overflow-y-auto max-h-[700px]">
        {selectedPlan ? (
          <>
            <div className="text-center mb-4">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]">
                {selectedPlan.name}
              </h2>
            </div>

            <HexGrid plan={selectedPlan} />

            <div className="mt-8 flex flex-col gap-4">
              <h3 className="font-bold text-zinc-900 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                Daily Nodes
              </h3>
              {selectedPlan.tasks.map((task) => (
                <div
                  key={task.day}
                  className={`p-4 rounded-xl border flex flex-col gap-3 transition-colors ${
                    task.isCompleted
                      ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30"
                      : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-zinc-900 dark:text-zinc-200 font-mono">
                      DAY {task.day}
                    </span>
                    <button
                      onClick={() =>
                        updateTask(selectedPlan.id, task.day, {
                          isCompleted: !task.isCompleted,
                        })
                      }
                      className={`${
                        task.isCompleted
                          ? "text-green-500"
                          : "text-zinc-400 hover:text-blue-500"
                      } transition-colors`}
                    >
                      {task.isCompleted ? (
                        <CheckCircle size={24} />
                      ) : (
                        <Circle size={24} />
                      )}
                    </button>
                  </div>

                  <textarea
                    placeholder="Objective / Notes for today..."
                    value={task.description}
                    onChange={(e) =>
                      updateTask(selectedPlan.id, task.day, {
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 focus:border-blue-500 outline-none text-sm text-zinc-800 dark:text-zinc-300 py-1 resize-none h-10"
                  />

                  <div className="flex items-center gap-4 text-sm font-mono mt-2">
                    <button
                      onClick={() =>
                        toggleDayTimer(
                          selectedPlan.id,
                          task.day,
                          task.durationSpent,
                        )
                      }
                      className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors ${
                        activeDayTimer === task.day
                          ? "bg-red-500/20 text-red-600 dark:text-red-400"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      }`}
                    >
                      {activeDayTimer === task.day ? (
                        <Pause size={14} />
                      ) : (
                        <Play size={14} />
                      )}
                      {activeDayTimer === task.day ? "Active" : "Timer"}
                    </button>
                    <span className="text-zinc-500">
                      {Math.floor(task.durationSpent / 60)}m{" "}
                      {task.durationSpent % 60}s logged
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-400 text-sm uppercase tracking-widest">
            Select a pathway to initialize visualization
          </div>
        )}
      </div>
    </div>
  );
};

// --- MAIN LAYOUT ---

export default function Dashboard() {
  const { theme, setTheme, sessions, exportData, importData } = useAppStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"flow" | "pathways">("flow");

  // Apply dark mode class to HTML element
  useEffect(() => {
    if (theme === "os") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const totalMinutes = sessions.reduce(
    (acc, curr) => acc + curr.durationMinutes,
    0,
  );
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-500 font-sans selection:bg-blue-500/30 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-6 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-zinc-900 dark:bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <div className="w-4 h-4 border-2 border-white transform rotate-45"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tighter uppercase dark:text-white text-zinc-900">
                Synapse{" "}
                <span className="text-blue-500 dark:text-blue-400 font-light">
                  {theme.toUpperCase()}
                </span>
              </h1>
              <p className="text-xs tracking-widest text-zinc-500 dark:text-zinc-400">
                Progress Through Discipline
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("flow")}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${
                activeTab === "flow"
                  ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              }`}
            >
              Flow Engine
            </button>
            <button
              onClick={() => setActiveTab("pathways")}
              className={`px-4 py-2 text-sm font-bold uppercase tracking-wider rounded-lg transition-colors ${
                activeTab === "pathways"
                  ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300"
              }`}
            >
              Pathways
            </button>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-2xl font-bold dark:text-blue-400 text-zinc-800 font-mono">
                {totalHours}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-zinc-500">
                Total Hours
              </div>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <Settings
                size={20}
                className="text-zinc-600 dark:text-zinc-400"
              />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="min-h-[60vh]">
          {activeTab === "flow" ? <FlowEngine /> : <PlanCreator />}
        </main>

        {/* Settings Modal */}
        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-bold uppercase tracking-widest">
                  Settings
                </h2>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase block mb-3">
                    Interface Theme
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTheme("os")}
                      className={`flex-1 py-3 rounded-lg border font-bold uppercase text-sm tracking-wider transition-all ${
                        theme === "os"
                          ? "bg-zinc-900 border-zinc-900 text-white dark:bg-blue-600/20 dark:border-blue-500 dark:text-blue-400"
                          : "bg-transparent border-zinc-200 text-zinc-500 dark:border-zinc-800"
                      }`}
                    >
                      OS (Dark)
                    </button>
                    <button
                      onClick={() => setTheme("hub")}
                      className={`flex-1 py-3 rounded-lg border font-bold uppercase text-sm tracking-wider transition-all ${
                        theme === "hub"
                          ? "bg-zinc-100 border-zinc-300 text-zinc-900"
                          : "bg-transparent border-zinc-200 text-zinc-500 dark:border-zinc-800"
                      }`}
                    >
                      Hub (Light)
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
                  <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase block mb-3">
                    Data Management
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={exportData}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg transition-colors text-sm font-bold"
                    >
                      <Download size={16} /> Backup
                    </button>
                    <label className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white rounded-lg transition-colors text-sm font-bold cursor-pointer">
                      <Upload size={16} /> Restore
                      <input
                        type="file"
                        accept=".json"
                        onChange={importData}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
