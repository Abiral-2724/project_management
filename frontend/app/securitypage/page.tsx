import Footer from "@/components/layout/Footer";
import { MarketingFooter, MarketingNav, PageHero } from "@/components/layout/Marketinglayout";

// ─── SECURITY PAGE ────────────────────────────────────────────────────────────
const SECURITY_FEATURES = [
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
      title: "End-to-end encryption",
      desc: "All data is encrypted in transit using TLS 1.3. Data at rest is encrypted using AES-256 on our database and file storage.",
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
      title: "Secure authentication",
      desc: "Passwords are hashed with bcrypt (cost factor 12). Sessions use short-lived JWTs with secure, HttpOnly cookies. OTP verification on signup.",
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      title: "Role-based access control",
      desc: "Every project action is gated by role (OWNER, ADMIN, EDITOR, COMMENTER, VIEWER). The API enforces permissions server-side on every request.",
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
      title: "Activity audit logs",
      desc: "Every significant action — task changes, member invites, file uploads — is logged with a timestamp, user ID, and metadata. Logs are immutable.",
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
      title: "Infrastructure security",
      desc: "We use environment variable secrets management, principle of least privilege for database access, and never store plaintext credentials.",
    },
    {
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>,
      title: "Responsible disclosure",
      desc: "We operate a responsible disclosure programme. Security researchers who report valid vulnerabilities are credited and may receive rewards.",
    },
  ];
  
  export default function SecurityPage() {
    return (
      <div className="min-h-screen" style={{ background: "#09090b" }}>
        <MarketingNav />
        <PageHero
          eyebrow="Security"
          title="Security at Planzo"
          subtitle="We take the security of your data seriously. Here's how we protect it — in plain English."
        />
  
        <div className="max-w-5xl mx-auto px-6 pb-24">
          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-20">
            {SECURITY_FEATURES.map((f) => (
              <div key={f.title} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 hover:border-indigo-500/30 hover:bg-zinc-900/60 transition-all">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 text-indigo-400 bg-indigo-500/10 border border-indigo-500/20">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-zinc-200 mb-2">{f.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
  
          {/* Report vulnerability CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <div className="p-8 rounded-2xl border border-amber-500/20 bg-amber-500/5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-amber-400 bg-amber-500/10 border border-amber-500/20">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3 className="text-base font-semibold text-zinc-200 mb-2">Found a vulnerability?</h3>
              <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                Please report it responsibly. We take all reports seriously and will respond within 48 hours.
              </p>
              <a href="mailto:help.planzo@gmail.com"
                className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                help.planzo@gmail.com →
              </a>
            </div>
  
            <div className="p-8 rounded-2xl border border-zinc-800 bg-zinc-900/30 space-y-4">
              <h3 className="text-base font-semibold text-zinc-200">Our disclosure process</h3>
              {["Report the vulnerability to help.planzo@gmail.com", "We acknowledge within 48 hours", "We investigate and develop a fix (typically 7–30 days)", "We release a patch and credit the reporter"].map((s, i) => (
                <div key={s} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-indigo-300 bg-indigo-500/15 border border-indigo-500/25 shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm text-zinc-400">{s}</p>
                </div>
              ))}
            </div>
          </div>
  
          {/* Tech stack security callouts */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <span className="w-1 h-6 rounded-full inline-block" style={{ background: "linear-gradient(180deg,#6366f1,#8b5cf6)" }} />
              Technical details
            </h2>
            {[
              { label: "Password hashing",    value: "bcrypt, cost factor 12" },
              { label: "Session tokens",      value: "JWT (HS256), 7-day expiry, HttpOnly cookies" },
              { label: "Transport security",  value: "TLS 1.3 enforced on all endpoints" },
              { label: "Database",            value: "PostgreSQL with encrypted connections, parameterised queries (Prisma ORM — no raw SQL injection risk)" },
              { label: "File storage",        value: "Cloudinary with signed upload URLs; direct public URL access disabled for sensitive files" },
              { label: "API authentication",  value: "All routes except /auth/* require a valid JWT via middleware" },
              { label: "Rate limiting",       value: "Applied on auth endpoints to prevent brute-force attacks" },
              { label: "Environment secrets", value: "All credentials stored as environment variables, never in source code" },
            ].map((row) => (
              <div key={row.label} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 border-b border-zinc-800/60">
                <span className="w-48 shrink-0 text-sm font-medium text-zinc-400">{row.label}</span>
                <span className="text-sm text-zinc-500 font-mono">{row.value}</span>
              </div>
            ))}
          </div>
        </div>
  
        <Footer></Footer>
      </div>
    );
  }