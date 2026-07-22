// ============================================================================
// --- components/PlanCreator.tsx ---
// ============================================================================
import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Share2,
  CheckCircle,
  Circle,
  Play,
  Pause,
  X,
  Maximize2,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

const generateId = () => {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15);
};

interface DailyTask {
  day: number;
  description: string;
  durationSpent: number;
  isCompleted: boolean;
}

interface Plan {
  id: string;
  name: string;
  totalDays: number;
  tasks: DailyTask[];
}

const HexGrid = ({ plan }: { plan: Plan }) => {
  if (!plan) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2 p-6 max-w-2xl mx-auto shrink-0">
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
  const { plans, addPlan, deletePlan, updateTask, exportPlan } = useAppStore();
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanDays, setNewPlanDays] = useState(30);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [activeDayTimer, setActiveDayTimer] = useState<number | null>(null);
  const [activeModalDay, setActiveModalDay] = useState<number | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCreatePlan = () => {
    if (!newPlanName) return;
    const tasks: DailyTask[] = Array.from({ length: newPlanDays }).map(
      (_, i) => ({
        day: i + 1,
        description: "",
        durationSpent: 0,
        isCompleted: false,
      })
    );
    const newPlan = {
      id: generateId(),
      name: newPlanName,
      totalDays: newPlanDays,
      tasks,
    };
    addPlan(newPlan);
    setNewPlanName("");
    setSelectedPlanId(newPlan.id);
  };

  const toggleDayTimer = (
    planId: string,
    day: number,
    currentDuration: number
  ) => {
    if (activeDayTimer === day) {
      if (timerRef.current) clearInterval(timerRef.current);
      setActiveDayTimer(null);
    } else {
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
  const activeTaskDetails = selectedPlan?.tasks.find((t) => t.day === activeModalDay);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-200px)] min-h-[600px] relative">
      
      {/* LEFT COLUMN: LIST */}
      {/* Added h-full and overflow-hidden to bound the container */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col gap-6 h-full overflow-hidden">
        
        {/* Header & Inputs (shrink-0 prevents them from squishing) */}
        <div className="shrink-0 flex flex-col gap-6">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Pathways
          </h2>
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
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center shrink-0"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable List area (flex-1 and min-h-0 force it to scroll internally) */}
        <div className="flex flex-col gap-2 overflow-y-auto pr-2 flex-1 min-h-0">
          {plans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`p-4 rounded-xl cursor-pointer border transition-all flex justify-between items-center shrink-0 ${
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

      {/* RIGHT COLUMN: ACTIVE PLAN DETAILS */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col h-full overflow-hidden">
        {selectedPlan ? (
          <>
            <div className="flex justify-between items-start mb-4 shrink-0">
              <h2 className="text-2xl font-bold text-zinc-900 dark:text-white uppercase tracking-widest drop-shadow-[0_0_8px_rgba(96,165,250,0.3)]">
                {selectedPlan.name}
              </h2>
              <button
                onClick={() => exportPlan(selectedPlan.id)}
                title="Export & Share Pathway"
                className="text-zinc-500 hover:text-blue-500 transition-colors p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg shrink-0"
              >
                <Share2 size={18} />
              </button>
            </div>

            {/* Added overflow-y-auto directly to the scrolling content wrapper */}
            <div className="flex-1 overflow-y-auto pr-2 min-h-0 flex flex-col">
              <HexGrid plan={selectedPlan} />

              <div className="mt-8 flex flex-col gap-4">
                <h3 className="font-bold text-zinc-900 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800 pb-2 shrink-0">
                  Daily Nodes
                </h3>
                {selectedPlan.tasks.map((task) => (
                  <div
                    key={task.day}
                    className={`p-4 rounded-xl border flex flex-col gap-3 transition-colors shrink-0 ${
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

                    <div 
                      onClick={() => setActiveModalDay(task.day)}
                      className="relative group cursor-pointer"
                    >
                      <textarea
                        readOnly
                        placeholder="Click here to open editor and write notes..."
                        value={task.description}
                        className="w-full bg-transparent border-b border-zinc-300 dark:border-zinc-700 outline-none text-sm text-zinc-800 dark:text-zinc-300 py-1 resize-none h-10 cursor-pointer pointer-events-none"
                      />
                      <div className="absolute right-0 top-1 text-zinc-400 group-hover:text-blue-500 transition-colors">
                        <Maximize2 size={16} />
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm font-mono mt-2">
                      <button
                        onClick={() =>
                          toggleDayTimer(
                            selectedPlan.id,
                            task.day,
                            task.durationSpent
                          )
                        }
                        className={`flex items-center gap-2 px-3 py-1 rounded-md transition-colors ${
                          activeDayTimer === task.day
                            ? "bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30"
                            : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-transparent"
                        }`}
                      >
                        {activeDayTimer === task.day ? (
                          <Pause size={14} />
                        ) : (
                          <Play size={14} />
                        )}
                        {activeDayTimer === task.day ? "Active" : "Timer"}
                      </button>
                      <span
                        className={`${
                          activeDayTimer === task.day
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-zinc-500"
                        } font-bold`}
                      >
                        {Math.floor(task.durationSpent / 60)}m{" "}
                        {task.durationSpent % 60}s logged
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-zinc-400 text-sm uppercase tracking-widest min-h-[300px]">
            Select a pathway to initialize visualization
          </div>
        )}
      </div>

      {/* MODAL OVERLAY */}
      {activeModalDay && selectedPlan && activeTaskDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 max-w-2xl w-full shadow-2xl relative flex flex-col gap-6">
            
            <button
              onClick={() => setActiveModalDay(null)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-3xl font-bold text-zinc-900 dark:text-white font-mono tracking-widest uppercase">
                  NODE {activeTaskDetails.day}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  {selectedPlan.name}
                </p>
              </div>

              <button
                onClick={() =>
                  updateTask(selectedPlan.id, activeTaskDetails.day, {
                    isCompleted: !activeTaskDetails.isCompleted,
                  })
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold uppercase tracking-widest transition-colors border ${
                  activeTaskDetails.isCompleted
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {activeTaskDetails.isCompleted ? <CheckCircle size={20} /> : <Circle size={20} />}
                {activeTaskDetails.isCompleted ? "Completed" : "Mark Complete"}
              </button>
            </div>

            <textarea
              placeholder="Initialize daily objectives, concepts, or raw notes here..."
              value={activeTaskDetails.description}
              onChange={(e) =>
                updateTask(selectedPlan.id, activeTaskDetails.day, {
                  description: e.target.value,
                })
              }
              className="w-full h-64 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 focus:border-blue-500 outline-none text-zinc-800 dark:text-zinc-300 resize-none font-mono text-sm leading-relaxed"
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveModalDay(null)}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold tracking-widest uppercase transition-colors"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanCreator;