"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { api } from "@/lib/api";
import AppLayout from "@/components/layout/AppLayout";
import TaskModal from "@/components/modals/TaskModal";
import { Icon, Avatar, Badge, Spinner, Empty, Button, Modal, Input, Select, showToast, formatDate, timeAgo, getProjectColor, priorityVariant, statusVariant, actionLabel } from "@/components/ui";

// ─── KANBAN BOARD ─────────────────────────────────────────────────────────────
function KanbanView({ tasks, members, projectId, onAddTask, onTaskUpdated }) {
  const { user } = useAuth();
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [editTask, setEditTask] = useState(null);
  const COLS = ["Todo", "In Progress", "In Review", "Done"];
  const colColors = { "Todo": "#71717a", "In Progress": "#3b82f6", "In Review": "#8b5cf6", "Done": "#10b981" };

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
              <button onClick={onAddTask} className="text-zinc-600 hover:text-zinc-400 transition-colors"><Icon name="plus" size={14} /></button>
            </div>
            <div className="p-3 space-y-2 min-h-32">
              {tasksByCol[col].map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={() => setDragging(task.id)}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-zinc-700 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <button onClick={() => toggleComplete(task)} className={`w-4 h-4 mt-0.5 rounded border shrink-0 flex items-center justify-center transition-colors ${task.mark_complete ? "bg-emerald-500 border-emerald-500" : "border-zinc-600 hover:border-zinc-400"}`}>
                        {task.mark_complete && <Icon name="checkSimple" size={9} className="text-white" />}
                      </button>
                      <p className={`text-xs font-medium leading-snug ${task.mark_complete ? "line-through text-zinc-600" : "text-zinc-200"}`}>{task.title}</p>
                    </div>
                    <button onClick={() => setEditTask(task)} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600 hover:text-zinc-400 shrink-0">
                      <Icon name="edit" size={12} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant={priorityVariant(task.priority)}>{task.priority}</Badge>
                    <div className="flex items-center gap-1.5">
                      <Icon name="clock" size={11} className="text-zinc-600" />
                      <span className="text-xs text-zinc-600">{formatDate(task.dueDate)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-zinc-800/60">
                    <Avatar name={task.assignee_email?.split("@")[0] || "?"} size={18} color="#6366f1" />
                    <span className="text-xs text-zinc-600 truncate">{task.assignee_email?.split("@")[0]}</span>
                  </div>
                  {/* Subtasks count */}
                  {task.allSubtasksDestail?.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5">
                      <Icon name="list" size={10} className="text-zinc-600" />
                      <span className="text-xs text-zinc-600">{task.allSubtasksDestail.filter((s) => s.mark_complete).length}/{task.allSubtasksDestail.length} subtasks</span>
                    </div>
                  )}
                </div>
              ))}
              {tasksByCol[col].length === 0 && (
                <div className="flex items-center justify-center h-20 text-xs text-zinc-700 border border-dashed border-zinc-800 rounded-lg">
                  No tasks
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {editTask && (
        <TaskModal open={!!editTask} onClose={() => setEditTask(null)} projectId={projectId} task={editTask} members={members} onSaved={() => { setEditTask(null); onTaskUpdated?.(); }} />
      )}
    </div>
  );
}

