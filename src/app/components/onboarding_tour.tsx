// ============================================================================
// --- components/OnboardingTour.tsx ---
// ============================================================================
import React from "react";
import { Map, Play, Book, AlertCircle, ChevronRight } from "lucide-react";
import { useAppStore } from "@/store/useAppStore"; // Adjust this path if your store is located elsewhere

const OnboardingTour = () => {
  const { hasSeenTour, completeTour } = useAppStore();

  if (hasSeenTour) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-500">
      <div className="bg-zinc-900 border border-blue-500/50 rounded-2xl max-w-2xl w-full p-8 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden">
        {/* Cyberpunk Accents */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

        <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-widest flex items-center gap-3">
          <Map className="text-blue-400" /> Initialization Sequence
        </h2>
        <p className="text-zinc-400 mb-8 font-mono text-sm">
          Welcome to your Learning Operating System.
        </p>

        <div className="space-y-6 mb-8">
          <div className="flex gap-4 items-start bg-black/40 p-4 rounded-xl border border-zinc-800">
            <div className="p-3 rounded-lg bg-blue-500/20 text-blue-400">
              <Play size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                1. The Flow Engine
              </h3>
              <p className="text-sm text-zinc-400">
                Your core timer for Deep Work. Use this for general mastery and
                logging overarching hours to your profile.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start bg-black/40 p-4 rounded-xl border border-zinc-800">
            <div className="p-3 rounded-lg bg-purple-500/20 text-purple-400">
              <Book size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                2. Pathways (Hex Grids)
              </h3>
              <p className="text-sm text-zinc-400">
                Build 30-day mastery tracks. Click a day, start the embedded
                local timer, and check it off to light up your Hexagonal grid.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start bg-black/40 p-4 rounded-xl border border-amber-900/40">
            <div className="p-3 rounded-lg bg-amber-500/20 text-amber-400">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-amber-500">
                3. Zeigarnik Open Loops
              </h3>
              <p className="text-sm text-zinc-400">
                If you start a daily pathway node but don't finish it, it will
                haunt your main dashboard as an "Open Loop" until resolved.
                Cognitive tension is a feature.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={completeTour}
          className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest uppercase rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
        >
          Acknowledge & Boot System <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
};

export default OnboardingTour;
