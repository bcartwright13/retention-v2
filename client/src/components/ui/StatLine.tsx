import { cn } from '../../lib/cn';

interface Stat {
  label: string;
  value: string | number;
  tone?: 'default' | 'ochre' | 'forgot' | 'struggled' | 'gotit' | 'mastered';
}

interface StatLineProps {
  stats: Stat[];
  className?: string;
}

const toneStyles: Record<NonNullable<Stat['tone']>, string> = {
  default: 'text-ink',
  ochre: 'text-ochre',
  forgot: 'text-forgot',
  struggled: 'text-struggled',
  gotit: 'text-gotit',
  mastered: 'text-mastered',
};

/**
 * Editorial metadata row. Each stat is a small-caps label above a
 * tabular-lined numeral, separated from neighbors by a middot.
 *
 *    SEEN   FORGOT   STRUGGLED   MASTERED
 *      12      1         2           3
 */
export function StatLine({ stats, className }: StatLineProps) {
  return (
    <dl className={cn('flex items-end justify-center gap-6 md:gap-10', className)}>
      {stats.map((stat, idx) => (
        <div key={idx} className="flex flex-col items-center gap-2">
          <dt className="small-caps-sm text-ink-muted">{stat.label}</dt>
          <dd
            className={cn(
              'font-display text-3xl md:text-4xl tabular leading-none',
              toneStyles[stat.tone ?? 'default'],
            )}
          >
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
