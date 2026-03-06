import Link from "next/link";
import { Zap, Github, Twitter, Linkedin, Mail, ArrowUpRight, Heart } from "lucide-react";

// ── data ────────────────────────────────────────────────────────────────────
const LINKS = {
  Product: [
    { label: "Dashboard",   href: "/dashboard" },
    { label: "My Tasks",    href: "/my-tasks"  },
    { label: "Projects",    href: "/dashboard" },
    { label: "Settings",    href: "/settings"  },
  ],
  Resources: [
    { label: "Documentation", href: "#", external: true },
    { label: "API Reference",  href: "#", external: true },
    { label: "Changelog",      href: "#", external: true },
    { label: "Status",         href: "#", external: true },
  ],
  Company: [
    { label: "About",       href: "#" },
    { label: "Blog",        href: "#", external: true },
    { label: "Careers",     href: "#", external: true },
    { label: "Contact",     href: "#" },
  ],
  Legal: [
    { label: "Privacy Policy",   href: "/privacy" },
    { label: "Terms of Service", href: "/terms"   },
    { label: "Cookie Policy",    href: "#"        },
    { label: "Security",         href: "#"        },
  ],
};

const SOCIALS = [
  { Icon: Github,   href: "#",    label: "GitHub"   },
  { Icon: Twitter,  href: "#",    label: "Twitter"  },
  { Icon: Linkedin, href: "#",    label: "LinkedIn" },
  { Icon: Mail,     href: "mailto:hello@planzo.app", label: "Email" },
];

// ── Footer ───────────────────────────────────────────────────────────────────
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      className="relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg,#09090f 0%,#07070c 100%)",
        borderTop: "1px solid rgba(255,255,255,0.055)",
      }}
    >
      {/* subtle top glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] pointer-events-none"
        style={{ background: "linear-gradient(90deg,transparent,rgba(99,102,241,0.4),transparent)" }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-48 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 60% 80% at 50% 0%,rgba(99,102,241,0.04),transparent 70%)" }}
      />

      <div className="relative max-w-6xl mx-auto px-6 pt-14 pb-8">

        {/* ── Top row: brand + newsletter ── */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 mb-12">

          {/* Brand */}
          <div className="lg:w-72 shrink-0">
            <Link href="/dashboard" className="inline-flex items-center gap-2.5 mb-4 group">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all group-hover:scale-105"
                style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 18px rgba(99,102,241,0.4)" }}
              >
                <Zap size={15} strokeWidth={2.5} />
              </div>
              <span className="text-[15px] font-bold text-white tracking-tight">Planzo</span>
            </Link>
            <p className="text-[13px] text-zinc-500 leading-relaxed mb-5 max-w-[260px]">
              The modern project management platform built for teams that move fast and ship often.
            </p>

            {/* Socials */}
            <div className="flex items-center gap-2">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-200 transition-all hover:scale-105"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <Icon size={14} strokeWidth={1.8} />
                </a>
              ))}
            </div>
          </div>

          {/* Links grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {Object.entries(LINKS).map(([section, items]) => (
              <div key={section}>
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.1em] mb-3">{section}</p>
                <ul className="space-y-2">
                  {items.map(({ label, href, external }) => (
                    <li key={label}>
                      <Link
                        href={href}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        className="inline-flex items-center gap-1 text-[12.5px] text-zinc-500 hover:text-zinc-200 transition-colors group"
                      >
                        {label}
                        {external && (
                          <ArrowUpRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-600" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── Status badge ── */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl mb-8 w-fit"
          style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}
        >
          <span className="relative flex w-2 h-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[11px] font-semibold text-emerald-400">All systems operational</span>
          <span className="text-[11px] text-zinc-600">·</span>
          <a href="#" className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors">Status page →</a>
        </div>

        {/* ── Divider ── */}
        <div className="h-px mb-6" style={{ background: "rgba(255,255,255,0.055)" }} />

        {/* ── Bottom row ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-zinc-700 flex items-center gap-1.5">
            © {year} Planzo · Built with
            <Heart size={11} className="text-red-500/70 fill-red-500/70" />
            for productive teams
          </p>

          <div className="flex items-center gap-4">
            {["Privacy", "Terms", "Cookies"].map(l => (
              <Link
                key={l}
                href={`/${l.toLowerCase()}`}
                className="text-[11px] text-zinc-700 hover:text-zinc-400 transition-colors"
              >
                {l}
              </Link>
            ))}
            <div className="w-px h-3 bg-zinc-800" />
            <span className="text-[11px] text-zinc-700">v2.4.1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}