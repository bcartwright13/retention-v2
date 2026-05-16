import { create } from 'zustand';
import type { User } from '../types/user';
import { api } from '../lib/api';
import { useCardStore } from './cardStore';
import { useToastStore } from './toastStore';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  login: (returnTo?: string) => void;
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

  login: (returnTo?: string) => {
    // Same-origin invariant: returnTo must start with '/' and not '//' (no protocol-relative URLs).
    const isSameOriginPath =
      typeof returnTo === 'string' &&
      returnTo.startsWith('/') &&
      !returnTo.startsWith('//');
    const url = isSameOriginPath
      ? `/api/auth/google?returnTo=${encodeURIComponent(returnTo as string)}`
      : '/api/auth/google';
    window.location.href = url;
  },

  logout: async () => {
    let serverLogoutFailed = false;
    try {
      await api.post('/api/auth/logout', {});
    } catch {
      serverLogoutFailed = true;
    }
    useCardStore.getState().reset();
    localStorage.removeItem('recall-streak');
    set({ user: null, isAuthenticated: false });
    if (serverLogoutFailed) {
      useToastStore
        .getState()
        .addToast(
          "Couldn't reach the server to sign out. Sign in again to fully sign out.",
          'error',
        );
    }
  },
}));
