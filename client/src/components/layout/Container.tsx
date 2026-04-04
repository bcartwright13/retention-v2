import { cn } from '../../lib/cn';
import { type HTMLAttributes } from 'react';

type ContainerProps = HTMLAttributes<HTMLDivElement>;

function Container({ className, ...props }: ContainerProps) {
  return <div className={cn('mx-auto max-w-2xl px-4', className)} {...props} />;
}

export { Container };
