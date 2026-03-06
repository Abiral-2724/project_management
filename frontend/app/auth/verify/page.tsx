"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { showToast } from "@/components/ui";
import { Zap, Mail } from "lucide-react";

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@1&family=Outfit:wght@400;500;600;700&display=swap');
  @keyframes orb-drift{0%{transform:translate(0,0) scale(1)}100%{transform:translate(20px,30px) scale(1.1)}}
  @keyframes dot-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes fadeslide{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}
  .orb-a{animation:orb-drift 13s ease-in-out infinite alternate;}
  .orb-b{animation:orb-drift 13s ease-in-out infinite alternate;animation-delay:-6s;}
  .dot-pulse{animation:dot-pulse 2s ease-in-out infinite;}
  .spinner{animation:spin .7s linear infinite;}
  .fadeslide{animation:fadeslide .5s ease .1s both;}
  .shake{animation:shake .4s ease;}
  .serif-italic{font-family:'Instrument Serif',serif;font-style:italic;}
  .otp-input{width:48px;height:56px;text-align:center;font-size:22px;font-weight:700;font-family:'Outfit',sans-serif;background:rgba(255,255,255,.03);border:1.5px solid rgba(255,255,255,.08);border-radius:12px;color:white;outline:none;caret-color:#6366f1;transition:all .2s;-webkit-appearance:none;}
  .otp-input:hover{border-color:rgba(255,255,255,.13);}
  .otp-input:focus{border-color:rgba(99,102,241,.7);background:rgba(99,102,241,.05);box-shadow:0 0 0 3px rgba(99,102,241,.12);transform:scale(1.05);}
  .otp-input.filled{border-color:rgba(99,102,241,.4);background:rgba(99,102,241,.06);}
  .otp-input.has-error{border-color:rgba(239,68,68,.5);background:rgba(239,68,68,.04);}
  .pbtn{width:100%;background:linear-gradient(135deg,#6366f1,#7c3aed);color:white;border:none;border-radius:12px;padding:13px 20px;font-family:'Outfit',sans-serif;font-size:14px;font-weight:600;cursor:pointer;position:relative;overflow:hidden;transition:transform .15s,box-shadow .2s,opacity .2s;box-shadow:0 4px 20px rgba(99,102,241,.3);}
  .pbtn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.1),transparent);}
  .pbtn:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 28px rgba(99,102,241,.45);}
  .pbtn:disabled{opacity:.6;cursor:not-allowed;}
