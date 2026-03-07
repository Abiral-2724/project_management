"use client";
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { api } from "@/lib/api";
import { Avatar, timeAgo } from "@/components/ui";
import {
  Menu, Search, Bell, ChevronDown, X, Command,
  MessageSquare, Flag, CheckCircle2, Users, Paperclip,
  FolderOpen, AtSign, Settings2, CheckSquare, LogOut,
  Sparkles, MoreHorizontal,
} from "lucide-react";

// ── notification type map ───────────────────────────────────────────────────
const TYPE_META = {
  COMMENT:        { Icon: MessageSquare, color: "#6366f1", label: "Comment"   },
  TASK_ASSIGNED:  { Icon: Flag,          color: "#f59e0b", label: "Assigned"  },
  TASK_COMPLETED: { Icon: CheckCircle2,  color: "#10b981", label: "Completed" },
  MEMBER_JOINED:  { Icon: Users,         color: "#ec4899", label: "Joined"    },
  MEMBER_REMOVED: { Icon: Users,         color: "#ef4444", label: "Removed"   },
  FILE_UPLOADED:  { Icon: Paperclip,     color: "#3b82f6", label: "File"      },
  PROJECT_UPDATE: { Icon: FolderOpen,    color: "#f97316", label: "Project"   },
  MENTION:        { Icon: AtSign,        color: "#8b5cf6", label: "Mention"   },
  ROLE_CHANGED:   { Icon: Settings2,     color: "#8b5cf6", label: "Role"      },
};
const DEFAULT_META = { Icon: Bell, color: "#71717a", label: "Alert" };

// ── breadcrumb from pathname ────────────────────────────────────────────────
function useBreadcrumb() {
  const pathname = usePathname();
  if (!pathname || pathname === "/") return [];
  return pathname.split("/").filter(Boolean).map(seg =>
    seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ")
  );
}

