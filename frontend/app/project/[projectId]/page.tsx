"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
import {
  Sparkles, LayoutGrid, List, BarChart2, Users, MessageSquare,
  Paperclip, Activity, GitBranch, FileText, Plus, ChevronRight,
  AlertTriangle, Clock, CheckCircle2, Circle, Send, X, Loader2,
  TrendingUp, Zap, Target, Edit3, Eye, GripVertical, RefreshCw,
  Check, ArrowRight, Upload, Trash2, MoreHorizontal, Search,
} from "lucide-react";

const FONT = "'Outfit', sans-serif";

/* ─── helpers ─────────────────────────────────────────────────────────────── */
const dayStart  = d => new Date(new Date(d).setHours(0,0,0,0));
const isOverdue = t => !t.mark_complete && t.dueDate && dayStart(t.dueDate) < dayStart(new Date());
const isDueSoon = t => {
  if (t.mark_complete||!t.dueDate) return false;
  const diff = (dayStart(t.dueDate)-dayStart(new Date()))/(864e5);
  return diff>=0&&diff<=1;
};
const dueCls   = t => isOverdue(t)?"text-red-400 font-semibold":isDueSoon(t)?"text-amber-400 font-semibold":"text-zinc-600";
const dueLabel = t => {
  if (!t.dueDate) return "";
  if (isOverdue(t)) return `⚠ ${formatDate(t.dueDate)}`;
  if (isDueSoon(t)) return `🕐 ${formatDate(t.dueDate)}`;
  return formatDate(t.dueDate);
};

const PCOL = { High:"#ef4444", Medium:"#f59e0b", Low:"#10b981" };
const SCOL = { "Todo":"#71717a","In Progress":"#3b82f6","In Review":"#8b5cf6","Done":"#10b981" };

/* ─── shared atoms ────────────────────────────────────────────────────────── */
function SectionHeader({ title, count, action }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <h2 className="text-[15px] font-black text-white">{title}</h2>
        {count!=null && (
          <span className="text-[10px] font-black text-zinc-700 px-1.5 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-800">{count}</span>
        )}
      </div>
      {action}
    </div>
  );
}

function AddBtn({ onClick, label="Add Task" }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-black text-white transition-all hover:-translate-y-px active:translate-y-0" style={{ background:"linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow:"0 4px 14px rgba(99,102,241,0.35)" }}>
      <Plus size={12} strokeWidth={2.5}/>{label}
    </button>
  );
}

function AiBtn({ onClick, loading, label, small }) {
  return (
    <button onClick={onClick} disabled={loading} className={`flex items-center gap-1.5 rounded-xl font-black transition-all disabled:opacity-60 ${small?"px-2.5 py-1.5 text-[11px]":"px-3 py-1.5 text-[12px]"}`} style={{ background:"linear-gradient(135deg,rgba(139,92,246,0.2),rgba(99,102,241,0.14))", border:"1px solid rgba(139,92,246,0.4)", color:"#c4b5fd", boxShadow:"0 0 16px rgba(139,92,246,0.18)" }}>
      {loading ? <Loader2 size={11} className="animate-spin"/> : <Sparkles size={11}/>}
      {loading?"Thinking…":label}
    </button>
  );
}

function AiPanel({ title, content, loading, onClose }) {
  return (
    <div className="rounded-2xl overflow-hidden mb-4" style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.07),rgba(139,92,246,0.05))", border:"1px solid rgba(139,92,246,0.2)" }}>
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom:"1px solid rgba(139,92,246,0.15)" }}>
        <Sparkles size={12} className="text-violet-400"/>
        <span className="text-[11px] font-black uppercase tracking-widest text-violet-300">{title}</span>
        {onClose && <button onClick={onClose} className="ml-auto text-zinc-700 hover:text-zinc-400 transition-colors"><X size={12}/></button>}
      </div>
      <div className="px-4 py-3">
        {loading
          ? <div className="flex items-center gap-2"><Loader2 size={12} className="animate-spin text-violet-400"/><span className="text-[12px] text-zinc-500">Generating…</span></div>
          : <div className="text-[12.5px] text-zinc-300 leading-relaxed whitespace-pre-wrap">{content}</div>
        }
      </div>
    </div>
  );
}

function PriorityDot({ p }) {
  return <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:PCOL[p]||"#71717a" }}/>;
}

function StatusChip({ status }) {
  const c = SCOL[status]||"#71717a";
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-bold" style={{ background:`${c}18`, border:`1px solid ${c}30`, color:c }}>
      <span className="w-1 h-1 rounded-full" style={{background:c}}/>{status}
    </span>
  );
}

function TaskCard({ task, onClick, onEdit, onComplete }) {
  const overdue  = isOverdue(task);
  const dueSoon  = isDueSoon(task);
  const pColor   = PCOL[task.priority]||"#71717a";
  const subDone  = (task.subtasks||[]).filter(s=>s.mark_complete).length;
  const subTotal = (task.subtasks||[]).length;

  return (
    <div
      onClick={onClick}
      className="group relative rounded-2xl cursor-pointer transition-all hover:-translate-y-0.5"
      style={{
        background:"linear-gradient(160deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))",
        border:`1px solid ${overdue?"rgba(239,68,68,0.3)":dueSoon?"rgba(245,158,11,0.25)":"rgba(255,255,255,0.07)"}`,
        boxShadow: overdue?"0 2px 20px rgba(239,68,68,0.1)":dueSoon?"0 2px 20px rgba(245,158,11,0.08)":"0 2px 12px rgba(0,0,0,0.3)",
      }}
    >
      {/* left priority stripe */}
      <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full" style={{ background:pColor, opacity:0.7 }}/>

      <div className="px-4 py-3 pl-5">
        {/* top row */}
        <div className="flex items-start gap-2 mb-2">
          <button
            onClick={e=>{e.stopPropagation();onComplete(task);}}
            className={`w-4 h-4 mt-0.5 rounded border-2 shrink-0 flex items-center justify-center transition-all ${task.mark_complete?"border-emerald-500 bg-emerald-500":"border-zinc-600 hover:border-indigo-400"}`}
          >
            {task.mark_complete&&<Check size={8} strokeWidth={3} className="text-white"/>}
          </button>
          <p className={`flex-1 text-[13px] font-semibold leading-snug ${task.mark_complete?"line-through text-zinc-600":"text-zinc-100"}`}>{task.title}</p>
          <button
            onClick={e=>{e.stopPropagation();onEdit(task);}}
            className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-200 hover:bg-white/5 transition-all shrink-0"
          >
            <Edit3 size={11}/>
          </button>
        </div>

        {/* badges row */}
        <div className="flex items-center gap-1.5 flex-wrap pl-6">
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold" style={{ color:pColor, background:`${pColor}15`, border:`1px solid ${pColor}25` }}>
            <span className="w-1 h-1 rounded-full" style={{background:pColor}}/>{task.priority}
          </span>
          {task.dueDate && (
            <span className={`flex items-center gap-1 text-[10.5px] ${dueCls(task)}`}>
              <Clock size={9}/>{dueLabel(task)}
            </span>
          )}
          {subTotal>0 && (
            <span className="text-[10px] text-zinc-600 flex items-center gap-1">
              <CheckCircle2 size={9}/>{subDone}/{subTotal}
            </span>
          )}
        </div>

        {/* assignee */}
        <div className="flex items-center gap-1.5 mt-2.5 pl-6 pt-2" style={{borderTop:"1px solid rgba(255,255,255,0.04)"}}>
          <Avatar name={task.assignee_email?.split("@")[0]||"?"} size={16} color="#6366f1"/>
          <span className="text-[10.5px] text-zinc-600 truncate">{task.assignee_email?.split("@")[0]}</span>
        </div>
      </div>
    </div>
  );
}

/* ─── KANBAN ──────────────────────────────────────────────────────────────── */
const COLS = ["Todo","In Progress","In Review","Done"];
const COL_META = {
  "Todo":        { color:"#71717a", icon:Circle },
  "In Progress": { color:"#3b82f6", icon:Loader2 },
  "In Review":   { color:"#8b5cf6", icon:Eye },
  "Done":        { color:"#10b981", icon:CheckCircle2 },
};

