"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { showToast } from "@/components/ui";
import {
  X, Loader2, FolderOpen, AlignLeft, Layers,
  LayoutDashboard, Columns, List, GitBranch,
  Calendar, BarChart3, FileText, Users,
  MessageSquare, Paperclip, AlertCircle, Check,
  Sparkles,
} from "lucide-react";

const FONT = "'Outfit', sans-serif";

const VIEW_META = {
  Board:     { Icon:Columns,         color:"#8b5cf6", desc:"Kanban-style task board"      },
  List:      { Icon:List,            color:"#3b82f6", desc:"Simple task list view"        },
  Timeline:  { Icon:GitBranch,       color:"#f59e0b", desc:"Track task dependencies"      },
  Dashboard: { Icon:BarChart3,       color:"#10b981", desc:"Analytics & progress metrics" },
  Gantt:     { Icon:BarChart3,       color:"#f97316", desc:"Time-based project planning"  },
  Note:      { Icon:FileText,        color:"#06b6d4", desc:"Project notes & docs"         },
  Files:     { Icon:Paperclip,       color:"#71717a", desc:"File attachments & assets"    },
  Messages:  { Icon:MessageSquare,   color:"#e879f9", desc:"Team communication"           },
};

// All views — always sent to the API, never requires user selection
const ALL_VIEWS = Object.keys(VIEW_META);

const inputCls = (err) =>
  `w-full text-[13px] rounded-xl px-3.5 py-2.5 outline-none transition-all placeholder-zinc-700 ${
    err
      ? "bg-red-500/[0.04] border border-red-500/40 text-zinc-200 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
      : "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] text-zinc-200 focus:border-indigo-500/50 focus:bg-indigo-500/[0.04] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
  }`;

function Label({ icon: Icon, children }) {
  return (
    <label className="flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-[0.1em] text-zinc-600 mb-1.5">
      {Icon && <Icon size={10} strokeWidth={2.2} className="text-zinc-700"/>}
      {children}
    </label>
  );
}

