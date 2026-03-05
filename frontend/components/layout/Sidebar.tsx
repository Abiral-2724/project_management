"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/context/ProjectContext";
import { Icon, Avatar, getProjectColor } from "@/components/ui";

// ─── SINGLE PROJECT LINK ──────────────────────────────────────────────────────
function ProjectLink({ project, pathname, collapsed }) {
  const color = getProjectColor(project.id);
  const active = pathname.includes(`/project/${project.id}`);
  return (
    <Link
      href={`/project/${project.id}`}
      title={project.projectName}
      className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors ${
        active ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
      }`}
    >
      <div
        className="w-5 h-5 rounded shrink-0 flex items-center justify-center text-xs font-bold"
        style={{ background: color + "33", color }}
      >
        {(project.projectName || "?")[0].toUpperCase()}
      </div>
      {!collapsed && <span className="truncate flex-1">{project.projectName}</span>}
    </Link>
  );
}

// ─── PROJECT SECTION ──────────────────────────────────────────────────────────
function ProjectSection({ label, icon, projects, collapsed, pathname }) {
  const [open, setOpen] = useState(true);
  if (!projects || projects.length === 0) return null;

  return (
    <div className="mt-4">
      {!collapsed ? (
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-2.5 py-1 mb-1 text-xs font-semibold text-zinc-600 uppercase tracking-widest hover:text-zinc-400 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Icon name={icon} size={10} />
            <span>{label}</span>
            <span className="bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full text-xs font-normal leading-none">
              {projects.length}
            </span>
          </div>
          <Icon
            name="chevronDown"
            size={10}
            className={`transition-transform duration-200 ${open ? "" : "-rotate-90"}`}
          />
        </button>
      ) : (
        <div className="mb-2 px-2">
          <div className="h-px bg-zinc-800/80" />
        </div>
      )}

      {(open || collapsed) && (
        <div className="space-y-0.5">
          {projects.map((p) => (
            <ProjectLink key={p.id} project={p} pathname={pathname} collapsed={collapsed} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
// Reads projects from ProjectContext — no fetching here, no flash on navigation
export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth();
  const { ownedProjects, memberProjects } = useProjects(); // ← stable, from context
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => { logout(); router.push("/auth/login"); };

  const navItems = [
    { href: "/dashboard", icon: "home",     label: "Dashboard" },
    { href: "/my-tasks",  icon: "check",    label: "My Tasks"  },
    { href: "/settings",  icon: "settings", label: "Settings"  },
  ];

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  return (
    <aside
      className={`flex flex-col h-full bg-zinc-950 border-r border-zinc-800/70 transition-all duration-300 ${
        collapsed ? "w-14" : "w-60"
      }`}
    >
      {/* ── Logo ── */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-zinc-800/70 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <Icon name="zap" size={14} className="text-white" />
        </div>
        {!collapsed && (
          <>
            <span className="text-sm font-bold text-white tracking-tight">Planzo</span>
            <button
              onClick={onToggle}
              className="ml-auto text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              <Icon name="chevronLeft" size={14} />
            </button>
          </>
        )}
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 px-2 pt-3 pb-2 overflow-y-auto">
        {/* Main nav */}
        <div className="space-y-0.5">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                isActive(item.href)
                  ? "bg-zinc-800 text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
              }`}
            >
              <Icon name={item.icon} size={15} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </div>

        {/* ── My Projects ── */}
        <ProjectSection
          label="My Projects"
          icon="folder"
          projects={ownedProjects}
          collapsed={collapsed}
          pathname={pathname}
        />

        {/* ── Member Of ── */}
        <ProjectSection
          label="Member Of"
          icon="users"
          projects={memberProjects}
          collapsed={collapsed}
          pathname={pathname}
        />

        {/* New project */}
        {!collapsed && (
          <div className="mt-2">
            <Link
              href="/dashboard?newproject=1"
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-zinc-600 hover:text-zinc-400 hover:bg-zinc-800/40 transition-colors"
            >
              <Icon name="plus" size={14} className="shrink-0" />
              <span>New project</span>
            </Link>
          </div>
        )}
      </nav>

      {/* ── Expand when collapsed ── */}
      {collapsed && (
        <button
          onClick={onToggle}
          className="mx-auto mb-3 text-zinc-600 hover:text-zinc-400 transition-colors"
        >
          <Icon name="chevronRight" size={16} />
        </button>
      )}

      {/* ── User footer ── */}
      <div className="p-2 border-t border-zinc-800/70 shrink-0">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-zinc-800/40 transition-colors group cursor-pointer">
          <Avatar name={user?.fullname || "U"} src={user?.profile} size={26} color="#6366f1" />
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-300 truncate">{user?.fullname}</p>
                <p className="text-xs text-zinc-600 truncate">{user?.myRole?.replace(/_/g, " ")}</p>
              </div>
              <button
                onClick={handleLogout}
                className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-300 transition-all"
                title="Sign out"
              >
                <Icon name="logout" size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}