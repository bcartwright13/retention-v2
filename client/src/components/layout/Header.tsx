import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/cn';
import { ThemeToggle } from './ThemeToggle';
import { useAuthStore } from '../../stores/authStore';

/**
 * Editorial running head. Brand set in Fraunces ("recall." with an ochre
 * terminal period), section nav as small-caps text links, theme toggle
 * and log-out as typographic glyphs on the right.
 */
function Header() {
  const location = useLocation();
  const logout = useAuthStore((s) => s.logout);

  const navLinks = [
    { to: '/', label: 'Library' },
    { to: '/study', label: 'Study' },
  ];

  return (
    <header className="sticky top-0 z-20 bg-paper/90 backdrop-blur supports-[backdrop-filter]:bg-paper/75">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Brand */}
          <Link
            to="/"
            aria-label="Recall — home"
            className="group inline-flex items-baseline font-display text-2xl md:text-[1.75rem] leading-none text-ink focus-visible:outline-none"
          >
            <span className="tracking-tight">recall</span>
            <span
              aria-hidden="true"
              className="ml-[1px] text-ochre transition-transform duration-500 [transition-timing-function:var(--ease-editorial)] group-hover:translate-y-[-1px]"
            >
              .
            </span>
          </Link>

          {/* Section nav (desktop) */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main navigation">
            {navLinks.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'small-caps relative py-2 transition-colors duration-300',
                    active ? 'text-ink' : 'text-ink-muted hover:text-ink',
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute left-0 right-0 -bottom-px h-px transition-all duration-500 [transition-timing-function:var(--ease-editorial)] origin-left',
                      active ? 'bg-ochre scale-x-100' : 'bg-ochre scale-x-0',
                    )}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right: theme + logout */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => logout()}
              className="small-caps hidden md:inline-flex h-10 items-center px-3 text-ink-muted hover:text-ink transition-colors"
              aria-label="Log out"
            >
              leave
            </button>
          </div>
        </div>

        {/* Hairline rule beneath the running head */}
        <div className="h-px bg-rule" aria-hidden="true" />
      </div>
    </header>
  );
}

export { Header };
