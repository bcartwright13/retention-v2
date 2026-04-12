import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/cn';

/**
 * Editorial bottom bar (mobile). Text-first small-caps links on paper,
 * with a hairline top rule. No icons — just language.
 */
function BottomNav() {
  const location = useLocation();

  const tabs = [
    { to: '/', label: 'Library' },
    { to: '/study', label: 'Study' },
    { to: '/cards/new', label: 'New' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-rule bg-paper/95 backdrop-blur md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch justify-between px-2 h-16">
        {tabs.map((tab) => {
          const active = location.pathname === tab.to;
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                'relative flex-1 flex items-center justify-center min-h-[44px] transition-colors duration-300',
                active ? 'text-ink' : 'text-ink-muted',
              )}
            >
              <span className="small-caps">{tab.label}</span>
              <span
                aria-hidden="true"
                className={cn(
                  'absolute top-0 left-1/2 h-0.5 w-6 -translate-x-1/2 transition-transform duration-500 [transition-timing-function:var(--ease-editorial)] origin-center',
                  active ? 'bg-ochre scale-x-100' : 'bg-ochre scale-x-0',
                )}
              />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export { BottomNav };
