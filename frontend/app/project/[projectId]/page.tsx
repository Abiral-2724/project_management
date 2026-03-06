"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { api } from "@/lib/api";
import AppLayout from "@/components/layout/AppLayout";
import TaskModal from "@/components/modals/TaskModal";
import TaskDetailModal from "@/components/modals/TaskDetailModal";
import {
  summarizeChat, extractTasksFromText,
  generateProductivityInsight, generateStandupReport,
  extractTasksFromMeetingNotes, generateSmartDigest,
} from "@/lib/gemini";
import {
  Icon, Avatar, Badge, Spinner, Empty, Button, Modal,
  Input, Select, Textarea, showToast,
  formatDate, timeAgo, getProjectColor,
  priorityVariant, statusVariant, actionLabel,
} from "@/components/ui";

// ─── OVERDUE / DUE-SOON HELPERS ──────────────────────────────────────────────
const dayStart  = (d) => new Date(new Date(d).setHours(0, 0, 0, 0));
const isOverdue = (task) => !task.mark_complete && task.dueDate && dayStart(task.dueDate) < dayStart(new Date());
const isDueSoon = (task) => {
  if (task.mark_complete || !task.dueDate) return false;
  const due   = dayStart(task.dueDate);
  const today = dayStart(new Date());
  const diff  = (due - today) / (1000 * 60 * 60 * 24);
  return diff >= 0 && diff <= 1;
};
const dueDateStyle = (task) => {
  if (isOverdue(task)) return "text-red-400 font-semibold";
  if (isDueSoon(task)) return "text-amber-400 font-semibold";
  return "text-zinc-600";
};
const dueDateLabel = (task) => {
  if (!task.dueDate) return "";
  if (isOverdue(task)) return `⚠ ${formatDate(task.dueDate)}`;
  if (isDueSoon(task)) return `🕐 ${formatDate(task.dueDate)}`;
  return formatDate(task.dueDate);
};

// ─── SHARED AI SPARKLE ICON ───────────────────────────────────────────────────
const Sparkle = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6L12 2z"/>
  </svg>
);

// Shared AI result panel used across features
function AiPanel({ title, content, onClose, loading }) {
  return (
    <div className="rounded-xl border border-violet-500/25 bg-gradient-to-br from-violet-950/50 to-indigo-950/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-violet-500/20">
        <span className="text-violet-400"><Sparkle /></span>
        <span className="text-xs font-semibold text-violet-300 tracking-wide">{title}</span>
        {onClose && (
          <button onClick={onClose} className="ml-auto text-zinc-600 hover:text-zinc-400 transition-colors">
            <Icon name="x" size={12} />
          </button>
        )}
      </div>
      <div className="px-4 py-3">
        {loading ? (
          <div className="flex items-center gap-2 py-2">
            <span className="w-3 h-3 border-2 border-violet-500/40 border-t-violet-400 rounded-full animate-spin" />
            <span className="text-xs text-zinc-500">Generating…</span>
          </div>
        ) : (
          <div className="text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">{content}</div>
        )}
      </div>
    </div>
  );
}

// ─── KANBAN BOARD ─────────────────────────────────────────────────────────────
function KanbanView({ tasks, members, projectId, onAddTask, onTaskUpdated }) {
  const { user } = useAuth();
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const [detailTask,  setDetailTask]  = useState(null);
  const COLS      = ["Todo","In Progress","In Review","Done"];
  const colColors = { "Todo":"#71717a","In Progress":"#3b82f6","In Review":"#8b5cf6","Done":"#10b981" };

  const tasksByCol = COLS.reduce((acc, col) => {
    acc[col] = tasks.filter((t) => t.status === col);
    return acc;
  }, {});

  const moveTask = async (taskId, toCol) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || task.status === toCol) return;
    try {
      await api.tasks.edit(user.id, projectId, [{ ...task, taskId: task.id, assigneEmail: task.assignee_email, status: toCol }]);
      onTaskUpdated?.();
    } catch (e) { showToast(e.message, "error"); }
  };

  const toggleComplete = async (task) => {
    try {
      await api.tasks.markComplete(user.id, projectId, task.id);
      onTaskUpdated?.();
    } catch (e) { showToast(e.message, "error"); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-semibold text-zinc-200">Board</h2>
        <Button size="sm" icon="plus" onClick={onAddTask}>Add Task</Button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLS.map((col) => (
          <div
            key={col}
            className={`flex-shrink-0 w-72 rounded-xl border transition-colors ${dragOver === col ? "border-indigo-500/50 bg-indigo-500/5" : "border-zinc-800 bg-zinc-900/50"}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(col); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => { if (dragging) { moveTask(dragging, col); setDragging(null); setDragOver(null); } }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: colColors[col] }} />
                <span className="text-xs font-semibold text-zinc-300">{col}</span>
                <span className="text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded-md">{tasksByCol[col].length}</span>
              </div>
              <button onClick={onAddTask} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                <Icon name="plus" size={14} />
              </button>
            </div>
            <div className="p-3 space-y-2 min-h-32">
              {tasksByCol[col].map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDragging(task.id)}
                  onClick={() => setDetailTask(task)}
                  className={`bg-zinc-900 border rounded-lg p-3 cursor-pointer hover:shadow-lg hover:shadow-black/20 transition-all group ${isOverdue(task) ? "border-red-500/40 hover:border-red-500/60" : isDueSoon(task) ? "border-amber-500/30 hover:border-amber-500/50" : "border-zinc-800 hover:border-zinc-600"}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleComplete(task); }}
                        className={`w-4 h-4 mt-0.5 rounded border shrink-0 flex items-center justify-center transition-colors ${task.mark_complete ? "bg-emerald-500 border-emerald-500" : "border-zinc-600 hover:border-zinc-400"}`}
                      >
                        {task.mark_complete && <Icon name="checkSimple" size={9} className="text-white" />}
                      </button>
                      <p className={`text-xs font-medium leading-snug ${task.mark_complete ? "line-through text-zinc-600" : "text-zinc-200"}`}>{task.title}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setEditTask(task); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-zinc-400 shrink-0">
                      <Icon name="edit" size={12} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant={priorityVariant(task.priority)}>{task.priority}</Badge>
                    <div className="flex items-center gap-1.5">
                      <Icon name="clock" size={11} className={isOverdue(task) ? "text-red-400" : isDueSoon(task) ? "text-amber-400" : "text-zinc-600"} />
                      <span className={`text-xs ${dueDateStyle(task)}`}>{dueDateLabel(task)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-zinc-800/60">
                    <Avatar name={task.assignee_email?.split("@")[0] || "?"} size={18} color="#6366f1" />
                    <span className="text-xs text-zinc-600 truncate">{task.assignee_email?.split("@")[0]}</span>
                  </div>
                  {task.subtasks?.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <Icon name="list" size={10} className="text-zinc-600" />
                      <span className="text-xs text-zinc-600">
                        {task.subtasks.filter((s) => s.mark_complete).length}/{task.subtasks.length} subtasks
                      </span>
                    </div>
                  )}
                </div>
              ))}
              {tasksByCol[col].length === 0 && (
                <div className="flex items-center justify-center h-20 text-xs text-zinc-700 border border-dashed border-zinc-800 rounded-lg">No tasks</div>
              )}
            </div>
          </div>
        ))}
      </div>
      {editTask && (
        <TaskModal open={!!editTask} onClose={() => setEditTask(null)} projectId={projectId} task={editTask} members={members} onSaved={() => { setEditTask(null); onTaskUpdated?.(); }} />
      )}
      <TaskDetailModal
        open={!!detailTask}
        task={detailTask}
        projectId={projectId}
        members={members}
        onClose={() => setDetailTask(null)}
        onSaved={() => { setDetailTask(null); onTaskUpdated?.(); }}
        onEdit={(t) => setEditTask(t)}
      />
    </div>
  );
}

