"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    // Clear auth state properly
    logout();

    // Navigate once with replace (prevents back button returning)
    router.replace("/login");
  };

  return (
    <header className="w-full bg-white border-b p-4 flex items-center justify-between">
      <div className="font-semibold text-lg">HRMS</div>

      <button
        onClick={handleLogout}
        className="text-sm text-red-600 hover:underline"
      >
        Logout
      </button>
    </header>
  );
}
