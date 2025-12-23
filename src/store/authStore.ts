import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  role: string | null;
  username: string | null;
  token: string | null;
  setAuth: (role: string, username: string, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      username: null,
      token: null,

      setAuth: (role, username, token) =>
        set({
          role,
          username,
          token,
        }),

      logout: () =>
        set({
          role: null,
          username: null,
          token: null,
        }),
    }),
    {
      name: "auth-storage", // ✅ single source of truth
    }
  )
);
