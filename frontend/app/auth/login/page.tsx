"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Zap, Eye, EyeOff, AlertCircle } from "lucide-react";

const FEATURES = [
  { icon: "⚡", label: "Real-time collaboration" },
  { icon: "📋", label: "Kanban workflows" },
  { icon: "🔔", label: "Smart notifications" },
  { icon: "📊", label: "Productivity insights" },
];

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

/* shared minimal CSS — only things Tailwind can't do */
const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&family=Outfit:wght@400;500;600;700&display=swap');
  .font-outfit *{font-family:'Outfit',sans-serif;}
  .serif-italic{font-family:'Instrument Serif',serif;font-style:italic;}
  @keyframes orb-drift{0%{transform:translate(0,0) scale(1)}100%{transform:translate(20px,30px) scale(1.1)}}
  @keyframes dot-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeslide{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  .orb-1{animation:orb-drift 13s ease-in-out infinite alternate;}
  .orb-2{animation:orb-drift 13s ease-in-out infinite alternate;animation-delay:-5s;}
  .dot-pulse{animation:dot-pulse 2s ease-in-out infinite;}
  .spinner{animation:spin .7s linear infinite;}
  .fadeslide{animation:fadeslide .5s ease .1s both;}
  .ifield{width:100%;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px 16px;font-size:14px;font-family:'Outfit',sans-serif;color:#f4f4f5;outline:none;transition:all .2s ease;-webkit-appearance:none;}
  .ifield::placeholder{color:#3f3f46;}
  .ifield:hover{border-color:rgba(255,255,255,0.13);background:rgba(255,255,255,0.04);}
  .ifield:focus{border-color:rgba(99,102,241,.65);background:rgba(99,102,241,.04);box-shadow:0 0 0 3px rgba(99,102,241,.1);}
  .ifield.has-error{border-color:rgba(239,68,68,.5);background:rgba(239,68,68,.03);}
  .ifield.has-error:focus{box-shadow:0 0 0 3px rgba(239,68,68,.1);}
  .ifield-pr{padding-right:44px;}
  .pbtn{width:100%;background:linear-gradient(135deg,#6366f1,#7c3aed);color:white;border:none;border-radius:12px;padding:13px 20px;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;cursor:pointer;position:relative;overflow:hidden;transition:transform .15s,box-shadow .2s,opacity .2s;box-shadow:0 4px 20px rgba(99,102,241,.3);}
  .pbtn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.1),transparent);}
  .pbtn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 28px rgba(99,102,241,.45);}
  .pbtn:active:not(:disabled){transform:translateY(0);}
  .pbtn:disabled{opacity:.6;cursor:not-allowed;}
`;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const submit = async (e) => {
    e?.preventDefault();
    const errs = {};
    if (!email) errs.email = "Email is required";
    if (!password) errs.password = "Password is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const user = await login(email, password);
      if (!user.isVerified) { router.push(`/auth/verify?id=${user.id}`); return; }
      if (!user.fullname || user.fullname === "asana") { router.push(`/auth/setup?id=${user.id}`); return; }
      router.push("/dashboard");
    } catch (e) {
      setErrors({ form: e.message });
    } finally { setLoading(false); }
  };

  return (
    <div className="font-outfit min-h-screen bg-[#09090f] flex overflow-hidden">
      <style>{BASE_CSS}</style>

      {/* ── LEFT ── */}
      <div className="flex-1 relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0" style={{background:"radial-gradient(ellipse 80% 60% at 10% 20%,rgba(99,102,241,.18),transparent 60%),radial-gradient(ellipse 60% 80% at 90% 80%,rgba(139,92,246,.12),transparent 60%),linear-gradient(160deg,#0d0d1a,#09090f,#0a0814)"}} />
        <div className="absolute inset-0" style={{backgroundImage:"linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px)",backgroundSize:"48px 48px",maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%)"}} />
        <div className="orb-1 absolute w-96 h-96 -top-16 -left-16 rounded-full" style={{background:"rgba(99,102,241,.15)",filter:"blur(80px)"}} />
        <div className="orb-2 absolute w-72 h-72 bottom-20 right-5 rounded-full" style={{background:"rgba(139,92,246,.12)",filter:"blur(80px)"}} />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",boxShadow:"0 0 24px rgba(99,102,241,.4)"}}>
            <Zap size={18} strokeWidth={2.5}/>
          </div>
          <span className="text-white text-xl font-bold tracking-tight">Planzo</span>
        </div>

        {/* Hero */}
        <div className="relative z-10 flex flex-col py-20">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-7 w-fit text-[11px] font-medium tracking-widest uppercase text-indigo-300" style={{background:"rgba(99,102,241,.12)",border:"1px solid rgba(99,102,241,.25)"}}>
            <span className="dot-pulse w-1.5 h-1.5 rounded-full bg-indigo-500" /> Project Management
          </div>
          <h1 className="text-[clamp(36px,3.8vw,52px)] leading-[1.1] font-bold text-white mb-5 tracking-tight">
            Where great<br/>
            <span className="serif-italic" style={{background:"linear-gradient(135deg,#818cf8,#c084fc)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>teams ship</span>
            <br/>great work.
          </h1>
          <p className="text-[15px] text-zinc-500 leading-relaxed max-w-sm mb-12">
            Kanban boards, real-time collaboration, smart notifications — everything your team needs to move faster and stay aligned.
          </p>
          <div className="flex flex-wrap gap-2.5">
            {FEATURES.map(f => (
              <div key={f.label} className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12.5px] font-medium text-zinc-400 transition-colors hover:text-indigo-300 cursor-default" style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)"}}>
                <span>{f.icon}</span>{f.label}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 flex gap-8 pt-8" style={{borderTop:"1px solid rgba(255,255,255,.05)"}}>
          {[["10k+","Teams"],["99.9%","Uptime"],["2M+","Tasks done"]].map(([n,l])=>(
            <div key={l}>
              <p className="text-[22px] font-bold text-white tracking-tight">{n}</p>
              <p className="text-[11px] text-zinc-600 font-medium uppercase tracking-wider">{l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="w-full lg:w-[480px] flex-shrink-0 flex items-center justify-center px-8 py-12 relative" style={{background:"#0f0f17",borderLeft:"1px solid rgba(255,255,255,.05)"}}>
        <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse 100% 60% at 50% 0%,rgba(99,102,241,.06),transparent 70%)"}} />

        <div className={`relative z-10 w-full max-w-[360px] ${mounted?"fadeslide":"opacity-0"}`}>
          <div className="mb-7">
            <h2 className="text-[26px] font-bold text-white tracking-tight mb-1.5">Welcome back</h2>
            <p className="text-[13.5px] text-zinc-600">
              New to Planzo?{" "}
              <Link href="/auth/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">Create a free account →</Link>
            </p>
          </div>

          {errors.form && (
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl mb-5 text-[13px] text-red-400" style={{background:"rgba(239,68,68,.08)",border:"1px solid rgba(239,68,68,.2)"}}>
              <AlertCircle size={14}/>{errors.form}
            </div>
          )}

          <form onSubmit={submit} noValidate className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-widest">Email address</label>
              <input value={email} onChange={e=>{setEmail(e.target.value);setErrors(p=>({...p,email:""}))}} type="email" placeholder="you@company.com" autoComplete="email" className={`ifield${errors.email?" has-error":""}`}/>
              {errors.email && <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 uppercase tracking-widest">Password</label>
              <div className="relative">
                <input value={password} onChange={e=>{setPassword(e.target.value);setErrors(p=>({...p,password:""}))}} type={showPass?"text":"password"} placeholder="••••••••" autoComplete="current-password" className={`ifield ifield-pr${errors.password?" has-error":""}`}/>
                <button type="button" onClick={()=>setShowPass(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors">
                  {showPass?<EyeOff size={15}/>:<Eye size={15}/>}
                </button>
              </div>
              {errors.password && <p className="text-[11px] text-red-400 mt-1 font-medium">{errors.password}</p>}
            </div>

            <div className="flex justify-end">
              <Link href="/auth/forgot" className="text-[12px] text-indigo-400 font-medium hover:text-indigo-300 transition-colors">Forgot password?</Link>
            </div>

            <button type="submit" className="pbtn" disabled={loading}>
              <span className="relative flex items-center justify-center gap-2">
                {loading && <span className="spinner w-4 h-4 rounded-full border-2 border-white/30 border-t-white"/>}
                {loading?"Signing in…":"Sign in to workspace"}
              </span>
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{background:"rgba(255,255,255,.05)"}}/>
            <span className="text-[11px] text-zinc-700 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px" style={{background:"rgba(255,255,255,.05)"}}/>
          </div>

          <button className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl text-[13.5px] font-medium text-zinc-400 transition-all hover:text-zinc-200 hover:bg-white/5" style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)"}}>
            <GoogleIcon/> Sign in with Google
          </button>

          <p className="text-center text-[13px] text-zinc-600 mt-6">
            Don't have an account?{" "}
            <Link href="/auth/register" className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}