"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Icon, Button } from "@/components/ui";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const submit = async (e) => {
    e?.preventDefault();
    const errs = {};
    if (!email) errs.email = "Email is required";
    if (!password || password.length < 6) errs.password = "At least 6 characters";
    if (password !== confirm) errs.confirm = "Passwords don't match";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const user = await register(email, password);
      router.push(`/auth/verify?id=${user.id}`);
    } catch (e) {
      setErrors({ form: e.message });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');`}</style>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center mb-3">
            <Icon name="zap" size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Nexus</h1>
          <p className="text-sm text-zinc-500 mt-1">Create your workspace</p>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          {errors.form && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-red-500/10 border border-red-500/20 rounded-xl mb-4 text-sm text-red-400">
              <Icon name="alertCircle" size={14} /> {errors.form}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
              <input value={email} onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({...p, email:""})); }} type="email" placeholder="you@company.com" className={`w-full bg-zinc-800/80 border rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors ${errors.email ? "border-red-500/60" : "border-zinc-700/80 focus:border-indigo-500/80"}`} />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
              <div className="relative">
                <input value={password} onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({...p, password:""})); }} type={showPass ? "text" : "password"} placeholder="Min. 6 characters" className={`w-full bg-zinc-800/80 border rounded-xl px-3.5 py-2.5 pr-10 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors ${errors.password ? "border-red-500/60" : "border-zinc-700/80 focus:border-indigo-500/80"}`} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400">
                  <Icon name={showPass ? "eyeOff" : "eye"} size={15} />
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Confirm Password</label>
              <input value={confirm} onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({...p, confirm:""})); }} type="password" placeholder="••••••••" className={`w-full bg-zinc-800/80 border rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none transition-colors ${errors.confirm ? "border-red-500/60" : "border-zinc-700/80 focus:border-indigo-500/80"}`} />
              {errors.confirm && <p className="text-xs text-red-400 mt-1">{errors.confirm}</p>}
            </div>
            <Button type="submit" loading={loading} className="w-full justify-center py-2.5">Create Account</Button>
          </form>
          <p className="text-center text-xs text-zinc-500 mt-4">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}