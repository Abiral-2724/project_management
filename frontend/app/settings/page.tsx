"use client";
import { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import AppLayout from "@/components/layout/AppLayout";
import { Icon, Avatar, Button, Input, Select, showToast } from "@/components/ui";

function Toggle({ checked, onChange }) {
  return (
    <button onClick={() => onChange(!checked)} className={`relative w-9 h-5 rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-zinc-700"}`}>
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-4" : "translate-x-0.5"}`} />
    </button>
  );
}

const ROLES = ["Team_member","Manager","Director","Executive","Business_owner","Freelancer","Student","Other","Prefer_not_to_say"];

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const fileRef = useRef(null);
  const [fullname, setFullname] = useState(user?.fullname || "");
  const [myrole, setMyrole] = useState(user?.myRole || "Team_member");
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notifs, setNotifs] = useState({ tasks: true, comments: true, projectUpdates: false, digest: true });

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

  const sections = [
    { key: "tasks", label: "Task assignments", desc: "When you're assigned a new task" },
    { key: "comments", label: "Task comments", desc: "When someone comments on your tasks" },
    { key: "projectUpdates", label: "Project updates", desc: "New members, role changes, milestones" },
    { key: "digest", label: "Weekly digest", desc: "Summary of your activity" },
  ];

  return (
    <AppLayout>
      <div className="p-6 max-w-2xl">
        <div className="mb-6">
          <p className="text-zinc-500 text-xs font-medium tracking-widest uppercase mb-1">Account</p>
          <h1 className="text-2xl font-semibold text-white">Settings</h1>
        </div>

        <div className="space-y-4">
          {/* Profile */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">Profile</h3>
            <div className="flex items-center gap-4 mb-5">
              <div className="relative">
                {profilePreview || user?.profile ? (
                  <img src={profilePreview || user.profile} alt="Profile" className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <Avatar name={user?.fullname || "U"} size={56} color="#6366f1" />
                )}
                <button onClick={() => fileRef.current?.click()} className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center transition-colors">
                  <Icon name="edit" size={10} className="text-white" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">{user?.fullname}</p>
                <p className="text-xs text-zinc-500">{user?.email}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{user?.isVerified ? "✓ Verified" : "⚠ Not verified"}</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input label="Full Name" value={fullname} onChange={(e) => setFullname(e.target.value)} placeholder="Your name" />
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
                <input value={user?.email || ""} readOnly className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-3.5 py-2.5 text-sm text-zinc-500 cursor-not-allowed" />
              </div>
              <Select label="Role" value={myrole} onChange={(e) => setMyrole(e.target.value)} className="sm:col-span-2">
                {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
              </Select>
            </div>
            <Button loading={saving} onClick={saveProfile} className="mt-4">Save Changes</Button>
          </div>

          {/* Notifications */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">Notifications</h3>
            <div className="space-y-0">
              {sections.map((s, i) => (
                <div key={s.key} className={`flex items-center justify-between py-3.5 ${i < sections.length - 1 ? "border-b border-zinc-800/60" : ""}`}>
                  <div>
                    <p className="text-sm text-zinc-200">{s.label}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{s.desc}</p>
                  </div>
                  <Toggle checked={notifs[s.key]} onChange={(v) => setNotifs((p) => ({ ...p, [s.key]: v }))} />
                </div>
              ))}
            </div>
          </div>

          {/* Security */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-4">Security</h3>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm text-zinc-200">Password</p>
                <p className="text-xs text-zinc-500 mt-0.5">Last changed: unknown</p>
              </div>
              <Button variant="secondary" size="sm">Change Password</Button>
            </div>
          </div>

          {/* Danger zone */}
          <div className="bg-zinc-900 border border-red-500/20 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-red-400 mb-2">Danger Zone</h3>
            <p className="text-xs text-zinc-500 mb-3">Once you delete your account, all data will be permanently removed.</p>
            <Button variant="danger" size="sm">Delete Account</Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}