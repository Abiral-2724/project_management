"use client";
import { useState } from "react";
import { MarketingNav } from "../../components/layout/Marketinglayout";
import Footer from "@/components/layout/Footer";

const TOPICS = [
  "General inquiry", "Sales", "Technical support",
  "Bug report", "Partnership", "Press & media", "Other",
];

const CHANNELS = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    label: "Email us",
    value: "help.planzo@gmail.com",
    sub: "We reply within 24 hours",
    href: "mailto:help.planzo@gmail.com",
    color: "#6366f1",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    label: "Live chat",
    value: "Chat with support",
    sub: "Mon–Fri, 9am–6pm IST",
    href: "#",
    color: "#a78bfa",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    label: "Help center",
    value: "Browse docs & FAQs",
    sub: "Self-serve, always available",
    href: "#",
    color: "#34d399",
  },
];

export default function ContactPage() {
  const [form, setForm]     = useState({ name: "", email: "", topic: "", message: "" });
  const [status, setStatus] = useState("idle");
  const [focused, setFocused] = useState(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    await new Promise((r) => setTimeout(r, 1400));
    setStatus("done");
  };

  const inputBase = (name) =>
    `w-full rounded-xl px-4 py-3 text-[13.5px] text-zinc-200 placeholder-zinc-600 outline-none transition-all duration-200 border ${
      focused === name
        ? "border-indigo-500/50 shadow-[0_0_0_3px_rgba(99,102,241,0.1)] bg-[#0f0f1a]"
        : "border-zinc-800/80 hover:border-zinc-700/80 bg-[#0c0c14]"
    }`;

  return (
    <div className="min-h-screen" style={{ background: "#07070d", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap');
        * { font-family: 'Outfit', sans-serif; }
        .serif-italic { font-family: 'Instrument Serif', serif; font-style: italic; }

        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes check-draw {
          from { stroke-dashoffset: 40; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes scale-in {
          from { transform: scale(0.7); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }

        .shimmer-text {
          background: linear-gradient(90deg, #6366f1 0%, #a78bfa 35%, #e879f9 65%, #6366f1 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .hero-fade  { animation: fade-up 0.75s ease both; }
        .float-orb  { animation: float 6s ease-in-out infinite; }
        .spin-loader { animation: spin 0.8s linear infinite; }
        .success-scale { animation: scale-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
        .check-path {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: check-draw 0.5s 0.3s ease forwards;
        }

        .channel-card {
          transition: transform 0.22s ease, border-color 0.22s ease, background 0.22s ease;
        }
        .channel-card:hover {
          transform: translateY(-3px);
        }

        .submit-btn {
          transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 12px 40px rgba(99,102,241,0.45) !important;
        }
        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .grid-bg {
          background-image:
            linear-gradient(rgba(99,102,241,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.035) 1px, transparent 1px);
          background-size: 56px 56px;
        }

        .noise-overlay {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          opacity: 0.016;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }

        select option { background: #111118; color: #e4e4e7; }
      `}</style>

      <div className="noise-overlay" />
      <MarketingNav />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden grid-bg">

        {/* ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[420px] pointer-events-none">
          <div className="absolute inset-0 rounded-full blur-[130px] opacity-[0.11]"
            style={{ background: "radial-gradient(ellipse,#6366f1,#a78bfa)" }} />
          <div className="absolute top-16 right-[10%] w-[160px] h-[160px] rounded-full blur-[80px] opacity-[0.07]"
            style={{ background: "#e879f9" }} />
        </div>

        {/* floating dots */}
        <div className="absolute top-28 left-[6%] w-2.5 h-2.5 rounded-full bg-indigo-500/35 float-orb" style={{animationDelay:"0s"}} />
        <div className="absolute top-40 left-[14%] w-1.5 h-1.5 rounded-full bg-violet-400/25 float-orb" style={{animationDelay:"1.8s"}} />
        <div className="absolute top-32 right-[8%]  w-2   h-2   rounded-full bg-pink-400/25   float-orb" style={{animationDelay:"0.9s"}} />
        <div className="absolute top-52 right-[15%] w-1   h-1   rounded-full bg-indigo-300/35 float-orb" style={{animationDelay:"2.4s"}} />

        <div className="max-w-3xl mx-auto text-center relative hero-fade">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold mb-8"
            style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", color:"#a5b4fc" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Contact
          </div>

          <h1 className="text-[56px] sm:text-[68px] font-black text-white leading-[1.0] tracking-tight mb-5">
            Let's{" "}
            <span className="serif-italic shimmer-text">talk</span>
          </h1>

          <p className="text-[17px] text-zinc-400 leading-relaxed max-w-xl mx-auto">
            Have a question, idea, or just want to say hello?<br />We'd love to hear from you.
          </p>
        </div>
      </section>

      {/* ── CHANNEL CARDS ────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-16 relative">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {CHANNELS.map((c, i) => (
            <a key={c.label} href={c.href}
              className="channel-card group flex flex-col gap-4 p-6 rounded-2xl relative overflow-hidden"
              style={{
                background: "linear-gradient(160deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))",
                border: "1px solid rgba(255,255,255,0.06)",
                animationDelay: `${i * 0.1}s`,
              }}
            >
              {/* hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background:`radial-gradient(ellipse at 20% 20%,${c.color}10,transparent 70%)` }} />

              {/* top accent line */}
              <div className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background:`linear-gradient(90deg,transparent,${c.color}50,transparent)` }} />

              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105"
                style={{ background:`${c.color}12`, border:`1px solid ${c.color}25`, color:c.color }}>
                {c.icon}
              </div>

              <div>
                <p className="text-[13px] font-bold text-zinc-100 mb-1">{c.label}</p>
                <p className="text-[13px] font-semibold mb-1.5 transition-colors duration-200"
                  style={{ color: c.color }}>{c.value}</p>
                <p className="text-[11.5px] text-zinc-600">{c.sub}</p>
              </div>

              {/* arrow */}
              <div className="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-1 group-hover:translate-x-0"
                style={{ color: c.color }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ── FORM + SIDE ──────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14">

          {/* ── Sidebar ── */}
          <div className="lg:col-span-2 space-y-7">

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-4">Send a message</p>
              <h2 className="text-[32px] font-black text-white leading-tight mb-3">
                We read{" "}
                <span className="serif-italic" style={{ color:"#a78bfa" }}>every</span>{" "}message
              </h2>
              <p className="text-[14px] text-zinc-500 leading-relaxed">
                Fill out the form and we'll get back to you within one business day.
                For urgent issues, use live chat.
              </p>
            </div>

            {/* office card */}
            <div className="p-5 rounded-2xl space-y-4"
              style={{ background:"linear-gradient(160deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))", border:"1px solid rgba(255,255,255,0.06)" }}>

              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-600">Office</p>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.18)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="1.8">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[13px] text-zinc-300 font-medium leading-snug">Tikamgarh, Madhya Pradesh</p>
                  <p className="text-[12px] text-zinc-600">India 472001</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background:"rgba(99,102,241,0.1)", border:"1px solid rgba(99,102,241,0.18)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <p className="text-[13px] text-zinc-400">Mon–Fri · 9:00 AM – 6:00 PM IST</p>
              </div>

              {/* response time badge */}
              <div className="flex items-center gap-2 pt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11.5px] text-zinc-500">Avg. response time: <span className="text-emerald-400 font-semibold">&lt; 4 hours</span></span>
              </div>
            </div>

            {/* social links */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-zinc-700 mb-3">Find us on</p>
              <div className="flex items-center gap-2">
                {[
                  { label:"Twitter", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                  { label:"LinkedIn", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
                ].map(s => (
                  <button key={s.label}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium text-zinc-500 hover:text-zinc-300 transition-all hover:bg-zinc-800/50"
                    style={{ border:"1px solid rgba(255,255,255,0.06)" }}>
                    {s.icon}
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── Form ── */}
          <div className="lg:col-span-3">
            {status === "done" ? (
              <div className="flex flex-col items-center justify-center text-center py-20 px-8 rounded-2xl"
                style={{ background:"linear-gradient(160deg,rgba(16,185,129,0.05),rgba(16,185,129,0.02))", border:"1px solid rgba(16,185,129,0.15)" }}>

                <div className="success-scale w-20 h-20 rounded-full flex items-center justify-center mb-6"
                  style={{ background:"rgba(16,185,129,0.12)", border:"2px solid rgba(16,185,129,0.3)" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                    <polyline className="check-path" points="20 6 9 17 4 12"/>
                  </svg>
                </div>

                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-500/70 mb-3">Message received</p>
                <h3 className="text-[28px] font-black text-white mb-2">You're all set!</h3>
                <p className="text-[14px] text-zinc-500 leading-relaxed max-w-sm">
                  Thanks for reaching out. We'll get back to you within 24 hours.
                </p>

                <button onClick={() => { setStatus("idle"); setForm({ name:"", email:"", topic:"", message:"" }); }}
                  className="mt-8 flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-indigo-400 transition-all hover:text-indigo-300 hover:bg-indigo-500/8"
                  style={{ border:"1px solid rgba(99,102,241,0.2)" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M19 12H5M12 5l-7 7 7 7"/>
                  </svg>
                  Send another message
                </button>
              </div>
            ) : (
              <div className="p-7 rounded-2xl"
                style={{ background:"linear-gradient(160deg,rgba(255,255,255,0.025),rgba(255,255,255,0.008))", border:"1px solid rgba(255,255,255,0.07)" }}>

                <div className="flex items-center gap-3 mb-7">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.2)" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </div>
                  <div>
                    <p className="text-[13.5px] font-bold text-zinc-100">New message</p>
                    <p className="text-[11px] text-zinc-600">All fields required</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">

                  {/* name + email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 tracking-wide">Your name</label>
                      <input value={form.name} onChange={e => set("name", e.target.value)}
                        onFocus={() => setFocused("name")} onBlur={() => setFocused(null)}
                        placeholder="Ada Lovelace" required className={inputBase("name")} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 tracking-wide">Email address</label>
                      <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                        onFocus={() => setFocused("email")} onBlur={() => setFocused(null)}
                        placeholder="ada@example.com" required className={inputBase("email")} />
                    </div>
                  </div>

                  {/* topic */}
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 tracking-wide">Topic</label>
                    <div className="relative">
                      <select value={form.topic} onChange={e => set("topic", e.target.value)}
                        onFocus={() => setFocused("topic")} onBlur={() => setFocused(null)}
                        required className={inputBase("topic") + " appearance-none cursor-pointer pr-10"}>
                        <option value="">Select a topic…</option>
                        {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* message */}
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-500 mb-1.5 tracking-wide">Message</label>
                    <textarea value={form.message} onChange={e => set("message", e.target.value)}
                      onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
                      placeholder="Tell us what's on your mind…" rows={6} required
                      className={inputBase("message") + " resize-none"} />
                    <p className="text-[11px] text-zinc-700 mt-1.5 text-right">
                      {form.message.length} / 1000
                    </p>
                  </div>

                  {/* submit */}
                  <button type="submit" disabled={status === "sending"}
                    className="submit-btn w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-[13.5px] font-black text-white disabled:opacity-50"
                    style={{ background:"linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow:"0 8px 28px rgba(99,102,241,0.32),inset 0 1px 0 rgba(255,255,255,0.1)" }}>
                    {status === "sending" ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full spin-loader" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send message
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="22" y1="2" x2="11" y2="13"/>
                          <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-zinc-700">
                    By submitting, you agree to our{" "}
                    <a href="#" className="text-zinc-600 hover:text-zinc-400 transition-colors underline underline-offset-2">Privacy Policy</a>.
                  </p>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}