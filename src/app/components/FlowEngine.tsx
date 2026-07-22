// ============================================================================
// --- components/FlowEngine.tsx ---
// ============================================================================
import React, { useState, useEffect } from "react";
import { Play, Pause, Book, AlertCircle } from "lucide-react";
import { useAppStore } from "@/store/useAppStore"; // Adjust path if needed

// Local ID generator for the timer sessions
const generateId = () => {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15);
};

// --- FEATURE 4: Zeigarnik Effect Dashboard ---
const ZeigarnikLoops = ({ onNavigate }: { onNavigate: () => void }) => {
  const plans = useAppStore((state) => state.plans);

  // Scan all plans for tasks that have been started (duration > 0) but not completed
  const openLoops = plans.flatMap((plan) =>
    plan.tasks
      .filter((task) => task.durationSpent > 0 && !task.isCompleted)
      .map((task) => ({ planName: plan.name, planId: plan.id, ...task })),
  );

  if (openLoops.length === 0) return null;

  return (
    <div className="mt-16 w-full max-w-2xl bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 animate-in fade-in zoom-in duration-500">
      <h3 className="text-amber-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">
        <AlertCircle size={20} /> Open Loops Detected
      </h3>
      <div className="space-y-3">
        {openLoops.map((loop, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-amber-500/10 hover:border-amber-500/30 transition-colors"
          >
            <div>
              <div className="text-white font-bold">{loop.planName}</div>
              <div className="text-sm text-zinc-400">
                Day {loop.day} • {Math.floor(loop.durationSpent / 60)}m{" "}
                {loop.durationSpent % 60}s elapsed
              </div>
            </div>
            <button
              onClick={onNavigate}
              className="px-4 py-2 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 rounded-lg text-sm font-bold tracking-widest uppercase transition-colors"
            >
              Resume
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const FlowEngine = ({
  onNavigateToPathways,
}: {
  onNavigateToPathways: () => void;
}) => {
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
    <div className="flex flex-col items-center justify-center py-12 w-full">
      <div className="text-8xl md:text-9xl font-bold tracking-tighter mb-12 font-mono text-zinc-900 dark:text-blue-400 drop-shadow-[0_0_25px_rgba(96,165,250,0.3)]">
        {formatTime(seconds)}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setIsActive(!isActive)}
          className="flex items-center gap-3 px-8 py-4 bg-zinc-900 dark:bg-blue-600/20 text-white dark:text-blue-400 border border-zinc-800 dark:border-blue-500/50 rounded-xl hover:bg-zinc-800 dark:hover:bg-blue-600/40 transition-all font-bold tracking-widest uppercase shadow-lg"
        >
          {isActive ? <Pause size={20} /> : <Play size={20} />}
          {isActive ? "Pause" : "Engage"}
        </button>

        {seconds > 0 && (
          <button
            onClick={handleStop}
            className="flex items-center gap-3 px-8 py-4 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-all font-bold tracking-widest uppercase shadow-lg"
          >
            <Book size={20} />
            Log
          </button>
        )}
      </div>

      <ZeigarnikLoops onNavigate={onNavigateToPathways} />
    </div>
  );
};

export default FlowEngine;
