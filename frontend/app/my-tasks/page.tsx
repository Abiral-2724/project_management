"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import AppLayout from "@/components/layout/AppLayout";
import { Icon, Badge, Avatar, Spinner, Empty, formatDate, priorityVariant, statusVariant, getProjectColor } from "@/components/ui";

export default function MyTasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      api.tasks.getAssigned(user.id),
      api.projects.getAll(user.id),
    ]).then(([t, p]) => {
      setTasks(t.tasks || []);
      const all = [...(p.OwnerProject || []), ...(p.MemberProject || [])];
      setProjects(all);
    }).catch(console.error).finally(() => setLoading(false));
  }, [user?.id]);

  const projectMap = projects.reduce((acc, p) => { acc[p.id] = p; return acc; }, {});

  const filtered = tasks.filter((t) => {
    if (filter === "pending" && t.mark_complete) return false;
    if (filter === "completed" && !t.mark_complete) return false;
    if (filter === "overdue" && (t.mark_complete || new Date(t.dueDate) >= new Date())) return false;
    if (priorityFilter !== "all" && t.priority?.toLowerCase() !== priorityFilter) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all: tasks.length,
    pending: tasks.filter((t) => !t.mark_complete).length,
    completed: tasks.filter((t) => t.mark_complete).length,
    overdue: tasks.filter((t) => !t.mark_complete && new Date(t.dueDate) < new Date()).length,
  };

  const isOverdue = (t) => !t.mark_complete && new Date(t.dueDate) < new Date();

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64"><Spinner size={24} /></div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <p className="text-zinc-500 text-xs font-medium tracking-widest uppercase mb-1">Workspace</p>
          <h1 className="text-2xl font-semibold text-white">My Tasks</h1>
        </div>

        {/* Filters row */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          {/* Status filter */}
          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            {[["all","All"], ["pending","Pending"], ["completed","Done"], ["overdue","Overdue"]].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filter === val ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}>
                {label}
                <span className={`ml-1.5 text-xs ${filter === val ? "text-zinc-400" : "text-zinc-700"}`}>{counts[val]}</span>
              </button>
            ))}
          </div>

          {/* Priority filter */}
          <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
            {["all","high","medium","low"].map((p) => (
              <button key={p} onClick={() => setPriorityFilter(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${priorityFilter === p ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}>{p === "all" ? "All Priority" : p}</button>
            ))}
          </div>

          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-0 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5">
            <Icon name="search" size={13} className="text-zinc-600 shrink-0" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter tasks..." className="flex-1 bg-transparent text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none min-w-0" />
          </div>
        </div>

        {/* Task list */}
        {filtered.length === 0 ? (
          <Empty icon="check" title={filter === "all" ? "No tasks assigned" : `No ${filter} tasks`} desc={filter === "all" ? "Tasks assigned to you will appear here" : undefined} />
        ) : (
          <div className="space-y-2">
            {filtered.map((task) => {
              const p = projectMap[task.project_id];
              const color = p ? getProjectColor(p.id) : "#6366f1";
              const overdue = isOverdue(task);
              return (
                <div key={task.id} className={`flex items-center gap-3 p-4 bg-zinc-900 border rounded-xl hover:border-zinc-700 transition-colors ${overdue ? "border-red-500/20 bg-red-500/3" : "border-zinc-800"}`}>
                  {/* Checkbox */}
                  <div className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center ${task.mark_complete ? "bg-emerald-500 border-emerald-500" : overdue ? "border-red-500/50" : "border-zinc-600"}`}>
                    {task.mark_complete && <Icon name="checkSimple" size={9} className="text-white" />}
                  </div>

                  {/* Task info */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${task.mark_complete ? "line-through text-zinc-600" : "text-zinc-200"}`}>{task.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {p && (
                        <Link href={`/project/${p.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-xs hover:opacity-80 transition-opacity" style={{ color }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                          {p.projectName}
                        </Link>
                      )}
                      <span className="text-zinc-700 text-xs">·</span>
                      <Badge variant={statusVariant(task.status)}>{task.status}</Badge>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={priorityVariant(task.priority)}>{task.priority}</Badge>
                    <div className={`flex items-center gap-1 ${overdue ? "text-red-400" : "text-zinc-600"}`}>
                      <Icon name="clock" size={12} />
                      <span className="text-xs">{formatDate(task.dueDate)}</span>
                    </div>
                    {p && (
                      <Link href={`/project/${p.id}`} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                        <Icon name="chevronRight" size={14} />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}