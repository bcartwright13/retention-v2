import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-paper">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="relative min-h-dvh flex flex-col bg-paper text-ink overflow-hidden">
      {/* Decorative folio marks in the margin — editorial touch */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-16 flex items-center justify-between px-6 md:px-12"
      >
        <span className="small-caps-sm text-ink-muted">MMXXVI</span>
        <span className="small-caps-sm text-ink-muted">vol. I &middot; no. 1</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="w-full max-w-md">
          {/* Brand lockup */}
          <div
            className="mb-2 motion-safe:animate-[editorial-fade-up_600ms_var(--ease-editorial)_both]"
            style={{ animationDelay: '0ms' }}
          >
            <h1 className="font-display text-[6rem] md:text-[8rem] text-ink leading-[0.85] flex items-baseline">
              <span>recall</span>
              <span className="text-ochre">.</span>
            </h1>
          </div>

          {/* Tagline */}
          <div
            className="mb-10 motion-safe:animate-[editorial-fade-up_600ms_var(--ease-editorial)_both]"
            style={{ animationDelay: '120ms' }}
          >
            <p className="font-serif-body italic text-lg text-ink-soft max-w-md leading-relaxed">
              a commonplace book for ideas worth remembering —
              <br />
              set in paper and ink, studied at your own pace.
            </p>
          </div>

          {/* Hairline rule */}
          <div
            className="h-px w-24 bg-ochre mb-10 origin-left motion-safe:animate-[editorial-draw-rule_700ms_var(--ease-editorial)_both]"
            style={{ animationDelay: '280ms' }}
            aria-hidden="true"
          />

          {/* Sign-in */}
          <div
            className="flex flex-col gap-3 motion-safe:animate-[editorial-fade-up_600ms_var(--ease-editorial)_both]"
            style={{ animationDelay: '380ms' }}
          >
            <Button
              variant="primary"
              size="lg"
              className="w-full justify-center"
              onClick={() => {
                window.location.href = '/api/auth/google';
              }}
            >
              <span>enter with google</span>
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="w-full justify-center"
              onClick={async () => {
                await useAuthStore.getState().login();
                navigate('/');
              }}
            >
              continue as a guest
            </Button>
          </div>
        </div>
      </div>

      {/* Colophon footer */}
      <footer
        aria-hidden="true"
        className="pointer-events-none px-6 md:px-12 pb-6 flex items-end justify-between"
      >
        <span className="small-caps-sm text-ink-muted">spaced repetition &middot; lifestyle learning</span>
        <span className="font-serif italic text-sm text-ink-muted">— B.C.</span>
      </footer>
    </div>
  );
}
