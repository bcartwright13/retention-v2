import { create } from 'zustand';

type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'recall-theme';

interface ThemeState {
  /** User's stored preference */
  preference: ThemePreference;
  /** The actually-applied theme (after resolving 'system') */
  resolved: ResolvedTheme;
  setTheme: (preference: ThemePreference) => void;
  /** Call once at app startup to hydrate from localStorage + subscribe to OS changes */
  init: () => void;
}

function resolvePreference(pref: ThemePreference): ResolvedTheme {
  if (pref === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return pref;
}

function applyToDocument(resolved: ResolvedTheme) {
  document.documentElement.setAttribute('data-theme', resolved);
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  preference: 'system',
  resolved: 'light',

  setTheme: (preference) => {
    localStorage.setItem(STORAGE_KEY, preference);
    const resolved = resolvePreference(preference);
    applyToDocument(resolved);
    set({ preference, resolved });
  },

  init: () => {
    const stored = (localStorage.getItem(STORAGE_KEY) as ThemePreference | null) ?? 'system';
    const resolved = resolvePreference(stored);
    applyToDocument(resolved);
    set({ preference: stored, resolved });

    // Keep in sync with OS changes when preference is 'system'
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (get().preference === 'system') {
        const next = resolvePreference('system');
        applyToDocument(next);
        set({ resolved: next });
      }
    };
    media.addEventListener('change', handler);
  },
}));
