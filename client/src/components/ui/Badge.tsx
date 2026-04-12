import { cn } from '../../lib/cn';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

/**
 * Editorial "badge" — really just a small-caps label. No pill, no fill.
 * Category metadata, kept quiet. The variant prop is preserved for
 * backwards compatibility but only tints the text color.
 */
const variantStyles: Record<BadgeVariant, string> = {
  default: 'text-ink-muted',
  primary: 'text-ochre',
  success: 'text-gotit',
  warning: 'text-struggled',
};

function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'small-caps inline-flex items-center',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export { Badge, type BadgeProps, type BadgeVariant };