export default function NewProjectModal({ open, onClose, onCreated }) {
  const { user } = useAuth();
  const router   = useRouter();

  const [form,    setForm]    = useState({ projectName:"", description:"" });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  useEffect(() => {
    if (open) { setForm({ projectName:"", description:"" }); setErrors({}); }
  }, [open]);

  useEffect(() => {
    const h = e => { if (e.key==="Escape") onClose(); };
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  const set = (k, v) => { setForm(p=>({...p,[k]:v})); setErrors(e=>({...e,[k]:""})); };

  const validate = () => {
    const e = {};
    if (!form.projectName.trim()) e.projectName = "Project name is required";
    if (!form.description.trim()) e.description  = "Description is required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await api.projects.create(user.id, { ...form, views: ALL_VIEWS });
      showToast("Project created!");
      onCreated?.(data.project);
      onClose();
      router.push(`/project/${data.project.id}`);
    } catch(err) { showToast(err.message, "error"); }
    finally { setLoading(false); }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{fontFamily:FONT}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');`}</style>

      {/* backdrop */}
      <div
        className="absolute inset-0"
        style={{background:"rgba(0,0,0,0.82)",backdropFilter:"blur(8px)"}}
        onClick={onClose}
      />

      <div
        className="relative w-full max-w-[480px] flex flex-col rounded-2xl overflow-hidden"
        style={{
          background:"#0e0e16",
          border:"1px solid rgba(255,255,255,0.09)",
          boxShadow:"0 0 0 1px rgba(255,255,255,0.03),0 32px 64px rgba(0,0,0,0.85),0 0 80px rgba(99,102,241,0.06)",
        }}
        onClick={e=>e.stopPropagation()}
      >
        {/* top accent line */}
        <div className="h-[1px] w-full" style={{background:"linear-gradient(90deg,#6366f1,#8b5cf6,#c084fc,transparent 65%)"}}/>
        {/* corner ambient */}
        <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none" style={{background:"radial-gradient(circle,rgba(99,102,241,0.12),transparent 70%)",transform:"translate(30%,-30%)"}}/>

        {/* ── Header ── */}
        <div className="relative flex items-center gap-3 px-5 pt-5 pb-4 shrink-0" style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{background:"linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.12))",border:"1px solid rgba(99,102,241,0.3)",boxShadow:"0 0 20px rgba(99,102,241,0.15)"}}>
            <FolderOpen size={17} className="text-indigo-300" strokeWidth={1.8}/>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-black text-white">New Project</h2>
            <p className="text-[11px] text-zinc-600 mt-0.5 font-medium">All views included automatically</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-200 hover:bg-white/5 transition-all">
            <X size={14}/>
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-5 py-5 space-y-5 overflow-y-auto" style={{scrollbarWidth:"none"}}>

          {/* Project name */}
          <div>
            <Label icon={FolderOpen}>Project Name</Label>
            <input
              value={form.projectName}
              onChange={e=>set("projectName",e.target.value)}
              placeholder="e.g. Marketing Campaign Q4"
              className={inputCls(errors.projectName)}
              style={{fontFamily:FONT,fontSize:14}}
              autoFocus
              onKeyDown={e=>{ if(e.key==="Enter") submit(); }}
            />
            {errors.projectName&&(
              <p className="flex items-center gap-1 text-[11px] text-red-400 font-medium mt-1.5">
                <AlertCircle size={10}/>{errors.projectName}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <Label icon={AlignLeft}>Description</Label>
            <textarea
              value={form.description}
              onChange={e=>set("description",e.target.value)}
              placeholder="What is this project about? Add goals, context, or scope…"
              rows={4}
              className={`${inputCls(errors.description)} resize-none leading-relaxed`}
              style={{fontFamily:FONT}}
            />
            {errors.description&&(
              <p className="flex items-center gap-1 text-[11px] text-red-400 font-medium mt-1.5">
                <AlertCircle size={10}/>{errors.description}
              </p>
            )}
          </div>

          {/* Views — read-only display, all pre-checked */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label icon={Layers}>Included Views</Label>
              <span className="text-[10px] font-black -mt-1.5 px-2 py-0.5 rounded-full" style={{color:"#a5b4fc",background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)"}}>
                All {ALL_VIEWS.length} included
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {ALL_VIEWS.map(v=>{
                const { Icon, color, desc } = VIEW_META[v];
                return (
                  <div
                    key={v}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                    style={{background:`${color}0c`,border:`1px solid ${color}25`}}
                  >
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{background:`${color}18`,border:`1px solid ${color}28`}}>
                      <Icon size={11} style={{color}} strokeWidth={1.8}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11.5px] font-bold leading-none" style={{color}}>{v}</p>
                      <p className="text-[10px] text-zinc-700 mt-0.5 truncate">{desc}</p>
                    </div>
                    <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{background:color}}>
                      <Check size={8} strokeWidth={3} className="text-white"/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* tip */}
          <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl" style={{background:"rgba(99,102,241,0.06)",border:"1px solid rgba(99,102,241,0.15)"}}>
            <Sparkles size={13} className="text-indigo-400 shrink-0 mt-0.5" strokeWidth={1.8}/>
            <p className="text-[11.5px] text-zinc-500 leading-relaxed">
              <span className="text-indigo-400 font-semibold">All 8 views</span> are enabled for every project — switch between them anytime from the project page.
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{borderTop:"1px solid rgba(255,255,255,0.06)",background:"rgba(0,0,0,0.25)"}}>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-zinc-500 hover:text-zinc-200 transition-all"
            style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-black text-white transition-all disabled:opacity-50 hover:-translate-y-px active:translate-y-0"
            style={{background:"linear-gradient(135deg,#6366f1,#7c3aed)",boxShadow:"0 4px 20px rgba(99,102,241,0.4),inset 0 1px 0 rgba(255,255,255,0.12)"}}
          >
            {loading&&<Loader2 size={13} className="animate-spin"/>}
            {loading?"Creating…":"Create Project"}
          </button>
        </div>
      </div>
    </div>
  );
}