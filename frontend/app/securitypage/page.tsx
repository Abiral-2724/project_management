import Footer from "@/components/layout/Footer";
import { MarketingNav } from "@/components/layout/Marketinglayout";
import Link from "next/link";

const SECURITY_FEATURES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
    title: "End-to-end encryption",
    desc: "All data is encrypted in transit using TLS 1.3. Data at rest is encrypted using AES-256 on our database and file storage.",
    color: "#6366f1",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    title: "Secure authentication",
    desc: "Passwords are hashed with bcrypt (cost factor 12). Sessions use short-lived JWTs with secure, HttpOnly cookies. OTP verification on signup.",
    color: "#a78bfa",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
    title: "Role-based access control",
    desc: "Every project action is gated by role (OWNER, ADMIN, EDITOR, COMMENTER, VIEWER). The API enforces permissions server-side on every request.",
    color: "#34d399",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    title: "Activity audit logs",
    desc: "Every significant action — task changes, member invites, file uploads — is logged with a timestamp, user ID, and metadata. Logs are immutable.",
    color: "#3b82f6",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    ),
    title: "Infrastructure security",
    desc: "We use environment variable secrets management, principle of least privilege for database access, and never store plaintext credentials.",
    color: "#f59e0b",
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 8v4"/><path d="M12 16h.01"/>
      </svg>
    ),
    title: "Responsible disclosure",
    desc: "We operate a responsible disclosure programme. Security researchers who report valid vulnerabilities are credited and may receive rewards.",
    color: "#ec4899",
  },
];

const TECH_ROWS = [
  { label: "Password hashing",   value: "bcrypt, cost factor 12" },
  { label: "Session tokens",     value: "JWT (HS256), 7-day expiry, HttpOnly cookies" },
  { label: "Transport security", value: "TLS 1.3 enforced on all endpoints" },
  { label: "Database",           value: "PostgreSQL with encrypted connections, parameterised queries (Prisma ORM — no raw SQL injection risk)" },
  { label: "File storage",       value: "Cloudinary with signed upload URLs; direct public URL access disabled for sensitive files" },
  { label: "API authentication", value: "All routes except /auth/* require a valid JWT via middleware" },
  { label: "Rate limiting",      value: "Applied on auth endpoints to prevent brute-force attacks" },
  { label: "Environment secrets",value: "All credentials stored as environment variables, never in source code" },
];

const DISCLOSURE_STEPS = [
  "Report the vulnerability to help.planzo@gmail.com",
  "We acknowledge within 48 hours",
  "We investigate and develop a fix (typically 7–30 days)",
  "We release a patch and credit the reporter",
];

