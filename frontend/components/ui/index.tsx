"use client";

// ─── ICONS ────────────────────────────────────────────────────────────────────
const iconPaths = {
  home: <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
  check: <><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></>,
  checkSimple: <polyline points="20 6 9 17 4 12"/>,
  users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
  search: <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
  plus: <><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>,
  folder: <><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></>,
  bar: <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>,
  message: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  chevronDown: <polyline points="6 9 12 15 18 9"/>,
  chevronRight: <polyline points="9 18 15 12 9 6"/>,
  chevronLeft: <polyline points="15 18 9 12 15 6"/>,
  x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  menu: <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>,
  clock: <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>,
  grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
  list: <><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></>,
  paperclip: <><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></>,
  activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  edit: <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  trash: <><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></>,
  send: <><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></>,
  upload: <><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>,
  zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,
  eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
  eyeOff: <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></>,
  loader: <><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></>,
  alertCircle: <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>,
  reply: <><polyline points="9 17 4 12 9 7"/><path d="M20 18v-2a4 4 0 0 0-4-4H4"/></>,
  moreH: <><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></>,
  flag: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></>,
  link: <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></>,
};

export const Icon = ({ name, size = 16, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
    {iconPaths[name]}
  </svg>
);

// ─── AVATAR ───────────────────────────────────────────────────────────────────
const PROJECT_COLORS = ["#6366f1","#f59e0b","#10b981","#ec4899","#3b82f6","#8b5cf6","#ef4444","#06b6d4"];
export const getProjectColor = (id) => PROJECT_COLORS[(id?.charCodeAt(0) || 0) % PROJECT_COLORS.length];

export const Avatar = ({ name = "", src, size = 32, color }) => {
  const initials = (name || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const bg = color || getProjectColor(name);
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.37, fontWeight: 700, color: "#fff", flexShrink: 0, userSelect: "none" }}>
      {initials}
    </div>
  );
};

// ─── BADGE ────────────────────────────────────────────────────────────────────
const badgeStyles = {
  default: "bg-zinc-800 text-zinc-300",
  high: "bg-red-500/15 text-red-400 border border-red-500/25",
  medium: "bg-amber-500/15 text-amber-400 border border-amber-500/25",
  low: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
  todo: "bg-zinc-700/70 text-zinc-400",
  "in progress": "bg-blue-500/15 text-blue-400 border border-blue-500/25",
  "in review": "bg-violet-500/15 text-violet-400 border border-violet-500/25",
  done: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
  owner: "bg-amber-500/15 text-amber-400",
  admin: "bg-blue-500/15 text-blue-400",
  editor: "bg-violet-500/15 text-violet-400",
  viewer: "bg-zinc-700 text-zinc-500",
  commenter: "bg-zinc-700 text-zinc-500",
};

export const Badge = ({ children, variant }) => {
  const v = (variant || String(children || "").toLowerCase());
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${badgeStyles[v] || badgeStyles.default}`}>
      {children}
    </span>
  );
};

export const priorityVariant = (p) => (p || "").toLowerCase();
export const statusVariant = (s) => (s || "").toLowerCase();

// ─── SPINNER ──────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="animate-spin text-zinc-500">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
  </svg>
);

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
export const Empty = ({ icon = "folder", title, desc, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center mb-3">
      <Icon name={icon} size={22} className="text-zinc-600" />
    </div>
    <p className="text-sm font-medium text-zinc-400">{title}</p>
    {desc && <p className="text-xs text-zinc-600 mt-1 max-w-xs">{desc}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

// ─── INPUT ────────────────────────────────────────────────────────────────────
export const Input = ({ label, error, className = "", ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>}
    <input
      className={`w-full bg-zinc-800/80 border rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors ${error ? "border-red-500/60 focus:border-red-500" : "border-zinc-700/80 focus:border-indigo-500/80"} ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
  </div>
);

// ─── TEXTAREA ─────────────────────────────────────────────────────────────────
export const Textarea = ({ label, error, className = "", ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>}
    <textarea
      className={`w-full bg-zinc-800/80 border rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors resize-none ${error ? "border-red-500/60" : "border-zinc-700/80 focus:border-indigo-500/80"} ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
  </div>
);

// ─── SELECT ───────────────────────────────────────────────────────────────────
export const Select = ({ label, error, className = "", children, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-xs font-medium text-zinc-400 mb-1.5">{label}</label>}
    <select
      className={`w-full bg-zinc-800/80 border border-zinc-700/80 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-indigo-500/80 transition-colors ${className}`}
      {...props}
    >
      {children}
    </select>
    {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
  </div>
);

// ─── BUTTON ───────────────────────────────────────────────────────────────────
const btnVariants = {
  primary: "bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white",
  secondary: "bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700",
  danger: "bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30",
  ghost: "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200",
};

export const Button = ({ variant = "primary", size = "md", loading, icon, children, className = "", ...props }) => {
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-sm" };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${btnVariants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Spinner size={14} /> : icon && <Icon name={icon} size={14} />}
      {children}
    </button>
  );
};

// ─── MODAL ────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, wide }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className={`relative bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full ${wide ? "max-w-2xl" : "max-w-md"} max-h-[90vh] overflow-y-auto`}
        style={{ boxShadow: "0 25px 60px rgba(0,0,0,0.7)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors"><Icon name="x" size={16} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
export let showToast = () => {};

export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl pointer-events-auto animate-in slide-in-from-bottom-4 ${t.type === "error" ? "bg-red-950 border-red-500/30 text-red-300" : t.type === "warning" ? "bg-amber-950 border-amber-500/30 text-amber-300" : "bg-zinc-900 border-zinc-700 text-zinc-200"}`}>
          <Icon name={t.type === "error" ? "alertCircle" : "checkSimple"} size={14} className={t.type === "error" ? "text-red-400" : "text-emerald-400"} />
          {t.message}
        </div>
      ))}
    </div>
  );
};

// ─── UTIL HELPERS ─────────────────────────────────────────────────────────────
export const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—";
export const formatDateInput = (d) => d ? new Date(d).toISOString().split("T")[0] : "";

export const timeAgo = (d) => {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export const actionLabel = (action, meta) => {
  const m = typeof meta === "string" ? JSON.parse(meta || "{}") : (meta || {});
  const map = {
    TASK_CREATED:    `created task "${m.taskTitle || m.title || "a task"}"${m.assignee ? ` and assigned to ${m.assignee}` : ""}`,
    TASK_COMPLETED:  `completed "${m.taskTitle || m.title || "a task"}"`,
    TASK_REOPENED:   `reopened "${m.taskTitle || m.title || "a task"}"`,
    TASK_UPDATED:    `updated task "${m.taskTitle || m.title || "a task"}"`,
    STATUS_CHANGED:  `moved "${m.taskTitle || m.title}" to ${m.to}`,
    MEMBER_ADDED:    `added ${m.email}${m.role ? ` as ${m.role}` : ""} to the project`,
    MEMBER_INVITED:  `invited ${m.email}`,
    MEMBER_REMOVED:  `removed ${m.email} from the project`,
    ROLE_CHANGED:    `changed ${m.email}'s role to ${m.newRole || m.role}`,
    FILE_UPLOADED:   `uploaded "${m.fileName || "a file"}"${m.taskTitle ? ` to task "${m.taskTitle}"` : ""}`,
    PROJECT_CREATED: `created project "${m.projectName || ""}"`,
    COMMENT:         `commented on "${m.taskTitle || m.title || "a task"}"`,
  };
  return map[action] || action?.toLowerCase().replace(/_/g, " ");
};

import { useState } from "react";