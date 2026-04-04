import { cn } from '../../lib/cn';
import { type ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {icon && <div className="mb-4 text-text-muted">{icon}</div>}
      <h3 className="text-lg font-semibold text-text mb-1">{title}</h3>
      {description && <p className="text-sm text-text-muted mb-6 max-w-sm">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

export { EmptyState, type EmptyStateProps };
