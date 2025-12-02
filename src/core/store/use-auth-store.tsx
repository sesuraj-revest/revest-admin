import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/core/lib/store";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  setCurrentOutlet: (outletId: string) => void;
  setUser: (user: User) => void;
  refetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,

      logout: () => {
        set({ user: null });
      },

      setCurrentOutlet: (outletId: string) => {
        set((state) => ({
          user: state.user
            ? { ...state.user, currentOutletId: outletId }
            : null,
        }));
      },

      setUser: (user: User) => {
        set({ user });
      },

      refetchUser: async () => {
        try {
          // We dynamically import to avoid potential circular dependencies during initialization
          const { default: authApi } = await import("@/core/service/auth/auth");
        } catch (error) {
          console.error("Failed to refetch user", error);
        }
      },
    }),
    {
      name: "auth-store",
    }
  )
);
