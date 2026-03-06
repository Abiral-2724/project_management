"use client";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Badge, Avatar, showToast, formatDate, priorityVariant, statusVariant, getProjectColor } from "@/components/ui";
import {
  X, Plus, Check, Pencil, Trash2, Clock, Calendar,
  ChevronRight, AlertTriangle, CheckCircle2, Circle,
  Loader2, User, Flag, Layers, MoreHorizontal,
} from "lucide-react";

// ── Priority meta ─────────────────────────────────────────────────────────────
const PRIORITY_META = {
  high:   { color: "#ef4444", bg: "rgba(239,68,68,0.1)",  border: "rgba(239,68,68,0.25)"  },
  medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
  low:    { color: "#10b981", bg: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.25)" },
};

const STATUS_COLOR = {
  "Todo":        { color: "#71717a", bg: "rgba(113,113,122,0.1)" },
  "In Progress": { color: "#3b82f6", bg: "rgba(59,130,246,0.1)"  },
  "In Review":   { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)"  },
  "Done":        { color: "#10b981", bg: "rgba(16,185,129,0.1)"  },
};

function PriorityBadge({ priority }) {
  const key = priority?.toLowerCase();
  const m = PRIORITY_META[key] || { color: "#71717a", bg: "rgba(113,113,122,0.1)", border: "rgba(113,113,122,0.2)" };
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: m.color, background: m.bg, border: `1px solid ${m.border}` }}>
      <span className="w-1 h-1 rounded-full" style={{ background: m.color }} />
      {priority}
    </span>
  );
}

function StatusBadge({ status }) {
  const m = STATUS_COLOR[status] || STATUS_COLOR["Todo"];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-lg" style={{ color: m.color, background: m.bg }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m.color }} />
      {status}
    </span>
  );
}

// ── SubtaskItem ───────────────────────────────────────────────────────────────
function SubtaskItem({ sub, projectId, onUpdated }) {
  const { user } = useAuth();
  const [editing,    setEditing]    = useState(false);
  const [title,      setTitle]      = useState(sub.title || "");
  const [priority,   setPriority]   = useState(sub.priority || "Medium");
  const [status,     setStatus]     = useState(sub.status || "Todo");
  const [saving,     setSaving]     = useState(false);
  const [completing, setCompleting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);

  const toggleComplete = async (e) => {
    e.stopPropagation();
    setCompleting(true);
    try { await api.tasks.markSubtaskComplete(user.id, projectId, sub.id); onUpdated?.(); }
    catch (err) { showToast(err.message, "error"); }
    finally { setCompleting(false); }
  };

  const saveEdit = async () => {
    if (!title.trim()) { showToast("Title cannot be empty", "warning"); return; }
    setSaving(true);
    try {
      await api.tasks.editSubtasks(user.id, projectId, [{ subtaskId: sub.id, title: title.trim(), priority, status }]);
      setEditing(false); onUpdated?.();
    } catch (err) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  };

  const cancelEdit = () => { setTitle(sub.title || ""); setPriority(sub.priority || "Medium"); setStatus(sub.status || "Todo"); setEditing(false); };

  if (editing) {
    return (
      <div className="rounded-xl p-3 space-y-2.5" style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.2)" }}>
        <input
          ref={inputRef}
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") cancelEdit(); }}
          className="w-full bg-zinc-900/80 border border-zinc-700/60 rounded-lg px-3 py-2 text-[12px] text-zinc-200 focus:outline-none focus:border-indigo-500/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
          style={{ fontFamily: "'Outfit',sans-serif" }}
        />
        <div className="flex items-center gap-2">
          {[["priority",priority,setPriority,["High","Medium","Low"]],["status",status,setStatus,["Todo","In Progress","Done"]]].map(([name,val,setVal,opts]) => (
            <select key={name} value={val} onChange={e => setVal(e.target.value)}
              className="flex-1 bg-zinc-900/80 border border-zinc-700/60 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 focus:outline-none cursor-pointer"
              style={{ fontFamily: "'Outfit',sans-serif" }}
            >
              {opts.map(o => <option key={o} style={{ background: "#1a1a2e" }}>{o}</option>)}
            </select>
          ))}
          <button onClick={saveEdit} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all disabled:opacity-60" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
            {saving ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
            Save
          </button>
          <button onClick={cancelEdit} className="px-2.5 py-1.5 rounded-lg text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${sub.mark_complete ? "opacity-50" : "hover:bg-zinc-800/30"}`} style={{ border: "1px solid rgba(255,255,255,0.05)" }}>
      <button
        onClick={toggleComplete}
        disabled={completing}
        className="w-[18px] h-[18px] rounded-md shrink-0 flex items-center justify-center transition-all"
        style={sub.mark_complete
          ? { background: "rgba(16,185,129,0.2)", border: "1.5px solid rgba(16,185,129,0.5)" }
          : { background: "transparent", border: "1.5px solid rgba(255,255,255,0.15)" }
        }
      >
        {completing
          ? <Loader2 size={10} className="animate-spin text-zinc-500" />
          : sub.mark_complete
            ? <CheckCircle2 size={11} className="text-emerald-400" strokeWidth={2.5} />
            : null
        }
      </button>

      <span className={`flex-1 text-[12px] leading-snug ${sub.mark_complete ? "line-through text-zinc-600" : "text-zinc-300"}`}>{sub.title}</span>

      <div className="flex items-center gap-1.5 shrink-0">
        <PriorityBadge priority={sub.priority} />
        <StatusBadge status={sub.status} />
      </div>

      <button onClick={() => setEditing(true)} className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-all">
        <Pencil size={10} />
      </button>
    </div>
  );
}

// ── AddSubtaskForm ────────────────────────────────────────────────────────────
function AddSubtaskForm({ taskId, projectId, assigneEmail, dueDate, onAdded, onCancel }) {
  const { user } = useAuth();
  const [title, setTitle]     = useState("");
  const [priority, setPriority] = useState("Medium");
  const [saving, setSaving]   = useState(false);
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const save = async () => {
    if (!title.trim()) { showToast("Enter a subtask title", "warning"); return; }
    setSaving(true);
    try {
      await api.tasks.addSubtasks(user.id, projectId, [{
        title: title.trim(), priority, status: "Todo", taskId,
        assigneEmail: assigneEmail || "", startDate: new Date().toISOString(), dueDate: dueDate || new Date().toISOString(),
      }]);
      showToast("Subtask added"); setTitle(""); setPriority("Medium"); onAdded?.();
    } catch (err) { showToast(err.message, "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="rounded-xl p-3 space-y-2.5" style={{ background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.25)" }}>
      <input
        ref={inputRef}
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") onCancel?.(); }}
        placeholder="Subtask title…"
        className="w-full bg-zinc-900/80 border border-zinc-700/60 rounded-lg px-3 py-2 text-[12px] text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-indigo-500/60 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
        style={{ fontFamily: "'Outfit',sans-serif" }}
      />
      <div className="flex items-center gap-2">
        <select value={priority} onChange={e => setPriority(e.target.value)}
          className="bg-zinc-900/80 border border-zinc-700/60 rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 focus:outline-none cursor-pointer"
          style={{ fontFamily: "'Outfit',sans-serif" }}
        >
          {["High","Medium","Low"].map(p => <option key={p} style={{ background: "#1a1a2e" }}>{p}</option>)}
        </select>
        <div className="flex-1" />
        <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-all disabled:opacity-60" style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)" }}>
          {saving ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
          {saving ? "Adding…" : "Add"}
        </button>
        <button onClick={onCancel} className="px-2.5 py-1.5 rounded-lg text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">Cancel</button>
      </div>
    </div>
  );
}

