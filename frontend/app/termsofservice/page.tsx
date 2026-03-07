"use client";
import Footer from "@/components/layout/Footer";
import { MarketingNav } from "../../components/layout/Marketinglayout";
import Link from "next/link";

const TOC = [
  "Acceptance of terms",
  "Your account",
  "Acceptable use",
  "Intellectual property",
  "AI features",
  "Payment and billing",
  "Termination",
  "Disclaimers and limitation of liability",
  "Governing law",
  "Contact",
];

const PROHIBITED = [
  "Use the Service for illegal, harmful, or fraudulent purposes",
  "Upload malware, viruses, or malicious code",
  "Attempt to reverse-engineer, scrape, or access the API without authorisation",
  "Harass, threaten, or intimidate other users",
  "Misrepresent your identity or impersonate others",
  "Interfere with the Service's infrastructure or security",
];

export default function TermsPage() {
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
        .spin-deco  { animation: spin-slow 24s linear infinite; }
        .spin-deco2 { animation: spin-slow 18s linear infinite reverse; }

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

        .toc-link {
          transition: color 0.18s ease, padding-left 0.18s ease;
        }
        .toc-link:hover {
          padding-left: 6px;
          color: #a5b4fc !important;
        }
        .section-card {
          transition: border-color 0.2s ease;
        }
        .section-card:hover {
          border-color: rgba(99,102,241,0.18) !important;
        }
        .prohibited-item {
          transition: background 0.18s ease;
        }
        .prohibited-item:hover {
          background: rgba(239,68,68,0.04);
        }
        a.prose-link {
          color: #818cf8;
          text-decoration: underline;
          text-underline-offset: 3px;
          transition: color 0.15s ease;
        }
        a.prose-link:hover { color: #a5b4fc; }
      `}</style>

      <div className="noise-overlay" />
      <MarketingNav />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden grid-bg">

        {/* ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[760px] h-[420px] pointer-events-none">
          <div className="absolute inset-0 rounded-full blur-[130px] opacity-[0.1]"
            style={{ background: "radial-gradient(ellipse,#6366f1,#a78bfa)" }} />
          <div className="absolute top-10 right-[10%] w-[150px] h-[150px] rounded-full blur-[70px] opacity-[0.07]"
            style={{ background: "#e879f9" }} />
        </div>

        {/* floating dots */}
        <div className="absolute top-28 left-[6%]  w-2   h-2   rounded-full bg-indigo-400/30 float-orb" style={{animationDelay:"0s"}} />
        <div className="absolute top-44 left-[13%] w-1.5 h-1.5 rounded-full bg-violet-300/25 float-orb" style={{animationDelay:"1.6s"}} />
        <div className="absolute top-32 right-[8%]  w-2   h-2   rounded-full bg-pink-400/25   float-orb" style={{animationDelay:"0.8s"}} />
        <div className="absolute top-52 right-[14%] w-1   h-1   rounded-full bg-indigo-300/30 float-orb" style={{animationDelay:"2.3s"}} />

        {/* decorative rings */}
        <div className="absolute top-20 right-[5%] w-20 h-20 rounded-full opacity-[0.07] spin-deco"
          style={{ border:"1px dashed #a78bfa" }} />
        <div className="absolute bottom-8 left-[4%] w-12 h-12 rounded-full opacity-[0.06] spin-deco2"
          style={{ border:"1px dashed #6366f1" }} />

        <div className="max-w-3xl mx-auto text-center relative hero-fade">
          {/* eyebrow */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold mb-8"
            style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", color:"#a5b4fc" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Legal · Terms of Service
          </div>

          <h1 className="text-[52px] sm:text-[64px] font-black text-white leading-[1.0] tracking-tight mb-5">
            Terms,{" "}
            <span className="serif-italic shimmer-text">plain and simple</span>
          </h1>

          <p className="text-[17px] text-zinc-400 leading-relaxed max-w-xl mx-auto mb-6">
            Please read these terms carefully before using Planzo. They govern your use of our platform.
          </p>

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

        {/* TOC */}
        <nav className="mb-10 p-6 rounded-2xl"
          style={{ background:"linear-gradient(160deg,rgba(255,255,255,0.025),rgba(255,255,255,0.008))", border:"1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2 mb-5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.2)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-zinc-500">Table of contents</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
            {TOC.map((s, i) => (
              <a key={s} href={`#section-${i + 1}`}
                className="toc-link flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13px] text-zinc-500 transition-colors">
                <span className="text-zinc-700 font-mono text-[11px] font-bold w-5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s}
              </a>
            ))}
          </div>
        </nav>

        {/* intro callout */}
        <div className="mb-10 px-5 py-4 rounded-2xl"
          style={{ background:"rgba(99,102,241,0.05)", borderLeft:"3px solid rgba(99,102,241,0.4)", border:"1px solid rgba(99,102,241,0.12)" }}>
          <p className="text-[14.5px] text-zinc-400 leading-relaxed">
            By accessing or using Planzo ("Service"), you agree to be bound by these Terms of Service.
            If you do not agree, do not use the Service.
          </p>
        </div>

        {/* ── 01 Acceptance ── */}
        <SectionCard id="section-1" n="01" title="Acceptance of terms">
          <P>These Terms constitute a legally binding agreement between you and Planzo. You must be at least <Hl>13 years old</Hl> to use the Service. By using the Service on behalf of an organisation, you represent that you have authority to bind that organisation.</P>
        </SectionCard>

        {/* ── 02 Your account ── */}
        <SectionCard id="section-2" n="02" title="Your account">
          <P>You are responsible for maintaining the security of your account credentials. You must notify us immediately of any unauthorised access. Planzo is not liable for losses resulting from unauthorised use of your account.</P>
          <P>You may not share your account, create multiple accounts, or use another person's account without permission.</P>
        </SectionCard>

        {/* ── 03 Acceptable use ── */}
        <SectionCard id="section-3" n="03" title="Acceptable use">
          <P>You agree <span className="text-zinc-200 font-semibold">not</span> to do any of the following:</P>

          <div className="mt-4 rounded-xl overflow-hidden"
            style={{ border:"1px solid rgba(239,68,68,0.15)" }}>
            {PROHIBITED.map((item, i) => (
              <div key={item}
                className="prohibited-item flex items-start gap-3 px-4 py-3"
                style={{ borderBottom: i < PROHIBITED.length - 1 ? "1px solid rgba(239,68,68,0.08)" : "none" }}>
                <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.2)" }}>
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="3">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </div>
                <p className="text-[13.5px] text-zinc-400 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>

          <P className="mt-4">We reserve the right to suspend or terminate accounts that violate these terms.</P>
        </SectionCard>

        {/* ── 04 IP ── */}
        <SectionCard id="section-4" n="04" title="Intellectual property">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1 mb-2">
            <MiniCard color="#6366f1" title="Your content">
              You retain ownership of all content you create in Planzo. By uploading content, you grant Planzo a limited licence to store, display, and process it solely to provide the Service.
            </MiniCard>
            <MiniCard color="#a78bfa" title="Our platform">
              Planzo retains ownership of the platform, code, design, trademarks, and all intellectual property inherent to the Service itself.
            </MiniCard>
          </div>
        </SectionCard>

        {/* ── 05 AI ── */}
        <SectionCard id="section-5" n="05" title="AI features">
          <div className="mt-1 flex gap-3 p-4 rounded-xl"
            style={{ background:"rgba(139,92,246,0.06)", border:"1px solid rgba(139,92,246,0.18)" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background:"rgba(139,92,246,0.12)", border:"1px solid rgba(139,92,246,0.22)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.8">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <p className="text-[13.5px] text-zinc-400 leading-relaxed">
              Planzo uses third-party AI services (Google Gemini) to power certain features. AI-generated content is provided <span className="text-zinc-200 font-semibold">as-is</span>. You are responsible for reviewing and verifying AI outputs before acting on them. We make no warranty about the accuracy of AI-generated suggestions.
            </p>
          </div>
        </SectionCard>

        {/* ── 06 Payment ── */}
        <SectionCard id="section-6" n="06" title="Payment and billing">
          <P>Paid features are billed in advance on a monthly or annual basis. All fees are <Hl>non-refundable</Hl> except where required by law. We reserve the right to change pricing with <Hl>30 days' notice</Hl>.</P>
        </SectionCard>

        {/* ── 07 Termination ── */}
        <SectionCard id="section-7" n="07" title="Termination">
          <P>You may terminate your account at any time from the settings page. We may terminate or suspend your access immediately, without notice, for violations of these Terms.</P>
          <P>On termination, your right to use the Service ceases. Your data will be deleted within <Hl>30 days</Hl>.</P>
        </SectionCard>

        {/* ── 08 Disclaimer ── */}
        <SectionCard id="section-8" n="08" title="Disclaimers and limitation of liability">
          <div className="mt-1 p-4 rounded-xl mb-3"
            style={{ background:"rgba(245,158,11,0.05)", border:"1px solid rgba(245,158,11,0.15)" }}>
            <p className="text-[12px] font-black uppercase tracking-[0.14em] text-amber-500/60 mb-2">Warranty disclaimer</p>
            <p className="text-[13.5px] text-zinc-400 leading-relaxed">
              The Service is provided <span className="text-zinc-200 font-semibold">"as is"</span> without warranties of any kind. To the maximum extent permitted by law, Planzo is not liable for any indirect, incidental, special, consequential, or punitive damages.
            </p>
          </div>
          <P>Our total liability to you for any claim arising from use of the Service shall not exceed the amount you paid us in the <Hl>12 months prior</Hl> to the claim.</P>
        </SectionCard>

        {/* ── 09 Governing law ── */}
        <SectionCard id="section-9" n="09" title="Governing law">
          <div className="mt-1 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
              style={{ background:"rgba(52,211,153,0.1)", border:"1px solid rgba(52,211,153,0.2)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.8">
                <circle cx="12" cy="12" r="10"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <p className="text-[13.5px] text-zinc-400 leading-relaxed">
              These Terms are governed by the laws of <span className="text-zinc-200 font-semibold">India</span>. Disputes shall be subject to the exclusive jurisdiction of the courts in{" "}
              <span className="text-zinc-200 font-semibold">Raipur, Chhattisgarh, India</span>.
            </p>
          </div>
        </SectionCard>

        {/* ── 10 Contact CTA ── */}
        <section id="section-10"
          className="p-6 rounded-2xl text-center relative overflow-hidden"
          style={{ background:"linear-gradient(160deg,rgba(99,102,241,0.07),rgba(139,92,246,0.04))", border:"1px solid rgba(99,102,241,0.18)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background:"radial-gradient(ellipse 70% 60% at 50% 0%,rgba(99,102,241,0.1),transparent)" }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-px"
            style={{ background:"linear-gradient(90deg,transparent,rgba(139,92,246,0.5),transparent)" }} />

          <div className="relative">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
              style={{ background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.22)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="1.8">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400/70 mb-2">10 · Contact</p>
            <h3 className="text-[16px] font-black text-zinc-100 mb-2">Questions about these Terms?</h3>
            <p className="text-[13px] text-zinc-500 mb-5">We're happy to clarify anything in plain English.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="mailto:help.planzo@gmail.com"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-black text-white transition-all hover:-translate-y-0.5"
                style={{ background:"linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow:"0 6px 24px rgba(99,102,241,0.3)" }}>
                help.planzo@gmail.com
              </a>
              <Link href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-zinc-400 hover:text-zinc-200 transition-all"
                style={{ border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.03)" }}>
                Contact form →
              </Link>
            </div>
          </div>
        </section>

        {/* related links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {[
            { label:"Privacy Policy",  href:"/privacy"  },
            { label:"Cookie Policy",   href:"/cookies"  },
            { label:"Security",        href:"/security" },
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

/* ── shared atoms ── */
function SectionCard({ id, n, title, children }) {
  return (
    <section id={id} className="section-card mb-6 p-6 rounded-2xl"
      style={{ background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,255,255,0.055)" }}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[11px] font-black text-zinc-700 font-mono">{n}</span>
        <div className="w-px h-4 bg-zinc-800" />
        <div className="w-1 h-5 rounded-full shrink-0" style={{ background:"linear-gradient(180deg,#6366f1,#8b5cf6)" }} />
        <h2 className="text-[17px] font-black text-white">{title}</h2>
      </div>
      <div className="pl-4 border-l border-zinc-800/70 space-y-3">
        {children}
      </div>
    </section>
  );
}

function P({ children, className = "" }) {
  return (
    <p className={`text-[14px] text-zinc-400 leading-relaxed ${className}`}>{children}</p>
  );
}

function Hl({ children }) {
  return (
    <span className="text-zinc-200 font-semibold">{children}</span>
  );
}

function MiniCard({ color, title, children }) {
  return (
    <div className="p-4 rounded-xl"
      style={{ background:`${color}08`, border:`1px solid ${color}18` }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-1.5 h-1.5 rounded-full" style={{ background:color }} />
        <p className="text-[12px] font-black" style={{ color }}>{title}</p>
      </div>
      <p className="text-[13px] text-zinc-500 leading-relaxed">{children}</p>
    </div>
  );
}