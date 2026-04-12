import { useThemeStore } from '../../stores/themeStore';

/**
 * A quiet typographic toggle — renders sun/moon glyphs set in the display
 * serif so it feels like part of the running head, not an app chrome button.
 */
export function ThemeToggle() {
  const resolved = useThemeStore((s) => s.resolved);
  const setTheme = useThemeStore((s) => s.setTheme);

  const isDark = resolved === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="
        inline-flex h-10 w-10 items-center justify-center
        font-serif text-xl leading-none
        text-ink-muted transition-colors duration-300
        hover:text-ochre
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ochre focus-visible:ring-offset-2 focus-visible:ring-offset-paper
      "
    >
      <span aria-hidden="true">{isDark ? '☀' : '☾'}</span>
    </button>
  );
}
