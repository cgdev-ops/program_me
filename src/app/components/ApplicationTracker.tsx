// ============================================================================
// --- components/ApplicationTracker.tsx ---
// ============================================================================
import React, { useState } from "react";
import {
  Plus,
  Trash2,
  X,
  Briefcase,
  Building,
  Maximize2,
  CheckCircle,
  XCircle,
  MinusCircle,
  MessageSquare,
  BarChart2,
  List,
  Hash,
} from "lucide-react";
import { useAppStore, AppStatus } from "@/store/useAppStore";

const generateId = () => {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).substring(2, 15);
};

// Styling maps for different statuses
const statusConfig: Record<
  AppStatus,
  { label: string; colorClass: string; icon: React.ReactNode }
> = {
  applied: {
    label: "Applied",
    colorClass:
      "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30",
    icon: <Briefcase size={16} />,
  },
  interview: {
    label: "Interviewing",
    colorClass:
      "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30",
    icon: <MessageSquare size={16} />,
  },
  hired: {
    label: "Got the Job",
    colorClass:
      "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30",
    icon: <CheckCircle size={16} />,
  },
  rejected: {
    label: "Rejected",
    colorClass:
      "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
    icon: <XCircle size={16} />,
  },
  ignored: {
    label: "Ignored/Ghosted",
    colorClass:
      "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/30",
    icon: <MinusCircle size={16} />,
  },
};

