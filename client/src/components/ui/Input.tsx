import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

/**
 * Editorial input — no box, only a baseline rule. Label floats above in
 * small caps; focus thickens the rule to 2px ochre.
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="small-caps block text-ink-muted">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'block w-full bg-transparent px-0 py-2.5 text-base font-serif-body text-ink placeholder:text-ink-muted/60',
            'border-0 border-b transition-colors duration-300 [transition-timing-function:var(--ease-editorial)]',
            'focus:outline-none focus:ring-0',
            error
              ? 'border-b-forgot focus:border-b-forgot'
              : 'border-b-rule focus:border-b-ochre focus:[border-bottom-width:2px]',
            'min-h-[44px]',
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
          }
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} className="small-caps text-forgot" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className="small-caps text-ink-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
export { Input, type InputProps };
