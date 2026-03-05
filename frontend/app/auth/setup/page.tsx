"use client";
export const dynamic = "force-dynamic";
import { useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Icon, Button, Input, Select, showToast } from "@/components/ui";

const ROLES = ["Team_member","Manager","Director","Executive","Business_owner","Freelancer","Student","Other","Prefer_not_to_say"];

export default function SetupPage({ searchParams }) {
  const router = useRouter();
  //const params = useSearchParams();
  const id = searchParams?.id;
  const { refreshUser } = useAuth();
  const fileRef = useRef(null);
  const [fullname, setFullname] = useState("");
  const [myrole, setMyrole] = useState("Team_member");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async () => {
    if (!fullname.trim()) { setError("Full name is required"); return; }
    if (!file) { setError("Profile photo is required"); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("fullname", fullname);
      fd.append("myrole", myrole);
      fd.append("file", file);
      await api.auth.accountSetup(id, fd);
      await refreshUser();
      router.push("/dashboard");
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');`}</style>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center mb-3">
            <Icon name="zap" size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Set up your profile</h1>
          <p className="text-sm text-zinc-500 mt-1">Almost there! Tell us about yourself.</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
          {/* Avatar upload */}
          <div className="flex flex-col items-center gap-3">
            <button onClick={() => fileRef.current?.click()} className="relative w-20 h-20 rounded-full border-2 border-dashed border-zinc-700 hover:border-indigo-500 transition-colors flex items-center justify-center overflow-hidden group">
              {preview ? (
                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-zinc-600 group-hover:text-indigo-400 transition-colors">
                  <Icon name="upload" size={20} />
                  <span className="text-xs">Photo</span>
                </div>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          <Input label="Full Name" value={fullname} onChange={(e) => { setFullname(e.target.value); setError(""); }} placeholder="Alex Morgan" />
          <Select label="Your Role" value={myrole} onChange={(e) => setMyrole(e.target.value)}>
            {ROLES.map((r) => <option key={r} value={r}>{r.replace(/_/g, " ")}</option>)}
          </Select>

          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button loading={loading} onClick={submit} className="w-full justify-center">Continue to Dashboard</Button>
        </div>
      </div>
    </div>
  );
}