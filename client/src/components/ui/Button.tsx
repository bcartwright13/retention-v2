import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

/**
 * Editorial button. Small-caps Inter Tight labels, sharp geometry, ink-on-paper
 * by default. `primary` is a filled ink block; `secondary` is ruled outline;
 * `ghost` is a small-caps text link; `danger` is a filled terracotta block.
 */
const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-ink text-paper border border-ink hover:bg-ink-soft hover:border-ink-soft',
  secondary:
    'bg-transparent text-ink border border-rule-strong hover:border-ink hover:bg-paper-alt',
  ghost:
    'bg-transparent text-ink-muted border border-transparent hover:text-ink',
  danger:
    'bg-forgot text-paper border border-forgot hover:opacity-90',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-[0.625rem]',
  md: 'h-11 px-6 text-[0.6875rem]',
  lg: 'h-12 px-8 text-[0.75rem]',
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'font-sans uppercase font-medium tracking-[0.14em] leading-none',
          'rounded-sm transition-colors duration-300 [transition-timing-function:var(--ease-editorial)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre focus-visible:ring-offset-2 focus-visible:ring-offset-paper',
          'disabled:opacity-40 disabled:pointer-events-none',
          'min-h-[44px]',
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        disabled={disabled}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
export { Button, type ButtonProps, type ButtonVariant, type ButtonSize };