const ApplicationTracker = () => {
  const { applications, addApplication, updateApplication, deleteApplication } =
    useAppStore();

  // UI State
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [activeModalAppId, setActiveModalAppId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"detailed" | "simple">("detailed");

  // Statistics Calculation
  const totalApps = applications.length;
  const stats = {
    applied: applications.filter((a) => a.status === "applied").length,
    interview: applications.filter((a) => a.status === "interview").length,
    hired: applications.filter((a) => a.status === "hired").length,
    rejected: applications.filter((a) => a.status === "rejected").length,
    ignored: applications.filter((a) => a.status === "ignored").length,
  };

  // Detailed Mode Add
  const handleAddDetailed = () => {
    addApplication({
      id: generateId(),
      company: newCompany || "Unknown Company",
      role: newRole || "General Application",
      status: "applied",
      notes: "",
      dateApplied: new Date().toISOString(),
    });
    setNewCompany("");
    setNewRole("");
  };

  // Simple Mode Quick-Log Add
  const handleQuickLog = (status: AppStatus) => {
    addApplication({
      id: generateId(),
      company: "Quick Log (Stats Only)",
      role: "N/A",
      status: status,
      notes: "Logged via Simple Mode.",
      dateApplied: new Date().toISOString(),
    });
  };

  const activeApp = applications.find((app) => app.id === activeModalAppId);

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-200px)] min-h-[600px] relative">
      {/* HEADER & VIEW TOGGLE */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
            Job Tracker
          </h2>
          <p className="text-sm text-zinc-500 font-mono mt-1">
            Total Pipeline: {totalApps}
          </p>
        </div>

        <div className="flex bg-zinc-100 dark:bg-zinc-950 p-1 rounded-lg border border-zinc-200 dark:border-zinc-800 shrink-0">
          <button
            onClick={() => setViewMode("detailed")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold tracking-widest uppercase transition-all ${
              viewMode === "detailed"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            }`}
          >
            <List size={16} /> Detailed
          </button>
          <button
            onClick={() => setViewMode("simple")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold tracking-widest uppercase transition-all ${
              viewMode === "simple"
                ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300"
            }`}
          >
            <Hash size={16} /> Simple
          </button>
        </div>
      </div>

      {/* ========================================== */}
      {/* SIMPLE MODE (NUMBERS ONLY)                 */}
      {/* ========================================== */}
      {viewMode === "simple" && (
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(statusConfig) as AppStatus[]).map((status) => (
              <div
                key={status}
                className={`flex flex-col items-center justify-center p-8 rounded-2xl border bg-white dark:bg-zinc-900/50 ${statusConfig[status].colorClass.replace("bg-", "hover:bg-").replace("/10", "/5")} transition-colors`}
              >
                <div className="text-5xl font-bold font-mono mb-2">
                  {stats[status]}
                </div>
                <div className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 opacity-80">
                  {statusConfig[status].icon} {statusConfig[status].label}
                </div>
                <button
                  onClick={() => handleQuickLog(status)}
                  className={`w-full py-3 rounded-lg border font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors ${statusConfig[status].colorClass}`}
                >
                  <Plus size={18} /> Quick Log
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* DETAILED MODE                              */}
      {/* ========================================== */}
      {viewMode === "detailed" && (
        <>
          {/* STATS RIBBON (Mini version for Detailed Mode) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 shrink-0">
            {(Object.keys(statusConfig) as AppStatus[]).map((status) => (
              <div
                key={status}
                className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center ${statusConfig[status].colorClass}`}
              >
                <div className="text-2xl font-bold font-mono">
                  {stats[status]}
                </div>
                <div className="text-[10px] uppercase tracking-widest mt-1 opacity-80 flex items-center gap-1">
                  {statusConfig[status].label}
                </div>
              </div>
            ))}
          </div>

          {/* ADD FORM */}
          <div className="flex flex-col md:flex-row gap-2 shrink-0 mt-2">
            <div className="flex-1 flex items-center bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 focus-within:border-blue-500 transition-colors">
              <Building size={18} className="text-zinc-400 mr-2" />
              <input
                type="text"
                placeholder="Company Name (Optional)"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
                className="flex-1 bg-transparent py-4 text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>
            <div className="flex-1 flex items-center bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 focus-within:border-blue-500 transition-colors">
              <Briefcase size={18} className="text-zinc-400 mr-2" />
              <input
                type="text"
                placeholder="Role / Title (Optional)"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="flex-1 bg-transparent py-4 text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>
            <button
              onClick={handleAddDetailed}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl transition-colors flex items-center justify-center font-bold tracking-widest uppercase shrink-0 shadow-md"
            >
              <Plus size={20} className="mr-2" /> Log Detailed
            </button>
          </div>

          {/* LIST OF APPLICATIONS */}
          <div className="flex-1 overflow-y-auto pr-2 min-h-0 flex flex-col gap-3">
            {applications.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-400 text-sm uppercase tracking-widest border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                No applications logged yet.
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setActiveModalAppId(app.id)}
                  className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:border-blue-500/50 transition-colors group shrink-0 shadow-sm"
                >
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-blue-500 transition-colors">
                      {app.role}
                    </h3>
                    <div className="text-sm text-zinc-500 dark:text-zinc-400 font-mono mt-1">
                      @ {app.company} •{" "}
                      {new Date(app.dateApplied).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`flex items-center gap-2 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-widest border ${statusConfig[app.status].colorClass}`}
                    >
                      {statusConfig[app.status].icon}{" "}
                      {statusConfig[app.status].label}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteApplication(app.id);
                      }}
                      className="text-zinc-400 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 size={18} />
                    </button>
                    <Maximize2
                      size={18}
                      className="text-zinc-400 group-hover:text-blue-500 hidden md:block"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* THE MASSIVE EDIT MODAL (Available in both modes) */}
      {activeModalAppId && activeApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 max-w-3xl w-full shadow-2xl relative flex flex-col gap-6">
            <button
              onClick={() => setActiveModalAppId(null)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <X size={24} />
            </button>

            <div className="border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <h2 className="text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
                {activeApp.role}
              </h2>
              <p className="text-lg text-zinc-500 dark:text-zinc-400 font-mono mt-1">
                @ {activeApp.company}
              </p>
            </div>

            {/* STATUS SELECTOR */}
            <div>
              <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase block mb-3">
                Pipeline Status
              </label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(statusConfig) as AppStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateApplication(activeApp.id, { status })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all border ${
                      activeApp.status === status
                        ? statusConfig[status].colorClass
                        : "bg-zinc-100 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-600 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700"
                    }`}
                  >
                    {statusConfig[status].icon}
                    {statusConfig[status].label}
                  </button>
                ))}
              </div>
            </div>

            {/* MASSIVE TEXT AREA FOR NOTES */}
            <div className="flex-1">
              <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase block mb-3">
                Interview Notes, Salary Details, & Outcomes
              </label>
              <textarea
                placeholder="Log your recruiter screening details, technical interview questions, or rejection reasons here..."
                value={activeApp.notes}
                onChange={(e) =>
                  updateApplication(activeApp.id, { notes: e.target.value })
                }
                className="w-full h-64 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 focus:border-blue-500 outline-none text-zinc-800 dark:text-zinc-300 resize-none font-mono text-sm leading-relaxed"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveModalAppId(null)}
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

export default ApplicationTracker;
