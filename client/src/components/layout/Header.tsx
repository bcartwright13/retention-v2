import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/cn';

interface HeaderProps {
  onLogout?: () => void;
}

function Header({ onLogout }: HeaderProps) {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Library' },
    { to: '/study', label: 'Study' },
  ];

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto max-w-2xl px-4 flex items-center justify-between h-14">
        <Link to="/" className="text-lg font-bold text-primary-600">
          Recall
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={cn(
                'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                location.pathname === link.to
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-text-muted hover:text-text hover:bg-surface-hover',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          onClick={onLogout}
          className="text-sm text-text-muted hover:text-text transition-colors min-h-[44px] px-2"
          aria-label="Log out"
        >
          Log out
        </button>
      </div>
    </header>
  );
}

export { Header };
