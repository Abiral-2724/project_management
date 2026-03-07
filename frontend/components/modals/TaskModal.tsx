"use client";
import { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { generateTaskDetails } from "@/lib/gemini";
import { showToast, formatDateInput } from "@/components/ui";
import {
  X, Sparkles, Plus, Trash2, Loader2, ChevronDown,
  User, Calendar, Flag, AlignLeft, Tag, CheckSquare,
  Check, Circle, AlertCircle,
} from "lucide-react";

const FONT = "'Outfit', sans-serif";

const PRIORITY = {
  High:   { color:"#f87171", glow:"rgba(248,113,113,0.18)", dot:"#ef4444", bg:"rgba(239,68,68,0.08)",   border:"rgba(239,68,68,0.28)"   },
  Medium: { color:"#fbbf24", glow:"rgba(251,191,36,0.15)",  dot:"#f59e0b", bg:"rgba(245,158,11,0.08)",  border:"rgba(245,158,11,0.28)"  },
  Low:    { color:"#34d399", glow:"rgba(52,211,153,0.15)",  dot:"#10b981", bg:"rgba(16,185,129,0.08)",  border:"rgba(16,185,129,0.28)"  },
};
const STATUS = {
  "Todo":        { color:"#a1a1aa", bg:"rgba(161,161,170,0.08)", border:"rgba(161,161,170,0.2)"  },
  "In Progress": { color:"#60a5fa", bg:"rgba(96,165,250,0.08)",  border:"rgba(96,165,250,0.25)"  },
  "In Review":   { color:"#c084fc", bg:"rgba(192,132,252,0.08)", border:"rgba(192,132,252,0.25)" },
  "Done":        { color:"#34d399", bg:"rgba(52,211,153,0.08)",  border:"rgba(52,211,153,0.25)"  },
};

function Label({ icon: Icon, children, aside }) {
  return (
    <div className="flex items-center justify-between mb-1.5">
      <label className="flex items-center gap-1.5 text-[10.5px] font-black uppercase tracking-[0.1em] text-zinc-600">
        {Icon && <Icon size={10} strokeWidth={2.2} className="text-zinc-700" />}
        {children}
      </label>
      {aside}
    </div>
  );
}

function FieldWrap({ error, children }) {
  return (
    <div>
      {children}
      {error && <p className="flex items-center gap-1 text-[11px] text-red-400 font-medium mt-1.5"><AlertCircle size={10} />{error}</p>}
    </div>
  );
}

const inputCls = (err) =>
  `w-full text-[13px] rounded-xl px-3.5 py-2.5 outline-none transition-all placeholder-zinc-700 ${
    err
      ? "bg-red-500/[0.04] border border-red-500/40 text-zinc-200 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
      : "bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] text-zinc-200 focus:border-indigo-500/50 focus:bg-indigo-500/[0.04] focus:shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
  }`;

function SelectField({ value, onChange, children, colorValue, error }) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange} className={`${inputCls(error)} appearance-none pr-8 cursor-pointer`} style={{ fontFamily:FONT, color:colorValue||undefined }}>
        {children}
      </select>
      <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
    </div>
  );
}

function PrioritySelector({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {Object.entries(PRIORITY).map(([key, m]) => {
        const a = value === key;
        return (
          <button key={key} onClick={()=>onChange(key)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-bold transition-all" style={{ background:a?m.bg:"rgba(255,255,255,0.02)", border:`1px solid ${a?m.border:"rgba(255,255,255,0.06)"}`, color:a?m.color:"#52525b", boxShadow:a?`0 0 18px ${m.glow}`:"none" }}>
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:a?m.dot:"#3f3f46" }} />
            {key}
          </button>
        );
      })}
    </div>
  );
}

function StatusSelector({ value, onChange }) {
  return (
    <div className="flex gap-1.5 flex-wrap">
      {Object.entries(STATUS).map(([key, m]) => {
        const a = value === key;
        return (
          <button key={key} onClick={()=>onChange(key)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11.5px] font-semibold transition-all" style={{ background:a?m.bg:"rgba(255,255,255,0.02)", border:`1px solid ${a?m.border:"rgba(255,255,255,0.05)"}`, color:a?m.color:"#52525b" }}>
            {a && <Check size={9} strokeWidth={3} />}
            {key}
          </button>
        );
      })}
    </div>
  );
}

