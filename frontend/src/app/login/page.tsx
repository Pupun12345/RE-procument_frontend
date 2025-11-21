"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { FaUser, FaLock, FaSyncAlt, FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuthStore } from "@/store/authStore";

interface LoginResponse {
  success?: boolean;
  token?: string;
  role?: string;
  username?: string;
  message?: string;
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [captcha, setCaptcha] = useState("");
  const [generatedCaptcha, setGeneratedCaptcha] = useState("9K7RFP");

  const [loading, setLoading] = useState(false);

  const url = process.env.NEXT_PUBLIC_API_URL;

  // Refresh Captcha
  const refreshCaptcha = () => {
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    setGeneratedCaptcha(random);
    setCaptcha("");
    toast.success("Captcha refreshed");
  };

  // Handle Login
  const handleLogin = async (e: any) => {
    e.preventDefault();

    if (captcha.trim() !== generatedCaptcha) {
      toast.error("Invalid captcha");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`${url}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data: LoginResponse = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid credentials");
      }

      // Save auth data
      document.cookie = `token=${data.token}; path=/`;
      document.cookie = `role=${data.role}; path=/`;

      useAuthStore.getState().setAuth(data.role as any);

      localStorage.setItem("username", data.username || email);

      // Zustand Update (IMPORTANT)
      useAuthStore.getState().setAuth(data.role as any);

      toast.success("Login successful!");

      // Redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-blue-100 p-6">
      <Toaster />

      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-10 border border-blue-200">
        <h2 className="text-4xl font-bold text-center text-blue-700 mb-2">
          HRMS
        </h2>
        <p className="text-center text-gray-500 mb-6">
          Welcome back! Please sign in
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email Input */}
          <label className="form-control w-full">
            <span className="label-text font-semibold text-gray-700">
              Email Address
            </span>
            <div className="relative mt-1">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                placeholder="you@example.com"
                className="input input-bordered border-blue-300 focus:border-blue-500 focus:ring-blue-300 w-full pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>

          {/* Password Input */}
          <label className="form-control w-full">
            <span className="label-text font-semibold text-gray-700">
              Password
            </span>
            <div className="relative mt-1">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="********"
                className="input input-bordered border-blue-300 focus:border-blue-500 focus:ring-blue-300 w-full pl-10 pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </label>

          {/* Captcha */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-700 border border-blue-300 font-bold text-lg rounded-lg w-28 text-center tracking-widest">
              {generatedCaptcha}
            </div>

            <button
              type="button"
              className="btn btn-outline btn-info btn-sm"
              onClick={refreshCaptcha}
            >
              <FaSyncAlt />
            </button>

            <input
              type="text"
              placeholder="Enter Captcha"
              className="input input-bordered border-blue-300 focus:border-blue-500 focus:ring-blue-300 w-full"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value)}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="btn btn-primary w-full bg-blue-600 hover:bg-blue-700 border-none text-white h-11 text-lg mt-1"
            disabled={loading}
          >
            {loading && (
              <span className="loading loading-spinner loading-sm mr-2"></span>
            )}
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 flex justify-between text-sm text-blue-600 font-medium">
          <a className="link link-hover">Forgot User ID?</a>
          <a className="link link-hover">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
}
//updated code