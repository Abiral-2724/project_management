"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/context/ProjectContext";
import { api } from "@/lib/api";
import AppLayout from "@/components/layout/AppLayout";
import NewProjectModal from "@/components/modals/NewProjectModal";
import {
  Icon, Avatar, Badge, Spinner, Empty,
  formatDate, timeAgo, getProjectColor,
  actionLabel, priorityVariant,
} from "@/components/ui";

function StatCard({ label, value, icon, color }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: color + "22" }}>
        <Icon name={icon} size={16} style={{ color }} />
      </div>
      <div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
    </div>
  );
}

// useSearchParams MUST be inside a Suspense boundary in Next.js 14
function DashboardContent() {
  const { user } = useAuth();
  const { refreshProjects } = useProjects();
  const searchParams = useSearchParams();
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const completed  = myTasks.filter((t) => t.mark_complete).length;
  const overdue    = myTasks.filter((t) => !t.mark_complete && new Date(t.dueDate) < new Date()).length;
  const inProgress = myTasks.filter((t) => t.status === "In Progress").length;

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Spinner size={24} /></div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-zinc-500 text-xs font-medium tracking-widest uppercase mb-1">Overview</p>
          <h1 className="text-2xl font-semibold text-white">
            Good {new Date().getHours() < 12 ? "morning" : "afternoon"},{" "}
            {(user?.fullname || "there").split(" ")[0]} ✦
          </h1>
        </div>
        <button
          onClick={() => setShowNewProject(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Icon name="plus" size={15} /> New Project
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="My Tasks"    value={myTasks.length} icon="check"    color="#6366f1" />
        <StatCard label="Completed"   value={completed}      icon="star"     color="#10b981" />
        <StatCard label="In Progress" value={inProgress}     icon="activity" color="#f59e0b" />
        <StatCard label="Overdue"     value={overdue}        icon="clock"    color="#ef4444" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Projects */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-200">Projects</h2>
            <span className="text-xs text-zinc-500">{projects.length} total</span>
          </div>
          {projects.length === 0 ? (
            <Empty
              icon="folder"
              title="No projects yet"
              desc="Create your first project to get started"
              action={
                <button
                  onClick={() => setShowNewProject(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs rounded-lg transition-colors"
                >
                  <Icon name="plus" size={12} /> New Project
                </button>
              }
            />
          ) : (
            <div className="space-y-1">
              {projects.map((p) => {
                const color = getProjectColor(p.id);
                return (
                  <Link
                    key={p.id}
                    href={`/project/${p.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800/60 transition-colors group"
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ background: color + "33", border: `1px solid ${color}44`, color }}
                    >
                      {(p.projectName || "?")[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">{p.projectName}</p>
                      <p className="text-xs text-zinc-500 truncate">{p.description}</p>
                    </div>
                    <Icon name="chevronRight" size={14} className="text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* My Tasks */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-200">My Tasks</h2>
            <Link href="/my-tasks" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all
            </Link>
          </div>
          {myTasks.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-6">No tasks assigned to you</p>
          ) : (
            <div className="space-y-2">
              {myTasks.slice(0, 6).map((t) => (
                <div key={t.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-zinc-800/40 transition-colors">
                  <div className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 ${t.mark_complete ? "bg-emerald-500 border-emerald-500" : "border-zinc-600"}`}>
                    {t.mark_complete && <Icon name="checkSimple" size={9} className="text-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${t.mark_complete ? "line-through text-zinc-600" : "text-zinc-300"}`}>
                      {t.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>
                      <span className="text-xs text-zinc-600">{formatDate(t.dueDate)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h2 className="text-sm font-semibold text-zinc-200 mb-4">Recent Activity</h2>
        {activity.length === 0 ? (
          <p className="text-xs text-zinc-600 text-center py-4">No activity yet</p>
        ) : (
          <div className="space-y-3">
            {activity.slice(0, 8).map((a, i) => {
              const colors = ["#6366f1","#f59e0b","#10b981","#ec4899","#3b82f6","#8b5cf6"];
              return (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar name={a.user?.fullname || "?"} size={28} color={colors[i % colors.length]} />
                    {i < Math.min(activity.length - 1, 7) && (
                      <div className="absolute left-1/2 top-full w-px h-3 bg-zinc-800 -translate-x-1/2" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-3">
                    <p className="text-xs text-zinc-300">
                      <span className="font-medium text-zinc-200">{a.user?.fullname}</span>{" "}
                      {actionLabel(a.action, a.meta)}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5">{timeAgo(a.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <NewProjectModal
        open={showNewProject}
        onClose={() => setShowNewProject(false)}
        onCreated={(p) => { setProjects((prev) => [p, ...prev]); refreshProjects(); }}
      />
    </div>
  );
}

// Suspense wrapper is REQUIRED because DashboardContent uses useSearchParams()
export default function DashboardPage() {
  return (
    <AppLayout>
      <Suspense fallback={<div className="flex items-center justify-center h-64"><Spinner size={24} /></div>}>
        <DashboardContent />
      </Suspense>
    </AppLayout>
  );
}