function KanbanView({ tasks, members, projectId, onAddTask, onTaskUpdated }) {
  const { user } = useAuth();
  const [dragging,    setDragging]    = useState(null);
  const [dragOver,    setDragOver]    = useState(null);
  const [editTask,    setEditTask]    = useState(null);
  const [detailTask,  setDetailTask]  = useState(null);

  const byCol = COLS.reduce((acc,c) => { acc[c]=tasks.filter(t=>t.status===c); return acc; },{});

  const moveTask = async (taskId,toCol) => {
    const t=tasks.find(t=>t.id===taskId);
    if (!t||t.status===toCol) return;
    try { await api.tasks.edit(user.id,projectId,[{...t,taskId:t.id,assigneEmail:t.assignee_email,status:toCol}]); onTaskUpdated?.(); }
    catch(e) { showToast(e.message,"error"); }
  };

  const toggleComplete = async t => {
    try { await api.tasks.markComplete(user.id,projectId,t.id); onTaskUpdated?.(); }
    catch(e) { showToast(e.message,"error"); }
  };

  return (
    <div className="p-6 h-full">
      <SectionHeader title="Board" count={tasks.length} action={<AddBtn onClick={onAddTask}/>}/>
      <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100%-52px)]">
        {COLS.map(col=>{
          const meta  = COL_META[col];
          const ColIcon = meta.icon;
          const active  = dragOver===col;
          return (
            <div key={col} className="flex-shrink-0 w-72 flex flex-col rounded-2xl overflow-hidden transition-all" style={{ background:active?`${meta.color}0a`:"rgba(255,255,255,0.02)", border:`1px solid ${active?meta.color+"40":"rgba(255,255,255,0.06)"}`, boxShadow:active?`0 0 24px ${meta.color}18`:"none" }} onDragOver={e=>{e.preventDefault();setDragOver(col);}} onDragLeave={()=>setDragOver(null)} onDrop={()=>{if(dragging){moveTask(dragging,col);setDragging(null);setDragOver(null);}}} >
              {/* column header */}
              <div className="flex items-center gap-2.5 px-4 py-3 shrink-0" style={{ borderBottom:`1px solid ${meta.color}25`, background:`${meta.color}0a` }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background:`${meta.color}20`, border:`1px solid ${meta.color}30` }}>
                  <ColIcon size={11} style={{color:meta.color}} strokeWidth={2}/>
                </div>
                <span className="text-[12px] font-black text-zinc-200">{col}</span>
                <span className="ml-auto text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{ color:meta.color, background:`${meta.color}18`, border:`1px solid ${meta.color}30` }}>{byCol[col].length}</span>
                <button onClick={onAddTask} className="w-5 h-5 rounded-md flex items-center justify-center text-zinc-700 hover:text-zinc-300 hover:bg-white/5 transition-all"><Plus size={11}/></button>
              </div>

              {/* cards */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5" style={{scrollbarWidth:"none"}}>
                {byCol[col].map(task=>(
                  <div key={task.id} draggable onDragStart={()=>setDragging(task.id)}>
                    <TaskCard task={task} onClick={()=>setDetailTask(task)} onEdit={t=>setEditTask(t)} onComplete={toggleComplete}/>
                  </div>
                ))}
                {byCol[col].length===0&&(
                  <div className="flex items-center justify-center h-20 rounded-xl text-[11.5px] text-zinc-700 font-medium" style={{border:"1.5px dashed rgba(255,255,255,0.06)"}}>
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {editTask&&<TaskModal open={!!editTask} onClose={()=>setEditTask(null)} projectId={projectId} task={editTask} members={members} onSaved={()=>{setEditTask(null);onTaskUpdated?.();}}/>}
      <TaskDetailModal open={!!detailTask} task={detailTask} projectId={projectId} members={members} onClose={()=>setDetailTask(null)} onSaved={()=>{setDetailTask(null);onTaskUpdated?.();}} onEdit={t=>setEditTask(t)}/>
    </div>
  );
}

/* ─── LIST VIEW ───────────────────────────────────────────────────────────── */
function ListView({ tasks, members, projectId, onAddTask, onTaskUpdated }) {
  const { user } = useAuth();
  const [editTask,   setEditTask]   = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [search,     setSearch]     = useState("");
  const [filter,     setFilter]     = useState("All");
  const [expanded,   setExpanded]   = useState({});
  const toggleExpand = (id,e) => { e.stopPropagation(); setExpanded(p=>({...p,[id]:!p[id]})); };

  const toggleComplete = async t => {
    try { await api.tasks.markComplete(user.id,projectId,t.id); onTaskUpdated?.(); }
    catch(e) { showToast(e.message,"error"); }
  };

  const filtered = tasks.filter(t=>{
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==="All"||t.status===filter||(filter==="Overdue"&&isOverdue(t))||(filter==="Done"&&t.mark_complete);
    return matchSearch&&matchFilter;
  });

  const filters = ["All",...COLS,"Overdue"];

  return (
    <div className="p-6">
      <SectionHeader title="List" count={tasks.length} action={<AddBtn onClick={onAddTask}/>}/>

      {/* filter + search bar */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search tasks…" className="w-full pl-8 pr-3 py-2 rounded-xl text-[12.5px] text-zinc-300 placeholder-zinc-700 outline-none transition-all" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",fontFamily:FONT}}/>
        </div>
        <div className="flex items-center gap-1">
          {filters.map(f=>(
            <button key={f} onClick={()=>setFilter(f)} className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all" style={{ background:filter===f?"rgba(99,102,241,0.15)":"rgba(255,255,255,0.02)", border:`1px solid ${filter===f?"rgba(99,102,241,0.35)":"rgba(255,255,255,0.05)"}`, color:filter===f?"#a5b4fc":"#52525b" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* table */}
      <div className="rounded-2xl overflow-hidden" style={{border:"1px solid rgba(255,255,255,0.07)"}}>
        {/* header */}
        <div className="grid px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-600" style={{gridTemplateColumns:"1fr 150px 130px 90px 100px 32px",background:"rgba(255,255,255,0.02)",borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <span>Task</span><span>Assignee</span><span>Status</span><span>Priority</span><span>Due</span><span/>
        </div>

        {filtered.length===0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
              <CheckCircle2 size={18} className="text-zinc-700"/>
            </div>
            <p className="text-[13px] text-zinc-600 font-medium">No tasks found</p>
          </div>
        ) : filtered.map((task,i)=>(
          <React.Fragment key={task.id}>
            <div className="group grid items-center px-4 py-3 cursor-pointer transition-all hover:bg-white/[0.02]" style={{gridTemplateColumns:"1fr 150px 130px 90px 100px 32px",borderBottom:"1px solid rgba(255,255,255,0.04)"}} onClick={()=>setDetailTask(task)}>
              <div className="flex items-center gap-2.5 min-w-0 pr-3">
                <button onClick={e=>{e.stopPropagation();toggleComplete(task);}} className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-all ${task.mark_complete?"border-emerald-500 bg-emerald-500":"border-zinc-700 group-hover:border-indigo-500/50"}`}>
                  {task.mark_complete&&<Check size={8} strokeWidth={3} className="text-white"/>}
                </button>
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:PCOL[task.priority]||"#71717a"}}/>
                <span className={`text-[13px] font-medium truncate ${task.mark_complete?"line-through text-zinc-600":"text-zinc-200"}`}>{task.title}</span>
                {(task.subtasks||[]).length>0&&(
                  <button onClick={e=>toggleExpand(task.id,e)} className="shrink-0 flex items-center gap-1 text-[10px] text-zinc-600 hover:text-zinc-300 bg-zinc-800/60 hover:bg-zinc-800 px-1.5 py-0.5 rounded transition-all">
                    {(task.subtasks||[]).length}
                    <ChevronRight size={9} className={`transition-transform ${expanded[task.id]?"rotate-90":""}`}/>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <Avatar name={task.assignee_email?.split("@")[0]||"?"} size={20} color="#6366f1"/>
                <span className="text-[12px] text-zinc-500 truncate">{task.assignee_email?.split("@")[0]}</span>
              </div>
              <StatusChip status={task.status}/>
              <span className="flex items-center gap-1 text-[11px] font-bold" style={{color:PCOL[task.priority]||"#71717a"}}>
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:PCOL[task.priority]||"#71717a"}}/>{task.priority}
              </span>
              <span className={`text-[11.5px] ${dueCls(task)}`}>{dueLabel(task)}</span>
              <button onClick={e=>{e.stopPropagation();setEditTask(task);}} className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-200 hover:bg-white/5 transition-all">
                <Edit3 size={11}/>
              </button>
            </div>
            {/* ── subtask expand rows ── */}
            {expanded[task.id]&&(task.subtasks||[]).map(sub=>(
              <div key={sub.id} className="grid items-center px-4 py-2.5" style={{gridTemplateColumns:"1fr 150px 130px 90px 100px 32px",borderTop:"1px solid rgba(255,255,255,0.03)",background:"rgba(0,0,0,0.15)",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                <div className="flex items-center gap-2.5 pl-7 min-w-0">
                  <div className={`w-3.5 h-3.5 rounded border-2 shrink-0 flex items-center justify-center ${sub.mark_complete?"border-emerald-500 bg-emerald-500":"border-zinc-700"}`}>
                    {sub.mark_complete&&<Check size={7} strokeWidth={3} className="text-white"/>}
                  </div>
                  <span className={`text-[12px] truncate ${sub.mark_complete?"line-through text-zinc-600":"text-zinc-400"}`}>{sub.title}</span>
                </div>
                <div/>
                <StatusChip status={sub.status}/>
                <span className="flex items-center gap-1 text-[10.5px] font-bold" style={{color:PCOL[sub.priority]||"#71717a"}}>
                  <span className="w-1 h-1 rounded-full shrink-0" style={{background:PCOL[sub.priority]||"#71717a"}}/>{sub.priority}
                </span>
                <span className="text-[11px] text-zinc-600">{formatDate(sub.dueDate)}</span>
                <div/>
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>

      {editTask&&<TaskModal open={!!editTask} onClose={()=>setEditTask(null)} projectId={projectId} task={editTask} members={members} onSaved={()=>{setEditTask(null);onTaskUpdated?.();}}/>}
      <TaskDetailModal open={!!detailTask} task={detailTask} projectId={projectId} members={members} onClose={()=>setDetailTask(null)} onSaved={()=>{setDetailTask(null);onTaskUpdated?.();}} onEdit={t=>setEditTask(t)}/>
    </div>
  );
}

/* ─── DASHBOARD ───────────────────────────────────────────────────────────── */
function DashboardView({ projectId }) {
  const { user } = useAuth();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState("");
  const [insLoad, setInsLoad] = useState(false);
  const [insShow, setInsShow] = useState(false);

  useEffect(()=>{ api.tasks.dashboard(user.id,projectId).then(d=>setData(d)).catch(console.error).finally(()=>setLoading(false)); },[user?.id,projectId]);

  const handleInsight = async () => {
    setInsShow(true); setInsLoad(true);
    try { setInsight(await generateProductivityInsight(data)); }
    catch(e) { setInsight("Could not generate insight: "+e.message); }
    finally { setInsLoad(false); }
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 size={20} className="animate-spin text-zinc-600"/></div>;
  if (!data)   return <div className="p-6"><Empty icon="bar" title="No data available"/></div>;

  const { totalTask=0,completedTask=0,notcompletedTask=0,highPriority=0,mediumPriority=0,lowPriority=0,counttaskWithAssignEmails=[],profile={} } = data;
  const pct = totalTask?Math.round((completedTask/totalTask)*100):0;
  const r   = 24, circ = 2*Math.PI*r;

  const stats = [
    { label:"Total Tasks",  value:totalTask,        color:"#6366f1", sub:null },
    { label:"Completed",    value:completedTask,     color:"#10b981", sub:`${pct}%` },
    { label:"In Progress",  value:notcompletedTask,  color:"#f59e0b", sub:null },
    { label:"High Priority",value:highPriority,      color:"#ef4444", sub:null },
  ];

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <SectionHeader title="Dashboard" action={<AiBtn onClick={handleInsight} loading={insLoad} label="AI Insight"/>}/>

      {insShow&&<AiPanel title="Productivity Insight" content={insight} loading={insLoad} onClose={()=>setInsShow(false)}/>}

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s=>(
          <div key={s.label} className="relative rounded-2xl p-4 overflow-hidden" style={{ background:"linear-gradient(160deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))", border:"1px solid rgba(255,255,255,0.07)" }}>
            <div className="absolute top-2 right-2 w-8 h-8 rounded-full" style={{ background:`radial-gradient(circle,${s.color}30,transparent 70%)` }}/>
            <p className="text-[28px] font-black text-white leading-none">{s.value}</p>
            {s.sub&&<p className="text-[10px] font-black mt-1" style={{color:s.color}}>{s.sub} rate</p>}
            <p className="text-[11px] text-zinc-600 font-medium mt-1">{s.label}</p>
            <div className="mt-3 h-1 rounded-full" style={{background:"rgba(255,255,255,0.06)"}}>
              <div className="h-full rounded-full transition-all" style={{ width:`${totalTask?(s.value/totalTask)*100:0}%`, background:s.color }}/>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* completion ring */}
        <div className="rounded-2xl p-5 flex flex-col items-center justify-center gap-3" style={{ background:"linear-gradient(160deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))", border:"1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[10.5px] font-black uppercase tracking-widest text-zinc-600">Completion</p>
          <div className="relative">
            <svg width={68} height={68} className="-rotate-90">
              <circle cx={34} cy={34} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5}/>
              <circle cx={34} cy={34} r={r} fill="none" stroke={pct>=100?"#10b981":"#6366f1"} strokeWidth={5} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} style={{transition:"stroke-dashoffset 1s ease"}}/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[16px] font-black text-white">{pct}%</span>
            </div>
          </div>
          <p className="text-[11.5px] text-zinc-500">{completedTask} of {totalTask} done</p>
        </div>

        {/* priority breakdown */}
        <div className="rounded-2xl p-5" style={{ background:"linear-gradient(160deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))", border:"1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[10.5px] font-black uppercase tracking-widest text-zinc-600 mb-4">By Priority</p>
          {[{label:"High",count:highPriority,color:"#ef4444"},{label:"Medium",count:mediumPriority,color:"#f59e0b"},{label:"Low",count:lowPriority,color:"#10b981"}].map(({label,count,color})=>(
            <div key={label} className="flex items-center gap-3 mb-3 last:mb-0">
              <div className="w-2 h-2 rounded-full shrink-0" style={{background:color}}/>
              <span className="text-[12px] text-zinc-400 w-14">{label}</span>
              <div className="flex-1 h-1.5 rounded-full" style={{background:"rgba(255,255,255,0.05)"}}>
                <div className="h-full rounded-full" style={{width:`${totalTask?(count/totalTask)*100:0}%`,background:color,transition:"width 0.8s ease"}}/>
              </div>
              <span className="text-[11px] text-zinc-500 w-4 text-right">{count}</span>
            </div>
          ))}
        </div>

        {/* assignee breakdown */}
        <div className="rounded-2xl p-5" style={{ background:"linear-gradient(160deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))", border:"1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-[10.5px] font-black uppercase tracking-widest text-zinc-600 mb-4">By Assignee</p>
          {counttaskWithAssignEmails.length===0
            ? <p className="text-[12px] text-zinc-700 text-center py-4">No assignee data</p>
            : counttaskWithAssignEmails.map((a,i)=>(
              <div key={a.email} className="flex items-center gap-2.5 mb-3 last:mb-0">
                <Avatar name={a.email?.split("@")[0]||"?"} src={profile[a.email]} size={24} color="#6366f1"/>
                <span className="text-[12px] text-zinc-400 flex-1 truncate">{a.email?.split("@")[0]}</span>
                <span className="text-[11px] font-bold text-emerald-400">{a.completeCount}✓</span>
                <span className="text-[11px] text-zinc-600">{a.incompleteCount}</span>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

/* ─── MEMBERS VIEW ────────────────────────────────────────────────────────── */
const ROLE_COLOR = { OWNER:"#f59e0b",ADMIN:"#ef4444",EDITOR:"#6366f1",VIEWER:"#71717a",COMMENTER:"#10b981" };

function MembersView({ members, projectId, currentUserRole, onMemberAdded }) {
  const { user } = useAuth();
  const [showInvite, setShowInvite] = useState(false);
  const [emails,     setEmails]     = useState("");
  const [role,       setRole]       = useState("EDITOR");
  const [invLoad,    setInvLoad]    = useState(false);
  const colors = ["#6366f1","#f59e0b","#10b981","#ec4899","#3b82f6","#8b5cf6"];

  const handleInvite = async () => {
    const list = emails.split(",").map(e=>e.trim()).filter(Boolean);
    if (!list.length) return;
    setInvLoad(true);
    try { await api.projects.inviteMember(user.id,projectId,{inviteEmail:list,role}); showToast(`${list.length} member(s) added`); setShowInvite(false); setEmails(""); onMemberAdded?.(); }
    catch(e) { showToast(e.message,"error"); }
    finally { setInvLoad(false); }
  };

  const canInvite = ["OWNER","ADMIN"].includes(currentUserRole);

  return (
    <div className="p-6 max-w-2xl">
      <SectionHeader
        title="Team Members"
        count={members.length}
        action={canInvite&&<AddBtn onClick={()=>setShowInvite(v=>!v)} label="Invite"/>}
      />

      {/* invite panel */}
      {showInvite&&(
        <div className="mb-5 p-4 rounded-2xl space-y-3" style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.05))", border:"1px solid rgba(99,102,241,0.2)" }}>
          <p className="text-[12px] font-black text-zinc-200 flex items-center gap-2"><Users size={12} className="text-indigo-400"/>Invite to project</p>
          <input value={emails} onChange={e=>setEmails(e.target.value)} placeholder="email1@co.com, email2@co.com" className="w-full px-3.5 py-2.5 rounded-xl text-[13px] text-zinc-200 placeholder-zinc-700 outline-none transition-all" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",fontFamily:FONT}}/>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select value={role} onChange={e=>setRole(e.target.value)} className="w-full appearance-none px-3.5 py-2.5 pr-8 rounded-xl text-[13px] text-zinc-200 outline-none cursor-pointer" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",fontFamily:FONT}}>
                {["EDITOR","VIEWER","COMMENTER","ADMIN"].map(r=><option key={r} style={{background:"#1a1a2e"}}>{r}</option>)}
              </select>
            </div>
            <button onClick={handleInvite} disabled={invLoad} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-black text-white disabled:opacity-60 transition-all" style={{background:"linear-gradient(135deg,#6366f1,#7c3aed)"}}>
              {invLoad?<Loader2 size={12} className="animate-spin"/>:<Send size={12}/>} Send
            </button>
            <button onClick={()=>setShowInvite(false)} className="px-3 py-2 rounded-xl text-[12px] text-zinc-500 hover:text-zinc-200 transition-colors" style={{border:"1px solid rgba(255,255,255,0.07)"}}>Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {members.map((m,i)=>{
          const rc = ROLE_COLOR[m.role]||"#71717a";
          return (
            <div key={m.id} className="flex items-center gap-3.5 p-3.5 rounded-2xl transition-all hover:bg-white/[0.02]" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)" }}>
              <Avatar name={m.fullname||m.emailuser} src={m.profile} size={38} color={colors[i%colors.length]}/>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-zinc-200">{m.fullname||"—"}</p>
                <p className="text-[11.5px] text-zinc-600">{m.emailuser}</p>
              </div>
              <span className="px-2.5 py-1 rounded-xl text-[10.5px] font-black" style={{ color:rc, background:`${rc}15`, border:`1px solid ${rc}28` }}>{m.role}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── CHAT VIEW ───────────────────────────────────────────────────────────── */
function ChatView({ projectId, members, onTaskCreated }) {
  const { user }  = useAuth();
  const socket    = useSocket();
  const [messages,   setMessages]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [input,      setInput]      = useState("");
  const [typing,     setTyping]     = useState([]);
  const [mentionQ,   setMentionQ]   = useState(null);
  const [mentionSug, setMentionSug] = useState([]);
  const [mentionIdx, setMentionIdx] = useState(0);
  const [sumText,    setSumText]    = useState("");
  const [sumLoad,    setSumLoad]    = useState(false);
  const [sumShow,    setSumShow]    = useState(false);
  const [showExt,    setShowExt]    = useState(false);
  const [extInput,   setExtInput]   = useState("");
  const [extracted,  setExtracted]  = useState([]);
  const [extLoad,    setExtLoad]    = useState(false);
  const [creating,   setCreating]   = useState(false);
  const bottomRef   = useRef(null);
  const inputRef    = useRef(null);
  const typingTimer = useRef(null);

  useEffect(()=>{
    api.chat.getHistory(projectId).then(d=>setMessages(d.messages||[])).catch(console.error).finally(()=>setLoading(false));
    socket?.joinProject(projectId);
    return()=>socket?.leaveProject(projectId);
  },[projectId]);

  useEffect(()=>{
    const o1=socket?.on("receive_message",msg=>{
      setMessages(p=>{
        const hasOpt=p.some(m=>m._optimistic&&m.senderId===msg.senderId&&m.content===msg.message);
        if(hasOpt) return p.map(m=>m._optimistic&&m.senderId===msg.senderId&&m.content===msg.message?{...msg,content:msg.message||msg.content}:m);
        return [...p,{...msg,content:msg.message||msg.content}];
      });
    });
    const o2=socket?.on("user_typing",({userId,fullname})=>{if(userId!==user?.id)setTyping(p=>[...new Set([...p,fullname])]);});
    const o3=socket?.on("user_stopped_typing",({userId})=>{if(userId!==user?.id)setTyping(p=>p.filter((_,i)=>i>0));});
    return()=>{o1?.();o2?.();o3?.();};
  },[socket,user?.id]);

  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);

  const handleInput = v => {
    setInput(v);
    socket?.typingStart(projectId);
    clearTimeout(typingTimer.current);
    typingTimer.current=setTimeout(()=>socket?.typingStop(projectId),1500);
    const cursor=inputRef.current?.selectionStart??v.length;
    const atMatch=v.slice(0,cursor).match(/@(\w*)$/);
    if (atMatch) {
      const q=atMatch[1].toLowerCase();
      setMentionQ(q); setMentionIdx(0);
      setMentionSug(members.filter(m=>(m.fullname||"").toLowerCase().includes(q)||(m.emailuser||"").toLowerCase().split("@")[0].includes(q)).slice(0,5));
    } else { setMentionQ(null); setMentionSug([]); }
  };

  const insertMention = m => {
    const name=m.fullname||m.emailuser.split("@")[0];
    const cursor=inputRef.current?.selectionStart??input.length;
    const before=input.slice(0,cursor).replace(/@\w*$/,`@${name} `);
    setInput(before+input.slice(cursor));
    setMentionQ(null); setMentionSug([]);
    setTimeout(()=>inputRef.current?.focus(),0);
  };

  const handleKeyDown = e => {
    if (mentionSug.length) {
      if (e.key==="ArrowDown"){e.preventDefault();setMentionIdx(i=>(i+1)%mentionSug.length);return;}
      if (e.key==="ArrowUp"){e.preventDefault();setMentionIdx(i=>(i-1+mentionSug.length)%mentionSug.length);return;}
      if (e.key==="Enter"||e.key==="Tab"){e.preventDefault();insertMention(mentionSug[mentionIdx]);return;}
      if (e.key==="Escape"){setMentionQ(null);setMentionSug([]);return;}
    }
    if (e.key==="Enter"&&!e.shiftKey) send();
  };

  const send = () => {
    const text=input.trim(); if(!text) return;
    setMessages(p=>[...p,{id:`tmp-${Date.now()}`,content:text,senderId:user?.id,sender:{fullname:user?.fullname,profile:user?.profile},createdAt:new Date().toISOString(),_optimistic:true}]);
    setInput(""); socket?.typingStop(projectId); socket?.sendMessage(projectId,text);
  };

  const handleSummarize = async () => {
    if (!messages.length){showToast("No messages yet","warning");return;}
    setSumShow(true); setSumLoad(true);
    try{setSumText(await summarizeChat(messages));}
    catch(e){setSumText("Could not summarize: "+e.message);}
    finally{setSumLoad(false);}
  };

  const handleExtract = async () => {
    if (!extInput.trim()){showToast("Enter some text first","warning");return;}
    setExtLoad(true); setExtracted([]);
    try{
      const tasks=await extractTasksFromText(extInput.trim());
      setExtracted(tasks);
      if(!tasks.length) showToast("No tasks found","warning");
    }catch(e){showToast(e.message||"AI extraction failed","error");}
    finally{setExtLoad(false);}
  };

  const handleCreateExtracted = async () => {
    if (!extracted.length||!members.length) return;
    setCreating(true);
    try{
      await api.tasks.add(user.id,projectId,extracted.map(t=>({title:t.title,description:"",status:"Todo",priority:t.priority||"Medium",assigneEmail:members[0]?.emailuser||"",startDate:new Date().toISOString(),dueDate:new Date(Date.now()+7*864e5).toISOString()})));
      showToast(`${extracted.length} task(s) created!`);
      setShowExt(false); setExtInput(""); setExtracted([]); onTaskCreated?.();
    }catch(e){showToast(e.message,"error");}
    finally{setCreating(false);}
  };

  return (
    <div className="flex flex-col h-full" style={{minHeight:0,fontFamily:FONT}}>

      {/* ── header ── */}
      <div className="flex items-center justify-between px-5 py-3.5 shrink-0" style={{borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(0,0,0,0.15)"}}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.12))",border:"1px solid rgba(99,102,241,0.25)"}}>
            <MessageSquare size={14} className="text-indigo-300" strokeWidth={2}/>
          </div>
          <div>
            <h2 className="text-[14px] font-black text-white leading-none">Team Chat</h2>
            <p className="text-[10.5px] text-zinc-600 mt-0.5">Real-time project conversation</p>
          </div>
          {messages.length>0&&(
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{color:"#a5b4fc",background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)"}}>
              {messages.length} messages
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={()=>{setShowExt(v=>!v);setSumShow(false);}}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all"
            style={{background:showExt?"rgba(139,92,246,0.15)":"rgba(255,255,255,0.03)",border:`1px solid ${showExt?"rgba(139,92,246,0.35)":"rgba(255,255,255,0.08)"}`,color:showExt?"#c4b5fd":"#71717a"}}>
            <Zap size={11}/> Tasks from text
          </button>
          <AiBtn onClick={()=>{handleSummarize();setShowExt(false);}} loading={sumLoad} label="Summarize" small/>
        </div>
      </div>

      {/* ── AI task extractor ── */}
      {showExt&&(
        <div className="mx-4 mt-3 mb-1 shrink-0 rounded-2xl overflow-hidden" style={{background:"linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.05))",border:"1px solid rgba(139,92,246,0.22)"}}>
          <div className="flex items-center gap-2 px-4 py-2.5" style={{borderBottom:"1px solid rgba(139,92,246,0.12)",background:"rgba(139,92,246,0.05)"}}>
            <Sparkles size={11} className="text-violet-400"/>
            <span className="text-[11px] font-black uppercase tracking-widest text-violet-300">AI Task Creator</span>
            <span className="text-[10px] text-zinc-600 ml-1">— describe work in plain English</span>
            <button onClick={()=>setShowExt(false)} className="ml-auto w-5 h-5 rounded-md flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-all"><X size={11}/></button>
          </div>
          <div className="p-3.5 space-y-3">
            <textarea value={extInput} onChange={e=>setExtInput(e.target.value)}
              placeholder="e.g. Redesign the dashboard UI and fix the payment bug in checkout"
              rows={2} className="w-full rounded-xl px-3.5 py-2.5 text-[12.5px] text-zinc-200 placeholder-zinc-700 outline-none resize-none transition-all"
              style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",fontFamily:FONT}}/>
            <div className="flex items-center gap-2">
              <button onClick={handleExtract} disabled={extLoad}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black text-white disabled:opacity-60 transition-all"
                style={{background:"linear-gradient(135deg,#7c3aed,#6366f1)"}}>
                {extLoad?<Loader2 size={10} className="animate-spin"/>:<Sparkles size={10}/>} Extract
              </button>
              {extracted.length>0&&(
                <button onClick={handleCreateExtracted} disabled={creating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black text-white disabled:opacity-60 transition-all"
                  style={{background:"linear-gradient(135deg,#059669,#047857)"}}>
                  {creating?<Loader2 size={10} className="animate-spin"/>:<Plus size={10}/>}
                  Create {extracted.length} task{extracted.length!==1?"s":""}
                </button>
              )}
            </div>
            {extracted.length>0&&(
              <div className="space-y-1.5 pt-1 border-t border-white/5">
                {extracted.map((t,i)=>(
                  <div key={i} className="flex items-center gap-2.5 py-1 px-1">
                    <PriorityDot p={t.priority}/>
                    <span className="text-[12px] text-zinc-300 flex-1">{t.title}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{color:PCOL[t.priority]||"#71717a",background:`${PCOL[t.priority]||"#71717a"}15`}}>{t.priority}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── AI summary panel ── */}
      {sumShow&&<div className="mx-4 mt-3 shrink-0"><AiPanel title="Chat Summary" content={sumText} loading={sumLoad} onClose={()=>setSumShow(false)}/></div>}

      {/* ── messages area ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" style={{scrollbarWidth:"none"}}>
        {loading ? (
          <div className="flex justify-center pt-12"><Loader2 size={18} className="animate-spin text-zinc-600"/></div>
        ) : messages.length===0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 pb-16">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{background:"rgba(99,102,241,0.06)",border:"1px solid rgba(99,102,241,0.12)"}}>
              <MessageSquare size={22} className="text-indigo-600" strokeWidth={1.5}/>
            </div>
            <div className="text-center">
              <p className="text-[14px] font-bold text-zinc-500">No messages yet</p>
              <p className="text-[12px] text-zinc-700 mt-1">Start the conversation below</p>
            </div>
          </div>
        ) : (
          messages.map((msg, msgIdx)=>{
            const isMe   = msg.senderId===user?.id||msg.sender_id===user?.id;
            const name   = msg.sender?.fullname||msg.senderName||"?";
            const prevMsg= messages[msgIdx-1];
            const isSameAuthor = prevMsg&&(prevMsg.senderId===msg.senderId||prevMsg.sender_id===msg.sender_id);
            const showAvatar   = !isSameAuthor;
            const msgContent   = msg.content||msg.message||"";

            return (
              <div key={msg.id} className={`flex items-end gap-2 ${isMe?"flex-row-reverse":"flex-row"} ${isSameAuthor?"mt-0.5":"mt-4"}`}>
                {/* avatar — hidden when same consecutive author, but space reserved */}
                <div className="shrink-0 w-7" style={{visibility:showAvatar?"visible":"hidden"}}>
                  <Avatar name={name} src={msg.sender?.profile} size={28} color={isMe?"#6366f1":"#f59e0b"}/>
                </div>

                <div className={`flex flex-col gap-0.5 max-w-[68%] ${isMe?"items-end":"items-start"}`}>
                  {/* sender name — only on first of a group */}
                  {!isMe&&showAvatar&&(
                    <span className="text-[10.5px] font-semibold text-zinc-500 px-1 mb-0.5">{name}</span>
                  )}

                  {/* bubble */}
                  <div
                    className={`px-3.5 py-2.5 text-[13px] leading-relaxed break-words ${
                      isMe
                        ? "rounded-2xl rounded-br-md text-white"
                        : "rounded-2xl rounded-bl-md text-zinc-200"
                    }`}
                    style={{
                      background: isMe
                        ? "linear-gradient(135deg,#5b5bd6,#7c3aed)"
                        : "rgba(255,255,255,0.06)",
                      border: isMe ? "none" : "1px solid rgba(255,255,255,0.08)",
                      boxShadow: isMe ? "0 2px 12px rgba(99,102,241,0.25)" : "none",
                    }}
                  >
                    {msgContent.split(/(@\w+)/g).map((part,pi)=>
                      part.startsWith("@")
                        ? <span key={pi} className="font-bold rounded-sm px-0.5"
                            style={{color:isMe?"rgba(255,255,255,0.95)":"#a5b4fc",background:isMe?"rgba(255,255,255,0.15)":"rgba(99,102,241,0.2)"}}>
                            {part}
                          </span>
                        : part
                    )}
                  </div>

                  {/* timestamp — only last of a group */}
                  {(!messages[msgIdx+1]||(messages[msgIdx+1].senderId!==msg.senderId&&messages[msgIdx+1].sender_id!==msg.sender_id))&&(
                    <span className="text-[10px] text-zinc-700 px-1">{timeAgo(msg.createdAt)}</span>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* typing indicator */}
        {typing.length>0&&(
          <div className="flex items-end gap-2 mt-4">
            <div className="w-7 shrink-0"/>
            <div className="flex items-center gap-2">
              <div className="flex gap-1 px-3.5 py-2.5 rounded-2xl rounded-bl-md" style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.08)"}}>
                {[0,160,320].map(d=>(
                  <span key={d} className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" style={{animationDelay:`${d}ms`}}/>
                ))}
              </div>
              <span className="text-[10.5px] text-zinc-600 italic">{typing.join(", ")} typing…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* ── input area ── */}
      <div className="px-4 py-3 shrink-0" style={{borderTop:"1px solid rgba(255,255,255,0.06)",background:"rgba(0,0,0,0.1)"}}>
        {/* @mention dropdown */}
        {mentionQ!==null&&mentionSug.length>0&&(
          <div className="mb-2 rounded-2xl overflow-hidden shadow-2xl" style={{background:"#0f0f18",border:"1px solid rgba(255,255,255,0.1)",boxShadow:"0 -8px 32px rgba(0,0,0,0.5)"}}>
            {mentionSug.map((m,i)=>(
              <button key={m.emailuser} onClick={()=>insertMention(m)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-all"
                style={{background:i===mentionIdx?"rgba(99,102,241,0.12)":"transparent",borderLeft:`2px solid ${i===mentionIdx?"#6366f1":"transparent"}`}}>
                <Avatar name={m.fullname||m.emailuser} size={24} color="#6366f1"/>
                <div>
                  <p className="text-[12px] font-semibold text-zinc-200">{m.fullname||m.emailuser.split("@")[0]}</p>
                  <p className="text-[10.5px] text-zinc-600">{m.emailuser}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* composer */}
        <div className="flex items-end gap-2 p-2 rounded-2xl" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)"}}>
          <input
            ref={inputRef}
            value={input}
            onChange={e=>handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message the team… type @ to mention someone"
            className="flex-1 bg-transparent px-2 py-1.5 text-[13px] text-zinc-200 placeholder-zinc-700 outline-none leading-relaxed"
            style={{fontFamily:FONT}}
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white disabled:opacity-30 transition-all hover:scale-105 active:scale-95 shrink-0"
            style={{background:input.trim()?"linear-gradient(135deg,#5b5bd6,#7c3aed)":"rgba(255,255,255,0.06)",boxShadow:input.trim()?"0 4px 12px rgba(99,102,241,0.4)":"none"}}>
            <Send size={13}/>
          </button>
        </div>
        <p className="text-[10px] text-zinc-800 mt-1.5 px-1">Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}

/* ─── FILES VIEW ──────────────────────────────────────────────────────────── */
function FilesView({ projectId, tasks }) {
  const { user } = useAuth();
  const [files,     setFiles]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUp,    setShowUp]    = useState(false);
  const [taskId,    setTaskId]    = useState("");
  const fileRef = useRef(null);

  const load = useCallback(()=>{
    api.files.getByProject(projectId).then(d=>setFiles(d.files||[])).catch(console.error).finally(()=>setLoading(false));
  },[projectId]);
  useEffect(()=>{load();},[load]);

  const handleUpload = async e => {
    const file=e.target.files?.[0];
    if(!file||!taskId){showToast("Select a task first","warning");return;}
    setUploading(true);
    const fd=new FormData(); fd.append("file",file);
    try{await api.files.upload(user.id,projectId,taskId,fd);showToast("File uploaded");setShowUp(false);load();}
    catch(err){showToast(err.message,"error");}
    finally{setUploading(false);}
  };

  const deleteFile = async id=>{
    if(!confirm("Delete this file?")) return;
    try{await api.files.delete(id,user.id);showToast("Deleted");load();}
    catch(err){showToast(err.message,"error");}
  };

  const extColor=t=>t?.includes("pdf")?"#ef4444":t?.includes("image")?"#6366f1":"#f59e0b";
  const ext=name=>(name||"").split(".").pop()?.toUpperCase().slice(0,4)||"FILE";
  const fmtSize=b=>b>1e6?`${(b/1e6).toFixed(1)} MB`:b?`${(b/1e3).toFixed(0)} KB`:"";

  return (
    <div className="p-6">
      <SectionHeader title="Files" count={files.length} action={
        <button onClick={()=>setShowUp(v=>!v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-black text-zinc-300 transition-all" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
          <Upload size={12}/> Upload
        </button>
      }/>

      {showUp&&(
        <div className="mb-5 p-4 rounded-2xl space-y-3" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.08)"}}>
          <div className="relative">
            <select value={taskId} onChange={e=>setTaskId(e.target.value)} className="w-full appearance-none px-3.5 py-2.5 pr-8 rounded-xl text-[13px] text-zinc-200 outline-none" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",fontFamily:FONT}}>
              <option value="" style={{background:"#1a1a2e"}}>Select task to attach to…</option>
              {tasks.map(t=><option key={t.id} value={t.id} style={{background:"#1a1a2e"}}>{t.title}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <input ref={fileRef} type="file" className="hidden" onChange={handleUpload}/>
            <button onClick={()=>fileRef.current?.click()} disabled={uploading||!taskId} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-black text-white disabled:opacity-50" style={{background:"linear-gradient(135deg,#6366f1,#7c3aed)"}}>
              {uploading?<Loader2 size={12} className="animate-spin"/>:<Upload size={12}/>} {uploading?"Uploading…":"Choose File"}
            </button>
            <button onClick={()=>setShowUp(false)} className="px-3 py-2 rounded-xl text-[12px] text-zinc-500 hover:text-zinc-200 transition-colors" style={{border:"1px solid rgba(255,255,255,0.07)"}}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? <div className="flex justify-center py-16"><Loader2 size={20} className="animate-spin text-zinc-600"/></div>
        : files.length===0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
              <Paperclip size={18} className="text-zinc-700"/>
            </div>
            <p className="text-[13px] text-zinc-600 font-medium">No files yet</p>
            <button onClick={()=>setShowUp(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold text-zinc-300 transition-all" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)"}}>
              <Upload size={11}/> Upload first file
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map(f=>{
              const c=extColor(f.fileType);
              return (
                <div key={f.id} className="group rounded-2xl p-4 transition-all hover:-translate-y-0.5" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",boxShadow:"0 2px 12px rgba(0,0,0,0.3)"}}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black shrink-0" style={{background:`${c}18`,border:`1px solid ${c}28`,color:c}}>{ext(f.fileName||f.fileUrl)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-zinc-200 truncate">{f.fileName||"File"}</p>
                      <p className="text-[11px] text-zinc-600 mt-0.5">{fmtSize(f.fileSize)}</p>
                    </div>
                  </div>
                  <div className="text-[11px] text-zinc-700 space-y-1 mb-3">
                    <p>Task: <span className="text-zinc-500">{f.taskName||"—"}</span></p>
                    <p>By: <span className="text-zinc-500">{f.uploaderName||"—"}</span> · {formatDate(f.uploadedAt)}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity pt-2.5" style={{borderTop:"1px solid rgba(255,255,255,0.05)"}}>
                    <a href={f.fileUrl} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-semibold text-zinc-400 hover:text-white transition-colors" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
                      Download
                    </a>
                    <button onClick={()=>deleteFile(f.id)} className="w-8 h-8 rounded-xl flex items-center justify-center text-zinc-700 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 size={12}/>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      }
    </div>
  );
}

/* ─── ACTIVITY VIEW ───────────────────────────────────────────────────────── */
function ActivityView({ projectId }) {
  const [logs,    setLogs]    = useState([]);
  const [loading, setLoading] = useState(true);
  const [standup, setStandup] = useState("");
  const [stdLoad, setStdLoad] = useState(false);
  const [stdShow, setStdShow] = useState(false);
  const colors = ["#6366f1","#f59e0b","#10b981","#ec4899","#3b82f6","#8b5cf6"];

  useEffect(()=>{ api.activity.getByProject(projectId).then(d=>setLogs(d.logs||[])).catch(console.error).finally(()=>setLoading(false)); },[projectId]);

  const handleStandup = async () => {
    if (!logs.length){showToast("No activity logs yet","warning");return;}
    setStdShow(true); setStdLoad(true);
    try{setStandup(await generateStandupReport(logs));}
    catch(e){setStandup("Could not generate: "+e.message);}
    finally{setStdLoad(false);}
  };

  if (loading) return <div className="flex justify-center py-24"><Loader2 size={20} className="animate-spin text-zinc-600"/></div>;

  return (
    <div className="p-6 max-w-2xl">
      <SectionHeader title="Activity" count={logs.length} action={<AiBtn onClick={handleStandup} loading={stdLoad} label="Generate Standup"/>}/>
      {stdShow&&<AiPanel title="Daily Standup" content={standup} loading={stdLoad} onClose={()=>setStdShow(false)}/>}
      {logs.length===0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 opacity-50">
          <Activity size={28} className="text-zinc-700"/>
          <p className="text-[13px] text-zinc-600 font-medium">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((a,i)=>(
            <div key={a.id} className="flex items-start gap-3.5 p-3.5 rounded-2xl transition-all" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.06)"}}>
              <div className="relative shrink-0">
                <Avatar name={a.user?.fullname||"?"} size={28} color={colors[i%colors.length]}/>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full" style={{background:colors[i%colors.length]+"30",border:`1px solid ${colors[i%colors.length]}60`}}/>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] text-zinc-300 leading-snug">
                  <span className="font-bold text-zinc-100">{a.user?.fullname}</span>{" "}{actionLabel(a.action,a.meta)}
                </p>
                <p className="text-[11px] text-zinc-600 mt-0.5">{timeAgo(a.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── GANTT VIEW ──────────────────────────────────────────────────────────── */
function GanttView({ tasks, members, projectId, onTaskUpdated }) {
  const { user } = useAuth();
  const [editTask,   setEditTask]   = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [hovered,    setHovered]    = useState(null);
  const [viewMode,   setViewMode]   = useState("month");

  const valid = tasks.filter(t=>t.startDate&&t.dueDate);
  const allDates = valid.flatMap(t=>[new Date(t.startDate),new Date(t.dueDate)]);
  const minD = allDates.length?new Date(Math.min(...allDates)):new Date();
  const maxD = allDates.length?new Date(Math.max(...allDates)):new Date(Date.now()+30*864e5);
  const ws = new Date(minD); ws.setDate(ws.getDate()-4);
  const we = new Date(maxD); we.setDate(we.getDate()+4);
  const totalDays = Math.max(1,Math.ceil((we-ws)/864e5));

  // week=48px per day gives enough breathing room; month=32px
  const DAY_W  = viewMode==="week" ? 48 : 32;
  const ROW_H  = 52;
  const HDR_H1 = 28; // month row
  const HDR_H2 = 28; // day row
  const LBL_W  = 240;
  const today  = dayStart(new Date());

  const days = Array.from({length:totalDays},(_,i)=>{ const d=new Date(ws); d.setDate(d.getDate()+i); return d; });
  const todayLeft = Math.floor((today-dayStart(ws))/864e5)*DAY_W;

  // month groups for header
  const months = [];
  let curM=null;
  days.forEach((d,i)=>{
    const lbl=d.toLocaleDateString("en-US",{month:"long",year:"numeric"});
    if(lbl!==curM){months.push({label:lbl,start:i,count:1});curM=lbl;}
    else months[months.length-1].count++;
  });

  const barColor = t => {
    if (t.mark_complete)              return { bg:"#10b981", glow:"rgba(16,185,129,0.4)" };
    if (isOverdue(t))                 return { bg:"#ef4444", glow:"rgba(239,68,68,0.4)" };
    if (isDueSoon(t))                 return { bg:"#f59e0b", glow:"rgba(245,158,11,0.4)" };
    if (t.status==="In Review")       return { bg:"#8b5cf6", glow:"rgba(139,92,246,0.4)" };
    if (t.status==="In Progress")     return { bg:"#3b82f6", glow:"rgba(59,130,246,0.4)" };
    return { bg:"#6366f1", glow:"rgba(99,102,241,0.4)" };
  };

  const taskLeft  = t => Math.max(0, Math.floor((dayStart(t.startDate)-dayStart(ws))/864e5)) * DAY_W;
  const taskWidth = t => Math.max(DAY_W*1.5, (Math.floor((dayStart(t.dueDate)-dayStart(t.startDate))/864e5)+1)*DAY_W);

  const LEGEND = [
    {color:"#6366f1",label:"Todo"},
    {color:"#3b82f6",label:"In Progress"},
    {color:"#8b5cf6",label:"In Review"},
    {color:"#10b981",label:"Done"},
    {color:"#ef4444",label:"Overdue"},
    {color:"#f59e0b",label:"Due soon"},
  ];

  if (!valid.length) return (
    <div className="flex flex-col items-center justify-center py-28 gap-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{background:"rgba(99,102,241,0.08)",border:"1px solid rgba(99,102,241,0.15)"}}>
        <GitBranch size={22} className="text-indigo-500" strokeWidth={1.5}/>
      </div>
      <div className="text-center">
        <p className="text-[14px] font-bold text-zinc-400">No tasks with dates yet</p>
        <p className="text-[12px] text-zinc-700 mt-1">Add start & due dates to tasks to visualize the timeline</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full" style={{fontFamily:FONT}}>

      {/* ── toolbar ── */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{borderBottom:"1px solid rgba(255,255,255,0.06)",background:"rgba(0,0,0,0.15)"}}>
        <div className="flex items-center gap-3">
          <h2 className="text-[14px] font-black text-white">Timeline</h2>
          <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{color:"#a5b4fc",background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.2)"}}>{valid.length} tasks</span>
        </div>
        <div className="flex items-center gap-4">
          {/* legend */}
          <div className="hidden lg:flex items-center gap-3">
            {LEGEND.map(l=>(
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-[3px]" style={{background:l.color}}/>
                <span className="text-[10.5px] text-zinc-500">{l.label}</span>
              </div>
            ))}
          </div>
          {/* view toggle */}
          <div className="flex items-center rounded-lg p-0.5 gap-0.5" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
            {[{v:"week",label:"Week"},{v:"month",label:"Month"}].map(({v,label})=>(
              <button key={v} onClick={()=>setViewMode(v)}
                className="px-3 py-1 rounded-md text-[11px] font-bold transition-all"
                style={{background:viewMode===v?"rgba(99,102,241,0.2)":"transparent",color:viewMode===v?"#a5b4fc":"#52525b",border:viewMode===v?"1px solid rgba(99,102,241,0.3)":"1px solid transparent"}}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── scrollable grid ── */}
      <div className="flex-1 overflow-auto" style={{scrollbarWidth:"thin",scrollbarColor:"rgba(255,255,255,0.08) transparent"}}>
        <div style={{minWidth:LBL_W+totalDays*DAY_W}}>

          {/* ── HEADER ── */}
          <div className="flex sticky top-0 z-20" style={{background:"#0b0b12"}}>
            {/* task label col header */}
            <div className="shrink-0 flex items-end px-4 pb-2" style={{width:LBL_W,height:HDR_H1+HDR_H2,borderRight:"1px solid rgba(255,255,255,0.06)",borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-700">Task</span>
            </div>

            {/* date columns */}
            <div className="flex-1" style={{width:totalDays*DAY_W}}>
              {/* month row */}
              <div className="flex" style={{height:HDR_H1,borderBottom:"1px solid rgba(255,255,255,0.05)"}}>
                {months.map((mg,i)=>(
                  <div key={i} className="flex items-center px-3 overflow-hidden shrink-0"
                    style={{width:mg.count*DAY_W,borderRight:"1px solid rgba(255,255,255,0.05)",background:i%2===0?"rgba(255,255,255,0.01)":"transparent"}}>
                    <span className="text-[11px] font-black text-zinc-400 whitespace-nowrap">{mg.label}</span>
                  </div>
                ))}
              </div>
              {/* day row */}
              <div className="flex" style={{height:HDR_H2,borderBottom:"1px solid rgba(255,255,255,0.08)"}}>
                {days.map((d,i)=>{
                  const isToday = d.getTime()===today.getTime();
                  const isWknd  = d.getDay()===0||d.getDay()===6;
                  return (
                    <div key={i} className="flex flex-col items-center justify-center shrink-0 relative"
                      style={{width:DAY_W,borderRight:"1px solid rgba(255,255,255,0.03)",background:isToday?"rgba(99,102,241,0.12)":isWknd?"rgba(255,255,255,0.01)":"transparent"}}>
                      {isToday && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-indigo-400"/>}
                      <span className={`text-[11px] font-bold leading-none ${isToday?"text-indigo-300":isWknd?"text-zinc-700":"text-zinc-500"}`}>
                        {d.getDate()}
                      </span>
                      {viewMode==="week"&&(
                        <span className="text-[9px] text-zinc-700 mt-0.5 leading-none">
                          {d.toLocaleDateString("en-US",{weekday:"short"}).slice(0,2)}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── TASK ROWS ── */}
          {valid.map((task, idx)=>{
            const {bg:color, glow} = barColor(task);
            const left         = taskLeft(task);
            const width        = taskWidth(task);
            const completedPct = task.mark_complete ? 100 : 0;
            const assigneeInit = (task.assignee_email||"?")[0].toUpperCase();
            const isHov        = hovered===task.id;
            const isEven       = idx%2===0;

            return (
              <div key={task.id} className="flex group transition-colors"
                style={{height:ROW_H,borderBottom:"1px solid rgba(255,255,255,0.04)",background:isEven?"rgba(255,255,255,0.008)":"transparent"}}>

                {/* label */}
                <div className="shrink-0 flex items-center gap-2.5 px-4"
                  style={{width:LBL_W,borderRight:"1px solid rgba(255,255,255,0.05)"}}>
                  {/* status dot */}
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:color,boxShadow:`0 0 6px ${glow}`}}/>
                  <span onClick={()=>setDetailTask(task)}
                    className={`text-[12.5px] truncate cursor-pointer hover:text-white transition-colors flex-1 font-medium ${task.mark_complete?"line-through text-zinc-600":"text-zinc-300"}`}>
                    {task.title}
                  </span>
                  <button onClick={e=>{e.stopPropagation();setEditTask(task);}}
                    className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-200 hover:bg-white/5 shrink-0">
                    <Edit3 size={11}/>
                  </button>
                </div>

                {/* bar area */}
                <div className="relative overflow-hidden" style={{width:totalDays*DAY_W,height:ROW_H}}>

                  {/* vertical grid lines per day */}
                  {days.map((d,i)=>{
                    const isT = d.getTime()===today.getTime();
                    const isW = d.getDay()===0||d.getDay()===6;
                    if(!isT&&!isW) return null;
                    return (
                      <div key={i} className="absolute top-0 bottom-0"
                        style={{left:i*DAY_W,width:DAY_W,background:isT?"rgba(99,102,241,0.06)":"rgba(255,255,255,0.012)"}}/>
                    );
                  })}

                  {/* today line — sharp indigo */}
                  {todayLeft>=0&&todayLeft<=totalDays*DAY_W&&(
                    <div className="absolute top-0 bottom-0 z-10 pointer-events-none"
                      style={{left:todayLeft+DAY_W/2-0.5,width:1,background:"linear-gradient(180deg,rgba(99,102,241,0.8),rgba(99,102,241,0.2))"}}>
                      <div className="w-2 h-2 rounded-full absolute -top-1 -left-[3.5px]" style={{background:"#6366f1",boxShadow:"0 0 6px rgba(99,102,241,0.8)"}}/>
                    </div>
                  )}

                  {/* ── task bar ── */}
                  <div
                    onClick={()=>setDetailTask(task)}
                    onMouseEnter={()=>setHovered(task.id)}
                    onMouseLeave={()=>setHovered(null)}
                    className="absolute rounded-lg cursor-pointer transition-all"
                    style={{
                      left: left+2,
                      width: width-4,
                      top: "50%",
                      transform: "translateY(-50%)",
                      height: 26,
                      background: `linear-gradient(135deg,${color},${color}cc)`,
                      boxShadow: isHov ? `0 4px 16px ${glow}, 0 0 0 2px ${color}60` : `0 2px 8px ${glow}`,
                      opacity: task.mark_complete ? 0.7 : 1,
                      transition: "box-shadow 0.15s ease, transform 0.1s ease",
                      transform: isHov ? "translateY(calc(-50% - 1px))" : "translateY(-50%)",
                    }}
                  >
                    {/* glass highlight strip */}
                    <div className="absolute top-0 left-0 right-0 h-px rounded-t-lg" style={{background:"rgba(255,255,255,0.3)"}}/>

                    {/* completion fill */}
                    {completedPct>0&&(
                      <div className="absolute inset-0 rounded-lg" style={{width:`${completedPct}%`,background:"rgba(0,0,0,0.25)"}}/>
                    )}

                    {/* label inside bar */}
                    {(width-4)>56&&(
                      <div className="absolute inset-0 flex items-center px-2.5 gap-1.5 overflow-hidden">
                        <span className="text-white/90 font-black text-[10px] shrink-0 w-4 h-4 rounded-full flex items-center justify-center" style={{background:"rgba(0,0,0,0.2)"}}>
                          {assigneeInit}
                        </span>
                        <span className="text-white/90 text-[11px] font-semibold truncate">{task.title}</span>
                      </div>
                    )}
                  </div>

                  {/* ── tooltip ── */}
                  {isHov&&(
                    <div className="absolute z-30 pointer-events-none"
                      style={{
                        left: Math.min(left+width/2-80, totalDays*DAY_W-180),
                        top: "calc(50% + 20px)",
                        minWidth: 172,
                      }}>
                      <div className="rounded-xl px-3.5 py-2.5 shadow-2xl" style={{background:"#111119",border:"1px solid rgba(255,255,255,0.12)",boxShadow:"0 16px 40px rgba(0,0,0,0.8)"}}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-2 h-2 rounded-full" style={{background:color}}/>
                          <p className="text-[12px] font-bold text-zinc-100 truncate">{task.title}</p>
                        </div>
                        <p className="text-[10.5px] text-zinc-500 mb-1">{formatDate(task.startDate)} → {formatDate(task.dueDate)}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{color:PCOL[task.priority]||"#71717a",background:`${PCOL[task.priority]||"#71717a"}18`}}>{task.priority}</span>
                          <span className="text-[10px] text-zinc-600">{task.status}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* bottom padding row */}
          <div style={{height:24}}/>
        </div>
      </div>

      {editTask&&<TaskModal open={!!editTask} onClose={()=>setEditTask(null)} projectId={projectId} task={editTask} members={members} onSaved={()=>{setEditTask(null);onTaskUpdated?.();}}/>}
      <TaskDetailModal open={!!detailTask} task={detailTask} projectId={projectId} members={members} onClose={()=>setDetailTask(null)} onSaved={()=>{setDetailTask(null);onTaskUpdated?.();}} onEdit={t=>setEditTask(t)}/>
    </div>
  );
}

/* ─── MEETING NOTES VIEW ──────────────────────────────────────────────────── */
function MeetingNotesView({ projectId, members, onTaskCreated }) {
  const { user } = useAuth();
  const [notes,      setNotes]      = useState("");
  const [extracting, setExtracting] = useState(false);
  const [extracted,  setExtracted]  = useState([]);
  const [creating,   setCreating]   = useState(false);
  const [created,    setCreated]    = useState(false);

  const handleExtract = async () => {
    if (!notes.trim()){showToast("Paste meeting notes first","warning");return;}
    setExtracting(true); setExtracted([]); setCreated(false);
    try {
      const tasks = await extractTasksFromMeetingNotes(notes.trim());
      if (!tasks.length){showToast("No actionable tasks found","warning");return;}
      setExtracted(tasks.map(t=>{
        const hint=(t.assigneeHint||"").toLowerCase();
        const m=hint?members.find(m=>(m.fullname||m.emailuser||"").toLowerCase().includes(hint)):null;
        return{...t,assigneEmail:m?.emailuser||user.email,_editing:false};
      }));
    } catch(e){showToast(e.message,"error");}
    finally{setExtracting(false);}
  };

  const update = (i,p) => setExtracted(e=>e.map((t,idx)=>idx===i?{...t,...p}:t));
  const remove = i     => setExtracted(e=>e.filter((_,idx)=>idx!==i));

  const handleCreate = async () => {
    setCreating(true);
    try {
      const today=new Date(); const due=new Date(today); due.setDate(due.getDate()+7);
      await api.tasks.add(user.id,projectId,extracted.map(t=>({title:t.title,description:t.notes||"",priority:t.priority||"Medium",status:"Todo",assigneEmail:t.assigneEmail||user.email,startDate:today.toISOString(),dueDate:due.toISOString()})));
      showToast(`Created ${extracted.length} tasks`,"success");
      setCreated(true); setExtracted([]); setNotes(""); onTaskCreated?.();
    }catch(e){showToast(e.message,"error");}
    finally{setCreating(false);}
  };

  const pCls = { High:"#ef4444",Medium:"#f59e0b",Low:"#10b981" };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{background:"linear-gradient(135deg,rgba(139,92,246,0.2),rgba(99,102,241,0.12))",border:"1px solid rgba(139,92,246,0.3)"}}>
          <FileText size={17} className="text-violet-300" strokeWidth={1.8}/>
        </div>
        <div>
          <h2 className="text-[15px] font-black text-white">Meeting Notes → Tasks</h2>
          <p className="text-[11px] text-zinc-600 mt-0.5">AI extracts actionable tasks, priorities, and assignees</p>
        </div>
      </div>

      <div className="relative mb-3">
        <textarea value={notes} onChange={e=>{setNotes(e.target.value);setCreated(false);}} placeholder={"Paste meeting notes here…\n\nExample:\n— John will redesign onboarding by Friday\n— Fix payment bug before launch\n— Sarah to write API docs"} rows={9} className="w-full rounded-2xl px-4 py-3.5 text-[13px] text-zinc-300 placeholder-zinc-700/60 outline-none resize-none font-mono leading-relaxed" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",fontFamily:"'JetBrains Mono',monospace"}}/>
        {notes&&<button onClick={()=>{setNotes("");setExtracted([]);setCreated(false);}} className="absolute top-3 right-3 w-6 h-6 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-400 hover:bg-white/5 transition-all"><X size={11}/></button>}
      </div>

      <button onClick={handleExtract} disabled={extracting||!notes.trim()} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-black text-white mb-6 disabled:opacity-50 transition-all hover:-translate-y-px" style={{background:"linear-gradient(135deg,#6366f1,#7c3aed)",boxShadow:"0 4px 20px rgba(99,102,241,0.4)"}}>
        {extracting?<><Loader2 size={14} className="animate-spin"/>Extracting…</>:<><Sparkles size={13}/>Extract Tasks with AI</>}
      </button>

      {created&&(
        <div className="flex items-center gap-2.5 p-3.5 mb-5 rounded-xl" style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)"}}>
          <CheckCircle2 size={14} className="text-emerald-400 shrink-0"/>
          <span className="text-[13px] text-emerald-400 font-semibold">Tasks created and added to the board!</span>
        </div>
      )}

      {extracted.length>0&&(
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-black text-zinc-300">Extracted Tasks</span>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full" style={{color:"#a5b4fc",background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.25)"}}>{extracted.length}</span>
            </div>
            <span className="text-[10.5px] text-zinc-700">Click title to edit</span>
          </div>
          <div className="space-y-2 mb-4">
            {extracted.map((task,i)=>{
              const c=pCls[task.priority]||"#f59e0b";
              return (
                <div key={i} className="group rounded-2xl p-3.5 transition-all hover:bg-white/[0.02]" style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)"}}>
                  <div className="flex items-start gap-3">
                    <span className="shrink-0 px-2 py-0.5 rounded-lg text-[10px] font-black mt-0.5" style={{color:c,background:`${c}15`,border:`1px solid ${c}28`}}>{task.priority}</span>
                    <div className="flex-1 min-w-0">
                      {task._editing
                        ? <input autoFocus value={task.title} onChange={e=>update(i,{title:e.target.value})} onBlur={()=>update(i,{_editing:false})} onKeyDown={e=>{if(e.key==="Enter"||e.key==="Escape")update(i,{_editing:false});}} className="w-full rounded-lg px-2.5 py-1 text-[13px] text-zinc-200 outline-none mb-1.5" style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(99,102,241,0.35)",fontFamily:FONT}}/>
                        : <p onClick={()=>update(i,{_editing:true})} className="text-[13px] text-zinc-200 font-semibold cursor-text hover:text-white mb-1.5 leading-snug">{task.title}</p>
                      }
                      {task.notes&&<p className="text-[11.5px] text-zinc-500 leading-relaxed mb-2">{task.notes}</p>}
                      <div className="flex items-center gap-2 flex-wrap">
                        <select value={task.priority} onChange={e=>update(i,{priority:e.target.value})} className="rounded-lg px-1.5 py-0.5 text-[11px] text-zinc-400 outline-none" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",fontFamily:FONT}}>
                          {["High","Medium","Low"].map(p=><option key={p} style={{background:"#1a1a2e"}}>{p}</option>)}
                        </select>
                        <select value={task.assigneEmail} onChange={e=>update(i,{assigneEmail:e.target.value})} className="rounded-lg px-1.5 py-0.5 text-[11px] text-zinc-400 outline-none max-w-[160px]" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",fontFamily:FONT}}>
                          {members.map(m=><option key={m.emailuser} value={m.emailuser} style={{background:"#1a1a2e"}}>{m.fullname||m.emailuser.split("@")[0]}</option>)}
                        </select>
                      </div>
                    </div>
                    <button onClick={()=>remove(i)} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-700 hover:text-red-400"><X size={13}/></button>
                  </div>
                </div>
              );
            })}
          </div>
          <button onClick={handleCreate} disabled={creating} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-black text-white disabled:opacity-60 transition-all hover:-translate-y-px" style={{background:"linear-gradient(135deg,#059669,#047857)",boxShadow:"0 4px 16px rgba(5,150,105,0.35)"}}>
            {creating?<><Loader2 size={14} className="animate-spin"/>Creating…</>:<><Check size={13}/>Create {extracted.length} Task{extracted.length!==1?"s":""}</>}
          </button>
        </div>
      )}

      {!extracted.length&&!extracting&&!created&&(
        <div className="flex flex-col items-center justify-center py-14 rounded-2xl gap-3" style={{border:"1.5px dashed rgba(255,255,255,0.06)"}}>
          <Sparkles size={22} className="text-zinc-700"/>
          <p className="text-[13px] text-zinc-600 font-medium">Paste meeting notes above</p>
          <p className="text-[11.5px] text-zinc-700">AI will identify tasks, priorities, and assignees</p>
        </div>
      )}
    </div>
  );
}

/* ─── SMART DIGEST ────────────────────────────────────────────────────────── */
function SmartDigest({ projects, tasks, projectId }) {
  const { user }  = useAuth();
  const [open,      setOpen]      = useState(false);
  const [digest,    setDigest]    = useState("");
  const [loading,   setLoading]   = useState(false);
  const [generated, setGenerated] = useState(false);
  const [sending,   setSending]   = useState(false);
  const [sentDone,  setSentDone]  = useState(false);

  const generate = async () => {
    setLoading(true); setDigest(""); setSentDone(false);
    try {
      let logs=[];
      try{const d=await api.activity.getByUser(user.id);logs=d.logs||[];}catch(_){}
      const pData=(projects||[]).map(p=>({projectName:p.projectName,totalTask:(tasks||[]).length,completedTask:(tasks||[]).filter(t=>t.mark_complete).length,tasks:tasks||[]}));
      setDigest(await generateSmartDigest({user,projects:pData,recentLogs:logs}));
      setGenerated(true);
    }catch(e){setDigest("Could not generate digest: "+e.message);}
    finally{setLoading(false);}
  };

  const handleOpen = () => { setOpen(true); if (!generated) generate(); };

  const handleSend = async () => {
    if (!digest||!projectId) return;
    setSending(true);
    try{const res=await api.projects.sendDigest(user.id,projectId,digest,projects?.[0]?.projectName||"");showToast(res.message||"Digest sent!","success");setSentDone(true);}
    catch(e){showToast(e.message||"Failed to send","error");}
    finally{setSending(false);}
  };

  const renderDigest = text => {
    if (!text) return null;
    return text.split("\n").map((line,i)=>{
      if (!line.trim()) return <div key={i} className="h-1.5"/>;
      const emojis=["🌅","📌","✅","🎯"];
      if (emojis.some(e=>line.startsWith(e))) return (
        <div key={i} className="flex items-center gap-2 mt-5 first:mt-0 mb-2">
          <span className="text-base">{line[0]}</span>
          <span className="text-[10.5px] font-black uppercase tracking-widest text-zinc-100">{line.slice(1).trim()}</span>
        </div>
      );
      if (line.trimStart().startsWith("•")||line.trimStart().startsWith("-")) return (
        <div key={i} className="flex items-start gap-2 pl-2 mb-1.5">
          <span className="text-violet-400/60 shrink-0 mt-0.5 text-[10px]">▸</span>
          <span className="text-[12px] text-zinc-300 leading-relaxed">{line.replace(/^[\s•\-]+/,"")}</span>
        </div>
      );
      return <p key={i} className="text-[12px] text-zinc-400 leading-relaxed mb-1">{line}</p>;
    });
  };

  return (
    <>
      <button onClick={handleOpen} className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-black text-white transition-all hover:scale-105 active:scale-95" style={{ background:"linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow:"0 8px 32px rgba(99,102,241,0.5),0 0 0 1px rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.12)" }}>
        <Sparkles size={12}/> Smart Digest
        {/* pulse ring */}
        <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{background:"#6366f1"}}/>
      </button>

      {open&&(
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" style={{fontFamily:FONT}}>
          <div className="absolute inset-0 backdrop-blur-sm" style={{background:"rgba(0,0,0,0.78)"}} onClick={()=>setOpen(false)}/>
          <div className="relative w-full max-w-md max-h-[80vh] flex flex-col rounded-2xl overflow-hidden" style={{background:"#0e0e16",border:"1px solid rgba(255,255,255,0.09)",boxShadow:"0 32px 64px rgba(0,0,0,0.9)"}}>
            <div className="h-[1px]" style={{background:"linear-gradient(90deg,#6366f1,#8b5cf6,transparent 60%)"}}/>
            <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none" style={{background:"radial-gradient(circle,rgba(99,102,241,0.15),transparent 70%)",transform:"translate(-20%,-20%)"}}/>

            <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:"linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.12))",border:"1px solid rgba(99,102,241,0.3)"}}>
                <Sparkles size={13} className="text-indigo-300"/>
              </div>
              <div className="flex-1">
                <h3 className="text-[14px] font-black text-white">Smart Digest</h3>
                <p className="text-[10.5px] text-zinc-600 mt-0.5">Your personalized AI briefing</p>
              </div>
              <button onClick={()=>setOpen(false)} className="w-7 h-7 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-200 hover:bg-white/5 transition-all"><X size={13}/></button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4" style={{scrollbarWidth:"none"}}>
              {loading
                ? <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 size={20} className="animate-spin text-indigo-400"/>
                    <p className="text-[12px] text-zinc-500">Analysing your project…</p>
                  </div>
                : <div className="pb-2">{renderDigest(digest)}</div>
              }
            </div>

            <div className="flex items-center gap-2 px-5 py-3.5 shrink-0" style={{borderTop:"1px solid rgba(255,255,255,0.06)",background:"rgba(0,0,0,0.2)"}}>
              <button onClick={()=>{setGenerated(false);generate();}} disabled={loading||sending} className="w-7 h-7 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-200 hover:bg-white/5 transition-all disabled:opacity-40">
                <RefreshCw size={12}/>
              </button>
              <div className="flex-1"/>
              {digest&&!loading&&(
                <button onClick={handleSend} disabled={sending||sentDone} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11.5px] font-black text-white transition-all disabled:opacity-60" style={{ background:sentDone?"rgba(16,185,129,0.15)":"linear-gradient(135deg,#6366f1,#7c3aed)", border:sentDone?"1px solid rgba(16,185,129,0.3)":"none", color:sentDone?"#34d399":"white" }}>
                  {sending?<><Loader2 size={11} className="animate-spin"/>Sending…</>:sentDone?<><Check size={11}/>Sent!</>:<><Send size={11}/>Send to all members</>}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── VIEW NAV META ───────────────────────────────────────────────────────── */
const VIEWS = [
  { id:"board",    Icon:LayoutGrid,     label:"Board"         },
  { id:"list",     Icon:List,           label:"List"          },
  { id:"dashboard",Icon:BarChart2,      label:"Dashboard"     },
  { id:"members",  Icon:Users,          label:"Members"       },
  { id:"chat",     Icon:MessageSquare,  label:"Chat"          },
  { id:"files",    Icon:Paperclip,      label:"Files"         },
  { id:"activity", Icon:Activity,       label:"Activity"      },
  { id:"gantt",    Icon:GitBranch,      label:"Timeline"      },
  { id:"notes",    Icon:FileText,       label:"Meeting Notes" },
];

/* ─── MAIN PAGE ───────────────────────────────────────────────────────────── */
export default function ProjectPage() {
  const { projectId }  = useParams();
  const { user }       = useAuth();
  const [project,    setProject]    = useState(null);
  const [members,    setMembers]    = useState([]);
  const [tasks,      setTasks]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [activeView, setActiveView] = useState("board");
  const [showAdd,    setShowAdd]    = useState(false);
  const [myRole,     setMyRole]     = useState("EDITOR");

  const load = useCallback(async()=>{
    try{
      const [detail,taskData]=await Promise.all([api.projects.getDetail(user.id,projectId),api.tasks.getAllWithSubtasks(user.id,projectId)]);
      setProject(detail.projectDetail); setMembers(detail.projectMember||[]); setTasks(taskData.TasksDetail||[]);
      const me=detail.projectMember?.find(m=>m.emailuser===user.email);
      if(me) setMyRole(me.role);
    }catch(e){showToast(e.message,"error");}
    finally{setLoading(false);}
  },[user?.id,projectId]);

  useEffect(()=>{load();},[load]);

  const color    = getProjectColor(projectId);
  const canEdit  = !["VIEWER","COMMENTER"].includes(myRole);
  const roleCl   = ROLE_COLOR[myRole]||"#71717a";

  const completedCnt = tasks.filter(t=>t.mark_complete).length;
  const overdueCnt   = tasks.filter(t=>isOverdue(t)).length;
  const pct          = tasks.length?Math.round((completedCnt/tasks.length)*100):0;

  if (loading) return (
    <AppLayout>
      <div className="flex items-center justify-center h-64"><Loader2 size={20} className="animate-spin text-zinc-600"/></div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');* { font-family: 'Outfit', sans-serif; }`}</style>
      <div className="flex flex-col h-full">

        {/* ── Project Header ── */}
        <div className="relative flex items-center gap-4 px-5 py-4 shrink-0" style={{ borderBottom:"1px solid rgba(255,255,255,0.07)", background:"linear-gradient(180deg,rgba(255,255,255,0.02),transparent)" }}>
          {/* color stripe */}
          <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{background:`linear-gradient(180deg,${color},${color}30)`}}/>

          {/* project icon */}
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-[15px] shrink-0" style={{ background:`${color}20`, border:`1px solid ${color}35`, color, boxShadow:`0 0 20px ${color}18` }}>
            {(project?.projectName||"?")[0].toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-[15px] font-black text-white">{project?.projectName}</h1>
            <p className="text-[11.5px] text-zinc-600 truncate mt-0.5">{project?.description}</p>
          </div>

          {/* progress mini bar */}
          <div className="hidden sm:flex items-center gap-3 mr-2">
            <div className="text-right">
              <p className="text-[11px] font-black text-zinc-300">{pct}%</p>
              <p className="text-[10px] text-zinc-700">{completedCnt}/{tasks.length} done</p>
            </div>
            <div className="w-20 h-1.5 rounded-full" style={{background:"rgba(255,255,255,0.06)"}}>
              <div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:pct>=100?"#10b981":"#6366f1"}}/>
            </div>
          </div>

          {overdueCnt>0&&(
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-black" style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.25)",color:"#f87171"}}>
              <AlertTriangle size={10}/>{overdueCnt} overdue
            </div>
          )}

          <span className="px-2.5 py-1 rounded-xl text-[10.5px] font-black shrink-0" style={{color:roleCl,background:`${roleCl}15`,border:`1px solid ${roleCl}28`}}>{myRole}</span>
        </div>

        {/* ── View Tabs ── */}
        <div className="flex items-center gap-0.5 px-4 py-2 shrink-0 overflow-x-auto" style={{borderBottom:"1px solid rgba(255,255,255,0.06)",scrollbarWidth:"none"}}>
          {VIEWS.map(({id,Icon,label})=>{
            const active = activeView===id;
            return (
              <button
                key={id}
                onClick={()=>setActiveView(id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all whitespace-nowrap"
                style={{
                  background:active?"rgba(255,255,255,0.06)":"transparent",
                  color:active?"#e4e4e7":"#52525b",
                  borderBottom:active?`2px solid ${color}`:"2px solid transparent",
                }}
              >
                <Icon size={12} strokeWidth={active?2:1.8}/>{label}
              </button>
            );
          })}
        </div>

        {/* ── View Content ── */}
        <div className="flex-1 overflow-y-auto" style={{scrollbarWidth:"thin",scrollbarColor:"rgba(255,255,255,0.06) transparent"}}>
          {activeView==="board"     && <KanbanView      tasks={tasks} members={members} projectId={projectId} onAddTask={()=>canEdit&&setShowAdd(true)} onTaskUpdated={load}/>}
          {activeView==="list"      && <ListView        tasks={tasks} members={members} projectId={projectId} onAddTask={()=>canEdit&&setShowAdd(true)} onTaskUpdated={load}/>}
          {activeView==="dashboard" && <DashboardView   projectId={projectId}/>}
          {activeView==="members"   && <MembersView     members={members} projectId={projectId} currentUserRole={myRole} onMemberAdded={load}/>}
          {activeView==="chat"      && <ChatView        projectId={projectId} members={members} onTaskCreated={load}/>}
          {activeView==="files"     && <FilesView       projectId={projectId} tasks={tasks}/>}
          {activeView==="activity"  && <ActivityView    projectId={projectId}/>}
          {activeView==="gantt"     && <GanttView       tasks={tasks} members={members} projectId={projectId} onTaskUpdated={load}/>}
          {activeView==="notes"     && <MeetingNotesView projectId={projectId} members={members} onTaskCreated={load}/>}
        </div>
      </div>

      <SmartDigest projects={project?[project]:[]} tasks={tasks} projectId={projectId}/>
      <TaskModal open={showAdd} onClose={()=>setShowAdd(false)} projectId={projectId} members={members} onSaved={load}/>
    </AppLayout>
  );
}