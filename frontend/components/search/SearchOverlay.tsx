"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Icon, Spinner, getProjectColor } from "@/components/ui";

export default function SearchOverlay({ projects = [], onClose }) {
  const { user } = useAuth();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query) => {
    if (!query || query.trim().length < 2) { setResults(null); return; }
    setLoading(true);
    try {
      const data = await api.search.global(user.id, query.trim());
      setResults(data.results);
    } catch { setResults(null); }
    finally { setLoading(false); }
  }, [user?.id]);

  useEffect(() => {
    const t = setTimeout(() => search(q), 280);
    return () => clearTimeout(t);
  }, [q, search]);

  const goto = (href) => { onClose(); router.push(href); };

  const allResults = results ? [
    ...(results.projects || []).map((p) => ({ type: "project", label: p.projectName, sub: "Project", href: `/project/${p.id}`, color: getProjectColor(p.id) })),
    ...(results.tasks || []).map((t) => ({ type: "task", label: t.title, sub: t.status, href: `/project/${t.project_id}` })),
    ...(results.members || []).map((m) => ({ type: "member", label: m.fullname, sub: m.email, href: "/settings" })),
  ] : [];

  const quickActions = [
    { icon: "plus", label: "Create new task", href: null },
    { icon: "folder", label: "New project", href: "/dashboard?newproject=1" },
    { icon: "users", label: "My tasks", href: "/my-tasks" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700/80 rounded-2xl shadow-2xl overflow-hidden"
        style={{ boxShadow: "0 32px 72px rgba(0,0,0,0.75)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800">
          {loading ? <Spinner size={15} /> : <Icon name="search" size={15} className="text-zinc-500 shrink-0" />}
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search tasks, projects, members..."
            className="flex-1 bg-transparent text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none"
          />
          <kbd className="text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded">ESC</kbd>
        </div>

        {/* Results */}
        {allResults.length > 0 ? (
          <div className="max-h-72 overflow-y-auto py-1.5">
            {allResults.map((r, i) => (
              <button key={i} onClick={() => goto(r.href)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/70 transition-colors text-left">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0`} style={{ background: r.type === "project" ? (r.color + "30") : "#27272a" }}>
                  <Icon name={r.type === "project" ? "folder" : r.type === "task" ? "check" : "users"} size={13} style={{ color: r.type === "project" ? r.color : "#71717a" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-200 truncate">{r.label}</p>
                  <p className="text-xs text-zinc-600">{r.sub}</p>
                </div>
                <Icon name="chevronRight" size={13} className="text-zinc-700" />
              </button>
            ))}
          </div>
        ) : q.length > 1 && !loading ? (
          <div className="py-10 text-center text-sm text-zinc-600">No results for "{q}"</div>
        ) : (
          <div className="py-2">
            <p className="text-xs text-zinc-600 px-4 py-2 uppercase tracking-widest">Quick actions</p>
            {quickActions.map((a) => (
              <button key={a.label} onClick={() => a.href && goto(a.href)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-zinc-800/70 transition-colors text-left">
                <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                  <Icon name={a.icon} size={13} className="text-zinc-500" />
                </div>
                <span className="text-sm text-zinc-400">{a.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}