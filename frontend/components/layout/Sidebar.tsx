"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth }     from "@/context/AuthContext";
import { useProjects } from "@/context/ProjectContext";
import { Icon, Avatar, getProjectColor } from "@/components/ui";
import { api } from "@/lib/api";
import { askProjectAssistant } from "@/lib/gemini";

// ─── SINGLE PROJECT LINK ──────────────────────────────────────────────────────
function ProjectLink({ project, pathname, collapsed }) {
  const color  = getProjectColor(project.id);
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
          <Icon name="chevronDown" size={10} className={`transition-transform duration-200 ${open ? "" : "-rotate-90"}`} />
        </button>
      ) : (
        <div className="mb-2 px-2"><div className="h-px bg-zinc-800/80" /></div>
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

// ─── SPARKLE ICON ─────────────────────────────────────────────────────────────
function SparkleIcon({ size = 14, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2 L13.5 9 L20 10.5 L13.5 12 L12 19 L10.5 12 L4 10.5 L10.5 9 Z" />
      <path d="M19 2 L19.8 5.2 L23 6 L19.8 6.8 L19 10 L18.2 6.8 L15 6 L18.2 5.2 Z" opacity="0.6" />
      <path d="M5 16 L5.6 18.4 L8 19 L5.6 19.6 L5 22 L4.4 19.6 L2 19 L4.4 18.4 Z" opacity="0.5" />
    </svg>
  );
}

// ─── AI PROJECT ASSISTANT PANEL ───────────────────────────────────────────────
function AIAssistantPanel({ onClose, allProjects, user }) {
  const [step,            setStep]            = useState("select");
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectData,     setProjectData]     = useState(null);
  const [loadingCtx,      setLoadingCtx]      = useState(false);
  const [messages,        setMessages]        = useState([]);
  const [input,           setInput]           = useState("");
  const [thinking,        setThinking]        = useState(false);
  const [search,          setSearch]          = useState("");
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);
  useEffect(() => { if (step === "chat") setTimeout(() => inputRef.current?.focus(), 100); }, [step]);

  const filteredProjects = allProjects.filter((p) =>
    p.projectName.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectProject = async (project) => {
    setSelectedProject(project);
    setLoadingCtx(true);
    try {
      const [tasksRes, membersRes, activityRes] = await Promise.allSettled([
        api.tasks.getAllWithSubtasks(user.id, project.id),
        api.projects.getMembers(project.id),
        api.activity.getByProject(project.id),
      ]);
      const tasks        = tasksRes.status    === "fulfilled" ? (tasksRes.value?.TasksDetail    || tasksRes.value?.tasks || []) : [];
      const members      = membersRes.status  === "fulfilled" ? (membersRes.value?.member       || []) : [];
      const activityLogs = activityRes.status === "fulfilled" ? (activityRes.value?.logs        || []) : [];

      setProjectData({ tasks, members, activityLogs });
      setMessages([{
        role: "assistant",
        content: `I'm fully loaded on **${project.projectName}**.\n\nI can see **${tasks.length} tasks**, **${members.length} team members**, and your recent activity. Ask me anything — task status, blockers, who's working on what, progress overview, and more.`,
      }]);
      setStep("chat");
    } catch {
      setProjectData({ tasks: [], members: [], activityLogs: [] });
      setMessages([{ role: "assistant", content: `Loaded **${project.projectName}**! What would you like to know?` }]);
      setStep("chat");
    } finally {
      setLoadingCtx(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || thinking) return;
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setThinking(true);
    try {
      const reply = await askProjectAssistant({
        project:      selectedProject,
        tasks:        projectData?.tasks        || [],
        members:      projectData?.members      || [],
        activityLogs: projectData?.activityLogs || [],
        chatHistory:  newMessages.slice(-10),
        userMessage:  text,
      });
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I hit an error. Please try again." }]);
    } finally {
      setThinking(false);
    }
  };

  const renderContent = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return <div key={i} className="h-1.5" />;
      const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, pi) =>
        part.startsWith("**") && part.endsWith("**")
          ? <strong key={pi} className="text-zinc-100 font-semibold">{part.slice(2, -2)}</strong>
          : part
      );
      if (line.trimStart().startsWith("• ") || line.trimStart().startsWith("- ") || line.trimStart().startsWith("* ")) {
        return (
          <div key={i} className="flex items-start gap-2 pl-1 mb-1">
            <span className="text-violet-400 text-xs mt-0.5 shrink-0">▸</span>
            <span className="text-xs text-zinc-300 leading-relaxed">{parts.map((p, pi) => <span key={pi}>{p}</span>)}</span>
          </div>
        );
      }
      if (/^#{1,3}\s/.test(line)) {
        return <p key={i} className="text-xs font-bold text-zinc-200 mt-2 mb-0.5">{line.replace(/^#+\s/, "")}</p>;
      }
      return <p key={i} className="text-xs text-zinc-300 leading-relaxed mb-0.5">{parts.map((p, pi) => <span key={pi}>{p}</span>)}</p>;
    });
  };

  const QUICK_PROMPTS = [
    "What tasks are overdue?",
    "Give me a progress summary",
    "Who is working on what?",
    "What should I focus on today?",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-sm flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
        style={{ height: step === "chat" ? 560 : "auto", maxHeight: "85vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%)" }}>
              <SparkleIcon size={14} className="text-white" />
              <div className="absolute inset-0 rounded-xl animate-pulse opacity-25"
                style={{ background: "linear-gradient(135deg,#6366f1,#a855f7)" }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-zinc-200">Planzo AI</h3>
                <span className="px-1.5 py-0.5 rounded-full font-semibold bg-violet-500/15 border border-violet-500/25 text-violet-400"
                  style={{ fontSize: 10 }}>BETA</span>
              </div>
              <p className="text-xs text-zinc-600 leading-none mt-0.5">
                {step === "select" ? "Select a project to get started" : selectedProject?.projectName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {step === "chat" && (
              <button
                onClick={() => { setStep("select"); setMessages([]); setSelectedProject(null); setSearch(""); }}
                className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                title="Switch project"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Project selection */}
        {step === "select" && (
          <div className="flex flex-col px-4 pt-4 pb-5 gap-3">
            <div className="rounded-xl bg-gradient-to-br from-violet-950/60 to-indigo-950/60 border border-violet-500/15 px-4 py-3">
              <p className="text-xs text-zinc-400 leading-relaxed">
                Ask questions about your project — task status, team workload, blockers, progress, and more.
                Choose a project to begin.
              </p>
            </div>
            {allProjects.length > 4 && (
              <div className="relative">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search projects…"
                  className="w-full pl-8 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors" />
              </div>
            )}
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {filteredProjects.length === 0
                ? <p className="text-xs text-zinc-600 text-center py-4">No projects found</p>
                : filteredProjects.map((p) => {
                  const color = getProjectColor(p.id);
                  return (
                    <button key={p.id} onClick={() => handleSelectProject(p)} disabled={loadingCtx}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                        style={{ background: color + "22", color, border: `1px solid ${color}33` }}>
                        {(p.projectName || "?")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-zinc-300 truncate group-hover:text-zinc-100 transition-colors">{p.projectName}</p>
                        {p.description && <p className="text-xs text-zinc-600 truncate mt-0.5">{p.description}</p>}
                      </div>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                        className="text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  );
                })
              }
            </div>
            {loadingCtx && (
              <div className="flex items-center justify-center gap-2 py-2">
                <span className="w-4 h-4 border-2 border-zinc-700 border-t-violet-500 rounded-full animate-spin" />
                <span className="text-xs text-zinc-500">Loading project data…</span>
              </div>
            )}
          </div>
        )}

        {/* Chat */}
        {step === "chat" && (
          <>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                      <SparkleIcon size={10} className="text-white" />
                    </div>
                  )}
                  <div className={`max-w-[82%] rounded-2xl px-3 py-2.5 ${
                    msg.role === "user"
                      ? "bg-indigo-600 rounded-br-sm"
                      : "bg-zinc-900 border border-zinc-800 rounded-bl-sm"
                  }`}>
                    {msg.role === "user"
                      ? <p className="text-xs text-white leading-relaxed">{msg.content}</p>
                      : <div>{renderContent(msg.content)}</div>
                    }
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}>
                    <SparkleIcon size={10} className="text-white" />
                  </div>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-sm px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      {[0, 150, 300].map((d) => (
                        <span key={d} className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-bounce"
                          style={{ animationDelay: `${d}ms` }} />
                      ))}
                      <span className="text-xs text-zinc-600 ml-1">Thinking…</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick prompts on first message */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 shrink-0">
                <p className="text-xs text-zinc-700 mb-1.5">Quick questions:</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map((q) => (
                    <button key={q}
                      onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 0); }}
                      className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-zinc-800 shrink-0">
              <div className="flex gap-2">
                <input ref={inputRef} value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder={`Ask about ${selectedProject?.projectName || "this project"}…`}
                  disabled={thinking}
                  className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500/50 transition-colors disabled:opacity-50"
                />
                <button onClick={handleSend} disabled={!input.trim() || thinking}
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl transition-colors shrink-0">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
              <p className="text-xs text-zinc-800 mt-1.5 pl-1">Powered by Gemini AI</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout }                       = useAuth();
  const { ownedProjects, memberProjects, allProjects } = useProjects();
  const pathname = usePathname();
  const router   = useRouter();
  const [showAI, setShowAI] = useState(false);

  const handleLogout = () => { logout(); router.push("/auth/login"); };

  const navItems = [
    { href: "/dashboard", icon: "home",     label: "Dashboard" },
    { href: "/my-tasks",  icon: "check",    label: "My Tasks"  },
    { href: "/settings",  icon: "settings", label: "Settings"  },
  ];

  const isActive = (href) => pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <aside className={`flex flex-col h-full bg-zinc-950 border-r border-zinc-800/70 transition-all duration-300 ${collapsed ? "w-14" : "w-60"}`}>

        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-4 border-b border-zinc-800/70 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <Icon name="zap" size={14} className="text-white" />
          </div>
          {!collapsed && (
            <>
              <span className="text-sm font-bold text-white tracking-tight">Planzo</span>
              <button onClick={onToggle} className="ml-auto text-zinc-600 hover:text-zinc-400 transition-colors">
                <Icon name="chevronLeft" size={14} />
              </button>
            </>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 pt-3 pb-2 overflow-y-auto">
          <div className="space-y-0.5">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive(item.href) ? "bg-zinc-800 text-zinc-100" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
                }`}>
                <Icon name={item.icon} size={15} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            ))}

            {/* ✦ AI Assistant */}
            <button
              onClick={() => setShowAI(true)}
              title="AI Assistant"
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-all group
                ${showAI
                  ? "bg-violet-600/20 border border-violet-500/30 text-violet-300"
                  : "text-zinc-500 hover:text-violet-300 hover:bg-violet-500/10 border border-transparent hover:border-violet-500/20"
                }`}
            >
              <div className="relative shrink-0">
                <SparkleIcon size={15} className={`transition-colors ${showAI ? "text-violet-400" : "group-hover:text-violet-400"}`} />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              </div>
              {!collapsed && (
                <span className="flex items-center gap-1.5 flex-1">
                  AI Assistant
                  <span className="ml-auto px-1.5 py-0.5 rounded-full text-white bg-red-800 font-normal" style={{ fontSize: 9 }}>
                    NEW
                  </span>
                </span>
              )}
            </button>
          </div>

          <ProjectSection label="My Projects" icon="folder" projects={ownedProjects} collapsed={collapsed} pathname={pathname} />
          <ProjectSection label="Member Of"   icon="users"  projects={memberProjects} collapsed={collapsed} pathname={pathname} />

          {!collapsed && (
            <div className="mt-2">
              <Link href="/dashboard?newproject=1"
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs text-white hover:text-zinc-400 hover:bg-zinc-800/40 transition-colors">
                <Icon name="plus" size={14} className="shrink-0" />
                <span>New project</span>
              </Link>
            </div>
          )}
        </nav>

        {collapsed && (
          <button onClick={onToggle} className="mx-auto mb-3 text-zinc-600 hover:text-zinc-400 transition-colors">
            <Icon name="chevronRight" size={16} />
          </button>
        )}

        {/* User footer */}
        <div className="p-2 border-t border-zinc-800/70 shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-zinc-800/40 transition-colors group cursor-pointer">
            <Avatar name={user?.fullname || "U"} src={user?.profile} size={26} color="#6366f1" />
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-300 truncate">{user?.fullname}</p>
                  <p className="text-xs text-zinc-600 truncate">{user?.myRole?.replace(/_/g, " ")}</p>
                </div>
                <button onClick={handleLogout} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-300 transition-all" title="Sign out">
                  <Icon name="logout" size={14} />
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* AI Panel */}
      {showAI && (
        <AIAssistantPanel
          onClose={() => setShowAI(false)}
          allProjects={allProjects || []}
          user={user}
        />
      )}
    </>
  );
}