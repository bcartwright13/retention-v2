import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface CardSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

const CardSurface = forwardRef<HTMLDivElement, CardSurfaceProps>(
  ({ className, hoverable = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border border-border bg-surface shadow-card',
          hoverable && 'transition-shadow hover:shadow-card-hover',
          className,
        )}
        {...props}
      />
    );
  }
);

CardSurface.displayName = 'CardSurface';
export { CardSurface, type CardSurfaceProps };
