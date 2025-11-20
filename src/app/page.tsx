"use client";

import Image from "next/image";
import {
  Calendar,
  ShieldCheck,
  Search,
  Settings
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f5f8ff]">

      {/* Top Navbar */}
      <header className="w-full py-6 px-8 flex justify-between items-center bg-white/70 backdrop-blur-xl shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">RE-HRMS</h1>

        <a
          href="/login"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Login
        </a>
      </header>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-linear-to-b from-[#e9f1ff] to-[#f9fbff] -z-20" />

      {/* Decorative Icons */}
      <div className="hidden md:block">
        <Calendar className="absolute top-56 right-128 w-12 h-12 text-blue-500/40" />
        <Settings className="absolute top-40 right-60 w-12 h-12 text-blue-500/40" />
        <ShieldCheck className="absolute top-80 right-48 w-12 h-12 text-blue-500/40" />
        <Search className="absolute top-88 right-144 w-12 h-12 text-blue-500/40" />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-8 py-20 items-center">

        {/* LEFT */}
        <section className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-slate-900">
            Modern HRMS for Smarter{" "}
            <span className="text-blue-600">Employee</span><br />
            Management
          </h1>

          <p className="text-lg text-slate-600 max-w-lg">
            A comprehensive platform to manage payroll, leave, attendance,
            onboarding, performance tracking — all from one intuitive dashboard.
          </p>

          <div className="flex gap-4 mt-6">
            <a
              href="/signup"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            >
              Get Started
            </a>

            <a
              href="#"
              className="px-8 py-3 bg-white border border-slate-300 rounded-lg shadow-sm hover:shadow-md transition"
            >
              Learn More
            </a>
          </div>
        </section>

        {/* RIGHT */}
        <section className="hidden md:flex justify-center">
          <div className="p-4 bg-white/70 rounded-2xl shadow-xl backdrop-blur-md border border-slate-100">
            <Image
              src="/hr.png"
              alt="HRMS Dashboard Preview"
              width={540}
              height={420}
              className="rounded-xl"
            />
          </div>
        </section>

      </main>
    </div>
  );
}
