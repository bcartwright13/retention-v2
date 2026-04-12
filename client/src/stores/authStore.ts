import { create } from 'zustand';
import type { User } from '../types/user';
import { api } from '../lib/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  login: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  checkAuth: async () => {
    try {
      const user = await api.get<User>('/api/auth/me');
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: () => {
    window.location.href = '/api/auth/google';
  },

  logout: async () => {
    try {
      await api.post('/api/auth/logout', {});
    } catch {
      // ignore errors
    }
    set({ user: null, isAuthenticated: false });
  },
}));
