import { create } from 'zustand';

const STORAGE_KEY = 'recall-streak';

interface StreakSnapshot {
  /** ISO date (YYYY-MM-DD) of the last day a review was recorded */
  lastDate: string | null;
  /** Current streak in days (consecutive days with at least one review) */
  current: number;
  /** Longest streak ever */
  longest: number;
  /** Number of reviews recorded today */
  reviewsToday: number;
}

interface StreakState extends StreakSnapshot {
  init: () => void;
  recordReview: () => void;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00');
  const db = new Date(b + 'T00:00:00');
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

function load(): StreakSnapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { lastDate: null, current: 0, longest: 0, reviewsToday: 0 };
    const parsed = JSON.parse(raw) as StreakSnapshot;
    // If the stored "today" count is from a previous day, reset it
    if (parsed.lastDate !== todayISO()) {
      return { ...parsed, reviewsToday: 0 };
    }
    return parsed;
  } catch {
    return { lastDate: null, current: 0, longest: 0, reviewsToday: 0 };
  }
}

function save(snap: StreakSnapshot) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snap));
  } catch {
    /* ignore quota errors */
  }
}

export const useStreakStore = create<StreakState>((set, get) => ({
  lastDate: null,
  current: 0,
  longest: 0,
  reviewsToday: 0,

  init: () => {
    const snap = load();
    // Decay: if the gap since lastDate is > 1 day, the streak is broken
    if (snap.lastDate) {
      const gap = daysBetween(snap.lastDate, todayISO());
      if (gap > 1) {
        set({ ...snap, current: 0 });
        return;
      }
    }
    set(snap);
  },

  recordReview: () => {
    const today = todayISO();
    const { lastDate, current, longest, reviewsToday } = get();

    let nextCurrent = current;
    if (lastDate !== today) {
      // First review of the day — advance or reset the streak
      const gap = lastDate ? daysBetween(lastDate, today) : Infinity;
      nextCurrent = gap === 1 ? current + 1 : 1;
    }

    const next: StreakSnapshot = {
      lastDate: today,
      current: nextCurrent,
      longest: Math.max(longest, nextCurrent),
      reviewsToday: lastDate === today ? reviewsToday + 1 : 1,
    };
    save(next);
    set(next);
  },
}));
