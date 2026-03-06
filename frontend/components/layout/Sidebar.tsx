"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/context/ProjectContext";
import { Avatar, getProjectColor } from "@/components/ui";
import {
  Zap, LayoutDashboard, CheckSquare, Settings2, Folder,
  Users, ChevronLeft, ChevronRight, ChevronDown, Plus,
  LogOut, Sparkles,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", Icon: LayoutDashboard, label: "Dashboard" },
  { href: "/my-tasks",  Icon: CheckSquare,     label: "My Tasks"  },
  { href: "/settings",  Icon: Settings2,       label: "Settings"  },
];

// ── Tooltip for collapsed mode ──────────────────────────────────────────────
function Tooltip({ label, children }) {
  return (
    <div className="relative group/tip">
      {children}
      <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-50 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150">
        <div className="bg-zinc-800 border border-zinc-700/60 text-zinc-200 text-[11px] font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
          {label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-zinc-800" />
        </div>
      </div>
    </div>
  );
}

// ── Project link ─────────────────────────────────────────────────────────────
function ProjectLink({ project, pathname, collapsed }) {
  const color = getProjectColor(project.id);
  const active = pathname.includes(`/project/${project.id}`);

  const inner = (
    <Link
      href={`/project/${project.id}`}
      title={collapsed ? project.projectName : undefined}
      className={`flex items-center gap-2.5 px-2.5 py-[7px] rounded-xl text-[12px] font-medium transition-all duration-150 ${
        active
          ? "text-white"
          : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50"
      }`}
      style={active ? { background: `${color}18`, boxShadow: `inset 0 0 0 1px ${color}35` } : {}}
    >
      <div
        className="w-5 h-5 rounded-md shrink-0 flex items-center justify-center text-[10px] font-bold"
        style={{ background: `${color}25`, color, boxShadow: `0 0 8px ${color}30` }}
      >
        {(project.projectName || "?")[0].toUpperCase()}
      </div>
      {!collapsed && (
        <span className="truncate flex-1">{project.projectName}</span>
      )}
      {active && !collapsed && (
        <span className="w-1 h-1 rounded-full shrink-0" style={{ background: color }} />
      )}
    </Link>
  );

  return collapsed ? <Tooltip label={project.projectName}>{inner}</Tooltip> : inner;
}

// ── Project section ───────────────────────────────────────────────────────────
function ProjectSection({ label, SectionIcon, projects, collapsed, pathname }) {
  const [open, setOpen] = useState(true);
  if (!projects?.length) return null;

  return (
    <div className="mt-4">
      {!collapsed ? (
        <button
          onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between px-2.5 py-1 mb-1 group"
        >
          <div className="flex items-center gap-1.5">
            <SectionIcon size={10} className="text-zinc-700 group-hover:text-zinc-500 transition-colors" />
            <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.08em] group-hover:text-zinc-500 transition-colors">
              {label}
            </span>
            <span className="ml-0.5 text-[9px] font-semibold text-zinc-700 bg-zinc-800/70 px-1.5 py-0.5 rounded-full">
              {projects.length}
            </span>
          </div>
          <ChevronDown
            size={10}
            className={`text-zinc-700 group-hover:text-zinc-500 transition-all duration-200 ${open ? "" : "-rotate-90"}`}
          />
        </button>
      ) : (
        <div className="my-3 mx-2.5 h-px bg-zinc-800/70" />
      )}

      {(open || collapsed) && (
        <div className="space-y-0.5">
          {projects.map(p => (
            <ProjectLink key={p.id} project={p} pathname={pathname} collapsed={collapsed} />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const { ownedProjects, memberProjects } = useProjects();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => { logout(); router.push("/auth/login"); };
  const isActive = href => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={`relative flex flex-col h-full transition-all duration-300 ease-in-out ${collapsed ? "w-[56px]" : "w-[220px]"}`}
      style={{ background: "linear-gradient(180deg,#0c0c14 0%,#09090f 100%)", borderRight: "1px solid rgba(255,255,255,0.055)" }}
    >
      {/* subtle top glow */}
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%,rgba(99,102,241,0.07),transparent)" }} />

      {/* ── Brand ── */}
      <div className={`relative flex items-center shrink-0 transition-all duration-300 ${collapsed ? "justify-center px-3 py-3.5" : "gap-2.5 px-4 py-3.5"}`} style={{ borderBottom: "1px solid rgba(255,255,255,0.055)" }}>
        <div
          className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-white"
          style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", boxShadow: "0 0 16px rgba(99,102,241,0.45), 0 2px 4px rgba(0,0,0,0.4)" }}
        >
          <Zap size={14} strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <>
            <div className="flex flex-col leading-none">
              <span className="text-[13px] font-bold text-white tracking-tight">Planzo</span>
              <span className="text-[9px] text-zinc-600 font-medium tracking-widest uppercase">Workspace</span>
            </div>
            <button
              onClick={onToggle}
              className="ml-auto w-6 h-6 rounded-lg flex items-center justify-center text-zinc-700 hover:text-zinc-300 hover:bg-zinc-800/70 transition-all"
            >
              <ChevronLeft size={13} />
            </button>
          </>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="relative flex-1 px-2 pt-3 pb-2 overflow-y-auto overflow-x-hidden" style={{ scrollbarWidth: "none" }}>

        {/* Main nav */}
        <div className="space-y-0.5">
          {NAV_ITEMS.map(({ href, Icon: NavIcon, label }) => {
            const active = isActive(href);
            const item = (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2.5 px-2.5 py-[9px] rounded-xl text-[12px] font-medium transition-all duration-150 ${
                  active
                    ? "text-white bg-indigo-500/[0.12] shadow-sm"
                    : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50"
                }`}
                style={active ? { boxShadow: "inset 0 0 0 1px rgba(99,102,241,0.3)" } : {}}
              >
                <NavIcon
                  size={15}
                  className={`shrink-0 ${active ? "text-indigo-400" : "text-zinc-600"}`}
                  strokeWidth={active ? 2.2 : 1.8}
                />
                {!collapsed && <span>{label}</span>}
                {active && !collapsed && <div className="ml-auto w-1 h-1 rounded-full bg-indigo-400" />}
              </Link>
            );
            return collapsed
              ? <Tooltip key={href} label={label}>{item}</Tooltip>
              : <div key={href}>{item}</div>;
          })}
        </div>

        {/* Divider */}
        <div className="my-3 mx-1 h-px bg-zinc-800/60" />

        {/* Projects */}
        <ProjectSection label="My Projects" SectionIcon={Folder}  projects={ownedProjects}  collapsed={collapsed} pathname={pathname} />
        <ProjectSection label="Member Of"   SectionIcon={Users}   projects={memberProjects} collapsed={collapsed} pathname={pathname} />

        {/* New project */}
        {!collapsed && (
          <div className="mt-3">
            <Link
              href="/dashboard?newproject=1"
              className="flex items-center gap-2 px-2.5 py-[7px] rounded-xl text-[12px] font-medium text-zinc-600 hover:text-indigo-300 hover:bg-indigo-500/8 transition-all duration-150 group"
            >
              <div className="w-5 h-5 rounded-md border border-dashed border-zinc-700/80 group-hover:border-indigo-500/50 flex items-center justify-center transition-all">
                <Plus size={9} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
              </div>
              <span>New project</span>
            </Link>
          </div>
        )}

        {/* AI assistant teaser (only expanded) */}
        {!collapsed && (
          <div className="mt-4 mx-0.5">
            <div className="relative rounded-xl p-3 overflow-hidden" style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.1),rgba(139,92,246,0.07))", border: "1px solid rgba(99,102,241,0.2)" }}>
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(139,92,246,0.2),transparent 70%)", transform: "translate(30%,-30%)" }} />
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                  <Sparkles size={10} className="text-white" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-indigo-200 leading-tight">AI Assistant</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 leading-snug">Ask anything about your projects</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Expand button (collapsed) ── */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="mx-auto mb-3 w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-all"
        >
          <ChevronRight size={13} />
        </button>
      )}

      {/* ── User footer ── */}
      <div className="p-2 shrink-0" style={{ borderTop: "1px solid rgba(255,255,255,0.055)" }}>
        {collapsed ? (
          <Tooltip label={user?.fullname || "Account"}>
            <button className="w-full flex justify-center py-1.5">
              <div className="relative">
                <Avatar name={user?.fullname || "U"} src={user?.profile} size={28} color="#6366f1" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-[1.5px] border-[#09090f]" />
              </div>
            </button>
          </Tooltip>
        ) : (
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-zinc-800/40 transition-all duration-150 group cursor-pointer">
            <div className="relative shrink-0">
              <Avatar name={user?.fullname || "U"} src={user?.profile} size={28} color="#6366f1" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border-[1.5px] border-[#09090f]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-zinc-200 truncate leading-tight">{user?.fullname}</p>
              <p className="text-[10px] text-zinc-600 truncate mt-0.5">{user?.myRole?.replace(/_/g, " ")}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-lg flex items-center justify-center text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
            >
              <LogOut size={12} />
            </button>
          </div>
        )}
      </div>
      
    </aside>
  );
}