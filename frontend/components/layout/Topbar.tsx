"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { api } from "@/lib/api";
import { Icon, Avatar, timeAgo } from "@/components/ui";

export default function Topbar({ onSearchOpen, onSidebarToggle }) {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const router = useRouter();

  // ── Notification state ─────────────────────────────────────────────────────
  const [showNotif, setShowNotif]           = useState(false);
  const [notifications, setNotifications]   = useState([]);
  const [unread, setUnread]                 = useState(0);
  const notifRef = useRef(null);

  // ── Avatar dropdown state ──────────────────────────────────────────────────
  const [showProfile, setShowProfile]       = useState(false);
  const profileRef = useRef(null);

  // ── Load notifications on mount ────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    api.notifications.getAll(user.id)
      .then((data) => {
        setNotifications(data.notifications || []);
        setUnread(data.unreadCount || 0);
      })
      .catch(() => {});
  }, [user?.id]);

  // ── Real-time: socket pushes new notification instantly ───────────────────
  useEffect(() => {
    if (!socket?.on) return;
    const off = socket.on("new_notification", (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      setUnread((u) => u + 1);
    });
    return off;
  }, [socket]);

  // ── Close panels on outside click ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Notification actions ───────────────────────────────────────────────────
  const markRead = async (n) => {
    if (n.isRead) return;
    try {
      await api.notifications.markRead(n.id, user.id);
      setNotifications((prev) => prev.map((x) => x.id === n.id ? { ...x, isRead: true } : x));
      setUnread((u) => Math.max(0, u - 1));
    } catch {}
  };

  const markAll = async () => {
    try {
      await api.notifications.markAllRead(user.id);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
    } catch {}
  };

  const clearAll = async () => {
    try {
      await api.notifications.clearAll(user.id);
      setNotifications([]);
      setUnread(0);
    } catch {}
  };

  // ── Logout ─────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    setShowProfile(false);
    logout();
    router.push("/auth/login");
  };

  // ── Icon / colour maps ────────────────────────────────────────────────────
  const typeIcon = {
    COMMENT: "message", TASK_ASSIGNED: "flag", TASK_COMPLETED: "checkSimple",
    MEMBER_JOINED: "users", MEMBER_REMOVED: "users", FILE_UPLOADED: "paperclip",
    PROJECT_UPDATE: "folder", MENTION: "link", ROLE_CHANGED: "settings",
  };
  const typeColor = {
    COMMENT: "#6366f1", TASK_ASSIGNED: "#f59e0b", TASK_COMPLETED: "#10b981",
    MEMBER_JOINED: "#ec4899", FILE_UPLOADED: "#3b82f6", ROLE_CHANGED: "#8b5cf6",
  };

  return (
    <header className="h-12 flex items-center justify-between px-4 border-b border-zinc-800/70 bg-zinc-950/80 backdrop-blur-sm shrink-0">
      <button onClick={onSidebarToggle} className="text-zinc-600 hover:text-zinc-400 transition-colors">
        <Icon name="menu" size={18} />
      </button>

      {/* Search */}
      <button
        onClick={onSearchOpen}
        className="flex-1 max-w-sm mx-4 flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-600 hover:border-zinc-700 hover:text-zinc-400 transition-colors"
      >
        <Icon name="search" size={13} />
        <span>Search anything...</span>
        <kbd className="ml-auto text-xs bg-zinc-800 px-1 py-0.5 rounded font-sans">⌘K</kbd>
      </button>

      <div className="flex items-center gap-1.5">

        {/* ── Notification bell ─────────────────────────────────────────────── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setShowNotif((v) => !v); setShowProfile(false); }}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <Icon name="bell" size={16} />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-zinc-950" />
            )}
          </button>

          {showNotif && (
            <div
              className="absolute top-10 right-0 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden"
              style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.6)" }}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-200">Notifications</span>
                  {unread > 0 && (
                    <span className="text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-medium">{unread}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {unread > 0 && (
                    <button onClick={markAll} className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">Mark all read</button>
                  )}
                  {notifications.length > 0 && (
                    <button onClick={clearAll} className="text-xs text-zinc-600 hover:text-red-400 transition-colors">Clear</button>
                  )}
                  <button onClick={() => setShowNotif(false)} className="text-zinc-600 hover:text-zinc-400">
                    <Icon name="x" size={14} />
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center py-10 gap-2">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                      <Icon name="bell" size={18} className="text-zinc-600" />
                    </div>
                    <p className="text-xs text-zinc-600">You're all caught up!</p>
                  </div>
                ) : notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markRead(n)}
                    className={`w-full flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/60 transition-colors text-left border-b border-zinc-800/50 last:border-0 ${!n.isRead ? "bg-indigo-500/5" : ""}`}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: (typeColor[n.type] || "#71717a") + "22" }}
                    >
                      <Icon name={typeIcon[n.type] || "bell"} size={13} style={{ color: typeColor[n.type] || "#71717a" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-300 leading-snug">{n.message}</p>
                      <p className="text-xs text-zinc-600 mt-0.5">{timeAgo(n.createdAt)}</p>
                    </div>
                    {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Avatar → profile dropdown ─────────────────────────────────────── */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setShowProfile((v) => !v); setShowNotif(false); }}
            className="flex items-center gap-1.5 rounded-lg p-1 hover:bg-zinc-800/60 transition-colors"
          >
            <Avatar name={user?.fullname || "U"} src={user?.profile} size={28} color="#6366f1" />
            <Icon name="chevronDown" size={12} className={`text-zinc-600 transition-transform duration-200 ${showProfile ? "rotate-180" : ""}`} />
          </button>

          {showProfile && (
            <div
              className="absolute top-11 right-0 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden"
              style={{ boxShadow: "0 25px 50px rgba(0,0,0,0.6)" }}
            >
              {/* User card */}
              <div className="px-4 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <Avatar name={user?.fullname || "U"} src={user?.profile} size={40} color="#6366f1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-100 truncate">{user?.fullname || "—"}</p>
                    <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                  </div>
                </div>
                {user?.myRole && (
                  <div className="mt-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-xs text-zinc-400">{user.myRole.replace(/_/g, " ")}</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="p-1.5">
                <button
                  onClick={() => { setShowProfile(false); router.push("/settings"); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <Icon name="settings" size={14} />
                  <span>Account Settings</span>
                </button>
                <button
                  onClick={() => { setShowProfile(false); router.push("/my-tasks"); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <Icon name="check" size={14} />
                  <span>My Tasks</span>
                </button>
              </div>

              {/* Logout */}
              <div className="p-1.5 border-t border-zinc-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <Icon name="logout" size={14} />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}