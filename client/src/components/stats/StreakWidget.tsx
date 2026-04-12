import { useEffect } from 'react';
import { useStreakStore } from '../../stores/streakStore';
import { cn } from '../../lib/cn';

interface StreakWidgetProps {
  className?: string;
}

/**
 * Compact streak + today's-reviews widget. Reads from the local streak
 * store (persisted to localStorage). Renders inline with the library
 * running head like a colophon.
 */
export function StreakWidget({ className }: StreakWidgetProps) {
  const { current, reviewsToday, init } = useStreakStore();

  useEffect(() => {
    init();
  }, [init]);

  if (current === 0 && reviewsToday === 0) return null;

  return (
    <div className={cn('flex items-center gap-4 md:gap-6', className)}>
      {current > 0 && (
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-xl tabular text-ochre leading-none">{current}</span>
          <span className="small-caps-sm text-ink-muted">
            day{current !== 1 ? 's' : ''}
          </span>
        </div>
      )}
      {reviewsToday > 0 && (
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-xl tabular text-ink leading-none">
            {reviewsToday}
          </span>
          <span className="small-caps-sm text-ink-muted">today</span>
        </div>
      )}
    </div>
  );
}
