import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/api';
import { storage } from '@/utils/storage';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => {
        storage.setToken(token);
        storage.setUser(user);
        set({ token, user, isAuthenticated: true });
      },
      setUser: (user) => {
        storage.setUser(user);
        set({ user });
      },
      logout: () => {
        storage.clearAuth();
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'questparty-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) storage.setToken(state.token);
        if (state?.user) storage.setUser(state.user);
      },
    },
  ),
);

export const useIsAdmin = () => useAuthStore((s) => s.user?.role === 'ADMIN');
