
// --- COMPONENTS/ZEIGARNIK_LOOPS.TSX ---

import useAppStore from "@/store/useAppStore";
import { AlertCircle } from "lucide-react";
const ZeigarnikLoops = ({ onNavigate }: { onNavigate: () => void }) => {
  const plans = useAppStore((s) => s.plans);
  
  // Find all tasks that have time logged but aren't completed
  const openLoops = plans.flatMap(plan => 
    plan.tasks
      .filter(t => t.durationSpent > 0 && !t.isCompleted)
      .map(t => ({ planName: plan.name, planId: plan.id, ...t }))
  );

  if (openLoops.length === 0) return null;

  return (
    <div className="w-full max-w-2xl mt-12 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle size={18} className="text-amber-500" />
        <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest">
          Open Loops (Zeigarnik Friction)
        </h3>
      </div>
      <div className="grid gap-3">
        {openLoops.map((loop) => (
          <div 
            key={`${loop.planId}-${loop.day}`}
            onClick={onNavigate}
            className="flex items-center justify-between p-4 bg-amber-500/5 dark:bg-amber-900/10 border border-amber-500/30 rounded-xl cursor-pointer hover:bg-amber-500/10 transition-colors"
          >
            <div>
              <div className="text-xs text-amber-600/70 dark:text-amber-400/70 font-mono mb-1">{loop.planName}</div>
              <div className="font-bold text-amber-900 dark:text-amber-500">Day {loop.day} Incomplete</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-amber-600/70 dark:text-amber-400/70 mb-1">Time Elapsed</div>
              <div className="font-mono text-amber-900 dark:text-amber-500">
                {Math.floor(loop.durationSpent / 60)}m {loop.durationSpent % 60}s
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ZeigarnikLoops;