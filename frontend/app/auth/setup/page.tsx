"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Zap, Upload, User, ChevronDown } from "lucide-react";

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
  @keyframes orb-drift{0%{transform:translate(0,0) scale(1)}100%{transform:translate(20px,30px) scale(1.1)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeslide{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  .orb-a{animation:orb-drift 13s ease-in-out infinite alternate;}
  .orb-b{animation:orb-drift 13s ease-in-out infinite alternate;animation-delay:-7s;}
  .spinner{animation:spin .7s linear infinite;}
  .fadeslide{animation:fadeslide .5s ease .1s both;}
  .ifield{width:100%;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px 16px;font-size:14px;font-family:'Outfit',sans-serif;color:#f4f4f5;outline:none;transition:all .2s;-webkit-appearance:none;}
  .ifield::placeholder{color:#3f3f46;}
  .ifield:hover{border-color:rgba(255,255,255,.13);background:rgba(255,255,255,.04);}
  .ifield:focus{border-color:rgba(99,102,241,.65);background:rgba(99,102,241,.04);box-shadow:0 0 0 3px rgba(99,102,241,.1);}
  .ifield.has-error{border-color:rgba(239,68,68,.5);}
  .iselect{width:100%;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px 40px 12px 16px;font-size:14px;font-family:'Outfit',sans-serif;color:#f4f4f5;outline:none;appearance:none;cursor:pointer;transition:all .2s;}
  .iselect:hover{border-color:rgba(255,255,255,.13);background:rgba(255,255,255,.04);}
  .iselect:focus{border-color:rgba(99,102,241,.65);background:rgba(99,102,241,.04);box-shadow:0 0 0 3px rgba(99,102,241,.1);}
  .iselect option{background:#1a1a2e;color:#f4f4f5;}
  .pbtn{width:100%;background:linear-gradient(135deg,#6366f1,#7c3aed);color:white;border:none;border-radius:12px;padding:13px 20px;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;cursor:pointer;position:relative;overflow:hidden;transition:transform .15s,box-shadow .2s,opacity .2s;box-shadow:0 4px 20px rgba(99,102,241,.3);}
  .pbtn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.1),transparent);}
  .pbtn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 28px rgba(99,102,241,.45);}
  .pbtn:disabled{opacity:.6;cursor:not-allowed;}
  .drop-zone{border:1.5px dashed rgba(255,255,255,.1);border-radius:16px;padding:24px 16px;display:flex;flex-direction:column;align-items:center;gap:12px;cursor:pointer;transition:all .25s;background:rgba(255,255,255,.01);}
  .drop-zone:hover,.drop-zone.drag-over{border-color:rgba(99,102,241,.5);background:rgba(99,102,241,.04);}
`;

const ROLES = ["Team_member","Manager","Director","Executive","Business_owner","Freelancer","Student","Other","Prefer_not_to_say"];

const STEPS = [
  { num:"✓", title:"Create account", desc:"Email & password set",  state:"done" },
  { num:"✓", title:"Verify email",   desc:"Identity confirmed",    state:"done" },
  { num:"3",  title:"Set up profile", desc:"Name, role & photo",   state:"active" },
];

export default function SetupPage({ searchParams }) {
  const router = useRouter();
  const { id } = use(searchParams);
  const { refreshUser } = useAuth();
  const fileRef = useRef(null);
  const [fullname, setFullname] = useState("");
  const [myrole, setMyrole] = useState("Team_member");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleFile = (f) => {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f); setPreview(URL.createObjectURL(f)); setError("");
  };

  const submit = async () => {
    if (!fullname.trim()) { setError("Full name is required"); return; }
    if (!file) { setError("Profile photo is required"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("fullname", fullname);
      fd.append("myrole", myrole);
      fd.append("file", file);
      await api.auth.accountSetup(id, fd);
      await refreshUser();
      router.push("/dashboard");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const initials = fullname.trim().split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();

  const stepStyle = (state) => ({
    done:    { bg:"rgba(99,102,241,.2)",  border:"1px solid rgba(99,102,241,.4)",  color:"#818cf8" },
    active:  { bg:"rgba(99,102,241,.15)", border:"1px solid rgba(99,102,241,.3)",  color:"#a5b4fc" },
    upcoming:{ bg:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",color:"#3f3f46" },
  }[state]);

  return (
    <div className="min-h-screen bg-[#09090f] flex overflow-hidden" style={{fontFamily:"'Outfit',sans-serif"}}>
      <style>{BASE_CSS}</style>

      {/* ── LEFT ── */}
      <div className="flex-1 relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0" style={{background:"radial-gradient(ellipse 60% 70% at 20% 50%,rgba(99,102,241,.13),transparent 60%),radial-gradient(ellipse 60% 60% at 80% 20%,rgba(139,92,246,.1),transparent 60%),linear-gradient(160deg,#0d0d1a,#09090f,#0a0814)"}}/>
        <div className="absolute inset-0" style={{backgroundImage:"linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px)",backgroundSize:"48px 48px",maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%)"}}/>
        <div className="orb-a absolute w-72 h-72 top-[10%] -left-10 rounded-full" style={{background:"rgba(99,102,241,.12)",filter:"blur(80px)"}}/>
        <div className="orb-b absolute w-60 h-60 bottom-[10%] -right-5 rounded-full" style={{background:"rgba(139,92,246,.1)",filter:"blur(80px)"}}/>

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",boxShadow:"0 0 24px rgba(99,102,241,.4)"}}>
            <Zap size={18} strokeWidth={2.5}/>
          </div>
          <span className="text-white text-xl font-bold tracking-tight">Planzo</span>
        </div>

        {/* Steps + Preview */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-20">
          <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest mb-6">Getting started</p>
          <div className="flex flex-col mb-10">
            {STEPS.map((s, i) => (
              <div key={s.title} className="flex gap-4 items-start pb-8 relative">
                {i < STEPS.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-px" style={{background:"linear-gradient(to bottom,rgba(99,102,241,.3),transparent)"}}/>
                )}
                <div className="w-8 h-8 min-w-[32px] rounded-lg flex items-center justify-center text-[13px] font-bold" style={{background:stepStyle(s.state).bg,border:stepStyle(s.state).border,color:stepStyle(s.state).color}}>
                  {s.num}
                </div>
                <div className="pt-1">
                  <p className={`text-[14px] font-semibold mb-0.5 ${s.state==="upcoming"?"text-zinc-700":"text-zinc-200"}`}>{s.title}</p>
                  <p className="text-[12.5px] text-zinc-600">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Live preview card */}
          <div>
            <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest mb-3">Profile preview</p>
            <div className="flex items-center gap-4 p-5 rounded-2xl" style={{background:"rgba(255,255,255,.02)",border:"1px solid rgba(255,255,255,.06)"}}>
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{background:"linear-gradient(135deg,rgba(99,102,241,.3),rgba(139,92,246,.2))",border:"1px solid rgba(99,102,241,.2)"}}>
                {preview
                  ? <img src={preview} alt="" className="w-full h-full object-cover"/>
                  : initials
                    ? <span className="text-lg font-bold text-indigo-400">{initials}</span>
                    : <User size={22} className="text-indigo-500" strokeWidth={1.5}/>
                }
              </div>
              <div>
                <p className={`text-[15px] font-semibold mb-0.5 ${fullname.trim()?"text-zinc-200":"text-zinc-700"}`}>{fullname.trim()||"Your name"}</p>
                <p className="text-[12px] text-zinc-600">{myrole.replace(/_/g," ")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="w-full lg:w-[480px] flex-shrink-0 flex items-center justify-center px-8 py-12 relative overflow-y-auto" style={{background:"#0f0f17",borderLeft:"1px solid rgba(255,255,255,.05)"}}>
        <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse 100% 60% at 50% 0%,rgba(99,102,241,.06),transparent 70%)"}}/>

        <div className={`relative z-10 w-full max-w-[360px] ${mounted?"fadeslide":"opacity-0"}`}>
          <div className="mb-7">
            <h2 className="text-[26px] font-bold text-white tracking-tight mb-1.5">Set up your profile</h2>
            <p className="text-[13.5px] text-zinc-600">Almost there! Tell us a bit about yourself.</p>
          </div>

          {/* Avatar Upload */}
          <div
            className={`drop-zone mb-5${dragOver?" drag-over":""}`}
            onClick={()=>fileRef.current?.click()}
            onDragOver={e=>{e.preventDefault();setDragOver(true);}}
            onDragLeave={()=>setDragOver(false)}
            onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files?.[0]);}}
          >
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center flex-shrink-0" style={{background:"linear-gradient(135deg,rgba(99,102,241,.2),rgba(139,92,246,.15))",border:"2px solid rgba(99,102,241,.3)"}}>
              {preview
                ? <img src={preview} alt="" className="w-full h-full object-cover"/>
                : <Upload size={22} className="text-indigo-400" strokeWidth={1.5}/>
              }
            </div>
            <p className="text-[13px] font-medium text-zinc-400 text-center">
              {preview
                ? <span className="text-indigo-400 font-semibold">Click to change photo</span>
                : <><span className="text-indigo-400 font-semibold">Upload profile photo</span></>
              }
            </p>
            {!preview && <p className="text-[11px] text-zinc-700">PNG, JPG · Max 5MB · Drag & drop or click</p>}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e=>handleFile(e.target.files?.[0])}/>
          </div>

          {/* Full name */}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-widest">Full name</label>
            <input value={fullname} onChange={e=>{setFullname(e.target.value);setError("");}} type="text" placeholder="Alex Morgan" autoComplete="name" className={`ifield${error&&!fullname.trim()?" has-error":""}`}/>
          </div>

          {/* Role */}
          <div className="mb-5">
            <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-widest">Your role</label>
            <div className="relative">
              <select value={myrole} onChange={e=>setMyrole(e.target.value)} className="iselect">
                {ROLES.map(r=><option key={r} value={r}>{r.replace(/_/g," ")}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none"/>
            </div>
          </div>

          {error && <p className="text-[12px] text-red-400 font-medium mb-3">{error}</p>}

          <button className="pbtn" onClick={submit} disabled={loading}>
            <span className="relative flex items-center justify-center gap-2">
              {loading && <span className="spinner w-4 h-4 rounded-full border-2 border-white/30 border-t-white"/>}
              {loading?"Saving profile…":"Continue to dashboard →"}
            </span>
          </button>

          <button onClick={()=>router.push("/dashboard")} className="w-full text-center text-[12.5px] text-zinc-700 hover:text-zinc-500 transition-colors mt-4 bg-transparent border-none cursor-pointer" style={{fontFamily:"'Outfit',sans-serif"}}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}