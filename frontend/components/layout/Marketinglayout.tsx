"use client";
import { useState } from "react";
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

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06]"
      style={{ background: "rgba(9,9,11,0.85)", backdropFilter: "blur(20px)" }}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 20px rgba(99,102,241,0.4)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
          </div>
          <span className="text-[15px] font-bold text-white tracking-tight">Planzo</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
        
          <Link href="/dashboard"
            className="ml-1 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 20px rgba(99,102,241,0.3)" }}>
            Dashboard
          </Link>
        </nav>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(v => !v)} className="md:hidden p-2 text-zinc-400 hover:text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M18 6 6 18M6 6l12 12" /> : <><line x1="4" y1="8" x2="20" y2="8"/><line x1="4" y1="16" x2="20" y2="16"/></>}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/[0.06] px-6 py-4 space-y-1"
          style={{ background: "rgba(9,9,11,0.97)" }}>
          {[...NAV_LINKS, ...LEGAL_LINKS].map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-all">
              {l.label}
            </Link>
          ))}
          <div className="pt-2 flex gap-2">
           
            <Link href="/dashboard" className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>Dashboard</Link>
          </div>
        </div>
      )}
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-white/[0.06] mt-24">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <span className="text-[15px] font-bold text-white">Planzo</span>
            </div>
            <p className="text-sm text-zinc-500 leading-relaxed max-w-xs">
              Modern project management built for teams that move fast. AI-powered, real-time, and beautifully simple.
            </p>
          </div>

          {/* Company */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Company</p>
            <div className="space-y-2.5">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="block text-sm text-zinc-500 hover:text-zinc-300 transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">Legal</p>
            <div className="space-y-2.5">
              {LEGAL_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="block text-sm text-zinc-500 hover:text-zinc-300 transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-700">© {new Date().getFullYear()} Planzo. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {["Twitter", "GitHub", "LinkedIn"].map((s) => (
              <a key={s} href="#" className="text-xs text-zinc-700 hover:text-zinc-500 transition-colors">{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* Reusable section hero used by legal pages */
export function PageHero({ eyebrow, title, subtitle, updated }) {
  return (
    <section className="pt-32 pb-16 px-6">
      <div className="max-w-3xl mx-auto text-center">
        {eyebrow && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-6 border"
            style={{ color: "#a78bfa", background: "rgba(139,92,246,0.1)", borderColor: "rgba(139,92,246,0.2)" }}>
            {eyebrow}
          </span>
        )}
        <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight leading-[1.1] mb-5">{title}</h1>
        {subtitle && <p className="text-lg text-zinc-400 leading-relaxed">{subtitle}</p>}
        {updated && <p className="mt-4 text-sm text-zinc-600">Last updated: {updated}</p>}
      </div>
    </section>
  );
}

/* Prose container for legal content */
export function LegalProse({ children }) {
  return (
    <div className="max-w-3xl mx-auto px-6 pb-24">
      <div className="prose-nexus space-y-8">{children}</div>
    </div>
  );
}

export function LegalSection({ title, children }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-3">
        <span className="w-1 h-6 rounded-full inline-block" style={{ background: "linear-gradient(180deg,#6366f1,#8b5cf6)" }} />
        {title}
      </h2>
      <div className="text-[15px] text-zinc-400 leading-[1.8] space-y-4 pl-4 border-l border-zinc-800">{children}</div>
    </section>
  );
}