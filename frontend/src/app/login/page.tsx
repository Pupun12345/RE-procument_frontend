// src/app/login/page.tsx
"use client";

import Image from "next/image";
import { Mail, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { sendOtp, verifyOtp } from "@/lib/auth";
import { useAuthStore } from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [phase, setPhase] = useState<"input" | "otp">("input");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sessionInfo, setSessionInfo] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------------
  // 🔥 AUTO-DETECT OTP (from lib/auth.ts)
  // ---------------------------------------------------
  useEffect(() => {
    function handleOtpEvent(e: any) {
      const autoOtp = e.detail;
      console.log("🔥 Auto-Detected OTP:", autoOtp);
      setOtp(autoOtp);
      setPhase("otp");
    }

    window.addEventListener("demo-otp", handleOtpEvent);
    return () => window.removeEventListener("demo-otp", handleOtpEvent);
  }, []);
  // ---------------------------------------------------

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (!phone.startsWith("+") || phone.replace(/\D/g, "").length < 10) {
      setErr("Enter valid phone number e.g. +91XXXXXXXXXX");
      return;
    }

    setLoading(true);
    try {
      const session = await sendOtp(phone);
      setSessionInfo(session);

      console.warn("⚠️ DEMO MODE — OTP printed in console (auto-detected)");
      setPhase("otp");
    } catch (error: any) {
      setErr(error?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (otp.trim().length !== 6) {
      setErr("Enter 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const data = await verifyOtp(sessionInfo, otp.trim());

      if (data.idToken) {
        login();
        router.push("/dashboard");
      } else {
        setErr("Invalid OTP");
      }
    } catch (error: any) {
      setErr(error?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-slate-100 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-sm text-slate-500">Sign in to continue</p>
        </div>

        {err && <div className="mb-4 text-red-600 text-sm text-center">{err}</div>}

        {/* PHONE INPUT */}
        {phase === "input" && (
          <form onSubmit={handleSendOtp} className="space-y-5">
            <div className="text-sm font-semibold text-slate-700">Phone Number</div>

            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
              <input
                className="w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="+91XXXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
            >
              {loading ? "Sending OTP..." : "Send OTP"}
            </button>

            <div className="text-center text-xs text-slate-400">Or continue with</div>

            <button
              type="button"
              onClick={() => alert("Google login not wired in demo mode")}
              className="w-full flex items-center justify-center border gap-3 rounded-lg py-2 text-sm border-slate-200 hover:bg-slate-50"
            >
              <Image src="/google.png" width={18} height={18} alt="Google" />
              Continue with Google
            </button>
          </form>
        )}

        {/* OTP INPUT */}
        {phase === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div className="text-sm font-semibold text-slate-700">
              Enter OTP sent to {phone}
            </div>

            <input
              className="w-full border rounded-lg pl-4 pr-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none tracking-widest text-center text-lg"
              placeholder="123456"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhase("input");
                  setOtp("");
                }}
                className="px-4 py-3 border rounded-lg bg-slate-50"
              >
                <ArrowLeft size={18} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
