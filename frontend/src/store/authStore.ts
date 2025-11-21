"use client";

import { create } from "zustand";

// ---- Helpers MUST be declared BEFORE Zustand uses them ----
function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
}

// ---- Types ----
type Role = "admin" | "user" | null;

interface AuthState {
  isLoggedIn: boolean;
  role: Role;
  hydrated: boolean;

  setAuth: (role: Role) => void;
  clearAuth: () => void;
  hydrate: () => void;
  logout: () => void;
}

// ---- Zustand Store ----
export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  role: null,
  hydrated: false,

  hydrate: () => {
    const token = getCookie("token");
    const role = getCookie("role") as Role;

    set({
      hydrated: true,
      isLoggedIn: !!token,
      role: role ?? null,
    });
  },

  setAuth: (role) => {
    set({ isLoggedIn: true, role });
  },

  clearAuth: () => {
    set({ isLoggedIn: false, role: null });
  },

  logout: () => {
    deleteCookie("token");
    deleteCookie("role");

    set({ isLoggedIn: false, role: null });
  },
}));
