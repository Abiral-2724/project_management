"use client";
import Footer from "@/components/layout/Footer";
import { MarketingNav } from "../../components/layout/Marketinglayout";
import Link from "next/link";

const TOC = [
  "Information we collect",
  "How we use your information",
  "Data sharing",
  "Data retention",
  "Your rights",
  "Cookies",
  "Security",
  "Children",
  "Changes to this policy",
  "Contact us",
];

export default function PrivacyPage() {
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
        .bullet-dot { flex-shrink: 0; margin-top: 7px; }
      `}</style>

      <div className="noise-overlay" />
      <MarketingNav />

      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden grid-bg">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] pointer-events-none">
          <div className="absolute inset-0 rounded-full blur-[130px] opacity-[0.1]"
            style={{ background: "radial-gradient(ellipse,#6366f1,#a78bfa)" }} />
          <div className="absolute top-12 right-[10%] w-[150px] h-[150px] rounded-full blur-[70px] opacity-[0.07]"
            style={{ background: "#e879f9" }} />
        </div>
        <div className="absolute top-28 left-[7%]  w-2   h-2   rounded-full bg-indigo-400/30 float-orb" style={{animationDelay:"0s"}} />
        <div className="absolute top-44 left-[13%] w-1.5 h-1.5 rounded-full bg-violet-300/25 float-orb" style={{animationDelay:"1.5s"}} />
        <div className="absolute top-32 right-[9%]  w-2   h-2   rounded-full bg-pink-400/25   float-orb" style={{animationDelay:"0.8s"}} />

        <div className="max-w-3xl mx-auto text-center relative hero-fade">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold mb-8"
            style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", color:"#a5b4fc" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Legal · Privacy Policy
          </div>

          <h1 className="text-[52px] sm:text-[64px] font-black text-white leading-[1.0] tracking-tight mb-5">
            Your privacy,{" "}
            <span className="serif-italic shimmer-text">protected</span>
          </h1>

          <p className="text-[17px] text-zinc-400 leading-relaxed max-w-xl mx-auto mb-6">
            We believe privacy is a right, not a feature. Here's exactly how we handle your data.
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
          <div className="flex items-center gap-2 mb-4">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
            {TOC.map((s, i) => (
              <a key={s} href={`#section-${i + 1}`}
                className="toc-link flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-[13px] text-zinc-500 transition-colors">
                <span className="text-zinc-700 font-mono text-[11px] font-bold w-5 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{s}</span>
              </a>
            ))}
          </div>
        </nav>

        {/* intro callout */}
        <div className="mb-10 px-5 py-4 rounded-2xl"
          style={{ background:"rgba(99,102,241,0.05)", borderLeft:"3px solid rgba(99,102,241,0.4)", border:"1px solid rgba(99,102,241,0.12)" }}>
          <p className="text-[14.5px] text-zinc-400 leading-relaxed">
            This Privacy Policy explains how Planzo ("we", "us", "our") collects, uses, and protects information about you when you use our services. By using Planzo, you agree to the practices described here.
          </p>
        </div>

        {/* ── Section 1 ── */}
        <section id="section-1" className="mb-8 section-card p-6 rounded-2xl"
          style={{ background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,255,255,0.055)" }}>
          <SectionHeader n="01" title="Information we collect" />
          <div className="space-y-4 mt-4">
            {[
              { label:"Account information", text:"When you register, we collect your name, email address, and a hashed password. You may optionally provide a profile photo." },
              { label:"Project data", text:"Tasks, subtasks, comments, files, chat messages, and activity logs that you and your team create inside Planzo." },
              { label:"Usage data", text:"Pages visited, features used, errors encountered, and interaction timestamps — collected to improve the product." },
              { label:"Device information", text:"Browser type, operating system, IP address, and referring URLs for security and analytics purposes." },
            ].map(item => (
              <div key={item.label} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 bullet-dot" />
                <p className="text-[14px] text-zinc-400 leading-relaxed">
                  <span className="text-zinc-200 font-semibold">{item.label}:</span>{" "}{item.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2 ── */}
        <section id="section-2" className="mb-8 section-card p-6 rounded-2xl"
          style={{ background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,255,255,0.055)" }}>
          <SectionHeader n="02" title="How we use your information" />
          <p className="text-[14px] text-zinc-500 leading-relaxed mt-4 mb-4">
            We use your data to provide, maintain, and improve the Planzo service. Specifically:
          </p>
          <div className="space-y-2.5">
            {[
              "Authenticate your account and keep your session secure",
              "Send transactional emails (invites, notifications, due-date alerts)",
              "Power AI features (Smart Digest, task extraction) — your data is sent to Gemini AI for processing",
              "Analyse usage patterns to prioritise product improvements",
              "Detect and prevent abuse, fraud, and security incidents",
            ].map(item => (
              <div key={item} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 bullet-dot" />
                <p className="text-[14px] text-zinc-400 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <NoteBadge color="#ef4444">We do NOT sell your data.</NoteBadge>
            <NoteBadge color="#ef4444">We do NOT use content for advertising.</NoteBadge>
          </div>
        </section>

        {/* ── Section 3 ── */}
        <section id="section-3" className="mb-8 section-card p-6 rounded-2xl"
          style={{ background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,255,255,0.055)" }}>
          <SectionHeader n="03" title="Data sharing" />
          <p className="text-[14px] text-zinc-500 leading-relaxed mt-4 mb-4">
            We share data with third parties only where necessary to operate the service:
          </p>
          <div className="space-y-2.5 mb-4">
            {[
              "Google Gemini AI — for AI-powered features (prompts only; we do not share account or team data)",
              "Cloudinary — for profile photo and file storage",
              "Nodemailer / Gmail SMTP — for transactional email delivery",
              "Infrastructure providers — for hosting and database (data is encrypted at rest)",
            ].map(item => (
              <div key={item} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 bullet-dot" />
                <p className="text-[14px] text-zinc-400 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-[14px] text-zinc-500 leading-relaxed">
            We may disclose data if required by law, court order, or to protect the safety of our users.
          </p>
        </section>

        {/* ── Section 4 ── */}
        <section id="section-4" className="mb-8 section-card p-6 rounded-2xl"
          style={{ background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,255,255,0.055)" }}>
          <SectionHeader n="04" title="Data retention" />
          <div className="space-y-3 mt-4">
            <p className="text-[14px] text-zinc-400 leading-relaxed">
              We retain your account data for as long as your account is active. If you delete your account, your personal data is purged within{" "}
              <span className="text-zinc-200 font-semibold">30 days</span>, except where we are legally required to retain it.
            </p>
            <p className="text-[14px] text-zinc-400 leading-relaxed">
              Project data (tasks, files, messages) is deleted immediately upon account deletion. Aggregated, anonymised usage statistics are retained indefinitely.
            </p>
          </div>
        </section>

        {/* ── Section 5 ── */}
        <section id="section-5" className="mb-8 section-card p-6 rounded-2xl"
          style={{ background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,255,255,0.055)" }}>
          <SectionHeader n="05" title="Your rights" />
          <p className="text-[14px] text-zinc-500 leading-relaxed mt-4 mb-4">
            Depending on your location, you may have the right to:
          </p>
          <div className="space-y-2.5 mb-5">
            {[
              "Access a copy of the personal data we hold about you",
              "Correct inaccurate or incomplete data",
              "Delete your account and associated data",
              "Export your data in a machine-readable format",
              "Object to or restrict certain types of processing",
            ].map(item => (
              <div key={item} className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 bullet-dot" />
                <p className="text-[14px] text-zinc-400 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
          <p className="text-[14px] text-zinc-400 leading-relaxed">
            To exercise any of these rights, email us at{" "}
            <a href="mailto:help.planzo@gmail.com" className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2">
              help.planzo@gmail.com
            </a>.
          </p>
        </section>

        {/* ── Sections 6–9 in a tighter 2-col grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[
            { n:"06", id:"section-6", title:"Cookies", body:"We use cookies and similar technologies to maintain your session and remember your preferences.", link:{ href:"/cookies", label:"Cookie Policy" } },
            { n:"07", id:"section-7", title:"Security", body:"We use industry-standard security measures including TLS encryption, bcrypt password hashing, JWT authentication, and regular security audits.", link:{ href:"/security", label:"Security page" } },
            { n:"08", id:"section-8", title:"Children", body:"Planzo is not directed at children under 13. We do not knowingly collect personal data from children. If you believe a child has provided us data, please contact us immediately.", link:null },
            { n:"09", id:"section-9", title:"Changes to this policy", body:"We may update this policy occasionally. We will notify you of material changes via email or a prominent notice in the application.", link:null },
          ].map(s => (
            <section key={s.id} id={s.id}
              className="section-card p-5 rounded-2xl"
              style={{ background:"rgba(255,255,255,0.015)", border:"1px solid rgba(255,255,255,0.055)" }}>
              <SectionHeader n={s.n} title={s.title} small />
              <p className="text-[13.5px] text-zinc-500 leading-relaxed mt-3">{s.body}{" "}
                {s.link && (
                  <Link href={s.link.href} className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2">
                    {s.link.label}
                  </Link>
                )}
              </p>
            </section>
          ))}
        </div>

        {/* ── Section 10 Contact ── */}
        <section id="section-10"
          className="p-6 rounded-2xl text-center"
          style={{ background:"linear-gradient(160deg,rgba(99,102,241,0.07),rgba(139,92,246,0.04))", border:"1px solid rgba(99,102,241,0.18)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-4"
            style={{ background:"rgba(99,102,241,0.12)", border:"1px solid rgba(99,102,241,0.22)" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a5b4fc" strokeWidth="1.8">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-400/70 mb-2">10 · Contact us</p>
          <h3 className="text-[16px] font-black text-zinc-100 mb-2">Questions about this policy?</h3>
          <p className="text-[13px] text-zinc-500 mb-5">Reach us at the address below or through our contact form.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="mailto:help.planzo@gmail.com"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:-translate-y-0.5"
              style={{ background:"linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow:"0 6px 24px rgba(99,102,241,0.3)" }}>
              help.planzo@gmail.com
            </a>
            <Link href="/contact"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-zinc-400 hover:text-zinc-200 transition-all"
              style={{ border:"1px solid rgba(255,255,255,0.08)", background:"rgba(255,255,255,0.03)" }}>
              Contact form →
            </Link>
          </div>
        </section>

        {/* related links */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {[
            { label:"Cookie Policy",   href:"/cookies"  },
            { label:"Terms of Service",href:"/terms"    },
            { label:"Security",        href:"/security" },
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

/* ── shared atoms ── */
function SectionHeader({ n, title, small = false }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[11px] font-black text-zinc-700 font-mono">{n}</span>
      <div className="w-px h-4 bg-zinc-800" />
      <div className="flex items-center gap-2.5">
        <div className="w-1 h-5 rounded-full shrink-0" style={{ background:"linear-gradient(180deg,#6366f1,#8b5cf6)" }} />
        <h2 className={`font-black text-white ${small ? "text-[15px]" : "text-[17px]"}`}>{title}</h2>
      </div>
    </div>
  );
}

function NoteBadge({ color, children }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold"
      style={{ color, background:`${color}12`, border:`1px solid ${color}25` }}>
      <span className="w-1 h-1 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}