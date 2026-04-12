import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

/**
 * Editorial textarea — baseline rule, serif body type, generous leading.
 * Feels like writing into a notebook rather than filling a field.
 */
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={textareaId} className="small-caps block text-ink-muted">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'block w-full bg-transparent px-0 py-3 font-serif-body text-base text-ink placeholder:text-ink-muted/60',
            'border-0 border-b transition-colors duration-300 [transition-timing-function:var(--ease-editorial)]',
            'focus:outline-none focus:ring-0 resize-y',
            error
              ? 'border-b-forgot focus:border-b-forgot'
              : 'border-b-rule focus:border-b-ochre focus:[border-bottom-width:2px]',
            'min-h-[160px]',
            className,
          )}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          {...props}
        />
        {error && (
          <p id={`${textareaId}-error`} className="small-caps text-forgot" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
export { Textarea, type TextareaProps };
