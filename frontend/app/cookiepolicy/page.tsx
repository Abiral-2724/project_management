import Footer from "@/components/layout/Footer";
import { MarketingNav } from "@/components/layout/Marketinglayout";
import Link from "next/link";

const COOKIE_TYPES = [
  {
    name: "Essential cookies",
    color: "#10b981",
    canDisable: false,
    desc: "Required for the Service to function. These include session tokens, CSRF protection, and authentication state.",
    examples: ["Planzo_session", "csrf_token", "auth_token"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    name: "Preference cookies",
    color: "#6366f1",
    canDisable: true,
    desc: "Remember your settings, such as sidebar state, theme preferences, and notification configuration.",
    examples: ["sidebar_collapsed", "last_viewed_project"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
        <line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/>
      </svg>
    ),
  },
  {
    name: "Analytics cookies",
    color: "#f59e0b",
    canDisable: true,
    desc: "Help us understand how the product is used so we can improve it. Data is aggregated and anonymised.",
    examples: ["page_views", "feature_usage"],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
  },
];

const SECTIONS = [
  {
    title: "What are cookies?",
    content: [
      "A cookie is a small data file placed on your device when you visit a website. Cookies help websites remember information about your visit, making your next visit easier and the site more useful to you.",
      "We also use localStorage and sessionStorage (browser storage technologies that work similarly to cookies) to store state client-side.",
    ],
  },
  {
    title: "Third-party cookies",
    content: [
      "We do not use third-party advertising cookies. Some of our third-party services (Cloudinary, Google Gemini) may set their own cookies as described in their respective privacy policies. We do not control these cookies.",
    ],
  },
  {
    title: "How to manage cookies",
    content: [
      "You can control and delete cookies through your browser settings. Note that disabling essential cookies will prevent you from logging in and using the Service.",
      "Most browsers allow you to: view cookies stored, block cookies from specific sites, block all third-party cookies, and delete all cookies when you close the browser.",
      "Refer to your browser's help documentation for instructions specific to your browser.",
    ],
  },
  {
    title: "Cookie retention",
    content: [
      "Session cookies are deleted when you close your browser. Persistent cookies are stored for up to 30 days (authentication) or 12 months (preferences). You can delete them at any time.",
    ],
  },
];

export default function CookiesPage() {
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
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-10px); }
        }

        .shimmer-text {
          background: linear-gradient(90deg, #6366f1 0%, #a78bfa 35%, #e879f9 65%, #6366f1 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .hero-fade { animation: fade-up 0.75s ease both; }
        .float-orb { animation: float 6s ease-in-out infinite; }

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
        .cookie-card {
          transition: transform 0.22s ease, border-color 0.22s ease;
        }
        .cookie-card:hover {
          transform: translateY(-2px);
        }
        .section-item {
          transition: border-color 0.2s ease;
        }
        .section-item:hover {
          border-color: rgba(99,102,241,0.2) !important;
        }
        code {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
        }
      `}</style>

      <div className="noise-overlay" />
      <MarketingNav />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden grid-bg">
        {/* ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none">
          <div className="absolute inset-0 rounded-full blur-[130px] opacity-[0.1]"
            style={{ background: "radial-gradient(ellipse,#6366f1,#a78bfa)" }} />
          <div className="absolute top-10 right-[12%] w-[140px] h-[140px] rounded-full blur-[70px] opacity-[0.07]"
            style={{ background: "#e879f9" }} />
        </div>

        {/* floating dots */}
        <div className="absolute top-28 left-[7%]  w-2   h-2   rounded-full bg-indigo-400/30 float-orb" style={{animationDelay:"0s"}} />
        <div className="absolute top-44 left-[13%] w-1.5 h-1.5 rounded-full bg-violet-300/25 float-orb" style={{animationDelay:"1.5s"}} />
        <div className="absolute top-32 right-[9%]  w-2   h-2   rounded-full bg-pink-400/25   float-orb" style={{animationDelay:"0.8s"}} />

        <div className="max-w-3xl mx-auto text-center relative hero-fade">
          {/* eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold mb-8"
            style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", color:"#a5b4fc" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Legal · Cookie Policy
          </div>

          {/* headline */}
          <h1 className="text-[52px] sm:text-[64px] font-black text-white leading-[1.0] tracking-tight mb-5">
            Cookies,{" "}
            <span className="serif-italic shimmer-text">clearly</span>
          </h1>

          <p className="text-[17px] text-zinc-400 leading-relaxed max-w-xl mx-auto mb-6">
            We use cookies sparingly and only for purposes that directly improve your experience.
          </p>

          {/* last updated */}
          <div className="inline-flex items-center gap-2 text-[11.5px] text-zinc-600">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Last updated: March 1, 2026
          </div>
        </div>
      </section>

      {/* ── BODY ─────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-6 pb-24 relative">

        {/* intro callout */}
        <div className="mb-10 px-5 py-4 rounded-2xl"
          style={{ background:"rgba(99,102,241,0.05)", borderLeft:"3px solid rgba(99,102,241,0.4)", border:"1px solid rgba(99,102,241,0.12)" }}>
          <p className="text-[14.5px] text-zinc-400 leading-relaxed">
            Cookies are small text files stored on your device by your browser. This policy explains which cookies we use, why, and how you can control them.
          </p>
        </div>

        {/* ── What are cookies ── */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 rounded-full" style={{ background:"linear-gradient(180deg,#6366f1,#8b5cf6)" }} />
            <h2 className="text-[19px] font-black text-white">What are cookies?</h2>
          </div>
          <div className="pl-4 border-l border-zinc-800 space-y-3">
            <p className="text-[14.5px] text-zinc-400 leading-relaxed">
              A cookie is a small data file placed on your device when you visit a website. Cookies help websites remember information about your visit, making your next visit easier and the site more useful to you.
            </p>
            <p className="text-[14.5px] text-zinc-400 leading-relaxed">
              We also use <code className="text-[13px] px-1.5 py-0.5 rounded text-indigo-300 bg-indigo-500/10 border border-indigo-500/15">localStorage</code> and{" "}
              <code className="text-[13px] px-1.5 py-0.5 rounded text-indigo-300 bg-indigo-500/10 border border-indigo-500/15">sessionStorage</code>{" "}
              (browser storage technologies that work similarly to cookies) to store state client-side.
            </p>
          </div>
        </section>

        {/* ── Cookies we use ── */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full" style={{ background:"linear-gradient(180deg,#6366f1,#8b5cf6)" }} />
            <h2 className="text-[19px] font-black text-white">Cookies we use</h2>
          </div>

          <div className="space-y-4">
            {COOKIE_TYPES.map((ct) => (
              <div key={ct.name}
                className="cookie-card p-5 rounded-2xl relative overflow-hidden"
                style={{
                  background: "linear-gradient(160deg,rgba(255,255,255,0.025),rgba(255,255,255,0.008))",
                  border: `1px solid ${ct.color}20`,
                }}
              >
                {/* top accent line */}
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background:`linear-gradient(90deg,transparent,${ct.color}40,transparent)` }} />

                {/* corner glow */}
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
                  style={{ background:`radial-gradient(circle,${ct.color}10,transparent 70%)`, transform:"translate(30%,-30%)" }} />

                {/* header row */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background:`${ct.color}15`, border:`1px solid ${ct.color}30`, color:ct.color }}>
                    {ct.icon}
                  </div>
                  <span className="text-[14px] font-bold text-zinc-100">{ct.name}</span>
                  <span className={`ml-auto text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                    ct.canDisable
                      ? "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                      : "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                  }`}>
                    {ct.canDisable ? "Optional" : "Required"}
                  </span>
                </div>

                <p className="text-[13.5px] text-zinc-500 leading-relaxed mb-4">{ct.desc}</p>

                {/* code examples */}
                <div className="flex flex-wrap gap-2">
                  {ct.examples.map((e) => (
                    <code key={e}
                      className="text-[12px] px-2.5 py-1 rounded-lg font-mono"
                      style={{ color: ct.color, background:`${ct.color}10`, border:`1px solid ${ct.color}20` }}>
                      {e}
                    </code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── remaining sections ── */}
        {SECTIONS.slice(1).map((s) => (
          <section key={s.title} className="mb-10 section-item p-6 rounded-2xl"
            style={{ background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,255,255,0.055)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-5 rounded-full" style={{ background:"linear-gradient(180deg,#6366f1,#8b5cf6)" }} />
              <h2 className="text-[17px] font-black text-white">{s.title}</h2>
            </div>
            <div className="pl-4 border-l border-zinc-800 space-y-3">
              {s.content.map((p, i) => (
                <p key={i} className="text-[14px] text-zinc-500 leading-relaxed">{p}</p>
              ))}
            </div>
          </section>
        ))}

        {/* ── Contact ── */}
        <section className="p-6 rounded-2xl text-center"
          style={{ background:"linear-gradient(160deg,rgba(99,102,241,0.07),rgba(139,92,246,0.04))", border:"1px solid rgba(99,102,241,0.18)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.22)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="1.8">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <h3 className="text-[15px] font-black text-zinc-100 mb-1">Questions about cookies?</h3>
          <p className="text-[13px] text-zinc-500 mb-4">We're happy to explain anything in plain English.</p>
          <a href="mailto:help.planzo@gmail.com"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:-translate-y-0.5"
            style={{ background:"linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow:"0 6px 24px rgba(99,102,241,0.3)" }}>
            help.planzo@gmail.com
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
        </section>

        {/* related links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {[
            { label:"Privacy Policy", href:"/privacy" },
            { label:"Terms of Service", href:"/terms" },
            { label:"Security", href:"/security" },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-medium text-zinc-500 hover:text-zinc-300 transition-all hover:bg-zinc-800/40"
              style={{ border:"1px solid rgba(255,255,255,0.06)" }}>
              {l.label}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}