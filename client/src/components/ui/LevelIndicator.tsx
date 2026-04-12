import { cn } from '../../lib/cn';

interface LevelIndicatorProps {
  level: number;
  /** Total steps. Defaults to 5. */
  max?: number;
  className?: string;
}

/**
 * Editorial level indicator — small serif glyphs on a baseline rule.
 * Reads like a bibliographic notation: ●●●○○
 */
export function LevelIndicator({ level, max = 5, className }: LevelIndicatorProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 font-serif text-[0.6rem] leading-none text-ink-soft', className)}
      aria-label={`Level ${level} of ${max}`}
    >
      {Array.from({ length: max }, (_, i) => (
        <span key={i} aria-hidden="true" className={i < level ? 'text-ochre' : 'text-rule-strong'}>
          {i < level ? '●' : '○'}
        </span>
      ))}
    </span>
  );
}