// ─── LIST VIEW ────────────────────────────────────────────────────────────────
function ListView({ tasks, members, projectId, onAddTask, onTaskUpdated }) {
  const { user } = useAuth();
  const [editTask,   setEditTask]   = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [expanded,   setExpanded]   = useState({});

  const toggleComplete = async (task) => {
    try {
      await api.tasks.markComplete(user.id, projectId, task.id);
      onTaskUpdated?.();
    } catch (e) { showToast(e.message, "error"); }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-200">List</h2>
        <Button size="sm" icon="plus" onClick={onAddTask}>Add Task</Button>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="grid gap-0 text-xs text-zinc-500 font-medium px-4 py-2.5 border-b border-zinc-800" style={{ gridTemplateColumns: "1fr 140px 120px 100px 100px 36px" }}>
          <span>Task</span><span>Assignee</span><span>Status</span><span>Priority</span><span>Due</span><span />
        </div>
        {tasks.length === 0 ? (
          <Empty icon="check" title="No tasks yet" action={<Button size="sm" icon="plus" onClick={onAddTask}>Add Task</Button>} />
        ) : tasks.map((task, i) => (
          <div key={task.id}>
            <div
              className={`grid items-center gap-0 px-4 py-3 hover:bg-zinc-800/40 transition-colors cursor-pointer ${i < tasks.length - 1 ? "border-b border-zinc-800/50" : ""} ${isOverdue(task) ? "bg-red-500/3" : ""}`}
              style={{ gridTemplateColumns: "1fr 140px 120px 100px 100px 36px" }}
              onClick={() => setDetailTask(task)}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <button onClick={(e) => { e.stopPropagation(); toggleComplete(task); }}
                  className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${task.mark_complete ? "bg-emerald-500 border-emerald-500" : "border-zinc-600 hover:border-zinc-400"}`}>
                  {task.mark_complete && <Icon name="checkSimple" size={9} className="text-white" />}
                </button>
                <span className={`text-sm truncate ${task.mark_complete ? "line-through text-zinc-600" : "text-zinc-300"}`}>{task.title}</span>
                {task.subtasks?.length > 0 && (
                  <span className="text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded shrink-0">{task.subtasks.length}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Avatar name={task.assignee_email?.split("@")[0] || "?"} size={20} color="#6366f1" />
                <span className="text-xs text-zinc-500 truncate">{task.assignee_email?.split("@")[0]}</span>
              </div>
              <Badge variant={statusVariant(task.status)}>{task.status}</Badge>
              <Badge variant={priorityVariant(task.priority)}>{task.priority}</Badge>
              <span className={`text-xs ${dueDateStyle(task)}`}>{dueDateLabel(task)}</span>
              <button onClick={(e) => { e.stopPropagation(); setEditTask(task); }} className="text-zinc-700 hover:text-zinc-400 transition-colors" title="Edit task">
                <Icon name="edit" size={13} />
              </button>
            </div>
            {expanded[task.id] && task.subtasks?.map((sub) => (
              <div key={sub.id} className="grid items-center gap-0 px-4 py-2.5 bg-zinc-950/40 border-b border-zinc-800/30" style={{ gridTemplateColumns: "1fr 140px 120px 100px 100px 36px" }}>
                <div className="flex items-center gap-2.5 pl-6 min-w-0">
                  <div className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center ${sub.mark_complete ? "bg-emerald-500 border-emerald-500" : "border-zinc-700"}`}>
                    {sub.mark_complete && <Icon name="checkSimple" size={8} className="text-white" />}
                  </div>
                  <span className={`text-xs truncate ${sub.mark_complete ? "line-through text-zinc-600" : "text-zinc-400"}`}>{sub.title}</span>
                </div>
                <div /><Badge variant={statusVariant(sub.status)}>{sub.status}</Badge>
                <Badge variant={priorityVariant(sub.priority)}>{sub.priority}</Badge>
                <span className="text-xs text-zinc-600">{formatDate(sub.dueDate)}</span><div />
              </div>
            ))}
          </div>
        ))}
      </div>
      {editTask && (
        <TaskModal open={!!editTask} onClose={() => setEditTask(null)} projectId={projectId} task={editTask} members={members} onSaved={() => { setEditTask(null); onTaskUpdated?.(); }} />
      )}
      <TaskDetailModal
        open={!!detailTask}
        task={detailTask}
        projectId={projectId}
        members={members}
        onClose={() => setDetailTask(null)}
        onSaved={() => { setDetailTask(null); onTaskUpdated?.(); }}
        onEdit={(t) => setEditTask(t)}
      />
    </div>
  );
}

