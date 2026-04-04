import { create } from 'zustand';
import type { User } from '../types/user';
import { mockApi } from '../lib/mocks';

const SESSION_KEY = 'recall_authenticated';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  login: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  checkAuth: async () => {
    // In mock mode, only authenticate if the user has previously logged in this session
    const hasSession = sessionStorage.getItem(SESSION_KEY);
    if (!hasSession) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    try {
      // TODO: Replace with real API call: api.get<User>('/api/auth/me')
      const user = await mockApi.getUser();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async () => {
    const user = await mockApi.getUser();
    sessionStorage.setItem(SESSION_KEY, 'true');
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    // TODO: Replace with real API call: api.post('/api/auth/logout', {})
    sessionStorage.removeItem(SESSION_KEY);
    set({ user: null, isAuthenticated: false });
  },
}));
