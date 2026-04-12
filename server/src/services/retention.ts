import { ReviewPerformance } from '../types';

const LEVEL_INTERVALS = [1, 3, 7, 14, 21, 30];

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function computeReview(
  currentLevel: number,
  performance: ReviewPerformance
): { newLevel: number; nextReview: Date } {
  const now = new Date();

  switch (performance) {
    case 'forgot':
      return { newLevel: 0, nextReview: addDays(now, 1) };

    case 'struggled':
      return { newLevel: currentLevel, nextReview: addDays(now, 3) };

    case 'gotit': {
      const newLevel = Math.min(currentLevel + 1, 5);
      return { newLevel, nextReview: addDays(now, LEVEL_INTERVALS[newLevel]) };
    }

    case 'mastered': {
      const newLevel = Math.min(currentLevel + 2, 5);
      return { newLevel, nextReview: addDays(now, 30) };
    }
  }
}
