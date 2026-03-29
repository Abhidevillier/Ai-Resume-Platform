import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { User } from "@/types";

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;  // true once localStorage has been read
  isLoading: boolean;   // true only during an API call (login/signup)

  // Actions
  setAuth: (user: User, accessToken: string) => void;
  updateUser: (updates: Partial<User>) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isHydrated: false,  // becomes true via onRehydrateStorage
      isLoading: false,   // only true while an API call is running

      setAuth: (user, accessToken) => {
        Cookies.set("accessToken", accessToken, { expires: 1 / 96 }); // 15 min
        set({ user, accessToken, isAuthenticated: true, isLoading: false });
      },

      updateUser: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      clearAuth: () => {
        Cookies.remove("accessToken");
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Called after localStorage is read — signals the app is ready
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);
