import { useRef, useEffect, type ReactNode } from 'react';
import { cn } from '../../lib/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * Editorial modal — a framed paper card on an ink scrim. Title set in
 * Fraunces small display, body in serif body type.
 */
function Modal({ open, onClose, title, children, className }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) dialog.showModal();
    else dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        'border border-rule-strong bg-paper text-ink p-8 rounded-sm',
        'backdrop:bg-ink/70',
        'max-w-md w-[calc(100%-2rem)]',
        'shadow-lg',
        className,
      )}
    >
      <h2 className="font-display-sm text-2xl text-ink mb-1">{title}</h2>
      <div className="h-px w-12 bg-ochre mb-5" aria-hidden="true" />
      {children}
    </dialog>
  );
}

export { Modal, type ModalProps };
