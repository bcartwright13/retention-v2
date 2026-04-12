import { cn } from '../../lib/cn';
import { type ReactNode } from 'react';

interface EmptyStateProps {
  /** Optional typographic glyph or small element. Defaults to an asterism. */
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Editorial empty state. Uses typographic flourishes (asterism ⁂,
 * section marks §) instead of SVG icons. Set in serif for a quiet,
 * bookish feel.
 */
function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-20 px-4 text-center',
        'motion-safe:animate-[editorial-fade-up_520ms_var(--ease-editorial)_both]',
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="font-serif text-3xl text-ochre mb-8 select-none leading-none"
      >
        {icon ?? '⁂'}
      </div>
      <h3 className="font-display-sm text-2xl text-ink mb-3">{title}</h3>
      {description && (
        <p className="font-serif-body text-base text-ink-soft max-w-sm mb-8">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export { EmptyState, type EmptyStateProps };
