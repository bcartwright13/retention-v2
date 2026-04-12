import { cn } from '../../lib/cn';

interface RuleProps {
  /** Optional small-caps label centered on the rule, e.g. "answer" or "§" */
  label?: string;
  /** Thickness in px. Defaults to 1 (hairline). */
  weight?: 1 | 2;
  /** Set to true to animate a left-to-right draw on mount */
  animated?: boolean;
  className?: string;
}

/**
 * Hairline editorial divider. Optionally labeled (small caps, centered,
 * with rule segments on either side) or animated as a reveal gesture.
 */
export function Rule({ label, weight = 1, animated = false, className }: RuleProps) {
  if (label) {
    return (
      <div
        className={cn(
          'flex items-center gap-3 text-ink-muted select-none',
          className,
        )}
        role="separator"
        aria-label={label}
      >
        <span
          className={cn(
            'flex-1 bg-rule',
            weight === 1 ? 'h-px' : 'h-0.5',
            animated && 'origin-right motion-safe:animate-[editorial-draw-rule_420ms_var(--ease-editorial)_both]',
          )}
        />
        <span className="small-caps-sm whitespace-nowrap">{label}</span>
        <span
          className={cn(
            'flex-1 bg-rule',
            weight === 1 ? 'h-px' : 'h-0.5',
            animated && 'origin-left motion-safe:animate-[editorial-draw-rule_420ms_var(--ease-editorial)_both]',
          )}
        />
      </div>
    );
  }

  return (
    <div
      role="separator"
      className={cn(
        'bg-rule origin-left',
        weight === 1 ? 'h-px' : 'h-0.5',
        animated && 'motion-safe:animate-[editorial-draw-rule_420ms_var(--ease-editorial)_both]',
        className,
      )}
    />
  );
}