`;

const STEPS = [
  { num:"✓", title:"Create account", desc:"Email & password set", state:"done" },
  { num:"2",  title:"Verify email",   desc:"Enter the 6-digit code", state:"active" },
  { num:"3",  title:"Set up profile", desc:"Name, role & photo",    state:"upcoming" },
];

export default function VerifyPage({ searchParams }) {
  const router = useRouter();
  const { id } = use(searchParams);
  const [otp, setOtp] = useState(["","","","","",""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [shake, setShake] = useState(false);
  const refs = useRef([]);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    setError("");
    const next = [...otp]; next[i] = v.slice(-1); setOtp(next);
    if (v && i < 5) refs.current[i+1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace") {
      if (otp[i]) { const n=[...otp];n[i]="";setOtp(n); }
      else if (i > 0) refs.current[i-1]?.focus();
    }
    if (e.key === "ArrowLeft" && i > 0) refs.current[i-1]?.focus();
    if (e.key === "ArrowRight" && i < 5) refs.current[i+1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    if (pasted.length === 6) { setOtp(pasted.split("")); refs.current[5]?.focus(); }
    e.preventDefault();
  };

  const triggerShake = () => { setShake(true); setTimeout(()=>setShake(false),500); };

  const submit = async () => {
    const code = otp.join("");
    if (code.length !== 6) { setError("Please enter all 6 digits"); triggerShake(); return; }
    setLoading(true);
    try {
      await api.auth.verifyEmail(id, parseInt(code));
      router.push(`/auth/setup?id=${id}`);
    } catch (e) { setError(e.message); triggerShake(); }
    finally { setLoading(false); }
  };

  const resend = async () => {
    if (countdown > 0) return;
    setResending(true);
    try { await api.auth.resendOtp(id); showToast("New code sent!"); setCountdown(30); setOtp(["","","","","",""]); refs.current[0]?.focus(); }
    catch (e) { showToast(e.message,"error"); }
    finally { setResending(false); }
  };

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
        <div className="absolute inset-0" style={{background:"radial-gradient(ellipse 70% 70% at 50% 30%,rgba(99,102,241,.14),transparent 65%),radial-gradient(ellipse 60% 60% at 80% 80%,rgba(139,92,246,.1),transparent 60%),linear-gradient(160deg,#0d0d1a,#09090f,#0a0814)"}}/>
        <div className="absolute inset-0" style={{backgroundImage:"linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px)",backgroundSize:"48px 48px",maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%,black 40%,transparent 100%)"}}/>
        <div className="orb-a absolute w-80 h-80 -top-10 -left-14 rounded-full" style={{background:"rgba(99,102,241,.13)",filter:"blur(80px)"}}/>
        <div className="orb-b absolute w-64 h-64 bottom-20 right-14 rounded-full" style={{background:"rgba(139,92,246,.1)",filter:"blur(80px)"}}/>

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{background:"linear-gradient(135deg,#6366f1,#8b5cf6)",boxShadow:"0 0 24px rgba(99,102,241,.4)"}}>
            <Zap size={18} strokeWidth={2.5}/>
          </div>
          <span className="text-white text-xl font-bold tracking-tight">Planzo</span>
        </div>

        {/* Steps */}
        <div className="relative z-10 flex-1 flex flex-col justify-center py-20">
          <p className="text-[11px] font-semibold text-zinc-600 uppercase tracking-widest mb-6">Getting started</p>
          <div className="flex flex-col">
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

          <div className="mt-8 pt-8" style={{borderTop:"1px solid rgba(255,255,255,.05)"}}>
            <p className="serif-italic text-[clamp(18px,1.8vw,22px)] text-zinc-600 leading-relaxed mb-3">
              "Almost there — one small step before the real work begins."
            </p>
            <p className="text-[11px] text-zinc-700 uppercase tracking-widest font-medium">— Planzo Team</p>
          </div>
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="w-full lg:w-[480px] flex-shrink-0 flex items-center justify-center px-8 py-12 relative" style={{background:"#0f0f17",borderLeft:"1px solid rgba(255,255,255,.05)"}}>
        <div className="absolute inset-0 pointer-events-none" style={{background:"radial-gradient(ellipse 100% 60% at 50% 0%,rgba(99,102,241,.06),transparent 70%)"}}/>

        <div className={`relative z-10 w-full max-w-[360px] ${mounted?"fadeslide":"opacity-0"}`}>
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-indigo-400" style={{background:"linear-gradient(135deg,rgba(99,102,241,.15),rgba(139,92,246,.1))",border:"1px solid rgba(99,102,241,.2)"}}>
            <Mail size={28} strokeWidth={1.5}/>
          </div>

          <h2 className="text-[26px] font-bold text-white tracking-tight mb-2">Check your inbox</h2>
          <p className="text-[13.5px] text-zinc-600 leading-relaxed mb-8">
            We've sent a 6-digit code to your email address.<br/>
            <span className="text-zinc-500 font-medium">It expires in 10 minutes.</span>
          </p>

          {/* OTP */}
          <div className={`flex gap-2 justify-center mb-2 ${shake?"shake":""}`} onPaste={handlePaste}>
            {otp.map((v,i) => (
              <input
                key={i}
                ref={el=>refs.current[i]=el}
                value={v}
                maxLength={1}
                inputMode="numeric"
                onChange={e=>handleChange(i,e.target.value)}
                onKeyDown={e=>handleKeyDown(i,e)}
                className={`otp-input${v?" filled":""}${error?" has-error":""}`}
              />
            ))}
          </div>

          <p className="text-center text-[12px] text-red-400 font-medium min-h-[18px] mb-5">{error}</p>

          <button className="pbtn" onClick={submit} disabled={loading}>
            <span className="relative flex items-center justify-center gap-2">
              {loading && <span className="spinner w-4 h-4 rounded-full border-2 border-white/30 border-t-white"/>}
              {loading?"Verifying…":"Verify email"}
            </span>
          </button>

          <div className="flex items-center justify-center gap-2 mt-5 text-[13px] text-zinc-600">
            <span>Didn't get a code?</span>
            <button onClick={resend} disabled={resending||countdown>0} className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors disabled:text-zinc-700 disabled:cursor-default bg-transparent border-none cursor-pointer" style={{fontFamily:"'Outfit',sans-serif",fontSize:13}}>
              {resending?"Sending…":"Resend"}
            </button>
            {countdown > 0 && <span className="font-semibold text-zinc-600">in {countdown}s</span>}
          </div>
        </div>
      </div>
    </div>
  );
}