// ─── LIST VIEW ────────────────────────────────────────────────────────────────
function ListView({ tasks, members, projectId, onAddTask, onTaskUpdated }) {
  const { user } = useAuth();
  const [editTask, setEditTask] = useState(null);
  const [expanded, setExpanded] = useState({});

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
          <Empty icon="check" title="No tasks yet" desc="Add your first task to get started" action={<Button size="sm" icon="plus" onClick={onAddTask}>Add Task</Button>} />
        ) : tasks.map((task, i) => (
          <div key={task.id}>
            <div
              className={`grid items-center gap-0 px-4 py-3 hover:bg-zinc-800/40 transition-colors cursor-pointer ${i < tasks.length - 1 ? "border-b border-zinc-800/50" : ""}`}
              style={{ gridTemplateColumns: "1fr 140px 120px 100px 100px 36px" }}
              onClick={() => setExpanded((p) => ({ ...p, [task.id]: !p[task.id] }))}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <button onClick={(e) => { e.stopPropagation(); toggleComplete(task); }} className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${task.mark_complete ? "bg-emerald-500 border-emerald-500" : "border-zinc-600 hover:border-zinc-400"}`}>
                  {task.mark_complete && <Icon name="checkSimple" size={9} className="text-white" />}
                </button>
                <span className={`text-sm truncate ${task.mark_complete ? "line-through text-zinc-600" : "text-zinc-300"}`}>{task.title}</span>
                {task.allSubtasksDestail?.length > 0 && (
                  <span className="text-xs text-zinc-600 bg-zinc-800 px-1.5 py-0.5 rounded shrink-0">{task.allSubtasksDestail.length}</span>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Avatar name={task.assignee_email?.split("@")[0] || "?"} size={20} color="#6366f1" />
                <span className="text-xs text-zinc-500 truncate">{task.assignee_email?.split("@")[0]}</span>
              </div>
              <Badge variant={statusVariant(task.status)}>{task.status}</Badge>
              <Badge variant={priorityVariant(task.priority)}>{task.priority}</Badge>
              <span className="text-xs text-zinc-500">{formatDate(task.dueDate)}</span>
              <button onClick={(e) => { e.stopPropagation(); setEditTask(task); }} className="text-zinc-700 hover:text-zinc-400 transition-colors">
                <Icon name="edit" size={13} />
              </button>
            </div>
            {/* Subtasks */}
            {expanded[task.id] && task.allSubtasksDestail?.length > 0 && task.allSubtasksDestail.map((sub) => (
              <div key={sub.id} className="grid items-center gap-0 px-4 py-2.5 bg-zinc-950/40 border-b border-zinc-800/30" style={{ gridTemplateColumns: "1fr 140px 120px 100px 100px 36px" }}>
                <div className="flex items-center gap-2.5 pl-6 min-w-0">
                  <div className={`w-3.5 h-3.5 rounded border shrink-0 flex items-center justify-center ${sub.mark_complete ? "bg-emerald-500 border-emerald-500" : "border-zinc-700"}`}>
                    {sub.mark_complete && <Icon name="checkSimple" size={8} className="text-white" />}
                  </div>
                  <span className={`text-xs truncate ${sub.mark_complete ? "line-through text-zinc-600" : "text-zinc-400"}`}>{sub.title}</span>
                </div>
                <div />
                <Badge variant={statusVariant(sub.status)}>{sub.status}</Badge>
                <Badge variant={priorityVariant(sub.priority)}>{sub.priority}</Badge>
                <span className="text-xs text-zinc-600">{formatDate(sub.dueDate)}</span>
                <div />
              </div>
            ))}
          </div>
        ))}
      </div>
      {editTask && (
        <TaskModal open={!!editTask} onClose={() => setEditTask(null)} projectId={projectId} task={editTask} members={members} onSaved={() => { setEditTask(null); onTaskUpdated?.(); }} />
      )}
    </div>
  );
}

// ─── DASHBOARD ANALYTICS ──────────────────────────────────────────────────────
function DashboardAnalytics({ projectId }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.tasks.dashboard(user.id, projectId).then((d) => setData(d)).catch(console.error).finally(() => setLoading(false));
  }, [user?.id, projectId]);

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;
  if (!data) return <Empty icon="bar" title="No data available" />;

  const { totalTask = 0, completedTask = 0, notcompletedTask = 0, highPriority = 0, mediumPriority = 0, lowPriority = 0, counttaskWithAssignEmails = [], profile = {} } = data;
  const pct = totalTask ? Math.round((completedTask / totalTask) * 100) : 0;
  const statusData = { "Completed": completedTask, "Pending": notcompletedTask };

  return (
    <div className="p-6 space-y-4 max-w-4xl">
      <h2 className="text-sm font-semibold text-zinc-200">Dashboard</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[{ l: "Total", v: totalTask, c: "#6366f1" }, { l: "Completed", v: completedTask, c: "#10b981" }, { l: "Pending", v: notcompletedTask, c: "#f59e0b" }, { l: "Completion", v: `${pct}%`, c: "#ec4899" }].map((s) => (
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
          {[{ label: "High", count: highPriority, color: "#ef4444" }, { label: "Medium", count: mediumPriority, color: "#f59e0b" }, { label: "Low", count: lowPriority, color: "#10b981" }].map(({ label, count, color }) => (
            <div key={label} className="flex items-center gap-3 mb-3 last:mb-0">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
              <span className="text-xs text-zinc-400 w-16">{label}</span>
              <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all" style={{ width: `${totalTask ? (count / totalTask) * 100 : 0}%`, background: color }} />
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
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmails, setInviteEmails] = useState("");
  const [role, setRole] = useState("EDITOR");
  const [inviteLoading, setInviteLoading] = useState(false);
  const colors = ["#6366f1","#f59e0b","#10b981","#ec4899","#3b82f6","#8b5cf6"];

  const handleInvite = async () => {
    const emails = inviteEmails.split(",").map((e) => e.trim()).filter(Boolean);
    if (emails.length === 0) return;
    setInviteLoading(true);
    try {
      const data = await api.projects.inviteMember(user.id, projectId, { inviteEmail: emails, role });
      showToast(`${emails.length} member(s) added successfully`);
      setShowInvite(false);
      setInviteEmails("");
      // Re-fetch full member details (with fullname + profile) from backend
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
              {["EDITOR","VIEWER","COMMENTER","ADMIN"].map((r) => <option key={r} value={r}>{r}</option>)}
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

// ─── CHAT VIEW ────────────────────────────────────────────────────────────────
function ChatView({ projectId }) {
  const { user } = useAuth();
  const socket = useSocket();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState([]);
  const bottomRef = useRef(null);
  const typingTimer = useRef(null);

  useEffect(() => {
    api.chat.getHistory(projectId).then((d) => {
      setMessages(d.messages || []);
    }).catch(console.error).finally(() => setLoading(false));
    socket?.joinProject(projectId);
    return () => socket?.leaveProject(projectId);
  }, [projectId]);

  useEffect(() => {
    const off1 = socket?.on("receive_message", (msg) => {
      setMessages((prev) => {
        // If we already have an optimistic version from this sender with matching content, replace it
        const hasOptimistic = prev.some(
          (m) => m._optimistic && m.senderId === msg.senderId && m.content === msg.message
        );
        if (hasOptimistic) {
          return prev.map((m) =>
            m._optimistic && m.senderId === msg.senderId && m.content === msg.message
              ? { ...msg, content: msg.message || msg.content }
              : m
          );
        }
        // Normalise: socket sends { message } but history uses { content }
        return [...prev, { ...msg, content: msg.message || msg.content }];
      });
    });
    const off2 = socket?.on("user_typing", ({ userId, fullname }) => {
      if (userId !== user?.id) setTyping((p) => [...new Set([...p, fullname])]);
    });
    const off3 = socket?.on("user_stopped_typing", ({ userId }) => {
      if (userId !== user?.id) setTyping((p) => p.filter((_, i) => i > 0));
    });
    return () => { off1?.(); off2?.(); off3?.(); };
  }, [socket, user?.id]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleInput = (v) => {
    setInput(v);
    socket?.typingStart(projectId);
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => socket?.typingStop(projectId), 1500);
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;

    // Optimistically add message immediately so sender sees it without waiting
    const optimistic = {
      id: `temp-${Date.now()}`,
      projectId,
      content: text,
      senderId: user?.id,
      sender_id: user?.id,
      sender: { fullname: user?.fullname, profile: user?.profile },
      senderName: user?.fullname,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    socket?.typingStop(projectId);
    socket?.sendMessage(projectId, text);
  };

  return (
    <div className="flex flex-col h-full" style={{ minHeight: 0 }}>
      <div className="px-6 py-4 border-b border-zinc-800 shrink-0">
        <h2 className="text-sm font-semibold text-zinc-200">Team Chat</h2>
        <p className="text-xs text-zinc-500">Real-time project conversation</p>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {loading ? <div className="flex justify-center pt-8"><Spinner /></div> : messages.length === 0 ? (
          <Empty icon="message" title="No messages yet" desc="Start the conversation!" />
        ) : messages.map((msg) => {
          const isMe = msg.senderId === user?.id || msg.sender_id === user?.id;
          const senderName = msg.sender?.fullname || msg.senderName || "?";
          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
              <Avatar name={senderName} src={msg.sender?.profile} size={28} color={isMe ? "#6366f1" : "#f59e0b"} />
              <div className={`max-w-xs flex flex-col gap-0.5 ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && <span className="text-xs font-medium text-zinc-500 px-1">{senderName}</span>}
                <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${isMe ? "bg-indigo-600 text-white rounded-br-sm" : "bg-zinc-800 text-zinc-200 rounded-bl-sm"}`}>
                  {msg.content || msg.message}
                </div>
                <span className="text-xs text-zinc-700 px-1">{timeAgo(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
        {typing.length > 0 && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1 px-3 py-2 bg-zinc-800 rounded-2xl rounded-bl-sm">
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs text-zinc-600">{typing.join(", ")} typing…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="px-6 py-4 border-t border-zinc-800 shrink-0">
        <div className="flex gap-2">
          <input value={input} onChange={(e) => handleInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()} placeholder="Message the team..." className="flex-1 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500/70 transition-colors" />
          <button onClick={send} className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors">
            <Icon name="send" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FILES VIEW ───────────────────────────────────────────────────────────────
function FilesView({ projectId, tasks }) {
  const { user } = useAuth();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [taskId, setTaskId] = useState("");
  const fileRef = useRef(null);

  const load = useCallback(() => {
    api.files.getByProject(projectId).then((d) => setFiles(d.files || [])).catch(console.error).finally(() => setLoading(false));
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
  const ext = (name) => (name || "").split(".").pop()?.toUpperCase().slice(0, 4) || "FILE";
  const fmtSize = (b) => b > 1e6 ? `${(b / 1e6).toFixed(1)} MB` : b ? `${(b / 1e3).toFixed(0)} KB` : "";

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
      {loading ? <div className="flex justify-center py-16"><Spinner /></div> : files.length === 0 ? (
        <Empty icon="paperclip" title="No files yet" desc="Upload files to tasks in this project" action={<Button size="sm" icon="upload" onClick={() => setShowUpload(true)}>Upload</Button>} />
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

// ─── ACTIVITY VIEW ────────────────────────────────────────────────────────────
function ActivityView({ projectId }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const colors = ["#6366f1","#f59e0b","#10b981","#ec4899","#3b82f6","#8b5cf6"];

  useEffect(() => {
    api.activity.getByProject(projectId).then((d) => setLogs(d.logs || [])).catch(console.error).finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return <div className="flex justify-center py-16"><Spinner /></div>;

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="text-sm font-semibold text-zinc-200 mb-4">Activity Log</h2>
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

// ─── MAIN PROJECT PAGE ────────────────────────────────────────────────────────
export default function ProjectPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("board");
  const [showAddTask, setShowAddTask] = useState(false);
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
    { id: "board", icon: "grid", label: "Board" },
    { id: "list", icon: "list", label: "List" },
    { id: "dashboard", icon: "bar", label: "Dashboard" },
    { id: "members", icon: "users", label: "Members" },
    { id: "chat", icon: "message", label: "Chat" },
    { id: "files", icon: "paperclip", label: "Files" },
    { id: "activity", icon: "activity", label: "Activity" },
  ];

  const color = getProjectColor(projectId);
  const canEdit = !["VIEWER", "COMMENTER"].includes(currentUserRole);

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
            <button key={v.id} onClick={() => setActiveView(v.id)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${activeView === v.id ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"}`}>
              <Icon name={v.icon} size={13} />{v.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeView === "board" && <KanbanView tasks={tasks} members={members} projectId={projectId} onAddTask={() => canEdit && setShowAddTask(true)} onTaskUpdated={loadProject} />}
          {activeView === "list" && <ListView tasks={tasks} members={members} projectId={projectId} onAddTask={() => canEdit && setShowAddTask(true)} onTaskUpdated={loadProject} />}
          {activeView === "dashboard" && <DashboardAnalytics projectId={projectId} />}
          {activeView === "members" && <MembersView members={members} projectId={projectId} currentUserRole={currentUserRole} onMemberAdded={loadProject} />}
          {activeView === "chat" && <ChatView projectId={projectId} />}
          {activeView === "files" && <FilesView projectId={projectId} tasks={tasks} />}
          {activeView === "activity" && <ActivityView projectId={projectId} />}
        </div>
      </div>

      <TaskModal open={showAddTask} onClose={() => setShowAddTask(false)} projectId={projectId} members={members} onSaved={loadProject} />
    </AppLayout>
  );
}