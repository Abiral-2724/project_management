"use client";
import Footer from "@/components/layout/Footer";
import { MarketingNav } from "../../components/layout/Marketinglayout";
import Link from "next/link";

const STATS = [
  { value: "10k+", label: "Teams worldwide",  suffix: "" },
  { value: "2M+",  label: "Tasks completed",  suffix: "" },
  { value: "98%",  label: "Uptime SLA",        suffix: "" },
  { value: "4.9★", label: "Average rating",    suffix: "" },
];

const VALUES = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "People first",
    desc: "We build for humans, not metrics. Every feature starts with a real team's real frustration.",
    color: "#6366f1",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    title: "Radical simplicity",
    desc: "Complexity is the enemy of productivity. We ruthlessly cut anything that doesn't serve the core purpose.",
    color: "#a78bfa",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Trust by default",
    desc: "We earn trust through transparency — in our pricing, our roadmap, and how we handle your data.",
    color: "#34d399",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
    title: "Globally minded",
    desc: "We're a remote-first team spread across time zones. Our product reflects that lived experience.",
    color: "#f59e0b",
  },
];

const TEAM = [
  { name: "Abiral Jain", role: "CEO & Co-founder", initials: "AJ", color: "#6366f1" },
];

const TIMELINE = [
  { year: "2022", title: "The idea",        desc: "Two engineers, tired of switching between five project tools, sketched Planzo on a train journey from Mumbai to Pune." },
  { year: "2023", title: "First version",   desc: "Launched to 50 beta teams. Got roasted. Rebuilt the entire UI from scratch. Launched again. This time it stuck."        },
  { year: "2024", title: "AI-first pivot",  desc: "Integrated Gemini AI across the product — task generation, smart digests, @mentions. 10× growth in 6 months."           },
  { year: "2025", title: "Going global",    desc: "Passed 10,000 active teams. Opened to enterprise. Still a small, opinionated team. Still no dark patterns."             },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ background: "#07070d", fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Instrument+Serif:ital@0;1&display=swap');

        * { font-family: 'Outfit', sans-serif; }

        .serif-italic { font-family: 'Instrument Serif', serif; font-style: italic; }

        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-18px) rotate(1deg); }
        }
        @keyframes float-med {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-10px) rotate(-0.5deg); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes line-grow {
          from { height: 0; opacity: 0; }
          to   { height: 100%; opacity: 1; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.6; }
          100% { transform: scale(2.2); opacity: 0;   }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .animate-float-slow { animation: float-slow 7s ease-in-out infinite; }
        .animate-float-med  { animation: float-med  5s ease-in-out infinite; }
        .animate-fade-up    { animation: fade-up    0.7s ease forwards; }
        .animate-spin-slow  { animation: spin-slow 20s linear infinite; }

        .shimmer-text {
          background: linear-gradient(90deg, #6366f1 0%, #a78bfa 30%, #e879f9 60%, #6366f1 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .stat-card:hover .stat-value { transform: scale(1.06); }
        .stat-value { transition: transform 0.3s ease; }

        .value-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
        }
        .value-card:hover {
          transform: translateY(-4px);
        }

        .timeline-dot::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 1.5px solid;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .timeline-item:hover .timeline-dot::after { opacity: 0.5; }

        .team-card:hover .team-avatar { transform: scale(1.08) translateY(-2px); }
        .team-avatar { transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }

        .noise {
          position: fixed; inset: 0; pointer-events: none; z-index: 0;
          opacity: 0.018;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        .grid-line-bg {
          background-image:
            linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        .cta-section {
          position: relative;
          overflow: hidden;
        }
        .cta-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08), rgba(232,121,249,0.06));
          border-radius: inherit;
        }
        .cta-section::after {
          content: '';
          position: absolute;
          top: 0; left: 50%; transform: translateX(-50%);
          width: 80%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(139,92,246,0.5), rgba(232,121,249,0.5), transparent);
        }
      `}</style>

      {/* noise overlay */}
      <div className="noise" />

      <MarketingNav />

      {/* ═══════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════ */}
      <section className="relative pt-36 pb-28 px-6 overflow-hidden grid-line-bg">

        {/* ambient blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-[0.12]"
            style={{ background: "radial-gradient(ellipse,#6366f1,#a78bfa)" }} />
          <div className="absolute top-20 right-[15%] w-[200px] h-[200px] rounded-full blur-[80px] opacity-[0.08]"
            style={{ background: "#e879f9" }} />
        </div>

        {/* floating decorative orbs */}
        <div className="absolute top-28 left-[8%] w-3 h-3 rounded-full bg-indigo-500/40 animate-float-slow" style={{animationDelay:"0s"}} />
        <div className="absolute top-44 left-[12%] w-1.5 h-1.5 rounded-full bg-violet-400/30 animate-float-slow" style={{animationDelay:"1.5s"}} />
        <div className="absolute top-32 right-[10%] w-2 h-2 rounded-full bg-pink-400/30 animate-float-med" style={{animationDelay:"0.7s"}} />
        <div className="absolute top-52 right-[16%] w-1 h-1 rounded-full bg-indigo-300/40 animate-float-slow" style={{animationDelay:"2s"}} />

        <div className="max-w-4xl mx-auto text-center relative" style={{animation:"fade-up 0.8s ease both"}}>

          {/* eyebrow pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 relative"
            style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", color:"#a5b4fc" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            Our story
          </div>

          {/* headline */}
          <h1 className="text-[52px] sm:text-[68px] font-black text-white leading-[1.0] tracking-tight mb-6">
            We're building the
            <br />
            <span className="serif-italic shimmer-text">PM tool we always wanted</span>
          </h1>

          <p className="text-lg text-zinc-400 leading-relaxed max-w-2xl mx-auto mb-10" style={{fontWeight:400}}>
            Planzo was born from frustration — too many tabs, too many tools, too little focus.
            We set out to build one coherent place where teams actually get things done.
          </p>

          {/* scroll hint */}
          <div className="flex flex-col items-center gap-2 opacity-30">
            <span className="text-[11px] uppercase tracking-widest text-zinc-600 font-semibold">Scroll to explore</span>
            <div className="w-px h-8 bg-gradient-to-b from-zinc-600 to-transparent" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          STATS
      ═══════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-2xl overflow-hidden"
          style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.05)" }}>
          {STATS.map((s, i) => (
            <div key={s.label}
              className="stat-card flex flex-col items-center justify-center py-10 px-6 relative overflow-hidden cursor-default"
              style={{ background:"#0c0c14" }}
            >
              {/* hover gradient */}
              <div className="absolute inset-0 opacity-0 transition-opacity duration-300 stat-hover-bg"
                style={{ background:`radial-gradient(ellipse at center,rgba(99,102,241,0.07),transparent 70%)` }} />
              <span className="stat-value text-4xl font-black mb-2 shimmer-text block">{s.value}</span>
              <span className="text-[12px] text-zinc-600 font-medium text-center leading-snug">{s.label}</span>
              {/* subtle divider line on right for all but last */}
              {i < 3 && (
                <div className="absolute right-0 top-[20%] bottom-[20%] w-px bg-zinc-800/80" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          MISSION
      ═══════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* left copy */}
          <div className="lg:sticky lg:top-24">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-5">Mission</p>
            <h2 className="text-[38px] font-black text-white leading-[1.05] mb-6">
              Make every team feel like a{" "}
              <span className="serif-italic" style={{ color:"#a78bfa" }}>world-class</span>{" "}team
            </h2>
            <p className="text-[15px] text-zinc-400 leading-relaxed mb-4">
              Most project management tools are built for enterprise procurement decks, not for
              the people who actually use them every day. Planzo is different.
            </p>
            <p className="text-[15px] text-zinc-400 leading-relaxed mb-8">
              We use AI to remove busywork, real-time collaboration to keep everyone aligned,
              and relentlessly simple design to stay out of your way. The goal: your team ships
              more, stresses less.
            </p>

            {/* mini highlight strip */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background:"rgba(99,102,241,0.06)", border:"1px solid rgba(99,102,241,0.15)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background:"rgba(99,102,241,0.15)", border:"1px solid rgba(99,102,241,0.25)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <p className="text-[12.5px] text-zinc-400 leading-snug">
                <span className="text-indigo-300 font-semibold">AI-powered</span> from day one — not bolted on later.
              </p>
            </div>
          </div>

          {/* right — values grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VALUES.map((v, i) => (
              <div key={v.title}
                className="value-card p-5 rounded-2xl relative overflow-hidden"
                style={{
                  background: "linear-gradient(160deg,rgba(255,255,255,0.025),rgba(255,255,255,0.01))",
                  border: `1px solid rgba(255,255,255,0.06)`,
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                {/* corner glow on hover */}
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none transition-opacity duration-300"
                  style={{ background:`radial-gradient(circle,${v.color}15,transparent 70%)`, transform:"translate(30%,-30%)" }} />

                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                  style={{ background:`${v.color}12`, border:`1px solid ${v.color}25`, color:v.color }}>
                  {v.icon}
                </div>
                <p className="text-[13px] font-bold text-zinc-100 mb-2">{v.title}</p>
                <p className="text-[12px] text-zinc-500 leading-relaxed">{v.desc}</p>

                {/* bottom accent line */}
                <div className="absolute bottom-0 left-5 right-5 h-px"
                  style={{ background:`linear-gradient(90deg,transparent,${v.color}30,transparent)` }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TIMELINE
      ═══════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 pb-28">

        <div className="text-center mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-3">Our journey</p>
          <h2 className="text-[36px] font-black text-white">
            Four years of{" "}
            <span className="serif-italic shimmer-text">building in public</span>
          </h2>
        </div>

        <div className="relative max-w-2xl mx-auto">
          {/* vertical line */}
          <div className="absolute left-[90px] top-4 bottom-4 w-px hidden sm:block"
            style={{ background:"linear-gradient(180deg,rgba(99,102,241,0.5),rgba(139,92,246,0.2),transparent)" }} />

          <div className="space-y-0">
            {TIMELINE.map((t, i) => (
              <div key={t.year}
                className="timeline-item relative flex gap-0 sm:gap-8 items-start group"
                style={{ paddingBottom: i < TIMELINE.length - 1 ? 40 : 0 }}
              >
                {/* year */}
                <div className="shrink-0 w-[82px] pt-0.5 text-right hidden sm:block">
                  <span className="text-[13px] font-black"
                    style={{ color: i === 0 ? "#a5b4fc" : i === TIMELINE.length - 1 ? "#34d399" : "#71717a" }}>
                    {t.year}
                  </span>
                </div>

                {/* dot */}
                <div className="relative hidden sm:flex items-start justify-center w-8 pt-1 shrink-0">
                  <div className="timeline-dot relative w-3 h-3 rounded-full border-2 transition-all duration-300"
                    style={{
                      borderColor: i === 0 ? "#6366f1" : i === TIMELINE.length - 1 ? "#34d399" : "#3f3f55",
                      background:  i === 0 ? "#6366f1" : i === TIMELINE.length - 1 ? "#34d399" : "#07070d",
                      boxShadow:   i === 0 ? "0 0 0 4px rgba(99,102,241,0.15)" : i === TIMELINE.length - 1 ? "0 0 0 4px rgba(52,211,153,0.12)" : "none",
                    }} />
                </div>

                {/* content */}
                <div className="flex-1 p-5 rounded-2xl transition-all duration-300 group-hover:bg-white/[0.02]"
                  style={{ border:"1px solid transparent" }}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="sm:hidden text-[11px] font-black text-indigo-400">{t.year}</span>
                    <h3 className="text-[15px] font-bold text-zinc-100">{t.title}</h3>
                  </div>
                  <p className="text-[13px] text-zinc-500 leading-relaxed">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════
          TEAM
      ═══════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 pb-28">
        <div className="text-center mb-14">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-3">The team</p>
          <h2 className="text-[36px] font-black text-white mb-3">Small team.{" "}
            <span className="serif-italic" style={{ color:"#a78bfa" }}>Big impact.</span>
          </h2>
          <p className="text-[15px] text-zinc-500 max-w-md mx-auto leading-relaxed">
            A distributed crew of builders, designers, and researchers who care deeply about craft.
          </p>
        </div>

        <div className="flex justify-center">
          {TEAM.map((m) => (
            <div key={m.name}
              className="team-card flex flex-col items-center text-center p-8 rounded-2xl w-52 relative overflow-hidden cursor-default"
              style={{
                background: "linear-gradient(160deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* ambient bg glow */}
              <div className="absolute inset-0 opacity-0 transition-opacity duration-500 hover:opacity-100"
                style={{ background:`radial-gradient(ellipse at 50% 0%,${m.color}10,transparent 70%)` }} />

              <div className="team-avatar relative mb-5">
                {/* ring pulse */}
                <div className="absolute inset-0 rounded-2xl"
                  style={{ background:`${m.color}10`, border:`1px solid ${m.color}20` }} />
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-xl font-black text-white relative"
                  style={{ background:`linear-gradient(135deg,${m.color}70,${m.color}30)`, border:`1px solid ${m.color}40` }}>
                  {m.initials}
                </div>
              </div>

              <p className="text-[14px] font-bold text-zinc-100 mb-1">{m.name}</p>
              <p className="text-[11px] font-medium text-zinc-600">{m.role}</p>

              {/* bottom badge */}
              <div className="mt-4 px-3 py-1 rounded-full text-[10px] font-bold"
                style={{ color:m.color, background:`${m.color}12`, border:`1px solid ${m.color}22` }}>
                Founder
              </div>
            </div>
          ))}
        </div>

        {/* "more coming soon" hint */}
        <p className="text-center text-[12px] text-zinc-700 mt-8">
          + more brilliant people joining soon
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════
          CTA
      ═══════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="cta-section rounded-3xl p-14 text-center relative"
          style={{ border:"1px solid rgba(99,102,241,0.2)" }}>

          {/* inner glow */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{ background:"radial-gradient(ellipse 70% 60% at 50% 0%,rgba(139,92,246,0.14),transparent)" }} />

          {/* decorative spinning ring */}
          <div className="absolute top-6 right-10 w-20 h-20 rounded-full opacity-10 animate-spin-slow"
            style={{ border:"1px dashed #a78bfa" }} />
          <div className="absolute bottom-8 left-10 w-12 h-12 rounded-full opacity-10 animate-spin-slow"
            style={{ border:"1px dashed #6366f1", animationDirection:"reverse", animationDuration:"15s" }} />

          <div className="relative">
            {/* eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-semibold mb-6"
              style={{ background:"rgba(139,92,246,0.1)", border:"1px solid rgba(139,92,246,0.2)", color:"#c4b5fd" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              We're hiring
            </div>

            <h2 className="text-[42px] font-black text-white mb-4 leading-tight">
              Want to join us?
            </h2>
            <p className="text-zinc-400 mb-10 text-[16px] max-w-md mx-auto leading-relaxed">
              We're always looking for people who care about craft and want to build something lasting.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/contact"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-[13px] font-black text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
                style={{ background:"linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow:"0 8px 32px rgba(99,102,241,0.35),inset 0 1px 0 rgba(255,255,255,0.12)" }}>
                Get in touch
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
              <Link href="/blog"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-[13px] font-semibold text-zinc-300 transition-all hover:text-white hover:-translate-y-0.5"
                style={{ border:"1px solid rgba(255,255,255,0.1)", background:"rgba(255,255,255,0.03)" }}>
                Read our blog
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}