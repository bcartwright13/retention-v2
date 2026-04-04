import type { ReviewPerformance } from '../types/card';

const LEVEL_INTERVALS = [1, 3, 7, 14, 21, 30];

export function getIntervalHint(performance: ReviewPerformance, currentLevel: number): string {
  switch (performance) {
    case 'forgot':
      return '1d';
    case 'struggled':
      return '3d';
    case 'gotit': {
      const newLevel = Math.min(currentLevel + 1, 5);
      const days = LEVEL_INTERVALS[newLevel];
      return days >= 7 ? `${days / 7}w` : `${days}d`;
    }
    case 'mastered':
      return '30d';
  }
}

export function formatRelativeDate(isoString: string): string {
  const target = new Date(isoString);
  const now = new Date();
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
  return `In ${Math.ceil(diffDays / 30)} months`;
}