function SubtaskRow({ subtask, index, onChange, onDelete, onAdd, isAi }) {
  const ref = useRef(null);
  useEffect(() => {
    if (subtask._focus) { ref.current?.focus(); onChange(index, { ...subtask, _focus:false }); }
  }, [subtask._focus]);

  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl group transition-all" style={{ background:isAi?"linear-gradient(135deg,rgba(99,102,241,0.06),rgba(139,92,246,0.04))":"rgba(255,255,255,0.02)", border:`1px solid ${isAi?"rgba(99,102,241,0.2)":"rgba(255,255,255,0.05)"}` }}>
      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background:isAi?"#818cf8":"#3f3f46" }} />
      <input ref={ref} value={subtask.title} onChange={e=>onChange(index,{...subtask,title:e.target.value})} onKeyDown={e=>{ if(e.key==="Enter"){e.preventDefault();onAdd(index);} if(e.key==="Backspace"&&!subtask.title){e.preventDefault();onDelete(index);} }} placeholder="Subtask description…" className="flex-1 bg-transparent text-[12.5px] text-zinc-300 placeholder-zinc-700 focus:outline-none" style={{fontFamily:FONT}} />
      {isAi && <span className="shrink-0 text-[8.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md" style={{color:"#818cf8",background:"rgba(99,102,241,0.12)",border:"1px solid rgba(99,102,241,0.2)"}}>AI</span>}
      <button onClick={()=>onDelete(index)} tabIndex={-1} className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded-lg flex items-center justify-center text-zinc-700 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 size={10} /></button>
    </div>
  );
}