// ── Portal Panel — renders at body level, positioned with fixed ─────────────
function PortalPanel({ anchorRef, open, children, width = 340, align = "right" }) {
  const [coords, setCoords] = useState({ top: 0, right: 0, left: 0 });

  useEffect(() => {
    if (!open || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setCoords({
      top:   rect.bottom + 8,            // 8px gap below the trigger
      right: window.innerWidth - rect.right,
      left:  rect.left,
    });
  }, [open, anchorRef]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      style={{
        position:  "fixed",
        top:       coords.top,
        ...(align === "right" ? { right: coords.right } : { left: coords.left }),
        width,
        zIndex:    9999,          // above everything — sidebars, modals, etc.
        borderRadius: 16,
        overflow: "hidden",
        background: "linear-gradient(160deg,#111119,#0e0e16)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 32px 64px rgba(0,0,0,0.8),0 0 0 1px rgba(255,255,255,0.03)",
      }}
    >
      {children}
    </div>,
    document.body
  );
}

// ── Topbar ──────────────────────────────────────────────────────────────────
export default function Topbar({ onSearchOpen, onSidebarToggle }) {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const router = useRouter();
  const crumbs = useBreadcrumb();

  const [showNotif,     setShowNotif]     = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread,        setUnread]        = useState(0);
  const [showProfile,   setShowProfile]   = useState(false);

  const notifRef   = useRef(null);
  const profileRef = useRef(null);

  // load notifications
  useEffect(() => {
    if (!user?.id) return;
    api.notifications.getAll(user.id)
      .then(d => { setNotifications(d.notifications || []); setUnread(d.unreadCount || 0); })
      .catch(() => {});
  }, [user?.id]);

  // real-time
  useEffect(() => {
    if (!socket?.on) return;
    return socket.on("new_notification", n => {
      setNotifications(p => [n, ...p]);
      setUnread(u => u + 1);
    });
  }, [socket]);

  // close on outside click — checks both anchors AND their portals
  useEffect(() => {
    const h = e => {
      // For each panel, if the click is outside both the trigger button AND the portal panel
      // we close it. Since the portal is at body level we need a data attribute trick.
      if (
        notifRef.current &&
        !notifRef.current.contains(e.target) &&
        !e.target.closest("[data-panel='notif']")
      ) setShowNotif(false);

      if (
        profileRef.current &&
        !profileRef.current.contains(e.target) &&
        !e.target.closest("[data-panel='profile']")
      ) setShowProfile(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const markRead = async n => {
    if (n.isRead) return;
    try {
      await api.notifications.markRead(n.id, user.id);
      setNotifications(p => p.map(x => x.id === n.id ? { ...x, isRead: true } : x));
      setUnread(u => Math.max(0, u - 1));
    } catch {}
  };

  const markAll = async () => {
    try {
      await api.notifications.markAllRead(user.id);
      setNotifications(p => p.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    } catch {}
  };

  const clearAll = async () => {
    try {
      await api.notifications.clearAll(user.id);
      setNotifications([]); setUnread(0);
    } catch {}
  };

  const handleLogout = () => { setShowProfile(false); logout(); router.push("/auth/login"); };

  return (
    <header
      className="h-12 flex items-center justify-between shrink-0 px-3 gap-3"
      style={{
        background:    "rgba(9,9,15,0.85)",
        borderBottom:  "1px solid rgba(255,255,255,0.06)",
        backdropFilter:"blur(16px)",
        position:      "relative",
        zIndex:        40,   // topbar itself sits above page content but below portals
      }}
    >
      {/* ── Left ── */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onSidebarToggle}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 transition-all shrink-0"
        >
          <Menu size={15} />
        </button>

        {crumbs.length > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium min-w-0">
            {crumbs.map((c, i) => (
              <span key={i} className="flex items-center gap-1.5 min-w-0">
                {i > 0 && <span className="text-zinc-700">/</span>}
                <span className={i === crumbs.length - 1 ? "text-zinc-300 truncate" : "text-zinc-600 truncate"}>
                  {c}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Centre: search trigger ── */}
      <button
        onClick={onSearchOpen}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] text-zinc-600 hover:text-zinc-400 transition-all group flex-1 max-w-xs"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <Search size={12} className="shrink-0 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
        <span className="flex-1 text-left truncate">Search anything...</span>
        <div className="flex items-center gap-0.5 shrink-0">
          <kbd className="text-[9px] text-zinc-700 bg-zinc-800/80 px-1 py-0.5 rounded font-sans border border-zinc-700/50">⌘</kbd>
          <kbd className="text-[9px] text-zinc-700 bg-zinc-800/80 px-1 py-0.5 rounded font-sans border border-zinc-700/50">K</kbd>
        </div>
      </button>

      {/* ── Right ── */}
      <div className="flex items-center gap-0.5 shrink-0">

        {/* AI button */}
        <button
          className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold transition-all"
          style={{ background: "linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08))", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }}
        >
          <Sparkles size={11} />
          <span>AI</span>
        </button>

        <div className="w-px h-4 bg-zinc-800/80 mx-1" />

        {/* ── Bell ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif(v => !v); setShowProfile(false); }}
            className={`relative w-8 h-8 flex items-center justify-center rounded-xl transition-all ${
              showNotif ? "bg-zinc-800 text-zinc-200" : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60"
            }`}
          >
            <Bell size={15} strokeWidth={1.8} />
            {unread > 0 && (
              <span className="absolute top-1 right-1 w-[18px] h-[18px] rounded-full bg-indigo-600 flex items-center justify-center text-[8px] font-bold text-white ring-2 ring-[#09090f]">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          <PortalPanel anchorRef={notifRef} open={showNotif} width={340} align="right">
            <div data-panel="notif">
              {/* header */}
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-2">
                  <Bell size={13} className="text-zinc-500" />
                  <span className="text-[13px] font-semibold text-zinc-100">Notifications</span>
                  {unread > 0 && (
                    <span className="text-[9px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded-full">{unread} new</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unread > 0 && (
                    <button onClick={markAll} className="text-[10px] font-medium text-zinc-600 hover:text-indigo-400 transition-colors">Mark all read</button>
                  )}
                  {notifications.length > 0 && (
                    <button onClick={clearAll} className="text-[10px] font-medium text-zinc-700 hover:text-red-400 transition-colors">Clear all</button>
                  )}
                  <button onClick={() => setShowNotif(false)} className="w-5 h-5 rounded-md flex items-center justify-center text-zinc-700 hover:text-zinc-300 hover:bg-zinc-800 transition-all">
                    <X size={11} />
                  </button>
                </div>
              </div>

              {/* list */}
              <div className="max-h-[360px] overflow-y-auto" style={{ scrollbarWidth: "none" }}>
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
                      <Bell size={18} className="text-zinc-600" strokeWidth={1.5} />
                    </div>
                    <div className="text-center">
                      <p className="text-[12px] font-semibold text-zinc-500">All caught up!</p>
                      <p className="text-[11px] text-zinc-700 mt-0.5">No new notifications</p>
                    </div>
                  </div>
                ) : notifications.map((n, idx) => {
                  const { Icon: NIcon, color } = TYPE_META[n.type] || DEFAULT_META;
                  return (
                    <button
                      key={n.id}
                      onClick={() => markRead(n)}
                      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-800/25 ${!n.isRead ? "bg-indigo-500/[0.03]" : ""} ${idx < notifications.length - 1 ? "border-b" : ""}`}
                      style={{ borderColor: "rgba(255,255,255,0.05)" }}
                    >
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: `${color}15`, border: `1px solid ${color}28` }}>
                        <NIcon size={13} style={{ color }} strokeWidth={1.8} />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="text-[12px] text-zinc-300 leading-snug font-medium">{n.message}</p>
                        <p className="text-[10px] text-zinc-600 mt-1 font-medium">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.isRead && (
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <button className="text-[11px] font-medium text-zinc-600 hover:text-indigo-400 transition-colors">
                    View all notifications →
                  </button>
                </div>
              )}
            </div>
          </PortalPanel>
        </div>

        {/* ── Avatar / Profile ── */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile(v => !v); setShowNotif(false); }}
            className={`flex items-center gap-1.5 ml-1 pl-1 pr-2 py-1 rounded-xl transition-all ${
              showProfile ? "bg-zinc-800/80" : "hover:bg-zinc-800/40"
            }`}
          >
            <div className="relative">
              <Avatar name={user?.fullname || "U"} src={user?.profile} size={26} color="#6366f1" />
              <span className="absolute -bottom-px -right-px w-2 h-2 bg-emerald-500 rounded-full border-[1.5px] border-[#09090f]" />
            </div>
            <span className="hidden sm:block text-[12px] font-medium text-zinc-400 max-w-[80px] truncate">
              {user?.fullname?.split(" ")[0]}
            </span>
            <ChevronDown size={11} className={`text-zinc-600 transition-transform duration-200 ${showProfile ? "rotate-180" : ""}`} />
          </button>

          <PortalPanel anchorRef={profileRef} open={showProfile} width={256} align="right">
            <div data-panel="profile">
              {/* user card */}
              <div className="px-4 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="relative">
                    <Avatar name={user?.fullname || "U"} src={user?.profile} size={40} color="#6366f1" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#111119]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-zinc-100 truncate">{user?.fullname || "—"}</p>
                    <p className="text-[11px] text-zinc-600 truncate">{user?.email}</p>
                  </div>
                </div>
                {user?.myRole && (
                  <div
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold"
                    style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#6ee7b7" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {user.myRole.replace(/_/g, " ")}
                  </div>
                )}
              </div>

              {/* actions */}
              <div className="p-1.5 space-y-0.5">
                {[
                  { icon: Settings2,   label: "Account Settings", href: "/settings"  },
                  { icon: CheckSquare, label: "My Tasks",          href: "/my-tasks"  },
                ].map(({ icon: I, label, href }) => (
                  <button
                    key={href}
                    onClick={() => { setShowProfile(false); router.push(href); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50 transition-all text-left"
                  >
                    <I size={14} strokeWidth={1.8} className="text-zinc-600" />
                    {label}
                  </button>
                ))}
              </div>

              {/* logout */}
              <div className="p-1.5" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12px] font-medium text-red-400 hover:text-red-300 hover:bg-red-500/8 transition-all text-left"
                >
                  <LogOut size={14} strokeWidth={1.8} />
                  Sign out
                </button>
              </div>
            </div>
          </PortalPanel>
        </div>

      </div>
    </header>
  );
}