// ── TaskDetailModal ───────────────────────────────────────────────────────────
export default function TaskDetailModal({ open, onClose, task, projectId, projectName, projectColor, members = [], onSaved, onEdit }) {
  const { user }      = useAuth();
  const [subtasks,    setSubtasks]    = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [completing,  setCompleting]  = useState(false);

  const loadSubtasks = async () => {
    if (!task?.id) return;
    setLoading(true);
    try {
      const data = await api.tasks.getAllWithSubtasks(user.id, projectId);
      const found = (data.TasksDetail || []).find(t => t.id === task.id);
      setSubtasks(found?.subtasks || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (open && task) loadSubtasks();
    if (!open) { setShowAddForm(false); setSubtasks([]); }
  }, [open, task?.id]);

  // close on Escape
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  const toggleTaskComplete = async () => {
    setCompleting(true);
    try { await api.tasks.markComplete(user.id, projectId, task.id); onSaved?.(); onClose(); }
    catch (err) { showToast(err.message, "error"); }
    finally { setCompleting(false); }
  };

  if (!open || !task) return null;

  const completedCount = subtasks.filter(s => s.mark_complete).length;
  const progress       = subtasks.length ? Math.round((completedCount / subtasks.length) * 100) : 0;
  const isOverdue      = !task.mark_complete && task.dueDate && new Date(task.dueDate) < new Date();
  const pMeta          = PRIORITY_META[task.priority?.toLowerCase()] || { color: "#71717a" };
  const color          = projectColor || "#6366f1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ fontFamily: "'Outfit',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');`}</style>

      {/* backdrop */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{ background: "rgba(0,0,0,0.75)" }}
        onClick={onClose}
      />

      {/* panel */}
      <div
        className="relative w-full max-w-[520px] max-h-[88vh] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg,#111119,#0d0d15)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 40px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.03)",
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Colored top accent ── */}
        <div className="h-0.5 w-full shrink-0" style={{ background: `linear-gradient(90deg,${color},transparent 60%)` }} />

        {/* ── Header ── */}
        <div className="px-5 pt-5 pb-4 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              {/* Project + breadcrumb */}
              {projectName && (
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color }}>{projectName}</span>
                  <ChevronRight size={10} className="text-zinc-700" />
                  <span className="text-[11px] text-zinc-600">Task Detail</span>
                </div>
              )}

              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
                {task.mark_complete && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                    <CheckCircle2 size={9} /> Completed
                  </span>
                )}
                {isOverdue && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-400 px-2 py-0.5 rounded-full" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                    <AlertTriangle size={9} /> Overdue
                  </span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-[16px] font-bold text-white leading-snug">{task.title}</h2>
              {task.description && (
                <p className="text-[12.5px] text-zinc-500 mt-2 leading-relaxed">{task.description}</p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => { onClose(); onEdit?.(task); }}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
                title="Edit task"
              >
                <Pencil size={12} />
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-200 hover:bg-zinc-800 transition-all"
              >
                <X size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Meta info row ── */}
        <div className="grid grid-cols-2 gap-2 px-5 py-3 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          {/* Assignee */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.25)" }}>
              <User size={11} className="text-indigo-400" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-zinc-700 font-medium uppercase tracking-wider">Assignee</p>
              <p className="text-[12px] text-zinc-300 font-medium truncate">{task.assignee_email?.split("@")[0] || "Unassigned"}</p>
            </div>
          </div>

          {/* Due date */}
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${isOverdue ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.06)"}` }}>
            <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0" style={{ background: isOverdue ? "rgba(239,68,68,0.15)" : "rgba(99,102,241,0.15)", border: `1px solid ${isOverdue ? "rgba(239,68,68,0.25)" : "rgba(99,102,241,0.25)"}` }}>
              <Calendar size={11} className={isOverdue ? "text-red-400" : "text-indigo-400"} />
            </div>
            <div>
              <p className="text-[10px] text-zinc-700 font-medium uppercase tracking-wider">Due date</p>
              <p className={`text-[12px] font-medium ${isOverdue ? "text-red-400" : "text-zinc-300"}`}>
                {task.dueDate ? formatDate(task.dueDate) : "Not set"}
              </p>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-4" style={{ scrollbarWidth: "none" }}>

          {/* Subtasks header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers size={13} className="text-zinc-500" strokeWidth={1.8} />
              <span className="text-[12px] font-semibold text-zinc-300">Subtasks</span>
              {subtasks.length > 0 && (
                <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-800/80 px-1.5 py-0.5 rounded-full border border-zinc-700/50">
                  {completedCount}/{subtasks.length}
                </span>
              )}
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
              >
                <Plus size={11} /> Add subtask
              </button>
            )}
          </div>

          {/* Progress bar */}
          {subtasks.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-medium text-zinc-600">Progress</span>
                <span className="text-[10px] font-bold" style={{ color: progress === 100 ? "#10b981" : "#6366f1" }}>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: progress === 100 ? "linear-gradient(90deg,#10b981,#34d399)" : `linear-gradient(90deg,${color},#8b5cf6)` }}
                />
              </div>
            </div>
          )}

          {/* Add form */}
          {showAddForm && (
            <div className="mb-3">
              <AddSubtaskForm
                taskId={task.id} projectId={projectId}
                assigneEmail={task.assignee_email} dueDate={task.dueDate}
                onAdded={() => { loadSubtasks(); setShowAddForm(false); onSaved?.(); }}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          )}

          {/* Subtask list */}
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 size={20} className="animate-spin text-indigo-500" />
            </div>
          ) : subtasks.length === 0 && !showAddForm ? (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex flex-col items-center justify-center py-10 rounded-xl transition-all hover:bg-zinc-800/20 group"
              style={{ border: "1.5px dashed rgba(255,255,255,0.08)" }}
            >
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-2.5 transition-all group-hover:scale-110" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                <Plus size={16} className="text-indigo-500" />
              </div>
              <p className="text-[12px] font-medium text-zinc-600 group-hover:text-zinc-400 transition-colors">Add subtasks to break this down</p>
            </button>
          ) : (
            <div className="space-y-1.5">
              {subtasks.map(sub => (
                <SubtaskItem key={sub.id} sub={sub} projectId={projectId} onUpdated={() => { loadSubtasks(); onSaved?.(); }} />
              ))}
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-3 shrink-0 flex items-center justify-between gap-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}>
          <p className="text-[10px] text-zinc-700 hidden sm:flex items-center gap-1.5">
            <kbd className="bg-zinc-800/80 border border-zinc-700/50 px-1.5 py-0.5 rounded text-zinc-600 font-mono text-[9px]">Esc</kbd>
            to close ·
            <kbd className="bg-zinc-800/80 border border-zinc-700/50 px-1.5 py-0.5 rounded text-zinc-600 font-mono text-[9px]">Enter</kbd>
            to save
          </p>

          <button
            onClick={toggleTaskComplete}
            disabled={completing}
            className="ml-auto flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all disabled:opacity-60"
            style={task.mark_complete
              ? { background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#a1a1aa" }
              : { background: "linear-gradient(135deg,rgba(16,185,129,0.15),rgba(16,185,129,0.08))", border: "1px solid rgba(16,185,129,0.3)", color: "#34d399" }
            }
          >
            {completing
              ? <Loader2 size={13} className="animate-spin" />
              : task.mark_complete
                ? <><Circle size={13} /> Reopen task</>
                : <><CheckCircle2 size={13} /> Mark complete</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}