export default function TaskModal({ open, onClose, projectId, task, members=[], onSaved }) {
  const { user } = useAuth();
  const isEdit   = !!task;

  const [form,     setForm]     = useState({ title:"", description:"", status:"Todo", priority:"High", assigneEmail:"", startDate:"", dueDate:"" });
  const [subtasks, setSubtasks] = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [aiLoad,   setAiLoad]   = useState(false);
  const [aiGlow,   setAiGlow]   = useState(false);

  useEffect(() => {
    if (!open) return;
    if (task) {
      setForm({ title:task.title||"", description:task.description||"", status:task.status||"Todo", priority:task.priority||"High", assigneEmail:task.assignee_email||"", startDate:formatDateInput(task.startDate), dueDate:formatDateInput(task.dueDate) });
      setSubtasks((task.subtasks||task.allSubtasksDestail||[]).map(s=>({ id:s.id, title:s.title||"", priority:s.priority||"Medium", status:s.status||"Todo" })));
    } else {
      setForm({ title:"", description:"", status:"Todo", priority:"High", assigneEmail:user?.email||"", startDate:formatDateInput(new Date()), dueDate:"" });
      setSubtasks([]);
    }
    setErrors({});
  }, [task, open, user]);

  useEffect(() => {
    const h = e => { if(e.key==="Escape") onClose(); };
    if (open) document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  const set = (k,v) => { setForm(p=>({...p,[k]:v})); setErrors(e=>({...e,[k]:""})); };
  const updateSub = (i,val) => setSubtasks(p=>p.map((s,idx)=>idx===i?val:s));
  const deleteSub = i       => setSubtasks(p=>p.filter((_,idx)=>idx!==i));
  const addSub    = after   => setSubtasks(p=>{ const n=[...p]; n.splice(after+1,0,{title:"",priority:"Medium",status:"Todo",_focus:true}); return n; });
  const addBlank  = ()      => setSubtasks(p=>[...p,{title:"",priority:"Medium",status:"Todo",_focus:true}]);

  const handleAI = async () => {
    if (!form.title.trim()) { showToast("Enter a task title first","warning"); return; }
    setAiLoad(true);
    try {
      const res = await generateTaskDetails(form.title.trim());
      if (res.description) set("description", res.description);
      if (res.subtasks?.length) setSubtasks(res.subtasks.filter(s=>s?.trim()).map(s=>({ title:s, priority:"Medium", status:"Todo", _isAi:true })));
      setAiGlow(true); setTimeout(()=>setAiGlow(false),1600);
      showToast(`AI generated ${res.subtasks?.length||0} subtasks`,"success");
    } catch(e) { showToast(e.message||"AI generation failed","error"); }
    finally { setAiLoad(false); }
  };

  const validate = () => {
    const e={};
    if (!form.title.trim()) e.title="Title is required";
    if (!form.assigneEmail) e.assigneEmail="Assignee is required";
    if (!form.dueDate)      e.dueDate="Due date is required";
    setErrors(e); return !Object.keys(e).length;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const valid = subtasks.filter(s=>s.title?.trim());
      if (isEdit) {
        await api.tasks.edit(user.id, projectId, [{...form, taskId:task.id}]);
        const ns=valid.filter(s=>!s.id), es=valid.filter(s=>s.id);
        if (ns.length) await api.tasks.addSubtasks(user.id,projectId,ns.map(s=>({ title:s.title.trim(),priority:s.priority||"Medium",status:s.status||"Todo",taskId:task.id,assigneEmail:form.assigneEmail,startDate:form.startDate||new Date().toISOString(),dueDate:form.dueDate })));
        if (es.length) await api.tasks.editSubtasks(user.id,projectId,es.map(s=>({ subtaskId:s.id,title:s.title.trim(),priority:s.priority,status:s.status })));
        showToast("Task updated");
      } else {
        const res = await api.tasks.add(user.id,projectId,[form]);
        const nid = res?.tasks?.[0]?.id||res?.id;
        if (valid.length&&nid) await api.tasks.addSubtasks(user.id,projectId,valid.map(s=>({ title:s.title.trim(),priority:s.priority||form.priority,status:"Todo",taskId:nid,assigneEmail:form.assigneEmail,startDate:form.startDate||new Date().toISOString(),dueDate:form.dueDate })));
        showToast(valid.length?`Task created with ${valid.length} subtask${valid.length>1?"s":""}`:"Task created");
      }
      onSaved?.(); onClose();
    } catch(e) { showToast(e.message,"error"); }
    finally { setLoading(false); }
  };

  if (!open) return null;

  const pMeta    = PRIORITY[form.priority] || PRIORITY.High;
  const validCnt = subtasks.filter(s=>s.title?.trim()).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{fontFamily:FONT}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        @keyframes ai-glow{0%{box-shadow:0 0 0 0 rgba(139,92,246,0)}50%{box-shadow:0 0 32px 4px rgba(139,92,246,0.15)}100%{box-shadow:0 0 0 0 rgba(139,92,246,0)}}
        .ai-glow-anim{animation:ai-glow 1.6s ease-out;}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(0.4);cursor:pointer;}
      `}</style>

      <div className="absolute inset-0" style={{background:"rgba(0,0,0,0.82)",backdropFilter:"blur(8px)"}} onClick={onClose} />

      <div
        className={`relative w-full max-w-[560px] max-h-[94vh] flex flex-col rounded-2xl overflow-hidden ${aiGlow?"ai-glow-anim":""}`}
        style={{ background:"#0e0e16", border:"1px solid rgba(255,255,255,0.09)", boxShadow:"0 0 0 1px rgba(255,255,255,0.03),0 32px 64px rgba(0,0,0,0.85)" }}
        onClick={e=>e.stopPropagation()}
      >
        {/* priority gradient top stripe */}
        <div className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none z-10" style={{background:`linear-gradient(90deg,${pMeta.dot}90,${pMeta.dot}30,transparent 55%)`}} />
        {/* ambient corner glow */}
        <div className="absolute top-0 left-0 w-48 h-48 pointer-events-none" style={{background:`radial-gradient(circle,${pMeta.glow},transparent 70%)`,transform:"translate(-35%,-35%)"}} />

        {/* ── Header ── */}
        <div className="relative flex items-start gap-3 px-5 pt-5 pb-4 shrink-0" style={{borderBottom:"1px solid rgba(255,255,255,0.06)"}}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{background:`${pMeta.dot}18`,border:`1px solid ${pMeta.dot}30`}}>
            {isEdit ? <Tag size={15} style={{color:pMeta.color}} strokeWidth={1.8}/> : <Plus size={15} style={{color:pMeta.color}} strokeWidth={2.2}/>}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-[15px] font-black text-white">{isEdit?"Edit Task":"New Task"}</h2>
            <p className="text-[11px] text-zinc-600 mt-0.5 font-medium">{isEdit?"Update details, status, or subtasks":"Create and optionally add subtasks"}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isEdit && (
              <button onClick={handleAI} disabled={aiLoad} className="flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-xl text-[11.5px] font-black transition-all disabled:opacity-50 group" style={{background:"linear-gradient(135deg,rgba(139,92,246,0.18),rgba(99,102,241,0.12))",border:"1px solid rgba(139,92,246,0.4)",color:"#c4b5fd",boxShadow:"0 0 20px rgba(139,92,246,0.15)"}}>
                {aiLoad ? <Loader2 size={12} className="animate-spin"/> : <Sparkles size={12} className="group-hover:scale-110 transition-transform"/>}
                {aiLoad?"Generating…":"AI Fill"}
              </button>
            )}
            <button onClick={onClose} className="w-7 h-7 rounded-xl flex items-center justify-center text-zinc-600 hover:text-zinc-200 hover:bg-white/5 transition-all"><X size={14}/></button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5" style={{scrollbarWidth:"none"}}>

          <FieldWrap error={errors.title}>
            <Label icon={Tag}>Title</Label>
            <input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. Build the authentication flow" className={inputCls(errors.title)} style={{fontFamily:FONT,fontSize:14}}/>
          </FieldWrap>

          <div>
            <Label icon={AlignLeft}>Description</Label>
            <textarea value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Add context, acceptance criteria, or notes…" rows={3} className={`${inputCls(false)} resize-none leading-relaxed`} style={{fontFamily:FONT}}/>
          </div>

          <div>
            <Label icon={Flag}>Priority</Label>
            <PrioritySelector value={form.priority} onChange={v=>set("priority",v)}/>
          </div>

          <div>
            <Label icon={Circle}>Status</Label>
            <StatusSelector value={form.status} onChange={v=>set("status",v)}/>
          </div>

          <FieldWrap error={errors.assigneEmail}>
            <Label icon={User}>Assignee</Label>
            <SelectField value={form.assigneEmail} onChange={e=>set("assigneEmail",e.target.value)} error={errors.assigneEmail}>
              <option value="" style={{background:"#1a1a2e"}}>Select assignee…</option>
              {members.map(m=><option key={m.emailuser} value={m.emailuser} style={{background:"#1a1a2e"}}>{m.fullname||m.emailuser}</option>)}
            </SelectField>
          </FieldWrap>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label icon={Calendar}>Start Date</Label>
              <input type="date" value={form.startDate} onChange={e=>set("startDate",e.target.value)} className={inputCls(false)} style={{fontFamily:FONT,colorScheme:"dark"}}/>
            </div>
            <FieldWrap error={errors.dueDate}>
              <Label icon={Calendar}>Due Date</Label>
              <input type="date" value={form.dueDate} onChange={e=>set("dueDate",e.target.value)} className={inputCls(errors.dueDate)} style={{fontFamily:FONT,colorScheme:"dark"}}/>
            </FieldWrap>
          </div>

          <div className="h-px" style={{background:"rgba(255,255,255,0.05)"}}/>

          <div>
            <Label icon={CheckSquare} aside={subtasks.length>0&&<span className="text-[10px] font-black text-zinc-600 px-1.5 py-0.5 rounded-full bg-zinc-800/80 border border-zinc-700/50">{validCnt}/{subtasks.length}</span>}>
              Subtasks
            </Label>

            {subtasks.length===0 ? (
              <button onClick={addBlank} className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[12.5px] font-medium text-zinc-600 hover:text-zinc-400 transition-all group" style={{border:"1.5px dashed rgba(255,255,255,0.07)",background:"rgba(255,255,255,0.01)"}}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center border border-dashed border-zinc-700 group-hover:border-indigo-500/50 transition-colors">
                  <Plus size={10} className="text-zinc-700 group-hover:text-indigo-400 transition-colors"/>
                </div>
                Click to add subtasks, or press{" "}
                <kbd className="ml-0.5 bg-zinc-800 border border-zinc-700 px-1 py-0.5 rounded text-[10px] font-mono text-zinc-500">AI Fill</kbd>
              </button>
            ) : (
              <div className="space-y-1.5">
                {subtasks.map((sub,i)=>(
                  <SubtaskRow key={i} subtask={sub} index={i} isAi={!!sub._isAi} onChange={updateSub} onDelete={deleteSub} onAdd={addSub}/>
                ))}
                <button onClick={addBlank} className="flex items-center gap-1.5 px-2 py-1.5 text-[11px] font-semibold text-zinc-700 hover:text-indigo-400 transition-colors">
                  <Plus size={9} strokeWidth={2.5}/> Add another
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center gap-3 px-5 py-4 shrink-0" style={{borderTop:"1px solid rgba(255,255,255,0.06)",background:"rgba(0,0,0,0.25)"}}>
          {validCnt>0 && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10.5px] font-bold shrink-0" style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.2)",color:"#a5b4fc"}}>
              <CheckSquare size={10}/>{validCnt} subtask{validCnt>1?"s":""}
            </div>
          )}
          <div className="flex-1 flex gap-2.5">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-[13px] font-bold text-zinc-500 hover:text-zinc-200 transition-all" style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)"}}>
              Cancel
            </button>
            <button onClick={submit} disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-black text-white transition-all disabled:opacity-50 hover:-translate-y-px active:translate-y-0" style={{background:"linear-gradient(135deg,#6366f1,#7c3aed)",boxShadow:"0 4px 20px rgba(99,102,241,0.4),inset 0 1px 0 rgba(255,255,255,0.12)"}}>
              {loading&&<Loader2 size={13} className="animate-spin"/>}
              {isEdit?(loading?"Saving…":"Save Changes"):loading?"Creating…":validCnt>0?`Create + ${validCnt} subtask${validCnt>1?"s":""}`:"Create Task"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}