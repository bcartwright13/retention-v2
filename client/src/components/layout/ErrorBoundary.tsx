import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '../ui/Button';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Route-level error boundary. Catches render-time exceptions in the app shell
 * subtree and renders a recoverable UI with a Reload action. Defense-in-depth
 * against accidental crashes that could otherwise reveal a blank screen or
 * leak React internals via the browser console.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(_error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // Intentionally minimal — never echo error.message or stack to the UI to
    // avoid leaking internal paths or sensitive runtime state.
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught:', error, info);
    }
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-dvh flex items-center justify-center bg-paper text-ink px-6">
        <div className="max-w-md text-center space-y-6">
          <h1 className="font-display text-5xl leading-tight">
            Something went wrong<span className="text-ochre">.</span>
          </h1>
          <p className="font-serif-body italic text-ink-soft leading-relaxed">
            An unexpected error interrupted this page. Reload to try again — your
            cards are safely stored on the server.
          </p>
          <div className="h-px w-16 bg-ochre mx-auto" aria-hidden="true" />
          <Button variant="primary" size="md" onClick={this.handleReload}>
            <span>reload</span>
          </Button>
        </div>
      </div>
    );
  }
}
