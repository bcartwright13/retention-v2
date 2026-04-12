import { cn } from '../../lib/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'text-sm gap-[3px]',
  md: 'text-base gap-1',
  lg: 'text-xl gap-1.5',
};

/**
 * Editorial spinner — three serif periods, not a circular spinner. Each
 * dot pulses in sequence: "… thinking".
 */
function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-flex items-end font-serif leading-none text-ink-muted',
        sizeStyles[size],
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="motion-safe:animate-[editorial-ellipsis_1400ms_ease-in-out_infinite]"
        style={{ animationDelay: '0ms' }}
      >
        •
      </span>
      <span
        aria-hidden="true"
        className="motion-safe:animate-[editorial-ellipsis_1400ms_ease-in-out_infinite]"
        style={{ animationDelay: '200ms' }}
      >
        •
      </span>
      <span
        aria-hidden="true"
        className="motion-safe:animate-[editorial-ellipsis_1400ms_ease-in-out_infinite]"
        style={{ animationDelay: '400ms' }}
      >
        •
      </span>
    </span>
  );
}

export { Spinner, type SpinnerProps };
