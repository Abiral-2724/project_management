"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/context/ProjectContext";
import { api } from "@/lib/api";
import AppLayout from "@/components/layout/AppLayout";
import NewProjectModal from "@/components/modals/NewProjectModal";
import { Avatar, formatDate, timeAgo, getProjectColor, actionLabel } from "@/components/ui";
import {
  Plus, CheckSquare, CheckCircle2, Clock, ChevronRight,
  AlertTriangle, Flame, Activity, FolderOpen, Loader2,
  TrendingUp, ArrowUpRight, Sparkles, CalendarDays,
  MoreHorizontal, Circle,
} from "lucide-react";

// ─── Priority config ──────────────────────────────────────────────────────────
const P_META = {
  high:   { color:"#ef4444", bg:"rgba(239,68,68,0.1)",  border:"rgba(239,68,68,0.22)"  },
  medium: { color:"#f59e0b", bg:"rgba(245,158,11,0.1)", border:"rgba(245,158,11,0.22)" },
  low:    { color:"#10b981", bg:"rgba(16,185,129,0.1)", border:"rgba(16,185,129,0.22)" },
};
function PBadge({ priority }) {
  const m = P_META[priority?.toLowerCase()] || { color:"#71717a", bg:"rgba(113,113,122,0.08)", border:"rgba(113,113,122,0.18)" };
  return (
    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-1.5 py-[3px] rounded-full" style={{ color:m.color, background:m.bg, border:`1px solid ${m.border}` }}>
      <span className="w-[5px] h-[5px] rounded-full shrink-0" style={{ background:m.color }} />
      {priority}
    </span>
  );
}

// ─── Activity avatar colors ───────────────────────────────────────────────────
const ACT_COLORS = ["#6366f1","#f59e0b","#10b981","#ec4899","#3b82f6","#8b5cf6","#f97316","#06b6d4"];

// ─── Shared card shell ────────────────────────────────────────────────────────
const card = {
  background: "linear-gradient(160deg,#111119 0%,#0d0d14 100%)",
  border: "1px solid rgba(255,255,255,0.07)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
};

// ─── Greeting ─────────────────────────────────────────────────────────────────
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, Icon, color, sub }) {
  return (
    <div className="relative flex flex-col gap-3 p-5 rounded-2xl overflow-hidden" style={card}>
      <div className="absolute inset-0 pointer-events-none" style={{ background:`radial-gradient(ellipse 120% 80% at 100% 0%,${color}14,transparent 65%)` }} />
      <div className="flex items-center justify-between relative z-10">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background:`${color}1a`, border:`1px solid ${color}30` }}>
          <Icon size={16} style={{ color }} strokeWidth={1.8} />
        </div>
        {sub !== undefined && (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color, background:`${color}14`, border:`1px solid ${color}25` }}>
            {sub}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <p className="text-[30px] font-black text-white leading-none tracking-tight">{value}</p>
        <p className="text-[11px] font-medium text-zinc-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

// ─── Section shell ────────────────────────────────────────────────────────────
function Panel({ title, sub, action, accent, children }) {
  return (
    <div className="relative flex flex-col rounded-2xl overflow-hidden" style={card}>
      {accent && <div className="absolute top-0 left-0 right-0 h-[1px]" style={{ background:`linear-gradient(90deg,${accent}60,transparent 60%)` }} />}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom:"1px solid rgba(255,255,255,0.05)" }}>
        <div>
          <h2 className="text-[13px] font-bold text-zinc-100">{title}</h2>
          {sub && <p className="text-[10px] text-zinc-600 mt-0.5 font-medium">{sub}</p>}
        </div>
        {action}
      </div>
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

