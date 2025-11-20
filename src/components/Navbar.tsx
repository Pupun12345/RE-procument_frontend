// src/components/Navbar.tsx
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function Navbar() {
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  return (
    <header className="w-full bg-white border-b p-4 flex items-center justify-between">
      <div className="font-semibold">My App</div>

      <div>
        {isLoggedIn ? (
          <>
            <button
              onClick={() => {
                logout();
                router.push("/login");
              }}
              className="text-sm text-red-600 hover:underline"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="text-sm text-slate-700 hover:underline"
          >
            Login
          </button>
        )}
      </div>
    </header>
  );
}
