import { create } from "zustand";

import type { SessionUser, UserRole } from "@/lib/types";

interface AuthState {
  email: string;
  role: UserRole;
  isAuthenticated: boolean;
  hydrated: boolean;
  setAuth: (user: SessionUser) => void;
  resetAuth: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  email: "",
  role: "user",
  isAuthenticated: false,
  hydrated: false,
  setAuth: (user) =>
    set({
      email: user.email,
      role: user.role,
      isAuthenticated: true,
      hydrated: true
    }),
  resetAuth: () =>
    set({
      email: "",
      role: "user",
      isAuthenticated: false,
      hydrated: true
    }),
  setHydrated: (value) => set({ hydrated: value })
}));
