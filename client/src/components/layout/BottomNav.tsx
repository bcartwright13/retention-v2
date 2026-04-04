import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/cn';

function BottomNav() {
  const location = useLocation();

  const tabs = [
    {
      to: '/',
      label: 'Library',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5a1 1 0 0 1 0-5H20" />
        </svg>
      ),
    },
    {
      to: '/study',
      label: 'Study',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
          <path d="M9 21h6" />
          <path d="M10 21v1a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-1" />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-10 border-t border-border bg-surface md:hidden"
      aria-label="Mobile navigation"
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            className={cn(
              'flex flex-col items-center justify-center gap-0.5 min-w-[64px] min-h-[44px] px-3 py-1 rounded-md transition-colors',
              location.pathname === tab.to
                ? 'text-primary-600'
                : 'text-text-muted hover:text-text',
            )}
          >
            {tab.icon}
            <span className="text-xs font-medium">{tab.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export { BottomNav };