export default function SecurityPage() {
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
        @keyframes spin-slow { to { transform: rotate(360deg); } }
        @keyframes pulse-ring {
          0%   { transform: scale(1);   opacity: 0.5; }
          100% { transform: scale(2);   opacity: 0;   }
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
        .spin-deco  { animation: spin-slow 22s linear infinite; }
        .spin-deco2 { animation: spin-slow 16s linear infinite reverse; }

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

        .feat-card {
          transition: transform 0.22s ease, border-color 0.22s ease;
        }
        .feat-card:hover {
          transform: translateY(-3px);
        }
        .feat-card:hover .feat-icon {
          transform: scale(1.08);
        }
        .feat-icon {
          transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1);
        }

        .tech-row {
          transition: background 0.18s ease;
        }
        .tech-row:hover {
          background: rgba(255,255,255,0.02);
        }

        .step-num {
          transition: box-shadow 0.2s ease;
        }
        .disclosure-step:hover .step-num {
          box-shadow: 0 0 0 4px rgba(99,102,241,0.15);
        }
      `}</style>

      <div className="noise-overlay" />
      <MarketingNav />

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden grid-bg">

        {/* ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[420px] pointer-events-none">
          <div className="absolute inset-0 rounded-full blur-[130px] opacity-[0.1]"
            style={{ background: "radial-gradient(ellipse,#6366f1,#a78bfa)" }} />
          <div className="absolute top-12 right-[8%] w-[160px] h-[160px] rounded-full blur-[80px] opacity-[0.07]"
            style={{ background: "#34d399" }} />
        </div>

        {/* floating dots */}
        <div className="absolute top-28 left-[6%]  w-2   h-2   rounded-full bg-indigo-400/30 float-orb" style={{animationDelay:"0s"}} />
        <div className="absolute top-44 left-[12%] w-1.5 h-1.5 rounded-full bg-violet-300/25 float-orb" style={{animationDelay:"1.5s"}} />
        <div className="absolute top-32 right-[8%]  w-2   h-2   rounded-full bg-emerald-400/25 float-orb" style={{animationDelay:"0.8s"}} />
        <div className="absolute top-52 right-[15%] w-1   h-1   rounded-full bg-indigo-300/30 float-orb" style={{animationDelay:"2.2s"}} />

        {/* decorative spinning rings */}
        <div className="absolute top-24 right-[6%] w-20 h-20 rounded-full pointer-events-none opacity-[0.08] spin-deco"
          style={{ border:"1px dashed #a78bfa" }} />
        <div className="absolute bottom-10 left-[4%] w-12 h-12 rounded-full pointer-events-none opacity-[0.07] spin-deco2"
          style={{ border:"1px dashed #34d399" }} />

        <div className="max-w-3xl mx-auto text-center relative hero-fade">

          {/* eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold mb-8"
            style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", color:"#a5b4fc" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Security at Planzo
          </div>

          {/* headline */}
          <h1 className="text-[52px] sm:text-[64px] font-black text-white leading-[1.0] tracking-tight mb-5">
            Built{" "}
            <span className="serif-italic shimmer-text">secure</span>
            {" "}from the start
          </h1>

          <p className="text-[17px] text-zinc-400 leading-relaxed max-w-xl mx-auto mb-8">
            We take the security of your data seriously. Here's how we protect it — in plain English.
          </p>

          {/* trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { label:"TLS 1.3", color:"#6366f1" },
              { label:"AES-256", color:"#a78bfa" },
              { label:"bcrypt", color:"#34d399" },
              { label:"Zero plaintext secrets", color:"#f59e0b" },
            ].map(b => (
              <span key={b.label}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
                style={{ color:b.color, background:`${b.color}10`, border:`1px solid ${b.color}25` }}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill={b.color}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 pb-24 relative">

        {/* ── FEATURE GRID ─────────────────────────────── */}
        <section className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-6 rounded-full" style={{ background:"linear-gradient(180deg,#6366f1,#8b5cf6)" }} />
            <h2 className="text-[20px] font-black text-white">How we protect you</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SECURITY_FEATURES.map((f) => (
              <div key={f.title}
                className="feat-card p-5 rounded-2xl relative overflow-hidden"
                style={{
                  background: "linear-gradient(160deg,rgba(255,255,255,0.025),rgba(255,255,255,0.008))",
                  border: `1px solid ${f.color}18`,
                }}
              >
                {/* top accent */}
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background:`linear-gradient(90deg,transparent,${f.color}45,transparent)` }} />
                {/* corner glow */}
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full pointer-events-none"
                  style={{ background:`radial-gradient(circle,${f.color}10,transparent 70%)`, transform:"translate(30%,-30%)" }} />

                <div className="feat-icon w-9 h-9 rounded-xl flex items-center justify-center mb-4"
                  style={{ background:`${f.color}12`, border:`1px solid ${f.color}28`, color:f.color }}>
                  {f.icon}
                </div>
                <h3 className="text-[13.5px] font-bold text-zinc-100 mb-2">{f.title}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── VULNERABILITY + PROCESS ──────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-20">

          {/* found a vulnerability */}
          <div className="p-7 rounded-2xl relative overflow-hidden"
            style={{ background:"linear-gradient(160deg,rgba(245,158,11,0.07),rgba(245,158,11,0.03))", border:"1px solid rgba(245,158,11,0.2)" }}>

            {/* corner glow */}
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
              style={{ background:"radial-gradient(circle,rgba(245,158,11,0.1),transparent 70%)", transform:"translate(30%,-30%)" }} />
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background:"linear-gradient(90deg,transparent,rgba(245,158,11,0.4),transparent)" }} />

            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 relative"
              style={{ background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.25)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>

            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-500/60 mb-2">Responsible disclosure</p>
            <h3 className="text-[18px] font-black text-zinc-100 mb-3">Found a vulnerability?</h3>
            <p className="text-[13.5px] text-zinc-400 leading-relaxed mb-6">
              Please report it responsibly. We take all reports seriously and will respond within 48 hours. Researchers who report valid vulnerabilities are credited publicly.
            </p>

            <a href="mailto:help.planzo@gmail.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-black transition-all hover:-translate-y-0.5"
              style={{ background:"rgba(245,158,11,0.15)", border:"1px solid rgba(245,158,11,0.3)", color:"#fcd34d",
                boxShadow:"0 4px 16px rgba(245,158,11,0.15)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              help.planzo@gmail.com
            </a>
          </div>

          {/* disclosure process */}
          <div className="p-7 rounded-2xl"
            style={{ background:"linear-gradient(160deg,rgba(255,255,255,0.025),rgba(255,255,255,0.008))", border:"1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1 h-5 rounded-full" style={{ background:"linear-gradient(180deg,#6366f1,#8b5cf6)" }} />
              <h3 className="text-[16px] font-black text-zinc-100">Our disclosure process</h3>
            </div>

            <div className="space-y-4">
              {DISCLOSURE_STEPS.map((s, i) => (
                <div key={s} className="disclosure-step flex items-start gap-4">
                  {/* connector line */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="step-num w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black shrink-0"
                      style={{ background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.25)", color:"#a5b4fc" }}>
                      {i + 1}
                    </div>
                    {i < DISCLOSURE_STEPS.length - 1 && (
                      <div className="w-px h-5 bg-gradient-to-b from-indigo-500/20 to-transparent" />
                    )}
                  </div>
                  <p className="text-[13.5px] text-zinc-400 leading-relaxed pt-0.5">{s}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TECH DETAILS TABLE ───────────────────────── */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 rounded-full" style={{ background:"linear-gradient(180deg,#6366f1,#8b5cf6)" }} />
            <h2 className="text-[20px] font-black text-white">Technical details</h2>
            <span className="ml-auto text-[11px] font-bold px-2.5 py-1 rounded-full"
              style={{ color:"#a5b4fc", background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.18)" }}>
              {TECH_ROWS.length} entries
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden"
            style={{ border:"1px solid rgba(255,255,255,0.07)" }}>
            {TECH_ROWS.map((row, i) => (
              <div key={row.label}
                className="tech-row flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-0 px-6 py-4"
                style={{ borderBottom: i < TECH_ROWS.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>

                {/* label */}
                <div className="flex items-center gap-3 sm:w-52 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/60 shrink-0" />
                  <span className="text-[13px] font-semibold text-zinc-300">{row.label}</span>
                </div>

                {/* value */}
                <code className="text-[12.5px] text-zinc-500 leading-relaxed sm:pl-4"
                  style={{ fontFamily:"'JetBrains Mono','Fira Code',monospace" }}>
                  {row.value}
                </code>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA strip ────────────────────────────────── */}
        <div className="mt-16 p-6 rounded-2xl text-center relative overflow-hidden"
          style={{ background:"linear-gradient(135deg,rgba(99,102,241,0.07),rgba(139,92,246,0.04))", border:"1px solid rgba(99,102,241,0.18)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background:"radial-gradient(ellipse 70% 60% at 50% 0%,rgba(99,102,241,0.1),transparent)" }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px"
            style={{ background:"linear-gradient(90deg,transparent,rgba(139,92,246,0.5),transparent)" }} />

          <div className="relative">
            <p className="text-[13px] text-zinc-400 mb-4">
              Questions about our security practices? We're happy to share more details.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a href="mailto:help.planzo@gmail.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-black text-white transition-all hover:-translate-y-0.5"
                style={{ background:"linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow:"0 6px 24px rgba(99,102,241,0.28)" }}>
                Contact security team
              </a>
              <Link href="/privacy"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-zinc-400 hover:text-zinc-200 transition-all"
                style={{ border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.03)" }}>
                Privacy Policy →
              </Link>
            </div>
          </div>
        </div>

        {/* related links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {[
            { label:"Privacy Policy", href:"/privacy" },
            { label:"Cookie Policy",  href:"/cookies" },
            { label:"Terms of Service", href:"/terms" },
          ].map(l => (
            <Link key={l.href} href={l.href}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-medium text-zinc-600 hover:text-zinc-300 transition-all hover:bg-zinc-800/40"
              style={{ border:"1px solid rgba(255,255,255,0.05)" }}>
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