// ─── Task row (in dashboard mini-list) ────────────────────────────────────────
function TaskRow({ t }) {
  const isOverdue = !t.mark_complete && t.dueDate && new Date(t.dueDate) < new Date();
  return (
    <div
      className="group flex items-start gap-2.5 px-4 py-2.5 transition-all cursor-default"
      style={{ borderBottom:"1px solid rgba(255,255,255,0.03)" }}
      onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.02)"}
      onMouseLeave={e => e.currentTarget.style.background="transparent"}
    >
      {/* status dot */}
      <div className="mt-1 shrink-0">
        {t.mark_complete
          ? <CheckCircle2 size={13} className="text-emerald-500" strokeWidth={2.5} />
          : isOverdue
            ? <AlertTriangle size={12} className="text-red-500" strokeWidth={2.5} />
            : <Circle size={13} className="text-zinc-700" strokeWidth={2} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[12px] font-medium leading-snug truncate ${t.mark_complete ? "line-through text-zinc-600" : "text-zinc-200"}`}>{t.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <PBadge priority={t.priority} />
          <span className={`text-[10px] font-medium ${isOverdue ? "text-red-400" : "text-zinc-700"}`}>
            {t.dueDate ? formatDate(t.dueDate) : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard body ───────────────────────────────────────────────────────────
function DashboardContent() {
  const { user } = useAuth();
  const { refreshProjects } = useProjects();
  const searchParams = useSearchParams();

  const [projects,       setProjects]       = useState([]);
  const [myTasks,        setMyTasks]        = useState([]);
  const [activity,       setActivity]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);

  useEffect(() => {
    if (searchParams.get("newproject") === "1") setShowNewProject(true);
  }, [searchParams]);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      api.projects.getAll(user.id),
      api.tasks.getAssigned(user.id),
      api.activity.getByUser(user.id),
    ])
      .then(([proj, tasks, act]) => {
        setProjects([...(proj.OwnerProject || []), ...(proj.MemberProject || [])]);
        setMyTasks(tasks.tasks || []);
        setActivity(act.logs || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const completed     = myTasks.filter(t => t.mark_complete).length;
  const overdue       = myTasks.filter(t => !t.mark_complete && t.dueDate && new Date(t.dueDate) < new Date()).length;
  const inProgress    = myTasks.filter(t => t.status === "In Progress").length;
  const pending       = myTasks.filter(t => !t.mark_complete);
  const completionPct = myTasks.length ? Math.round((completed / myTasks.length) * 100) : 0;
  const firstName     = (user?.fullname || "there").split(" ")[0];
  const today         = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric" });

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 size={22} className="animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="min-h-full" style={{ background:"linear-gradient(160deg,#09090f,#07070c)", fontFamily:"'Outfit',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');`}</style>

      {/* ── subtle top noise ── */}
      <div className="pointer-events-none fixed inset-0 z-0" style={{ backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.015'/%3E%3C/svg%3E\")", opacity:0.4 }} />

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 space-y-6">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.15em]">Dashboard</p>
            </div>
            <h1 className="text-[26px] font-black text-white tracking-tight leading-tight">
              {greeting()},{" "}
              <span style={{ background:"linear-gradient(120deg,#a5b4fc,#c084fc)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                {firstName}
              </span>{" "}
              <span className="text-indigo-500">✦</span>
            </h1>
            <p className="text-[12px] text-zinc-600 font-medium mt-1 flex items-center gap-1.5">
              <CalendarDays size={11} className="text-zinc-700" />
              {today}
              {overdue > 0 && (
                <span className="ml-1 text-red-400 font-semibold">· {overdue} overdue</span>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* AI teaser pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold cursor-default" style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.07))", border:"1px solid rgba(99,102,241,0.22)", color:"#a5b4fc" }}>
              <Sparkles size={11} />
              AI Insights
            </div>
            <button
              onClick={() => setShowNewProject(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:-translate-y-px active:translate-y-0"
              style={{ background:"linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow:"0 4px 20px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15)" }}
            >
              <Plus size={14} strokeWidth={2.5} />
              New Project
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total tasks"  value={myTasks.length} Icon={CheckSquare}   color="#6366f1" />
          <StatCard label="Completed"    value={completed}      Icon={CheckCircle2}  color="#10b981" sub={`${completionPct}%`} />
          <StatCard label="In progress"  value={inProgress}     Icon={Flame}         color="#f59e0b" />
          <StatCard label="Overdue"      value={overdue}        Icon={AlertTriangle} color="#ef4444" />
        </div>

        {/* ── Overall progress bar ── */}
        {myTasks.length > 0 && (
          <div
            className="relative flex items-center gap-5 px-5 py-4 rounded-2xl overflow-hidden"
            style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.05))", border:"1px solid rgba(99,102,241,0.18)" }}
          >
            <div className="absolute inset-0 pointer-events-none" style={{ background:"radial-gradient(ellipse 60% 120% at 0% 50%,rgba(99,102,241,0.1),transparent 70%)" }} />

            {/* ring */}
            <div className="relative w-12 h-12 shrink-0">
              <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(99,102,241,0.12)" strokeWidth="5" />
                <circle
                  cx="24" cy="24" r="18" fill="none"
                  stroke={completionPct === 100 ? "#10b981" : "#6366f1"}
                  strokeWidth="5"
                  strokeDasharray={`${2 * Math.PI * 18}`}
                  strokeDashoffset={`${2 * Math.PI * 18 * (1 - completionPct / 100)}`}
                  strokeLinecap="round"
                  style={{ transition:"stroke-dashoffset 0.8s ease" }}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-black text-indigo-300">{completionPct}%</span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-bold text-zinc-200">Task completion</span>
                <span className="text-[11px] text-zinc-500">{completed} of {myTasks.length} done</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background:"rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width:`${completionPct}%`, background: completionPct === 100 ? "linear-gradient(90deg,#10b981,#34d399)" : "linear-gradient(90deg,#6366f1,#8b5cf6)" }}
                />
              </div>
            </div>

            {overdue > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-xl text-[11px] font-semibold text-red-400" style={{ background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.2)" }}>
                <AlertTriangle size={11} />
                {overdue} overdue
              </div>
            )}
          </div>
        )}

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Projects */}
          <Panel
            title="Projects"
            sub={`${projects.length} active`}
            accent="#6366f1"
            action={
              <button onClick={() => setShowNewProject(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all">
                <Plus size={11} strokeWidth={2.5} /> Add
              </button>
            }
            className="lg:col-span-2"
          >
            {projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-4 px-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.15)" }}>
                  <FolderOpen size={20} className="text-zinc-600" strokeWidth={1.5} />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-semibold text-zinc-400">No projects yet</p>
                  <p className="text-[12px] text-zinc-600 mt-1">Create your first project to get started</p>
                </div>
                <button
                  onClick={() => setShowNewProject(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white transition-all hover:-translate-y-px"
                  style={{ background:"linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow:"0 4px 12px rgba(99,102,241,0.3)" }}
                >
                  <Plus size={12} /> Create project
                </button>
              </div>
            ) : (
              <div className="divide-y" style={{ divideColor:"rgba(255,255,255,0.04)" }}>
                {projects.map((p, i) => {
                  const color = getProjectColor(p.id);
                  return (
                    <Link
                      key={p.id}
                      href={`/project/${p.id}`}
                      className="flex items-center gap-3.5 px-5 py-3.5 transition-all group"
                      style={{ borderBottom: i < projects.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}
                      onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.025)"}
                      onMouseLeave={e => e.currentTarget.style.background="transparent"}
                    >
                      {/* icon */}
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-black shrink-0 transition-all group-hover:scale-105"
                        style={{ background:`${color}20`, border:`1px solid ${color}38`, color, boxShadow:`0 0 14px ${color}22` }}
                      >
                        {(p.projectName || "?")[0].toUpperCase()}
                      </div>

                      {/* info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">{p.projectName}</p>
                        <p className="text-[11px] text-zinc-600 truncate mt-0.5">{p.description || "No description"}</p>
                      </div>

                      {/* color dot + arrow */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full opacity-70" style={{ background:color }} />
                        <ChevronRight size={13} className="text-zinc-700 group-hover:text-zinc-400 transition-all group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </Panel>

          {/* My Tasks */}
          <Panel
            title="My Tasks"
            sub={`${pending.length} pending`}
            accent="#f59e0b"
            action={
              <Link href="/my-tasks" className="flex items-center gap-1 text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                All <ArrowUpRight size={10} />
              </Link>
            }
          >
            {myTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 gap-2 px-4">
                <CheckSquare size={18} className="text-zinc-700" strokeWidth={1.5} />
                <p className="text-[12px] text-zinc-600 text-center">No tasks assigned to you</p>
              </div>
            ) : (
              <div>
                {myTasks.slice(0, 7).map(t => <TaskRow key={t.id} t={t} />)}
                {myTasks.length > 7 && (
                  <Link
                    href="/my-tasks"
                    className="flex items-center justify-center gap-1.5 py-3 text-[11px] font-semibold text-zinc-600 hover:text-indigo-400 transition-colors"
                  >
                    +{myTasks.length - 7} more
                  </Link>
                )}
              </div>
            )}
          </Panel>
        </div>

        {/* ── Activity feed ── */}
        <Panel
          title="Recent Activity"
          sub="What's been happening across your workspace"
          accent="#10b981"
          action={
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-emerald-400" style={{ background:"rgba(16,185,129,0.08)", border:"1px solid rgba(16,185,129,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping absolute" style={{ opacity:0.6 }} />
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-0.5" />
              Live
            </div>
          }
        >
          {activity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 px-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.15)" }}>
                <Activity size={16} className="text-zinc-600" strokeWidth={1.5} />
              </div>
              <p className="text-[12px] text-zinc-600">No activity recorded yet</p>
            </div>
          ) : (
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-x-10">
              {activity.slice(0, 8).map((a, i) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 pb-5 relative"
                >
                  {/* connector */}
                  <div
                    className="absolute left-4 top-7 bottom-0 w-px pointer-events-none"
                    style={{ background: i < Math.min(activity.length - 1, 7) ? "linear-gradient(to bottom,rgba(255,255,255,0.06),transparent)" : "transparent" }}
                  />

                  {/* avatar */}
                  <div className="relative shrink-0 z-10">
                    <Avatar
                      name={a.user?.fullname || "?"}
                      src={a.user?.profile}
                      size={28}
                      color={ACT_COLORS[i % ACT_COLORS.length]}
                    />
                    <div
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0d0d14] flex items-center justify-center"
                      style={{ background: ACT_COLORS[i % ACT_COLORS.length] + "33", borderColor:"#0d0d14" }}
                    />
                  </div>

                  {/* text */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className="text-[12px] text-zinc-400 leading-snug">
                      <span className="font-semibold text-zinc-200">{a.user?.fullname}</span>{" "}
                      <span>{actionLabel(a.action, a.meta)}</span>
                    </p>
                    <p className="text-[10px] text-zinc-700 font-medium mt-1">{timeAgo(a.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

      </div>

      <NewProjectModal
        open={showNewProject}
        onClose={() => setShowNewProject(false)}
        onCreated={p => { setProjects(prev => [p, ...prev]); refreshProjects(); }}
      />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <Loader2 size={22} className="animate-spin text-indigo-500" />
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </AppLayout>
  );
}