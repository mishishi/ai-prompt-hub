import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props { children: ReactNode; }

function isZh(): boolean {
  return typeof document !== 'undefined' && document.documentElement.lang === 'zh-CN';
}

export class ErrorBoundary extends Component<Props, { hasError: boolean; error: Error | null }> {
  state = { hasError: false, error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const zh = isZh();
      return (
        <div className="flex items-center justify-center min-h-[70vh] page-enter">
          <div className="text-center px-6">
            <div className="w-20 h-20 rounded-2xl border border-[var(--color-bench-error)]/20 bg-[var(--color-bench-error)]/5 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle size={32} className="text-[var(--color-bench-error)]" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--color-bench-text)] font-[var(--font-display)] tracking-tight mb-3">
              {zh ? '出错了' : 'Something went wrong'}
            </h1>
            <p className="text-base text-[var(--color-bench-muted)] mb-2 max-w-md mx-auto">
              {this.state.error?.message || (zh ? '发生了未知错误。' : 'An unexpected error occurred.')}
            </p>
            <button onClick={this.handleReset} className="btn-glow inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-base font-medium mt-4">
              <RefreshCw size={14} />
              {zh ? '重新加载' : 'Reload Page'}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
