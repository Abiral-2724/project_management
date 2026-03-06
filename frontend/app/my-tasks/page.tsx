"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import AppLayout from "@/components/layout/AppLayout";
import { Avatar, Spinner, formatDate, getProjectColor } from "@/components/ui";
import TaskDetailModal from "@/components/modals/TaskDetailModal";
import {
  Search, CheckCircle2, Clock, ChevronRight, AlertTriangle,
  ListTodo, CheckCheck, X, Loader2,
} from "lucide-react";

// ── Priority badge ────────────────────────────────────────────────────────────
const PRIORITY_META = {
  high:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.25)"  },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  low:    { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)" },
};
function PriorityBadge({ priority }) {
  const m = PRIORITY_META[priority?.toLowerCase()] || { color:"#71717a", bg:"rgba(113,113,122,0.1)", border:"rgba(113,113,122,0.2)" };
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color:m.color, background:m.bg, border:`1px solid ${m.border}` }}>
      <span className="w-1 h-1 rounded-full" style={{ background:m.color }} />{priority}
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, Icon, color, active, onClick }) {
  return (
    <button onClick={onClick} className="flex-1 flex flex-col gap-2 p-4 rounded-2xl text-left transition-all" style={{ background: active ? `${color}0d` : "rgba(255,255,255,0.02)", border:`1px solid ${active ? color+"35" : "rgba(255,255,255,0.06)"}` }}>
      <div className="flex items-center justify-between">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:`${color}18`, border:`1px solid ${color}28` }}>
          <Icon size={13} style={{ color }} strokeWidth={1.8} />
        </div>
        {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background:color }} />}
      </div>
      <div>
        <p className="text-[22px] font-bold text-white leading-none">{value}</p>
        <p className="text-[11px] font-medium mt-1" style={{ color: active ? color : "#71717a" }}>{label}</p>
      </div>
    </button>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function MyTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks]           = useState([]);
  const [projects, setProjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch]         = useState("");

  // modal state
  const [selectedTask, setSelectedTask]   = useState(null);
  const [modalOpen, setModalOpen]         = useState(false);

  const loadData = () => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([api.tasks.getAssigned(user.id), api.projects.getAll(user.id)])
      .then(([t, p]) => {
        setTasks(t.tasks || []);
        setProjects([...(p.OwnerProject || []), ...(p.MemberProject || [])]);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(loadData, [user?.id]);

  const projectMap = projects.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});
  const isOverdue  = t => !t.mark_complete && t.dueDate && new Date(t.dueDate) < new Date();

  const filtered = tasks.filter(t => {
    if (filter === "pending"   && t.mark_complete)  return false;
    if (filter === "completed" && !t.mark_complete) return false;
    if (filter === "overdue"   && !isOverdue(t))    return false;
    if (priorityFilter !== "all" && t.priority?.toLowerCase() !== priorityFilter) return false;
    if (search && !t.title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all:       tasks.length,
    pending:   tasks.filter(t => !t.mark_complete).length,
    completed: tasks.filter(t => t.mark_complete).length,
    overdue:   tasks.filter(isOverdue).length,
  };
  const completionPct = tasks.length ? Math.round((counts.completed / tasks.length) * 100) : 0;

  const openTask = (task) => { setSelectedTask(task); setModalOpen(true); };

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    </AppLayout>
  );

  const selectedProject = selectedTask ? projectMap[selectedTask.project_id] : null;

  return (
    <AppLayout>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');.mytasks *{font-family:'Outfit',sans-serif;}`}</style>

      <div className="mytasks min-h-full" style={{ background: "linear-gradient(160deg,#09090f,#080810)" }}>
        <div className="max-w-4xl mx-auto px-6 py-8">

          {/* ── Header ── */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.12em] mb-1">Workspace</p>
              <h1 className="text-[24px] font-bold text-white tracking-tight">My Tasks</h1>
              <p className="text-[13px] text-zinc-500 mt-1">
                {counts.pending > 0
                  ? `${counts.pending} pending · ${counts.overdue > 0 ? `${counts.overdue} overdue` : "none overdue"}`
                  : "All tasks completed 🎉"}
              </p>
            </div>
            {/* Progress ring */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)" }}>
              <div className="relative w-8 h-8">
                <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                  <circle cx="16" cy="16" r="12" fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="3.5"/>
                  <circle cx="16" cy="16" r="12" fill="none" stroke="#6366f1" strokeWidth="3.5"
                    strokeDasharray={`${2*Math.PI*12}`}
                    strokeDashoffset={`${2*Math.PI*12*(1-completionPct/100)}`}
                    strokeLinecap="round" style={{transition:"stroke-dashoffset 0.6s ease"}}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-indigo-400">{completionPct}%</span>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-indigo-300">Completion</p>
                <p className="text-[10px] text-zinc-600">{counts.completed}/{tasks.length} done</p>
              </div>
            </div>
          </div>

          {/* ── Stat cards ── */}
          <div className="flex gap-3 mb-6">
            <StatCard label="All Tasks"  value={counts.all}       Icon={ListTodo}       color="#6366f1" active={filter==="all"}       onClick={() => setFilter("all")} />
            <StatCard label="Pending"    value={counts.pending}   Icon={Clock}          color="#f59e0b" active={filter==="pending"}   onClick={() => setFilter("pending")} />
            <StatCard label="Completed"  value={counts.completed} Icon={CheckCheck}     color="#10b981" active={filter==="completed"} onClick={() => setFilter("completed")} />
            <StatCard label="Overdue"    value={counts.overdue}   Icon={AlertTriangle}  color="#ef4444" active={filter==="overdue"}   onClick={() => setFilter("overdue")} />
          </div>

          {/* ── Filter bar ── */}
          <div className="flex items-center gap-2 p-2 rounded-2xl mb-5" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2 flex-1 px-2.5 py-1.5 rounded-xl" style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)" }}>
              <Search size={12} className="text-zinc-600 shrink-0"/>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..." className="flex-1 bg-transparent text-[12px] text-zinc-300 placeholder-zinc-700 focus:outline-none min-w-0" style={{fontFamily:"'Outfit',sans-serif"}}/>
              {search && <button onClick={() => setSearch("")} className="text-zinc-600 hover:text-zinc-400"><X size={11}/></button>}
            </div>
            <div className="flex gap-1">
              {[{val:"all",label:"All",col:"#71717a"},{val:"high",label:"High",col:"#ef4444"},{val:"medium",label:"Med",col:"#f59e0b"},{val:"low",label:"Low",col:"#10b981"}].map(({val,label,col}) => {
                const a = priorityFilter===val;
                return (
                  <button key={val} onClick={() => setPriorityFilter(val)} className="px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all" style={{ color:a?col:"#52525b", background:a?`${col}15`:"transparent", border:`1px solid ${a?col+"35":"transparent"}` }}>{label}</button>
                );
              })}
            </div>
            {(filter!=="all"||priorityFilter!=="all"||search) && (
              <button onClick={() => {setFilter("all");setPriorityFilter("all");setSearch("");}} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] text-zinc-500 hover:text-zinc-300 transition-all hover:bg-zinc-800/50">
                <X size={11}/> Clear
              </button>
            )}
          </div>

          {/* ── Task list ── */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.15)" }}>
                <ListTodo size={22} className="text-zinc-600" strokeWidth={1.5}/>
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-zinc-400">{filter==="all"?"No tasks assigned yet":`No ${filter} tasks`}</p>
                <p className="text-[12px] text-zinc-600 mt-1">{filter==="all"?"Tasks assigned to you will appear here":"Try a different filter"}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(task => {
                const proj    = projectMap[task.project_id];
                const color   = proj ? getProjectColor(proj.id) : "#6366f1";
                const overdue = isOverdue(task);
                const done    = task.mark_complete;

                return (
                  <div
                    key={task.id}
                    onClick={() => openTask(task)}
                    className="group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all cursor-pointer"
                    style={{
                      background: overdue ? "linear-gradient(135deg,rgba(239,68,68,0.04),rgba(239,68,68,0.02))" : done ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.025)",
                      border: `1px solid ${overdue ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}`,
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={e => { if (!overdue) e.currentTarget.style.border="1px solid rgba(99,102,241,0.3)"; e.currentTarget.style.background=overdue?"linear-gradient(135deg,rgba(239,68,68,0.06),rgba(239,68,68,0.03))":"rgba(99,102,241,0.04)"; }}
                    onMouseLeave={e => { e.currentTarget.style.border=`1px solid ${overdue?"rgba(239,68,68,0.2)":"rgba(255,255,255,0.06)"}`; e.currentTarget.style.background=overdue?"linear-gradient(135deg,rgba(239,68,68,0.04),rgba(239,68,68,0.02))":done?"rgba(255,255,255,0.015)":"rgba(255,255,255,0.025)"; }}
                  >
                    {/* Checkbox indicator */}
                    <div
                      className="w-[18px] h-[18px] rounded-md shrink-0 flex items-center justify-center"
                      style={
                        done    ? { background:"rgba(16,185,129,0.2)", border:"1.5px solid rgba(16,185,129,0.5)" }
                        : overdue ? { background:"rgba(239,68,68,0.08)", border:"1.5px solid rgba(239,68,68,0.4)" }
                        :           { background:"transparent", border:"1.5px solid rgba(255,255,255,0.15)" }
                      }
                    >
                      {done    && <CheckCircle2 size={11} className="text-emerald-400" strokeWidth={2.5}/>}
                      {overdue && !done && <AlertTriangle size={9} className="text-red-400" strokeWidth={2.5}/>}
                    </div>

                    {/* Project color stripe */}
                    {proj && <div className="w-0.5 h-8 rounded-full shrink-0" style={{ background:color, opacity:done?0.3:0.7 }}/>}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] font-medium leading-snug ${done?"line-through text-zinc-600":overdue?"text-zinc-200":"text-zinc-100"}`}>{task.title}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {proj && (
                          <span className="flex items-center gap-1 text-[11px] font-medium" style={{ color }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background:color }}/>
                            {proj.projectName}
                          </span>
                        )}
                        {proj && <span className="text-zinc-800 text-[10px]">•</span>}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color:"#a1a1aa", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)" }}>
                          {task.status?.replace(/_/g," ")}
                        </span>
                      </div>
                    </div>

                    {/* Right meta */}
                    <div className="flex items-center gap-2.5 shrink-0">
                      <PriorityBadge priority={task.priority}/>
                      <div
                        className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg"
                        style={overdue ? { color:"#f87171", background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)" } : { color:"#71717a", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}
                      >
                        {overdue ? <AlertTriangle size={10} strokeWidth={2}/> : <Clock size={10} strokeWidth={1.8}/>}
                        {task.dueDate ? formatDate(task.dueDate) : "No due date"}
                      </div>
                      <div className="w-6 h-6 rounded-xl flex items-center justify-center text-zinc-700 opacity-0 group-hover:opacity-100 transition-all">
                        <ChevronRight size={13}/>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filtered.length > 0 && (
            <p className="text-center text-[11px] text-zinc-700 mt-6 font-medium">
              Showing {filtered.length} of {tasks.length} task{tasks.length!==1?"s":""}
            </p>
          )}
        </div>
      </div>

      {/* ── Task Detail Modal ── */}
      <TaskDetailModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedTask(null); }}
        task={selectedTask}
        projectId={selectedTask?.project_id}
        projectName={selectedProject?.projectName}
        projectColor={selectedProject ? getProjectColor(selectedProject.id) : undefined}
        onSaved={() => { loadData(); }}
        onEdit={(task) => {
          // hook this up to your edit modal if you have one
          console.log("Edit task:", task);
        }}
      />
    </AppLayout>
  );
}