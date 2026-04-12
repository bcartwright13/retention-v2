import { cn } from '../../lib/cn';
import { type HTMLAttributes } from 'react';

type ContainerProps = HTMLAttributes<HTMLDivElement>;

/**
 * Editorial container — wider than before (max-w-3xl) for a more
 * generous type measure. Pages can override width as needed.
 */
function Container({ className, ...props }: ContainerProps) {
  return <div className={cn('mx-auto max-w-3xl px-5 md:px-8', className)} {...props} />;
}

export { Container };
