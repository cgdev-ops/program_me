import React, { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
}

interface FocusSession {
  id: string;
  date: string;
  categoryId: string;
  durationMinutes: number;
  takeawayNote: string;
}

export default function FlowEngine() {
  // Engine State
  const [appState, setAppState] = useState<"idle" | "running" | "logging">(
    "idle",
  );
  const [mode, setMode] = useState<"stopwatch" | "timer">("stopwatch");

  // Tracking Variables
  const [secondsActive, setSecondsActive] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState(25); // Default Pomodoro

  // Log Data
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [takeaway, setTakeaway] = useState("");

  // Mock Categories (Will map to your global state)
  const categories: Category[] = [
    { id: "1", name: "DSA & Algorithms" },
    { id: "2", name: "System Architecture" },
    { id: "3", name: "Debugging" },
    { id: "4", name: "Documentation" },
  ];

  // The Core Clock Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (appState === "running") {
      interval = setInterval(() => {
        setSecondsActive((prev) => {
          const newTotal = prev + 1;

          // Auto-stop if Timer mode reaches the target
          if (mode === "timer" && newTotal >= targetMinutes * 60) {
            clearInterval(interval);
            // Play an audio chime here in the future
            setAppState("logging");
            return targetMinutes * 60;
          }
          return newTotal;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [appState, mode, targetMinutes]);

  // UI Actions
  const handleStart = () => {
    if (!selectedCategory)
      return alert("Select a category to set your intent.");
    if (mode === "timer" && targetMinutes <= 0)
      return alert("Set a valid time block.");
    setAppState("running");
  };

  const handleStop = () => setAppState("logging");

  const handleSaveCard = () => {
    const newSession: FocusSession = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      categoryId: selectedCategory,
      durationMinutes: Math.floor(secondsActive / 60),
      takeawayNote: takeaway,
    };

    console.log("Saving to local JSON state:", newSession);

    // Reset Engine for next session
    setAppState("idle");
    setSecondsActive(0);
    setTakeaway("");
  };

  // Display Formatter
  const getDisplayTime = () => {
    let displaySeconds = secondsActive;
    if (mode === "timer") {
      displaySeconds = targetMinutes * 60 - secondsActive;
    }

    const m = Math.floor(displaySeconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (displaySeconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 w-full max-w-md mx-auto border rounded-xl shadow-sm bg-white dark:bg-zinc-900 dark:text-white dark:border-zinc-800 transition-colors">
      {/* State 1 & 2: Timer/Stopwatch UI */}
      {appState !== "logging" && (
        <div className="w-full text-center">
          {/* Mode Toggle (Hidden while running) */}
          {appState === "idle" && (
            <div className="flex justify-center gap-2 mb-6 p-1 bg-gray-100 dark:bg-zinc-800 rounded-lg">
              <button
                onClick={() => setMode("stopwatch")}
                className={`flex-1 py-1 px-3 rounded text-sm font-medium transition ${mode === "stopwatch" ? "bg-white dark:bg-zinc-700 shadow" : "text-gray-500"}`}
              >
                Stopwatch
              </button>
              <button
                onClick={() => setMode("timer")}
                className={`flex-1 py-1 px-3 rounded text-sm font-medium transition ${mode === "timer" ? "bg-white dark:bg-zinc-700 shadow" : "text-gray-500"}`}
              >
                Timer
              </button>
            </div>
          )}

          <h2 className="text-6xl font-mono mb-8 font-light tracking-tight">
            {getDisplayTime()}
          </h2>

          {appState === "idle" ? (
            <div className="flex flex-col gap-4">
              {mode === "timer" && (
                <input
                  type="number"
                  min="1"
                  value={targetMinutes}
                  onChange={(e) => setTargetMinutes(Number(e.target.value))}
                  className="p-3 border dark:border-zinc-700 rounded bg-transparent text-center font-mono"
                  placeholder="Minutes"
                />
              )}
              <select
                className="p-3 border dark:border-zinc-700 rounded bg-transparent outline-none"
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
                className="bg-blue-600 text-white p-4 rounded font-bold hover:bg-blue-700 transition w-full"
              >
                Initiate Focus Block
              </button>
            </div>
          ) : (
            <button
              onClick={handleStop}
              className="bg-red-600/10 text-red-600 dark:bg-red-900/30 dark:text-red-500 border border-red-600/20 p-4 rounded font-bold hover:bg-red-600 hover:text-white transition w-full"
            >
              Halt & Log Session
            </button>
          )}
        </div>
      )}

      {/* State 3: The Execution Log */}
      {appState === "logging" && (
        <div className="w-full flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="border-b dark:border-zinc-800 pb-3">
            <h3 className="text-xl font-bold">Execution Log</h3>
            <p className="text-sm text-gray-500 mt-1">
              Time tracked: {Math.floor(secondsActive / 60)} minutes
            </p>
          </div>

          <select
            className="p-3 border dark:border-zinc-700 rounded bg-transparent outline-none"
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
            className="w-full p-4 border dark:border-zinc-700 rounded h-32 bg-transparent focus:outline-none focus:border-blue-500 transition resize-none"
            placeholder="Document your reps: Link to challenge, bug resolved, or key takeaway..."
            value={takeaway}
            onChange={(e) => setTakeaway(e.target.value)}
          />

          <button
            onClick={handleSaveCard}
            className="bg-green-600 text-white p-4 rounded font-bold hover:bg-green-700 transition w-full shadow-lg shadow-green-900/20"
          >
            Commit to Mastery Record
          </button>
        </div>
      )}
    </div>
  );
}
