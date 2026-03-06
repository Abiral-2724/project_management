"use client";
import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import AppLayout from "@/components/layout/AppLayout";
import { Avatar, showToast } from "@/components/ui";
import {
  User, Bell, Shield, Trash2, Camera, ChevronDown,
  CheckCircle2, Save, KeyRound, AlertTriangle, Loader2,
  Mail, Briefcase, AtSign,
} from "lucide-react";

// ── shared tiny components ──────────────────────────────────────────────────

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-[22px] rounded-full transition-all duration-200 focus:outline-none ${
        checked ? "bg-indigo-600" : "bg-zinc-700/80"
      }`}
      style={checked ? { boxShadow: "0 0 10px rgba(99,102,241,0.4)" } : {}}
    >
      <span
        className={`absolute top-[3px] w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
          checked ? "translate-x-[22px]" : "translate-x-[3px]"
        }`}
      />
    </button>
  );
}

function SectionCard({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-6 ${className}`}
      style={{ background: "linear-gradient(160deg,#111119,#0e0e15)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
      >
        <Icon size={15} className="text-indigo-400" strokeWidth={1.8} />
      </div>
      <div>
        <h3 className="text-[13px] font-semibold text-zinc-100 leading-tight">{title}</h3>
        {subtitle && <p className="text-[11px] text-zinc-600 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}

function FieldLabel({ children }) {
  return <label className="block text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">{children}</label>;
}

function FieldInput({ icon: FieldIcon, readOnly, className = "", ...props }) {
  return (
    <div className="relative">
      {FieldIcon && (
        <FieldIcon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" strokeWidth={1.8} />
      )}
      <input
        readOnly={readOnly}
        className={`w-full text-[13px] rounded-xl px-3.5 py-2.5 outline-none transition-all ${
          FieldIcon ? "pl-9" : ""
        } ${
          readOnly
            ? "bg-zinc-800/30 border border-zinc-800/60 text-zinc-600 cursor-not-allowed"
            : "bg-zinc-800/40 border border-zinc-700/50 text-zinc-200 focus:border-indigo-500/60 focus:bg-indigo-500/5 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
        } ${className}`}
        style={{ fontFamily: "'Outfit', sans-serif" }}
        {...props}
      />
    </div>
  );
}

const ROLES = ["Team_member","Manager","Director","Executive","Business_owner","Freelancer","Student","Other","Prefer_not_to_say"];

const NOTIF_SECTIONS = [
  { key: "tasks",          label: "Task assignments",  desc: "When you're assigned a new task",         color: "#f59e0b" },
  { key: "comments",       label: "Comments",          desc: "When someone comments on your tasks",     color: "#6366f1" },
  { key: "projectUpdates", label: "Project updates",   desc: "New members, role changes, milestones",   color: "#10b981" },
  { key: "digest",         label: "Weekly digest",     desc: "A summary of your weekly activity",       color: "#8b5cf6" },
];

// ── sidebar tabs ─────────────────────────────────────────────────────────────
const TABS = [
  { key: "profile",       label: "Profile",       Icon: User    },
  { key: "notifications", label: "Notifications", Icon: Bell    },
  { key: "security",      label: "Security",      Icon: Shield  },
  { key: "danger",        label: "Danger Zone",   Icon: Trash2  },
];

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const fileRef = useRef(null);

  const [activeTab, setActiveTab]           = useState("profile");
  const [fullname, setFullname]             = useState(user?.fullname || "");
  const [myrole, setMyrole]                 = useState(user?.myRole || "Team_member");
  const [profileFile, setProfileFile]       = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [saving, setSaving]                 = useState(false);
  const [notifs, setNotifs]                 = useState({ tasks: true, comments: true, projectUpdates: false, digest: true });

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setProfileFile(f);
    setProfilePreview(URL.createObjectURL(f));
  };

  const saveProfile = async () => {
    if (!fullname.trim()) { showToast("Name is required", "error"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("fullname", fullname);
      fd.append("myrole", myrole);
      if (profileFile) fd.append("file", profileFile);
      await api.auth.accountSetup(user.id, fd);
      await refreshUser();
      showToast("Profile updated!");
    } catch (e) { showToast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const avatarSrc = profilePreview || user?.profile;

  return (
    <AppLayout>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap'); .settings-root *{font-family:'Outfit',sans-serif;}`}</style>
      <div className="settings-root min-h-full" style={{ background: "linear-gradient(160deg,#09090f,#080810)" }}>
        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* ── Page header ── */}
          <div className="mb-8">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.12em] mb-1">Account</p>
            <h1 className="text-[24px] font-bold text-white tracking-tight">Settings</h1>
            <p className="text-[13px] text-zinc-500 mt-1">Manage your account preferences and configuration.</p>
          </div>

          <div className="flex gap-6 items-start">

            {/* ── Tab sidebar ── */}
            <nav className="w-44 shrink-0 flex flex-col gap-0.5">
              {TABS.map(({ key, label, Icon: TabIcon }) => {
                const active = activeTab === key;
                const isDanger = key === "danger";
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[12.5px] font-medium transition-all text-left w-full ${
                      isDanger
                        ? active
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "text-zinc-600 hover:text-red-400 hover:bg-red-500/8"
                        : active
                          ? "text-white"
                          : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/40"
                    }`}
                    style={active && !isDanger ? {
                      background: "rgba(99,102,241,0.1)",
                      border: "1px solid rgba(99,102,241,0.25)",
                      boxShadow: "inset 0 0 20px rgba(99,102,241,0.05)",
                    } : { border: "1px solid transparent" }}
                  >
                    <TabIcon
                      size={14}
                      strokeWidth={active ? 2.2 : 1.8}
                      className={isDanger ? (active ? "text-red-400" : "text-zinc-600") : active ? "text-indigo-400" : "text-zinc-600"}
                    />
                    {label}
                  </button>
                );
              })}
            </nav>

            {/* ── Content ── */}
            <div className="flex-1 min-w-0">

              {/* ══ PROFILE ══ */}
              {activeTab === "profile" && (
                <div className="space-y-4">
                  <SectionCard>
                    <SectionHeader icon={User} title="Public Profile" subtitle="This info appears across Planzo" />

                    {/* Avatar */}
                    <div className="flex items-center gap-5 mb-7 pb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                      <div className="relative group">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden ring-2 ring-indigo-500/20 ring-offset-2 ring-offset-[#0e0e15]">
                          {avatarSrc
                            ? <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                            : <Avatar name={user?.fullname || "U"} size={64} color="#6366f1" />
                          }
                        </div>
                        <button
                          onClick={() => fileRef.current?.click()}
                          className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                          style={{ background: "rgba(0,0,0,0.65)" }}
                        >
                          <Camera size={16} className="text-white" strokeWidth={1.8} />
                        </button>
                        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[13px] font-semibold text-zinc-200">{user?.fullname}</p>
                        <p className="text-[12px] text-zinc-500 mt-0.5">{user?.email}</p>
                        <div className="flex items-center gap-1.5 mt-2">
                          {user?.isVerified ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 px-2 py-0.5 rounded-full" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                              <CheckCircle2 size={9} /> Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 px-2 py-0.5 rounded-full" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                              <AlertTriangle size={9} /> Not verified
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="text-[12px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors px-3 py-2 rounded-xl hover:bg-indigo-500/10"
                      >
                        Change photo
                      </button>
                    </div>

                    {/* Form fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Full Name</FieldLabel>
                        <FieldInput icon={User} value={fullname} onChange={e => setFullname(e.target.value)} placeholder="Your full name" />
                      </div>
                      <div>
                        <FieldLabel>Email address</FieldLabel>
                        <FieldInput icon={Mail} value={user?.email || ""} readOnly />
                      </div>
                      <div className="sm:col-span-2">
                        <FieldLabel>Your role</FieldLabel>
                        <div className="relative">
                          <Briefcase size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" strokeWidth={1.8} />
                          <select
                            value={myrole}
                            onChange={e => setMyrole(e.target.value)}
                            className="w-full text-[13px] bg-zinc-800/40 border border-zinc-700/50 text-zinc-200 rounded-xl pl-9 pr-10 py-2.5 outline-none appearance-none cursor-pointer transition-all focus:border-indigo-500/60 focus:bg-indigo-500/5 focus:shadow-[0_0_0_3px_rgba(99,102,241,0.1)]"
                            style={{ fontFamily: "'Outfit',sans-serif" }}
                          >
                            {ROLES.map(r => <option key={r} value={r} style={{ background: "#1a1a2e" }}>{r.replace(/_/g, " ")}</option>)}
                          </select>
                          <ChevronDown size={13} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Save */}
                    <div className="flex items-center justify-between mt-6 pt-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <p className="text-[11px] text-zinc-600">Changes are saved to your account immediately.</p>
                      <button
                        onClick={saveProfile}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
                      >
                        {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                        {saving ? "Saving…" : "Save changes"}
                      </button>
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* ══ NOTIFICATIONS ══ */}
              {activeTab === "notifications" && (
                <SectionCard>
                  <SectionHeader icon={Bell} title="Notification Preferences" subtitle="Choose what you want to be notified about" />
                  <div className="space-y-1">
                    {NOTIF_SECTIONS.map((s, i) => (
                      <div
                        key={s.key}
                        className={`flex items-center justify-between py-4 ${i < NOTIF_SECTIONS.length - 1 ? "border-b" : ""}`}
                        style={{ borderColor: "rgba(255,255,255,0.05)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: `${s.color}15`, border: `1px solid ${s.color}28` }}
                          >
                            <Bell size={12} style={{ color: s.color }} strokeWidth={1.8} />
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-zinc-200">{s.label}</p>
                            <p className="text-[11px] text-zinc-600 mt-0.5">{s.desc}</p>
                          </div>
                        </div>
                        <Toggle
                          checked={notifs[s.key]}
                          onChange={v => setNotifs(p => ({ ...p, [s.key]: v }))}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-5 flex justify-end" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <button
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all"
                      style={{ background: "linear-gradient(135deg,#6366f1,#7c3aed)", boxShadow: "0 4px 16px rgba(99,102,241,0.3)" }}
                    >
                      <Save size={13} /> Save preferences
                    </button>
                  </div>
                </SectionCard>
              )}

              {/* ══ SECURITY ══ */}
              {activeTab === "security" && (
                <div className="space-y-4">
                  <SectionCard>
                    <SectionHeader icon={Shield} title="Security" subtitle="Manage your password and authentication" />

                    {/* Password row */}
                    <div
                      className="flex items-center justify-between py-4 rounded-xl px-4"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}>
                          <KeyRound size={14} className="text-indigo-400" strokeWidth={1.8} />
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-zinc-200">Password</p>
                          <p className="text-[11px] text-zinc-600 mt-0.5">Last changed: unknown</p>
                        </div>
                      </div>
                      <button
                        className="text-[12px] font-semibold text-zinc-300 hover:text-white px-3 py-2 rounded-xl transition-all hover:bg-zinc-800/60"
                        style={{ border: "1px solid rgba(255,255,255,0.08)" }}
                      >
                        Change password
                      </button>
                    </div>

                    {/* 2FA row */}
                    <div
                      className="flex items-center justify-between py-4 rounded-xl px-4 mt-3"
                      style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
                          <Shield size={14} className="text-emerald-400" strokeWidth={1.8} />
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-zinc-200">Two-factor authentication</p>
                          <p className="text-[11px] text-zinc-600 mt-0.5">Add an extra layer of security to your account</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider px-2.5 py-1 rounded-full bg-zinc-800/60 border border-zinc-700/50">
                        Coming soon
                      </span>
                    </div>

                    {/* Active sessions */}
                    <div className="mt-5">
                      <p className="text-[11px] font-bold text-zinc-600 uppercase tracking-[0.1em] mb-3">Active sessions</p>
                      <div
                        className="flex items-center justify-between py-3.5 px-4 rounded-xl"
                        style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <div>
                          <p className="text-[12px] font-medium text-zinc-300">Current session</p>
                          <p className="text-[11px] text-zinc-600 mt-0.5">This device · Active now</p>
                        </div>
                        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400" style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", padding: "3px 8px", borderRadius: 6 }}>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      </div>
                    </div>
                  </SectionCard>
                </div>
              )}

              {/* ══ DANGER ══ */}
              {activeTab === "danger" && (
                <SectionCard>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <Trash2 size={15} className="text-red-400" strokeWidth={1.8} />
                    </div>
                    <div>
                      <h3 className="text-[13px] font-semibold text-red-400">Danger Zone</h3>
                      <p className="text-[11px] text-zinc-600 mt-0.5">These actions are irreversible</p>
                    </div>
                  </div>

                  <div
                    className="rounded-xl px-5 py-4 mb-3"
                    style={{ background: "rgba(239,68,68,0.04)", border: "1px solid rgba(239,68,68,0.15)" }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-[13px] font-semibold text-zinc-200">Delete account</p>
                        <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed max-w-xs">
                          Permanently delete your account and all associated data including projects, tasks, and files. This action cannot be undone.
                        </p>
                      </div>
                      <button
                        className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold text-red-400 hover:text-red-300 transition-all hover:bg-red-500/10"
                        style={{ border: "1px solid rgba(239,68,68,0.3)" }}
                      >
                        <Trash2 size={13} />
                        Delete account
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl" style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}>
                    <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" strokeWidth={1.8} />
                    <p className="text-[11px] text-amber-500/80 leading-relaxed">
                      Before deleting your account, make sure to export any data you want to keep. This action is permanent and cannot be reversed.
                    </p>
                  </div>
                </SectionCard>
              )}

            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}