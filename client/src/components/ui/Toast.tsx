import { useEffect, useState } from 'react';
import { useToastStore } from '../../stores/toastStore';
import { cn } from '../../lib/cn';

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path
        fillRule="evenodd"
        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}

interface ToastItemProps {
  id: string;
  message: string;
  type: 'success' | 'error';
}

function ToastItem({ id, message, type }: ToastItemProps) {
  const removeToast = useToastStore((s) => s.removeToast);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger enter animation on next frame
    const raf = requestAnimationFrame(() => setIsVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg transition-all duration-300 ease-out',
        'min-w-[280px] max-w-sm',
        isVisible
          ? 'translate-y-0 opacity-100'
          : '-translate-y-2 opacity-0',
        type === 'success'
          ? 'bg-gotit text-white'
          : 'bg-forgot text-white',
      )}
    >
      {type === 'success' ? <CheckIcon /> : <ErrorIcon />}
      <span className="flex-1 text-sm font-medium">{message}</span>
      <button
        type="button"
        aria-label="Dismiss"
        onClick={() => removeToast(id)}
        className="shrink-0 rounded-md p-0.5 opacity-80 hover:opacity-100 transition-opacity"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} />
      ))}
    </div>
  );
}
