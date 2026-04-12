import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface CardSurfaceProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  /**
   * Visual style.
   * - `ruled` (default): top + bottom hairline rules, no box. Editorial.
   * - `framed`: thin full border, used for modals/dialogs only.
   */
  frame?: 'ruled' | 'framed';
}

/**
 * Editorial card surface. No rounded box, no shadow — just horizontal rules
 * above and below with generous padding. Each card reads as a passage in a
 * running text.
 */
const CardSurface = forwardRef<HTMLDivElement, CardSurfaceProps>(
  ({ className, hoverable = false, frame = 'ruled', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          frame === 'ruled'
            ? 'border-y border-rule bg-paper'
            : 'border border-rule-strong bg-paper rounded-sm',
          hoverable &&
            'transition-colors duration-300 [transition-timing-function:var(--ease-editorial)] hover:bg-paper-alt cursor-pointer',
          className,
        )}
        {...props}
      />
    );
  },
);

CardSurface.displayName = 'CardSurface';
export { CardSurface, type CardSurfaceProps };
