"use client";
export const dynamic = "force-dynamic";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Icon, Button, showToast } from "@/components/ui";

export default function VerifyPage({searchParams}) {
  const router = useRouter();
 // const params = useSearchParams();
  const id = searchParams?.id;
  //const id = params.get("id");
  const [otp, setOtp] = useState(["","","","","",""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (i, v) => {
    if (!/^\d*$/.test(v)) return;
    const next = [...otp];
    next[i] = v.slice(-1);
    setOtp(next);
    if (v && i < 5) document.getElementById(`otp-${i+1}`)?.focus();
    if (!v && i > 0) document.getElementById(`otp-${i-1}`)?.focus();
  };

  const submit = async () => {
    const code = otp.join("");
    if (code.length !== 6) { setError("Enter all 6 digits"); return; }
    setLoading(true);
    try {
      await api.auth.verifyEmail(id, parseInt(code));
      router.push(`/auth/setup?id=${id}`);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  const resend = async () => {
    setResending(true);
    try { await api.auth.resendOtp(id); showToast("OTP sent!"); }
    catch (e) { showToast(e.message, "error"); }
    finally { setResending(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');`}</style>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-indigo-600/8 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm text-center">
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center mb-3">
            <Icon name="zap" size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Check your email</h1>
          <p className="text-sm text-zinc-500 mt-1.5 max-w-xs">We sent a 6-digit code. Enter it below to verify your account.</p>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          <div className="flex justify-center gap-2 mb-5">
            {otp.map((v, i) => (
              <input key={i} id={`otp-${i}`} value={v} maxLength={1} onChange={(e) => handleChange(i, e.target.value)} onKeyDown={(e) => e.key === "Backspace" && !v && i > 0 && document.getElementById(`otp-${i-1}`)?.focus()} className="w-10 h-12 text-center text-lg font-bold bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors" />
            ))}
          </div>
          {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
          <Button loading={loading} onClick={submit} className="w-full justify-center">Verify Email</Button>
          <button onClick={resend} disabled={resending} className="mt-3 text-xs text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-50">
            {resending ? "Sending..." : "Resend code"}
          </button>
        </div>
      </div>
    </div>
  );
}