// ─── DASHBOARD ANALYTICS + AI PRODUCTIVITY INSIGHT (Feature 4) ──────────────
function DashboardAnalytics({ projectId }) {
  const { user } = useAuth();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  // AI insight state
  const [insight,        setInsight]        = useState("");
  const [insightLoading, setInsightLoading] = useState(false);
  const [insightShown,   setInsightShown]   = useState(false);

  useEffect(() => {
    api.tasks.dashboard(user.id, projectId)
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id, projectId]);

  const handleInsight = async () => {
    setInsightShown(true);
    setInsightLoading(true);
    try {
      const text = await generateProductivityInsight(data);
      setInsight(text);
    } catch (e) {
      setInsight("Could not generate insight: " + e.message);
    } finally {
      setInsightLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (!data)   return <Empty icon="bar" title="No data available" />;

  const { totalTask = 0, completedTask = 0, notcompletedTask = 0, highPriority = 0, mediumPriority = 0, lowPriority = 0, counttaskWithAssignEmails = [], profile = {} } = data;
  const pct = totalTask ? Math.round((completedTask / totalTask) * 100) : 0;

  return (
    <div className="p-6 space-y-4 max-w-4xl">
      {/* Header + AI button */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-200">Dashboard</h2>
        <button
          onClick={handleInsight}
          disabled={insightLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
            bg-gradient-to-br from-violet-600 to-indigo-600 text-white
            hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/30
            disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {insightLoading
            ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Sparkle />
          }
          AI Insight
        </button>
      </div>

      {/* AI insight panel */}
      {insightShown && (
        <AiPanel
          title="Productivity Insight"
          content={insight}
          loading={insightLoading}
          onClose={() => setInsightShown(false)}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { l: "Total",      v: totalTask,       c: "#6366f1" },
          { l: "Completed",  v: completedTask,   c: "#10b981" },
          { l: "Pending",    v: notcompletedTask, c: "#f59e0b" },
          { l: "Completion", v: `${pct}%`,       c: "#ec4899" },
        ].map((s) => (
          <div key={s.l} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-2xl font-bold text-white">{s.v}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{s.l}</p>
            <div className="mt-2 h-0.5 rounded-full bg-zinc-800">
              <div className="h-full rounded-full transition-all" style={{ width: "60%", background: s.c }} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-zinc-400 mb-4 uppercase tracking-widest">By Priority</h3>
          {[{ label:"High",count:highPriority,color:"#ef4444"},{ label:"Medium",count:mediumPriority,color:"#f59e0b"},{ label:"Low",count:lowPriority,color:"#10b981"}].map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-3 mb-3 last:mb-0">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-xs text-zinc-400 w-16">{label}</span>
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${totalTask ? (count/totalTask)*100 : 0}%`, background: color }} />
              </div>
              <span className="text-xs text-zinc-500 w-4 text-right">{count}</span>
            </div>
          ))}
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h3 className="text-xs font-semibold text-zinc-400 mb-4 uppercase tracking-widest">By Assignee</h3>
          {counttaskWithAssignEmails.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-4">No assignee data</p>
          ) : counttaskWithAssignEmails.map((a) => (
            <div key={a.email} className="flex items-center gap-2.5 mb-3 last:mb-0">
              <Avatar name={a.email?.split("@")[0] || "?"} src={profile[a.email]} size={22} color="#6366f1" />
              <span className="text-xs text-zinc-400 flex-1 truncate">{a.email?.split("@")[0]}</span>
              <span className="text-xs text-emerald-400">{a.completeCount}✓</span>
              <span className="text-xs text-zinc-500">{a.incompleteCount} left</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MEMBERS VIEW ─────────────────────────────────────────────────────────────
function MembersView({ members, projectId, currentUserRole, onMemberAdded }) {
  const { user } = useAuth();
  const [showInvite,   setShowInvite]   = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [role,         setRole]         = useState("EDITOR");
  const [inviteLoading,setInviteLoading]= useState(false);
  const colors = ["#6366f1","#f59e0b","#10b981","#ec4899","#3b82f6","#8b5cf6"];

  const handleInvite = async () => {
    const emails = inviteEmails.split(",").map((e) => e.trim()).filter(Boolean);
    if (!emails.length) return;
    setInviteLoading(true);
    try {
      await api.projects.inviteMember(user.id, projectId, { inviteEmail: emails, role });
      showToast(`${emails.length} member(s) added`);
      setShowInvite(false);
      setInviteEmails("");
      onMemberAdded?.();
    } catch (e) { showToast(e.message, "error"); }
    finally { setInviteLoading(false); }
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Team Members</h2>
          <p className="text-xs text-zinc-500 mt-0.5">{members.length} members</p>
        </div>
        {(currentUserRole === "OWNER" || currentUserRole === "ADMIN") && (
          <Button size="sm" icon="plus" onClick={() => setShowInvite(true)}>Invite</Button>
        )}
      </div>
      {showInvite && (
        <div className="mb-5 p-4 bg-zinc-900 border border-zinc-700 rounded-xl space-y-3">
          <p className="text-xs font-semibold text-zinc-300">Invite members</p>
          <Input value={inviteEmails} onChange={(e) => setInviteEmails(e.target.value)} placeholder="email1@co.com, email2@co.com" />
          <div className="flex gap-2">
            <Select value={role} onChange={(e) => setRole(e.target.value)} className="flex-1">
              {["EDITOR","VIEWER","COMMENTER","ADMIN"].map((r) => <option key={r}>{r}</option>)}
            </Select>
            <Button loading={inviteLoading} onClick={handleInvite}>Send</Button>
            <Button variant="secondary" onClick={() => setShowInvite(false)}>Cancel</Button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {members.map((m, i) => (
          <div key={m.id} className="flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors">
            <Avatar name={m.fullname || m.emailuser} src={m.profile} size={36} color={colors[i % colors.length]} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-200">{m.fullname || "—"}</p>
              <p className="text-xs text-zinc-500">{m.emailuser}</p>
            </div>
            <Badge variant={m.role?.toLowerCase()}>{m.role}</Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CHAT VIEW + AI SUMMARY + AI TASK EXTRACTOR (Features 2 & 3) ─────────────
function ChatView({ projectId, members, onTaskCreated }) {
  const { user }  = useAuth();
  const socket    = useSocket();
  const [messages,      setMessages]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [input,         setInput]         = useState("");
  const [typing,        setTyping]        = useState([]);
  const bottomRef   = useRef(null);
  const typingTimer = useRef(null);
  const inputRef    = useRef(null);

  // ── @mention state ────────────────────────────────────────────────────────
  const [mentionQuery,       setMentionQuery]       = useState(null); // null = closed, string = current query
  const [mentionSuggestions, setMentionSuggestions] = useState([]);
  const [mentionIndex,       setMentionIndex]       = useState(0);

  // ── AI: Chat Summary ──────────────────────────────────────────────────────
  const [summary,        setSummary]        = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryShown,   setSummaryShown]   = useState(false);

  // ── AI: Task Extractor panel ──────────────────────────────────────────────
  const [showExtractor,  setShowExtractor]  = useState(false);
  const [extractInput,   setExtractInput]   = useState("");
  const [extracted,      setExtracted]      = useState([]);
  const [extractLoading, setExtractLoading] = useState(false);
  const [creating,       setCreating]       = useState(false);

  useEffect(() => {
    api.chat.getHistory(projectId)
      .then((d) => setMessages(d.messages || []))
      .catch(console.error)
      .finally(() => setLoading(false));
    socket?.joinProject(projectId);
    return () => socket?.leaveProject(projectId);
  }, [projectId]);

  useEffect(() => {
    const off1 = socket?.on("receive_message", (msg) => {
      setMessages((prev) => {
        const hasOpt = prev.some((m) => m._optimistic && m.senderId === msg.senderId && m.content === msg.message);
        if (hasOpt) return prev.map((m) => m._optimistic && m.senderId === msg.senderId && m.content === msg.message ? { ...msg, content: msg.message || msg.content } : m);
        return [...prev, { ...msg, content: msg.message || msg.content }];
      });
    });
    const off2 = socket?.on("user_typing",         ({ userId, fullname }) => { if (userId !== user?.id) setTyping((p) => [...new Set([...p, fullname])]); });
    const off3 = socket?.on("user_stopped_typing", ({ userId })           => { if (userId !== user?.id) setTyping((p) => p.filter((_, i) => i > 0)); });
    return () => { off1?.(); off2?.(); off3?.(); };
  }, [socket, user?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleInput = (v) => {
    setInput(v);
    socket?.typingStart(projectId);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket?.typingStop(projectId), 1500);

    // @mention detection — find last @ in value
    const cursor   = inputRef.current?.selectionStart ?? v.length;
    const textSoFar = v.slice(0, cursor);
    const atMatch  = textSoFar.match(/@(\w*)$/);
    if (atMatch) {
      const q = atMatch[1].toLowerCase();
      setMentionQuery(q);
      setMentionIndex(0);
      const filtered = members.filter((m) => {
        const name  = (m.fullname || "").toLowerCase();
        const email = (m.emailuser || "").toLowerCase();
        return name.includes(q) || email.split("@")[0].includes(q);
      }).slice(0, 5);
      setMentionSuggestions(filtered);
    } else {
      setMentionQuery(null);
      setMentionSuggestions([]);
    }
  };

  const insertMention = (member) => {
    const name      = member.fullname || member.emailuser.split("@")[0];
    const cursor    = inputRef.current?.selectionStart ?? input.length;
    const textSoFar = input.slice(0, cursor);
    const before    = textSoFar.replace(/@\w*$/, `@${name} `);
    const after     = input.slice(cursor);
    setInput(before + after);
    setMentionQuery(null);
    setMentionSuggestions([]);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e) => {
    if (mentionSuggestions.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setMentionIndex((i) => (i + 1) % mentionSuggestions.length); return; }
      if (e.key === "ArrowUp")   { e.preventDefault(); setMentionIndex((i) => (i - 1 + mentionSuggestions.length) % mentionSuggestions.length); return; }
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); insertMention(mentionSuggestions[mentionIndex]); return; }
      if (e.key === "Escape")    { setMentionQuery(null); setMentionSuggestions([]); return; }
    }
    if (e.key === "Enter" && !e.shiftKey) send();
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const optimistic = {
      id: `temp-${Date.now()}`, projectId, content: text,
      senderId: user?.id, sender_id: user?.id,
      sender: { fullname: user?.fullname, profile: user?.profile },
      senderName: user?.fullname, createdAt: new Date().toISOString(), _optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    socket?.typingStop(projectId);
    socket?.sendMessage(projectId, text);
  };

  // Feature 2: Summarize conversation
  const handleSummarize = async () => {
    if (!messages.length) { showToast("No messages to summarize", "warning"); return; }
    setSummaryShown(true);
    setSummaryLoading(true);
    try {
      const text = await summarizeChat(messages);
      setSummary(text);
    } catch (e) {
      setSummary("Could not generate summary: " + e.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  // Feature 3: Extract tasks from free text
  const handleExtract = async () => {
    if (!extractInput.trim()) { showToast("Enter some text first", "warning"); return; }
    setExtractLoading(true);
    setExtracted([]);
    try {
      const tasks = await extractTasksFromText(extractInput.trim());
      setExtracted(tasks);
      if (!tasks.length) showToast("No tasks found in that text", "warning");
    } catch (e) {
      showToast(e.message || "AI extraction failed", "error");
    } finally {
      setExtractLoading(false);
    }
  };

  const handleCreateExtracted = async () => {
    if (!extracted.length || !members.length) return;
    setCreating(true);
    try {
      const defaultAssignee = members[0]?.emailuser || "";
      const taskPayloads = extracted.map((t) => ({
        title:       t.title,
        description: "",
        status:      "Todo",
        priority:    t.priority || "Medium",
        assigneEmail: defaultAssignee,
        startDate:   new Date().toISOString(),
        dueDate:     new Date(Date.now() + 7 * 86400000).toISOString(),
      }));
      await api.tasks.add(user.id, projectId, taskPayloads);
      showToast(`${extracted.length} task(s) created!`);
      setShowExtractor(false);
      setExtractInput("");
      setExtracted([]);
      onTaskCreated?.();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      {/* Header with AI buttons */}
      <div className="px-6 py-3 border-b border-zinc-800 shrink-0 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Team Chat</h2>
          <p className="text-xs text-zinc-500">Real-time project conversation</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Feature 3: AI Task Extractor toggle */}
          <button
            onClick={() => { setShowExtractor((v) => !v); setSummaryShown(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-700 text-zinc-400 hover:border-violet-500/50 hover:text-violet-300 transition-all"
          >
            <Sparkle size={11} /> Tasks from text
          </button>
          {/* Feature 2: Summarize chat */}
          <button
            onClick={() => { handleSummarize(); setShowExtractor(false); }}
            disabled={summaryLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold
              bg-gradient-to-br from-violet-600 to-indigo-600 text-white
              hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/30
              disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            {summaryLoading
              ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Sparkle size={11} />
            }
            Summarize
          </button>
        </div>
      </div>

      {/* Feature 3: Task extractor panel */}
      {showExtractor && (
        <div className="mx-4 mt-3 rounded-xl border border-violet-500/25 bg-gradient-to-br from-violet-950/50 to-indigo-950/50 overflow-hidden shrink-0">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-violet-500/20">
            <Sparkle size={11} />
            <span className="text-xs font-semibold text-violet-300">AI Task Creator</span>
            <span className="text-xs text-zinc-600 ml-1">— describe work in plain English</span>
            <button onClick={() => setShowExtractor(false)} className="ml-auto text-zinc-600 hover:text-zinc-400">
              <Icon name="x" size={12} />
            </button>
          </div>
          <div className="p-3 space-y-3">
            <textarea
              value={extractInput}
              onChange={(e) => setExtractInput(e.target.value)}
              placeholder="e.g. We need to redesign the dashboard and fix the analytics graph bug"
              rows={2}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors resize-none"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleExtract}
                disabled={extractLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {extractLoading
                  ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <Sparkle size={10} />
                }
                Extract Tasks
              </button>
              {extracted.length > 0 && (
                <button
                  onClick={handleCreateExtracted}
                  disabled={creating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-60 transition-colors"
                >
                  {creating
                    ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Icon name="plus" size={11} />
                  }
                  Create {extracted.length} Task{extracted.length !== 1 ? "s" : ""}
                </button>
              )}
            </div>
            {extracted.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {extracted.map((t, i) => (
                  <div key={i} className="flex items-center gap-2.5 py-1">
                    <span className="text-violet-500">•</span>
                    <span className="text-xs text-zinc-300 flex-1">{t.title}</span>
                    <Badge variant={priorityVariant(t.priority)}>{t.priority}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Feature 2: Chat summary panel */}
      {summaryShown && (
        <div className="mx-4 mt-3 shrink-0">
          <AiPanel
            title="Meeting / Chat Summary"
            content={summary}
            loading={summaryLoading}
            onClose={() => setSummaryShown(false)}
          />
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {loading ? (
          <div className="flex justify-center pt-8"><Spinner /></div>
        ) : messages.length === 0 ? (
          <Empty icon="message" title="No messages yet" desc="Start the conversation!" />
        ) : messages.map((msg) => {
          const isMe       = msg.senderId === user?.id || msg.sender_id === user?.id;
          const senderName = msg.sender?.fullname || msg.senderName || "?";
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              <Avatar name={senderName} src={msg.sender?.profile} size={28} color={isMe ? "#6366f1" : "#f59e0b"} />
              <div className={`max-w-xs flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && <span className="text-xs font-medium text-zinc-500 px-1">{senderName}</span>}
                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-indigo-600 text-white rounded-br-sm" : "bg-zinc-800 text-zinc-200 rounded-bl-sm"}`}>
                  {(msg.content || msg.message || "").split(/(@\w+)/g).map((part, pi) =>
                    part.startsWith("@")
                      ? <span key={pi} className={`font-semibold ${isMe ? "text-indigo-200 bg-white/10" : "text-violet-300 bg-violet-500/15"} px-1 rounded`}>{part}</span>
                      : part
                  )}
                </div>
                <span className="text-xs text-zinc-700 px-1">{timeAgo(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
        {typing.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1 px-3 py-2 bg-zinc-800 rounded-2xl rounded-bl-sm">
              {[0,150,300].map((d) => <span key={d} className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
            </div>
            <span className="text-xs text-zinc-600">{typing.join(", ")} typing…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input with @mention autocomplete */}
      <div className="px-6 py-4 border-t border-zinc-800 shrink-0">
        {/* Mention dropdown */}
        {mentionQuery !== null && mentionSuggestions.length > 0 && (
          <div className="mb-2 bg-zinc-900 border border-zinc-700 rounded-xl overflow-hidden shadow-2xl">
            {mentionSuggestions.map((m, i) => (
              <button
                key={m.emailuser}
                onClick={() => insertMention(m)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors ${i === mentionIndex ? "bg-indigo-600/20 border-l-2 border-indigo-500" : "hover:bg-zinc-800"}`}
              >
                <Avatar name={m.fullname || m.emailuser} size={24} color="#6366f1" />
                <div>
                  <p className="text-xs font-medium text-zinc-200">{m.fullname || m.emailuser.split("@")[0]}</p>
                  <p className="text-xs text-zinc-600">{m.emailuser}</p>
                </div>
              </button>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message the team… type @ to mention someone"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 transition-colors"
            />
          </div>
          <button onClick={send} className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors">
            <Icon name="send" size={16} />
          </button>
        </div>
        <p className="text-xs text-zinc-700 mt-1.5 pl-1">Type @ to mention a team member</p>
      </div>
    </div>
  );
}

// ─── FILES VIEW ───────────────────────────────────────────────────────────────
function FilesView({ projectId, tasks }) {
  const { user } = useAuth();
  const [files,      setFiles]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [uploading,  setUploading]  = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [taskId,     setTaskId]     = useState("");
  const fileRef = useRef(null);

  const load = useCallback(() => {
    api.files.getByProject(projectId)
      .then((d) => setFiles(d.files || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !taskId) { showToast("Select a task first", "warning"); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      await api.files.upload(user.id, projectId, taskId, fd);
      showToast("File uploaded");
      setShowUpload(false);
      load();
    } catch (err) { showToast(err.message, "error"); }
    finally { setUploading(false); }
  };

  const deleteFile = async (fileId) => {
    if (!confirm("Delete this file?")) return;
    try {
      await api.files.delete(fileId, user.id);
      showToast("File deleted");
      load();
    } catch (err) { showToast(err.message, "error"); }
  };

  const extColor = (t) => t?.includes("pdf") ? "#ef4444" : t?.includes("image") ? "#6366f1" : "#f59e0b";
  const ext      = (name) => (name || "").split(".").pop()?.toUpperCase().slice(0, 4) || "FILE";
  const fmtSize  = (b) => b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : b ? `${(b / 1e3).toFixed(0)} KB` : "";

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-zinc-200">Files</h2>
        <Button size="sm" icon="upload" onClick={() => setShowUpload(true)}>Upload</Button>
      </div>
      {showUpload && (
        <div className="mb-5 p-4 bg-zinc-900 border border-zinc-700 rounded-xl space-y-3">
          <Select label="Attach to task" value={taskId} onChange={(e) => setTaskId(e.target.value)}>
            <option value="">Select task...</option>
            {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
          </Select>
          <div>
            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
            <Button loading={uploading} onClick={() => fileRef.current?.click()}>Choose File</Button>
            <Button variant="secondary" className="ml-2" onClick={() => setShowUpload(false)}>Cancel</Button>
          </div>
        </div>
      )}
      {loading ? <div className="flex justify-center py-16"><Spinner /></div>
        : files.length === 0 ? (
          <Empty icon="paperclip" title="No files yet" action={<Button size="sm" icon="upload" onClick={() => setShowUpload(true)}>Upload</Button>} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((f) => (
              <div key={f.id} className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-colors group">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-bold shrink-0" style={{ background: extColor(f.fileType) + "22", border: `1px solid ${extColor(f.fileType)}33`, color: extColor(f.fileType) }}>
                    {ext(f.fileName || f.fileUrl)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-200 truncate">{f.fileName || "File"}</p>
                    <p className="text-xs text-zinc-500">{fmtSize(f.fileSize)}</p>
                  </div>
                </div>
                <div className="text-xs text-zinc-600 space-y-1">
                  <p>Task: <span className="text-zinc-500">{f.taskName || "—"}</span></p>
                  <p>By: <span className="text-zinc-500">{f.uploaderName || "—"}</span></p>
                  <p>{formatDate(f.uploadedAt)}</p>
                </div>
                <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-800 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a href={f.fileUrl} target="_blank" rel="noreferrer" className="flex-1 text-xs text-zinc-400 hover:text-white transition-colors py-1 hover:bg-zinc-800 rounded-md text-center">Download</a>
                  <button onClick={() => deleteFile(f.id)} className="text-xs text-red-500 hover:text-red-400 transition-colors py-1 px-2 hover:bg-zinc-800 rounded-md">
                    <Icon name="trash" size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}

// ─── ACTIVITY VIEW + AI STANDUP REPORT (Feature 5) ───────────────────────────
function ActivityView({ projectId }) {
  const [logs,   setLogs]   = useState([]);
  const [loading,setLoading]= useState(true);
  const colors = ["#6366f1","#f59e0b","#10b981","#ec4899","#3b82f6","#8b5cf6"];

  // AI standup state
  const [standup,        setStandup]        = useState("");
  const [standupLoading, setStandupLoading] = useState(false);
  const [standupShown,   setStandupShown]   = useState(false);

  useEffect(() => {
    api.activity.getByProject(projectId)
      .then((d) => setLogs(d.logs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [projectId]);

  const handleStandup = async () => {
    if (!logs.length) { showToast("No activity logs yet", "warning"); return; }
    setStandupShown(true);
    setStandupLoading(true);
    try {
      const text = await generateStandupReport(logs);
      setStandup(text);
    } catch (e) {
      setStandup("Could not generate standup: " + e.message);
    } finally {
      setStandupLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="p-6 max-w-2xl">
      {/* Header + AI button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-zinc-200">Activity Log</h2>
        <button
          onClick={handleStandup}
          disabled={standupLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
            bg-gradient-to-br from-violet-600 to-indigo-600 text-white
            hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/30
            disabled:opacity-60 disabled:cursor-not-allowed transition-all"
        >
          {standupLoading
            ? <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Sparkle />
          }
          Generate Standup
        </button>
      </div>

      {/* AI standup panel */}
      {standupShown && (
        <div className="mb-4">
          <AiPanel
            title="Daily Standup Report"
            content={standup}
            loading={standupLoading}
            onClose={() => setStandupShown(false)}
          />
        </div>
      )}

      {/* Activity log */}
      {logs.length === 0 ? <Empty icon="activity" title="No activity yet" /> : (
        <div className="space-y-3">
          {logs.map((a, i) => (
            <div key={a.id} className="flex items-start gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
              <Avatar name={a.user?.fullname || "?"} size={28} color={colors[i % colors.length]} />
              <div className="flex-1">
                <p className="text-xs text-zinc-300">
                  <span className="font-medium text-zinc-200">{a.user?.fullname}</span>{" "}
                  {actionLabel(a.action, a.meta)}
                </p>
                <p className="text-xs text-zinc-600 mt-0.5">{timeAgo(a.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── GANTT VIEW ───────────────────────────────────────────────────────────────
function GanttView({ tasks, members, projectId, onTaskUpdated }) {
  const { user } = useAuth();
  const [editTask,    setEditTask]    = useState(null);
  const [detailTask,  setDetailTask]  = useState(null);
  const [hoveredTask, setHoveredTask] = useState(null);
  const [viewMode,    setViewMode]    = useState("month"); // "month" | "week"

  // Only tasks with both dates
  const validTasks = tasks.filter((t) => t.startDate && t.dueDate);

  // ── Compute calendar window ───────────────────────────────────────────────
  const allDates  = validTasks.flatMap((t) => [new Date(t.startDate), new Date(t.dueDate)]);
  const minDate   = allDates.length ? new Date(Math.min(...allDates)) : new Date();
  const maxDate   = allDates.length ? new Date(Math.max(...allDates)) : new Date(Date.now() + 30 * 86400000);

  // Expand window by 3 days on each side for breathing room
  const windowStart = new Date(minDate); windowStart.setDate(windowStart.getDate() - 3);
  const windowEnd   = new Date(maxDate); windowEnd.setDate(windowEnd.getDate() + 3);
  const totalDays   = Math.max(1, Math.ceil((windowEnd - windowStart) / 86400000));

  // ── Generate column headers (days) ───────────────────────────────────────
  const DAY_PX    = viewMode === "week" ? 40 : 28;
  const LABEL_W   = 220;
  const totalW    = totalDays * DAY_PX;
  const today     = dayStart(new Date());

  const days = Array.from({ length: totalDays }, (_, i) => {
    const d = new Date(windowStart); d.setDate(d.getDate() + i);
    return d;
  });

  // ── Bar position helpers ──────────────────────────────────────────────────
  const taskLeft  = (t) => Math.max(0, Math.floor((dayStart(t.startDate) - dayStart(windowStart)) / 86400000)) * DAY_PX;
  const taskWidth = (t) => {
    const s = dayStart(t.startDate);
    const e = dayStart(t.dueDate);
    return Math.max(DAY_PX, Math.ceil((e - s) / 86400000 + 1) * DAY_PX);
  };

  // ── Today marker position ─────────────────────────────────────────────────
  const todayLeft = Math.floor((today - dayStart(windowStart)) / 86400000) * DAY_PX;

  // ── Group tasks by status for color ──────────────────────────────────────
  const barColor = (task) => {
    if (task.mark_complete)          return { bg: "#10b981", border: "#059669" };
    if (isOverdue(task))             return { bg: "#ef4444", border: "#dc2626" };
    if (isDueSoon(task))             return { bg: "#f59e0b", border: "#d97706" };
    if (task.status === "In Review") return { bg: "#8b5cf6", border: "#7c3aed" };
    if (task.status === "In Progress") return { bg: "#3b82f6", border: "#2563eb" };
    return { bg: "#6366f1", border: "#4f46e5" };
  };

  const assigneeInitial = (t) => (t.assignee_email || "?")[0].toUpperCase();

  // ── Month groupings for header ────────────────────────────────────────────
  const monthGroups = [];
  let currentMonth  = null;
  days.forEach((d, i) => {
    const mLabel = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    if (mLabel !== currentMonth) {
      monthGroups.push({ label: mLabel, startIdx: i, count: 1 });
      currentMonth = mLabel;
    } else {
      monthGroups[monthGroups.length - 1].count++;
    }
  });

  if (!validTasks.length) {
    return (
      <div className="p-6 flex flex-col items-center justify-center py-20">
        <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        </div>
        <p className="text-sm text-zinc-400 font-medium mb-1">No tasks with dates yet</p>
        <p className="text-xs text-zinc-600">Add start and due dates to tasks to see them on the Gantt chart</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-zinc-200">Timeline</h2>
          <span className="text-xs text-zinc-600">{validTasks.length} tasks</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-zinc-600">
            {[
              { color: "#6366f1", label: "Todo"        },
              { color: "#3b82f6", label: "In Progress" },
              { color: "#8b5cf6", label: "In Review"   },
              { color: "#10b981", label: "Done"        },
              { color: "#ef4444", label: "Overdue"     },
              { color: "#f59e0b", label: "Due soon"    },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm" style={{ background: l.color }} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>
          {/* View toggle */}
          <div className="flex items-center bg-zinc-800 rounded-lg p-0.5">
            {["week", "month"].map((m) => (
              <button key={m} onClick={() => setViewMode(m)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors capitalize ${viewMode === m ? "bg-zinc-700 text-zinc-200" : "text-zinc-500 hover:text-zinc-300"}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gantt grid */}
      <div className="flex-1 overflow-auto">
        <div style={{ minWidth: LABEL_W + totalW + 32 }}>

          {/* Header row */}
          <div className="flex sticky top-0 z-10 bg-zinc-950 border-b border-zinc-800">
            {/* Task label column header */}
            <div className="shrink-0 border-r border-zinc-800 px-4 py-2 flex items-center" style={{ width: LABEL_W }}>
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Task</span>
            </div>
            {/* Day columns header */}
            <div className="relative" style={{ width: totalW }}>
              {/* Month labels */}
              <div className="flex border-b border-zinc-800/60 h-5">
                {monthGroups.map((mg, i) => (
                  <div key={i} style={{ width: mg.count * DAY_PX, minWidth: 0 }}
                    className="border-r border-zinc-800/40 px-1.5 overflow-hidden">
                    <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">{mg.label}</span>
                  </div>
                ))}
              </div>
              {/* Day numbers */}
              <div className="flex h-6">
                {days.map((d, i) => {
                  const isToday   = d.getTime() === today.getTime();
                  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                  return (
                    <div key={i} style={{ width: DAY_PX, minWidth: DAY_PX }}
                      className={`border-r border-zinc-800/30 flex items-center justify-center text-xs
                        ${isToday ? "text-indigo-400 font-bold" : isWeekend ? "text-zinc-700" : "text-zinc-600"}`}>
                      {d.getDate()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Task rows */}
          {validTasks.map((task, rowIdx) => {
            const { bg, border } = barColor(task);
            const left  = taskLeft(task);
            const width = taskWidth(task);
            const completedPct = task.mark_complete ? 100 : 0;

            return (
              <div key={task.id}
                className={`flex border-b border-zinc-800/40 hover:bg-zinc-900/40 transition-colors group ${rowIdx % 2 === 0 ? "" : "bg-zinc-900/20"}`}
                style={{ height: 44 }}>

                {/* Label */}
                <div className="shrink-0 border-r border-zinc-800/60 px-3 flex items-center gap-2"
                  style={{ width: LABEL_W }}>
                  <div className="w-2 h-2 rounded-sm shrink-0" style={{ background: bg }} />
                  <span
                    onClick={() => setDetailTask(task)}
                    className={`text-xs truncate cursor-pointer hover:text-white transition-colors ${task.mark_complete ? "line-through text-zinc-600" : "text-zinc-300"}`}
                    title={task.title}>
                    {task.title}
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); setEditTask(task); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-700 hover:text-zinc-400 shrink-0 ml-auto">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>

                {/* Bar area */}
                <div className="relative flex-1" style={{ width: totalW }}>
                  {/* Weekend / today shading */}
                  {days.map((d, i) => {
                    const isToday   = d.getTime() === today.getTime();
                    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                    if (!isToday && !isWeekend) return null;
                    return (
                      <div key={i}
                        className={`absolute top-0 bottom-0 ${isToday ? "bg-indigo-500/6" : "bg-zinc-800/30"}`}
                        style={{ left: i * DAY_PX, width: DAY_PX }}
                      />
                    );
                  })}

                  {/* Today line */}
                  {todayLeft >= 0 && todayLeft <= totalW && (
                    <div className="absolute top-0 bottom-0 w-px bg-indigo-500/50 z-10"
                      style={{ left: todayLeft + DAY_PX / 2 }} />
                  )}

                  {/* Task bar */}
                  <div
                    onClick={() => setDetailTask(task)}
                    onMouseEnter={() => setHoveredTask(task.id)}
                    onMouseLeave={() => setHoveredTask(null)}
                    className="absolute top-1/2 -translate-y-1/2 rounded-md cursor-pointer transition-all hover:brightness-110 select-none"
                    style={{
                      left:    left,
                      width:   width,
                      height:  24,
                      background: bg,
                      border:  `1px solid ${border}`,
                      boxShadow: hoveredTask === task.id ? `0 0 0 2px ${bg}44` : "none",
                    }}
                  >
                    {/* Progress fill */}
                    {completedPct > 0 && (
                      <div className="absolute inset-0 rounded-md bg-black/20" style={{ width: `${completedPct}%` }} />
                    )}
                    {/* Label inside bar if wide enough */}
                    {width > 60 && (
                      <div className="absolute inset-0 flex items-center px-2 gap-1.5 overflow-hidden">
                        <span className="text-white/90 font-semibold text-xs"
                          style={{ fontSize: 10 }}>{assigneeInitial(task)}</span>
                        <span className="text-white/80 text-xs truncate" style={{ fontSize: 11 }}>{task.title}</span>
                      </div>
                    )}
                  </div>

                  {/* Tooltip */}
                  {hoveredTask === task.id && (
                    <div className="absolute z-30 pointer-events-none"
                      style={{ left: Math.min(left + width / 2, totalW - 160), top: "calc(50% + 16px)" }}>
                      <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 shadow-2xl w-48">
                        <p className="text-xs font-semibold text-zinc-200 mb-1 truncate">{task.title}</p>
                        <p className="text-xs text-zinc-500">{formatDate(task.startDate)} → {formatDate(task.dueDate)}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div className="w-1.5 h-1.5 rounded-sm" style={{ background: bg }} />
                          <span className="text-xs text-zinc-500">{task.status} · {task.priority}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {editTask && (
        <TaskModal open={!!editTask} onClose={() => setEditTask(null)} projectId={projectId} task={editTask}
          members={members} onSaved={() => { setEditTask(null); onTaskUpdated?.(); }} />
      )}
      <TaskDetailModal open={!!detailTask} task={detailTask} projectId={projectId} members={members}
        onClose={() => setDetailTask(null)}
        onSaved={() => { setDetailTask(null); onTaskUpdated?.(); }}
        onEdit={(t) => setEditTask(t)} />
    </div>
  );
}

// ─── MEETING NOTES → TASKS ────────────────────────────────────────────────────
function MeetingNotesView({ projectId, members, onTaskCreated }) {
  const { user } = useAuth();
  const [notes,         setNotes]         = useState("");
  const [extracting,    setExtracting]    = useState(false);
  const [extracted,     setExtracted]     = useState([]);
  const [creating,      setCreating]      = useState(false);
  const [created,       setCreated]       = useState(false);

  const handleExtract = async () => {
    if (!notes.trim()) { showToast("Paste your meeting notes first", "warning"); return; }
    setExtracting(true); setExtracted([]); setCreated(false);
    try {
      const tasks = await extractTasksFromMeetingNotes(notes.trim());
      if (!tasks.length) { showToast("No actionable tasks found — try adding more detail", "warning"); return; }
      setExtracted(tasks.map((t) => {
        const hint    = (t.assigneeHint || "").toLowerCase();
        const matched = hint ? members.find((m) => (m.fullname || m.emailuser || "").toLowerCase().includes(hint)) : null;
        return { ...t, assigneEmail: matched?.emailuser || user.email, _editing: false };
      }));
      showToast(`Found ${tasks.length} actionable tasks`, "success");
    } catch (e) { showToast(e.message, "error"); }
    finally { setExtracting(false); }
  };

  const updateTask  = (i, patch) => setExtracted((p) => p.map((t, idx) => idx === i ? { ...t, ...patch } : t));
  const removeTask  = (i)        => setExtracted((p) => p.filter((_, idx) => idx !== i));

  const handleCreateAll = async () => {
    if (!extracted.length) return;
    setCreating(true);
    try {
      const today   = new Date();
      const dueDate = new Date(today); dueDate.setDate(dueDate.getDate() + 7);
      await api.tasks.add(user.id, projectId, extracted.map((t) => ({
        title:        t.title,
        description:  t.notes || "",
        priority:     t.priority || "Medium",
        status:       "Todo",
        assigneEmail: t.assigneEmail || user.email,
        startDate:    today.toISOString(),
        dueDate:      dueDate.toISOString(),
      })));
      showToast(`Created ${extracted.length} tasks from meeting notes`, "success");
      setCreated(true); setExtracted([]); setNotes("");
      onTaskCreated?.();
    } catch (e) { showToast(e.message, "error"); }
    finally { setCreating(false); }
  };

  const pColors = { High: "text-red-400 bg-red-500/10 border-red-500/20", Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20", Low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-200">Meeting Notes → Tasks</h2>
          <p className="text-xs text-zinc-500">Paste any meeting notes — AI extracts actionable tasks, priorities, and assignees</p>
        </div>
      </div>

      {/* Paste area */}
      <div className="relative mb-3">
        <textarea
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setCreated(false); }}
          placeholder={"Paste your meeting notes here…\n\nExample:\n— Discussed Q3 roadmap\n— John will redesign the onboarding flow by Friday\n— Need to fix the payment bug before launch\n— Sarah to write API documentation\n— Schedule user testing session next week"}
          rows={10}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-zinc-300 placeholder-zinc-600/60 focus:outline-none focus:border-violet-500/50 resize-none transition-all font-mono leading-relaxed"
        />
        {notes && (
          <button onClick={() => { setNotes(""); setExtracted([]); setCreated(false); }}
            className="absolute top-3 right-3 p-1 rounded-md text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800 transition-colors">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        )}
      </div>

      {/* Extract button */}
      <button onClick={handleExtract} disabled={extracting || !notes.trim()}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
          bg-gradient-to-br from-violet-600 to-indigo-600 text-white
          hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-900/30
          disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-6">
        {extracting
          ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Extracting tasks…</>
          : <><Sparkle size={13} /> Extract Tasks with AI</>}
      </button>

      {/* Success banner */}
      {created && (
        <div className="flex items-center gap-2.5 p-3.5 mb-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <span className="text-sm text-emerald-400 font-medium">Tasks created and added to the board!</span>
        </div>
      )}

      {/* Extracted task list */}
      {extracted.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-zinc-300">Extracted Tasks</span>
              <span className="text-xs bg-violet-500/15 text-violet-400 border border-violet-500/25 px-1.5 py-0.5 rounded-md font-medium">{extracted.length}</span>
            </div>
            <span className="text-xs text-zinc-600">Click title to edit · drag to reorder</span>
          </div>
          <div className="space-y-2 mb-4">
            {extracted.map((task, i) => (
              <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 group hover:border-zinc-700 transition-colors">
                <div className="flex items-start gap-3">
                  <span className={`mt-0.5 shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded border ${pColors[task.priority] || pColors.Medium}`}>
                    {task.priority}
                  </span>
                  <div className="flex-1 min-w-0">
                    {task._editing ? (
                      <input autoFocus value={task.title}
                        onChange={(e) => updateTask(i, { title: e.target.value })}
                        onBlur={() => updateTask(i, { _editing: false })}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") updateTask(i, { _editing: false }); }}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-2.5 py-1 text-sm text-zinc-200 focus:outline-none focus:border-violet-500/50 mb-1.5"
                      />
                    ) : (
                      <p onClick={() => updateTask(i, { _editing: true })}
                        className="text-sm text-zinc-200 font-medium cursor-text hover:text-white mb-1.5 leading-snug" title="Click to edit">
                        {task.title}
                      </p>
                    )}
                    {task.notes && <p className="text-xs text-zinc-500 leading-relaxed mb-2">{task.notes}</p>}
                    <div className="flex items-center gap-2 flex-wrap">
                      <select value={task.priority} onChange={(e) => updateTask(i, { priority: e.target.value })}
                        className="bg-zinc-800 border border-zinc-700 rounded-md px-1.5 py-0.5 text-xs text-zinc-400 focus:outline-none">
                        {["High","Medium","Low"].map((p) => <option key={p}>{p}</option>)}
                      </select>
                      <select value={task.assigneEmail} onChange={(e) => updateTask(i, { assigneEmail: e.target.value })}
                        className="bg-zinc-800 border border-zinc-700 rounded-md px-1.5 py-0.5 text-xs text-zinc-400 focus:outline-none max-w-[160px]">
                        {members.map((m) => (
                          <option key={m.emailuser} value={m.emailuser}>{m.fullname || m.emailuser.split("@")[0]}</option>
                        ))}
                      </select>
                      {task.assigneeHint && (
                        <span className="text-xs text-violet-400/60 italic">AI: {task.assigneeHint}</span>
                      )}
                    </div>
                  </div>
                  <button onClick={() => removeTask(i)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-700 hover:text-red-400 shrink-0 mt-0.5">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button onClick={handleCreateAll} disabled={creating}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold
              bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30
              disabled:opacity-60 disabled:cursor-not-allowed transition-all">
            {creating
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating…</>
              : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                  Create {extracted.length} Task{extracted.length !== 1 ? "s" : ""} in Project</>}
          </button>
        </div>
      )}

      {/* Empty state */}
      {!extracted.length && !extracting && !created && (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-zinc-800 rounded-xl">
          <div className="w-12 h-12 rounded-2xl bg-zinc-800/60 flex items-center justify-center mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
          <p className="text-sm text-zinc-500 font-medium mb-1">Paste your meeting notes above</p>
          <p className="text-xs text-zinc-700">AI will identify tasks, priorities, and who to assign them to</p>
        </div>
      )}
    </div>
  );
}

// ─── SMART DIGEST MODAL ───────────────────────────────────────────────────────
function SmartDigestButton({ projects, tasks, projectId }) {
  const { user }    = useAuth();
  const [open,      setOpen]      = useState(false);
  const [digest,    setDigest]    = useState("");
  const [loading,   setLoading]   = useState(false);
  const [generated, setGenerated] = useState(false);
  const [sending,   setSending]   = useState(false);
  const [sentDone,  setSentDone]  = useState(false);

  const generate = async () => {
    setLoading(true); setDigest(""); setSentDone(false);
    try {
      let recentLogs = [];
      try { const d = await api.activity.getByUser(user.id); recentLogs = d.logs || []; } catch (_) {}
      const projectData = (projects || []).map((p) => ({
        projectName:   p.projectName,
        totalTask:     (tasks || []).length,
        completedTask: (tasks || []).filter((t) => t.mark_complete).length,
        tasks:         tasks || [],
      }));
      const text = await generateSmartDigest({ user, projects: projectData, recentLogs });
      setDigest(text); setGenerated(true);
    } catch (e) { setDigest("Could not generate digest: " + e.message); }
    finally { setLoading(false); }
  };

  const handleSendToAll = async () => {
    if (!digest || !projectId) return;
    setSending(true); setSentDone(false);
    try {
      const projectName = projects?.[0]?.projectName || "";
      const res = await api.projects.sendDigest(user.id, projectId, digest, projectName);
      showToast(res.message || "Digest sent to all members!", "success");
      setSentDone(true);
    } catch (e) { showToast(e.message || "Failed to send digest", "error"); }
    finally { setSending(false); }
  };

  const handleOpen = () => { setOpen(true); if (!generated) generate(); };

  const renderDigest = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-1.5" />;
      const emoji = ["🌅","📌","✅","🎯"];
      if (emoji.some((e) => line.startsWith(e))) {
        const icon = line[0]; const rest = line.slice(1).trim();
        return (
          <div key={i} className="flex items-center gap-2 mt-5 first:mt-0 mb-2">
            <span className="text-lg leading-none">{icon}</span>
            <span className="text-xs font-bold text-zinc-100 uppercase tracking-wider">{rest}</span>
          </div>
        );
      }
      if (line.trimStart().startsWith("•") || line.trimStart().startsWith("-")) {
        return (
          <div key={i} className="flex items-start gap-2 pl-2 mb-1.5">
            <span className="text-violet-400/70 shrink-0 mt-0.5 text-xs">▸</span>
            <span className="text-xs text-zinc-300 leading-relaxed">{line.replace(/^[\s•\-]+/, "")}</span>
          </div>
        );
      }
      return <p key={i} className="text-xs text-zinc-400 leading-relaxed mb-1">{line}</p>;
    });
  };

  return (
    <>
      <button onClick={handleOpen}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full
          bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-xs font-semibold
          shadow-2xl shadow-violet-900/60 hover:from-violet-500 hover:to-indigo-500
          hover:scale-105 active:scale-95 transition-all border border-white/10"
        title="Smart Digest — your AI daily briefing">
        <Sparkle size={12} /> Smart Digest
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-md max-h-[80vh] flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
                  <Sparkle size={13} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-zinc-200">Smart Digest</h3>
                  <p className="text-xs text-zinc-600">Your personalized AI daily briefing</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="relative">
                    <span className="w-8 h-8 border-2 border-zinc-800 border-t-violet-500 rounded-full animate-spin block" />
                    <Sparkle size={12} />
                  </div>
                  <p className="text-xs text-zinc-500">Analysing your projects and activity…</p>
                </div>
              ) : digest ? (
                <div className="pb-2">{renderDigest(digest)}</div>
              ) : null}
            </div>
            {/* Footer */}
            <div className="px-5 py-3 border-t border-zinc-800 shrink-0 flex items-center gap-2">
              {/* Regenerate */}
              <button onClick={() => { setGenerated(false); generate(); }} disabled={loading || sending}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-400 transition-colors disabled:opacity-40"
                title="Regenerate digest">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              </button>

              <div className="flex-1" />

              {/* Send to all members */}
              {digest && !loading && (
                <button
                  onClick={handleSendToAll}
                  disabled={sending || sentDone}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                    ${sentDone
                      ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 cursor-default"
                      : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-900/40 disabled:opacity-60 disabled:cursor-not-allowed"
                    }`}
                  title="Email digest to all project members"
                >
                  {sending ? (
                    <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending…</>
                  ) : sentDone ? (
                    <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6 9 17l-5-5"/></svg>Sent!</>
                  ) : (
                    <><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>Send to all members</>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── MAIN PROJECT PAGE ────────────────────────────────────────────────────────
export default function ProjectPage() {
  const { projectId }  = useParams();
  const { user }       = useAuth();
  const [project,      setProject]      = useState(null);
  const [members,      setMembers]      = useState([]);
  const [tasks,        setTasks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [activeView,   setActiveView]   = useState("board");
  const [showAddTask,  setShowAddTask]  = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState("EDITOR");

  const loadProject = useCallback(async () => {
    try {
      const [detail, taskData] = await Promise.all([
        api.projects.getDetail(user.id, projectId),
        api.tasks.getAllWithSubtasks(user.id, projectId),
      ]);
      setProject(detail.projectDetail);
      setMembers(detail.projectMember || []);
      setTasks(taskData.TasksDetail || []);
      const me = detail.projectMember?.find((m) => m.emailuser === user.email);
      if (me) setCurrentUserRole(me.role);
    } catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  }, [user?.id, projectId]);

  useEffect(() => { loadProject(); }, [loadProject]);

  const views = [
    { id: "board",     icon: "grid",       label: "Board"     },
    { id: "list",      icon: "list",       label: "List"      },
    { id: "dashboard", icon: "bar",        label: "Dashboard" },
    { id: "members",   icon: "users",      label: "Members"   },
    { id: "chat",      icon: "message",    label: "Chat"      },
    { id: "files",     icon: "paperclip",  label: "Files"     },
    { id: "activity",  icon: "activity",   label: "Activity"  },
    { id: "gantt",     icon: "bar",        label: "Timeline"      },
    { id: "notes",     icon: "edit",       label: "Meeting Notes" },
  ];

  const color   = getProjectColor(projectId);
  const canEdit = !["VIEWER","COMMENTER"].includes(currentUserRole);

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64"><Spinner size={24} /></div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <div className="flex flex-col h-full">
        {/* Project header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800 shrink-0">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0" style={{ background: color + "33", border: `1px solid ${color}44`, color }}>
            {(project?.projectName || "?")[0]}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-semibold text-zinc-200">{project?.projectName}</h1>
            <p className="text-xs text-zinc-500 truncate">{project?.description}</p>
          </div>
          <Badge variant={currentUserRole.toLowerCase()}>{currentUserRole}</Badge>
        </div>

        {/* View tabs */}
        <div className="flex items-center gap-1 px-6 py-2.5 border-b border-zinc-800 overflow-x-auto shrink-0">
          {views.map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${activeView === v.id ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"}`}
            >
              <Icon name={v.icon} size={13} />{v.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeView === "board"     && <KanbanView      tasks={tasks} members={members} projectId={projectId} onAddTask={() => canEdit && setShowAddTask(true)} onTaskUpdated={loadProject} />}
          {activeView === "list"      && <ListView        tasks={tasks} members={members} projectId={projectId} onAddTask={() => canEdit && setShowAddTask(true)} onTaskUpdated={loadProject} />}
          {activeView === "dashboard" && <DashboardAnalytics projectId={projectId} />}
          {activeView === "members"   && <MembersView     members={members} projectId={projectId} currentUserRole={currentUserRole} onMemberAdded={loadProject} />}
          {activeView === "chat"      && <ChatView        projectId={projectId} members={members} onTaskCreated={loadProject} />}
          {activeView === "files"     && <FilesView       projectId={projectId} tasks={tasks} />}
          {activeView === "activity"  && <ActivityView    projectId={projectId} />}
          {activeView === "gantt"     && <GanttView        tasks={tasks} members={members} projectId={projectId} onTaskUpdated={loadProject} />}
          {activeView === "notes"     && <MeetingNotesView projectId={projectId} members={members} onTaskCreated={loadProject} />}
        </div>
      </div>

      <SmartDigestButton projects={project ? [project] : []} tasks={tasks} projectId={projectId} />
      <TaskModal
        open={showAddTask}
        onClose={() => setShowAddTask(false)}
        projectId={projectId}
        members={members}
        onSaved={loadProject}
      />
    </AppLayout>
  );
}