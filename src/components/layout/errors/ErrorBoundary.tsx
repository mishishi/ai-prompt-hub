import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-[70vh] page-enter">
          <div className="text-center px-6">
            <div className="w-20 h-20 rounded-2xl border border-[var(--color-bench-error)]/20 bg-[var(--color-bench-error)]/5 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-[var(--color-bench-error)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-bench-text)] font-[var(--font-display)] tracking-tight mb-3">Something went wrong</h1>
            <p className="text-sm text-[var(--color-bench-muted)] mb-2 max-w-md mx-auto">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button onClick={this.handleReset} className="btn-glow inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium mt-4">
              <RefreshCw size={14} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
