"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/about",   label: "About"   },
  { href: "/blog",    label: "Blog"    },
  { href: "/contact", label: "Contact" },
];

const LEGAL_LINKS = [
  { href: "/privacy",  label: "Privacy Policy"   },
  { href: "/terms",    label: "Terms of Service" },
  { href: "/cookies",  label: "Cookie Policy"    },
  { href: "/security", label: "Security"         },
];

/* ─────────────────────────────────────────────
   MARKETING NAV
───────────────────────────────────────────── */
export function MarketingNav() {
  const [open,      setOpen]      = useState(false);
  const [scrolled,  setScrolled]  = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');

        .mnav-link {
          position: relative;
          font-size: 13.5px;
          font-weight: 500;
          color: #71717a;
          padding: 6px 12px;
          border-radius: 10px;
          transition: color 0.18s ease, background 0.18s ease;
        }
        .mnav-link:hover {
          color: #e4e4e7;
          background: rgba(255,255,255,0.05);
        }

        @keyframes mobile-slide-down {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .mobile-menu-animate {
          animation: mobile-slide-down 0.2s ease both;
        }

        .dash-btn {
          transition: transform 0.18s ease, box-shadow 0.18s ease;
        }
        .dash-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(99,102,241,0.45) !important;
        }
        .dash-btn:active {
          transform: translateY(0);
        }
      `}</style>

      <header
        className="fixed top-0 inset-x-0 z-50 transition-all duration-300"
        style={{
          background:    scrolled ? "rgba(7,7,13,0.92)" : "rgba(7,7,13,0.7)",
          borderBottom:  scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
          backdropFilter:"blur(20px)",
          fontFamily:    "'Outfit', sans-serif",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105"
              style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow:"0 0 18px rgba(99,102,241,0.4)" }}>
              {/* inner glow */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background:"linear-gradient(135deg,rgba(255,255,255,0.15),transparent)" }} />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <span className="text-[15px] font-black text-white tracking-tight">Planzo</span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <Link key={l.href} href={l.href} className="mnav-link">{l.label}</Link>
            ))}

            <div className="w-px h-4 bg-zinc-800 mx-2" />

            <Link href="/dashboard"
              className="dash-btn ml-1 flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-black text-white"
              style={{ background:"linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow:"0 4px 16px rgba(99,102,241,0.3)", border:"1px solid rgba(139,92,246,0.3)" }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>
              Dashboard
            </Link>
          </nav>

          {/* ── Mobile toggle ── */}
          <button onClick={() => setOpen(v => !v)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl text-zinc-400 hover:text-white transition-colors"
            style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)" }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              {open
                ? <path d="M18 6 6 18M6 6l12 12"/>
                : <><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></>
              }
            </svg>
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {open && (
          <div className="mobile-menu-animate md:hidden border-t px-4 py-4"
            style={{ background:"rgba(7,7,13,0.98)", borderColor:"rgba(255,255,255,0.06)" }}>

            {/* nav section */}
            <div className="mb-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-700 px-3 mb-2">Pages</p>
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all">
                  {l.label}
                </Link>
              ))}
            </div>

            {/* legal section */}
            <div className="mb-4">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-700 px-3 mb-2">Legal</p>
              <div className="grid grid-cols-2 gap-1">
                {LEGAL_LINKS.map(l => (
                  <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-medium text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04] transition-all">
                    {l.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="pt-3 border-t" style={{ borderColor:"rgba(255,255,255,0.06)" }}>
              <Link href="/dashboard" onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[13px] font-black text-white"
                style={{ background:"linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow:"0 4px 16px rgba(99,102,241,0.25)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                  <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
                </svg>
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}

/* ─────────────────────────────────────────────
   MARKETING FOOTER
───────────────────────────────────────────── */
export function MarketingFooter() {
  return (
    <footer style={{ borderTop:"1px solid rgba(255,255,255,0.05)", background:"#07070d", fontFamily:"'Outfit',sans-serif" }}>
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">

        {/* top grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-14">

          {/* brand col */}
          <div className="md:col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-5 group">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105"
                style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow:"0 0 14px rgba(99,102,241,0.35)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              </div>
              <span className="text-[15px] font-black text-white tracking-tight">Planzo</span>
            </Link>

            <p className="text-[13.5px] text-zinc-500 leading-relaxed max-w-[260px] mb-6">
              Modern project management built for teams that move fast. AI-powered, real-time, and beautifully simple.
            </p>

            {/* social */}
            <div className="flex items-center gap-2">
              {[
                { label:"Twitter",  icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg> },
                { label:"GitHub",   icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/></svg> },
                { label:"LinkedIn", icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg> },
              ].map(s => (
                <a key={s.label} href="#"
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-600 hover:text-zinc-300 transition-all hover:bg-zinc-800/60"
                  style={{ border:"1px solid rgba(255,255,255,0.06)" }}
                  aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* product col */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600 mb-4">Product</p>
            <div className="space-y-2">
              {[
                { href:"/dashboard", label:"Dashboard" },
                { href:"/my-tasks",  label:"My Tasks"  },
                { href:"/settings",  label:"Settings"  },
              ].map(l => (
                <Link key={l.href} href={l.href}
                  className="flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors group">
                  <span className="w-1 h-1 rounded-full bg-zinc-700 group-hover:bg-indigo-500 transition-colors" />
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* company col */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600 mb-4">Company</p>
            <div className="space-y-2">
              {NAV_LINKS.map(l => (
                <Link key={l.href} href={l.href}
                  className="flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors group">
                  <span className="w-1 h-1 rounded-full bg-zinc-700 group-hover:bg-indigo-500 transition-colors" />
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* legal col */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-zinc-600 mb-4">Legal</p>
            <div className="space-y-2">
              {LEGAL_LINKS.map(l => (
                <Link key={l.href} href={l.href}
                  className="flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-300 transition-colors group">
                  <span className="w-1 h-1 rounded-full bg-zinc-700 group-hover:bg-indigo-500 transition-colors" />
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop:"1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-lg flex items-center justify-center"
              style={{ background:"linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
            </div>
            <p className="text-[11.5px] text-zinc-700">
              © {new Date().getFullYear()} Planzo. All rights reserved.
            </p>
          </div>

          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-zinc-700 ml-1">All systems operational</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────────
   PAGE HERO  (used by legal / info pages)
───────────────────────────────────────────── */
export function PageHero({ eyebrow, title, subtitle, updated }) {
  return (
    <section className="relative pt-36 pb-20 px-6 overflow-hidden"
      style={{
        backgroundImage:
          "linear-gradient(rgba(99,102,241,0.035) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.035) 1px,transparent 1px)",
        backgroundSize: "56px 56px",
        fontFamily: "'Outfit',sans-serif",
      }}>

      {/* ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[380px] pointer-events-none">
        <div className="absolute inset-0 rounded-full blur-[120px] opacity-[0.1]"
          style={{ background:"radial-gradient(ellipse,#6366f1,#a78bfa)" }} />
      </div>

      <div className="max-w-3xl mx-auto text-center relative">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-semibold mb-7"
            style={{ background:"rgba(99,102,241,0.08)", border:"1px solid rgba(99,102,241,0.2)", color:"#a5b4fc" }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            {eyebrow}
          </div>
        )}

        <h1 className="text-[48px] sm:text-[58px] font-black text-white tracking-tight leading-[1.0] mb-5"
          style={{ fontFamily:"'Outfit',sans-serif" }}>
          {title}
        </h1>

        {subtitle && (
          <p className="text-[17px] text-zinc-400 leading-relaxed max-w-xl mx-auto">
            {subtitle}
          </p>
        )}

        {updated && (
          <div className="inline-flex items-center gap-2 mt-5 text-[11.5px] text-zinc-600">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Last updated: {updated}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   LEGAL PROSE wrapper
───────────────────────────────────────────── */
export function LegalProse({ children }) {
  return (
    <div className="max-w-3xl mx-auto px-6 pb-24" style={{ fontFamily:"'Outfit',sans-serif" }}>
      <div className="space-y-6">{children}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   LEGAL SECTION
───────────────────────────────────────────── */
export function LegalSection({ title, children }) {
  return (
    <section
      className="p-6 rounded-2xl"
      style={{
        background: "rgba(255,255,255,0.015)",
        border: "1px solid rgba(255,255,255,0.055)",
        transition: "border-color 0.2s ease",
        fontFamily: "'Outfit',sans-serif",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(99,102,241,0.18)"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.055)"}
    >
      {/* section title */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-1 h-5 rounded-full shrink-0"
          style={{ background:"linear-gradient(180deg,#6366f1,#8b5cf6)" }} />
        <h2 className="text-[17px] font-black text-white">{title}</h2>
      </div>

      {/* content */}
      <div className="pl-4 border-l space-y-3 text-[14px] text-zinc-400 leading-relaxed"
        style={{ borderColor:"rgba(255,255,255,0.07)" }}>
        {children}
      </div>
    </section>
  );
}