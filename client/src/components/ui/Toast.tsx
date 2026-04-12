import { useEffect, useState } from 'react';
import { useToastStore } from '../../stores/toastStore';
import { cn } from '../../lib/cn';

interface ToastItemProps {
  id: string;
  message: string;
  type: 'success' | 'error';
}

/**
 * Editorial toast — a thin ink bar with a serif message, sliding in from
 * the top like a newspaper slug line. No icons, no fill colors except
 * for a single accent dot indicating success/error.
 */
function ToastItem({ id, message, type }: ToastItemProps) {
  const removeToast = useToastStore((s) => s.removeToast);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-3 border-y border-rule-strong bg-paper px-5 py-3',
        'shadow-lg min-w-[280px] max-w-md',
        'transition-all duration-[420ms] [transition-timing-function:var(--ease-editorial)]',
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'inline-block h-1.5 w-1.5 rounded-full shrink-0',
          type === 'success' ? 'bg-gotit' : 'bg-forgot',
        )}
      />
      <span className="flex-1 font-serif-body text-sm text-ink">{message}</span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => removeToast(id)}
        className="small-caps shrink-0 text-ink-muted hover:text-ink transition-colors"
      >
        close
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-0 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2 pt-4">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );
}
